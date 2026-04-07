import React, { useState } from 'react';
import { 
  BarChart2, Compass, ShoppingBag, Briefcase, FileText, 
  Settings, LogOut, ChevronDown,
  Clock, PlayCircle, XCircle, CheckCircle, RefreshCw
} from 'lucide-react';

const Sidebar = ({ selectedSource, setSelectedSource, onLogout, servicesSubMode, setServicesSubMode, userRole }) => {
  const [isServicesExpanded, setIsServicesExpanded] = useState(true);

  const allSubItems = [
    { id: 'pre-active', name: 'Pre-active',          icon: Clock,       color: 'text-yellow-400' },
    { id: 'active',     name: 'Active',               icon: PlayCircle,  color: 'text-green-400'  },
    { id: 'blocked',    name: 'Blocked',              icon: XCircle,     color: 'text-red-500'    },
    { id: 'closed',     name: 'Closed',               icon: CheckCircle, color: 'text-blue-400'   },
    { id: 'retry',      name: 'Retry',                icon: RefreshCw,   color: 'text-orange-400' },
  ];

  const menuItems = [
    ...(userRole === 'admin' ? [{ id: 'nexus', name: 'Overview', icon: BarChart2 }] : []),
    { id: 'camp',  name: 'Camp',     icon: Compass   },
    { id: 'sales', name: 'Sales',    icon: ShoppingBag },
    { 
      id: 'services', 
      name: 'Services', 
      icon: Briefcase, 
      hasDropdown: true,
      subItems: allSubItems,
    },
    ...(userRole === 'admin' ? [
        { id: 'invoices', name: 'Invoices', icon: FileText },
        { id: 'admin',    name: 'Admin',    icon: Settings }
    ] : []),
  ];

  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col fixed left-0 top-0 text-slate-300 border-r border-slate-800 z-50 overflow-hidden">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-all">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 shrink-0">
            E
          </div>
          <div className="flex-1 overflow-hidden text-sm">
            <p className="font-bold text-white truncate">E-Khata Assist</p>
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-mono">CRM Portal</p>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => {
                if (item.id === 'services') {
                  setIsServicesExpanded(!isServicesExpanded);
                  setSelectedSource('services');
                } else {
                  setSelectedSource(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                selectedSource === item.id
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-200'
              }`}
            >
              <item.icon size={18} className={selectedSource === item.id ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1 text-left">{item.name}</span>
              {item.hasDropdown && (
                <ChevronDown 
                  size={12} 
                  className={`text-slate-600 transition-transform duration-300 ${isServicesExpanded ? 'rotate-180' : ''}`} 
                />
              )}
            </button>

            {/* Sub Items */}
            {item.id === 'services' && isServicesExpanded && (
              <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-300">
                {item.subItems.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSource('services');
                      setServicesSubMode(sub.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedSource === 'services' && servicesSubMode === sub.id
                        ? 'text-white bg-slate-800 shadow-inner'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <sub.icon size={13} className={sub.color} />
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white transition-all transform active:scale-[0.98] border border-slate-700 uppercase tracking-widest"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
