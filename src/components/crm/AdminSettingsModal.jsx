import React, { useState } from 'react';
import { X, Plus, Trash2, Check, UserPlus, Briefcase, Home } from 'lucide-react';

const AdminSettingsModal = ({ isOpen, onClose, pocs, onUpdate }) => {
  const [newAcq, setNewAcq] = useState('');
  const [newServiceAcq, setNewServiceAcq] = useState('');
  const [newApartment, setNewApartment] = useState('');

  if (!isOpen) return null;

  const handleAdd = (type) => {
    const list = [...(pocs[type] || [])];
    const val = type === 'acquisition' ? newAcq : 
                type === 'serviceAcquisition' ? newServiceAcq : newApartment;
    
    if (val && !list.includes(val)) {
      list.push(val);
      onUpdate({ ...pocs, [type]: list });
      if (type === 'acquisition') setNewAcq('');
      else if (type === 'serviceAcquisition') setNewServiceAcq('');
      else setNewApartment('');
    }
  };

  const handleRemove = (type, name) => {
    const list = pocs[type].filter(n => n !== name);
    onUpdate({ ...pocs, [type]: list });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white animate-in zoom-in-95 duration-500 flex flex-col">
        
        {/* Header */}
        <div className="p-10 flex justify-between items-start border-b border-slate-50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Settings</h2>
            <p className="text-sm text-slate-500 font-medium">Manage team members and POC lists</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all rounded-xl flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh] no-scrollbar">
          
          {/* Apartments Management */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Home size={16} className="text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Apartments / Projects</h3>
             </div>
             
             <div className="flex gap-2">
                <input 
                  value={newApartment}
                  onChange={(e) => setNewApartment(e.target.value)}
                  placeholder="Enter apartment name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-sm"
                />
                <button 
                  onClick={() => handleAdd('apartments')}
                  className="px-6 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all"
                >
                  Add
                </button>
             </div>

             <div className="grid grid-cols-2 gap-2">
                {pocs.apartments?.map(name => (
                  <div key={name} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-700">{name}</span>
                    <button onClick={() => handleRemove('apartments', name)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          {/* Acquisition POCs */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <UserPlus size={16} className="text-primary" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Acquisition Team</h3>
             </div>
             
             <div className="flex gap-2">
                <input 
                  value={newAcq}
                  onChange={(e) => setNewAcq(e.target.value)}
                  placeholder="Enter name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm"
                />
                <button 
                  onClick={() => handleAdd('acquisition')}
                  className="px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                >
                  Add
                </button>
             </div>

             <div className="grid grid-cols-2 gap-2">
                {pocs.acquisition?.map(name => (
                  <div key={name} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-700">{name}</span>
                    <button onClick={() => handleRemove('acquisition', name)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          {/* Service Acquisition POCs */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-indigo-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Service Acquisition</h3>
             </div>
             
             <div className="flex gap-2">
                <input 
                  value={newServiceAcq}
                  onChange={(e) => setNewServiceAcq(e.target.value)}
                  placeholder="Enter name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-sm"
                />
                <button 
                  onClick={() => handleAdd('serviceAcquisition')}
                  className="px-6 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all"
                >
                  Add
                </button>
             </div>

             <div className="grid grid-cols-2 gap-2">
                {pocs.serviceAcquisition?.map(name => (
                  <div key={name} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-700">{name}</span>
                    <button onClick={() => handleRemove('serviceAcquisition', name)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/50 rounded-b-[2.5rem]">
           <button onClick={onClose} className="w-full bg-slate-200 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-300 transition-all text-xs uppercase tracking-widest">
              Close Settings
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;

