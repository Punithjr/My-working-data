import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Printer, 
  Copy, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowRight, 
  ChevronRight, 
  Building2, 
  User, 
  ShieldCheck, 
  FolderGit2, 
  FileSpreadsheet, 
  Sparkles,
  ExternalLink,
  FileCheck2,
  Check,
  Camera,
  Paperclip,
  UploadCloud,
  FolderPlus,
  Image as ImageIcon
} from 'lucide-react';
import { 
  RtiCaseRecord, 
  RtiStatus, 
  RtiFeePaymentMode, 
  RtiSectionClause, 
  RtiLetterFormatType,
  AdminAuthUser, 
  EducationLetter, 
  MasterDocketFile,
  OfficeConfig,
  DocumentAttachment
} from '../types';
import { 
  fetchRtiCasesFromFirestore, 
  saveRtiCaseToFirestore, 
  deleteRtiCaseFromFirestore 
} from '../lib/firebase';
import { DEFAULT_PENSION_OFFICE_CONFIG } from '../utils/pensionCalculator';
import { CaptureDocumentModal } from './CaptureDocumentModal';

interface RtiManagementViewProps {
  currentUser?: AdminAuthUser | null;
  files: MasterDocketFile[];
  onSaveLetterToRegistry?: (letterData: Partial<EducationLetter>) => void;
  showToast: (msg: string) => void;
  onUploadAttachmentToFile?: (fileId: string, attachment: DocumentAttachment) => Promise<void>;
  onViewAttachment?: (attachment: DocumentAttachment) => void;
  onCreateFile?: (fileData: Partial<MasterDocketFile>) => Promise<void>;
  initialDocketFile?: MasterDocketFile | null;
}

// Initial Sample RTI Cases for Karnataka Education Department
const INITIAL_RTI_CASES: RtiCaseRecord[] = [
  {
    id: 'rti-case-01',
    applicationNumber: 'RTI/BEO/BHD/2026/01',
    fileNumber: 'ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-01/2026-27',
    applicantName: 'ಶ್ರೀ ಕೆ. ರಾಮಕೃಷ್ಣ ಭಟ್',
    applicantAddress: 'ನಂ. 148, ಹೊಸಮನೆ ಬಡಾವಣೆ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301',
    applicantPhone: '9448102948',
    applicantEmail: 'ramakrishna.bhat@gmail.com',
    isBpl: false,
    feeMode: 'ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)',
    feeReceiptNumber: 'CFS-984021',
    feeAmount: 10,
    receivedDate: '2026-09-02',
    targetResponseDate: '2026-10-02', // 30 days
    sectionClause: 'ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)',
    subject: 'ಭದ್ರಾವತಿ ವಲಯದ ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆಗಳಿಗೆ 2025-26ನೇ ಸಾಲಿನಲ್ಲಿ ಬಿಡುಗಡೆಯಾದ ಅನುದಾನ ಮತ್ತು ಖರ್ಚಿನ ವಿವರಗಳು',
    informationSought: '1. ಭದ್ರಾವತಿ ತಾಲೂಕಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆಗಳಿಗೆ ನಿರ್ವಹಣಾ ಅನುದಾನ (School Maintenance Grant) ಬಿಡುಗಡೆ ವಿವರ.\n2. ಶಾಲಾ ಸೌಲಭ್ಯಗಳ ಪರಿಶೀಲನಾ ವರದಿಗಳ ದೃಢೀಕೃತ ಪ್ರತಿ.\n3. ಶಾಲಾ ಕೊಠಡಿ ದುರಸ್ತಿ ವೆಚ್ಚದ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ.',
    assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    firstAppellateAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
    status: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)',
    notes: [
      { id: 'n1', author: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು', date: '2026-09-03', text: 'ಅರ್ಜಿ ಸ್ವೀಕರಿಸಿ ಆ2 ಶಾಖೆಗೆ ದಾಖಲಾತಿ ಒದಗಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.' }
    ],
    createdAt: '2026-09-02',
    lastUpdated: '2026-09-05'
  },
  {
    id: 'rti-case-02',
    applicationNumber: 'RTI/BEO/BHD/2026/02',
    fileNumber: 'ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-02/2026-27',
    applicantName: 'ಶ್ರೀಮತಿ ಮಂಜುಳಾ ಎಚ್.ಎಸ್.',
    applicantAddress: 'ಶಿಕ್ಷಕರ ಕಾಲೋನಿ, ಜನ್ನಾಪುರ, ಭದ್ರಾವತಿ - 577302',
    applicantPhone: '9880192837',
    isBpl: true,
    bplCardNumber: 'BPL-2094819028',
    feeMode: 'ಬಿ.ಪಿ.ಎಲ್ ವಿನಾಯಿತಿ (BPL Exemption - ಉಚಿತ)',
    feeAmount: 0,
    receivedDate: '2026-09-10',
    targetResponseDate: '2026-10-10',
    sectionClause: 'ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)',
    subject: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ಹೊಸಮನೆ - ಶಿಕ್ಷಕರ ಹಾಜರಾತಿ ಹಾಗೂ ಸೇವಾ ನಿಯಮಾವಳಿ ವಿವರಗಳು',
    informationSought: '1. ದಿನಾಂಕ 01-06-2026 ರಿಂದ 31-08-2026 ರವರೆಗೆ ಶಿಕ್ಷಕರ ಬಯೋಮೆಟ್ರಿಕ್ ಹಾಜರಾತಿ ವಿವರ.\n2. ಪ್ರಭಾರ ಮುಖ್ಯ ಶಿಕ್ಷಕರ ಪ್ರಭಾರ ಭತ್ಯೆ ಮಂಜೂರಾತಿ ಆದೇಶದ ಪ್ರತಿ.',
    assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    firstAppellateAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
    status: 'ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ (Information Furnished)',
    disposalDate: '2026-09-24',
    disposalSummary: 'ಕೋರಿದ 4 ಪುಟಗಳ ದೃಢೀಕೃತ ಬಯೋಮೆಟ್ರಿಕ್ ಹಾಜರಾತಿ ಪ್ರತಿಯನ್ನು ಅರ್ಜಿದಾರರಿಗೆ ಉಚಿತವಾಗಿ (BPL ಅನ್ವಯ) ಒದಗಿಸಲಾಗಿದೆ.',
    createdAt: '2026-09-10',
    lastUpdated: '2026-09-24'
  },
  {
    id: 'rti-case-03',
    applicationNumber: 'RTI/BEO/BHD/2026/03',
    fileNumber: 'ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-03/2026-27',
    applicantName: 'ಶ್ರೀ ಎಸ್. ಚಂದ್ರಶೇಖರ್',
    applicantAddress: 'ನ್ಯೂ ಕಾಲೋನಿ, ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಭದ್ರಾವತಿ - 577301',
    applicantPhone: '9740182736',
    isBpl: false,
    feeMode: 'ಐ.ಪಿ.ಓ (Indian Postal Order - IPO)',
    feeReceiptNumber: 'IPO-738291',
    feeAmount: 10,
    receivedDate: '2026-09-20',
    targetResponseDate: '2026-09-25', // 5 days for 6(3) transfer
    sectionClause: 'ಕಲಂ 6(3) - ಇತರೆ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾವಣೆ (5 Days)',
    subject: 'ಅನುದಾನಿತ ಪ್ರೌಢಶಾಲೆಯ ನೇಮಕಾತಿ ಅನುಮೋದನೆ ವಿವರಗಳು (DDPI ಕಚೇರಿಗೆ ಸಂಬಂಧಿಸಿದ್ದು)',
    informationSought: 'ಭದ್ರಾವತಿ ನಗರದ ರಾಷ್ಟ್ರೀಯ ಪ್ರೌಢಶಾಲೆಯಲ್ಲಿ ಖಾಲಿ ಇರುವ ಸಹ ಶಿಕ್ಷಕರ ಹುದ್ದೆ ಭರ್ತಿಗೆ ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಿವಮೊಗ್ಗ ರವರಿಂದ ಅನುಮೋದನೆ ಪಡೆದ ಕಡತದ ಪ್ರತಿ.',
    assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    firstAppellateAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
    status: 'ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾಯಿಸಲಾಗಿದೆ (Transferred Sec 6(3))',
    transfereeAuthorityName: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗಳು ಹಾಗೂ ಉಪನಿರ್ದೇಶಕರ (ಆಡಳಿತ) ಕಾರ್ಯಾಲಯ, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ',
    transferDate: '2026-09-23',
    disposalSummary: 'ಅರ್ಜಿಯನ್ನು ಕಲಂ 6(3) ರನ್ವಯ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವಾದ DDPI ಶಿವಮೊಗ್ಗ ಕಛೇರಿಗೆ 5 ದಿನಗಳೊಳಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ ಮತ್ತು ಅರ್ಜಿದಾರರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.',
    createdAt: '2026-09-20',
    lastUpdated: '2026-09-23'
  }
];

const RTI_LOCAL_STORAGE_KEY = 'karnataka_rti_cases_records_v1';

