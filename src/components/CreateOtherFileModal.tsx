import React, { useState } from 'react';
import { 
  FolderPlus, 
  X, 
  FileText, 
  Layers, 
  Calendar, 
  User, 
  Clock, 
  ShieldAlert, 
  Tag, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MasterDocketFile, OfficeSection, LetterPriority } from '../types';

interface CreateOtherFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (fileData: Partial<MasterDocketFile>) => Promise<void>;
  sections?: OfficeSection[];
  onShowToast?: (message: string) => void;
}

const TEMPLATE_SUBJECTS = [
  'ಶಾಲಾ ಕಟ್ಟಡ ದುರಸ್ತಿ ಮತ್ತು ವಿವೇಕ ಯೋಜನೆಯ ಕೊಠಡಿಗಳ ನಿರ್ಮಾಣ ಪ್ರಸ್ತಾವನೆ',
  'ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ಅರ್ಜಿ ವಿಚಾರಣೆ ಹಾಗೂ ಇತ್ಯರ್ಥ ಕಡತ',
  'ತಾಲ್ಲೂಕು ಮಟ್ಟದ ವಾರ್ಷಿಕ ಪ್ರತಿಭಾ ಕಾರಂಜಿ ಮತ್ತು ಕ್ರೀಡಾಕೂಟ ಆಯೋಜನೆ ಅನುದಾನ',
  'ಅಕ್ಷರ ದಾಸೋಹ ಬಿಸಿಯೂಟ ಯೋಜನೆ ದಿನಸಿ ಸಾಮಗ್ರಿಗಳ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ',
  'ಖಾಸಗಿ ಅನುದಾನರಹಿತ ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢ ಶಾಲೆಗಳ ಮಾನ್ಯತೆ ನವೀಕರಣ ಪರಿಶೀಲನೆ',
  'ರಾಷ್ಟ್ರೀಯ ಹಬ್ಬಗಳು ಮತ್ತು ಡಾ. ಸರ್ವಪಲ್ಲಿ ರಾಧಾಕೃಷ್ಣನ್ ಶಿಕ್ಷಕರ ದಿನಾಚರಣೆ ವೆಚ್ಚ ಮಂಜೂರಾತಿ',
  'ಶಾಲಾ ಸುರಕ್ಷತೆ ಮತ್ತು ಮಕ್ಕಳ ಹಕ್ಕುಗಳ ರಕ್ಷಣಾ ಸಮಿತಿ ಕಾರ್ಯನಿರ್ವಹಣೆ ಪರಿಶೀಲನೆ'
];

