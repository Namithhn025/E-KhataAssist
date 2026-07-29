import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, getDoc, query, where, updateDoc, doc, arrayUnion, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone, MessageCircle, Copy, Check, FileText, Search, User, ChevronDown, MessageSquare, Bell } from 'lucide-react';

import Sidebar from './crm/Sidebar';
import DashboardHeader from './crm/DashboardHeader';
import MetricSummary from './crm/MetricSummary';
import FilterBar from './crm/FilterBar';
import NestedServicesTable from './crm/NestedServicesTable';
import AddLeadModal from './crm/AddLeadModal';
import CampSection from './crm/CampSection';
import RemindersSection, { ReminderModal } from './crm/RemindersSection';
import { addDoc } from 'firebase/firestore';

const WorkerDashboard = () => {
  const [selectedSource, setSelectedSource] = useState('sales');
  const [customers, setCustomers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date Added');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [noteInputId, setNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [servicesSubMode, setServicesSubMode] = useState('active');
  const [visibleFilters, setVisibleFilters] = useState(['priority', 'acqPOC', 'opsSpecialist', 'docSource', 'serviceAcqPOC', 'stage', 'service']);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  
  const { user, logout } = useAuth();
  const [reminderCustomer, setReminderCustomer] = useState(null);

  const handleSaveReminder = async (data) => {
    try {
      await addDoc(collection(db, 'reminders'), {
        ...data,
        status: 'pending',
        createdBy: user?.uid || 'worker',
        createdByName: user?.displayName || user?.email || 'Worker',
        createdAt: Timestamp.now(),
        resolvedAt: null,
      });
      setReminderCustomer(null);
    } catch (e) {
      console.error('Create reminder error from worker dashboard:', e);
      alert('Failed to create reminder: ' + e.message);
    }
  };

  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin'; // Should be false here but keeping logic consistent
  
  const navigate = useNavigate();
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, selectedSource, servicesSubMode]);

  // Sync docsSubmitted visibility and active filter state
  useEffect(() => {
    if (selectedSource === 'services' && servicesSubMode === 'pre-active') {
      if (!visibleFilters.includes('docsSubmitted')) {
        setVisibleFilters(prev => [...prev, 'docsSubmitted']);
      }
    } else {
      if (visibleFilters.includes('docsSubmitted')) {
        setVisibleFilters(prev => prev.filter(f => f !== 'docsSubmitted'));
        if (activeFilters.hasOwnProperty('docsSubmitted')) {
          setActiveFilters(prev => {
            const next = { ...prev };
            delete next.docsSubmitted;
            return next;
          });
        }
      }
    }
  }, [selectedSource, servicesSubMode]);

  // Load Settings (POCs & Apartments)
  const [pocs, setPocs] = useState({ 
    acquisition: [], 
    serviceAcquisition: [], 
    service: [],
    apartments: [],
    pricing: {}
  });

  // Load settings once at mount — no live listener needed
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'crm_config'));
        if (snap.exists()) {
          const data = snap.data().pocs || { acquisition: [], serviceAcquisition: [], service: [], apartments: [], pricing: {} };
          if (!data.pricing) data.pricing = {};
          setPocs(data);
        }
      } catch (e) {
        console.error('Worker: Failed to load settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Load Customers
  useEffect(() => {
    let q = query(collection(db, 'customers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       console.error("Worker fetch failed:", error);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logout();
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

  const handleFieldUpdate = async (customerId, field, value) => {
     // Workers have restricted editing in NestedServicesTable (POCs/Service)
     // But they might need to update other fields like notes or status
    try {
      await updateDoc(doc(db, 'customers', customerId), { [field]: value });
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  const handleAddNote = async (customerId) => {
    if (!noteText.trim()) return;
    const newNote = {
      text: noteText,
      timestamp: new Date().toISOString(),
      author: 'Worker'
    };
    await updateDoc(doc(db, 'customers', customerId), {
      internalNotes: arrayUnion(newNote)
    });
    setNoteText('');
    setNoteInputId(null);
  };

  // Metrics (Mirror Admin)
  const serviceLeads = customers.filter(c => c.serviceType || c.serviceRequested || c.service);
  const metrics = {
    total:     customers.length,
    qualified: customers.filter(c => c.status === 'Approved').length,
    stale:     customers.filter(c => c.status === 'Rejected').length,
    followUp:  customers.filter(c => c.status === 'Follow Up').length,
    missed:    customers.filter(c => c.status === 'Missed').length,
    advance:   customers.filter(c => c.payment === 'Pending').length,
    totalSRs:  serviceLeads.length,
    preActive: serviceLeads.filter(c =>
      (!c.docsSubmitted || !c.docSource) &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    active: serviceLeads.filter(c =>
      c.docsSubmitted && c.docSource &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    deadlines: serviceLeads.filter(c =>
      c.docsSubmitted && c.serviceStage !== 'Application Submitted' &&
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
      c.apartment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedSource === 'services') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;
       
        const isBlocked  = c.serviceStatus === 'Blocked';
        const isClosed   = c.serviceStatus === 'Closed';
        const isRetry    = c.serviceStatus === 'Retry';
        const isApproved = c.serviceStatus === 'Approved';
        const isPreActive = (!c.docsSubmitted || !c.docSource) && !isBlocked && !isClosed && !isRetry && !isApproved;
        const isActive = c.docsSubmitted && c.docSource && !isBlocked && !isClosed && !isRetry && !isApproved;
        const isDeadlines = c.docsSubmitted && c.serviceStage !== 'Application Submitted' && !isBlocked && !isClosed && !isRetry && !isApproved;

        if (servicesSubMode === 'pre-active' && !isPreActive) return false;
        if (servicesSubMode === 'active'     && !isActive)    return false;
        if (servicesSubMode === 'deadlines'  && !isDeadlines) return false;
        if (servicesSubMode === 'blocked'    && !isBlocked)   return false;
        if (servicesSubMode === 'closed'     && !isClosed)    return false;
        if (servicesSubMode === 'retry'      && !isRetry)     return false;
        if (servicesSubMode === 'approved'   && !isApproved)  return false;
    } else if (selectedSource === 'deadlines') {
        const hasService = c.serviceType || c.serviceRequested || c.service;
        if (!hasService) return false;
        const isBlocked  = c.serviceStatus === 'Blocked';
        const isClosed   = c.serviceStatus === 'Closed';
        const isRetry    = c.serviceStatus === 'Retry';
        const isApproved = c.serviceStatus === 'Approved';
        const isDeadlines = c.docsSubmitted && c.serviceStage !== 'Application Submitted' && !isBlocked && !isClosed && !isRetry && !isApproved;
        if (!isDeadlines) return false;
    } else if (selectedSource === 'sales') {
        if (c.sourceVault && c.sourceVault !== 'sales') return false;
    } else {
        if (c.sourceVault !== selectedSource) return false;
    }
    
    const matchesPriority = !activeFilters.priority || c.priority === activeFilters.priority;
    const matchesStage = !activeFilters.stage || (c.serviceStage === activeFilters.stage);
    const matchesService = !activeFilters.service || (() => {
      const standardServices = ['Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)', 'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration'];
      const leadServices = c.serviceRequested ? c.serviceRequested.split(/,\s*/).map(s => s.trim()) : [];
      if (activeFilters.service === 'Others') {
        const hasCustomOrOthers = leadServices.some(s => s === 'Others' || !standardServices.includes(s));
        return hasCustomOrOthers || c.serviceType === 'Others' || c.service === 'Others';
      }
      return leadServices.includes(activeFilters.service) || c.serviceType === activeFilters.service || c.service === activeFilters.service;
    })();
    const matchesAcqPOC = !activeFilters.acqPOC || (activeFilters.acqPOC === 'Unassigned' ? !c.acqPOC : c.acqPOC === activeFilters.acqPOC);
    const matchesServiceAcqPOC = !activeFilters.serviceAcqPOC || (activeFilters.serviceAcqPOC === 'Unassigned' ? !c.serviceAcqPOC : c.serviceAcqPOC === activeFilters.serviceAcqPOC);
    const matchesApartment = !activeFilters.apartment || (c.apartment === activeFilters.apartment || c.society === activeFilters.apartment);
    const matchesSource = !activeFilters.source || c.sourceVault === activeFilters.source;
    const matchesDocsSubmitted = !activeFilters.docsSubmitted || (() => {
      if (activeFilters.docsSubmitted === 'Submitted') return c.docsSubmitted === true;
      if (activeFilters.docsSubmitted === 'Pending') return !c.docsSubmitted;
      return true;
    })();
    const matchesOpsSpecialist = !activeFilters.opsSpecialist || (
      activeFilters.opsSpecialist === 'Unassigned'
        ? (!c.epidAndEsignSpecialist && !c.ekycSpecialist && !c.addressSpecialist)
        : (c.epidAndEsignSpecialist === activeFilters.opsSpecialist || c.ekycSpecialist === activeFilters.opsSpecialist || c.addressSpecialist === activeFilters.opsSpecialist)
    );
    const matchesDocSource = !activeFilters.docSource || (
      activeFilters.docSource === 'Unassigned'
        ? !c.docSource
        : (c.docSource?.toLowerCase() === activeFilters.docSource.toLowerCase())
    );
    
    return matchesSearch && matchesPriority && matchesStage && matchesService && matchesAcqPOC && matchesServiceAcqPOC && matchesApartment && matchesSource && matchesDocsSubmitted && matchesOpsSpecialist && matchesDocSource;
  }).sort((a, b) => {
    if (sortBy === 'Deadline (Ascending)' || sortBy === 'Deadline (Descending)') {
      const getDaysLeft = (c) => {
        if (!c.docsSubmitted) return sortBy === 'Deadline (Ascending)' ? 99999 : -99999;
        const sList = (c.serviceRequested || c.serviceType || c.service || '').split(/,\s*/).filter(Boolean);
        let totalDays = 15;
        if (pocs.deadlines) {
          for (const s of sList) {
            if (pocs.deadlines[s]) { totalDays = parseInt(pocs.deadlines[s], 10) || 15; break; }
          }
        }
        const startDate = new Date(c.docsSubmittedDate || c.createdAt || Date.now());
        const elapsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return totalDays - elapsed;
      };
      const diff = getDaysLeft(a) - getDaysLeft(b);
      return sortBy === 'Deadline (Ascending)' ? diff : -diff;
    }
    if (sortBy === 'Priority (High to Low)') {
      const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
    }
    if (sortBy === 'Recently Updated') {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Sidebar 
          selectedSource={selectedSource} 
          setSelectedSource={setSelectedSource} 
          servicesSubMode={servicesSubMode}
          setServicesSubMode={setServicesSubMode}
          onLogout={handleLogout}
          userRole="worker"
        />
  
        <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto no-scrollbar">
          <DashboardHeader 
            title={
              selectedSource === 'reminders' ? 'Reminders' :
              `Worker Portal / ${selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)}`
            }
            viewMode={selectedSource}
            onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            onNewLead={() => setIsAddCustomerOpen(true)}
          />
  
          {selectedSource !== 'reminders' && (
            <FilterBar
              activeFilters={activeFilters}
              visibleFilters={visibleFilters}
              setVisibleFilters={setVisibleFilters}
              viewMode={selectedSource}
              onFilterChange={(key, val) => { setActiveFilters({...activeFilters, [key]: val}); setCurrentPage(1); }}
              onReset={() => { setActiveFilters({}); setCurrentPage(1); }}
              pocs={pocs}
              sortBy={sortBy}
              onSortChange={setSortBy}
              customers={customers}
            />
          )}
  
          {selectedSource !== 'reminders' && (
            <MetricSummary metrics={metrics} viewMode={selectedSource} />
          )}

          {selectedSource === 'camp' && (
             <CampSection isAdmin={isAdmin} pocs={pocs} customers={customers} />
          )}

          {/* ── REMINDERS SECTION ─── */}
          {selectedSource === 'reminders' && (
            <RemindersSection
              isAdmin={false}
              currentUser={null}
              customers={customers}
            />
          )}

          {selectedSource !== 'camp' && selectedSource !== 'reminders' && (
          <div className="px-8 pb-20">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                      <td className="w-14 px-6 py-5 align-middle"><input type="checkbox" disabled className="w-4 h-4 rounded-md border-slate-300" /></td>
                      {selectedSource === 'services' || selectedSource === 'deadlines' ? (
                        <>
                          <th className="px-6 py-5">SR ID</th>
                          <th className="px-6 py-5">Name</th>
                          <th className="px-6 py-5">Phone number</th>
                          <th className="px-6 py-5">Service</th>
                          {servicesSubMode === 'blocked' && <th className="px-6 py-5">Blocker POC</th>}
                          <th className="px-6 py-5 text-center">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-5">Name & ID </th>
                          <th className="px-6 py-5">Phone Number</th>
                          <th className="px-6 py-5 text-center">Priority</th>
                          <th className="px-6 py-5">Acq. POC</th>
                          <th className="px-6 py-5">S-Acq. POC</th>
                          <th className="px-6 py-5 text-center">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {paginatedCustomers.map((customer) => (
                      <React.Fragment key={customer.id}>
                        <tr className={`group transition-all duration-300 cursor-default ${expandedRows.has(customer.id) ? 'bg-[#f1f5f9]' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-4 py-3 ring-inset">
                             <div className="flex items-center gap-3">
                               <div 
                                 onClick={() => toggleRow(customer.id)}
                                 className={`w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer ${expandedRows.has(customer.id) ? 'bg-white shadow-sm ring-1 ring-slate-200 rotate-180' : ''}`}
                               >
                                  <ChevronDown size={16} />
                               </div>
                               <input type="checkbox" disabled className="w-4 h-4 rounded-md border-slate-300" />
                             </div>
                          </td>
                          
                          {selectedSource === 'services' || selectedSource === 'deadlines' ? (
                            <>
                              <td className="px-4 py-3 font-bold text-slate-900">
                                 {customer.srId || `SRF${customer.id.substring(0,4).toUpperCase()}`}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-700">{customer.customerName}</td>
                              <td className="px-4 py-3 font-bold text-slate-700">{customer.phone}</td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-500">{customer.serviceRequested || customer.serviceType || customer.service || 'N/A'}</td>
                              {servicesSubMode === 'blocked' && <td className="px-4 py-3 text-center text-slate-400">-</td>}
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReminderCustomer(customer);
                                  }}
                                  className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                  title="Add Reminder"
                                >
                                  <Bell size={16} />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-900">{customer.customerName}</div>
                                <div className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5">UIDE{customer.id.substring(0, 4).toUpperCase()}</div>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-700">{customer.phone}</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   customer.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                   customer.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                   'bg-slate-100 text-slate-500 border-slate-200'
                                 }`}>
                                   {customer.priority || 'Low'}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-black text-slate-500 uppercase">{customer.acqPOC || 'Unassigned'}</td>
                              <td className="px-4 py-3 text-xs font-black text-indigo-500 uppercase">{customer.serviceAcqPOC || 'Unassigned'}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReminderCustomer(customer);
                                  }}
                                  className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                  title="Add Reminder"
                                >
                                  <Bell size={16} />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                        {expandedRows.has(customer.id) && (
                          <tr className="bg-[#f8fafc]">
                            <td colSpan={10} className="px-6 py-8">
                              <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-2 duration-500">
                                 {/* Redundant Row Removed per User Request */}
                                 <div className="h-0.5 w-full bg-slate-50/50" />
  
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                       <div className="w-2 h-2 rounded bg-primary" /> Active Service Requests
                                    </h4>
                                     <NestedServicesTable 
                                       customer={customer} 
                                       onUpdate={(field, val) => handleFieldUpdate(customer.id, field, val)} 
                                       pocs={pocs}
                                       viewMode={selectedSource}
                                       subMode={servicesSubMode}
                                     />
                                  </div>
  
                                  <div className="space-y-4">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Administrative Logs & Timeline</h4>
                                     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[140px] flex flex-col gap-4">
                                        {/* Notes List */}
                                        {customer.internalNotes && customer.internalNotes.length > 0 ? (
                                           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                              {customer.internalNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((note, idx) => (
                                                 <div key={idx} className="flex gap-3 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User size={14} /></div>
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
                                           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-4">
                                              <p className="text-xs font-bold text-slate-400">No activity logs recorded yet.</p>
                                           </div>
                                        )}
                                        {/* Add Note Input */}
                                        {noteInputId === customer.id ? (
                                           <div className="flex flex-col gap-2">
                                              <textarea 
                                                 value={noteText}
                                                 onChange={(e) => setNoteText(e.target.value)}
                                                 placeholder="Type your internal note here..."
                                                 className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white outline-none text-xs font-medium min-h-[80px]"
                                                 autoFocus
                                              />
                                              <div className="flex justify-end gap-2">
                                                 <button onClick={() => { setNoteInputId(null); setNoteText(''); }} className="px-4 py-2 text-xs font-black text-slate-400 uppercase">Cancel</button>
                                                 <button onClick={() => handleAddNote(customer.id)} className="px-6 py-2 bg-slate-900 text-white text-xs font-black uppercase rounded-lg">Post Note</button>
                                              </div>
                                           </div>
                                        ) : (
                                           <div className="flex justify-center pt-2 border-t border-slate-50">
                                              <button onClick={() => setNoteInputId(customer.id)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                                                 Add Internal Note
                                              </button>
                                           </div>
                                        )}
                                     </div>
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
              
              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-between">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{paginatedCustomers.length}</span> of <span className="text-slate-900">{filteredCustomers.length}</span> entries
                 </div>
                 <div className="flex items-center gap-1.5">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button 
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                    >
                      Next
                    </button>
                 </div>
              </div>
            </div>
          </div>
          )}
        </div>
        
        {/* Add Lead Modal */}
        <AddLeadModal 
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
          onAdd={async (data) => {
             try {
                let totalAmount = 0;
                if (pocs.pricing && data.services && data.services.length > 0) {
                  data.services.forEach(service => {
                    if (pocs.pricing[service]) {
                      totalAmount += parseFloat(pocs.pricing[service]);
                    }
                  });
                }

                const customerData = {
                   ...data,
                   updatedAt: new Date().toISOString(),
                   sourceVault: selectedSource === 'nexus' ? 'direct' : (selectedSource || 'sales'),
                   amount: totalAmount || ''
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
                console.error("Worker Lead Creation Error:", error);
                alert(`Failed to save lead: ${error.message}`);
             }
          }}
          pocs={pocs}
        />

        {/* Quick Add Reminder Modal */}
        <ReminderModal
          isOpen={!!reminderCustomer}
          onClose={() => setReminderCustomer(null)}
          onSave={handleSaveReminder}
          customers={customers}
          prefilledCustomer={reminderCustomer}
        />
    </div>
  );
};

export default WorkerDashboard;