const loadInitialRtiCases = (): RtiCaseRecord[] => {
  try {
    const raw = localStorage.getItem(RTI_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local RTI cases:', err);
  }
  return INITIAL_RTI_CASES;
};

// Date Formatter: strictly outputs "dd-mm-yyyy"
export const formatDdMmYyyy = (dateInput?: string | Date | null): string => {
  if (!dateInput) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    const cleanDate = trimmed.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Letter Reference Number Generator strictly following:
// "ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/[ಕಡತ ಸಂಖ್ಯೆ]/[ಎಷ್ಟನೇ ಪತ್ರ]/2026-27/"
export const getRtiLetterRefNumber = (
  c: RtiCaseRecord,
  format?: RtiLetterFormatType,
  overrideLetterSeq?: string
): string => {
  // 1. Extract clean File Number (ಕಡತ ಸಂಖ್ಯೆ)
  let fileNum = '87';
  if (c.fileNumber) {
    const digits = c.fileNumber.match(/[0-9]+/);
    if (digits) {
      fileNum = digits[0];
    } else {
      fileNum = c.fileNumber.replace(/[^0-9a-zA-Z]/g, '') || '87';
    }
  }

  // 2. Letter sequence number (ಎಷ್ಟನೇ ಪತ್ರ)
  let letterSeq = overrideLetterSeq?.trim() || '01';
  if (!overrideLetterSeq && format) {
    switch (format) {
      case 'info_furnish_letter': letterSeq = '01'; break;
      case 'sec6_3_transfer': letterSeq = '02'; break;
      case 'further_fee_demand': letterSeq = '03'; break;
      case 'first_appeal_notice': letterSeq = '04'; break;
      case 'sec8_rejection': letterSeq = '05'; break;
      case 'quarterly_proforma': letterSeq = '06'; break;
      default: letterSeq = '01'; break;
    }
  }

  return `ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${fileNum}/${letterSeq}/2026-27`;
};

export const RtiManagementView: React.FC<RtiManagementViewProps> = ({
  currentUser,
  files,
  onSaveLetterToRegistry,
  showToast,
  onUploadAttachmentToFile,
  onViewAttachment,
  onCreateFile,
  initialDocketFile
}) => {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'entry' | 'letters' | 'appeals' | 'labels'>('register');
  const [rtiCases, setRtiCases] = useState<RtiCaseRecord[]>(loadInitialRtiCases);
  const [selectedCase, setSelectedCase] = useState<RtiCaseRecord>(() => {
    const initial = loadInitialRtiCases();
    return initial[0] || INITIAL_RTI_CASES[0];
  });
  const [selectedLetterFormat, setSelectedLetterFormat] = useState<RtiLetterFormatType>('info_furnish_letter');
  const [activeLetterSeq, setActiveLetterSeq] = useState<string>('01');
  
  // Document Capture via Device Camera State
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [captureTargetDocketFile, setCaptureTargetDocketFile] = useState<MasterDocketFile | null>(null);
  const [captureTargetCase, setCaptureTargetCase] = useState<RtiCaseRecord | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  // Auto select initial docket file if passed from parent
  useEffect(() => {
    if (initialDocketFile) {
      const match = rtiCases.find(c => 
        c.fileNumber === initialDocketFile.fileNumber || 
        (initialDocketFile.rtiDetails && c.applicationNumber === initialDocketFile.rtiDetails.applicationNumber)
      );
      if (match) {
        setSelectedCase(match);
      }
    }
  }, [initialDocketFile, rtiCases]);

  // Find matched docket file from master files list for any RTI case
  const findDocketFileForCase = (c: RtiCaseRecord): MasterDocketFile | null => {
    if (!c) return null;
    return files.find(f => 
      f.fileNumber === c.fileNumber ||
      f.fileNumber.includes(c.fileNumber) ||
      c.fileNumber.includes(f.fileNumber) ||
      (f.rtiDetails && f.rtiDetails.applicationNumber === c.applicationNumber)
    ) || null;
  };

  // Matched docket file for the currently selected RTI case
  const selectedCaseDocketFile = useMemo<MasterDocketFile | null>(() => {
    return findDocketFileForCase(selectedCase);
  }, [files, selectedCase]);

  // Consolidated documents for currently selected case
  const selectedCaseAttachments = useMemo<DocumentAttachment[]>(() => {
    const list: DocumentAttachment[] = [];
    if (selectedCaseDocketFile) {
      if (selectedCaseDocketFile.attachments) list.push(...selectedCaseDocketFile.attachments);
      if (selectedCaseDocketFile.rtiDetails?.uploadedDocs) list.push(...selectedCaseDocketFile.rtiDetails.uploadedDocs);
    }
    // Deduplicate by ID or fileName
    return list.filter((v, i, a) => a.findIndex(t => (t.id && t.id === v.id) || t.fileName === v.fileName) === i);
  }, [selectedCaseDocketFile]);

  // Open Device Camera Capture Modal for an RTI Case
  const handleOpenCaptureForCase = async (c: RtiCaseRecord) => {
    setCaptureTargetCase(c);
    let docketFile = findDocketFileForCase(c);

    // If no docket file exists yet in backend files list, auto-create one
    if (!docketFile) {
      try {
        const res = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ${c.applicantName} - ${c.subject}`,
            section: 'Administration & Services',
            sectionCode: 'ಆ2',
            sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
            fileCategory: 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)',
            currentCustodian: c.assignedOfficer || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
            priority: 'Immediate',
            fileNumber: c.fileNumber,
            isRtiFile: true,
            rtiDetails: {
              applicationNumber: c.applicationNumber,
              applicantName: c.applicantName,
              applicantAddress: c.applicantAddress,
              applicantPhone: c.applicantPhone,
              receivedDate: c.receivedDate,
              targetResponseDate: c.targetResponseDate,
              feeDetails: c.feeMode,
              informationSought: c.informationSought,
              pioOfficer: c.assignedOfficer,
              firstAppellateAuthority: c.firstAppellateAuthority,
              uploadedDocs: []
            },
            notes: `RTI ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${c.applicationNumber}. ಕಡತ: ${c.fileNumber}.`
          })
        });
        const data = await res.json();
        if (res.ok && data.file) {
          docketFile = data.file;
          if (onCreateFile) {
            await onCreateFile(data.file);
          }
        }
      } catch (e) {
        console.warn('Auto create docket file note:', e);
      }
    }

    if (!docketFile) {
      docketFile = {
        id: `file-rti-${c.id}`,
        fileNumber: c.fileNumber,
        subject: `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ - ${c.applicantName}: ${c.subject}`,
        section: 'Administration & Services',
        sectionCode: 'ಆ2',
        sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
        fileCategory: 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)',
        initiatedDate: c.receivedDate,
        status: 'Active / Open',
        currentCustodian: c.assignedOfficer || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
        priority: 'Immediate',
        linkedLetterIds: [],
        lettersCount: 0,
        movementHistory: [],
        notes: `RTI Case ${c.applicationNumber}`,
        isRtiFile: true,
        attachments: []
      };
    }

    setCaptureTargetDocketFile(docketFile);
    setIsCaptureModalOpen(true);
  };

  // Handler when document is captured and attached
  const handleAttachCapturedDocument = async (fileId: string, newAtt: DocumentAttachment) => {
    if (onUploadAttachmentToFile) {
      await onUploadAttachmentToFile(fileId, newAtt);
    } else {
      const res = await fetch(`/api/files/${fileId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAtt),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to attach');
      }
    }

    // Add note to case record
    if (captureTargetCase) {
      const updatedNotes = [
        ...(captureTargetCase.notes || []),
        {
          id: `n-${Date.now()}`,
          author: currentUser?.fullName || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ',
          date: new Date().toISOString().split('T')[0],
          text: `ಕ್ಯಾಮರಾ ಮೂಲಕ ಕಾಗದ ದಾಖಲೆ ಸೆರೆಹಿಡಿದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಲಾಗಿದೆ: "${newAtt.fileName}"`
        }
      ];
      const updatedCase: RtiCaseRecord = {
        ...captureTargetCase,
        notes: updatedNotes,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setRtiCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      if (selectedCase.id === updatedCase.id) {
        setSelectedCase(updatedCase);
      }
      saveRtiCaseToFirestore(updatedCase).catch(() => {});
    }
  };

  // File upload fallback handler for RTI case documents
  const handleUploadRtiDocument = async (e: React.ChangeEvent<HTMLInputElement>, targetCase: RtiCaseRecord) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    let docketFile = findDocketFileForCase(targetCase);
    if (!docketFile) {
      await handleOpenCaptureForCase(targetCase);
      docketFile = findDocketFileForCase(targetCase) || captureTargetDocketFile;
    }
    if (!docketFile) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const reader = new FileReader();
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const newAtt: DocumentAttachment = {
            id: `att-rti-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            fileName: file.name,
            fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
            pageCount: isPdf ? 1 : undefined,
            uploadedAt: new Date().toISOString().split('T')[0],
            description: isPdf ? 'ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ / ಅನುಬಂಧ ದಾಖಲೆ (PDF)' : 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಕಾಗದ ಪ್ರತಿ (JPG)',
            dataUrl,
          };
          await handleAttachCapturedDocument(docketFile!.id, newAtt);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    showToast(`${uploadedFiles.length} ದಾಖಲೆಗಳು ಕಡತಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ`);
    e.target.value = '';
  };

  // Form State for New Application
  const [formData, setFormData] = useState({
    applicationNumber: `RTI/BEO/BHD/2026/${String(INITIAL_RTI_CASES.length + 1).padStart(2, '0')}`,
    fileNumber: `ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-0${INITIAL_RTI_CASES.length + 1}/2026-27`,
    applicantName: '',
    applicantAddress: '',
    applicantPhone: '',
    applicantEmail: '',
    isBpl: false,
    bplCardNumber: '',
    feeMode: 'ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)' as RtiFeePaymentMode,
    feeReceiptNumber: '',
    feeAmount: 10,
    receivedDate: new Date().toISOString().split('T')[0],
    targetResponseDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })(),
    sectionClause: 'ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)' as RtiSectionClause,
    subject: '',
    informationSought: '',
    assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    firstAppellateAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
    status: 'ಸ್ವೀಕೃತ (Pending)' as RtiStatus
  });

  // Load from Firestore on mount and merge with local cases
  useEffect(() => {
    async function loadFirestoreRti() {
      try {
        const remote = await fetchRtiCasesFromFirestore();
        if (remote && remote.length > 0) {
          setRtiCases(prev => {
            const map = new Map<string, RtiCaseRecord>();
            INITIAL_RTI_CASES.forEach(c => map.set(c.id, c));
            prev.forEach(c => map.set(c.id, c));
            remote.forEach(c => map.set(c.id, c));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(RTI_LOCAL_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {
              console.warn(e);
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Failed to load remote RTI cases:', err);
      }
    }
    loadFirestoreRti();
  }, []);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return rtiCases.filter(c => {
      const matchSearch = searchQuery === '' || 
        c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fileNumber.includes(searchQuery);

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rtiCases, searchQuery, statusFilter]);

  // SLA Calculation Helper (Days remaining out of 30)
  const getSlaDetails = (receivedDate: string, targetDate: string, status: RtiStatus) => {
    if (status.includes('ಒದಗಿಸಲಾಗಿದೆ') || status.includes('ವರ್ಗಾಯಿಸಲಾಗಿದೆ') || status.includes('ದಾಖಲಿಸಲಾಗಿದೆ')) {
      return { daysLeft: 0, label: 'ವಿಲೇವಾರಿ ಆಗಿದೆ (Closed)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    }
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { daysLeft: diffDays, label: `ಗಡುವು ಮೀರಿದೆ (${Math.abs(diffDays)} ದಿನ ವಿಳಂಬ - ಕಲಂ 20 ದಂಡ ಎಚ್ಚರಿಕೆ)`, color: 'text-rose-900 bg-rose-100 border-rose-400 font-bold animate-pulse' };
    } else if (diffDays <= 7) {
      return { daysLeft: diffDays, label: `ಗಡುವು ಹತ್ತಿರವಿದೆ (${diffDays} ದಿನಗಳು ಬಾಕಿ)`, color: 'text-amber-900 bg-amber-100 border-amber-400 font-bold' };
    } else {
      return { daysLeft: diffDays, label: `ಸಮಯಾವಕಾಶವಿದೆ (${diffDays} ದಿನಗಳು ಬಾಕಿ)`, color: 'text-blue-900 bg-blue-100 border-blue-300' };
    }
  };

  // Submit New or Updated RTI Case
  const handleSaveRtiCase = async (e?: React.FormEvent, targetTab: 'letters' | 'register' = 'letters') => {
    if (e) e.preventDefault();

    const name = formData.applicantName?.trim();
    const subject = formData.subject?.trim();

    if (!name || !subject) {
      showToast('ದಯವಿಟ್ಟು ಅರ್ಜಿದಾರರ ಹೆಸರು ಮತ್ತು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ (Applicant name and subject are required).');
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    let savedCase: RtiCaseRecord;

    if (editingCaseId) {
      // Update existing case
      savedCase = {
        ...selectedCase,
        applicationNumber: formData.applicationNumber?.trim() || selectedCase.applicationNumber,
        fileNumber: formData.fileNumber?.trim() || selectedCase.fileNumber,
        applicantName: name,
        applicantAddress: formData.applicantAddress?.trim() || 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
        applicantPhone: formData.applicantPhone?.trim() || '',
        applicantEmail: formData.applicantEmail?.trim() || '',
        isBpl: formData.isBpl,
        bplCardNumber: formData.bplCardNumber?.trim() || '',
        feeMode: formData.feeMode,
        feeReceiptNumber: formData.feeReceiptNumber?.trim() || '',
        feeAmount: formData.isBpl ? 0 : (Number(formData.feeAmount) || 0),
        receivedDate: formData.receivedDate || now,
        targetResponseDate: formData.targetResponseDate || now,
        sectionClause: formData.sectionClause,
        subject: subject,
        informationSought: formData.informationSought?.trim() || 'ಅರ್ಜಿದಾರರು ಕೋರಿದ ಮಾಹಿತಿಯ ವಿವರಗಳು',
        assignedOfficer: formData.assignedOfficer || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
        firstAppellateAuthority: formData.firstAppellateAuthority || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
        status: formData.status,
        lastUpdated: now
      };

      const updatedList = rtiCases.map(c => c.id === editingCaseId ? savedCase : c);
      setRtiCases(updatedList);
      setSelectedCase(savedCase);
      try {
        localStorage.setItem(RTI_LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (err) {
        console.warn('Failed to save RTI case to localStorage:', err);
      }
      saveRtiCaseToFirestore(savedCase).catch(() => {});
      showToast(`ಮಾಹಿತಿ ಹಕ್ಕು ಪ್ರಕರಣ ನವೀಕರಿಸಲಾಗಿದೆ: ${savedCase.applicationNumber}`);
    } else {
      // Create New RTI Case
      const newCaseId = `rti-case-${Date.now()}`;
      const appNumber = formData.applicationNumber?.trim() || `RTI/BEO/BHD/2026/${String(rtiCases.length + 1).padStart(2, '0')}`;
      const fileNumber = formData.fileNumber?.trim() || `ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-0${String(rtiCases.length + 1).padStart(2, '0')}/2026-27`;

      savedCase = {
        id: newCaseId,
        applicationNumber: appNumber,
        fileNumber: fileNumber,
        applicantName: name,
        applicantAddress: formData.applicantAddress?.trim() || 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
        applicantPhone: formData.applicantPhone?.trim() || '',
        applicantEmail: formData.applicantEmail?.trim() || '',
        isBpl: formData.isBpl,
        bplCardNumber: formData.bplCardNumber?.trim() || '',
        feeMode: formData.feeMode,
        feeReceiptNumber: formData.feeReceiptNumber?.trim() || '',
        feeAmount: formData.isBpl ? 0 : (Number(formData.feeAmount) || 10),
        receivedDate: formData.receivedDate || now,
        targetResponseDate: formData.targetResponseDate || now,
        sectionClause: formData.sectionClause,
        subject: subject,
        informationSought: formData.informationSought?.trim() || 'ಅರ್ಜಿದಾರರು ಕೋರಿದ ಮಾಹಿತಿಯ ವಿವರಗಳು',
        assignedOfficer: formData.assignedOfficer || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
        firstAppellateAuthority: formData.firstAppellateAuthority || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
        status: formData.status || 'ಸ್ವೀಕೃತ (Pending)',
        createdAt: now,
        lastUpdated: now,
        notes: [
          {
            id: `note-${Date.now()}`,
            author: currentUser?.fullName || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
            date: now,
            text: `ನೂತನ RTI ಅರ್ಜಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ: ${appNumber}. ಕಡತ ಸಂಖ್ಯೆ: ${fileNumber}.`
          }
        ]
      };

      const updatedList = [savedCase, ...rtiCases];
      setRtiCases(updatedList);
      setSelectedCase(savedCase);
      try {
        localStorage.setItem(RTI_LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (err) {
        console.warn('Failed to save RTI case to localStorage:', err);
      }
      saveRtiCaseToFirestore(savedCase).catch(() => {});

      // CREATE THE OFFICIAL DOCKET FILE ("ಕಡತ ಸೃಜಿಸಿ")
      try {
        const docketPayload: Partial<MasterDocketFile> = {
          fileNumber: fileNumber,
          subject: `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ${name} - ${subject}`,
          section: 'Administration & Services',
          sectionCode: 'ಆ2',
          sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
          fileCategory: 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)',
          currentCustodian: savedCase.assignedOfficer || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
          priority: 'Urgent',
          isRtiFile: true,
          rtiDetails: {
            applicationNumber: appNumber,
            applicantName: name,
            applicantAddress: savedCase.applicantAddress,
            applicantPhone: savedCase.applicantPhone,
            applicationDate: savedCase.receivedDate,
            statutoryDueDate: savedCase.targetResponseDate,
            feeDetails: savedCase.feeMode,
            pioOfficer: savedCase.assignedOfficer || 'ನಿಯೋಜಿತ PIO ಅಧಿಕಾರಿ, ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
            apioOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು, ಬಿಇಒ ಕಛೇರಿ',
            informationSought: savedCase.informationSought,
            rtiStatus: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
            firstAppellateAuthority: savedCase.firstAppellateAuthority || 'ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
            uploadedDocs: []
          },
          notes: `RTI ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${appNumber}. ಕಡತ ಸಂಖ್ಯೆ: ${fileNumber}. ವಿಷಯ: ${subject}`
        };

        if (onCreateFile) {
          await onCreateFile(docketPayload);
        } else {
          await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docketPayload)
          });
        }
      } catch (fileErr) {
        console.warn('Docket file creation fallback note:', fileErr);
      }

      showToast(`RTI ಅರ್ಜಿ (${appNumber}) ಹಾಗೂ ಕಡತ (${fileNumber}) ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಲಾಗಿದೆ!`);
    }

    setEditingCaseId(null);
    setActiveSubTab(targetTab);
  };

  // Switch to Edit Mode
  const handleEditCase = (c: RtiCaseRecord) => {
    setEditingCaseId(c.id);
    setSelectedCase(c);
    setFormData({
      applicationNumber: c.applicationNumber,
      fileNumber: c.fileNumber,
      applicantName: c.applicantName,
      applicantAddress: c.applicantAddress,
      applicantPhone: c.applicantPhone || '',
      applicantEmail: c.applicantEmail || '',
      isBpl: c.isBpl,
      bplCardNumber: c.bplCardNumber || '',
      feeMode: c.feeMode,
      feeReceiptNumber: c.feeReceiptNumber || '',
      feeAmount: c.feeAmount,
      receivedDate: c.receivedDate,
      targetResponseDate: c.targetResponseDate,
      sectionClause: c.sectionClause,
      subject: c.subject,
      informationSought: c.informationSought,
      assignedOfficer: c.assignedOfficer,
      firstAppellateAuthority: c.firstAppellateAuthority,
      status: c.status
    });
    setActiveSubTab('entry');
  };

  // Quick Status Update
  const handleUpdateStatus = async (caseId: string, newStatus: RtiStatus) => {
    const now = new Date().toISOString().split('T')[0];
    const updatedList = rtiCases.map(c => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          status: newStatus,
          disposalDate: newStatus.includes('ಒದಗಿಸಲಾಗಿದೆ') || newStatus.includes('ವಿಲೇವಾರಿ') ? now : c.disposalDate,
          lastUpdated: now
        };
        saveRtiCaseToFirestore(updated);
        if (selectedCase.id === caseId) setSelectedCase(updated);
        return updated;
      }
      return c;
    });
    setRtiCases(updatedList);
    try {
      localStorage.setItem(RTI_LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn(e);
    }
    showToast(`ಅರ್ಜಿಯ ಸ್ಥಿತಿಯನ್ನು "${newStatus}" ಗೆ ನವೀಕರಿಸಲಾಗಿದೆ.`);
  };

  // Delete RTI Case
  const handleDeleteCase = async (caseId: string) => {
    const target = rtiCases.find(c => c.id === caseId);
    if (!target) return;
    if (!window.confirm(`ಖಚಿತವಾಗಿ "${target.applicationNumber}" ಅರ್ಜಿಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?`)) {
      return;
    }
    const updated = rtiCases.filter(c => c.id !== caseId);
    setRtiCases(updated);
    if (selectedCase.id === caseId && updated.length > 0) {
      setSelectedCase(updated[0]);
    }
    try {
      localStorage.setItem(RTI_LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    deleteRtiCaseFromFirestore(caseId).catch(() => {});
    showToast(`ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ${target.applicationNumber} ಅಳಿಸಲಾಗಿದೆ.`);
  };

  // Save Official Letter to Outward Dak Registry
  const handleSaveActiveRtiLetterToRegistry = () => {
    if (!selectedCase || !onSaveLetterToRegistry) return;

    const refNum = `ಸಂ: ${getRtiLetterRefNumber(selectedCase, selectedLetterFormat, activeLetterSeq)}`;
    const formatLabels: Record<RtiLetterFormatType, string> = {
      info_furnish_letter: 'ಮಾಹಿತಿ ಒದಗಿಸುವ ಅಧಿಕೃತ ಪತ್ರ (Information Furnishing Letter)',
      sec6_3_transfer: 'ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾವಣೆ ಜ್ಞಾಪನಾ ಪತ್ರ (Section 6(3) Transfer Letter)',
      further_fee_demand: 'ಕಲಂ 7(3) ರನ್ವಯ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ ಪತ್ರ (Fee Demand Letter)',
      first_appeal_notice: 'ಕಲಂ 19(1) ರನ್ವಯ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ವಿಚಾರಣಾ ನೋಟಿಸ್ (First Appeal Notice)',
      sec8_rejection: 'ಕಲಂ 8/9 ರನ್ವಯ ಮಾಹಿತಿ ತಿರಸ್ಕಾರ ಆದೇಶ (Rejection Order)',
      quarterly_proforma: 'ಮಾಹಿತಿ ಹಕ್ಕು ತ್ರೈಮಾಸಿಕ/ವಾರ್ಷಿಕ ರಿಜಿಸ್ಟರ್ ತಃಖ್ಯೆ (Quarterly Return)'
    };

    onSaveLetterToRegistry({
      referenceNumber: refNum,
      fileNumber: selectedCase.fileNumber,
      direction: 'outward',
      subject: `${formatLabels[selectedLetterFormat]} - ಅರ್ಜಿದಾರರು: ${selectedCase.applicantName}`,
      category: 'Official Order',
      senderName: DEFAULT_PENSION_OFFICE_CONFIG.officerName,
      senderDesignation: DEFAULT_PENSION_OFFICE_CONFIG.officerDesignation,
      senderDepartment: DEFAULT_PENSION_OFFICE_CONFIG.officeName,
      recipientName: selectedCase.applicantName,
      recipientDesignation: 'ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿದಾರರು',
      recipientDepartment: selectedCase.applicantAddress,
      dateReceivedOrIssued: formatDdMmYyyy(),
      dueDate: formatDdMmYyyy(selectedCase.targetResponseDate),
      priority: 'Immediate',
      status: 'Approved & Signed',
      section: 'Legal & Grievances',
      sectionCode: 'ಆ2',
      sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
      bodyText: `ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರನ್ವಯ ಅರ್ಜಿ ಸಂ: ${selectedCase.applicationNumber} ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಕ್ರಮ. ಪತ್ರ ಸಂಖ್ಯೆ: ${refNum}`,
      tags: ['RTI', 'RightToInformation', 'KCSR', selectedCase.applicationNumber]
    });

    showToast(`ಪತ್ರವನ್ನು ಜಾವಕ ರಿಜಿಸ್ಟ್ರಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ: ${refNum}`);
  };

  // Render Official Letter HTML
  const renderRtiLetterHtml = (format: RtiLetterFormatType, c: RtiCaseRecord) => {
    const todayFormatted = formatDdMmYyyy();
    const refNum = `ಸಂ: ${getRtiLetterRefNumber(c, format, activeLetterSeq)}`;

    switch (format) {
      case 'info_furnish_letter':
        return `
        <div class="karnataka-govt-document p-8 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-3 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="font-bold text-base text-stone-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
            <div class="text-xs text-stone-700">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ - 577301, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</div>
          </div>

          <div class="flex justify-between items-center my-3 text-xs">
            <div><strong>ಕ್ರ.ಸಂಖ್ಯೆ:</strong> ${refNum}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${todayFormatted}</div>
          </div>

          <div class="space-y-1 my-3 text-xs bg-stone-50 p-3 rounded border border-stone-300">
            <div><strong>ಇವರಿಗೆ:</strong></div>
            <div class="font-bold text-sm text-stone-950">${c.applicantName}</div>
            <div class="text-stone-700">${c.applicantAddress}</div>
            ${c.applicantPhone ? `<div>ದೂರವಾಣಿ: ${c.applicantPhone}</div>` : ''}
          </div>

          <div class="my-3 text-xs">
            <p><strong>ಮಾನ್ಯರೇ,</strong></p>
            <div class="pl-4 space-y-1 my-2">
              <p><strong>ವಿಷಯ:</strong> ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರನ್ವಯ ಕೋರಿದ ಮಾಹಿತಿ ಒದಗಿಸುವ ಕುರಿತು.</p>
              <p><strong>ಉಲ್ಲೇಖ:</strong> ತಮ್ಮ ಅರ್ಜಿ ಸಂಖ್ಯೆ: <strong>${c.applicationNumber}</strong>, ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.receivedDate)}</strong>.</p>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಿತ ಅರ್ಜಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ತಾವು ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರ ಅಡಿಯಲ್ಲಿ ಕೋರಿರುವ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.
              ಸದರಿ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಈ ಕಛೇರಿಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ದೃಢೀಕೃತ ದಾಖಲೆಗಳ ಮಾಹಿತಿಯನ್ನು ಈ ಕೆಳಕಂಡಂತೆ ಒದಗಿಸಲಾಗಿದೆ:
            </p>

            <div class="bg-amber-50/50 p-3 rounded border border-amber-200 my-3">
              <div class="font-bold text-xs text-stone-900 mb-1">ಒದಗಿಸಲಾದ ಮಾಹಿತಿಯ ವಿವರಗಳು:</div>
              <div class="whitespace-pre-wrap text-stone-800 leading-relaxed font-mono-code text-[11px]">
${c.informationSought}
              </div>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಈ ಮಾಹಿತಿಯೊಂದಿಗೆ ಸಂಬಂಧಪಟ್ಟ ದೃಢೀಕೃತ ದಾಖಲೆಗಳ ಒಟ್ಟು ಪ್ರತಿಗಳನ್ನು ಲಗತ್ತಿಸಿ ಈ ಮೂಲಕ ತಮಗೆ ಒದಗಿಸಲಾಗಿದೆ.
            </p>
          </div>

          <div class="mt-8 flex justify-end">
            <div class="text-center">
              <div class="font-bold text-xs text-stone-950">ನಿಯೋಜಿತ PIO ಅಧಿಕಾರಿ</div>
              <div class="font-bold text-xs text-stone-900">ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ</div>
              <div class="text-[11px] text-stone-600">(ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ)</div>
            </div>
          </div>

          <div class="border-t border-stone-300 pt-3 mt-6 text-[11px] text-stone-700 space-y-1">
            <div><strong>ಪ್ರತಿ ಸಲ್ಲಿಕೆ:</strong></div>
            <div>1. ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ - ರವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ.</div>
            <div>2. ಕಛೇರಿ ಕಡತ ಪ್ರತಿ.</div>
          </div>
        </div>
        `;

      case 'sec6_3_transfer':
        return `
        <div class="karnataka-govt-document p-8 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-3 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="font-bold text-base text-stone-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
            <div class="font-bold text-sm text-stone-900 underline mt-2">
              ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(3) ರನ್ವಯ ಅರ್ಜಿ ವರ್ಗಾವಣೆ ಜ್ಞಾಪನಾ ಪತ್ರ
            </div>
          </div>

          <div class="flex justify-between items-center my-3 text-xs">
            <div><strong>ಕ್ರ.ಸಂಖ್ಯೆ:</strong> ${refNum}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${todayFormatted}</div>
          </div>

          <div class="space-y-1 my-3 text-xs bg-stone-50 p-3 rounded border border-stone-300">
            <div><strong>ಇವರಿಗೆ:</strong></div>
            <div class="font-bold text-sm text-stone-950">${c.transfereeAuthorityName || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗಳು, ಸಂಬಂಧಪಟ್ಟ ಕಛೇರಿ / ಶಾಲೆ'}</div>
            <div class="text-stone-700">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ.</div>
          </div>

          <div class="my-3 text-xs">
            <p><strong>ಮಾನ್ಯರೇ,</strong></p>
            <div class="pl-4 space-y-1 my-2">
              <p><strong>ವಿಷಯ:</strong> ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(3) ರ ಪ್ರಕಾರ ಅರ್ಜಿಯನ್ನು ವರ್ಗಾಯಿಸುವ ಕುರಿತು.</p>
              <p><strong>ಉಲ್ಲೇಖ:</strong> ಅರ್ಜಿದಾರರಾದ <strong>${c.applicantName}</strong> ರವರ ಅರ್ಜಿ ಸಂಖ್ಯೆ: <strong>${c.applicationNumber}</strong>, ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.receivedDate)}</strong>.</p>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಮೇಲ್ಕಂಡ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಅರ್ಜಿದಾರರಾದ ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>${c.applicantName}</strong> ರವರು ಈ ಕಛೇರಿಗೆ ಸಲ್ಲಿಸಿರುವ ಉಲ್ಲೇಖಿತ ಅರ್ಜಿಯಲ್ಲಿ ಕೋರಿರುವ ವಿಷಯವು ತಮ್ಮ ಕಾರ್ಯಾಲಯದ / ಶಾಲೆಯ ವ್ಯಾಪ್ತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.
            </p>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಆದ್ದರಿಂದ ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(3) ರ ಪ್ರಕಾರ, ಸದರಿ ಅರ್ಜಿಯ ಮೂಲ ಪ್ರತಿಯನ್ನು ಇದರೊಂದಿಗೆ ಲಗತ್ತಿಸಿ ಮುಂದಿನ ಅಗತ್ಯ ಕ್ರಮಕ್ಕಾಗಿ ತಮಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.
              ಕೋರಲಾದ ಮಾಹಿತಿಯನ್ನು ಅಧಿನಿಯಮದ ಕಲಂ 7(1) ರ ಅನ್ವಯ ನಿಗದಿತ ಕಾಲಮಿತಿಯೊಳಗೆ (ಅರ್ಜಿ ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕದಿಂದ 30 ದಿನಗಳೊಳಗೆ) ನೇರವಾಗಿ ಅರ್ಜಿದಾರರಿಗೆ ಒದಗಿಸಲು ಹಾಗೂ ಸದರಿ ಮಾಹಿತಿಯ ಪ್ರತಿಯನ್ನು ಈ ಕಚೇರಿಗೆ ರವಾನಿಸಲು ಕೋರಲಾಗಿದೆ.
            </p>
          </div>

          <div class="mt-6 flex justify-between items-end">
            <div class="text-[11px] text-stone-600">
              ಲಗತ್ತು: ಮೂಲ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ<br/>
              ದಿನಾಂಕ: ${todayFormatted}
            </div>
            <div class="text-center">
              <div class="font-bold text-xs">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO) ಹಾಗೂ</div>
              <div class="font-bold text-xs">ಕಛೇರಿ ಅಧೀಕ್ಷಕರು</div>
              <div class="text-[11px] text-stone-700">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
            </div>
          </div>

          <div class="border-t border-stone-300 pt-3 mt-4 text-[11px] text-stone-700 space-y-1">
            <div><strong>ಪ್ರತಿ ಮಾಹಿತಿ ಮತ್ತು ಅಗತ್ಯ ಕ್ರಮಕ್ಕಾಗಿ:</strong></div>
            <div>1. ಅರ್ಜಿದಾರರಾದ ${c.applicantName}, ${c.applicantAddress} - ತಮ್ಮ ಅರ್ಜಿಯನ್ನು ಕಲಂ 6(3) ರನ್ವಯ ಮೇಲ್ಕಂಡ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾಯಿಸಲಾಗಿದ್ದು, ಮುಂದಿನ ಪತ್ರವ್ಯವಹಾರವನ್ನು ಸದರಿ ಪ್ರಾಧಿಕಾರದೊಂದಿಗೆ ನಡೆಸಲು ಕೋರಲಾಗಿದೆ.</div>
            <div>2. ಕಛೇರಿ ಕಡತ ಪ್ರತಿ (${c.fileNumber}). ದಿನಾಂಕ: ${todayFormatted}.</div>
          </div>
        </div>
        `;

      case 'further_fee_demand':
        return `
        <div class="karnataka-govt-document p-8 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-3 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="font-bold text-base text-stone-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
            <div class="font-bold text-sm text-stone-900 underline mt-2">
              ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 7(3) ರನ್ವಯ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಪಾವತಿ ಬೇಡಿಕೆ ಪತ್ರ
            </div>
          </div>

          <div class="flex justify-between items-center my-3 text-xs">
            <div><strong>ಕ್ರ.ಸಂಖ್ಯೆ:</strong> ${refNum}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${todayFormatted}</div>
          </div>

          <div class="space-y-1 my-3 text-xs bg-stone-50 p-3 rounded border border-stone-300">
            <div><strong>ಇವರಿಗೆ:</strong></div>
            <div class="font-bold text-sm text-stone-950">${c.applicantName}</div>
            <div class="text-stone-700">${c.applicantAddress}</div>
          </div>

          <div class="my-3 text-xs">
            <p><strong>ಮಾನ್ಯರೇ,</strong></p>
            <div class="pl-4 space-y-1 my-2">
              <p><strong>ವಿಷಯ:</strong> ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 7(3) ರ ಪ್ರಕಾರ ಹೆಚ್ಚುವರಿ ಜೆರಾಕ್ಸ್ ಶುಲ್ಕ ಪಾವತಿಸುವ ಕುರಿತು.</p>
              <p><strong>ಉಲ್ಲೇಖ:</strong> ತಮ್ಮ ಅರ್ಜಿ ಸಂಖ್ಯೆ: <strong>${c.applicationNumber}</strong>, ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.receivedDate)}</strong>.</p>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಮೇಲ್ಕಂಡ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ತಾವು ಉಲ್ಲೇಖಿತ ಅರ್ಜಿಯಲ್ಲಿ ಕೋರಿರುವ ಮಾಹಿತಿಯ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಸದರಿ ಮಾಹಿತಿಯು ಒಟ್ಟು <strong>${c.furtherFeePages || 20} ಪುಟಗಳನ್ನು</strong> ಒಳಗೊಂಡಿರುತ್ತದೆ.
            </p>

            <div class="bg-amber-50 p-3 rounded border border-amber-300 my-3 space-y-1.5">
              <div class="font-bold text-xs text-amber-950">ಶುಲ್ಕದ ಲೆಕ್ಕಾಚಾರ (Fee Calculation):</div>
              <div class="flex justify-between border-b border-amber-200 pb-1">
                <span>1. ಒಟ್ಟು ಪುಟಗಳ ಸಂಖ್ಯೆ (A4 Size Photostat):</span>
                <strong>${c.furtherFeePages || 20} ಪುಟಗಳು</strong>
              </div>
              <div class="flex justify-between border-b border-amber-200 pb-1">
                <span>2. ಪ್ರತಿ ಪುಟಕ್ಕೆ ನಿಗದಿತ ಶುಲ್ಕ ದರ:</span>
                <strong>₹2/- (ರೂಪಾಯಿ ಎರಡು ಮಾತ್ರ)</strong>
              </div>
              <div class="flex justify-between font-bold text-stone-950 pt-1">
                <span>3. ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ:</span>
                <span class="text-sm font-mono-code text-rose-800">₹${c.furtherFeeAmount || 40}/-</span>
              </div>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಆದ್ದರಿಂದ ಸದರಿ ಮೊತ್ತ <strong>₹${c.furtherFeeAmount || 40}/- ಗಳನ್ನು</strong> ಈ ಪತ್ರ ತಲುಪಿದ 7 ದಿನಗಳ ಒಳಗಾಗಿ ಕಛೇರಿಗೆ ನಗದು ರೂಪದಲ್ಲಿ ಅಥವಾ ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ ಮೂಲಕ ಪಾವತಿಸಿ ಮಾಹಿತಿಯನ್ನು ಪಡೆದುಕೊಳ್ಳಲು ಕೋರಲಾಗಿದೆ. ಶುಲ್ಕ ಪಾವತಿಸಿದ ದಿನಾಂಕದಿಂದ ಮಾಹಿತಿಯನ್ನು ವಿತರಿಸಲು ಕಾಲಮಿತಿ ಅನ್ವಯಿಸುತ್ತದೆ.
            </p>
          </div>

          <div class="mt-8 flex justify-between items-end">
            <div class="text-[11px] text-stone-600">
              ಕಡತ ಸಂಖ್ಯೆ: ${c.fileNumber}<br/>
              ದಿನಾಂಕ: ${todayFormatted}<br/>
              ಸ್ಥಳ: ಭದ್ರಾವತಿ
            </div>
            <div class="text-center">
              <div class="font-bold text-xs">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO) ಹಾಗೂ</div>
              <div class="font-bold text-xs">ಕಛೇರಿ ಅಧೀಕ್ಷಕರು</div>
              <div class="text-[11px] text-stone-700">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
            </div>
          </div>
        </div>
        `;

      case 'first_appeal_notice':
        return `
        <div class="karnataka-govt-document p-8 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-3 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="font-bold text-base text-stone-950 mt-0.5">ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ</div>
            <div class="text-xs text-stone-700">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</div>
            <div class="font-bold text-sm text-stone-900 underline mt-2">
              ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 19(1) ರನ್ವಯ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ವಿಚಾರಣಾ ನೋಟಿಸ್
            </div>
          </div>

          <div class="flex justify-between items-center my-3 text-xs">
            <div><strong>ಮೇಲ್ಮನವಿ ಸಂಖ್ಯೆ:</strong> ${refNum}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${todayFormatted}</div>
          </div>

          <div class="grid grid-cols-2 gap-3 my-3 text-xs">
            <div class="bg-stone-50 p-2.5 rounded border border-stone-300">
              <div class="font-bold text-stone-700">ಮೇಲ್ಮನವಿದಾರರು (Appellant):</div>
              <div class="font-bold text-sm text-stone-950 mt-1">${c.applicantName}</div>
              <div class="text-stone-700">${c.applicantAddress}</div>
            </div>
            <div class="bg-stone-50 p-2.5 rounded border border-stone-300">
              <div class="font-bold text-stone-700">ಪ್ರತಿವಾದಿಗಳು (Respondent):</div>
              <div class="font-bold text-sm text-stone-950 mt-1">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO)</div>
              <div class="text-stone-700">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</div>
            </div>
          </div>

          <div class="my-3 text-xs">
            <p class="text-justify leading-relaxed indent-8 my-2">
              ಮೇಲ್ಮನವಿದಾರರಾದ ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>${c.applicantName}</strong> ರವರು ಸಲ್ಲಿಸಿರುವ ಮೂಲ ಅರ್ಜಿ ಸಂಖ್ಯೆ: <strong>${c.applicationNumber}</strong> (ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.receivedDate)}</strong>) ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮಾಹಿತಿ ಒದಗಿಸಿಲ್ಲವೆಂದು / ಅಸಮರ್ಪಕ ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆಯೆಂದು ಆಕ್ಷೇಪಿಸಿ, ಈ ಪ್ರಾಧಿಕಾರದ ಮುಂದೆ ಕಲಂ 19(1) ರ ಅಡಿಯಲ್ಲಿ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ.
            </p>

            <div class="bg-amber-100/70 p-3 rounded-lg border-2 border-amber-400 my-3 text-center">
              <div class="font-bold text-sm text-stone-950 mb-1">ವಿಚಾರಣಾ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ (Hearing Notice):</div>
              <div class="text-xs font-bold text-stone-800">
                ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.appealHearingDate || new Date())}</strong>, ಸಮಯ: ಅಪರಾಹ್ನ 3:00 ಗಂಟೆಗೆ
              </div>
              <div class="text-[11px] text-stone-700 mt-0.5">
                ಸ್ಥಳ: ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ನ್ಯಾಯಾಲಯ ಸಭಾಂಗಣ, ಭದ್ರಾವತಿ
              </div>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಆದ್ದರಿಂದ ಉಭಯ ಪಕ್ಷಗಾರರು ಮೇಲ್ಕಂಡ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದಲ್ಲಿ ಅಗತ್ಯ ಮೂಲ ದಾಖಲೆಗಳೊಂದಿಗೆ ಖುದ್ದಾಗಿ ಅಥವಾ ಅಧಿಕೃತ ಪ್ರತಿನಿಧಿಯ ಮೂಲಕ ವಿಚಾರಣೆಗೆ ಹಾಜರಾಗಲು ಈ ಮೂಲಕ ಸೂಚಿಸಲಾಗಿದೆ. ತಪ್ಪಿದ್ದಲ್ಲಿ ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ಏಕಪಕ್ಷೀಯವಾಗಿ ಆದೇಶ ಹೊರಡಿಸಲಾಗುವುದು.
            </p>
          </div>

          <div class="mt-8 flex justify-between items-end">
            <div class="text-[11px] text-stone-600">
              ದಿನಾಂಕ: ${todayFormatted}<br/>
              ಸ್ಥಳ: ಭದ್ರಾವತಿ
            </div>
            <div class="text-right">
              <div class="font-bold text-xs">ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ</div>
              <div class="font-bold text-xs">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</div>
              <div class="text-[11px] text-stone-700">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</div>
            </div>
          </div>
        </div>
        `;

      case 'sec8_rejection':
        return `
        <div class="karnataka-govt-document p-8 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-3 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="font-bold text-base text-stone-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
            <div class="font-bold text-sm text-rose-900 underline mt-2">
              ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 8 / 9 ರನ್ವಯ ಮಾಹಿತಿ ನಿರಾಕರಣೆ ಆದೇಶ
            </div>
          </div>

          <div class="flex justify-between items-center my-3 text-xs">
            <div><strong>ಕ್ರ.ಸಂಖ್ಯೆ:</strong> ${refNum}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${todayFormatted}</div>
          </div>

          <div class="space-y-1 my-3 text-xs bg-stone-50 p-3 rounded border border-stone-300">
            <div><strong>ಇವರಿಗೆ:</strong></div>
            <div class="font-bold text-sm text-stone-950">${c.applicantName}</div>
            <div class="text-stone-700">${c.applicantAddress}</div>
          </div>

          <div class="my-3 text-xs">
            <p><strong>ಮಾನ್ಯರೇ,</strong></p>
            <div class="pl-4 space-y-1 my-2">
              <p><strong>ವಿಷಯ:</strong> ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ಅಡಿಯಲ್ಲಿ ಕೋರಿದ ಮಾಹಿತಿಯನ್ನು ನಿರಾಕರಿಸುವ ಕುರಿತು.</p>
              <p><strong>ಉಲ್ಲೇಖ:</strong> ತಮ್ಮ ಅರ್ಜಿ ಸಂಖ್ಯೆ: <strong>${c.applicationNumber}</strong>, ದಿನಾಂಕ: <strong>${formatDdMmYyyy(c.receivedDate)}</strong>.</p>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಮೇಲ್ಕಂಡ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ತಾವು ಉಲ್ಲೇಖಿತ ಅರ್ಜಿಯಲ್ಲಿ ಕೋರಿರುವ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಸದರಿ ಮಾಹಿತಿಯು ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 8(1)(j) ರ ವ್ಯಾಪ್ತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ. ಸದರಿ ಮಾಹಿತಿಯು ನೌಕರರ ವೈಯಕ್ತಿಕ ವಿವರವಾಗಿದ್ದು, ಇದರಲ್ಲಿ ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿ ಕಂಡುಬಂದಿರುವುದಿಲ್ಲ.
            </p>

            <div class="bg-rose-50 p-3 rounded border border-rose-300 my-3 text-rose-950">
              <div class="font-bold text-xs mb-1">ತಿರಸ್ಕಾರಕ್ಕೆ ಕಾರಣವಾದ ಶಾಸನಬದ್ಧ ಕಲಂ:</div>
              <p class="leading-relaxed">
                ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 8(1)(j) - ವ್ಯಕ್ತಿಯ ಖಾಸಗಿತನದ ಮೇಲೆ ಅನಗತ್ಯ ಅತಿಕ್ರಮಣ ಮಾಡುವ ಹಾಗೂ ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಚಟುವಟಿಕೆ ಅಥವಾ ಹಿತಾಸಕ್ತಿಗೆ ಸಂಬಂಧಪಡದ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಪ್ರಕಟಿಸುವುದರಿಂದ ವಿನಾಯಿತಿ ನೀಡಲಾಗಿದೆ.
              </p>
            </div>

            <p class="text-justify leading-relaxed indent-8 my-2">
              ಆದ್ದರಿಂದ ಈ ಮೇಲ್ಕಂಡ ಶಾಸನಬದ್ಧ ಕಾರಣಗಳಿಗಾಗಿ ಕೋರಿದ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲು ಸಾಧ್ಯವಿರುವುದಿಲ್ಲವೆಂದು ಈ ಮೂಲಕ ತಿಳಿಸಲಾಗಿದೆ. ಸದರಿ ಆದೇಶದಿಂದ ಅಸಮಾಧಾನವಿದ್ದಲ್ಲಿ 30 ದಿನಗಳೊಳಗೆ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬಹುದಾಗಿದೆ.
            </p>
          </div>

          <div class="mt-8 flex justify-between items-end">
            <div class="text-[11px] text-stone-600">
              ಕಡತ ಸಂಖ್ಯೆ: ${c.fileNumber}<br/>
              ದಿನಾಂಕ: ${todayFormatted}<br/>
              ಸ್ಥಳ: ಭದ್ರಾವತಿ
            </div>
            <div class="text-center">
              <div class="font-bold text-xs">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO) ಹಾಗೂ</div>
              <div class="font-bold text-xs">ಕಛೇರಿ ಅಧೀಕ್ಷಕರು</div>
              <div class="text-[11px] text-stone-700">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
            </div>
          </div>
        </div>
        `;

      case 'quarterly_proforma':
      default:
        return `
        <div class="karnataka-govt-document p-6 bg-white text-stone-900 font-kannada text-xs leading-relaxed max-w-[820px] mx-auto border border-stone-300">
          <div class="text-center pb-2 border-b-2 border-stone-800">
            <div class="font-bold text-xs">ಕರ್ನಾಟಕ ಮಾಹಿತಿ ಆಯೋಗ (KIC) & ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ</div>
            <div class="font-bold text-sm text-stone-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
            <div class="font-bold text-xs text-stone-900 underline mt-1">
              ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 - ತ್ರೈಮಾಸಿಕ / ವಾರ್ಷಿಕ ಪ್ರಗತಿ ತಃಖ್ಯೆ (RTI QUARTERLY RETURN PROFORMA)
            </div>
            <div class="text-[11px] text-stone-600 mt-0.5 font-mono-code">
              ಪತ್ರ ಸಂಖ್ಯೆ: ${refNum} • ದಿನಾಂಕ: ${todayFormatted}
            </div>
          </div>

          <table class="w-full border-collapse border border-stone-400 my-4 text-[11px]">
            <tr class="bg-stone-100 font-bold text-center">
              <th class="border border-stone-400 p-1.5">ಕ್ರ.ಸಂ</th>
              <th class="border border-stone-400 p-1.5">ವಿವರಗಳು (Particulars)</th>
              <th class="border border-stone-400 p-1.5">ಸಂಖ್ಯೆ (Count)</th>
              <th class="border border-stone-400 p-1.5">ಷರಾ (Remarks)</th>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">1</td>
              <td class="border border-stone-400 p-1.5">ತ್ರೈಮಾಸಿಕದ ಆರಂಭದಲ್ಲಿ ಬಾಕಿ ಇದ್ದ ಅರ್ಜಿಗಳು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold">02</td>
              <td class="border border-stone-400 p-1.5">ಹಿಂದಿನ ತ್ರೈಮಾಸಿಕದಿಂದ ಬಾಕಿ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">2</td>
              <td class="border border-stone-400 p-1.5">ಪ್ರಸ್ತುತ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ಸ್ವೀಕರಿಸಲಾದ ಒಟ್ಟು ಅರ್ಜಿಗಳು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold text-blue-800">12</td>
              <td class="border border-stone-400 p-1.5">ಕಲಂ 6(1) ರಂತೆ ನೇರ ಅರ್ಜಿಗಳು</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">3</td>
              <td class="border border-stone-400 p-1.5">ಕಲಂ 6(3) ರನ್ವಯ ಇತರೆ ಪ್ರಾಧಿಕಾರಗಳಿಂದ ಸ್ವೀಕೃತವಾದದ್ದು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold">03</td>
              <td class="border border-stone-400 p-1.5">ವರ್ಗಾವಣೆ ಮೂಲಕ ಸ್ವೀಕೃತಿ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center font-bold">4</td>
              <td class="border border-stone-400 p-1.5 font-bold">ಒಟ್ಟು ವಿಲೇವಾರಿಗೆ ಲಭ್ಯವಿದ್ದ ಅರ್ಜಿಗಳು (1+2+3)</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold bg-amber-100">17</td>
              <td class="border border-stone-400 p-1.5">-</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">5</td>
              <td class="border border-stone-400 p-1.5">ಮಾಹಿತಿ ಒದಗಿಸಲಾದ ಅರ್ಜಿಗಳ ಸಂಖ್ಯೆ</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold text-emerald-800">13</td>
              <td class="border border-stone-400 p-1.5">30 ದಿನಗಳೊಳಗಾಗಿ ವಿಲೇವಾರಿ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">6</td>
              <td class="border border-stone-400 p-1.5">ಕಲಂ 6(3) ರಂತೆ ಬೇರೆ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾಯಿಸಿದ್ದು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold">02</td>
              <td class="border border-stone-400 p-1.5">5 ದಿನಗಳೊಳಗಾಗಿ ವರ್ಗಾವಣೆ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">7</td>
              <td class="border border-stone-400 p-1.5">ಕಲಂ 8/9 ರನ್ವಯ ತಿರಸ್ಕರಿಸಲಾದ ಅರ್ಜಿಗಳು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold text-rose-800">01</td>
              <td class="border border-stone-400 p-1.5">ಖಾಸಗಿ ವಿವರ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">8</td>
              <td class="border border-stone-400 p-1.5 font-bold">ತ್ರೈಮಾಸಿಕದ ಅಂತ್ಯಕ್ಕೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿರುವ ಬಾಕಿ ಅರ್ಜಿಗಳು</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold text-amber-900 bg-amber-50">01</td>
              <td class="border border-stone-400 p-1.5">ಕಾಲಮಿತಿಯೊಳಗಿದೆ</td>
            </tr>
            <tr>
              <td class="border border-stone-400 p-1.5 text-center">9</td>
              <td class="border border-stone-400 p-1.5">ಸಂಗ್ರಹವಾದ ಒಟ್ಟು ಅರ್ಜಿ ಶುಲ್ಕ ಮತ್ತು ಜೆರಾಕ್ಸ್ ವೆಚ್ಚ</td>
              <td class="border border-stone-400 p-1.5 text-center font-bold font-mono-code">₹380/-</td>
              <td class="border border-stone-400 p-1.5">ಸರ್ಕಾರಿ ಖಜಾನೆಗೆ ಜಮೆ</td>
            </tr>
          </table>

          <div class="mt-8 flex justify-between items-end">
            <div class="text-[11px] text-stone-600">
              ದಿನಾಂಕ: ${todayFormatted}
            </div>
            <div class="text-center">
              <div class="font-bold text-xs">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</div>
              <div class="text-[11px] text-stone-700">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</div>
            </div>
          </div>
        </div>
        `;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stat Cards */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold border border-amber-300 shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-kannada text-white">
                  ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ನಿರ್ವಹಣೆ (RTI Management & Correspondence)
                </h2>
                <p className="text-xs text-stone-300 font-kannada">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ • ಶಾಸನಬದ್ಧ ಅರ್ಜಿಗಳ ದಾಖಲಾತಿ, 30 ದಿನಗಳ SLA ಟ್ರ್ಯಾಕಿಂಗ್ & ಪತ್ರ ವ್ಯಾವಹಾರಗಳು
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCase && (
              <button
                id="btn-rti-banner-capture-doc"
                type="button"
                onClick={() => handleOpenCaptureForCase(selectedCase)}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
                title="ಕ್ಯಾಮರಾದಿಂದ ಕಾಗದ ದಾಖಲೆಯ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>ದಾಖಲೆ ಸೆರೆಹಿಡಿ (Capture Document)</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingCaseId(null);
                setFormData({
                  applicationNumber: `RTI/BEO/BHD/2026/${String(rtiCases.length + 1).padStart(2, '0')}`,
                  fileNumber: `ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-0${rtiCases.length + 1}/2026-27`,
                  applicantName: '',
                  applicantAddress: '',
                  applicantPhone: '',
                  applicantEmail: '',
                  isBpl: false,
                  bplCardNumber: '',
                  feeMode: 'ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)',
                  feeReceiptNumber: '',
                  feeAmount: 10,
                  receivedDate: new Date().toISOString().split('T')[0],
                  targetResponseDate: (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    return d.toISOString().split('T')[0];
                  })(),
                  sectionClause: 'ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)',
                  subject: '',
                  informationSought: '',
                  assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
                  firstAppellateAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ (ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ)',
                  status: 'ಸ್ವೀಕೃತ (Pending)'
                });
                setActiveSubTab('entry');
              }}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>+ ನೂತನ RTI ಅರ್ಜಿ ನಮೂದು</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-700/80">
          <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
            <span className="text-stone-400 text-xs block">ಒಟ್ಟು ಸ್ವೀಕೃತ ಅರ್ಜಿಗಳು:</span>
            <span className="text-xl font-bold font-mono-code text-white mt-0.5 block">{rtiCases.length}</span>
            <span className="text-[10px] text-stone-400">RTI Act 2005</span>
          </div>

          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60">
            <span className="text-amber-300 text-xs block">ವಿಲೇವಾರಿಯಾಗಬೇಕಾದವು:</span>
            <span className="text-xl font-bold font-mono-code text-amber-400 mt-0.5 block">
              {rtiCases.filter(c => c.status.includes('Pending') || c.status.includes('Process')).length}
            </span>
            <span className="text-[10px] text-amber-300">30 ದಿನಗಳ ಗಡುವು ನಿಯಮ</span>
          </div>

          <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800/60">
            <span className="text-blue-300 text-xs block">ಕಲಂ 6(3) ವರ್ಗಾವಣೆ:</span>
            <span className="text-xl font-bold font-mono-code text-blue-300 mt-0.5 block">
              {rtiCases.filter(c => c.status.includes('6(3)')).length}
            </span>
            <span className="text-[10px] text-blue-300">5 ದಿನಗಳೊಳಗೆ ವರ್ಗಾಯಿಸಿದ್ದು</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-emerald-300 text-xs block">ಮಾಹಿತಿ ಒದಗಿಸಿದವು (Closed):</span>
            <span className="text-xl font-bold font-mono-code text-emerald-300 mt-0.5 block">
              {rtiCases.filter(c => c.status.includes('ಒದಗಿಸಲಾಗಿದೆ') || c.status.includes('ವಿಲೇವಾರಿ')).length}
            </span>
            <span className="text-[10px] text-emerald-300">ಯಶಸ್ವಿ ವಿಲೇವಾರಿ</span>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tab Navigation Bar */}
      <div className="bg-white p-2.5 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'register'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>1. ಮಾಹಿತಿ ಹಕ್ಕು ರಿಜಿಸ್ಟರ್ (RTI Register)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('entry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'entry'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. ಅರ್ಜಿ ನಮೂದು & ಪರಿಶೀಲನೆ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('letters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'letters'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>3. ಅಧಿಕೃತ ಪತ್ರ ವ್ಯಾವಹಾರಗಳು (Letter Studio)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appeals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'appeals'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>4. ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ನಿರ್ವಹಣೆ (FAA)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('labels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'labels'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>5. ಕಡತ ಲೇಬಲ್ & ಮುದ್ರಣ</span>
          </button>
        </div>

        {selectedCase && (
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg text-xs">
            <span className="text-stone-500 font-medium">ಆಯ್ಕೆಯಾದ ಅರ್ಜಿ:</span>
            <span className="font-bold text-stone-900">{selectedCase.applicationNumber}</span>
            <span className="text-stone-700 truncate max-w-[180px]">({selectedCase.applicantName})</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: STATUTORY RTI APPLICATIONS REGISTER (ರಿಜಿಸ್ಟರ್ ತಃಖ್ಯೆ)            */}
      {/* ========================================================================= */}
      {activeSubTab === 'register' && (
        <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] p-5 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-stone-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ಅರ್ಜಿ ಸಂ, ಅರ್ಜಿದಾರರ ಹೆಸರು ಅಥವಾ ವಿಷಯ ಹುಡುಕಿ..."
                className="w-full pl-9 pr-3 py-2 border-2 border-stone-800 rounded-lg text-xs font-kannada focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="p-2 border-2 border-stone-800 rounded-lg text-xs font-kannada bg-white cursor-pointer"
              >
                <option value="all">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All Status)</option>
                <option value="ಸ್ವೀಕೃತ (Pending)">ಸ್ವೀಕೃತ (Pending)</option>
                <option value="ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)</option>
                <option value="ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ (Information Furnished)">ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ (Furnished)</option>
                <option value="ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾಯಿಸಲಾಗಿದೆ (Transferred Sec 6(3))">ಕಲಂ 6(3) ವರ್ಗಾವಣೆ</option>
                <option value="ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected Sec 8/9)">ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Cases Register Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs font-kannada">
              <thead>
                <tr className="bg-stone-100 border-b-2 border-stone-800 text-stone-800 text-left">
                  <th className="p-3 font-bold">ಅರ್ಜಿ ಸಂ. & ಕಡತ</th>
                  <th className="p-3 font-bold">ಅರ್ಜಿದಾರರ ವಿವರ</th>
                  <th className="p-3 font-bold">ಕೋರಿದ ಮಾಹಿತಿ ವಿಷಯ</th>
                  <th className="p-3 font-bold">ದಿನಾಂಕ & 30 ದಿನಗಳ SLA ಗಡುವು</th>
                  <th className="p-3 font-bold">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ</th>
                  <th className="p-3 font-bold text-right">ಕ್ರಮಗಳು (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredCases.map(c => {
                  const sla = getSlaDetails(c.receivedDate, c.targetResponseDate, c.status);
                  const isSelected = selectedCase?.id === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`hover:bg-amber-50/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-100/70 border-l-4 border-amber-600' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-stone-900 font-mono-code">{c.applicationNumber}</div>
                        <div className="text-[11px] text-stone-500 font-mono-code">{c.fileNumber}</div>
                        <span className="text-[9px] bg-stone-200 text-stone-700 px-1 rounded mt-0.5 inline-block font-mono-code">
                          {c.feeMode.includes('BPL') ? 'BPL ವಿನಾಯಿತಿ' : `₹${c.feeAmount} ಶುಲ್ಕ`}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-stone-900">{c.applicantName}</div>
                        <div className="text-[11px] text-stone-600 truncate max-w-[200px]">{c.applicantAddress}</div>
                        {c.applicantPhone && (
                          <div className="text-[10px] text-stone-500 font-mono-code">{c.applicantPhone}</div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-stone-900 line-clamp-2 max-w-[280px]">{c.subject}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{c.sectionClause}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-stone-700 font-mono-code text-[11px]">
                          ಸ್ವೀಕೃತ: <strong>{c.receivedDate}</strong>
                        </div>
                        <div className="text-stone-700 font-mono-code text-[11px] mt-0.5">
                          ಗಡುವು: <strong>{c.targetResponseDate}</strong>
                        </div>
                        <div className={`text-[10px] px-2 py-0.5 rounded border inline-block mt-1 font-mono-code ${sla.color}`}>
                          {sla.label}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          c.status.includes('ಒದಗಿಸಲಾಗಿದೆ')
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : c.status.includes('ವರ್ಗಾಯಿಸಲಾಗಿದೆ')
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : c.status.includes('ತಿರಸ್ಕರಿಸಲಾಗಿದೆ')
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCaptureForCase(c);
                            }}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded border border-indigo-300 transition-all cursor-pointer"
                            title="ದಾಖಲೆ ಸೆರೆಹಿಡಿ - ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
                          >
                            <Camera className="w-3.5 h-3.5 text-indigo-700" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCase(c);
                              setSelectedLetterFormat('info_furnish_letter');
                              setActiveSubTab('letters');
                            }}
                            className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded border border-sky-300 transition-all cursor-pointer"
                            title="ಪತ್ರ ರಚಿಸಿ / ವೀಕ್ಷಿಸಿ"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCase(c);
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-300 transition-all cursor-pointer"
                            title="ತಿದ್ದುಪಡಿ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SELECTED CASE DOSSIER & ATTACHMENTS SECTION */}
          {selectedCase && (
            <div className="bg-stone-50 border-2 border-stone-800 rounded-xl p-4 shadow-[3px_3px_0px_#2b2b2b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-bold shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-amber-200 text-stone-900 px-2 py-0.5 rounded border border-amber-400">
                        {selectedCase.fileNumber}
                      </span>
                      <span className="text-[11px] font-mono text-stone-600">
                        ಅರ್ಜಿ ಸಂ: <strong>{selectedCase.applicationNumber}</strong>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-bold">
                        {selectedCase.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-900 mt-1 font-kannada">
                      {selectedCase.applicantName} • <span className="font-normal text-stone-600">{selectedCase.subject}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="btn-rti-docket-capture-doc"
                    type="button"
                    onClick={() => handleOpenCaptureForCase(selectedCase)}
                    className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg transition-all border border-indigo-900 shadow-2xs cursor-pointer flex items-center gap-1.5"
                    title="ಕ್ಯಾಮರಾದಿಂದ ಕಾಗದ ದಾಖಲೆ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>ದಾಖಲೆ ಸೆರೆಹಿಡಿ (Capture Document)</span>
                  </button>

                  <label className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs rounded-lg transition-all border border-stone-300 shadow-2xs cursor-pointer flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                    <span>ಫೈಲ್ ಅಪ್‌ಲೋಡ್ (Upload)</span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      multiple
                      onChange={(e) => handleUploadRtiDocument(e, selectedCase)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS LIST */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                  <span className="flex items-center gap-1.5 font-kannada">
                    <Paperclip className="w-3.5 h-3.5 text-stone-600" />
                    <span>ಕಡತದ ಲಗತ್ತುಗಳು ಮತ್ತು ಸೆರೆಹಿಡಿದ ದಾಖಲೆ ಪ್ರತಿಗಳು (Attached Documents - PDF / JPG)</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    ಒಟ್ಟು: {selectedCaseAttachments.length} ದಾಖಲೆಗಳು
                  </span>
                </div>

                {selectedCaseAttachments.length === 0 ? (
                  <div className="p-4 bg-white rounded-lg border border-dashed border-stone-300 text-center text-xs text-stone-500 font-kannada">
                    ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ದಾಖಲೆ ಪ್ರತಿಗಳು ಲಗತ್ತಿಸಿಲ್ಲ. ಮೇಲಿನ <strong className="text-indigo-900">"ದಾಖಲೆ ಸೆರೆಹಿಡಿ"</strong> ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆದು ಲಗತ್ತಿಸಿ.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedCaseAttachments.map((att) => {
                      const isPdf = att.fileType === 'application/pdf' || att.fileName.toLowerCase().endsWith('.pdf');
                      return (
                        <div
                          key={att.id}
                          className="bg-white p-2.5 rounded-lg border border-stone-300 shadow-2xs flex items-center justify-between gap-2 hover:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                              isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate" title={att.fileName}>
                                {att.fileName}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                {att.fileSize} • {att.uploadedAt}
                              </p>
                            </div>
                          </div>

                          {onViewAttachment && (
                            <button
                              type="button"
                              onClick={() => onViewAttachment(att)}
                              className="p-1 hover:bg-stone-100 text-sky-900 rounded cursor-pointer shrink-0"
                              title="ದಾಖಲೆ ವೀಕ್ಷಿಸಿ (View Document)"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: NEW RTI APPLICATION ENTRY FORM (ನೂತನ ಅರ್ಜಿ ನಮೂದು)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'entry' && (
        <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 mb-5">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-kannada">
                {editingCaseId ? 'ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ತಿದ್ದುಪಡಿ (Edit RTI Case)' : 'ನೂತನ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ನಮೂದು (New RTI Application)'}
              </h3>
              <p className="text-xs text-stone-500 font-kannada">
                ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರನ್ವಯ ಅಧಿಕೃತ ದಾಖಲಾತಿ ಹಾಗೂ ಸ್ವಯಂಚಾಲಿತ 30 ದಿನಗಳ ಗಡುವು ಲೆಕ್ಕಾಚಾರ
              </p>
            </div>
            <span className="bg-amber-400 text-stone-950 font-bold px-3 py-1 rounded-lg border-2 border-stone-800 text-xs font-mono-code shadow-sm">
              Section 6(1)
            </span>
          </div>

          <form onSubmit={handleSaveRtiCase} className="space-y-4 text-xs font-kannada">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-stone-800 font-bold mb-1">ಅರ್ಜಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ (Application No)*</label>
                <input
                  type="text"
                  required
                  value={formData.applicationNumber}
                  onChange={e => setFormData({ ...formData, applicationNumber: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code font-bold bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಕಛೇರಿ ಕಡತ ಸಂಖ್ಯೆ (File Number)*</label>
                <input
                  type="text"
                  required
                  value={formData.fileNumber}
                  onChange={e => setFormData({ ...formData, fileNumber: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಅರ್ಜಿ ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ*</label>
                <input
                  type="date"
                  required
                  value={formData.receivedDate}
                  onChange={e => {
                    const rDate = e.target.value;
                    const d = new Date(rDate);
                    d.setDate(d.getDate() + 30);
                    setFormData({
                      ...formData,
                      receivedDate: rDate,
                      targetResponseDate: d.toISOString().split('T')[0]
                    });
                  }}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು (Applicant Name)*</label>
                <input
                  type="text"
                  required
                  placeholder="ಶ್ರೀ / ಶ್ರೀಮತಿ..."
                  value={formData.applicantName}
                  onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಸಂಪರ್ಕ ದೂರವಾಣಿ (Phone)</label>
                <input
                  type="tel"
                  placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                  value={formData.applicantPhone}
                  onChange={e => setFormData({ ...formData, applicantPhone: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಇಮೇಲ್ (Email)</label>
                <input
                  type="email"
                  placeholder="ಇಮೇಲ್ ವಿಳಾಸ"
                  value={formData.applicantEmail}
                  onChange={e => setFormData({ ...formData, applicantEmail: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-stone-800 font-bold mb-1">ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ವಿಳಾಸ (Postal Address)*</label>
                <textarea
                  required
                  rows={2}
                  placeholder="ಮನೆ ಸಂಖ್ಯೆ, ಬಡಾವಣೆ, ಗ್ರಾಮ/ನಗರ, ತಾಲ್ಲೂಕು, ಜಿಲ್ಲೆ, ಪಿನ್ ಕೋಡ್..."
                  value={formData.applicantAddress}
                  onChange={e => setFormData({ ...formData, applicantAddress: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಅರ್ಜಿ ಶುಲ್ಕ ಪಾವತಿ ವಿಧಾನ</label>
                <select
                  value={formData.feeMode}
                  onChange={e => setFormData({ ...formData, feeMode: e.target.value as any })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg bg-white"
                >
                  <option value="ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)">ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)</option>
                  <option value="ಐ.ಪಿ.ಓ (Indian Postal Order - IPO)">ಐ.ಪಿ.ಓ (IPO)</option>
                  <option value="ಡಿ.ಡಿ (Demand Draft)">ಡಿ.ಡಿ (Demand Draft)</option>
                  <option value="ಖಜಾನೆ ಚಲನ್ (Treasury Challan)">ಖಜಾನೆ ಚಲನ್ (Challan)</option>
                  <option value="ನಗದು ಪಾವತಿ (Cash Receipt)">ನಗದು ಪಾವತಿ (Cash)</option>
                  <option value="ಬಿ.ಪಿ.ಎಲ್ ವಿನಾಯಿತಿ (BPL Exemption - ಉಚಿತ)">ಬಿ.ಪಿ.ಎಲ್ ವಿನಾಯಿತಿ (BPL Free)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಶುಲ್ಕ ರಶೀದಿ / ಐಪಿಒ ಸಂಖ್ಯೆ</label>
                <input
                  type="text"
                  placeholder="ರಶೀದಿ / ಸ್ಟಾಂಪ್ ಸಂಖ್ಯೆ"
                  value={formData.feeReceiptNumber}
                  onChange={e => setFormData({ ...formData, feeReceiptNumber: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-mono-code"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಶಾಸನಬದ್ಧ ಕಲಂ (RTI Section)</label>
                <select
                  value={formData.sectionClause}
                  onChange={e => {
                    const sec = e.target.value as RtiSectionClause;
                    const d = new Date(formData.receivedDate);
                    if (sec.includes('7(1)')) {
                      d.setDate(d.getDate() + 2); // 48 hours for life
                    } else if (sec.includes('6(3)')) {
                      d.setDate(d.getDate() + 5); // 5 days for transfer
                    } else {
                      d.setDate(d.getDate() + 30); // 30 days
                    }
                    setFormData({ ...formData, sectionClause: sec, targetResponseDate: d.toISOString().split('T')[0] });
                  }}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg bg-white font-medium"
                >
                  <option value="ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)">ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)</option>
                  <option value="ಕಲಂ 6(3) - ಇತರೆ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾವಣೆ (5 Days)">ಕಲಂ 6(3) - ವರ್ಗಾವಣೆ (5 Days)</option>
                  <option value="ಕಲಂ 7(1) - ಜೀವ ಅಥವಾ ಸ್ವಾತಂತ್ರ್ಯ (48 Hours)">ಕಲಂ 7(1) - ಜೀವ/ಸ್ವಾತಂತ್ರ್ಯ (48 Hours)</option>
                  <option value="ಕಲಂ 19(1) - ಪ್ರಥಮ ಮೇಲ್ಮನವಿ (First Appeal)">ಕಲಂ 19(1) - ಪ್ರಥಮ ಮೇಲ್ಮನವಿ</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-stone-800 font-bold mb-1">ಕೋರಿದ ಮಾಹಿತಿಯ ವಿಷಯ (Subject of RTI)*</label>
                <input
                  type="text"
                  required
                  placeholder="ವಿಷಯ ಸಂಕ್ಷಿಪ್ತವಾಗಿ..."
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-stone-800 font-bold mb-1">ಕೋರಲಾದ ಮಾಹಿತಿಯ ವಿವರವಾದ ಅಂಶಗಳು (Particulars of Information Sought)*</label>
                <textarea
                  required
                  rows={4}
                  placeholder="1. ಕೋರಿದ ಮಾಹಿತಿ ಅಂಶ 1...&#10;2. ಕೋರಿದ ಮಾಹಿತಿ ಅಂಶ 2...&#10;3. ದಾಖಲೆಗಳ ದೃಢೀಕೃತ ಪ್ರತಿ..."
                  value={formData.informationSought}
                  onChange={e => setFormData({ ...formData, informationSought: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ನಿಯೋಜಿತ PIO ಅಧಿಕಾರಿ</label>
                <input
                  type="text"
                  value={formData.assignedOfficer}
                  onChange={e => setFormData({ ...formData, assignedOfficer: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (FAA)</label>
                <input
                  type="text"
                  value={formData.firstAppellateAuthority}
                  onChange={e => setFormData({ ...formData, firstAppellateAuthority: e.target.value })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-bold mb-1">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (Status)</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 border-2 border-stone-800 rounded-lg bg-white font-bold"
                >
                  <option value="ಸ್ವೀಕೃತ (Pending)">ಸ್ವೀಕೃತ (Pending)</option>
                  <option value="ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)</option>
                  <option value="ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ (Information Furnished)">ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ</option>
                  <option value="ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾಯಿಸಲಾಗಿದೆ (Transferred Sec 6(3))">ಕಲಂ 6(3) ವರ್ಗಾವಣೆ</option>
                  <option value="ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ (Fee Demanded)">ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ</option>
                  <option value="ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected Sec 8/9)">ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected)</option>
                  <option value="ವಿಲೇವಾರಿ & ದಾಖಲಿಸಲಾಗಿದೆ (Closed & Disposed)">ವಿಲೇವಾರಿ & ದಾಖಲಿಸಲಾಗಿದೆ</option>
                </select>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t-2 border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCaseId(null);
                  setActiveSubTab('register');
                }}
                className="px-4 py-2 border-2 border-stone-800 rounded-lg text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                ರದ್ದುಗೊಳಿಸಿ
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all border-2 border-stone-800 shadow-[3px_3px_0px_#000] cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingCaseId ? 'ಅರ್ಜಿ ನವೀಕರಿಸಿ (Update Case)' : 'RTI ಅರ್ಜಿ ಉಳಿಸಿ & ಕಡತ ಸೃಜಿಸಿ'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: OFFICIAL RTI CORRESPONDENCE LETTERS STUDIO (6 ಅಧಿಕೃತ ಪತ್ರಗಳು)     */}
      {/* ========================================================================= */}
      {activeSubTab === 'letters' && selectedCase && (
        <div className="space-y-4">
          {/* Format Switcher Header */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-kannada">
              <span className="font-bold text-stone-700 mr-1">RTI ಪತ್ರ ನಮೂನೆ:</span>

              <button
                onClick={() => setSelectedLetterFormat('info_furnish_letter')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'info_furnish_letter'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                1. ಮಾಹಿತಿ ಒದಗಿಸುವ ಪತ್ರ
              </button>

              <button
                onClick={() => setSelectedLetterFormat('sec6_3_transfer')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'sec6_3_transfer'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                2. ಕಲಂ 6(3) ವರ್ಗಾವಣೆ
              </button>

              <button
                onClick={() => setSelectedLetterFormat('further_fee_demand')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'further_fee_demand'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                3. ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ
              </button>

              <button
                onClick={() => setSelectedLetterFormat('first_appeal_notice')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'first_appeal_notice'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                4. ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ನೋಟಿಸ್
              </button>

              <button
                onClick={() => setSelectedLetterFormat('sec8_rejection')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'sec8_rejection'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                5. ತಿರಸ್ಕಾರ ಆದೇಶ (ಕಲಂ 8/9)
              </button>

              <button
                onClick={() => setSelectedLetterFormat('quarterly_proforma')}
                className={`px-3 py-1.5 rounded-lg font-bold border border-stone-800 cursor-pointer transition-all ${
                  selectedLetterFormat === 'quarterly_proforma'
                    ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                6. ತ್ರೈಮಾಸಿಕ ರಿಟರ್ನ್ ತಃಖ್ಯೆ
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>ಮುದ್ರಿಸಿ (Print A4)</span>
              </button>

              <button
                onClick={handleSaveActiveRtiLetterToRegistry}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ಜಾವಕ ರಿಜಿಸ್ಟ್ರಿಗೆ ಸೇರಿಸಿ</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCaptureForCase(selectedCase)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                title="ಕ್ಯಾಮರಾದಿಂದ ಕಾಗದ ದಾಖಲೆಯ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>ದಾಖಲೆ ಸೆರೆಹಿಡಿ (Capture Document)</span>
              </button>

              <button
                onClick={() => {
                  const html = renderRtiLetterHtml(selectedLetterFormat, selectedCase);
                  navigator.clipboard.writeText(html);
                  showToast('HTML ಪಠ್ಯ ನಕಲಿಸಲಾಗಿದೆ.');
                }}
                className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold p-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer"
                title="HTML ನಕಲಿಸಿ"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Letter Document Preview Box */}
          <div className="bg-stone-200/80 p-4 sm:p-8 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-x-auto">
            <div className="max-w-[820px] mx-auto bg-white shadow-2xl rounded-sm p-4 sm:p-8 border border-stone-400 relative">
              {/* Rendered HTML Letter */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderRtiLetterHtml(selectedLetterFormat, selectedCase) 
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: FIRST APPELLATE AUTHORITY (FAA) COURT DOCKET                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'appeals' && (
        <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] p-6 space-y-5">
          <div className="pb-3 border-b-2 border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-kannada">
                ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (First Appellate Authority - BEO Court)
              </h3>
              <p className="text-xs text-stone-500 font-kannada">
                ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 19(1) ರ ಅಡಿಯಲ್ಲಿ ಸಲ್ಲಿಕೆಯಾದ ಪ್ರಥಮ ಮೇಲ್ಮನವಿಗಳ ವಿಚಾರಣೆ ಹಾಗೂ ತೀರ್ಪು ನಿರ್ವಹಣೆ
              </p>
            </div>
            <span className="bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded-lg border border-purple-300 text-xs font-mono-code">
              FAA Section 19(1)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border-2 border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಂ: FAA/2026/01</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded font-mono-code">
                  ವಿಚಾರಣೆ ನಿಗದಿಯಾಗಿದೆ
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div><strong>ಮೇಲ್ಮನವಿದಾರರು:</strong> ಶ್ರೀ ಕೆ. ರಾಮಕೃಷ್ಣ ಭಟ್</div>
                <div><strong>ಮೂಲ ಅರ್ಜಿ ಸಂ:</strong> RTI/BEO/BHD/2026/01</div>
                <div><strong>ವಿಷಯ:</strong> ಶಾಲೆಗಳ ಅನುದಾನ ವಿವರ ಒದಗಿಸಿಲ್ಲವೆಂದು ಆಕ್ಷೇಪಣೆ</div>
                <div><strong>ವಿಚಾರಣಾ ದಿನಾಂಕ:</strong> 2026-10-12 (ಅಪರಾಹ್ನ 3:00 ಗಂಟೆಗೆ)</div>
                <div><strong>ನ್ಯಾಯಪೀಠ:</strong> ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
              </div>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedLetterFormat('first_appeal_notice');
                    setActiveSubTab('letters');
                  }}
                  className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-bold hover:bg-stone-800 cursor-pointer"
                >
                  ವಿಚಾರಣಾ ನೋಟಿಸ್ ಮುದ್ರಿಸಿ
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border-2 border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-950">ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಂ: FAA/2025/14</span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded font-mono-code">
                  ವಿಲೇವಾರಿ ಆದೇಶ
                </span>
              </div>
              <div className="text-xs space-y-1 text-emerald-950">
                <div><strong>ಮೇಲ್ಮನವಿದಾರರು:</strong> ಶ್ರೀ ಸತೀಶ್ ಕುಮಾರ್ ಎಂ.</div>
                <div><strong>ವಿಷಯ:</strong> ಶಿಕ್ಷಕರ ವರ್ಗಾವಣೆ ಜೇಷ್ಠತಾ ಪಟ್ಟಿ ಕೋರಿಕೆ</div>
                <div><strong>ತೀರ್ಪು ದಿನಾಂಕ:</strong> 2026-08-18</div>
                <div><strong>ಆದೇಶ:</strong> 7 ದಿನಗಳೊಳಗೆ ಅರ್ಜಿದಾರರಿಗೆ ಉಚಿತವಾಗಿ ಮಾಹಿತಿ ನೀಡಲು PIO ಗೆ ನಿರ್ದೇಶನ.</div>
              </div>
              <div className="text-[10px] text-emerald-700 italic">
                ಆದೇಶ ಪಾಲನೆಯಾಗಿ ಕಡತ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: PHYSICAL RTI FILE DOCKET LABELS & SPINE STRIP                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'labels' && selectedCase && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-kannada">
                ಭೌತಿಕ RTI ಕಡತ ಅಂಟಿಸುವ ಲೇಬಲ್‌ಗಳು (RTI File Labels & Record Room Stickers)
              </h3>
              <p className="text-xs text-stone-500 font-kannada">
                ಭೌತಿಕ ಕಡತಗಳ ರ್ಯಾಕ್ ಹಾಗೂ ಕಡತ ಭಂಡಾರದಲ್ಲಿ ಶಾಶ್ವತ ದಾಖಲಾತಿಗಾಗಿ
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-2 cursor-pointer text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>ಲೇಬಲ್‌ಗಳನ್ನು ಮುದ್ರಿಸಿ (Print Labels)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Cover Label */}
            <div className="bg-white border-2 border-dashed border-stone-800 rounded-lg p-5 shadow-sm space-y-3">
              <div className="text-center pb-2 border-b-2 border-stone-800">
                <div className="font-bold text-xs">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
                <div className="font-bold text-sm text-stone-950 font-kannada">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</div>
                <div className="font-bold text-xs bg-rose-500 text-white inline-block px-3 py-0.5 rounded mt-1 font-mono-code">
                  ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ಕಡತ (RTI DOCKET)
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-kannada">
                <div><strong>ಕಡತ ಸಂಖ್ಯೆ:</strong> <span className="font-mono-code font-bold text-sm bg-stone-100 px-2 py-0.5 rounded border border-stone-400">{selectedCase.fileNumber}</span></div>
                <div><strong>ಅರ್ಜಿ ಸಂಖ್ಯೆ:</strong> <span className="font-mono-code font-bold">{selectedCase.applicationNumber}</span></div>
                <div><strong>ಅರ್ಜಿದಾರರು:</strong> <span className="font-bold text-stone-900">{selectedCase.applicantName}</span></div>
                <div><strong>ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ:</strong> <span className="font-mono-code font-bold">{selectedCase.receivedDate}</span></div>
                <div><strong>30 ದಿನಗಳ ಗಡುವು:</strong> <span className="font-mono-code font-bold text-rose-800">{selectedCase.targetResponseDate}</span></div>
                <div><strong>ವಿಷಯ:</strong> {selectedCase.subject}</div>
                <div><strong>ಶಾಖೆ:</strong> ಆ2 (ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ)</div>
              </div>

              <div className="pt-2 border-t border-stone-300 text-[10px] text-stone-600 flex justify-between">
                <span>ರಕ್ಷಣಾ ವರ್ಗ: 5 ವರ್ಷಗಳು (Class C)</span>
                <span>ದಾಖಲಿಸಿದ ದಿನಾಂಕ: {selectedCase.createdAt}</span>
              </div>
            </div>

            {/* Spine Label */}
            <div className="bg-white border-2 border-dashed border-stone-800 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="text-center pb-2 border-b-2 border-stone-800">
                <div className="font-bold text-xs">ಕಡತ ಪಟ್ಟಿಕೆ ಲೇಬಲ್ (RTI FILE SPINE)</div>
                <div className="text-xs text-stone-600">ಕಡತಗಳ ರ್ಯಾಕ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಗುರುತಿಸಲು</div>
              </div>

              <div className="bg-rose-100/60 p-3 rounded border border-rose-300 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold font-mono-code text-rose-950">RTI: {selectedCase.applicationNumber}</div>
                  <div className="font-bold font-kannada text-sm text-stone-900 mt-1">{selectedCase.applicantName}</div>
                  <div className="text-xs font-mono-code text-stone-700">ಕಡತ: {selectedCase.fileNumber}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-stone-900 text-amber-300 px-2 py-1 rounded text-xs font-mono-code font-bold border border-stone-700">
                    BEO/RTI
                  </span>
                  <div className="text-[10px] font-mono-code text-stone-700 mt-1 font-bold">ಆ2/ಸ.ಪ್ರಾ.ಶಿ</div>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 text-center italic">
                ಕಡತಗಳ ಭಂಡಾರ • ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ ಭದ್ರಾವತಿ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capture Document via Device Camera Modal */}
      {isCaptureModalOpen && captureTargetDocketFile && (
        <CaptureDocumentModal
          isOpen={isCaptureModalOpen}
          onClose={() => setIsCaptureModalOpen(false)}
          targetDocketFile={captureTargetDocketFile}
          onAttachDocument={handleAttachCapturedDocument}
          suggestedDocTitle={`RTI_${captureTargetCase?.applicationNumber?.replace(/[^a-zA-Z0-9]/g, '_') || 'ದಾಖಲೆ'}`}
          defaultCategory="ಮೂಲ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ / ಪೂರಕ ದಾಖಲೆ ಪ್ರತಿ"
          showToast={showToast}
        />
      )}
    </div>
  );
};
