import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, getDocs, getDoc, query, where, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Phone, MessageCircle, BookOpen, Copy, Check, Filter, FileText, Plus, Search, User, Trash2, AlertTriangle } from 'lucide-react';

import Sidebar from './crm/Sidebar';
import DashboardHeader from './crm/DashboardHeader';
import MetricSummary from './crm/MetricSummary';
import FilterBar from './crm/FilterBar';
import AddLeadModal from './crm/AddLeadModal';
import AdminSettingsModal from './crm/AdminSettingsModal';
import NestedServicesTable from './crm/NestedServicesTable';
import CampSection from './crm/CampSection';
import MassUploadModal from './crm/MassUploadModal';
import ExpensesSection from './crm/ExpensesSection';
import RemindersSection, { ReminderModal } from './crm/RemindersSection';
import { setDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { ChevronDown, MessageSquare, DollarSign, Bell, X, Edit2, CopyPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedSource, setSelectedSource] = useState('sales');
  const [customers, setCustomers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date Added');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState('');
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [noteInputId, setNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [servicesSubMode, setServicesSubMode] = useState('active');
  const [showCorrupted, setShowCorrupted] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState(['priority', 'acqPOC', 'opsSpecialist', 'docSource', 'serviceAcqPOC', 'stage', 'service']);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);
  const rowsPerPage = 20;
  const { user, logout } = useAuth();
  const [reminderCustomer, setReminderCustomer] = useState(null);
  const autoAssignRanRef = useRef(false);

  const handleSaveReminder = async (data) => {
    try {
      await addDoc(collection(db, 'reminders'), {
        ...data,
        status: 'pending',
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Admin',
        createdAt: Timestamp.now(),
        resolvedAt: null,
      });
      setReminderCustomer(null);
    } catch (e) {
      console.error('Create reminder error from dashboard:', e);
      alert('Failed to create reminder: ' + e.message);
    }
  };
  const userRole = localStorage.getItem('crm_role') || 'worker';
  const isAdmin = userRole === 'admin';
  
  const navigate = useNavigate();

  // Reset page to 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, selectedSource, servicesSubMode]);

  // Sync docsSubmitted visibility and active filter state
  useEffect(() => {
    if (selectedSource === 'services' && servicesSubMode === 'pre-active') {
      if (!visibleFilters.includes('docsSubmitted')) {
        setVisibleFilters(prev => [...prev, 'docsSubmitted']);
      }
    } else {
      if (visibleFilters.includes('docsSubmitted')) {
        setVisibleFilters(prev => prev.filter(f => f !== 'docsSubmitted'));
        if (activeFilters.hasOwnProperty('docsSubmitted')) {
          setActiveFilters(prev => {
            const next = { ...prev };
            delete next.docsSubmitted;
            return next;
          });
        }
      }
    }
  }, [selectedSource, servicesSubMode]);

  // Load Settings (POCs & Apartments)
  const [pocs, setPocs] = useState({ 
    acquisition: ['Rasika', 'Ahmed', 'Suresh'], 
    serviceAcquisition: [], 
    service: ['Deepak', 'Manju', 'Kiran'],
    apartments: [],
    pricing: {}
  });
  // Load settings once at mount — no live listener needed (admin saves update state directly via onUpdate)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'crm_config'));
        if (snap.exists()) {
          const data = snap.data().pocs || { acquisition: [], serviceAcquisition: [], service: [], apartments: [], pricing: {} };
          if (!data.apartments) data.apartments = [];
          if (!data.pricing) data.pricing = {};
          setPocs(data);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Load Customers
  useEffect(() => {
    let q = query(collection(db, 'customers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
       console.error("CRITICAL: Firestore 'customers' fetch failed:", error);
       if (error.code === 'permission-denied') {
          console.warn("Permission denied. Ensure your security rules allow reading 'customers'.");
       } else if (error.code === 'not-found' || error.message.includes('not been initialized')) {
          alert("Firebase Error: Cloud Firestore is not enabled for this project. Please create the database in the Firebase Console.");
       }
    });
    return unsubscribe;
  }, []);

  // Auto-assign default specialists — runs ONCE at login via getDocs (not on every snapshot)
  useEffect(() => {
    if (autoAssignRanRef.current) return;
    if (!pocs.defaults) return;
    const defaults = pocs.defaults;
    if (!defaults.epidAndEsignSpecialist && !defaults.ekycSpecialist && !defaults.addressSpecialist) return;

    autoAssignRanRef.current = true;

    const runAutoAssign = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'customers'), where('marketingMovedDate', '!=', null), where('isMarketingData', '==', false))
        );
        snap.docs.forEach(async (d) => {
          const c = d.data();
          const updates = {};
          if (!c.epidAndEsignSpecialist && defaults.epidAndEsignSpecialist)
            updates.epidAndEsignSpecialist = defaults.epidAndEsignSpecialist;
          if (!c.ekycSpecialist && defaults.ekycSpecialist)
            updates.ekycSpecialist = defaults.ekycSpecialist;
          if (!c.addressSpecialist && defaults.addressSpecialist)
            updates.addressSpecialist = defaults.addressSpecialist;
          if (Object.keys(updates).length > 0) {
            try { await updateDoc(doc(db, 'customers', d.id), updates); }
            catch (e) { console.error('Auto-assign failed for', d.id, e); }
          }
        });
      } catch (e) {
        console.error('Auto-assign getDocs failed:', e);
        autoAssignRanRef.current = false; // allow retry on next mount if it errored
      }
    };

    runAutoAssign();
  }, [pocs.defaults]); // only re-evaluates if defaults change (admin saves new settings)

  // Load Campaigns & Expenses once for Overview metrics — not real-time, changes are infrequent
  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [campSnap, expSnap] = await Promise.all([
          getDocs(query(collection(db, 'campaigns'))),
          getDocs(query(collection(db, 'expenses'))),
        ]);
        setCampaigns(campSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setExpenses(expSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load overview data:', e);
      }
    };
    loadOverviewData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handlePOCUpdate = async (customerId, field, value) => {
    try {
      if (!field || !customerId) return;
      const cleanVal = value === undefined ? '' : value;
      await updateDoc(doc(db, 'customers', customerId), { [field]: cleanVal });
    } catch (error) {
      console.error("Firestore Update Error:", field, value, error);
      alert(`Failed to update ${field}: ${error.message}`);
    }
  };

  const handleAddNote = async (customerId) => {
    if (!noteText.trim()) return;
    
    const newNote = {
      text: noteText,
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };

    await updateDoc(doc(db, 'customers', customerId), {
      internalNotes: arrayUnion(newNote)
    });

    setNoteText('');
    setNoteInputId(null);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteDoc(doc(db, 'customers', customerToDelete.id));
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Deletion Error:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  const handleFixMarketingData = async () => {
    const [snap1, snap2] = await Promise.all([
      getDocs(query(collection(db, 'customers'), where('marketingMovedDate', '!=', null))),
      getDocs(query(collection(db, 'customers'), where('sourceVault', '==', 'marketing'), where('docsSubmitted', '==', true))),
    ]);
    const batch = writeBatch(db);
    let count = 0;
    const seen = new Set();
    [...snap1.docs, ...snap2.docs].forEach(docSnap => {
      if (seen.has(docSnap.id)) return;
      seen.add(docSnap.id);
      if (docSnap.data().isMarketingData !== false) {
        batch.update(doc(db, 'customers', docSnap.id), { isMarketingData: false });
        count++;
      }
    });
    if (count > 0) await batch.commit();
    return count;
  };

  const handleBulkAdd = async (leads) => {
    const batch = writeBatch(db);
    
    leads.forEach(leadData => {
      let totalAmount = 0;
      if (pocs.pricing && leadData.services && leadData.services.length > 0) {
        leadData.services.forEach(service => {
          if (pocs.pricing[service]) {
            totalAmount += parseFloat(pocs.pricing[service]);
          }
        });
      }

      const customerData = {
         ...leadData,
         updatedAt: new Date().toISOString(),
         sourceVault: selectedSource === 'nexus' ? 'direct' : (selectedSource || 'sales'),
         amount: totalAmount || '',
         createdAt: new Date().toISOString(),
         docsSubmitted: leadData.docsSubmitted || false,
         serviceStatus: 'Open',
         serviceStage: 'Document Received',
         status: 'Document Received'
      };

      const newDocRef = doc(collection(db, 'customers'));
      batch.set(newDocRef, customerData);
    });

    await batch.commit();
  };

  // ─── Delete Confirm Modal ───────────────────────────────────────────────────
  const DeleteConfirmModal = ({ customer, onConfirm, onCancel }) => {
    if (!customer) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 space-y-8 animate-in zoom-in-95 duration-300 border border-slate-100">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete record?</h3>
              <p className="text-sm font-medium text-slate-500 max-w-[280px]">
                You are about to delete <span className="font-black text-slate-900">{customer.customerName}</span>. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-3">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Customer ID</span>
                <span className="text-slate-600">UIDE{customer.id.substring(0, 8).toUpperCase()}</span>
             </div>
             <div className="h-px bg-slate-200/50" />
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Phone Number</span>
                <span className="text-slate-600">{customer.phone}</span>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Yes, Delete Permanently
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200/50"
            >
              Keep Record
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Corrupted lead detection ─────────────────────────────────────────────
  const getCorruptedFields = (c) => {
    const missing = [];
    if (!c.customerName?.trim()) missing.push('Name');
    if (!c.phone?.trim()) missing.push('Phone');
    if (!c.serviceType && !c.serviceRequested && !c.service) missing.push('Service Type');
    if (!c.apartment?.trim()) missing.push('Apartment');
    return missing;
  };

  // ─── Master metrics computed from real Firestore data ─────────────────────
  const serviceLeads = customers.filter(c => c.serviceType || c.serviceRequested || c.service);

  const metrics = {
    // Sales metrics
    total:     customers.length,
    qualified: customers.filter(c => c.status === 'Approved').length,
    stale:     customers.filter(c => c.status === 'Rejected').length,
    followUp:  customers.filter(c => c.status === 'Follow Up').length,
    missed:    customers.filter(c => c.status === 'Missed').length,
    advance:   customers.filter(c => c.payment === 'Pending').length,

    // Services metrics — match exactly the filter logic in filteredCustomers
    totalSRs:  serviceLeads.length,
    preActive: serviceLeads.filter(c =>
      (!c.docsSubmitted || !c.docSource) &&
      !c.isMarketingData &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Pre-Invoice' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    active: serviceLeads.filter(c =>
      c.docsSubmitted && c.docSource &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Pre-Invoice' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    deadlines: serviceLeads.filter(c =>
      c.docsSubmitted && c.serviceStage !== 'Application Submitted' &&
      c.serviceStatus !== 'Blocked' && c.serviceStatus !== 'Closed' &&
      c.serviceStatus !== 'Pre-Invoice' &&
      c.serviceStatus !== 'Retry'   && c.serviceStatus !== 'Approved'
    ).length,
    blocked:    serviceLeads.filter(c => c.serviceStatus === 'Blocked').length,
    closed:     serviceLeads.filter(c => c.serviceStatus === 'Closed').length,
    preInvoice: serviceLeads.filter(c => c.serviceStatus === 'Pre-Invoice').length,
    retry:      serviceLeads.filter(c => c.serviceStatus === 'Retry').length,
    approved:   serviceLeads.filter(c => c.serviceStatus === 'Approved').length,
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !searchQuery || 
      c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.ePID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.srId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.apartment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ec?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.generatedEC?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialNotes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // View Filtering
    if (selectedSource === 'nexus') {
       // All leads are visible in Nexus
    } else if (selectedSource === 'sales') {
       if (c.sourceVault && c.sourceVault !== 'sales' && !(c.sourceVault === 'marketing' && (!c.isMarketingData || c.marketingMovedDate))) return false;
       if (showCorrupted) {
         const missing = getCorruptedFields(c);
         if (missing.length === 0) return false;
       }
    } else if (selectedSource === 'invoices') {
       if (c.serviceStatus !== 'Approved') return false;
    } else if (selectedSource === 'services') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;
       
        // Terminal states — driven by serviceStatus set automatically
        const isBlocked    = c.serviceStatus === 'Blocked';
        const isClosed     = c.serviceStatus === 'Closed';
        const isPreInvoice = c.serviceStatus === 'Pre-Invoice';
        const isRetry      = c.serviceStatus === 'Retry';
        const isApproved   = c.serviceStatus === 'Approved';

        // Pre-active: docs NOT yet submitted OR doc source missing (and not marketing data)
        const isPreActive = (!c.docsSubmitted || !c.docSource) && !isBlocked && !isClosed && !isPreInvoice && !isRetry && !isApproved && !c.isMarketingData;
        // Active: docs submitted AND doc source set — no serviceAcqPOC required
        const isActive = c.docsSubmitted && c.docSource && !isBlocked && !isClosed && !isPreInvoice && !isRetry && !isApproved;
        // Deadlines: docs submitted AND not yet 'Application Submitted'
        const isDeadlines = c.docsSubmitted && c.serviceStage !== 'Application Submitted' && !isBlocked && !isClosed && !isPreInvoice && !isRetry && !isApproved;

        if (servicesSubMode === 'pre-active'  && !isPreActive)  return false;
        if (servicesSubMode === 'active'      && !isActive)     return false;
        if (servicesSubMode === 'deadlines'   && !isDeadlines)  return false;
        if (servicesSubMode === 'blocked'     && !isBlocked)    return false;
        if (servicesSubMode === 'closed'      && !isClosed)     return false;
        if (servicesSubMode === 'pre-invoice' && !isPreInvoice) return false;
        if (servicesSubMode === 'retry'       && !isRetry)      return false;
        if (servicesSubMode === 'approved'    && !isApproved)   return false;
    } else if (selectedSource === 'deadlines') {
       const hasService = c.serviceType || c.serviceRequested || c.service;
       if (!hasService) return false;
       
        const isBlocked    = c.serviceStatus === 'Blocked';
        const isClosed     = c.serviceStatus === 'Closed';
        const isPreInvoice = c.serviceStatus === 'Pre-Invoice';
        const isRetry      = c.serviceStatus === 'Retry';
        const isApproved   = c.serviceStatus === 'Approved';
        const isDeadlines = c.docsSubmitted && c.serviceStage !== 'Application Submitted' && !isBlocked && !isClosed && !isPreInvoice && !isRetry && !isApproved;

        if (!isDeadlines) return false;
    } else if (selectedSource === 'marketing-deadlines') {
       // Show only marketing data leads
       if (!c.isMarketingData) return false;
       if (['Closed', 'Approved'].includes(c.serviceStatus)) return false;
    } else {
       if (c.sourceVault !== selectedSource) return false;
    }
    
    const matchesInterest = !activeFilters.interest || c.interest === activeFilters.interest;
    const matchesServiceAcqPOC = !activeFilters.serviceAcqPOC || (activeFilters.serviceAcqPOC === 'Unassigned' ? !c.serviceAcqPOC : c.serviceAcqPOC === activeFilters.serviceAcqPOC);
    const matchesPriority = !activeFilters.priority || c.priority === activeFilters.priority;
    const matchesStage = !activeFilters.stage || (c.serviceStage === activeFilters.stage);
    const matchesService = !activeFilters.service || (() => {
      const standardServices = ['Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)', 'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration'];
      const leadServices = c.serviceRequested ? c.serviceRequested.split(/,\s*/).map(s => s.trim()) : [];
      if (activeFilters.service === 'Others') {
        const hasCustomOrOthers = leadServices.some(s => s === 'Others' || !standardServices.includes(s));
        return hasCustomOrOthers || c.serviceType === 'Others' || c.service === 'Others';
      }
      return leadServices.includes(activeFilters.service) || c.serviceType === activeFilters.service || c.service === activeFilters.service;
    })();
    const matchesApartment = !activeFilters.apartment || (c.apartment === activeFilters.apartment || c.society === activeFilters.apartment);
    const matchesSource = !activeFilters.source || c.sourceVault === activeFilters.source;
    const matchesAcqPOC = !activeFilters.acqPOC || (activeFilters.acqPOC === 'Unassigned' ? !c.acqPOC : c.acqPOC === activeFilters.acqPOC);
    const matchesOpsSpecialist = !activeFilters.opsSpecialist || (
      activeFilters.opsSpecialist === 'Unassigned'
        ? (!c.epidAndEsignSpecialist && !c.ekycSpecialist && !c.addressSpecialist)
        : (c.epidAndEsignSpecialist === activeFilters.opsSpecialist || c.ekycSpecialist === activeFilters.opsSpecialist || c.addressSpecialist === activeFilters.opsSpecialist)
    );
    const matchesDocsSubmitted = !activeFilters.docsSubmitted || (() => {
      if (activeFilters.docsSubmitted === 'Submitted') return c.docsSubmitted === true;
      if (activeFilters.docsSubmitted === 'Pending') return !c.docsSubmitted;
      return true;
    })();
    const matchesDocSource = !activeFilters.docSource || (
      activeFilters.docSource === 'Unassigned'
        ? !c.docSource
        : (c.docSource?.toLowerCase() === activeFilters.docSource.toLowerCase())
    );
    const matchesEcStatus = !activeFilters.ecStatus || (c.ecStatus || 'Default') === activeFilters.ecStatus;

    return matchesSearch && matchesPriority && matchesStage && matchesService && matchesApartment && matchesSource && matchesAcqPOC && matchesServiceAcqPOC && matchesDocsSubmitted && matchesOpsSpecialist && matchesDocSource && matchesEcStatus;
  }).sort((a, b) => {
    if (sortBy === 'Deadline (Ascending)' || sortBy === 'Deadline (Descending)') {
      const getDaysLeft = (c) => {
        if (!c.docsSubmitted) return sortBy === 'Deadline (Ascending)' ? 99999 : -99999;
        const sList = (c.serviceRequested || c.serviceType || c.service || '').split(/,\s*/).filter(Boolean);
        let totalDays = 15;
        if (pocs.deadlines) {
          for (const s of sList) {
            if (pocs.deadlines[s]) { totalDays = parseInt(pocs.deadlines[s], 10) || 15; break; }
          }
        }
        const startDate = new Date(c.docsSubmittedDate || c.createdAt || Date.now());
        const elapsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return totalDays - elapsed;
      };
      const diff = getDaysLeft(a) - getDaysLeft(b);
      return sortBy === 'Deadline (Ascending)' ? diff : -diff;
    }
    if (sortBy === 'Priority (High to Low)') {
      const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
    }
    if (sortBy === 'Recently Updated') {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    }
    // Default: Date Added (Descending)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const serviceOptions = [
    'E-Khata Transfer', 'E-Khata Fresh', 'MODT Closure', 'Loan Closure', 
    'Khata Transfer (Ph-2)', 'BESCOM Transfer', 'Property Tax Assessment', 
    'Legal Opinion', 'Sale Deed Drafting', 'Gift Deed', 'Release Deed',
    'Encumbrance Certificate', 'Family Tree (14-No)'
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Fixed Left */}
        <Sidebar 
          selectedSource={selectedSource} 
          setSelectedSource={(source) => {
             if (source === 'admin') setIsAdminSettingsOpen(true);
             else if (source === 'invoices' && userRole !== 'admin') return;
             else setSelectedSource(source);
          }} 
          servicesSubMode={servicesSubMode}
          setServicesSubMode={setServicesSubMode}
          onLogout={handleLogout}
          userRole={userRole}
        />
  
        {/* Main Content - Scrollable Right */}
        <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <DashboardHeader 
            title={
              selectedSource === 'nexus' ? 'Overview' :
              selectedSource === 'camp' ? 'Camp' :
              selectedSource === 'expenses' ? 'Expenses' :
              selectedSource === 'invoices' ? 'Invoices' :
              selectedSource === 'reminders' ? 'Reminders' :
              selectedSource === 'deadlines' ? 'Deadlines' :
              selectedSource === 'marketing-deadlines' ? 'Marketing Deadlines' :
              selectedSource === 'services' ? `Services / ${servicesSubMode.charAt(0).toUpperCase() + servicesSubMode.slice(1)}` : 
              'Sales'
            }
            viewMode={selectedSource}
            onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            onNewLead={() => setIsAddCustomerOpen(true)}
            isAdmin={isAdmin}
            onExcelUpload={() => setIsMassUploadOpen(true)}
          />
  
          {/* Filter Bar */}
          {selectedSource !== 'nexus' && selectedSource !== 'reminders' && (
            <FilterBar
              activeFilters={activeFilters}
              visibleFilters={visibleFilters}
              setVisibleFilters={setVisibleFilters}
              viewMode={selectedSource}
              onFilterChange={(key, val) => { setActiveFilters({...activeFilters, [key]: val}); setCurrentPage(1); }}
              onReset={() => { setActiveFilters({}); setCurrentPage(1); }}
              pocs={pocs}
              sortBy={sortBy}
              onSortChange={setSortBy}
              customers={customers}
            />
          )}

          {selectedSource === 'sales' && isAdmin && (
            <div className="px-8 py-2 flex items-center gap-3 border-b border-slate-50 bg-white/80">
              <button
                onClick={() => { setShowCorrupted(v => !v); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${showCorrupted ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}
              >
                <span className={`w-2 h-2 rounded-full ${showCorrupted ? 'bg-white' : 'bg-red-400'}`} />
                {showCorrupted ? 'Showing Corrupted Data' : 'Show Corrupted Data'}
                {showCorrupted && (
                  <span className="ml-1 bg-white/20 text-white px-2 py-0.5 rounded-lg">
                    {filteredCustomers.length} found
                  </span>
                )}
              </button>
              {showCorrupted && <p className="text-xs text-slate-400 font-bold">Leads with missing Name, Phone, Service Type, or Apartment</p>}
            </div>
          )}

          {selectedSource !== 'nexus' && selectedSource !== 'reminders' && (
            <MetricSummary metrics={metrics} viewMode={selectedSource} />
          )}

          {/* ── OVERVIEW (NEXUS) VIEW ────────────────────────────────── */}
          {selectedSource === 'nexus' && (() => {
            const total = customers.length;
            const serviceLeadsAll = customers.filter(c => c.serviceType || c.serviceRequested || c.service);
            const salesOnly = customers.filter(c => !c.sourceVault || c.sourceVault === 'sales');

            const slices = [
              { label: 'Pre-active',  count: metrics.preActive, color: '#f59e0b', bg: 'bg-amber-400'   },
              { label: 'Active',      count: metrics.active,    color: '#22c55e', bg: 'bg-green-500'   },
              { label: 'Blocked',     count: metrics.blocked,    color: '#ef4444', bg: 'bg-red-500'     },
              { label: 'Closed',      count: metrics.closed,    color: '#3b82f6', bg: 'bg-blue-500'    },
              { label: 'Pre-Invoice', count: metrics.preInvoice,color: '#a855f7', bg: 'bg-purple-500'  },
              { label: 'Retry',       count: metrics.retry,     color: '#f97316', bg: 'bg-orange-500'  },
              { label: 'Approved',    count: metrics.approved,  color: '#10b981', bg: 'bg-emerald-500' },
            ];

            // Build conic-gradient stops
            const rawTotal = slices.reduce((s, sl) => s + sl.count, 0);
            const pieTotal = rawTotal || 1;
            let cumDeg = 0;
            const conicStops = rawTotal === 0 
              ? '#f1f5f9 0deg 360deg' // Gray circle if empty
              : slices.map(sl => {
                  const deg = (sl.count / pieTotal) * 360;
                  const stop = `${sl.color} ${cumDeg.toFixed(1)}deg ${(cumDeg + deg).toFixed(1)}deg`;
                  cumDeg += deg;
                  return stop;
                }).join(', ');

            return (
              <div className="px-8 pb-20 pt-2 space-y-8">

                {/* Top Summary Cards */}
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { label: 'Total Leads (All)',  value: total,                  sub: 'Across all pipelines',  color: 'text-slate-900',   bg: 'bg-white border-slate-100', accent: 'bg-slate-100', dot: 'bg-slate-400' },
                    { label: 'In Services',         value: serviceLeadsAll.length, sub: 'Has a service request', color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100', accent: 'bg-blue-100', dot: 'bg-blue-400' },
                    { label: 'Approved / Invoiced', value: metrics.approved,       sub: 'Ready to invoice',      color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', accent: 'bg-emerald-100', dot: 'bg-emerald-500' },
                  ].map(({ label, value, sub, color, bg, accent, dot }) => (
                    <div key={label} className={`rounded-3xl border p-7 ${bg} shadow-sm flex flex-col gap-3 relative overflow-hidden`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${accent} rounded-t-3xl opacity-60`} />
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dot}`} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      </div>
                      <p className={`text-5xl font-black tracking-tighter ${color}`}>{value.toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-400">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Pie Chart + Legend */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-blue-500 opacity-60" />
                  <div className="p-8 flex flex-col md:flex-row items-center gap-12">
                    {/* Donut / Pie */}
                    <div className="relative shrink-0">
                      <div
                        style={{
                          background: `conic-gradient(${conicStops})`,
                          width: 220,
                          height: 220,
                          borderRadius: '50%',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                        }}
                      />
                      {/* Donut hole */}
                      <div
                        className="absolute bg-white rounded-full flex flex-col items-center justify-center shadow-inner"
                        style={{ width: 110, height: 110, top: 55, left: 55 }}
                      >
                        <span className="text-3xl font-black text-slate-900">{rawTotal}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total SRs</span>
                      </div>
                    </div>

                    {/* Legend + stats */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {slices.map(sl => {
                        const pct = rawTotal > 0 ? ((sl.count / rawTotal) * 100).toFixed(1) : '0.0';
                        return (
                          <div key={sl.label} className="flex items-center gap-3 bg-slate-50/80 rounded-2xl px-4 py-3.5 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                            <div className={`w-2.5 h-2.5 rounded-full ${sl.bg} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-700 truncate">{sl.label}</p>
                              <p className="text-[10px] font-bold text-slate-400">{pct}%</p>
                            </div>
                            <span className="text-lg font-black text-slate-900">{sl.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Apartment-specific breakdown */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-50" />
                  <div className="p-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Leads by Apartment</p>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                       {Object.keys(customers.reduce((acc, c) => ({...acc, [c.apartment||'Unknown']: 1}), {})).length} Apartments
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    {Object.entries(customers.reduce((acc, c) => {
                      const apt = c.apartment || 'Unknown';
                      acc[apt] = (acc[apt] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1]).map(([apt, count]) => (
                      <button 
                         key={apt} 
                         onClick={() => {
                            setSearchQuery(apt === 'Unknown' ? '' : apt);
                            setSelectedSource('sales');
                         }}
                         className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <span className="text-xs font-bold text-slate-600 truncate mr-2 group-hover:text-primary transition-colors">{apt}</span>
                        <div className="flex items-center gap-2 shrink-0">
                           <span className="text-xs font-black text-slate-900">{count}</span>
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>

                {/* Service-specific breakdown */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 overflow-hidden">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Leads by Service Type</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {Object.entries(customers.reduce((acc, c) => {
                       const servicesList = c.services || (c.serviceRequested ? [c.serviceRequested] : (c.serviceType ? [c.serviceType] : (c.service ? [c.service] : ['No Service'])));
                       servicesList.forEach(service => {
                         acc[service] = (acc[service] || 0) + 1;
                       });
                       return acc;
                     }, {})).sort((a,b) => b[1] - a[1]).map(([service, count]) => (
                       <button 
                         key={service} 
                         onClick={() => {
                           setSearchQuery(service === 'No Service' ? '' : service);
                           setSelectedSource('services');
                         }}
                         className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-500/30 hover:bg-white hover:shadow-lg transition-all text-left flex flex-col gap-1 group"
                       >
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors truncate">{service}</p>
                         <p className="text-2xl font-black text-slate-900">{count}</p>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Expenses Summary */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Expenses Summary</p>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses (All)</p>
                           <p className="text-3xl font-black mt-1 text-red-600">
                             ₹{(
                               campaigns.reduce((sum, c) => sum + (Number(c.expenses) || 0), 0) + 
                               expenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0)
                             ).toLocaleString('en-IN')}
                           </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                          <DollarSign className="text-red-600" size={20} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Ops</p>
                          <p className="text-2xl font-black mt-1 text-slate-900">₹{expenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camp Costs</p>
                          <p className="text-2xl font-black mt-1 text-blue-600">₹{campaigns.reduce((sum, c) => sum + (Number(c.expenses) || 0), 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financials / Invoices Overview */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-5">
                      <FileText size={200} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Financial Overview</p>
                      
                      <div className="flex-1 flex flex-col justify-center gap-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Total Earned (Payment Done)</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-slate-400 mb-1">₹</span>
                          <span className="text-6xl font-black text-emerald-500 tracking-tighter">
                            {customers
                              .filter(c => c.serviceStatus === 'Approved' && c.paymentStatus === 'Done')
                              .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
                              .toLocaleString('en-IN')
                            }
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                           <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Invoices Done</p>
                              <p className="text-3xl font-black text-emerald-700">
                                {customers.filter(c => c.serviceStatus === 'Approved' && c.paymentStatus === 'Done').length}
                              </p>
                           </div>
                           <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Invoices Pending</p>
                              <p className="text-3xl font-black text-amber-700">
                                {customers.filter(c => c.serviceStatus === 'Approved' && (c.paymentStatus === 'Pending' || !c.paymentStatus)).length}
                              </p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ── INVOICES VIEW ────────────────────────────────────────── */}
          {(selectedSource === 'invoices' && userRole === 'admin') && (() => {
            const baseApprovedLeads = customers.filter(c => c.serviceStatus === 'Approved');
            const allApprovedSorted = [...baseApprovedLeads].sort(
              (a, b) => new Date(a.approvedDate || a.createdAt || 0) - new Date(b.approvedDate || b.createdAt || 0)
            );
            return (
              <div className="px-8 pb-20 pt-4">
                {/* Summary Banner */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-700">{filteredCustomers.length}</p>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Total Invoices</p>
                    </div>
                  </div>
                    <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-blue-700">
                        ₹{filteredCustomers.filter(c => c.paymentStatus === 'Done').reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Total Revenue (Done)</p>
                    </div>
                  </div>
                </div>

                {baseApprovedLeads.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-24 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <FileText size={28} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No approved leads yet</p>
                    <p className="text-xs text-slate-300">Approve leads from Services → Closed to generate invoices</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-24 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-300">
                      <Search size={28} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No invoices match the search or filter criteria</p>
                    <p className="text-xs text-slate-500 font-medium text-center">Try adjusting your filters or search query</p>
                    <button onClick={() => { setSearchQuery(''); setActiveFilters({}); }} className="mt-2 bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all">Clear Search & Filters</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer, idx) => {
                      const stableIndex = allApprovedSorted.findIndex(c => c.id === customer.id);
                      const invoiceNum = stableIndex !== -1 ? stableIndex + 1 : idx + 1;
                      return (
                        <div key={customer.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                          {/* Invoice Header */}
                          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-emerald-50/30">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <FileText size={18} className="text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Invoice #{String(invoiceNum).padStart(4, '0')}</p>
                                <p className="text-xs font-bold text-slate-400">
                                  Approved: {customer.approvedDate ? new Date(customer.approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <select 
                                value={customer.paymentStatus || 'Pending'}
                                onChange={(e) => handlePOCUpdate(customer.id, 'paymentStatus', e.target.value)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all outline-none cursor-pointer ${
                                  customer.paymentStatus === 'Done' 
                                    ? 'bg-emerald-500 text-white border-emerald-600' 
                                    : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                                }`}
                              >
                                 <option value="Pending">Payment Pending</option>
                                 <option value="Done">Payment Done</option>
                              </select>
                              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                                ✓ Approved
                              </span>
                              <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                              >
                                <FileText size={12} /> Print
                              </button>
                            </div>
                          </div>

                          {/* Invoice Body */}
                          <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-5 gap-6">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                              <p className="text-sm font-black text-slate-900">{customer.customerName}</p>
                              <p className="text-[10px] font-bold text-slate-500">{customer.phone}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service</p>
                              <p className="text-sm font-bold text-slate-900">{customer.serviceRequested || customer.service || customer.serviceType || 'N/A'}</p>
                              <p className="text-[10px] font-bold text-slate-500">{customer.apartment || customer.society || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Handled By</p>
                              <p className="text-sm font-bold text-slate-900">{customer.acqPOC || 'N/A'}</p>
                              <p className="text-[10px] font-bold text-slate-500">Acquisition POC</p>
                            </div>
                            <div className="space-y-1 md:col-span-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Special Notes</p>
                              <p className="text-xs font-bold text-slate-600 line-clamp-2 italic">{customer.specialNotes || 'No specific challenges noted'}</p>
                            </div>
                             <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                               <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2">
                                  <span className="text-emerald-600 font-black">₹</span>
                                  <input 
                                    type="text"
                                    value={customer.amount || '0'}
                                    onChange={(e) => handlePOCUpdate(customer.id, 'amount', e.target.value)}
                                    className="bg-transparent text-2xl font-black text-emerald-600 outline-none w-24"
                                  />
                               </div>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── CAMP SECTION ─────────────────────────────────────────── */}
          {selectedSource === 'camp' && (
             <CampSection 
               isAdmin={isAdmin} 
               pocs={pocs} 
               customers={customers} 
               activeFilters={activeFilters}
               searchQuery={searchQuery}
               sortBy={sortBy}
             />
          )}

          {/* ── EXPENSES SECTION ─────────────────────────────────────── */}
          {selectedSource === 'expenses' && (
             <ExpensesSection 
               isAdmin={isAdmin} 
               sortBy={sortBy}
               searchQuery={searchQuery}
             />
          )}

          {/* ── REMINDERS SECTION ───────────────────────────────────────── */}
          {selectedSource === 'reminders' && (
            <RemindersSection
              isAdmin={isAdmin}
              currentUser={null}
              customers={customers}
            />
          )}

          {/* ── MARKETING DEADLINES SECTION ─────────────────────────────── */}
          {selectedSource === 'marketing-deadlines' && (() => {
            const mkDeadlineDays = pocs.marketingDeadlineDays || 5;
            const mkLeads = filteredCustomers;
            const getStatus = (lead) => {
              const uploadDate = lead.marketingUploadDate || lead.createdAt;
              if (!uploadDate) return 'unknown';
              const elapsed = Math.floor((Date.now() - new Date(uploadDate)) / (1000 * 60 * 60 * 24));
              const remaining = mkDeadlineDays - elapsed;
              if (remaining < 0) return 'overdue';
              if (remaining <= 1) return 'reaching';
              return 'ontrack';
            };
            const overdue = mkLeads.filter(l => getStatus(l) === 'overdue').length;
            const reaching = mkLeads.filter(l => getStatus(l) === 'reaching').length;
            const ontrack = mkLeads.filter(l => getStatus(l) === 'ontrack').length;
            return (
              <div className="px-8 pb-20">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'On Track 🟢', val: ontrack, cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                    { label: 'Reaching 🟡', val: reaching, cls: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
                    { label: 'Overdue 🔴', val: overdue, cls: 'bg-red-50 border-red-100 text-red-700' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl p-5 border ${s.cls} flex items-center justify-between`}>
                      <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                      <span className="text-3xl font-black">{s.val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                          <th className="px-6 py-5">Customer</th>
                          <th className="px-6 py-5">Phone</th>
                          <th className="px-6 py-5">Service</th>
                          <th className="px-6 py-5">Site</th>
                          <th className="px-6 py-5">S-Acq. POC</th>
                          <th className="px-6 py-5">Upload Date</th>
                          <th className="px-6 py-5">Deadline Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50">
                        {mkLeads.length === 0 ? (
                          <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-bold">No marketing data leads found.</td></tr>
                        ) : mkLeads.map(lead => {
                          const uploadDate = lead.marketingUploadDate || lead.createdAt;
                          const status = getStatus(lead);
                          const elapsed = uploadDate ? Math.floor((Date.now() - new Date(uploadDate)) / (1000 * 60 * 60 * 24)) : 0;
                          const remaining = mkDeadlineDays - elapsed;
                          return (
                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-6 py-4">
                                <div className="font-black text-slate-900 text-sm">{lead.customerName || '—'}</div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">{lead.phone || '—'}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-violet-100">
                                  {lead.serviceRequested || '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lead.apartment || lead.society || 'Direct'}</td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-600">{lead.serviceAcqPOC || <span className="italic text-slate-300">Unassigned</span>}</span>
                              </td>
                              <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                {uploadDate ? new Date(uploadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                              </td>
                              <td className="px-6 py-4">
                                {status === 'overdue' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-red-500 text-white animate-pulse">
                                    🔴 {Math.abs(remaining)}d Overdue
                                  </span>
                                ) : status === 'reaching' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-400 text-slate-900">
                                    🟡 {remaining === 0 ? 'Due Today' : '1d Left'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    🟢 {remaining}d Left
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── MAIN TABLE (Sales / Services) ─────────────────────────── */}
          {selectedSource !== 'invoices' && selectedSource !== 'camp' && selectedSource !== 'nexus' && selectedSource !== 'expenses' && selectedSource !== 'reminders' && selectedSource !== 'marketing-deadlines' && (
        <div className="px-8 pb-20">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50">
                    <td className="w-14 px-6 py-5 align-middle"><input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" /></td>
                    {selectedSource === 'services' || selectedSource === 'deadlines' ? (
                      <>
                        <th className="px-6 py-5">SR ID</th>
                        <th className="px-6 py-5">Name</th>
                        <th className="px-6 py-5">Phone number</th>
                        <th className="px-6 py-5">Service</th>
                        {servicesSubMode === 'blocked' && <th className="px-6 py-5">Blocker POC</th>}
                        {isAdmin && <th className="px-6 py-5 text-center">Actions</th>}
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-5">Name & ID </th>
                        <th className="px-6 py-5">Phone Number</th>
                        <th className="px-6 py-5 text-center">Priority</th>
                        <th className="px-6 py-5">Acq. POC</th>
                        <th className="px-6 py-5">Service POC</th>
                        {isAdmin && <th className="px-6 py-5 text-center">Actions</th>}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {paginatedCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <tr className={`group transition-all duration-300 cursor-default ${
                        expandedRows.has(customer.id) ? 'bg-[#f1f5f9]' :
                        (selectedSource === 'services' && servicesSubMode === 'blocked') ? 'bg-red-50/30 hover:bg-red-50/50' :
                        (showCorrupted && getCorruptedFields(customer).length > 0) ? 'bg-red-50/40 hover:bg-red-50/60' :
                        'hover:bg-slate-50/50'
                      }`}>
                        <td className="px-6 py-6 ring-inset">
                           <div className="flex items-center gap-3">
                             <div 
                               onClick={() => toggleRow(customer.id)}
                               className={`w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer ${expandedRows.has(customer.id) ? 'bg-white shadow-sm ring-1 ring-slate-200 rotate-180' : ''}`}
                             >
                                <ChevronDown size={16} />
                             </div>
                             <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" />
                           </div>
                        </td>
                        
                        {selectedSource === 'services' || selectedSource === 'deadlines' ? (
                          <>
                            <td className="px-6 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                                     <div className="w-3 h-3 bg-blue-500 rounded-sm" /> 
                                  </div>
                                  <span className="text-xs font-black text-slate-900 tracking-tighter uppercase">{customer.srId || `SRF${customer.id.substring(0,4).toUpperCase()}`}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                              {editingNameId === customer.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingNameValue}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 w-40 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && editingNameValue.trim()) {
                                        handlePOCUpdate(customer.id, 'customerName', editingNameValue.trim());
                                        setEditingNameId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingNameId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!editingNameValue.trim()) return;
                                      await handlePOCUpdate(customer.id, 'customerName', editingNameValue.trim());
                                      setEditingNameId(null);
                                    }}
                                    className="text-green-500 hover:text-green-600 p-1 transition-all hover:scale-110"
                                    title="Save"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingNameId(null)}
                                    className="text-red-400 hover:text-red-500 p-1 transition-all hover:scale-110"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2 group/name">
                                  {customer.customerName}
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setEditingNameId(customer.id);
                                        setEditingNameValue(customer.customerName || '');
                                      }}
                                      className="text-slate-300 hover:text-primary transition-colors p-1 opacity-0 group-hover/name:opacity-100"
                                      title="Rename"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                               {editingPhoneId === customer.id ? (
                                 <div className="flex items-center gap-1">
                                   <input
                                     type="text"
                                     value={editingPhoneValue}
                                     onChange={(e) => setEditingPhoneValue(e.target.value)}
                                     className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 w-32 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                     autoFocus
                                   />
                                   <button
                                     onClick={async (e) => {
                                       e.stopPropagation();
                                       if (!editingPhoneValue.trim()) return;
                                       await handlePOCUpdate(customer.id, 'phone', editingPhoneValue.trim());
                                       setEditingPhoneId(null);
                                     }}
                                     className="text-green-500 hover:text-green-600 p-1 transition-all hover:scale-110"
                                     title="Save"
                                   >
                                     <Check size={14} />
                                   </button>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setEditingPhoneId(null);
                                     }}
                                     className="text-red-400 hover:text-red-500 p-1 transition-all hover:scale-110"
                                     title="Cancel"
                                   >
                                     <X size={14} />
                                   </button>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-2 font-bold text-slate-700 group/phone">
                                   <span>{customer.phone}</span>
                                   <div className="flex items-center gap-0.5 opacity-0 group-hover/phone:opacity-100 transition-opacity">
                                     <button 
                                       onClick={() => copyToClipboard(customer.phone, customer.id)}
                                       className="text-slate-400 hover:text-primary transition-colors p-1"
                                       title="Copy Phone"
                                     >
                                       {copyFeedback === customer.id ? <Check size={14} className="text-green-500" /> : <Copy size={12} />}
                                     </button>
                                     <button
                                       onClick={() => {
                                         setEditingPhoneId(customer.id);
                                         setEditingPhoneValue(customer.phone || '');
                                       }}
                                       className="text-slate-400 hover:text-primary transition-colors p-1"
                                       title="Edit Phone"
                                     >
                                       <Edit2 size={12} />
                                     </button>
                                   </div>
                                 </div>
                               )}
                            </td>
                            <td className="px-4 py-3">
                               <span className="text-xs font-bold text-slate-700">{customer.serviceRequested || customer.serviceType || customer.service || 'N/A'}</span>
                            </td>
                             {servicesSubMode === 'blocked' && (
                              <td className="px-4 py-3">
                                 <span className="text-xs font-bold text-slate-500 text-center block w-full">-</span>
                              </td>
                            )}

                            {isAdmin && (
                              <td className="px-6 py-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReminderCustomer(customer);
                                    }}
                                    className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                    title="Add Reminder"
                                  >
                                    <Bell size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCustomerToDelete(customer);
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Lead"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              {editingNameId === customer.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingNameValue}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 w-40 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && editingNameValue.trim()) {
                                        handlePOCUpdate(customer.id, 'customerName', editingNameValue.trim());
                                        setEditingNameId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingNameId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!editingNameValue.trim()) return;
                                      await handlePOCUpdate(customer.id, 'customerName', editingNameValue.trim());
                                      setEditingNameId(null);
                                    }}
                                    className="text-green-500 hover:text-green-600 p-1 transition-all hover:scale-110"
                                    title="Save"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingNameId(null)}
                                    className="text-red-400 hover:text-red-500 p-1 transition-all hover:scale-110"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group/name">
                                  <div>
                                    <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{customer.customerName || <span className="text-red-400 italic">No Name</span>}</div>
                                    <div className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5">UIDE{customer.id.substring(0, 4).toUpperCase()}</div>
                                    {showCorrupted && (() => {
                                      const missing = getCorruptedFields(customer);
                                      return missing.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {missing.map(f => (
                                            <span key={f} className="text-[8px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">Missing: {f}</span>
                                          ))}
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setEditingNameId(customer.id);
                                        setEditingNameValue(customer.customerName || '');
                                      }}
                                      className="text-slate-300 hover:text-primary transition-colors p-1 opacity-0 group-hover/name:opacity-100"
                                      title="Rename"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                               {editingPhoneId === customer.id ? (
                                 <div className="flex items-center gap-1">
                                   <input
                                     type="text"
                                     value={editingPhoneValue}
                                     onChange={(e) => setEditingPhoneValue(e.target.value)}
                                     className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 w-32 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                     autoFocus
                                   />
                                   <button
                                     onClick={async (e) => {
                                       e.stopPropagation();
                                       if (!editingPhoneValue.trim()) return;
                                       await handlePOCUpdate(customer.id, 'phone', editingPhoneValue.trim());
                                       setEditingPhoneId(null);
                                     }}
                                     className="text-green-500 hover:text-green-600 p-1 transition-all hover:scale-110"
                                     title="Save"
                                   >
                                     <Check size={14} />
                                   </button>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setEditingPhoneId(null);
                                     }}
                                     className="text-red-400 hover:text-red-500 p-1 transition-all hover:scale-110"
                                     title="Cancel"
                                   >
                                     <X size={14} />
                                   </button>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-2 font-bold text-slate-700 group/phone">
                                   <span>{customer.phone}</span>
                                   <div className="flex items-center gap-0.5 opacity-0 group-hover/phone:opacity-100 transition-opacity">
                                     <button 
                                       onClick={() => copyToClipboard(customer.phone, customer.id)}
                                       className="text-slate-400 hover:text-primary transition-colors p-1"
                                       title="Copy Phone"
                                     >
                                       {copyFeedback === customer.id ? <Check size={14} className="text-green-500" /> : <Copy size={12} />}
                                     </button>
                                     <button
                                       onClick={() => {
                                         setEditingPhoneId(customer.id);
                                         setEditingPhoneValue(customer.phone || '');
                                       }}
                                       className="text-slate-400 hover:text-primary transition-colors p-1"
                                       title="Edit Phone"
                                     >
                                       <Edit2 size={12} />
                                     </button>
                                   </div>
                                 </div>
                               )}
                            </td>
                            <td className="px-4 py-3 text-center">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 customer.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                 customer.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                 'bg-slate-100 text-slate-500 border-slate-200'
                               }`}
                               onClick={() => isAdmin && handlePOCUpdate(customer.id, 'priority', customer.priority === 'High' ? 'Medium' : (customer.priority === 'Medium' ? 'Low' : 'High'))}
                               style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                               >
                                 {customer.priority || 'Low'}
                               </span>
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                 disabled={!isAdmin}
                                 value={customer.acqPOC || ''}
                                 onChange={(e) => handlePOCUpdate(customer.id, 'acqPOC', e.target.value)}
                                 className="bg-white/50 border border-slate-100 font-bold hover:border-slate-300 rounded-xl px-4 py-2 text-[10px] text-slate-700 outline-none focus:ring-4 focus:ring-slate-100 min-w-[120px] transition-all cursor-pointer disabled:opacity-60"
                              >
                                 <option value="">Select Acq...</option>
                                 {pocs.acquisition?.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                 ))}
                              </select>
                            </td>

                             <td className="px-6 py-6">
                              <select 
                                 disabled={!isAdmin}
                                 value={customer.serviceAcqPOC || ''}
                                 onChange={(e) => handlePOCUpdate(customer.id, 'serviceAcqPOC', e.target.value)}
                                 className="bg-indigo-50 border border-indigo-100 font-bold hover:border-indigo-300 rounded-xl px-4 py-2 text-[10px] text-indigo-500 outline-none focus:ring-4 focus:ring-indigo-100 min-w-[120px] transition-all cursor-pointer disabled:opacity-60"
                              >
                                 <option value="">Select Service POC...</option>
                                 {pocs.serviceAcquisition?.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                 ))}
                              </select>
                            </td>

                            {isAdmin && (
                              <td className="px-6 py-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReminderCustomer(customer);
                                    }}
                                    className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                    title="Add Reminder"
                                  >
                                    <Bell size={16} />
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!confirm(`Duplicate lead "${customer.customerName}"?`)) return;
                                      try {
                                        const { id, ...rest } = customer;
                                        await addDoc(collection(db, 'customers'), {
                                          ...rest,
                                          docsSubmitted: false,
                                          docsSubmittedDate: null,
                                          docStatus: '',
                                          docSource: '',
                                          customDocSource: '',
                                          serviceAcqPOC: '',
                                          sAcq: '',
                                          ePID: '',
                                          epid: '',
                                          serviceStage: 'Document Received',
                                          serviceStatus: '',
                                          blockerReason: '',
                                          approvedDate: null,
                                          closedDate: null,
                                          createdAt: new Date().toISOString(),
                                          updatedAt: new Date().toISOString(),
                                        });
                                      } catch (err) {
                                        console.error('Duplicate error:', err);
                                        alert('Failed to duplicate: ' + err.message);
                                      }
                                    }}
                                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Duplicate Lead"
                                  >
                                    <CopyPlus size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCustomerToDelete(customer);
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Lead"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                      {expandedRows.has(customer.id) && (
                        <tr className="bg-[#f8fafc]">
                          <td colSpan={isAdmin ? ((selectedSource === 'services' || selectedSource === 'deadlines') ? (servicesSubMode === 'blocked' ? 7 : 6) : 7) : ((selectedSource === 'services' || selectedSource === 'deadlines') ? (servicesSubMode === 'blocked' ? 6 : 5) : 6)} className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col gap-4">
                                   <NestedServicesTable
                                     customer={customer}
                                     onUpdate={(field, val) => handlePOCUpdate(customer.id, field, val)}
                                     pocs={pocs}
                                     viewMode={selectedSource}
                                     subMode={servicesSubMode}
                                   />

                                <div className="space-y-4">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Administrative Logs & Timeline</h4>
                                  
                                   <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[140px] flex flex-col gap-4">
                                      {/* Notes List */}
                                      {customer.internalNotes && customer.internalNotes.length > 0 ? (
                                         <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                            {customer.internalNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((note, idx) => (
                                               <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                     <User size={14} />
                                                  </div>
                                                  <div className="flex-1 space-y-1">
                                                     <div className="flex justify-between items-center text-[10px] font-bold">
                                                        <span className="text-slate-900">{note.author}</span>
                                                        <span className="text-slate-400">{new Date(note.timestamp).toLocaleString()}</span>
                                                     </div>
                                                     <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{note.text}</p>
                                                  </div>
                                               </div>
                                            ))}
                                         </div>
                                      ) : (
                                         <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 group py-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                                               <FileText size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">Activity stream encrypted. Start tagging this lead to see logs.</p>
                                         </div>
                                      )}

                                      {/* Add Note Input */}
                                      {noteInputId === customer.id ? (
                                         <div className="flex flex-col gap-2 animate-in zoom-in-95 duration-200">
                                            <textarea 
                                               value={noteText}
                                               onChange={(e) => setNoteText(e.target.value)}
                                               placeholder="Type your internal note here..."
                                               className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xs font-medium min-h-[80px]"
                                               autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                               <button onClick={() => { setNoteInputId(null); setNoteText(''); }} className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-lg">Cancel</button>
                                               <button onClick={() => handleAddNote(customer.id)} className="px-6 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-slate-800 transition-all">Post Note</button>
                                            </div>
                                         </div>
                                      ) : (
                                         <div className="flex justify-center pt-2 border-t border-slate-50">
                                            <button 
                                               onClick={() => setNoteInputId(customer.id)}
                                               className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2 group"
                                            >
                                               <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add Internal Note
                                            </button>
                                         </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                       <td colSpan={isAdmin ? (selectedSource === 'services' ? (servicesSubMode === 'blocked' ? 8 : 7) : 8) : (selectedSource === 'services' ? (servicesSubMode === 'blocked' ? 7 : 6) : 7)} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-300">
                                <Search size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900">No leads found in this bucket</p>
                                <p className="text-xs text-slate-500 font-medium">Try adjusting your filters or search query</p>
                             </div>
                             <button onClick={() => setSearchQuery('')} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all">Clear Search</button>
                          </div>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-between">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{paginatedCustomers.length}</span> of <span className="text-slate-900">{filteredCustomers.length}</span> entries
               </div>
               <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
                  >
                    Next
                  </button>
               </div>
            </div>
           </div>
          </div>
          )}

        {/* Add/Edit Lead Modal */}
        <AddLeadModal 
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
          onAdd={async (data) => {
             try {
                let totalAmount = 0;
                if (pocs.pricing && data.services && data.services.length > 0) {
                  data.services.forEach(service => {
                    if (pocs.pricing[service]) {
                      totalAmount += parseFloat(pocs.pricing[service]);
                    }
                  });
                }
                
                const customerData = {
                   ...data,
                   updatedAt: new Date().toISOString(),
                   sourceVault: selectedSource === 'nexus' ? 'direct' : selectedSource,
                   amount: totalAmount || ''
                };
                
                await addDoc(collection(db, 'customers'), {
                   ...customerData,
                   createdAt: new Date().toISOString(),
                   docsSubmitted: false,
                   serviceStatus: 'Open',
                   serviceStage: 'Document Received',
                   status: 'Document Received'
                });
                setIsAddCustomerOpen(false);
             } catch (error) {
                console.error("Lead Creation Error:", error);
                alert(`Failed to save lead to Cloud: ${error.message}. Please check if Firestore is enabled.`);
             }
          }}
          pocs={pocs}
        />

        {/* Admin Settings Modal */}
        <AdminSettingsModal 
          isOpen={isAdminSettingsOpen}
          onClose={() => setIsAdminSettingsOpen(false)}
          pocs={pocs}
          onUpdate={async (newPocs) => {
             await setDoc(doc(db, 'settings', 'crm_config'), { pocs: newPocs });
             setPocs(newPocs);
          }}
          onFixMarketingData={handleFixMarketingData}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal 
          customer={customerToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setCustomerToDelete(null)}
        />

        {/* Mass Upload Modal */}
        <MassUploadModal 
          isOpen={isMassUploadOpen}
          onClose={() => setIsMassUploadOpen(false)}
          onUpload={handleBulkAdd}
          pocs={pocs}
          existingCustomers={customers}
        />

        {/* Quick Add Reminder Modal */}
        <ReminderModal
          isOpen={!!reminderCustomer}
          onClose={() => setReminderCustomer(null)}
          onSave={handleSaveReminder}
          customers={customers}
          prefilledCustomer={reminderCustomer}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
