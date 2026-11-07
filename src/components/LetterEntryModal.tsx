import React, { useState, useEffect } from 'react';
import { 
  EducationLetter, 
  LetterCategory, 
  DepartmentSection, 
  LetterPriority, 
  LetterStatus, 
  ConfidentialityLevel,
  DocumentAttachment,
  Employee
} from '../types';
import { 
  X, 
  Save, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Paperclip, 
  UploadCloud, 
  Trash2, 
  Building, 
  DollarSign,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';

interface LetterEntryModalProps {
  isOpen: boolean;
  initialLetter: EducationLetter | null;
  onClose: () => void;
  onSave: (letterData: Partial<EducationLetter>) => Promise<void>;
  employees?: Employee[];
}

export const LetterEntryModal: React.FC<LetterEntryModalProps> = ({
  isOpen,
  initialLetter,
  onClose,
  onSave,
  employees = [],
}) => {
  const [direction, setDirection] = useState<'inward' | 'outward'>('inward');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<LetterCategory>('Circular & Directive');
  const [section, setSection] = useState<DepartmentSection>('Academic Wing');
  const [priority, setPriority] = useState<LetterPriority>('Routine');
  const [status, setStatus] = useState<LetterStatus>('Pending Action');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('Public / Open');
  const [senderName, setSenderName] = useState('');
  const [senderDesignation, setSenderDesignation] = useState('');
  const [senderDepartment, setSenderDepartment] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientDesignation, setRecipientDesignation] = useState('');
  const [recipientDepartment, setRecipientDepartment] = useState('');
  const [dateReceivedOrIssued, setDateReceivedOrIssued] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [financialAmount, setFinancialAmount] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [endorsementsText, setEndorsementsText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);
  // ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ಲಿಂಕ್ (Pursuant to Government Order)
  const [linkedOrderNumber, setLinkedOrderNumber] = useState('');
  const [linkedOrderId, setLinkedOrderId] = useState('');
  const [linkedOrderDate, setLinkedOrderDate] = useState('');
  const [linkedOrderSubject, setLinkedOrderSubject] = useState('');
  const [linkedOrderType, setLinkedOrderType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialLetter) {
      setDirection(initialLetter.direction);
      setReferenceNumber(initialLetter.referenceNumber);
      setFileNumber(initialLetter.fileNumber);
      setSubject(initialLetter.subject);
      setCategory(initialLetter.category);
      setSection(initialLetter.section);
      setPriority(initialLetter.priority);
      setStatus(initialLetter.status);
      setConfidentiality(initialLetter.confidentiality);
      setSenderName(initialLetter.senderName);
      setSenderDesignation(initialLetter.senderDesignation);
      setSenderDepartment(initialLetter.senderDepartment);
      setRecipientName(initialLetter.recipientName);
      setRecipientDesignation(initialLetter.recipientDesignation);
      setRecipientDepartment(initialLetter.recipientDepartment);
      setDateReceivedOrIssued(initialLetter.dateReceivedOrIssued);
      setDueDate(initialLetter.dueDate);
      setAssignedOfficer(initialLetter.assignedOfficer);
      setFinancialAmount(initialLetter.financialAmount ? String(initialLetter.financialAmount) : '');
      setBodyText(initialLetter.bodyText);
      setEndorsementsText(initialLetter.endorsements ? initialLetter.endorsements.join('\n') : '');
      setTagsInput(initialLetter.tags.join(', '));
      setAttachments(initialLetter.attachments || []);
      setLinkedOrderNumber(initialLetter.linkedOrderNumber || '');
      setLinkedOrderId(initialLetter.linkedOrderId || '');
      setLinkedOrderDate(initialLetter.linkedOrderDate || '');
      setLinkedOrderSubject(initialLetter.linkedOrderSubject || '');
      setLinkedOrderType(initialLetter.linkedOrderType || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const randomNum = Math.floor(1000 + Math.random() * 9000);

      setDirection('inward');
      setReferenceNumber(`EDN-DEPT/${new Date().getFullYear()}/INW-${randomNum}`);
      setFileNumber(`FILE-${new Date().getFullYear()}/ACAD-GEN/0${Math.floor(10 + Math.random() * 90)}`);
      setSubject('');
      setCategory('Circular & Directive');
      setSection('Academic Wing');
      setPriority('Routine');
      setStatus('Pending Action');
      setConfidentiality('Public / Open');
      setSenderName('');
      setSenderDesignation('');
      setSenderDepartment('');
      setRecipientName('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)');
      setRecipientDesignation('Block Education Officer');
      setRecipientDepartment('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ');
      setDateReceivedOrIssued(today);
      setDueDate(due);
      setAssignedOfficer('Section Officer (Academic Wing)');
      setFinancialAmount('');
      setBodyText('');
      setEndorsementsText('1. Joint Director (Planning)\n2. Concerned District Education Officers\n3. Guard File');
      setTagsInput('#EducationDept, #Compliance');
      setAttachments([]);
      setLinkedOrderNumber('');
      setLinkedOrderId('');
      setLinkedOrderDate('');
      setLinkedOrderSubject('');
      setLinkedOrderType('');
    }
    setErrors({});
  }, [initialLetter, isOpen]);

  if (!isOpen) return null;

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: DocumentAttachment[] = Array.from(files).map((file: File, idx: number) => ({
      id: `att-${Date.now()}-${idx}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.type || 'application/pdf',
      pageCount: Math.floor(2 + Math.random() * 8),
      uploadedAt: new Date().toISOString().split('T')[0],
      description: 'Scanned official department copy',
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Subject line is mandatory';
    if (!referenceNumber.trim()) newErrors.referenceNumber = 'Reference Number is mandatory';
    if (!senderName.trim()) newErrors.senderName = 'Sender / Authority name is mandatory';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith('#') ? t : `#${t}`));

      const parsedEndorsements = endorsementsText
        .split('\n')
        .map(e => e.trim())
        .filter(Boolean);

      await onSave({
        direction,
        referenceNumber,
        fileNumber,
        subject,
        category,
        section,
        priority,
        status,
        confidentiality,
        senderName,
        senderDesignation,
        senderDepartment,
        recipientName,
        recipientDesignation,
        recipientDepartment,
        dateReceivedOrIssued,
        dueDate,
        assignedOfficer,
        financialAmount: financialAmount ? parseFloat(financialAmount) : undefined,
        bodyText,
        endorsements: parsedEndorsements,
        tags: parsedTags,
        attachments,
        linkedOrderNumber: linkedOrderNumber.trim() || undefined,
        linkedOrderId: linkedOrderId.trim() || undefined,
        linkedOrderDate: linkedOrderDate.trim() || undefined,
        linkedOrderSubject: linkedOrderSubject.trim() || undefined,
        linkedOrderType: linkedOrderType.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err?.message || 'Failed to save letter record' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        id="letter-entry-modal"
        className="bg-white rounded-2xl w-full max-w-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">
              Official Correspondence Entry
            </span>
            <h2 className="text-base font-bold text-stone-900 mt-1">
              {initialLetter ? 'Edit Correspondence Record' : 'Log Official Letter / Inward Dak'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errors.form && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
              {errors.form}
            </div>
          )}

          {/* Direction Toggle */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-800 block">Correspondence Flow</span>
              <span className="text-[11px] text-stone-500">
                Is this an incoming communication or an outgoing department circular?
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setDirection('inward');
                  if (!initialLetter) {
                    setRecipientName('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)');
                    setRecipientDesignation('Block Education Officer');
                    setRecipientDepartment('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ');
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  direction === 'inward'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Inward Dak (ಸ್ವೀಕೃತ ಅಂಚೆ)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDirection('outward');
                  if (!initialLetter) {
                    setSenderName('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)');
                    setSenderDesignation('Block Education Officer');
                    setSenderDepartment('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ');
                    if (!recipientDepartment) {
                      setRecipientDepartment('ಭದ್ರಾವತಿ ವಲಯದ ಎಲ್ಲಾ ಶಾಲೆಗಳು');
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  direction === 'outward'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Outward Order (ರವಾನೆ ಆದೇಶ)</span>
              </button>
            </div>
          </div>

          {/* Reference Numbers Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Reference / Dispatch Number *
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="e.g. EDN-DIR/2026/CIR-104"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
              />
              {errors.referenceNumber && (
                <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.referenceNumber}</span>
              )}
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Linked Master File / Docket Number *
              </label>
              <input
                type="text"
                value={fileNumber}
                onChange={e => setFileNumber(e.target.value)}
                placeholder="e.g. FILE-2026/ACAD-SOP/012"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Official Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Mandatory Implementation of STEM & AI Literacy Lab Curriculum in Secondary Schools"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-stone-400 focus:outline-hidden text-stone-900"
            />
            {errors.subject && (
              <span className="text-rose-600 text-[11px] mt-0.5 block">{errors.subject}</span>
            )}
          </div>

          {/* 🌟 Dedicated Government Order Binding & Reference Section (ಈ ಆದೇಶದಂತೆ) */}
          <div className="bg-amber-50/80 border-2 border-amber-400 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 font-kannada">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span>ಈ ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ಪತ್ರ ರಚಿಸಿ / ಉಲ್ಲೇಖಿಸಿ (Pursuant to Government Order):</span>
              </div>
              {linkedOrderNumber && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded border border-amber-400">
                    ಆದೇಶ: {linkedOrderNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedOrderNumber('');
                      setLinkedOrderId('');
                      setLinkedOrderDate('');
                      setLinkedOrderSubject('');
                      setLinkedOrderType('');
                    }}
                    className="text-[10px] text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer"
                  >
                    ತೆರವುಗೊಳಿಸಿ (Clear)
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-0.5 font-kannada">
                  ಭಂಡಾರದಿಂದ ಆದೇಶ ಆಯ್ಕೆಮಾಡಿ (Select Order):
                </label>
                <select
                  value={linkedOrderNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      try {
                        const saved = JSON.parse(localStorage.getItem('edu_government_orders_registry') || '[]');
                        const go = saved.find((g: any) => g.orderNumber === val);
                        if (go) {
                          setLinkedOrderNumber(go.orderNumber);
                          setLinkedOrderId(go.id || '');
                          setLinkedOrderDate(go.orderDate || '');
                          setLinkedOrderSubject(go.orderType || go.generatedDocumentText || '');
                          setLinkedOrderType(go.orderType || '');
                          setCategory('Government Order (GO)');
                          if (!subject.trim()) {
                            setSubject(`${go.orderType} - ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ${go.orderNumber} ದಿನಾಂಕ: ${go.orderDate} ರಂತೆ ಕ್ರಮ.`);
                          }
                          if (!bodyText.trim()) {
                            setBodyText(`ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ${go.orderNumber}, ದಿನಾಂಕ: ${go.orderDate} ರ ಆದೇಶದಂತೆ ಸಂಬಂಧಪಟ್ಟವರು ನಿಗದಿತ ಅವಧಿಯೊಳಗೆ ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಮುಂದಿನ ಕ್ರಮ ಕೈಗೊಂಡು ವರದಿ ಸಲ್ಲಿಸಲು ಸೂಚಿಸಿದೆ.\n\nವಿಷಯ: ${go.orderType}\nಸಿಬ್ಬಂದಿ/ಫಲಾನುಭವಿ: ${go.employeeName || 'ಸಂಬಂಧಪಟ್ಟವರು'}`);
                          }
                          if (go.employeeName && go.employeeName !== 'All Concerned Staff' && !recipientName.trim()) {
                            setRecipientName(go.employeeName);
                          }
                          if (go.fileId && !fileNumber.trim()) {
                            setFileNumber(go.fileId);
                          }
                        } else {
                          setLinkedOrderNumber(val);
                        }
                      } catch (err) {
                        setLinkedOrderNumber(val);
                      }
                    } else {
                      setLinkedOrderNumber('');
                      setLinkedOrderId('');
                      setLinkedOrderDate('');
                      setLinkedOrderSubject('');
                      setLinkedOrderType('');
                    }
                  }}
                  className="w-full text-xs bg-white border border-amber-400 rounded-lg px-2.5 py-1.5 text-stone-900 font-bold font-kannada outline-none cursor-pointer"
                >
                  <option value="">-- ಸರ್ಕಾರಿ ಆದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Order) --</option>
                  {(() => {
                    try {
                      const list = JSON.parse(localStorage.getItem('edu_government_orders_registry') || '[]');
                      return list.map((g: any, i: number) => (
                        <option key={i} value={g.orderNumber}>
                          {g.orderNumber} - {g.orderType} ({g.orderDate})
                        </option>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-0.5 font-kannada">
                  ಅಥವಾ ಆದೇಶ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Order Number):
                </label>
                <input
                  type="text"
                  value={linkedOrderNumber}
                  onChange={(e) => setLinkedOrderNumber(e.target.value)}
                  placeholder="ಉದಾ: ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2026"
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-400 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {linkedOrderNumber && (
              <div className="text-[11px] text-amber-900 font-kannada bg-amber-100/70 p-2 rounded border border-amber-300">
                ✅ ಈ ಪತ್ರದಲ್ಲಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡುವ PDF ನಲ್ಲಿ ಅಧಿಕೃತವಾಗಿ <strong>"ಈ ಆದೇಶದಂತೆ: {linkedOrderNumber}"</strong> ಎಂದು ಉಲ್ಲೇಖವಾಗುತ್ತದೆ.
              </div>
            )}
          </div>

          {/* Category, Section, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LetterCategory)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
              >
                <option value="Government Order (GO)">Government Order (GO)</option>
                <option value="Circular & Directive">Circular & Directive</option>
                <option value="School Inspection & Safety">School Inspection & Safety</option>
                <option value="Grant & Budget Sanction">Grant & Budget Sanction</option>
                <option value="Teacher Transfer & Deputation">Teacher Transfer & Deputation</option>
                <option value="Scholarship & Student Welfare">Scholarship & Student Welfare</option>
                <option value="Examination & Curriculum">Examination & Curriculum</option>
                <option value="Public Grievance & RTI">Public Grievance & RTI</option>
                <option value="Affiliation & NOC">Affiliation & NOC</option>
                <option value="General Official Notice">General Official Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Section</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value as DepartmentSection)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
              >
                <option value="Academic Wing">Academic Wing</option>
                <option value="Administration & Services">Administration</option>
                <option value="Accounts & Grants">Accounts & Grants</option>
                <option value="Examination Board">Examination Board</option>
                <option value="Inspection & Quality">Inspection & Quality</option>
                <option value="Legal & Grievances">Legal & Grievances</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as LetterPriority)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
              >
                <option value="Immediate">Immediate</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as LetterStatus)}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden"
              >
                <option value="Pending Action">Pending Action</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved & Signed">Approved & Signed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Closed & Archived">Closed & Archived</option>
              </select>
            </div>
          </div>

          {/* Sender & Recipient Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
            {/* Sender */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                {direction === 'inward' ? 'Sender (From Whom Received)' : 'Issuing Authority'}
              </h4>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Official Name (e.g. Dr. Alistair Vance)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={senderDesignation}
                onChange={e => setSenderDesignation(e.target.value)}
                placeholder="Designation (e.g. Director of School Education)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={senderDepartment}
                onChange={e => setSenderDepartment(e.target.value)}
                placeholder="Department / School Organization"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                {direction === 'inward' ? 'Addressed To / Directorate Cell' : 'Target Recipient'}
              </h4>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Recipient Name (e.g. All District Education Officers)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={recipientDesignation}
                onChange={e => setRecipientDesignation(e.target.value)}
                placeholder="Designation (e.g. Principals / DEOs)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={recipientDepartment}
                onChange={e => setRecipientDepartment(e.target.value)}
                placeholder="Receiving Office / Institution"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Dates & Assigned Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Date Logged / Issued</label>
              <input
                type="date"
                value={dateReceivedOrIssued}
                onChange={e => setDateReceivedOrIssued(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Action Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Assigned Custodian Officer</label>
              <input
                type="text"
                list="registered-officers-list"
                value={assignedOfficer}
                onChange={e => setAssignedOfficer(e.target.value)}
                placeholder="Select or enter Officer name"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
              <datalist id="registered-officers-list">
                {employees.map(emp => (
                  <option key={emp.id} value={`${emp.fullName} (${emp.designation})`} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Financial Grant Amount (Optional) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Financial Sanction / Grant Amount (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">$</span>
              <input
                type="number"
                value={financialAmount}
                onChange={e => setFinancialAmount(e.target.value)}
                placeholder="e.g. 2500000 (if budgetary sanction)"
                className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Body Text */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Letter Content / Transcribed Text / Directives
            </label>
            <textarea
              rows={6}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              placeholder="Paste or draft the complete official letter clauses, directives, reference citations..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono leading-relaxed focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
            />
          </div>

          {/* Endorsements / Copy To */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Endorsement Copies (Copy to...) - one per line
            </label>
            <textarea
              rows={2}
              value={endorsementsText}
              onChange={e => setEndorsementsText(e.target.value)}
              placeholder="1. Principal Secretary to Government&#10;2. State Director of Educational Research&#10;3. Guard File"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <label className="block font-semibold text-stone-700">
              Digital Document Attachments & Scans
            </label>
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors relative">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.png,.tiff"
                onChange={handleSimulateFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-6 h-6 text-stone-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-stone-700">
                Click or drag & drop scanned circulars, inspection reports, or order PDFs
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                PDF, Word, Images supported • Auto-indexed to master docket
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate">{att.fileName}</span>
                      <span className="text-[10px] text-stone-400">({att.fileSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. #STEM, #SchoolSafety, #Scholarship2026, #Inspection"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSubmitting ? 'Saving to Registry...' : 'Save & Record in Registry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
