import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, query, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Plus, Compass, Calendar, DollarSign, Users, Hash, Phone, User, X } from 'lucide-react';

const CampSection = ({ isAdmin, pocs }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    apartmentName: '',
    campaignDate: new Date().toISOString().split('T')[0],
    expenses: '',
    acquisitionTeam: [],
    leadsCount: 0,
    contactNumber: '',
    associateName: '',
    status: 'Pending'
  });

  useEffect(() => {
    const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Campaigns fetch error:", error);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, acquisitionTeam: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'campaigns'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({
        apartmentName: '',
        campaignDate: new Date().toISOString().split('T')[0],
        expenses: '',
        acquisitionTeam: [],
        leadsCount: 0,
        contactNumber: '',
        associateName: '',
        status: 'Pending'
      });
    } catch (error) {
      console.error("Error adding campaign:", error);
      alert("Failed to add campaign.");
    }
  };

  const updateCampaign = async (id, field, value) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'campaigns', id), { [field]: value });
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  const deleteCampaign = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteDoc(doc(db, 'campaigns', id));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  return (
    <div className="px-8 pb-20 overflow-x-hidden pt-4">
      {/* Header section with add button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
           <Compass className="text-primary" size={20} />
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Campaign Overview</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-md transition-all"
        >
          <Plus size={16} /> Add Campaign
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                <th className="px-6 py-5">Apartment Name</th>
                <th className="px-6 py-5">Campaign Date</th>
                <th className="px-6 py-5">Acq. Team</th>
                <th className="px-6 py-5 text-center">Leads Count</th>
                {isAdmin && (
                  <>
                    <th className="px-6 py-5">Expenses</th>
                    <th className="px-6 py-5">Association Contact Details</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 4} className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    No campaigns recorded yet
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6">
                      <div className="font-bold text-slate-900">{camp.apartmentName}</div>
                    </td>
                    <td className="px-6 py-6 font-bold text-slate-700">
                      {isAdmin ? (
                        <input 
                          type="date"
                          value={camp.campaignDate || ''}
                          onChange={(e) => updateCampaign(camp.id, 'campaignDate', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      ) : (
                        camp.campaignDate
                      )}
                    </td>
                    <td className="px-6 py-6 text-xs text-slate-600 font-medium">
                      {(camp.acquisitionTeam || []).join(', ') || 'N/A'}
                    </td>
                        <td className="px-6 py-6 text-center">
                          <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{camp.leadsCount || 0}</span>
                        </td>
                        {isAdmin && (
                          <>
                            <td className="px-6 py-6">
                              <input 
                                type="number"
                                value={camp.expenses || ''}
                                onChange={(e) => updateCampaign(camp.id, 'expenses', e.target.value)}
                                className="w-24 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-200"
                                placeholder="₹ 0"
                              />
                            </td>
                            <td className="px-6 py-6">
                              <div className="space-y-2">
                                <input 
                                  type="text"
                                  value={camp.associateName || ''}
                                  onChange={(e) => updateCampaign(camp.id, 'associateName', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-400"
                                  placeholder="Associate Name"
                                />
                                <input 
                                  type="text"
                                  value={camp.contactNumber || ''}
                                  onChange={(e) => updateCampaign(camp.id, 'contactNumber', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/20 placeholder-slate-300"
                                  placeholder="Contact Number"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-6 border-l border-slate-100">
                              <div className="flex flex-col gap-2 items-center justify-center">
                                <select 
                                  value={camp.status || 'Pending'} 
                                  onChange={(e) => updateCampaign(camp.id, 'status', e.target.value)}
                                  className={`border text-[10px] uppercase font-black tracking-widest rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none w-full max-w-[120px] text-center ${
                                    camp.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    camp.status === 'Visit again' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Visit again">Visit again</option>
                                </select>
                                <button 
                                  onClick={() => deleteCampaign(camp.id)}
                                  className="text-[10px] uppercase font-black w-full max-w-[120px] text-center tracking-widest text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto w-full border border-slate-100 p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Campaign</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apartment Name *</label>
                  <input required name="apartmentName" value={formData.apartmentName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none" placeholder="e.g. Prestige Shantiniketan" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Date *</label>
                  <input type="date" required name="campaignDate" value={formData.campaignDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. of Leads Returns *</label>
                  <input type="number" required min="0" name="leadsCount" value={formData.leadsCount} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm focus:ring-4 focus:ring-primary/10 outline-none" />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Team * (Hold Ctrl/Cmd to select multiple)</label>
                  <select multiple required name="acquisitionTeam" value={formData.acquisitionTeam} onChange={handleMultiSelect} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/10 min-h-[100px]">
                    {(pocs?.acquisition || []).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <>
                    <div className="col-span-2 space-y-2 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Admin Only Fields</label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses (₹)</label>
                      <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-red-50 border border-red-100 font-bold text-red-600 focus:ring-4 focus:ring-red-100 outline-none" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Associate Name</label>
                      <input type="text" name="associateName" value={formData.associateName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold focus:ring-4 focus:ring-primary/10 outline-none" placeholder="Name of point of contact" />
                    </div>

                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Associate Contact Number</label>
                       <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 font-bold focus:ring-4 focus:ring-primary/10 outline-none" placeholder="Mobile number" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-6">
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs">
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampSection;
