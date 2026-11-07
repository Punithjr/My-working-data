import React, { useState, useMemo } from 'react';
import { 
  MasterDocketFile, 
  EducationLetter, 
  FileMovementRecord, 
  LetterPriority 
} from '../types';
import { 
  FolderGit2, 
  Search, 
  Send, 
  Clock, 
  User, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Plus,
  FolderPlus,
  ArrowUpRight,
  ShieldAlert,
  TrendingUp,
  Award,
  AlertTriangle,
  Printer,
  Calendar,
  Layers,
  FileCheck2,
  Building,
  RefreshCw,
  Sparkles,
  UserCheck,
  Briefcase,
  Edit3,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  Check,
  Eye,
  Download,
  FileSpreadsheet,
  FileDown,
  BarChart3,
  Paperclip,
  Trash2,
  Database
} from 'lucide-react';
import { 
  FileStatusMiniDashboard, 
  isPendingDocket, 
  isUnderReviewDocket, 
  isCompletedDocket 
} from './FileStatusMiniDashboard';
import { generateDocketDossierSummaryPdf } from '../utils/docketDossierPdfExport';
import { generateLetterPdf } from '../utils/letterPdfExport';
import { CreateOtherFileModal } from './CreateOtherFileModal';

interface FileDashboardProps {
  files: MasterDocketFile[];
  letters: EducationLetter[];
  onMoveFile: (fileId: string, fromOfficer: string, toOfficer: string, remarks: string, newStatus?: string) => Promise<void>;
  onCreateFile?: (fileData: Partial<MasterDocketFile>) => Promise<void>;
  onDraftLetterForFile?: (file: MasterDocketFile) => void;
  onViewLetter?: (letter: EducationLetter) => void;
  onSaveLetter?: (letterData: Partial<EducationLetter>) => Promise<void>;
  onShowToast?: (msg: string) => void;
  onDeleteFile?: (fileId: string) => Promise<void>;
  onClearSampleData?: () => Promise<void>;
  onLoadFreshData?: () => Promise<void>;
}

export type CategoryFilterKey = 
  | 'all'
  | 'pension'
  | 'promotion'
  | 'disciplinary'
  | 'salary'
  | 'leave'
  | 'accounts'
  | 'rti'
  | 'academic'
  | 'general';

interface CategoryTab {
  key: CategoryFilterKey;
  labelKn: string;
  labelEn: string;
  icon: React.ElementType;
  badgeClass: string;
  accentColor: string;
  matcher: (file: MasterDocketFile) => boolean;
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    key: 'all',
    labelKn: 'ಎಲ್ಲಾ ಕಡತಗಳು',
    labelEn: 'All Dockets',
    icon: Layers,
    badgeClass: 'bg-stone-800 text-white',
    accentColor: '#2b2b2b',
    matcher: () => true,
  },
  {
    key: 'pension',
    labelKn: 'ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ',
    labelEn: 'Pension & Retirement',
    icon: Award,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    accentColor: '#d97706',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      const num = (f.fileNumber || '').toLowerCase();
      return cat.includes('pension') || cat.includes('ಪಿಂಚಣಿ') || sub.includes('ನಿವೃತ್ತಿ') || sub.includes('pension') || sub.includes('ಪಿಂಚಣಿ') || num.includes('pen') || num === '57';
    },
  },
  {
    key: 'promotion',
    labelKn: 'ವೇತನ ಬಡ್ತಿ & ಪರಿಷ್ಕರಣೆ',
    labelEn: 'Promotion & Pay Revision',
    icon: TrendingUp,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accentColor: '#059669',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      const num = (f.fileNumber || '').toLowerCase();
      return cat.includes('promotion') || cat.includes('ಬಡ್ತಿ') || sub.includes('ಬಡ್ತಿ') || sub.includes('ಹಿರಿಯ ಶ್ರೇಣಿ') || sub.includes('ಆಯ್ಕೆ ಶ್ರೇಣಿ') || num.includes('prom');
    },
  },
  {
    key: 'disciplinary',
    labelKn: 'ಇಲಾಖಾ ವಿಚಾರಣೆ & ಶಿಸ್ತು ಕ್ರಮ',
    labelEn: 'Disciplinary & Inquiries',
    icon: ShieldAlert,
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    accentColor: '#e11d48',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      const num = (f.fileNumber || '').toLowerCase();
      return cat.includes('disciplinary') || cat.includes('ಶಿಸ್ತು') || cat.includes('ವಿಚಾರಣೆ') || sub.includes('ಶಿಸ್ತು') || sub.includes('ವಿಚಾರಣೆ') || sub.includes('ಸಿ.ಸಿ.ಎ') || sub.includes('cca') || num.includes('disc');
    },
  },
  {
    key: 'salary',
    labelKn: 'ವೇತನ & ಭತ್ಯೆಗಳು',
    labelEn: 'Salary & Increments',
    icon: FileCheck2,
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    accentColor: '#0d9488',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      return cat.includes('salary') || cat.includes('ವೇತನ') || sub.includes('ಪ್ರಪತ್ರ-28') || sub.includes('ವೇತನ ಬಡ್ತಿ');
    },
  },
  {
    key: 'leave',
    labelKn: 'ರಜೆ & ಸೇವಾ ವಿಷಯಗಳು',
    labelEn: 'Leave & Service Records',
    icon: UserCheck,
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    accentColor: '#4f46e5',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      return cat.includes('leave') || cat.includes('service') || sub.includes('ರಜೆ') || sub.includes('ಶಿಶುಪಾಲನ') || sub.includes('ಸೇವಾ');
    },
  },
  {
    key: 'accounts',
    labelKn: 'ಲೆಕ್ಕಪತ್ರ & ಶಾಲಾ ಅನುದಾನ',
    labelEn: 'Accounts & Grants',
    icon: Building,
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    accentColor: '#2563eb',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      return cat.includes('accounts') || cat.includes('grants') || cat.includes('ಅನುದಾನ') || sub.includes('ಅನುದಾನ') || sub.includes('ಬಜೆಟ್');
    },
  },
  {
    key: 'rti',
    labelKn: 'ಮಾಹಿತಿ ಹಕ್ಕು (RTI)',
    labelEn: 'RTI & Legal',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-200 text-stone-900 border-amber-400 font-bold',
    accentColor: '#f59e0b',
    matcher: (f) => {
      const cat = (f.fileCategory || '').toLowerCase();
      const sub = (f.subject || '').toLowerCase();
      return f.isRtiFile || cat.includes('rti') || sub.includes('ಮಾಹಿತಿ ಹಕ್ಕು') || sub.includes('ಕಲಂ');
    },
  },
];

const OFFICER_LIST = [
  'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker - ಸೇವಾ ಶಾಖೆ)',
  'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಸಿಬ್ಬಂದಿ ಶಾಖೆ)',
  'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಲೆಕ್ಕ & ಅನುದಾನ ಶಾಖೆ)',
  'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Office Superintendent - OS)',
  'ಸಹಾಯಕ ಲೆಕ್ಕಾಧಿಕಾರಿಗಳು (Asst Accounts Officer - AAO)',
  'ವಿಷಯ ಪರಿವೀಕ್ಷಕರು (Subject Inspector / Education Coordinator)',
  'ಕ್ಷೇತ್ರ ಸಮನ್ವಯಾಧಿಕಾರಿಗಳು (BCO / BRC Bhadravathi)',
  'ಸುರೇಶ್ ಕೆ.ಸಿ. - ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (Block Education Officer - BEO)',
  'ಉಪನಿರ್ದೇಶಕರು - ಡಿಡಿಪಿಐ ಕಛೇರಿ (DDPI Shivamogga)',
  'ಮಹಾಲೇಖಪಾಲರ ಕಛೇರಿ (Accountant General - AG Karnataka)',
];

export interface BeoProfile {
  name: string;
  designation: string;
  officeName: string;
  officeAddress: string;
  phone: string;
  email: string;
  district: string;
  pincode: string;
  kesCadre: string;
}

export const BEO_PROFILE_STORAGE_KEY = 'karnataka_beo_profile_v1';

export const DEFAULT_BEO_PROFILE: BeoProfile = {
  name: 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
  designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)',
  officeName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
  officeAddress: 'ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ - 577301, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
  phone: '08282-266144',
  email: 'beo.bhadravathi@karnataka.gov.in',
  district: 'ಶಿವಮೊಗ್ಗ',
  pincode: '577301',
  kesCadre: 'ಕೆ.ಇ.ಎಸ್. (ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಸೇವೆ)'
};

