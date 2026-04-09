import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone, MessageCircle, Copy, Check, FileText, Search, User, ChevronDown, MessageSquare } from 'lucide-react';

import Sidebar from './crm/Sidebar';
import DashboardHeader from './crm/DashboardHeader';
import MetricSummary from './crm/MetricSummary';
import FilterBar from './crm/FilterBar';
import NestedServicesTable from './crm/NestedServicesTable';
import AddLeadModal from './crm/AddLeadModal';
import CampSection from './crm/CampSection';
import { addDoc } from 'firebase/firestore';

const WorkerDashboard = () => {
  const [selectedSource, setSelectedSource] = useState('sales');
  const [customers, setCustomers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [noteInputId, setNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [servicesSubMode, setServicesSubMode] = useState('active');
  const [visibleFilters, setVisibleFilters] = useState(['priority', 'acqPOC', 'serviceAcqPOC', 'stage', 'service']);
  
  const { logout } = useAuth();
  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin'; // Should be false here but keeping logic consistent
  
  const navigate = useNavigate();

  // Load Settings (POCs & Apartments)
  const [pocs, setPocs] = useState({ 
    acquisition: [], 
    serviceAcquisition: [], 
    service: [],
    apartments: [],
    pricing: {}
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'crm_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().pocs || { acquisition: [], serviceAcquisition: [], service: [], apartments: [], pricing: {} };
        if (!data.pricing) data.pricing = {};
        setPocs(data);
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
    preActive: serviceLeads.filter(c => !c.docsSubmitted && c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' && c.serviceStatus !== 'Retry' && c.serviceStatus !== 'Approved').length,
    active: serviceLeads.filter(c => c.docsSubmitted && c.serviceAcqPOC && c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' && c.serviceStatus !== 'Retry' && c.serviceStatus !== 'Approved').length,
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
    
    if (selectedSource === 'services') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;
       
        const isBlocked  = c.serviceStatus === 'Blocked';
        const isClosed   = c.serviceStatus === 'Closed';
        const isRetry    = c.serviceStatus === 'Retry';
        const isApproved = c.serviceStatus === 'Approved';
        const isPreActive = (!c.docsSubmitted || !c.serviceAcqPOC) && !isBlocked && !isClosed && !isRetry && !isApproved;
        const isActive = c.docsSubmitted && c.serviceAcqPOC && !isBlocked && !isClosed && !isRetry && !isApproved;

        if (servicesSubMode === 'pre-active' && !isPreActive) return false;
        if (servicesSubMode === 'active'     && !isActive)    return false;
        if (servicesSubMode === 'blocked'    && !isBlocked)   return false;
        if (servicesSubMode === 'closed'     && !isClosed)    return false;
        if (servicesSubMode === 'retry'      && !isRetry)     return false;
        if (servicesSubMode === 'approved'   && !isApproved)  return false;
    } else if (selectedSource === 'sales') {
        if (c.sourceVault && c.sourceVault !== 'sales') return false;
    } else {
        if (c.sourceVault !== selectedSource) return false;
    }
    
    const matchesPriority = !activeFilters.priority || c.priority === activeFilters.priority;
    const matchesStage = !activeFilters.stage || (c.status === activeFilters.stage || c.serviceStage === activeFilters.stage);
    const matchesService = !activeFilters.service || (c.serviceRequested === activeFilters.service || c.serviceType === activeFilters.service || c.service === activeFilters.service);
    const matchesAcqPOC = !activeFilters.acqPOC || c.acqPOC === activeFilters.acqPOC;
    const matchesServiceAcqPOC = !activeFilters.serviceAcqPOC || c.serviceAcqPOC === activeFilters.serviceAcqPOC;
    
    return matchesSearch && matchesPriority && matchesStage && matchesService && matchesAcqPOC && matchesServiceAcqPOC;
  });

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
            title={`Worker Portal / ${selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)}`}
            viewMode={selectedSource}
            onSearch={setSearchQuery}
            onNewLead={() => setIsAddCustomerOpen(true)}
          />
  
          <FilterBar 
            activeFilters={activeFilters}
            visibleFilters={visibleFilters}
            setVisibleFilters={setVisibleFilters}
            viewMode={selectedSource}
            onFilterChange={(key, val) => setActiveFilters({...activeFilters, [key]: val})}
            onReset={() => setActiveFilters({})}
            pocs={pocs}
          />
  
          <MetricSummary metrics={metrics} viewMode={selectedSource} />

          {selectedSource === 'camp' && (
             <CampSection isAdmin={isAdmin} pocs={pocs} />
          )}

          {selectedSource !== 'camp' && (
          <div className="px-8 pb-20">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                      <td className="w-14 px-6 py-5 align-middle"><input type="checkbox" disabled className="w-4 h-4 rounded-md border-slate-300" /></td>
                      {selectedSource === 'services' ? (
                        <>
                          <th className="px-6 py-5">SR ID</th>
                          <th className="px-6 py-5">Name</th>
                          <th className="px-6 py-5">Phone number</th>
                          <th className="px-6 py-5">Service</th>
                          {servicesSubMode === 'blocked' && <th className="px-6 py-5">Blocker POC</th>}
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-5">Name & ID </th>
                          <th className="px-6 py-5">Phone Number</th>
                          <th className="px-6 py-5 text-center">Priority</th>
                          <th className="px-6 py-5">Acq. POC</th>
                          <th className="px-6 py-5">S-Acq. POC</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {filteredCustomers.map((customer) => (
                      <React.Fragment key={customer.id}>
                        <tr className={`group transition-all duration-300 cursor-default ${expandedRows.has(customer.id) ? 'bg-[#f1f5f9]' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-6 py-6 ring-inset">
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
                          
                          {selectedSource === 'services' ? (
                            <>
                              <td className="px-6 py-6 font-bold text-slate-900">
                                 {customer.srId || `SRF${customer.id.substring(0,4).toUpperCase()}`}
                              </td>
                              <td className="px-6 py-6 font-bold text-slate-700">{customer.customerName}</td>
                              <td className="px-6 py-6 font-bold text-slate-700">{customer.phone}</td>
                              <td className="px-6 py-6 text-xs font-bold text-slate-500">{customer.serviceType || 'E-Khata'}</td>
                              {servicesSubMode === 'blocked' && <td className="px-6 py-6 text-center text-slate-400">-</td>}
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-6">
                                <div className="font-bold text-slate-900">{customer.customerName}</div>
                                <div className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5">UIDE{customer.id.substring(0, 4).toUpperCase()}</div>
                              </td>
                              <td className="px-6 py-6 font-bold text-slate-700">{customer.phone}</td>
                              <td className="px-6 py-6 text-center">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   customer.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                   customer.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                   'bg-slate-100 text-slate-500 border-slate-200'
                                 }`}>
                                   {customer.priority || 'Low'}
                                 </span>
                              </td>
                              <td className="px-6 py-6 text-xs font-black text-slate-500 uppercase">{customer.acqPOC || 'Unassigned'}</td>
                              <td className="px-6 py-6 text-xs font-black text-indigo-500 uppercase">{customer.serviceAcqPOC || 'Unassigned'}</td>
                            </>
                          )}
                        </tr>
                        {expandedRows.has(customer.id) && (
                          <tr className="bg-[#f8fafc]">
                            <td colSpan={10} className="px-10 py-12">
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
                const customerData = {
                   ...data,
                   updatedAt: new Date().toISOString(),
                   sourceVault: selectedSource === 'nexus' ? 'direct' : (selectedSource || 'sales')
                };
                
                // Set default amount
                const defaultAmount = pocs.pricing && data.serviceRequested ? (pocs.pricing[data.serviceRequested] || '') : '';
                
                await addDoc(collection(db, 'customers'), {
                   ...customerData,
                   amount: defaultAmount,
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
    </div>
  );
};

export default WorkerDashboard;
