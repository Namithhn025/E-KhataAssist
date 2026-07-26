import React, { useState } from 'react';
import { X, Plus, Trash2, Check, UserPlus, Briefcase, Home, DollarSign, Calendar } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const AdminSettingsModal = ({ isOpen, onClose, pocs, onUpdate }) => {
  const [newAcq, setNewAcq] = useState('');
  const [newServiceAcq, setNewServiceAcq] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [editingPrice, setEditingPrice] = useState({ service: null, amount: '' });
  const [editingDeadline, setEditingDeadline] = useState({ service: null, days: '' });
  const [customDeadlineService, setCustomDeadlineService] = useState('');
  const [customDeadlineDays, setCustomDeadlineDays] = useState('');

  const serviceOptions = [
    'Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)',
    'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration', 'Others'
  ];

  if (!isOpen) return null;

  const handleAdd = (type) => {
    const list = [...(pocs[type] || [])];
    const val = type === 'acquisition' ? newAcq : 
                type === 'serviceAcquisition' ? newServiceAcq : newApartment;
    
    if (val && !list.includes(val)) {
      list.push(val);
      const updated = { ...pocs, [type]: list };
      if (type === 'acquisition') {
        updated.marketingTeam = list;
      }
      onUpdate(updated);
      if (type === 'acquisition') setNewAcq('');
      else if (type === 'serviceAcquisition') setNewServiceAcq('');
      else setNewApartment('');
    }
  };

  const handleRemove = (type, name) => {
    const list = (pocs[type] || []).filter(n => n !== name);
    const updated = { ...pocs, [type]: list };
    if (type === 'acquisition') {
      updated.marketingTeam = list;
    }
    onUpdate(updated);
  };

  const handleUpdatePrice = (service, amount) => {
    const pricing = { ...(pocs.pricing || {}) };
    pricing[service] = amount;
    onUpdate({ ...pocs, pricing });
    setEditingPrice({ service: null, amount: '' });
  };

  const handleUpdateDeadline = (service, days) => {
    const deadlines = { ...(pocs.deadlines || {}) };
    deadlines[service] = parseInt(days, 10) || 15;
    onUpdate({ ...pocs, deadlines });
    setEditingDeadline({ service: null, days: '' });
  };

  const handleAddCustomDeadline = () => {
    if (!customDeadlineService.trim() || !customDeadlineDays.trim()) return;
    const deadlines = { ...(pocs.deadlines || {}) };
    deadlines[customDeadlineService.trim()] = parseInt(customDeadlineDays, 10) || 15;
    onUpdate({ ...pocs, deadlines });
    setCustomDeadlineService('');
    setCustomDeadlineDays('');
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

          {/* Acquisition / Marketing POCs */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <UserPlus size={16} className="text-primary" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Marketing & Acquisition Team</h3>
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
                <Briefcase size={16} className="text-blue-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Service Acquisition Team</h3>
             </div>
             
             <div className="flex gap-2">
                <input 
                  value={newServiceAcq}
                  onChange={(e) => setNewServiceAcq(e.target.value)}
                  placeholder="Enter name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-sm"
                />
                <button 
                  onClick={() => handleAdd('serviceAcquisition')}
                  className="px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
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

          {/* Service Fee Structures */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Service Fee Structures</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
                {serviceOptions.map(service => {
                  const currentPrice = pocs.pricing?.[service] || '0';
                  const isEditing = editingPrice.service === service;

                  return (
                    <div key={service} className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{service}</span>
                      
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                            <input 
                              autoFocus
                              type="number"
                              value={editingPrice.amount}
                              onChange={(e) => setEditingPrice({ ...editingPrice, amount: e.target.value })}
                              className="w-24 px-3 py-1.5 rounded-lg bg-white border border-primary text-xs font-bold text-slate-900 outline-none"
                            />
                            <button 
                              onClick={() => handleUpdatePrice(service, editingPrice.amount)}
                              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-emerald-600">₹{parseFloat(currentPrice).toLocaleString('en-IN')}</span>
                            <button 
                              onClick={() => setEditingPrice({ service, amount: currentPrice })}
                              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Edit Fee
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                 })}
             </div>
          </div>

          {/* Service Deadlines Configuration */}
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Calendar size={16} className="text-purple-500" />
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Service Deadlines (Days)</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Default: 15 Days</span>
             </div>

             <div className="grid grid-cols-1 gap-3">
                {Array.from(new Set([...serviceOptions.filter(s => s !== 'Others'), ...Object.keys(pocs.deadlines || {})])).map(service => {
                  const currentDays = pocs.deadlines?.[service] || '15';
                  const isEditing = editingDeadline.service === service;

                  return (
                    <div key={service} className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{service}</span>
                      
                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                            <input 
                              autoFocus
                              type="number"
                              min="1"
                              value={editingDeadline.days}
                              onChange={(e) => setEditingDeadline({ ...editingDeadline, days: e.target.value })}
                              className="w-20 px-3 py-1.5 rounded-lg bg-white border border-purple-500 text-xs font-bold text-slate-900 outline-none"
                              placeholder="Days"
                            />
                            <button 
                              onClick={() => handleUpdateDeadline(service, editingDeadline.days)}
                              className="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">{currentDays} Days</span>
                            <button 
                              onClick={() => setEditingDeadline({ service, days: currentDays.toString() })}
                              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Edit Days
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
             </div>

             {/* Add Custom Service Deadline */}
             <div className="flex gap-2 pt-2">
                <input 
                  value={customDeadlineService}
                  onChange={(e) => setCustomDeadlineService(e.target.value)}
                  placeholder="Custom service name..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-xs"
                />
                <input 
                  type="number"
                  min="1"
                  value={customDeadlineDays}
                  onChange={(e) => setCustomDeadlineDays(e.target.value)}
                  placeholder="Days"
                  className="w-24 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-xs"
                />
                <button 
                  onClick={handleAddCustomDeadline}
                  className="px-5 bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-purple-600 transition-all"
                >
                  Add Deadline
                </button>
             </div>
          </div>

          {/* Specialist Defaults & Team Management */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operations Specialists & Priority Defaults</h3>
             </div>

             {/* EPID & E-Sign Specialist */}
             <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">1. EPID & E-Sign Specialist</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Stage: Pre-active & Ready to eSign</span>
                </div>
                <div className="flex gap-2">
                  <SearchableSelect
                    options={pocs.epidAndEsignSpecialist || pocs.serviceAcquisition || []}
                    value={pocs.defaults?.epidAndEsignSpecialist || ''}
                    onChange={(val) => {
                      const defaults = { ...(pocs.defaults || {}), epidAndEsignSpecialist: val };
                      onUpdate({ ...pocs, defaults });
                    }}
                    placeholder="Select Priority Default Member"
                    size="md"
                    className="flex-1"
                  />
                </div>
             </div>

             {/* eKYC Specialist */}
             <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">2. eKYC Specialist</span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Stage: Move to Active → eKYC Done</span>
                </div>
                <div className="flex gap-2">
                  <SearchableSelect
                    options={pocs.ekycSpecialist || pocs.serviceAcquisition || []}
                    value={pocs.defaults?.ekycSpecialist || ''}
                    onChange={(val) => {
                      const defaults = { ...(pocs.defaults || {}), ekycSpecialist: val };
                      onUpdate({ ...pocs, defaults });
                    }}
                    placeholder="Select Priority Default Member"
                    size="md"
                    className="flex-1"
                  />
                </div>
             </div>

             {/* Address Specialist */}
             <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">3. Address Specialist</span>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">Stage: eKYC Done → Ready to eSign</span>
                </div>
                <div className="flex gap-2">
                  <SearchableSelect
                    options={pocs.addressSpecialist || pocs.serviceAcquisition || []}
                    value={pocs.defaults?.addressSpecialist || ''}
                    onChange={(val) => {
                      const defaults = { ...(pocs.defaults || {}), addressSpecialist: val };
                      onUpdate({ ...pocs, defaults });
                    }}
                    placeholder="Select Priority Default Member"
                    size="md"
                    className="flex-1"
                  />
                </div>
             </div>

             {/* Marketing Deadline Days Configuration */}
             <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Marketing Data Deadline (Days)</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Default: {pocs.marketingDeadlineDays || 5} Days</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={pocs.marketingDeadlineDays || 5}
                    onChange={(e) => {
                      const days = parseInt(e.target.value, 10) || 5;
                      onUpdate({ ...pocs, marketingDeadlineDays: days });
                    }}
                    className="w-32 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                    placeholder="Days (e.g. 5 or 10)"
                  />
                  <p className="text-[11px] text-slate-400 font-medium self-center">Default deadline for pre-active marketing data uploads.</p>
                </div>
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

