import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, RefreshCw, X, Plus } from 'lucide-react';

const FilterSelect = ({ label, options, value, onChange, onRemove, isRemovable }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 focus-within:ring-4 focus-within:ring-slate-100 transition-all shadow-sm group">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <select 
          value={value}
          onChange={onChange}
          className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer min-w-24 appearance-none"
        >
          <option value="">All</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {isRemovable && (
        <button 
          onClick={onRemove}
          className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

const SearchableFilterSelect = ({ label, options, value, onChange, onRemove, isRemovable }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const display = value || 'All';

  return (
    <div ref={ref} className="relative flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-sm group">
      <div className="flex flex-col min-w-24 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{display}</span>
      </div>
      {isRemovable && (
        <button onClick={onRemove} className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
          <X size={14} />
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] animate-in zoom-in-95 duration-200 origin-top-left">
          <div className="p-2 border-b border-slate-50">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apartment..."
              className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-primary/30"
            />
          </div>
          <div className="max-h-52 overflow-y-auto no-scrollbar p-2 space-y-0.5">
            <button onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${!value ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
              All
            </button>
            {filtered.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${value === opt ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                {opt}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-slate-400 text-center py-3">No results</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ activeFilters, visibleFilters, setVisibleFilters, onFilterChange, onReset, viewMode, pocs = {}, sortBy, onSortChange, customers = [] }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safePocs = pocs || {};
  const opsSpecialistOptions = Array.from(new Set([
    ...(safePocs.epidAndEsignSpecialist || []),
    ...(safePocs.ekycSpecialist || []),
    ...(safePocs.addressSpecialist || []),
    ...(safePocs.serviceAcquisition || []),
  ])).filter(Boolean);

  const dynamicDocSources = Array.from(new Set(
    customers
      .map(c => c.docSource)
      .filter(Boolean)
      .map(s => s.toLowerCase())
  )).sort();
  const docSourceOptions = ['Unassigned', ...Array.from(new Set([...dynamicDocSources])).map(s =>
    s.charAt(0).toUpperCase() + s.slice(1)
  )];

  const allFilterSpecs = {
    priority: { label: 'Priority', options: ['High', 'Medium', 'Low'] },
    acqPOC: { label: 'Acquisit. POC', options: ['Unassigned', ...(safePocs.acquisition || [])] },
    opsSpecialist: { label: 'Ops Specialist', options: ['Unassigned', ...opsSpecialistOptions] },
    docSource: { label: 'Doc Source', options: docSourceOptions },
    serviceAcqPOC: { label: 'Service POC', options: ['Unassigned', ...(safePocs.serviceAcquisition || [])] },
    service: { label: 'Service Type', options: [
      'Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)', 
      'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration', 'Others'
    ]},
    stage: { label: 'Service Stage', options: [
      'Document Received', 'eKYC Pending', 'eKYC Done', 
      'Ready to eSign', 'Application Submitted', 'Approved', 'Rejected'
    ]},
    apartment: { label: 'Apartment', options: [...(safePocs.apartments || [])].sort((a, b) => a.localeCompare(b)) },
    docsSubmitted: { label: 'Docs Status', options: ['Submitted', 'Pending'] }
  };

  const commonKeys = ['priority', 'acqPOC', 'opsSpecialist', 'docSource', 'serviceAcqPOC', 'stage', 'service'];
  
  const handleAddFilter = (key) => {
    if (!visibleFilters.includes(key)) {
      setVisibleFilters([...visibleFilters, key]);
    }
    setShowAddMenu(false);
  };

  const handleRemoveFilter = (key) => {
    setVisibleFilters(visibleFilters.filter(k => k !== key));
    onFilterChange(key, ''); // Reset value
  };

  const handleReset = () => {
    setVisibleFilters(prev => {
      const hasDocsStatus = prev.includes('docsSubmitted');
      return hasDocsStatus ? [...commonKeys, 'docsSubmitted'] : commonKeys;
    });
    onReset();
  };

  return (
    <div className="px-8 py-4 flex items-center gap-4 border-b border-slate-50 bg-white/50 backdrop-blur-sm sticky top-24 z-30 overflow-visible">
      {(viewMode !== 'camp' && viewMode !== 'expenses') && (
        <button 
          onClick={handleReset}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-sm transform active:rotate-180 duration-500"
        >
          <RefreshCw size={18} />
        </button>
      )}

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1">
        {(viewMode !== 'camp' && viewMode !== 'expenses') && visibleFilters.map((key) => {
          const spec = allFilterSpecs[key];
          if (!spec) return null;
          if (key === 'apartment') return (
            <SearchableFilterSelect
              key={key}
              label={spec.label}
              options={spec.options}
              value={activeFilters[key] || ''}
              onChange={(val) => onFilterChange(key, val)}
              onRemove={() => handleRemoveFilter(key)}
              isRemovable={!commonKeys.includes(key)}
            />
          );
          return (
            <FilterSelect
              key={key}
              label={spec.label}
              options={spec.options}
              value={activeFilters[key] || ''}
              onChange={(e) => onFilterChange(key, e.target.value)}
              onRemove={() => handleRemoveFilter(key)}
              isRemovable={!commonKeys.includes(key)}
            />
          );
        })}
      </div>

      {(viewMode !== 'camp' && viewMode !== 'expenses') && (
        <div className="relative">
          <button 
             onClick={() => setShowAddMenu(!showAddMenu)}
             className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-slate-200 bg-white hover:border-primary hover:bg-slate-50 text-xs font-black text-slate-400 hover:text-primary transition-all whitespace-nowrap shadow-sm group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add Filter
          </button>

          {showAddMenu && (
            <div 
              ref={menuRef}
              className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-[100] animate-in zoom-in-95 duration-200 origin-top-right scale-100"
            >
               <div className="px-4 py-2 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Columns</p>
               </div>
               <div className="max-h-64 overflow-y-auto no-scrollbar px-2 space-y-1">
                 {Object.entries(allFilterSpecs).filter(([k]) => !visibleFilters.includes(k)).map(([key, spec]) => (
                   <button 
                     key={key}
                     onClick={() => handleAddFilter(key)}
                     className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all flex items-center justify-between group"
                   >
                     {spec.label}
                     <div className="w-5 h-5 bg-slate-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={12} />
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-slate-400">Sort:</span> 
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-900 cursor-pointer font-black uppercase text-[10px] tracking-widest"
        >
          <option value="Date Added">Date Added</option>
          <option value="Recently Updated">Recently Updated</option>
          <option value="Priority (High to Low)">Priority (High to Low)</option>
          <option value="Deadline (Ascending)">Deadline (Ascending)</option>
          <option value="Deadline (Descending)">Deadline (Descending)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
