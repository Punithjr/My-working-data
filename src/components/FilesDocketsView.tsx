import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MasterDocketFile, DepartmentSection, LetterPriority, EducationLetter, DocumentAttachment } from '../types';
import QRCode from 'qrcode';
import { 
  FolderGit2, 
  Plus, 
  Send, 
  Clock, 
  User, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Filter,
  Layers,
  X,
  Award,
  FileCheck2,
  Image as ImageIcon,
  ExternalLink,
  Paperclip,
  Sparkles,
  UploadCloud,
  Calendar,
  AlertTriangle,
  FileStack,
  Camera,
  QrCode,
  Zap,
  Printer,
  Download,
  Check,
  RefreshCw,
  HelpCircle,
  CheckSquare,
  Square,
  ListFilter,
  ChevronDown,
  FileDown,
  FolderLock,
  HardDrive
} from 'lucide-react';
import { MergeAttachmentsModal } from './MergeAttachmentsModal';
import { CaptureDocumentModal } from './CaptureDocumentModal';
import { FileClosureModal } from './FileClosureModal';
import { queueOfflineAction, registerOnlineSyncHandler } from '../utils/offlineSync';
import { formatDateDDMMYYYY, getCurrentDateDDMMYYYY } from '../utils/formatDate';
import { exportBatchDocketsIndexedPdf, printOrExportBatchSummaryPdf } from '../utils/docketBatchPdfExport';
import { generateDocketDossierSummaryPdf } from '../utils/docketDossierPdfExport';

export interface DocketSlaInfo {
  isOverdue: boolean;
  statusText: string;
  progressPercent: number;
  colorClass: 'emerald' | 'amber' | 'rose';
  timeLabel: string;
  daysRemaining: number;
}

export const computeDocketSla = (file: MasterDocketFile): DocketSlaInfo => {
  if (file.status === 'Disposed / Closed') {
    return {
      isOverdue: false,
      statusText: 'Disposed',
      progressPercent: 100,
      colorClass: 'emerald',
      timeLabel: 'ವಿಲೇಯಾಗಿದೆ (Closed)',
      daysRemaining: 0,
    };
  }

  const now = Date.now();
  if (file.dueDate) {
    const dueTime = new Date(file.dueDate).getTime();
    if (!isNaN(dueTime)) {
      const startTime = file.initiatedDate 
        ? new Date(file.initiatedDate).getTime() 
        : (dueTime - 14 * 24 * 3600 * 1000);
      const totalDuration = Math.max(24 * 3600 * 1000, dueTime - startTime);
      const elapsed = now - startTime;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      if (now > dueTime) {
        const daysOverdue = Math.max(1, Math.ceil((now - dueTime) / (24 * 3600 * 1000)));
        return {
          isOverdue: true,
          statusText: 'Overdue',
          progressPercent: 100,
          colorClass: 'rose',
          timeLabel: `${daysOverdue} ದಿನಗಳ ಗಡುವು ಮೀರಿದೆ (${daysOverdue}d Overdue)`,
          daysRemaining: -daysOverdue,
        };
      }

      const diffHours = (dueTime - now) / (3600 * 1000);
      const daysLeft = Math.ceil(diffHours / 24);

      if (diffHours <= 48 || progressPercent >= 75) {
        return {
          isOverdue: false,
          statusText: 'Near Expiry',
          progressPercent: Math.max(12, progressPercent),
          colorClass: 'amber',
          timeLabel: diffHours <= 24 
            ? `${Math.max(1, Math.round(diffHours))} ಗಂಟೆ ಬಾಕಿ (${Math.max(1, Math.round(diffHours))}h left)`
            : `${daysLeft} ದಿನ ಬಾಕಿ (Near Expiry)`,
          daysRemaining: daysLeft,
        };
      }

      return {
        isOverdue: false,
        statusText: 'On Track',
        progressPercent: Math.max(8, progressPercent),
        colorClass: 'emerald',
        timeLabel: `${daysLeft} ದಿನ ಬಾಕಿ (On Track)`,
        daysRemaining: daysLeft,
      };
    }
  }

  return {
    isOverdue: false,
    statusText: 'Routine',
    progressPercent: 35,
    colorClass: 'emerald',
    timeLabel: 'ನಿಯಮಿತ ಅವಧಿ (Routine SLA)',
    daysRemaining: 7,
  };
};

interface FilesDocketsViewProps {
  files: MasterDocketFile[];
  letters: EducationLetter[];
  onCreateFile: (fileData: Partial<MasterDocketFile>) => Promise<void>;
  onMoveFile: (fileId: string, fromOfficer: string, toOfficer: string, remarks: string, newStatus?: string) => Promise<void>;
  onUpdateFileCategory?: (fileId: string, category: string) => Promise<void>;
  onBulkUpdateStatus?: (fileIds: string[], newStatus: string) => Promise<void>;
  onSelectLetter: (letter: EducationLetter) => void;
  onOpenServiceSanctions?: () => void;
  onOpenNewRtiFile?: () => void;
  onOpenRtiReply?: (file: MasterDocketFile) => void;
  onViewAttachment?: (attachment: DocumentAttachment) => void;
  onUploadAttachmentToFile?: (fileId: string, attachment: DocumentAttachment) => Promise<void>;
  onOpenPdfScanner?: () => void;
  onSectionTransfer?: (fileId: string, toSection: DepartmentSection, transferNote: string, initiatingOfficer: string) => Promise<void>;
  onDraftLetterForFile?: (file: MasterDocketFile) => void;
  onCloseFileSuccess?: (file: MasterDocketFile) => void;
  currentUser?: any;
  initialFilter?: { status?: string; priority?: 'all' | 'urgent' | 'normal' | 'dueSoon' | 'pending'; fileId?: string };
}

export interface FileCategoryMeta {
  id: string;
  code: string;
  labelKn: string;
  labelEn: string;
  badgeClass: string;
  iconBg: string;
  description: string;
}

export const FILE_CATEGORIES: FileCategoryMeta[] = [
  {
    id: 'ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ ಕಡತ (Administration & Personnel)',
    code: 'admin',
    labelKn: 'ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ',
    labelEn: 'Administration & Personnel',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    iconBg: 'bg-blue-600',
    description: 'ನೇಮಕಾತಿ, ಸೇವಾ ನಿಯಮಗಳು, ದೃಢೀಕರಣ ಮತ್ತು ವರ್ಗಾವಣೆ ಕಡತಗಳು'
  },
  {
    id: 'ವೇತನ & ಭತ್ಯೆ ಕಡತ (Salary & Increments)',
    code: 'salary',
    labelKn: 'ವೇತನ & ಬಡ್ತಿ',
    labelEn: 'Salary & Increments',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconBg: 'bg-emerald-600',
    description: 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (ಪ್ರಪತ್ರ-28), ವೇತನ ನಿಗದಿ, ಏರಿಯರ್ಸ್ ಹಾಗೂ ಭತ್ಯೆಗಳು'
  },
  {
    id: 'ಶೈಕ್ಷಣಿಕ & ಪರೀಕ್ಷಾ ಕಡತ (Academic & Exams)',
    code: 'academic',
    labelKn: 'ಶೈಕ್ಷಣಿಕ & ಪರೀಕ್ಷೆ',
    labelEn: 'Academic & Exams',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    iconBg: 'bg-purple-600',
    description: 'ಪಠ್ಯಕ್ರಮ, ಎಸ್‌ಎಸ್‌ಎಲ್‌ಸಿ ಪರೀಕ್ಷೆ, ತರಬೇತಿ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಕಾರ್ಯಕ್ರಮಗಳು'
  },
  {
    id: 'ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ ಕಡತ (Accounts & Grants)',
    code: 'accounts',
    labelKn: 'ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ',
    labelEn: 'Accounts & Grants',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    iconBg: 'bg-amber-600',
    description: 'ಶಾಲಾ ಅನುದಾನ, ಬಜೆಟ್ ವೆಚ್ಚ, ಖಜಾನೆ ಬಿಲ್‌ಗಳು ಹಾಗೂ ಲೆಕ್ಕಪರಿಶೋಧನೆ'
  },
  {
    id: 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)',
    code: 'rti',
    labelKn: 'ಮಾಹಿತಿ ಹಕ್ಕು (RTI)',
    labelEn: 'RTI & Legal',
    badgeClass: 'bg-amber-200 text-stone-950 border-amber-400 font-bold',
    iconBg: 'bg-amber-500',
    description: 'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಅರ್ಜಿಗಳು, ಕಾಲಮಿತಿ ಉತ್ತರ ಹಾಗೂ ನ್ಯಾಯಾಲಯ ಪ್ರಕರಣಗಳು'
  },
  {
    id: 'ಶಾಲಾ ತಪಾಸಣೆ & ಗುಣಮಟ್ಟ ಕಡತ (Inspection & Quality)',
    code: 'inspection',
    labelKn: 'ಶಾಲಾ ತಪಾಸಣೆ',
    labelEn: 'Inspection & Quality',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    iconBg: 'bg-teal-600',
    description: 'ಶಾಲಾ ಮಾನ್ಯತೆ, ಕಟ್ಟಡ ಸುರಕ್ಷತೆ, ಗುಣಮಟ್ಟ ಪರಿವೀಕ್ಷಣೆ ಹಾಗೂ ಶಿಸ್ತು ತಪಾಸಣೆ'
  },
  {
    id: 'ಇತರೆ ಸಾಮಾನ್ಯ ಕಡತ (General File)',
    code: 'general',
    labelKn: 'ಇತರೆ ಸಾಮಾನ್ಯ',
    labelEn: 'General Files',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    iconBg: 'bg-stone-500',
    description: 'ಸರ್ಕಾರಿ ಆದೇಶಗಳು, ಸುತ್ತೋಲೆಗಳು ಹಾಗೂ ದಿನನಿತ್ಯದ ಕಛೇರಿ ಪತ್ರವ್ಯವಹಾರಗಳು'
  }
];

