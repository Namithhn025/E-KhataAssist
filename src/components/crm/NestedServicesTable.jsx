import React, { useState } from 'react';
import { arrayUnion } from 'firebase/firestore';
import AssignmentHistoryModal from './AssignmentHistoryModal';
import { Phone, Clock, MessageSquare, AlertTriangle, CheckCircle, XCircle, Lock, RefreshCw, BadgeCheck, Globe, Edit2, ChevronRight, FileCheck, Send } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

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

// ─── Modals ──────────────────────────────────────────────────────────────────

const RejectionModal = ({ open, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center"><AlertTriangle size={22} className="text-red-500" /></div>
          <div><h3 className="text-lg font-black text-red-500">Block & Tag Lead</h3><p className="text-xs text-slate-400 font-medium">A blocker reason is mandatory.</p></div>
        </div>
        <textarea autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this lead blocked?..." className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all text-sm font-medium min-h-[100px] resize-none" />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
          <button onClick={() => { if (!reason.trim()) { alert('Please enter a reason.'); return; } onConfirm(reason.trim()); setReason(''); }} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200">Confirm Block</button>
        </div>
      </div>
    </div>
  );
};

const CloseConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center"><CheckCircle size={22} className="text-emerald-500" /></div>
          <div><h3 className="text-lg font-black text-slate-900">Close This Lead?</h3><p className="text-xs text-slate-400 font-medium">Will move to <span className="font-black text-blue-600">Closed</span> for admin approval.</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200">✓ Confirm Close</button>
        </div>
      </div>
    </div>
  );
};

const ActiveConfirmModal = ({ open, onConfirm, onCancel, customerName, initialDocSource }) => {
  const [docSource, setDocSource] = useState('');
  const [customSource, setCustomSource] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center"><CheckCircle size={22} className="text-green-500" /></div>
          <div><h3 className="text-lg font-black text-slate-900">Move to Active?</h3><p className="text-xs text-slate-400 font-medium"><span className="font-black text-slate-700">{customerName}</span> will move to <span className="font-black text-green-600">Active</span>.</p></div>
        </div>
        {!initialDocSource ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Document Source</label>
            <select value={docSource} onChange={e => setDocSource(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Select Document Source</option>
              <option value="ajay whatsapp">Ajay Whatsapp</option>
              <option value="rakshith whatsapp">Rakshith Whatsapp</option>
              <option value="mail">Mail</option>
              <option value="physical">Physical</option>
              <option value="others">Others</option>
            </select>
            {docSource === 'others' && <input type="text" placeholder="Enter custom source..." value={customSource} onChange={e => setCustomSource(e.target.value)} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20" />}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100"><p className="text-xs font-bold text-slate-700">Document Source: <span className="font-black text-primary">{initialDocSource}</span></p></div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setDocSource(''); setCustomSource(''); onCancel(); }} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
          <button onClick={() => { if (initialDocSource) { onConfirm(initialDocSource); return; } if (!docSource) return alert('Please select a document source'); if (docSource === 'others' && !customSource.trim()) return alert('Please enter a custom source'); onConfirm(docSource === 'others' ? customSource.trim() : docSource); setDocSource(''); setCustomSource(''); }} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200">✓ Move to Active</button>
        </div>
      </div>
    </div>
  );
};

const RetryConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center"><RefreshCw size={22} className="text-blue-500" /></div>
          <div><h3 className="text-lg font-black text-slate-900">Retry This Step?</h3><p className="text-xs text-slate-400 font-medium">Moves back to <span className="font-black text-blue-600">Document Received</span>.</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200">✓ Confirm Retry</button>
        </div>
      </div>
    </div>
  );
};

const PreInvoiceConfirmModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center"><FileCheck size={22} className="text-purple-600" /></div>
          <div><h3 className="text-lg font-black text-purple-900">Move to Pre-Invoice?</h3><p className="text-xs text-purple-600 font-medium">Lead will move to <span className="font-black text-purple-700">Pre-Invoice</span> stage.</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-200">Move to Pre-Invoice</button>
        </div>
      </div>
    </div>
  );
};

// ─── Stage Progress Bar ───────────────────────────────────────────────────────
const StageProgress = ({ stage }) => {
  const idx = SERVICE_STAGES.indexOf(stage);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1 mt-2">
      {SERVICE_STAGES.map((s, i) => (
        <div key={s} title={s} className={`h-1.5 flex-1 rounded-full transition-all ${i <= idx ? 'bg-primary' : 'bg-slate-100'}`} />
      ))}
    </div>
  );
};

