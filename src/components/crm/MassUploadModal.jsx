import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Download, CheckCircle2, AlertTriangle, 
  AlertCircle, FileText, ChevronRight, HelpCircle, Loader2 
} from 'lucide-react';
import * as XLSX from 'xlsx';

const MassUploadModal = ({ isOpen, onClose, onUpload, pocs = {}, existingCustomers = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploadState, setUploadState] = useState('upload'); // 'upload', 'preview', 'submitting', 'success'
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  
  const fileInputRef = useRef(null);

  // Helper to extract services from an existing customer document
  const getExistingCustomerServices = (cust) => {
    if (cust.services && Array.isArray(cust.services)) {
      return cust.services.map(s => s.toLowerCase());
    }
    const req = cust.serviceRequested || cust.service || cust.serviceType || '';
    return req.split(/[,;]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  };

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setDragActive(false);
      setFile(null);
      setParsedData([]);
      setUploadState('upload');
      setStats({ total: 0, valid: 0, invalid: 0 });
      setErrorMsg('');
      setImportedCount(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allowedPriorities = ['High', 'Medium', 'Low'];
  const allowedSources = ['Direct', 'Referral', 'Marketing', 'Partner'];
  const availableServices = [
    'Ekatha', 'Katha Transfer (Combo)', 'New Katha (Combo)',
    'Bescom', 'MOU', 'MODT Cancellation', 'Property Registration', 'Others'
  ];

  // Generate and download a structured CSV template
  const downloadTemplate = () => {
    const headers = [
      'Name',
      'Phone Number',
      'Country Code',
      'Email',
      'Priority',
      'Source',
      'Apartment',
      'Services Required',
      'Other Service Description',
      'EC Number',
      'Acquisition POC',
      'Notes',
      'ePID'
    ];
    
    const sampleRows = [
      ['Rohan Sharma', '9876543210', '+91', 'rohan@example.com', 'High', 'Direct', 'Asset Aura', 'Ekatha, Bescom', '', 'EC100293', 'Ajay Kumar', 'Call after 6 PM', '1234567890'],
      ['Priya Patel', '9123456789', '+91', 'priya@gmail.com', 'Medium', 'Referral', 'Prestige Falcon', 'Katha Transfer (Combo)', '', '', '', '', ''],
      ['John Doe', '1234567890', '+1', 'john@us.com', 'Low', 'Partner', 'Others', 'Others', 'Custom Property Check', '', '', 'International client', '0987654321']
    ];
    
    const csvRows = [headers.join(',')];
    sampleRows.forEach(row => {
      const processedRow = row.map(val => {
        const escaped = String(val || '').replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(processedRow.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ekhata_mass_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Parse Excel/CSV file using SheetJS
  const processFile = (selectedFile) => {
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
    const isCsv = selectedFile.name.endsWith('.csv');
    
    if (!isExcel && !isCsv) {
      setErrorMsg('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON array of objects
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        if (rawRows.length === 0) {
          setErrorMsg('The uploaded file contains no data.');
          setFile(null);
          return;
        }

        validateAndFormatRows(rawRows);
      } catch (error) {
        console.error("File parsing error:", error);
        setErrorMsg('Failed to parse the file. Please check if the file format matches the template.');
        setFile(null);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Validate and format rows into CRM structures
  const validateAndFormatRows = (rawRows) => {
    let validCount = 0;
    let invalidCount = 0;
    const fileProcessedMap = {}; // phone -> array of services processed in the file
    
    const formatted = rawRows.map((row, idx) => {
      // Find key mappings in case user headers have slight whitespace differences
      const getVal = (possibleKeys) => {
        const key = Object.keys(row).find(k => possibleKeys.map(pk => pk.toLowerCase()).includes(k.trim().toLowerCase()));
        return key ? String(row[key]).trim() : '';
      };

      const name = getVal(['Name', 'Customer Name', 'CustomerName', 'Full Name', 'FullName']);
      const rawPhone = getVal(['Phone Number', 'Phone', 'PhoneNumber', 'Mobile', 'MobileNumber']);
      const countryCode = getVal(['Country Code', 'CountryCode', 'Code']) || '+91';
      const email = getVal(['Email', 'Email Address', 'EmailID', 'Email ID']);
      const rawPriority = getVal(['Priority']);
      const rawSource = getVal(['Source', 'Lead Source', 'LeadSource']);
      const apartment = getVal(['Apartment', 'Society', 'Project']);
      const rawServices = getVal(['Services Required', 'Services', 'ServiceRequested', 'Service']);
      const otherServiceInput = getVal(['Other Service Description', 'OtherService', 'Other Service']);
      const ec = getVal(['EC Number', 'EC', 'ECNumber']);
      const acqPOC = getVal(['Acquisition POC', 'Acq POC', 'acqPOC', 'AcquisitionPOC']);
      const notes = getVal(['Notes', 'Note', 'Internal Notes', 'Description']);
      const ePID = getVal(['ePID', 'EPID', 'Epid']);

      // 1. Mandatory Fields Validation
      const errors = [];
      const warnings = [];

      let cleanEPID = '';
      if (ePID) {
        cleanEPID = ePID.replace(/\D/g, '').substring(0, 10);
        if (ePID.replace(/\D/g, '').length !== 10) {
          warnings.push(`ePID "${ePID}" is not a valid 10-digit number. It will be saved as "${cleanEPID}".`);
        }
      }

      if (!name) errors.push('Name is required.');
      if (!rawPhone) {
        errors.push('Phone number is required.');
      } else {
        // Simple numeric clean
        const cleanedPhone = rawPhone.replace(/\D/g, '');
        if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
          errors.push(`Invalid phone number length (${rawPhone}).`);
        }
      }
      if (!apartment) errors.push('Apartment is required.');
      if (!rawServices) errors.push('At least one service is required.');

      // 2. Options Mapping & Case-Insensitive Validation
      // Priority
      let priority = 'Low';
      if (rawPriority) {
        const matchedPriority = allowedPriorities.find(p => p.toLowerCase() === rawPriority.toLowerCase());
        if (matchedPriority) {
          priority = matchedPriority;
        } else {
          warnings.push(`Priority "${rawPriority}" is invalid, defaulting to "Low".`);
        }
      }

      // Source
      let source = 'Direct';
      if (rawSource) {
        const matchedSource = allowedSources.find(s => s.toLowerCase() === rawSource.toLowerCase());
        if (matchedSource) {
          source = matchedSource;
        } else {
          warnings.push(`Source "${rawSource}" is invalid, defaulting to "Direct".`);
        }
      }

      // Services Parsing
      const services = [];
      let otherService = otherServiceInput || '';
      
      if (rawServices) {
        const serviceParts = rawServices.split(/[,;]/).map(s => s.trim()).filter(Boolean);
        serviceParts.forEach(sp => {
          const match = availableServices.find(as => as.toLowerCase() === sp.toLowerCase());
          if (match) {
            if (match === 'Others') {
              if (!services.includes('Others')) services.push('Others');
            } else {
              if (!services.includes(match)) services.push(match);
            }
          } else {
            // Map custom service under 'Others'
            if (!services.includes('Others')) services.push('Others');
            if (otherService) {
              if (!otherService.toLowerCase().includes(sp.toLowerCase())) {
                otherService = `${otherService}, ${sp}`;
              }
            } else {
              otherService = sp;
            }
          }
        });
      }

      // Keep string format for db compatibility
      const serviceRequested = services.includes('Others') 
        ? [...services.filter(s => s !== 'Others'), otherService].filter(Boolean).join(', ')
        : services.join(', ');

      const phoneDigits = rawPhone.replace(/\D/g, '');

      // 3. Duplicate Checking
      const dbDuplicates = [];
      const fileDuplicates = [];

      if (phoneDigits && errors.length === 0) {
        // A. Check against database (existingCustomers)
        if (existingCustomers && existingCustomers.length > 0) {
          existingCustomers.forEach(cust => {
            const custPhoneClean = (cust.phone || '').replace(/\D/g, '');
            if (custPhoneClean && custPhoneClean === phoneDigits) {
              const custServices = getExistingCustomerServices(cust);
              // Check overlap
              const duplicates = services.filter(s => {
                if (s === 'Others') {
                  const custOtherDesc = (cust.otherService || '').toLowerCase();
                  const currentRowOtherDesc = otherService.toLowerCase();
                  return custServices.includes('others') && 
                         (custOtherDesc.includes(currentRowOtherDesc) || currentRowOtherDesc.includes(custOtherDesc));
                }
                return custServices.includes(s.toLowerCase());
              });
              if (duplicates.length > 0) {
                dbDuplicates.push({
                  customerName: cust.customerName,
                  services: duplicates
                });
              }
            }
          });
        }

        // B. Check against spreadsheet itself (intra-file duplicates)
        if (!fileProcessedMap[phoneDigits]) {
          fileProcessedMap[phoneDigits] = [];
        }
        const overlaps = services.filter(s => {
          if (s === 'Others') {
            return fileProcessedMap[phoneDigits].some(ps => 
              ps.service === 'Others' && 
              ps.otherService.toLowerCase() === otherService.toLowerCase()
            );
          }
          return fileProcessedMap[phoneDigits].some(ps => ps.service === s);
        });
        if (overlaps.length > 0) {
          fileDuplicates.push(...overlaps);
        }

        // Add current services to intra-file processed map
        services.forEach(s => {
          fileProcessedMap[phoneDigits].push({ service: s, otherService: otherService });
        });
      }

      if (dbDuplicates.length > 0) {
        dbDuplicates.forEach(dup => {
          warnings.push(`DB Duplicate: "${dup.customerName}" already has this phone number with service: ${dup.services.join(', ')}.`);
        });
      }

      if (fileDuplicates.length > 0) {
        warnings.push(`File Duplicate: This phone number is already requesting service: ${fileDuplicates.join(', ')} in an earlier row of this file.`);
      }

      const hasDuplicate = dbDuplicates.length > 0 || fileDuplicates.length > 0;

      // Validation on Apartment list matching
      if (apartment && pocs.apartments && pocs.apartments.length > 0) {
        const match = pocs.apartments.find(a => a.toLowerCase() === apartment.toLowerCase());
        if (!match) {
          warnings.push(`Apartment "${apartment}" is not in settings list. It will be added as custom.`);
        }
      }

      // Validation on Acquisition POC list matching
      let resolvedAcqPOC = acqPOC;
      if (acqPOC && pocs.acquisition && pocs.acquisition.length > 0) {
        const match = pocs.acquisition.find(a => a.toLowerCase() === acqPOC.toLowerCase());
        if (match) {
          resolvedAcqPOC = match; // Map to official casing
        } else {
          warnings.push(`Acquisition POC "${acqPOC}" is not in team list.`);
        }
      }

      const isValid = errors.length === 0;
      const shouldSelect = isValid && !hasDuplicate;
      if (isValid) validCount++;
      else invalidCount++;

      // Return unified lead structure
      return {
        index: idx + 1,
        selected: shouldSelect, // Default check valid and non-duplicate leads only
        isValid,
        errors,
        warnings,
        data: {
          customerName: name,
          phone: phoneDigits,
          countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode}`,
          email,
          priority,
          source,
          apartment,
          society: apartment,
          services,
          otherService,
          serviceRequested,
          ec,
          acqPOC: resolvedAcqPOC,
          notes,
          ePID: cleanEPID,
          acquisitionDate: new Date().toISOString().split('T')[0]
        }
      };
    });

    setParsedData(formatted);
    setStats({ total: rawRows.length, valid: validCount, invalid: invalidCount });
    setUploadState('preview');
  };

  const handleRowCheckbox = (index) => {
    setParsedData(prev => prev.map(row => 
      row.index === index ? { ...row, selected: !row.selected } : row
    ));
  };

  const handleSelectAll = (checked) => {
    setParsedData(prev => prev.map(row => 
      row.isValid ? { ...row, selected: checked } : row
    ));
  };

  const handleDiscard = () => {
    setFile(null);
    setParsedData([]);
    setUploadState('upload');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const selectedLeads = parsedData.filter(r => r.selected && r.isValid).map(r => r.data);
    
    if (selectedLeads.length === 0) {
      alert('Please select at least one valid lead to upload.');
      return;
    }

    setUploadState('submitting');
    try {
      await onUpload(selectedLeads);
      setImportedCount(selectedLeads.length);
      setUploadState('success');
    } catch (error) {
      console.error("Bulk upload error:", error);
      setErrorMsg(`Upload failed: ${error.message}`);
      setUploadState('preview');
    }
  };

  const allSelected = parsedData.filter(r => r.isValid).length > 0 && 
                      parsedData.filter(r => r.isValid).every(r => r.selected);

  const selectedCount = parsedData.filter(r => r.selected && r.isValid).length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="px-10 py-8 flex justify-between items-start border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Mass Upload Leads</h2>
            <p className="text-sm text-slate-500 font-medium">Add multiple property leads via Excel or CSV</p>
          </div>
          <button 
            disabled={uploadState === 'submitting'}
            onClick={onClose} 
            className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all rounded-xl flex items-center justify-center disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-10">
          
          {/* PHASE 1: UPLOAD BOX */}
          {uploadState === 'upload' && (
            <div className="space-y-8 max-w-2xl mx-auto py-4">
              
              {/* Instructions and Download Template Card */}
              <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-base font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                    <HelpCircle size={18} className="text-primary" /> Setup Excel Structure
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-md">
                    To ensure smooth import, download our template below. Fill in the columns, leaving optional fields empty if necessary.
                  </p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="px-6 py-4 bg-white border border-slate-200 hover:border-primary/50 text-slate-700 hover:text-primary font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all shadow-sm shrink-0"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-xs font-semibold flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* File Dropzone */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group ${
                  dragActive 
                    ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
                
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-primary transition-all duration-300">
                  <Upload size={24} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800">
                    Drag and drop your spreadsheet here, or <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) formats
                  </p>
                </div>
              </div>

              {/* Data Specifications Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30 p-6 rounded-2xl border border-slate-100/50">
                <div className="space-y-2">
                  <p className="font-black text-slate-600 border-b border-slate-100 pb-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Required Columns</p>
                  <ul className="list-disc list-inside space-y-1 px-1 normal-case text-slate-500 font-medium">
                    <li><strong className="uppercase">Name</strong>: Lead's full name</li>
                    <li><strong className="uppercase">Phone Number</strong>: Digits only (7 to 15 digits)</li>
                    <li><strong className="uppercase">Apartment</strong>: Apartment/Society name</li>
                    <li><strong className="uppercase">Services Required</strong>: Comma-separated (e.g. "Ekatha, Bescom")</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-black text-slate-600 border-b border-slate-100 pb-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dropdown Values (Optional)</p>
                  <ul className="list-disc list-inside space-y-1 px-1 normal-case text-slate-500 font-medium animate-none">
                    <li><strong>Priority</strong>: High, Medium, Low (default: Low)</li>
                    <li><strong>Source</strong>: Direct, Referral, Marketing, Partner</li>
                    <li><strong>Acquisition POC</strong>: Must match admin team names</li>
                    <li><strong>Services</strong>: Bescom, Ekatha, Katha Transfer (Combo) etc.</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* PHASE 2: PREVIEW TABLE */}
          {uploadState === 'preview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Mini File Details & Statistics Banner */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">{file?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{(file?.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex gap-4 shrink-0">
                  <div className="px-5 py-3 rounded-xl bg-white border border-slate-100 text-center shadow-sm">
                    <p className="text-base font-black text-slate-800">{stats.total}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Rows</p>
                  </div>
                  <div className="px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-base font-black text-emerald-600">{stats.valid}</p>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Valid / Checked</p>
                  </div>
                  {stats.invalid > 0 && (
                    <div className="px-5 py-3 rounded-xl bg-red-50 border border-red-100 text-center">
                      <p className="text-base font-black text-red-600">{stats.invalid}</p>
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Errors / Blocked</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table wrapper */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] border-b border-slate-100/50 sticky top-0 z-10 backdrop-blur-md">
                        <th className="w-12 px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={allSelected} 
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                          />
                        </th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Apartment</th>
                        <th className="px-6 py-4">Services Required</th>
                        <th className="px-6 py-4">Acq. POC</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                      {parsedData.map((row) => (
                        <tr key={row.index} className={`hover:bg-slate-50/50 transition-colors ${!row.isValid ? 'bg-red-50/10' : ''}`}>
                          <td className="px-6 py-4 text-center align-middle">
                            <input 
                              type="checkbox" 
                              checked={row.selected}
                              disabled={!row.isValid}
                              onChange={() => handleRowCheckbox(row.index)}
                              className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" 
                            />
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="text-slate-900">{row.data.customerName || <span className="text-red-500 italic">Empty</span>}</div>
                            {row.data.email && <div className="text-[10px] font-bold text-slate-400 mt-0.5 normal-case">{row.data.email}</div>}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div>{row.data.countryCode} {row.data.phone || <span className="text-red-500 italic">Empty</span>}</div>
                            {row.data.ePID && <div className="text-[10px] font-bold text-slate-400 mt-0.5">ePID: {row.data.ePID}</div>}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div>{row.data.apartment || <span className="text-red-500 italic">Empty</span>}</div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="truncate max-w-[200px]" title={row.data.serviceRequested}>
                              {row.data.serviceRequested || <span className="text-red-500 italic">Empty</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle uppercase text-[10px] text-slate-500">
                            {row.data.acqPOC || <span className="text-slate-300 italic normal-case">-</span>}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {row.isValid ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  ✓ Valid
                                </span>
                                {row.warnings.length > 0 && (
                                  <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5" title={row.warnings.join('\n')}>
                                    <AlertTriangle size={8} /> Warning
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200" title={row.errors.join('\n')}>
                                  <AlertCircle size={10} /> Error
                                </span>
                                <span className="text-[8px] font-bold text-red-500 truncate max-w-[100px] text-center" title={row.errors.join('\n')}>
                                  {row.errors[0]}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Warnings details summary */}
              {parsedData.some(r => r.warnings.length > 0) && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-[10px] font-semibold text-amber-700 space-y-2 animate-in fade-in duration-300">
                  <p className="font-black flex items-center gap-1.5 uppercase tracking-wider"><AlertTriangle size={14} /> Review Warnings</p>
                  <ul className="list-disc list-inside space-y-1 text-xs font-medium pl-1">
                    {Array.from(new Set(parsedData.flatMap(r => r.warnings))).slice(0, 3).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                    {Array.from(new Set(parsedData.flatMap(r => r.warnings))).length > 3 && (
                      <li>...and other minor POC/Apartment custom mappings.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* PHASE 3: SUBMITTING / LOADING STATE */}
          {uploadState === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-300">
              <Loader2 className="animate-spin text-primary" size={48} />
              <div className="text-center">
                <p className="text-base font-black text-slate-800">Saving Leads to Cloud...</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Committing transaction batch write to Cloud Firestore.</p>
              </div>
            </div>
          )}

          {/* PHASE 4: SUCCESS VIEW */}
          {uploadState === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 gap-6 text-center max-w-md mx-auto animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 shadow-xl shadow-emerald-50 flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload Successful!</h3>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Successfully imported <span className="text-emerald-600 font-bold">{importedCount} leads</span> into your CRM database.
                </p>
              </div>
              <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-400 uppercase tracking-widest">
                Database Synced • Live Update Triggered
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0 rounded-b-[2.5rem]">
          {uploadState === 'preview' ? (
            <>
              <button 
                onClick={handleDiscard}
                className="px-6 py-4 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
              >
                Discard & Upload New
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-4 text-slate-500 hover:text-slate-800 font-black text-xs uppercase tracking-widest bg-white border border-slate-200 rounded-2xl transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={selectedCount === 0}
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 disabled:opacity-40 disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
                >
                  Approve and Upload ({selectedCount})
                </button>
              </div>
            </>
          ) : uploadState === 'success' ? (
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Done / Close Modal
            </button>
          ) : (
            <button 
              onClick={onClose}
              disabled={uploadState === 'submitting'}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all disabled:opacity-40"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default MassUploadModal;