export const getFileCategoryMeta = (file: MasterDocketFile): FileCategoryMeta => {
  if (file.isRtiFile || file.section === 'Legal & Grievances') {
    return FILE_CATEGORIES.find(c => c.code === 'rti')!;
  }
  if (file.fileCategory) {
    const match = FILE_CATEGORIES.find(c => c.id === file.fileCategory || c.labelKn === file.fileCategory || c.code === file.fileCategory);
    if (match) return match;
  }
  if (file.section === 'Academic Wing' || file.subject?.includes('STEM') || file.subject?.includes('ಪರೀಕ್ಷೆ')) {
    return FILE_CATEGORIES.find(c => c.code === 'academic')!;
  }
  if (file.section === 'Accounts & Grants' || file.subject?.includes('ಅನುದಾನ') || file.subject?.includes('ಲೆಕ್ಕ')) {
    return FILE_CATEGORIES.find(c => c.code === 'accounts')!;
  }
  if (file.section === 'Inspection & Quality' || file.subject?.includes('ತಪಾಸಣೆ')) {
    return FILE_CATEGORIES.find(c => c.code === 'inspection')!;
  }
  if (file.subject?.includes('ವೇತನ') || file.subject?.includes('ಬಡ್ತಿ')) {
    return FILE_CATEGORIES.find(c => c.code === 'salary')!;
  }
  if (file.section === 'Administration & Services') {
    return FILE_CATEGORIES.find(c => c.code === 'admin')!;
  }
  return FILE_CATEGORIES.find(c => c.code === 'general')!;
};

