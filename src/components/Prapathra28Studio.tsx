import React, { useState, useMemo, useRef } from 'react';
import {
  Award,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Square,
  Calendar,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Save,
  Download,
  AlertCircle,
  ExternalLink,
  Info,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { Employee, AdminAuthUser } from '../types';
import {
  Prapathra28EmployeeRow,
  preparePrapathra28Data,
  exportPrapathra28ToExcel,
  toKannadaDigits,
  prepareSalaryGrantDemandData,
  exportGrantDemandToExcel,
  SalaryGrantDemandRow
} from '../utils/prapathra28Utils';
import { formatCurrency } from '../utils/formatters';
import { SalaryProjectionView } from './SalaryProjectionView';

interface Prapathra28StudioProps {
  employees: Employee[];
  currentUser: AdminAuthUser | null;
  initialMonth?: 'January' | 'July';
  onRefreshEmployees?: () => void;
  onLetterCreated?: () => void;
  showToast: (msg: string) => void;
}

export const Prapathra28Studio: React.FC<Prapathra28StudioProps> = ({
  employees = [],
  currentUser,
  initialMonth,
  onRefreshEmployees,
  onLetterCreated,
  showToast
}) => {
  const [selectedMonth, setSelectedMonth] = useState<'January' | 'July'>(initialMonth || 'January');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeSubTab, setActiveSubTab] = useState<'form28' | 'officeOrder' | 'employeeSelect' | 'budgetDemand'>('form28');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(true);
  const [customOrderNo, setCustomOrderNo] = useState('');
  const [orderDate, setOrderDate] = useState<string>(
    (initialMonth || 'January') === 'January' ? '2026-01-01' : '2026-07-01'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Budget Demand State (ಅನುದಾನ ಮುಂದಿನ ವರ್ಷ ಬೇಡಿಕೆ - 12 ತಿಂಗಳ ಲೆಕ್ಕಾಚಾರ)
  const [budgetFinancialYear, setBudgetFinancialYear] = useState<string>('2026-2027');
  const [budgetDaPercent, setBudgetDaPercent] = useState<number>(50);
  const [budgetHraPercent, setBudgetHraPercent] = useState<number>(8);
  const [budgetSearch, setBudgetSearch] = useState<string>('');

  // Dynamic DDO Signatory pulled from employee isDdo flag
  const ddoOfficer = useMemo(() => {
    const emp = employees.find(e => e.isDdo === true) || 
                employees.find(e => e.designation?.toLowerCase().includes('ddo')) || 
                employees.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
    return {
      name: emp?.fullName || 'ಹೆಚ್. ರವಿಕುಮಾರ್',
      designation: emp?.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
      office: emp?.placeOfWork || emp?.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
      code: emp?.ddoCode || '14041ED001',
    };
  }, [employees]);

  // Sync if initialMonth prop changes
  React.useEffect(() => {
    if (initialMonth && (initialMonth === 'January' || initialMonth === 'July')) {
      setSelectedMonth(initialMonth);
      setOrderDate(initialMonth === 'January' ? `${selectedYear}-01-01` : `${selectedYear}-07-01`);
      setIsSaved(false);
    }
  }, [initialMonth, selectedYear]);

  // Memoized employee rows for Prapathra 28
  const baseRows = useMemo(() => {
    // If filterDueOnly is true, only include employees matching selectedMonth
    const filteredEmployees = filterDueOnly
      ? employees.filter(e => {
          if (selectedMonth === 'January') {
            return e.incrementMonth === 'January' || !e.incrementMonth;
          }
          return e.incrementMonth === 'July';
        })
      : employees;
    return preparePrapathra28Data(filteredEmployees, selectedMonth, selectedYear);
  }, [employees, selectedMonth, selectedYear, filterDueOnly]);

  // Selected row state (IDs) - select all filtered by default
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    baseRows.forEach(r => set.add(r.id));
    return set;
  });

  // Re-sync selected IDs when baseRows changes
  React.useEffect(() => {
    const set = new Set<string>();
    baseRows.forEach(r => set.add(r.id));
    setSelectedEmployeeIds(set);
  }, [baseRows]);

  // When selectedMonth changes, update order date & default selected employees
  const handleMonthChange = (month: 'January' | 'July') => {
    setSelectedMonth(month);
    const effDate = month === 'January' ? `${selectedYear}-01-01` : `${selectedYear}-07-01`;
    setOrderDate(effDate);
    setIsSaved(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const effDate = selectedMonth === 'January' ? `${year}-01-01` : `${year}-07-01`;
    setOrderDate(effDate);
    setIsSaved(false);
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const next = new Set<string>();
    filteredRows.forEach(r => next.add(r.id));
    setSelectedEmployeeIds(next);
  };

  const deselectAll = () => {
    setSelectedEmployeeIds(new Set());
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    return baseRows.filter(r => {
      const emp = employees.find(e => e.id === r.id);
      if (filterDueOnly && emp?.incrementMonth && emp.incrementMonth !== selectedMonth) {
        return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.fullName.toLowerCase().includes(term) ||
        r.kgidNumber.toLowerCase().includes(term) ||
        r.designation.toLowerCase().includes(term) ||
        r.placeOfWork.toLowerCase().includes(term)
      );
    });
  }, [baseRows, searchTerm, filterDueOnly, selectedMonth, employees]);

  // Active selected rows for printing / order generation
  const activeSelectedRows = useMemo(() => {
    return baseRows.filter(r => selectedEmployeeIds.has(r.id));
  }, [baseRows, selectedEmployeeIds]);

  // Order number adhering to user request: strictly "ಸಂ:"
  const orderNumber = customOrderNo.trim() || 
    `ಸಂ: BEO/BHD/ಸಿಬ್ಬಂದಿ-1/ವಾ.ವೇ.ಬ-${selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'}/${selectedYear}/089`;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (activeSelectedRows.length === 0) {
      showToast('ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಬ್ಬ ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select at least one employee)');
      return;
    }
    exportPrapathra28ToExcel(activeSelectedRows, selectedMonth, selectedYear);
    showToast(`ಪ್ರಪತ್ರ-28 ${selectedMonth} ${selectedYear} ಎಕ್ಸೆಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!`);
  };

  // Save to Office Registry & Docket
  const handleSaveToRegistry = async () => {
    if (activeSelectedRows.length === 0) {
      showToast('ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಬ್ಬ ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select at least one employee)');
      return;
    }

    setIsSaving(true);
    try {
      const monthKn = selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ';
      const effDateStr = selectedMonth === 'January' ? `01-01-${selectedYear}` : `01-07-${selectedYear}`;

      // Create official letter in registry
      const letterPayload = {
        referenceNumber: orderNumber,
        fileNumber: `FILE-${selectedYear}/BEO-INCR-${selectedMonth.toUpperCase()}/028`,
        direction: 'outward',
        subject: `ದಿನಾಂಕ: ${effDateStr} ರ ${monthKn} ಮಾಹೆಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಪ್ರಪತ್ರ-28 ಮತ್ತು ಕಛೇರಿ ಆದೇಶ`,
        category: 'Salary & Increment Order',
        senderName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
        senderDesignation: 'Block Education Officer & DDO',
        senderDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
        recipientName: 'ಸಂಬಂಧಪಟ್ಟ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರು ಹಾಗೂ ನೌಕರರು',
        recipientDesignation: 'Headmasters & Teachers',
        recipientDepartment: 'ಸರ್ಕಾರಿ ಶಾಲೆಗಳು, ಭದ್ರಾವತಿ ವಲಯ',
        dateReceivedOrIssued: orderDate,
        priority: 'Urgent',
        status: 'Dispatched',
        assignedOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು / ಸ್ಥಾಪನಾ ಶಾಖೆ',
        section: 'Administration & Services',
        bodyText: `ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) ನಿಯಮ 53 ರನ್ವಯ ${monthKn} ${selectedYear} ರ ಮಾಹೆಯಲ್ಲಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಗೆ ಅರ್ಹರಾದ ${activeSelectedRows.length} ನೌಕರರಿಗೆ ಪ್ರಪತ್ರ-28 ರನ್ವಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.`,
        tags: ['#Prapathra28', '#AnnualIncrement', `#${selectedMonth}Increment`, '#BhadravathiBEO'],
      };

      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letterPayload),
      });

      if (res.ok) {
        setIsSaved(true);
        showToast(`ಪ್ರಪತ್ರ-28 ಮತ್ತು ಕಛೇರಿ ಆದೇಶವನ್ನು ಕಡತ ಮತ್ತು ಪತ್ರಗಳ ರಿಜಿಸ್ಟ್ರಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!`);
        if (onLetterCreated) onLetterCreated();
      } else {
        throw new Error('Failed to save to registry');
      }
    } catch (err: any) {
      console.error('Error saving Prapathra-28:', err);
      showToast('ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border-3 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-ink">KCSR ನಿಯಮ 53 & KFC ಆರ್ಟಿಕಲ್ 79</span>
              <span className="label-accent">ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಪ್ರಮಾಣ ಪತ್ರ (FORM NO. 28)</span>
            </div>
            <h1 className="font-gaegu text-4xl sm:text-5xl font-bold tracking-tight text-[#2b2b2b] flex items-center gap-2">
              <Award className="w-8 h-8 text-[#f59e0b]" />
              ಪ್ರಪತ್ರ - 28 ಹಾಗೂ ಕಛೇರಿ ಆದೇಶ ಮಾಡ್ಯೂಲ್
            </h1>
            <p className="text-[#2b2b2b]/80 text-sm max-w-3xl font-kannada">
              ಜನವರಿ ಮತ್ತು ಜುಲೈ ಮಾಹೆಯಲ್ಲಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಗೆ ಅರ್ಹರಾಗಿರುವ ನೌಕರರ ಪಟ್ಟಿ ತಯಾರಿಸಿ, ಅಧಿಕೃತ ಪ್ರಪತ್ರ-28 ಪ್ರಮಾಣ ಪತ್ರ ಹಾಗೂ ಆದೇಶವನ್ನು ಸುಲಭವಾಗಿ ಸೃಜಿಸಿ, ಪ್ರಿಂಟ್ ಅಥವಾ ಎಕ್ಸೆಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.
            </p>
          </div>

          {/* Quick Month & Year Switcher */}
          <div className="bg-[#fffbf2] p-3.5 rounded-lg border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs font-bold text-[#2b2b2b] font-kannada">ಬಡ್ತಿ ಮಾಹೆ (Cycle):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-select-january"
                onClick={() => handleMonthChange('January')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
                  selectedMonth === 'January'
                    ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                    : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2]'
                }`}
              >
                ಜನವರಿ (01-01)
              </button>
              <button
                id="btn-select-july"
                onClick={() => handleMonthChange('July')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
                  selectedMonth === 'July'
                    ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                    : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2]'
                }`}
              >
                ಜುಲೈ (01-07)
              </button>
              <select
                id="select-year-prapathra"
                value={selectedYear}
                onChange={e => handleYearChange(Number(e.target.value))}
                className="bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded text-xs px-2.5 py-1.5 font-mono-code font-bold focus:outline-none shadow-[2px_2px_0px_#2b2b2b]"
              >
                <option value={2025}>2025 (2025)</option>
                <option value={2026}>2026 (2026)</option>
                <option value={2027}>2027 (2027)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Subtabs & Action Buttons */}
      <div className="bg-white rounded-xl border-3 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] p-4 no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Subtabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-prapathra-form28"
            onClick={() => setActiveSubTab('form28')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
              activeSubTab === 'form28'
                ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. ಪ್ರಪತ್ರ-28 ಪ್ರಮಾಣ ಪತ್ರ (Form 28)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#f59e0b] text-[#2b2b2b] font-mono-code font-bold">
              {activeSelectedRows.length}
            </span>
          </button>

          <button
            id="tab-prapathra-office-order"
            onClick={() => setActiveSubTab('officeOrder')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
              activeSubTab === 'officeOrder'
                ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. ಕಛೇರಿ ಆದೇಶ (Office Order)</span>
          </button>

          <button
            id="tab-prapathra-select-employees"
            onClick={() => setActiveSubTab('employeeSelect')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
              activeSubTab === 'employeeSelect'
                ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. ನೌಕರರ ಆಯ್ಕೆ ({activeSelectedRows.length}/{baseRows.length})</span>
          </button>

          <button
            id="tab-prapathra-budget-demand"
            onClick={() => setActiveSubTab('budgetDemand')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-2 border-[#2b2b2b] font-kannada ${
              activeSubTab === 'budgetDemand'
                ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>4. ವಾರ್ಷಿಕ ಅನುದಾನ ಬೇಡಿಕೆ (Salary Projection)</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-prapathra-print"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#2b2b2b] hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b] font-kannada"
            title="A4 ಮುದ್ರಣ (Print Document to A4)"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>ಮುದ್ರಿಸಿ (Print A4)</span>
          </button>

          <button
            id="btn-prapathra-excel"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-kannada"
            title="Excel ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
          >
            <Download className="w-4 h-4" />
            <span>Excel ಡೌನ್‌ಲೋಡ್</span>
          </button>

          <button
            id="btn-prapathra-save-registry"
            onClick={handleSaveToRegistry}
            disabled={isSaving || isSaved}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-2 border-[#2b2b2b] font-kannada shadow-[2px_2px_0px_#2b2b2b] ${
              isSaved
                ? 'bg-emerald-100 text-emerald-950 border-emerald-500'
                : 'bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b]'
            }`}
            title="ಕಡತ ಹಾಗೂ ಪತ್ರಗಳ ರಿಜಿಸ್ಟ್ರಿಗೆ ದಾಖಲಿಸಿ"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4 text-[#2b2b2b]" />}
            <span>{isSaved ? 'ದಾಖಲಾಗಿದೆ' : isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಡತದಲ್ಲಿ ಉಳಿಸಿ'}</span>
          </button>
        </div>
      </div>

      {/* ===================== VIEW 1: FORM 28 CERTIFICATE ===================== */}
      {activeSubTab === 'form28' && (
        <div className="space-y-4">
          {/* Quick Action Banner matching user request: ಸರಿ ಇದ್ದಲ್ಲಿ ಪ್ರಿಂಟ್ ತೆಗಿಯಲು ಮತ್ತು ಆದೇಶ ತಯಾರಿಸಲು ಇರಬೇಕು */}
          <div className="bg-[#fffbf2] border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#f59e0b] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#f59e0b] text-[#2b2b2b] font-bold text-xs border border-[#2b2b2b] font-mono-code">
                {selectedMonth === 'January' ? '📅 JAN (01-01)' : '📅 JUL (01-07)'}
              </div>
              <div>
                <p className="text-xs font-black text-[#2b2b2b] font-kannada">
                  {selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'} ಮಾಹೆಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ವಿವರಗಳು ({activeSelectedRows.length} ನೌಕರರು ಸಿದ್ಧರಾಗಿದ್ದಾರೆ)
                </p>
                <p className="text-[11px] text-[#2b2b2b]/70 font-kannada">
                  ಪರಿಶೀಲಿಸಿ: ವಿವರಗಳು ಸರಿ ಇದ್ದಲ್ಲಿ ನೇರವಾಗಿ ಪ್ರಿಂಟ್ ತೆಗಿಯಲು ಅಥವಾ ಅಧಿಕೃತ ಕಛೇರಿ ಆದೇಶ ತಯಾರಿಸಲು ಆಯ್ಕೆಮಾಡಿ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-prapathra-quick-print"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-[#2b2b2b] hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b] cursor-pointer transition-colors font-kannada"
                title="ಪ್ರಪತ್ರ-28 ಪ್ರಮಾಣ ಪತ್ರ ಪ್ರಿಂಟ್ ತೆಗಿಯಲು"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>🖨️ ಪ್ರಿಂಟ್ ತೆಗಿಯಿರಿ (Print)</span>
              </button>

              <button
                id="btn-prapathra-quick-make-order"
                onClick={() => setActiveSubTab('officeOrder')}
                className="px-3.5 py-2 bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] rounded-lg text-xs font-black flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] cursor-pointer transition-colors font-kannada"
                title="ಅಧಿಕೃತ ಕಛೇರಿ ಆದೇಶ ತಯಾರಿಸಲು"
              >
                <FileText className="w-4 h-4 text-[#2b2b2b]" />
                <span>📜 ಆದೇಶ ತಯಾರಿಸಲು (Make Order)</span>
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-[#2b2b2b] rounded-lg p-3 text-xs text-[#2b2b2b] flex items-center justify-between no-print shadow-[2px_2px_0px_#2b2b2b]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#f59e0b] shrink-0" />
              <span className="font-kannada">
                ಪ್ರಸ್ತುತ <strong>{selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'} {selectedYear}</strong> ಮಾಹೆಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಗಾಗಿ <strong>{activeSelectedRows.length}</strong> ನೌಕರರನ್ನು ಪ್ರಪತ್ರ-28 ಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ.
              </span>
            </div>
            <button
              onClick={() => setActiveSubTab('employeeSelect')}
              className="font-bold underline text-[#2b2b2b] hover:text-[#f59e0b] cursor-pointer font-kannada"
            >
              ನೌಕರರನ್ನು ಬದಲಾಯಿಸಿ / ಆಯ್ಕೆಮಾಡಿ &rarr;
            </button>
          </div>

          {/* Form 28 Printable A4 Container */}
          <div
            id="form-28-print-container"
            className="bg-white p-6 md:p-10 rounded-xl border-3 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] text-stone-900 space-y-6"
            style={{ minHeight: '297mm' }}
          >
            {/* Official Header */}
            <div className="text-center space-y-1.5 border-b-2 border-stone-800 pb-4">
              <p className="text-xs font-bold tracking-widest text-stone-700 uppercase">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
              <h2 className="text-lg font-black text-stone-950 tracking-tight">
                ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
              </h2>
              <h3 className="text-base font-bold text-stone-900">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ - 577301 (ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ)
              </h3>
              <div className="pt-2">
                <span className="inline-block px-4 py-1 border-2 border-stone-900 rounded font-black text-sm bg-stone-50">
                  ಪ್ರಪತ್ರ - 28 (FORM NO. 28)
                </span>
              </div>
              <p className="text-xs font-bold text-stone-800">
                [ ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) ನಿಯಮ 53 ಮತ್ತು ಕರ್ನಾಟಕ ಆರ್ಥಿಕ ಸಂಹಿತೆ (KFC) ಆರ್ಟಿಕಲ್ 79 ]
              </p>
              <p className="text-sm font-black text-sky-950 pt-1">
                ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಪ್ರಮಾಣ ಪತ್ರ (PERIODICAL INCREMENT CERTIFICATE)
              </p>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 text-stone-700">
                <span>ಕಛೇರಿ/ಶಾಲಾ ಕೋಡ್: <strong>1401QE0001</strong></span>
                <span>ವೇತನ ಬಡ್ತಿ ಜಾರಿಯ ಮಾಹೆ: <strong>{selectedMonth === 'January' ? 'ಜನವರಿ (01-01)' : 'ಜುಲೈ (01-07)'} {toKannadaDigits(selectedYear)}</strong></span>
                <span>ದಿನಾಂಕ: <strong>{orderDate}</strong></span>
              </div>
            </div>

            {/* Statutory Form 28 Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-800 text-[11px]">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 text-center font-bold">
                    <th className="border border-stone-800 px-2 py-2 w-10">ಕ್ರ.ಸಂ.</th>
                    <th className="border border-stone-800 px-2 py-2 text-left">ನೌಕರರ ಹೆಸರು & ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ</th>
                    <th className="border border-stone-800 px-2 py-2 text-left">ಹುದ್ದೆ & ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶಾಲೆ/ಕಛೇರಿ</th>
                    <th className="border border-stone-800 px-2 py-2">ಹಾಲಿ ವೇತನ ಶ್ರೇಣಿ (Scale)</th>
                    <th className="border border-stone-800 px-2 py-2">ಹಾಲಿ ಮೂಲ ವೇತನ (₹)</th>
                    <th className="border border-stone-800 px-2 py-2">ಮಂಜೂರಾದ ಬಡ್ತಿ ದರ (₹)</th>
                    <th className="border border-stone-800 px-2 py-2">ಬಡ್ತಿ ನಂತರದ ಹೊಸ ಮೂಲ ವೇತನ (₹)</th>
                    <th className="border border-stone-800 px-2 py-2">ಬಡ್ತಿ ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ</th>
                    <th className="border border-stone-800 px-2 py-2">ಅರ್ಹತಾ ಸೇವಾ ಅವಧಿ</th>
                    <th className="border border-stone-800 px-2 py-2">ಮುಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ</th>
                    <th className="border border-stone-800 px-2 py-2">ಷರಾ</th>
                  </tr>
                  <tr className="bg-stone-50 text-stone-500 text-[9px] text-center">
                    <th className="border border-stone-800 py-0.5">1</th>
                    <th className="border border-stone-800 py-0.5">2</th>
                    <th className="border border-stone-800 py-0.5">3</th>
                    <th className="border border-stone-800 py-0.5">4</th>
                    <th className="border border-stone-800 py-0.5">5</th>
                    <th className="border border-stone-800 py-0.5">6</th>
                    <th className="border border-stone-800 py-0.5">7</th>
                    <th className="border border-stone-800 py-0.5">8</th>
                    <th className="border border-stone-800 py-0.5">9</th>
                    <th className="border border-stone-800 py-0.5">10</th>
                    <th className="border border-stone-800 py-0.5">11</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSelectedRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-amber-50/40">
                      <td className="border border-stone-800 px-2 py-2 text-center font-bold">
                        {toKannadaDigits(idx + 1)}
                      </td>
                      <td className="border border-stone-800 px-2 py-2">
                        <div className="font-bold text-stone-900">{row.fullName}</div>
                        <div className="text-[10px] text-stone-600 font-mono">KGID: {row.kgidNumber}</div>
                      </td>
                      <td className="border border-stone-800 px-2 py-2">
                        <div className="font-medium text-stone-900">{row.designation}</div>
                        <div className="text-[10px] text-stone-600">{row.placeOfWork}</div>
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-center font-mono text-[10px]">
                        {row.payScale}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-right font-bold font-mono">
                        ₹ {row.presentBasicPay.toLocaleString('en-IN')}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-right text-emerald-800 font-bold font-mono">
                        +₹ {row.incrementRate.toLocaleString('en-IN')}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-right font-black font-mono text-sky-950 bg-stone-50">
                        ₹ {row.newBasicPay.toLocaleString('en-IN')}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-center font-medium">
                        {row.effectiveDate}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-center text-[10px]">
                        {row.qualifyingPeriod}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-center font-medium">
                        {row.nextIncrementDate}
                      </td>
                      <td className="border border-stone-800 px-2 py-2 text-[10px] text-stone-600 text-center">
                        {row.remarks}
                      </td>
                    </tr>
                  ))}

                  {activeSelectedRows.length === 0 && (
                    <tr>
                      <td colSpan={11} className="border border-stone-800 py-8 text-center text-stone-500 italic">
                        ಯಾವುದೇ ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು 'ನೌಕರರ ಆಯ್ಕೆ' ಟ್ಯಾಬ್‌ನಲ್ಲಿ ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Statutory Declaration & DDO Signatures */}
            <div className="pt-6 space-y-4 text-xs text-stone-900 leading-relaxed">
              <div className="p-3 border border-stone-400 rounded bg-stone-50">
                <p className="font-bold mb-1">:: ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ದೃಢೀಕರಣ ಪತ್ರ (STATUTORY CERTIFICATE) ::</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    ಈ ಮೇಲೆ ನಮೂದಿಸಿರುವ ಎಲ್ಲಾ ನೌಕರರು ಕಾಲಂ (9) ರಲ್ಲಿ ಸೂಚಿಸಿರುವ ಅರ್ಹತಾ ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ತೃಪ್ತಿಕರ ನಿರಂತರ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಿರುತ್ತಾರೆ ಹಾಗೂ ಕರ್ತವ್ಯದ ಮೇಲೆ ಹಾಜರಿದ್ದು ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಗೆ ಸಂಪೂರ್ಣ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ ಎಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.
                  </li>
                  <li>
                    ಈ ಅವಧಿಯಲ್ಲಿ ಸದರಿ ನೌಕರರ ವಿರುದ್ಧ ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ, ಅಮಾನತು ಅಥವಾ ವೇತನ ಬಡ್ತಿಯನ್ನು ತಡೆಹಿಡಿಯುವ ನ್ಯಾಯಾಲಯದ / ಶಿಸ್ತು ಪ್ರಾಧಿಕಾರದ ಶಿಕ್ಷಾ ಆದೇಶಗಳು ಜಾರಿಯಲ್ಲಿರುವುದಿಲ್ಲ ಎಂದು ದೃಢೀಕರಿಸಲಾಗಿದೆ.
                  </li>
                  <li>
                    ಸದರಿಯವರ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ಈ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ನಮೂದಿಸಿ, ಸೂಕ್ತ ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆಯಡಿ ವೇತನ ಸೆಳೆಯಲು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.
                  </li>
                </ol>
              </div>

              {/* Signatures Section */}
              <div className="pt-8 flex justify-between items-end">
                <div className="text-center space-y-1">
                  <div className="h-10"></div>
                  <p className="font-bold text-stone-800">ಸ್ಥಾಪನಾ ಸಹಾಯಕರು / ಕಛೇರಿ ಅಧೀಕ್ಷಕರು</p>
                  <p className="text-[11px] text-stone-600">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-10"></div>
                  <p className="font-black text-stone-950 text-sm">({ddoOfficer.name})</p>
                  <p className="font-bold text-xs text-stone-800">{ddoOfficer.designation}</p>
                  <p className="text-[11px] text-stone-700">{ddoOfficer.office}</p>
                  <p className="text-[10px] text-stone-500 font-mono">DDO Code: {ddoOfficer.code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: OFFICE ORDER ===================== */}
      {activeSubTab === 'officeOrder' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-700">ಆದೇಶ ಸಂಖ್ಯೆ (Strictly 'ಸಂ:'):</label>
              <input
                type="text"
                value={customOrderNo}
                onChange={e => setCustomOrderNo(e.target.value)}
                placeholder={orderNumber}
                className="w-80 px-3 py-1.5 text-xs font-mono font-bold border border-stone-300 rounded-md focus:border-sky-900 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-700">ಆದೇಶ ದಿನಾಂಕ:</label>
              <input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-md focus:border-sky-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Office Order Printable A4 Container */}
          <div
            id="office-order-print-container"
            className="bg-white p-8 md:p-14 rounded-xl shadow-xs border border-stone-300 text-stone-900 space-y-6"
            style={{ minHeight: '297mm' }}
          >
            {/* Order Header */}
            <div className="text-center space-y-1 border-b-2 border-stone-800 pb-4">
              <p className="text-xs font-bold tracking-widest text-stone-700 uppercase">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
              <h2 className="text-lg font-black text-stone-950">
                ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
              </h2>
              <h3 className="text-base font-bold text-stone-900">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ವಲಯ - 577301
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                ದೂರವಾಣಿ: 08282-266133 | ಇ-ಮೇಲ್: beo.bhadravathi@karnataka.gov.in
              </p>
            </div>

            {/* Reference Line - strictly using "ಸಂ:" as requested */}
            <div className="flex justify-between items-center text-xs font-bold pt-1 border-b border-stone-200 pb-2">
              <div className="font-mono text-stone-950">
                {orderNumber}
              </div>
              <div className="text-stone-800">
                ದಿನಾಂಕ: {orderDate}
              </div>
            </div>

            {/* Subject, Reference, Preamble */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="text-center font-black text-base py-1 underline decoration-2">
                :: ಕಛೇರಿ ಆದೇಶ ::
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 font-bold text-stone-900">ವಿಷಯ:</div>
                <div className="col-span-10 font-bold text-stone-950">
                  ದಿನಾಂಕ: {selectedMonth === 'January' ? `01-01-${selectedYear}` : `01-07-${selectedYear}`} ರ {selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'} ಮಾಹೆಯಲ್ಲಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.
                </div>

                <div className="col-span-2 font-bold text-stone-900">ಉಲ್ಲೇಖ:</div>
                <div className="col-span-10 text-stone-800 space-y-0.5">
                  <p>1. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) ನಿಯಮ 53.</p>
                  <p>2. ಕರ್ನಾಟಕ ಆರ್ಥಿಕ ಸಂಹಿತೆ (KFC) ಆರ್ಟಿಕಲ್ 79.</p>
                  <p>3. ಪ್ರಪತ್ರ - 28 ರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಪ್ರಮಾಣ ಪತ್ರ ದಿನಾಂಕ: {orderDate}.</p>
                  <p>4. ಸಂಬಂಧಪಟ್ಟ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರು ಸಲ್ಲಿಸಿರುವ ನೌಕರರ ಸೇವಾ ದಾಖಲೆಗಳು ಹಾಗೂ ವರದಿಗಳು.</p>
                </div>
              </div>

              {/* Preamble */}
              <div className="pt-2">
                <p className="font-bold underline mb-1">:: ಪ್ರಸ್ತಾವನೆ ::</p>
                <p className="text-justify indent-8 text-stone-800">
                  ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿರುವ ಈ ಕೆಳಕಂಡ ನೌಕರರು ದಿನಾಂಕ: {selectedMonth === 'January' ? `01-01-${selectedYear}` : `01-07-${selectedYear}`} ಕ್ಕೆ ಒಂದು ವರ್ಷದ ತೃಪ್ತಿಕರ ನಿರಂತರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುತ್ತಾರೆ. ಉಲ್ಲೇಖಿತ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆಯಂತೆ ಸದರಿ ನೌಕರರ ಮೇಲೆ ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲ ಹಾಗೂ ವೇತನ ಬಡ್ತಿಯನ್ನು ತಡೆಹಿಡಿಯುವ ದಂಡನೆಗಳು ಇರುವುದಿಲ್ಲ. ಆದ್ದರಿಂದ ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮ 53 ರನ್ವಯ ಅರ್ಹ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಪ್ರಸ್ತಾವನೆಯನ್ನು ಪುರಸ್ಕರಿಸಿ ಈ ಕೆಳಗಿನಂತೆ ಆದೇಶಿಸಿದೆ.
                </p>
              </div>

              {/* Order Execution */}
              <div className="pt-2">
                <p className="font-bold underline mb-1">:: ಆದೇಶ ::</p>
                <p className="text-justify indent-8 text-stone-900 font-medium">
                  ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು ನಿಯಮ 53 ರ ಪ್ರಕಾರ ಭದ್ರಾವತಿ ವಲಯದ ಈ ಕೆಳಕಂಡ ನೌಕರರಿಗೆ ಅವರ ಹೆಸರಿನ ಮುಂದೆ ನಮೂದಿಸಿರುವಂತೆ ದಿನಾಂಕ: {selectedMonth === 'January' ? `01-01-${selectedYear}` : `01-07-${selectedYear}`} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.
                </p>
              </div>

              {/* Employees Table in Office Order */}
              <div className="pt-2 overflow-x-auto">
                <table className="w-full border-collapse border border-stone-800 text-[11px]">
                  <thead>
                    <tr className="bg-stone-100 text-stone-900 text-center font-bold">
                      <th className="border border-stone-800 px-2 py-1.5 w-10">ಕ್ರ.ಸಂ.</th>
                      <th className="border border-stone-800 px-2 py-1.5 text-left">ನೌಕರರ ಹೆಸರು & KGID</th>
                      <th className="border border-stone-800 px-2 py-1.5 text-left">ಹುದ್ದೆ & ಶಾಲೆ/ಕಛೇರಿ</th>
                      <th className="border border-stone-800 px-2 py-1.5">ಹಾಲಿ ಮೂಲ ವೇತನ (₹)</th>
                      <th className="border border-stone-800 px-2 py-1.5">ಮಂಜೂರಾದ ಬಡ್ತಿ (₹)</th>
                      <th className="border border-stone-800 px-2 py-1.5">ಹೊಸ ಮೂಲ ವೇತನ (₹)</th>
                      <th className="border border-stone-800 px-2 py-1.5">ಜಾರಿಯ ದಿನಾಂಕ</th>
                      <th className="border border-stone-800 px-2 py-1.5">ಮುಂದಿನ ಬಡ್ತಿ ದಿನಾಂಕ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSelectedRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td className="border border-stone-800 px-2 py-1.5 text-center font-bold">
                          {toKannadaDigits(idx + 1)}
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5">
                          <div className="font-bold">{row.fullName}</div>
                          <div className="text-[10px] text-stone-600 font-mono">KGID: {row.kgidNumber}</div>
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5">
                          <div>{row.designation}</div>
                          <div className="text-[10px] text-stone-600">{row.placeOfWork}</div>
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5 text-right font-mono font-semibold">
                          ₹ {row.presentBasicPay.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5 text-right font-mono font-bold text-emerald-800">
                          +₹ {row.incrementRate.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5 text-right font-mono font-black text-sky-950 bg-stone-50">
                          ₹ {row.newBasicPay.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5 text-center font-medium">
                          {row.effectiveDate}
                        </td>
                        <td className="border border-stone-800 px-2 py-1.5 text-center font-medium">
                          {row.nextIncrementDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conditions */}
              <div className="pt-3 space-y-1 text-stone-800">
                <p className="font-bold underline">:: ಷರತ್ತುಗಳು ::</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>ಸದರಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ತಪ್ಪದೇ ದಾಖಲಿಸುವುದು.</li>
                  <li>ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಸದರಿ ಅವಧಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಯಾವುದೇ ಅನಧಿಕೃತ ಗೈರುಹಾಜರಿ ಅಥವಾ ದಂಡನೆ ಕಂಡುಬಂದಲ್ಲಿ ಮಂಜೂರಾದ ಬಡ್ತಿ ಹಣವನ್ನು ವಸೂಲಿ ಮಾಡಲು ನೌಕರರು ಬದ್ಧರಾಗಿರುತ್ತಾರೆ.</li>
                  <li>ಸಂಬಂಧಪಟ್ಟ ಶಾಲಾ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಖಜಾನೆ-2 ತಂತ್ರಾಂಶದಲ್ಲಿ (HRMS / Khajane-2) ಈ ಆದೇಶದಂತೆ ವೇತನ ನವೀಕರಿಸಿ ಬಿಲ್ಲು ಸಲ್ಲಿಸಲು ಸೂಚಿಸಿದೆ.</li>
                </ol>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between items-end">
                <div className="text-left space-y-1">
                  <p className="font-bold text-stone-900">ಪ್ರತಿಗಳನ್ನು ರವಾನಿಸಲಾಗಿದೆ:</p>
                  <p className="text-[11px] text-stone-700">1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ & ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮಾಹಿತಿಗಾಗಿ ಹಾಗೂ ಅಗತ್ಯ ಕ್ರಮಕ್ಕಾಗಿ.</p>
                  <p className="text-[11px] text-stone-700">2. ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಇವರಿಗೆ ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.</p>
                  <p className="text-[11px] text-stone-700">3. ಕಛೇರಿಯ ಆದೇಶಗಳ ಕಡತಕ್ಕೆ / ಸ್ಥಾಪನಾ ಶಾಖೆಗೆ.</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-10"></div>
                  <p className="font-black text-stone-950 text-sm">({ddoOfficer.name})</p>
                  <p className="text-xs font-bold text-stone-800">{ddoOfficer.designation}</p>
                  <p className="text-xs text-stone-700">{ddoOfficer.office}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: EMPLOYEE ROSTER SELECTION ===================== */}
      {activeSubTab === 'employeeSelect' && (
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-950" />
                ಪ್ರಪತ್ರ-28 ಕ್ಕೆ ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Employee Selection Roster)
              </h3>
              <p className="text-xs text-stone-500">
                ಒಟ್ಟು ನೌಕರರು: <strong>{baseRows.length}</strong> | ಪ್ರಸ್ತುತ ಆಯ್ಕೆಯಾಗಿರುವವರು: <strong>{activeSelectedRows.length}</strong>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-bold text-sky-950 bg-sky-50 hover:bg-sky-100 rounded-md border border-sky-200 cursor-pointer"
              >
                ಎಲ್ಲರನ್ನೂ ಆಯ್ಕೆಮಾಡಿ (Select All)
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md cursor-pointer"
              >
                ಆಯ್ಕೆ ರದ್ದುಮಾಡಿ (Clear All)
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ಹೆಸರು, ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ, ಹುದ್ದೆ ಅಥವಾ ಶಾಲೆಯ ಹೆಸರು ಹುಡುಕಿ..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:border-sky-950 focus:outline-hidden"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterDueOnly}
                onChange={e => setFilterDueOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sky-950 focus:ring-sky-900 cursor-pointer"
              />
              <span>ಕೇವಲ {selectedMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'} ತಿಂಗಳಿನ ನೌಕರರನ್ನು ಮಾತ್ರ ತೋರಿಸು</span>
            </label>
          </div>

          {/* Employees Selection Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-stone-100 text-stone-800 font-bold sticky top-0 border-b border-stone-200 z-10">
                <tr>
                  <th className="p-3 w-12 text-center">ಆಯ್ಕೆ</th>
                  <th className="p-3">ನೌಕರರ ಹೆಸರು & KGID</th>
                  <th className="p-3">ಹುದ್ದೆ & ಶಾಲೆ/ಕಚೇರಿ</th>
                  <th className="p-3">ವೇತನ ಬಡ್ತಿ ತಿಂಗಳು</th>
                  <th className="p-3 text-right">ಹಾಲಿ ವೇತನ (₹)</th>
                  <th className="p-3 text-right">ಬಡ್ತಿ ಮೊತ್ತ (₹)</th>
                  <th className="p-3 text-right">ಹೊಸ ವೇತನ (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredRows.map(row => {
                  const isChecked = selectedEmployeeIds.has(row.id);
                  const emp = employees.find(e => e.id === row.id);
                  const isMatchingMonth = emp?.incrementMonth === selectedMonth;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => toggleSelect(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by row click
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900">{row.fullName}</div>
                        <div className="text-[11px] text-stone-500 font-mono">KGID: {row.kgidNumber}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-stone-800">{row.designation}</div>
                        <div className="text-[11px] text-stone-500">{row.placeOfWork}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isMatchingMonth
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {emp?.incrementMonth ? (emp.incrementMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ') : 'ಮಾಹೆ ನಿಗದಿಪಡಿಸಿಲ್ಲ'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-stone-900">
                        ₹ {row.presentBasicPay.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        +₹ {row.incrementRate.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-sky-950">
                        ₹ {row.newBasicPay.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500 italic">
                      ಯಾವುದೇ ನೌಕರರು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ (No matching employees found).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveSubTab('form28')}
              className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              ಪ್ರಪತ್ರ-28 ವೀಕ್ಷಿಸಿ &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ===================== VIEW 4: SALARY PROJECTION & BUDGET DEMAND ===================== */}
      {activeSubTab === 'budgetDemand' && (
        <SalaryProjectionView
          employees={employees}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}
    </div>
  );
};
