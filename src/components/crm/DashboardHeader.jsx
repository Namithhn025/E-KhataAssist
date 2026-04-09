import React from 'react';
import { Search, Upload, Plus } from 'lucide-react';

const DashboardHeader = ({ title, onSearch, onNewLead, viewMode }) => {
  return (
    <div className="flex justify-between items-center px-8 py-6 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-opacity-70">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 font-medium">Manage and process leads effectively</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by user id, name or phone..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-12 pr-6 py-3 w-80 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">

          
          {viewMode === 'sales' && (
            <button 
              onClick={onNewLead}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm shadow-xl shadow-slate-200 transition-all transform active:scale-[0.98]"
            >
              <Plus size={20} /> New Lead
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
