import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Bell, Plus, AlertTriangle, CheckCircle2, BellOff, Filter,
  ChevronUp, ChevronDown, X, Calendar, Clock, User, Phone,
  Building2, StickyNote, ArrowUpDown, RefreshCw
} from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────────────── */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const daysBetween = (a, b) =>
  Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toTimestamp = (dateStr) => Timestamp.fromDate(new Date(dateStr));

/* ─── Add/Edit Modal ─────────────────────────────────────────── */
export const ReminderModal = ({ isOpen, onClose, onSave, customers, editData, prefilledCustomer }) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultDue = addDays(today, 6).toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    customerId: '',
    startDate: today,
    nextDueDate: defaultDue,
    recurrenceDays: 6,
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [leadSearch, setLeadSearch] = useState('');

  // Exclude Closed service status leads from dropdown
  const activeLeads = useMemo(() => {
    const base = customers.filter(c => c.serviceStatus !== 'Closed');
    if (!leadSearch.trim()) return base;
    const q = leadSearch.toLowerCase();
    return base.filter(c =>
      c.customerName?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      (c.apartment || c.society || '').toLowerCase().includes(q)
    );
  }, [customers, leadSearch]);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        customerId: editData.customerId || '',
        startDate: editData.startDate?.toDate
          ? editData.startDate.toDate().toISOString().split('T')[0]
          : editData.startDate || today,
        nextDueDate: editData.nextDueDate?.toDate
          ? editData.nextDueDate.toDate().toISOString().split('T')[0]
          : editData.nextDueDate || defaultDue,
        recurrenceDays: editData.recurrenceDays || 6,
        notes: editData.notes || '',
      });
    } else if (prefilledCustomer) {
      setForm({
        title: `${prefilledCustomer.serviceRequested || prefilledCustomer.serviceType || 'Lead'} Follow-up`,
        customerId: prefilledCustomer.id,
        startDate: today,
        nextDueDate: defaultDue,
        recurrenceDays: 6,
        notes: prefilledCustomer.notes || '',
      });
    } else {
      setForm({ title: '', customerId: '', startDate: today, nextDueDate: defaultDue, recurrenceDays: 6, notes: '' });
    }
    setErrors({});
  }, [editData, isOpen, prefilledCustomer]);

  const handleRecurrenceChange = (days) => {
    const next = addDays(form.startDate, Number(days)).toISOString().split('T')[0];
    setForm(f => ({ ...f, recurrenceDays: Number(days), nextDueDate: next }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.nextDueDate) e.nextDueDate = 'Due date is required';
    if (form.nextDueDate < form.startDate) e.nextDueDate = 'Due date must be after start date';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const selectedCustomer = customers.find(c => c.id === form.customerId) || prefilledCustomer;
    onSave({
      title: form.title.trim(),
      customerId: form.customerId,
      userName: selectedCustomer?.customerName || '',
      userPhone: selectedCustomer?.phone || '',
      userApartment: selectedCustomer?.apartment || selectedCustomer?.society || '',
      startDate: toTimestamp(form.startDate),
      nextDueDate: toTimestamp(form.nextDueDate),
      recurrenceDays: form.recurrenceDays,
      notes: form.notes.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Bell size={20} className="text-violet-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {editData ? 'Edit Reminder' : 'New Reminder'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Follow up on E-Khata Transfer"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-violet-400'}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Link to Customer */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">
              Link to Lead (optional)
              <span className="ml-2 normal-case font-semibold text-violet-500 tracking-normal">— excludes Closed services</span>
            </label>
            {prefilledCustomer ? (
              <div className="px-4 py-3 rounded-2xl border border-violet-200 bg-violet-50/50 text-sm font-bold text-violet-700 flex items-center justify-between">
                <span>{prefilledCustomer.customerName} · {prefilledCustomer.phone}</span>
                <span className="text-xs font-semibold text-slate-400">Locked</span>
              </div>
            ) : (
              <>
                {/* Search within leads */}
                <input
                  type="text"
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  placeholder="Search name, phone or apartment..."
                  className="w-full mb-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                />
                <select
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 focus:border-violet-400"
                  size={activeLeads.length > 0 ? Math.min(activeLeads.length + 1, 6) : 2}
                >
                  <option value="">— None —</option>
                  {activeLeads.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} · {c.phone} · {c.apartment || c.society || '—'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  {activeLeads.length} active lead{activeLeads.length !== 1 ? 's' : ''} available
                </p>
              </>
            )}
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 focus:border-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Recurrence</label>
              <select
                value={form.recurrenceDays}
                onChange={e => handleRecurrenceChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 focus:border-violet-400"
              >
                {[3, 6, 7, 10, 14, 21, 30].map(d => (
                  <option key={d} value={d}>Every {d} days</option>
                ))}
                <option value={1}>Custom</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Next Due Date *</label>
            <input
              type="date"
              value={form.nextDueDate}
              onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))}
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 ${errors.nextDueDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-violet-400'}`}
            />
            {errors.nextDueDate && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.nextDueDate}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add any notes for this reminder..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-violet-100 focus:border-violet-400 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-200 transition-all active:scale-[0.98]"
          >
            {editData ? 'Update' : 'Create Reminder'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Resolve Notes Modal ────────────────────────────────────── */
const ResolveModal = ({ isOpen, onClose, onResolve, reminder }) => {
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState(
    addDays(new Date(), reminder?.recurrenceDays || 6).toISOString().split('T')[0]
  );

  useEffect(() => {
    setNotes(reminder?.notes || '');
    setNextDate(addDays(new Date(), reminder?.recurrenceDays || 6).toISOString().split('T')[0]);
  }, [reminder]);

  if (!isOpen || !reminder) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Resolve Reminder</h2>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-sm font-bold text-slate-700">{reminder.title}</p>
          {reminder.userName && (
            <p className="text-xs text-slate-500 mt-1">{reminder.userName} · {reminder.userPhone}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Add Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="What was discussed or done?"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 resize-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Next Due Date</label>
            <input
              type="date"
              value={nextDate}
              onChange={e => setNextDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            onClick={() => onResolve({ notes, nextDate })}
            className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const RemindersSection = ({ isAdmin, currentUser }) => {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApartment, setFilterApartment] = useState('');
  const [sortField, setSortField] = useState('nextDueDate');
  const [sortDir, setSortDir] = useState('asc');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ── Load Customers directly (self-contained) ───────────────── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), snap => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error('Customers fetch in RemindersSection:', err));
    return unsub;
  }, []);

  /* ── Load Reminders ─────────────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, 'reminders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Reminders fetch error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ── Create ─────────────────────────────────────────────────── */
  const handleCreate = async (data) => {
    try {
      await addDoc(collection(db, 'reminders'), {
        ...data,
        status: 'pending',
        createdBy: currentUser?.uid || 'admin',
        createdByName: currentUser?.displayName || currentUser?.email || 'Admin',
        createdAt: Timestamp.now(),
        resolvedAt: null,
      });
      setIsAddOpen(false);
    } catch (e) {
      console.error('Create reminder error:', e);
      alert('Failed to create reminder: ' + e.message);
    }
  };

  /* ── Update ─────────────────────────────────────────────────── */
  const handleUpdate = async (data) => {
    try {
      await updateDoc(doc(db, 'reminders', editData.id), data);
      setEditData(null);
    } catch (e) {
      console.error('Update reminder error:', e);
      alert('Failed to update reminder: ' + e.message);
    }
  };

  /* ── Resolve ─────────────────────────────────────────────────── */
  const handleResolve = async ({ notes, nextDate }) => {
    try {
      await updateDoc(doc(db, 'reminders', resolveTarget.id), {
        status: 'resolved',
        notes,
        resolvedAt: Timestamp.now(),
        nextDueDate: toTimestamp(nextDate),
      });
      setResolveTarget(null);
    } catch (e) {
      console.error('Resolve error:', e);
    }
  };

  /* ── No Reminder Needed ─────────────────────────────────────── */
  const handleNoReminder = async (id) => {
    try {
      await updateDoc(doc(db, 'reminders', id), { status: 'no-reminder' });
    } catch (e) {
      console.error('No-reminder error:', e);
    }
  };

  /* ── Terminate (admin only — soft close, hidden by default) ── */
  const handleTerminate = async (id) => {
    if (!window.confirm('Terminate this reminder? It will be hidden from the default view but kept in records.')) return;
    try {
      await updateDoc(doc(db, 'reminders', id), {
        status: 'terminated',
        terminatedAt: Timestamp.now(),
      });
    } catch (e) {
      console.error('Terminate error:', e);
    }
  };

  /* ── Reopen (reset to pending) ──────────────────────────────── */
  const handleReopen = async (reminder) => {
    const newDue = addDays(new Date(), reminder.recurrenceDays || 6).toISOString().split('T')[0];
    try {
      await updateDoc(doc(db, 'reminders', reminder.id), {
        status: 'pending',
        nextDueDate: toTimestamp(newDue),
        resolvedAt: null,
      });
    } catch (e) {
      console.error('Reopen error:', e);
    }
  };

  /* ── Derived: is overdue? ───────────────────────────────────── */
  const isOverdue = (r) => {
    if (r.status !== 'pending') return false;
    const due = r.nextDueDate?.toDate ? r.nextDueDate.toDate() : new Date(r.nextDueDate);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  };

  /* ── Unique apartments from reminders ───────────────────────── */
  const apartmentOptions = useMemo(() => {
    const set = new Set(reminders.map(r => r.userApartment).filter(Boolean));
    return [...set].sort();
  }, [reminders]);

  /* ── Filtered + Sorted List ─────────────────────────────────── */
  const displayList = useMemo(() => {
    let list = [...reminders];

    // Filter by status
    if (filterStatus === 'all') list = list.filter(r => r.status !== 'terminated');
    else list = list.filter(r => r.status === filterStatus);

    // Filter by apartment
    if (filterApartment) list = list.filter(r => r.userApartment === filterApartment);

    // Sort
    list.sort((a, b) => {
      let av, bv;
      if (sortField === 'nextDueDate') {
        av = a.nextDueDate?.toDate ? a.nextDueDate.toDate() : new Date(a.nextDueDate || 0);
        bv = b.nextDueDate?.toDate ? b.nextDueDate.toDate() : new Date(b.nextDueDate || 0);
      } else if (sortField === 'startDate') {
        av = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate || 0);
        bv = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate || 0);
      } else if (sortField === 'age') {
        av = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate || 0);
        bv = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate || 0);
      } else {
        av = a[sortField] || '';
        bv = b[sortField] || '';
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    // Overdue pending float to top
    const overdue = list.filter(r => isOverdue(r));
    const rest = list.filter(r => !isOverdue(r));
    return [...overdue, ...rest];
  }, [reminders, filterStatus, filterApartment, sortField, sortDir]);

  /* ── Sort toggle ─────────────────────────────────────────────── */
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-400" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-violet-600" />
      : <ChevronDown size={12} className="text-violet-600" />;
  };

  /* ── Stats ───────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total: reminders.filter(r => r.status !== 'terminated').length,
    pending: reminders.filter(r => r.status === 'pending').length,
    overdue: reminders.filter(r => isOverdue(r)).length,
    resolved: reminders.filter(r => r.status === 'resolved').length,
    terminated: reminders.filter(r => r.status === 'terminated').length,
  }), [reminders]);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
      {/* Page Title + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reminders</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track follow-ups and pending actions for leads</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditData(null); setIsAddOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-xl shadow-violet-200 transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> New Reminder
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Active',     value: stats.total,      color: 'bg-slate-100 text-slate-700',    ring: 'ring-slate-200'   },
          { label: 'Pending',    value: stats.pending,    color: 'bg-amber-50 text-amber-700',     ring: 'ring-amber-200'   },
          { label: 'Overdue',    value: stats.overdue,    color: 'bg-red-50 text-red-700',         ring: 'ring-red-200'     },
          { label: 'Resolved',   value: stats.resolved,   color: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
          { label: 'Terminated', value: stats.terminated, color: 'bg-slate-200 text-slate-500',    ring: 'ring-slate-300'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 ring-1 ${s.color} ${s.ring}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filters:</span>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all"
        >
          <option value="all">All Active</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="no-reminder">No Reminder</option>
          <option value="terminated">Terminated</option>
        </select>

        {/* Apartment Filter */}
        <select
          value={filterApartment}
          onChange={e => setFilterApartment(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all"
        >
          <option value="">All Apartments</option>
          {apartmentOptions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Sort buttons */}
        <div className="flex gap-2 ml-auto">
          {[
            { field: 'nextDueDate', label: 'Due Date' },
            { field: 'startDate', label: 'Start Date' },
            { field: 'age', label: 'Age (S-Date)' },
          ].map(s => (
            <button
              key={s.field}
              onClick={() => toggleSort(s.field)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition-all ${sortField === s.field ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {s.label} <SortIcon field={s.field} />
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading reminders...
          </div>
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Bell size={40} className="opacity-30" />
            <p className="font-bold text-sm">No reminders found</p>
            {isAdmin && <p className="text-xs">Click "New Reminder" to get started</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-6"></th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <button onClick={() => toggleSort('age')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                      User Details <SortIcon field="age" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <button onClick={() => toggleSort('startDate')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                      S-Date / Age <SortIcon field="startDate" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <button onClick={() => toggleSort('nextDueDate')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                      Due Date <SortIcon field="nextDueDate" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.map(r => {
                  const overdue = isOverdue(r);
                  const dueDate = r.nextDueDate?.toDate ? r.nextDueDate.toDate() : new Date(r.nextDueDate || Date.now());
                  const startDate = r.startDate?.toDate ? r.startDate.toDate() : new Date(r.startDate || Date.now());
                  const ageDays = daysBetween(startDate, new Date());
                  const daysUntilDue = daysBetween(new Date(), dueDate);

                  const rowBg = r.status === 'terminated'
                    ? 'bg-slate-100/70 opacity-60 hover:opacity-80'
                    : r.status === 'resolved'
                    ? 'bg-emerald-50/60 hover:bg-emerald-50'
                    : r.status === 'no-reminder'
                    ? 'bg-slate-50/80 hover:bg-slate-100/80'
                    : overdue
                    ? 'bg-red-100 border-l-4 border-red-500 hover:bg-red-100'
                    : 'bg-white hover:bg-violet-50/30';

                  return (
                    <tr key={r.id} className={`transition-colors ${rowBg}`}>
                      {/* Importance icon */}
                      <td className="px-4 py-4 text-center">
                        {overdue && (
                          <div title="Overdue! Action needed" className="flex items-center justify-center">
                            <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{r.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                          {r.recurrenceDays}d cycle
                        </p>
                      </td>

                      {/* User Details */}
                      <td className="px-4 py-4">
                        {r.userName ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <User size={11} className="text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-700 text-xs">{r.userName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              <span className="text-slate-500 text-xs font-medium">{r.userPhone || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building2 size={11} className="text-slate-400 shrink-0" />
                              <span className="text-slate-500 text-xs font-medium">{r.userApartment || '—'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs font-semibold">—</span>
                        )}
                      </td>

                      {/* S-Date / Age */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <Calendar size={11} className="text-slate-400" />
                            {formatDate(r.startDate)}
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                            <Clock size={9} /> {ageDays}d ago
                          </div>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                            <Calendar size={11} className={overdue ? 'text-red-400' : 'text-slate-400'} />
                            {formatDate(r.nextDueDate)}
                          </div>
                          {r.status === 'pending' && (
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                              overdue
                                ? 'bg-red-100 text-red-700'
                                : daysUntilDue <= 2
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {overdue
                                ? `${Math.abs(daysUntilDue)}d overdue`
                                : daysUntilDue === 0
                                ? 'Due today'
                                : `In ${daysUntilDue}d`}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        {r.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 size={11} /> Resolved
                          </span>
                        ) : r.status === 'no-reminder' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                            <BellOff size={11} /> No Reminder
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            overdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            <Bell size={11} className={overdue ? 'animate-pulse' : ''} />
                            {overdue ? 'Overdue' : 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-4 max-w-[180px]">
                        {r.notes ? (
                          <div className="flex items-start gap-1.5">
                            <StickyNote size={11} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 font-medium line-clamp-2">{r.notes}</p>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setResolveTarget(r)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97] shadow-sm shadow-emerald-200"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => handleNoReminder(r.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]"
                              >
                                No Reminder
                              </button>
                            </>
                          )}
                          {(r.status === 'resolved' || r.status === 'no-reminder') && (
                            <button
                              onClick={() => handleReopen(r)}
                              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]"
                            >
                              Reopen
                            </button>
                          )}
                          {isAdmin && r.status !== 'terminated' && (
                            <button
                              onClick={() => { setEditData(r); setIsAddOpen(true); }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-violet-50 text-slate-600 hover:text-violet-700 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]"
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && r.status !== 'terminated' && (
                            <button
                              onClick={() => handleTerminate(r.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]"
                            >
                              Terminate
                            </button>
                          )}
                          {isAdmin && r.status === 'terminated' && (
                            <button
                              onClick={() => handleReopen(r)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReminderModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setEditData(null); }}
        onSave={editData ? handleUpdate : handleCreate}
        customers={customers}
        editData={editData}
      />
      <ResolveModal
        isOpen={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        onResolve={handleResolve}
        reminder={resolveTarget}
      />
    </div>
  );
};

export default RemindersSection;
