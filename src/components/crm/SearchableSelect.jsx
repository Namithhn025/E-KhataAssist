import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

/**
 * A searchable select dropdown component.
 * Robust against null, undefined, non-array options.
 */
const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const filtered = safeOptions.filter(o =>
    o && typeof o === 'string' && o.toLowerCase().includes((search || '').toLowerCase())
  );

  const isSm = size === 'sm';

  return (
    <div ref={wrapperRef} className={`relative ${className}`} style={{ minWidth: isSm ? 120 : 180 }}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setSearch(''); } }}
        className={`w-full flex items-center justify-between gap-1 transition-all outline-none
          ${isSm
            ? 'bg-indigo-50/50 border border-indigo-100 rounded-md px-2 py-1 text-[8px] font-bold text-indigo-600'
            : 'bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700'
          }
          ${disabled ? 'opacity-60 cursor-default' : 'cursor-pointer hover:border-blue-300'}
        `}
      >
        <span className={`truncate ${!value ? 'opacity-50' : ''}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={isSm ? 10 : 14} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          className={`absolute z-[300] mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          style={{ minWidth: isSm ? 180 : 220 }}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <Search size={12} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none text-xs font-medium text-slate-700 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X size={10} />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-40 overflow-y-auto py-1">
            {/* Unassigned / clear option */}
            <button
              type="button"
              onClick={() => { onChange && onChange(''); setIsOpen(false); setSearch(''); }}
              className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors hover:bg-slate-50
                ${!value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}
              `}
            >
              {placeholder}
            </button>

            {filtered.length > 0 ? (
              filtered.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange && onChange(name); setIsOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-bold transition-colors hover:bg-blue-50
                    ${value === name ? 'text-blue-700 bg-blue-50' : 'text-slate-700'}
                  `}
                >
                  {name}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-[10px] text-slate-400 font-medium text-center">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
