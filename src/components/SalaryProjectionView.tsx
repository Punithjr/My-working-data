import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Building2,
  Info
} from 'lucide-react';
import { Employee, AdminAuthUser } from '../types';
import {
  prepareSalaryGrantDemandData,
  exportGrantDemandToExcel,
  exportGrantDemandToCsv,
  SalaryGrantDemandRow,
  toKannadaDigits
} from '../utils/prapathra28Utils';
import { formatCurrency } from '../utils/formatters';

interface SalaryProjectionViewProps {
  employees: Employee[];
  currentUser: AdminAuthUser | null;
  showToast?: (msg: string) => void;
  onClose?: () => void;
}

export const SalaryProjectionView: React.FC<SalaryProjectionViewProps> = ({
  employees = [],
  currentUser,
  showToast,
  onClose
}) => {
  const [financialYear, setFinancialYear] = useState<string>('2026-2027');
  const [daPercent, setDaPercent] = useState<number>(50);
  const [hraPercent, setHraPercent] = useState<number>(8);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<'All' | 'January' | 'July'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);

  // Compute 12-month Grant Demand Rows
  const allRows: SalaryGrantDemandRow[] = useMemo(() => {
    return prepareSalaryGrantDemandData(employees, daPercent, hraPercent);
  }, [employees, daPercent, hraPercent]);

  // Filtered rows based on selected increment month and search query
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      if (selectedMonthFilter !== 'All' && row.incrementMonth !== selectedMonthFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.fullName.toLowerCase().includes(q) ||
        row.kgidNumber.toLowerCase().includes(q) ||
        row.designation.toLowerCase().includes(q) ||
        row.placeOfWork.toLowerCase().includes(q)
      );
    });
  }, [allRows, selectedMonthFilter, searchQuery]);

  // Aggregate Statistics & Financial Impact
  const summary = useMemo(() => {
    const totalCount = allRows.length;
    const janRows = allRows.filter(r => r.incrementMonth === 'January');
    const julyRows = allRows.filter(r => r.incrementMonth === 'July');

    const totalBasic = allRows.reduce((sum, r) => sum + r.annualBasicPay, 0);
    const totalDa = allRows.reduce((sum, r) => sum + r.annualDa, 0);
    const totalHra = allRows.reduce((sum, r) => sum + r.annualHra, 0);
    const totalMedical = allRows.reduce((sum, r) => sum + r.annualMedical, 0);
    const totalGross = allRows.reduce((sum, r) => sum + r.annualGrossDemand, 0);

    const janGross = janRows.reduce((sum, r) => sum + r.annualGrossDemand, 0);
    const julyGross = julyRows.reduce((sum, r) => sum + r.annualGrossDemand, 0);

    // Baseline calculation without increments (12 months at current basic pay + allowances)
    const baselineBasic = allRows.reduce((sum, r) => sum + (r.currentBasicPay * 12), 0);
    const baselineGross = baselineBasic + 
      Math.round(baselineBasic * (daPercent / 100)) + 
      Math.round(baselineBasic * (hraPercent / 100)) + 
      (totalCount * 2400);

    const netFinancialImpact = Math.max(0, totalGross - baselineGross);

    return {
      totalCount,
      janCount: janRows.length,
      julyCount: julyRows.length,
      totalBasic,
      totalDa,
      totalHra,
      totalMedical,
      totalGross,
      janGross,
      julyGross,
      baselineGross,
      netFinancialImpact
    };
  }, [allRows, daPercent, hraPercent]);

  // Filtered totals
  const filteredTotals = useMemo(() => {
    const totalBasic = filteredRows.reduce((sum, r) => sum + r.annualBasicPay, 0);
    const totalDa = filteredRows.reduce((sum, r) => sum + r.annualDa, 0);
    const totalHra = filteredRows.reduce((sum, r) => sum + r.annualHra, 0);
    const totalGross = filteredRows.reduce((sum, r) => sum + r.annualGrossDemand, 0);
    return { totalBasic, totalDa, totalHra, totalGross };
  }, [filteredRows]);

  // Export handlers
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      showToast?.('ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.');
      return;
    }
    exportGrantDemandToCsv(filteredRows, financialYear);
    showToast?.(`ವಾರ್ಷಿಕ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ CSV ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (${financialYear})`);
    setIsDownloadMenuOpen(false);
  };

  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      showToast?.('ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.');
      return;
    }
    exportGrantDemandToExcel(filteredRows, financialYear);
    showToast?.(`ವಾರ್ಷಿಕ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ Excel ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (${financialYear})`);
    setIsDownloadMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Strategic Overview */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 border-3 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 rounded-md text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ವೇತನ ಪ್ರಕ್ಷೇಪಣೆ & ಅನುದಾನ ಬೇಡಿಕೆ (Salary Projection Module)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-kannada flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-amber-300" />
              <span>ಮುಂದಿನ ಆರ್ಥಿಕ ವರ್ಷದ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ ಅಂದಾಜು ({financialYear})</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed font-kannada">
              ಜನವರಿ ಹಾಗೂ ಜುಲೈ ಮಾಹೆಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಚಕ್ರಗಳ (Increment Cycles) ಆರ್ಥಿಕ ಪ್ರಭಾವದ ನಿಖರ ಲೆಕ್ಕಾಚಾರ: 
              <strong className="text-amber-300 ml-1">ಜನವರಿ ಬಡ್ತಿ:</strong> ಮಾರ್ಚ್-ಡಿಸೆಂಬರ್ (9 ತಿಂಗಳು) + ಮುಂದಿನ ಜನವರಿ-ಮಾರ್ಚ್ (3 ತಿಂಗಳು) | 
              <strong className="text-amber-300 ml-1">ಜುಲೈ ಬಡ್ತಿ:</strong> ಮಾರ್ಚ್-ಜೂನ್ (3 ತಿಂಗಳು ಹಾಲಿ ವೇತನ) + ಜುಲೈ-ಮಾರ್ಚ್ (9 ತಿಂಗಳು ಬಡ್ತಿ ವೇತನ).
            </p>
          </div>

          {/* Quick Action Buttons: Download Report & Print */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Download Report Dropdown */}
            <div className="relative">
              <button
                id="btn-salary-projection-download"
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 border-2 border-slate-950 shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-y-0.5"
                title="Download Report (CSV, Excel, PDF)"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>ವರದಿ ಡೌನ್‌ಲೋಡ್ (Download Report)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
              </button>

              {isDownloadMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-slate-800 py-2 z-50 text-slate-900 divide-y divide-slate-100 font-kannada animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase">
                    ದಾಖಲೆ ಮಾದರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer text-slate-800"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>CSV ಕಡತ (.csv)</div>
                      <div className="text-[10px] text-slate-500 font-normal">ಕಛೇರಿ ದಾಖಲೆಗಳು & ಸಾಫ್ಟ್‌ವೇರ್ ಆಮದುಗಾಗಿ</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer text-slate-800"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Excel ಸ್ಪ್ರೆಡ್‌ಶೀಟ್ (.xlsx)</div>
                      <div className="text-[10px] text-slate-500 font-normal">ಪೂರ್ಣ ಸೂತ್ರಗಳು & ಕಲಮ್‌ಗಳೊಂದಿಗೆ</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsDownloadMenuOpen(false);
                      setIsPrintModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-sky-50 flex items-center gap-2.5 cursor-pointer text-slate-800"
                  >
                    <Printer className="w-4 h-4 text-sky-600" />
                    <div>
                      <div>ಅಧಿಕೃತ PDF / A4 ಮುದ್ರಣ</div>
                      <div className="text-[10px] text-slate-500 font-normal">ಸರ್ಕಾರಿ ಜ್ಞಾಪನ ಪತ್ರ ಮಾದರಿಯಲ್ಲಿ</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-stone-100 text-slate-900 rounded-xl font-bold text-xs flex items-center gap-2 border-2 border-slate-950 shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-y-0.5"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>A4 ಮುದ್ರಣ ನೋಟ (Print Preview)</span>
            </button>
          </div>
        </div>

        {/* Financial Year & Statutory Allowance Sliders / Selectors */}
        <div className="mt-6 pt-5 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">ಆರ್ಥಿಕ ವರ್ಷ (Financial Year):</span>
            <select
              value={financialYear}
              onChange={e => setFinancialYear(e.target.value)}
              className="bg-emerald-950 text-amber-300 font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-600 focus:outline-none"
            >
              <option value="2025-2026">2025-26 (2025-2026)</option>
              <option value="2026-2027">2026-27 (2026-2027)</option>
              <option value="2027-2028">2027-28 (2027-2028)</option>
            </select>
          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">ಅಂದಾಜು ತುಟ್ಟಿಭತ್ಯೆ (DA %):</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={daPercent}
                onChange={e => setDaPercent(Math.max(0, Number(e.target.value)))}
                className="w-16 bg-emerald-950 text-white font-mono text-center font-bold text-xs px-2 py-1.5 rounded-lg border border-emerald-600 focus:outline-none"
              />
              <span className="text-xs text-emerald-300 font-bold">%</span>
            </div>
          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">ಮನೆ ಬಾಡಿಗೆ ಭತ್ಯೆ (HRA %):</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                value={hraPercent}
                onChange={e => setHraPercent(Math.max(0, Number(e.target.value)))}
                className="w-16 bg-emerald-950 text-white font-mono text-center font-bold text-xs px-2 py-1.5 rounded-lg border border-emerald-600 focus:outline-none"
              />
              <span className="text-xs text-emerald-300 font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards: Financial Impact & Budget Demands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Total Annual Grant Demand */}
        <div className="bg-white rounded-2xl border-3 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 font-kannada">
            <span>ಒಟ್ಟು ವಾರ್ಷಿಕ ಅನುದಾನ ಬೇಡಿಕೆ</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900">
            {formatCurrency(summary.totalGross)}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-kannada flex items-center justify-between border-t border-stone-100 pt-2">
            <span>ನೌಕರರ ಸಂಖ್ಯೆ: <strong>{summary.totalCount}</strong></span>
            <span className="text-emerald-700 font-bold">12 ತಿಂಗಳ ಅಂದಾಜು</span>
          </div>
        </div>

        {/* January Cycle Demand */}
        <div className="bg-amber-50/70 rounded-2xl border-3 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 font-kannada">
            <span>ಜನವರಿ ಬಡ್ತಿ ಚಕ್ರ (9 + 3 ತಿಂಗಳು)</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-950">
            {formatCurrency(summary.janGross)}
          </div>
          <div className="mt-2 text-[11px] text-amber-800 font-kannada flex items-center justify-between border-t border-amber-200/60 pt-2">
            <span>ನೌಕರರು: <strong>{summary.janCount}</strong></span>
            <span className="font-bold">9 ತಿಂಗಳು P1 + 3 ತಿಂಗಳು P2</span>
          </div>
        </div>

        {/* July Cycle Demand */}
        <div className="bg-sky-50/70 rounded-2xl border-3 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-sky-900 font-kannada">
            <span>ಜುಲೈ ಬಡ್ತಿ ಚಕ್ರ (3 + 9 ತಿಂಗಳು)</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-sky-950">
            {formatCurrency(summary.julyGross)}
          </div>
          <div className="mt-2 text-[11px] text-sky-800 font-kannada flex items-center justify-between border-t border-sky-200/60 pt-2">
            <span>ನೌಕರರು: <strong>{summary.julyCount}</strong></span>
            <span className="font-bold">3 ತಿಂಗಳು P0 + 9 ತಿಂಗಳು P1</span>
          </div>
        </div>

        {/* Net Financial Impact due to Increments */}
        <div className="bg-emerald-50 rounded-2xl border-3 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] p-5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 font-kannada">
            <span>ಬಡ್ತಿಗಳಿಂದ ಹೆಚ್ಚುವರಿ ಆರ್ಥಿಕ ಹೊರೆ</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-950">
            +{formatCurrency(summary.netFinancialImpact)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-kannada flex items-center justify-between border-t border-emerald-200/60 pt-2">
            <span>ಹಾಲಿ ಮೂಲ ವೇತನಕ್ಕಿಂತ ವ್ಯತ್ಯಾಸ</span>
            <span className="font-bold text-emerald-700">Financial Impact</span>
          </div>
        </div>
      </div>

      {/* Allowance Breakdown Bar */}
      <div className="bg-white rounded-xl border-2 border-stone-300 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-kannada text-stone-700 no-print">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-stone-900">ಅನುದಾನ ಉಪಶೀರ್ಷಿಕೆವಾರು ವಿಭಜನೆ (Object Head Breakdown):</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">ಮೂಲ ವೇತನ (01 Basic):</span>
            <span className="font-bold text-stone-900">{formatCurrency(summary.totalBasic)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">ತುಟ್ಟಿಭತ್ಯೆ (02 DA):</span>
            <span className="font-bold text-stone-900">{formatCurrency(summary.totalDa)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">ಮನೆ ಬಾಡಿಗೆ ಭತ್ಯೆ (03 HRA):</span>
            <span className="font-bold text-stone-900">{formatCurrency(summary.totalHra)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">ವೈದ್ಯಕೀಯ ಭತ್ಯೆ (Medical):</span>
            <span className="font-bold text-stone-900">{formatCurrency(summary.totalMedical)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border-3 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        {/* Month Filter Toggle Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-stone-600 font-kannada shrink-0">ಬಡ್ತಿ ಮಾಹೆ:</span>
          <button
            onClick={() => setSelectedMonthFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] transition-all cursor-pointer font-kannada ${
              selectedMonthFilter === 'All'
                ? 'bg-[#2b2b2b] text-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-50'
            }`}
          >
            ಎಲ್ಲಾ ({summary.totalCount})
          </button>
          <button
            onClick={() => setSelectedMonthFilter('January')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] transition-all cursor-pointer font-kannada ${
              selectedMonthFilter === 'January'
                ? 'bg-[#2b2b2b] text-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-50'
            }`}
          >
            ಜನವರಿ ಬಡ್ತಿ ಮಾತ್ರ ({summary.janCount})
          </button>
          <button
            onClick={() => setSelectedMonthFilter('July')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] transition-all cursor-pointer font-kannada ${
              selectedMonthFilter === 'July'
                ? 'bg-[#2b2b2b] text-amber-400 shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-50'
            }`}
          >
            ಜುಲೈ ಬಡ್ತಿ ಮಾತ್ರ ({summary.julyCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ಹೆಸರು, ಕೆಜಿಐಡಿ, ಹುದ್ದೆ ಅಥವಾ ಶಾಲೆಯ ಹೆಸರು ಹುಡುಕಿ..."
            className="w-full pl-9 pr-3 py-2 text-xs border-2 border-stone-300 rounded-lg focus:border-[#2b2b2b] focus:outline-none font-kannada"
          />
        </div>
      </div>

      {/* Primary Data Ledger Table */}
      <div className="bg-white rounded-xl border-3 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] overflow-hidden no-print">
        <div className="p-4 bg-stone-100 border-b-2 border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-stone-900 text-sm font-kannada">
              ವಾರ್ಷಿಕ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ ವಿವರ ಪಟ್ಟಿ (Annual Grant Demand Ledger)
            </h3>
            <span className="text-xs bg-amber-200 text-slate-900 font-bold px-2 py-0.5 rounded-md font-mono">
              {filteredRows.length} Records
            </span>
          </div>

          <div className="text-xs font-bold text-stone-700 font-kannada">
            ಆಯ್ಕೆಯಾದ ಬೇಡಿಕೆ ಮೊತ್ತ: <strong className="font-mono text-emerald-800 text-sm">{formatCurrency(filteredTotals.totalGross)}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#2b2b2b] text-amber-300 font-kannada sticky top-0 border-b-2 border-stone-800">
              <tr>
                <th className="p-3 text-center w-12">ಕ್ರ.ಸಂ.</th>
                <th className="p-3 min-w-[170px]">ನೌಕರರ ಹೆಸರು & KGID</th>
                <th className="p-3 min-w-[160px]">ಹುದ್ದೆ & ಶಾಲೆ</th>
                <th className="p-3 text-center min-w-[110px]">ಬಡ್ತಿ ಮಾಹೆ</th>
                <th className="p-3 text-right">ಹಾಲಿ ಮೂಲ ವೇತನ (₹)</th>
                <th className="p-3 text-right">ಬಡ್ತಿ ಹಂತ 1 (₹)</th>
                <th className="p-3 text-right">ಬಡ್ತಿ ಹಂತ 2 (₹)</th>
                <th className="p-3 min-w-[200px]">12 ತಿಂಗಳ ಲೆಕ್ಕಾಚಾರ ಸೂತ್ರ</th>
                <th className="p-3 text-right font-bold">ವಾರ್ಷಿಕ ಮೂಲ ವೇತನ (₹)</th>
                <th className="p-3 text-right">DA (50%)</th>
                <th className="p-3 text-right">HRA (8%)</th>
                <th className="p-3 text-right font-black text-amber-300 bg-black/30">ಒಟ್ಟು ಅನುದಾನ ಬೇಡಿಕೆ (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredRows.map((row, idx) => (
                <tr
                  key={`${row.id}-${idx}`}
                  className="hover:bg-amber-50/50 transition-colors"
                >
                  <td className="p-3 text-center font-mono text-stone-500 font-bold">
                    {idx + 1}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-stone-900 font-kannada">{row.fullName}</div>
                    <div className="text-[11px] font-mono text-stone-500 font-bold">KGID: {row.kgidNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-stone-800 font-kannada">{row.designation}</div>
                    <div className="text-[11px] text-stone-500 font-kannada">{row.placeOfWork}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-kannada ${
                        row.incrementMonth === 'January'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-sky-100 text-sky-900 border border-sky-300'
                      }`}
                    >
                      {row.incrementMonth === 'January' ? 'ಜನವರಿ (01-01)' : 'ಜುಲೈ (01-07)'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-stone-900">
                    ₹{row.currentBasicPay.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    ₹{row.stage1Pay.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-stone-600">
                    {row.stage2Pay ? `₹${row.stage2Pay.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="p-3 font-kannada text-[11px] text-stone-600 bg-stone-50/70">
                    {row.formulaDesc}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    ₹{row.annualBasicPay.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-stone-700">
                    ₹{row.annualDa.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-stone-700">
                    ₹{row.annualHra.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-emerald-950 bg-emerald-50">
                    ₹{row.annualGrossDemand.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-stone-500 font-kannada italic">
                    ಯಾವುದೇ ನೌಕರರ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-300 text-stone-900">
                <tr>
                  <td colSpan={8} className="p-3 text-right font-kannada text-xs">
                    ಒಟ್ಟು ಮೊತ್ತ (Total Amount):
                  </td>
                  <td className="p-3 text-right font-mono text-sm">
                    ₹{filteredTotals.totalBasic.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-xs">
                    ₹{filteredTotals.totalDa.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-xs">
                    ₹{filteredTotals.totalHra.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-sm font-black text-emerald-950 bg-emerald-100">
                    ₹{filteredTotals.totalGross.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Official Government Memorandum Print Modal (Formatted for Office Records) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border-4 border-stone-800 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b pb-4 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 font-kannada">
                  ಅಧಿಕೃತ ಕಛೇರಿ ಮುದ್ರಣ ಪ್ರತಿ (Official Office Records Formatted Print)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold font-kannada flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV ಡೌನ್‌ಲೋಡ್</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold font-kannada flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ಮುದ್ರಿಸಿ (Print A4)</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>

            {/* Official Memorandum Document Layout */}
            <div className="print-area p-8 bg-white text-stone-950 font-kannada text-xs space-y-6 leading-relaxed border border-stone-300 rounded-lg">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-stone-800 pb-4">
                <p className="font-bold text-xs uppercase tracking-wider">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
                <h2 className="text-lg font-black">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ</h2>
                <p className="text-[11px] text-stone-700">ತಾಲ್ಲೂಕು ಆಡಳಿತ ಸೌಧ, ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಭದ್ರಾವತಿ - 577301, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</p>
                <p className="text-[11px] font-mono font-bold mt-1">
                  ದೂರವಾಣಿ: 08282-266282 | ಇ-ಮೇಲ್: beo-bhd@karnataka.gov.in
                </p>
              </div>

              {/* Reference and Date */}
              <div className="flex justify-between items-center text-xs font-bold pt-1">
                <div>
                  ಸಂಖ್ಯೆ: BEO/BHD/ಅನುದಾನ-ಬೇಡಿಕೆ/{financialYear}/ಸಿಬ್ಬಂದಿ-1
                </div>
                <div>
                  ದಿನಾಂಕ: {new Date().toLocaleDateString('kn-IN')}
                </div>
              </div>

              {/* Subject */}
              <div className="bg-stone-50 p-3 rounded border border-stone-300 space-y-1">
                <p className="font-black">
                  ವಿಷಯ: {financialYear} ನೇ ಆರ್ಥಿಕ ವರ್ಷಕ್ಕೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಅನ್ವಯ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ ಅಂದಾಜು ಪಟ್ಟಿ ಸಲ್ಲಿಸುವ ಕುರಿತು.
                </p>
                <p className="text-[11px] text-stone-700">
                  ಉಲ್ಲೇಖ: ಸರ್ಕಾರದ ಅಧಿಸೂಚನೆ ಮತ್ತು ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಜನವರಿ ಮತ್ತು ಜುಲೈ ತಿಂಗಳ ವೇತನ ಬಡ್ತಿ ಲೆಕ್ಕಾಚಾರ.
                </p>
              </div>

              {/* Executive Summary Narrative */}
              <div>
                <p>
                  ಮೇಲ್ಕಂಡ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ನೌಕರರಿಗೆ {financialYear} ನೇ ಆರ್ಥಿಕ ವರ್ಷದಲ್ಲಿ 
                  ಅರ್ಹತೆಯನುಸಾರ ಜನವರಿ ಹಾಗೂ ಜುಲೈ ಮಾಹೆಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಅನ್ವಯಿಸಿ, ಮುಂದಿನ ಆರ್ಥಿಕ ವರ್ಷದ 12 ತಿಂಗಳ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.
                </p>
                <p className="mt-2 font-bold">
                  ಒಟ್ಟು ನೌಕರರ ಸಂಖ್ಯೆ: {summary.totalCount} | ಜನವರಿ ಬಡ್ತಿ ನೌಕರರು: {summary.janCount} | ಜುಲೈ ಬಡ್ತಿ ನೌಕರರು: {summary.julyCount} | 
                  ಒಟ್ಟು ವಾರ್ಷಿಕ ಅನುದಾನ ಬೇಡಿಕೆ: {formatCurrency(summary.totalGross)}
                </p>
              </div>

              {/* Official Table */}
              <div className="overflow-x-auto border border-stone-800">
                <table className="w-full text-[10px] text-left border-collapse border border-stone-800">
                  <thead className="bg-stone-100 font-bold border-b border-stone-800 text-stone-900">
                    <tr>
                      <th className="p-1.5 border-r border-stone-800 text-center">ಕ್ರ.ಸಂ.</th>
                      <th className="p-1.5 border-r border-stone-800">ನೌಕರರ ಹೆಸರು & ಹುದ್ದೆ</th>
                      <th className="p-1.5 border-r border-stone-800">KGID</th>
                      <th className="p-1.5 border-r border-stone-800 text-center">ಬಡ್ತಿ ಮಾಹೆ</th>
                      <th className="p-1.5 border-r border-stone-800 text-right">ಹಾಲಿ ಮೂಲ</th>
                      <th className="p-1.5 border-r border-stone-800 text-right">ಬಡ್ತಿ ವೇತನ</th>
                      <th className="p-1.5 border-r border-stone-800">12 ತಿಂಗಳ ಸೂತ್ರ</th>
                      <th className="p-1.5 border-r border-stone-800 text-right">ವಾರ್ಷಿಕ ಮೂಲ</th>
                      <th className="p-1.5 border-r border-stone-800 text-right">DA (50%)</th>
                      <th className="p-1.5 border-r border-stone-800 text-right">HRA (8%)</th>
                      <th className="p-1.5 text-right font-bold">ಒಟ್ಟು ಬೇಡಿಕೆ ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-400">
                    {filteredRows.map((r, i) => (
                      <tr key={`print-${r.id}-${i}`}>
                        <td className="p-1.5 border-r border-stone-800 text-center">{i + 1}</td>
                        <td className="p-1.5 border-r border-stone-800">
                          <span className="font-bold">{r.fullName}</span>, {r.designation}
                        </td>
                        <td className="p-1.5 border-r border-stone-800 font-mono">{r.kgidNumber}</td>
                        <td className="p-1.5 border-r border-stone-800 text-center">
                          {r.incrementMonth === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ'}
                        </td>
                        <td className="p-1.5 border-r border-stone-800 text-right font-mono">{r.currentBasicPay}</td>
                        <td className="p-1.5 border-r border-stone-800 text-right font-mono font-bold">{r.stage1Pay}</td>
                        <td className="p-1.5 border-r border-stone-800 text-[9px]">{r.formulaDesc}</td>
                        <td className="p-1.5 border-r border-stone-800 text-right font-mono font-bold">{r.annualBasicPay}</td>
                        <td className="p-1.5 border-r border-stone-800 text-right font-mono">{r.annualDa}</td>
                        <td className="p-1.5 border-r border-stone-800 text-right font-mono">{r.annualHra}</td>
                        <td className="p-1.5 text-right font-mono font-bold">{r.annualGrossDemand}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-800 text-stone-900">
                    <tr>
                      <td colSpan={7} className="p-2 text-right border-r border-stone-800">ಒಟ್ಟು ವಾರ್ಷಿಕ ಅನುದಾನ ಮೊತ್ತ:</td>
                      <td className="p-2 text-right border-r border-stone-800 font-mono">₹{filteredTotals.totalBasic.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right border-r border-stone-800 font-mono">₹{filteredTotals.totalDa.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right border-r border-stone-800 font-mono">₹{filteredTotals.totalHra.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-black text-emerald-950">₹{filteredTotals.totalGross.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Endorsements and Signature */}
              <div className="pt-8 flex justify-between items-end text-xs">
                <div className="space-y-1">
                  <p className="font-bold underline">ರವಾನೆ ಪ್ರತಿಗಳು:</p>
                  <p>1. ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ ಇವರಿಗೆ ಸಲ್ಲಿಸಿದೆ.</p>
                  <p>2. ಜಿಲ್ಲಾ ಖಜಾನಾಧಿಕಾರಿಗಳು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ ಇವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.</p>
                  <p>3. ಕಛೇರಿಯ ಆಯವ್ಯಯ ಮತ್ತು ಅನುದಾನ ಕಡತಕ್ಕೆ.</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="h-12"></div>
                  <p className="font-bold text-sm">(ಹೆಚ್. ರವಿಕುಮಾರ್)</p>
                  <p className="font-semibold">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ</p>
                  <p className="text-[11px] text-stone-600">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
