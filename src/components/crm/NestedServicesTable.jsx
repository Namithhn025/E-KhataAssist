import React, { useState } from 'react';
import { Phone, User, DollarSign, Clock, MessageSquare, AlertTriangle, CheckCircle, XCircle, Lock, RefreshCw, BadgeCheck } from 'lucide-react';

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
  'Rejected':              'bg-red-50 text-red-700 border-red-200',
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
            <h3 className="text-lg font-black text-slate-900">Reject & Block Lead</h3>
            <p className="text-xs text-slate-400 font-medium">A reason is required to move this lead to Blocked.</p>
          </div>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter reason for rejection (mandatory)..."
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

// ─── Main Component ─────────────────────────────────────────────────────────
const NestedServicesTable = ({ customer, onUpdate }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [pendingRejectStage, setPendingRejectStage] = useState(null);
  const userRole = localStorage.getItem('crm_role') || 'worker';

  const currentStage = customer.serviceStage || 'Document Received';
  const isBlocked = customer.serviceStatus === 'Blocked';
  const isClosed  = customer.serviceStatus === 'Closed';

  // Get the available stages: all SERVICE_STAGES + Rejected
  const availableStages = [...SERVICE_STAGES, 'Rejected'];

  const handleStageChange = (newStage) => {
    if (isBlocked || isClosed) return; // lock if already terminal

    if (newStage === 'Rejected') {
      // Requires a reason — open modal
      setPendingRejectStage(newStage);
      setShowRejectionModal(true);
      return;
    }

    if (!onUpdate) return;
    onUpdate('serviceStage', newStage);

    if (newStage === CLOSING_STAGE) {
      // Auto-close the lead
      onUpdate('serviceStatus', 'Closed');
      onUpdate('closedDate', new Date().toISOString());
      alert('✅ Application Submitted! Lead has been moved to CLOSED.');
    }
  };

  const handleConfirmRejection = (reason) => {
    setShowRejectionModal(false);
    if (!onUpdate) return;
    onUpdate('serviceStage', 'Rejected');
    onUpdate('serviceStatus', 'Blocked');
    onUpdate('rejectionReason', reason);
    onUpdate('blockedDate', new Date().toISOString());
  };

  const handleDocsSubmit = () => {
    if (!onUpdate) return;
    const newVal = !customer.docsSubmitted;
    onUpdate('docsSubmitted', newVal);
    if (newVal) {
      onUpdate('docsSubmittedDate', new Date().toISOString());
      alert('✅ Docs Submitted! Lead is now moving to ACTIVE.');
    }
  };

  const calculateAge = (startDate) => {
    if (!startDate) return 'Not started';
    const diffTime = Math.abs(new Date() - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${Math.max(0, diffDays - 1)}d`;
  };

  return (
    <>
      <RejectionModal
        open={showRejectionModal}
        onConfirm={handleConfirmRejection}
        onCancel={() => setShowRejectionModal(false)}
      />

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Status Banner for terminal states */}
        {isBlocked && (
          <div className="px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-red-50 text-red-600 border-b border-red-100">
            <Lock size={12} />
            BLOCKED — {customer.rejectionReason || 'No reason provided'}
          </div>
        )}

        {customer.serviceStatus === 'Approved' && (
          <div className="px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 text-emerald-700 border-b border-emerald-100">
            <BadgeCheck size={14} />
            APPROVED — Moved to Invoice
          </div>
        )}

        {customer.serviceStatus === 'Retry' && (
          <div className="px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-orange-50 text-orange-600 border-b border-orange-100">
            <RefreshCw size={12} />
            RETRY — Re-processing from Document Received
          </div>
        )}

        {/* Closed decision banner — Approve or Retry */}
        {isClosed && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle size={16} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Application Submitted — Action Required</p>
                <p className="text-[10px] font-medium text-blue-500">Choose next step for this lead</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Retry — both Admin and Worker can trigger */}
              <button
                onClick={() => {
                  if (!onUpdate) return;
                  onUpdate('serviceStatus', 'Retry');
                  onUpdate('serviceStage', 'Document Received');
                  onUpdate('retryDate', new Date().toISOString());
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-orange-200"
              >
                <RefreshCw size={12} /> Retry
              </button>
              {/* Approve — Admin only */}
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    if (!onUpdate) return;
                    onUpdate('serviceStatus', 'Approved');
                    onUpdate('approvedDate', new Date().toISOString());
                    alert('✅ Lead Approved! Moving to Invoice.');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-200"
                >
                  <BadgeCheck size={12} /> Approve → Invoice
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Name & Phone</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Society</th>
                <th className="px-6 py-4">Acq. POC</th>
                <th className="px-6 py-4 min-w-[220px]">Service Stage</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Docs Submitted</th>
                <th className="px-6 py-4">Call Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50/20 transition-colors">

                {/* Name & Phone */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs">
                      <User size={10} className="text-primary shrink-0" />
                      {customer.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Phone size={10} className="shrink-0" />
                      {customer.phone}
                    </div>
                  </div>
                </td>

                {/* Service */}
                <td className="px-6 py-5">
                  <select
                    value={customer.serviceRequested || customer.service || ''}
                    onChange={e => onUpdate && onUpdate('serviceRequested', e.target.value)}
                    disabled={isClosed || isBlocked}
                    className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[10px] font-black text-primary outline-none cursor-pointer hover:bg-blue-100 transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Select Service</option>
                    {serviceOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </td>

                {/* Society */}
                <td className="px-6 py-5 text-[11px] font-bold text-slate-600 italic">
                  {customer.society || 'N/A'}
                </td>

                {/* Acq POC */}
                <td className="px-6 py-5">
                  <select
                    value={customer.acqPOC || ''}
                    onChange={e => onUpdate && onUpdate('acqPOC', e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Select POC</option>
                    <option>Rakshith</option>
                    <option>Ajay</option>
                  </select>
                </td>

                {/* Service Stage — the key column */}
                <td className="px-6 py-5">
                  <div className="space-y-2 min-w-[200px]">
                    {/* Stage Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        value={currentStage}
                        onChange={e => handleStageChange(e.target.value)}
                        disabled={isClosed || isBlocked}
                        className={`flex-1 px-3 py-2 rounded-xl border text-[10px] font-black outline-none cursor-pointer appearance-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${stageColors[currentStage] || 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        {availableStages.map(s => (
                          <option key={s} value={s}
                            disabled={s === 'Rejected' && (isClosed || isBlocked)}
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                      {isClosed && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                      {isBlocked && <XCircle size={14} className="text-red-500 shrink-0" />}
                    </div>
                    {/* Progress bar (only for non-terminal states) */}
                    {!isClosed && !isBlocked && <StageProgress stage={currentStage} />}
                  </div>
                </td>

                {/* Age */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1 text-[10px] font-black text-slate-700">
                    <Clock size={10} />
                    {calculateAge(customer.docsSubmittedDate || customer.createdAt)}
                  </div>
                  {customer.closedDate && (
                    <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                      Closed: {new Date(customer.closedDate).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </td>

                {/* Amount — Admin Only */}
                <td className="px-6 py-5">
                  {userRole === 'admin' ? (
                    <div className="flex items-center gap-1 bg-green-50/50 border border-green-100 rounded-xl px-3 py-2">
                      <DollarSign size={10} className="text-green-600 shrink-0" />
                      <input
                        type="text"
                        placeholder="0.00"
                        value={customer.amount || ''}
                        onChange={e => onUpdate && onUpdate('amount', e.target.value)}
                        className="bg-transparent text-[10px] font-black text-green-700 w-16 outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic">–</span>
                  )}
                </td>

                {/* Priority */}
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <div
                      onClick={() => onUpdate && onUpdate('priority', customer.priority === 'High' ? 'Low' : 'High')}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${customer.priority === 'High' ? 'bg-orange-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${customer.priority === 'High' ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                </td>

                {/* Docs Submitted — only interactive in Pre-active */}
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <div
                      onClick={handleDocsSubmit}
                      title={customer.docsSubmitted ? 'Docs already submitted' : 'Toggle to submit docs & move to Active'}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${customer.docsSubmitted ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${customer.docsSubmitted ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                </td>

                {/* Call Status */}
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2 min-w-[130px]">
                    <select
                      value={customer.callStatus || 'Not Connected'}
                      onChange={e => onUpdate && onUpdate('callStatus', e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[9px] font-bold text-slate-600 outline-none cursor-pointer appearance-none"
                    >
                      <option>Connected</option>
                      <option>Not Connected</option>
                    </select>
                    {customer.callStatus === 'Connected' && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={customer.callNote || ''}
                          onChange={e => onUpdate && onUpdate('callNote', e.target.value)}
                          className="w-full text-[9px] bg-white border border-slate-100 rounded-lg px-2 py-1 pr-6 outline-none font-medium italic focus:border-primary transition-all"
                        />
                        <MessageSquare size={9} className="absolute right-2 top-1.5 text-slate-300" />
                      </div>
                    )}
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
