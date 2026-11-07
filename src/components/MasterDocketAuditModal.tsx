import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ChevronDown,
  Building2,
  RotateCcw,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { MasterDocketFile, EducationLetter, Employee } from '../types';

interface MasterDocketAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: MasterDocketFile[];
  letters: EducationLetter[];
  employees?: Employee[];
  selectedFileId?: string | null;
  onSelectLetter?: (letter: EducationLetter) => void;
}

export const MasterDocketAuditModal: React.FC<MasterDocketAuditModalProps> = ({
  isOpen,
  onClose,
  files,
  letters,
  employees = [],
  selectedFileId,
  onSelectLetter,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [expandedFileId, setExpandedFileId] = useState<string | null>(selectedFileId || (files[0]?.id ?? null));

  // Compute file audit findings
  const auditedFiles = useMemo(() => {
    return files.map((file) => {
      const linkedLetters = letters.filter(
        (l) => l.fileNumber === file.fileNumber || (file.linkedLetterIds && file.linkedLetterIds.includes(l.id))
      );

      const inwardLetters = linkedLetters.filter((l) => l.direction === 'inward');
      const outwardLetters = linkedLetters.filter((l) => l.direction === 'outward');
      const hasPendingLetters = linkedLetters.some((l) => l.status === 'Pending Action' || l.status === 'Under Review');

      // 1. Classification & Retention Audit (KSMOP Secretariat Manual)
      let classification = 'Class B (10-15 Years)';
      if (file.fileCategory?.includes('ವೇತನ') || file.isRtiFile) {
        classification = 'Class A (Permanent / 25+ Years)';
      } else if (file.fileCategory?.includes('ಶೈಕ್ಷಣಿಕ') || file.fileCategory?.includes('ಲೆಕ್ಕಪತ್ರ')) {
        classification = 'Class B (10-15 Years)';
      } else if (file.fileCategory?.includes('ಸಾಮಾನ್ಯ')) {
        classification = 'Class C (5 Years)';
      }

      // 2. Custodian & Movement Integrity
      const hasMovement = file.movementHistory && file.movementHistory.length > 0;
      const custodianKnown = Boolean(file.currentCustodian && file.currentCustodian.trim().length > 0);

      // Check for stagnation
      const initiatedDate = new Date(file.initiatedDate || '2026-01-01');
      const daysOpen = Math.max(1, Math.floor((Date.now() - initiatedDate.getTime()) / (1000 * 60 * 60 * 24)));
      const isStagnant = file.status !== 'Disposed / Closed' && daysOpen > 45 && !hasMovement;

      // 3. RTI Compliance (if RTI file)
      let rtiComplianceStatus: 'N/A' | 'Compliant' | 'At Risk' | 'Overdue' = 'N/A';
      if (file.isRtiFile && file.rtiDetails) {
        const dueDate = new Date(file.rtiDetails.statutoryDueDate || '2026-08-30');
        const isClosed = file.rtiDetails.rtiStatus === 'ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ' || file.rtiDetails.rtiStatus === 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ';
        if (isClosed) {
          rtiComplianceStatus = 'Compliant';
        } else if (Date.now() > dueDate.getTime()) {
          rtiComplianceStatus = 'Overdue';
        } else if (dueDate.getTime() - Date.now() < 7 * 86400000) {
          rtiComplianceStatus = 'At Risk';
        } else {
          rtiComplianceStatus = 'Compliant';
        }
      }

      // 4. Financial Audit
      const totalFinancialAmount = linkedLetters.reduce((sum, l) => sum + (l.financialAmount || 0), 0);

      // Overall Score (0 - 100)
      let score = 100;
      const issues: string[] = [];

      if (!custodianKnown) {
        score -= 25;
        issues.push('ಕಡತ ಪಾಲಕರ (Custodian) ಮಾಹಿತಿ ದಾಖಲಾಗಿಲ್ಲ');
      }
      if (linkedLetters.length === 0) {
        score -= 20;
        issues.push('ಕಡತದಲ್ಲಿ ಯಾವುದೇ ಪತ್ರ ಅಥವಾ ಟಿಪ್ಪಣಿ ಜೋಡಣೆಯಾಗಿಲ್ಲ (Empty Docket)');
      }
      if (isStagnant) {
        score -= 15;
        issues.push(`ಕಡತ 45 ದಿನಗಳಿಂದ ಯಾವುದೇ ಚಲನವಲನವಿಲ್ಲದೆ ಬಾಕಿಯಿದೆ (${daysOpen} Days)`);
      }
      if (rtiComplianceStatus === 'Overdue') {
        score -= 30;
        issues.push('ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಸನಬದ್ಧ 30 ದಿನಗಳ ಗಡುವು ಮೀರಿದೆ (RTI Overdue)');
      } else if (rtiComplianceStatus === 'At Risk') {
        score -= 10;
        issues.push('ಮಾಹಿತಿ ಹಕ್ಕು ಗಡುವು 7 ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯವಾಗಲಿದೆ');
      }

      const complianceRating =
        score >= 85 ? 'Full Compliance (A+)' : score >= 65 ? 'Minor Observations (B)' : 'Audit Action Required (C)';

      return {
        ...file,
        linkedLetters,
        inwardLetters,
        outwardLetters,
        hasPendingLetters,
        classification,
        daysOpen,
        isStagnant,
        rtiComplianceStatus,
        totalFinancialAmount,
        score: Math.max(0, score),
        issues,
        complianceRating,
      };
    });
  }, [files, letters]);

  // Filtered files
  const filteredAudited = useMemo(() => {
    return auditedFiles.filter((f) => {
      const q = filterQuery.toLowerCase();
      const matchQuery =
        !q ||
        f.fileNumber.toLowerCase().includes(q) ||
        f.subject.toLowerCase().includes(q) ||
        (f.currentCustodian && f.currentCustodian.toLowerCase().includes(q));

      const matchCat =
        activeCategoryFilter === 'all' ||
        (activeCategoryFilter === 'rti' && f.isRtiFile) ||
        (activeCategoryFilter === 'issues' && f.issues.length > 0) ||
        (activeCategoryFilter === 'compliant' && f.score >= 85);

      return matchQuery && matchCat;
    });
  }, [auditedFiles, filterQuery, activeCategoryFilter]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = auditedFiles.length;
    const compliantCount = auditedFiles.filter((f) => f.score >= 85).length;
    const issuesCount = auditedFiles.filter((f) => f.issues.length > 0).length;
    const rtiCount = auditedFiles.filter((f) => f.isRtiFile).length;
    const avgScore = total > 0 ? Math.round(auditedFiles.reduce((s, f) => s + f.score, 0) / total) : 100;
    const totalFinancial = auditedFiles.reduce((s, f) => s + f.totalFinancialAmount, 0);

    return {
      total,
      compliantCount,
      issuesCount,
      rtiCount,
      avgScore,
      totalFinancial,
    };
  }, [auditedFiles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#2b2b2b] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#2b2b2b] text-[#fffbf2] border-b-2 border-[#2b2b2b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-bold border-2 border-white shadow-[2px_2px_0px_#fff]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f59e0b] text-[#2b2b2b]">
                  e-Office Compliant • Master Docket Auditing
                </span>
                <span className="text-xs text-emerald-400 font-bold font-kannada">
                  ಕರ್ನಾಟಕ ಸಚಿವಾಲಯ ಕಛೇರಿ ಪದ್ಧತಿ (KSMOP)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-kannada text-white mt-0.5">
                ಕಡತಗಳ ಶಾಸನಬದ್ಧ ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ಅನುಸರಣಾ ಪರಿಶೀಲನೆ (Master Docket Audit)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-[#f59e0b] hover:bg-amber-400 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2b2b2b]"
              title="ಆಡಿಟ್ ವರದಿಯನ್ನು ಮುದ್ರಿಸಿ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ಮುದ್ರಣ (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-stone-200 border-b-2 border-[#2b2b2b] bg-[#fffbf2] text-xs">
          <div className="p-3 text-center">
            <span className="text-stone-500 block text-[10px] font-bold uppercase font-mono-code">TOTAL DOCKETS</span>
            <span className="text-xl font-bold font-mono text-[#2b2b2b]">{stats.total}</span>
            <span className="text-[10px] text-stone-500 block">ಪರಿಶೀಲಿಸಿದ ಕಡತಗಳು</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase font-mono-code">COMPLIANCE INDEX</span>
            <span className="text-xl font-bold font-mono text-emerald-700">{stats.avgScore}%</span>
            <span className="text-[10px] text-emerald-800 block font-bold">e-Office ಅರ್ಹತೆ</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase font-mono-code">A+ COMPLIANT</span>
            <span className="text-xl font-bold font-mono text-emerald-800">{stats.compliantCount}</span>
            <span className="text-[10px] text-stone-500 block">ಪೂರ್ಣ ನಿಯಮಬದ್ಧ</span>
          </div>

          <div className="p-3 text-center">
            <span className="text-rose-700 block text-[10px] font-bold uppercase font-mono-code">OBSERVATIONS</span>
            <span className="text-xl font-bold font-mono text-rose-700">{stats.issuesCount}</span>
            <span className="text-[10px] text-rose-600 block font-bold">ಕ್ರಮ ಅಗತ್ಯವಿರುವ ಕಡತಗಳು</span>
          </div>

          <div className="p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-amber-800 block text-[10px] font-bold uppercase font-mono-code">FINANCIAL AUDIT</span>
            <span className="text-lg font-bold font-mono text-stone-900">₹{stats.totalFinancial.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-500 block">ಕಡತಗಳ ಆರ್ಥಿಕ ಮೊತ್ತ</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="ಕಡತ ಸಂಖ್ಯೆ, ವಿಷಯ ಅಥವಾ ಪಾಲಕರ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#2b2b2b] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              ಎಲ್ಲಾ ({stats.total})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('compliant')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'compliant'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              ಪೂರ್ಣ ಅನುಸರಣೆ ({stats.compliantCount})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('issues')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'issues'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              ಕ್ರಮ ಅಗತ್ಯ ({stats.issuesCount})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('rti')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'rti'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              RTI ಕಡತಗಳು ({stats.rtiCount})
            </button>
          </div>
        </div>

        {/* Audit List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAudited.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <FileCheck2 className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-bold font-kannada">ಯಾವುದೇ ಕಡತಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
            </div>
          ) : (
            filteredAudited.map((file) => {
              const isExpanded = expandedFileId === file.id;

              return (
                <div
                  key={file.id}
                  className={`rounded-xl border-2 transition-all overflow-hidden ${
                    file.score >= 85
                      ? 'border-stone-200 bg-white hover:border-emerald-400'
                      : file.score >= 65
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-rose-400 bg-rose-50/30'
                  }`}
                >
                  {/* Row Summary */}
                  <div
                    onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                    className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                          file.score >= 85
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : file.score >= 65
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {file.score}%
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono-code font-bold text-xs text-[#2b2b2b] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {file.fileNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#fffbf2] text-[#2b2b2b] border border-stone-300 font-mono-code">
                            {file.classification}
                          </span>
                          {file.isRtiFile && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-kannada">
                              ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI)
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              file.score >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : file.score >= 65
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {file.complianceRating}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate font-kannada">
                          {file.subject}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-1">
                          <span>
                            ಪಾಲಕರು: <strong>{file.currentCustodian || 'ಅನಿಶ್ಚಿತ'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            ಕಡತ ಆರಂಭ: <strong>{file.initiatedDate}</strong> ({file.daysOpen} ದಿನಗಳು)
                          </span>
                          <span>•</span>
                          <span>
                            ಪತ್ರಗಳು: <strong>{file.linkedLetters.length}</strong> (ಸ್ವೀಕೃತ: {file.inwardLetters.length} / ರವಾನೆ: {file.outwardLetters.length})
                          </span>
                          {file.totalFinancialAmount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-800 font-bold font-mono">
                                ₹{file.totalFinancialAmount.toLocaleString('en-IN')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {file.issues.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{file.issues.length} ಅಂಶಗಳು</span>
                        </div>
                      )}
                      <button className="p-1 rounded hover:bg-stone-200 text-stone-500">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Audit Dossier */}
                  {isExpanded && (
                    <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs space-y-4">
                      {/* Audit Findings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                          <span className="font-bold text-stone-700 block font-kannada">
                            1. ಕಡತ ಸಂರಕ್ಷಣಾ ವರ್ಗೀಕರಣ (KSMOP)
                          </span>
                          <p className="text-stone-600 text-[11px]">
                            ವರ್ಗ: <strong>{file.classification}</strong>
                          </p>
                          <p className="text-stone-500 text-[10px]">
                            ಕರ್ನಾಟಕ ಸಚಿವಾಲಯ ನಿಯಮಾವಳಿ ಅನ್ವಯ ಈ ಕಡತವನ್ನು ಕಡ್ಡಾಯ ಸಂರಕ್ಷಣಾ ಪಟ್ಟಿಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                          <span className="font-bold text-stone-700 block font-kannada">
                            2. ಕಡತ ಚಲನವಲನ (File Tracking System)
                          </span>
                          <p className="text-stone-600 text-[11px]">
                            ದಾಖಲಾದ ಚಲನವಲನಗಳು: <strong>{(file.movementHistory || []).length}</strong>
                          </p>
                          <p className="text-stone-500 text-[10px]">
                            ಪ್ರಸ್ತುತ ಪಾಲಕರು: <strong>{file.currentCustodian || 'ಯಾರೂ ಇಲ್ಲ'}</strong>
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                          <span className="font-bold text-stone-700 block font-kannada">
                            3. ಮಾಹಿತಿ ಹಕ್ಕು & ಕಾಲಮಿತಿ ಲೆಕ್ಕ
                          </span>
                          <p className="text-stone-600 text-[11px]">
                            RTI ಸ್ಥಿತಿ: <strong>{file.rtiComplianceStatus}</strong>
                          </p>
                          {file.rtiDetails && (
                            <p className="text-stone-500 text-[10px]">
                              ಗಡುವು: <strong>{file.rtiDetails.statutoryDueDate}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Observations & Corrective Actions */}
                      {file.issues.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                          <span className="font-bold text-rose-900 block flex items-center gap-1.5 font-kannada">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>ಲೆಕ್ಕಪರಿಶೋಧನಾ ಆಕ್ಷೇಪಣೆಗಳು & ಸುಧಾರಣಾ ಕ್ರಮಗಳು:</span>
                          </span>
                          <ul className="list-disc list-inside text-rose-800 text-[11px] space-y-0.5">
                            {file.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Linked Letters in this Docket */}
                      {file.linkedLetters.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="font-bold text-stone-800 block text-[11px]">
                            ಕಡತದಲ್ಲಿರುವ ಪತ್ರಗಳ ವಿವರ ({file.linkedLetters.length} Letters)
                          </span>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {file.linkedLetters.map((letter) => (
                              <div
                                key={letter.id}
                                onClick={() => onSelectLetter && onSelectLetter(letter)}
                                className="p-2 bg-white hover:bg-amber-50 rounded border border-stone-200 flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      letter.direction === 'inward'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {letter.direction.toUpperCase()}
                                  </span>
                                  <span className="font-mono-code font-bold text-[10px] text-stone-700">
                                    {letter.referenceNumber}
                                  </span>
                                  <span className="text-stone-800 truncate max-w-sm">{letter.subject}</span>
                                </div>
                                <span className="text-[10px] text-stone-500">{letter.dateReceivedOrIssued}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-stone-100 border-t-2 border-[#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-kannada font-bold">
              e-Office ದೃಢೀಕರಣ ಮುದ್ರೆ: ಕರ್ನಾಟಕ ಸರ್ಕಾರ, ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ ಭದ್ರಾವತಿ
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2b2b2b] hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b]"
          >
            ಮುಕ್ತಾಯಗೊಳಿಸಿ (Close Audit)
          </button>
        </div>
      </div>
    </div>
  );
};
