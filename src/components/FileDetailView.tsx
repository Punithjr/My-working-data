import React, { useState, useEffect } from 'react';
import { 
  MasterDocketFile, 
  EducationLetter, 
  LetterPriority 
} from '../types';
import { 
  FileText, 
  Send, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  FileDown, 
  Printer, 
  ShieldAlert, 
  Sparkles, 
  Layers,
  ChevronRight,
  Plus,
  Eye,
  Check,
  Building,
  AlertTriangle,
  FolderLock,
  Folder,
  HardDrive,
  Download,
  FileSpreadsheet,
  BookOpen,
  Trash2
} from 'lucide-react';
import { generateDocketDossierSummaryPdf } from '../utils/docketDossierPdfExport';
import { generateLetterPdf } from '../utils/letterPdfExport';
import { FileClosureModal } from './FileClosureModal';
import { GovOrderSelectorModal } from './GovOrderSelectorModal';

export interface FileDetailViewProps {
  file: MasterDocketFile;
  linkedLetters?: EducationLetter[];
  onForwardFile?: (file: MasterDocketFile) => void;
  onDraftLetter?: (file: MasterDocketFile) => void;
  onViewLetter?: (letter: EducationLetter) => void;
  onDeleteFile?: (fileId: string) => void;
  onFileUpdated?: (updated: MasterDocketFile) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({
  file,
  linkedLetters = [],
  onForwardFile,
  onDraftLetter,
  onViewLetter,
  onDeleteFile,
  onFileUpdated,
  onClose,
  isEmbedded = false,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [storageData, setStorageData] = useState<any>(null);
  const [showStorageBox, setShowStorageBox] = useState(false);
  const [attachedReferences, setAttachedReferences] = useState<any[]>([]);
  const [isGovOrderModalOpen, setIsGovOrderModalOpen] = useState(false);

  const fetchReferences = () => {
    fetch(`/api/files/${file.id}/references`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success && Array.isArray(data.references)) {
          setAttachedReferences(data.references);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`/api/files/${file.id}/storage`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStorageData(data);
      })
      .catch(() => {});
    fetchReferences();
  }, [file.id, linkedLetters.length]);

  const handleAttachReference = async (citation: string, fullDetails?: any) => {
    try {
      const res = await fetch(`/api/files/${file.id}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceType: fullDetails?.orderNumber ? 'gov_order' : 'statutory_rule',
          referenceId: fullDetails?.id || '',
          title: fullDetails?.subject || fullDetails?.title || 'ಸರ್ಕಾರಿ ಉಲ್ಲೇಖ',
          citation,
          subject: fullDetails?.subject || fullDetails?.title || '',
          ruleOrOrderNumber: fullDetails?.orderNumber || fullDetails?.ruleNumber || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReferences();
      }
    } catch (e) {}
  };

  const handleRemoveReference = async (refId: string) => {
    try {
      const res = await fetch(`/api/files/${file.id}/references/${refId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchReferences();
      }
    } catch (e) {}
  };

  const handleGenerateDossierSummary = () => {
    setIsGeneratingPdf(true);
    try {
      generateDocketDossierSummaryPdf(file, linkedLetters);
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error generating docket dossier PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getPriorityBadge = (priority: LetterPriority | string) => {
    switch (priority) {
      case 'Immediate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            ಅತೀ ತುರ್ತು (Immediate)
          </span>
        );
      case 'Urgent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
            ತುರ್ತು (Urgent)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-700 text-stone-300 border border-stone-600 font-mono">
            ಸಾಮಾನ್ಯ (Routine)
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status?.includes('Closed') || status?.includes('Disposed') || status?.includes('ವಿಲೇವಾರಿ')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          ವಿಲೇವಾರಿಯಾಗಿದೆ (Disposed)
        </span>
      );
    }
    if (status?.includes('Under Review') || status?.includes('Under Scrutiny') || status?.includes('ಪರಿಶೀಲನೆ')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Scrutiny)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-600 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        ಚಾಲ್ತಿಯಲ್ಲಿದೆ ({status || 'Active'})
      </span>
    );
  };

  const movements = file.movementHistory || file.movementTrail || [];

