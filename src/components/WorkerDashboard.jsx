import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, MessageCircle, BookOpen, Copy, Check } from 'lucide-react';

import Sidebar from './crm/Sidebar';
import DashboardHeader from './crm/DashboardHeader';
import NestedServicesTable from './crm/NestedServicesTable';
import { ChevronDown, MessageSquare } from 'lucide-react';

const WorkerDashboard = () => {
  const [selectedSource, setSelectedSource] = useState('services');
  const [servicesSubMode, setServicesSubMode] = useState('pre-active');
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [copyFeedback, setCopyFeedback] = useState(null);
  
  const navigate = useNavigate();

  // Load Customers
  useEffect(() => {
    // Workers see EVERYTHING unless they explicitly filter
    const q = collection(db, 'customers');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       console.error("CRITICAL: Worker Firestore fetch failed:", error);
       if (error.code === 'permission-denied') {
          console.warn("Worker access denied. Check your Firestore security rules.");
       } else if (error.code === 'not-found' || error.message.includes('not been initialized')) {
          console.error("Cloud Firestore not enabled for project e-khataassist.");
       }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_role');
    navigate('/login');
  };

  const handleFieldUpdate = async (id, field, value) => {
    try {
      await updateDoc(doc(db, 'customers', id), { [field]: value });
    } catch (e) {
      console.error("Worker update failed:", e);
    }
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

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !searchQuery || 
      c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.ePID?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedSource === 'services') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;

       // Terminal states
       const isBlocked  = c.serviceStatus === 'Blocked';
       const isClosed   = c.serviceStatus === 'Closed';
       const isRetry    = c.serviceStatus === 'Retry';
       const isApproved = c.serviceStatus === 'Approved';

       const isPreActive = !c.docsSubmitted && !isBlocked && !isClosed && !isRetry && !isApproved;
       const isActive    = c.docsSubmitted  && !isBlocked && !isClosed && !isRetry && !isApproved;

       if (servicesSubMode === 'pre-active' && !isPreActive) return false;
       if (servicesSubMode === 'active'     && !isActive)    return false;
       if (servicesSubMode === 'blocked'    && !isBlocked)   return false;
       if (servicesSubMode === 'closed'     && !isClosed)    return false;
       if (servicesSubMode === 'retry'      && !isRetry)     return false;
       // Workers never see 'approved'
       if (servicesSubMode === 'approved') return false;
       return matchesSearch;
    } else {
       const matchesSource = !selectedSource || selectedSource === 'nexus' || c.sourceVault === selectedSource;
       return matchesSearch && matchesSource;
    }
  });

  const statusOptions = [
    'Document Received', 'eKYC Pending', 'eKYC Done', 
    'Ready to eSign', 'Application Submitted', 'Approved', 'Rejected'
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <Sidebar 
        selectedSource={selectedSource} 
        setSelectedSource={setSelectedSource} 
        servicesSubMode={servicesSubMode}
        setServicesSubMode={setServicesSubMode}
        onLogout={handleLogout}
        userRole="worker"
      />

      {/* Main Content - Scrollable Right */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <DashboardHeader 
          title={`Worker Portal (${filteredCustomers.length})`}
          onSearch={setSearchQuery}
          onBulkUpload={() => alert('Restricted for workers')}
          onNewLead={() => alert('Restricted for workers')}
        />

        {/* Enhanced Data Table */}
        <div className="px-8 py-10">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                    <td className="w-14 px-6 py-5"><input type="checkbox" disabled className="w-4 h-4 rounded-md border-slate-300" /></td>
                    <th className="px-6 py-5">Customer Details</th>
                    <th className="px-6 py-5">Phone Number</th>
                    <th className="px-6 py-5">Current Status</th>
                    <th className="px-6 py-5 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <tr className={`group transition-all duration-300 hover:bg-slate-50/50 cursor-default ${expandedRows.has(customer.id) ? 'bg-slate-50' : ''}`}>
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
                        <td className="px-6 py-6 transition-all">
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
                           <select 
                             value={customer.status || ''} 
                             onChange={(e) => handleFieldUpdate(customer.id, 'status', e.target.value)}
                             className="bg-slate-50 border border-slate-100 font-bold hover:border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none focus:ring-4 focus:ring-slate-100 min-w-32 transition-all cursor-pointer"
                           >
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                              </div>
                              <div className="flex gap-2 text-slate-400">
                                 <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:text-primary transition-colors cursor-pointer"><Phone size={14} /></div>
                                 <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:text-primary transition-colors cursor-pointer"><MessageSquare size={14} /></div>
                              </div>
                           </div>
                        </td>
                      </tr>
                      {expandedRows.has(customer.id) && (
                        <tr className="bg-[#f8fafc]">
                          <td colSpan={5} className="px-10 py-12">
                             <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-2 duration-500">
                                {/* Advanced Services Table */}
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                     <div className="w-2 h-2 rounded bg-primary" /> Active Service Requests
                                  </h4>
                                  <NestedServicesTable 
                                    customer={customer} 
                                    onUpdate={(field, val) => handleFieldUpdate(customer.id, field, val)} 
                                  />
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                       <td colSpan="5" className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                              <BookOpen size={32} className="text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assigned leads in {selectedSource}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Try switching to 'Nexus' to see all leads</p>
                          </div>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