export const CreateOtherFileModal: React.FC<CreateOtherFileModalProps> = ({
  isOpen,
  onClose,
  onCreateFile,
  sections = [],
  onShowToast,
}) => {
  const currentYear = new Date().getFullYear();
  const randomSeq = Math.floor(100 + Math.random() * 900);
  
  const [fileNumber, setFileNumber] = useState<string>(`ಇಡಿ/ಇತರ/${currentYear}/${randomSeq}`);
  const [subject, setSubject] = useState<string>('');
  const [fileCategory, setFileCategory] = useState<string>('ಇತರ ಕಡತ (Other File)');
  const [sectionCode, setSectionCode] = useState<string>('ಆ2');
  const [sectionName, setSectionName] = useState<string>('ಸ.ಪ್ರಾ.ಶಿ');
  const [currentCustodian, setCurrentCustodian] = useState<string>('ಶ್ರೀಮತಿ ಶೈಲಜಾ (ವಿಷಯ ನಿರ್ವಾಹಕರು)');
  const [priority, setPriority] = useState<LetterPriority>('Routine');
  const [notes, setNotes] = useState<string>('');
  const [initiatedDate, setInitiatedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState<string>('');
  const [confidentiality, setConfidentiality] = useState<string>('ಸಾಮಾನ್ಯ / Open');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSectionChange = (secVal: string) => {
    setSectionCode(secVal);
    switch (secVal) {
      case 'ಆ1':
        setSectionName('ಪ್ರೌಢ ಶಿಕ್ಷಣ');
        break;
      case 'ಆ2':
        setSectionName('ಸ.ಪ್ರಾ.ಶಿ');
        break;
      case 'ಆ3':
        setSectionName('ಅನುದಾನಿತ & ಲೆಕ್ಕ');
        break;
      case 'ಆ4':
        setSectionName('ಭೌತಿಕ & ಪರೀಕ್ಷೆ');
        break;
      case 'ಆಡಳಿತ ಶಾಖೆ':
        setSectionName('ಆಡಳಿತ ಶಾಖೆ');
        break;
      default:
        setSectionName('ಇತರ ಶಾಖೆ');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('ದಯವಿಟ್ಟು ಕಡತದ ವಿಷಯ/ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const newFilePayload: Partial<MasterDocketFile> = {
        fileNumber: fileNumber.trim(),
        subject: subject.trim(),
        fileCategory: fileCategory.trim() || 'ಇತರ ಕಡತ (Other File)',
        section: (sectionName || 'Academic Wing') as any,
        sectionCode: sectionCode,
        sectionName: sectionName,
        currentCustodian: currentCustodian.trim(),
        priority: priority,
        status: 'Active / Open',
        notes: notes.trim() || 'ನೂತನ ಇತರ ಕಡತ ಸೃಜಿಸಲಾಯಿತು. ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ ಇಲಾಖಾ ಕಡತ ದಾಖಲಿಸಲಾಗಿದೆ.',
        initiatedDate: initiatedDate,
        dueDate: targetDate || undefined,
        lettersCount: 0,
        linkedLetterIds: [],
        movementHistory: [
          {
            id: `mov-${Date.now()}`,
            sentDate: new Date().toISOString().split('T')[0],
            fromOfficer: 'ನೂತನ ಕಡತ ಸೃಜನೆ (File Initiated)',
            toOfficer: currentCustodian.trim(),
            remarks: 'ಇತರ ಕಡತವನ್ನು ಅಧಿಕೃತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ ವಿಷಯ ನಿರ್ವಾಹಕರಿಗೆ ಹಸ್ತಾಂತರಿಸಲಾಯಿತು.',
            statusAfterMove: 'Active / Open',
            transferTimestamp: new Date().toISOString()
          }
        ],
        movementTrail: [
          {
            id: `mov-${Date.now()}`,
            sentDate: new Date().toISOString().split('T')[0],
            fromOfficer: 'ನೂತನ ಕಡತ ಸೃಜನೆ (File Initiated)',
            toOfficer: currentCustodian.trim(),
            remarks: 'ಇತರ ಕಡತವನ್ನು ಅಧಿಕೃತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ ವಿಷಯ ನಿರ್ವಾಹಕರಿಗೆ ಹಸ್ತಾಂತರಿಸಲಾಯಿತು.',
            statusAfterMove: 'Active / Open',
            transferTimestamp: new Date().toISOString()
          }
        ],
        auditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'CREATED',
            performedBy: currentCustodian.trim(),
            details: `ನೂತನ ಇತರ ಕಡತ #${fileNumber} ಸೃಜಿಸಲಾಯಿತು.`
          }
        ]
      };

      await onCreateFile(newFilePayload);
      if (onShowToast) {
        onShowToast(`ನೂತನ ಇತರ ಕಡತ #${fileNumber} ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಲಾಗಿದೆ!`);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to create other file:', err);
      setError(err.message || 'ಕಡತ ಸೃಜಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl max-w-2xl w-full shadow-[8px_8px_0px_#2b2b2b] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#2b2b2b] bg-[#2b2b2b] text-white rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-black">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-kannada flex items-center gap-2">
                <span>ಇತರ ಕಡತ ಸೃಜನೆ</span>
                <span className="text-[11px] font-mono font-normal text-[#f59e0b] px-2 py-0.5 bg-black/40 rounded border border-amber-500/30">
                  CREATE OTHER FILE
                </span>
              </h2>
              <p className="text-[11px] text-stone-300 font-kannada mt-0.5">
                ಸಾಮಾನ್ಯ ಆಡಳಿತ, ಯೋಜನೆಗಳು, ಸಾರ್ವಜನಿಕ ಅರ್ಜಿ ಹಾಗೂ ವಿಶೇಷ ವಿಷಯಗಳ ನೂತನ ಕಡತ ಪ್ರಾರಂಭಿಸಿ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-lg text-xs flex items-center gap-2 font-kannada">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Subject Templates */}
          <div>
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1 font-kannada mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ತ್ವರಿತ ವಿಷಯ ಮಾದರಿಗಳು (Quick Subject Templates):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_SUBJECTS.map((templ, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSubject(templ)}
                  className="text-[11px] px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-stone-300 hover:border-amber-500 rounded-md text-stone-800 text-left transition-all font-kannada cursor-pointer"
                >
                  {templ.length > 40 ? `${templ.slice(0, 40)}...` : templ}
                </button>
              ))}
            </div>
          </div>

          {/* File Number & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಕಡತ ಸಂಖ್ಯೆ (Other File Number): *
              </label>
              <input
                type="text"
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: ಇಡಿ/ಇತರ/2026/89"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಕಡತದ ವರ್ಗ (File Category): *
              </label>
              <select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada font-bold"
              >
                <option value="ಇತರ ಕಡತ (Other File)">ಇತರ ಕಡತ (Other File)</option>
                <option value="ಸಾಮಾನ್ಯ ಆಡಳಿತ (General Administration)">ಸಾಮಾನ್ಯ ಆಡಳಿತ (General Administration)</option>
                <option value="ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ & ಕಾಮಗಾರಿ (Infrastructure)">ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ & ಕಾಮಗಾರಿ (Infrastructure)</option>
                <option value="ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ (Public Grievance)">ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ (Public Grievance)</option>
                <option value="ಯೋಜನೆಗಳು & ಅನುದಾನ (Schemes & Grants)">ಯೋಜನೆಗಳು & ಅನುದಾನ (Schemes & Grants)</option>
                <option value="ಪರೀಕ್ಷಾ ನಿರ್ವಹಣೆ (Exams & Logistics)">ಪರೀಕ್ಷಾ ನಿರ್ವಹಣೆ (Exams & Logistics)</option>
                <option value="ನ್ಯಾಯಾಲಯ / ಕಾನೂನು ಪ್ರಕರಣ (Legal Matters)">ನ್ಯಾಯಾಲಯ / ಕಾನೂನು ಪ್ರಕರಣ (Legal Matters)</option>
              </select>
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
              ಕಡತದ ಮುಖ್ಯ ವಿಷಯ / ಶೀರ್ಷಿಕೆ (Subject / Title): *
            </label>
            <textarea
              rows={2}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="ಕಡತದ ಸಂಪೂರ್ಣ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ..."
              className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
            />
          </div>

          {/* Department Section & Custodian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಇಲಾಖಾ ಶಾಖೆ (Office Section): *
              </label>
              <select
                value={sectionCode}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-amber-50 font-bold text-stone-900 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
              >
                <option value="ಆ1">ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ (High School)</option>
                <option value="ಆ2">ಆ2 - ಸ.ಪ್ರಾ.ಶಿ (Primary Education)</option>
                <option value="ಆ3">ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ (Aided & Accounts)</option>
                <option value="ಆ4">ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ (Physical & Exams)</option>
                <option value="ಆಡಳಿತ ಶಾಖೆ">ಆಡಳಿತ ಶಾಖೆ (General Administration)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಪ್ರಸ್ತುತ ನಿರ್ವಹಣಾಧಿಕಾರಿ (Custodian / Case Worker):
              </label>
              <select
                value={currentCustodian}
                onChange={(e) => setCurrentCustodian(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
              >
                <option value="ಶ್ರೀಮತಿ ಶೈಲಜಾ (ವಿಷಯ ನಿರ್ವಾಹಕರು)">ಶ್ರೀಮತಿ ಶೈಲಜಾ (ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ2)</option>
                <option value="ಶ್ರೀ ರಮೇಶ್ ಕೆ.ವಿ (ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು)">ಶ್ರೀ ರಮೇಶ್ ಕೆ.ವಿ (ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು - ಆ1)</option>
                <option value="ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಸ್ (ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು)">ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಸ್ (ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು - ಆ3)</option>
                <option value="ಶ್ರೀ ಪ್ರಕಾಶ್ ನಾಯಕ್ (ಶಿಕ್ಷಣ ಸಂಯೋಜಕರು)">ಶ್ರೀ ಪ್ರಕಾಶ್ ನಾಯಕ್ (ಶಿಕ್ಷಣ ಸಂಯೋಜಕರು - ಆ4)</option>
                <option value="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO ಭದ್ರಾವತಿ)</option>
              </select>
            </div>
          </div>

          {/* Priority & Classification & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಆದ್ಯತೆ (Priority):
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LetterPriority)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              >
                <option value="Routine">ಸಾಮಾನ್ಯ (Routine)</option>
                <option value="Urgent">ತುರ್ತು (Urgent)</option>
                <option value="Immediate">ಅತೀ ತುರ್ತು (Immediate)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಪ್ರಾರಂಭ ದಿನಾಂಕ (Opening Date):
              </label>
              <input
                type="date"
                value={initiatedDate}
                onChange={(e) => setInitiatedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಅಂತಿಮ ದಿನಾಂಕ (Target Date):
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              />
            </div>
          </div>

          {/* Initial Note / Remarks */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
              ಆರಂಭಿಕ ಟಿಪ್ಪಣಿ / ಪ್ರಸ್ತಾವನೆ (Initial Note / Remarks):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ಕಡತದ ಆರಂಭಿಕ ಟಿಪ್ಪಣಿ ಅಥವಾ ಹಿನ್ನೆಲೆ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಿ..."
              className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border-2 border-stone-300 transition-colors cursor-pointer"
            >
              ರದ್ದುಗೊಳಿಸಿ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] rounded-lg border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] transition-all flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'ಸೃಜಿಸಲಾಗುತ್ತಿದೆ...' : 'ಇತರ ಕಡತ ಸೃಜಿಸಿ (Save & Create)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
