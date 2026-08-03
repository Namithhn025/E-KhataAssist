import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Upload, Clock, AlertTriangle, CheckCircle, TrendingUp,
  Search, RefreshCw, BarChart2, FileText, Globe, ArrowUpRight,
  ChevronRight, Calendar, User, Edit2, Users
} from 'lucide-react';
import { db, auth } from '../../firebase';
import {
  collection, query, where, onSnapshot, doc, updateDoc, writeBatch, addDoc, getDoc, deleteDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import MassUploadModal from './MassUploadModal';
import AddLeadModal from './AddLeadModal';

// ─── Deadline Badge ──────────────────────────────────────────────────────────
const DeadlineBadge = ({ lead, deadlineDays = 5 }) => {
  const uploadDate = lead.marketingUploadDate || lead.createdAt;
  if (!uploadDate) return <span className="text-[10px] text-slate-500 italic">No date</span>;

  const start = new Date(uploadDate);
  const now = new Date();
  const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const remaining = deadlineDays - elapsed;

  if (remaining < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
        <AlertTriangle size={9} /> {Math.abs(remaining)}d Overdue
      </span>
    );
  }
  if (remaining <= 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-400 text-slate-900">
        <Clock size={9} /> {remaining === 0 ? 'Due Today' : '1d Left'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
      <CheckCircle size={9} /> {remaining}d Left
    </span>
  );
};

// ─── Move Status Modal ───────────────────────────────────────────────────────
const MoveStatusModal = ({ open, lead, onConfirm, onCancel }) => {
  const [docSource, setDocSource] = useState('');
  const [customDocSource, setCustomDocSource] = useState('');
  const [docStatus, setDocStatus] = useState('');

  useEffect(() => {
    if (open) { 
      setDocSource(lead?.docSource || ''); 
      setCustomDocSource('');
      setDocStatus(''); 
    }
  }, [open, lead]);

  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <ArrowUpRight size={22} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Move to Operation Team</h3>
            <p className="text-xs text-slate-400 font-medium">
              <span className="font-black text-slate-200">{lead.customerName}</span> — both fields are mandatory.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc Source *</label>
          <select
            value={docSource}
            onChange={e => {
              setDocSource(e.target.value);
              if (e.target.value !== 'others') setCustomDocSource('');
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="">Select source…</option>
            <option value="ajay whatsapp">Ajay Whatsapp</option>
            <option value="rakshith whatsapp">Rakshith Whatsapp</option>
            <option value="mail">Mail</option>
            <option value="physical">Physical</option>
            <option value="others">Others</option>
          </select>
          {docSource === 'others' && (
            <input
              type="text"
              placeholder="Enter custom source..."
              value={customDocSource}
              onChange={(e) => setCustomDocSource(e.target.value)}
              className="w-full mt-2 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30"
              autoFocus
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc Status *</label>
          <select
            value={docStatus}
            onChange={e => setDocStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="">Select status…</option>
            <option value="Yes">Yes — Documents Received</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            Cancel
          </button>
          <button
            disabled={!docSource || (docSource === 'others' && !customDocSource.trim()) || !docStatus}
            onClick={() => onConfirm({ 
              docSource: docSource === 'others' ? customDocSource.trim() : docSource, 
              docStatus 
            })}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✓ Move to Operation Team
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, border, text, bg }) => (
  <div className={`rounded-2xl p-5 border flex flex-col gap-2 ${bg} ${border}`}>
    <div className="flex items-center justify-between">
      <span className={`text-[10px] font-black uppercase tracking-widest ${text} opacity-70`}>{label}</span>
      <Icon size={16} className={`${text} opacity-60`} />
    </div>
    <div className={`text-3xl font-black ${text}`}>{value}</div>
  </div>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const MarketingDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  const [moveLead, setMoveLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [pocs, setPocs] = useState({ acquisition: [], serviceAcquisition: [] });
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'deadlines'
  const [memberFilter, setMemberFilter] = useState('all');

  // Load settings once at mount — no live listener needed
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'crm_config'));
        if (snap.exists()) {
          const data = snap.data().pocs || { acquisition: [], serviceAcquisition: [], service: [], apartments: [], pricing: {} };
          if (!data.apartments) data.apartments = [];
          if (!data.pricing) data.pricing = {};
          setDeadlineDays(data.marketingDeadlineDays || 5);
          setPocs(data);
        }
      } catch (e) {
        console.error('Marketing: Failed to load settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Fetch marketing data leads
  useEffect(() => {
    const q = query(
      collection(db, 'customers'),
      where('isMarketingData', '==', true)
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(l => !['Closed', 'Approved'].includes(l.serviceStatus));
      setLeads(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleBulkUpload = async (leads) => {
    const batch = writeBatch(db);
    const marketingTeam = pocs.acquisition || [];
    leads.forEach((leadData, index) => {
      const newDocRef = doc(collection(db, 'customers'));
      batch.set(newDocRef, {
        ...leadData,
        isMarketingData: !leadData.moveToOperation,
        marketingUploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceVault: 'marketing',
        serviceStatus: 'Open',
        serviceStage: 'Document Received',
        status: 'Document Received',
        docsSubmitted: leadData.docsSubmitted || false,
        // Auto-assign marketing team member (round-robin)
        ...(marketingTeam.length > 0 ? { serviceAcqPOC: marketingTeam[index % marketingTeam.length] } : {}),
      });
    });
    await batch.commit();
  };

  const handleAddSingleLead = async (data) => {
    try {
      const marketingTeam = pocs.acquisition || [];
      await addDoc(collection(db, 'customers'), {
        ...data,
        isMarketingData: true,
        marketingUploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceVault: 'marketing',
        serviceStatus: 'Open',
        serviceStage: 'Document Received',
        status: 'Document Received',
        docsSubmitted: false,
        // Auto-assign first marketing team member
        ...(marketingTeam.length > 0 ? { serviceAcqPOC: marketingTeam[0] } : {}),
      });
      setIsAddLeadOpen(false);
    } catch (error) {
      console.error("Lead Creation Error:", error);
      alert(`Failed to save lead: ${error.message}`);
    }
  };

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('crm_role');
    navigate('/login');
  };

  const handleMoveToActive = async ({ docSource, docStatus }) => {
    if (!moveLead) return;
    try {
      // Use pocs already loaded in state — no need for a fresh Firestore read
      const defaults = pocs.defaults || {};
      const serviceAcqTeam = pocs.serviceAcquisition || [];

      const updatePayload = {
        docsSubmitted: true,
        docsSubmittedDate: new Date().toISOString(),
        docSource,
        docStatus,
        serviceStatus: 'Open',
        isMarketingData: false,
        marketingMovedDate: new Date().toISOString(),
        epidAndEsignSpecialist: defaults.epidAndEsignSpecialist || serviceAcqTeam[0] || '',
        ekycSpecialist: defaults.ekycSpecialist || serviceAcqTeam[0] || '',
        addressSpecialist: defaults.addressSpecialist || serviceAcqTeam[0] || '',
      };

      await updateDoc(doc(db, 'customers', moveLead.id), updatePayload);
    } catch (e) {
      alert('Failed to move lead: ' + e.message);
    }
    setMoveLead(null);
  };


  const handleAssignPOC = async (leadId, poc) => {
    try {
      await updateDoc(doc(db, 'customers', leadId), { serviceAcqPOC: poc });
    } catch (e) {
      alert('Failed to assign POC: ' + e.message);
    }
  };

  const handleSaveNotes = async (leadId) => {
    try {
      await updateDoc(doc(db, 'customers', leadId), { notes: notesText });
      setEditingNotesId(null);
    } catch (e) {
      alert('Failed to save notes: ' + e.message);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteLead) return;
    try {
      await deleteDoc(doc(db, 'customers', deleteLead.id));
    } catch (e) {
      alert('Failed to delete lead: ' + e.message);
    }
    setDeleteLead(null);
  };

  const getDeadlineStatus = useCallback((lead) => {
    const uploadDate = lead.marketingUploadDate || lead.createdAt;
    if (!uploadDate) return 'unknown';
    const elapsed = Math.floor((Date.now() - new Date(uploadDate)) / (1000 * 60 * 60 * 24));
    const remaining = deadlineDays - elapsed;
    if (remaining < 0) return 'overdue';
    if (remaining <= 1) return 'reaching';
    return 'ontrack';
  }, [deadlineDays]);

  const stats = {
    total: leads.length,
    ontrack: leads.filter(l => getDeadlineStatus(l) === 'ontrack').length,
    reaching: leads.filter(l => getDeadlineStatus(l) === 'reaching').length,
    overdue: leads.filter(l => getDeadlineStatus(l) === 'overdue').length,
  };

  // Filter leads for deadlines tab: only those that are reaching or overdue
  const deadlineLeads = leads.filter(l => getDeadlineStatus(l) !== 'ontrack');

  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      (l.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search) ||
      (l.apartment || l.society || '').toLowerCase().includes(search.toLowerCase());
    const status = getDeadlineStatus(l);
    const matchFilter = deadlineFilter === 'all' || status === deadlineFilter;
    const matchMember = memberFilter === 'all' || l.serviceAcqPOC === memberFilter;
    return matchSearch && matchFilter && matchMember;
  });

  const displayLeads = activeTab === 'deadlines' ? deadlineLeads : filtered;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-60 bg-[#0f172a] h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-900/40 shrink-0">M</div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-white text-sm truncate">E-Khata Assist</p>
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Marketing</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'data' ? 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <BarChart2 size={16} /> Marketing Data
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'deadlines' ? 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Clock size={16} /> Deadlines
            {stats.overdue > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black">{stats.overdue}</span>
            )}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/50 hover:text-violet-300 transition-all"
          >
            <Upload size={16} /> Mass Upload
          </button>
        </nav>

        <div className="p-5 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 uppercase tracking-widest"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-60 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'deadlines' ? 'Deadline Tracker' : 'Marketing Dashboard'}
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
              {activeTab === 'deadlines' ? `${deadlineLeads.length} leads need attention · ${deadlineDays}d deadline` : 'Pre-active lead management'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              <Upload size={14} /> Mass Upload
            </button>
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/40"
            >
              <User size={14} /> New Lead
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Pre-Active" value={stats.total} icon={FileText} bg="bg-slate-800/60" border="border-slate-700" text="text-white" />
          <StatCard label="On Track 🟢" value={stats.ontrack} icon={CheckCircle} bg="bg-emerald-900/20" border="border-emerald-800/40" text="text-emerald-300" />
          <StatCard label="Reaching 🟡" value={stats.reaching} icon={Clock} bg="bg-yellow-900/20" border="border-yellow-800/40" text="text-yellow-300" />
          <StatCard label="Overdue 🔴" value={stats.overdue} icon={AlertTriangle} bg="bg-red-900/20" border="border-red-800/40" text="text-red-300" />
        </div>

        {/* Filters (only for data tab) */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, site…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
              {[
                { id: 'all', label: 'All' },
                { id: 'ontrack', label: '🟢 On Track' },
                { id: 'reaching', label: '🟡 Reaching' },
                { id: 'overdue', label: '🔴 Overdue' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDeadlineFilter(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    deadlineFilter === f.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Member filter */}
            {(pocs.acquisition || []).length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                  <Users size={12} /> Member
                </div>
                <button
                  onClick={() => setMemberFilter('all')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    memberFilter === 'all'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  All Members
                </button>
                {(pocs.acquisition || []).map(name => (
                  <button
                    key={name}
                    onClick={() => setMemberFilter(name)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      memberFilter === name
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deadlines' && (
          <div className="bg-red-900/10 border border-red-800/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-300">
              Showing <span className="font-black text-red-200">{deadlineLeads.length}</span> leads that are reaching or have exceeded the <span className="font-black">{deadlineDays}-day</span> deadline.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="bg-slate-800/80 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-700">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Site / Apartment</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">S-Acq. POC</th>
                  <th className="px-5 py-4">Doc Source</th>
                  <th className="px-5 py-4">Doc Status</th>
                  <th className="px-5 py-4">Upload Date</th>
                  <th className="px-5 py-4">Deadline</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <RefreshCw size={20} className="animate-spin" />
                        <span className="text-xs font-bold">Loading leads…</span>
                      </div>
                    </td>
                  </tr>
                ) : displayLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-600">
                        <FileText size={28} />
                        <span className="text-sm font-bold text-slate-400">
                          {activeTab === 'deadlines' ? 'No deadline issues 🎉' : 'No pre-active leads found'}
                        </span>
                        {activeTab === 'data' && (
                          <div className="flex gap-3 mt-2">
                            <button
                              onClick={() => setShowUpload(true)}
                              className="px-4 py-2 bg-violet-600/20 text-violet-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all"
                            >
                              Mass Upload
                            </button>
                            <button
                              onClick={() => setIsAddLeadOpen(true)}
                              className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-md shadow-violet-900/30"
                            >
                              New Lead
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : displayLeads.map(lead => (
                  <React.Fragment key={lead.id}>
                    <tr onClick={() => toggleRow(lead.id)} className={`group hover:bg-slate-800/60 transition-all cursor-pointer ${expandedRows.has(lead.id) ? 'bg-slate-800/40' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-black text-slate-100 text-sm flex items-center gap-2">
                           {lead.customerName || '—'}
                           <span className={`text-slate-500 transition-transform ${expandedRows.has(lead.id) ? 'rotate-180' : ''}`}>
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                           </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.phone || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <Globe size={10} className="text-slate-600" />
                          {lead.apartment || lead.society || 'Direct'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-violet-900/40 text-violet-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-violet-800/40">
                          {lead.serviceRequested || '—'}
                        </span>
                      </td>
                      {/* S-Acq POC */}
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <select
                          value={lead.serviceAcqPOC || ''}
                          onChange={e => handleAssignPOC(lead.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-200 outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer appearance-none"
                        >
                          <option value="">Unassigned</option>
                          {(pocs.acquisition || []).map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold ${lead.docSource ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                          {lead.docSource || 'Not set'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold ${lead.docStatus ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                          {lead.docStatus || 'Not set'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[10px] font-bold text-slate-400">
                          {(lead.marketingUploadDate || lead.createdAt)
                            ? new Date(lead.marketingUploadDate || lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                            : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <DeadlineBadge lead={lead} deadlineDays={deadlineDays} />
                      </td>
                      <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setMoveLead(lead)}
                            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-violet-900/30"
                          >
                            Move to Operation Team
                          </button>
                          <button
                            onClick={() => setDeleteLead(lead)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                            title="Delete lead"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(lead.id) && (
                      <tr className="bg-slate-900/40">
                        <td colSpan={9} className="px-5 py-6 border-b border-slate-700/40 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-4 gap-6 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Email</span>
                              <span className="text-xs text-slate-200 font-bold">{lead.email || '—'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Priority</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                lead.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                                lead.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                                'bg-slate-700 text-slate-300'
                              }`}>{lead.priority || 'Low'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">EC Number</span>
                              <span className="text-xs text-slate-200 font-bold">{lead.ecNumber || '—'}</span>
                            </div>
                            <div className="flex flex-col h-full">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Notes</span>
                                {editingNotesId === lead.id ? (
                                  <div className="flex gap-2">
                                    <button onClick={() => setEditingNotesId(null)} className="text-[9px] text-slate-400 hover:text-white uppercase font-black">Cancel</button>
                                    <button onClick={() => handleSaveNotes(lead.id)} className="text-[9px] text-emerald-400 hover:text-emerald-300 uppercase font-black">Save</button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setEditingNotesId(lead.id); setNotesText(lead.notes || ''); }} className="text-[9px] text-violet-400 hover:text-violet-300 uppercase font-black flex items-center gap-1">
                                    <Edit2 size={10} /> Edit
                                  </button>
                                )}
                              </div>
                              {editingNotesId === lead.id ? (
                                <textarea
                                  value={notesText}
                                  onChange={e => setNotesText(e.target.value)}
                                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-violet-500 flex-1 min-h-[60px]"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-xs text-slate-300 font-medium whitespace-pre-wrap flex-1">{lead.notes || 'No notes available'}</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {displayLeads.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-700/40 text-[10px] font-bold text-slate-600">
              Showing {displayLeads.length} {activeTab === 'deadlines' ? 'deadline' : 'pre-active'} leads
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onAdd={handleAddSingleLead}
        pocs={pocs}
      />
      
      {showUpload && (
        <MassUploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUpload={handleBulkUpload}
          pocs={pocs}
          existingCustomers={leads}
        />
      )}
      <MoveStatusModal
        open={!!moveLead}
        lead={moveLead}
        onConfirm={handleMoveToActive}
        onCancel={() => setMoveLead(null)}
      />
      {deleteLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <h3 className="text-lg font-black text-white">Delete Lead?</h3>
              <p className="text-sm text-slate-400">Are you sure you want to delete <span className="text-white font-bold">{deleteLead.customerName}</span>? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteLead(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-600 transition-all">Cancel</button>
              <button onClick={handleDeleteLead} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;
