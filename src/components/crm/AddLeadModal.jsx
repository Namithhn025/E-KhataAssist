import React, { useState } from 'react';
import { 
  Plus, X, Search, Phone, User, Mail, Globe, 
  MapPin, Briefcase, Calendar, Users, ChevronDown, RefreshCw, ShoppingBag, Activity
} from 'lucide-react';

const AddLeadModal = ({ isOpen, onClose, onAdd, pocs = {} }) => {
  const [formData, setFormData] = useState({
    phone: '',
    customerName: '',
    email: '',
    source: '',
    society: '',
    serviceRequested: '',
    acqPOC: '',
    docsSubmitted: false,
    acquisitionDate: new Date().toISOString().split('T')[0],
    priority: 'Low'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white animate-in zoom-in-95 slide-in-from-bottom-2 duration-500 flex flex-col no-scrollbar">
        
        {/* Header */}
        <div className="px-12 pt-12 pb-8 flex justify-between items-start border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Add Lead</h2>
            <p className="text-slate-500 font-medium">Initialize a new property service request</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all rounded-2xl flex items-center justify-center group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-12 py-10 space-y-10">
          
          {/* Section 1: Contact & Identity */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Primary Identification</h3>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8">
                {/* Phone Number with Fetch */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={10} /> Phone Number
                   </label>
                   <div className="flex gap-3">
                      <div className="flex-1 relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-slate-200">
                            <span className="text-lg">🇮🇳</span>
                            <ChevronDown size={12} className="text-slate-400" />
                         </div>
                         <input 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full pl-20 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900"
                            placeholder="Search by Phone No."
                         />
                      </div>
                      <button type="button" className="px-6 bg-slate-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-500 transition-all shadow-lg flex items-center gap-2">
                         <RefreshCw size={14} /> Fetch
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={10} /> Name
                   </label>
                   <input 
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900"
                      placeholder="Enter full name"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={10} /> Email (Optional)
                   </label>
                   <input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900"
                      placeholder="Enter email ID"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag size={10} /> Priority
                   </label>
                   <select 
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                   >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Section 2: Origin & Service */}
          <div className="space-y-6 pt-4 border-t border-slate-50">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Source & Service Details</h3>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={10} /> Source
                   </label>
                   <select name="source" value={formData.source} onChange={handleChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                      <option value="">Select lead source</option>
                      <option value="Direct">Direct</option>
                      <option value="Referral">Referral</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Partner">Partner</option>
                   </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={10} /> Society
                   </label>
                   <div className="relative">
                      <Search size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         name="society"
                         value={formData.society}
                         onChange={handleChange}
                         required
                         className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                         placeholder="Search or select a society"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Briefcase size={10} /> Service
                   </label>
                   <select name="serviceRequested" value={formData.serviceRequested} onChange={handleChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                      <option value="">Choose service type</option>
                      <option value="Ekatha">Ekatha</option>
                      <option value="Katha Transfer (Combo)">Katha Transfer (Combo)</option>
                      <option value="New Katha (Combo)">New Katha (Combo)</option>
                      <option value="Bescom">Bescom</option>
                      <option value="MOU">MOU</option>
                      <option value="MODT Cancellation">MODT Cancellation</option>
                      <option value="Property Registration">Property Registration</option>
                      <option value="Others">Others</option>
                   </select>
                </div>
              </div>
          </div>

          {/* Section 3: Assignment & Date */}
          <div className="space-y-6 pt-4 border-t border-slate-50">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Assignment & Timeline</h3>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition POC</label>
                   <select name="acqPOC" value={formData.acqPOC} onChange={handleChange} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                      <option value="">Select acquisition POC</option>
                      <option value="Rakshith">Rakshith</option>
                      <option value="Ajay">Ajay</option>
                      {pocs.acquisition?.filter(name => name !== 'Rakshith' && name !== 'Ajay').map(name => (
                         <option key={name} value={name}>{name}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Acquisition</label>
                   <div className="relative">
                      <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         type="date"
                         name="acquisitionDate"
                         value={formData.acquisitionDate}
                         onChange={handleChange}
                         required
                         className="w-full pl-16 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-slate-900"
                      />
                   </div>
                </div>

                <div className="flex items-end">
                   <button type="button" className="h-14 px-6 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-2xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group w-full">
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      <span className="text-xs uppercase tracking-widest">Add Agent</span>
                   </button>
                </div>
             </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-10 border-t border-slate-100">
             <button 
                type="button" 
                onClick={() => setFormData({})}
                className="px-12 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-[1.5rem] transition-all flex items-center gap-2"
             >
                <RefreshCw size={14} /> Clear
             </button>
             <button 
                type="submit"
                className="flex-1 bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-300 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3"
             >
                <Users size={20} /> Add Lead
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
