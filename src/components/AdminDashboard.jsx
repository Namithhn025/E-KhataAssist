import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, MessageCircle, BookOpen, Copy, Check, Filter, FileText, Plus, Search, User } from 'lucide-react';

import Sidebar from './crm/Sidebar';
import DashboardHeader from './crm/DashboardHeader';
import MetricSummary from './crm/MetricSummary';
import FilterBar from './crm/FilterBar';
import AddLeadModal from './crm/AddLeadModal';
import AdminSettingsModal from './crm/AdminSettingsModal';
import NestedServicesTable from './crm/NestedServicesTable';
import { setDoc, arrayUnion } from 'firebase/firestore';
import { ChevronDown, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedSource, setSelectedSource] = useState('sales');
  const [customers, setCustomers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState('all');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [noteInputId, setNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [servicesSubMode, setServicesSubMode] = useState('active');
  
  const navigate = useNavigate();

  // Load Apartments
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'apartments'), (snapshot) => {
      setApartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // Load Settings (POCs)
  const [pocs, setPocs] = useState({ acquisition: ['Rasika', 'Ahmed', 'Suresh'], sales: ['Deepak', 'Manju', 'Kiran'] });
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'crm_config'), (snapshot) => {
      if (snapshot.exists()) {
        setPocs(snapshot.data().pocs || { acquisition: [], sales: [] });
      }
    });
    return unsubscribe;
  }, []);

  // Load Customers
  useEffect(() => {
    let q = query(collection(db, 'customers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       console.error("CRITICAL: Firestore 'customers' fetch failed:", error);
       if (error.code === 'permission-denied') {
          console.warn("Permission denied. Ensure your security rules allow reading 'customers'.");
       } else if (error.code === 'not-found' || error.message.includes('not been initialized')) {
          alert("Firebase Error: Cloud Firestore is not enabled for this project. Please create the database in the Firebase Console.");
       }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_role');
    navigate('/login');
  };

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handlePOCUpdate = async (customerId, field, value) => {
    try {
      await updateDoc(doc(db, 'customers', customerId), { [field]: value });
    } catch (error) {
      console.error("Firestore Update Error:", error);
      alert("Failed to update field. Ensure Cloud Firestore is enabled in your Firebase console.");
    }
  };

  const handleAddNote = async (customerId) => {
    if (!noteText.trim()) return;
    
    const newNote = {
      text: noteText,
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };

    await updateDoc(doc(db, 'customers', customerId), {
      internalNotes: arrayUnion(newNote)
    });

    setNoteText('');
    setNoteInputId(null);
  };

  // ─── Master metrics computed from real Firestore data ─────────────────────
  const serviceLeads = customers.filter(c => c.serviceType || c.serviceRequested || c.service);

  const metrics = {
    // Sales metrics
    total:     customers.length,
    qualified: customers.filter(c => c.status === 'Approved').length,
    stale:     customers.filter(c => c.status === 'Rejected').length,
    followUp:  customers.filter(c => c.status === 'Follow Up').length,
    missed:    customers.filter(c => c.status === 'Missed').length,
    advance:   customers.filter(c => c.payment === 'Pending').length,

    // Services metrics — match exactly the filter logic in filteredCustomers
    totalSRs:  serviceLeads.length,
    preActive: serviceLeads.filter(c =>
      !c.docsSubmitted &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    active: serviceLeads.filter(c =>
      c.docsSubmitted &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    blocked:  serviceLeads.filter(c => c.serviceStatus === 'Blocked').length,
    closed:   serviceLeads.filter(c => c.serviceStatus === 'Closed').length,
    retry:    serviceLeads.filter(c => c.serviceStatus === 'Retry').length,
    approved: serviceLeads.filter(c => c.serviceStatus === 'Approved').length,
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !searchQuery || 
      c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.ePID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.srId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // View Filtering
    if (selectedSource === 'nexus') {
       // All leads are visible in Nexus
    } else if (selectedSource === 'sales') {
       if (c.sourceVault && c.sourceVault !== 'sales') return false;
    } else if (selectedSource === 'services') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;
       
        // Terminal states — driven by serviceStatus set automatically
        const isBlocked  = c.serviceStatus === 'Blocked';
        const isClosed   = c.serviceStatus === 'Closed';
        const isRetry    = c.serviceStatus === 'Retry';
        const isApproved = c.serviceStatus === 'Approved';

        // Pre-active: has service, docs NOT submitted yet
        const isPreActive = !c.docsSubmitted && !isBlocked && !isClosed && !isRetry && !isApproved;
        // Active: docs submitted, still in progress
        const isActive = c.docsSubmitted && !isBlocked && !isClosed && !isRetry && !isApproved;

        if (servicesSubMode === 'pre-active' && !isPreActive) return false;
        if (servicesSubMode === 'active'     && !isActive)    return false;
        if (servicesSubMode === 'blocked'    && !isBlocked)   return false;
        if (servicesSubMode === 'closed'     && !isClosed)    return false;
        if (servicesSubMode === 'retry'      && !isRetry)     return false;
        if (servicesSubMode === 'approved'   && !isApproved)  return false;
    } else {
       if (c.sourceVault !== selectedSource) return false;
    }
    
    const matchesInterest = !activeFilters.interest || c.interest === activeFilters.interest;
    const matchesAcqPOC = !activeFilters.acqPOC || c.acqPOC === activeFilters.acqPOC;
    const matchesSalesPOC = !activeFilters.salesPOC || c.salesPOC === activeFilters.salesPOC;
    const matchesPriority = !activeFilters.priority || c.priority === activeFilters.priority;
    const matchesStage = !activeFilters.stage || c.status === activeFilters.stage;
    
    return matchesSearch && matchesInterest && matchesAcqPOC && matchesSalesPOC && matchesPriority && matchesStage;
  });

  const serviceOptions = [
    'E-Khata Transfer', 'E-Khata Fresh', 'MODT Closure', 'Loan Closure', 
    'Khata Transfer (Ph-2)', 'BESCOM Transfer', 'Property Tax Assessment', 
    'Legal Opinion', 'Sale Deed Drafting', 'Gift Deed', 'Release Deed',
    'Encumbrance Certificate', 'Family Tree (14-No)'
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Fixed Left */}
        <Sidebar 
          selectedSource={selectedSource} 
          setSelectedSource={(source) => {
             if (source === 'admin') setIsAdminSettingsOpen(true);
             else setSelectedSource(source);
          }} 
          servicesSubMode={servicesSubMode}
          setServicesSubMode={setServicesSubMode}
          onLogout={handleLogout}
          userRole="admin"
        />
  
        {/* Main Content - Scrollable Right */}
        <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <DashboardHeader 
            title={
              selectedSource === 'invoices' ? 'Invoices' :
              selectedSource === 'services' ? `Services / ${servicesSubMode.charAt(0).toUpperCase() + servicesSubMode.slice(1)}` : 
              'Sales'
            }
            onSearch={setSearchQuery}
            onBulkUpload={() => alert('Bulk Upload clicked')}
            onNewLead={() => setIsAddCustomerOpen(true)}
          />
  
          {/* Filter Bar */}
          <FilterBar 
            activeFilters={activeFilters}
            viewMode={selectedSource}
            onFilterChange={(key, val) => setActiveFilters({...activeFilters, [key]: val})}
            onReset={() => setActiveFilters({})}
          />
  
          {/* Metric Summary Dashboard */}
          <MetricSummary metrics={metrics} viewMode={selectedSource} />

          {/* ── INVOICES VIEW ────────────────────────────────────────── */}
          {selectedSource === 'invoices' && (() => {
            const approvedLeads = customers.filter(c => c.serviceStatus === 'Approved');
            return (
              <div className="px-8 pb-20 pt-4">
                {/* Summary Banner */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-700">{approvedLeads.length}</p>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Total Invoices</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Plus size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-blue-700">
                        ₹{approvedLeads.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Total Revenue</p>
                    </div>
                  </div>
                </div>

                {approvedLeads.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-24 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <FileText size={28} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No approved leads yet</p>
                    <p className="text-xs text-slate-300">Approve leads from Services → Closed to generate invoices</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedLeads.map((customer, idx) => (
                      <div key={customer.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                        {/* Invoice Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-emerald-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <FileText size={18} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Invoice #{String(idx + 1).padStart(4, '0')}</p>
                              <p className="text-xs font-bold text-slate-400">
                                Approved: {customer.approvedDate ? new Date(customer.approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                              ✓ Approved
                            </span>
                            <button
                              onClick={() => window.print()}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                            >
                              <FileText size={12} /> Print
                            </button>
                          </div>
                        </div>

                        {/* Invoice Body */}
                        <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                            <p className="text-sm font-black text-slate-900">{customer.customerName}</p>
                            <p className="text-[10px] font-bold text-slate-500">{customer.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service</p>
                            <p className="text-sm font-bold text-slate-900">{customer.serviceRequested || customer.service || customer.serviceType || 'N/A'}</p>
                            <p className="text-[10px] font-bold text-slate-500">{customer.society || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Handled By</p>
                            <p className="text-sm font-bold text-slate-900">{customer.acqPOC || 'N/A'}</p>
                            <p className="text-[10px] font-bold text-slate-500">Acquisition POC</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                            <p className="text-2xl font-black text-emerald-600">₹{parseFloat(customer.amount || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── MAIN TABLE (Sales / Services) ─────────────────────────── */}
          {selectedSource !== 'invoices' && (
        <div className="px-8 pb-20">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                    <td className="w-14 px-6 py-5 align-middle"><input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" /></td>
                    {selectedSource === 'services' ? (
                      <>
                        <th className="px-6 py-5">SR ID</th>
                        <th className="px-6 py-5">Name</th>
                        <th className="px-6 py-5">Phone number</th>
                        <th className="px-6 py-5">Service</th>
                        {servicesSubMode === 'blocked' && <th className="px-6 py-5">Blocker POC</th>}
                        <th className="px-6 py-5">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-5">Name & ID </th>
                        <th className="px-6 py-5">Phone Number</th>
                        <th className="px-6 py-5">Priority</th>
                        <th className="px-6 py-5">Acquisition POC</th>
                        <th className="px-6 py-5">Marketing/Activity</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <tr className={`group transition-all duration-300 cursor-default ${
                        expandedRows.has(customer.id) ? 'bg-[#f1f5f9]' : 
                        (selectedSource === 'services' && servicesSubMode === 'blocked') ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-slate-50/50'
                      }`}>
                        <td className="px-6 py-6 ring-inset">
                           <div className="flex items-center gap-3">
                             <div 
                               onClick={() => toggleRow(customer.id)}
                               className={`w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer ${expandedRows.has(customer.id) ? 'bg-white shadow-sm ring-1 ring-slate-200 rotate-180' : ''}`}
                             >
                                <ChevronDown size={16} />
                             </div>
                             <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" />
                           </div>
                        </td>
                        
                        {selectedSource === 'services' ? (
                          <>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                                     <div className="w-3 h-3 bg-blue-500 rounded-sm" /> 
                                  </div>
                                  <span className="text-xs font-black text-slate-900 tracking-tighter uppercase">{customer.srId || `SRF${customer.id.substring(0,4).toUpperCase()}`}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                {customer.customerName}
                              </div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2 font-bold text-slate-700">
                                 {customer.phone}
                                 <button 
                                   onClick={() => copyToClipboard(customer.phone, customer.id)}
                                   className="text-slate-200 hover:text-primary transition-colors p-1"
                                 >
                                   {copyFeedback === customer.id ? <Check size={14} className="text-green-500" /> : <Copy size={12} />}
                                 </button>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <span className="text-xs font-bold text-slate-700">{customer.serviceType || 'E-Khata'}</span>
                            </td>
                            {servicesSubMode === 'blocked' && (
                              <td className="px-6 py-6">
                                 <span className="text-xs font-bold text-slate-500 text-center block w-full">-</span>
                              </td>
                            )}
                            <td className="px-6 py-6">
                               <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 border border-slate-200">S-PENDING</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-6">
                              <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{customer.customerName}</div>
                              <div className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5">UIDE{customer.id.substring(0, 4).toUpperCase()}</div>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2 font-bold text-slate-700">
                                 {customer.phone}
                                 <button 
                                   onClick={() => copyToClipboard(customer.phone, customer.id)}
                                   className="text-slate-200 hover:text-primary transition-colors p-1"
                                 >
                                   {copyFeedback === customer.id ? <Check size={14} className="text-green-500" /> : <Copy size={12} />}
                                 </button>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 customer.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                 customer.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                 'bg-slate-100 text-slate-500 border-slate-200'
                               }`}>
                                 {customer.priority || 'Low'}
                               </span>
                            </td>
                            <td className="px-6 py-6">
                              <select 
                                 value={customer.acqPOC || ''}
                                 onChange={(e) => handlePOCUpdate(customer.id, 'acqPOC', e.target.value)}
                                 className="bg-white/50 border border-slate-100 font-bold hover:border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-slate-100 min-w-32 transition-all cursor-pointer"
                              >
                                 <option value="">Select...</option>
                                 {pocs.acquisition?.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                 ))}
                              </select>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                                     <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">M</div>
                                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Meta</span>
                                  </div>
                                  <div className="text-[10px] space-y-0.5">
                                     <div className="font-bold text-slate-400">Total: <span className="text-slate-900 font-black">0</span></div>
                                     <div className="font-bold text-green-600">Connect: <span className="font-black">0</span></div>
                                     <div className="font-bold text-red-500">Not Con: <span className="font-black">0</span></div>
                                  </div>
                                  <div className="flex gap-2 text-slate-400">
                                     <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:text-primary transition-colors cursor-pointer"><BookOpen size={14} /></div>
                                     <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:text-primary transition-colors cursor-pointer"><Phone size={14} /></div>
                                     <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:text-primary transition-colors cursor-pointer"><MessageCircle size={14} /></div>
                                  </div>
                               </div>
                            </td>
                          </>
                        )}
                      </tr>
                      {expandedRows.has(customer.id) && (
                        <tr className="bg-[#f8fafc]">
                          <td colSpan={selectedSource === 'services' ? (servicesSubMode === 'blocked' ? 7 : 6) : 6} className="px-10 py-12">
                            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-2 duration-500">
                               
                               {/* Row Stats & Icons Integration */}
                               <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
                                  <div className="flex items-center gap-8">
                                     <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</div>
                                        <div className="flex items-center gap-2">
                                           <span className="text-sm font-black text-slate-900">{customer.customerName}</span>
                                           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded italic">UIDE{customer.id.substring(0,4).toUpperCase()}</span>
                                        </div>
                                     </div>
                                     <div className="w-[1px] h-8 bg-slate-100" />
                                     <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Registry</div>
                                        <div className="text-xs font-bold text-slate-700">{customer.email || 'N/A'}</div>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className="flex flex-col items-end mr-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lead Health</span>
                                        <div className="flex items-center gap-1">
                                           <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                           <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                                        </div>
                                     </div>
                                     <div className="flex gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 hover:text-primary hover:bg-white hover:shadow-md transition-all cursor-pointer"><FileText size={18} /></div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 hover:text-primary hover:bg-white hover:shadow-md transition-all cursor-pointer"><Phone size={18} /></div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 hover:text-primary hover:bg-white hover:shadow-md transition-all cursor-pointer"><MessageSquare size={18} /></div>
                                     </div>
                                  </div>
                               </div>

                               {/* Advanced Services Table */}
                               <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                     <div className="w-2 h-2 rounded bg-primary" /> Active Service Requests
                                  </h4>
                                  <NestedServicesTable 
                                    customer={customer} 
                                    onUpdate={(field, val) => handlePOCUpdate(customer.id, field, val)} 
                                  />
                               </div>

                               {/* Internal Notes Timeline */}
                               <div className="grid md:grid-cols-4 gap-10">
                                 <div className="md:col-span-1 space-y-4">
                                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</h4>
                                       <div className="space-y-3">
                                          <div className="flex justify-between items-center"><span className="text-[10px] text-slate-400 font-bold uppercase">ePID</span><span className="text-[10px] font-black text-slate-900 font-mono italic">{customer.ePID}</span></div>
                                          <div className="flex justify-between items-center"><span className="text-[10px] text-slate-400 font-bold uppercase">Source</span><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Meta Ads</span></div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="md:col-span-3 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Administrative Logs & Timeline</h4>
                                  
                                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[140px] flex flex-col gap-4">
                                     {/* Notes List */}
                                     {customer.internalNotes && customer.internalNotes.length > 0 ? (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                           {customer.internalNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((note, idx) => (
                                              <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                    <User size={14} />
                                                 </div>
                                                 <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                                       <span className="text-slate-900">{note.author}</span>
                                                       <span className="text-slate-400">{new Date(note.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{note.text}</p>
                                                 </div>
                                              </div>
                                           ))}
                                        </div>
                                     ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 group py-4">
                                           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                                              <FileText size={20} />
                                           </div>
                                           <p className="text-xs font-bold text-slate-400">Activity stream encrypted. Start tagging this lead to see logs.</p>
                                        </div>
                                     )}

                                     {/* Add Note Input */}
                                     {noteInputId === customer.id ? (
                                        <div className="flex flex-col gap-2 animate-in zoom-in-95 duration-200">
                                           <textarea 
                                              value={noteText}
                                              onChange={(e) => setNoteText(e.target.value)}
                                              placeholder="Type your internal note here..."
                                              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xs font-medium min-h-[80px]"
                                              autoFocus
                                           />
                                           <div className="flex justify-end gap-2">
                                              <button onClick={() => { setNoteInputId(null); setNoteText(''); }} className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-lg">Cancel</button>
                                              <button onClick={() => handleAddNote(customer.id)} className="px-6 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-slate-800 transition-all">Post Note</button>
                                           </div>
                                        </div>
                                     ) : (
                                        <div className="flex justify-center pt-2 border-t border-slate-50">
                                           <button 
                                              onClick={() => setNoteInputId(customer.id)}
                                              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2 group"
                                           >
                                              <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add Internal Note
                                           </button>
                                        </div>
                                     )}
                                  </div>
                                 </div>
                               </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                       <td colSpan={selectedSource === 'services' ? (servicesSubMode === 'blocked' ? 7 : 6) : 6} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-300">
                                <Search size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900">No leads found in this bucket</p>
                                <p className="text-xs text-slate-500 font-medium">Try adjusting your filters or search query</p>
                             </div>
                             <button onClick={() => setSearchQuery('')} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all">Clear Search</button>
                          </div>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-between">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{filteredCustomers.length}</span> entries
               </div>
               <div className="flex items-center gap-1.5">
                  <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Prev</button>
                  {[1, 2, 3].map(p => (
                    <button key={p} className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${p === 1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {p}
                    </button>
                  ))}
                  <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Next</button>
               </div>
            </div>
           </div>
          </div>
          )}

        {/* Add/Edit Lead Modal */}
        <AddLeadModal 
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
          onAdd={async (data) => {
             try {
                const customerData = {
                   ...data,
                   updatedAt: new Date().toISOString(),
                   sourceVault: selectedSource === 'nexus' ? 'direct' : selectedSource
                };
                await addDoc(collection(db, 'customers'), {
                   ...customerData,
                   createdAt: new Date().toISOString(),
                   docsSubmitted: false,
                   serviceStatus: 'Open',
                   serviceStage: 'Document Received',
                   status: 'Document Received'
                });
                setIsAddCustomerOpen(false);
             } catch (error) {
                console.error("Lead Creation Error:", error);
                alert(`Failed to save lead to Cloud: ${error.message}. Please check if Firestore is enabled.`);
             }
          }}
          pocs={pocs}
        />

        {/* Admin Settings Modal */}
        <AdminSettingsModal 
          isOpen={isAdminSettingsOpen}
          onClose={() => setIsAdminSettingsOpen(false)}
          pocs={pocs}
          onUpdate={async (newPocs) => {
             await setDoc(doc(db, 'settings', 'crm_config'), { pocs: newPocs });
             setPocs(newPocs);
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