const getStoredBeoProfile = (): BeoProfile => {
  try {
    const raw = localStorage.getItem(BEO_PROFILE_STORAGE_KEY);
    if (raw) return { ...DEFAULT_BEO_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_BEO_PROFILE;
};

export const FileDashboard: React.FC<FileDashboardProps> = ({
  files,
  letters,
  onMoveFile,
  onCreateFile,
  onDraftLetterForFile,
  onViewLetter,
  onSaveLetter,
  onShowToast,
  onDeleteFile,
  onClearSampleData,
  onLoadFreshData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MasterDocketFile | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [isCreateOtherFileOpen, setIsCreateOtherFileOpen] = useState(false);

  // Utility to format date strictly as dd-mm-yyyy
  const formatDdMmYyyy = (dateInput?: string | Date | null): string => {
    if (!dateInput) {
      const t = new Date();
      return `${String(t.getDate()).padStart(2, '0')}-${String(t.getMonth() + 1).padStart(2, '0')}-${t.getFullYear()}`;
    }
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
      const cleanDate = trimmed.split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // BEO Profile Configuration State
  const [beoProfile, setBeoProfile] = useState<BeoProfile>(getStoredBeoProfile);
  const [isBeoModalOpen, setIsBeoModalOpen] = useState(false);
  const [beoEditData, setBeoEditData] = useState<BeoProfile>(getStoredBeoProfile);

  // Document Preview Modal State (Feature 2)
  const [previewDocFile, setPreviewDocFile] = useState<MasterDocketFile | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);

  // Monthly Audit Report Modal State (Feature 3)
  const [isAuditReportOpen, setIsAuditReportOpen] = useState<boolean>(false);
  const [auditMonth, setAuditMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Dedicated RTI Letter Drafter / Editor Modal State
  const [isRtiDraftModalOpen, setIsRtiDraftModalOpen] = useState(false);
  const [editingLetterItem, setEditingLetterItem] = useState<EducationLetter | null>(null);
  const [draftRefNumber, setDraftRefNumber] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftRecipient, setDraftRecipient] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftType, setDraftType] = useState('acceptance');
  const [customLetters, setCustomLetters] = useState<EducationLetter[]>([]);

  // Create New Docket File Modal State
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileNumber, setNewFileNumber] = useState('');
  const [newFileSubject, setNewFileSubject] = useState('');
  const [newFileCategory, setNewFileCategory] = useState('ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ');
  const [newFileSectionCode, setNewFileSectionCode] = useState('ಆ2');
  const [newFileSectionName, setNewFileSectionName] = useState('ಆಡಳಿತ & ಸೇವೆಗಳು');
  const [newFileCustodian, setNewFileCustodian] = useState('ಸುರೇಶ್ ಕೆ.ಸಿ. - ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)');
  const [newFilePriority, setNewFilePriority] = useState<LetterPriority>('Immediate');
  const [newFileDate, setNewFileDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newFileNotes, setNewFileNotes] = useState('');
  const [isSubmittingNewFile, setIsSubmittingNewFile] = useState(false);
  
  // Selected Docket for Timeline inspection
  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    // Default to pension docket or first file
    const pen = files.find(f => f.fileNumber === '57' || f.fileCategory?.includes('Pension') || f.subject?.includes('ಪಿಂಚಣಿ'));
    return pen ? pen.id : (files[0]?.id || '');
  });

  // Forward Modal state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardFromOfficer, setForwardFromOfficer] = useState('');
  const [forwardToOfficer, setForwardToOfficer] = useState(OFFICER_LIST[3]);
  const [forwardRemarks, setForwardRemarks] = useState('');
  const [forwardStatus, setForwardStatus] = useState<string>('Under Scrutiny');
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  // Filtered files
  const filteredFiles = useMemo(() => {
    const currentCatTab = CATEGORY_TABS.find(t => t.key === selectedCategory) || CATEGORY_TABS[0];
    
    return files.filter(file => {
      // 1. Category match
      if (!currentCatTab.matcher(file)) return false;

      // 2. Status match (supports both status buckets and exact statuses)
      if (statusFilter !== 'all') {
        if (statusFilter === 'bucket_pending') {
          if (!isPendingDocket(file.status)) return false;
        } else if (statusFilter === 'bucket_under_review') {
          if (!isUnderReviewDocket(file.status)) return false;
        } else if (statusFilter === 'bucket_completed') {
          if (!isCompletedDocket(file.status)) return false;
        } else if (file.status !== statusFilter) {
          return false;
        }
      }

      // 3. Priority match
      if (priorityFilter !== 'all' && file.priority !== priorityFilter) return false;

      // 4. Department Section match (ಆ1, ಆ2, ಆ3, ಆ4, ಆಡಳಿತ ಶಾಖೆ)
      if (sectionFilter !== 'all') {
        const secCode = (file.sectionCode || '').trim();
        const secName = (file.sectionName || '').trim();
        const secDept = (file.section || '').trim();
        const cat = (file.fileCategory || '').trim();
        const sub = (file.subject || '').trim();

        let matchesSec = false;
        if (sectionFilter === 'ಆ1') {
          matchesSec = secCode === 'ಆ1' || secName.includes('ಪ್ರೌಢ') || secDept.includes('Academic') || cat.includes('High School') || sub.includes('ಪ್ರೌಢ');
        } else if (sectionFilter === 'ಆ2') {
          matchesSec = secCode === 'ಆ2' || secName.includes('ಸ.ಪ್ರಾ.ಶಿ') || secName.includes('ಪ್ರಾಥಮಿಕ') || secDept.includes('Administration & Services') || cat.includes('Primary') || sub.includes('ಪ್ರಾಥಮಿಕ') || sub.includes('ವೇತನ ಬಡ್ತಿ') || cat.includes('Pension');
        } else if (sectionFilter === 'ಆ3') {
          matchesSec = secCode === 'ಆ3' || secName.includes('ಅನುದಾನಿತ') || secName.includes('ಲೆಕ್ಕ') || secDept.includes('Accounts & Grants') || cat.includes('Grant') || cat.includes('Accounts') || sub.includes('ಅನುದಾನ');
        } else if (sectionFilter === 'ಆ4') {
          matchesSec = secCode === 'ಆ4' || secName.includes('ಭೌತಿಕ') || secName.includes('ಪರೀಕ್ಷೆ') || secDept.includes('Examination') || secDept.includes('Inspection') || cat.includes('Examination') || cat.includes('Inspection') || sub.includes('ಪರೀಕ್ಷೆ') || sub.includes('ಸಿಆರ್‌ಸಿ');
        } else if (sectionFilter === 'ಆಡಳಿತ ಶಾಖೆ') {
          matchesSec = secCode === 'ಆಡಳಿತ ಶಾಖೆ' || secCode === 'ಆಡಳಿತ' || secName.includes('ಆಡಳಿತ') || secDept.includes('Legal') || secDept.includes('Administration') || cat.includes('General') || sub.includes('ಆಡಳಿತ');
        }
        if (!matchesSec) return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (file.fileNumber || '').toLowerCase();
        const sub = (file.subject || '').toLowerCase();
        const cust = (file.currentCustodian || '').toLowerCase();
        const cat = (file.fileCategory || '').toLowerCase();
        const notes = (file.notes || '').toLowerCase();
        return num.includes(q) || sub.includes(q) || cust.includes(q) || cat.includes(q) || notes.includes(q);
      }

      return true;
    });
  }, [files, selectedCategory, statusFilter, priorityFilter, sectionFilter, searchQuery]);

  // Selected file object
  const selectedFile = useMemo(() => {
    return files.find(f => f.id === selectedFileId) || filteredFiles[0] || files[0] || null;
  }, [files, selectedFileId, filteredFiles]);

  // Check if selected docket is an RTI File
  const isSelectedFileRti = useMemo(() => {
    if (!selectedFile) return false;
    return Boolean(
      selectedFile.isRtiFile ||
      selectedFile.fileCategory?.includes('RTI') ||
      selectedFile.fileCategory?.includes('ಮಾಹಿತಿ ಹಕ್ಕು') ||
      selectedFile.sectionName?.includes('ಮಾಹಿತಿ ಹಕ್ಕು') ||
      selectedFile.fileNumber?.includes('ಮಾ.ಹ.ಅ.ನಿ.ಮ') ||
      selectedFile.fileNumber?.includes('ಮಾಹಿತಿ ಹಕ್ಕು') ||
      selectedFile.subject?.includes('ಮಾಹಿತಿ ಹಕ್ಕು')
    );
  }, [selectedFile]);

  const selectedRtiFileDigits = useMemo(() => {
    if (!selectedFile) return '85';
    return selectedFile.fileNumber?.match(/\d+/)?.[0] || '85';
  }, [selectedFile]);

  // Letters linked to selected docket with flexible RTI matching
  const linkedLetters = useMemo(() => {
    if (!selectedFile) return [];
    const isRti = isSelectedFileRti;
    const selDigits = selectedRtiFileDigits;

    return letters.filter(l => {
      if (selectedFile.linkedLetterIds && selectedFile.linkedLetterIds.includes(l.id)) return true;
      if (l.fileNumber === selectedFile.fileNumber) return true;
      if (selectedFile.fileNumber === '57' && (l.fileNumber === '57' || l.letterNumber?.includes('219-01'))) return true;
      if (selectedFile.fileNumber === '45' && (l.fileNumber === '45' || l.letterNumber?.includes('45-'))) return true;
      
      if (isRti) {
        const lFileDigits = l.fileNumber?.match(/\d+/)?.[0];
        const lRefDigits = l.referenceNumber?.match(/\d+/)?.[0];
        if (selDigits && (lFileDigits === selDigits || lRefDigits === selDigits)) return true;
        if (l.referenceNumber && l.referenceNumber.includes(`/${selDigits}/`)) return true;
        if (l.subject && selectedFile.subject && (l.subject.includes(selectedFile.subject) || selectedFile.subject.includes(l.subject))) return true;
      }
      return false;
    });
  }, [selectedFile, letters, isSelectedFileRti, selectedRtiFileDigits]);

  // Effective linked letters: RTI dockets will NEVER show 0 letters! Auto letter is generated.
  const effectiveLinkedLetters = useMemo(() => {
    if (!selectedFile) return [];
    
    // Combine base letters with custom letters for this file
    const allFileLetters = [...letters, ...customLetters].filter(l => {
      if (selectedFile.linkedLetterIds && selectedFile.linkedLetterIds.includes(l.id)) return true;
      if (l.fileNumber === selectedFile.fileNumber) return true;
      if (selectedFile.fileNumber === '57' && (l.fileNumber === '57' || l.letterNumber?.includes('219-01'))) return true;
      if (selectedFile.fileNumber === '45' && (l.fileNumber === '45' || l.letterNumber?.includes('45-'))) return true;
      
      if (isSelectedFileRti) {
        const lFileDigits = l.fileNumber?.match(/\d+/)?.[0];
        const lRefDigits = l.referenceNumber?.match(/\d+/)?.[0];
        if (selectedRtiFileDigits && (lFileDigits === selectedRtiFileDigits || lRefDigits === selectedRtiFileDigits)) return true;
        if (l.referenceNumber && l.referenceNumber.includes(`/${selectedRtiFileDigits}/`)) return true;
        if (l.subject && selectedFile.subject && (l.subject.includes(selectedFile.subject) || selectedFile.subject.includes(l.subject))) return true;
      }
      return false;
    });

    if (allFileLetters.length > 0) return allFileLetters;
    if (!isSelectedFileRti) return linkedLetters;

    const digits = selectedRtiFileDigits;
    const applicant = selectedFile.rtiDetails?.applicantName || 'ಶ್ರೀ ವಿನೋದ್ ವಿ (D.S.S) ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು, ಕರ್ನಾಟಕ ದಲಿತ ಸಮನ್ವಯ ಸಮಿತಿ (ರಿ)';
    const appAddr = selectedFile.rtiDetails?.applicantAddress || 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ';
    const infoSought = selectedFile.rtiDetails?.informationSought || selectedFile.notes || 'ದಿನಾಂಕ: 01-06-2026 ರಿಂದ 01-10-2026 ರ ವರೆಗೆ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ದಿನಚರಿ ಮತ್ತು ಡೈರಿಯ ದೃಢೀಕೃತ ನಕಲು ಪ್ರತಿ ನೀಡುವುದು.';
    const isoDate = selectedFile.initiatedDate || new Date().toISOString().split('T')[0];

    const autoRtiLetter: EducationLetter = {
      id: `auto-rti-${selectedFile.id || digits}`,
      referenceNumber: `ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${digits}/1/2026-27`,
      fileNumber: `ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${digits}/2026-27`,
      fileLetterNumber: `${digits}-1`,
      sectionCode: 'ಆ2',
      sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
      direction: 'outward',
      subject: selectedFile.subject.startsWith('ಮಾಹಿತಿ ಹಕ್ಕು') ? selectedFile.subject : `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ${applicant} - ${selectedFile.subject}`,
      category: 'Public Grievance & RTI',
      senderName: beoProfile.name || 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
      senderDesignation: beoProfile.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO) & ಡಿಡಿಓ',
      senderDepartment: beoProfile.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
      recipientName: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
      recipientDesignation: 'Public Information Officer (PIO)',
      recipientDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ',
      dateReceivedOrIssued: isoDate,
      dueDate: selectedFile.rtiDetails?.statutoryDueDate || isoDate,
      priority: selectedFile.priority || 'Urgent',
      status: 'Approved & Signed',
      assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
      section: 'Administration & Services',
      confidentiality: 'Public / Open',
      bodyText: `ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಸ್ವೀಕೃತವಾದ ಅರ್ಜಿ.\nಕೋರಲಾದ ಮಾಹಿತಿ: ${infoSought}\nಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು: 0 ಪ್ರತಿಗಳು.`,
      actionNotes: [
        {
          id: `note-${Date.now()}`,
          author: beoProfile.name || 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
          designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
          note: `ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸೃಜನೆ ಮತ್ತು ಅಧಿಕೃತ ಪತ್ರ ನೋಂದಣಿ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${digits}/1/2026-27`,
          actionType: 'Approval',
          timestamp: new Date().toISOString()
        }
      ],
      attachments: selectedFile.attachments || [],
      endorsements: [
        `1. ಅರ್ಜಿದಾರರಾದ ${applicant} ರವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ ಹಾಗೂ ಸ್ವೀಕೃತಿಗಾಗಿ (${appAddr}).`,
        `2. ಕಛೇರಿ ಕಡತಕ್ಕೆ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${digits}/2026-27.`
      ],
      tags: ['RTI', 'ಮಾಹಿತಿ ಹಕ್ಕು', 'Statutory', 'Official'],
      lastUpdated: isoDate,
    };

    return [autoRtiLetter];
  }, [selectedFile, isSelectedFileRti, linkedLetters, selectedRtiFileDigits, beoProfile, customLetters, letters]);

  // Open Draft / Edit Modal for RTI Letter
  const handleOpenRtiDraftModal = (letter?: EducationLetter) => {
    if (letter) {
      setEditingLetterItem(letter);
      setDraftRefNumber(letter.referenceNumber || `ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${selectedRtiFileDigits}/1/2026-27`);
      setDraftDate(letter.dateReceivedOrIssued || new Date().toISOString().split('T')[0]);
      setDraftRecipient(letter.recipientName || 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ');
      setDraftSubject(letter.subject || '');
      setDraftBody(letter.bodyText || '');
    } else {
      setEditingLetterItem(null);
      const nextSeq = Math.max(effectiveLinkedLetters.length + 1, 1);
      setDraftRefNumber(`ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${selectedRtiFileDigits}/${nextSeq}/2026-27`);
      setDraftDate(selectedFile?.initiatedDate || new Date().toISOString().split('T')[0]);
      const app = selectedFile?.rtiDetails?.applicantName || 'ಶ್ರೀ ವಿನೋದ್‌ ವಿ (D.S.S) ಸಂಸ್ಥಾಪಕ ರಾಜ್ಯಾಧ್ಯಕ್ಷರು';
      const appAddr = selectedFile?.rtiDetails?.applicantAddress || 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು';
      setDraftRecipient(`${app}, ${appAddr}`);
      setDraftSubject(selectedFile?.subject?.startsWith('ಮಾಹಿತಿ ಹಕ್ಕು') ? selectedFile.subject : `ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ${app} - ${selectedFile?.subject || ''}`);
      setDraftBody(selectedFile?.rtiDetails?.informationSought || selectedFile?.notes || 'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಸ್ವೀಕೃತವಾದ ಅರ್ಜಿ.\nಕೋರಲಾದ ಮಾಹಿತಿ: ದಿನಾಂಕ: 01-06-2026 ರಿಂದ 01-10-2026 ರ ವರೆಗೆ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ದಿನಚರಿ ಮತ್ತು ಡೈರಿಯ ದೃಢೀಕೃತ ನಕಲು ಪ್ರತಿ ನೀಡುವುದು.\nಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು: 0 ಪ್ರತಿಗಳು.');
    }
    setIsRtiDraftModalOpen(true);
  };

  // Save changes to RTI Letter
  const handleSaveRtiDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftSubject.trim()) {
      alert('ದಯವಿಟ್ಟು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    const updatedLetter: EducationLetter = editingLetterItem ? {
      ...editingLetterItem,
      referenceNumber: draftRefNumber.trim(),
      dateReceivedOrIssued: draftDate,
      recipientName: draftRecipient.trim(),
      subject: draftSubject.trim(),
      bodyText: draftBody.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
    } : {
      id: `custom-let-${Date.now()}`,
      referenceNumber: draftRefNumber.trim(),
      fileNumber: selectedFile?.fileNumber || `ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${selectedRtiFileDigits}/2026-27`,
      fileLetterNumber: `${selectedRtiFileDigits}-${effectiveLinkedLetters.length + 1}`,
      sectionCode: 'ಆ2',
      sectionName: 'ಮಾಹಿತಿ ಹಕ್ಕು ಶಾಖೆ',
      direction: 'outward',
      subject: draftSubject.trim(),
      category: 'Public Grievance & RTI',
      senderName: beoProfile.name || 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
      senderDesignation: beoProfile.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO) & ಡಿಡಿಓ',
      senderDepartment: beoProfile.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
      recipientName: draftRecipient.trim(),
      recipientDesignation: 'Public Information Officer (PIO)',
      recipientDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ',
      dateReceivedOrIssued: draftDate,
      priority: selectedFile?.priority || 'Urgent',
      status: 'Approved & Signed',
      assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
      section: 'Administration & Services',
      confidentiality: 'Public / Open',
      bodyText: draftBody.trim(),
      actionNotes: [
        {
          id: `note-${Date.now()}`,
          author: beoProfile.name || 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
          designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
          note: `ಪತ್ರ ತಿದ್ದುಪಡಿ ಹಾಗೂ ಅಧಿಕೃತ ಅನುಮೋದನೆ: ${draftRefNumber.trim()}`,
          actionType: 'Approval',
          timestamp: new Date().toISOString()
        }
      ],
      attachments: selectedFile?.attachments || [],
      endorsements: [
        `1. ಅರ್ಜಿದಾರರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.`,
        `2. ಕಛೇರಿ ಕಡತಕ್ಕೆ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${selectedRtiFileDigits}/2026-27.`
      ],
      tags: ['RTI', 'ಮಾಹಿತಿ ಹಕ್ಕು', 'Official'],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setCustomLetters(prev => {
      const idx = prev.findIndex(l => l.id === updatedLetter.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedLetter;
        return copy;
      }
      return [updatedLetter, ...prev];
    });

    if (onSaveLetter) {
      await onSaveLetter(updatedLetter);
    } else {
      try {
        await fetch('/api/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLetter)
        });
      } catch (err) {}
    }

    if (onShowToast) {
      onShowToast(`ಪತ್ರ (${draftRefNumber}) ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ / ಉಳಿಸಲಾಗಿದೆ!`);
    }
    setIsRtiDraftModalOpen(false);
  };

  // Monthly Audit Report Aggregates
  const auditReportStats = useMemo(() => {
    const selectedYrMo = auditMonth; // e.g. "2026-10"
    
    // Filter files active or moved in this month
    const monthFiles = files.filter(f => {
      const initDate = f.initiatedDate || '';
      const hasInitInMonth = initDate.startsWith(selectedYrMo);
      const hasMovesInMonth = f.movementHistory?.some(m => (m.sentDate || '').startsWith(selectedYrMo));
      return hasInitInMonth || hasMovesInMonth;
    });

    // RTI files
    const rtiFiles = files.filter(f => 
      f.isRtiFile || 
      f.fileCategory?.includes('RTI') || 
      f.fileCategory?.includes('ಮಾಹಿತಿ ಹಕ್ಕು') ||
      f.fileNumber?.includes('ಮಾ.ಹ.ಅ.ನಿ.ಮ')
    );
    const rtiThisMonth = rtiFiles.filter(f => (f.initiatedDate || '').startsWith(selectedYrMo) || f.movementHistory?.some(m => (m.sentDate || '').startsWith(selectedYrMo)));
    const rtiDisposed = rtiFiles.filter(f => f.status === 'Disposed / Closed');
    const rtiActive = rtiFiles.filter(f => f.status === 'Active / Open' || f.status === 'Under Scrutiny');
    const rtiFeeTotal = rtiFiles.length * 10;

    // Letters in this month
    const monthLetters = letters.filter(l => (l.dateReceivedOrIssued || '').startsWith(selectedYrMo));
    const inwardLetters = monthLetters.filter(l => l.direction === 'inward');
    const outwardLetters = monthLetters.filter(l => l.direction === 'outward');

    // Total file movements in month
    let totalMovements = 0;
    const allMovementEntries: Array<{ file: MasterDocketFile; move: FileMovementRecord }> = [];
    files.forEach(f => {
      f.movementHistory?.forEach(m => {
        if ((m.sentDate || '').startsWith(selectedYrMo)) {
          totalMovements++;
          allMovementEntries.push({ file: f, move: m });
        }
      });
    });

    return {
      monthFilesCount: monthFiles.length,
      rtiFilesTotal: rtiFiles.length,
      rtiThisMonthCount: rtiThisMonth.length,
      rtiDisposedCount: rtiDisposed.length,
      rtiActiveCount: rtiActive.length,
      rtiFeeTotal,
      totalMovements,
      allMovementEntries,
      monthLettersCount: monthLetters.length,
      inwardCount: inwardLetters.length,
      outwardCount: outwardLetters.length,
    };
  }, [files, letters, auditMonth]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilterKey, number> = {
      all: files.length,
      pension: 0,
      promotion: 0,
      disciplinary: 0,
      salary: 0,
      leave: 0,
      accounts: 0,
      rti: 0,
      academic: 0,
      general: 0,
    };

    files.forEach(f => {
      CATEGORY_TABS.forEach(t => {
        if (t.key !== 'all' && t.matcher(f)) {
          counts[t.key] = (counts[t.key] || 0) + 1;
        }
      });
    });

    return counts;
  }, [files]);

  // Open Forward File modal
  const handleOpenForwardModal = (file: MasterDocketFile) => {
    setForwardFromOfficer(file.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)');
    setForwardToOfficer(OFFICER_LIST[7]); // BEO
    setForwardRemarks('');
    setForwardStatus(file.status === 'Active / Open' ? 'Under Scrutiny' : 'Pending Higher Approval');
    setIsForwardModalOpen(true);
  };

  // Submit file movement
  const handleForwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!forwardRemarks.trim()) {
      alert('ದಯವಿಟ್ಟು ಅಧಿಕೃತ ಷರಾ (Noting/Remarks) ನಮೂದಿಸಿ.');
      return;
    }

    try {
      setIsSubmittingMove(true);
      await onMoveFile(
        selectedFile.id,
        forwardFromOfficer.trim(),
        forwardToOfficer.trim(),
        forwardRemarks.trim(),
        forwardStatus
      );

      if (onShowToast) {
        onShowToast(`ಕಡತ ಸಂಖ್ಯೆ "${selectedFile.fileNumber}" ಯಶಸ್ವಿಯಾಗಿ ರವಾನಿಸಲಾಗಿದೆ → ${forwardToOfficer}`);
      }
      setIsForwardModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'ಕಡತ ರವಾನಿಸಲು ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsSubmittingMove(false);
    }
  };

  // Open Create New Docket File Modal
  const handleOpenNewFileModal = () => {
    const maxNum = files.reduce((max, f) => {
      const match = (f.fileNumber || '').match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return val > max ? val : max;
    }, 87);
    const nextNum = `${maxNum + 1}`;
    setNewFileNumber(nextNum);
    setNewFileSubject('');
    setNewFileCategory(selectedCategory === 'all' ? 'ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ' : (CATEGORY_TABS.find(c => c.key === selectedCategory)?.labelKn || 'ಸಾಮಾನ್ಯ ಕಡತ'));
    setNewFileSectionCode('ಆ2');
    setNewFileSectionName('ಆಡಳಿತ & ಸೇವೆಗಳು');
    setNewFileCustodian(`${beoProfile.name} - ${beoProfile.designation}`);
    setNewFilePriority('Immediate');
    setNewFileDate(new Date().toISOString().split('T')[0]);
    setNewFileNotes('');
    setIsNewFileModalOpen(true);
  };

  // Submit Create New Docket File
  const handleCreateNewFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileNumber.trim() || !newFileSubject.trim()) {
      alert('ದಯವಿಟ್ಟು ಕಡತ ಸಂಖ್ಯೆ ಮತ್ತು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    try {
      setIsSubmittingNewFile(true);
      const cleanNum = newFileNumber.trim();
      const newDocket: Partial<MasterDocketFile> = {
        id: `file-${Date.now()}`,
        fileNumber: cleanNum,
        subject: newFileSubject.trim(),
        section: 'Administration & Services',
        fileCategory: newFileCategory,
        sectionCode: newFileSectionCode || 'ಆ2',
        sectionName: newFileSectionName || 'ಆಡಳಿತ & ಸೇವೆಗಳು',
        currentCustodian: newFileCustodian || `${beoProfile.name} - ${beoProfile.designation}`,
        priority: newFilePriority,
        status: 'Active / Open',
        notes: newFileNotes.trim(),
        initiatedDate: newFileDate || new Date().toISOString().split('T')[0],
        linkedLetterIds: [],
        movementHistory: [
          {
            id: `mvt-${Date.now()}`,
            fromOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
            toOfficer: newFileCustodian || `${beoProfile.name} - ${beoProfile.designation}`,
            sentDate: newFileDate || new Date().toISOString().split('T')[0],
            remarks: `ಹೊಸ ಅಧಿಕೃತ ಕಡತ ಸೃಜಿಸಲಾಗಿದೆ. ವಿಷಯ: ${newFileSubject.trim()}`,
            statusAfterMove: 'Active / Open'
          }
        ]
      };

      if (onCreateFile) {
        await onCreateFile(newDocket);
      } else {
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDocket)
        });
      }

      setSelectedFileId(newDocket.id!);
      setIsNewFileModalOpen(false);
      if (onShowToast) {
        onShowToast(`ಹೊಸ ಕಡತ (${cleanNum}) ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಲಾಗಿದೆ!`);
      }
    } catch (err: any) {
      console.error(err);
      alert('ಕಡತ ಸೃಜಿಸುವಾಗ ದೋಷ ಕಂಡುಬಂದಿದೆ: ' + (err.message || ''));
    } finally {
      setIsSubmittingNewFile(false);
    }
  };

  // Open BEO Profile Modal
  const handleOpenBeoModal = () => {
    setBeoEditData(beoProfile);
    setIsBeoModalOpen(true);
  };

  // Save BEO Profile
  const handleSaveBeoProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beoEditData.name.trim()) {
      alert('ದಯವಿಟ್ಟು BEO ಹೆಸರು ನಮೂದಿಸಿ.');
      return;
    }
    setBeoProfile(beoEditData);
    try {
      localStorage.setItem(BEO_PROFILE_STORAGE_KEY, JSON.stringify(beoEditData));
    } catch (err) {
      console.warn(err);
    }
    if (onShowToast) {
      onShowToast(`BEO ಅಧಿಕಾರಿ ವಿವರಗಳನ್ನು (${beoEditData.name}) ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!`);
    }
    setIsBeoModalOpen(false);
  };

  const getPriorityBadge = (priority: LetterPriority) => {
    switch (priority) {
      case 'Immediate':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-800 border border-rose-300">ತುರ್ತು (Immediate)</span>;
      case 'Urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-300">ಅಗತ್ಯ (Urgent)</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium uppercase rounded bg-stone-100 text-stone-700 border border-stone-300">ಸಾಮಾನ್ಯ (Routine)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active / Open':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>ಸಕ್ರಿಯ (Open)</span>;
      case 'Under Scrutiny':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Scrutiny)</span>;
      case 'Pending Higher Approval':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>ಅನುಮೋದನೆ ಬಾಕಿ (Pending BEO)</span>;
      case 'Disposed / Closed':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-stone-100 text-stone-600 border border-stone-300 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-400"></span>ವಿಲೇವಾರಿ (Closed)</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-xl p-5 border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-[#2b2b2b] text-[#f59e0b] flex items-center justify-center font-bold shadow-[2px_2px_0px_#f59e0b]">
              <FolderGit2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2b2b2b] font-kannada flex items-center gap-2">
                ಕಡತಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ & ಚಲನವಲನ (File Dashboard & Movement Tracking)
              </h2>
              <p className="text-xs text-stone-600 font-kannada">
                ಪಿಂಚಣಿ, ಬಡ್ತಿ, ಶಿಸ್ತು ಕ್ರಮ, ವೇತನ ಹಾಗೂ ಅನುದಾನ ಕಡತಗಳ ವರ್ಗೀಕರಣ ಮತ್ತು ಅಧಿಕೃತ ಚಲನವಲನ (File Movement Timeline)
              </p>
            </div>
          </div>
        </div>

        {/* Actions & BEO Officer Profile */}
        <div className="flex flex-wrap items-center gap-3">
          {/* BEO Officer Mini Profile Card */}
          <div className="bg-stone-50 border-2 border-[#2b2b2b] rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-[2px_2px_0px_#2b2b2b]">
            <div className="w-8 h-8 rounded-lg bg-[#2b2b2b] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              BEO
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-900 font-kannada flex items-center gap-1.5">
                <span>{beoProfile.name}</span>
                <span className="text-[9px] bg-amber-200 text-stone-900 px-1.5 py-0.2 rounded font-mono font-bold">
                  BEO ಭದ್ರಾವತಿ
                </span>
              </div>
              <div className="text-[10px] text-stone-600 font-kannada truncate max-w-[200px]">
                {beoProfile.designation}
              </div>
            </div>
            <button
              type="button"
              id="btn-edit-beo-profile"
              onClick={handleOpenBeoModal}
              className="ml-1 p-1.5 hover:bg-stone-200 text-stone-700 hover:text-stone-950 rounded-lg transition-colors cursor-pointer"
              title="BEO ಹೆಸರು ಮತ್ತು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ / ತಿದ್ದುಪಡಿ ಮಾಡಿ (Edit BEO Details)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Monthly Audit Report Button */}
          <button
            type="button"
            id="btn-open-monthly-audit-report"
            onClick={() => setIsAuditReportOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2.5 rounded-xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-2 cursor-pointer text-xs font-kannada transition-all transform hover:-translate-y-0.5"
            title="ಮಾಸಿಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ ಸೃಜನೆ (Generate Monthly Audit Report PDF)"
          >
            <BarChart3 className="w-4 h-4 text-emerald-200" />
            <span>ಮಾಸಿಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ</span>
          </button>

          {/* Data Management: Clear Sample / Fresh Records */}
          <button
            type="button"
            id="btn-open-data-management-modal"
            onClick={() => setIsDataModalOpen(true)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-3 py-2.5 rounded-xl border-2 border-stone-400 shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer text-xs font-kannada transition-all transform hover:-translate-y-0.5"
            title="ಮಾದರಿ ಡೇಟಾ ರಿಮೂವ್ ಮಾಡಿ / ಹೊಸ ಅಧಿಕೃತ ಡೇಟಾ ಪ್ರಾರಂಭಿಸಿ"
          >
            <Database className="w-4 h-4 text-stone-700" />
            <span>ಮಾದರಿ ಡೇಟಾ ನಿರ್ವಹಣೆ</span>
          </button>

          {/* Primary Create New Docket Button */}
          <button
            type="button"
            id="btn-open-create-new-file"
            onClick={handleOpenNewFileModal}
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-4 py-2.5 rounded-xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-2 cursor-pointer text-xs font-kannada transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ಹೊಸ ಕಡತ ತಯಾರಿಸಿ (Create File)</span>
          </button>

          {/* Create Other File Button */}
          <button
            type="button"
            id="btn-open-create-other-file"
            onClick={() => setIsCreateOtherFileOpen(true)}
            className="bg-[#2b2b2b] hover:bg-stone-800 text-white font-bold px-3.5 py-2.5 rounded-xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#f59e0b] flex items-center gap-1.5 cursor-pointer text-xs font-kannada transition-all transform hover:-translate-y-0.5"
            title="ಇತರ ಕಡತ ಸೃಜನೆ (Create Other File / Custom Docket)"
          >
            <FolderPlus className="w-4 h-4 text-[#f59e0b]" />
            <span>+ ಇತರ ಕಡತ ಸೃಜನೆ (Other File)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Procedure Rule Banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 text-xs text-amber-950 font-kannada flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(245,158,11,0.3)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="text-amber-900 font-bold">ಸರ್ಕಾರಿ ಕಾರ್ಯವಿಧಾನದ ಕಡ್ಡಾಯ ನಿಯಮ: </strong>
            "ಮೊದಲು ಯಾವುದೇ ಪತ್ರ ತಯಾರಿಸುವ ಮೊದಲು ಕಡತ ತಯಾರಿಸಬೇಕು ನಂತರ ಪತ್ರ ತಯಾರಿಸಬೇಕು."
          </span>
        </div>
        <button
          type="button"
          onClick={handleOpenNewFileModal}
          className="text-amber-950 font-bold underline hover:text-amber-800 shrink-0 cursor-pointer text-xs"
        >
          + ಇಲ್ಲಿ ಹೊಸ ಕಡತ ಸೃಜಿಸಿ
        </button>
      </div>

      {/* Mini-Dashboard using Recharts for Immediate High-Level Status Summary */}
      <FileStatusMiniDashboard
        files={files}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={(filterKey) => setStatusFilter(filterKey)}
        onClearFilter={() => setStatusFilter('all')}
      />

      {/* Category Filter Pills / Tabs */}
      <div className="bg-white rounded-xl p-3 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]">
        <div className="text-xs font-bold text-stone-700 mb-2 font-kannada flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-600" />
            ಕಡತಗಳ ವರ್ಗೀಕರಣದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ (Filter by Docket Category):
          </span>
          <span className="text-[11px] font-normal text-stone-500">
            ಒಟ್ಟು ಕಡತಗಳು: <strong>{files.length}</strong> | ಪ್ರದರ್ಶಿತ: <strong>{filteredFiles.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.key;
            const count = categoryCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                id={`cat-filter-${tab.key}`}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-[#2b2b2b] text-white border-[#2b2b2b] shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300 shadow-[1px_1px_0px_#2b2b2b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#f59e0b]' : 'text-stone-500'}`} />
                <span className="font-kannada">{tab.labelKn}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-[#f59e0b] text-[#2b2b2b]' : 'bg-stone-200 text-stone-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual-Pane Layout: Left List of Dockets, Right Timeline & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Dockets List & Search (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Sub-filters */}
          <div className="bg-white rounded-xl p-4 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] space-y-3">
            {/* Header with Quick Add Button */}
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <span className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>ಕಡತಗಳ ಶೋಧನೆ & ಪಟ್ಟಿ</span>
              </span>
              <button
                type="button"
                id="btn-quick-create-file-left"
                onClick={handleOpenNewFileModal}
                className="bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-400 flex items-center gap-1 font-kannada cursor-pointer shadow-xs transition-colors"
                title="ಹೊಸ ಕಡತ ಸೃಜಿಸಿ (Create New Docket File)"
              >
                <Plus className="w-3.5 h-3.5 text-amber-800 stroke-[3]" />
                <span>ಹೊಸ ಕಡತ</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="search-dockets-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ಕಡತ ಸಂಖ್ಯೆ (ಉದಾ: 57, 45), ವಿಷಯ, ಅಧಿಕಾರಿ..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-lg border-2 border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Section, Status & Priority Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-amber-900 block mb-1 font-kannada">ಶಾಖೆ (Section):</label>
                <select
                  id="select-section-filter"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-amber-50 text-stone-900 font-bold rounded border border-amber-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                >
                  <option value="all">ಎಲ್ಲಾ ಶಾಖೆಗಳು (All)</option>
                  <option value="ಆ1">ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ</option>
                  <option value="ಆ2">ಆ2 - ಸ.ಪ್ರಾ.ಶಿ</option>
                  <option value="ಆ3">ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ</option>
                  <option value="ಆ4">ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ</option>
                  <option value="ಆಡಳಿತ ಶಾಖೆ">ಆಡಳಿತ ಶಾಖೆ</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1 font-kannada">ಸ್ಥಿತಿ (Status):</label>
                <select
                  id="select-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-stone-50 rounded border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                >
                  <option value="all">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All)</option>
                  <option value="bucket_pending">⏳ ಬಾಕಿ (Pending / Active)</option>
                  <option value="bucket_under_review">🔍 ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Review)</option>
                  <option value="bucket_completed">✅ ವಿಲೇವಾರಿ (Completed)</option>
                  <option value="Active / Open">ಸಕ್ರಿಯ (Active / Open)</option>
                  <option value="Under Scrutiny">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Scrutiny)</option>
                  <option value="Pending Higher Approval">ಅನುಮೋದನೆ ಬಾಕಿ (Pending BEO)</option>
                  <option value="Disposed / Closed">ವಿಲೇವಾರಿ (Closed)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1 font-kannada">ಆದ್ಯತೆ (Priority):</label>
                <select
                  id="select-priority-filter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-stone-50 rounded border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                >
                  <option value="all">ಎಲ್ಲಾ ಆದ್ಯತೆ (All)</option>
                  <option value="Immediate">ತುರ್ತು (Immediate)</option>
                  <option value="Urgent">ಅಗತ್ಯ (Urgent)</option>
                  <option value="Routine">ಸಾಮಾನ್ಯ (Routine)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dockets List */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredFiles.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border-2 border-dashed border-stone-300 text-center space-y-2">
                <FolderGit2 className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-sm font-bold text-stone-700 font-kannada">ಯಾವುದೇ ಕಡತಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
                <p className="text-xs text-stone-500">ಫಿಲ್ಟರ್ ಅಥವಾ ಹುಡುಕಾಟದ ಪದಗಳನ್ನು ಬದಲಾಯಿಸಿ ಪ್ರಯತ್ನಿಸಿ.</p>
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                const movementCount = file.movementHistory?.length || 0;

                return (
                  <div
                    key={file.id}
                    id={`docket-card-${file.id}`}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2b2b2b] shadow-[4px_4px_0px_#f59e0b] bg-amber-50/40 -translate-y-0.5'
                        : 'border-stone-200 hover:border-stone-400 shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-[#2b2b2b] text-[#f59e0b] px-2 py-0.5 rounded border border-[#2b2b2b]">
                          ಕಡತ ಸಂ: {file.fileNumber}
                        </span>
                        {file.sectionCode && (
                          <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-300 font-mono font-bold">
                            {file.sectionCode} / {file.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ'}
                          </span>
                        )}
                        {getPriorityBadge(file.priority)}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {getStatusBadge(file.status)}
                        {onDeleteFile && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFileToDelete(file);
                            }}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ಈ ಕಡತವನ್ನು ಅಳಿಸಿ (Delete Docket)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#2b2b2b] line-clamp-2 mb-2 font-kannada leading-snug">
                      {file.subject}
                    </h4>

                    {file.fileCategory && (
                      <div className="mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-medium inline-block font-kannada">
                          📁 {file.fileCategory}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 font-kannada">
                      <div className="flex items-center gap-1 truncate max-w-[220px]">
                        <User className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{file.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು'}</span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-800 font-bold shrink-0">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{movementCount} ಚಲನವಲನ</span>
                      </div>
                    </div>

                    {/* Attached Documents Quick Preview Thumbnail Trigger (Feature 3) */}
                    <div className="pt-2 mt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Paperclip className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-[10px] text-stone-700">
                          {file.attachments && file.attachments.length > 0 
                            ? `ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು (${file.attachments.length})` 
                            : 'ದಾಖಲೆ ಪ್ರತಿಗಳು (1)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDocFile(file);
                          setActiveDocIndex(0);
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer border border-amber-400 font-kannada transition-colors shadow-2xs"
                        title="ದಾಖಲೆಗಳ ಮುನ್ನೋಟ / ಥಂಬ್‌ನೇಲ್ ಪೂರ್ವವೀಕ್ಷಣೆ (Preview Document without downloading)"
                      >
                        <Eye className="w-3 h-3 text-amber-800" />
                        <span>ದಾಖಲೆ ಮುನ್ನೋಟ (Preview)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Visual File Movement Timeline & Full Docket View (7 Columns) */}
        <div className="lg:col-span-7">
          {selectedFile ? (
            <div className="bg-white rounded-xl border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] overflow-hidden">
              {/* Header of Selected Docket */}
              <div className="bg-[#2b2b2b] text-white p-5 border-b-2 border-[#2b2b2b]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded bg-[#f59e0b] text-[#2b2b2b] font-mono font-bold text-xs">
                      ಕಡತ ಸಂಖ್ಯೆ: {selectedFile.fileNumber}
                    </span>
                    <span className="text-xs bg-stone-800 text-stone-200 px-2 py-0.5 rounded font-mono">
                      ಪ್ರಾರಂಭ: {selectedFile.initiatedDate}
                    </span>
                    {getPriorityBadge(selectedFile.priority)}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedFile.status)}
                    {onDeleteFile && (
                      <button
                        type="button"
                        id={`btn-delete-selected-file-${selectedFile.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(selectedFile);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-950/70 hover:bg-rose-900 border border-rose-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors font-kannada"
                        title="ಈ ಕಡತವನ್ನು ಅಳಿಸಿ (Delete Docket)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ಕಡತ ಅಳಿಸಿ</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#fffbf2] font-kannada leading-snug mb-3">
                  {selectedFile.subject}
                </h3>

                {/* Custodian & Action Bar */}
                <div className="bg-black/40 rounded-lg p-3 border border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-kannada">ಪ್ರಸ್ತುತ ಕಡತ ಇರುವ ಅಧಿಕಾರಿ (Current Custodian):</span>
                      <strong className="text-amber-300 font-kannada text-xs">{selectedFile.currentCustodian}</strong>
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* 🌟 Generate Dossier Summary Button for Supervisor Review */}
                    <button
                      id="btn-generate-dossier-summary"
                      type="button"
                      onClick={() => {
                        generateDocketDossierSummaryPdf(selectedFile, effectiveLinkedLetters);
                        if (onShowToast) onShowToast(`ಕಡತ #${selectedFile.fileNumber} ರ ಡಾಸಿಯರ್ ಸಾರಾಂಶ PDF ಯಶಸ್ವಿಯಾಗಿ ಸೃಜನೆಯಾಗಿದೆ!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#2b2b2b] cursor-pointer font-kannada"
                      title="ಕಡತದ ಟಿಪ್ಪಣಿ, ಚಲನವಲನ ಆಡಿಟ್ ಲಾಗ್ ಹಾಗೂ ಲಿಂಕ್ ಆದ ಪತ್ರಗಳ ಏಕೀಕೃತ PDF ಡಾಸಿಯರ್ ಸಾರಾಂಶ ರಚಿಸಿ (Quick Supervisor Review)"
                    >
                      <FileDown className="w-3.5 h-3.5 text-stone-950" />
                      <span>ಡಾಸಿಯರ್ ಸಾರಾಂಶ (PDF)</span>
                    </button>

                    <button
                      id="btn-forward-docket"
                      onClick={() => handleOpenForwardModal(selectedFile)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#10b981] cursor-pointer font-kannada"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ಫಾರ್ವರ್ಡ್ ಮಾಡಿ</span>
                    </button>

                    {onDraftLetterForFile && (
                      <button
                        id="btn-draft-letter-for-file"
                        onClick={() => onDraftLetterForFile(selectedFile)}
                        className="px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-amber-500 text-[#2b2b2b] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#2b2b2b] cursor-pointer font-kannada"
                        title="ಈ ಕಡತದ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ ಹೊಸ ಪತ್ರ ಸೃಜಿಸಿ"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ಪತ್ರ ರಚಿಸಿ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-stone-900 font-kannada">
                      ಕಡತದ ಅಧಿಕೃತ ಚಲನವಲನ ವಿವರಗಳು (Visual File Movement Timeline)
                    </h4>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                    ಒಟ್ಟು {selectedFile.movementHistory?.length || 0} ಹಂತಗಳು
                  </span>
                </div>

                {/* Visual Timeline Cards */}
                {(!selectedFile.movementHistory || selectedFile.movementHistory.length === 0) ? (
                  <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-stone-400" />
                    <p className="text-xs font-bold text-stone-700 font-kannada">ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ಚಲನವಲನ ದಾಖಲಾಗಿಲ್ಲ</p>
                    <button
                      onClick={() => handleOpenForwardModal(selectedFile)}
                      className="px-3 py-1.5 bg-[#2b2b2b] text-white text-xs rounded font-bold hover:bg-black font-kannada"
                    >
                      ಮೊದಲ ಚಲನವಲನ ದಾಖಲಿಸಿ
                    </button>
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-300">
                    {selectedFile.movementHistory.map((mov, index) => {
                      const isLatest = index === selectedFile.movementHistory.length - 1;

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
                            <div className="bg-white rounded-lg p-3 border border-stone-200 mb-3 space-y-2">
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

                {/* Linked Letters Section */}
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#f59e0b]" />
                      ಈ ಕಡತದ ಅಡಿಯಲ್ಲಿ ಸೃಜಿಸಲಾದ ಪತ್ರಗಳು ({effectiveLinkedLetters.length})
                    </h5>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-draft-new-letter-under-file"
                        onClick={() => handleOpenRtiDraftModal()}
                        className="text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg border border-[#2b2b2b] shadow-2xs flex items-center gap-1 cursor-pointer font-kannada transition-colors"
                        title="ಈ ಕಡತದ ಮಾಹಿತಿ ಬಳಸಿ ಹೊಸ ಪತ್ರ ರಚಿಸಿ"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> ಹೊಸ ಪತ್ರ ರಚಿಸಿ
                      </button>
                      {onDraftLetterForFile && (
                        <button
                          onClick={() => onDraftLetterForFile(selectedFile)}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer font-kannada"
                        >
                          ಲೇಟರ್ ಸ್ಟುಡಿಯೋ
                        </button>
                      )}
                    </div>
                  </div>

                  {effectiveLinkedLetters.length === 0 ? (
                    <p className="text-xs text-stone-500 font-kannada italic bg-stone-50 p-3 rounded border border-stone-200">
                      ಈ ಕಡತಕ್ಕೆ ಯಾವುದೇ ಅಧಿಕೃತ ಪತ್ರಗಳು ಇನ್ನೂ ಜೋಡಣೆಯಾಗಿಲ್ಲ.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {effectiveLinkedLetters.map((letItem) => {
                        const rawRef = letItem.referenceNumber || (letItem as any).letterNumber || '';
                        const cleanRef = rawRef.startsWith('ಪತ್ರ ಸಂ:') ? rawRef : `ಪತ್ರ ಸಂ: ${rawRef}`;
                        const displayDate = formatDdMmYyyy(letItem.dateReceivedOrIssued || (letItem as any).date);
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
                                  {displayDate}
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
                                <Download className="w-3 h-3" />
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
                              <button
                                onClick={() => handleOpenRtiDraftModal(letItem)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded border border-stone-800 text-[11px] font-bold cursor-pointer font-kannada shadow-2xs"
                                title="ಪತ್ರದ ವಿವರಗಳನ್ನು ಬದಲಾವಣೆ / ತಿದ್ದುಪಡಿ ಮಾಡಿ (Edit letter details)"
                              >
                                ಬದಲಾವಣೆ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Docket Notes & Attachments */}
                {selectedFile.notes && (
                  <div className="bg-stone-100 rounded-lg p-3 border border-stone-200 text-xs font-kannada text-stone-700">
                    <span className="font-bold block text-stone-900 mb-0.5">ಕಡತದ ಟಿಪ್ಪಣಿ:</span>
                    <p>{selectedFile.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-stone-300 text-center space-y-3">
              <FolderGit2 className="w-12 h-12 mx-auto text-stone-400" />
              <h3 className="text-base font-bold text-stone-700 font-kannada">ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                ಎಡಭಾಗದ ಪಟ್ಟಿಯಿಂದ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿಕೊಂಡು ಅದರ ವಿವರವಾದ ಚಲನವಲನ ಟೈಮ್‌ಲೈನ್ ಹಾಗೂ ಸಂಬಂಧಿತ ಪತ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Forward File (ಕಡತ ರವಾನಿಸಿ) */}
      {isForwardModalOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#2b2b2b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#f59e0b]" />
                <h3 className="text-base font-bold font-kannada text-[#fffbf2]">
                  ಕಡತ ರವಾನಿಸಿ (Forward File Movement)
                </h3>
              </div>
              <button
                onClick={() => setIsForwardModalOpen(false)}
                className="text-stone-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleForwardSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-xs font-kannada">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900">ಕಡತ ಸಂಖ್ಯೆ:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-400">{selectedFile.fileNumber}</span>
                </div>
                <p className="text-stone-700 mt-1 line-clamp-1">{selectedFile.subject}</p>
              </div>

              {/* From Officer */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ರವಾನಿಸುವವರು (From Officer):
                </label>
                <input
                  type="text"
                  value={forwardFromOfficer}
                  onChange={(e) => setForwardFromOfficer(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                />
              </div>

              {/* To Officer */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ಸ್ವೀಕರಿಸುವ ಅಧಿಕಾರಿ (To Officer):
                </label>
                <select
                  value={forwardToOfficer}
                  onChange={(e) => setForwardToOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                >
                  {OFFICER_LIST.map((officer) => (
                    <option key={officer} value={officer}>{officer}</option>
                  ))}
                </select>
              </div>

              {/* Status After Move */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ರವಾನೆಯ ನಂತರದ ಕಡತದ ಸ್ಥಿತಿ (Status After Move):
                </label>
                <select
                  value={forwardStatus}
                  onChange={(e) => setForwardStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                >
                  <option value="Under Scrutiny">ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)</option>
                  <option value="Pending Higher Approval">ಮೇಲಧಿಕಾರಿಗಳ ಅನುಮೋದನೆ ಬಾಕಿ (Pending Higher Approval)</option>
                  <option value="Active / Open">ಸಕ್ರಿಯ (Active / Open)</option>
                  <option value="Disposed / Closed">ಅಂತಿಮ ವಿಲೇವಾರಿ (Disposed / Closed)</option>
                </select>
              </div>

              {/* Remarks / Official Noting */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ಅಧಿಕೃತ ಷರಾ / ಟಿಪ್ಪಣಿ (Noting / Remarks):
                </label>
                <textarea
                  value={forwardRemarks}
                  onChange={(e) => setForwardRemarks(e.target.value)}
                  required
                  rows={3}
                  placeholder="ಪ್ರಸ್ತಾವನೆಯನ್ನು ನಿಯಮಾನುಸಾರ ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಮುಂದಿನ ಅಗತ್ಯ ಆದೇಶಕ್ಕಾಗಿ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಸಲ್ಲಿಸಲಾಗಿದೆ..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForwardModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer font-kannada"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-[2px_2px_0px_#10b981] flex items-center gap-1.5 cursor-pointer font-kannada disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingMove ? 'ರವಾನಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಡತ ರವಾನಿಸಿ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW DOCKET FILE (ಹೊಸ ಕಡತ ಸೃಜನೆ)                            */}
      {/* ========================================================================= */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#2b2b2b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-kannada">
                    ಹೊಸ ಕಡತ ಸೃಜನೆ (Create New Docket File)
                  </h3>
                  <p className="text-[11px] text-stone-300 font-kannada">
                    ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಕಛೇರಿ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಅಧಿಕೃತ ಕಡತ ಸೃಜನೆ ಮತ್ತು ಚಲನವಲನ ದಾಖಲಾತಿ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFileModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewFileSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Number */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಕಡತ ಸಂಖ್ಯೆ (File Number)*:
                  </label>
                  <input
                    type="text"
                    required
                    value={newFileNumber}
                    onChange={(e) => setNewFileNumber(e.target.value)}
                    placeholder="ಉದಾ: 88 ಅಥವಾ ಆ2/ಕಡತ-88/2026-27"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border-2 border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-mono font-bold"
                  />
                  <span className="text-[10px] text-stone-500 font-kannada block mt-0.5">
                    ಸಂಖ್ಯೆ ಮಾತ್ರ ಅಥವಾ ಪೂರ್ಣ ಪತ್ರ ಸಂಖ್ಯೆ
                  </span>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಕಡತದ ವರ್ಗೀಕರಣ (Docket Category)*:
                  </label>
                  <select
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                  >
                    <option value="ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ">ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ (Pension & Retirement)</option>
                    <option value="ವೇತನ ಬಡ್ತಿ & ಪರಿಷ್ಕರಣೆ">ವೇತನ ಬಡ್ತಿ & ಪರಿಷ್ಕರಣೆ (Promotion & Revision)</option>
                    <option value="ಶಿಸ್ತು ಕ್ರಮ & ವಿಚಾರಣೆ">ಶಿಸ್ತು ಕ್ರಮ & ವಿಚಾರಣೆ (Disciplinary & Inquiry)</option>
                    <option value="ವೇತನ & ಭತ್ಯೆಗಳು">ವೇತನ & ಭತ್ಯೆಗಳು (Salary & Allowances)</option>
                    <option value="ರಜೆ & ಸೇವಾ ವಿವರಗಳು">ರಜೆ & ಸೇವಾ ವಿವರಗಳು (Leave & Service)</option>
                    <option value="ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ">ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ (Accounts & Grants)</option>
                    <option value="ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)">ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)</option>
                    <option value="ಶೈಕ್ಷಣಿಕ & ಶಾಲೆಗಳು">ಶೈಕ್ಷಣಿಕ & ಶಾಲೆಗಳು (Academic & Schools)</option>
                    <option value="ಸಾಮಾನ್ಯ ಕಡತ">ಸಾಮಾನ್ಯ ಕಡತ (General Administration)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ಕಡತದ ಅಧಿಕೃತ ವಿಷಯ (Docket Subject / Title)*:
                </label>
                <input
                  type="text"
                  required
                  value={newFileSubject}
                  onChange={(e) => setNewFileSubject(e.target.value)}
                  placeholder="ಉದಾ: ಶ್ರೀಮತಿ ಶಾಂತಾ ಎನ್. - ಪಿಂಚಣಿ ಕಡತ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border-2 border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Section Code */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಶಾಖಾ ಕೋಡ್ (Section Code):
                  </label>
                  <input
                    type="text"
                    value={newFileSectionCode}
                    onChange={(e) => setNewFileSectionCode(e.target.value)}
                    placeholder="ಉದಾ: ಆ2"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border border-stone-300 font-mono font-bold"
                  />
                </div>

                {/* Section Name */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಶಾಖೆಯ ಹೆಸರು (Section Name):
                  </label>
                  <input
                    type="text"
                    value={newFileSectionName}
                    onChange={(e) => setNewFileSectionName(e.target.value)}
                    placeholder="ಉದಾ: ಆಡಳಿತ & ಸೇವೆಗಳು"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border border-stone-300 font-kannada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Current Custodian */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಪ್ರಸ್ತುತ ಇರುವ ಅಧಿಕಾರಿ / ಕಸ್ಟೋಡಿಯನ್ (Custodian)*:
                  </label>
                  <select
                    value={newFileCustodian}
                    onChange={(e) => setNewFileCustodian(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                  >
                    <option value={`${beoProfile.name} - ${beoProfile.designation}`}>{beoProfile.name} - {beoProfile.designation}</option>
                    {OFFICER_LIST.map((officer) => (
                      <option key={officer} value={officer}>{officer}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                    ಆದ್ಯತೆ (Priority):
                  </label>
                  <select
                    value={newFilePriority}
                    onChange={(e) => setNewFilePriority(e.target.value as LetterPriority)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada"
                  >
                    <option value="Immediate">ತುರ್ತು (Immediate)</option>
                    <option value="Urgent">ಅಗತ್ಯ (Urgent)</option>
                    <option value="Routine">ಸಾಮಾನ್ಯ (Routine)</option>
                  </select>
                </div>
              </div>

              {/* Initial Remarks / Notes */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 font-kannada">
                  ಆರಂಭಿಕ ಟಿಪ್ಪಣಿ / ವಿವರಣೆ (Initial Note / Remarks):
                </label>
                <textarea
                  value={newFileNotes}
                  onChange={(e) => setNewFileNotes(e.target.value)}
                  rows={2}
                  placeholder="ಕಡತದ ಹಿನ್ನೆಲೆ, ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಅಥವಾ ಆರಂಭಿಕ ವಿವರಗಳು..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-kannada resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFileModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer font-kannada"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewFile}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer font-kannada disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-900" />
                  <span>{isSubmittingNewFile ? 'ಸೃಜಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಡತ ಸೃಜಿಸಿ (Save File)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BEO OFFICER PROFILE EDIT (ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ವಿವರ ನಮೂದು)       */}
      {/* ========================================================================= */}
      {isBeoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#2b2b2b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#2b2b2b] flex items-center justify-center font-bold text-xs">
                  BEO
                </div>
                <div>
                  <h3 className="font-bold text-sm font-kannada">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ (BEO) ವಿವರ ನಮೂದು & ತಿದ್ದುಪಡಿ
                  </h3>
                  <p className="text-[11px] text-stone-300 font-kannada">
                    ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ತಾಲ್ಲೂಕಿನ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಬಿಇಒ ವಿವರಗಳ ನಿರ್ವಹಣೆ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBeoModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBeoProfile} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto font-kannada">
              {/* BEO Name */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಬಿಇಒ ಅಧಿಕಾರಿಗಳ ಹೆಸರು (BEO Name)*:
                </label>
                <input
                  type="text"
                  required
                  value={beoEditData.name}
                  onChange={(e) => setBeoEditData({ ...beoEditData, name: e.target.value })}
                  placeholder="ಸುರೇಶ್ ಕೆ.ಸಿ."
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border-2 border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-bold text-stone-900"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಪದನಾಮ / ಹುದ್ದೆ (Designation)*:
                </label>
                <input
                  type="text"
                  required
                  value={beoEditData.designation}
                  onChange={(e) => setBeoEditData({ ...beoEditData, designation: e.target.value })}
                  placeholder="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (Block Education Officer)"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b]"
                />
              </div>

              {/* Office Name */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಕಛೇರಿಯ ಹೆಸರು (Office Name)*:
                </label>
                <input
                  type="text"
                  required
                  value={beoEditData.officeName}
                  onChange={(e) => setBeoEditData({ ...beoEditData, officeName: e.target.value })}
                  placeholder="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b]"
                />
              </div>

              {/* Office Address */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಕಛೇರಿ ವಿಳಾಸ (Office Address):
                </label>
                <input
                  type="text"
                  value={beoEditData.officeAddress}
                  onChange={(e) => setBeoEditData({ ...beoEditData, officeAddress: e.target.value })}
                  placeholder="ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ - 577301, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#2b2b2b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ದೂರವಾಣಿ ಸಂಖ್ಯೆ (Phone / Mobile):
                  </label>
                  <input
                    type="text"
                    value={beoEditData.phone}
                    onChange={(e) => setBeoEditData({ ...beoEditData, phone: e.target.value })}
                    placeholder="08282-266144"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ಇಮೇಲ್ ವಿಳಾಸ (Email):
                  </label>
                  <input
                    type="email"
                    value={beoEditData.email}
                    onChange={(e) => setBeoEditData({ ...beoEditData, email: e.target.value })}
                    placeholder="beo.bhadravathi@karnataka.gov.in"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 font-mono"
                  />
                </div>
              </div>

              {/* Cadre Details */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಸೇವಾ ಕೇಡರ್ ವಿವರ (Cadre / KES Details):
                </label>
                <input
                  type="text"
                  value={beoEditData.kesCadre}
                  onChange={(e) => setBeoEditData({ ...beoEditData, kesCadre: e.target.value })}
                  placeholder="ಕೆ.ಇ.ಎಸ್. (ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಸೇವೆ)"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBeoModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg border-2 border-emerald-900 shadow-[2px_2px_0px_#065f46] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ವಿವರ ಉಳಿಸಿ (Save BEO Details)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DOCUMENT PREVIEW MODAL (ದಾಖಲೆ ಪೂರ್ವವೀಕ್ಷಣೆ - THUMBNAIL PREVIEW)    */}
      {/* ========================================================================= */}
      {previewDocFile && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#2b2b2b] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                      ಕಡತ ಸಂ: {previewDocFile.fileNumber}
                    </span>
                    <h3 className="font-bold text-sm font-kannada text-white truncate max-w-md sm:max-w-xl">
                      {previewDocFile.subject}
                    </h3>
                  </div>
                  <p className="text-[11px] text-stone-300 font-kannada">
                    ದಾಖಲೆಗಳ ಮುನ್ನೋಟ (Preview Attached Documents without downloading)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocFile(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Left Thumbnail Strip + Right Preview Frame */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-stone-100">
              {/* Left Column: Attached Documents Thumbnail Strip */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stone-300 bg-white p-4 overflow-y-auto space-y-3 shrink-0">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                    <span>ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು ({previewDocFile.attachments?.length || 1})</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-kannada">ಕ್ಲಿಕ್ ಮಾಡಿ ವೀಕ್ಷಿಸಿ</span>
                </div>

                {/* Document Thumbnails */}
                {(!previewDocFile.attachments || previewDocFile.attachments.length === 0) ? (
                  <div 
                    onClick={() => setActiveDocIndex(0)}
                    className="p-3 rounded-xl border-2 border-amber-500 bg-amber-50/60 shadow-xs cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-12 rounded bg-amber-200 border border-amber-300 flex flex-col items-center justify-center text-[9px] font-bold text-amber-900 shrink-0">
                        <FileText className="w-4 h-4 text-amber-800" />
                        <span>PDF</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate font-kannada">
                          ಅಧಿಕೃತ ಅರ್ಜಿ ಹಾಗೂ ದೃಢೀಕೃತ ಪ್ರತಿ
                        </h4>
                        <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span>1.2 MB</span>
                          <span>•</span>
                          <span>2 ಪುಟಗಳು</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  previewDocFile.attachments.map((att, idx) => {
                    const isActive = activeDocIndex === idx;
                    const isPdf = att.fileType?.includes('pdf') || att.fileName.endsWith('.pdf');
                    return (
                      <div
                        key={att.id || idx}
                        onClick={() => setActiveDocIndex(idx)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-200'
                            : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Visual Thumbnail Tile */}
                          <div className={`w-11 h-14 rounded-md border flex flex-col items-center justify-center text-[9px] font-bold shrink-0 shadow-2xs relative overflow-hidden ${
                            isPdf ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          }`}>
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-400" />
                            {isPdf ? <FileText className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                            <span className="mt-0.5 text-[8px] font-mono">{isPdf ? 'PDF' : 'JPG'}</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-stone-900 truncate font-sans">
                              {att.fileName}
                            </h4>
                            <p className="text-[10px] text-stone-600 line-clamp-1 font-kannada mt-0.5">
                              {att.description || 'ಕಡತದ ಅಧಿಕೃತ ದಾಖಲೆ'}
                            </p>
                            <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-1">
                              <span>{att.fileSize || '1.0 MB'}</span>
                              <span>•</span>
                              <span>{att.pageCount || 1} ಪುಟಗಳು</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-600 font-kannada space-y-1">
                  <span className="font-bold text-stone-800 block">ಸೂಚನೆ:</span>
                  <p>ಡೌನ್‌ಲೋಡ್ ಮಾಡದೆಯೇ ದಾಖಲೆಗಳ ಪುಟಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪರಿಶೀಲಿಸಲು ಈ ಥಂಬ್‌ನೇಲ್ ಪೂರ್ವವೀಕ್ಷಣೆಯನ್ನು ಬಳಸಬಹುದು.</p>
                </div>
              </div>

              {/* Right Column: High-Fidelity In-line Document Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden bg-stone-200/70 p-4 sm:p-6 items-center justify-start overflow-y-auto">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-stone-300 overflow-hidden font-sans">
                  {/* Document Header in Preview */}
                  <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-stone-950">
                          ಪುಟ 1 / {previewDocFile.attachments?.[activeDocIndex]?.pageCount || 2}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-sm">
                          {previewDocFile.attachments?.[activeDocIndex]?.fileName || 'ಪ್ರಮಾಣೀಕೃತ ದಾಖಲೆ ಪ್ರತಿ.pdf'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onShowToast) onShowToast('ದಾಖಲೆ ಡೌನ್‌ಲೋಡ್ ಪ್ರಾರಂಭವಾಗಿದೆ...');
                        }}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ಡೌನ್‌ಲೋಡ್</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Simulated Sheet Preview */}
                  <div className="p-8 sm:p-12 space-y-6 text-stone-900 bg-white min-h-[500px]">
                    {/* Official Karnataka Header */}
                    <div className="text-center border-b-2 border-stone-800 pb-4 space-y-1">
                      <p className="font-extrabold text-sm sm:text-base text-stone-950">
                        ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
                      </p>
                      <p className="font-bold text-xs text-stone-800">
                        ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301
                      </p>
                      <p className="text-[11px] text-stone-600 font-mono">
                        ದಾಖಲೆ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ: {previewDocFile.fileNumber} | ದಿನಾಂಕ: {previewDocFile.initiatedDate || '2026-10-06'}
                      </p>
                    </div>

                    {/* Official Docket Stamp / Watermark Badge */}
                    <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-lg border border-amber-300 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">ಕಡತದ ಶೀರ್ಷಿಕೆ:</span>
                        <p className="font-bold text-stone-900 font-kannada">{previewDocFile.subject}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-400">
                          ದೃಢೀಕೃತ ಪ್ರತಿ
                        </span>
                      </div>
                    </div>

                    {/* Document Body Snippet */}
                    <div className="space-y-3 text-xs sm:text-sm text-stone-800 font-serif leading-relaxed">
                      <p className="font-bold text-stone-900">
                        ವಿಷಯ: {previewDocFile.subject} ಸಂಬಂಧಿತ ಮೂಲ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಹಾಗೂ ಸಲ್ಲಿಕೆ.
                      </p>
                      <p>
                        {previewDocFile.attachments?.[activeDocIndex]?.description || 
                          previewDocFile.notes || 
                          'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಸ್ವೀಕೃತವಾದ ಅರ್ಜಿ ಹಾಗೂ ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳ ಅಧಿಕೃತ ಕಡತ ಪ್ರತಿ.'}
                      </p>
                      <div className="bg-stone-50 p-4 rounded border border-stone-200 font-mono text-xs space-y-1">
                        <div>ಕಡತ ವಿಭಾಗ: <strong>{previewDocFile.sectionCode || 'ಆ2'} ({previewDocFile.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ'})</strong></div>
                        <div>ಹಾಲಿ ನಿರ್ವಾಹಕರು: <strong>{previewDocFile.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು'}</strong></div>
                        <div>ದಾಖಲೆಯ ಗಾತ್ರ: <strong>{previewDocFile.attachments?.[activeDocIndex]?.fileSize || '1.2 MB'}</strong></div>
                        <div>ಅಪ್‌ಲೋಡ್ ದಿನಾಂಕ: <strong>{previewDocFile.attachments?.[activeDocIndex]?.uploadedAt || previewDocFile.initiatedDate || '2026-10-06'}</strong></div>
                      </div>
                    </div>

                    {/* Official Verification Seal & Signature */}
                    <div className="pt-8 border-t border-stone-200 flex justify-between items-end text-xs font-kannada">
                      <div className="text-center p-2 rounded border border-dashed border-stone-400 w-36">
                        <span className="text-[10px] font-bold text-stone-500 block">ಕಛೇರಿ ಮೊಹರು (Seal)</span>
                        <span className="text-[9px] text-stone-600 block mt-1">BEO OFFICE BHADRAVATHI</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="font-bold text-stone-900">({beoProfile.name})</p>
                        <p className="text-[11px] text-stone-700">{beoProfile.designation}</p>
                        <p className="text-[10px] text-stone-500">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: GENERATE MONTHLY AUDIT REPORT (ಮಾಸಿಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ PDF)         */}
      {/* ========================================================================= */}
      {isAuditReportOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#2b2b2b] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-kannada text-white">
                    ಮಾಸಿಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ (Generate Monthly Audit Report)
                  </h3>
                  <p className="text-[11px] text-stone-300 font-kannada">
                    ಮಾಹಿತಿ ಹಕ್ಕು ಚಲನವಲನ ಅಂಕಿ-ಅಂಶಗಳು ಹಾಗೂ ತಿಂಗಳ ಒಟ್ಟು ಪತ್ರಗಳ ನಿರ್ವಹಣಾ ಸಾರಾಂಶ (PDF Summary)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-3 py-1.5 rounded-lg border border-amber-500 flex items-center gap-1.5 text-xs font-kannada cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-950" />
                  <span>ವರದಿ ಮುದ್ರಿಸಿ / PDF ಡೌನ್‌ಲೋಡ್</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuditReportOpen(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Month Filter Bar */}
            <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-kannada font-bold text-stone-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>ವರದಿ ಮಾಹೆ (Report Month):</span>
                <input
                  type="month"
                  value={auditMonth}
                  onChange={(e) => setAuditMonth(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-white rounded border border-stone-300 font-mono font-bold"
                />
              </div>

              <div className="text-xs text-stone-600 font-kannada flex items-center gap-4">
                <span>ಒಟ್ಟು ಕಡತಗಳು: <strong>{auditReportStats.monthFilesCount}</strong></span>
                <span>ತಿಂಗಳ ಪತ್ರಗಳು: <strong>{auditReportStats.monthLettersCount}</strong></span>
                <span>ಚಲನವಲನ ಹಂತಗಳು: <strong>{auditReportStats.totalMovements}</strong></span>
              </div>
            </div>

            {/* Scrollable Printable Report Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-stone-100/60 font-sans">
              <div id="monthly-audit-report-printable" className="bg-white p-8 rounded-xl border border-stone-300 shadow-sm space-y-6 max-w-3xl mx-auto">
                {/* Official Letterhead */}
                <div className="text-center border-b-2 border-stone-900 pb-4 space-y-1">
                  <p className="font-extrabold text-base text-stone-950 tracking-wide font-kannada">
                    ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                  </p>
                  <p className="font-bold text-sm text-stone-900 font-kannada">
                    ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
                  </p>
                  <p className="font-bold text-sm text-stone-900 font-kannada">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ
                  </p>
                  <p className="text-xs text-stone-700 font-kannada">
                    ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ - 577301 | ದೂರವಾಣಿ: 08282-266144
                  </p>
                  <div className="pt-2">
                    <span className="inline-block bg-[#2b2b2b] text-amber-300 text-xs font-bold px-3 py-1 rounded font-kannada">
                      ಮಾಹಿತಿ ಹಕ್ಕು (RTI) ಹಾಗೂ ಕಡತ ಚಲನವಲನ ಮಾಸಿಕ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ (ಮಾಹೆ: {auditMonth})
                    </span>
                  </div>
                </div>

                {/* KPI Statistics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block font-kannada">ಒಟ್ಟು RTI ಅರ್ಜಿಗಳು</span>
                    <strong className="text-xl font-bold text-emerald-950 font-mono">{auditReportStats.rtiFilesTotal}</strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block font-kannada">ವಿಲೇವಾರಿಯಾದ ಪ್ರಕರಣ</span>
                    <strong className="text-xl font-bold text-blue-950 font-mono">{auditReportStats.rtiDisposedCount}</strong>
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block font-kannada">ಸಕ್ರಿಯ / ಪರಿಶೀಲನೆಯಲ್ಲಿ</span>
                    <strong className="text-xl font-bold text-amber-950 font-mono">{auditReportStats.rtiActiveCount}</strong>
                  </div>
                  <div className="bg-stone-50 border border-stone-300 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-stone-700 uppercase block font-kannada">ಸಂಗ್ರಹಿತ ಶುಲ್ಕ ಮೊತ್ತ</span>
                    <strong className="text-xl font-bold text-stone-900 font-mono">₹{auditReportStats.rtiFeeTotal}/-</strong>
                  </div>
                </div>

                {/* Letters Handled Summary */}
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 text-xs space-y-2">
                  <h4 className="font-bold text-stone-900 font-kannada flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>ತಿಂಗಳಲ್ಲಿ ನಿರ್ವಹಿಸಲಾದ ಒಟ್ಟು ಪತ್ರಗಳ ವಿವರ (Letters Movement Breakdown):</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-2.5 rounded border border-stone-300 text-center">
                      <span className="text-[10px] text-stone-500 block">ಇನ್‌ವರ್ಡ್ (ಸ್ವೀಕೃತ)</span>
                      <strong className="text-sm font-bold text-stone-900 font-mono">{auditReportStats.inwardCount}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-stone-300 text-center">
                      <span className="text-[10px] text-stone-500 block">ಔಟ್‌ವರ್ಡ್ (ರವಾನಿತ)</span>
                      <strong className="text-sm font-bold text-stone-900 font-mono">{auditReportStats.outwardCount}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-stone-300 text-center">
                      <span className="text-[10px] text-stone-500 block">ಒಟ್ಟು ಪತ್ರಗಳು</span>
                      <strong className="text-sm font-bold text-stone-900 font-mono">{auditReportStats.monthLettersCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Detailed File Movement Audit Trail Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 font-kannada">
                    ಮಾಹಿತಿ ಹಕ್ಕು ಹಾಗೂ ಕಡತ ಚಲನವಲನ ವಿವರವಾದ ತಃಖ್ತೆ (Detailed Movement Log):
                  </h4>
                  <div className="overflow-x-auto border border-stone-300 rounded-lg">
                    <table className="w-full text-left text-[11px] font-kannada">
                      <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                        <tr>
                          <th className="p-2 border-r border-stone-300">ಕ್ರ.ಸಂ.</th>
                          <th className="p-2 border-r border-stone-300">ಕಡತ ಸಂಖ್ಯೆ</th>
                          <th className="p-2 border-r border-stone-300">ವಿಷಯ</th>
                          <th className="p-2 border-r border-stone-300">ಇವರಿಂದ → ಇವರಿಗೆ</th>
                          <th className="p-2 border-r border-stone-300">ದಿನಾಂಕ</th>
                          <th className="p-2">ಸ್ಥಿತಿ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {auditReportStats.allMovementEntries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-stone-500 italic">
                              ಈ ಮಾಹೆಯಲ್ಲಿ ಯಾವುದೇ ಕಡತ ಚಲನವಲನ ದಾಖಲಾಗಿಲ್ಲ.
                            </td>
                          </tr>
                        ) : (
                          auditReportStats.allMovementEntries.slice(0, 10).map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50">
                              <td className="p-2 font-mono border-r border-stone-200 text-center">{idx + 1}</td>
                              <td className="p-2 font-mono font-bold border-r border-stone-200">{item.file.fileNumber}</td>
                              <td className="p-2 border-r border-stone-200 max-w-xs truncate">{item.file.subject}</td>
                              <td className="p-2 border-r border-stone-200">{item.move.fromOfficer} → {item.move.toOfficer}</td>
                              <td className="p-2 font-mono border-r border-stone-200">{item.move.sentDate}</td>
                              <td className="p-2 font-bold text-emerald-800">{item.move.statusAfterMove || item.file.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatory & Officer Verification */}
                <div className="pt-6 border-t-2 border-stone-800 flex justify-between items-end text-xs font-kannada">
                  <div className="space-y-1">
                    <p className="text-[10px] text-stone-500">ಪ್ರಮಾಣೀಕರಿಸಿದ ದಿನಾಂಕ: {new Date().toISOString().split('T')[0]}</p>
                    <p className="text-[10px] text-stone-500">ವರದಿ ಸೃಜನೆ: ಅಧಿಕೃತ ಇ-ಡಾಕ್ ಕಡತಾಗಾರ ವ್ಯವಸ್ಥೆ</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="font-bold text-stone-900">({beoProfile.name})</p>
                    <p className="text-[11px] text-stone-800">{beoProfile.designation}</p>
                    <p className="text-[10px] text-stone-600">ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO) & BEO</p>
                    <p className="text-[10px] text-stone-600">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: RTI LETTER DRAFTER & EDITOR (ಪತ್ರ ರಚನೆ & ತಿದ್ದುಪಡಿ)                 */}
      {/* ========================================================================= */}
      {isRtiDraftModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#2b2b2b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-kannada text-white">
                    {editingLetterItem ? 'ಪತ್ರದ ವಿವರಗಳ ತಿದ್ದುಪಡಿ / ಬದಲಾವಣೆ' : 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತದ ಹೊಸ ಪತ್ರ ರಚಿಸಿ'}
                  </h3>
                  <p className="text-[11px] text-stone-300 font-kannada">
                    ಸ್ವಯಂಚಾಲಿತ ಪತ್ರ ಸಂಖ್ಯೆ ಹಾಗೂ ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತದ ವಿವರಗಳೊಂದಿಗೆ ಪತ್ರ ಸಂಪಾದಿಸಿ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRtiDraftModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRtiDraft} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto font-kannada">
              {/* Reference Number & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ಪತ್ರ ಸಂಖ್ಯೆ (Letter Reference)*:
                  </label>
                  <input
                    type="text"
                    required
                    value={draftRefNumber}
                    onChange={(e) => setDraftRefNumber(e.target.value)}
                    placeholder="ಉದಾ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/85/1/2026-27"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border-2 border-stone-300 focus:outline-none focus:border-[#2b2b2b] font-mono font-bold"
                  />
                  <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">
                    ಸ್ವರೂಪ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/[ಫೈಲ್]/[ಕ್ರಮಸಂಖ್ಯೆ]/2026-27
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ದಿನಾಂಕ (Date)*:
                  </label>
                  <input
                    type="date"
                    required
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ರವಾನೆಗೆ / ರಿಗೆ (Recipient / To)*:
                </label>
                <input
                  type="text"
                  required
                  value={draftRecipient}
                  onChange={(e) => setDraftRecipient(e.target.value)}
                  placeholder="ಅರ್ಜಿದಾರರು ಅಥವಾ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗಳ ಹೆಸರು ಮತ್ತು ವಿಳಾಸ"
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ವಿಷಯ (Subject)*:
                </label>
                <textarea
                  required
                  rows={2}
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ: ..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 resize-none font-bold text-stone-900"
                />
              </div>

              {/* Body Text */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  ಪತ್ರದ ಅಧಿಕೃತ ವಿವರಣೆ / ಕರಡು (Main Letter Body)*:
                </label>
                <textarea
                  required
                  rows={5}
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  placeholder="ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಸ್ವೀಕೃತವಾದ ಅರ್ಜಿ..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 resize-none font-serif text-stone-900 leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRtiDraftModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ಪತ್ರ ಉಳಿಸಿ / ಬದಲಾವಣೆ ಅನ್ವಯಿಸಿ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Data Management (Clear Sample Data / Provide Fresh Data) */}
      {isDataModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300">
                  <Database className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-kannada">
                    ಕಡತಗಳ ಡೇಟಾ ನಿರ್ವಹಣೆ & ಮಾದರಿ ಡೇಟಾ (Data Options)
                  </h3>
                  <p className="text-[11px] text-stone-500 font-kannada">
                    ಮಾದರಿ (Demo/Sample) ಡೇಟಾವನ್ನು ರಿಮೂವ್ ಮಾಡಿ ಅಥವಾ ಹೊಸ ಅಧಿಕೃತ ಡೇಟಾ ಪ್ರಾರಂಭಿಸಿ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDataModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-kannada">
              {/* Option 1: Remove/Clear Sample Data */}
              <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      1. ಮಾದರಿ ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಿಮೂವ್ ಮಾಡಿ (Clear All Sample Data)
                    </h4>
                    <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                      ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ ಎಲ್ಲಾ ಮಾದರಿ (Mock/Sample) ಕಡತಗಳು ಹಾಗೂ ಪತ್ರಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳಿಸಿ ಖಾಲಿ ಸ್ಲೇಟ್ ನೀಡುತ್ತದೆ. ಇದರಿಂದ ನೀವು ಕಛೇರಿಯ ಅಧಿಕೃತ ನೈಜ ಕಡತಗಳನ್ನು ನೇರವಾಗಿ ನಮೂದಿಸಬಹುದು.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="btn-confirm-clear-sample-data"
                    onClick={async () => {
                      setIsDataModalOpen(false);
                      if (onClearSampleData) {
                        await onClearSampleData();
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer shrink-0 transition-colors"
                  >
                    ರಿಮೂವ್ ಮಾಡಿ
                  </button>
                </div>
              </div>

              {/* Option 2: Provide Fresh Official 2026-27 Data */}
              <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      2. ಹೊಸ ಅಧಿಕೃತ 2026-27 ಡೇಟಾ ನೀಡಿ (Load Fresh Official Data)
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                      ಆ2 (ಸ.ಪ್ರಾ.ಶಿ) ಶಾಖೆಗೆ ಸಂಬಂಧಿಸಿದ ಅಧಿಕೃತ 2026-27 ನೇ ಸಾಲಿನ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (ಕಡತ 45), ರಜೆ ಮಂಜೂರಾತಿ (ಕಡತ 46) ಮತ್ತು ಮಾಹಿತಿ ಹಕ್ಕು (ಕಡತ 47) ಕಡತಗಳನ್ನು ಹೊಸದಾಗಿ ಸ್ಥಾಪಿಸುತ್ತದೆ.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="btn-confirm-load-fresh-data"
                    onClick={async () => {
                      setIsDataModalOpen(false);
                      if (onLoadFreshData) {
                        await onLoadFreshData();
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer shrink-0 transition-colors"
                  >
                    ಹೊಸ ಡೇಟಾ ನೀಡಿ
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDataModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer font-kannada"
              >
                ಮುಚ್ಚಿ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Docket Delete Confirmation */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-stone-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 font-kannada">
                ಕಡತ &ldquo;{fileToDelete.fileNumber}&rdquo; ಅನ್ನು ಅಳಿಸುವುದೇ?
              </h3>
              <p className="text-xs text-stone-600 font-kannada line-clamp-2">
                {fileToDelete.subject}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 cursor-pointer font-kannada"
              >
                ರದ್ದುಗೊಳಿಸಿ (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={async () => {
                  if (!onDeleteFile) return;
                  try {
                    setIsDeletingFile(true);
                    await onDeleteFile(fileToDelete.id);
                    setFileToDelete(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsDeletingFile(false);
                  }
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow cursor-pointer font-kannada disabled:opacity-50"
              >
                {isDeletingFile ? 'ಅಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಹೌದು, ಅಳಿಸಿ (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OTHER FILE MODAL */}
      <CreateOtherFileModal
        isOpen={isCreateOtherFileOpen}
        onClose={() => setIsCreateOtherFileOpen(false)}
        onCreateFile={async (fileData) => {
          if (onCreateFile) {
            await onCreateFile(fileData);
          } else {
            const res = await fetch('/api/files', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fileData)
            });
            const data = await res.json();
            if (data.file?.id) {
              setSelectedFileId(data.file.id);
            }
          }
          if (fileData.id) setSelectedFileId(fileData.id);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
