import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  'Pre-Active':  { color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400',  label: 'Pre-Active'  },
  'Active':      { color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500',  label: 'Active'      },
  'Blocked':     { color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500',    label: 'Blocked'     },
  'Closed':      { color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500',   label: 'Closed'      },
  'Pre-Invoice': { color: 'bg-purple-100 text-purple-700 border-purple-200',dot: 'bg-purple-500', label: 'Pre-Invoice' },
  'Retry':       { color: 'bg-orange-100 text-orange-700 border-orange-200',dot: 'bg-orange-400', label: 'Retry'       },
  'Approved':    { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Approved' },
};

const LIFECYCLE_STAGES = [
  'Document Received', 'eKYC Pending', 'eKYC Done',
  'Ready to eSign', 'Application Submitted', 'Blocked',
];

const isSameDay = (dateStr, targetDate) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return (
    d.getFullYear() === targetDate.getFullYear() &&
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
};

const getServiceStatus = (c) => {
  if (c.serviceStatus === 'Blocked')     return 'Blocked';
  if (c.serviceStatus === 'Closed')      return 'Closed';
  if (c.serviceStatus === 'Pre-Invoice') return 'Pre-Invoice';
  if (c.serviceStatus === 'Retry')       return 'Retry';
  if (c.serviceStatus === 'Approved')    return 'Approved';
  if (c.docsSubmitted && c.docSource)    return 'Active';
  return 'Pre-Active';
};

const StatusCard = ({ status, leads }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedStage, setExpandedStage] = useState(null);
  const cfg = STATUS_CONFIG[status] || { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: status };

  const byStage = useMemo(() => {
    const map = {};
    leads.forEach(c => {
      const stage = c.serviceStatus === 'Blocked' ? 'Blocked' : (c.serviceStage || 'Document Received');
      if (!map[stage]) map[stage] = [];
      map[stage].push(c);
    });
    return map;
  }, [leads]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <span className="text-sm font-black text-slate-800">{cfg.label}</span>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${cfg.color}`}>{leads.length} leads</span>
        </div>
        {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-50 px-5 pb-4 pt-3 space-y-2">
          {Object.entries(byStage).map(([stage, stageLeads]) => (
            <div key={stage} className="rounded-xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setExpandedStage(expandedStage === stage ? null : stage)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-200">{stageLeads.length}</span>
                  {expandedStage === stage ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                </div>
              </button>
              {expandedStage === stage && (
                <div className="divide-y divide-slate-50">
                  {stageLeads.map(c => (
                    <div key={c.id} className="px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-800">{c.customerName || 'No Name'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{c.phone || '—'} · {c.srId || `SRF${c.id.substring(0,4).toUpperCase()}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500">{c.serviceRequested || c.serviceType || c.service || 'No Service'}</p>
                        <p className="text-[10px] font-bold text-slate-300">{c.apartment || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DailyMovementView = ({ customers }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const targetDate = new Date(selectedDate + 'T00:00:00');

  const serviceLeads = useMemo(() =>
    customers.filter(c => c.serviceType || c.serviceRequested || c.service),
    [customers]
  );

  // Leads updated on the selected date — check all known date fields
  const dailyLeads = useMemo(() => {
    return serviceLeads.filter(c =>
      isSameDay(c.updatedAt, targetDate) ||
      isSameDay(c.closedDate, targetDate) ||
      isSameDay(c.blockedDate, targetDate) ||
      isSameDay(c.approvedDate, targetDate) ||
      isSameDay(c.preInvoiceDate, targetDate) ||
      isSameDay(c.docsSubmittedDate, targetDate) ||
      isSameDay(c.createdAt, targetDate)
    );
  }, [serviceLeads, selectedDate]);

  const byStatus = useMemo(() => {
    const map = {};
    dailyLeads.forEach(c => {
      const status = getServiceStatus(c);
      if (!map[status]) map[status] = [];
      map[status].push(c);
    });
    return map;
  }, [dailyLeads]);

  const statusOrder = ['Pre-Active', 'Active', 'Blocked', 'Closed', 'Pre-Invoice', 'Retry', 'Approved'];

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="px-8 pb-20 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Daily Movement</h2>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Applications active on a given day across all pipeline stages</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <Calendar size={15} className="text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            max={today.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-sm font-black text-slate-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-7 gap-3">
        {statusOrder.map(status => {
          const count = (byStatus[status] || []).length;
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className={`rounded-2xl border p-4 text-center ${cfg.color}`}>
              <p className="text-2xl font-black">{count}</p>
              <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{status}</p>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        <TrendingUp size={14} />
        <span>{dailyLeads.length} total leads active on {formatDate(selectedDate)}</span>
      </div>

      {/* Status Cards */}
      {dailyLeads.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-slate-300 font-black text-lg">No activity on {formatDate(selectedDate)}</p>
          <p className="text-slate-200 text-sm font-bold mt-1">Try selecting a different date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {statusOrder.filter(s => byStatus[s]?.length > 0).map(status => (
            <StatusCard key={status} status={status} leads={byStatus[status]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyMovementView;
