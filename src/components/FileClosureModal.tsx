import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Send, 
  AlertCircle,
  FileCheck,
  FolderLock,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MasterDocketFile, AdminAuthUser } from '../types';

interface FileClosureModalProps {
  file: MasterDocketFile;
  currentUser?: AdminAuthUser | null;
  onClose: () => void;
  onClosureSuccess: (updatedFile: MasterDocketFile) => void;
}

export const FileClosureModal: React.FC<FileClosureModalProps> = ({
  file,
  currentUser,
  onClose,
  onClosureSuccess
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [closureReason, setClosureReason] = useState('ಸರ್ಕಾರಿ ನಿಯಮಾವಳಿಗಳನ್ವಯ ಎಲ್ಲಾ ಪರಿಶೀಲನೆಗಳು ಪೂರ್ಣಗೊಂಡಿದ್ದು, ಕಡತವನ್ನು ಅಂತಿಮ ವಿಲೇವಾರಿ ಮಾಡಲಾಗಿದೆ.');
  const [complianceNotes, setComplianceNotes] = useState('ಎಲ್ಲಾ ಪತ್ರಗಳು ಹಾಗೂ ಆವಕ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಸಕ್ಷಮ ಅಧಿಕಾರಿಯ ಅನುಮೋದನೆ ಪಡೆಯಲಾಗಿದೆ.');
  const [overridePending, setOverridePending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/files/${file.id}/closure-checklist`);
        if (res.ok) {
          const data = await res.json();
          setChecklistData(data);
        } else {
          setErrorMsg('ಕಡತದ ವಿಲೇವಾರಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿಯನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
        }
      } catch (err: any) {
        setErrorMsg('ಸರ್ವರ್ ಸಂಪರ್ಕ ದೋಷ: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [file.id]);

  const handleExecuteClosure = async () => {
    if (!closureReason.trim()) {
      setErrorMsg('ದಯವಿಟ್ಟು ಕಡತ ವಿಲೇವಾರಿ / ಮುಕ್ತಾಯಕ್ಕೆ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    if (checklistData?.requiresSupervisorOverride && !overridePending) {
      setErrorMsg('ಬಾಕಿ ಇರುವ ಪತ್ರಗಳು/ಆವಕ ದಾಖಲೆಗಳಿದ್ದಾಗ ಸೂಪರ್‌ವೈಸರ್ ಅಧಿಕೃತ ದೃಢೀಕರಣ (Supervisor Override Checkbox) ಕಡ್ಡಾಯವಾಗಿದೆ.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/files/${file.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closedBy: currentUser?.displayName || 'Administrator',
          closureReason: closureReason.trim(),
          complianceNotes: complianceNotes.trim(),
          overridePending
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onClosureSuccess(data.file || { ...file, status: 'Disposed / Closed' });
        onClose();
      } else {
        setErrorMsg(data.message || data.error || 'ಕಡತ ಮುಕ್ತಾಯ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch (err: any) {
      setErrorMsg('ದೋಷ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-kannada">
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-stone-800 shadow-[8px_8px_0px_#2b2b2b] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 border-b-2 border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
              <FolderLock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                ಅಧಿಕೃತ ಕಡತ ವಿಲೇವಾರಿ & ಮುಕ್ತಾಯ ಪರೀಕ್ಷೆ (File Closure Protocol)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ಕಡತ ಮುಕ್ತಾಯ: {file.fileNumber}</span>
                {checklistData?.fileCode && (
                  <span className="text-xs font-mono bg-amber-400 text-stone-950 px-2 py-0.5 rounded font-bold">
                    {checklistData.fileCode}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-stone-600 font-bold">ಕಡತದ ವಿಲೇವಾರಿ ಮಾನದಂಡಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Subject Banner */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                <span className="text-stone-500 font-bold text-[11px] block">ಕಡತದ ವಿಷಯ (File Subject):</span>
                <p className="font-bold text-stone-900 leading-relaxed">{file.subject}</p>
                <div className="text-[11px] text-stone-600 flex items-center gap-2 pt-1 font-mono">
                  <span>ವಿಭಾಗ: {file.section} ({file.sectionCode || 'ಆ2'})</span>
                  <span>•</span>
                  <span>ಪ್ರಾರಂಭ: {file.initiatedDate}</span>
                </div>
              </div>

              {/* Pre-Closure 4 Key Inspections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Associated Letters */}
                <div className="bg-white border-2 border-stone-200 rounded-xl p-3 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>ಒಟ್ಟು ಸೃಜಿಸಿದ ಪತ್ರಗಳು</span>
                    </span>
                    <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {checklistData?.totalLetters || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {checklistData?.pendingLettersCount === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ಎಲ್ಲಾ ಪತ್ರಗಳು ಅನುಮೋದನೆಗೊಂಡಿವೆ
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {checklistData?.pendingLettersCount} ಪತ್ರಗಳು ಪರಿಶೀಲನೆಯಲ್ಲಿವೆ
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Inward Documents Clearance */}
                <div className="bg-white border-2 border-stone-200 rounded-xl p-3 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ಆವಕ ದಾಖಲೆಗಳು (Inward Dak)</span>
                    </span>
                    <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {checklistData?.pendingInwardCount === 0 ? '0 ಬಾಕಿ' : `${checklistData?.pendingInwardCount} ಬಾಕಿ`}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {checklistData?.pendingInwardCount === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ಎಲ್ಲಾ ಆವಕ ಪತ್ರಗಳು ವಿಲೇವಾರಿಯಾಗಿವೆ
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        ಆವಕ ಪತ್ರಗಳಿಗೆ ಉತ್ತರ ಬಾಕಿಯಿದೆ
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. SLA & Deadline Status */}
                <div className="bg-white border-2 border-stone-200 rounded-xl p-3 shadow-2xs space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>ಕಾಲಮಿತಿ ಸ್ಥಿತಿ (Deadline Status):</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      checklistData?.deadlineStatus?.isOverdue
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {checklistData?.deadlineStatus?.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    ನಿಗದಿತ ಗಡುವು (Target SLA): {checklistData?.deadlineStatus?.dueDate}
                  </div>
                </div>
              </div>

              {/* Configured Office Rules Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  ಇಲಾಖಾ ಕಡತ ಮುಕ್ತಾಯ ನಿಯಮಾವಳಿಗಳು (Configured Office Rules):
                </span>
                <div className="space-y-1.5">
                  {checklistData?.configuredRules?.map((rule: any) => (
                    <div 
                      key={rule.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        rule.satisfied 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/70 border-amber-300 text-amber-950'
                      }`}
                    >
                      {rule.satisfied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">{rule.title}</strong>
                        <span className="text-[11px] opacity-90">{rule.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisor Override Required Banner */}
              {checklistData?.requiresSupervisorOverride && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ಗಮನಿಸಿ: ಕಡತದಲ್ಲಿ ಬಾಕಿ ಪತ್ರಗಳು ಅಥವಾ ಆವಕ ದಾಖಲೆಗಳಿವೆ</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    ಈ ಕಡತವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಲು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ವಿಶೇಷ ಅನುಮತಿ ಹಾಗೂ ಸಮರ್ಥನೀಯ ಕಾರಣ ದಾಖಲಿಸಬೇಕು.
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-bold text-stone-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={overridePending}
                      onChange={(e) => setOverridePending(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವಾಗಿ ಕಡತವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಲು ದೃಢೀಕರಿಸುತ್ತೇನೆ (Supervisor Override Approval)</span>
                  </label>
                </div>
              )}

              {/* Form Inputs: Reason & Compliance Note */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-800">
                    ಅಂತಿಮ ವಿಲೇವಾರಿ ಕಾರಣ (Closure Reason) *
                  </label>
                  <textarea
                    rows={2}
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                    placeholder="ಕಡತ ಮುಕ್ತಾಯದ ಕಾರಣವನ್ನು ನಮೂದಿಸಿ..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-800">
                    ನಿಯಮಾವಳಿ ಅನುಸರಣಾ ಟಿಪ್ಪಣಿ (Compliance & Regulatory Noting)
                  </label>
                  <input
                    type="text"
                    value={complianceNotes}
                    onChange={(e) => setComplianceNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                    placeholder="ಅನುಸರಣಾ ಟಿಪ್ಪಣಿ..."
                  />
                </div>
              </div>

              {/* Data Protection Guarantee */}
              <div className="bg-sky-50 border border-sky-300 rounded-xl p-3 text-[11px] text-sky-950 flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  ಕಡತ ಮುಕ್ತಾಯಗೊಂಡರೂ ಇದರ ಎಲ್ಲಾ ಪತ್ರಗಳು, ಆದೇಶಗಳು ಮತ್ತು ಲಗತ್ತುಗಳು NT Storage ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ಸಂರಕ್ಷಿಸಲ್ಪಡುತ್ತವೆ.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-200 border border-stone-300 rounded-xl cursor-pointer transition-colors"
          >
            ರದ್ದುಗೊಳಿಸಿ (Cancel)
          </button>

          <button
            type="button"
            onClick={handleExecuteClosure}
            disabled={isSubmitting || isLoading}
            className="px-5 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <FolderLock className="w-4 h-4 text-stone-950" />
            <span>{isSubmitting ? 'ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಡತ ಮುಕ್ತಾಯಗೊಳಿಸಿ (Close File)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
