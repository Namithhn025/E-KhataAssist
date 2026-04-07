import React, { useState } from 'react';
import { Phone, User, DollarSign, Clock, MessageSquare, AlertTriangle, CheckCircle, XCircle, Lock, RefreshCw, BadgeCheck, FileText, Globe } from 'lucide-react';

// Full lifecycle stages for a service
const SERVICE_STAGES = [
  'Document Received',
  'eKYC Pending',
  'eKYC Done',
  'Ready to eSign',
  'Application Submitted',
];

const CLOSING_STAGE = 'Application Submitted';

const stageColors = {
  'Document Received':     'bg-slate-100 text-slate-600 border-slate-200',
  'eKYC Pending':          'bg-yellow-50 text-yellow-700 border-yellow-200',
  'eKYC Done':             'bg-blue-50 text-blue-700 border-blue-200',
  'Ready to eSign':        'bg-purple-50 text-purple-700 border-purple-200',
  'Application Submitted': 'bg-green-100 text-green-800 border-green-200',
  'Blocked':               'bg-red-50 text-red-700 border-red-200',
};

const serviceOptions = [
  'Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)',
  'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration', 'Others'
];

// ─── Rejection Modal ────────────────────────────────────────────────────────
const RejectionModal = ({ open, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 text-red-500">Block & Tag Lead</h3>
            <p className="text-xs text-slate-400 font-medium">A blocker reason is mandatory for reference.</p>
          </div>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Why is this lead blocked? (e.g. Doc mismatch, No response)..."
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all text-sm font-medium min-h-[100px] resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) { alert('Please enter a reason to block this lead.'); return; }
              onConfirm(reason.trim());
              setReason('');
            }}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200"
          >
            Confirm Block
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stage Progress Bar ─────────────────────────────────────────────────────
const StageProgress = ({ stage }) => {
  const idx = SERVICE_STAGES.indexOf(stage);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      {SERVICE_STAGES.map((s, i) => (
        <div
          key={s}
          title={s}
          className={`h-1.5 flex-1 rounded-full transition-all ${i <= idx ? 'bg-primary' : 'bg-slate-100'}`}
        />
      ))}
    </div>
  );
};