// ─── Label + Value helper ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div>{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const NestedServicesTable = ({ customer, onUpdate, pocs = {}, viewMode, subMode }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pendingPOC, setPendingPOC] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLead, setHistoryLead] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editingPhoneValue, setEditingPhoneValue] = useState('');

  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin';
  const canApprove = isAdmin;
  const isLocked = viewMode === 'sales' || viewMode === 'nexus';
  const isBlocked = customer.serviceStatus === 'Blocked';
  const isClosed = customer.serviceStatus === 'Closed';
  const isPreInvoice = customer.serviceStatus === 'Pre-Invoice';
  const isApproved = customer.serviceStatus === 'Approved';
  const showAmount = viewMode === 'invoices';
  const showDeadline = !(customer.serviceStage === 'Application Submitted' || isClosed || isPreInvoice || isApproved || subMode === 'closed' || subMode === 'pre-invoice' || subMode === 'approved');

  React.useEffect(() => {
    const defaults = pocs.defaults || {};
    if (!defaults.epidAndEsignSpecialist && !defaults.ekycSpecialist && !defaults.addressSpecialist) return;
    if (!customer.docsSubmitted && !customer.epidAndEsignSpecialist && defaults.epidAndEsignSpecialist) onUpdate && onUpdate('epidAndEsignSpecialist', defaults.epidAndEsignSpecialist);
    if (customer.docsSubmitted && !customer.ekycSpecialist && defaults.ekycSpecialist) onUpdate && onUpdate('ekycSpecialist', defaults.ekycSpecialist);
    if (customer.docsSubmitted && !customer.epidAndEsignSpecialist && defaults.epidAndEsignSpecialist) onUpdate && onUpdate('epidAndEsignSpecialist', defaults.epidAndEsignSpecialist);
    if (customer.serviceStage === 'eKYC Done' && !customer.addressSpecialist && defaults.addressSpecialist) onUpdate && onUpdate('addressSpecialist', defaults.addressSpecialist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id, customer.docsSubmitted, customer.serviceStage, pocs.defaults]);

  const getDeadlineInfo = () => {
    if (!customer.docsSubmitted && !customer.isMarketingData && subMode !== 'pre-active') return null;
    let totalDays = 15;
    if (customer.isMarketingData || (!customer.docsSubmitted && subMode === 'pre-active')) {
      totalDays = pocs.marketingDeadlineDays || 5;
    } else if (pocs.deadlines) {
      const serviceList = (customer.serviceRequested || customer.serviceType || customer.service || '').split(/,\s*/).filter(Boolean);
      for (const s of serviceList) { if (pocs.deadlines[s]) { totalDays = parseInt(pocs.deadlines[s], 10) || 15; break; } }
    }
    const startDateStr = customer.marketingUploadDate || customer.docsSubmittedDate || customer.createdAt;
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const elapsedDays = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDays - elapsedDays;
    return { remainingDays, elapsedDays, totalDays, isExceeded: remainingDays < 0, isReaching: remainingDays >= 0 && remainingDays <= 1, isOnTrack: remainingDays > 1 };
  };

  const deadlineInfo = getDeadlineInfo();
  const availableStages = [...SERVICE_STAGES, 'Blocked'];

  const handleStageChange = (newStage) => {
    if (isBlocked || isClosed || isPreInvoice || isApproved || isLocked) return;
    if (newStage === 'Blocked') { setShowRejectionModal(true); return; }
    if (newStage === CLOSING_STAGE) { setShowCloseModal(true); return; }
    if (newStage === 'eKYC Done') {
      onUpdate('assignedSpecialistRole', 'Address Specialist');
      if (pocs.defaults?.addressSpecialist) { onUpdate('assignedSpecialist', pocs.defaults.addressSpecialist); onUpdate('serviceAcqPOC', pocs.defaults.addressSpecialist); onUpdate('assignmentHistory', arrayUnion({ timestamp: new Date().toISOString(), specialistRole: 'Address Specialist', assignedTo: pocs.defaults.addressSpecialist, note: 'Auto-assigned on stage change' })); }
    } else if (newStage === 'Ready to eSign') {
      onUpdate('assignedSpecialistRole', 'EPID & E-Sign Specialist');
      if (pocs.defaults?.epidAndEsignSpecialist) { onUpdate('assignedSpecialist', pocs.defaults.epidAndEsignSpecialist); onUpdate('serviceAcqPOC', pocs.defaults.epidAndEsignSpecialist); onUpdate('assignmentHistory', arrayUnion({ timestamp: new Date().toISOString(), specialistRole: 'EPID & E-Sign Specialist', assignedTo: pocs.defaults.epidAndEsignSpecialist, note: 'Auto-assigned on stage change' })); }
    }
    onUpdate('serviceStage', newStage);
  };

  const handleConfirmClose = () => { setShowCloseModal(false); onUpdate('serviceStage', CLOSING_STAGE); onUpdate('serviceStatus', 'Closed'); onUpdate('closedDate', new Date().toISOString()); };
  const handleConfirmActive = (source) => {
    setShowActiveModal(false);
    onUpdate('docsSubmitted', true); onUpdate('docsSubmittedDate', new Date().toISOString()); onUpdate('docSource', source);
    onUpdate('assignedSpecialistRole', 'eKYC Specialist');
    const defaultEkyc = pocs.defaults?.ekycSpecialist;
    if (defaultEkyc) { onUpdate('assignedSpecialist', defaultEkyc); onUpdate('serviceAcqPOC', defaultEkyc); onUpdate('assignmentHistory', arrayUnion({ timestamp: new Date().toISOString(), specialistRole: 'eKYC Specialist', assignedTo: defaultEkyc, note: 'Auto-assigned on Active transition' })); }
    if (pendingPOC !== null) { onUpdate('serviceAcqPOC', pendingPOC); onUpdate('assignedSpecialist', pendingPOC); setPendingPOC(null); }
  };
  const handleConfirmRetry = () => { setShowRetryModal(false); onUpdate('serviceStatus', 'Retry'); onUpdate('serviceStage', 'Document Received'); };
  const handleConfirmPreInvoice = () => { setShowApproveModal(false); onUpdate('serviceStatus', 'Pre-Invoice'); onUpdate('preInvoiceDate', new Date().toISOString()); };
  const handleMoveToInvoice = () => { onUpdate('serviceStatus', 'Approved'); onUpdate('approvedDate', new Date().toISOString()); };
  const handleConfirmRejection = (reason) => { setShowRejectionModal(false); onUpdate('serviceStage', 'Blocked'); onUpdate('serviceStatus', 'Blocked'); onUpdate('blockerReason', reason); onUpdate('blockedDate', new Date().toISOString()); };

  const calculateAge = (startDate) => {
    if (!startDate) return '0d';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return 'N/A';
    const diffDays = Math.ceil(Math.abs(new Date() - start) / (1000 * 60 * 60 * 24));
    return `${Math.max(0, diffDays - 1)}d (${start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })})`;
  };

  const currentStage = customer.serviceStatus === 'Blocked' ? 'Blocked' : (customer.serviceStage || 'Document Received');

  return (
    <>
      <RejectionModal open={showRejectionModal} onConfirm={handleConfirmRejection} onCancel={() => setShowRejectionModal(false)} />
      <CloseConfirmModal open={showCloseModal} onConfirm={handleConfirmClose} onCancel={() => setShowCloseModal(false)} />
      <ActiveConfirmModal open={showActiveModal} onConfirm={handleConfirmActive} onCancel={() => setShowActiveModal(false)} customerName={customer.customerName} initialDocSource={customer.docSource} />
      <RetryConfirmModal open={showRetryModal} onConfirm={handleConfirmRetry} onCancel={() => setShowRetryModal(false)} />
      <PreInvoiceConfirmModal open={showApproveModal} onConfirm={handleConfirmPreInvoice} onCancel={() => setShowApproveModal(false)} />
      {historyLead && <AssignmentHistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} customer={historyLead} history={historyLead.assignmentHistory || []} />}

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl ring-1 ring-slate-900/5">

        {/* Top accent bar */}
        <div className={`h-1 w-full ${isBlocked ? 'bg-red-400' : isApproved ? 'bg-emerald-500' : isPreInvoice ? 'bg-purple-400' : isClosed ? 'bg-blue-400' : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600'}`} />

        {/* Blocked Banner */}
        {isBlocked && (
          <div className="px-8 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-600">
              <Lock size={16} />
              <div><p className="text-[10px] font-black uppercase tracking-[0.1em]">Lead Status: Blocked</p><p className="text-xs font-bold">{customer.blockerReason || 'Technical restriction'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Updated to Customer?</span>
                <input type="checkbox" disabled={isLocked} checked={customer.updatedToCustomer || false} onChange={e => onUpdate('updatedToCustomer', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500" />
              </div>
              {isAdmin && !isLocked && <button onClick={() => onUpdate('serviceStatus', 'Open')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Revive Lead</button>}
            </div>
          </div>
        )}

        {/* ── CARD LAYOUT ── */}
        <div className="px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-3">

          {/* LEFT: Core info + Stage */}
          <div className="lg:col-span-4 bg-gradient-to-b from-green-50/60 to-slate-50 rounded-2xl p-4 space-y-3 border border-green-100/80">

            {/* Row 1: Name / Phone / Site */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-black text-slate-900 text-sm tracking-tight">{customer.customerName}</p>
                {isAdmin && !isLocked ? (
                  isEditingPhone ? (
                    <div className="flex items-center gap-1">
                      <input type="text" value={editingPhoneValue} onChange={e => setEditingPhoneValue(e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-0.5 text-[10px] font-bold w-28 outline-none focus:border-primary" autoFocus />
                      <button onClick={async e => { e.stopPropagation(); if (!editingPhoneValue.trim()) return; await onUpdate('phone', editingPhoneValue.trim()); setIsEditingPhone(false); }} className="text-green-500 p-0.5"><CheckCircle size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); setIsEditingPhone(false); }} className="text-red-400 p-0.5"><XCircle size={12} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/phone text-[11px] font-bold text-slate-500 font-mono">
                      <Phone size={10} className="text-slate-300" />
                      <span>{customer.phone}</span>
                      <button onClick={e => { e.stopPropagation(); setIsEditingPhone(true); setEditingPhoneValue(customer.phone || ''); }} className="opacity-0 group-hover/phone:opacity-100 text-slate-400 hover:text-primary p-0.5"><Edit2 size={10} /></button>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 font-mono"><Phone size={10} className="text-slate-300" />{customer.phone}</div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                  <Globe size={10} className="text-slate-300" />
                  {customer.apartment || customer.society || 'Direct'}
                </div>
              </div>

              {/* Docs Status toggle */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Docs</p>
                <button
                  disabled={isLocked}
                  onClick={() => {
                    const val = !customer.docsSubmitted;
                    if (val && customer.serviceAcqPOC) { setShowActiveModal(true); }
                    else { onUpdate('docsSubmitted', val); if (val) onUpdate('docsSubmittedDate', new Date().toISOString()); }
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${customer.docsSubmitted ? 'bg-emerald-500' : 'bg-slate-200'} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${customer.docsSubmitted ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Services */}
            <Field label="Product / Service">
              <div className="flex flex-wrap gap-1 mb-1.5">
                {(customer.serviceRequested || '').split(', ').filter(Boolean).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-[8px] font-black uppercase tracking-wider border border-green-100">{s}</span>
                ))}
              </div>
              {isAdmin && !isLocked && (() => {
                const current = (customer.serviceRequested || '').split(', ').filter(Boolean);
                const hasCustom = current.some(s => !serviceOptions.includes(s));
                return (
                  <>
                    <select value="" onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      const isRemoving = current.includes(val);
                      if (isRemoving && current.length <= 1) return;
                      const next = isRemoving ? current.filter(x => x !== val) : [...current, val];
                      onUpdate('serviceRequested', next.join(', '));
                      let totalAmount = 0;
                      if (pocs.pricing) next.forEach(s => { if (pocs.pricing[s]) totalAmount += parseFloat(pocs.pricing[s]); });
                      onUpdate('amount', totalAmount || '');
                    }} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[8px] font-black text-slate-500 outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none uppercase w-full">
                      <option value="">+ Add/Remove Service</option>
                      {serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      {current.filter(s => !serviceOptions.includes(s)).map(s => (
                        <option key={s} value={s}>✕ Remove: {s}</option>
                      ))}
                    </select>
                    {!hasCustom && current.length === 0 && (
                      <input type="text" placeholder="Type custom service..." className="mt-1.5 px-2 py-1 bg-white border border-blue-100 rounded-lg text-[9px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/20 w-full"
                        onBlur={e => { if (e.target.value.trim()) onUpdate('serviceRequested', e.target.value.trim()); }} />
                    )}
                  </>
                );
              })()}
            </Field>

            {/* Stage */}
            <Field label="Live Lifecycle Stage">
              <select
                value={currentStage}
                onChange={e => handleStageChange(e.target.value)}
                disabled={isClosed || isPreInvoice || isApproved || isBlocked || isLocked}
                className={`w-full px-4 py-2.5 rounded-xl border-none text-[9px] font-black uppercase tracking-widest outline-none shadow-sm transition-all ${isLocked ? 'cursor-default bg-slate-50' : 'cursor-pointer'} ${stageColors[currentStage] || 'bg-slate-100'}`}
              >
                <option value="Blocked" disabled hidden>Blocked</option>
                {availableStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {!isBlocked && !isClosed && !isPreInvoice && <StageProgress stage={customer.serviceStage || 'Document Received'} />}
              {subMode === 'closed' && isClosed && !isApproved && (
                <div className="flex flex-col gap-1.5 pt-2">
                  {canApprove && <button onClick={() => setShowApproveModal(true)} className="w-full py-2 bg-purple-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-purple-600 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5"><FileCheck size={11} /> Move to Pre-Invoice</button>}
                  <button onClick={() => setShowRetryModal(true)} className="w-full py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center gap-1.5"><RefreshCw size={11} /> Retry Step</button>
                </div>
              )}
              {subMode === 'pre-invoice' && isPreInvoice && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2">
                      <Send size={12} className="text-purple-500" />
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Doc Sent to Client</span>
                    </div>
                    <button
                      onClick={() => !isLocked && onUpdate('sentToClient', !customer.sentToClient)}
                      disabled={isLocked}
                      className={`w-10 h-5 rounded-full relative transition-colors ${customer.sentToClient ? 'bg-purple-500' : 'bg-slate-200'} ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${customer.sentToClient ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  {customer.sentToClient && canApprove && (
                    <button onClick={handleMoveToInvoice} className="w-full py-2 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"><BadgeCheck size={11} /> Move to Invoice</button>
                  )}
                  {!customer.sentToClient && (
                    <p className="text-[9px] text-purple-400 font-bold text-center">Toggle "Doc Sent to Client" to enable invoicing</p>
                  )}
                </div>
              )}
            </Field>
          </div>

          {/* MIDDLE: People & IDs */}
          <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-100">

            <Field label="Acq. POC">
              <select disabled={!isAdmin || isLocked} value={customer.acqPOC || ''} onChange={e => onUpdate('acqPOC', e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-600 outline-none w-full appearance-none">
                <option value="">Unassigned</option>
                {pocs.acquisition?.map(name => <option key={name}>{name}</option>)}
              </select>
            </Field>

            <Field label="Ops Specialists">
              <div className="space-y-2">
                <SearchableSelect options={pocs.epidAndEsignSpecialist || pocs.serviceAcquisition || []} value={customer.epidAndEsignSpecialist || ''} onChange={val => onUpdate('epidAndEsignSpecialist', val)} placeholder="EPID & E-SIGN: Unassigned" disabled={!isAdmin || isLocked} size="sm" />
                <SearchableSelect options={pocs.ekycSpecialist || pocs.serviceAcquisition || []} value={customer.ekycSpecialist || ''} onChange={val => onUpdate('ekycSpecialist', val)} placeholder="EKYC: Unassigned" disabled={!isAdmin || isLocked} size="sm" />
                <SearchableSelect options={pocs.addressSpecialist || pocs.serviceAcquisition || []} value={customer.addressSpecialist || ''} onChange={val => onUpdate('addressSpecialist', val)} placeholder="ADDRESS: Unassigned" disabled={!isAdmin || isLocked} size="sm" />
              </div>
            </Field>

            <Field label="EC Number">
              <input type="text" placeholder="EC No..." value={customer.ec || ''} onChange={e => onUpdate('ec', e.target.value)} disabled={isLocked} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20" />
            </Field>

            <Field label="ePID">
              <div className="relative">
                <input
                  type="text"
                  placeholder="N/A"
                  value={customer.ePID || ''}
                  onChange={e => { const val = e.target.value.replace(/\D/g, '').substring(0, 10); if (isLocked) return; if (!isAdmin && customer.ePID) return; onUpdate('ePID', val); }}
                  disabled={isLocked || (!isAdmin && !!customer.ePID)}
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-[10px] font-black outline-none transition-all ${customer.ePID?.length === 10 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 focus:border-primary'}`}
                />
                {(!isAdmin && !!customer.ePID) && <Lock size={9} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />}
              </div>
            </Field>
          </div>

          {/* RIGHT: Status & Meta */}
          <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-5 space-y-4 border border-slate-100">

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age (S-Date)">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 bg-white px-2.5 py-2 rounded-lg border border-slate-100">
                  <Clock size={11} className="text-slate-300 shrink-0" />
                  <span className="truncate">{calculateAge(customer.docsSubmittedDate || customer.createdAt)}</span>
                </div>
              </Field>

              <Field label="Priority">
                <button
                  disabled={viewMode === 'sales' || viewMode === 'nexus'}
                  onClick={() => onUpdate('priority', customer.priority === 'High' ? 'Medium' : (customer.priority === 'Medium' ? 'Low' : 'High'))}
                  className={`w-full px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all ${customer.priority === 'High' ? 'bg-red-500 text-white shadow-red-200' : customer.priority === 'Medium' ? 'bg-yellow-500 text-white shadow-yellow-200' : 'bg-slate-200 text-slate-400'}`}
                >
                  {customer.priority || 'Low'}
                </button>
              </Field>
            </div>

            {showDeadline && (
              <Field label="Deadline">
                {customer.docsSubmitted && deadlineInfo ? (
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-sm w-fit ${deadlineInfo.isExceeded ? 'bg-red-500 text-white border-red-600 animate-pulse' : deadlineInfo.isReaching ? 'bg-yellow-400 text-slate-900 border-yellow-500' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    <Clock size={10} />
                    {deadlineInfo.isExceeded ? `${Math.abs(deadlineInfo.remainingDays)}d Exceeded` : deadlineInfo.remainingDays === 0 ? 'Due Today' : `${deadlineInfo.remainingDays}d Left`}
                  </div>
                ) : <span className="text-[9px] font-bold text-slate-300 italic">Pre-active</span>}
              </Field>
            )}

            <Field label="Doc Source">
              <select
                disabled={isLocked}
                value={customer.docSource && !['ajay whatsapp', 'rakshith whatsapp', 'mail', 'physical', ''].includes(customer.docSource) ? 'others' : (customer.docSource || '')}
                onChange={e => { if (e.target.value === 'others') { const custom = prompt('Enter custom doc source:'); if (custom) onUpdate('docSource', custom); } else { onUpdate('docSource', e.target.value); } }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Unassigned</option>
                <option value="ajay whatsapp">Ajay Whatsapp</option>
                <option value="rakshith whatsapp">Rakshith Whatsapp</option>
                <option value="mail">Mail</option>
                <option value="physical">Physical</option>
                <option value="others">Others (Custom)</option>
              </select>
              {customer.docSource && !['ajay whatsapp', 'rakshith whatsapp', 'mail', 'physical', ''].includes(customer.docSource) && (
                <div className="mt-1 text-[9px] text-slate-500 font-bold truncate" title={customer.docSource}>{customer.docSource}</div>
              )}
            </Field>

            {showAmount && (
              <Field label="Amount">
                {isAdmin ? (
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 w-fit">
                    <span className="text-emerald-600 font-black text-sm">₹</span>
                    <input disabled={isLocked} type="text" value={customer.amount || ''} onChange={e => onUpdate('amount', e.target.value)} className="bg-transparent text-[11px] font-black text-emerald-700 w-20 outline-none" />
                  </div>
                ) : <span className="text-[9px] font-bold text-slate-300 italic ring-1 ring-slate-100 px-2 py-0.5 rounded-full">PRIVATE</span>}
              </Field>
            )}

            {/* History button */}
            <button
              onClick={() => { setHistoryLead(customer); setShowHistoryModal(true); }}
              className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <Clock size={11} /> View Assignment History <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* ── NOTES ROW ── */}
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={12} className="text-green-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Call Registry & Notes</span>
            </div>
            <div className="flex gap-3 items-center">
              <select disabled={isLocked} value={customer.callStatus || 'Not Connected'} onChange={e => onUpdate('callStatus', e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none shrink-0">
                <option>Connected</option>
                <option>Not Connected</option>
                <option>Busy</option>
                <option>Follow Up</option>
              </select>
              <input disabled={isLocked} type="text" value={customer.notes || ''} onChange={e => onUpdate('notes', e.target.value)} placeholder={isLocked ? "View only mode" : "Record lead details here..."} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
            </div>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/80 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Special Notes / Challenges</span>
            </div>
            <textarea disabled={isLocked} value={customer.specialNotes || ''} onChange={e => onUpdate('specialNotes', e.target.value)} placeholder={isLocked ? "View only mode" : "Add technical blockers or specific challenges..."} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 h-10 resize-none no-scrollbar transition-all" />
          </div>
        </div>

      </div>
    </>
  );
};

export default NestedServicesTable;
