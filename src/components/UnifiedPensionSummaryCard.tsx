import React, { useState } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  Award, 
  Users, 
  FileText, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ArrowRight, 
  Printer, 
  Info,
  Calendar,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { PensionCaseRecord } from '../types';
import { formatINR, formatDDMMYYYY, numberToKannadaWords } from '../utils/pensionCalculator';

interface UnifiedPensionSummaryCardProps {
  pensionCase: PensionCaseRecord;
  onViewLetters?: () => void;
  onViewCalcSheet?: () => void;
  onEditCase?: () => void;
  className?: string;
  showHeaderDetails?: boolean;
}

export const UnifiedPensionSummaryCard: React.FC<UnifiedPensionSummaryCardProps> = ({
  pensionCase,
  onViewLetters,
  onViewCalcSheet,
  onEditCase,
  className = '',
  showHeaderDetails = true
}) => {
  const [copied, setCopied] = useState(false);
  const calc = pensionCase.calculation;

  const handleCopySummary = () => {
    const text = `
================================================================================
ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ • ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ
ಏಕೀಕೃತ ಪಿಂಚಣಿ ಸಾರಾಂಶ (UNIFIED PENSION SUMMARY CARD)
================================================================================
ಪ್ರಕರಣ: ${pensionCase.caseNumber} | ಕಡತ ಸಂ: ${pensionCase.fileNumber}
ನೌಕರರ ಹೆಸರು: ${pensionCase.employeeName}
ಹುದ್ದೆ: ${pensionCase.designation} (${pensionCase.cadreGroup})
ಶಾಲೆ/ಕಛೇರಿ: ${pensionCase.officeOrSchool}
KGID: ${pensionCase.kgidNumber} | ನಿವೃತ್ತಿ ದಿನಾಂಕ (DOR): ${formatDDMMYYYY(pensionCase.dor)}
ಅರ್ಹತಾ ಸೇವೆ: ${calc.netQualifyingYears} ವರ್ಷ ${calc.netQualifyingMonths} ತಿಂಗಳು (${calc.qualifyingHalfYears} ಅರ್ಧವಾರ್ಷಿಕಗಳು)
ಕೊನೆಯ ಮೂಲ ವೇತನ: ₹${formatINR(calc.lastBasicPay)} | DA ದರ: ${calc.daPercentage}%

--------------------------------------------------------------------------------
1. ನಿವೃತ್ತಿ ವೇತನ (RETIREMENT PENSION) - KCSR Rule 287(2)
--------------------------------------------------------------------------------
• ಸೂತ್ರ: (ಕೊನೆಯ ಮೂಲ ವೇತನ ÷ 2) × (ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು ÷ 60)
• ಮೂಲ ಮಾಸಿಕ ಪಿಂಚಣಿ: ₹${formatINR(calc.basicServicePension)}
• ತುಟ್ಟಿಭತ್ಯೆ ಪರಿಹಾರ (DR @ ${calc.daPercentage}%): ₹${formatINR(calc.daOnPension)}
• ಒಟ್ಟು ಮಾಸಿಕ ಪಿಂಚಣಿ: ₹${formatINR(calc.grossMonthlyPension)}
• ಪರಿವರ್ತಿತ ಭಾಗ (Commutation @ ${calc.commutationPercentage}%): ₹${formatINR(calc.commutedPortion)}
• ಪರಿವರ್ತನೆ ನಂತರದ ನಿವ್ವಳ ಮಾಸಿಕ ಪಿಂಚಣಿ: ₹${formatINR(calc.reducedMonthlyPension + calc.daOnPension)}

--------------------------------------------------------------------------------
2. ಕುಟುಂಬ ಪಿಂಚಣಿ (FAMILY PENSION) - KCSR 1964 Scheme
--------------------------------------------------------------------------------
• ಸೂತ್ರ: ಸಾಮಾನ್ಯ 30% ಮೂಲ ವೇತನ | ಹೆಚ್ಚುವರಿ 50% ಮೂಲ ವೇತನ
• ಸಾಮಾನ್ಯ ದರ (Normal Rate @ 30%): ₹${formatINR(calc.familyPensionNormal)} / ತಿಂಗಳು
• ಹೆಚ್ಚುವರಿ ದರ (Enhanced Rate @ 50% - 7 ವರ್ಷ): ₹${formatINR(calc.familyPensionEnhanced)} / ತಿಂಗಳು
• ತುಟ್ಟಿ ಪರಿಹಾರ (DR @ ${calc.daPercentage}%): ₹${formatINR(Math.round((calc.familyPensionNormal * calc.daPercentage) / 100))}
• ನಾಮನಿರ್ದೇಶಿತರು: ${pensionCase.nomineeName || pensionCase.parentOrSpouseName || 'ದಾಸಪ್ಪ'} (${pensionCase.nomineeRelation || 'ಪತಿ'})
• ನಾಮನಿರ್ದೇಶಿತರ DOB: ${formatDDMMYYYY(pensionCase.nomineeDob || pensionCase.familyMembers?.[0]?.dob || '1960-05-10')}

--------------------------------------------------------------------------------
3. ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG / RETIREMENT GRATUITY) - KCSR Rule 292B
--------------------------------------------------------------------------------
• ಸೂತ್ರ: [(ಮೂಲ ವೇತನ + DA) ÷ 4] × ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು
• ಉಪದಾನ ವೇತನ ಲಭ್ಯತೆಗಳು (Basic + DA): ₹${formatINR(calc.dcrgEmoluments)}
• ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು: ${calc.qualifyingHalfYears} (ಗರಿಷ್ಠ 66)
• ಕಚ್ಚಾ ಮೊತ್ತ (Raw Gratuity): ₹${formatINR(calc.dcrgRaw)}
• ಗರಿಷ್ಠ ಶಾಸನಬದ್ಧ ಮಿತಿ: ₹20,00,000 (ಅಥವಾ 16.5 ತಿಂಗಳ ವೇತನ)
• ಮಂಜೂರಾದ ಅಂತಿಮ ಉಪದಾನ (DCRG Sanctioned): ₹${formatINR(calc.dcrgSanctioned)}
• ಅಕ್ಷರಗಳಲ್ಲಿ: ${numberToKannadaWords(calc.dcrgSanctioned)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ

================================================================================
ಒಟ್ಟು ಇಡಿಗಂಟು ಸೌಲಭ್ಯಗಳು (GRAND TOTAL TERMINAL BENEFITS): ₹${formatINR(calc.totalTerminalLumpSum)}
(${numberToKannadaWords(calc.totalTerminalLumpSum)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ)
================================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const nomineeName = pensionCase.nomineeName || pensionCase.parentOrSpouseName || 'ದಾಸಪ್ಪ';
  const nomineeRel = pensionCase.nomineeRelation || 'ಪತಿ (Husband)';
  const nomineeDob = pensionCase.nomineeDob || pensionCase.familyMembers?.[0]?.dob || '1960-05-10';
  const familyCount = pensionCase.familyMembers?.length || 1;
  const drOnFamilyPension = Math.round((calc.familyPensionNormal * calc.daPercentage) / 100);

  return (
    <div className={`bg-white rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-hidden ${className}`}>
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-5 border-b-2 border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-stone-950 font-black text-[11px] font-mono px-2 py-0.5 rounded tracking-wide">
                OFFICIAL EXCEL FORMULA LOGIC
              </span>
              <span className="bg-stone-800 text-amber-300 font-bold text-[11px] px-2 py-0.5 rounded border border-stone-700">
                KCSR RULES • 7TH CPC
              </span>
              <span className="text-[11px] text-stone-300 font-bold bg-stone-800/80 px-2 py-0.5 rounded">
                ಕಡತ ಸಂ: {pensionCase.fileNumber}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black font-kannada text-amber-300 flex items-center gap-2 pt-0.5">
              <Calculator className="w-5 h-5 text-amber-400 shrink-0" />
              <span>ಏಕೀಕೃತ ಪಿಂಚಣಿ ಸಾರಾಂಶ (Unified Pension Summary)</span>
            </h3>

            <p className="text-xs text-stone-300 font-kannada">
              ನಿವೃತ್ತಿ ವೇತನ (Retirement Pension), ಕುಟುಂಬ ಪಿಂಚಣಿ (Family Pension) & ಉಪದಾನ (DCRG) ಮುಖಾಮುಖಿ ಅಧಿಕೃತ ಲೆಕ್ಕಾಚಾರ
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-lg transition-all border border-stone-700 shadow-sm cursor-pointer flex items-center gap-1.5"
              title="ಸಾರಾಂಶವನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಿ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{copied ? 'ನಕಲಿಸಲಾಗಿದೆ ✓' : 'ಸಾರಾಂಶ ನಕಲಿಸಿ'}</span>
            </button>

            {onViewCalcSheet && (
              <button
                type="button"
                onClick={onViewCalcSheet}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-all border-2 border-stone-950 shadow-sm cursor-pointer flex items-center gap-1.5"
                title="ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (Calculation Sheet)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ</span>
              </button>
            )}

            {onViewLetters && (
              <button
                type="button"
                onClick={onViewLetters}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all border border-blue-700 shadow-sm cursor-pointer flex items-center gap-1.5"
                title="ಅಧಿಕೃತ ನಮೂನೆಗಳು & ಮಂಜೂರಾತಿ ಆದೇಶಗಳು"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ಮಂಜೂರಾತಿ ಆದೇಶಗಳು</span>
              </button>
            )}
          </div>
        </div>

        {/* Employee Summary Chip */}
        {showHeaderDetails && (
          <div className="mt-3 pt-3 border-t border-stone-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-bold text-white text-sm font-kannada">
                {pensionCase.employeeName}
              </span>
              <span className="text-stone-300">
                {pensionCase.designation} ({pensionCase.cadreGroup})
              </span>
              <span className="text-amber-300 font-mono font-bold">
                KGID: {pensionCase.kgidNumber}
              </span>
              <span className="text-stone-400">
                {pensionCase.officeOrSchool}
              </span>
            </div>

            <div className="flex items-center gap-3 text-stone-300 font-mono text-[11px]">
              <span>DOB: <strong className="text-white">{formatDDMMYYYY(pensionCase.dob)}</strong></span>
              <span>DOA: <strong className="text-white">{formatDDMMYYYY(pensionCase.doa)}</strong></span>
              <span>DOR: <strong className="text-rose-400 font-bold">{formatDDMMYYYY(pensionCase.dor)}</strong></span>
              <span>ಅರ್ಹತಾ ಸೇವೆ: <strong className="text-emerald-400">{calc.netQualifyingYears}ವ {calc.netQualifyingMonths}ತಿ ({calc.qualifyingHalfYears} ಅರ್ಧವರ್ಷ)</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 3-COLUMN SIDE-BY-SIDE GRID */}
      <div className="p-4 sm:p-5 bg-stone-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* =================================================================== */}
          {/* COLUMN 1: RETIREMENT PENSION (ನಿವೃತ್ತಿ ವೇತನ)                        */}
          {/* =================================================================== */}
          <div className="bg-white rounded-xl border-2 border-emerald-800 shadow-[3px_3px_0px_#065f46] overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-emerald-800 text-white p-3 flex items-center justify-between border-b border-emerald-900">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs border border-emerald-400">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide font-kannada">
                      ನಿವೃತ್ತಿ ವೇತನ (Retirement Pension)
                    </h4>
                    <span className="text-[10px] text-emerald-200 block font-normal">
                      KCSR Rule 287(2) • ಮಾಸಿಕ ಪಿಂಚಣಿ
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-200 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-700">
                  50% Basic
                </span>
              </div>

              {/* Formula Ribbon */}
              <div className="bg-emerald-50/80 p-2 border-b border-emerald-200 text-emerald-950 text-[11px] font-kannada">
                <span className="font-bold text-[10px] uppercase text-emerald-900 block">Excel Formula (ಸೂತ್ರ):</span>
                <span className="font-mono font-bold text-xs text-emerald-950">
                  (ಕೊನೆಯ ಮೂಲವೇತನ ÷ 2) × (ಅರ್ಧವರ್ಷ ÷ 60)
                </span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">
                  ಕನಿಷ್ಠ: ₹13,500 | ಗರಿಷ್ಠ: ₹75,300 (ಅನ್ವಯ)
                </span>
              </div>

              {/* Data Breakdown Rows */}
              <div className="p-3 space-y-2 text-xs divide-y divide-stone-100 font-sans">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಕೊನೆಯ ಮೂಲ ವೇತನ (Basic Pay):</span>
                  <strong className="font-mono text-stone-900 font-bold">₹{formatINR(calc.lastBasicPay)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿ:</span>
                  <strong className="font-mono text-emerald-800 font-bold">{calc.qualifyingHalfYears} / 60 ಅವಧಿಗಳು</strong>
                </div>

                <div className="flex justify-between items-center pt-1 bg-emerald-50/60 p-1.5 rounded">
                  <span className="font-bold text-emerald-950">ಮೂಲ ಮಾಸಿಕ ಪಿಂಚಣಿ (Basic Pension):</span>
                  <strong className="font-mono text-emerald-950 font-black text-sm">₹{formatINR(calc.basicServicePension)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ತುಟ್ಟಿಭತ್ಯೆ ಪರಿಹಾರ (DR @ {calc.daPercentage}%):</span>
                  <strong className="font-mono text-stone-800 font-bold">+₹{formatINR(calc.daOnPension)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-700 font-medium">ಒಟ್ಟು ಮಾಸಿಕ ಪಿಂಚಣಿ (Gross Pension):</span>
                  <strong className="font-mono text-stone-900 font-bold">₹{formatINR(calc.grossMonthlyPension)}</strong>
                </div>

                {calc.commutedPortion > 0 && (
                  <div className="flex justify-between items-center pt-1 text-purple-900">
                    <span className="text-stone-600">ಕಡಿತ: ಪರಿವರ್ತಿತ ಭಾಗ ({calc.commutationPercentage}%):</span>
                    <strong className="font-mono font-bold">-₹{formatINR(calc.commutedPortion)}</strong>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t-2 border-emerald-300 bg-emerald-100/70 p-2 rounded-lg">
                  <div>
                    <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wide block">
                      ಪ್ರತಿ ತಿಂಗಳು ಜಮೆಯಾಗುವ ನಿವ್ವಳ ಪಿಂಚಣಿ:
                    </span>
                    <span className="text-[10px] text-emerald-800">
                      (ಮೂಲ ₹{formatINR(calc.reducedMonthlyPension)} + DR ₹{formatINR(calc.daOnPension)})
                    </span>
                  </div>
                  <strong className="font-mono text-emerald-950 font-black text-base">
                    ₹{formatINR(calc.reducedMonthlyPension + calc.daOnPension)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="p-2.5 bg-emerald-50 border-t border-emerald-200 text-[10px] text-emerald-900 flex items-center justify-between font-kannada">
              <span>{calc.isEligibleForFullPension ? '✓ ಪೂರ್ಣ ಪಿಂಚಣಿ (30+ ವರ್ಷ)' : 'ಅನುಪಾತಿಕ ಪಿಂಚಣಿ'}</span>
              <span className="font-mono font-bold text-emerald-800">Rule 287(2)</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 2: FAMILY PENSION (ಕುಟುಂಬ ಪಿಂಚಣಿ)                            */}
          {/* =================================================================== */}
          <div className="bg-white rounded-xl border-2 border-rose-800 shadow-[3px_3px_0px_#9f1239] overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-rose-800 text-white p-3 flex items-center justify-between border-b border-rose-900">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs border border-rose-400">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide font-kannada">
                      ಕುಟುಂಬ ಪಿಂಚಣಿ (Family Pension)
                    </h4>
                    <span className="text-[10px] text-rose-200 block font-normal">
                      KCSR 1964 Scheme • Rule 294
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-950 text-rose-200 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-700">
                  30% / 50%
                </span>
              </div>

              {/* Formula Ribbon */}
              <div className="bg-rose-50/80 p-2 border-b border-rose-200 text-rose-950 text-[11px] font-kannada">
                <span className="font-bold text-[10px] uppercase text-rose-900 block">Excel Formula (ಸೂತ್ರ):</span>
                <span className="font-mono font-bold text-xs text-rose-950">
                  ಸಾಮಾನ್ಯ: 30% ಮೂಲವೇತನ | ಹೆಚ್ಚುವರಿ: 50% ಮೂಲವೇತನ
                </span>
                <span className="text-[10px] text-rose-800 block mt-0.5">
                  ಕನಿಷ್ಠ ಕುಟುಂಬ ಪಿಂಚಣಿ ₹13,500 ಖಾತರಿ
                </span>
              </div>

              {/* Data Breakdown Rows */}
              <div className="p-3 space-y-2 text-xs divide-y divide-stone-100 font-sans">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಕೊನೆಯ ಮೂಲ ವೇತನ (Basic Pay):</span>
                  <strong className="font-mono text-stone-900 font-bold">₹{formatINR(calc.lastBasicPay)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1 bg-rose-50/60 p-1.5 rounded">
                  <div>
                    <span className="font-bold text-rose-950 block">ಸಾಮಾನ್ಯ ದರ (Normal Rate @ 30%):</span>
                    <span className="text-[10px] text-stone-500 font-normal">ನಿವೃತ್ತಿ ನಂತರ ಸಾಮಾನ್ಯ ಕುಟುಂಬ ಪಿಂಚಣಿ</span>
                  </div>
                  <strong className="font-mono text-rose-950 font-black text-sm">₹{formatINR(calc.familyPensionNormal)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1 bg-amber-50/60 p-1.5 rounded">
                  <div>
                    <span className="font-bold text-amber-950 block">ಹೆಚ್ಚುವರಿ ದರ (Enhanced Rate @ 50%):</span>
                    <span className="text-[10px] text-stone-500 font-normal">7 ವರ್ಷಗಳ ಅವಧಿಗೆ ಅಥವಾ 67 ವರ್ಷ ವಯಸ್ಸಿನವರೆಗೆ</span>
                  </div>
                  <strong className="font-mono text-amber-950 font-black text-sm">₹{formatINR(calc.familyPensionEnhanced)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಸಾಮಾನ್ಯ ದರಕ್ಕೆ DR (@ {calc.daPercentage}%):</span>
                  <strong className="font-mono text-stone-800 font-bold">+₹{formatINR(drOnFamilyPension)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-700 font-medium">ಒಟ್ಟು ಸಾಮಾನ್ಯ ಕುಟುಂಬ ಪಿಂಚಣಿ (Pay+DR):</span>
                  <strong className="font-mono text-stone-900 font-bold">₹{formatINR(calc.familyPensionNormal + drOnFamilyPension)}</strong>
                </div>

                {/* Nominee Details Subcard */}
                <div className="pt-2 border-t border-stone-200 bg-stone-50 p-2 rounded text-[11px] text-stone-700 space-y-1">
                  <div className="flex items-center justify-between text-stone-900 font-bold">
                    <span className="flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                      <span>ನಾಮನಿರ್ದೇಶಿತರು (Nominee):</span>
                    </span>
                    <span className="text-rose-900 font-bold">{nomineeName}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[10px]">
                    <span>ಸಂಬಂಧ: <strong>{nomineeRel}</strong></span>
                    <span>DOB: <strong className="font-mono">{formatDDMMYYYY(nomineeDob)}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="p-2.5 bg-rose-50 border-t border-rose-200 text-[10px] text-rose-900 flex items-center justify-between font-kannada">
              <span>ನೋಂದಾಯಿತ ಕುಟುಂಬ ಸದಸ್ಯರು: {familyCount}</span>
              <span className="font-mono font-bold text-rose-800">KCSR 1964 Scheme</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 3: DCRG / RETIREMENT GRATUITY (ನಿವೃತ್ತಿ ಉಪದಾನ)                */}
          {/* =================================================================== */}
          <div className="bg-white rounded-xl border-2 border-blue-800 shadow-[3px_3px_0px_#1e3a8a] overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="bg-blue-800 text-white p-3 flex items-center justify-between border-b border-blue-900">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-blue-400">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide font-kannada">
                      ನಿವೃತ್ತಿ ಉಪದಾನ (Retirement Gratuity / DCRG)
                    </h4>
                    <span className="text-[10px] text-blue-200 block font-normal">
                      KCSR Rule 292B • ಇಡಿಗಂಟು ಸೌಲಭ್ಯ
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-950 text-blue-200 font-mono font-bold px-1.5 py-0.5 rounded border border-blue-700">
                  Max ₹20L
                </span>
              </div>

              {/* Formula Ribbon */}
              <div className="bg-blue-50/80 p-2 border-b border-blue-200 text-blue-950 text-[11px] font-kannada">
                <span className="font-bold text-[10px] uppercase text-blue-900 block">Excel Formula (ಸೂತ್ರ):</span>
                <span className="font-mono font-bold text-xs text-blue-950">
                  [(ಮೂಲವೇತನ + DA) ÷ 4] × ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು
                </span>
                <span className="text-[10px] text-blue-800 block mt-0.5">
                  ಗರಿಷ್ಠ 16.5 ತಿಂಗಳ ವೇತನ ಅಥವಾ ₹20,00,000 ಶಾಸನಬದ್ಧ ಮಿತಿ
                </span>
              </div>

              {/* Data Breakdown Rows */}
              <div className="p-3 space-y-2 text-xs divide-y divide-stone-100 font-sans">
                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಮೂಲ ವೇತನ + DA ಲಭ್ಯತೆಗಳು (Emoluments):</span>
                  <strong className="font-mono text-blue-950 font-bold">₹{formatINR(calc.dcrgEmoluments)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು (Half-Years):</span>
                  <strong className="font-mono text-stone-900 font-bold">{calc.qualifyingHalfYears} ಅವಧಿಗಳು (ಗರಿಷ್ಠ 66)</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">1/4 ರಷ್ಟು ಪ್ರತಿ ಅವಧಿಯ ಲಭ್ಯತೆ (Emoluments ÷ 4):</span>
                  <strong className="font-mono text-stone-800">₹{formatINR(Math.round(calc.dcrgEmoluments / 4))}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-stone-600">ಸೂತ್ರದನ್ವಯ ಕಚ್ಚಾ ಮೊತ್ತ (Raw Gratuity):</span>
                  <strong className="font-mono text-stone-800">₹{formatINR(calc.dcrgRaw)}</strong>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
                  <span>16.5 ತಿಂಗಳ ಗರಿಷ್ಠ ಲಭ್ಯತೆಯ ಮಿತಿ:</span>
                  <span className="font-mono">₹{formatINR(calc.dcrgMax16HalfMonths)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300 bg-blue-100/70 p-2 rounded-lg">
                  <div>
                    <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wide block">
                      ಅಂತಿಮ ಮಂಜೂರಾದ ಉಪದಾನ (DCRG Sanctioned):
                    </span>
                    <span className="text-[10px] text-blue-800">
                      (ಶಾಸನಬದ್ಧ ಗರಿಷ್ಠ ₹20 ಲಕ್ಷ ಮಿತಿಯೊಳಗೆ)
                    </span>
                  </div>
                  <strong className="font-mono text-blue-950 font-black text-base">
                    ₹{formatINR(calc.dcrgSanctioned)}
                  </strong>
                </div>

                <div className="pt-1 text-[10px] text-stone-600 font-kannada">
                  ಅಕ್ಷರಗಳಲ್ಲಿ: <strong>{numberToKannadaWords(calc.dcrgSanctioned)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ</strong>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="p-2.5 bg-blue-50 border-t border-blue-200 text-[10px] text-blue-900 flex items-center justify-between font-kannada">
              <span>{calc.dcrgRaw > 2000000 ? '⚠️ ₹20 ಲಕ್ಷ ಗರಿಷ್ಠ ಮಿತಿಗೆ ಮಿತಿಗೊಳಿಸಲಾಗಿದೆ' : '✓ ₹20 ಲಕ್ಷ ಶಾಸನಬದ್ಧ ಮಿತಿಯೊಳಗಿದೆ'}</span>
              <span className="font-mono font-bold text-blue-800">Rule 292B</span>
            </div>
          </div>
        </div>

        {/* BOTTOM UNIFIED SUMMARY STRIP: ALL TERMINAL BENEFITS & NET MONTHLY PENSION */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-2 border-stone-800 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-mono">
                GRAND PENSION & TERMINAL BENEFITS AGGREGATION
              </span>
              <h4 className="text-base sm:text-lg font-black font-kannada text-white">
                ಒಟ್ಟು ನಿವೃತ್ತಿ ಇಡಿಗಂಟು ಪಾವತಿ & ಮಾಸಿಕ ಆರ್ಥಿಕ ಭದ್ರತೆ
              </h4>
              <p className="text-xs text-stone-300 font-kannada">
                ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ BEO ಭದ್ರಾವತಿ ಕಾರ್ಯಾಲಯದಿಂದ ಮಂಜೂರಾದ ಅಧಿಕೃತ ಒಟ್ಟು ಮೊತ್ತ
              </p>
            </div>

            {/* 4 Mini Summary Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-stone-800/90 p-2.5 rounded-lg border border-stone-700">
                <span className="text-[10px] text-blue-300 block">1. ಉಪದಾನ (DCRG):</span>
                <strong className="font-mono text-blue-300 text-sm block">₹{formatINR(calc.dcrgSanctioned)}</strong>
                <span className="text-[9px] text-stone-400">ಇಡಿಗಂಟು</span>
              </div>

              <div className="bg-stone-800/90 p-2.5 rounded-lg border border-stone-700">
                <span className="text-[10px] text-purple-300 block">2. ಪರಿವರ್ತನೆ (CVP):</span>
                <strong className="font-mono text-purple-300 text-sm block">₹{formatINR(calc.commutationLumpSum)}</strong>
                <span className="text-[9px] text-stone-400">{calc.commutationPercentage}% ಗಂಟುಮೊತ್ತ</span>
              </div>

              <div className="bg-stone-800/90 p-2.5 rounded-lg border border-stone-700">
                <span className="text-[10px] text-amber-300 block">3. ರಜೆ ನಗದೀಕರಣ:</span>
                <strong className="font-mono text-amber-300 text-sm block">₹{formatINR(calc.leaveEncashmentAmount)}</strong>
                <span className="text-[9px] text-stone-400">{calc.earnedLeaveDays} ದಿನ ಗಳಿಕೆ ರಜೆ</span>
              </div>

              <div className="bg-emerald-950/80 p-2.5 rounded-lg border border-emerald-700">
                <span className="text-[10px] text-emerald-300 block">4. ಪ್ರತಿ ತಿಂಗಳ ಪಿಂಚಣಿ:</span>
                <strong className="font-mono text-emerald-300 text-sm block">
                  ₹{formatINR(calc.reducedMonthlyPension + calc.daOnPension)}
                </strong>
                <span className="text-[9px] text-stone-400">ಪ್ರತಿ ತಿಂಗಳು ಜಮೆ</span>
              </div>
            </div>
          </div>

          {/* Grand Lump Sum Highlight */}
          <div className="mt-3 pt-3 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-stone-300">
                ಒಟ್ಟು ಇಡಿಗಂಟು ಸೌಲಭ್ಯಗಳ ಮೊತ್ತ (DCRG + CVP + EL Encashment):
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-amber-300">
                ₹{formatINR(calc.totalTerminalLumpSum)}
              </span>
              <span className="text-xs text-stone-300 font-kannada">
                ({numberToKannadaWords(calc.totalTerminalLumpSum)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
