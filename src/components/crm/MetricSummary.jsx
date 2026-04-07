import React from 'react';
import { Info } from 'lucide-react';

const MetricCard = ({ label, count, color, bgColor, borderColor }) => (
  <div className={`p-5 rounded-2xl border ${borderColor} ${bgColor} flex flex-col justify-between h-28 shadow-sm hover:shadow-md transition-all duration-300 group`}>
    <div className="flex justify-between items-start">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <button className="text-slate-400 hover:text-slate-600 transition-colors">
        <Info size={14} />
      </button>
    </div>
    <div>
      <p className={`text-2xl font-black ${color} group-hover:scale-105 transition-transform origin-left`}>
        {(count || 0).toLocaleString()}
      </p>
    </div>
  </div>
);

const MetricSummary = ({ metrics, viewMode }) => {
  // Only show metrics on the Sales page
  if (viewMode !== 'sales') return null;

  const cards = [
    { label: 'Total Leads', count: metrics.total,     color: 'text-slate-900',  bgColor: 'bg-white',          borderColor: 'border-slate-200'  },
    { label: 'Pre-active',  count: metrics.preActive, color: 'text-yellow-600', bgColor: 'bg-yellow-50/50',   borderColor: 'border-yellow-100' },
    { label: 'Active',      count: metrics.active,    color: 'text-green-600',  bgColor: 'bg-green-50/50',    borderColor: 'border-green-100'  },
    { label: 'Closed',      count: metrics.closed,    color: 'text-blue-600',   bgColor: 'bg-blue-50/50',     borderColor: 'border-blue-100'   },
    { label: 'Blocked',     count: metrics.blocked,   color: 'text-red-600',    bgColor: 'bg-red-50/50',      borderColor: 'border-red-100'    },
    { label: 'Retry',       count: metrics.retry,     color: 'text-orange-600', bgColor: 'bg-orange-50/50',   borderColor: 'border-orange-100' },
    { label: 'Approved',    count: metrics.approved,  color: 'text-emerald-600',bgColor: 'bg-emerald-50/50',  borderColor: 'border-emerald-100'},
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 px-8 py-6 mb-4">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
};

export default MetricSummary;
