import React, { useState, useMemo } from 'react';
import { 
  EducationLetter, 
  MasterDocketFile, 
  Employee, 
  DepartmentSection, 
  LetterPriority, 
  LetterStatus, 
  DocumentAttachment 
} from '../types';
import { 
  Inbox, 
  Send, 
  Plus, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Paperclip, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Building2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Check, 
  Copy, 
  FileSpreadsheet, 
  Tag, 
  Truck, 
  Mail, 
  Share2, 
  User, 
  FolderGit2,
  ExternalLink
} from 'lucide-react';

interface InwardOutwardStudioProps {
  initialMode?: 'inward' | 'outward';
  letters: EducationLetter[];
  files: MasterDocketFile[];
  employees: Employee[];
  currentUser?: { displayName: string; role: string } | null;
  onSaveLetter: (letterData: Partial<EducationLetter>) => Promise<void>;
  onUpdateLetter: (id: string, letterData: Partial<EducationLetter>) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
  onViewAttachment?: (att: DocumentAttachment) => void;
  onDraftReply?: (inwardLetter: EducationLetter) => void;
}

export const InwardOutwardStudio: React.FC<InwardOutwardStudioProps> = ({
  initialMode = 'inward',
  letters,
  files,
  employees,
  currentUser,
  onSaveLetter,
  onUpdateLetter,
  onDeleteLetter,
  onViewAttachment,
  onDraftReply,
}) => {
  const [activeMode, setActiveMode] = useState<'inward' | 'outward'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDispatchMode, setSelectedDispatchMode] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<EducationLetter | null>(null);
  const [viewingLetter, setViewingLetter] = useState<EducationLetter | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    inwardNumber: '',
    outwardNumber: '',
    referenceNumber: '',
    dateReceivedOrIssued: new Date().toISOString().split('T')[0],
    senderName: '',
    senderDepartment: '',
    senderDesignation: '',
    senderLetterNo: '',
    senderLetterDate: '',
    recipientName: '',
    recipientDepartment: '',
    recipientDesignation: '',
    subject: '',
    category: 'General Official Notice',
    section: 'Administration & Services' as DepartmentSection,
    assignedOfficer: '',
    fileNumber: '',
    priority: 'Routine' as LetterPriority,
    status: 'Pending Action' as LetterStatus,
    dispatchMode: 'Speed Post' as 'Registered Post' | 'Speed Post' | 'Ordinary Post' | 'By Hand / Peon Book' | 'Email' | 'WhatsApp / Digital',
    trackingNumber: '',
    postalStampAmount: 0,
    remarks: '',
    bodyText: '',
    attachments: [] as DocumentAttachment[],
  });

  // Calculate next sequential numbers
  const nextInwardNumber = useMemo(() => {
    const inwardLetters = letters.filter(l => l.direction === 'inward');
    const year = new Date().getFullYear();
    const nextSeq = inwardLetters.length + 1;
    return `ಆವಕ-${nextSeq}/${year}-${String(year + 1).slice(-2)}`;
  }, [letters]);

  const nextOutwardNumber = useMemo(() => {
    const outwardLetters = letters.filter(l => l.direction === 'outward');
    const year = new Date().getFullYear();
    const nextSeq = outwardLetters.length + 1;
    return `ಜಾವಕ-${nextSeq}/${year}-${String(year + 1).slice(-2)}`;
  }, [letters]);

  // Open modal for new entry
  const handleOpenNewModal = (mode: 'inward' | 'outward') => {
    setEditingLetter(null);
    const today = new Date().toISOString().split('T')[0];
    const academicYear = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;
    
    if (mode === 'inward') {
      setFormData({
        inwardNumber: nextInwardNumber,
        outwardNumber: '',
        referenceNumber: `ಸಂ: ಆವಕ/${nextInwardNumber}`,
        dateReceivedOrIssued: today,
        senderName: '',
        senderDepartment: 'ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ / ಪ್ರೌಢಶಾಲೆ, ಭದ್ರಾವತಿ',
        senderDesignation: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
        senderLetterNo: '',
        senderLetterDate: today,
        recipientName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        recipientDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ',
        recipientDesignation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        subject: '',
        category: 'School Inspection & Safety',
        section: 'Administration & Services',
        assignedOfficer: employees[0]?.fullName || 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
        fileNumber: files[0]?.fileNumber || `FILE-2026/ADM-${Math.floor(100 + Math.random() * 900)}`,
        priority: 'Routine',
        status: 'Pending Action',
        dispatchMode: 'Speed Post',
        trackingNumber: '',
        postalStampAmount: 0,
        remarks: '',
        bodyText: '',
        attachments: [],
      });
    } else {
      setFormData({
        inwardNumber: '',
        outwardNumber: nextOutwardNumber,
        referenceNumber: `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಸಾಮಾನ್ಯ/${Math.floor(100 + Math.random() * 900)}/${academicYear}`,
        dateReceivedOrIssued: today,
        senderName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        senderDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ',
        senderDesignation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        senderLetterNo: '',
        senderLetterDate: '',
        recipientName: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರುಗಳು / ನೌಕರರು',
        recipientDepartment: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ಎಲ್ಲಾ ಶಾಲೆಗಳು',
        recipientDesignation: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
        subject: '',
        category: 'Circular & Directive',
        section: 'Administration & Services',
        assignedOfficer: employees[0]?.fullName || 'ಜಾವಕ ಗುಮಾಸ್ತರು (Dispatch Clerk)',
        fileNumber: files[0]?.fileNumber || `FILE-2026/OUT-${Math.floor(100 + Math.random() * 900)}`,
        priority: 'Routine',
        status: 'Dispatched',
        dispatchMode: 'Speed Post',
        trackingNumber: `EK${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        postalStampAmount: 25,
        remarks: 'ರವಾನಿಸಲಾಗಿದೆ',
        bodyText: '',
        attachments: [],
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (letter: EducationLetter) => {
    setEditingLetter(letter);
    setFormData({
      inwardNumber: letter.inwardNumber || letter.referenceNumber || '',
      outwardNumber: letter.outwardNumber || letter.referenceNumber || '',
      referenceNumber: letter.referenceNumber || '',
      dateReceivedOrIssued: letter.dateReceivedOrIssued || new Date().toISOString().split('T')[0],
      senderName: letter.senderName || '',
      senderDepartment: letter.senderDepartment || '',
      senderDesignation: letter.senderDesignation || '',
      senderLetterNo: letter.senderLetterNo || '',
      senderLetterDate: letter.senderLetterDate || '',
      recipientName: letter.recipientName || '',
      recipientDepartment: letter.recipientDepartment || '',
      recipientDesignation: letter.recipientDesignation || '',
      subject: letter.subject || '',
      category: letter.category || 'General Official Notice',
      section: letter.section || 'Administration & Services',
      assignedOfficer: letter.assignedOfficer || '',
      fileNumber: letter.fileNumber || '',
      priority: letter.priority || 'Routine',
      status: letter.status || 'Pending Action',
      dispatchMode: (letter.dispatchMode as any) || 'Speed Post',
      trackingNumber: letter.trackingNumber || '',
      postalStampAmount: letter.postalStampAmount || 0,
      remarks: letter.remarks || '',
      bodyText: letter.bodyText || '',
      attachments: letter.attachments || [],
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      alert('ದಯವಿಟ್ಟು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ (Please enter subject)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<EducationLetter> = {
        direction: activeMode,
        subject: formData.subject,
        category: formData.category as any,
        section: formData.section,
        referenceNumber: activeMode === 'inward' 
          ? (formData.inwardNumber || formData.referenceNumber)
          : (formData.referenceNumber || formData.outwardNumber),
        inwardNumber: activeMode === 'inward' ? formData.inwardNumber : undefined,
        outwardNumber: activeMode === 'outward' ? formData.outwardNumber : undefined,
        dateReceivedOrIssued: formData.dateReceivedOrIssued,
        senderName: formData.senderName,
        senderDepartment: formData.senderDepartment,
        senderDesignation: formData.senderDesignation,
        senderLetterNo: formData.senderLetterNo,
        senderLetterDate: formData.senderLetterDate,
        recipientName: formData.recipientName,
        recipientDepartment: formData.recipientDepartment,
        recipientDesignation: formData.recipientDesignation,
        assignedOfficer: formData.assignedOfficer,
        fileNumber: formData.fileNumber,
        priority: formData.priority,
        status: formData.status,
        dispatchMode: activeMode === 'outward' ? formData.dispatchMode : undefined,
        trackingNumber: activeMode === 'outward' ? formData.trackingNumber : undefined,
        postalStampAmount: activeMode === 'outward' ? Number(formData.postalStampAmount) : undefined,
        remarks: formData.remarks,
        bodyText: formData.bodyText,
        attachments: formData.attachments,
        tags: [activeMode, formData.section, formData.priority],
      };

      if (editingLetter) {
        await onUpdateLetter(editingLetter.id, payload);
      } else {
        await onSaveLetter(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving register letter:', err);
      alert('ದಾಖಲೆ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to save record)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter letters for current mode
  const currentLetters = useMemo(() => {
    return letters.filter(l => l.direction === activeMode);
  }, [letters, activeMode]);

  // Filtered by search and dropdowns
  const filteredLetters = useMemo(() => {
    return currentLetters.filter(l => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = (l.referenceNumber || '').toLowerCase().includes(q);
        const inwMatch = (l.inwardNumber || '').toLowerCase().includes(q);
        const outwMatch = (l.outwardNumber || '').toLowerCase().includes(q);
        const subMatch = (l.subject || '').toLowerCase().includes(q);
        const senderMatch = (l.senderName || '').toLowerCase().includes(q) || (l.senderDepartment || '').toLowerCase().includes(q);
        const recipMatch = (l.recipientName || '').toLowerCase().includes(q) || (l.recipientDepartment || '').toLowerCase().includes(q);
        const fileMatch = (l.fileNumber || '').toLowerCase().includes(q);
        const trackingMatch = (l.trackingNumber || '').toLowerCase().includes(q);

        if (!refMatch && !inwMatch && !outwMatch && !subMatch && !senderMatch && !recipMatch && !fileMatch && !trackingMatch) {
          return false;
        }
      }

      // Section
      if (selectedSection !== 'all' && l.section !== selectedSection) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && l.status !== selectedStatus) {
        return false;
      }

      // Dispatch Mode (for Outward)
      if (activeMode === 'outward' && selectedDispatchMode !== 'all' && l.dispatchMode !== selectedDispatchMode) {
        return false;
      }

      // Date range
      if (startDate && l.dateReceivedOrIssued < startDate) {
        return false;
      }
      if (endDate && l.dateReceivedOrIssued > endDate) {
        return false;
      }

      return true;
    });
  }, [currentLetters, searchQuery, selectedSection, selectedStatus, selectedDispatchMode, startDate, endDate, activeMode]);

  // Copy reference number
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLetters.length === 0) {
      alert('ರಫ್ತು ಮಾಡಲು ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ (No records to export)');
      return;
    }

    let csv = '';
    if (activeMode === 'inward') {
      csv = 'ಕ್ರ.ಸಂ,ಆವಕ ಸಂಖ್ಯೆ,ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ,ಯಾರಿಂದ ಬಂದಿದೆ,ಮೂಲ ಪತ್ರ ಸಂಖ್ಯೆ & ದಿನಾಂಕ,ವಿಷಯ,ಶಾಖೆ,ಕೇಸ್ ವರ್ಕರ್,ಕಡತ ಸಂಖ್ಯೆ,ವಿಲೇವಾರಿ ಸ್ಥಿತಿ,ಷರಾ\n';
      filteredLetters.forEach((l, idx) => {
        csv += `"${idx + 1}","${l.inwardNumber || l.referenceNumber}","${l.dateReceivedOrIssued}","${(l.senderName || '') + ' - ' + (l.senderDepartment || '')}","${(l.senderLetterNo || '') + ' ' + (l.senderLetterDate || '')}","${(l.subject || '').replace(/"/g, '""')}","${l.section}","${l.assignedOfficer || ''}","${l.fileNumber || ''}","${l.status}","${l.remarks || ''}"\n`;
      });
    } else {
      csv = 'ಕ್ರ.ಸಂ,ಜಾವಕ ಸಂಖ್ಯೆ,ರವಾನಿಸಿದ ದಿನಾಂಕ,ಕಛೇರಿಯ ಪತ್ರ/ಆದೇಶ ಸಂಖ್ಯೆ,ಯಾರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ,ವಿಷಯ,ಸಂಬಂಧಿಸಿದ ಕಡತ,ರವಾನೆ ವಿಧಾನ,ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ,ಅಂಚೆ ವೆಚ್ಚ,ಷರಾ\n';
      filteredLetters.forEach((l, idx) => {
        csv += `"${idx + 1}","${l.outwardNumber || l.referenceNumber}","${l.dateReceivedOrIssued}","${l.referenceNumber}","${(l.recipientName || '') + ' - ' + (l.recipientDepartment || '')}","${(l.subject || '').replace(/"/g, '""')}","${l.fileNumber || ''}","${l.dispatchMode || 'Speed Post'}","${l.trackingNumber || ''}","${l.postalStampAmount || 0}","${l.remarks || ''}"\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeMode === 'inward' ? 'BEO_Inward_Register' : 'BEO_Outward_Register'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Register
  const handlePrintRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-xs font-semibold text-stone-600">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              {activeMode === 'inward' ? (
                <>
                  <Inbox className="w-6 h-6 text-sky-700" />
                  <span>ಆವಕ ವಹಿ (Inward Dak Register)</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 text-emerald-700" />
                  <span>ಜಾವಕ ವಹಿ (Outward Dispatch Register)</span>
                </>
              )}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {activeMode === 'inward' 
                ? 'ಕಛೇರಿಗೆ ಸ್ವೀಕೃತವಾದ ಎಲ್ಲಾ ಪತ್ರಗಳು, ಸುತ್ತೋಲೆಗಳು, ಅರ್ಜಿಗಳು ಹಾಗೂ ಕಡತಗಳ ಅಧಿಕೃತ ಆವಕ ದಾಖಲಾತಿ'
                : 'ಕಛೇರಿಯಿಂದ ರವಾನೆಯಾದ ಎಲ್ಲಾ ಆದೇಶಗಳು, ಪತ್ರಗಳು, ಜ್ಞಾಪನಗಳು ಹಾಗೂ ಕಡತಗಳ ಅಧಿಕೃತ ಜಾವಕ ದಾಖಲಾತಿ'}
            </p>
          </div>

          {/* Mode Switch Pills & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Switch Tabs */}
            <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center gap-1">
              <button
                id="btn-switch-inward"
                onClick={() => setActiveMode('inward')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'inward'
                    ? 'bg-sky-950 text-white shadow-xs font-extrabold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-sky-400" />
                <span>📥 ಆವಕ ವಹಿ (Inward)</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-800 text-sky-100">
                  {letters.filter(l => l.direction === 'inward').length}
                </span>
              </button>

              <button
                id="btn-switch-outward"
                onClick={() => setActiveMode('outward')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'outward'
                    ? 'bg-emerald-950 text-white shadow-xs font-extrabold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>📤 ಜಾವಕ ವಹಿ (Outward)</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-800 text-emerald-100">
                  {letters.filter(l => l.direction === 'outward').length}
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <button
              id="btn-new-register-entry"
              onClick={() => handleOpenNewModal(activeMode)}
              className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs border border-amber-500/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-stone-900" />
              <span>{activeMode === 'inward' ? '+ ಹೊಸ ಆವಕ ನಮೂದು' : '+ ಹೊಸ ಜಾವಕ ನಮೂದು'}</span>
            </button>

            <button
              id="btn-print-register"
              onClick={handlePrintRegister}
              className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="ಅಧಿಕೃತ ವಹಿ ಮುದ್ರಿಸಿ (Print Ledger)"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">ವಹಿ ಮುದ್ರಣ</span>
            </button>

            <button
              id="btn-export-register-csv"
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="CSV / Excel ಗೆ ರಫ್ತು ಮಾಡಿ"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">CSV ರಫ್ತು</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100 text-xs">
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">
              {activeMode === 'inward' ? 'ಒಟ್ಟು ಆವಕ ಪತ್ರಗಳು (Total Inward)' : 'ಒಟ್ಟು ಜಾವಕ ಪತ್ರಗಳು (Total Outward)'}
            </span>
            <span className="text-lg font-black text-stone-900">{currentLetters.length}</span>
          </div>

          {activeMode === 'inward' ? (
            <>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-800 font-semibold block uppercase">
                  ವಿಲೇವಾರಿ ಬಾಕಿ (Pending Action)
                </span>
                <span className="text-lg font-black text-amber-900">
                  {currentLetters.filter(l => l.status === 'Pending Action').length}
                </span>
              </div>

              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-800 font-semibold block uppercase">
                  ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)
                </span>
                <span className="text-lg font-black text-blue-900">
                  {currentLetters.filter(l => l.status === 'Under Review').length}
                </span>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold block uppercase">
                  ವಿಲೇವಾರಿ / ರವಾನಿಸಲಾಗಿದೆ (Disposed)
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {currentLetters.filter(l => l.status === 'Closed & Archived' || l.status === 'Dispatched').length}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-800 font-semibold block uppercase">
                  ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ / ಅಂಚೆ (Post)
                </span>
                <span className="text-lg font-black text-blue-900">
                  {currentLetters.filter(l => l.dispatchMode === 'Speed Post' || l.dispatchMode === 'Registered Post' || l.dispatchMode === 'Ordinary Post').length}
                </span>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                <span className="text-[10px] text-purple-800 font-semibold block uppercase">
                  ದೂತನ ಮೂಲಕ / ಪಿಯೋನ್ ಬುಕ್ (By Hand)
                </span>
                <span className="text-lg font-black text-purple-900">
                  {currentLetters.filter(l => l.dispatchMode === 'By Hand / Peon Book').length}
                </span>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold block uppercase">
                  ಇ-ಮೇಲ್ / ಡಿಜಿಟಲ್ (Email/Portal)
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {currentLetters.filter(l => l.dispatchMode === 'Email' || l.dispatchMode === 'WhatsApp / Digital').length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeMode === 'inward' 
                ? 'ಆವಕ ಸಂಖ್ಯೆ, ಕಳುಹಿಸಿದವರು, ವಿಷಯ ಅಥವಾ ಕಡತ ಸಂಖ್ಯೆ ಹುಡುಕಿ...' 
                : 'ಜಾವಕ ಸಂಖ್ಯೆ, ಪತ್ರ ಸಂಖ್ಯೆ, ಸ್ವೀಕರಿಸುವವರು ಅಥವಾ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ ಹುಡುಕಿ...'}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
            />
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
            >
              <option value="all">ಎಲ್ಲಾ ಶಾಖೆಗಳು (All Sections)</option>
              <option value="Administration & Services">ಆಡಳಿತ ಶಾಖೆ (Administration)</option>
              <option value="Academic Wing">ಶೈಕ್ಷಣಿಕ ಶಾಖೆ (Academic)</option>
              <option value="Accounts & Grants">ಲೆಕ್ಕ ಶಾಖೆ (Accounts)</option>
              <option value="Examination Board">ಪರೀಕ್ಷಾ ಶಾಖೆ (Exams)</option>
              <option value="Inspection & Quality">ತಪಾಸಣಾ ಶಾಖೆ (Inspection)</option>
              <option value="Legal & Grievances">ಮಾಹಿತಿ ಹಕ್ಕು / ನ್ಯಾಯಾಂಗ (Legal/RTI)</option>
            </select>
          </div>

          {/* Status or Dispatch Mode Filter */}
          <div>
            {activeMode === 'inward' ? (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
              >
                <option value="all">ಎಲ್ಲಾ ಸ್ಥಿತಿ (All Statuses)</option>
                <option value="Pending Action">ವಿಲೇವಾರಿ ಬಾಕಿ (Pending Action)</option>
                <option value="Under Review">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)</option>
                <option value="Approved & Signed">ಅನುಮೋದಿಸಲಾಗಿದೆ (Approved)</option>
                <option value="Dispatched">ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ (Dispatched)</option>
                <option value="Closed & Archived">ಕಡತಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ (Filed/Closed)</option>
              </select>
            ) : (
              <select
                value={selectedDispatchMode}
                onChange={(e) => setSelectedDispatchMode(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
              >
                <option value="all">ಎಲ್ಲಾ ರವಾನೆ ವಿಧಾನಗಳು (All Dispatch Modes)</option>
                <option value="Speed Post">ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ (Speed Post)</option>
                <option value="Registered Post">ನೋಂದಾಯಿತ ಅಂಚೆ (Registered Post)</option>
                <option value="Ordinary Post">ಸಾಮಾನ್ಯ ಅಂಚೆ (Ordinary Post)</option>
                <option value="By Hand / Peon Book">ದೂತನ ಮೂಲಕ / ಪಿಯೋನ್ ಬುಕ್ (By Hand)</option>
                <option value="Email">ಅಧಿಕೃತ ಇ-ಮೇಲ್ (Email)</option>
                <option value="WhatsApp / Digital">ವಾಟ್ಸಾಪ್ / ಡಿಜಿಟಲ್ ಪೋರ್ಟಲ್ (Digital)</option>
              </select>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] focus:outline-none"
              title="ದಿನಾಂಕದಿಂದ (From Date)"
            />
            <span className="text-stone-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] focus:outline-none"
              title="ದಿನಾಂಕದವರೆಗೆ (To Date)"
            />
          </div>
        </div>
      </div>

      {/* Official Government Ledger Register Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {/* Printable Official Header (Visible on print or at top of ledger) */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">
              {activeMode === 'inward' 
                ? 'ಆವಕ ವಹಿ ವಹಿವಾಟು ಪಟ್ಟಿ (Inward Dak Ledger Entries)' 
                : 'ಜಾವಕ ವಹಿ ವಹಿವಾಟು ಪಟ್ಟಿ (Outward Dispatch Ledger Entries)'}
            </h3>
            <p className="text-[11px] text-stone-500">
              ತೋರಿಸಲಾಗುತ್ತಿರುವ ದಾಖಲೆಗಳು: <strong>{filteredLetters.length}</strong> / {currentLetters.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase bg-white px-2 py-1 rounded border border-stone-200">
              ಆರ್ಥಿಕ ವರ್ಷ: 2026-27
            </span>
          </div>
        </div>

        {filteredLetters.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              {activeMode === 'inward' ? <Inbox className="w-6 h-6" /> : <Send className="w-6 h-6" />}
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-bold text-stone-800">
                {activeMode === 'inward' ? 'ಆವಕ ವಹಿಯಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ' : 'ಜಾವಕ ವಹಿಯಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ'}
              </h4>
              <p className="text-xs text-stone-500">
                {activeMode === 'inward'
                  ? 'ಕಛೇರಿಯ ಹೊಸ ಪತ್ರವನ್ನು ನೋಂದಾಯಿಸಲು ಮೇಲಿನ "+ ಹೊಸ ಆವಕ ನಮೂದು" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.'
                  : 'ರವಾನಿಸಿದ ಪತ್ರ ಅಥವಾ ಆದೇಶವನ್ನು ದಾಖಲಿಸಲು ಮೇಲಿನ "+ ಹೊಸ ಜಾವಕ ನಮೂದು" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.'}
              </p>
            </div>
            <button
              onClick={() => handleOpenNewModal(activeMode)}
              className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-stone-900" />
              <span>{activeMode === 'inward' ? 'ಮೊದಲ ಆವಕ ದಾಖಲೆ ನಮೂದಿಸಿ' : 'ಮೊದಲ ಜಾವಕ ದಾಖಲೆ ನಮೂದಿಸಿ'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              {/* TABLE HEADER ADHERING TO STANDARD KARNATAKA GOVT REGISTER FORMAT */}
              <thead>
                <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 w-12 text-center border-r border-stone-200">
                    <div>1</div>
                    <div>ಕ್ರ.ಸಂ</div>
                  </th>
                  <th className="py-3 px-3 w-32 border-r border-stone-200">
                    <div>2</div>
                    <div>{activeMode === 'inward' ? 'ಆವಕ ಸಂಖ್ಯೆ' : 'ಜಾವಕ ಸಂಖ್ಯೆ'}</div>
                  </th>
                  <th className="py-3 px-3 w-28 border-r border-stone-200">
                    <div>3</div>
                    <div>{activeMode === 'inward' ? 'ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ' : 'ರವಾನಿಸಿದ ದಿನಾಂಕ'}</div>
                  </th>
                  <th className="py-3 px-4 w-56 border-r border-stone-200">
                    <div>4</div>
                    <div>{activeMode === 'inward' ? 'ಯಾರಿಂದ ಬಂದಿದೆ / ಮೂಲ ಪತ್ರ ಸಂಖ್ಯೆ' : 'ಯಾರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ / ಪತ್ರ ಸಂಖ್ಯೆ'}</div>
                  </th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-stone-200">
                    <div>5</div>
                    <div>ವಿಷಯ (Subject)</div>
                  </th>
                  <th className="py-3 px-3 w-36 border-r border-stone-200">
                    <div>6</div>
                    <div>{activeMode === 'inward' ? 'ಶಾಖೆ & ಕೇಸ್ ವರ್ಕರ್' : 'ರವಾನೆ ವಿಧಾನ & ವೆಚ್ಚ'}</div>
                  </th>
                  <th className="py-3 px-3 w-32 border-r border-stone-200">
                    <div>7</div>
                    <div>ಕಡತ ಸಂಖ್ಯೆ (File No)</div>
                  </th>
                  <th className="py-3 px-3 w-28 border-r border-stone-200 text-center">
                    <div>8</div>
                    <div>{activeMode === 'inward' ? 'ಸ್ಥಿತಿ / ಲಗತ್ತು' : 'ಟ್ರ್ಯಾಕಿಂಗ್ / ರಶೀದಿ'}</div>
                  </th>
                  <th className="py-3 px-3 w-36 text-center">
                    <div>9</div>
                    <div>ಕ್ರಮಗಳು (Actions)</div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200 font-normal">
                {filteredLetters.map((letter, index) => {
                  const displayNum = activeMode === 'inward' 
                    ? (letter.inwardNumber || letter.referenceNumber)
                    : (letter.outwardNumber || letter.referenceNumber);

                  return (
                    <tr 
                      key={letter.id} 
                      className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                      onClick={() => setViewingLetter(letter)}
                    >
                      {/* 1. Sl No */}
                      <td className="py-3 px-3 text-center text-stone-500 font-mono border-r border-stone-200">
                        {index + 1}
                      </td>

                      {/* 2. Inward / Outward Number */}
                      <td className="py-3 px-3 border-r border-stone-200 font-bold text-stone-900">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-sky-950 block">
                            {displayNum}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(displayNum, letter.id);
                            }}
                            className="text-stone-400 hover:text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="ಸಂಖ್ಯೆ ನಕಲಿಸಿ"
                          >
                            {copiedId === letter.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {letter.priority === 'Immediate' && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-rose-100 text-rose-800">
                            ತಕ್ಷಣ (Immediate)
                          </span>
                        )}
                      </td>

                      {/* 3. Date */}
                      <td className="py-3 px-3 border-r border-stone-200 text-stone-700 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{letter.dateReceivedOrIssued}</span>
                        </div>
                      </td>

                      {/* 4. Sender / Recipient Details */}
                      <td className="py-3 px-4 border-r border-stone-200">
                        {activeMode === 'inward' ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-stone-900 leading-tight">
                              {letter.senderName || 'ಅನಾಮಧೇಯ / ಕಳುಹಿಸಿದವರು'}
                            </div>
                            <div className="text-[11px] text-stone-600 leading-tight">
                              {letter.senderDepartment}
                            </div>
                            {letter.senderLetterNo && (
                              <div className="text-[10px] text-stone-500 font-mono">
                                ಪತ್ರ ಸಂ: {letter.senderLetterNo}
                                {letter.senderLetterDate && ` (ದಿ: ${letter.senderLetterDate})`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-stone-900 leading-tight">
                              {letter.recipientName || 'ಸ್ವೀಕರಿಸುವವರು'}
                            </div>
                            <div className="text-[11px] text-stone-600 leading-tight">
                              {letter.recipientDepartment}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              ಆದೇಶ ಸಂ: {letter.referenceNumber}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Subject */}
                      <td className="py-3 px-4 border-r border-stone-200">
                        <div className="font-medium text-stone-900 line-clamp-2 leading-snug">
                          {letter.subject}
                        </div>
                        {letter.remarks && (
                          <div className="text-[10px] text-stone-500 italic mt-0.5 line-clamp-1">
                            ಷರಾ: {letter.remarks}
                          </div>
                        )}
                      </td>

                      {/* 6. Section & Custodian (Inward) OR Dispatch Mode & Postal Fee (Outward) */}
                      <td className="py-3 px-3 border-r border-stone-200">
                        {activeMode === 'inward' ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-sky-900 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 block truncate">
                              {letter.section}
                            </span>
                            <div className="text-[10px] text-stone-600 truncate">
                              {letter.assignedOfficer || 'ಅಧಿಕಾರಿಗೆ ವಹಿಸಲಾಗಿಲ್ಲ'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                              {letter.dispatchMode || 'Speed Post'}
                            </span>
                            {letter.postalStampAmount ? (
                              <div className="text-[10px] text-stone-600 font-mono">
                                ಶುಲ್ಕ: ₹ {letter.postalStampAmount}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </td>

                      {/* 7. File Number */}
                      <td className="py-3 px-3 border-r border-stone-200 font-mono text-[11px] text-stone-700">
                        <div className="flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate" title={letter.fileNumber}>
                            {letter.fileNumber || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* 8. Status / Attachment (Inward) OR Tracking No (Outward) */}
                      <td className="py-3 px-3 border-r border-stone-200 text-center">
                        {activeMode === 'inward' ? (
                          <div className="space-y-1">
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              letter.status === 'Pending Action'
                                ? 'bg-amber-100 text-amber-900'
                                : letter.status === 'Under Review'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {letter.status === 'Pending Action' ? 'ವಿಲೇವಾರಿ ಬಾಕಿ' : letter.status === 'Under Review' ? 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' : 'ವಿಲೇವಾರಿ'}
                            </span>
                            {letter.attachments && letter.attachments.length > 0 && (
                              <div className="text-[10px] text-sky-700 flex items-center justify-center gap-0.5 font-medium">
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>{letter.attachments.length} ಲಗತ್ತು</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {letter.trackingNumber ? (
                              <div className="text-[10px] font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded border border-stone-200 truncate">
                                {letter.trackingNumber}
                              </div>
                            ) : (
                              <span className="text-[10px] text-stone-400">-</span>
                            )}
                            {letter.attachments && letter.attachments.length > 0 && (
                              <div className="text-[10px] text-sky-700 flex items-center justify-center gap-0.5 font-medium">
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>ಪ್ರತಿ ಲಗತ್ತಿಸಲಾಗಿದೆ</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* Inward Action: Draft Reply Button */}
                          {activeMode === 'inward' && onDraftReply && (
                            <button
                              type="button"
                              onClick={() => onDraftReply(letter)}
                              className="p-1 text-sky-700 hover:text-sky-950 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="ಉತ್ತರ ಪತ್ರ ತಯಾರಿಸಿ (Draft Official Reply)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewingLetter(letter)}
                            className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                            title="ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(letter)}
                            className="p-1 text-stone-600 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="ತಿದ್ದುಪಡಿ ಮಾಡಿ (Edit)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`ದಾಖಲೆ ${displayNum} ಅಳಿಸಲು ಖಚಿತವೇ?`)) {
                                onDeleteLetter(letter.id);
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="ಅಳಿಸಿ (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL: NEW / EDIT INWARD OR OUTWARD ENTRY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-black text-sm">
                  {activeMode === 'inward' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-100">
                    {editingLetter 
                      ? `${activeMode === 'inward' ? 'ಆವಕ ದಾಖಲೆ ತಿದ್ದುಪಡಿ' : 'ಜಾವಕ ದಾಖಲೆ ತಿದ್ದುಪಡಿ'}`
                      : `${activeMode === 'inward' ? '+ ನೂತನ ಆವಕ ಪತ್ರ ನೋಂದಣಿ (+ New Inward Entry)' : '+ ನೂತನ ಜಾವಕ ಪತ್ರ ನೋಂದಣಿ (+ New Outward Entry)'}`}
                  </h3>
                  <p className="text-[11px] text-amber-200/90">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ • ಅಧಿಕೃತ ದಾಖಲಾತಿ ವಹಿ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Number Field */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {activeMode === 'inward' ? 'ಆವಕ ಸಂಖ್ಯೆ (Inward No.) *' : 'ಜಾವಕ ಸಂಖ್ಯೆ (Outward No.) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={activeMode === 'inward' ? formData.inwardNumber : formData.outwardNumber}
                    onChange={(e) => {
                      if (activeMode === 'inward') {
                        setFormData({ ...formData, inwardNumber: e.target.value });
                      } else {
                        setFormData({ ...formData, outwardNumber: e.target.value });
                      }
                    }}
                    placeholder={activeMode === 'inward' ? 'ಆವಕ-1/2026-27' : 'ಜಾವಕ-1/2026-27'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                {/* Date Field */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {activeMode === 'inward' ? 'ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ (Date of Receipt) *' : 'ರವಾನಿಸಿದ ದಿನಾಂಕ (Date of Dispatch) *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateReceivedOrIssued}
                    onChange={(e) => setFormData({ ...formData, dateReceivedOrIssued: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Inward Specific: Sender details and sender's letter number */}
              {activeMode === 'inward' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಯಾರಿಂದ ಬಂದಿದೆ (From / Sender Name & School/Office) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.senderName ?? ''}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        placeholder="ಉದಾ: ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹೊಸಮನೆ"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಇಲಾಖೆ / ಕಚೇರಿ / ವಿಳಾಸ (Sender Office/Dept)
                      </label>
                      <input
                        type="text"
                        value={formData.senderDepartment ?? ''}
                        onChange={(e) => setFormData({ ...formData, senderDepartment: e.target.value })}
                        placeholder="ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ / ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯ"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಮೂಲ ಪತ್ರದ ಸಂಖ್ಯೆ (Sender Letter Reference)
                      </label>
                      <input
                        type="text"
                        value={formData.senderLetterNo ?? ''}
                        onChange={(e) => setFormData({ ...formData, senderLetterNo: e.target.value })}
                        placeholder="ಉದಾ: ಸ.ಹಿ.ಪ್ರಾ.ಶಾ/2026-27/ಸಂ-14"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಮೂಲ ಪತ್ರದ ದಿನಾಂಕ (Sender Letter Date)
                      </label>
                      <input
                        type="date"
                        value={formData.senderLetterDate ?? ''}
                        onChange={(e) => setFormData({ ...formData, senderLetterDate: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Outward Specific: Recipient and Office Order Number */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಕಛೇರಿಯ ಪತ್ರ / ಆದೇಶ ಸಂಖ್ಯೆ (Office Reference No.) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.referenceNumber ?? ''}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        placeholder="ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ವಾ.ವೇ.ಬಡ್ತಿ/104/2026-27"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಯಾರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ (To Whom Dispatched / Recipient) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.recipientName ?? ''}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        placeholder="ಉದಾ: ಮುಖ್ಯೋಪಾಧ್ಯಾಯರುಗಳು / ಶ್ರೀ ಮಂಜುನಾಥ್ ಬಿ.ಎಸ್., ಶಿಕ್ಷಕರು"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ರವಾನೆ ವಿಧಾನ (Dispatch Mode)
                      </label>
                      <select
                        value={formData.dispatchMode ?? 'Speed Post'}
                        onChange={(e) => setFormData({ ...formData, dispatchMode: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      >
                        <option value="Speed Post">ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ (Speed Post)</option>
                        <option value="Registered Post">ನೋಂದಾಯಿತ ಅಂಚೆ (Registered Post)</option>
                        <option value="Ordinary Post">ಸಾಮಾನ್ಯ ಅಂಚೆ (Ordinary Post)</option>
                        <option value="By Hand / Peon Book">ದೂತನ ಮೂಲಕ / ಪಿಯೋನ್ ಬುಕ್ (By Hand)</option>
                        <option value="Email">ಅಧಿಕೃತ ಇ-ಮೇಲ್ (Email)</option>
                        <option value="WhatsApp / Digital">ವಾಟ್ಸಾಪ್ / ಡಿಜಿಟಲ್ ಪೋರ್ಟಲ್ (Digital)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಅಂಚೆ ರಶೀದಿ / RL / ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ
                      </label>
                      <input
                        type="text"
                        value={formData.trackingNumber ?? ''}
                        onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                        placeholder="ಉದಾ: EK123456789IN"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        ಅಂಚೆ ಚೀಟಿ ಶುಲ್ಕ / ವೆಚ್ಚ (Postal Charges ₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.postalStampAmount ?? 0}
                        onChange={(e) => {
                          const val = e.target.value;
                          const n = val === '' ? 0 : Number(val);
                          setFormData({ ...formData, postalStampAmount: isNaN(n) ? 0 : n });
                        }}
                        placeholder="₹ 25"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Subject */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  ವಿಷಯ (Subject / Essence of Communication) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="ಪತ್ರದ ಸಾರಾಂಶ / ವಿಷಯ ವಿವರವಾಗಿ ಬರೆಯಿರಿ..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                />
              </div>

              {/* Section, Linked File, Case Worker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ಯಾವ ಶಾಖೆ (Section) *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value as DepartmentSection })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  >
                    <option value="Administration & Services">ಆಡಳಿತ ಶಾಖೆ (Administration)</option>
                    <option value="Academic Wing">ಶೈಕ್ಷಣಿಕ ಶಾಖೆ (Academic)</option>
                    <option value="Accounts & Grants">ಲೆಕ್ಕ ಶಾಖೆ (Accounts)</option>
                    <option value="Examination Board">ಪರೀಕ್ಷಾ ಶಾಖೆ (Exams)</option>
                    <option value="Inspection & Quality">ತಪಾಸಣಾ ಶಾಖೆ (Inspection)</option>
                    <option value="Legal & Grievances">ಮಾಹಿತಿ ಹಕ್ಕು / ನ್ಯಾಯಾಂಗ (Legal/RTI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ಕಡತ ಸಂಖ್ಯೆ (Linked File Number)
                  </label>
                  <input
                    type="text"
                    value={formData.fileNumber}
                    onChange={(e) => setFormData({ ...formData, fileNumber: e.target.value })}
                    placeholder="ಉದಾ: FILE-2026/ADM-102"
                    list="files-datalist"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                  <datalist id="files-datalist">
                    {files.map(f => (
                      <option key={f.id} value={f.fileNumber}>
                        {f.fileNumber} - {f.subject}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {activeMode === 'inward' ? 'ವಹಿಸಲಾದ ಅಧಿಕಾರಿ / ಕೇಸ್ ವರ್ಕರ್' : 'ರವಾನಿಸಿದ ಸಿಬ್ಬಂದಿ'}
                  </label>
                  <input
                    type="text"
                    value={formData.assignedOfficer}
                    onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                    placeholder="ಉದಾ: ಶ್ರೀ ನಾಗರಾಜ್ ಕೆ.ಎಸ್., ಎಫ್‌ಡಿಎ"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status and Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ಕ್ರಮದ ಸ್ಥಿತಿ (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LetterStatus })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  >
                    <option value="Pending Action">ವಿಲೇವಾರಿ ಬಾಕಿ (Pending Action)</option>
                    <option value="Under Review">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)</option>
                    <option value="Approved & Signed">ಅನುಮೋದಿಸಲಾಗಿದೆ (Approved)</option>
                    <option value="Dispatched">ರವಾನಿಸಲಾಗಿದೆ (Dispatched)</option>
                    <option value="Closed & Archived">ಕಡತಕ್ಕೆ ಸೇರಿಸಿ ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ಷರಾ / ಟಿಪ್ಪಣಿ (Remarks)
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="ಉದಾ: 15 ದಿನಗಳೊಳಗೆ ವರದಿ ಕೋರಲಾಗಿದೆ / ಕಡತಕ್ಕೆ ಮಂಡಿಸಲಾಗಿದೆ"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Document attachment upload */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  ದಾಖಲೆ ಲಗತ್ತು (Scanned Document Attachment - PDF or Image)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const newAtt: DocumentAttachment = {
                            id: `att-${Date.now()}`,
                            fileName: file.name,
                            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                            fileType: file.type,
                            uploadedAt: new Date().toISOString().split('T')[0],
                            dataUrl: reader.result as string,
                          };
                          setFormData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, newAtt],
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                  />
                  {formData.attachments.length > 0 && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {formData.attachments.length} ಕಡತ ಲಗತ್ತಿಸಲಾಗಿದೆ
                    </span>
                  )}
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.attachments.map((att, i) => (
                      <span 
                        key={att.id || i}
                        className="px-2 py-1 bg-stone-100 border border-stone-200 rounded text-[11px] flex items-center gap-1.5"
                      >
                        <Paperclip className="w-3 h-3 text-stone-500" />
                        <span>{att.fileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, idx) => idx !== i),
                            }));
                          }}
                          className="text-rose-600 hover:text-rose-800 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-stone-900" />
                  <span>{editingLetter ? 'ಬದಲಾವಣೆ ಉಳಿಸಿ' : 'ವಹಿಯಲ್ಲಿ ದಾಖಲಿಸಿ (Save to Register)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW LETTER DETAILS */}
      {viewingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  {viewingLetter.direction === 'inward' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100">
                    {viewingLetter.direction === 'inward' ? 'ಆವಕ ಪತ್ರ ವಿವರ' : 'ಜಾವಕ ಪತ್ರ ವಿವರ'}
                  </h3>
                  <span className="text-[11px] font-mono text-amber-300">
                    {viewingLetter.inwardNumber || viewingLetter.outwardNumber || viewingLetter.referenceNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingLetter(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <div className="font-extrabold text-sm text-stone-900 leading-snug">
                  {viewingLetter.subject}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500">ದಿನಾಂಕ: <strong>{viewingLetter.dateReceivedOrIssued}</strong></span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500">ಶಾಖೆ: <strong>{viewingLetter.section}</strong></span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500">ಕಡತ: <strong>{viewingLetter.fileNumber}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold block uppercase">
                    {viewingLetter.direction === 'inward' ? 'ಕಳುಹಿಸಿದವರು (Sender)' : 'ರವಾನಿಸಿದವರು (Issued By)'}
                  </span>
                  <div className="font-bold text-stone-900 mt-1">{viewingLetter.senderName}</div>
                  <div className="text-stone-600 text-[11px]">{viewingLetter.senderDepartment}</div>
                  {viewingLetter.senderLetterNo && (
                    <div className="text-stone-500 text-[10px] font-mono mt-1">
                      ಮೂಲ ಪತ್ರ ಸಂ: {viewingLetter.senderLetterNo}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold block uppercase">
                    {viewingLetter.direction === 'inward' ? 'ಸ್ವೀಕರಿಸಿದ ಕಛೇರಿ (Recipient)' : 'ಯಾರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ (Recipient)'}
                  </span>
                  <div className="font-bold text-stone-900 mt-1">{viewingLetter.recipientName}</div>
                  <div className="text-stone-600 text-[11px]">{viewingLetter.recipientDepartment}</div>
                  {viewingLetter.dispatchMode && (
                    <div className="text-emerald-700 text-[10px] font-semibold mt-1">
                      ವಿಧಾನ: {viewingLetter.dispatchMode}
                    </div>
                  )}
                </div>
              </div>

              {viewingLetter.trackingNumber && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                      ಅಂಚೆ ರಶೀದಿ / ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-950">
                      {viewingLetter.trackingNumber}
                    </span>
                  </div>
                  {viewingLetter.postalStampAmount ? (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">ಅಂಚೆ ವೆಚ್ಚ</span>
                      <span className="font-mono font-bold text-emerald-950">₹ {viewingLetter.postalStampAmount}</span>
                    </div>
                  ) : null}
                </div>
              )}

              {viewingLetter.remarks && (
                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-amber-950">
                  <span className="text-[10px] font-bold uppercase block text-amber-800">ಷರಾ / ಟಿಪ್ಪಣಿ</span>
                  <p className="mt-0.5">{viewingLetter.remarks}</p>
                </div>
              )}

              {viewingLetter.attachments && viewingLetter.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-stone-700 block">ಲಗತ್ತಿಸಲಾದ ಕಡತಗಳು ({viewingLetter.attachments.length})</span>
                  <div className="space-y-1.5">
                    {viewingLetter.attachments.map((att, i) => (
                      <div 
                        key={att.id || i}
                        className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-stone-500" />
                          <div>
                            <span className="font-semibold text-stone-900 block">{att.fileName}</span>
                            <span className="text-[10px] text-stone-500">{att.fileSize}</span>
                          </div>
                        </div>
                        {att.dataUrl && (
                          <a
                            href={att.dataUrl}
                            download={att.fileName}
                            className="px-2.5 py-1 bg-stone-900 text-white rounded text-[11px] font-bold hover:bg-stone-800 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>ಡೌನ್‌ಲೋಡ್</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              {viewingLetter.direction === 'inward' && onDraftReply && (
                <button
                  type="button"
                  onClick={() => {
                    setViewingLetter(null);
                    onDraftReply(viewingLetter);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-950" />
                  <span>📄 ಉತ್ತರ ಪತ್ರ ತಯಾರಿಸಿ (Draft Reply)</span>
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const l = viewingLetter;
                    setViewingLetter(null);
                    handleOpenEditModal(l);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  ತಿದ್ದುಪಡಿ (Edit)
                </button>
                <button
                  type="button"
                  onClick={() => setViewingLetter(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY OFFICIAL KARNATAKA GOVERNMENT REGISTER SHEET */}
      <div className="hidden print:block font-serif text-black p-4">
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h1 className="text-base font-bold">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
          <h2 className="text-sm font-bold">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
          <h3 className="text-xs font-bold">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</h3>
          <h4 className="text-sm font-black underline mt-2">
            {activeMode === 'inward' 
              ? 'ಆವಕ ವಹಿ (INWARD DAK REGISTER) - 2026-27' 
              : 'ಜಾವಕ ವಹಿ (OUTWARD DISPATCH REGISTER) - 2026-27'}
          </h4>
        </div>

        <table className="w-full text-xs border border-black border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-center font-bold">
              <th className="border border-black p-1">1<br />ಕ್ರ.ಸಂ</th>
              <th className="border border-black p-1">2<br />{activeMode === 'inward' ? 'ಆವಕ ಸಂ' : 'ಜಾವಕ ಸಂ'}</th>
              <th className="border border-black p-1">3<br />ದಿನಾಂಕ</th>
              <th className="border border-black p-1">4<br />{activeMode === 'inward' ? 'ಯಾರಿಂದ ಬಂದಿದೆ' : 'ಯಾರಿಗೆ ರವಾನಿಸಲಾಗಿದೆ'}</th>
              <th className="border border-black p-1">5<br />ವಿಷಯ</th>
              <th className="border border-black p-1">6<br />{activeMode === 'inward' ? 'ಶಾಖೆ / ಅಧಿಕಾರಿ' : 'ರವಾನೆ ವಿಧಾನ'}</th>
              <th className="border border-black p-1">7<br />ಕಡತ ಸಂ</th>
              <th className="border border-black p-1">8<br />{activeMode === 'inward' ? 'ಸ್ಥಿತಿ' : 'ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂ'}</th>
              <th className="border border-black p-1">9<br />ಷರಾ</th>
            </tr>
          </thead>
          <tbody>
            {filteredLetters.map((l, i) => (
              <tr key={l.id} className="border-b border-black">
                <td className="border border-black p-1 text-center font-mono">{i + 1}</td>
                <td className="border border-black p-1 font-mono font-bold">
                  {l.inwardNumber || l.outwardNumber || l.referenceNumber}
                </td>
                <td className="border border-black p-1 font-mono">{l.dateReceivedOrIssued}</td>
                <td className="border border-black p-1">
                  {activeMode === 'inward' ? `${l.senderName} (${l.senderDepartment})` : `${l.recipientName} (${l.recipientDepartment})`}
                </td>
                <td className="border border-black p-1">{l.subject}</td>
                <td className="border border-black p-1">
                  {activeMode === 'inward' ? `${l.section} - ${l.assignedOfficer}` : `${l.dispatchMode || 'Speed Post'}`}
                </td>
                <td className="border border-black p-1 font-mono">{l.fileNumber}</td>
                <td className="border border-black p-1 text-center">
                  {activeMode === 'inward' ? l.status : (l.trackingNumber || '-')}
                </td>
                <td className="border border-black p-1">{l.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-4 gap-4 mt-16 pt-8 text-center text-xs font-bold">
          <div>
            <div>...................................</div>
            <div>ವಹಿ ಗುಮಾಸ್ತರು (Clerk)</div>
          </div>
          <div>
            <div>...................................</div>
            <div>ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)</div>
          </div>
          <div>
            <div>...................................</div>
            <div>ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Superintendent)</div>
          </div>
          <div>
            <div>...................................</div>
            <div>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
