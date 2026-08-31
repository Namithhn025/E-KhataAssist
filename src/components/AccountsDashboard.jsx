import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, LogOut, Upload, CheckCircle, X, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

const PAGE_SIZE = 10;

const AccountsDashboard = () => {
  const { logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [uploading, setUploading] = useState({});
  const [uploadError, setUploadError] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const fileInputRefs = useRef({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const accountsLeads = customers
    .filter(c => c.serviceStatus === 'Approved' && c.inAccounts === true && c.paymentStatus !== 'Done')
    .sort((a, b) => new Date(a.approvedDate || a.createdAt || 0) - new Date(b.approvedDate || b.createdAt || 0));

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? accountsLeads.filter(c =>
        (c.customerName || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.apartment || c.society || '').toLowerCase().includes(q) ||
        (c.serviceRequested || c.service || c.serviceType || '').toLowerCase().includes(q)
      )
    : accountsLeads;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUpdate = async (id, field, value) => {
    await updateDoc(doc(db, 'customers', id), { [field]: value, updatedAt: new Date().toISOString() });
  };

  const handleNotesBlur = (id) => {
    const val = notesMap[id];
    if (val !== undefined) handleUpdate(id, 'accountsNotes', val);
  };

  const handleFileUpload = async (id, files) => {
    if (!files || files.length === 0) return;
    setUploadError(e => ({ ...e, [id]: null }));
    setUploading(u => ({ ...u, [id]: true }));
    try {
      const customer = customers.find(c => c.id === id);
      const existingFiles = customer?.accountsFiles || [];
      const newFiles = [];
      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
          setUploadError(e => ({ ...e, [id]: 'Only JPEG/PNG files allowed.' }));
          continue;
        }
        if (file.size > 900 * 1024) {
          setUploadError(e => ({ ...e, [id]: `"${file.name}" exceeds 1MB limit.` }));
          continue;
        }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newFiles.push({ url: base64, name: file.name, uploadedAt: new Date().toISOString() });
      }
      if (newFiles.length > 0) {
        await updateDoc(doc(db, 'customers', id), {
          accountsFiles: [...existingFiles, ...newFiles],
          updatedAt: new Date().toISOString()
        });
      }
    } finally {
      setUploading(u => ({ ...u, [id]: false }));
    }
  };

  const handleRemoveFile = async (customerId, fileUrl) => {
    const customer = customers.find(c => c.id === customerId);
    const updated = (customer?.accountsFiles || []).filter(f => f.url !== fileUrl);
    await updateDoc(doc(db, 'customers', customerId), { accountsFiles: updated, updatedAt: new Date().toISOString() });
  };

  const handlePaymentDone = async (id) => {
    await updateDoc(doc(db, 'customers', id), {
      paymentStatus: 'Done',
      inAccounts: false,
      paymentDoneDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm shadow shadow-primary/20">A</div>
          <div>
            <p className="text-sm font-black text-slate-900">Accounts</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Khata Assist</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
            {accountsLeads.length} Pending
          </span>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, phone, apartment, service..."
            className="w-full pl-11 pr-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {accountsLeads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-400">No pending invoices in accounts</p>
            <p className="text-xs text-slate-300">Admin will send invoices here for payment processing</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-16 flex flex-col items-center justify-center gap-3">
            <Search size={28} className="text-slate-200" />
            <p className="text-sm font-bold text-slate-400">No results for "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-xs font-black text-primary hover:underline">Clear search</button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((customer, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                const files = customer.accountsFiles || [];
                const notes = notesMap[customer.id] !== undefined ? notesMap[customer.id] : (customer.accountsNotes || '');
                const isExpanded = expandedIds.has(customer.id);
                return (
                  <div key={customer.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Collapsed header — always visible, click to expand */}
                    <div
                      className="flex items-center justify-between px-7 py-4 cursor-pointer hover:bg-slate-50/50 transition-all"
                      onClick={() => toggleExpand(customer.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Invoice #{String(globalIdx + 1).padStart(4, '0')}</p>
                          <p className="text-sm font-black text-slate-900">{customer.customerName || 'N/A'} <span className="text-slate-400 font-bold text-xs">· {customer.apartment || customer.society || 'N/A'}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {files.length > 0 && (
                          <span className="px-2 py-1 bg-violet-50 text-violet-600 text-[10px] font-black rounded-lg border border-violet-100">
                            {files.length} file{files.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {customer.accountsNotes && (
                          <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100">Note</span>
                        )}
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded body */}
                    {isExpanded && (
                      <>
                        <div className="border-t border-slate-50 px-7 py-5 grid grid-cols-2 md:grid-cols-3 gap-5">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                            <p className="text-sm font-black text-slate-900">{customer.customerName || 'N/A'}</p>
                            <p className="text-[10px] font-bold text-slate-500">{customer.phone || ''}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Service</p>
                            <p className="text-sm font-bold text-slate-900">{customer.serviceRequested || customer.service || customer.serviceType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Apartment</p>
                            <p className="text-sm font-bold text-slate-900">{customer.apartment || customer.society || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="px-7 pb-6 space-y-4">
                          {/* Notes */}
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Accounts Notes</p>
                            <textarea
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotesMap(m => ({ ...m, [customer.id]: e.target.value }))}
                              onBlur={() => handleNotesBlur(customer.id)}
                              placeholder="Add notes here..."
                              className="w-full px-4 py-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                          </div>

                          {/* File Upload */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attachments (JPEG / PNG)</p>
                              <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Max 1MB per image</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-2">
                              {files.map((f, fi) => (
                                <div key={fi} className="relative group">
                                  <img src={f.url} alt={f.name} onClick={() => setLightbox(f)}
                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 cursor-pointer hover:border-primary transition-all shadow-sm" />
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 max-w-[80px] truncate">{f.name}</p>
                                  <button onClick={() => handleRemoveFile(customer.id, f.url)}
                                    className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            {uploadError[customer.id] && (
                              <p className="text-[10px] font-bold text-red-500 mb-2 flex items-center gap-1">
                                <AlertCircle size={11} /> {uploadError[customer.id]}
                              </p>
                            )}
                            <input ref={el => fileInputRefs.current[customer.id] = el} type="file"
                              accept="image/jpeg,image/jpg,image/png" multiple className="hidden"
                              onChange={e => handleFileUpload(customer.id, e.target.files)} />
                            <button onClick={() => fileInputRefs.current[customer.id]?.click()}
                              disabled={uploading[customer.id]}
                              className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 hover:border-primary text-xs font-bold text-slate-400 hover:text-primary rounded-xl transition-all disabled:opacity-50">
                              <Upload size={13} /> {uploading[customer.id] ? 'Saving...' : 'Upload File'}
                            </button>
                          </div>

                          {/* Payment Done */}
                          <button onClick={() => handlePaymentDone(customer.id)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-emerald-200 active:scale-[0.98]">
                            <CheckCircle size={14} /> Payment Done
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs font-black text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 text-xs font-black rounded-xl transition-all ${p === page ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs font-black text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 overflow-y-auto" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="fixed top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 backdrop-blur-sm border border-white/20">
            <X size={14} /> Close
          </button>
          <div className="min-h-full flex items-center justify-center p-16" onClick={e => e.stopPropagation()}>
            <div className="max-w-3xl w-full">
              <img src={lightbox.url} alt={lightbox.name} className="w-full rounded-2xl shadow-2xl" />
              <p className="text-center text-white/50 text-xs font-bold mt-3">{lightbox.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsDashboard;
