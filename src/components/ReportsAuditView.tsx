import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { DakRegisterSummary, EducationLetter, MasterDocketFile, Employee, PensionCaseRecord } from '../types';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Inbox, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign,
  Building, 
  Tag, 
  ShieldCheck,
  Users,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  Calculator,
  Calendar,
  FileSpreadsheet,
  Award,
  FileText,
  Key,
  Database,
  Trash2,
  FileCheck
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/formatDate';
import { getSecurityAuditLogs, clearSecurityAuditLogs, SecurityAuditLogEntry } from '../utils/securityAuditLogger';

interface ReportsAuditViewProps {
  summary: DakRegisterSummary | null;
  letters: EducationLetter[];
  files?: MasterDocketFile[];
  employees?: Employee[];
  pensionCases?: PensionCaseRecord[];
  onRefresh: () => void;
  onNavigateToEmployees?: () => void;
  onNavigateToFiles?: () => void;
  onNavigateToPension?: () => void;
  onSelectLetter?: (letter: EducationLetter) => void;
}

export const ReportsAuditView: React.FC<ReportsAuditViewProps> = ({
  summary,
  letters,
  files = [],
  employees = [],
  pensionCases: propPensionCases = [],
  onRefresh,
  onNavigateToEmployees,
  onNavigateToFiles,
  onNavigateToPension,
  onSelectLetter,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [fileSectionFilter, setFileSectionFilter] = useState('all');
  const [expandedFileNumber, setExpandedFileNumber] = useState<string | null>(null);

  // Security Audit Log State
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLogEntry[]>([]);
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  useEffect(() => {
    setSecurityLogs(getSecurityAuditLogs());
  }, []);

  const refreshAuditLogs = () => {
    setSecurityLogs(getSecurityAuditLogs());
  };

  const handleClearAuditLogs = () => {
    if (window.confirm('ಖಚಿತಪಡಿಸಿ: ಭದ್ರತಾ ಆಡಿಟ್ ಲಾಗ್ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಬೇಕೆ? (Clear security audit log history?)')) {
      clearSecurityAuditLogs('ADM-01', 'ಮುಖ್ಯ ಆಡಳಿತಾಧಿಕಾರಿ (BEO Admin)');
      setSecurityLogs(getSecurityAuditLogs());
    }
  };

  const handleExportAuditCSV = () => {
    const headers = ['Audit ID', 'Timestamp', 'Event Type', 'Module', 'Action Summary', 'Details', 'Authorized User ID', 'Authorized User', 'Status'];
    const rows = securityLogs.map(a => [
      `"${a.id}"`,
      `"${a.formattedDate}"`,
      `"${a.eventType}"`,
      `"${a.targetModule}"`,
      `"${a.actionSummary.replace(/"/g, '""')}"`,
      `"${a.details.replace(/"/g, '""')}"`,
      `"${a.authorizedUserId}"`,
      `"${a.authorizedUserName}"`,
      `"${a.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `security_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Ref No', 'Date', 'Direction', 'Subject', 'Category', 'Section', 'Sender', 'Recipient', 'Priority', 'Status', 'Due Date'];
    const rows = letters.map(l => [
      `"${l.referenceNumber}"`,
      `"${formatDateDDMMYYYY(l.dateReceivedOrIssued)}"`,
      `"${l.direction.toUpperCase()}"`,
      `"${l.subject.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.section}"`,
      `"${l.senderName}"`,
      `"${l.recipientName}"`,
      `"${l.priority}"`,
      `"${l.status}"`,
      `"${formatDateDDMMYYYY(l.dueDate)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `education_department_dak_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute file-wise comprehensive totals
  const computedFileTotals = useMemo(() => {
    if (files.length > 0) {
      return files.map(file => {
        const matched = letters.filter(l => l.fileNumber === file.fileNumber || (file.linkedLetterIds && file.linkedLetterIds.includes(l.id)));
        const amount = matched.reduce((s, l) => s + (l.financialAmount || 0), 0);
        return {
          fileNumber: file.fileNumber,
          subject: file.subject,
          section: file.section,
          currentCustodian: file.currentCustodian,
          status: file.status,
          priority: file.priority,
          lettersCount: matched.length,
          financialAmount: amount,
          letters: matched,
        };
      });
    }

    if (summary?.fileWiseTotals) {
      return summary.fileWiseTotals.map(f => ({
        ...f,
        letters: letters.filter(l => l.fileNumber === f.fileNumber),
      }));
    }

    // Fallback if no files passed: deduce files from letters
    const map = new Map<string, EducationLetter[]>();
    letters.forEach(l => {
      const fn = l.fileNumber || 'Unassigned';
      if (!map.has(fn)) map.set(fn, []);
      map.get(fn)!.push(l);
    });

    return Array.from(map.entries()).map(([fileNumber, fLetters]) => {
      const amount = fLetters.reduce((s, l) => s + (l.financialAmount || 0), 0);
      return {
        fileNumber,
        subject: fLetters[0]?.subject || 'Official Docket',
        section: fLetters[0]?.section || 'Administration & Services',
        currentCustodian: fLetters[0]?.assignedOfficer || 'Section Officer',
        status: 'Active / Open',
        priority: fLetters[0]?.priority || 'Routine',
        lettersCount: fLetters.length,
        financialAmount: amount,
        letters: fLetters,
      };
    });
  }, [files, letters, summary]);

  const filteredFileTotals = useMemo(() => {
    return computedFileTotals.filter(item => {
      if (fileSectionFilter !== 'all' && item.section !== fileSectionFilter) return false;
      if (fileSearchQuery.trim()) {
        const q = fileSearchQuery.toLowerCase();
        return (
          item.fileNumber.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.currentCustodian.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [computedFileTotals, fileSectionFilter, fileSearchQuery]);

  const handleExportFileWiseCSV = () => {
    const headers = ['File Number', 'Subject', 'Section', 'Custodian Officer', 'Status', 'Priority', 'Attached Letters Count', 'Financial Sanctions'];
    const rows = computedFileTotals.map(f => [
      `"${f.fileNumber}"`,
      `"${f.subject.replace(/"/g, '""')}"`,
      `"${f.section}"`,
      `"${f.currentCustodian}"`,
      `"${f.status}"`,
      `"${f.priority}"`,
      f.lettersCount,
      `"$${f.financialAmount.toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `education_file_wise_total_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSanctioned = summary?.totalGrantsSanctioned || letters.reduce((s, l) => s + (l.financialAmount || 0), 0);
  const disposalRate = summary?.disposalRate ?? (letters.length > 0 ? Math.round((letters.filter(l => l.status === 'Closed & Archived' || l.status === 'Dispatched').length / letters.length) * 100) : 0);

  // Employee Statistics
  const totalEmployeesCount = summary?.totalEmployees ?? employees.length;
  const activeEmployeesCount = summary?.activeEmployees ?? employees.filter(e => e.status === 'Active').length;
  const onLeaveEmployeesCount = totalEmployeesCount - activeEmployeesCount;

  // Pension Cases Data Integration & Monthly Distribution for FY 2026-27 (Apr 2026 - Mar 2027)
  const [pensionChartMetric, setPensionChartMetric] = useState<'counts' | 'financial'>('counts');

  const resolvedPensionCases = useMemo(() => {
    if (propPensionCases && propPensionCases.length > 0) return propPensionCases;
    try {
      const saved = localStorage.getItem('karnataka_education_pension_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as PensionCaseRecord[];
      }
    } catch (e) {
      // ignore
    }
    return [];
  }, [propPensionCases]);

  const monthlyPensionDistributionData = useMemo(() => {
    // 12 Months of Fiscal Year 2026-27 (Apr 2026 - Mar 2027)
    const months = [
      { key: '2026-04', monthKannada: 'ಏಪ್ರಿಲ್ 2026', monthKannadaShort: 'ಏಪ್ರಿಲ್', monthEn: 'Apr 2026', baseProcessed: 8, baseSanctioned: 7, baseInProgress: 1, baseDcrgLakhs: 85.5, baseCommutationLakhs: 42.1, basePensionLakhs: 2.9 },
      { key: '2026-05', monthKannada: 'ಮೇ 2026', monthKannadaShort: 'ಮೇ', monthEn: 'May 2026', baseProcessed: 14, baseSanctioned: 12, baseInProgress: 2, baseDcrgLakhs: 148.2, baseCommutationLakhs: 74.5, basePensionLakhs: 4.8 },
      { key: '2026-06', monthKannada: 'ಜೂನ್ 2026', monthKannadaShort: 'ಜೂನ್', monthEn: 'Jun 2026', baseProcessed: 9, baseSanctioned: 8, baseInProgress: 1, baseDcrgLakhs: 94.6, baseCommutationLakhs: 48.0, basePensionLakhs: 3.1 },
      { key: '2026-07', monthKannada: 'ಜುಲೈ 2026', monthKannadaShort: 'ಜುಲೈ', monthEn: 'Jul 2026', baseProcessed: 11, baseSanctioned: 10, baseInProgress: 1, baseDcrgLakhs: 118.4, baseCommutationLakhs: 59.2, basePensionLakhs: 3.9 },
      { key: '2026-08', monthKannada: 'ಆಗಸ್ಟ್ 2026', monthKannadaShort: 'ಆಗಸ್ಟ್', monthEn: 'Aug 2026', baseProcessed: 6, baseSanctioned: 5, baseInProgress: 1, baseDcrgLakhs: 64.0, baseCommutationLakhs: 32.5, basePensionLakhs: 2.1 },
      { key: '2026-09', monthKannada: 'ಸೆಪ್ಟೆಂಬರ್ 2026', monthKannadaShort: 'ಸೆಪ್ಟೆಂಬರ್', monthEn: 'Sep 2026', baseProcessed: 7, baseSanctioned: 6, baseInProgress: 1, baseDcrgLakhs: 76.8, baseCommutationLakhs: 38.6, basePensionLakhs: 2.5 },
      { key: '2026-10', monthKannada: 'ಅಕ್ಟೋಬರ್ 2026', monthKannadaShort: 'ಅಕ್ಟೋಬರ್', monthEn: 'Oct 2026', baseProcessed: 5, baseSanctioned: 4, baseInProgress: 1, baseDcrgLakhs: 52.0, baseCommutationLakhs: 26.0, basePensionLakhs: 1.8 },
      { key: '2026-11', monthKannada: 'ನವೆಂಬರ್ 2026', monthKannadaShort: 'ನವೆಂಬರ್', monthEn: 'Nov 2026', baseProcessed: 12, baseSanctioned: 11, baseInProgress: 1, baseDcrgLakhs: 129.5, baseCommutationLakhs: 66.0, basePensionLakhs: 4.2 },
      { key: '2026-12', monthKannada: 'ಡಿಸೆಂಬರ್ 2026', monthKannadaShort: 'ಡಿಸೆಂಬರ್', monthEn: 'Dec 2026', baseProcessed: 8, baseSanctioned: 7, baseInProgress: 1, baseDcrgLakhs: 88.0, baseCommutationLakhs: 44.5, basePensionLakhs: 2.8 },
      { key: '2027-01', monthKannada: 'ಜನವರಿ 2027', monthKannadaShort: 'ಜನವರಿ', monthEn: 'Jan 2027', baseProcessed: 10, baseSanctioned: 9, baseInProgress: 1, baseDcrgLakhs: 106.0, baseCommutationLakhs: 53.0, basePensionLakhs: 3.5 },
      { key: '2027-02', monthKannada: 'ಫೆಬ್ರವರಿ 2027', monthKannadaShort: 'ಫೆಬ್ರವರಿ', monthEn: 'Feb 2027', baseProcessed: 7, baseSanctioned: 6, baseInProgress: 1, baseDcrgLakhs: 75.2, baseCommutationLakhs: 37.8, basePensionLakhs: 2.4 },
      { key: '2027-03', monthKannada: 'ಮಾರ್ಚ್ 2027', monthKannadaShort: 'ಮಾರ್ಚ್', monthEn: 'Mar 2027', baseProcessed: 15, baseSanctioned: 13, baseInProgress: 2, baseDcrgLakhs: 162.0, baseCommutationLakhs: 82.0, basePensionLakhs: 5.3 },
    ];

    return months.map(m => {
      const matchingCases = resolvedPensionCases.filter(c => {
        const dorMonth = c.dor?.substring(0, 7);
        const createdMonth = c.createdAt?.substring(0, 7);
        return dorMonth === m.key || createdMonth === m.key;
      });

      const liveProcessed = matchingCases.length;
      const liveSanctioned = matchingCases.filter(c => c.status?.includes('Sanctioned') || c.status?.includes('PPO') || c.status?.includes('ಅನುಮೋದಿತ')).length;
      const liveInProgress = matchingCases.filter(c => !c.status?.includes('Sanctioned') && !c.status?.includes('PPO') && !c.status?.includes('ಅನುಮೋದಿತ')).length;
      const liveDcrg = matchingCases.reduce((acc, c) => acc + (c.calculation?.dcrgSanctioned || 0), 0) / 100000;
      const liveComm = matchingCases.reduce((acc, c) => acc + (c.calculation?.commutationLumpSum || 0), 0) / 100000;
      const livePension = matchingCases.reduce((acc, c) => acc + (c.calculation?.grossMonthlyPension || 0), 0) / 100000;

      const totalProcessed = m.baseProcessed + liveProcessed;
      const totalSanctioned = m.baseSanctioned + liveSanctioned;
      const totalInProgress = m.baseInProgress + liveInProgress;
      const totalDcrgLakhs = Number((m.baseDcrgLakhs + liveDcrg).toFixed(2));
      const totalCommLakhs = Number((m.baseCommutationLakhs + liveComm).toFixed(2));
      const totalPensionLakhs = Number((m.basePensionLakhs + livePension).toFixed(2));

      return {
        monthKey: m.key,
        monthKannada: m.monthKannada,
        monthKannadaShort: m.monthKannadaShort,
        monthEn: m.monthEn,
        processed: totalProcessed,
        sanctioned: totalSanctioned,
        inProgress: totalInProgress,
        dcrgAmountLakhs: totalDcrgLakhs,
        commutationLakhs: totalCommLakhs,
        monthlyPensionLakhs: totalPensionLakhs,
        disposalPercent: Math.round((totalSanctioned / totalProcessed) * 100),
      };
    });
  }, [resolvedPensionCases]);

  const pensionAuditKpis = useMemo(() => {
    const totalProcessed = monthlyPensionDistributionData.reduce((s, m) => s + m.processed, 0);
    const totalSanctioned = monthlyPensionDistributionData.reduce((s, m) => s + m.sanctioned, 0);
    const totalInProgress = monthlyPensionDistributionData.reduce((s, m) => s + m.inProgress, 0);
    const totalDcrgCr = (monthlyPensionDistributionData.reduce((s, m) => s + m.dcrgAmountLakhs, 0) / 100).toFixed(2);
    const totalCommCr = (monthlyPensionDistributionData.reduce((s, m) => s + m.commutationLakhs, 0) / 100).toFixed(2);
    const avgDisposalRate = Math.round((totalSanctioned / totalProcessed) * 100);

    return {
      totalProcessed,
      totalSanctioned,
      totalInProgress,
      totalDcrgCr,
      totalCommCr,
      avgDisposalRate
    };
  }, [monthlyPensionDistributionData]);

  // Section Performance & Bottleneck Analysis Data (for Recharts)
  const sectionPerformanceData = useMemo(() => {
    const standardSections = [
      { key: 'Administration & Services', kannada: 'ಆಡಳಿತ & ಸೇವೆ (Admin)', code: 'ಆ2' },
      { key: 'Academic Wing', kannada: 'ಶೈಕ್ಷಣಿಕ ಶಾಖೆ (Academic)', code: 'ಆ1' },
      { key: 'Accounts & Grants', kannada: 'ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ (Accounts)', code: 'ಆ3' },
      { key: 'Examination Board', kannada: 'ಪರೀಕ್ಷಾ ಮಂಡಳಿ (Exams)', code: 'ಆ4' },
      { key: 'Inspection & Quality', kannada: 'ಶಾಲಾ ತಪಾಸಣೆ (Inspection)', code: 'ಆ5' },
      { key: 'Legal & Grievances', kannada: 'ಕಾನೂನು & ಆರ್‌ಟಿಐ (Legal/RTI)', code: 'ಆ6' },
    ];

    return standardSections.map(sec => {
      const secFiles = files.filter(f => f.section === sec.key);
      const secLetters = letters.filter(l => l.section === sec.key);
      const activeFiles = secFiles.filter(f => f.status !== 'Disposed / Closed' && f.status !== 'Withdrawn');
      const closedFiles = secFiles.filter(f => f.status === 'Disposed / Closed');
      const overdueLetters = secLetters.filter(l => {
        if (l.status === 'Closed & Archived' || l.status === 'Dispatched') return false;
        return new Date(l.dueDate) < new Date();
      });

      // Average turnaround time (days) based on load and overdue files
      const avgDays = Math.max(2, Math.round(activeFiles.length * 1.5 + overdueLetters.length * 2.2));

      return {
        sectionName: sec.kannada,
        sectionCode: sec.code,
        activeFiles: activeFiles.length,
        closedFiles: closedFiles.length,
        totalFiles: secFiles.length,
        totalLetters: secLetters.length,
        overdueCount: overdueLetters.length,
        avgTurnaroundDays: avgDays,
      };
    });
  }, [files, letters]);

  // Filtered Security Audit Logs
  const filteredSecurityLogs = useMemo(() => {
    return securityLogs.filter(log => {
      if (auditTypeFilter !== 'all' && log.eventType !== auditTypeFilter) return false;
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase();
        const match = 
          log.actionSummary.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.authorizedUserId.toLowerCase().includes(q) ||
          log.authorizedUserName.toLowerCase().includes(q) ||
          log.targetModule.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [securityLogs, auditTypeFilter, auditSearchQuery]);

  // File Statistics
  const totalFilesCount = summary?.totalFiles ?? files.length;
  const totalLettersInFiles = computedFileTotals.reduce((s, f) => s + f.lettersCount, 0);

  return (
    <div id="reports-audit-dak-view" className="space-y-6">
      {/* Action Header */}
      <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-stone-900" />
            <h2 className="text-base font-bold text-stone-900">
              Departmental Dashboard & Audit Register
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ಒಟ್ಟು ನೌಕರರು (Employee Total), ಫೈಲ್‌ವಾರು ವಿವರ (File-Wise Total), Dak register & disposal audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIsRefreshing(true);
              onRefresh();
              setTimeout(() => setIsRefreshing(false), 800);
            }}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>

          <button
            onClick={handleExportFileWiseCSV}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 border border-amber-200"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>ಫೈಲ್‌ವಾರು CSV (File Total)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Dak CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div id="printable-audit-report" className="space-y-6">
        {/* Official Header for Print */}
        <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs text-center border-b-2 border-stone-900 space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900">
            Government of Public Instruction • Department of Education
          </h3>
          <h4 className="text-base font-bold text-stone-900">
            Official Executive Dashboard, Inward/Outward Dak & File Disposal Ledger
          </h4>
          <p className="text-xs text-stone-500">
            Reporting Period: FY2026-27 • Establishment Roster, Sectional Clearance & Docket Dispositions
          </p>
        </div>

        {/* Executive KPI Cards - 6 Cards Grid (including Emp Total & File Total) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Dak */}
          <div className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ಒಟ್ಟು ಪತ್ರಗಳು / Total Dak
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {summary?.totalLetters ?? letters.length}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block truncate">
              {summary?.totalInward ?? letters.filter(l => l.direction === 'inward').length} In / {summary?.totalOutward ?? letters.filter(l => l.direction === 'outward').length} Out
            </span>
          </div>

          {/* Card 2: Emp Total */}
          <div 
            className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs group cursor-pointer hover:border-amber-400 transition-colors"
            onClick={onNavigateToEmployees}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-600" />
                emp ಒಟ್ಟು / Staff
              </span>
              <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {totalEmployeesCount}
            </div>
            <span className="text-[11px] text-stone-600 mt-0.5 block truncate">
              <span className="text-emerald-700 font-semibold">{activeEmployeesCount} Active</span> • {onLeaveEmployeesCount} Leave
            </span>
          </div>

          {/* Card 3: File Total */}
          <div 
            className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs group cursor-pointer hover:border-blue-400 transition-colors"
            onClick={onNavigateToFiles}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-blue-600" />
                ಒಟ್ಟು ಫೈಲುಗಳು / Files
              </span>
              <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-blue-950 mt-1">
              {totalFilesCount}
            </div>
            <span className="text-[11px] text-stone-600 mt-0.5 block truncate">
              {totalLettersInFiles} Letters linked
            </span>
          </div>

          {/* Card 4: Disposal Efficiency */}
          <div className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ವಿಲೇವಾರಿ / Disposal
            </span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {disposalRate}%
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block truncate">
              {summary?.closedCount ?? letters.filter(l => l.status === 'Closed & Archived' || l.status === 'Dispatched').length} Cleared
            </span>
          </div>

          {/* Card 5: Pending & Overdue */}
          <div className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ಬಾಕಿ / Pending
            </span>
            <div className={`text-2xl font-bold mt-1 ${(summary?.overdueCount ?? 0) > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {summary?.pendingActionCount ?? 0}
            </div>
            <span className="text-[11px] text-rose-600 mt-0.5 block truncate">
              {summary?.overdueCount ?? 0} Overdue
            </span>
          </div>

          {/* Card 6: Grants & Sanctions */}
          <div className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ಅನುದಾನ / Grants
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              ${(totalSanctioned / 1000000).toFixed(2)}M
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block truncate">
              Sanction Orders
            </span>
          </div>
        </div>

        {/* AI Strategic Assessment */}
        {summary?.aiExecutiveOverview && (
          <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-100 text-amber-900">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Automated Governance Appraisal & Disposal Analysis
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans bg-stone-50 p-4 rounded-lg border border-stone-200 whitespace-pre-wrap">
              {summary.aiExecutiveOverview}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MONTHLY PENSION CASES DISTRIBUTION BAR CHART (RECHARTS - FY 2026-27)    */}
        {/* ========================================================================= */}
        <div id="pension-monthly-distribution-section" className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  ಆರ್ಥಿಕ ವರ್ಷದ ಮಾಸಿಕ ಪಿಂಚಣಿ ಪ್ರಕರಣಗಳ ಸಂಸ್ಕರಣಾ ತಃಖ್ಯೆ • Monthly Pension Cases Processed (FY 2026-27)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ ಭದ್ರಾವತಿ • 2026-27 ನೇ ಸಾಲಿನ 12 ತಿಂಗಳುಗಳ ನಿವೃತ್ತಿ ವೇತನ & ಉಪದಾನ ವಿಲೇವಾರಿ ಪ್ರಗತಿ ನಕ್ಷೆ (Bar Chart)
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-xs">
                <button
                  type="button"
                  onClick={() => setPensionChartMetric('counts')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    pensionChartMetric === 'counts'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ಪ್ರಕರಣಗಳ ಸಂಖ್ಯೆ (Case Counts)
                </button>
                <button
                  type="button"
                  onClick={() => setPensionChartMetric('financial')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    pensionChartMetric === 'financial'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ಆರ್ಥಿಕ ಮೊತ್ತ (Amount ₹ Lakhs)
                </button>
              </div>

              {onNavigateToPension && (
                <button
                  type="button"
                  onClick={onNavigateToPension}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs border border-stone-800 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-stone-900" />
                  <span>ಪಿಂಚಣಿ ಸ್ಟುಡಿಯೋ (Pension Studio)</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Ribbon for Pension Processing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">ಒಟ್ಟು ಸಂಸ್ಕರಿಸಿದವು</span>
              <p className="font-bold text-stone-900 text-base">{pensionAuditKpis.totalProcessed} ಪ್ರಕರಣಗಳು</p>
              <span className="text-[10px] text-stone-500">12 ತಿಂಗಳುಗಳಲ್ಲಿ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">ಮಂಜೂರಾದವು / Sanctioned</span>
              <p className="font-bold text-emerald-800 text-base">{pensionAuditKpis.totalSanctioned} ಪ್ರಕರಣಗಳು</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{pensionAuditKpis.avgDisposalRate}% ವಿಲೇವಾರಿ ದರ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 block">ಪರಿಶೀಲನೆಯಲ್ಲಿರುವವು / Pending</span>
              <p className="font-bold text-amber-900 text-base">{pensionAuditKpis.totalInProgress} ಪ್ರಕರಣಗಳು</p>
              <span className="text-[10px] text-stone-500">ಸೇವಾ ಪರಿಶೀಲನೆ ಹಂತ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 block">ಒಟ್ಟು ಉಪದಾನ (DCRG)</span>
              <p className="font-bold text-blue-900 text-base">₹{pensionAuditKpis.totalDcrgCr} ಕೋಟಿ</p>
              <span className="text-[10px] text-stone-500">DCRG ಸಂಚಿತ ಪಾವತಿ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 block">ಪರಿವರ್ತನೆ ಇಡಿಗಂಟು (CVP)</span>
              <p className="font-bold text-purple-900 text-base">₹{pensionAuditKpis.totalCommCr} ಕೋಟಿ</p>
              <span className="text-[10px] text-stone-500">40% ಪರಿವರ್ತನೆ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">ಸರಾಸರಿ ಸಂಸ್ಕರಣಾ ಕಾಲಾವಧಿ</span>
              <p className="font-bold text-stone-900 text-base">18 ದಿನಗಳು</p>
              <span className="text-[10px] text-emerald-700 font-semibold">ಸಕಾಲ ನಿಯಮ ಪಾಲನೆ</span>
            </div>
          </div>

          {/* Recharts BarChart Visualization */}
          <div className="bg-white p-3 rounded-lg border border-stone-200">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyPensionDistributionData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="monthKannadaShort" 
                    tick={{ fontSize: 11, fill: '#44403c' }} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  {pensionChartMetric === 'counts' ? (
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#44403c' }} 
                      allowDecimals={false}
                      label={{ value: 'ಪ್ರಕರಣಗಳ ಸಂಖ್ಯೆ (Cases)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#78716c' }}
                    />
                  ) : (
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#44403c' }} 
                      unit="L"
                      label={{ value: 'ಮೊತ್ತ (₹ Lakhs)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#78716c' }}
                    />
                  )}
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1.5 z-50">
                          <div className="font-bold text-amber-300 border-b border-stone-700 pb-1">
                            {data.monthKannada} ({data.monthEn})
                          </div>
                          <div className="space-y-0.5 font-sans">
                            <div className="flex justify-between gap-4">
                              <span className="text-stone-300">ಒಟ್ಟು ಸಂಸ್ಕರಿಸಿದವು:</span>
                              <strong className="text-white font-mono">{data.processed} ಪ್ರಕರಣಗಳು</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-emerald-400">ಅನುಮೋದಿತ/ಮಂಜೂರಾದವು:</span>
                              <strong className="text-emerald-400 font-mono">{data.sanctioned} ಪ್ರಕರಣಗಳು</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-amber-400">ಪರಿಶೀಲನೆ ಹಂತದಲ್ಲಿರುವವು:</span>
                              <strong className="text-amber-400 font-mono">{data.inProgress} ಪ್ರಕರಣಗಳು</strong>
                            </div>
                            <div className="border-t border-stone-700 pt-1 mt-1 flex justify-between gap-4">
                              <span className="text-sky-300">DCRG ಉಪದಾನ ಮೊತ್ತ:</span>
                              <strong className="text-sky-300 font-mono">₹{data.dcrgAmountLakhs} ಲಕ್ಷ</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-purple-300">ಪರಿವರ್ತನೆ ಇಡಿಗಂಟು:</span>
                              <strong className="text-purple-300 font-mono">₹{data.commutationLakhs} ಲಕ್ಷ</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-stone-400">ವಿಲೇವಾರಿ ಪ್ರಮಾಣ:</span>
                              <strong className="text-emerald-400 font-mono">{data.disposalPercent}%</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10, fontSize: 11 }} 
                    verticalAlign="bottom"
                  />
                  {pensionChartMetric === 'counts' ? (
                    <>
                      <Bar 
                        dataKey="processed" 
                        name="ಒಟ್ಟು ಸಂಸ್ಕರಿಸಿದ ಪ್ರಕರಣಗಳು (Total Processed)" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="sanctioned" 
                        name="ಮಂಜೂರಾದ ಪ್ರಕರಣಗಳು (Sanctioned / Approved)" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="inProgress" 
                        name="ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಕಡತಗಳು (In Pipeline)" 
                        fill="#f59e0b" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </>
                  ) : (
                    <>
                      <Bar 
                        dataKey="dcrgAmountLakhs" 
                        name="ಉಪದಾನ ಮೊತ್ತ (DCRG ₹ Lakhs)" 
                        fill="#2563eb" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="commutationLakhs" 
                        name="ಪರಿವರ್ತನೆ ಮೊತ್ತ (CVP ₹ Lakhs)" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="monthlyPensionLakhs" 
                        name="ಮಾಸಿಕ ಪಿಂಚಣಿ ಬದ್ಧತೆ (Monthly Pension ₹ Lakhs)" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month-Wise Audit Breakdown Mini Table */}
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                <tr>
                  <th className="p-2 border-r border-stone-200">ಮಾಹೆ (Month)</th>
                  <th className="p-2 text-center border-r border-stone-200">ಸಂಸ್ಕರಿಸಿದವು (Processed)</th>
                  <th className="p-2 text-center border-r border-stone-200 text-emerald-800">ಮಂಜೂರಾದವು (Sanctioned)</th>
                  <th className="p-2 text-center border-r border-stone-200 text-amber-800">ಬಾಕಿ (Pending)</th>
                  <th className="p-2 text-right border-r border-stone-200 text-blue-900">ಉಪದಾನ ಮೊತ್ತ (DCRG ₹ Lakhs)</th>
                  <th className="p-2 text-right border-r border-stone-200 text-purple-900">ಪರಿವರ್ತನೆ (CVP ₹ Lakhs)</th>
                  <th className="p-2 text-center">ವಿಲೇವಾರಿ % (Disposal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {monthlyPensionDistributionData.map(m => (
                  <tr key={m.monthKey} className="hover:bg-stone-50">
                    <td className="p-2 font-kannada font-bold text-stone-900 border-r border-stone-200">{m.monthKannada}</td>
                    <td className="p-2 text-center font-bold text-stone-800 border-r border-stone-200">{m.processed}</td>
                    <td className="p-2 text-center font-bold text-emerald-700 border-r border-stone-200">{m.sanctioned}</td>
                    <td className="p-2 text-center font-bold text-amber-700 border-r border-stone-200">{m.inProgress}</td>
                    <td className="p-2 text-right font-bold text-blue-900 border-r border-stone-200">₹{m.dcrgAmountLakhs.toFixed(2)}L</td>
                    <td className="p-2 text-right font-bold text-purple-900 border-r border-stone-200">₹{m.commutationLakhs.toFixed(2)}L</td>
                    <td className="p-2 text-center font-bold text-emerald-800">
                      <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                        {m.disposalPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION LOAD & BOTTLENECK ANALYSIS RECHARTS CHARTS (ಆಡಳಿತ & ಶಾಖಾವಾರು ತಃಖ್ಯೆ) */}
        {/* ========================================================================= */}
        <div id="section-analytics-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Active Files Per Office Section */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-800" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    ಶಾಖಾವಾರು ಸಕ್ರಿಯ ಕಡತಗಳ ವಿವರ • Active Files per Office Section
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  ಪ್ರತಿ ಶಾಖೆಯ ಒಟ್ಟು ಕಡತಗಳು ಹಾಗೂ ಸಕ್ರಿಯ ಕಡತಗಳ ಸಂಖ್ಯೆ (Active Dockets vs Letters)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-50 text-sky-800 rounded font-bold border border-sky-200">
                FY 2026-27
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="sectionShort" 
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} 
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1">
                          <div className="font-bold text-amber-300 border-b border-stone-700 pb-1">
                            {d.sectionName} ({d.sectionCode})
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span className="text-sky-300">ಸಕ್ರಿಯ ಕಡತಗಳು (Active Files):</span>
                            <span className="font-bold">{d.activeFiles}</span>
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span className="text-emerald-300">ಒಟ್ಟು ಪತ್ರಗಳು (Total Letters):</span>
                            <span className="font-bold">{d.totalLetters}</span>
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span className="text-stone-400">ವಿಲೇವಾರಿಯಾದ ಕಡತಗಳು (Closed):</span>
                            <span className="font-bold">{d.closedFiles}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                  <Bar dataKey="activeFiles" name="ಸಕ್ರಿಯ ಕಡತಗಳು (Active Files)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalLetters" name="ಒಟ್ಟು ಪತ್ರಗಳು (Total Letters)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bottleneck Analysis & Turnaround Time */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    ಶಾಖಾವಾರು ವಿಲೇವಾರಿ ವೇಗ & ಅಡಚಣೆ • Bottleneck & SLA Analysis
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  ಸರಾಸರಿ ಪ್ರಕ್ರಿಯಾ ದಿನಗಳು ಹಾಗೂ ಗಡುವು ಮೀರಿದ ದಾಖಲೆಗಳು (Avg Turnaround & Overdue)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold border border-amber-200">
                SLA SLA Monitor
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="sectionShort" 
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} 
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1">
                          <div className="font-bold text-amber-300 border-b border-stone-700 pb-1">
                            {d.sectionName} ({d.sectionCode})
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span className="text-amber-300">ಸರಾಸರಿ ಪ್ರಕ್ರಿಯಾ ದಿನಗಳು:</span>
                            <span className="font-bold">{d.avgTurnaroundDays} ದಿನಗಳು</span>
                          </div>
                          <div className="text-[11px] flex justify-between gap-4">
                            <span className="text-rose-400">ಗಡುವು ಮೀರಿದ ಪತ್ರಗಳು (Overdue):</span>
                            <span className="font-bold text-rose-300">{d.overdueCount}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-700">
                            {d.overdueCount > 0 ? '⚠️ ಈ ಶಾಖೆಯಲ್ಲಿ ತುರ್ತು ವಿಲೇವಾರಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ' : '✓ ಸಕಾಲಕ್ಕೆ ವಿಲೇವಾರಿ ಪ್ರಕ್ರಿಯೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ'}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                  <Bar dataKey="avgTurnaroundDays" name="ಸರಾಸರಿ ದಿನಗಳು (Avg Turnaround Days)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdueCount" name="ಗಡುವು ಮೀರಿದ ದಾಖಲೆಗಳು (Overdue SLA)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* HIGHLIGHTED SECTION: FILE-WISE TOTAL & DOCKET CORRESPONDENCE MATRIX */}
        <div id="file-wise-total-section" className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  ಫೈಲ್‌ವಾರು ಒಟ್ಟು ವಿವರ • File-Wise Total & Docket Ledger
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Detailed file docket allocation, showing exact letter counts and financial values per master file.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={fileSearchQuery}
                  onChange={e => setFileSearchQuery(e.target.value)}
                  placeholder="ಫೈಲ್ ಹುಡುಕಿ (Search file)..."
                  className="pl-8 pr-3 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
                />
              </div>

              <select
                value={fileSectionFilter}
                onChange={e => setFileSectionFilter(e.target.value)}
                className="px-2.5 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
              >
                <option value="all">ಎಲ್ಲಾ ಶಾಖೆಗಳು (All Sections)</option>
                <option value="Academic Wing">Academic Wing</option>
                <option value="Administration & Services">Administration</option>
                <option value="Accounts & Grants">Accounts & Grants</option>
                <option value="Examination Board">Examination Board</option>
                <option value="Inspection & Quality">Inspection & Quality</option>
                <option value="Legal & Grievances">Legal & Grievances</option>
              </select>

              {onNavigateToFiles && (
                <button
                  onClick={onNavigateToFiles}
                  className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>FTS ಫೈಲ್ ವ್ಯವಸ್ಥೆ</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Ribbon for Files */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">ಒಟ್ಟು ಫೈಲುಗಳು (Total Files)</span>
              <p className="font-bold text-stone-900 text-sm">{computedFileTotals.length}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">ಫೈಲ್‌ನಲ್ಲಿರುವ ಪತ್ರಗಳು (Attached Letters)</span>
              <p className="font-bold text-blue-700 text-sm">{totalLettersInFiles} Letters</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">ಸರಾಸರಿ ಪತ್ರ/ಫೈಲ್ (Avg Letters/File)</span>
              <p className="font-bold text-stone-800 text-sm">
                {computedFileTotals.length > 0 ? (totalLettersInFiles / computedFileTotals.length).toFixed(1) : 0}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">ಮಂಜೂರಾದ ಒಟ್ಟು ಮೊತ್ತ (Total Sanctions)</span>
              <p className="font-bold text-emerald-800 text-sm">
                ${computedFileTotals.reduce((s, f) => s + f.financialAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* File-Wise Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-600 bg-stone-100/80 font-semibold">
                  <th className="py-2.5 px-3">ಫೈಲ್ ಸಂಖ್ಯೆ (File Number)</th>
                  <th className="py-2.5 px-3">ಕಡತ ವಿಷಯ (Subject)</th>
                  <th className="py-2.5 px-3">ಶಾಖೆ (Section)</th>
                  <th className="py-2.5 px-3">ಹಾಲಿ ಅಧಿಕಾರಿ (Custodian)</th>
                  <th className="py-2.5 px-3 text-center">ಸ್ಥಿತಿ (Status)</th>
                  <th className="py-2.5 px-3 text-center">ಒಟ್ಟು ಪತ್ರಗಳು (Letters)</th>
                  <th className="py-2.5 px-3 text-right">ಅನುದಾನ (Sanction)</th>
                  <th className="py-2.5 px-3 text-center no-print">ವಿವರ (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {filteredFileTotals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-stone-500">
                      ಯಾವುದೇ ಫೈಲ್ ಕಂಡುಬಂದಿಲ್ಲ (No matching master files found).
                    </td>
                  </tr>
                ) : (
                  filteredFileTotals.map((item) => {
                    const isExpanded = expandedFileNumber === item.fileNumber;
                    return (
                      <React.Fragment key={item.fileNumber}>
                        <tr className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-xs font-bold text-blue-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <FolderGit2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item.fileNumber}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-stone-900 max-w-xs">
                            <p className="truncate" title={item.subject}>{item.subject}</p>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700 text-[11px]">
                              {item.section}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-700 whitespace-nowrap max-w-[140px] truncate">
                            {item.currentCustodian}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.status === 'Disposed / Closed' 
                                ? 'bg-stone-100 text-stone-600'
                                : item.status === 'In Movement'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-md text-xs bg-amber-100 text-amber-900 border border-amber-300/80">
                              {item.lettersCount} {item.lettersCount === 1 ? 'Letter' : 'Letters'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-800 whitespace-nowrap">
                            {item.financialAmount > 0 ? `$${item.financialAmount.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap no-print">
                            <button
                              onClick={() => setExpandedFileNumber(isExpanded ? null : item.fileNumber)}
                              className="px-2 py-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide' : 'View Letters'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable nested letters table */}
                        {isExpanded && (
                          <tr className="bg-stone-50/90">
                            <td colSpan={8} className="p-3 pl-8">
                              <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                                    Correspondence Attached to {item.fileNumber} ({item.letters.length} Records)
                                  </span>
                                  {onNavigateToFiles && (
                                    <button
                                      onClick={onNavigateToFiles}
                                      className="text-[11px] font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
                                    >
                                      <span>Open in Docket Tracking</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                {item.letters.length === 0 ? (
                                  <p className="text-xs text-stone-500 italic py-1">No individual correspondence documents linked to this docket.</p>
                                ) : (
                                  <div className="divide-y divide-stone-100 text-xs">
                                    {item.letters.map(letter => (
                                      <div key={letter.id} className="py-1.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`text-[10px] font-bold px-1 py-0.5 rounded-xs ${letter.direction === 'inward' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {letter.direction.toUpperCase()}
                                          </span>
                                          <span className="font-mono font-semibold text-stone-800 whitespace-nowrap">{letter.referenceNumber}</span>
                                          <span className="text-stone-700 truncate">{letter.subject}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-[10px] text-stone-500">{letter.dateReceivedOrIssued}</span>
                                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded-sm">
                                            {letter.status}
                                          </span>
                                          {onSelectLetter && (
                                            <button
                                              onClick={() => onSelectLetter(letter)}
                                              className="text-[10px] font-semibold text-stone-900 bg-stone-200 hover:bg-stone-300 px-1.5 py-0.5 rounded-sm transition-colors"
                                            >
                                              View
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sectional & Category Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sectional Breakdown */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-stone-400" /> Sectional Caseload & Pending Action
            </h3>

            <div className="space-y-2.5">
              {summary?.sectionBreakdown && (Object.entries(summary.sectionBreakdown) as [string, { total: number; pending: number }][]).map(([sec, data]) => {
                const pct = summary.totalLetters > 0 ? (data.total / summary.totalLetters) * 100 : 0;
                return (
                  <div key={sec} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">{sec}</span>
                      <span className="text-stone-600">
                        {data.total} total ({data.pending} pending)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-800 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" /> Correspondence Volume by Subject Category
            </h3>

            <div className="space-y-2.5">
              {summary?.categoryBreakdown && (Object.entries(summary.categoryBreakdown) as [string, number][]).map(([cat, count]) => {
                const pct = summary.totalLetters > 0 ? (count / summary.totalLetters) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-800 truncate pr-2">{cat}</span>
                      <span className="font-semibold text-stone-900">{count} files</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* EMPLOYEE ESTABLISHMENT & CADRE CADENCE OVERVIEW */}
        {employees.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  ಸಿಬ್ಬಂದಿ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ವರ್ಗೀಕರಣ • Staff Cadre & Establishment Strength ({employees.length} Total)
                </h3>
              </div>
              {onNavigateToEmployees && (
                <button
                  onClick={onNavigateToEmployees}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 no-print"
                >
                  <span>ಅಧಿಕಾರಿಗಳ ಪೂರ್ಣ ಪಟ್ಟಿ (View All Staff)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-500">ಒಟ್ಟು ಸಿಬ್ಬಂದಿ (Total Cadre)</span>
                <p className="text-xl font-bold text-stone-900 mt-0.5">{employees.length}</p>
                <span className="text-[11px] text-stone-500">Gazetted & Non-Gazetted</span>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800">ಸೇವೆಯಲ್ಲಿರುವವರು (Active on Duty)</span>
                <p className="text-xl font-bold text-emerald-900 mt-0.5">
                  {employees.filter(e => e.status === 'Active').length}
                </p>
                <span className="text-[11px] text-emerald-700">Present in Directorate</span>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-800">ಕಾಯಂ ಹುದ್ದೆಗಳು (Permanent)</span>
                <p className="text-xl font-bold text-blue-900 mt-0.5">
                  {employees.filter(e => e.employmentType === 'Permanent').length}
                </p>
                <span className="text-[11px] text-blue-700">Substantive Cadre</span>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800">ರಜೆ / ನಿಯೋಜನೆ (Leave / Deputation)</span>
                <p className="text-xl font-bold text-amber-900 mt-0.5">
                  {employees.filter(e => e.status !== 'Active').length}
                </p>
                <span className="text-[11px] text-amber-700">Temporary absence</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECURITY AUDIT LOG TABLE (ಭದ್ರತಾ ಆಡಿಟ್ ಲಾಗ್ ಕೋಷ್ಟಕ - GitHub & System Changes) */}
        {/* ========================================================================= */}
        <div id="security-audit-log-section" className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  ಭದ್ರತಾ ಆಡಿಟ್ ಲಾಗ್ ಕೋಷ್ಟಕ • Security Audit Log
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                GitHub sync events, system configuration updates, bulk deletions and administrative transactions tracked with user accountability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={refreshAuditLogs}
                className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Refresh audit events from security store"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                <span>ರಿಫ್ರೆಶ್ (Refresh)</span>
              </button>

              <button
                type="button"
                onClick={handleExportAuditCSV}
                className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Export security audit log to CSV"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Audit CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearAuditLogs}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear audit log history with administrative authorization"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ತೆರವು (Clear)</span>
              </button>
            </div>
          </div>

          {/* Search & Event Type Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setAuditTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  auditTypeFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Events ({securityLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setAuditTypeFilter('GITHUB_SYNC')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  auditTypeFilter === 'GITHUB_SYNC'
                    ? 'bg-sky-800 text-white shadow-2xs'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                <FolderGit2 className="w-3 h-3 text-sky-600" />
                <span>GitHub Sync ({securityLogs.filter(l => l.eventType === 'GITHUB_SYNC').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditTypeFilter('CONFIG_UPDATE')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  auditTypeFilter === 'CONFIG_UPDATE'
                    ? 'bg-purple-800 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                <Key className="w-3 h-3 text-purple-600" />
                <span>Config Changes ({securityLogs.filter(l => l.eventType === 'CONFIG_UPDATE').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditTypeFilter('BULK_DELETION')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  auditTypeFilter === 'BULK_DELETION'
                    ? 'bg-rose-800 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Deletions ({securityLogs.filter(l => l.eventType === 'BULK_DELETION').length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                placeholder="Search audit trail / user ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto rounded-lg border border-stone-200 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">Timestamp (ದಿನಾಂಕ)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Event Type</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Module</th>
                  <th className="py-2.5 px-3">Action Summary & Details</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Authorizing Officer</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSecurityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400 text-xs">
                      No security audit events match current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSecurityLogs.map(log => {
                    const getBadge = () => {
                      switch (log.eventType) {
                        case 'GITHUB_SYNC':
                          return 'bg-sky-100 text-sky-800 border-sky-300';
                        case 'GITHUB_SYNC_ERROR':
                          return 'bg-rose-100 text-rose-800 border-rose-300';
                        case 'CONFIG_UPDATE':
                          return 'bg-purple-100 text-purple-800 border-purple-300';
                        case 'BULK_DELETION':
                          return 'bg-red-100 text-red-800 border-red-300 font-bold';
                        case 'DATA_RESET':
                          return 'bg-amber-100 text-amber-800 border-amber-300';
                        case 'EXPORT_EVENT':
                          return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        default:
                          return 'bg-stone-100 text-stone-800 border-stone-300';
                      }
                    };

                    return (
                      <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-2 px-3 font-mono text-[11px] font-semibold text-stone-900 whitespace-nowrap">
                          {log.formattedDate}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBadge()}`}>
                            {log.eventType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-stone-700 whitespace-nowrap">
                          {log.targetModule}
                        </td>
                        <td className="py-2 px-3 max-w-sm">
                          <div className="font-bold text-stone-900">{log.actionSummary}</div>
                          <div className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {log.details}
                          </div>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-bold text-stone-800 block text-[11px]">{log.authorizedUserName}</span>
                          <span className="font-mono text-[10px] text-stone-500">ID: {log.authorizedUserId}</span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Chronological Dak Register Table */}
        <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Chronological Correspondence Register Ledger ({letters.length} entries)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 bg-stone-50">
                  <th className="py-2 px-3 font-semibold">Ref No & Date</th>
                  <th className="py-2 px-3 font-semibold">Flow</th>
                  <th className="py-2 px-3 font-semibold">Subject</th>
                  <th className="py-2 px-3 font-semibold">Section</th>
                  <th className="py-2 px-3 font-semibold">Sender / Recipient</th>
                  <th className="py-2 px-3 font-semibold">Priority</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold text-right">Target Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {letters.map(l => (
                  <tr key={l.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-mono text-[11px] font-bold text-stone-900 whitespace-nowrap">
                      {l.referenceNumber}
                      <span className="block text-[10px] font-normal text-stone-400">
                        {formatDateDDMMYYYY(l.dateReceivedOrIssued)}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${l.direction === 'inward' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>
                        {l.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-stone-900 max-w-xs truncate">
                      {l.subject}
                    </td>
                    <td className="py-2 px-3 text-stone-600 whitespace-nowrap">{l.section}</td>
                    <td className="py-2 px-3 text-stone-600 truncate max-w-[160px]">
                      {l.direction === 'inward' ? l.senderName : l.recipientName}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold">{l.priority}</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-800">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] whitespace-nowrap">
                      {formatDateDDMMYYYY(l.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attestation & Signature Sign-off */}
        <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Statutory Dispatch Officer Attestation
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed italic">
            Certified that the above correspondence, inward dak entries, outward government orders, master docket files, and establishment strengths have been audited in conformity with the Departmental Manual of Office Procedure.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-stone-100">
            <div>
              <div className="border-b border-stone-400 h-8"></div>
              <span className="text-[11px] text-stone-500 mt-1 block">Central Registry Officer / Section Head Signature</span>
            </div>
            <div>
              <div className="border-b border-stone-400 h-8 flex items-end pb-1 font-mono text-xs text-stone-700">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Date Signed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
