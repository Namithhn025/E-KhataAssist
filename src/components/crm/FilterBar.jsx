import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

const FilterSelect = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 h-full">
      <select 
        value={value}
        onChange={onChange}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer min-w-32"
      >
        <option value="">{label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
};

const FilterBar = ({ activeFilters, onFilterChange, onReset, viewMode, pocs = {} }) => {
  const commonFilters = [
    { label: 'Priority', key: 'priority', options: ['High', 'Medium', 'Low'] },
    { label: 'Acquisition Team', key: 'acqPOC', options: pocs.acquisition || [] },
    { label: 'Service Acquisition', key: 'serviceAcqPOC', options: pocs.serviceAcquisition || [] },
  ];

  const salesFilters = [
    ...commonFilters,
    { label: 'Interest', key: 'interest', options: ['Hot', 'Warm', 'Cold'] },
    { label: 'Service Stage', key: 'stage', options: [
      'Document Received', 'eKYC Pending', 'eKYC Done', 
      'Ready to eSign', 'Application Submitted', 'Approved', 'Rejected'
    ]},
  ];

  const serviceFilters = [
    ...commonFilters,
    { label: 'Service Type', key: 'service', options: ['Ekatha', 'Katha Transfer', 'Bescom', 'Others'] },
    { label: 'Stage', key: 'stage', options: ['Awaiting Docs', 'Filing', 'Correction', 'Escalated'] },
    { label: 'Blocker POC', key: 'blockerPOC', options: pocs.acquisition || [] },
  ];

  const filterSpecs = viewMode === 'services' ? serviceFilters : salesFilters;

  return (
    <div className="px-8 py-4 flex items-center gap-4 border-b border-slate-50 bg-white/50 backdrop-blur-sm sticky top-24 z-30">
      <button 
        onClick={onReset}
        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-sm transform active:rotate-180 duration-500"
      >
        <RefreshCw size={18} />
      </button>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {filterSpecs.map((spec) => (
          <FilterSelect 
            key={spec.key}
            label={spec.label}
            options={spec.options}
            value={activeFilters[spec.key] || ''}
            onChange={(e) => onFilterChange(spec.key, e.target.value)}
          />
        ))}
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 shadow-sm transition-all whitespace-nowrap">
          <SlidersHorizontal size={14} /> More Filters
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-200">
        Sort by: 
        <select className="bg-transparent border-none outline-none text-slate-900 cursor-pointer">
          <option>Date Added</option>
          <option>Recently Updated</option>
          <option>Priority (High to Low)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