const NestedServicesTable = ({ customer, onUpdate, pocs = {} }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin';

  const isBlocked = customer.serviceStatus === 'Blocked';
  const isClosed  = customer.serviceStatus === 'Closed';
  const isApproved = customer.serviceStatus === 'Approved';

  // Available stages: all standard ones + terminal ones
  const availableStages = [...SERVICE_STAGES, 'Blocked'];

  const handleStageChange = (newStage) => {
    if (isBlocked || isClosed || isApproved) return;

    if (newStage === 'Blocked') {
      setShowRejectionModal(true);
      return;
    }

    onUpdate('serviceStage', newStage);

    if (newStage === CLOSING_STAGE) {
      onUpdate('serviceStatus', 'Closed');
      onUpdate('closedDate', new Date().toISOString());
      alert('✅ Application Submitted! Lead has been moved to CLOSED.');
    }
  };

  const handleConfirmRejection = (reason) => {
    setShowRejectionModal(false);
    onUpdate('serviceStage', 'Blocked');
    onUpdate('serviceStatus', 'Blocked');
    onUpdate('blockerReason', reason);
    onUpdate('blockedDate', new Date().toISOString());
  };

  const calculateAge = (startDate) => {
    if (!startDate) return '0d';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return 'N/A';
    const diffTime = Math.abs(new Date() - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${Math.max(0, diffDays - 1)}d (${start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })})`;
  };

  return (
    <>
      <RejectionModal
        open={showRejectionModal}
        onConfirm={handleConfirmRejection}
        onCancel={() => setShowRejectionModal(false)}
      />

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl ring-1 ring-slate-900/5">
        
        {/* Banner Section */}
        {isBlocked && (
          <div className="px-8 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-600">
              <Lock size={16} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em]">Lead Status: Blocked</p>
                <p className="text-xs font-bold">{customer.blockerReason || 'Technical restriction'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Updated to Customer?</span>
                 <input 
                   type="checkbox" 
                   checked={customer.updatedToCustomer || false}
                   onChange={(e) => onUpdate('updatedToCustomer', e.target.checked)}
                   className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500" 
                 />
               </div>
               {isAdmin && (
                 <button onClick={() => onUpdate('serviceStatus', 'Open')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Revive Lead</button>
               )}
            </div>
          </div>
        )}

        {isClosed && !isApproved && (
          <div className="px-8 py-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-blue-700">
              <BadgeCheck size={20} className="animate-pulse" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em]">Verification Required</p>
                <p className="text-sm font-bold">Standard closing reached — Admin must approve for invoice</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { onUpdate('serviceStatus', 'Retry'); onUpdate('serviceStage', 'Document Received'); }}
                className="px-6 py-2.5 rounded-2xl bg-white border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all font-mono"
              >
                <RefreshCw size={12} className="inline mr-2" /> Retry Step
              </button>
              {isAdmin && (
                <button 
                  onClick={() => { onUpdate('serviceStatus', 'Approved'); onUpdate('approvedDate', new Date().toISOString()); }}
                  className="px-8 py-2.5 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  Confirm Approve
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1700px]">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200/50">
                <th className="px-8 py-5">Core Registry</th>
                <th className="px-8 py-5">Product/Service</th>
                <th className="px-8 py-5">Apartment/Site</th>
                <th className="px-8 py-5">Acq. POC</th>
                <th className="px-8 py-5">S-Acq. POC</th>
                <th className="px-8 py-5">Assigned Service Team</th>
                <th className="px-8 py-5 min-w-[240px]">Live Lifecycle Stage</th>
                <th className="px-8 py-5">Age (S-Date)</th>
                <th className="px-8 py-5 text-center">ePID (Mandatory)</th>
                <th className="px-8 py-5 text-center">Priority</th>
                <th className="px-8 py-5 text-center">Amount</th>
                <th className="px-8 py-5 text-center">Docs Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="group hover:bg-slate-50/50 transition-all">
                
                {/* Core Registry: Name & Phone */}
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-sm">{customer.customerName}</div>
                    <div className="text-xs font-bold text-slate-400 font-mono tracking-tighter">{customer.phone}</div>
                  </div>
                </td>

                {/* Product/Service */}
                <td className="px-8 py-6">
                  <select
                    value={customer.serviceRequested || customer.service || ''}
                    onChange={e => onUpdate('serviceRequested', e.target.value)}
                    className="bg-blue-50 border-none rounded-xl px-4 py-2.5 text-[10px] font-black text-blue-600 outline-none cursor-pointer hover:bg-blue-100 transition-all appearance-none uppercase"
                  >
                    <option value="">N/A</option>
                    {serviceOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </td>

                {/* Apartment/Site */}
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
                      <Globe size={12} className="text-slate-300" />
                      {customer.apartment || customer.society || 'Direct'}
                   </div>
                </td>

                {/* Acq. POC: Admin only editable */}
                <td className="px-8 py-6">
                   <select
                     disabled={!isAdmin}
                     value={customer.acqPOC || ''}
                     onChange={e => onUpdate('acqPOC', e.target.value)}
                     className="bg-slate-100 font-bold border-none rounded-xl px-4 py-2.5 text-[10px] text-slate-600 outline-none disabled:opacity-60 cursor-pointer appearance-none"
                   >
                     <option value="">Unassigned</option>
                     {pocs.acquisition?.map(name => <option key={name}>{name}</option>)}
                   </select>
                </td>

                {/* S-Acq. POC */}
                <td className="px-8 py-6">
                   <select
                     disabled={!isAdmin}
                     value={customer.serviceAcqPOC || ''}
                     onChange={e => onUpdate('serviceAcqPOC', e.target.value)}
                     className="bg-indigo-50 font-bold border-none rounded-xl px-4 py-2.5 text-[10px] text-indigo-500 outline-none disabled:opacity-60 cursor-pointer appearance-none"
                   >
                     <option value="">Unassigned</option>
                     {pocs.serviceAcquisition?.map(name => <option key={name}>{name}</option>)}
                   </select>
                </td>

                {/* Service POC (NEW): Admin only editable */}
                <td className="px-8 py-6">
                   <select
                     disabled={!isAdmin}
                     value={customer.servicePOC || ''}
                     onChange={e => onUpdate('servicePOC', e.target.value)}
                     className="bg-purple-50 font-black border-none rounded-xl px-4 py-2.5 text-[10px] text-purple-600 outline-none disabled:opacity-60 cursor-pointer appearance-none shadow-sm"
                   >
                     <option value="">AWAITING ASSIGNMENT</option>
                     {pocs.service?.map(name => <option key={name}>{name}</option>)}
                   </select>
                </td>

                {/* Lifecycle Stage */}
                <td className="px-8 py-6">
                   <div className="space-y-3">
                     <select
                       value={customer.serviceStatus === 'Blocked' ? 'Blocked' : (customer.serviceStage || 'Document Received')}
                       onChange={e => handleStageChange(e.target.value)}
                       disabled={isClosed || isApproved}
                       className={`w-full px-5 py-3 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest outline-none shadow-sm transition-all cursor-pointer ${stageColors[isBlocked ? 'Blocked' : (customer.serviceStage || 'Document Received')] || 'bg-slate-100'}`}
                     >
                        {availableStages.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     {!isBlocked && !isClosed && <StageProgress stage={customer.serviceStage || 'Document Received'} />}
                   </div>
                </td>

                {/* Age */}
                <td className="px-8 py-6">
                   <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <Clock size={12} className="text-slate-300" />
                      {calculateAge(customer.docsSubmittedDate || customer.createdAt)}
                   </div>
                </td>

                {/* ePID: 10 Digits, POC adds once, Admin edits */}
                <td className="px-8 py-6 text-center">
                   <div className="relative inline-block w-40">
                      <input 
                        type="text"
                        placeholder="N/A"
                        value={customer.ePID || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                          if (!isAdmin && customer.ePID) return; // Add-once logic
                          onUpdate('ePID', val);
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border font-mono text-[11px] font-black text-center outline-none transition-all ${
                          customer.ePID?.length === 10 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 focus:border-primary'
                        }`}
                      />
                      {(!isAdmin && customer.ePID) && <Lock size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />}
                   </div>
                </td>

                {/* Priority: Admin only */}
                <td className="px-8 py-6 text-center">
                   <button 
                     disabled={!isAdmin}
                     onClick={() => onUpdate('priority', customer.priority === 'High' ? 'Medium' : (customer.priority === 'Medium' ? 'Low' : 'High'))}
                     className={`px-4 py-2 rounded-3xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm disabled:opacity-50 ${
                        customer.priority === 'High' ? 'bg-red-500 text-white shadow-red-200' :
                        customer.priority === 'Medium' ? 'bg-yellow-500 text-white shadow-yellow-200' :
                        'bg-slate-200 text-slate-500'
                     }`}
                   >
                     {customer.priority || 'Low'}
                   </button>
                </td>

                {/* Amount: Admin Only */}
                <td className="px-8 py-6 text-center">
                   {isAdmin ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5">
                         <DollarSign size={12} className="text-emerald-500" />
                         <input 
                           type="text"
                           value={customer.amount || ''}
                           onChange={e => onUpdate('amount', e.target.value)}
                           className="bg-transparent text-[12px] font-black text-emerald-700 w-16 outline-none"
                         />
                      </div>
                   ) : <span className="text-[10px] font-bold text-slate-300 italic ring-1 ring-slate-100 px-3 py-1 rounded-full">PRIVATE</span>}
                </td>

                {/* Docs Status */}
                <td className="px-8 py-6 text-center">
                   <button 
                     onClick={() => {
                       const val = !customer.docsSubmitted;
                       onUpdate('docsSubmitted', val);
                       if(val) onUpdate('docsSubmittedDate', new Date().toISOString());
                     }}
                     className={`w-12 h-6 rounded-full relative transition-all ${customer.docsSubmitted ? 'bg-emerald-500' : 'bg-slate-200'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${customer.docsSubmitted ? 'left-7' : 'left-1'}`} />
                   </button>
                </td>

              </tr>

              {/* SECONDARY ROW: Notes & Special Challenges */}
              <tr>
                <td colSpan={12} className="px-8 py-4 bg-slate-50/30">
                   <div className="flex gap-10">
                      {/* Internal Notes / Call Log */}
                      <div className="flex-1 space-y-3">
                         <div className="flex items-center gap-2">
                            <MessageSquare size={12} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call Registry & Notes</span>
                         </div>
                         <div className="flex gap-4 items-center">
                            <select 
                              value={customer.callStatus || 'Not Connected'}
                              onChange={e => onUpdate('callStatus', e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
                            >
                               <option>Connected</option>
                               <option>Not Connected</option>
                               <option>Busy</option>
                               <option>Follow Up</option>
                            </select>
                            <input 
                              type="text"
                              value={customer.notes || ''}
                              onChange={e => onUpdate('notes', e.target.value)}
                              placeholder="Record lead details here..."
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 tracking-tight"
                            />
                         </div>
                      </div>

                      {/* Special Notes / Challenges */}
                      <div className="flex-1 space-y-3">
                         <div className="flex items-center gap-2">
                            <AlertTriangle size={12} className="text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Notes / Challenges</span>
                         </div>
                         <textarea 
                           value={customer.specialNotes || ''}
                           onChange={e => onUpdate('specialNotes', e.target.value)}
                           placeholder="Add technical blockers or specific challenges..."
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 tracking-tight h-10 resize-none no-scrollbar"
                         />
                      </div>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NestedServicesTable;
