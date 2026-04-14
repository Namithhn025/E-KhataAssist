import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, DollarSign, User, Trash2, 
  ChevronDown, X, Check, Filter
} from 'lucide-react';
import { 
  collection, addDoc, getDocs, query, orderBy, 
  deleteDoc, doc, Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';

const ExpensesSection = ({ isAdmin, sortBy = 'Date Added', searchQuery = '' }) => {
  const [expenses, setExpenses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    addedBy: 'Ajay'
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        createdAt: new Date().toISOString()
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        addedBy: 'Ajay'
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.addedBy.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'Date Added' || sortBy === 'Recently Updated') {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return dateB - dateA;
    }
    // Default or other sorts: sort by the specific expense date field
    return new Date(b.date) - new Date(a.date);
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.cost, 0);

  return (
    <div className="px-8 pb-20 pt-4 space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-2">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Company Expenses</h2>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Track and manage internal costs</p>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Period Cost</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <DollarSign size={16} />
              </div>
           </div>
           <p className="text-3xl font-black text-slate-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
           <p className="text-[10px] font-bold text-slate-500 mt-1">Based on active filters</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Expense Name</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Added By</th>
                <th className="px-8 py-5 text-right">Cost</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">Loading records...</td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold text-sm">No expense records found.</td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                       <p className="text-sm font-black text-slate-900">{exp.name}</p>
                    </td>
                    <td className="px-8 py-4">
                       <p className="text-xs font-bold text-slate-500">{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${exp.addedBy === 'Ajay' ? 'bg-primary' : 'bg-indigo-500'}`} />
                        <p className="text-xs font-black text-slate-700 uppercase tracking-widest">{exp.addedBy}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <p className="text-sm font-black text-slate-900 tracking-tight">₹{exp.cost.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <button 
                         onClick={() => handleDeleteExpense(exp.id)}
                         className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Expense</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  placeholder="Rent, Office Supplies, etc..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost (₹)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added By</label>
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm cursor-pointer"
                  value={formData.addedBy}
                  onChange={(e) => setFormData({...formData, addedBy: e.target.value})}
                >
                  <option value="Ajay">Ajay</option>
                  <option value="Rakshith">Rakshith</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all mt-4"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesSection;
