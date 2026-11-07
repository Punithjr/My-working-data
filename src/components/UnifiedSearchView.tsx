import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  FileText, 
  FolderGit2, 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Filter, 
  X,
  Sparkles
} from 'lucide-react';
import { Employee, MemorandumOrder, OrderFile, SalaryHistoryRecord } from '../types';

interface UnifiedSearchViewProps {
  onSelectEmployee?: (emp: Employee) => void;
  onViewOrder?: (orderNumber: string) => void;
  onSelectOrderTypeForKgid?: (kgid: string, orderType?: string) => void;
}

export const UnifiedSearchView: React.FC<UnifiedSearchViewProps> = ({
  onSelectEmployee,
  onViewOrder,
  onSelectOrderTypeForKgid,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<{
    employees: Employee[];
    orders: MemorandumOrder[];
    orderFiles: OrderFile[];
    salaryRecords: SalaryHistoryRecord[];
  }>({
    employees: [],
    orders: [],
    orderFiles: [],
    salaryRecords: [],
  });

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults({ employees: [], orders: [], orderFiles: [], salaryRecords: [] });
      return;
    }

    setIsLoading(true);
    try {
      const q = encodeURIComponent(searchTerm.trim());
      const [empRes, orderRes, filesRes, salRes] = await Promise.all([
        fetch(`/api/memorandum/employees?q=${q}`),
        fetch(`/api/memorandum/orders?q=${q}`),
        fetch(`/api/memorandum/order-files?q=${q}`),
        fetch(`/api/memorandum/salary-history?kgid=${q}`),
      ]);

      const empData = empRes.ok ? await empRes.json() : { employees: [] };
      const orderData = orderRes.ok ? await orderRes.json() : { orders: [] };
      const filesData = filesRes.ok ? await filesRes.json() : { files: [] };
      const salData = salRes.ok ? await salRes.json() : { salaryHistory: [] };

      setResults({
        employees: empData.employees || [],
        orders: orderData.orders || [],
        orderFiles: filesData.files || [],
        salaryRecords: salData.salaryHistory || [],
      });
    } catch (err) {
      console.error('Unified search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.employees.length + results.orders.length + results.orderFiles.length + results.salaryRecords.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-sky-950 text-sky-200 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 rounded">
                ಸಾರ್ವತ್ರಿಕ ಹುಡುಕಾಟ • Unified Search
              </span>
              <span className="text-xs text-stone-500">KGID, ಹೆಸರು, ಜ್ಞಾಪನ ಸಂಖ್ಯೆ, ಕಡತ ಐಡಿ</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mt-1 font-sans">
              ಇಲಾಖಾ ಸಮಗ್ರ ಹುಡುಕಾಟ (Department Unified Search Engine)
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              ನೌಕರರ ವಿವರಗಳು, ಆದೇಶಗಳ ಕಡತ, ವೇತನ ಬಡ್ತಿಗಳು ಹಾಗೂ ಕಛೇರಿ ಪತ್ರಗಳನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ತ್ವರಿತವಾಗಿ ಹುಡುಕಿ.
            </p>
          </div>
        </div>
      </div>

      {/* Large Search Input */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ಕೆಜಿಐಡಿ (KGID), ನೌಕರರ ಹೆಸರು, ಜ್ಞಾಪನ ಸಂಖ್ಯೆ (Order No), ಶಾಲೆ ಅಥವಾ ಕಡತ ಐಡಿ ನಮೂದಿಸಿ..."
            className="w-full pl-11 pr-24 py-3.5 text-sm border-2 border-stone-300 rounded-lg focus:border-sky-950 focus:ring-2 focus:ring-sky-950/20 outline-none font-medium"
            autoFocus
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-4" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-3.5 text-xs text-stone-400 hover:text-stone-700 px-2 py-1 bg-stone-100 rounded cursor-pointer"
            >
              ತೆರವುಗೊಳಿಸಿ
            </button>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 text-[11px]">ತ್ವರಿತ ಶೋಧನೆ:</span>
          {['108294', '240918', '319405', 'ಮಂಜುನಾಥ್', 'ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ', 'ಗಳಿಕೆ ರಜೆ', 'ಭದ್ರಾವತಿ'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-sky-100 text-stone-700 hover:text-sky-950 border border-stone-200 rounded text-xs transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {query.trim() && (
        <div className="flex items-center justify-between text-xs text-stone-600 px-1">
          <span>
            <strong>"{query}"</strong> ಗಾಗಿ ಒಟ್ಟು <strong>{totalResults}</strong> ಫಲಿತಾಂಶಗಳು ಲಭ್ಯವಾಗಿವೆ
          </span>
          {isLoading && <span className="text-sky-900 animate-pulse">ಹುಡುಕಲಾಗುತ್ತಿದೆ...</span>}
        </div>
      )}

      {/* RESULT SECTIONS */}
      {query.trim() && totalResults > 0 && (
        <div className="space-y-6">
          {/* 1. EMPLOYEES FOUND */}
          {results.employees.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-950" />
                  <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                    ನೌಕರರ ಮಾಹಿತಿ ({results.employees.length})
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-stone-200 text-xs">
                {results.employees.map((emp) => (
                  <div key={emp.id} className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{emp.fullName}</span>
                        <span className="font-mono text-sky-950 font-bold px-2 py-0.5 bg-sky-50 border border-sky-200 rounded text-[11px]">
                          KGID: {emp.kgidNumber}
                        </span>
                        <span className="text-stone-500 text-[11px]">{emp.cadreGroup}</span>
                      </div>
                      <div className="text-stone-600 mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                        <span>ಹುದ್ದೆ: <strong>{emp.designation}</strong></span>
                        <span>•</span>
                        <span>ಸ್ಥಳ: <strong>{emp.officeLocation}</strong></span>
                        <span>•</span>
                        <span>ಮೂಲ ವೇತನ: <strong className="font-mono text-emerald-800">₹{(emp.basicPay || 37900).toLocaleString('en-IN')}/-</strong></span>
                        <span>•</span>
                        <span>ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ: <strong className="font-mono">{emp.joiningDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectOrderTypeForKgid && (
                        <button
                          type="button"
                          onClick={() => onSelectOrderTypeForKgid(emp.kgidNumber)}
                          className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜಿಸಿ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onSelectEmployee && (
                        <button
                          type="button"
                          onClick={() => onSelectEmployee(emp)}
                          className="px-3 py-1.5 border border-stone-300 hover:bg-stone-100 rounded text-stone-700 text-xs font-medium cursor-pointer"
                        >
                          ವಿವರ ವೀಕ್ಷಿಸಿ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ORDERS FOUND */}
          {results.orders.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                    ಜ್ಞಾಪನಾ ಆದೇಶಗಳು ({results.orders.length})
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-stone-200 text-xs">
                {results.orders.map((ord) => (
                  <div key={ord.id} className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-950 text-xs">{ord.orderNumber}</span>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded border border-stone-200 text-[11px] font-medium">
                          {ord.orderType}
                        </span>
                      </div>
                      <div className="text-stone-600 mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                        <span>ನೌಕರರು: <strong>{ord.employeeName}</strong> (KGID: {ord.kgidNumber})</span>
                        <span>•</span>
                        <span>ದಿನಾಂಕ: <strong className="font-mono">{ord.orderDate}</strong></span>
                        <span>•</span>
                        <span>ಪರಿಷ್ಕೃತ ವೇತನ: <strong className="font-mono text-sky-950 font-bold">₹{ord.newBasicPay.toLocaleString('en-IN')}/-</strong></span>
                      </div>
                    </div>

                    {onViewOrder && (
                      <button
                        type="button"
                        onClick={() => onViewOrder(ord.orderNumber)}
                        className="px-3 py-1.5 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-950 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ಆದೇಶ ವೀಕ್ಷಿಸಿ</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ORDER FILES */}
          {results.orderFiles.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-sky-950" />
                  <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                    ಆದೇಶಗಳ ಕಡತ ಭಂಡಾರ ({results.orderFiles.length})
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-stone-200 text-xs">
                {results.orderFiles.map((file) => (
                  <div key={file.id} className="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-stone-900 text-xs">{file.fileId}</span>
                      <span className="text-stone-500 ml-2">({file.orderNumber})</span>
                      <div className="text-stone-600 text-[11px] mt-0.5">
                        {file.employeeName} • {file.orderType} • ದಿನಾಂಕ: {file.orderDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {query.trim() && totalResults === 0 && !isLoading && (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
          <Search className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-stone-800">ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ</h3>
          <p className="text-xs text-stone-500 mt-1">
            "{query}" ಪದಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ನೌಕರರು ಅಥವಾ ಆದೇಶ ಕಡತಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಕೆಜಿಐಡಿ ಅಥವಾ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.
          </p>
        </div>
      )}
    </div>
  );
};
