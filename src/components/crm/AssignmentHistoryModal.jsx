import React from 'react';
import { XCircle, Upload, ArrowRight, UserCheck, MapPin, FileCheck, Lock, RefreshCw, BadgeCheck, X as XIcon } from 'lucide-react';

/**
 * AssignmentHistoryModal — now shows the FULL lifecycle timeline of a lead
 * Built from the lead's field data (dates, statuses, specialists, etc.)
 * Props:
 *   - open: boolean
 *   - onClose: function
 *   - customer: the full customer/lead object
 */
const AssignmentHistoryModal = ({ open, onClose, customer, history = [] }) => {
  if (!open) return null;

  // Use customer object if provided, otherwise fall back to legacy history array
  const lead = customer || {};

  const formatDate = (ts) => {
    if (!ts) return '';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatShortDate = (ts) => {
    if (!ts) return '';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Build timeline events from lead data
  const events = [];

  // 1. Created / Uploaded
  if (lead.createdAt) {
    events.push({
      date: lead.createdAt,
      icon: <Upload size={14} />,
      color: 'bg-slate-500',
      title: lead.isMarketingData || lead.sourceVault === 'marketing' ? 'Uploaded via Marketing' : 'Lead Created',
      detail: lead.sourceVault ? `Source: ${lead.sourceVault}` : null,
    });
  }

  // 2. Marketing POC assigned
  if (lead.serviceAcqPOC && (lead.isMarketingData || lead.marketingUploadDate)) {
    events.push({
      date: lead.marketingUploadDate || lead.createdAt,
      icon: <UserCheck size={14} />,
      color: 'bg-violet-500',
      title: 'Marketing POC Assigned',
      detail: lead.serviceAcqPOC,
    });
  }

  // 3. Moved to Operation Team
  if (lead.marketingMovedDate) {
    events.push({
      date: lead.marketingMovedDate,
      icon: <ArrowRight size={14} />,
      color: 'bg-blue-500',
      title: 'Moved to Operation Team',
      detail: lead.docSource ? `Doc Source: ${lead.docSource}` : null,
    });
  }

  // 4. Docs Submitted
  if (lead.docsSubmittedDate) {
    events.push({
      date: lead.docsSubmittedDate,
      icon: <FileCheck size={14} />,
      color: 'bg-emerald-500',
      title: 'Documents Submitted',
      detail: lead.docStatus ? `Status: ${lead.docStatus}` : null,
    });
  }

  // 5. EPID Specialist assigned
  if (lead.epidAndEsignSpecialist) {
    events.push({
      date: lead.docsSubmittedDate || lead.marketingMovedDate || lead.createdAt,
      icon: <UserCheck size={14} />,
      color: 'bg-indigo-500',
      title: 'EPID & E-Sign Specialist Assigned',
      detail: lead.epidAndEsignSpecialist,
    });
  }

  // 6. eKYC Specialist assigned
  if (lead.ekycSpecialist) {
    events.push({
      date: lead.docsSubmittedDate || lead.marketingMovedDate || lead.createdAt,
      icon: <UserCheck size={14} />,
      color: 'bg-amber-500',
      title: 'eKYC Specialist Assigned',
      detail: lead.ekycSpecialist,
    });
  }

  // 7. Address Specialist assigned
  if (lead.addressSpecialist) {
    events.push({
      date: lead.docsSubmittedDate || lead.marketingMovedDate || lead.createdAt,
      icon: <MapPin size={14} />,
      color: 'bg-purple-500',
      title: 'Address Specialist Assigned',
      detail: lead.addressSpecialist,
    });
  }

  // 8. Blocked
  if (lead.serviceStatus === 'Blocked') {
    events.push({
      date: lead.blockedDate || lead.updatedAt,
      icon: <Lock size={14} />,
      color: 'bg-red-500',
      title: 'Lead Blocked',
      detail: lead.rejectionNote || null,
    });
  }

  // 9. Retry
  if (lead.serviceStatus === 'Retry') {
    events.push({
      date: lead.updatedAt,
      icon: <RefreshCw size={14} />,
      color: 'bg-blue-500',
      title: 'Sent for Retry',
      detail: 'Stage reset to Document Received',
    });
  }

  // 10. Closed
  if (lead.serviceStatus === 'Closed' || lead.closedDate) {
    events.push({
      date: lead.closedDate || lead.updatedAt,
      icon: <XIcon size={14} />,
      color: 'bg-slate-600',
      title: 'Lead Closed',
      detail: lead.serviceStage === 'Application Submitted' ? 'Application Submitted' : null,
    });
  }

  // 11. Approved
  if (lead.serviceStatus === 'Approved' || lead.approvedDate) {
    events.push({
      date: lead.approvedDate || lead.updatedAt,
      icon: <BadgeCheck size={14} />,
      color: 'bg-emerald-600',
      title: 'Approved for Invoice',
      detail: lead.amount ? `Amount: ₹${lead.amount}` : null,
    });
  }

  // Also add legacy assignment history entries
  if (history && history.length > 0) {
    history.forEach(item => {
      events.push({
        date: item.timestamp,
        icon: <UserCheck size={14} />,
        color: 'bg-sky-500',
        title: item.specialistRole || 'Specialist Assignment',
        detail: `${item.assignedTo || '—'}${item.note ? ' — ' + item.note : ''}`,
      });
    });
  }

  // Sort by date (earliest first)
  events.sort((a, b) => {
    const da = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return da - db2;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Lead Lifecycle</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {lead.customerName || 'Lead'} • {lead.srId || lead.id || ''}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white transition-all rounded-lg flex items-center justify-center">
            <XCircle size={18} />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current</span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
            ${lead.serviceStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              lead.serviceStatus === 'Blocked' ? 'bg-red-100 text-red-700' :
              lead.serviceStatus === 'Closed' ? 'bg-slate-200 text-slate-700' :
              lead.serviceStatus === 'Retry' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'}
          `}>
            {lead.serviceStatus || 'Open'}
          </span>
          {lead.serviceStage && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {lead.serviceStage}
            </span>
          )}
        </div>

        {/* Timeline */}
        <div className="px-8 py-6 max-h-[50vh] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No lifecycle events recorded yet.</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

              <div className="space-y-5">
                {events.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Icon dot */}
                    <div className={`w-[30px] h-[30px] rounded-full ${evt.color} flex items-center justify-center text-white flex-shrink-0 z-10 shadow-sm`}>
                      {evt.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                          {formatShortDate(evt.date)}
                        </span>
                      </div>
                      {evt.detail && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{evt.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHistoryModal;
