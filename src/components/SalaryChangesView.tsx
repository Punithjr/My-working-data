import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpRight, 
  Clock, 
  User, 
  FileText,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { SalaryHistoryRecord, AdminAuthUser, Employee } from '../types';
import { SalaryProjectionView } from './SalaryProjectionView';

interface SalaryChangesViewProps {
  currentUser: AdminAuthUser | null;
  employees?: Employee[];
  onOpenOrderForEmployee?: (kgid: string) => void;
  showToast?: (msg: string) => void;
}

export const SalaryChangesView: React.FC<SalaryChangesViewProps> = ({
  currentUser,
  employees = [],
  onOpenOrderForEmployee,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'projection'>('projection');
  const [records, setRecords] = useState<SalaryHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kgidFilter, setKgidFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url = kgidFilter.trim() 
        ? `/api/memorandum/salary-history?kgid=${encodeURIComponent(kgidFilter.trim())}` 
        : '/api/memorandum/salary-history';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.salaryHistory || []);
      }
    } catch (err) {
      console.error('Failed to fetch salary history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [kgidFilter]);

  const filteredRecords = records.filter(r => {
    if (typeFilter !== 'All' && !r.orderType.includes(typeFilter)) return false;
    return true;
  });

  // Calculate quick metrics
  const totalIncrementsProcessed = records.length;
  const totalFinancialAddition = records.reduce((sum, r) => sum + (r.increment || 0), 0);
  const averageIncrement = totalIncrementsProcessed > 0 ? Math.round(totalFinancialAddition / totalIncrementsProcessed) : 0;

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['ದಿನಾಂಕ (Date)', 'ನೌಕರರ ಹೆಸರು (Name)', 'ಕೆಜಿಐಡಿ (KGID)', 'ಆದೇಶ ಪ್ರಕಾರ (Order Type)', 'ಆದೇಶ ಸಂಖ್ಯೆ (Order No)', 'ಹಿಂದಿನ ವೇತನ (Old Pay)', 'ಬಡ್ತಿ (Increment)', 'ಪರಿಷ್ಕೃತ ವೇತನ (New Pay)', 'ಜಾರಿಗೆ ದಿನಾಂಕ (Effective Date)', 'ಷರಾ (Remarks)'];
    const rows = filteredRecords.map(r => [
      r.date,
      `"${r.employeeName}"`,
      r.kgidNumber,
      `"${r.orderType}"`,
      r.orderNumber,
      r.oldBasicPay,
      r.increment,
      r.newBasicPay,
      r.effectiveDate,
      `"${r.remarks || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Karnataka_Govt_Salary_Changes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Subtabs: Projection vs History */}
      <div className="bg-white rounded-xl border-2 border-stone-300 p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('projection')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-kannada border-2 ${
              activeTab === 'projection'
                ? 'bg-[#2b2b2b] text-amber-400 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>1. ವಾರ್ಷಿಕ ವೇತನ ಪ್ರಕ್ಷೇಪಣೆ & ಅನುದಾನ ಬೇಡಿಕೆ (Salary Projection)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-kannada border-2 ${
              activeTab === 'history'
                ? 'bg-[#2b2b2b] text-amber-400 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>2. ವೇತನ ಬದಲಾವಣೆಗಳ ಇತಿಹಾಸ (Increment History)</span>
          </button>
        </div>
      </div>

      {activeTab === 'projection' ? (
        <SalaryProjectionView
          employees={employees}
          currentUser={currentUser}
          showToast={showToast}
        />
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-900 text-emerald-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded">
                  ಆಡಿಟ್ & ವೇತನ ಶಾಖೆ • ದಾಖಲಾತಿ
                </span>
                <span className="text-xs text-stone-500">ವೇತನ ಬದಲಾವಣೆಗಳ ಅಧಿಕೃತ ಇತಿಹಾಸ</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-1 font-sans">
                ವೇತನ ಬದಲಾವಣೆ ಇತಿಹಾಸ (Salary Progression & History)
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                ಜ್ಞಾಪನಾ ಆದೇಶಗಳ ಅನ್ವಯ ಮಂಜೂರಾದ ವೇತನ ಬಡ್ತಿಗಳ ಲೆಕ್ಕ ಪರಿಶೋಧನೆ, ಹಂತಗಳ ಪರಿಷ್ಕರಣೆ ಹಾಗೂ ಎಚ್‌ಆರ್‌ಎಂಎಸ್ ಹೊಂದಾಣಿಕೆ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenOrderForEmployee && (
              <button
                type="button"
                id="btn-generate-salary-order"
                onClick={() => onOpenOrderForEmployee('')}
                className="px-3.5 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded border border-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm font-kannada"
                title="ಹೊಸ ವೇತನ ಪರಿಷ್ಕರಣೆ ಅಥವಾ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಆದೇಶ ಸೃಜಿಸಿ"
              >
                <Sparkles className="w-4 h-4 text-stone-900" />
                <span>ಆದೇಶ ಹೊರಡಿಸಿ (Issue Order)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredRecords.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>CSV ಎಕ್ಸ್‌ಪೋರ್ಟ್</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-sky-950 hover:bg-sky-900 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ವರದಿ ಮುದ್ರಿಸಿ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            ಒಟ್ಟು ವೇತನ ಬಡ್ತಿ ಆದೇಶಗಳು
          </span>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            {totalIncrementsProcessed}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">ದಾಖಲಾದ ಅಧಿಕೃತ ವೇತನ ಬದಲಾವಣೆಗಳು</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            ಮಾಸಿಕ ಒಟ್ಟು ಬಡ್ತಿ ಮೊತ್ತ
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            + ₹{totalFinancialAddition.toLocaleString('en-IN')}/-
          </div>
          <span className="text-[11px] text-emerald-900 mt-0.5 block">ಒಟ್ಟು ಮಾಸಿಕ ಆರ್ಥಿಕ ಹೊರೆ</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 block">
            ಸರಾಸರಿ ವೇತನ ಬಡ್ತಿ ಮೊತ್ತ
          </span>
          <div className="text-2xl font-bold text-sky-950 mt-1 font-mono">
            ₹{averageIncrement.toLocaleString('en-IN')}/-
          </div>
          <span className="text-[11px] text-sky-800 mt-0.5 block">ಪ್ರತಿ ನೌಕರರಿಗೆ ಸರಾಸರಿ ಪರಿಷ್ಕರಣೆ</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={kgidFilter}
            onChange={(e) => setKgidFilter(e.target.value)}
            placeholder="ನಿರ್ದಿಷ್ಟ ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ ಹುಡುಕಿ..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded focus:border-sky-950 focus:ring-1 focus:ring-sky-950 outline-none font-mono"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-stone-300 rounded px-3 py-2 bg-white text-stone-800 outline-none"
          >
            <option value="All">ಎಲ್ಲಾ ಬಡ್ತಿ ಪ್ರಕಾರಗಳು</option>
            <option value="10 ವರ್ಷ">10 ವರ್ಷದ ಕಾಲಮಿತಿ</option>
            <option value="15 ವರ್ಷ">15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ</option>
            <option value="20 ವರ್ಷ">20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ</option>
            <option value="25 ವರ್ಷ">25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ</option>
            <option value="30 ವರ್ಷ">30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ದಿನಾಂಕ & ಆದೇಶ ಸಂಖ್ಯೆ</th>
                <th className="py-3 px-4">ನೌಕರರ ವಿವರ (KGID)</th>
                <th className="py-3 px-4">ಆದೇಶ ಪ್ರಕಾರ</th>
                <th className="py-3 px-4">ಹಿಂದಿನ ಮೂಲ ವೇತನ</th>
                <th className="py-3 px-4">ಮಂಜೂರಾದ ಬಡ್ತಿ</th>
                <th className="py-3 px-4">ಪರಿಷ್ಕೃತ ನೂತನ ವೇತನ</th>
                <th className="py-3 px-4">ಜಾರಿಗೆ ದಿನಾಂಕ</th>
                <th className="py-3 px-4">ದಾಖಲಿಸಿದವರು</th>
                <th className="py-3 px-4 text-center">ಕ್ರಮ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-500 font-kannada">
                    ಯಾವುದೇ ವೇತನ ಬದಲಾವಣೆ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sky-950 block">{r.orderNumber}</span>
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {r.date}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block">{r.employeeName}</span>
                      <span className="text-[11px] font-mono text-stone-600">KGID: {r.kgidNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                        {r.orderType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      ₹{r.oldBasicPay.toLocaleString('en-IN')}/-
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                      + ₹{r.increment.toLocaleString('en-IN')}/-
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-950 text-sm">
                      ₹{r.newBasicPay.toLocaleString('en-IN')}/-
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-800">
                      {r.effectiveDate}
                    </td>
                    <td className="py-3 px-4 text-stone-600 text-[11px]">
                      {r.changedBy}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onOpenOrderForEmployee && (
                        <button
                          type="button"
                          onClick={() => onOpenOrderForEmployee(r.kgidNumber)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer font-kannada"
                          title="ಈ ನೌಕರರಿಗೆ ಆದೇಶ ಸೃಜಿಸಿ"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>ಆದೇಶ ಸೃಜಿಸಿ</span>
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
    </>
  )}
</div>
  );
};
