import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileSpreadsheet, 
  Award, 
  TrendingUp,
  RotateCcw,
  FileDown,
  Filter,
  FolderGit2,
  FileText,
  Send,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  MemorandumDashboardSummary, 
  Employee, 
  AdminAuthUser, 
  MasterDocketFile, 
  EducationLetter 
} from '../types';
import { ReportsDocketChart } from './ReportsDocketChart';

export type ReportStatusFilterKey = 'all' | 'pending' | 'completed' | 'in-transit' | 'withdrawn';

interface MemorandumReportsViewProps {
  currentUser: AdminAuthUser | null;
  files?: MasterDocketFile[];
  letters?: EducationLetter[];
  onGenerateOrderForEmployee?: (emp: Employee, suggestedType: string) => void;
}

export interface ReportUnifiedRecord {
  id: string;
  sourceType: 'docket' | 'letter';
  typeLabelKn: string;
  typeLabelEn: string;
  refNo: string;
  title: string;
  sectionOrOffice: string;
  initiatedDate: string;
  custodianOrAssignee: string;
  rawStatus: string;
  statusCategory: 'pending' | 'completed' | 'in-transit' | 'withdrawn';
  priority?: string;
}

const STATUS_LABELS: Record<ReportStatusFilterKey, { kn: string; en: string }> = {
  all: { kn: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು', en: 'All Records' },
  pending: { kn: 'ಬಾಕಿ / ಪರಿಶೀಲನೆಯಲ್ಲಿರುವವು', en: 'Pending / Under Review' },
  completed: { kn: 'ಪೂರ್ಣಗೊಂಡ / ವಿಲೇವಾರಿಯಾದವು', en: 'Completed / Disposed' },
  'in-transit': { kn: 'ರವಾನೆಯಲ್ಲಿರುವವು', en: 'In-Transit / Higher Approval' },
  withdrawn: { kn: 'ಹಿಂಪಡೆಯಲಾದವು', en: 'Withdrawn' },
};

export const MemorandumReportsView: React.FC<MemorandumReportsViewProps> = ({
  currentUser,
  files: filesProp,
  letters: lettersProp,
  onGenerateOrderForEmployee,
}) => {
  const [summary, setSummary] = useState<MemorandumDashboardSummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [internalFiles, setInternalFiles] = useState<MasterDocketFile[]>([]);
  const [internalLetters, setInternalLetters] = useState<EducationLetter[]>([]);
  const [officeConfig, setOfficeConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilterKey>('all');
  const [activeReportTab, setActiveReportTab] = useState<'dueList' | 'records' | 'byType' | 'audit'>('dueList');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, empRes, offRes, fRes, lRes] = await Promise.all([
        fetch('/api/memorandum/dashboard-summary'),
        fetch('/api/memorandum/employees'),
        fetch('/api/memorandum/office-config'),
        fetch('/api/files'),
        fetch('/api/letters'),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
      }

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }

      if (offRes.ok) {
        const offData = await offRes.json();
        setOfficeConfig(offData.office || null);
      }

      if (fRes.ok) {
        const fData = await fRes.json();
        setInternalFiles(fData.files || []);
      }

      if (lRes.ok) {
        const lData = await lRes.json();
        setInternalLetters(lData.letters || []);
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportPdf = () => {
    // Triggers PDF export following the document printing styles defined in index.css
    window.print();
  };

  // Resolve active files and letters
  const effectiveFiles = (filesProp && filesProp.length > 0) ? filesProp : internalFiles;
  const effectiveLetters = (lettersProp && lettersProp.length > 0) ? lettersProp : internalLetters;

  // Helper to categorize raw status
  const getRecordStatusCategory = (rawStatus: string, fileCategory?: string, notes?: string): 'pending' | 'completed' | 'in-transit' | 'withdrawn' => {
    const s = (rawStatus || '').toLowerCase();
    const c = (fileCategory || '').toLowerCase();
    const n = (notes || '').toLowerCase();

    if (s.includes('withdrawn') || s.includes('ಹಿಂಪಡೆ') || c.includes('withdrawn') || n.includes('withdrawn')) {
      return 'withdrawn';
    }
    if (s.includes('in-transit') || s.includes('transit') || s.includes('pending higher approval') || s.includes('ರವಾನೆ') || n.includes('transit')) {
      return 'in-transit';
    }
    if (
      s.includes('closed') ||
      s.includes('disposed') ||
      s.includes('completed') ||
      s.includes('ಮುಕ್ತಾಯ') ||
      s.includes('ವಿಲೇವಾರಿ') ||
      s.includes('approved') ||
      s.includes('dispatched')
    ) {
      return 'completed';
    }
    return 'pending';
  };

  // Build unified records from Dockets and Letters
  const allRecords = useMemo<ReportUnifiedRecord[]>(() => {
    const list: ReportUnifiedRecord[] = [];

    // From Master Docket Files
    effectiveFiles.forEach(file => {
      const cat = getRecordStatusCategory(file.status, file.fileCategory, file.notes);
      list.push({
        id: file.id,
        sourceType: 'docket',
        typeLabelKn: 'ಕಡತ (Docket)',
        typeLabelEn: 'Docket File',
        refNo: file.fileNumber || '—',
        title: file.subject,
        sectionOrOffice: file.sectionName || file.section || 'ಆ2 (ಸ.ಪ್ರಾ.ಶಿ)',
        initiatedDate: file.initiatedDate || '—',
        custodianOrAssignee: file.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
        rawStatus: file.status,
        statusCategory: cat,
        priority: file.priority,
      });
    });

    // From Official Education Letters / Orders
    effectiveLetters.forEach(letter => {
      const cat = getRecordStatusCategory(letter.status, letter.category, letter.bodyText);
      list.push({
        id: letter.id,
        sourceType: 'letter',
        typeLabelKn: 'ಪತ್ರ / ಆದೇಶ (Letter)',
        typeLabelEn: 'Letter / Order',
        refNo: letter.referenceNumber || letter.fileNumber || '—',
        title: letter.subject,
        sectionOrOffice: letter.section || 'ಆಡಳಿತ ಶಾಖೆ',
        initiatedDate: letter.dateReceivedOrIssued || '—',
        custodianOrAssignee: letter.assignedOfficer || letter.senderName || 'BEO ಆಡಳಿತ',
        rawStatus: letter.status,
        statusCategory: cat,
        priority: letter.priority,
      });
    });

    return list;
  }, [effectiveFiles, effectiveLetters]);

  // Counts by status category
  const pendingRecordsCount = useMemo(() => allRecords.filter(r => r.statusCategory === 'pending').length, [allRecords]);
  const completedRecordsCount = useMemo(() => allRecords.filter(r => r.statusCategory === 'completed').length, [allRecords]);
  const inTransitRecordsCount = useMemo(() => allRecords.filter(r => r.statusCategory === 'in-transit').length, [allRecords]);
  const withdrawnRecordsCount = useMemo(() => allRecords.filter(r => r.statusCategory === 'withdrawn').length, [allRecords]);

  // Filtered records based on active status dropdown
  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') return allRecords;
    return allRecords.filter(r => r.statusCategory === statusFilter);
  }, [allRecords, statusFilter]);

  // Compute Employees Due for Increment based on joining date
  const computeDueEmployees = () => {
    const now = new Date();
    const results: Array<{
      employee: Employee;
      yearsCompleted: number;
      eligibleMilestone: string;
      milestoneDate: string;
    }> = [];

    employees.forEach(emp => {
      if (!emp.joiningDate) return;
      const join = new Date(emp.joiningDate);
      if (isNaN(join.getTime())) return;

      const diffMs = now.getTime() - join.getTime();
      const totalYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      const floorYears = Math.floor(totalYears);

      // Milestones: 10, 15, 20, 25, 30
      let milestone = '';
      let targetYears = 0;
      if (floorYears >= 30) {
        milestone = '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ';
        targetYears = 30;
      } else if (floorYears >= 25) {
        milestone = '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ';
        targetYears = 25;
      } else if (floorYears >= 20) {
        milestone = '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ';
        targetYears = 20;
      } else if (floorYears >= 15) {
        milestone = '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ';
        targetYears = 15;
      } else if (floorYears >= 10) {
        milestone = '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ';
        targetYears = 10;
      }

      if (milestone) {
        const estDate = new Date(join.getFullYear() + targetYears, join.getMonth(), join.getDate());
        results.push({
          employee: emp,
          yearsCompleted: Math.round(totalYears * 10) / 10,
          eligibleMilestone: milestone,
          milestoneDate: estDate.toISOString().split('T')[0],
        });
      }
    });

    return results;
  };

  const dueList = computeDueEmployees();

  // Filtered due list
  const filteredDueList = useMemo(() => {
    if (statusFilter === 'all' || statusFilter === 'pending') return dueList;
    return [];
  }, [dueList, statusFilter]);

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYearNum = now.getFullYear();
  const KANNADA_MONTHS = [
    'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್',
    'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'
  ];
  const currentMonthKn = KANNADA_MONTHS[currentMonthIdx];
  const currentMonthEn = now.toLocaleString('en-US', { month: 'long' });

  return (
    <div id="printable-audit-report" className="printable-document fit-paper-a4 space-y-6">
      {/* Printable Official Government Header (visible during print / PDF export) */}
      <div className="hidden print:block text-center border-b-2 border-stone-800 pb-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-700 font-kannada">
          {officeConfig?.governmentName || 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ'}
        </div>
        <div className="text-base font-bold text-stone-900 font-sans mt-0.5">
          {officeConfig?.departmentName || 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ'}
        </div>
        <div className="text-sm font-semibold text-stone-800 mt-0.5 font-kannada">
          {officeConfig?.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು'}
        </div>
        <div className="text-xs text-stone-600 mt-0.5">
          {officeConfig?.officeAddress || 'ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301'}
        </div>
        <div className="mt-3 pt-2 border-t border-stone-400 flex items-center justify-between text-xs font-mono">
          <span className="font-bold">ಸಂಖ್ಯೆ: ಇಡಿ/ಬಿಇಒ/ಭದ್ರಾ/ವರದಿ-ಮಾಸಿಕ/{currentYearNum}/{currentMonthIdx + 1}</span>
          <span className="font-bold">ದಿನಾಂಕ: {now.toISOString().split('T')[0]}</span>
        </div>
        <div className="mt-2 text-sm font-bold text-stone-900 uppercase tracking-wide bg-stone-100 py-1.5 border border-stone-300 font-kannada">
          ಮಾಸಿಕ ಅಂಕಿಅಂಶಗಳ ಸಾರಾಂಶ ವರದಿ (Monthly Statistics Summary Report) • {currentMonthKn} {currentYearNum}
        </div>
        {/* Active Filter Indicator in Printed PDF */}
        <div className="mt-2 flex items-center justify-between text-xs px-3 py-1 bg-amber-50 border border-amber-300 rounded font-sans">
          <span className="font-bold text-stone-800">
            ಫಿಲ್ಟರ್ ಸ್ಥಿತಿ (Filter by Status): <strong className="text-sky-950 underline">{STATUS_LABELS[statusFilter].kn} ({STATUS_LABELS[statusFilter].en})</strong>
          </span>
          <span className="font-bold text-stone-800">
            ರಫ್ತಾದ ದಾಖಲೆಗಳ ಸಂಖ್ಯೆ: <strong className="text-sky-950">{filteredRecords.length}</strong>
          </span>
        </div>
      </div>

      {/* Header Banner (On Screen Controls) */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-sky-950 text-amber-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                  ಆಡಳಿತ ಪರಿಶೀಲನೆ • ವರದಿಗಳ ಶಾಖೆ
                </span>
                <span className="text-xs text-stone-500">Karnataka Govt Analytics & Audit</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-1 font-sans">
                ಜ್ಞಾಪನಾ ಆದೇಶ ಹಾಗೂ ವೇತನ ವರದಿಗಳು (Reports & Analytics)
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                ಕಡತಗಳು, ಆದೇಶಗಳು ಹಾಗೂ ವೇತನ ಬಡ್ತಿಗಳ ಸ್ಥಿತಿ ಪ್ರಕಾರ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಅಧಿಕೃತ PDF ರಫ್ತು.
              </p>
            </div>
          </div>

          {/* Action Toolbar with Filter by Status dropdown and PDF Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border-2 border-stone-300 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-stone-700 shrink-0" />
              <label htmlFor="report-status-filter" className="text-xs font-bold text-stone-800 whitespace-nowrap font-kannada">
                ಸ್ಥಿತಿ ಫಿಲ್ಟರ್:
              </label>
              <select
                id="report-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReportStatusFilterKey)}
                className="text-xs font-bold bg-white text-stone-900 border border-stone-300 rounded px-2.5 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                title="ದಾಖಲೆಗಳನ್ನು ಸ್ಥಿತಿ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ"
              >
                <option value="all">ಎಲ್ಲಾ ದಾಖಲೆಗಳು (All Statuses) ({allRecords.length})</option>
                <option value="pending">ಬಾಕಿ / ಪರಿಶೀಲನೆ (Pending / Under Review) ({pendingRecordsCount})</option>
                <option value="completed">ಪೂರ್ಣಗೊಂಡವು (Completed / Disposed) ({completedRecordsCount})</option>
                <option value="in-transit">ರವಾನೆಯಲ್ಲಿರುವವು (In-Transit) ({inTransitRecordsCount})</option>
                <option value="withdrawn">ಹಿಂಪಡೆದವು (Withdrawn) ({withdrawnRecordsCount})</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchData}
              className="p-2 border border-stone-300 hover:bg-stone-100 rounded text-stone-600 transition-colors cursor-pointer"
              title="ಮರುಲೋಡ್ ಮಾಡಿ"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Dedicated PDF Export Button */}
            <button
              id="btn-export-monthly-pdf"
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={`ಆಯ್ಕೆಮಾಡಿದ "${STATUS_LABELS[statusFilter].kn}" ದಾಖಲೆಗಳನ್ನು PDF ಆಗಿ ರಫ್ತು ಮಾಡಿ`}
            >
              <FileDown className="w-4 h-4" />
              <span>ಮಾಸಿಕ ಅಂಕಿಅಂಶ PDF ರಫ್ತು (Export PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ವರದಿ ಮುದ್ರಿಸಿ (Print Report)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards (Dynamically reflects filter state) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-white border rounded-lg p-4 shadow-2xs ${statusFilter !== 'all' ? 'border-sky-500 ring-2 ring-sky-100' : 'border-stone-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              ಫಿಲ್ಟರ್ ಆದ ದಾಖಲೆಗಳು (Filtered)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-mono">
              {STATUS_LABELS[statusFilter].en}
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            {filteredRecords.length}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            ಒಟ್ಟು {allRecords.length} ದಾಖಲೆಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವವು
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
            ಬಾಕಿ / ಪರಿಶೀಲನೆ (Pending)
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-mono">
            {pendingRecordsCount}
          </div>
          <span className="text-[11px] text-amber-900 mt-0.5 block">ಕ್ರಮಕ್ಕಾಗಿ ಬಾಕಿ ಇರುವ ಕಡತ & ಪತ್ರಗಳು</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            ಪೂರ್ಣಗೊಂಡವು (Completed)
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {completedRecordsCount}
          </div>
          <span className="text-[11px] text-emerald-900 mt-0.5 block">ವಿಲೇವಾರಿ ಹಾಗೂ ಆದೇಶ ಜಾರಿಯಾದವು</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
            ರವಾನೆ & ಹಿಂಪಡೆದವು
          </span>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            {inTransitRecordsCount + withdrawnRecordsCount}
          </div>
          <span className="text-[11px] text-blue-900 mt-0.5 block">
            ರವಾನೆಯಲ್ಲಿ: {inTransitRecordsCount} • ಹಿಂಪಡೆದವು: {withdrawnRecordsCount}
          </span>
        </div>
      </div>

      {/* RECHARTS 6-MONTH DOCKET STATUS DISTRIBUTION & TRENDS */}
      <ReportsDocketChart files={effectiveFiles} />

      {/* Sub Tab Navigation (On Screen) */}
      <div className="flex flex-wrap border-b border-stone-200 bg-white px-4 pt-2 rounded-t-lg no-print">
        <button
          type="button"
          onClick={() => setActiveReportTab('dueList')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'dueList'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ಬಡ್ತಿ ಅರ್ಹತಾ ನಿರೀಕ್ಷಿತ ಪಟ್ಟಿ ({filteredDueList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('records')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'records'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>ಕಡತ & ಆದೇಶಗಳ ದಾಖಲೆಗಳು ({filteredRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('byType')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'byType'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ಆದೇಶ ಪ್ರಕಾರವಾರು ಸಾರಾಂಶ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'audit'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ಲೆಕ್ಕ ಪರಿಶೋಧನಾ ದಾಖಲೆ (Audit Trail)</span>
        </button>
      </div>

      {/* PRINT-ONLY FILTERED RECORDS SECTION (Strictly exports the filtered records into the PDF) */}
      <div className="hidden print:block space-y-4">
        <div className="border border-stone-300 rounded overflow-hidden">
          <div className="bg-stone-100 p-2 text-xs font-bold border-b border-stone-300 flex items-center justify-between">
            <span>ಅಧಿಕೃತ ದಾಖಲೆಗಳ ವಿವರ ಪಟ್ಟಿ (Filtered Records Listing - {STATUS_LABELS[statusFilter].en})</span>
            <span className="font-mono">ಒಟ್ಟು: {filteredRecords.length} ದಾಖಲೆಗಳು</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-200 border-b border-stone-300 text-stone-900 font-bold uppercase text-[10px]">
                <th className="py-2 px-3 w-10">ಕ್ರ.ಸಂ</th>
                <th className="py-2 px-3 w-28">ದಾಖಲೆ ಪ್ರಕಾರ</th>
                <th className="py-2 px-3 w-36">ಸಂಖ್ಯೆ (Ref No)</th>
                <th className="py-2 px-3">ವಿಷಯ (Subject / Details)</th>
                <th className="py-2 px-3 w-28">ವಿಭಾಗ</th>
                <th className="py-2 px-3 w-24">ದಿನಾಂಕ</th>
                <th className="py-2 px-3 w-28 text-right">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800 text-[11px]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-stone-500">
                    ಆಯ್ಕೆಮಾಡಿದ ಸ್ಥಿತಿಗೆ ಯಾವುದೇ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ ({STATUS_LABELS[statusFilter].kn}).
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr key={rec.id}>
                    <td className="py-2 px-3 font-mono text-center">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium">{rec.typeLabelKn}</td>
                    <td className="py-2 px-3 font-mono font-bold text-stone-900">{rec.refNo}</td>
                    <td className="py-2 px-3 font-medium leading-snug">{rec.title}</td>
                    <td className="py-2 px-3 text-stone-600">{rec.sectionOrOffice}</td>
                    <td className="py-2 px-3 font-mono">{rec.initiatedDate}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        rec.statusCategory === 'completed'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : rec.statusCategory === 'in-transit'
                          ? 'bg-blue-50 text-blue-900 border-blue-300'
                          : rec.statusCategory === 'withdrawn'
                          ? 'bg-stone-100 text-stone-800 border-stone-400'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}>
                        {rec.rawStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAB 1: DUE LIST (Interactive View on Screen) */}
      {activeReportTab === 'dueList' && (
        <div className="bg-white border border-stone-200 rounded-b-lg overflow-hidden shadow-2xs no-print">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span className="font-semibold text-stone-800 font-kannada">
              ಸೇವಾ ಅವಧಿ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜಿಸಲು ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ನೇರವಾಗಿ ಆಯ್ಕೆ ಮಾಡಬಹುದು:
            </span>
            <span className="text-[11px] text-stone-500 font-mono">ಒಟ್ಟು {filteredDueList.length} ನೌಕರರು</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ನೌಕರರ ಹೆಸರು & ಕೆಜಿಐಡಿ</th>
                  <th className="py-3 px-4">ಹುದ್ದೆ & ಶಾಲೆ</th>
                  <th className="py-3 px-4">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ</th>
                  <th className="py-3 px-4">ಪೂರ್ಣಗೊಂಡ ಸೇವೆ</th>
                  <th className="py-3 px-4">ಅರ್ಹ ಬಡ್ತಿ ಪ್ರಕಾರ</th>
                  <th className="py-3 px-4">ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ</th>
                  <th className="py-3 px-4 text-right">ಕ್ರಮ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {filteredDueList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      {statusFilter === 'completed'
                        ? 'ಬಡ್ತಿ ಅರ್ಹತಾ ಪಟ್ಟಿಯು ಬಾಕಿ ಇರುವ ನೌಕರರದ್ದಾಗಿದೆ. ಪೂರ್ಣಗೊಂಡ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು "ಕಡತ & ಆದೇಶಗಳ ದಾಖಲೆಗಳು" ಟ್ಯಾಬ್ ಆಯ್ಕೆಮಾಡಿ.'
                        : 'ಯಾವುದೇ ನೌಕರರು ಸದ್ಯಕ್ಕೆ ಹೊಸ ಬಡ್ತಿಗೆ ಬಾಕಿ ಇಲ್ಲ.'}
                    </td>
                  </tr>
                ) : (
                  filteredDueList.map(({ employee, yearsCompleted, eligibleMilestone, milestoneDate }) => (
                    <tr key={employee.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">{employee.fullName}</span>
                        <span className="text-[11px] font-mono text-sky-950 font-semibold">KGID: {employee.kgidNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-800 block">{employee.designation}</span>
                        <span className="text-[11px] text-stone-500 truncate block max-w-xs">{employee.officeLocation}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">
                        {employee.joiningDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold">
                          {yearsCompleted} ವರ್ಷಗಳು
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[11px] font-semibold">
                          {eligibleMilestone}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        ₹{(employee.basicPay || 37900).toLocaleString('en-IN')}/-
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onGenerateOrderForEmployee && (
                          <button
                            type="button"
                            onClick={() => onGenerateOrderForEmployee(employee, eligibleMilestone)}
                            className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-white rounded text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>ಆದೇಶ ಸೃಜಿಸಿ</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER RECORDS (Filterable Records on Screen) */}
      {activeReportTab === 'records' && (
        <div className="bg-white border border-stone-200 rounded-b-lg overflow-hidden shadow-2xs no-print">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">
                ಫಿಲ್ಟರ್ ಆದ ದಾಖಲೆಗಳು ({STATUS_LABELS[statusFilter].kn}):
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {filteredRecords.length} Records
              </span>
            </div>
            <span className="text-[11px] text-stone-500">
              ಮೇಲಿನ PDF ರಫ್ತು ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಈ ಪಟ್ಟಿಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ಪ್ರಕಾರ</th>
                  <th className="py-3 px-4">ಸಂಖ್ಯೆ (Reference No)</th>
                  <th className="py-3 px-4">ವಿಷಯ & ವಿವರಗಳು</th>
                  <th className="py-3 px-4">ವಿಭಾಗ / ಕಚೇರಿ</th>
                  <th className="py-3 px-4">ದಿನಾಂಕ</th>
                  <th className="py-3 px-4">ಅಧಿಕಾರಿ / Custodian</th>
                  <th className="py-3 px-4 text-right">ಸ್ಥಿತಿ (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      ಈ ಸ್ಥಿತಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಯಾವುದೇ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ ({STATUS_LABELS[statusFilter].kn}).
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-stone-900">
                          {rec.sourceType === 'docket' ? (
                            <FolderGit2 className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>{rec.typeLabelKn}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-950">
                        {rec.refNo}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-semibold text-stone-900 line-clamp-2 leading-relaxed">
                          {rec.title}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {rec.sectionOrOffice}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">
                        {rec.initiatedDate}
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        {rec.custodianOrAssignee}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          rec.statusCategory === 'completed'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : rec.statusCategory === 'in-transit'
                            ? 'bg-blue-50 text-blue-900 border-blue-300'
                            : rec.statusCategory === 'withdrawn'
                            ? 'bg-stone-100 text-stone-800 border-stone-400'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          {rec.rawStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BY TYPE SUMMARY */}
      {activeReportTab === 'byType' && (
        <div className="bg-white border border-stone-200 rounded-b-lg p-6 shadow-2xs space-y-4 no-print">
          <h3 className="font-bold text-sm text-stone-900 font-sans uppercase tracking-wide">
            ಆದೇಶ ಪ್ರಕಾರವಾರು ಅಂಕಿಅಂಶಗಳ ವಿಶ್ಲೇಷಣೆ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ', count: summary?.ordersByType['10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ'] || 0, color: 'border-blue-300 bg-blue-50/50 text-blue-950' },
              { type: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ', count: summary?.ordersByType['15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ'] || 0, color: 'border-indigo-300 bg-indigo-50/50 text-indigo-950' },
              { type: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', count: summary?.ordersByType['20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ'] || 0, color: 'border-amber-300 bg-amber-50/50 text-amber-950' },
              { type: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', count: summary?.ordersByType['25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ'] || 0, color: 'border-orange-300 bg-orange-50/50 text-orange-950' },
              { type: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', count: summary?.ordersByType['30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ'] || 0, color: 'border-purple-300 bg-purple-50/50 text-purple-950' },
              { type: 'ಗಳಿಕೆ ರಜೆ', count: summary?.ordersByType['ಗಳಿಕೆ ರಜೆ'] || 0, color: 'border-emerald-300 bg-emerald-50/50 text-emerald-950' },
              { type: 'ಶಿಶುಪಾಲನ ರಜೆ', count: summary?.ordersByType['ಶಿಶುಪಾಲನ ರಜೆ'] || 0, color: 'border-pink-300 bg-pink-50/50 text-pink-950' },
              { type: 'ಪಿತೃತ್ವ ರಜೆ', count: summary?.ordersByType['ಪಿತೃತ್ವ ರಜೆ'] || 0, color: 'border-teal-300 bg-teal-50/50 text-teal-950' },
            ].map((item) => (
              <div key={item.type} className={`p-4 rounded-lg border-2 ${item.color}`}>
                <span className="text-xs font-bold block">{item.type}</span>
                <div className="text-2xl font-bold font-mono mt-1">
                  {item.count} <span className="text-xs font-normal text-stone-500">ಆದೇಶಗಳು</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeReportTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded-b-lg overflow-hidden shadow-2xs no-print">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span className="font-semibold text-stone-800">
              ಜ್ಞಾಪನಾ ಆದೇಶ ವ್ಯವಸ್ಥೆಯ ಅಧಿಕೃತ ಲಾಗ್‌ಗಳು ಮತ್ತು ಬಳಕೆದಾರರ ಚಟುವಟಿಕೆಗಳು:
            </span>
            <span className="text-[11px] text-stone-500">ಕಳೆದ 50 ಚಟುವಟಿಕೆಗಳು</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ಸಮಯ & ದಿನಾಂಕ</th>
                  <th className="py-3 px-4">ಚಟುವಟಿಕೆ (Action)</th>
                  <th className="py-3 px-4">ವಿವರಗಳು (Details)</th>
                  <th className="py-3 px-4">ನೌಕರರು / ಕಡತ</th>
                  <th className="py-3 px-4">ನಿರ್ವಹಿಸಿದವರು</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {(!summary?.recentAuditLogs || summary.recentAuditLogs.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      ಯಾವುದೇ ಆಡಿಟ್ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.
                    </td>
                  </tr>
                ) : (
                  summary.recentAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-800 border border-stone-300 rounded font-semibold text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {log.kgidNumber ? `KGID: ${log.kgidNumber}` : (log.orderNumber || '—')}
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        <strong>{log.performedBy}</strong> <span className="text-[11px] text-stone-500">({log.role})</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Signatory Block (Visible on printed document / PDF export) */}
      <div className="hidden print:flex justify-end pt-10 mt-8 border-t border-stone-300">
        <div className="text-center min-w-[240px]">
          <div className="text-xs font-semibold text-stone-500 mb-8 font-kannada">ಸಹಿ/- (Signature)</div>
          <div className="text-sm font-bold text-stone-900 font-sans">
            ({officeConfig?.ddoOfficerName || 'ಹೆಚ್. ರವಿಕುಮಾರ್'})
          </div>
          <div className="text-xs font-semibold text-stone-800 font-kannada mt-0.5">
            {officeConfig?.ddoDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ'}
          </div>
          <div className="text-xs text-stone-600 font-kannada">
            {officeConfig?.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ'}
          </div>
        </div>
      </div>
    </div>
  );
};
