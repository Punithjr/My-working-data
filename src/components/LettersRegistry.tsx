import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { EducationLetter, LetterCategory, DepartmentSection, LetterPriority, LetterStatus, Employee, MasterDocketFile } from '../types';
import { generateLetterPdf } from '../utils/letterPdfExport';
import { formatDateDDMMYYYY } from '../utils/formatDate';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  Clock, 
  FileText, 
  Paperclip, 
  Eye, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Plus, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  Tag, 
  Building, 
  Calendar,
  AlertTriangle,
  Users,
  FolderGit2,
  ChevronRight,
  X,
  Layers,
  BarChart2,
  Award
} from 'lucide-react';

interface LettersRegistryProps {
  letters: EducationLetter[];
  files?: MasterDocketFile[];
  employees?: Employee[];
  onViewLetter: (letter: EducationLetter) => void;
  onEditLetter: (letter: EducationLetter) => void;
  onDeleteLetter: (id: string) => void;
  onNewLetter: () => void;
  onOpenDrafter: () => void;
  onSummarizeLetter: (letter: EducationLetter) => void;
  onNavigateToEmployees?: () => void;
  onNavigateToFiles?: () => void;
}

export const LettersRegistry: React.FC<LettersRegistryProps> = ({
  letters,
  files = [],
  employees = [],
  onViewLetter,
  onEditLetter,
  onDeleteLetter,
  onNewLetter,
  onOpenDrafter,
  onSummarizeLetter,
  onNavigateToEmployees,
  onNavigateToFiles,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'inward' | 'outward' | 'urgent' | 'overdue' | 'orderBased'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [showFileBreakdown, setShowFileBreakdown] = useState<boolean>(false);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  const handleCopyRef = (ref: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRefId(id);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  // Compute file totals with letter counts
  const fileWiseTotals = useMemo(() => {
    if (files.length > 0) {
      return files.map(f => {
        const count = letters.filter(l => l.fileNumber === f.fileNumber || (f.linkedLetterIds && f.linkedLetterIds.includes(l.id))).length;
        return {
          fileNumber: f.fileNumber,
          subject: f.subject,
          section: f.section,
          currentCustodian: f.currentCustodian,
          count,
        };
      });
    }

    const map = new Map<string, number>();
    letters.forEach(l => {
      const fn = l.fileNumber || 'Unassigned';
      map.set(fn, (map.get(fn) || 0) + 1);
    });
    return Array.from(map.entries()).map(([fileNumber, count]) => ({
      fileNumber,
      subject: 'Docket Correspondence',
      section: 'General',
      currentCustodian: 'Custodian',
      count,
    }));
  }, [files, letters]);

  // Filter letters
  const filteredLetters = useMemo(() => {
    return letters.filter(letter => {
      // Tab filter
      if (activeTab === 'inward' && letter.direction !== 'inward') return false;
      if (activeTab === 'outward' && letter.direction !== 'outward') return false;
      if (activeTab === 'urgent' && letter.priority !== 'Immediate' && letter.priority !== 'Urgent') return false;
      if (activeTab === 'overdue') {
        if (letter.status === 'Closed & Archived' || letter.status === 'Dispatched') return false;
        const due = new Date(letter.dueDate);
        if (due >= new Date()) return false;
      }
      if (activeTab === 'orderBased') {
        if (!letter.linkedOrderNumber && letter.category !== 'Government Order (GO)') return false;
      }

      // Dropdown filters
      if (selectedCategory !== 'all' && letter.category !== selectedCategory) return false;
      if (selectedSection !== 'all' && letter.section !== selectedSection) return false;
      if (selectedStatus !== 'all' && letter.status !== selectedStatus) return false;
      if (selectedFileFilter !== 'all' && letter.fileNumber !== selectedFileFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          letter.referenceNumber.toLowerCase().includes(q) ||
          letter.fileNumber.toLowerCase().includes(q) ||
          letter.subject.toLowerCase().includes(q) ||
          letter.senderName.toLowerCase().includes(q) ||
          letter.senderDepartment.toLowerCase().includes(q) ||
          letter.recipientName.toLowerCase().includes(q) ||
          letter.recipientDepartment.toLowerCase().includes(q) ||
          letter.assignedOfficer.toLowerCase().includes(q) ||
          (letter.linkedOrderNumber && letter.linkedOrderNumber.toLowerCase().includes(q)) ||
          letter.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [letters, activeTab, selectedCategory, selectedSection, selectedStatus, selectedFileFilter, searchQuery]);

  // Selected Letters for Multi-Selection & Bulk Actions
  const [selectedLetterIds, setSelectedLetterIds] = useState<Set<string>>(new Set());

  const handleToggleSelectAll = () => {
    if (selectedLetterIds.size === filteredLetters.length && filteredLetters.length > 0) {
      setSelectedLetterIds(new Set());
    } else {
      setSelectedLetterIds(new Set(filteredLetters.map(l => l.id)));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedLetterIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedLetterIds(next);
  };

  // Bulk Print: triggers sequential PDF export or combined printing
  const handleBulkPrint = () => {
    const selectedLetters = filteredLetters.filter(l => selectedLetterIds.has(l.id));
    if (selectedLetters.length === 0) return;
    selectedLetters.forEach((letter, index) => {
      setTimeout(() => {
        generateLetterPdf(letter);
      }, index * 350);
    });
  };

  // Export to Microsoft Excel (.xlsx) using xlsx package
  const handleExportXLSX = (items = filteredLetters) => {
    const data = items.map(l => ({
      'Reference No': l.referenceNumber,
      'File No': l.fileNumber,
      'Direction': l.direction.toUpperCase(),
      'Subject': l.subject,
      'Category': l.category,
      'Section': l.section,
      'Sender': `${l.senderName} (${l.senderDepartment})`,
      'Recipient': `${l.recipientName} (${l.recipientDepartment})`,
      'Date Logged': formatDateDDMMYYYY(l.dateReceivedOrIssued),
      'Due Date': formatDateDDMMYYYY(l.dueDate),
      'Priority': l.priority,
      'Status': l.status,
      'Assigned Officer': l.assignedOfficer,
      'Financial Grant': l.financialAmount ? `$${l.financialAmount}` : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dak Register');
    XLSX.writeFile(wb, `education_dak_register_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Reference No',
      'File No',
      'Direction',
      'Subject',
      'Category',
      'Section',
      'Sender',
      'Recipient',
      'Date Logged',
      'Due Date',
      'Priority',
      'Status',
      'Assigned Officer',
      'Financial Grant'
    ];

    const rows = filteredLetters.map(l => [
      `"${l.referenceNumber}"`,
      `"${l.fileNumber}"`,
      `"${l.direction.toUpperCase()}"`,
      `"${l.subject.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.section}"`,
      `"${l.senderName} (${l.senderDepartment})"`,
      `"${l.recipientName} (${l.recipientDepartment})"`,
      `"${formatDateDDMMYYYY(l.dateReceivedOrIssued)}"`,
      `"${formatDateDDMMYYYY(l.dueDate)}"`,
      `"${l.priority}"`,
      `"${l.status}"`,
      `"${l.assignedOfficer}"`,
      l.financialAmount ? `"$${l.financialAmount}"` : '""'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `education_dak_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: LetterPriority) => {
    switch (priority) {
      case 'Immediate':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Urgent':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Routine':
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case 'Pending Action':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Approved & Signed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Dispatched':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Closed & Archived':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const calculateDueStatus = (dueDate: string, status: LetterStatus) => {
    if (status === 'Closed & Archived' || status === 'Dispatched') {
      return { label: 'Completed', isOverdue: false, days: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true, days: diffDays };
    } else if (diffDays === 0) {
      return { label: 'Due Today', isOverdue: true, days: 0 };
    } else {
      return { label: `Due in ${diffDays}d`, isOverdue: false, days: diffDays };
    }
  };

  return (
    <div id="letters-dak-registry-view" className="space-y-4">
      {/* Executive Overview Strip: emp ಒಟ್ಟು, file wise total, total dak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Total Dak */}
        <div className="bg-white rounded-xl p-3.5 border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ಒಟ್ಟು ಪತ್ರಗಳು / Total Dak
            </span>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {letters.length}
            </div>
            <span className="text-[11px] text-stone-500 block">
              {letters.filter(l => l.direction === 'inward').length} Inward • {letters.filter(l => l.direction === 'outward').length} Outward
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: emp ಒಟ್ಟು (Total Staff) */}
        <div 
          onClick={onNavigateToEmployees}
          className="bg-white rounded-xl p-3.5 border border-stone-200/90 shadow-xs flex items-center justify-between group cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                emp ಒಟ್ಟು / Total Staff
              </span>
              <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-amber-700 transition-colors" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">
              {employees.length}
            </div>
            <span className="text-[11px] text-stone-600 block">
              <span className="text-emerald-700 font-semibold">{employees.filter(e => e.status === 'Active').length} Active</span> • Directorate Roster
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: File Wise Total */}
        <div 
          onClick={() => setShowFileBreakdown(!showFileBreakdown)}
          className={`bg-white rounded-xl p-3.5 border shadow-xs flex items-center justify-between group cursor-pointer transition-colors ${
            showFileBreakdown || selectedFileFilter !== 'all' ? 'border-blue-500 bg-blue-50/20' : 'border-stone-200/90 hover:border-blue-400'
          }`}
        >
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                file wise ಒಟ್ಟು / Total Files
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-blue-100 text-blue-800 font-medium">
                {showFileBreakdown ? 'Hide' : 'View Breakdown'}
              </span>
            </div>
            <div className="text-xl font-bold text-blue-950 mt-0.5">
              {fileWiseTotals.length} Master Dockets
            </div>
            <span className="text-[11px] text-stone-600 block">
              {letters.filter(l => l.fileNumber).length} letters indexed in files
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 group-hover:bg-blue-100 transition-colors">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Expandable File-Wise Breakdown Matrix */}
      {showFileBreakdown && (
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                ಫೈಲ್‌ವಾರು ಒಟ್ಟು ಪತ್ರಗಳು • File-Wise Letter Count Breakdown
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {selectedFileFilter !== 'all' && (
                <button
                  onClick={() => setSelectedFileFilter('all')}
                  className="px-2 py-0.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md flex items-center gap-1 font-medium transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear File Filter</span>
                </button>
              )}
              {onNavigateToFiles && (
                <button
                  onClick={onNavigateToFiles}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>Open Full FTS Tracking</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1">
            {fileWiseTotals.map(f => {
              const isSelected = selectedFileFilter === f.fileNumber;
              return (
                <div
                  key={f.fileNumber}
                  onClick={() => setSelectedFileFilter(isSelected ? 'all' : f.fileNumber)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-blue-900'}`}>
                      {f.fileNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {f.count} {f.count === 1 ? 'ltr' : 'ltrs'}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-1 ${isSelected ? 'text-stone-200' : 'text-stone-700'}`} title={f.subject}>
                    {f.subject}
                  </p>
                  <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                    {f.section}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active File Filter Indicator Banner */}
      {selectedFileFilter !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              ಫೈಲ್ ಫಿಲ್ಟರ್ ಸಕ್ರಿಯವಾಗಿದೆ (Filtered by Docket): <strong>{selectedFileFilter}</strong> ({filteredLetters.length} letters found)
            </span>
          </div>
          <button
            onClick={() => setSelectedFileFilter('all')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs"
          >
            <X className="w-3 h-3" />
            <span>ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ (Show All)</span>
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs space-y-4">
        {/* Quick Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="tab-filter-all"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Records ({letters.length})
            </button>

            <button
              id="tab-filter-inward"
              onClick={() => setActiveTab('inward')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'inward'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Inward Dak ({letters.filter(l => l.direction === 'inward').length})</span>
            </button>

            <button
              id="tab-filter-outward"
              onClick={() => setActiveTab('outward')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'outward'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Outward Orders ({letters.filter(l => l.direction === 'outward').length})</span>
            </button>

            <button
              id="tab-filter-urgent"
              onClick={() => setActiveTab('urgent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'urgent'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Immediate / Urgent</span>
            </button>

            <button
              id="tab-filter-overdue"
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'overdue'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Action Due / Overdue</span>
            </button>

            <button
              id="tab-filter-order-based"
              onClick={() => setActiveTab('orderBased')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 font-kannada ${
                activeTab === 'orderBased'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-amber-100/70 text-amber-950 hover:bg-amber-200 border border-amber-300'
              }`}
              title="ಸರ್ಕಾರಿ ಆದೇಶದನ್ವಯ ಹೊರಡಿಸಲಾದ ಪತ್ರಗಳು"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ({letters.filter(l => Boolean(l.linkedOrderNumber || l.category === 'Government Order (GO)')).length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-export-dak-xlsx"
              onClick={() => handleExportXLSX()}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-300"
              title="Download Microsoft Excel (.xlsx) register"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              id="btn-export-dak-csv"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200"
              title="Download CSV register for audit archives"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-open-circular-drafter"
              onClick={onOpenDrafter}
              className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Circular Drafter</span>
            </button>

            <button
              id="btn-log-letter"
              onClick={onNewLetter}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Letter</span>
            </button>
          </div>
        </div>

        {/* Search and Dropdown Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-dak-search"
              type="text"
              placeholder="Search Reference #, Subject, Sender, File No, Section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-400 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Category filter */}
          <div className="lg:col-span-3">
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Government Order (GO)">Government Order (GO)</option>
              <option value="Circular & Directive">Circular & Directive</option>
              <option value="School Inspection & Safety">School Inspection & Safety</option>
              <option value="Grant & Budget Sanction">Grant & Budget Sanction</option>
              <option value="Teacher Transfer & Deputation">Teacher Transfer & Deputation</option>
              <option value="Scholarship & Student Welfare">Scholarship & Student Welfare</option>
              <option value="Examination & Curriculum">Examination & Curriculum</option>
              <option value="Public Grievance & RTI">Public Grievance & RTI</option>
              <option value="Affiliation & NOC">Affiliation & NOC</option>
              <option value="General Official Notice">General Official Notice</option>
            </select>
          </div>

          {/* Section filter */}
          <div className="lg:col-span-2">
            <select
              id="select-section-filter"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Sections</option>
              <option value="Academic Wing">Academic Wing</option>
              <option value="Administration & Services">Administration</option>
              <option value="Accounts & Grants">Accounts & Grants</option>
              <option value="Examination Board">Examination Board</option>
              <option value="Inspection & Quality">Inspection & Quality</option>
              <option value="Legal & Grievances">Legal & Grievances</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="lg:col-span-2">
            <select
              id="select-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Action">Pending Action</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved & Signed">Approved & Signed</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Closed & Archived">Closed & Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Letters List / Ledger */}
      {filteredLetters.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-900">No Correspondence Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No official letters or circulars match your current filter parameters. Try clearing the search query or log a new inward dak entry.
          </p>
          <div className="pt-2">
            <button
              onClick={onNewLetter}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Log New Letter / Dak</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Multi-Selection & Bulk Action Bar */}
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all-letters"
                checked={selectedLetterIds.size === filteredLetters.length && filteredLetters.length > 0}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-stone-300 text-sky-800 focus:ring-sky-700 cursor-pointer"
              />
              <label htmlFor="select-all-letters" className="font-bold text-stone-700 cursor-pointer select-none">
                {selectedLetterIds.size === 0 
                  ? `Select All (${filteredLetters.length} letters)` 
                  : `${selectedLetterIds.size} of ${filteredLetters.length} letters selected`}
              </label>
            </div>

            {selectedLetterIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkPrint}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-sky-900 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-kannada"
                  title="Export and print selected letters as PDFs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>ಬೃಹತ್ ಮುದ್ರಣ / PDF ({selectedLetterIds.size})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportXLSX(filteredLetters.filter(l => selectedLetterIds.has(l.id)))}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Export selected letters to Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ಆಯ್ಕೆಮಾಡಿದ Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLetterIds(new Set())}
                  className="px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg cursor-pointer"
                >
                  ಆಯ್ಕೆ ರದ್ದು (Deselect)
                </button>
              </div>
            )}
          </div>

          {filteredLetters.map(letter => {
            const dueInfo = calculateDueStatus(letter.dueDate, letter.status);
            const isInward = letter.direction === 'inward';
            const isSelected = selectedLetterIds.has(letter.id);

            return (
              <div
                key={letter.id}
                id={`letter-row-${letter.id}`}
                onClick={() => onViewLetter(letter)}
                className={`rounded-xl p-4 sm:p-5 border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-400 shadow-xs'
                    : 'bg-white border-stone-200/90 shadow-xs hover:border-stone-400'
                }`}
              >
                {/* Header line: Checkbox, Direction, Reference Number, Priority, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleSelectOne(letter.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-stone-300 text-sky-800 focus:ring-sky-700 cursor-pointer"
                      title="Select letter for bulk action"
                    />

                    {/* Direction badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isInward
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isInward ? (
                        <>
                          <ArrowDownLeft className="w-3 h-3" /> Inward Dak
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3" /> Outward Dispatch
                        </>
                      )}
                    </span>

                    {/* Reference number */}
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      <span>{letter.referenceNumber}</span>
                      <button
                        onClick={(e) => handleCopyRef(letter.referenceNumber, letter.id, e)}
                        className="text-stone-400 hover:text-stone-700 p-0.5"
                        title="Copy Reference Number"
                      >
                        {copiedRefId === letter.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Master File Number */}
                    <span className="text-[11px] text-stone-500 font-mono">
                      File: <strong>{letter.fileNumber}</strong>
                    </span>

                    {/* Category */}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      {letter.category}
                    </span>

                    {/* Government Order Badge (ಈ ಆದೇಶದಂತೆ) */}
                    {letter.linkedOrderNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1 font-kannada">
                        <Award className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>ಈ ಆದೇಶದಂತೆ: {letter.linkedOrderNumber}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Priority badge */}
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPriorityBadge(letter.priority)}`}>
                      {letter.priority}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(letter.status)}`}>
                      {letter.status}
                    </span>
                  </div>
                </div>

                {/* Subject & Summary */}
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-snug hover:text-amber-700 transition-colors">
                    {letter.subject}
                  </h3>
                  {letter.bodyText && (
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {letter.bodyText.substring(0, 240)}...
                    </p>
                  )}
                  {/* Government Order Reference Banner */}
                  {letter.linkedOrderNumber && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-900 font-kannada bg-amber-50/90 px-2.5 py-1 rounded border border-amber-200">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ಉಲ್ಲೇಖ: <strong>{letter.linkedOrderNumber}</strong>
                        {letter.linkedOrderDate ? ` (ದಿನಾಂಕ: ${formatDateDDMMYYYY(letter.linkedOrderDate)})` : ''}
                        {letter.linkedOrderSubject ? ` • ${letter.linkedOrderSubject}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata Row: Sender/Recipient, Section, Date & Deadlines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-2 border-t border-stone-100 text-stone-600">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                      {isInward ? 'From (Sender)' : 'Issuing Authority'}
                    </span>
                    <span className="font-semibold text-stone-800 truncate block">
                      {letter.senderName}
                    </span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      {letter.senderDepartment}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                      {isInward ? 'Received At / Addressed To' : 'Target Recipient'}
                    </span>
                    <span className="font-semibold text-stone-800 truncate block">
                      {letter.recipientName}
                    </span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      {letter.recipientDepartment}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                      Section & Officer
                    </span>
                    <span className="font-semibold text-stone-800 truncate block">
                      {letter.section}
                    </span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      {letter.assignedOfficer}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                        Dates & Action Due
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span>Log: {formatDateDDMMYYYY(letter.dateReceivedOrIssued)}</span>
                        <span>•</span>
                        <span className={`font-semibold ${dueInfo.isOverdue ? 'text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-sm' : 'text-stone-700'}`}>
                          {dueInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Attachments, Financial Amount, Tags, Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {letter.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                        <Paperclip className="w-3 h-3 text-stone-500" />
                        <span>{letter.attachments.length} Document{letter.attachments.length > 1 ? 's' : ''}</span>
                      </span>
                    )}

                    {letter.financialAmount && letter.financialAmount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Sanction: ${letter.financialAmount.toLocaleString('en-US')}
                      </span>
                    )}

                    {letter.actionNotes.length > 0 && (
                      <span className="text-[11px] text-stone-500">
                        {letter.actionNotes.length} Minute Note{letter.actionNotes.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {letter.tags.map(t => (
                      <span key={t} className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => generateLetterPdf(letter)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1 shadow-xs cursor-pointer font-kannada"
                      title="ಪತ್ರವನ್ನು ಅಧಿಕೃತ PDF ರೂಪದಲ್ಲಿ ಉಳಿಸಿ & ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Save & Download Letter PDF)"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF ಡೌನ್‌ಲೋಡ್</span>
                    </button>

                    <button
                      onClick={() => onSummarizeLetter(letter)}
                      className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1"
                      title="Analyze document with Gemini AI to extract action points and draft response"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>AI Brief</span>
                    </button>

                    <button
                      onClick={() => onViewLetter(letter)}
                      className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onEditLetter(letter)}
                      className="px-2 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                      title="Edit Letter Details"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete correspondence "${letter.referenceNumber}" from registry?`)) {
                          onDeleteLetter(letter.id);
                        }
                      }}
                      className="px-2 py-1 text-xs font-medium text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Letter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
