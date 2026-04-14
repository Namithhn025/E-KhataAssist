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
  'Document Received': 'bg-slate-100 text-slate-600 border-slate-200',
  'eKYC Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'eKYC Done': 'bg-blue-50 text-blue-700 border-blue-200',
  'Ready to eSign': 'bg-purple-50 text-purple-700 border-purple-200',
  'Application Submitted': 'bg-green-100 text-green-800 border-green-200',
  'Blocked': 'bg-red-50 text-red-700 border-red-200',
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

// ─── Close Confirm Modal ─────────────────────────────────────────────────────
const CloseConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle size={22} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Close This Lead?</h3>
            <p className="text-xs text-slate-400 font-medium">Application Submitted — this will move the lead to <span className="font-black text-blue-600">Closed</span> and queue it for admin approval.</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl px-5 py-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-700">⚠ Once closed, this lead will no longer appear in the active pipeline. Admin will review and approve for invoicing.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            ✓ Confirm Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Active Confirm Modal ───────────────────────────────────────────────────
const ActiveConfirmModal = ({ open, onConfirm, onCancel, customerName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
            <CheckCircle size={22} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Move to Active?</h3>
            <p className="text-xs text-slate-400 font-medium">Documents received & S-Acq POC assigned — <span className="font-black text-slate-700">{customerName}</span> will move to the <span className="font-black text-green-600">Active</span> pipeline.</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl px-5 py-4 border border-green-100 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs font-bold text-green-700">Documents have been confirmed as received</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs font-bold text-green-700">Service Acquisition POC is assigned</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 transition-all shadow-lg shadow-green-200"
          >
            ✓ Move to Active
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Retry Confirm Modal ─────────────────────────────────────────────────────
const RetryConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <RefreshCw size={22} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Retry This Step?</h3>
            <p className="text-xs text-slate-400 font-medium">This will move the lead back to <span className="font-black text-blue-600">Document Received</span> stage for a restart.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
          >
            ✓ Confirm Retry
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Approve Confirm Modal ───────────────────────────────────────────────────
const ApproveConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <BadgeCheck size={22} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-emerald-900">Approve for Invoice?</h3>
            <p className="text-xs text-emerald-600 font-medium tracking-tight">Final verification complete. This will move the lead to <span className="font-black text-emerald-700">Approved</span> and generate an invoice entry.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            ✓ Approved
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

const NestedServicesTable = ({ customer, onUpdate, pocs = {}, viewMode, subMode }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pendingPOC, setPendingPOC] = useState(null);
  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin';
  const canApprove = isAdmin; // Restricted to admin as per flow request

  const isLocked = viewMode === 'sales' || viewMode === 'nexus';
  const isBlocked = customer.serviceStatus === 'Blocked';
  const isClosed = customer.serviceStatus === 'Closed';
  const isApproved = customer.serviceStatus === 'Approved';
  const showAmount = viewMode === 'invoices';

  // Available stages: all standard ones + terminal ones
  // Available stages: standard progress stages + Blocked
  const availableStages = [...SERVICE_STAGES, 'Blocked'];

  const handleStageChange = (newStage) => {
    if (isBlocked || isClosed || isApproved || isLocked) return;
    
    // Workers CAN move service stages, but only Admins can revive/delete (handled elsewhere)
    // Removed the hard restriction here to allow worker progress

    if (newStage === 'Blocked') {
      setShowRejectionModal(true);
      return;
    }

    // Intercept closing stage — show confirmation BEFORE committing
    if (newStage === CLOSING_STAGE) {
      setShowCloseModal(true);
      return;
    }

    onUpdate('serviceStage', newStage);
  };

  const handleServiceChange = (newService) => {
    if (isLocked) return;
    if (newService === 'OTHER_CUSTOM') {
      onUpdate('serviceRequested', ''); // Clear to let user type
      return;
    }
    onUpdate('serviceRequested', newService);
    // Auto-fill amount based on pricing settings
    if (pocs.pricing && pocs.pricing[newService]) {
      onUpdate('amount', pocs.pricing[newService]);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    onUpdate('serviceStage', CLOSING_STAGE);
    onUpdate('serviceStatus', 'Closed');
    onUpdate('closedDate', new Date().toISOString());
  };

  const handleConfirmActive = () => {
    setShowActiveModal(false);
    onUpdate('docsSubmitted', true);
    onUpdate('docsSubmittedDate', new Date().toISOString());
    // Also save the pending POC if the modal was triggered by a POC change
    if (pendingPOC !== null) {
      onUpdate('serviceAcqPOC', pendingPOC);
      setPendingPOC(null);
    }
  };

  const handleConfirmRetry = () => {
    setShowRetryModal(false);
    onUpdate('serviceStatus', 'Retry');
    onUpdate('serviceStage', 'Document Received');
  };

  const handleConfirmApprove = () => {
    setShowApproveModal(false);
    onUpdate('serviceStatus', 'Approved');
    onUpdate('approvedDate', new Date().toISOString());
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
      <CloseConfirmModal
        open={showCloseModal}
        onConfirm={handleConfirmClose}
        onCancel={() => setShowCloseModal(false)}
      />
      <ActiveConfirmModal
        open={showActiveModal}
        onConfirm={handleConfirmActive}
        onCancel={() => setShowActiveModal(false)}
        customerName={customer.customerName}
      />
      <RetryConfirmModal
        open={showRetryModal}
        onConfirm={handleConfirmRetry}
        onCancel={() => setShowRetryModal(false)}
      />
      <ApproveConfirmModal
        open={showApproveModal}
        onConfirm={handleConfirmApprove}
        onCancel={() => setShowApproveModal(false)}
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
                  disabled={isLocked}
                  checked={customer.updatedToCustomer || false}
                  onChange={(e) => onUpdate('updatedToCustomer', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500"
                />
              </div>
              {isAdmin && !isLocked && (
                <button onClick={() => onUpdate('serviceStatus', 'Open')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Revive Lead</button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1700px]">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200/50 text-center">
                <th className="px-6 py-4 text-left">Core Registry</th>
                <th className="px-6 py-4">Product/Service</th>
                <th className="px-6 py-4">Apartment/Site</th>
                <th className="px-6 py-4">Acq. POC</th>
                <th className="px-6 py-4">S-Acq. POC</th>
                <th className="px-6 py-4">EC</th>
                <th className="px-6 py-4 min-w-[220px]">Live Lifecycle Stage</th>
                <th className="px-6 py-4">Age (S-Date)</th>
                <th className="px-6 py-4">ePID</th>
                <th className="px-6 py-4">Priority</th>
                {showAmount && <th className="px-6 py-4">Amount</th>}
                <th className="px-6 py-4">Docs Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="group hover:bg-slate-50/50 transition-all">

                {/* Core Registry: Name & Phone */}
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-[13px]">{customer.customerName}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{customer.phone}</div>
                  </div>
                </td>

                {/* Product/Service */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-1 mb-0.5">
                       {(customer.serviceRequested || '').split(', ').map((s, i) => (
                         <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-wider border border-blue-100">
                           {s}
                         </span>
                       ))}
                    </div>
                    {isAdmin && !isLocked && (
                      <div className="flex flex-col gap-1.5">
                         <select
                           value=""
                           onChange={e => {
                             const val = e.target.value;
                             if (!val) return;
                             if (val === 'OTHER_CUSTOM') {
                               onUpdate('serviceRequested', ''); 
                               return;
                             }
                             const current = (customer.serviceRequested || '').split(', ').filter(Boolean);
                             const next = current.includes(val) ? current.filter(x => x !== val) : [...current, val];
                             onUpdate('serviceRequested', next.join(', '));
                             
                             // Calculate sum of prices for all selected services
                             let totalAmount = 0;
                             if (pocs.pricing) {
                               next.forEach(s => {
                                 if (pocs.pricing[s]) {
                                   totalAmount += parseFloat(pocs.pricing[s]);
                                 }
                               });
                             }
                             onUpdate('amount', totalAmount || '');
                           }}
                           className="bg-slate-50 border-none rounded-lg px-3 py-1.5 text-[8px] font-black text-slate-500 outline-none cursor-pointer hover:bg-slate-100 transition-all appearance-none uppercase"
                         >
                           <option value="">+ Add/Remove Service</option>
                           {serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           <option value="OTHER_CUSTOM" className="text-primary font-bold">+ Custom Entry</option>
                         </select>
                         
                         {(!serviceOptions.some(opt => (customer.serviceRequested || '').includes(opt)) && customer.serviceRequested) || (customer.serviceRequested === '') ? (
                           <input
                             type="text"
                             placeholder="Type custom service..."
                             value={customer.serviceRequested}
                             onChange={(e) => onUpdate('serviceRequested', e.target.value)}
                             className="px-2 py-1 bg-white border border-blue-100 rounded-lg text-[9px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/20"
                           />
                         ) : null}
                      </div>
                    )}
                  </div>
                </td>

                {/* Apartment/Site */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">
                    <Globe size={11} className="text-slate-300" />
                    {customer.apartment || customer.society || 'Direct'}
                  </div>
                </td>

                {/* Acq. POC */}
                <td className="px-6 py-4 text-center">
                  <select
                    disabled={!isAdmin || isLocked}
                    value={customer.acqPOC || ''}
                    onChange={e => onUpdate('acqPOC', e.target.value)}
                    className={`bg-slate-100 font-bold border-none rounded-lg px-3 py-1.5 text-[9px] text-slate-600 outline-none disabled:opacity-60 transition-all ${isLocked ? 'cursor-default' : 'cursor-pointer'} appearance-none mx-auto`}
                  >
                    <option value="">Unassigned</option>
                    {pocs.acquisition?.map(name => <option key={name}>{name}</option>)}
                  </select>
                </td>

                {/* S-Acq. POC */}
                <td className="px-6 py-4 text-center">
                  <select
                    disabled={!isAdmin || isLocked}
                    value={customer.serviceAcqPOC || ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val && customer.docsSubmitted) {
                        setPendingPOC(val);
                        setShowActiveModal(true);
                      } else {
                        onUpdate('serviceAcqPOC', val);
                      }
                    }}
                    className={`bg-indigo-50 font-bold border-none rounded-lg px-3 py-1.5 text-[9px] text-indigo-500 outline-none disabled:opacity-60 transition-all ${isLocked ? 'cursor-default' : 'cursor-pointer'} appearance-none mx-auto`}
                  >
                    <option value="">Unassigned</option>
                    {pocs.serviceAcquisition?.map(name => <option key={name}>{name}</option>)}
                  </select>
                </td>

                {/* EC Column - Editable by both Admin and Worker */}
                <td className="px-6 py-4 text-center">
                   <input
                     type="text"
                     placeholder="EC No..."
                     value={customer.ec || ''}
                     onChange={e => onUpdate('ec', e.target.value)}
                     disabled={isLocked}
                     className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-700 text-center outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                   />
                </td>



                {/* Lifecycle Stage */}
                <td className="px-6 py-4">
                    <div className="space-y-2">
                      <select
                        value={customer.serviceStatus === 'Blocked' ? 'Blocked' : (customer.serviceStage || 'Document Received')}
                        onChange={e => handleStageChange(e.target.value)}
                        disabled={isClosed || isApproved || isBlocked || isLocked}
                        className={`w-full px-4 py-2.5 rounded-xl border-none text-[9px] font-black uppercase tracking-widest outline-none shadow-sm transition-all ${isLocked ? 'cursor-default bg-slate-50' : 'cursor-pointer'} ${stageColors[isBlocked ? 'Blocked' : (customer.serviceStage || 'Document Received')] || 'bg-slate-100'}`}
                      >
                        <option value="Blocked" disabled hidden>Blocked</option>
                        {availableStages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      
                      {subMode === 'closed' && isClosed && !isApproved && (
                         <div className="flex flex-col gap-1.5 pt-1 animate-in slide-in-from-top-2 duration-300">
                            {canApprove && (
                               <button 
                                 onClick={() => setShowApproveModal(true)}
                                 className="w-full py-2 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
                               >
                                 <BadgeCheck size={11} /> Confirm Approve
                               </button>
                            )}
                            <button 
                              onClick={() => setShowRetryModal(true)}
                              className="w-full py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw size={11} /> Retry Step
                            </button>
                         </div>
                      )}

                      {!isBlocked && !isClosed && <StageProgress stage={customer.serviceStage || 'Document Received'} />}
                    </div>
                </td>

                {/* Age */}
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Clock size={11} className="text-slate-300" />
                    {calculateAge(customer.docsSubmittedDate || customer.createdAt)}
                  </div>
                </td>

                {/* ePID */}
                <td className="px-6 py-4 text-center">
                  <div className="relative inline-block w-32">
                    <input
                      type="text"
                      placeholder="N/A"
                      value={customer.ePID || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                        if (isLocked) return;
                        // EPID can only be changed once by worker
                        if (!isAdmin && customer.ePID) return;
                        onUpdate('ePID', val);
                      }}
                      disabled={isLocked || (!isAdmin && !!customer.ePID)}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-[10px] font-black text-center outline-none transition-all ${customer.ePID?.length === 10 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 focus:border-primary'
                        }`}
                    />
                    {(!isAdmin && !!customer.ePID) && <Lock size={9} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />}
                  </div>
                </td>

                {/* Priority */}
                <td className="px-6 py-4 text-center">
                  <button
                    disabled={isLocked}
                    onClick={() => onUpdate('priority', customer.priority === 'High' ? 'Medium' : (customer.priority === 'Medium' ? 'Low' : 'High'))}
                    className={`px-3 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-[0.15em] shadow-sm disabled:opacity-50 transition-all ${
                        customer.priority === 'High' ? 'bg-red-500 text-white shadow-red-200' :
                        customer.priority === 'Medium' ? 'bg-yellow-500 text-white shadow-yellow-200' :
                          'bg-slate-200 text-slate-400'
                      }`}
                  >
                    {customer.priority || 'Low'}
                  </button>
                </td>

                {/* Amount */}
                {showAmount && (
                  <td className="px-6 py-4 text-center">
                    {isAdmin ? (
                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-2 mx-auto w-fit">
                        <DollarSign size={11} className="text-emerald-500" />
                        <input
                          disabled={isLocked}
                          type="text"
                          value={customer.amount || ''}
                          onChange={e => onUpdate('amount', e.target.value)}
                          className={`bg-transparent text-[11px] font-black text-emerald-700 w-12 outline-none ${isLocked ? 'cursor-default' : ''}`}
                        />
                      </div>
                    ) : <span className="text-[9px] font-bold text-slate-300 italic ring-1 ring-slate-100 px-2 py-0.5 rounded-full">PRIVATE</span>}
                  </td>
                )}

                {/* Docs Status */}
                <td className="px-6 py-4 text-center">
                  <button
                    disabled={isLocked}
                    onClick={() => {
                      const val = !customer.docsSubmitted;
                      if (val && customer.serviceAcqPOC) {
                        setShowActiveModal(true);
                      } else {
                        onUpdate('docsSubmitted', val);
                        if (val) onUpdate('docsSubmittedDate', new Date().toISOString());
                      }
                    }}
                    className={`w-10 h-5 rounded-full relative transition-all mx-auto ${customer.docsSubmitted ? 'bg-emerald-500' : 'bg-slate-200'} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all ${customer.docsSubmitted ? 'left-5.5' : 'left-0.5'}`} />
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
                          disabled={isLocked}
                          value={customer.callStatus || 'Not Connected'}
                          onChange={e => onUpdate('callStatus', e.target.value)}
                          className={`bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-700 outline-none transition-all ${isLocked ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                        >
                          <option>Connected</option>
                          <option>Not Connected</option>
                          <option>Busy</option>
                          <option>Follow Up</option>
                        </select>
                        <input
                          disabled={isLocked}
                          type="text"
                          value={customer.notes || ''}
                          onChange={e => onUpdate('notes', e.target.value)}
                          placeholder={isLocked ? "View only mode" : "Record lead details here..."}
                          className={`flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 tracking-tight transition-all ${isLocked ? 'opacity-70' : ''}`}
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
                        disabled={isLocked}
                        value={customer.specialNotes || ''}
                        onChange={e => onUpdate('specialNotes', e.target.value)}
                        placeholder={isLocked ? "View only mode" : "Add technical blockers or specific challenges..."}
                        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 tracking-tight h-10 resize-none no-scrollbar transition-all ${isLocked ? 'opacity-70' : ''}`}
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
