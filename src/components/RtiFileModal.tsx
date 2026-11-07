import React, { useState, useEffect } from 'react';
import { MasterDocketFile, DepartmentSection, DocumentAttachment, LetterPriority } from '../types';
import { 
  X, 
  Save, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Award
} from 'lucide-react';

interface RtiFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRtiFile: (fileData: Partial<MasterDocketFile>, createInwardLetter?: boolean) => Promise<void>;
  onOpenReplyStudioWithRti?: (file: MasterDocketFile) => void;
  initialFile?: MasterDocketFile | null;
}

export const RtiFileModal: React.FC<RtiFileModalProps> = ({
  isOpen,
  onClose,
  onSaveRtiFile,
  onOpenReplyStudioWithRti,
  initialFile,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [applicationNumber, setApplicationNumber] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicationDate, setApplicationDate] = useState(today);
  const [statutoryDueDate, setStatutoryDueDate] = useState(thirtyDaysLater);
  const [feeDetails, setFeeDetails] = useState('₹10/- ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp)');
  const [section, setSection] = useState<DepartmentSection>('Legal & Grievances');
  const [pioOfficer, setPioOfficer] = useState('ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ');
  const [apioOfficer, setApioOfficer] = useState('ಸಹಾಯಕ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ / ಕಛೇರಿ ಅಧೀಕ್ಷಕರು');
  const [informationSought, setInformationSought] = useState('');
  const [rtiStatus, setRtiStatus] = useState<
    'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' | 'ಕಡತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' | 'ಮಾಹಿತಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ' | 'ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ' | 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ'
  >('ಸ್ವೀಕರಿಸಲಾಗಿದೆ');
  const [priority, setPriority] = useState<LetterPriority>('Urgent');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);
  const [createInwardDak, setCreateInwardDak] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialFile && initialFile.isRtiFile && initialFile.rtiDetails) {
      const d = initialFile.rtiDetails;
      setApplicationNumber(d.applicationNumber || '');
      setFileNumber(initialFile.fileNumber || '');
      setApplicantName(d.applicantName || '');
      setApplicantAddress(d.applicantAddress || '');
      setApplicantPhone(d.applicantPhone || '');
      setApplicationDate(d.applicationDate || today);
      setStatutoryDueDate(d.statutoryDueDate || thirtyDaysLater);
      setFeeDetails(d.feeDetails || '₹10/- ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್');
      setSection(initialFile.section || 'Legal & Grievances');
      setPioOfficer(d.pioOfficer || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ');
      setApioOfficer(d.apioOfficer || 'ಸಹಾಯಕ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ / ಕಛೇರಿ ಅಧೀಕ್ಷಕರು');
      setInformationSought(d.informationSought || '');
      setRtiStatus(d.rtiStatus || 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ');
      setPriority(initialFile.priority || 'Urgent');
      setNotes(initialFile.notes || '');
      setAttachments(d.uploadedDocs || initialFile.attachments || []);
    } else {
      const rand = Math.floor(100 + Math.random() * 900);
      setApplicationNumber(`RTI/BEO/2026/APP-${rand}`);
      setFileNumber(`BEO/ಮಾ.ಹ/2026/ಕಡತ-${rand}`);
      setApplicantName('');
      setApplicantAddress('ಭದ್ರಾವತಿ ತಾಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ');
      setApplicantPhone('');
      setApplicationDate(today);
      setStatutoryDueDate(thirtyDaysLater);
      setFeeDetails('₹10/- ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp)');
      setSection('Legal & Grievances');
      setPioOfficer('ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ');
      setApioOfficer('ಸಹಾಯಕ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ / ಕಛೇರಿ ಅಧೀಕ್ಷಕರು');
      setInformationSought('');
      setRtiStatus('ಸ್ವೀಕರಿಸಲಾಗಿದೆ');
      setPriority('Urgent');
      setNotes('ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಸ್ವೀಕೃತವಾದ ಅರ್ಜಿ.');
      setAttachments([]);
    }
    setErrorMsg('');
  }, [initialFile, isOpen]);

  // Recalculate 30 days statutory deadline when application date changes
  const handleAppDateChange = (dateVal: string) => {
    setApplicationDate(dateVal);
    try {
      const dt = new Date(dateVal);
      if (!isNaN(dt.getTime())) {
        dt.setDate(dt.getDate() + 30);
        setStatutoryDueDate(dt.toISOString().split('T')[0]);
      }
    } catch {
      // ignore
    }
  };

  // Upload PDF or JPG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, idx: number) => {
      const reader = new FileReader();
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);

      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAtt: DocumentAttachment = {
          id: `att-rti-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          fileName: file.name,
          fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          pageCount: isPdf ? 1 : undefined,
          uploadedAt: today,
          description: isPdf ? 'ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ / ದಾಖಲೆ (Scanned RTI PDF)' : 'ಅರ್ಜಿ ಪ್ರತಿ / ರಶೀದಿ ಭಾವಚಿತ್ರ (Scanned JPG)',
          dataUrl,
        };
        setAttachments(prev => [...prev, newAtt]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      setErrorMsg('ಅರ್ಜಿದಾರರ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ (Applicant Name is required)');
      return;
    }
    if (!informationSought.trim()) {
      setErrorMsg('ಕೋರಿದ ಮಾಹಿತಿಯ ವಿವರ ಕಡ್ಡಾಯವಾಗಿದೆ (Information sought details required)');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const rtiSubject = `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ${applicantName} ರವರು ಕೋರಿರುವ ಮಾಹಿತಿ - ${informationSought.substring(0, 60)}...`;

      const fileData: Partial<MasterDocketFile> = {
        fileNumber,
        subject: rtiSubject,
        section,
        priority,
        currentCustodian: pioOfficer,
        initiatedDate: applicationDate,
        status: rtiStatus === 'ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ' ? 'Disposed / Closed' : 'Active / Open',
        notes,
        isRtiFile: true,
        attachments,
        rtiDetails: {
          applicationNumber,
          applicantName,
          applicantAddress,
          applicantPhone,
          applicationDate,
          statutoryDueDate,
          feeDetails,
          pioOfficer,
          apioOfficer,
          informationSought,
          rtiStatus,
          firstAppellateAuthority: 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
          uploadedDocs: attachments,
        },
      };

      await onSaveRtiFile(fileData, createInwardDak);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸೃಜಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Calculate days remaining until 30-day deadline
  const calculateDaysRemaining = () => {
    try {
      const due = new Date(statutoryDueDate).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((due - now) / (1000 * 3600 * 24));
      return diff;
    } catch {
      return 30;
    }
  };
  const daysLeft = calculateDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-stone-300 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm shadow-xs">
              ಮಾ.ಹ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-100 font-sans">
                  {initialFile ? 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಪರಿಷ್ಕರಣೆ (Edit RTI File)' : 'ಹೊಸ ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸೃಜಿಸಿ (Create RTI Docket)'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950">
                  RTI ACT 2005
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ • Right to Information File & Document Repository
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Day Statutory Badge Banner */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>ಕಲಂ 7(1) ರನ್ವಯ 30 ದಿನಗಳ ಕಾಲಮಿತಿ ವಿಲೇವಾರಿ ಗಡುವು:</span>
            <strong className="underline font-mono">{statutoryDueDate}</strong>
          </div>
          <div>
            {daysLeft > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {daysLeft} ದಿನಗಳು ಬಾಕಿ ಇದೆ (Active)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                ಕಾಲಮಿತಿ ಮೀರಿದೆ / ತುರ್ತು!
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: File & Application Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸಂಖ್ಯೆ (RTI File Number) *
              </label>
              <input
                type="text"
                value={fileNumber}
                onChange={e => setFileNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ಅರ್ಜಿ ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆ (RTI Application No.) *
              </label>
              <input
                type="text"
                value={applicationNumber}
                onChange={e => setApplicationNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Applicant Details */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>ಅರ್ಜಿದಾರರ ವಿವರಗಳು (Applicant Details)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು (Applicant Full Name) *
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="ಉದಾ: ಶ್ರೀ ಕೆ. ರಾಮಕೃಷ್ಣ ಭಟ್"
                  required
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 font-medium focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  ಸಂಪರ್ಕ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone / Mobile)
                </label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={e => setApplicantPhone(e.target.value)}
                  placeholder="+91 94480 00000"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಅಂಚೆ ವಿಳಾಸ (Complete Postal Address)
              </label>
              <textarea
                rows={2}
                value={applicantAddress}
                onChange={e => setApplicantAddress(e.target.value)}
                placeholder="ಮನೆ ಸಂಖ್ಯೆ, ಬಡಾವಣೆ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Section 3: Dates, Fee & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ಅರ್ಜಿ ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={e => handleAppDateChange(e.target.value)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ಕಾಲಮಿತಿ ವಿಲೇವಾರಿ ಗಡುವು (30 Days)
              </label>
              <input
                type="date"
                value={statutoryDueDate}
                onChange={e => setStatutoryDueDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ಅರ್ಜಿ ಶುಲ್ಕ ವಿವರ (Fee Paid)
              </label>
              <input
                type="text"
                value={feeDetails}
                onChange={e => setFeeDetails(e.target.value)}
                placeholder="₹10/- ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್"
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Section 4: Information Sought */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ಕೋರಿದ ಮಾಹಿತಿಯ ವಿವರಗಳು (Information Sought under RTI Act) *
            </label>
            <textarea
              rows={4}
              value={informationSought}
              onChange={e => setInformationSought(e.target.value)}
              placeholder="1. ಭದ್ರಾವತಿ ವಲಯದ ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರ ಜ್ಯೇಷ್ಠತಾ ಪಟ್ಟಿ ಮತ್ತು ವರ್ಗಾವಣೆ ದಾಖಲೆಗಳು.&#10;2. 2025-26 ನೇ ಸಾಲಿನ ಅನುದಾನ ಬಿಡುಗಡೆ ವಿವರಗಳು.&#10;3. ಪ್ರಮಾಣೀಕೃತ ಪ್ರತಿಗಳನ್ನು ಒದಗಿಸುವುದು..."
              required
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 font-sans leading-relaxed focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Section 5: Officers & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                ಸಂಬಂಧಪಟ್ಟ ಶಾಖೆ (Section)
              </label>
              <select
                value={section}
                onChange={e => setSection(e.target.value as DepartmentSection)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              >
                <option value="Legal & Grievances">Legal & Grievances (ಕಾನೂನು & RTI)</option>
                <option value="Administration & Services">Administration (ಆಡಳಿತ & ಸೇವಾ)</option>
                <option value="Academic Wing">Academic Wing (ಶೈಕ್ಷಣಿಕ ಶಾಖೆ)</option>
                <option value="Accounts & Grants">Accounts & Grants (ಲೆಕ್ಕಪತ್ರ ಶಾಖೆ)</option>
                <option value="Inspection & Quality">Inspection (ಪರಿಶೀಲನೆ & ಶಾಲೆಗಳು)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                ಕಡತದ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (RTI Status)
              </label>
              <select
                value={rtiStatus}
                onChange={e => setRtiStatus(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800"
              >
                <option value="ಸ್ವೀಕರಿಸಲಾಗಿದೆ">ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ (Received)</option>
                <option value="ಕಡತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ">ಕಡತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)</option>
                <option value="ಮಾಹಿತಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ">ಮಾಹಿತಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ (Info Prepared)</option>
                <option value="ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ">ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ (Dispatched/Furnished)</option>
                <option value="ತಿರಸ್ಕರಿಸಲಾಗಿದೆ">ಕಲಂ 8/9 ಅಡಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                ಆದ್ಯತೆ (Priority)
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as LetterPriority)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              >
                <option value="Urgent">Urgent (ತುರ್ತು - 30 ದಿನಗಳ ಮಿತಿ)</option>
                <option value="Immediate">Immediate (ಅತ್ಯಂತ ತುರ್ತು - ಜೀವ/ಸ್ವಾತಂತ್ರ್ಯ 48 ಗಂಟೆ)</option>
                <option value="Routine">Routine (ಸಾಮಾನ್ಯ)</option>
              </select>
            </div>
          </div>

          {/* Section 6: UPLOAD PDF OR JPG (Key User Requirement) */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-amber-700" />
                  <span>ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ (Upload PDF or JPG)</span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ಪ್ರತಿ (Form A), ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್/ಐಪಿಒ ರಶೀದಿ, ಅಥವಾ ಮಾಹಿತಿಗೆ ಸಂಬಂಧಿಸಿದ PDF/JPG ದಾಖಲೆಗಳನ್ನು ಇಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
                </p>
              </div>
              <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>PDF / JPG ಆಯ್ಕೆಮಾಡಿ</span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 ? (
              <div className="space-y-2 pt-1">
                {attachments.map(att => {
                  const isPdf = att.fileType === 'application/pdf' || att.fileName.toLowerCase().endsWith('.pdf');
                  return (
                    <div
                      key={att.id}
                      className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isPdf ? (
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                            PDF
                          </div>
                        ) : att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt={att.fileName}
                            className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                            JPG
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-xs font-bold text-stone-900 block truncate">
                            {att.fileName}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {att.fileSize} • {isPdf ? 'ಪಿಡಿಎಫ್ ದಾಖಲೆ' : 'ಜೆಪಿಜಿ ಚಿತ್ರ ಪ್ರತಿ'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="ತೆಗೆದುಹಾಕಿ (Remove)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-white/80 rounded-lg border border-dashed border-amber-300 text-center text-xs text-stone-500">
                ಯಾವುದೇ PDF ಅಥವಾ JPG ದಾಖಲೆಗಳು ಲಗತ್ತಿಸಲ್ಪಟ್ಟಿಲ್ಲ. ಮೇಲಿನ <strong>'PDF / JPG ಆಯ್ಕೆಮಾಡಿ'</strong> ಬಟನ್ ಒತ್ತಿ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
              </div>
            )}
          </div>

          {/* Inward Dak Sync Option */}
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
            <input
              type="checkbox"
              id="chk-sync-inward"
              checked={createInwardDak}
              onChange={e => setCreateInwardDak(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="chk-sync-inward" className="text-stone-700 font-medium">
              ಈ ಅರ್ಜಿಯನ್ನು ಬಿ.ಇ.ಒ ಆವಕ್ (Inward Dak) ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿಯೂ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಾಖಲಿಸಿ
            </label>
          </div>

          {/* Buttons Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
            {initialFile && onOpenReplyStudioWithRti && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReplyStudioWithRti(initialFile);
                }}
                className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs border border-amber-500/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                <span>ಈ ಮಾಹಿತಿಗೆ ಪತ್ರ ತಯಾರಿಸು (Draft Reply Letter)</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSubmitting ? 'ಕಡತ ಸೃಜಿಸಲಾಗುತ್ತಿದೆ...' : initialFile ? 'ಕಡತ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ' : 'ಕಡತ ಸೃಜಿಸಿ (Save RTI File)'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