  return (
    <div className={`bg-white rounded-xl border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] overflow-hidden ${isEmbedded ? '' : 'max-w-5xl mx-auto'}`}>
      {/* Toast Notification */}
      {pdfSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold font-kannada flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>ಕಡತ ಸಂ: {file.fileNumber} ರ ಸಮಗ್ರ ಡಾಸಿಯರ್ ಸಾರಾಂಶ PDF ಯಶಸ್ವಿಯಾಗಿ ಸೃಜನೆಯಾಗಿದೆ!</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ</span>
        </div>
      )}

      {/* Header of Selected Docket */}
      <div className="bg-[#2b2b2b] text-white p-5 border-b-2 border-[#2b2b2b]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-[#f59e0b] text-[#2b2b2b] font-mono font-bold text-xs">
              ಕಡತ ಸಂಖ್ಯೆ: {file.fileNumber}
            </span>
            <span className="text-xs bg-stone-800 text-stone-200 px-2 py-0.5 rounded font-mono">
              ಪ್ರಾರಂಭ: {file.initiatedDate}
            </span>
            {file.sectionCode && (
              <span className="text-xs bg-stone-800 text-amber-300 px-2 py-0.5 rounded font-bold border border-stone-700">
                ಶಾಖೆ: {file.sectionCode} ({file.sectionName || ''})
              </span>
            )}
            {getPriorityBadge(file.priority)}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(file.status)}
            
            {/* 🌟 Prominent Generate Dossier Summary Button */}
            <button
              type="button"
              id={`btn-generate-dossier-summary-${file.id}`}
              onClick={handleGenerateDossierSummary}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#f59e0b] cursor-pointer font-kannada shrink-0"
              title="ಕಡತದ ಟಿಪ್ಪಣಿ, ಚಲನವಲನ ಆಡಿಟ್ ಲಾಗ್ ಮತ್ತು ಪತ್ರಗಳ ಸಮಗ್ರ PDF ಡಾಸಿಯರ್ ಸಾರಾಂಶ ರಚಿಸಿ (Quick Supervisor Review)"
            >
              <FileDown className="w-4 h-4 text-stone-950" />
              <span>{isGeneratingPdf ? 'ಡಾಸಿಯರ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...' : 'ಡಾಸಿಯರ್ ಸಾರಾಂಶ PDF'}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-white p-1 rounded-md text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#fffbf2] font-kannada leading-snug mb-3">
          {file.subject}
        </h3>

        {/* Custodian & Action Bar */}
        <div className="bg-black/40 rounded-lg p-3 border border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-kannada">ಪ್ರಸ್ತುತ ಕಡತ ಇರುವ ಅಧಿಕಾರಿ (Current Custodian):</span>
              <strong className="text-amber-300 font-kannada text-xs">{file.currentCustodian}</strong>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onForwardFile && (
              <button
                id="btn-forward-docket-detail"
                onClick={() => onForwardFile(file)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#10b981] cursor-pointer font-kannada"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ಫಾರ್ವರ್ಡ್ ಮಾಡಿ</span>
              </button>
            )}

            {onDraftLetter && (
              <button
                id="btn-draft-letter-for-file-detail"
                onClick={() => onDraftLetter(file)}
                className="px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-amber-500 text-[#2b2b2b] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#2b2b2b] cursor-pointer font-kannada"
                title="ಈ ಕಡತದ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಹೊಸ ಪತ್ರ ಸೃಜಿಸಿ (File-First Letter Creation)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ ಕಡತದಲ್ಲಿ ಪತ್ರ ರಚಿಸಿ</span>
              </button>
            )}

            {file.status !== 'Disposed / Closed' && (
              <button
                id="btn-close-file-protocol"
                onClick={() => setIsClosureModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#991b1b] cursor-pointer font-kannada"
                title="ಕಡತ ಮುಕ್ತಾಯ ಪರೀಕ್ಷೆ & ಅಂತಿಮ ವಿಲೇವಾರಿ (Close File Protocol)"
              >
                <FolderLock className="w-3.5 h-3.5 text-white" />
                <span>ಕಡತ ಮುಕ್ತಾಯ (Close File)</span>
              </button>
            )}

            <a
              href={`/api/files/${file.id}/export-excel`}
              download
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#065f46] cursor-pointer font-kannada"
              title="ಕಡತದ ಪತ್ರಗಳ ರಿಜಿಸ್ಟರ್ Excel (.xlsx) ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Excel (.xlsx)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowStorageBox(!showStorageBox)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-600 cursor-pointer font-kannada"
              title="ಕಡತದ ಸ್ಥಳೀಯ NT Storage ಫೋಲ್ಡರ್ ಪರಿಶೀಲಿಸಿ"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>NT Storage ({file.fileCode || 'FILE'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-6">
        {/* NT Storage Inspection Card */}
        {showStorageBox && (
          <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border-2 border-stone-800 space-y-3 font-mono animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-700 pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-kannada text-amber-300">
                  ಸ್ಥಳೀಯ NT Storage ಫೋಲ್ಡರ್ ರಚನೆ (Local Storage Structure):
                </span>
                <span className="text-[11px] bg-stone-800 text-amber-200 px-2 py-0.5 rounded font-mono font-bold border border-stone-700">
                  BEO_EOFFICE/Files/{file.fileCode || 'FILE-0001'}/
                </span>
              </div>
              <a
                href="/api/storage/download-zip"
                download
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-[11px] font-bold font-kannada flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                title="ಸಂಪೂರ್ಣ BEO_EOFFICE ಫೋಲ್ಡರ್ ZIP ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ZIP ಡೌನ್‌ಲೋಡ್</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { name: 'File_Details', count: storageData?.contents?.File_Details?.length || 2, desc: 'metadata.json, summary.txt' },
                { name: 'Inward', count: storageData?.contents?.Inward?.length || 0, desc: 'ಆವಕ ದಾಖಲೆಗಳು' },
                { name: 'Letters', count: storageData?.contents?.Letters?.length || linkedLetters.length, desc: 'ಸೃಜಿಸಿದ ಪತ್ರಗಳು' },
                { name: 'Orders', count: storageData?.contents?.Orders?.length || 0, desc: 'ಆದೇಶಗಳು & ಜ್ಞಾಪನಗಳು' },
                { name: 'Reports', count: storageData?.contents?.Reports?.length || (file.status?.includes('Closed') ? 1 : 0), desc: 'ಡಾಸಿಯರ್ & ವಿಲೇವಾರಿ ವರದಿ' },
                { name: 'Attachments', count: storageData?.contents?.Attachments?.length || (file.attachments?.length || 0), desc: 'ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು' },
              ].map(sub => (
                <div key={sub.name} className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{sub.name}/</span>
                    <span className="bg-stone-700 text-stone-200 px-1.5 py-0.2 rounded text-[10px]">
                      {sub.count} ಫೈಲ್
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-kannada">{sub.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 font-kannada">
              * ಪ್ರತಿಯೊಂದು ಸೃಜಿಸಲಾದ ಪತ್ರ, ಆದೇಶ ಮತ್ತು ದಾಖಲೆಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಈ ಕಡತದ ಫೋಲ್ಡರ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾಗುತ್ತವೆ.
            </p>
          </div>
        )}
        {/* Supervisory Quick Summary Card */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950 font-kannada">
                ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನಾ ಡೆಸ್ಕ್ (Supervisor Dossier Review Desk)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 font-mono">
                SLA: {file.dueDate || '30 ದಿನಗಳು'}
              </span>
            </div>
            <p className="text-xs text-stone-700 font-kannada">
              ಈ ಕಡತದ ಎಲ್ಲಾ ಆಂತರಿಕ ಟಿಪ್ಪಣಿಗಳು, ಚಲನವಲನ ಆಡಿಟ್ ಲಾಗ್ ಹಾಗೂ ಲಿಂಕ್ ಆದ ಪತ್ರಗಳ ಏಕೀಕೃತ ವಿವರಗಳನ್ನು ಅಧಿಕೃತ ಮುದ್ರಣ ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಡಾಸಿಯರ್ ಸಾರಾಂಶ ಬಳಸಿಕೊಳ್ಳಿ.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateDossierSummary}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer font-kannada shadow-sm self-start md:self-auto"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Dossier Summary (PDF)</span>
          </button>
        </div>

        {/* Docket Notes & Administrative Directives */}
        {file.notes && (
          <div className="bg-stone-100 rounded-xl p-4 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs font-kannada">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>ಅಧಿಕೃತ ಕಡತ ಟಿಪ್ಪಣಿ & ನಿರ್ದೇಶನಗಳು (Official Docket Notes):</span>
            </div>
            <p className="text-xs text-stone-800 font-kannada leading-relaxed pl-6 whitespace-pre-wrap">
              {file.notes}
            </p>
          </div>
        )}

        {/* Timeline & Movement Audit Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-stone-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-stone-900 font-kannada">
                ಕಡತದ ಅಧಿಕೃತ ಚಲನವಲನ ಆಡಿಟ್ ಲಾಗ್ (Movement Trail & Audit Logs)
              </h4>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold font-mono">
              ಒಟ್ಟು {movements.length} ಹಂತಗಳು
            </span>
          </div>

          {movements.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs font-bold text-stone-700 font-kannada">ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ಚಲನವಲನ ದಾಖಲಾಗಿಲ್ಲ</p>
              {onForwardFile && (
                <button
                  onClick={() => onForwardFile(file)}
                  className="px-3 py-1.5 bg-[#2b2b2b] text-white text-xs rounded font-bold hover:bg-black font-kannada cursor-pointer"
                >
                  ಮೊದಲ ಚಲನವಲನ ದಾಖಲಿಸಿ
                </button>
              )}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-300">
              {movements.map((mov, index) => {
                const isLatest = index === movements.length - 1;

                return (
                  <div key={mov.id || index} className="relative group">
                    {/* Step Bullet Icon */}
                    <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                      isLatest
                        ? 'bg-emerald-600 text-white border-white ring-4 ring-emerald-100 animate-pulse'
                        : 'bg-white text-[#2b2b2b] border-[#2b2b2b]'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Step Content Box */}
                    <div className={`rounded-xl p-4 border-2 transition-all ${
                      isLatest
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-[3px_3px_0px_#10b981]'
                        : 'bg-stone-50 border-stone-200 shadow-sm'
                    }`}>
                      {/* Step Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{mov.sentDate}</span>
                        </div>

                        {mov.statusAfterMove && (
                          <div>{getStatusBadge(mov.statusAfterMove)}</div>
                        )}
                      </div>

                      {/* Officer Flow */}
                      <div className="bg-white rounded-lg p-3 border border-stone-200 mb-2.5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-kannada">
                          <span className="text-stone-500 font-medium text-[11px] shrink-0">ಇವರಿಂದ (From):</span>
                          <strong className="text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                            {mov.fromOfficer}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-kannada">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-stone-500 font-medium text-[11px] shrink-0">ಇವರಿಗೆ (To):</span>
                          <strong className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {mov.toOfficer}
                          </strong>
                        </div>
                      </div>

                      {/* Remarks / Official Noting */}
                      {mov.remarks && (
                        <div className="bg-amber-50/70 border-l-4 border-amber-400 p-2.5 rounded-r text-xs text-stone-800 font-kannada space-y-1">
                          <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">
                            ಅಧಿಕೃತ ಷರಾ (Official Noting / Remarks):
                          </span>
                          <p className="leading-relaxed">{mov.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attached Government Orders & Statutory References */}
        <div className="pt-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              ಸಂಬಂಧಿಸಿದ ಸರ್ಕಾರಿ ಆದೇಶಗಳು & ಉಲ್ಲೇಖ ಪುಸ್ತಕಗಳು ({attachedReferences.length})
            </h5>
            <button
              onClick={() => setIsGovOrderModalOpen(true)}
              className="text-[11px] font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1 cursor-pointer font-kannada transition-colors"
            >
              <Plus className="w-3 h-3" /> + ಸರ್ಕಾರಿ ಉಲ್ಲೇಖ ಲಗತ್ತಿಸಿ
            </button>
          </div>

          {attachedReferences.length === 0 ? (
            <p className="text-xs text-stone-500 font-kannada italic bg-stone-50 p-3 rounded border border-stone-200">
              ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ಸರ್ಕಾರಿ ಆದೇಶ ಅಥವಾ ಶಾಸನಬದ್ಧ ನಿಯಮಾವಳಿಗಳನ್ನು ಲಗತ್ತಿಸಲಾಗಿಲ್ಲ.
            </p>
          ) : (
            <div className="space-y-2">
              {attachedReferences.map((ref) => (
                <div
                  key={ref.id}
                  className="bg-emerald-50/40 hover:bg-emerald-50 rounded-lg p-2.5 border border-emerald-200 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] border border-emerald-300">
                        {ref.ruleOrOrderNumber || 'GO/Rule'}
                      </span>
                      <span className="text-stone-500 text-[10px] font-mono">
                        {ref.attachedAt?.split('T')[0] || ''}
                      </span>
                    </div>
                    <p className="font-bold text-stone-800 line-clamp-1 font-kannada">{ref.citation || ref.title}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveReference(ref.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                    title="ಉಲ್ಲೇಖವನ್ನು ತೆಗೆದುಹಾಕಿ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Letters Section */}
        <div className="pt-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#f59e0b]" />
              ಈ ಕಡತದ ಅಡಿಯಲ್ಲಿ ಸೃಜಿಸಲಾದ ಪತ್ರಗಳು ({linkedLetters.length})
            </h5>
            {onDraftLetter && (
              <button
                onClick={() => onDraftLetter(file)}
                className="text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg border border-[#2b2b2b] shadow-2xs flex items-center gap-1 cursor-pointer font-kannada transition-colors"
              >
                <Plus className="w-3 h-3 stroke-[3]" /> ಹೊಸ ಪತ್ರ ರಚಿಸಿ
              </button>
            )}
          </div>

          {linkedLetters.length === 0 ? (
            <p className="text-xs text-stone-500 font-kannada italic bg-stone-50 p-3 rounded border border-stone-200">
              ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ಅಧಿಕೃತ ಪತ್ರಗಳು ಇನ್ನೂ ಜೋಡಣೆಯಾಗಿಲ್ಲ.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedLetters.map((letItem) => {
                const rawRef = letItem.referenceNumber || (letItem as any).letterNumber || '';
                const cleanRef = rawRef.startsWith('ಪತ್ರ ಸಂ:') ? rawRef : `ಪತ್ರ ಸಂ: ${rawRef}`;
                return (
                  <div
                    key={letItem.id}
                    className="bg-stone-50 hover:bg-amber-50/30 rounded-lg p-2.5 border border-stone-200 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#2b2b2b] bg-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-300">
                          {cleanRef}
                        </span>
                        <span className="text-stone-500 text-[10px] font-mono">
                          {letItem.dateReceivedOrIssued}
                        </span>
                        {letItem.status && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                            {letItem.status}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-stone-800 line-clamp-1 mt-1 font-kannada">{letItem.subject}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => generateLetterPdf(letItem)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded border border-emerald-700 text-[11px] font-bold cursor-pointer font-kannada shadow-2xs flex items-center gap-1"
                        title="ಪತ್ರದ ಅಧಿಕೃತ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download Letter PDF)"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      {onViewLetter && (
                        <button
                          onClick={() => onViewLetter(letItem)}
                          className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 rounded border border-stone-300 text-[11px] font-bold cursor-pointer font-kannada shadow-2xs"
                        >
                          ವೀಕ್ಷಿಸಿ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isClosureModalOpen && (
        <FileClosureModal
          file={file}
          onClose={() => setIsClosureModalOpen(false)}
          onClosureSuccess={(updated) => {
            if (onFileUpdated) onFileUpdated(updated);
            setPdfSuccessToast(true);
          }}
        />
      )}

      {isGovOrderModalOpen && (
        <GovOrderSelectorModal
          isOpen={isGovOrderModalOpen}
          onClose={() => setIsGovOrderModalOpen(false)}
          onSelectReference={(citation, fullDetails) => {
            handleAttachReference(citation, fullDetails);
          }}
        />
      )}
    </div>
  );
};
