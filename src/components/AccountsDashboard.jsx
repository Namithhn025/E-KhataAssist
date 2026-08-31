import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, LogOut, Upload, CheckCircle, X, Image, ExternalLink, AlertCircle } from 'lucide-react';

const AccountsDashboard = () => {
  const { logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [uploading, setUploading] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(data);
    });
    return unsub;
  }, []);

  // Only show leads that admin has sent to accounts AND payment not done yet
  const accountsLeads = customers
    .filter(c => c.serviceStatus === 'Approved' && c.inAccounts === true && c.paymentStatus !== 'Done')
    .sort((a, b) => new Date(a.approvedDate || a.createdAt || 0) - new Date(b.approvedDate || b.createdAt || 0));

  const handleUpdate = async (id, field, value) => {
    await updateDoc(doc(db, 'customers', id), { [field]: value, updatedAt: new Date().toISOString() });
  };

  const handleNotesBlur = (id) => {
    const val = notesMap[id];
    if (val !== undefined) {
      handleUpdate(id, 'accountsNotes', val);
    }
  };

  const [uploadError, setUploadError] = useState({});

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
          setUploadError(e => ({ ...e, [id]: `"${file.name}" is too large. Please upload images under 1MB.` }));
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
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
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
        ) : (
          <div className="space-y-5">
            {accountsLeads.map((customer, idx) => {
              const files = customer.accountsFiles || [];
              const notes = notesMap[customer.id] !== undefined ? notesMap[customer.id] : (customer.accountsNotes || '');
              return (
                <div key={customer.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-7 py-4 border-b border-slate-50 bg-emerald-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <FileText size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Invoice #{String(idx + 1).padStart(4, '0')}</p>
                        <p className="text-xs text-slate-400 font-bold">
                          Approved: {customer.approvedDate ? new Date(customer.approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePaymentDone(customer.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-emerald-200 active:scale-95"
                    >
                      <CheckCircle size={14} /> Payment Done
                    </button>
                  </div>

                  {/* Details */}
                  <div className="px-7 py-5 grid grid-cols-2 md:grid-cols-3 gap-5">
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

                  {/* Notes + File Upload */}
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
                        <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
                          <AlertCircle size={10} /> Max 1MB per image
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {files.map((f, fi) => (
                          <div key={fi} className="relative group flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <Image size={14} className="text-slate-400 shrink-0" />
                            <a href={f.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-600 hover:text-primary max-w-[120px] truncate">
                              {f.name}
                            </a>
                            <button
                              onClick={() => handleRemoveFile(customer.id, f.url)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-slate-300 hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {uploadError[customer.id] && (
                        <p className="text-[10px] font-bold text-red-500 mb-2 flex items-center gap-1">
                          <AlertCircle size={11} /> {uploadError[customer.id]}
                        </p>
                      )}
                      <input
                        ref={el => fileInputRefs.current[customer.id] = el}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        className="hidden"
                        onChange={e => handleFileUpload(customer.id, e.target.files)}
                      />
                      <button
                        onClick={() => fileInputRefs.current[customer.id]?.click()}
                        disabled={uploading[customer.id]}
                        className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 hover:border-primary text-xs font-bold text-slate-400 hover:text-primary rounded-xl transition-all disabled:opacity-50"
                      >
                        <Upload size={13} /> {uploading[customer.id] ? 'Saving...' : 'Upload File'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsDashboard;