export const FilesDocketsView: React.FC<FilesDocketsViewProps> = ({
  files,
  letters,
  onCreateFile,
  onMoveFile,
  onUpdateFileCategory,
  onSelectLetter,
  onOpenServiceSanctions,
  onOpenNewRtiFile,
  onOpenRtiReply,
  onViewAttachment,
  onUploadAttachmentToFile,
  onOpenPdfScanner,
  onSectionTransfer,
  onBulkUpdateStatus,
  onDraftLetterForFile,
  onCloseFileSuccess,
  currentUser,
  initialFilter,
}) => {
  // Batch docket selection & multi-action states
  const [selectedDocketIds, setSelectedDocketIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [isPrintingBatchSummary, setIsPrintingBatchSummary] = useState(false);
  const [bulkStatusMenuOpen, setBulkStatusMenuOpen] = useState(false);
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);

  // File closure modal state & NT storage inspect state
  const [closingFile, setClosingFile] = useState<MasterDocketFile | null>(null);
  const [showStorageInspect, setShowStorageInspect] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<MasterDocketFile | null>(() => {
    if (initialFilter?.fileId) {
      const match = files.find(f => f.id === initialFilter.fileId || f.fileNumber === initialFilter.fileId);
      if (match) return match;
    }
    return files[0] || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter?.status || 'all');
  const [activeCategoryCode, setActiveCategoryCode] = useState<string>('all');

  // Dynamically react to initialFilter changes from parent or HomeDashboard navigation
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.fileId) {
        const match = files.find(f => f.id === initialFilter.fileId || f.fileNumber === initialFilter.fileId);
        if (match) {
          setSelectedFile(match);
          setActiveCategoryCode('all');
          setSelectedSection('all');
        }
      }
      if (initialFilter.status) {
        setSelectedStatus(initialFilter.status);
      }
      if (initialFilter.priority) {
        setPriorityFilter(initialFilter.priority);
      }
    }
  }, [initialFilter, files]);

  // Real-time keyword search ref & keyboard shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // QR Code Generation Modal state
  const [qrModalFile, setQrModalFile] = useState<MasterDocketFile | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string>('');

  // Quick Scan QR Modal state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const videoScannerRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Recent 24 Hours Activity Count
  const recentActivityCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return files.filter(f => {
      if (f.lastMovedDate && new Date(f.lastMovedDate).getTime() > cutoff) return true;
      if (f.updatedAt && new Date(f.updatedAt).getTime() > cutoff) return true;
      if (f.movementTrail && f.movementTrail.some(m => new Date(m.timestamp).getTime() > cutoff)) return true;
      return false;
    }).length;
  }, [files]);

  // Global Cmd+K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler to generate QR Code for active file
  const handleGenerateQrCode = async (file: MasterDocketFile) => {
    try {
      const qrData = file.fileNumber || file.id;
      const url = await QRCode.toDataURL(qrData, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      });
      setQrModalFile(file);
      setQrModalDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  // Handler to open Quick QR Scanner
  const handleOpenQrScanner = async () => {
    setIsQrScannerOpen(true);
    setScanMessage(null);
    setScannedCodeInput('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        } catch (firstErr: any) {
          if (firstErr?.name === 'NotAllowedError' || firstErr?.name === 'PermissionDeniedError') {
            throw firstErr;
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
        setCameraStream(stream);
        if (videoScannerRef.current) {
          videoScannerRef.current.srcObject = stream;
        }
      }
    } catch (err: any) {
      console.warn('QR camera stream unavailable:', err?.message || err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setScanMessage(
        isDenied
          ? 'ಕ್ಯಾಮರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಕಡತ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Manual File Number Search).'
          : 'ಕ್ಯಾಮರಾ ಲೈವ್ ಸ್ಟ್ರೀಮ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಕಡತ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.'
      );
    }
  };

  const handleCloseQrScanner = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsQrScannerOpen(false);
  };

  const handleApplyScannedCode = (code: string) => {
    const cleanCode = code.trim().toLowerCase();
    if (!cleanCode) return;
    const match = files.find(f => 
      f.fileNumber.toLowerCase() === cleanCode || 
      f.id.toLowerCase() === cleanCode ||
      f.fileNumber.toLowerCase().includes(cleanCode) ||
      cleanCode.includes(f.fileNumber.toLowerCase())
    );
    if (match) {
      setSelectedFile(match);
      setSearchQuery(match.fileNumber);
      handleCloseQrScanner();
    } else {
      setScanMessage(`"${code}" ಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಕಡತ ಪತ್ತೆಯಾಗಿಲ್ಲ. ಕಡತ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ.`);
    }
  };

  // Move modal state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [toOfficer, setToOfficer] = useState('');
  const [movementRemarks, setMovementRemarks] = useState('');
  const [newFileStatus, setNewFileStatus] = useState('Under Scrutiny');
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  // New file modal state
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newSection, setNewSection] = useState<DepartmentSection>('Academic Wing');
  const [newCategory, setNewCategory] = useState<string>(FILE_CATEGORIES[0].id);
  const [newCustodian, setNewCustodian] = useState('Director of School Education');
  const [newPriority, setNewPriority] = useState<LetterPriority>('Routine');
  const [newNotes, setNewNotes] = useState('');

  // Category changer loading state
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  // Local uploading attachment state
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<DocumentAttachment | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'normal' | 'dueSoon' | 'pending'>(initialFilter?.priority || 'all');

  const filteredFiles = files.filter(f => {
    const meta = getFileCategoryMeta(f);
    if (activeCategoryCode !== 'all' && meta.code !== activeCategoryCode) {
      return false;
    }
    if (selectedSection !== 'all' && f.section !== selectedSection) return false;
    
    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'pending_all') {
        const isPending = f.status !== 'Disposed / Closed' && (
          f.status === 'Pending Higher Approval' ||
          f.status === 'Under Scrutiny' ||
          f.status === 'Under Review' ||
          f.status === 'In-Transit' ||
          f.status.toLowerCase().includes('pending')
        );
        if (!isPending) return false;
      } else if (f.status !== selectedStatus) {
        return false;
      }
    }
    
    // Priority filter (Urgent / Normal / Due Soon / Pending)
    if (priorityFilter === 'urgent') {
      if (f.priority !== 'Urgent' && f.priority !== 'Immediate') return false;
    } else if (priorityFilter === 'normal') {
      if (f.priority === 'Urgent' || f.priority === 'Immediate') return false;
    } else if (priorityFilter === 'dueSoon') {
      const today = new Date();
      const targetDate = f.dueDate ? new Date(f.dueDate) : (f.initiatedDate ? new Date(new Date(f.initiatedDate).getTime() + 7 * 24 * 3600 * 1000) : null);
      if (!targetDate || isNaN(targetDate.getTime())) return false;
      const diffHours = (targetDate.getTime() - today.getTime()) / (1000 * 3600);
      if (diffHours > 48) return false;
    } else if (priorityFilter === 'pending') {
      const isPending = f.status !== 'Disposed / Closed' && (
        f.status === 'Pending Higher Approval' ||
        f.status === 'Under Scrutiny' ||
        f.status === 'Under Review' ||
        f.status === 'In-Transit' ||
        f.status.toLowerCase().includes('pending')
      );
      if (!isPending) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRti = f.rtiDetails?.applicantName?.toLowerCase().includes(q) ||
                       f.rtiDetails?.applicationNumber?.toLowerCase().includes(q) ||
                       f.rtiDetails?.informationSought?.toLowerCase().includes(q);
      return (
        f.fileNumber.toLowerCase().includes(q) ||
        f.subject.toLowerCase().includes(q) ||
        f.currentCustodian.toLowerCase().includes(q) ||
        f.section.toLowerCase().includes(q) ||
        meta.labelKn.toLowerCase().includes(q) ||
        meta.labelEn.toLowerCase().includes(q) ||
        matchRti
      );
    }
    return true;
  });

  // Keep activeFile synchronized with parent files updates
  const currentSelectedFile = selectedFile 
    ? (files.find(f => f.id === selectedFile.id) || selectedFile) 
    : null;
  const activeFile = (currentSelectedFile && filteredFiles.some(f => f.id === currentSelectedFile.id))
    ? currentSelectedFile 
    : (filteredFiles[0] || currentSelectedFile || null);

  // Consolidated unique list of attachments for the active docket file
  const activeFileDocs: DocumentAttachment[] = activeFile
    ? [
        ...(activeFile.rtiDetails?.uploadedDocs || []),
        ...(activeFile.attachments || []),
      ].filter((v, i, a) => a.findIndex(t => (t.id && t.id === v.id) || t.fileName === v.fileName) === i)
    : [];

  // Letters linked to this file
  const linkedLetters = letters.filter(l => 
    l.fileNumber === activeFile?.fileNumber || activeFile?.linkedLetterIds.includes(l.id)
  );

  // Batch selection and multi-docket administrative actions
  const toggleSelectDocket = (fileId: string) => {
    setSelectedDocketIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedDocketIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedDocketIds(new Set());
    } else {
      setSelectedDocketIds(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocketIds(new Set());
    setBulkStatusMenuOpen(false);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedDocketIds);
    if (ids.length === 0) return;

    try {
      setIsBulkUpdating(true);
      if (onBulkUpdateStatus) {
        await onBulkUpdateStatus(ids, newStatus);
      } else {
        // Fallback: update sequentially
        for (const id of ids) {
          const f = files.find(item => item.id === id);
          if (f) {
            await onMoveFile(id, f.currentCustodian, f.currentCustodian, `Bulk status updated to ${newStatus}`, newStatus);
          }
        }
      }
      setBatchActionNotice(`${ids.length} ಕಡತಗಳ ಸ್ಥಿತಿಯನ್ನು '${newStatus}' ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.`);
      setTimeout(() => setBatchActionNotice(null), 4000);
      setSelectedDocketIds(new Set());
      setBulkStatusMenuOpen(false);
    } catch (err: any) {
      setBatchActionNotice(`ಸ್ಥಿತಿ ಬದಲಾವಣೆ ವಿಫಲವಾಗಿದೆ: ${err?.message || 'ದೋಷ'}`);
      setTimeout(() => setBatchActionNotice(null), 4000);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExportSelectedBatchPdf = () => {
    const selected = files.filter(f => selectedDocketIds.has(f.id));
    if (selected.length === 0) return;
    try {
      setIsExportingBatch(true);
      exportBatchDocketsIndexedPdf(selected, {
        filterLabel: `Category: ${activeCategoryCode}, Priority: ${priorityFilter}`,
      });
      setBatchActionNotice(`${selected.length} ಕಡತಗಳ ಸೂಚ್ಯಂಕಿತ ಸಮಗ್ರ PDF ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.`);
      setTimeout(() => setBatchActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setBatchActionNotice('PDF ವರದಿ ತಯಾರಿಕೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      setTimeout(() => setBatchActionNotice(null), 4000);
    } finally {
      setIsExportingBatch(false);
    }
  };

  const handlePrintBatchSummary = () => {
    try {
      setIsPrintingBatchSummary(true);
      printOrExportBatchSummaryPdf(filteredFiles, {
        category: activeCategoryCode,
        priority: priorityFilter,
        section: selectedSection,
        status: selectedStatus,
        search: searchQuery,
      });
      setBatchActionNotice(`ಪ್ರದರ್ಶಿಸಲಾದ ${filteredFiles.length} ಕಡತಗಳ ಮುದ್ರಣ ಸಾರಾಂಶ PDF (Single-page summary) ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.`);
      setTimeout(() => setBatchActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setBatchActionNotice('ಸಾರಾಂಶ PDF ತಯಾರಿಕೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
      setTimeout(() => setBatchActionNotice(null), 4000);
    } finally {
      setIsPrintingBatchSummary(false);
    }
  };

  const handleRouteFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !toOfficer.trim()) return;
    try {
      setIsSubmittingMove(true);
      await onMoveFile(
        activeFile.id,
        activeFile.currentCustodian,
        toOfficer,
        movementRemarks,
        newFileStatus
      );
      setIsMoveModalOpen(false);
      setToOfficer('');
      setMovementRemarks('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleCreateNewFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await onCreateFile({
        subject: newSubject,
        section: newSection,
        fileCategory: newCategory,
        currentCustodian: newCustodian,
        priority: newPriority,
        notes: newNotes,
      });
      setIsNewFileModalOpen(false);
      setNewSubject('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryChange = async (newCat: string) => {
    if (!activeFile || !onUpdateFileCategory) return;
    setIsChangingCategory(true);
    try {
      await onUpdateFileCategory(activeFile.id, newCat);
      activeFile.fileCategory = newCat;
    } catch (err) {
      console.error('Failed to change file category:', err);
    } finally {
      setIsChangingCategory(false);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0 || !activeFile) return;

    setIsUploadingAttachment(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file: File = uploadedFiles[i];
        const reader = new FileReader();
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        await new Promise<void>((resolve) => {
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            const newAtt: DocumentAttachment = {
              id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              fileName: file.name,
              fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
              pageCount: isPdf ? 1 : undefined,
              uploadedAt: new Date().toISOString().split('T')[0],
              description: isPdf ? 'ಅಧಿಕೃತ ಕಡತ ದಾಖಲೆ ಪ್ರತಿ (PDF)' : 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ದಾಖಲೆ ಪ್ರತಿ (JPG)',
              dataUrl,
            };

            if (onUploadAttachmentToFile) {
              await onUploadAttachmentToFile(activeFile.id, newAtt);
            } else {
              // Local fallback
              if (!activeFile.attachments) activeFile.attachments = [];
              activeFile.attachments.push(newAtt);
              if (activeFile.rtiDetails) {
                if (!activeFile.rtiDetails.uploadedDocs) activeFile.rtiDetails.uploadedDocs = [];
                activeFile.rtiDetails.uploadedDocs.push(newAtt);
              }
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      console.error('Error uploading file attachment:', err);
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = '';
    }
  };

  return (
    <div id="files-dockets-tracking-view" className="space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              Department Master File Tracking System (FTS)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Maintain digital file dockets, physical movement records, officer custody handovers, and case histories.
          </p>

          {/* Recent Activity Count Badge */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-900 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
              <span>ಇತ್ತೀಚಿನ ಚಲನವಲನ (Recent Activity): <strong>{recentActivityCount} ಕಡತಗಳು</strong> (24h)</span>
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              ಒಟ್ಟು: {files.length}
            </span>
          </div>
        </div>

        {/* Real-time Keyword Search Input with Cmd+K */}
        <div className="flex-1 max-w-md mx-0 xl:mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ವಿಷಯ / ಕಡತ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Search)..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-stone-800"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-stone-500 bg-white border border-stone-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Print Batch Summary Button */}
          <button
            id="btn-fts-header-print-batch-summary"
            type="button"
            onClick={handlePrintBatchSummary}
            disabled={isPrintingBatchSummary || filteredFiles.length === 0}
            className="px-3.5 py-2 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs border border-sky-300 cursor-pointer disabled:opacity-50"
            title="ಪ್ರಸ್ತುತ ಪ್ರದರ್ಶಿಸಲಾದ ಕಡತಗಳ ಏಕ-ಪುಟ ಮುದ್ರಣ ಸಾರಾಂಶ PDF (Printable Single-page Batch Summary with SLA breakdown)"
          >
            <Printer className="w-4 h-4 text-sky-800" />
            <span>{isPrintingBatchSummary ? 'ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...' : 'Print Batch Summary'}</span>
          </button>

          {/* Quick Scan QR button */}
          <button
            id="btn-fts-header-scan-qr"
            type="button"
            onClick={handleOpenQrScanner}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-emerald-900 cursor-pointer"
            title="ಭೌತಿಕ ಕಡತದ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (Quick Scan QR)"
          >
            <QrCode className="w-4 h-4 text-emerald-200" />
            <span>Quick Scan QR</span>
          </button>

          {onOpenNewRtiFile && (
            <button
              id="btn-fts-new-rti-file"
              onClick={onOpenNewRtiFile}
              className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-amber-500/60"
              title="ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸೃಜಿಸಿ (PDF/JPG ಅಪ್‌ಲೋಡ್)"
            >
              <FileCheck2 className="w-4 h-4 text-amber-950" />
              <span>+ RTI File</span>
            </button>
          )}

          {onOpenServiceSanctions && (
            <button
              id="btn-fts-service-sanction"
              onClick={onOpenServiceSanctions}
              className="px-3 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-amber-300"
            >
              <Award className="w-3.5 h-3.5 text-stone-950" />
              <span>ರಜೆ/ಬಡ್ತಿ</span>
            </button>
          )}

          {onOpenPdfScanner && (
            <button
              id="btn-fts-header-pdf-scanner"
              type="button"
              onClick={onOpenPdfScanner}
              className="px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-emerald-900 cursor-pointer"
              title="ಪೂರ್ಣ ಪ್ರಮಾಣದ ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್ (HD Camera Scan, Perspective Warp & Multi-Page PDF)"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>PDF ಸ್ಕ್ಯಾನರ್</span>
            </button>
          )}

          {activeFile && (
            <button
              id="btn-fts-header-capture-doc"
              type="button"
              onClick={() => setIsCaptureModalOpen(true)}
              className="px-3 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-indigo-900 cursor-pointer"
              title="ಸಾಧನದ ಕ್ಯಾಮೆರಾದಿಂದ ಕಾಗದ ದಾಖಲೆಯ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>ದಾಖಲೆ ಸೆರೆಹಿಡಿ</span>
            </button>
          )}

          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Docket</span>
          </button>
        </div>
      </div>

      {/* Small Help-Text & Navigation Legend Bar */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-stone-700 shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="font-bold text-stone-900 flex items-center gap-1.5 shrink-0">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>ಮಾರ್ಗದರ್ಶಿ (Quick Navigation & QR Guide):</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-stone-600">
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span><strong>ಕೀವರ್ಡ್ ಹುಡುಕಾಟ (⌘K):</strong> ಕಡತ ಸಂಖ್ಯೆ ಅಥವಾ ವಿಷಯ ನಮೂದಿಸಿ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಫಿಲ್ಟರ್ ಮಾಡಿ.</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-stone-600">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span><strong>QR ಸ್ಕ್ಯಾನ್:</strong> ಭೌತಿಕ ಕಡತದ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನೇರವಾಗಿ ಕಡತದ ಸಂಪೂರ್ಣ ವಿವರಕ್ಕೆ ತೆರಳಿ.</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-amber-200/60">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>ಸಕಾಲ (On Track)</span>
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>ಮುಕ್ತಾಯ ಸಮೀಪಿಸಿದೆ (Near Expiry)</span>
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-ping"></span>
            <span>ಗಡುವು ಮೀರಿದೆ (Priority Overdue)</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Files List, Right File Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Files List & Filters */}
        <div className="lg:col-span-5 space-y-3">
          {/* File Category Switcher: All & Standardized Categories */}
          <div className="bg-white rounded-xl p-2.5 border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>ಕಡತಗಳ ವರ್ಗೀಕರಣ (File Categories)</span>
              </span>
              <span className="text-[10px] text-stone-600">
                ಒಟ್ಟು ಕಡತಗಳು: {files.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveCategoryCode('all')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeCategoryCode === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ಎಲ್ಲಾ ({files.length})
              </button>
              {FILE_CATEGORIES.map(cat => {
                const count = files.filter(f => getFileCategoryMeta(f).code === cat.code).length;
                const isActive = activeCategoryCode === cat.code;
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setActiveCategoryCode(cat.code)}
                    className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : `${cat.badgeClass} hover:opacity-90`
                    }`}
                    title={cat.description}
                  >
                    <span>{cat.labelKn}</span>
                    <span className="ml-1.5 text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Docket #, Subject, Category, Custodian..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {/* Keyword-based Quick Filter Chips */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                ತ್ವರಿತ ಫಿಲ್ಟರ್ (Quick Filters):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPriorityFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                    priorityFilter === 'all'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  ಎಲ್ಲಾ ({files.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter('urgent')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    priorityFilter === 'urgent'
                      ? 'bg-rose-700 text-white border-rose-900 shadow-2xs'
                      : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <span>🔴 ತುರ್ತು (Urgent)</span>
                  <span className="text-[10px] opacity-80">
                    ({files.filter(f => f.priority === 'Urgent' || f.priority === 'Immediate').length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter('normal')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    priorityFilter === 'normal'
                      ? 'bg-sky-700 text-white border-sky-900 shadow-2xs'
                      : 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  <span>🔵 ಸಾಮಾನ್ಯ (Normal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter('pending')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    priorityFilter === 'pending'
                      ? 'bg-amber-600 text-white border-amber-800 shadow-2xs'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="ಪರಿಶೀಲನೆ ಮತ್ತು ಅನುಮೋದನೆ ಬಾಕಿ ಇರುವ ಕಡತಗಳು (Pending / In-Review Dockets)"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>⏳ ಬಾಕಿ (Pending)</span>
                  <span className="text-[10px] opacity-80">
                    ({files.filter(f => f.status !== 'Disposed / Closed' && (f.status.includes('Pending') || f.status.includes('Scrutiny') || f.status.includes('Review'))).length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter('dueSoon')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    priorityFilter === 'dueSoon'
                      ? 'bg-amber-500 text-stone-950 border-amber-700 shadow-2xs font-black'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಗಡುವು ಮೀರಲಿರುವ ಕಡತಗಳು"
                >
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>⏳ Due Soon (&lt; 48h)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
              >
                <option value="all">All Sections (ಎಲ್ಲಾ ವಿಭಾಗ)</option>
                <option value="Academic Wing">Academic Wing (ಶೈಕ್ಷಣಿಕ)</option>
                <option value="Administration & Services">Administration (ಆಡಳಿತ)</option>
                <option value="Accounts & Grants">Accounts & Grants (ಲೆಕ್ಕಪತ್ರ)</option>
                <option value="Inspection & Quality">Inspection (ತಪಾಸಣೆ)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
              >
                <option value="all">All Statuses (ಎಲ್ಲಾ ಸ್ಥಿತಿ)</option>
                <option value="pending_all">⏳ ಬಾಕಿ / ಪರಿಶೀಲನೆ (Pending / Under Review)</option>
                <option value="Active / Open">Active / Open</option>
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Pending Higher Approval">Pending Approval</option>
                <option value="Disposed / Closed">Disposed / Closed</option>
              </select>
            </div>
          </div>

          {/* Batch Actions & Bulk Status Bar */}
          <div className="bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-2xs space-y-2">
            {batchActionNotice && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center justify-between">
                <span>{batchActionNotice}</span>
                <button type="button" onClick={() => setBatchActionNotice(null)} className="text-emerald-700 hover:text-emerald-950">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="ಎಲ್ಲಾ ಕಡತಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select All)"
                >
                  {selectedDocketIds.size > 0 && selectedDocketIds.size === filteredFiles.length ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                  <span>ಎಲ್ಲಾ ({filteredFiles.length})</span>
                </button>

                {selectedDocketIds.size > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {selectedDocketIds.size} ಆಯ್ಕೆಯಾಗಿದೆ
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Bulk Status Update Dropdown Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBulkStatusMenuOpen(prev => !prev)}
                    disabled={selectedDocketIds.size === 0 || isBulkUpdating}
                    className="px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    title="ಆಯ್ಕೆಮಾಡಿದ ಕಡತಗಳ ಸ್ಥಿತಿಯನ್ನು ಒಟ್ಟಿಗೆ ನವೀಕರಿಸಿ (Bulk Status Update)"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>{isBulkUpdating ? 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Bulk Status Update'}</span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {/* Dropdown Options */}
                  {bulkStatusMenuOpen && selectedDocketIds.size > 0 && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-stone-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2.5 py-1.5 border-b border-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        {selectedDocketIds.size} ಕಡತಗಳ ಹೊಸ ಸ್ಥಿತಿ ಆಯ್ಕೆಮಾಡಿ:
                      </div>
                      <div className="py-1 space-y-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange('Active / Open')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>ಸಕ್ರಿಯ (Active / Open)</span>
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange('Under Scrutiny')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Under Scrutiny)</span>
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange('Pending Higher Approval')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>ಅನುಮೋದನೆಗೆ ಬಾಕಿ (Pending Approval)</span>
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange('Disposed / Closed')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-emerald-900 font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span>ವಿಲೇಯಾಗಿದೆ (Completed / Disposed)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Selected Batch as Table-Indexed PDF Report Button */}
                <button
                  type="button"
                  onClick={handleExportSelectedBatchPdf}
                  disabled={selectedDocketIds.size === 0 || isExportingBatch}
                  className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  title="ಆಯ್ಕೆಮಾಡಿದ ಕಡತಗಳ ಸಮಗ್ರ ಸೂಚಿ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್ (Export Table-Indexed Batch PDF)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingBatch ? 'ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...' : `Export Batch PDF (${selectedDocketIds.size})`}</span>
                </button>

                {selectedDocketIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                    title="ಆಯ್ಕೆ ರದ್ದುಗೊಳಿಸಿ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2">
            {filteredFiles.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-xs">
                ಈ ಕ್ಯಾಟಗರಿಯಲ್ಲಿ ಯಾವುದೇ ಕಡತಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
              </div>
            ) : (
              filteredFiles.map(file => {
                const isSelected = activeFile?.id === file.id;
                const isDocketChecked = selectedDocketIds.has(file.id);
                const meta = getFileCategoryMeta(file);
                const sla = computeDocketSla(file);

                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                      const panel = document.getElementById('active-docket-dossier-panel');
                      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      sla.isOverdue
                        ? isSelected
                          ? 'bg-stone-900 text-white animate-overdue-pulse ring-2 ring-rose-500 shadow-md'
                          : 'bg-rose-50/50 hover:bg-rose-50 text-stone-900 animate-overdue-pulse shadow-xs'
                        : isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Checkbox for Batch Selection */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectDocket(file.id);
                          }}
                          className={`mt-0.5 p-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                            isDocketChecked
                              ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                              : isSelected
                              ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                          title={isDocketChecked ? 'ಆಯ್ಕೆ ರದ್ದುಗೊಳಿಸಿ' : 'ಬ್ಯಾಚ್ ಕ್ರಿಯೆಗೆ ಆಯ್ಕೆಮಾಡಿ'}
                        >
                          {isDocketChecked ? (
                            <CheckSquare className="w-4 h-4 fill-amber-400 text-stone-950" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="min-w-0 space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-amber-400' : 'text-stone-900'}`}>
                              {file.fileNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isSelected ? 'bg-stone-800 text-amber-300 border-stone-700' : meta.badgeClass}`}>
                              {meta.labelKn}
                            </span>

                            {/* Overdue Flashing Visual Indicator */}
                            {sla.isOverdue && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse flex items-center gap-1 font-mono uppercase tracking-wider">
                                <AlertTriangle className="w-3 h-3 text-white" />
                                <span>OVERDUE</span>
                              </span>
                            )}

                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              file.priority === 'Urgent' || file.priority === 'Immediate'
                                ? 'bg-rose-100 text-rose-900 border-rose-300 font-mono'
                                : 'bg-sky-100 text-sky-900 border-sky-300 font-mono'
                            }`}>
                              {file.priority === 'Urgent' || file.priority === 'Immediate' ? '🔴 URGENT' : '🔵 NORMAL'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xs leading-snug line-clamp-2">
                            {file.subject}
                          </h4>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                    </div>

                    {/* Visual SLA Progress Bar with Custom Hover-Triggered Tooltip */}
                    <div className={`mt-2.5 pt-2 border-t relative group/sla ${isSelected ? 'border-stone-800' : 'border-stone-100'}`}>
                      {/* Floating Tooltip displaying deadline date and days remaining/overdue */}
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-stone-950/95 backdrop-blur-md text-white text-xs rounded-xl shadow-2xl border border-stone-700/80 pointer-events-none opacity-0 group-hover/sla:opacity-100 transition-all duration-200 z-50 transform -translate-y-1 group-hover/sla:translate-y-0 space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                          <span className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>SLA ಕಡತ ಗಡುವು ವಿವರ</span>
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            sla.isOverdue
                              ? 'bg-rose-900 text-rose-200 border border-rose-700'
                              : sla.colorClass === 'amber'
                              ? 'bg-amber-900 text-amber-200 border border-amber-700'
                              : 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                          }`}>
                            {sla.statusText}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-stone-400">ನಿಗದಿತ ಗಡುವು ದಿನಾಂಕ:</span>
                            <span className="font-mono font-bold text-amber-200">
                              {file.dueDate ? formatDateDDMMYYYY(file.dueDate) : '14 ದಿನಗಳ ಮಾನದಂಡ'}
                            </span>
                          </div>

                          <div className="flex justify-between items-start">
                            <span className="text-stone-400">ಬಾಕಿ / ಮೀರಿದ ಅವಧಿ:</span>
                            <span className={`font-bold text-right ${
                              sla.isOverdue
                                ? 'text-rose-400'
                                : sla.colorClass === 'amber'
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                            }`}>
                              {sla.isOverdue
                                ? `⚠️ ${Math.abs(sla.daysRemaining)} ದಿನಗಳ ಗಡುವು ಮೀರಿದೆ (${Math.abs(sla.daysRemaining)}d Overdue)`
                                : file.status === 'Disposed / Closed'
                                ? '✅ ಕಡತ ವಿಲೇಯಾಗಿದೆ (Disposed)'
                                : `⏳ ${sla.daysRemaining} ದಿನಗಳು ಬಾಕಿ ಇವೆ (${sla.daysRemaining}d Remaining)`}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-stone-400">SLA ಪ್ರಗತಿ ಪ್ರಮಾಣ:</span>
                            <span className="font-mono font-bold text-stone-200">
                              {Math.round(sla.progressPercent)}% ಪೂರ್ಣಗೊಂಡಿದೆ
                            </span>
                          </div>

                          <div className="flex justify-between text-[10px] text-stone-400 border-t border-stone-800/80 pt-1 mt-1">
                            <span>ಅಧಿಕಾರಿ: {file.currentCustodian || 'ಅನುಮೋದಕರು'}</span>
                            <span>ವಿಭಾಗ: {file.section}</span>
                          </div>
                        </div>

                        {/* Tooltip downward pointing arrow */}
                        <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-stone-950/95"></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                          <span className={isSelected ? 'text-stone-300' : 'text-stone-600'}>SLA:</span>
                          <span className={`font-bold ${
                            sla.colorClass === 'rose'
                              ? 'text-rose-400 font-black'
                              : sla.colorClass === 'amber'
                                ? 'text-amber-400 font-bold'
                                : isSelected ? 'text-emerald-300' : 'text-emerald-600'
                          }`}>
                            {sla.timeLabel}
                          </span>
                        </span>
                        <span className={`font-mono text-[9px] ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                          {file.dueDate ? formatDateDDMMYYYY(file.dueDate) : '14 ದಿನಗಳ SLA'}
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-stone-800' : 'bg-stone-100'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            sla.colorClass === 'rose'
                              ? 'bg-rose-600 animate-pulse'
                              : sla.colorClass === 'amber'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, sla.progressPercent))}%` }}
                        />
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] mt-2 pt-2 border-t ${isSelected ? 'border-stone-800' : 'border-stone-100'}`}>
                      <span className={isSelected ? 'text-stone-400' : 'text-stone-500'}>
                        {file.section}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setIsCaptureModalOpen(true);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-stone-800 hover:bg-stone-700 text-amber-300' 
                              : 'bg-stone-100 hover:bg-indigo-100 text-indigo-800'
                          }`}
                          title="ಕ್ಯಾಮರಾದಿಂದ ಕಾಗದ ದಾಖಲೆ ಸೆರೆಹಿಡಿಯಿರಿ (Capture Document via Camera)"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-medium ${isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'}`}>
                          {file.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick Open Docket Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        const panel = document.getElementById('active-docket-dossier-panel');
                        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2.5 ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 font-extrabold shadow-xs'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>📂 ಕಡತ ತೆರೆಯಿರಿ (Open Docket File)</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: File Dossier & Movement Trail */}
        <div id="active-docket-dossier-panel" className="lg:col-span-7 scroll-mt-20">
          {activeFile ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden space-y-5 p-6">
              {/* File Header */}
              <div className="border-b border-stone-200 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                      {activeFile.fileNumber}
                    </span>
                    {activeFile.fileCode && (
                      <span className="font-mono text-xs font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded border border-amber-500">
                        {activeFile.fileCode}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      {activeFile.section}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* File-First Create Letter inside this File */}
                    {onDraftLetterForFile && (
                      <button
                        type="button"
                        id="btn-draft-letter-in-file-fts"
                        onClick={() => onDraftLetterForFile(activeFile)}
                        className="px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-amber-500/80 cursor-pointer font-kannada"
                        title="ಈ ಕಡತದ ಅಡಿಯಲ್ಲಿ ಹೊಸ ಪತ್ರ ಸೃಜಿಸಿ (File-First Workflow)"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-950" />
                        <span>+ ಕಡತದಲ್ಲಿ ಪತ್ರ ರಚಿಸಿ</span>
                      </button>
                    )}

                    {/* File Closure Protocol */}
                    {activeFile.status !== 'Disposed / Closed' && (
                      <button
                        type="button"
                        id="btn-close-file-protocol-fts"
                        onClick={() => setClosingFile(activeFile)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer font-kannada"
                        title="ಕಡತ ಮುಕ್ತಾಯ & ಅಂತಿಮ ವಿಲೇವಾರಿ ಪರೀಕ್ಷೆ (File Closure Protocol)"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-white" />
                        <span>ಕಡತ ಮುಕ್ತಾಯ (Close)</span>
                      </button>
                    )}

                    {/* NT Storage Inspection Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowStorageInspect(!showStorageInspect);
                        fetch(`/api/files/${activeFile.id}/storage`)
                          .then(r => r.ok ? r.json() : null)
                          .then(d => { if (d) setStorageInfo(d); })
                          .catch(() => {});
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-stone-700 cursor-pointer font-kannada"
                      title="ಸ್ಥಳೀಯ NT Storage ಫೋಲ್ಡರ್ ಪರಿಶೀಲಿಸಿ"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      <span>NT Storage ({activeFile.fileCode || 'FILE'})</span>
                    </button>

                    {/* Generate Dossier Summary Button for Supervisor Review */}
                    <button
                      type="button"
                      id="btn-generate-dossier-summary-dockets-view"
                      onClick={() => generateDocketDossierSummaryPdf(activeFile)}
                      className="px-3 py-1.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-amber-500/80 cursor-pointer font-kannada"
                      title="ಕಡತದ ಟಿಪ್ಪಣಿ, ಚಲನವಲನ ಆಡಿಟ್ ಲಾಗ್ ಹಾಗೂ ವಿವರಗಳ ಸಮಗ್ರ PDF ಡಾಸಿಯರ್ ಸಾರಾಂಶ ರಚಿಸಿ (Quick Supervisor Review)"
                    >
                      <FileDown className="w-3.5 h-3.5 text-stone-950" />
                      <span>ಡಾಸಿಯರ್ ಸಾರಾಂಶ (PDF)</span>
                    </button>

                    {/* Generate QR Code Button */}
                    <button
                      type="button"
                      onClick={() => handleGenerateQrCode(activeFile)}
                      className="px-3 py-1.5 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs border border-stone-300 cursor-pointer"
                      title="ಈ ಕಡತಕ್ಕೆ QR ಕೋಡ್ ಸೃಜಿಸಿ (ಮುದ್ರಣ / ಅಂಟಿಸಲು)"
                    >
                      <QrCode className="w-3.5 h-3.5 text-stone-950" />
                      <span>QR ಕೋಡ್</span>
                    </button>

                    <button
                      onClick={() => setIsMoveModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Route / Move</span>
                    </button>
                  </div>
                </div>

                {/* NT Storage Inspection Card */}
                {showStorageInspect && (
                  <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border-2 border-stone-800 space-y-3 font-mono animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-700 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <HardDrive className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold font-kannada text-amber-300">
                          ಸ್ಥಳೀಯ NT Storage ಫೋಲ್ಡರ್ ರಚನೆ (Local Storage Folder):
                        </span>
                        <span className="text-[11px] bg-stone-800 text-amber-200 px-2 py-0.5 rounded font-mono font-bold border border-stone-700">
                          BEO_EOFFICE/Files/{activeFile.fileCode || 'FILE-0001'}/
                        </span>
                      </div>
                      <a
                        href="/api/storage/download-zip"
                        download
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-[11px] font-bold font-kannada flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                        title="ಸಂಪೂರ್ಣ BEO_EOFFICE ಫೋಲ್ಡರ್ ZIP ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ZIP ಡೌನ್‌ಲೋಡ್</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      {[
                        { name: 'File_Details', count: storageInfo?.contents?.File_Details?.length || 2, desc: 'metadata.json, summary.txt' },
                        { name: 'Inward', count: storageInfo?.contents?.Inward?.length || 0, desc: 'ಆವಕ ದಾಖಲೆಗಳು' },
                        { name: 'Letters', count: storageInfo?.contents?.Letters?.length || linkedLetters.length, desc: 'ಸೃಜಿಸಿದ ಪತ್ರಗಳು' },
                        { name: 'Orders', count: storageInfo?.contents?.Orders?.length || 0, desc: 'ಆದೇಶಗಳು & ಜ್ಞಾಪನಗಳು' },
                        { name: 'Reports', count: storageInfo?.contents?.Reports?.length || (activeFile.status?.includes('Closed') ? 1 : 0), desc: 'ಡಾಸಿಯರ್ & ವಿಲೇವಾರಿ ವರದಿ' },
                        { name: 'Attachments', count: storageInfo?.contents?.Attachments?.length || (activeFile.attachments?.length || 0), desc: 'ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು' },
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
                      * ಪ್ರತಿಯೊಂದು ಸೃಜಿಸಲಾದ ಪತ್ರ ಮತ್ತು ದಾಖಲೆಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಈ ಕಡತದ ಫೋಲ್ಡರ್‌ನಲ್ಲಿ ಉಳಿಸಲ್ಪಡುತ್ತವೆ.
                    </p>
                  </div>
                )}

                <h3 className="text-base font-bold text-stone-900">
                  {activeFile.subject}
                </h3>

                {/* File Category Selector & Badge Card */}
                {(() => {
                  const meta = getFileCategoryMeta(activeFile);
                  return (
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${meta.iconBg}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-stone-600">ಕಡತದ ಕ್ಯಾಟಗರಿ</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeClass}`}>
                              {meta.labelKn}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-medium truncate max-w-sm sm:max-w-md">
                            {meta.id} • {meta.description}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown to change category */}
                      {onUpdateFileCategory && (
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[11px] font-semibold text-stone-600">ಕ್ಯಾಟಗರಿ ಬದಲಿಸಿ:</label>
                          <select
                            value={activeFile.fileCategory || meta.id}
                            disabled={isChangingCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-400 cursor-pointer"
                          >
                            {FILE_CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.labelKn} ({cat.labelEn})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-600">
                  <div>
                    <span className="text-[10px] uppercase text-stone-600 block font-semibold">Current Custodian</span>
                    <strong className="text-stone-900">{activeFile.currentCustodian}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-600 block font-semibold">File Status</span>
                    <strong className="text-emerald-700">{activeFile.status}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-600 block font-semibold">Initiated Date</span>
                    <strong className="text-stone-900">{activeFile.initiatedDate}</strong>
                  </div>
                </div>

                {activeFile.notes && (
                  <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 mt-2">
                    {activeFile.notes}
                  </p>
                )}
              </div>

              {/* RTI DOCKET SPECIFIC CASE DETAILS (If RTI File) */}
              {(activeFile.isRtiFile || activeFile.rtiDetails) && (
                <div className="bg-amber-50/70 rounded-xl border border-amber-300 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-amber-800" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                          ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 (RTI Act 2005 Case Dossier)
                        </h4>
                        <span className="text-[11px] font-mono font-semibold text-amber-800">
                          ಅರ್ಜಿ ಕ್ರ.ಸಂ: {activeFile.rtiDetails?.applicationNumber || 'RTI-APP-BEO'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-200/80 text-amber-900 border border-amber-400">
                        {activeFile.rtiDetails?.rtiStatus || 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ'}
                      </span>
                      {onOpenRtiReply && (
                        <button
                          type="button"
                          onClick={() => onOpenRtiReply(activeFile)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>ಮಾಹಿತಿಗೆ ಪತ್ರ ತಯಾರಿಸು (Draft Reply Letter)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-800">ಅರ್ಜಿದಾರರ ವಿವರ (Applicant Details)</span>
                      <p className="font-semibold text-stone-900">{activeFile.rtiDetails?.applicantName || 'ಶ್ರೀಯುತ ಅರ್ಜಿದಾರರು'}</p>
                      <p className="text-stone-600 text-[11px]">{activeFile.rtiDetails?.applicantAddress || 'ಭದ್ರಾವತಿ'}</p>
                      {activeFile.rtiDetails?.applicantPhone && (
                        <p className="text-stone-500 text-[11px]">ದೂರವಾಣಿ: {activeFile.rtiDetails.applicantPhone}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-800">ಕಾಲಮಿತಿ ಹಾಗೂ ಶುಲ್ಕ ವಿವರ (Due Date & Fee)</span>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>ಸ್ವೀಕೃತ ದಿನಾಂಕ: <strong>{activeFile.rtiDetails?.applicationDate || activeFile.initiatedDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>30 ದಿನಗಳ ಕಾಲಮಿತಿ ಗಡುವು: <strong>{activeFile.rtiDetails?.statutoryDueDate || '30 Days'}</strong></span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        ಶುಲ್ಕ: {activeFile.rtiDetails?.feeDetails || '₹10/- ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್'}
                      </p>
                    </div>
                  </div>

                  {activeFile.rtiDetails?.informationSought && (
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                        ಅರ್ಜಿಯಲ್ಲಿ ಕೋರಲಾದ ಮಾಹಿತಿ (Information Sought by Applicant):
                      </span>
                      <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans">
                        {activeFile.rtiDetails.informationSought}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-amber-900 pt-1">
                    <span>ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ: <strong>{activeFile.rtiDetails?.pioOfficer || activeFile.currentCustodian}</strong></span>
                  </div>
                </div>
              )}

              {/* ATTACHMENTS SECTION: PDF / JPG SCANNED DOCUMENTS */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                    <span>ಕಡತದ ಲಗತ್ತುಗಳು / ದಾಖಲೆ ಪ್ರತಿಗಳು (Attached Documents - PDF / JPG)</span>
                    <span className="text-[10px] px-2 py-0.2 bg-stone-100 border border-stone-200 rounded-full font-mono">
                      {activeFileDocs.length}
                    </span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="btn-capture-docket-doc"
                      type="button"
                      onClick={() => setIsCaptureModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 border border-indigo-900 rounded-lg cursor-pointer transition-colors shadow-2xs"
                      title="ಸಾಧನದ ಕ್ಯಾಮೆರಾದಿಂದ ಕಾಗದ ದಾಖಲೆಯ ಫೋಟೋ ತೆಗೆದು ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Capture Document via Camera)"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>ದಾಖಲೆ ಸೆರೆಹಿಡಿ (Capture Document)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMergeModalOpen(true)}
                      disabled={activeFileDocs.length === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
                      title="ಕಡತದ ದಾಖಲೆಗಳನ್ನು ಒಂದೇ PDF ಗೆ ವಿಲೀನಗೊಳಿಸಿ (Merge into Consolidated PDF)"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-800" />
                      <span>ದಾಖಲೆಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಿ (Merge PDF)</span>
                    </button>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                      <span>{isUploadingAttachment ? 'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'ದಾಖಲೆ ಲಗತ್ತಿಸು (PDF / JPG)'}</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleUploadAttachment}
                        disabled={isUploadingAttachment}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {(() => {
                  const docs = activeFileDocs;
                  if (docs.length === 0) {
                    return (
                      <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-300 space-y-1">
                        <UploadCloud className="w-6 h-6 mx-auto text-stone-300" />
                        <p>ಯಾವುದೇ PDF ಅಥವಾ JPG ದಾಖಲೆ ಲಗತ್ತಿಸಿಲ್ಲ.</p>
                        <p className="text-[11px] text-stone-400">ಮೇಲಿನ "ದಾಖಲೆ ಲಗತ್ತಿಸು" ಬಟನ್ ಒತ್ತಿ ಸ್ಕ್ಯಾನ್ ಪ್ರತಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {docs.map((doc, idx) => {
                        const isPdf = doc.fileType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
                        return (
                          <div
                            key={doc.id || idx}
                            onClick={() => {
                              setPreviewAttachment(doc);
                              if (onViewAttachment) onViewAttachment(doc);
                            }}
                            className="p-3 bg-stone-50 hover:bg-stone-100/90 rounded-xl border border-stone-200 flex items-start justify-between gap-3 transition-colors cursor-pointer group"
                            title="ದಾಖಲೆಯ ಪೂರ್ಣ ಮುನ್ನೋಟ ವೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                isPdf ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              }`}>
                                {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0">
                                <span className="font-semibold text-xs text-stone-900 block truncate group-hover:text-blue-700 underline-offset-2 group-hover:underline" title={doc.fileName}>
                                  {doc.fileName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                                  <span>{doc.fileSize}</span>
                                  <span>•</span>
                                  <span>{doc.uploadedAt || activeFile.initiatedDate}</span>
                                  <span className="text-emerald-700 font-semibold">• ಪರಿಶೀಲನೆ ಲಭ್ಯವಿದೆ</span>
                                </div>
                                {doc.description && (
                                  <p className="text-[10px] text-stone-600 truncate mt-0.5">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewAttachment(doc);
                                if (onViewAttachment) onViewAttachment(doc);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 bg-white hover:bg-stone-200 rounded-md border border-stone-300 flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                              title="ದಾಖಲೆಯನ್ನು ಪೂರ್ಣವಾಗಿ ವೀಕ್ಷಿಸಿ"
                            >
                              <ExternalLink className="w-3 h-3 text-stone-500" />
                              <span>ವೀಕ್ಷಿಸಿ</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Linked Correspondence List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-500" /> Linked Letters & Circulars ({linkedLetters.length})
                  </h4>
                  {onDraftLetterForFile && (
                    <button
                      type="button"
                      onClick={() => onDraftLetterForFile(activeFile)}
                      className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg border border-amber-500 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="ಈ ಕಡತದಲ್ಲಿ ಹೊಸ ಪತ್ರ ರಚಿಸಿ (File-First Workflow)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ ಹೊಸ ಪತ್ರ ರಚಿಸಿ</span>
                    </button>
                  )}
                </div>

                {linkedLetters.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                    No letters directly tagged to this master docket.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedLetters.map(l => (
                      <div
                        key={l.id}
                        onClick={() => onSelectLetter(l)}
                        className="p-3 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <span className="font-mono text-[10px] text-stone-500 font-bold block">
                            {l.referenceNumber} • {l.dateReceivedOrIssued}
                          </span>
                          <span className="font-semibold text-stone-900 block truncate">
                            {l.subject}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-white border border-stone-200 text-stone-700 whitespace-nowrap">
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Movement History / Docket Audit Trail */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" /> Physical & Digital Movement Trail
                </h4>

                {activeFile.movementHistory.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                    File is currently at initial desk. No inter-departmental transfers logged.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-stone-200 ml-3 pl-4 space-y-4">
                    {activeFile.movementHistory.map((mov, idx) => (
                      <div key={mov.id} className="relative text-xs space-y-1">
                        <span className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-stone-900 border-2 border-white" />
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span className="font-semibold text-stone-800">
                            {mov.fromOfficer} → <strong className="text-amber-800">{mov.toOfficer}</strong>
                          </span>
                          <span>{mov.sentDate}</span>
                        </div>
                        <p className="text-stone-700 bg-stone-50 p-2 rounded-md border border-stone-200">
                          {mov.remarks}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-500 bg-white rounded-xl border border-stone-200">
              Select a master docket file from the left to inspect.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Preview Attached PDF / Document using Embedded Object & Iframe */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] border-2 border-stone-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-700 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate text-stone-100 font-mono-code" title={previewAttachment.fileName}>
                      {previewAttachment.fileName}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold shrink-0">
                      ಮುದ್ರಣ ಪೂರ್ವ ಪರಿಶೀಲನೆ (Pre-Print Verification)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    <span>ಕಡತ: <strong className="text-stone-300 font-mono-code">{activeFile?.fileNumber || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>ಗಾತ್ರ: {previewAttachment.fileSize || 'Standard PDF'}</span>
                    <span>•</span>
                    <span>ದಿನಾಂಕ: {previewAttachment.uploadedAt || activeFile?.initiatedDate || '2026'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const printUrl = previewAttachment.dataUrl;
                    if (printUrl) {
                      const printFrame = document.createElement('iframe');
                      printFrame.style.display = 'none';
                      printFrame.src = printUrl;
                      document.body.appendChild(printFrame);
                      printFrame.onload = () => {
                        printFrame.contentWindow?.focus();
                        printFrame.contentWindow?.print();
                      };
                    } else {
                      window.print();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ದಾಖಲೆ ಮುದ್ರಿಸಿ (Print PDF)"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>ಮುದ್ರಿಸಿ</span>
                </button>

                {previewAttachment.dataUrl && (
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.fileName}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg border border-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ಡೌನ್‌ಲೋಡ್</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="ಮುಚ್ಚಿ (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Object / Iframe Viewer Body */}
            <div className="flex-1 bg-stone-100 p-3 overflow-hidden flex flex-col min-h-[520px]">
              {previewAttachment.dataUrl ? (
                <div className="w-full flex-1 rounded-xl overflow-hidden border border-stone-300 shadow-inner bg-stone-800 flex flex-col">
                  <object
                    data={previewAttachment.dataUrl}
                    type="application/pdf"
                    className="w-full flex-1 min-h-[480px] border-0"
                  >
                    <iframe
                      src={previewAttachment.dataUrl}
                      title={previewAttachment.fileName}
                      className="w-full h-full min-h-[480px] border-0"
                    >
                      <div className="p-8 text-center text-stone-500 bg-white">
                        <p className="font-semibold text-stone-800">PDF ಪ್ರದರ್ಶನ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.</p>
                        <a
                          href={previewAttachment.dataUrl}
                          download={previewAttachment.fileName}
                          className="mt-3 inline-block px-4 py-2 bg-amber-500 text-stone-900 rounded font-bold text-xs"
                        >
                          ನೇರವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              ) : (
                <div className="w-full flex-1 bg-white rounded-xl border-2 border-stone-300 p-6 shadow-sm flex flex-col justify-between overflow-y-auto font-kannada">
                  {/* Official Government Verification Header */}
                  <div className="border-b-2 border-stone-800 pb-4 text-center space-y-1">
                    <div className="text-[11px] font-bold tracking-widest text-stone-600 uppercase">
                      ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ
                    </div>
                    <div className="text-sm font-bold text-stone-900">
                      ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ವಲಯ
                    </div>
                    <div className="text-xs text-stone-700">
                      ಕಡತ ದಾಖಲೆ ಪರಿಶೀಲನಾ ಪತ್ರ (Official Docket File Verification Slip)
                    </div>
                  </div>

                  {/* Document Attributes Table */}
                  <div className="my-5 bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 block">ದಾಖಲೆ ಹೆಸರು (Document Name):</span>
                      <strong className="text-stone-900 font-mono-code">{previewAttachment.fileName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">ಕಡತ ಸಂಖ್ಯೆ (File Number):</span>
                      <strong className="text-stone-900 font-mono-code">{activeFile?.fileNumber}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">ಕಡತದ ವಿಷಯ (File Subject):</span>
                      <strong className="text-stone-800">{activeFile?.subject}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">ವಿಭಾಗ (Section):</span>
                      <strong className="text-stone-800">{activeFile?.section}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">ದಾಖಲೆ ವಿಧ (File Type / Size):</span>
                      <strong className="text-stone-800">{previewAttachment.fileType || 'PDF Application'} ({previewAttachment.fileSize || 'Standard'})</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">ಅಪ್‌ಲೋಡ್ ದಿನಾಂಕ:</span>
                      <strong className="text-stone-800 font-mono-code">{previewAttachment.uploadedAt || activeFile?.initiatedDate}</strong>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2 text-xs text-emerald-950">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ಕಡತ ಪರಿಶೀಲನಾ ದೃಢೀಕರಣ (Official File Document Verified):</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      ಈ ದಾಖಲೆಯನ್ನು ಕಡತ ಸಂಖ್ಯೆ <strong>{activeFile?.fileNumber}</strong> ಗೆ ಅಧಿಕೃತವಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದ್ದು, ಮುದ್ರಣ ಮಾಡುವ ಮುನ್ನ ಕಛೇರಿ ಅಧೀಕ್ಷಕರು / ವಿಷಯ ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸಲು ಲಭ್ಯವಿದೆ.
                    </p>
                  </div>

                  {/* Officer Signatures Stamp */}
                  <div className="mt-6 pt-4 border-t border-stone-300 flex items-center justify-between text-xs text-stone-700">
                    <div className="text-left">
                      <div className="font-bold text-stone-900">ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)</div>
                      <div className="text-[10px] text-stone-500">ಕಡತ ನಿರ್ವಹಣಾ ಶಾಖೆ, ಭದ್ರಾವತಿ</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-stone-900">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು / ಕಛೇರಿ ಅಧೀಕ್ಷಕರು</div>
                      <div className="text-[10px] text-stone-500">BEO ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Verification Controls */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-stone-800">
                  ಕಡತ ದಾಖಲೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (File Attachment Scrutinized & Ready for Printing)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printUrl = previewAttachment.dataUrl;
                    if (printUrl) {
                      const printFrame = document.createElement('iframe');
                      printFrame.style.display = 'none';
                      printFrame.src = printUrl;
                      document.body.appendChild(printFrame);
                      printFrame.onload = () => {
                        printFrame.contentWindow?.focus();
                        printFrame.contentWindow?.print();
                      };
                    } else {
                      window.print();
                    }
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ಮುದ್ರಣ (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Move / Route Docket */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-stone-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                Route Docket File: {activeFile?.fileNumber}
              </h3>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRouteFileSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Transferring From</label>
                <input
                  type="text"
                  disabled
                  value={activeFile?.currentCustodian}
                  className="w-full px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Route To (Recipient Officer) *</label>
                <input
                  type="text"
                  value={toOfficer}
                  onChange={e => setToOfficer(e.target.value)}
                  placeholder="e.g. Joint Director (Planning) / Under Secretary"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Update Status</label>
                <select
                  value={newFileStatus}
                  onChange={e => setNewFileStatus(e.target.value)}
                  className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
                >
                  <option value="Under Scrutiny">Under Scrutiny</option>
                  <option value="Pending Higher Approval">Pending Higher Approval</option>
                  <option value="Active / Open">Active / Open</option>
                  <option value="Disposed / Closed">Disposed / Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Handover Remarks / Scrutiny Directions</label>
                <textarea
                  rows={3}
                  value={movementRemarks}
                  onChange={e => setMovementRemarks(e.target.value)}
                  placeholder="Remarks on why file is routed..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMove || !toOfficer.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New File Docket */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                Open New Master Docket File
              </h3>
              <button onClick={() => setIsNewFileModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewFileSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">File Subject / Title *</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Special Infrastructure Grants for Model Secondary Schools"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ಕಡತದ ವರ್ಗೀಕರಣ (File Category) *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium"
                >
                  {FILE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.labelKn} — {cat.labelEn}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500 mt-1">
                  {FILE_CATEGORIES.find(c => c.id === newCategory)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Department Section</label>
                  <select
                    value={newSection}
                    onChange={e => setNewSection(e.target.value as DepartmentSection)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
                  >
                    <option value="Academic Wing">Academic Wing</option>
                    <option value="Administration & Services">Administration</option>
                    <option value="Accounts & Grants">Accounts & Grants</option>
                    <option value="Inspection & Quality">Inspection</option>
                    <option value="Examination Board">Examination Board</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as LetterPriority)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Initial Custodian Officer</label>
                <input
                  type="text"
                  value={newCustodian}
                  onChange={e => setNewCustodian(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Docket Synopsis / Background Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Brief synopsis of this case file..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewFileModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Create File Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Attachments Consolidated PDF Modal */}
      {isMergeModalOpen && activeFile && (
        <MergeAttachmentsModal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          activeFile={activeFile}
          onSaveMergedAttachment={async (newAtt) => {
            if (onUploadAttachmentToFile) {
              await onUploadAttachmentToFile(activeFile.id, newAtt);
            } else {
              if (!activeFile.attachments) activeFile.attachments = [];
              activeFile.attachments.push(newAtt);
            }
          }}
          onViewDocument={onViewAttachment}
        />
      )}

      {/* Capture Document via Camera Modal */}
      {isCaptureModalOpen && activeFile && (
        <CaptureDocumentModal
          isOpen={isCaptureModalOpen}
          onClose={() => setIsCaptureModalOpen(false)}
          targetDocketFile={activeFile}
          onAttachDocument={async (fileId, newAtt) => {
            if (onUploadAttachmentToFile) {
              await onUploadAttachmentToFile(fileId, newAtt);
            } else {
              if (!activeFile.attachments) activeFile.attachments = [];
              activeFile.attachments.push(newAtt);
            }
          }}
          suggestedDocTitle={`ದಾಖಲೆ_ಪ್ರತಿ_${activeFile.fileNumber}`}
        />
      )}

      {/* QR Code Generated Modal for Docket File */}
      {qrModalFile && qrModalDataUrl && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">ಕಡತದ QR ಕೋಡ್ (Docket File QR Code)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQrModalFile(null);
                  setQrModalDataUrl('');
                }}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 inline-block shadow-inner">
                <img 
                  src={qrModalDataUrl} 
                  alt={`QR Code for ${qrModalFile.fileNumber}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              </div>

              <div className="text-left bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">ಕಡತ ಸಂಖ್ಯೆ:</span>
                  <span className="font-mono font-bold text-stone-900">{qrModalFile.fileNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">ವಿಭಾಗ:</span>
                  <span className="text-stone-800 font-medium">{qrModalFile.section}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">ಪ್ರಸ್ತುತ ಅಧಿಕಾರಿ:</span>
                  <span className="text-stone-800 font-medium">{qrModalFile.currentCustodian}</span>
                </div>
                <div className="pt-1 border-t border-stone-200 text-[11px] text-stone-600 line-clamp-2">
                  <strong>ವಿಷಯ:</strong> {qrModalFile.subject}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Label - ${qrModalFile.fileNumber}</title>
                            <style>
                              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
                              .label { border: 2px dashed #000; padding: 16px; border-radius: 8px; text-align: center; max-width: 320px; }
                              .num { font-size: 16px; font-weight: bold; margin-bottom: 6px; font-family: monospace; }
                              .sub { font-size: 12px; margin-top: 6px; }
                              img { width: 180px; height: 180px; }
                            </style>
                          </head>
                          <body>
                            <div class="label">
                              <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #444;">Department of School Education • BEO Bhadravathi</div>
                              <div class="num">${qrModalFile.fileNumber}</div>
                              <img src="${qrModalDataUrl}" />
                              <div class="sub"><strong>ವಿಭಾಗ:</strong> ${qrModalFile.section}</div>
                              <div style="font-size: 10px; color: #555; margin-top: 4px;">${qrModalFile.subject}</div>
                            </div>
                            <script>window.onload = function() { window.print(); window.close(); };</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>ಲೇಬಲ್ ಮುದ್ರಿಸಿ (Print)</span>
                </button>

                <a
                  href={qrModalDataUrl}
                  download={`QR_${qrModalFile.fileNumber.replace(/\//g, '_')}.png`}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ಡೌನ್‌ಲೋಡ್</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Scan QR Camera / Code Scanner Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-sm">ತ್ವರಿತ QR ಸ್ಕ್ಯಾನರ್ (Quick Scan QR)</h3>
                  <p className="text-[11px] text-emerald-200">ಕಾಗದದ ಕಡತದ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನೇರವಾಗಿ ಕಡತಕ್ಕೆ ತೆರಳಿ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseQrScanner}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Camera Preview Area */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-stone-700">
                <video
                  ref={videoScannerRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Target Scanning Crosshair Box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {scanMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{scanMessage}</span>
                </div>
              )}

              {/* Manual input / Barcode reader fallback */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  ಕಡತ ಸಂಖ್ಯೆ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಕೋಡ್ ನಮೂದಿಸಿ (Manual Entry / Barcode):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCodeInput}
                    onChange={e => setScannedCodeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyScannedCode(scannedCodeInput);
                      }
                    }}
                    placeholder="ಉದಾ: ED/BEO/2026/F-101"
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyScannedCode(scannedCodeInput)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ಶೋಧಿಸಿ (Go)
                  </button>
                </div>
              </div>

              {/* Sample Files Quick Picker for instant testing */}
              <div className="pt-2 border-t border-stone-200 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  ತ್ವರಿತ ಪರೀಕ್ಷೆ (Quick Test Dockets):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {files.slice(0, 4).map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleApplyScannedCode(f.fileNumber)}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {f.fileNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Closure Modal */}
      {closingFile && (
        <FileClosureModal
          file={closingFile}
          currentUser={currentUser}
          onClose={() => setClosingFile(null)}
          onClosureSuccess={(updated) => {
            if (onCloseFileSuccess) onCloseFileSuccess(updated);
            setClosingFile(null);
            setSelectedFile(updated);
          }}
        />
      )}
    </div>
  );
};
