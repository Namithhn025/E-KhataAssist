import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Search, X, ChevronDown, ChevronUp, Building2, Users2, Filter, Trash2 } from 'lucide-react';

const SCOPES = ['BBMP', 'Panchayat', 'TMC'];
const SERVICES = ['Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)', 'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration', 'Correction', 'Others'];
const STATUSES = ['Doc Sent', 'Pre-Filing', 'Filed', 'In Process', 'Approved', 'Amount Received'];

const statusColors = {
  'Doc Sent':       'bg-slate-100 text-slate-600 border-slate-200',
  'Pre-Filing':     'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Filed':          'bg-blue-50 text-blue-700 border-blue-200',
  'In Process':     'bg-purple-50 text-purple-700 border-purple-200',
  'Approved':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Amount Received':'bg-green-500 text-white border-green-600',
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div>{children}</div>
  </div>
);

const AddCollaboratorModal = ({ open, onClose, onAdd, pocs }) => {
  const [form, setForm] = useState({ company: '', customerName: '', scope: 'BBMP', services: [], docReceived: false, notes: '', epid: '', poc: '', status: 'Doc Sent', amount: '' });
  const [amountError, setAmountError] = useState(false);
  const [customService, setCustomService] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim()) { alert('Company / Organization is required.'); return; }
    if (!form.customerName.trim()) { alert('Customer Name is required.'); return; }
    if (form.services.length === 0) { alert('Please select at least one service.'); return; }
    if (form.status === 'Amount Received' && !form.amount.trim()) { setAmountError(true); return; }
    onAdd({ ...form, createdAt: new Date().toISOString() });
    setForm({ company: '', customerName: '', scope: 'BBMP', services: [], docReceived: false, notes: '', epid: '', poc: '', status: 'Doc Sent', amount: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 space-y-6 my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center"><Users2 size={22} className="text-indigo-500" /></div>
            <div><h3 className="text-lg font-black text-slate-900">Add Collaborator</h3><p className="text-xs text-slate-400 font-medium">Fill in the required fields</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company / Organization <span className="text-red-500">*</span></label>
              <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Company name..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none text-sm font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Name <span className="text-red-500">*</span></label>
              <input value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} placeholder="Customer name..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none text-sm font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scope</label>
            <div className="flex gap-2">
              {SCOPES.map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, scope: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.scope === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Opted <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }))}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${form.services.includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}>
                  {s}
                </button>
              ))}
            </div>
            {form.services.includes('Others') && (
              <div className="flex gap-2 items-center mt-1">
                <input value={customService} onChange={e => setCustomService(e.target.value)} placeholder="Specify custom service..." className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-300" />
                <button type="button" onClick={() => {
                  if (!customService.trim()) return;
                  setForm(p => ({ ...p, services: [...p.services.filter(x => x !== 'Others'), customService.trim()] }));
                  setCustomService('');
                }} className="px-3 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase">Add</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ePID</label>
              <input value={form.epid} onChange={e => setForm(p => ({ ...p, epid: e.target.value }))} placeholder="ePID..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none text-sm font-mono font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">POC</label>
              <select value={form.poc} onChange={e => setForm(p => ({ ...p, poc: e.target.value }))} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-sm font-medium appearance-none">
                <option value="">Unassigned</option>
                {(pocs.serviceAcquisition || []).map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comments / Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Add notes..." className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none text-sm font-medium min-h-[80px] resize-none" />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Doc Received</span>
            <button type="button" onClick={() => setForm(p => ({ ...p, docReceived: !p.docReceived }))}
              className={`w-10 h-5 rounded-full relative transition-colors ${form.docReceived ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.docReceived ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200">Add Collaborator</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CollaboratorRow = ({ collab, pocs, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [amountVal, setAmountVal] = useState(collab.amount || '');
  const [amountError, setAmountError] = useState(false);

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'Amount Received' && !collab.amount) {
      onUpdate(collab.id, 'status', newStatus);
      return;
    }
    onUpdate(collab.id, 'status', newStatus);
  };

  const syncInvoiceField = async (field, value) => {
    if (!collab.invoiceCustomerId) return;
    await updateDoc(doc(db, 'customers', collab.invoiceCustomerId), { [field]: value, updatedAt: new Date().toISOString() });
  };

  const handleUpdate = async (id, field, value) => {
    await onUpdate(id, field, value);
    // Keep invoice record in sync for key fields
    const invoiceFieldMap = { services: 'serviceRequested', poc: 'serviceAcqPOC', epid: 'ePID', company: 'company', customerName: 'customerName' };
    if (invoiceFieldMap[field] && collab.invoiceCustomerId) {
      const invoiceVal = field === 'services' ? (value || []).join(', ') : value;
      await updateDoc(doc(db, 'customers', collab.invoiceCustomerId), { [invoiceFieldMap[field]]: invoiceVal, updatedAt: new Date().toISOString() });
    }
  };

  const handleAmountSave = async () => {
    if (!amountVal.trim()) { setAmountError(true); return; }
    setAmountError(false);
    const invoiceData = {
      customerName: collab.customerName,
      company: collab.company,
      serviceRequested: (collab.services || []).join(', '),
      serviceStatus: 'Approved',
      approvedDate: collab.approvedDate || new Date().toISOString(),
      createdAt: collab.createdAt || new Date().toISOString(),
      serviceAcqPOC: collab.poc || '',
      scope: collab.scope || '',
      ePID: collab.epid || '',
      amount: amountVal.trim(),
      paymentStatus: 'Done',
      isCollaboratorEntry: true,
      collaboratorId: collab.id,
    };
    if (collab.invoiceCustomerId) {
      await updateDoc(doc(db, 'customers', collab.invoiceCustomerId), { amount: amountVal.trim(), paymentStatus: 'Done', updatedAt: new Date().toISOString() });
    } else {
      const srId = 'COL' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const ref = await addDoc(collection(db, 'customers'), { ...invoiceData, srId });
      await onUpdate(collab.id, 'invoiceCustomerId', ref.id);
    }
    await onUpdate(collab.id, 'amount', amountVal.trim());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Row header */}
      <div className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm truncate">{collab.customerName}</p>
          <p className="text-[10px] font-bold text-slate-400 truncate">{collab.company}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[collab.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>{collab.status || 'Doc Sent'}</span>
          <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100">{collab.scope || 'BBMP'}</span>
          {collab.docReceived && <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Docs ✓</span>}
          <button onClick={e => { e.stopPropagation(); onDelete(collab); }} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-50 pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT */}
          <div className="space-y-4">
            <Field label="Company / Org">
              <input defaultValue={collab.company} onBlur={e => handleUpdate(collab.id, 'company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300" />
            </Field>
            <Field label="Customer Name">
              <input defaultValue={collab.customerName} onBlur={e => handleUpdate(collab.id, 'customerName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300" />
            </Field>
            <Field label="Scope">
              <div className="flex gap-1.5">
                {SCOPES.map(s => (
                  <button key={s} onClick={() => handleUpdate(collab.id, 'scope', s)}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${(collab.scope || 'BBMP') === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Doc Received">
              <button onClick={() => handleUpdate(collab.id, 'docReceived', !collab.docReceived)}
                className={`w-10 h-5 rounded-full relative transition-colors ${collab.docReceived ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${collab.docReceived ? 'translate-x-5' : ''}`} />
              </button>
            </Field>
          </div>

          {/* MIDDLE */}
          <div className="space-y-4">
            <Field label="Service Opted">
              <div className="flex flex-wrap gap-1 mb-1.5">
                {(collab.services || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[8px] font-black uppercase tracking-wider border border-indigo-100">{s}</span>
                ))}
              </div>
              <select value="" onChange={e => {
                if (!e.target.value) return;
                const cur = collab.services || [];
                const isRemoving = cur.includes(e.target.value);
                if (isRemoving && cur.length <= 1) return;
                handleUpdate(collab.id, 'services', isRemoving ? cur.filter(x => x !== e.target.value) : [...cur, e.target.value]);
              }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[8px] font-black text-slate-500 outline-none cursor-pointer appearance-none uppercase">
                <option value="">+ Add / Remove Service</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ePID">
              <input defaultValue={collab.epid} onBlur={e => handleUpdate(collab.id, 'epid', e.target.value)} placeholder="ePID..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-300" />
            </Field>
            <Field label="POC">
              <select value={collab.poc || ''} onChange={e => handleUpdate(collab.id, 'poc', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none appearance-none">
                <option value="">Unassigned</option>
                {(pocs.serviceAcquisition || []).map(n => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Comments / Notes">
              <textarea defaultValue={collab.notes} onBlur={e => onUpdate(collab.id, 'notes', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-300 min-h-[70px] resize-none" placeholder="Add notes..." />
            </Field>
          </div>

          {/* RIGHT: Status */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <div className="flex flex-col gap-1.5">
              {STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${(collab.status || 'Doc Sent') === s ? (s === 'Amount Received' ? 'bg-green-500 text-white border-green-600' : s === 'Approved' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-indigo-500 text-white border-indigo-500') : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Amount field when status is Amount Received */}
            {collab.status === 'Amount Received' && (
              <div className="mt-2 space-y-1.5">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Amount <span className="text-red-500">*</span></p>
                <div className="flex gap-2">
                  <input
                    value={amountVal}
                    onChange={e => { setAmountVal(e.target.value); setAmountError(false); }}
                    placeholder="Enter amount..."
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:ring-2 ${amountError ? 'border-red-400 ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-300 bg-slate-50'}`}
                  />
                  <button onClick={handleAmountSave} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-green-600">Save</button>
                </div>
                {amountError && <p className="text-[9px] text-red-500 font-bold">Amount is required.</p>}
                {collab.amount && <p className="text-[9px] text-green-600 font-black">Saved: ₹{collab.amount}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CollaboratorsSection = ({ pocs = {} }) => {
  const [collabs, setCollabs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ scope: '', status: '', poc: '', service: '', docReceived: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'collaborators'), snap => {
      setCollabs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    return unsub;
  }, []);

  const handleAdd = async (data) => {
    await addDoc(collection(db, 'collaborators'), data);
  };

  const handleUpdate = async (id, field, value) => {
    await updateDoc(doc(db, 'collaborators', id), { [field]: value, updatedAt: new Date().toISOString() });
  };

  const handleDelete = async (collab) => {
    if (!window.confirm(`Delete collaborator "${collab.company} — ${collab.customerName}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'collaborators', collab.id));
  };

  const q = search.toLowerCase().trim();
  const filtered = collabs.filter(c => {
    if (q && !(
      (c.company || '').toLowerCase().includes(q) ||
      (c.customerName || '').toLowerCase().includes(q) ||
      (c.epid || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q) ||
      (c.poc || '').toLowerCase().includes(q)
    )) return false;
    if (filters.scope && c.scope !== filters.scope) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.poc && (filters.poc === 'Unassigned' ? !!c.poc : c.poc !== filters.poc)) return false;
    if (filters.service && !(c.services || []).includes(filters.service)) return false;
    if (filters.docReceived === 'Yes' && !c.docReceived) return false;
    if (filters.docReceived === 'No' && c.docReceived) return false;
    return true;
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="px-8 pb-20 pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Collaborators</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-3 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-all">
          <Plus size={14} /> Add Collaborator
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, customer, ePID, notes, POC..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg"><X size={12} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${hasActiveFilters ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>
          <Filter size={13} /> Filters {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
        </button>
        {hasActiveFilters && <button onClick={() => setFilters({ scope: '', status: '', poc: '', service: '', docReceived: '' })} className="px-3 py-3 rounded-2xl text-xs font-black text-red-500 bg-red-50 border border-red-100 hover:bg-red-100"><X size={13} /></button>}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shadow-sm">
          {[
            { key: 'scope', label: 'Scope', options: SCOPES },
            { key: 'status', label: 'Status', options: STATUSES },
            { key: 'service', label: 'Service', options: SERVICES },
            { key: 'poc', label: 'POC', options: ['Unassigned', ...(pocs.serviceAcquisition || [])] },
            { key: 'docReceived', label: 'Doc Received', options: ['Yes', 'No'] },
          ].map(({ key, label, options }) => (
            <div key={key} className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <select value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none appearance-none">
                <option value="">All</option>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Records */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users2 size={28} className="text-slate-300" /></div>
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">{search || hasActiveFilters ? 'No results found' : 'No collaborators yet'}</p>
            {!search && !hasActiveFilters && <p className="text-xs text-slate-300 mt-1">Click "Add Collaborator" to get started</p>}
          </div>
        ) : (
          filtered.map(c => <CollaboratorRow key={c.id} collab={c} pocs={pocs} onUpdate={handleUpdate} onDelete={handleDelete} />)
        )}
      </div>

      <AddCollaboratorModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} pocs={pocs} />
    </div>
  );
};

export default CollaboratorsSection;
