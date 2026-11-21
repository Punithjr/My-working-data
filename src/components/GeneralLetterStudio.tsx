import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Copy,
  Save,
  RefreshCw,
  Sparkles,
  Eye,
  Edit3,
  Search,
  Trash2,
  Calendar,
  User,
  Building2,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Inbox,
  Send,
  HelpCircle,
  FileCode,
  Users,
  FolderGit2,
  FolderPlus,
  Award,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
  History,
  RotateCcw,
  Languages,
  Check,
  X,
  Plus
} from 'lucide-react';
import { 
  GeneratedOfficeLetter, 
  GeneralLetterCategory, 
  GeneralLetterFormData, 
  GeneralLetterOfficialType,
  Employee, 
  MasterDocketFile 
} from '../types';
import { PrintPreviewModal } from './PrintPreviewModal';
import { GovOrderSelectorModal } from './GovOrderSelectorModal';

interface GeneralLetterStudioProps {
  currentUser?: { displayName: string; role: string } | null;
  employees?: Employee[];
  prefilledEmployee?: Employee | null;
  onSaveToRegistry?: (letterData: any) => Promise<void>;
  prefilledLetter?: any;
  files?: MasterDocketFile[];
  onCreateDocketFile?: (fileData: Partial<MasterDocketFile>) => Promise<void>;
}

// 18 Canonical Letter Types
export const GENERAL_LETTER_TYPES: { type: GeneralLetterOfficialType; label: string; desc: string }[] = [
  { type: 'ಕಛೇರಿ ಆದೇಶ', label: '1. ಕಛೇರಿ ಆದೇಶ (Office Order)', desc: 'GPF ಮುಂಗಡ, ಭಾಗಶಃ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ, ಪ್ರಭಾರ ಭತ್ಯೆ, ವೇತನ ಬಡ್ತಿ ಹಾಗೂ ಕರ್ತವ್ಯ ನಿಯೋಜನೆ' },
  { type: 'ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಪತ್ರ', label: '2. ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಪತ್ರ', desc: 'ಸಾಮಾನ್ಯ ಆಡಳಿತಾತ್ಮಕ ಪತ್ರವ್ಯವಹಾರ' },
  { type: 'ಮನವಿ ಪತ್ರ', label: '2. ಮನವಿ ಪತ್ರ (Request / Appeal)', desc: 'ಕೋರಿಕೆ ಅಥವಾ ವಿನಂತಿ ಪತ್ರ' },
  { type: 'ಮಾಹಿತಿ ಕೋರುವ ಪತ್ರ', label: '3. ಮಾಹಿತಿ ಕೋರುವ ಪತ್ರ (Information Seeking)', desc: 'ಮಾಹಿತಿ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಕೋರುವುದು' },
  { type: 'ಮಾಹಿತಿ ನೀಡುವ ಪತ್ರ', label: '4. ಮಾಹಿತಿ ನೀಡುವ ಪತ್ರ (Information Furnishing)', desc: 'ಕೋರಿದ ವಿವರಗಳನ್ನು ಒದಗಿಸುವುದು' },
  { type: 'ಉತ್ತರ ಪತ್ರ', label: '5. ಉತ್ತರ ಪತ್ರ (Reply Letter)', desc: 'ಹಿಂದಿನ ಪತ್ರಕ್ಕೆ ಅಧಿಕೃತ ಪ್ರತ್ಯುತ್ತರ' },
  { type: 'ವಿವರಣಾತ್ಮಕ ಪತ್ರ', label: '6. ವಿವರಣಾತ್ಮಕ ಪತ್ರ (Explanatory)', desc: 'ಘಟನೆ ಅಥವಾ ನಿಯಮಾನುಸಾರ ವಿವರಣೆ' },
  { type: 'ಶಾಲೆಗಳಿಗೆ ಸೂಚನಾ ಪತ್ರ', label: '7. ಶಾಲೆಗಳಿಗೆ ಸೂಚನಾ ಪತ್ರ (To Schools)', desc: 'ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಅಧಿಕೃತ ನಿರ್ದೇಶನಗಳು' },
  { type: 'ಶಾಲೆಗಳಿಂದ ವರದಿ ಕೋರುವ ಪತ್ರ', label: '8. ಶಾಲೆಗಳಿಂದ ವರದಿ ಕೋರುವ ಪತ್ರ (Report Seeking)', desc: 'ಶಾಲಾ ಪ್ರಗತಿ / ಅಂಕಿ-ಅಂಶ ವರದಿ' },
  { type: 'ಇತರೆ ಕಚೇರಿಗಳಿಗೆ ಪತ್ರ', label: '9. ಇತರೆ ಕಚೇರಿಗಳಿಗೆ ಪತ್ರ (Other Offices)', desc: 'ತಾಲ್ಲೂಕು / ಜಿಲ್ಲಾ ಮಟ್ಟದ ಇತರೆ ಇಲಾಖೆಗಳು' },
  { type: 'ಮೇಲಧಿಕಾರಿಗಳಿಗೆ ಪತ್ರ', label: '10. ಮೇಲಧಿಕಾರಿಗಳಿಗೆ ಪತ್ರ (Higher Authority)', desc: 'ಡಿಡಿಪಿಐ / ಆಯುಕ್ತರಿಗೆ ಪತ್ರ' },
  { type: 'ನೆನಪೋಲೆ ಪತ್ರ', label: '11. ನೆನಪೋಲೆ ಪತ್ರ (Reminder Letter)', desc: 'ಬಾಕಿ ಉಳಿದ ವಿಷಯಗಳ ತ್ವರಿತ ಜ್ಞಾಪನೆ' },
  { type: 'ಅನುಮತಿ ಕೋರುವ ಪತ್ರ', label: '12. ಅನುಮತಿ ಕೋರುವ ಪತ್ರ (Permission Seeking)', desc: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದಿಂದ ಪೂರ್ವಾನುಮತಿ' },
  { type: 'ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸುವ ಪತ್ರ', label: '13. ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸುವ ಪತ್ರ (Proposal)', desc: 'ಯೋಜನೆ ಅಥವಾ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ' },
  { type: 'ವರದಿ ಸಲ್ಲಿಸುವ ಪತ್ರ', label: '14. ವರದಿ ಸಲ್ಲಿಸುವ ಪತ್ರ (Report Submission)', desc: 'ತಪಾಸಣೆ ಅಥವಾ ಅನುಷ್ಠಾನ ವರದಿ ಸಲ್ಲಿಕೆ' },
  { type: 'ದೃಢೀಕರಣ ಪತ್ರ', label: '15. ದೃಢೀಕರಣ ಪತ್ರ (Verification / Certificate)', desc: 'ಅಧಿಕೃತ ಸೇವಾ ಅಥವಾ ಶೈಕ್ಷಣಿಕ ದೃಢೀಕರಣ' },
  { type: 'ಸ್ವೀಕೃತಿ ಪತ್ರ', label: '16. ಸ್ವೀಕೃತಿ ಪತ್ರ (Acknowledgement)', desc: 'ಪತ್ರ ಅಥವಾ ದಾಖಲೆ ತಲುಪಿದ ಸ್ವೀಕೃತಿ' },
  { type: 'ಕಚೇರಿ ವ್ಯವಹಾರಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಇತರೆ ಪತ್ರಗಳು', label: '17. ಕಚೇರಿ ಇತರೆ ಪತ್ರಗಳು (Other Admin)', desc: 'ವಿವಿಧ ಆಡಳಿತಾತ್ಮಕ ವ್ಯವಹಾರ ಪತ್ರಗಳು' },
];

export const GeneralLetterStudio: React.FC<GeneralLetterStudioProps> = ({
  currentUser,
  employees = [],
  prefilledEmployee,
  onSaveToRegistry,
  prefilledLetter,
  files = [],
  onCreateDocketFile,
}) => {
  // State: Selected File Docket (Mandatory File-First Workflow)
  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    if (prefilledLetter?.fileId) return prefilledLetter.fileId;
    if (prefilledLetter?.fileNumber && files.length > 0) {
      const match = files.find(f => f.fileNumber === prefilledLetter.fileNumber);
      if (match) return match.id;
    }
    return files[0]?.id || '';
  });

  const activeFile = useMemo(() => {
    return files.find(f => f.id === selectedFileId) || null;
  }, [files, selectedFileId]);

  // Form Data
  const [formData, setFormData] = useState<GeneralLetterFormData>({
    letterType: 'ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಪತ್ರ',
    language: 'kannada',
    fileId: activeFile?.id || '',
    fileNumber: activeFile?.fileNumber || '57',
    date: new Date().toISOString().split('T')[0],
    recipientOfficer: '',
    recipientDesignation: '',
    recipientOffice: 'ಸರ್ಕಾರಿ ಶಾಲೆ / ಕಚೇರಿ, ಭದ್ರಾವತಿ',
    recipientAddress: 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
    subject: '',
    reference: '', // Strictly optional
    mainContent: '',
    actionRequired: '',
    deadline: '',
    enclosures: '',
    copiesTo: '1. ಈ ಕಚೇರಿಯ ಕಡತಕ್ಕೆ (Master File Docket).',
    additionalPrompt: '',
  });

  // Sync active file number to form
  useEffect(() => {
    if (activeFile) {
      setFormData(prev => ({
        ...prev,
        fileId: activeFile.id,
        fileNumber: activeFile.fileNumber,
      }));
    }
  }, [activeFile]);

  // Modals & UI States
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isGovOrderModalOpen, setIsGovOrderModalOpen] = useState(false);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Preview & Editor States
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Legal' | 'Letter'>('A4');
  const [activeLetterRecord, setActiveLetterRecord] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);

  // Signatory State
  const [signatory, setSignatory] = useState<{
    name: string;
    designation: string;
    office: string;
  }>(() => {
    const emp = employees.find(e => (e as any).isDdo === true) || employees[0];
    return {
      name: emp?.fullName || 'ಸುರೇಶ್ ಕೆ.ಸಿ.',
      designation: emp?.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
    };
  });

  // Office Order Modal & Employee Selection State
  const [isEmployeeOrderModalOpen, setIsEmployeeOrderModalOpen] = useState(false);
  const [orderModalEmployeeId, setOrderModalEmployeeId] = useState<string>(prefilledEmployee?.id || employees[0]?.id || '');
  const [orderModalType, setOrderModalType] = useState<string>('GPF ಮುಂಗಡ');
  const [orderModalGpfAmount, setOrderModalGpfAmount] = useState<number>(50000);
  const [orderModalInstallments, setOrderModalInstallments] = useState<number>(24);
  const [orderModalGpfBalance, setOrderModalGpfBalance] = useState<number>(350000);
  const [orderModalGpfWithdrawal, setOrderModalGpfWithdrawal] = useState<number>(150000);
  const [orderModalPurpose, setOrderModalPurpose] = useState<string>('ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸಾ ವೆಚ್ಚ');
  const [orderModalInchargePost, setOrderModalInchargePost] = useState<string>('ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು');
  const [orderModalDeputationPlace, setOrderModalDeputationPlace] = useState<string>('ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಭದ್ರಾವತಿ');
  const [orderModalSearchQuery, setOrderModalSearchQuery] = useState<string>('');

  // Quick New File Form
  const [newFileData, setNewFileData] = useState({
    fileNumber: '',
    subject: '',
    section: 'Administration & Services',
    sectionCode: 'ಆ2',
    priority: 'Routine',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handle applying Employee Office Order Template directly into Letter Studio
  const handleApplyOfficeOrderTemplate = (emp: Employee) => {
    const today = formData.date || new Date().toISOString().split('T')[0];
    const kgid = emp.kgidNumber || emp.employeeCode || '108294';
    const gpfAcc = emp.gpfNumber || kgid;
    const monthlyRecovery = Math.round(orderModalGpfAmount / orderModalInstallments);

    let subj = '';
    let ref = '';
    let matter = '';

    if (orderModalType === 'GPF ಮುಂಗಡ') {
      subj = `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ GPF ಮರುಪಾವತಿಸಬಹುದಾದ ಮುಂಗಡ ಮಂಜೂರಾತಿ ಮಾಡುವ ಕುರಿತು ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಅರ್ಜಿ ದಿನಾಂಕ: ${today}.\n2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${emp.officeLocation} ಇವರ ಶಿಫಾರಸು ಪತ್ರ.\n3. ಕರ್ನಾಟಕ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ನಿಯಮಾವಳಿಗಳು (KGPF Rules) ನಿಯಮ 10 ಮತ್ತು 12.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ${emp.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} (KGID: ${kgid}, GPF ಖಾತೆ ಸಂ: ${gpfAcc}) ಇವರು ತಮ್ಮ ${orderModalPurpose} ಪ್ರಯುಕ್ತ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿಯಿಂದ ₹${orderModalGpfAmount.toLocaleString('en-IN')}/- ಗಳ ಮರುಪಾವತಿಸಬಹುದಾದ ತಾತ್ಕಾಲಿಕ ಮುಂಗಡ ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿರುತ್ತಾರೆ. ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ಕೆಳಕಂಡಂತೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ಖಾತೆಯಿಂದ (GPF A/c No: ${gpfAcc}) ₹${orderModalGpfAmount.toLocaleString('en-IN')}/- (ಅಕ್ಷರಗಳಲ್ಲಿ ರೂಪಾಯಿ ${orderModalGpfAmount} ಮಾತ್ರ) ಗಳ ಮರುಪಾವತಿಸಬಹುದಾದ ಮುಂಗಡ ಹಣವನ್ನು ಕೆಳಕಂಡ ಷರತ್ತುಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.\n\n1. ಮಂಜೂರಾದ ಮುಂಗಡ ಮೊತ್ತ: ₹${orderModalGpfAmount.toLocaleString('en-IN')}/-\n2. ಮರುಪಾವತಿ ಕಂತುಗಳ ಸಂಖ್ಯೆ: ${orderModalInstallments} ಸಮಾನ ಮಾಸಿಕ ಕಂತುಗಳು.\n3. ಮಾಸಿಕ ಕಂತು ಕಡಿತದ ಮೊತ್ತ: ₹${monthlyRecovery.toLocaleString('en-IN')}/- (ಅಂತಿಮ ಕಂತು ವ್ಯತ್ಯಾಸ ಸರಿಹೊಂದಿಸುವುದು).\n4. ಕಡಿತ ಪ್ರಾರಂಭ: ಮುಂದಿನ ಮಾಹೆಯ ವೇತನ ಬಟವಾಡೆ ಪಟ್ಟಿಯಿಂದ ಕಡ್ಡಾಯವಾಗಿ ಕಡಿತಗೊಳಿಸತಕ್ಕದ್ದು.\n5. ಮುಂಗಡ ಹಣವನ್ನು ಕೇವಲ ತಿಳಿಸಿರುವ ಉದ್ದೇಶಕ್ಕೆ (${orderModalPurpose}) ಮಾತ್ರ ಬಳಸತಕ್ಕದ್ದು.`;
    } else if (orderModalType === 'GPF ಭಾಗಶಃ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ') {
      subj = `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ GPF ಮರುಪಾವತಿಸಬೇಕಿಲ್ಲದ ಭಾಗಶಃ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ (Part-Final Withdrawal) ಮಂಜೂರಾತಿ ಕುರಿತು ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಅರ್ಜಿ ದಿನಾಂಕ: ${today}.\n2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${emp.officeLocation} ಇವರ ಪತ್ರ.\n3. ಕರ್ನಾಟಕ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ನಿಯಮಾವಳಿಗಳು (KGPF Rules) ನಿಯಮ 13 (Non-Refundable Withdrawal).`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ${emp.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} (KGID: ${kgid}, GPF ಖಾತೆ ಸಂ: ${gpfAcc}) ಇವರು 15 ವರ್ಷಗಳಿಗಿಂತ ಹೆಚ್ಚಿನ ಅರ್ಹತಾದಾಯಕ ಸೇವೆ ಸಲ್ಲಿಸಿದ್ದು, ತಮ್ಮ ${orderModalPurpose} ಕಾರಣಕ್ಕಾಗಿ GPF ಖಾತೆಯಿಂದ ₹${orderModalGpfWithdrawal.toLocaleString('en-IN')}/- ಗಳ ಮರುಪಾವತಿ ರಹಿತ ಭಾಗಶಃ ಅಂತಿಮ ಮೊತ್ತ ಹಿಂಪಡೆಯಲು ಕೋರಿರುತ್ತಾರೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ಖಾತೆಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಒಟ್ಟು ಶಿಲ್ಕು ಮೊತ್ತ ₹${orderModalGpfBalance.toLocaleString('en-IN')}/- ಗಳಲ್ಲಿ, ಕರ್ನಾಟಕ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ನಿಯಮ 13 ರನ್ವಯ ₹${orderModalGpfWithdrawal.toLocaleString('en-IN')}/- (ರೂಪಾಯಿ ${orderModalGpfWithdrawal} ಮಾತ್ರ) ಗಳನ್ನು ಮರುಪಾವತಿ ರಹಿತ (Non-Refundable) ಭಾಗಶಃ ಅಂತಿಮ ಮೊತ್ತವಾಗಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.\n\n1. GPF ಖಾತೆ ಸಂಖ್ಯೆ: ${gpfAcc}\n2. ಖಾತೆಯಲ್ಲಿನ ಒಟ್ಟು ಶಿಲ್ಕು: ₹${orderModalGpfBalance.toLocaleString('en-IN')}/-\n3. ಮಂಜೂರಾದ ಭಾಗಶಃ ಅಂತಿಮ ಮೊತ್ತ: ₹${orderModalGpfWithdrawal.toLocaleString('en-IN')}/-\n4. ಹಿಂಪಡೆಯುವ ಉದ್ದೇಶ: ${orderModalPurpose}\n5. ಸದರಿ ಮೊತ್ತವನ್ನು ಮರುಪಾವತಿಸುವ ಅಗತ್ಯವಿರುವುದಿಲ್ಲ ಹಾಗೂ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ಸೂಕ್ತ ಷರಾ ದಾಖಲಿಸತಕ್ಕದ್ದು.`;
    } else if (orderModalType === 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ') {
      subj = `ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ 15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (Earned Leave Encashment) ಮಂಜೂರಾತಿ ಆದೇಶ.`;
      ref = `1. ನೌಕರರ ಮನವಿ ಪತ್ರ ದಿನಾಂಕ: ${today}.\n2. ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 (KCSR Rule 118).\n3. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 05 ಎಸ್ಆರ್ಎಸ್ 2012 ದಿನಾಂಕ: 14.06.2012.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ${emp.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} (KGID: ${kgid}) ಇವರ ಗಳಿಕೆ ರಜೆ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ, ಇವರ ಖಾತೆಯಲ್ಲಿ ಸಾಕಷ್ಟು ರಜೆ ಶಿಲ್ಕು ಲಭ್ಯವಿರುತ್ತದೆ. ನೌಕರರು 2024-2026 ಬ್ಲಾಕ್ ಅವಧಿಗೆ 15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣಕ್ಕೆ ಕೋರಿದ್ದು ಕೆಳಕಂಡಂತೆ ಆದೇಶಿಸಲಾಗಿದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರನ್ವಯ 15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ನಗದೀಕರಿಸಿಕೊಳ್ಳಲು ಮಂಜೂರಾತಿ ನೀಡಲಾಗಿದೆ. ಈ ರಜಾ ದಿನಗಳನ್ನು ಇವರ ರಜಾ ಲೆಕ್ಕದಿಂದ ಕಡಿತಗೊಳಿಸಿ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.`;
    } else if (orderModalType === 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ') {
      const basic = Number(emp.basicPay || 37900);
      const inc = Math.round((basic * 0.03) / 50) * 50 || 1100;
      subj = `ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಕುರಿತು ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 51.\n2. ನೌಕರರ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರ ಸೇವಾ ಪುಸ್ತಕವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಇವರ ಹಿಂದಿನ ಒಂದು ವರ್ಷದ ಸೇವೆ ತೃಪ್ತಿಕರವಾಗಿದ್ದು ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಅಥವಾ ಶಿಸ್ತು ಕ್ರಮ ಬಾಕಿ ಇರುವುದಿಲ್ಲ. ಆದ್ದರಿಂದ ವಾರ್ಷಿಕ ಬಡ್ತಿ ನೀಡಲು ಆದೇಶಿಸಿದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 51 ರನ್ವಯ ದಿನಾಂಕ: ${today} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ₹${basic.toLocaleString('en-IN')}/- ರಿಂದ ₹${(basic + inc).toLocaleString('en-IN')}/- ಗಳಿಗೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`;
    } else if (orderModalType === 'ಹೆಚ್ಚುವರಿ ಪ್ರಭಾರ ಭತ್ಯೆ') {
      subj = `ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} ಇವರಿಗೆ ಹೆಚ್ಚುವರಿ ಹುದ್ದೆಯ ಪ್ರಭಾರ ಹಾಗೂ ಪ್ರಭಾರ ಭತ್ಯೆ ಮಂಜೂರಾತಿ ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 32 ಮತ್ತು 68.\n2. ಆಡಳಿತಾತ್ಮಕ ಹಿತದೃಷ್ಟಿ ಹಾಗೂ ಕಚೇರಿ ಕಡತ ಪರಿಶೀಲನೆ.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದಲ್ಲಿ ಖಾಲಿ ಇರುವ ${orderModalInchargePost} ಹುದ್ದೆಯ ಕರ್ತವ್ಯಗಳನ್ನು ಸುಗಮವಾಗಿ ನಿರ್ವಹಿಸಲು ಆಡಳಿತಾತ್ಮಕ ಹಿತದೃಷ್ಟಿಯಿಂದ ಪ್ರಭಾರ ವಹಿಸುವುದು ಅನಿವಾರ್ಯವಾಗಿರುತ್ತದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ ತಮ್ಮ ಮೂಲ ಕರ್ತವ್ಯದೊಂದಿಗೆ ಹೆಚ್ಚುವರಿಯಾಗಿ ${orderModalInchargePost} ಹುದ್ದೆಯ ಪೂರ್ಣ ಪ್ರಭಾರವನ್ನು ವಹಿಸಲಾಗಿದ್ದು, ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 68 ರನ್ವಯ ನಿಯಮಾನುಸಾರ ಪ್ರಭಾರ ಭತ್ಯೆ ಪಡೆಯಲು ಅನುಮತಿಸಲಾಗಿದೆ.`;
    } else if (orderModalType === 'ಕರ್ತವ್ಯ ನಿಯೋಜನೆ') {
      subj = `ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} ಇವರನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಕರ್ತವ್ಯ ನಿಯೋಜನೆ (Deputation / OOD) ಮಾಡುವ ಕುರಿತು ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಆಡಳಿತಾತ್ಮಕ ಅವಶ್ಯಕತೆ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳ ಶೈಕ್ಷಣಿಕ ಹಿತದೃಷ್ಟಿ.\n2. ಈ ಕಚೇರಿಯ ಕಡತ ಸಂಖ್ಯೆ: ${formData.fileNumber}.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ${orderModalDeputationPlace} ಇಲ್ಲಿ ಬೋಧನಾ ಕರ್ತವ್ಯಗಳಿಗೆ ಶಿಕ್ಷಕರ ಕೊರತೆ ಇರುವುದರಿಂದ ವಿದ್ಯಾರ್ಥಿಗಳ ಹಿತದೃಷ್ಟಿಯಿಂದ ನಿಯೋಜನೆ ಮಾಡುವುದು ಆವಶ್ಯಕವಾಗಿದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರನ್ನು ಸಾರ್ವಜನಿಕ ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಹಿತದೃಷ್ಟಿಯಿಂದ ತಕ್ಷಣದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಮುಂದಿನ ಆದೇಶದವರೆಗೆ ${orderModalDeputationPlace} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಲು ನಿಯೋಜಿಸಲಾಗಿದೆ. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರು ತಕ್ಷಣವೇ ಕರ್ತವ್ಯಕ್ಕೆ ವರದಿ ಮಾಡಿಕೊಳ್ಳತಕ್ಕದ್ದು.`;
    } else {
      subj = `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} ಇವರಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಕಛೇರಿ ಆದೇಶ.`;
      ref = `1. ಈ ಕಚೇರಿಯ ಕಡತ ಪರಿಶೀಲನೆ ಹಾಗೂ ಇಲಾಖಾ ನಿಯಮಾವಳಿಗಳು.`;
      matter = `ಪ್ರಸ್ತಾವನೆ:\nಮೇಲ್ಕಂಡ ನೌಕರರ ಆಡಳಿತಾತ್ಮಕ ಹಾಗೂ ಸೇವಾ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಪರಿಶೀಲನೆ ನಡೆಸಿ ಕೆಳಕಂಡಂತೆ ಆದೇಶಿಸಲಾಗಿದೆ.\n\n:: ಕಛೇರಿ ಆದೇಶ ::\nಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation}, ${emp.officeLocation} ಇವರಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಕಚೇರಿಯ ಆದೇಶವನ್ನು ಹೊರಡಿಸಲಾಗಿದ್ದು, ನಿಯಮಾನುಸಾರ ಪಾಲಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.`;
    }

    setFormData(prev => ({
      ...prev,
      letterType: 'ಕಛೇರಿ ಆದೇಶ',
      subject: subj,
      reference: ref,
      mainContent: matter,
      recipientOfficer: emp.fullName,
      recipientDesignation: emp.designation,
      recipientOffice: emp.officeLocation || emp.placeOfWork || 'ಸರ್ಕಾರಿ ಶಾಲೆ / ಕಚೇರಿ, ಭದ್ರಾವತಿ',
      recipientAddress: 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
    }));

    setIsEmployeeOrderModalOpen(false);
    showToast(`✓ ನೌಕರರ ಮಾಹಿತಿ ಸೇರಿಸಿ ${orderModalType} ಕಛೇರಿ ಆದೇಶ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ!`);
  };

  // Generate Letter (AI or Deterministic with Zero Hallucination)
  const handleGenerateLetter = async () => {
    if (!activeFile && !selectedFileId) {
      showToast('⚠️ ದಯವಿಟ್ಟು ಮೊದಲು ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ!');
      return;
    }

    if (!formData.subject.trim()) {
      showToast('⚠️ ದಯವಿಟ್ಟು ಪತ್ರದ ವಿಷಯವನ್ನು (Subject) ನಮೂದಿಸಿ.');
      return;
    }

    setIsDrafting(true);
    try {
      const payload = {
        ...formData,
        fileId: activeFile?.id || selectedFileId,
        fileNumber: activeFile?.fileNumber || formData.fileNumber,
      };

      const res = await fetch('/api/general-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.letter) {
        setActiveLetterRecord(data.letter);
        showToast('✓ ಪತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧಗೊಂಡಿದೆ ಹಾಗೂ ಕಡತದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!');
        // Refresh versions
        if (data.letter.id) {
          fetchLetterVersions(data.letter.id);
        }
      } else {
        alert(data.error || 'ಪತ್ರ ಸಿದ್ಧಪಡಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ.');
      }
    } catch (err: any) {
      alert('ದೋಷ: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  // Fetch Letter Versions
  const fetchLetterVersions = async (letterId: string) => {
    try {
      const res = await fetch(`/api/letters/${letterId}/versions`);
      const data = await res.json();
      if (data.success && Array.isArray(data.versions)) {
        setVersions(data.versions);
      }
    } catch (e) {}
  };

  // Save as New Version
  const handleSaveAsNewVersion = async () => {
    if (!activeLetterRecord?.id) {
      showToast('⚠️ ಮೊದಲು ಪತ್ರವನ್ನು ತಯಾರಿಸಿ.');
      return;
    }

    try {
      const res = await fetch(`/api/letters/${activeLetterRecord.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeLetterRecord.subject,
          bodyHtml: activeLetterRecord.bodyHtml,
          bodyText: activeLetterRecord.bodyText,
          notes: 'ಬಳಕೆದಾರರಿಂದ ತಿದ್ದುಪಡಿ ಮಾಡಿದ ಹೊಸ ಆವೃತ್ತಿ',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ ಹೊಸ ಆವೃತ್ತಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!');
        fetchLetterVersions(activeLetterRecord.id);
      }
    } catch (err: any) {
      alert('ಆವೃತ್ತಿ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ: ' + err.message);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (verNum: number) => {
    if (!activeLetterRecord?.id) return;
    try {
      const res = await fetch(`/api/letters/${activeLetterRecord.id}/restore-version/${verNum}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.version) {
        setActiveLetterRecord((prev: any) => ({
          ...prev,
          subject: data.version.subject || prev.subject,
          bodyHtml: data.version.body_html || prev.bodyHtml,
          bodyText: data.version.body_text || prev.bodyText,
        }));
        showToast(`✓ ಆವೃತ್ತಿ ${verNum} ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ!`);
        setIsVersionsModalOpen(false);
      }
    } catch (err: any) {
      alert('ಮರುಸ್ಥಾಪಿಸಲು ವಿಫಲವಾಗಿದೆ: ' + err.message);
    }
  };

  // Quick Create File Docket
  const handleQuickCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileData.fileNumber || !newFileData.subject) {
      alert('ಕಡತ ಸಂಖ್ಯೆ ಮತ್ತು ವಿಷಯ ಕಡ್ಡಾಯ.');
      return;
    }

    try {
      if (onCreateDocketFile) {
        await onCreateDocketFile(newFileData);
        setIsCreateFileModalOpen(false);
        showToast('✓ ಹೊಸ ಕಡತ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!');
      } else {
        const res = await fetch('/api/dockets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFileData),
        });
        const data = await res.json();
        if (data.success && data.docket) {
          setSelectedFileId(data.docket.id);
          setIsCreateFileModalOpen(false);
          showToast('✓ ಹೊಸ ಕಡತ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!');
        }
      }
    } catch (err: any) {
      alert('ಕಡತ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ: ' + err.message);
    }
  };

  // Download DOCX
  const handleDownloadDocx = () => {
    if (!activeLetterRecord?.id) {
      showToast('⚠️ ಮೊದಲು ಪತ್ರವನ್ನು ಸಿದ್ಧಪಡಿಸಿ.');
      return;
    }
    const url = `/api/letters/${activeLetterRecord.id}/download-docx?paperSize=${paperSize}`;
    window.location.href = url;
    showToast('✓ Microsoft Word (.docx) ಕಡತ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...');
  };

  // Export File Letters to Excel
  const handleExportFileExcel = () => {
    if (!activeFile?.id) {
      showToast('⚠️ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ.');
      return;
    }
    const url = `/api/files/${activeFile.id}/export-excel`;
    window.location.href = url;
    showToast('✓ ಕಡತದ ಪತ್ರಗಳ Excel ರಿಜಿಸ್ಟರ್ (.xlsx) ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...');
  };

  const isEnglish = formData.language === 'english';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm text-white shadow-xl animate-fade-in border border-stone-700">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mandatory File Docket Banner Check */}
      {(!activeFile || files.length === 0) && (
        <div className="rounded-2xl border-2 border-rose-300 bg-linear-to-r from-rose-50 to-orange-50 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xs">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-950">
                  ಕಡತ ಆಯ್ಕೆ ಕಡ್ಡಾಯ (File Selection Required)
                </h3>
                <p className="text-xs font-semibold text-rose-800">
                  "ದಯವಿಟ್ಟು ಮೊದಲು ಕಡತವನ್ನು ರಚಿಸಿ ಅಥವಾ ಈಗಿರುವ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಂತರ ಪತ್ರವನ್ನು ತಯಾರಿಸಬಹುದು."
                </p>
                <p className="text-[11px] text-stone-600">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿಯ ಕಡತ-ಮೊದಲು (File-First) ನಿಯಮದಂತೆ, ಪ್ರತಿಯೊಂದು ಪತ್ರವು ಅಧಿಕೃತ ಕಡತಕ್ಕೆ ಸೇರಿರಬೇಕು.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateFileModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-700 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-800 active:scale-95 transition-all whitespace-nowrap"
            >
              <FolderPlus className="h-4 w-4" />
              + ಹೊಸ ಕಡತ ರಚಿಸಿ (Create File)
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
              Module: ಸಾಮಾನ್ಯ ಪತ್ರ ತಯಾರಿಕೆ
            </span>
            <span className="text-xs text-stone-500">
              17 ಪತ್ರಗಳ ವಿಧಗಳು • ಶಾಸನಬದ್ಧ ನಿಯಮಗಳ ಕಡ್ಡಾಯವಿಲ್ಲ
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            ಸಾಮಾನ್ಯ ಕಚೇರಿ ಪತ್ರ ರಚನೆ & ನಿರ್ವಹಣಾ ಸ್ಟುಡಿಯೋ
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switch */}
          <div className="flex rounded-lg border border-stone-300 bg-stone-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setFormData({ ...formData, language: 'kannada' })}
              className={`rounded-md px-3 py-1.5 transition-all ${
                formData.language === 'kannada'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
            <button
              onClick={() => setFormData({ ...formData, language: 'english' })}
              className={`rounded-md px-3 py-1.5 transition-all ${
                formData.language === 'english'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              English
            </button>
          </div>

          {/* Optional GO Reference Selector */}
          <button
            onClick={() => setIsGovOrderModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            title="ಸರ್ಕಾರಿ ಆದೇಶ ಅಥವಾ ನಿಯಮ ಉಲ್ಲೇಖ ಸೇರಿಸಲು (ಐಚ್ಛಿಕ)"
          >
            <BookOpen className="h-4 w-4 text-amber-700" />
            + ಸರ್ಕಾರಿ ಆದೇಶ / ನಿಯಮ ಉಲ್ಲೇಖ (ಐಚ್ಛಿಕ)
          </button>
        </div>
      </div>

      {/* Two-Column Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Letter Form (5 cols) */}
        <div className="xl:col-span-5 space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-amber-700" />
              ಪತ್ರದ ವಿವರಗಳು (Letter Details Form)
            </h3>
            <p className="text-xs text-stone-500">
              ಬಳಕೆದಾರರು ನೀಡುವ ಮಾಹಿತಿಯ ಆಧಾರದಲ್ಲಿ ಸ್ವತಂತ್ರವಾಗಿ ಅಧಿಕೃತ ಕಚೇರಿ ಪತ್ರ ರಚನೆಯಾಗುತ್ತದೆ.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Compulsory File Docket Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-900 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-amber-700" />
                  ಕಡತ ಆಯ್ಕೆ (Mandatory File Docket) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreateFileModalOpen(true)}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  ಹೊಸ ಕಡತ
                </button>
              </div>

              <select
                value={selectedFileId}
                onChange={e => setSelectedFileId(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-amber-50/40 p-2.5 font-medium text-stone-900 focus:border-amber-600 focus:outline-hidden"
              >
                {files.map(f => (
                  <option key={f.id} value={f.id}>
                    [{f.fileCode || f.fileNumber}] {f.subject.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Letter Type (18 Types) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-900 block">
                  ಪತ್ರದ ವಿಧ (Letter Type) *
                </label>
                {formData.letterType === 'ಕಛೇರಿ ಆದೇಶ' && (
                  <span className="text-[10px] bg-sky-950 text-amber-300 font-bold px-2 py-0.5 rounded font-mono">
                    OFFICE ORDER
                  </span>
                )}
              </div>
              <select
                value={formData.letterType}
                onChange={e => setFormData({ ...formData, letterType: e.target.value as any })}
                className="w-full rounded-lg border border-stone-300 bg-white p-2.5 font-medium text-stone-900 focus:border-amber-600 focus:outline-hidden"
              >
                {GENERAL_LETTER_TYPES.map(lt => (
                  <option key={lt.type} value={lt.type}>
                    {lt.label}
                  </option>
                ))}
              </select>

              {/* Quick Employee Office Order Launcher Banner */}
              <div className="mt-2.5 p-3 bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-amber-700" />
                    ಕಛೇರಿ ಆದೇಶ & ನೌಕರರ ಮಾಹಿತಿ (Office Order with Employee Master)
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">
                    GPF / ನಗದೀಕರಣ / ಬಡ್ತಿ
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  ನೌಕರರ ಪಟ್ಟಿಯಿಂದ (Employees Master) ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ GPF ಮುಂಗಡ, ಭಾಗಶಃ ಹಿಂಪಡೆಯುವಿಕೆ, ರಜೆ ನಗದೀಕರಣ ಅಥವಾ ಪ್ರಭಾರ ಆದೇಶವನ್ನು 1-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ರಚಿಸಿ.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEmployeeOrderModalOpen(true)}
                  className="w-full py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer text-xs transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>⚡ ಉದ್ಯೋಗಿ ಆಯ್ಕೆಮಾಡಿ ಕಛೇರಿ ಆದೇಶ ರಚಿಸಿ (Select Employee & Create Order)</span>
                </button>
              </div>
            </div>

            {/* 3. Letter Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ದಿನಾಂಕ (Date) *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ಗಡುವು ದಿನಾಂಕ (Deadline - ಐಚ್ಛಿಕ)
                </label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="ಐಚ್ಛಿಕ"
                  className="w-full rounded-lg border border-stone-300 p-2"
                />
              </div>
            </div>

            {/* 4. Recipient Details (ರಿಗೆ / To) */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2.5">
              <span className="font-bold text-stone-900 block">
                ಪತ್ರ ಯಾರಿಗೆ (Recipient - ಇವರಿಗೆ / ರಿಗೆ):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ಅಧಿಕಾರಿಯ ಹೆಸರು & ಹುದ್ದೆ (Officer Name & Designation)"
                  value={formData.recipientOfficer}
                  onChange={e => setFormData({ ...formData, recipientOfficer: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="ಹುದ್ದೆ (Designation, e.g. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು)"
                  value={formData.recipientDesignation}
                  onChange={e => setFormData({ ...formData, recipientDesignation: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs"
                />
              </div>

              <input
                type="text"
                placeholder="ಕಚೇರಿ / ಶಾಲೆಯ ಹೆಸರು (Office / School Name)"
                value={formData.recipientOffice}
                onChange={e => setFormData({ ...formData, recipientOffice: e.target.value })}
                className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs"
              />

              <input
                type="text"
                placeholder="ವಿಳಾಸ / ಸ್ಥಳ (Address / Place)"
                value={formData.recipientAddress}
                onChange={e => setFormData({ ...formData, recipientAddress: e.target.value })}
                className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs"
              />
            </div>

            {/* 5. Subject (ವಿಷಯ) */}
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                ಪತ್ರದ ವಿಷಯ (Subject) *
              </label>
              <textarea
                rows={2}
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="ಪತ್ರದ ವಿಷಯವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ..."
                className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            {/* 6. Reference (ಉಲ್ಲೇಖ - ಐಚ್ಛಿಕ) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-800">
                  ಉಲ್ಲೇಖ (Reference - ಐಚ್ಛಿಕ / Optional)
                </label>
                <span className="text-[10px] text-stone-400">
                  ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ ನಮೂದಿಸಿ
                </span>
              </div>
              <textarea
                rows={2}
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                placeholder="1. ಈ ಕಚೇರಿಯ ಆದೇಶ... (ಖಾಲಿ ಬಿಟ್ಟರೆ ಉಲ್ಲೇಖ ವಿಭಾಗ ಬರುವುದಿಲ್ಲ)"
                className="w-full rounded-lg border border-stone-300 p-2 text-xs"
              />
            </div>

            {/* 7. Main Content (ಪತ್ರದ ಮುಖ್ಯ ವಿಷಯ) */}
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                ಪತ್ರದ ಮುಖ್ಯ ವಿಷಯ (Main Content / Matter) *
              </label>
              <textarea
                rows={4}
                value={formData.mainContent}
                onChange={e => setFormData({ ...formData, mainContent: e.target.value })}
                placeholder="ಪತ್ರದಲ್ಲಿ ತಿಳಿಸಬೇಕಾದ ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..."
                className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            {/* 8. Action Required & Deadline */}
            <div>
              <label className="font-bold text-stone-900 block mb-1">
                ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ (Action to be Taken)
              </label>
              <input
                type="text"
                value={formData.actionRequired}
                onChange={e => setFormData({ ...formData, actionRequired: e.target.value })}
                placeholder="ಉದಾ: ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ ನಿಯಮಾನುಸಾರ ವರದಿ ಸಲ್ಲಿಸತಕ್ಕದ್ದು."
                className="w-full rounded-lg border border-stone-300 p-2 text-xs"
              />
            </div>

            {/* 9. Enclosures & Copies To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ಲಗತ್ತುಗಳು (Enclosures - ಐಚ್ಛಿಕ)
                </label>
                <input
                  type="text"
                  value={formData.enclosures || ''}
                  onChange={e => setFormData({ ...formData, enclosures: e.target.value })}
                  placeholder="ದಾಖಲಾತಿಗಳ ಪಟ್ಟಿ"
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ಪ್ರತಿ ರವಾನೆ (Copies To - ಐಚ್ಛಿಕ)
                </label>
                <input
                  type="text"
                  value={formData.copiesTo || ''}
                  onChange={e => setFormData({ ...formData, copiesTo: e.target.value })}
                  placeholder="ಮಾಹಿತಿಗಾಗಿ / ಕ್ರಮಕ್ಕಾಗಿ ಪ್ರತಿ"
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                />
              </div>
            </div>

            {/* Submit / Generate Button */}
            <button
              onClick={handleGenerateLetter}
              disabled={isDrafting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-700 to-amber-800 py-3 text-sm font-bold text-white shadow-md hover:from-amber-800 hover:to-amber-900 active:scale-98 transition-all disabled:opacity-50"
            >
              {isDrafting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  ಅಧಿಕೃತ ಪತ್ರ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  ✨ ಅಧಿಕೃತ ಪತ್ರ ರಚಿಸಿ (Generate Official Letter)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live A4 Preview & In-line Editor (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
            {/* Paper Size & Zoom */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">ಕಾಗದ:</span>
              <select
                value={paperSize}
                onChange={e => setPaperSize(e.target.value as any)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-xs font-bold text-stone-800"
              >
                <option value="A4">A4 (Standard)</option>
                <option value="Legal">Legal</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>

              <div className="flex items-center border-l border-stone-200 pl-2 gap-1">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                  className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
                  title="ಜೂಮ್ ಔಟ್"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono font-semibold text-stone-700 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                  className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
                  title="ಜೂಮ್ ಇನ್"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveAsNewVersion}
                className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-xs"
                title="ಹೊಸ ಆವೃತ್ತಿಯಾಗಿ ಉಳಿಸಿ"
              >
                <History className="h-3.5 w-3.5 text-amber-700" />
                ಆವೃತ್ತಿ ಉಳಿಸಿ
              </button>

              <button
                onClick={handleDownloadDocx}
                className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Word (.docx)
              </button>

              <button
                onClick={() => setIsPrintPreviewOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 shadow-xs transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                ಪ್ರಿಂಟ್ / PDF
              </button>

              <button
                onClick={handleExportFileExcel}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs transition-colors"
                title="ಈ ಕಡತದ ಎಲ್ಲಾ ಪತ್ರಗಳ Excel ರಿಜಿಸ್ಟರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* A4 Sheet Container */}
          <div className="flex justify-center overflow-x-auto rounded-2xl bg-stone-200/80 p-6 border border-stone-300">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="w-[210mm] min-h-[297mm] bg-white text-stone-900 shadow-2xl p-[20mm] rounded-xs space-y-6 flex flex-col justify-between font-kannada leading-relaxed border border-stone-300 transition-transform"
            >
              <div className="space-y-5">
                {/* 1. Official Canonical Header (Single & No Personal Names) */}
                <div className="text-center space-y-1 border-b-2 border-stone-900 pb-3">
                  {isEnglish ? (
                    <>
                      <div className="text-base font-bold uppercase tracking-wider">
                        Government of Karnataka
                      </div>
                      <div className="text-sm font-semibold">
                        Department of School Education and Literacy
                      </div>
                      <div className="text-base font-bold">
                        Office of the Block Education Officer, Bhadravathi
                      </div>
                      <div className="text-xs text-stone-600">
                        Bhadravathi, Shivamogga District.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold">
                        ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                      </div>
                      <div className="text-sm font-semibold">
                        ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
                      </div>
                      <div className="text-base font-bold text-stone-950">
                        ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು
                      </div>
                      <div className="text-xs text-stone-600">
                        ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ – 577301
                      </div>
                    </>
                  )}
                </div>

                {/* 2. File Number & Date Row */}
                <div className="flex items-center justify-between text-xs font-bold pt-1">
                  <div>
                    {activeLetterRecord?.letterNumber || 
                      (isEnglish 
                        ? `No: A2/PRI.EDU/GEN/${formData.fileNumber || '57'}/2026-27`
                        : `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಸಾ.ಪ/${formData.fileNumber || '57'}/2026-27`)}
                  </div>
                  <div>
                    {isEnglish ? 'Date: ' : 'ದಿನಾಂಕ: '}
                    {formData.date}
                  </div>
                </div>

                {/* 3. Recipient (ರಿಗೆ / To) */}
                <div className="text-xs space-y-0.5 pt-2">
                  <div className="font-bold text-stone-900">
                    {isEnglish ? 'To:' : 'ರಿಗೆ:'}
                  </div>
                  {formData.recipientOfficer && (
                    <div className="font-bold">{formData.recipientOfficer}</div>
                  )}
                  {formData.recipientDesignation && (
                    <div>{formData.recipientDesignation}</div>
                  )}
                  {formData.recipientOffice && (
                    <div>{formData.recipientOffice}</div>
                  )}
                  {formData.recipientAddress && (
                    <div>{formData.recipientAddress}</div>
                  )}
                  {!formData.recipientOfficer && !formData.recipientOffice && (
                    <div className="text-stone-400 italic">
                      [ಸಂಬಂಧಪಟ್ಟ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಅಧಿಕಾರಿಗಳು]
                    </div>
                  )}
                </div>

                {/* 4. Subject (ವಿಷಯ) */}
                <div className="text-xs pt-2">
                  <span className="font-bold">
                    {isEnglish ? 'Subject: ' : 'ವಿಷಯ: '}
                  </span>
                  <span className="font-medium">
                    {formData.subject || '[ಪತ್ರದ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ]'}
                  </span>
                </div>

                {/* 5. Reference (ಉಲ್ಲೇಖ - Only if present) */}
                {formData.reference && formData.reference.trim() && (
                  <div className="text-xs pt-1">
                    <span className="font-bold">
                      {isEnglish ? 'Reference: ' : 'ಉಲ್ಲೇಖ: '}
                    </span>
                    <div className="pl-4 whitespace-pre-line text-stone-800">
                      {formData.reference}
                    </div>
                  </div>
                )}

                {/* Salutation or Office Order Heading */}
                {formData.letterType === 'ಕಛೇರಿ ಆದೇಶ' ? (
                  <div className="text-center py-2.5 my-2 bg-stone-100/80 border-y-2 border-stone-800">
                    <span className="text-sm font-bold tracking-widest uppercase text-stone-950 font-kannada">
                      :: ಕಛೇರಿ ಆದೇಶ ::
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-bold pt-2">
                    {isEnglish ? 'Sir / Madam,' : 'ಮಾನ್ಯರೇ,'}
                  </div>
                )}

                {/* 6. Letter Body (Directly Editable) */}
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const text = e.currentTarget.innerText;
                    if (activeLetterRecord) {
                      setActiveLetterRecord({ ...activeLetterRecord, bodyText: text });
                    }
                  }}
                  className="text-xs leading-relaxed text-stone-900 space-y-3 min-h-[120px] outline-hidden focus:ring-1 focus:ring-amber-500 rounded p-1"
                >
                  {activeLetterRecord?.bodyText ? (
                    activeLetterRecord.bodyText.split('\n\n').map((p: string, idx: number) => (
                      <p key={idx} className="indent-8 text-justify">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="indent-8 text-justify">
                      {formData.mainContent || 
                        'ಮೇಲ್ಕಂಡ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಕಚೇರಿಯ ಅಧಿಕೃತ ಕಡತ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ವಿಷಯಗಳ ಕುರಿತು ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಕ್ರಮ ಕೈಗೊಳ್ಳಲು ಈ ಮೂಲಕ ನಿರ್ದೇಶಿಸಲಾಗಿದೆ.'}
                    </p>
                  )}
                </div>

                {/* Enclosures (if any) */}
                {formData.enclosures && (
                  <div className="text-xs pt-2">
                    <span className="font-bold">
                      {isEnglish ? 'Enclosures: ' : 'ಲಗತ್ತುಗಳು: '}
                    </span>
                    <span>{formData.enclosures}</span>
                  </div>
                )}
              </div>

              {/* Bottom: Signatory Block & Endorsements */}
              <div className="space-y-4 pt-8">
                {/* Signature Block (Right aligned) */}
                <div className="flex justify-end">
                  <div className="text-center text-xs space-y-1 min-w-[200px]">
                    <div className="h-10"></div>
                    <div className="text-[11px] text-stone-600 mb-2">ತಮ್ಮ ನಂಬುಗೆಯ,</div>
                    <div className="font-bold text-stone-950 text-sm">
                      ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು
                    </div>
                    <div className="font-semibold text-stone-800">
                      ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು
                    </div>
                  </div>
                </div>

                {/* Copy To (Endorsements) */}
                {formData.copiesTo && (
                  <div className="text-[11px] text-stone-700 border-t border-stone-200 pt-3 space-y-0.5">
                    <div className="font-bold">
                      {isEnglish ? 'Copy To:' : 'ಪ್ರತಿ ರವಾನೆ:'}
                    </div>
                    <div className="whitespace-pre-line pl-2">
                      {formData.copiesTo}
                    </div>
                  </div>
                )}

                {/* Page Numbering Footer */}
                <div className="text-center text-[10px] text-stone-400 border-t border-stone-100 pt-2 font-mono">
                  Page 1 of 1 • BEO Bhadravathi E-Office
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gov Order / Statutory Rule Selector Modal */}
      <GovOrderSelectorModal
        isOpen={isGovOrderModalOpen}
        onClose={() => setIsGovOrderModalOpen(false)}
        onSelectReference={(citation) => {
          setFormData(prev => {
            const currentRef = prev.reference ? prev.reference.trim() : '';
            const nextNo = currentRef ? currentRef.split('\n').length + 1 : 1;
            const line = `${nextNo}. ${citation}`;
            return {
              ...prev,
              reference: currentRef ? `${currentRef}\n${line}` : line,
            };
          });
          showToast('✓ ಉಲ್ಲೇಖವನ್ನು ಪತ್ರಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!');
        }}
        onSelectSubject={(subj) => {
          setFormData(prev => ({ ...prev, subject: subj }));
          showToast('✓ ವಿಷಯಕ್ಕೆ ಉಲ್ಲೇಖವನ್ನು ಅಳವಡಿಸಲಾಗಿದೆ!');
        }}
        onSelectBody={(clause) => {
          setFormData(prev => ({
            ...prev,
            mainContent: prev.mainContent ? `${prev.mainContent}\n\n${clause}` : clause,
          }));
          showToast('✓ ಪತ್ರದ ಒಡಲಿಗೆ ನಿಯಮದ ಷರತ್ತು ಸೇರಿಸಲಾಗಿದೆ!');
        }}
      />

      {/* Quick Create File Modal */}
      {isCreateFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-amber-700" />
                ಹೊಸ ಕಡತ ರಚಿಸಿ (Create File Docket)
              </h3>
              <button
                onClick={() => setIsCreateFileModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateFile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ಕಡತ ಸಂಖ್ಯೆ (File Number) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ಉದಾ: 58 ಅಥವಾ ಆ2/ಕಡತ-58/2026"
                  value={newFileData.fileNumber}
                  onChange={e => setNewFileData({ ...newFileData, fileNumber: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  ಕಡತದ ವಿಷಯ (File Subject) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ಕಡತದ ಮುಖ್ಯ ಉದ್ದೇಶ ಹಾಗೂ ವಿಷಯ..."
                  value={newFileData.subject}
                  onChange={e => setNewFileData({ ...newFileData, subject: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    ವಿಭಾಗ ಕೋಡ್ (Section Code)
                  </label>
                  <input
                    type="text"
                    value={newFileData.sectionCode}
                    onChange={e => setNewFileData({ ...newFileData, sectionCode: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    ಆದ್ಯತೆ (Priority)
                  </label>
                  <select
                    value={newFileData.priority}
                    onChange={e => setNewFileData({ ...newFileData, priority: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 p-2"
                  >
                    <option value="Routine">ಸಾಮಾನ್ಯ (Routine)</option>
                    <option value="Urgent">ತುರ್ತು (Urgent)</option>
                    <option value="Immediate">ತಕ್ಷಣ (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFileModalOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-700 px-5 py-2 text-xs font-bold text-white hover:bg-amber-800"
                >
                  ಕಡತ ರಚಿಸಿ (Create)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Office Order Selection & Template Modal */}
      {isEmployeeOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-sans">
                    ನೌಕರರ ಮಾಹಿತಿ ಸೇರಿಸಿ ಕಛೇರಿ ಆದೇಶ ಸೃಜನೆ (Employee Office Order Generator)
                  </h3>
                  <p className="text-xs text-stone-500">
                    GPF ಮುಂಗಡ, ಭಾಗಶಃ ಹಿಂಪಡೆಯುವಿಕೆ, ರಜೆ ನಗದೀಕರಣ ಹಾಗೂ ಸೇವಾ ಆದೇಶಗಳನ್ನು ನೌಕರರ ಪಟ್ಟಿಯಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmployeeOrderModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. Select Order Type */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5 font-kannada">
                1. ಕಛೇರಿ ಆದೇಶದ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ (Select Office Order Type) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'GPF ಮುಂಗಡ', label: 'GPF ತಾತ್ಕಾಲಿಕ ಮುಂಗಡ', badge: 'KGPF Rule 10/12' },
                  { id: 'GPF ಭಾಗಶಃ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ', label: 'GPF ಭಾಗಶಃ ಹಿಂಪಡೆಯುವಿಕೆ', badge: 'KGPF Rule 13' },
                  { id: 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ', label: 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ', badge: '15 ದಿನ / KCSR 118' },
                  { id: 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ', label: 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ', badge: 'KCSR Rule 51' },
                  { id: 'ಹೆಚ್ಚುವರಿ ಪ್ರಭಾರ ಭತ್ಯೆ', label: 'ಹೆಚ್ಚುವರಿ ಪ್ರಭಾರ ಭತ್ಯೆ', badge: 'KCSR Rule 32/68' },
                  { id: 'ಕರ್ತವ್ಯ ನಿಯೋಜನೆ', label: 'ಕರ್ತವ್ಯ ನಿಯೋಜನೆ (OOD)', badge: 'ಶೈಕ್ಷಣಿಕ ನಿಯೋಜನೆ' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOrderModalType(item.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      orderModalType === item.id
                        ? 'border-amber-700 bg-amber-50 font-bold text-amber-950 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-400 bg-white text-stone-800'
                    }`}
                  >
                    <div className="font-bold text-stone-900">{item.label}</div>
                    <div className="text-[10px] text-amber-800 font-mono mt-0.5">{item.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Employee from Employee Master */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-800 font-kannada">
                  2. ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Employee from Master) *
                </label>
                <span className="text-[11px] text-stone-500">
                  ಒಟ್ಟು: {employees.length} ನೌಕರರು
                </span>
              </div>

              {/* Quick Search Bar */}
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="ನೌಕರರ ಹೆಸರು, ಕೆಜಿಐಡಿ ಅಥವಾ ಶಾಲೆ ಹುಡುಕಿ..."
                  value={orderModalSearchQuery}
                  onChange={e => setOrderModalSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 pl-8 pr-3 py-1.5 text-xs focus:border-amber-600 focus:outline-hidden"
                />
                <Search className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={orderModalEmployeeId}
                onChange={e => {
                  setOrderModalEmployeeId(e.target.value);
                  const matched = employees.find(emp => emp.id === e.target.value);
                  if (matched && matched.gpfCreditBalance) {
                    setOrderModalGpfBalance(matched.gpfCreditBalance);
                  }
                }}
                className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-hidden"
                size={4}
              >
                {employees
                  .filter(emp => {
                    if (!orderModalSearchQuery) return true;
                    const q = orderModalSearchQuery.toLowerCase();
                    return (
                      (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
                      (emp.kgidNumber && emp.kgidNumber.toLowerCase().includes(q)) ||
                      (emp.designation && emp.designation.toLowerCase().includes(q)) ||
                      (emp.officeLocation && emp.officeLocation.toLowerCase().includes(q))
                    );
                  })
                  .map(emp => (
                    <option key={emp.id} value={emp.id} className="py-1 px-2 hover:bg-amber-100">
                      {emp.fullName} — {emp.designation} (KGID: {emp.kgidNumber || emp.employeeCode || '—'}) • {emp.officeLocation || emp.placeOfWork || 'ಭದ್ರಾವತಿ'}
                    </option>
                  ))}
              </select>
            </div>

            {/* 3. Conditional Parameters according to Order Type */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <span className="block font-bold text-xs text-stone-900 border-b border-stone-200 pb-1">
                ಆದೇಶದ ನಿರ್ದಿಷ್ಟ ಷರತ್ತುಗಳು (Specific Order Parameters):
              </span>

              {orderModalType === 'GPF ಮುಂಗಡ' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಮುಂಗಡ ಮೊತ್ತ (Advance Amount ₹)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={orderModalGpfAmount}
                      onChange={e => setOrderModalGpfAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಮರುಪಾವತಿ ಕಂತುಗಳು (Installments)
                    </label>
                    <select
                      value={orderModalInstallments}
                      onChange={e => setOrderModalInstallments(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 p-2 font-mono font-semibold"
                    >
                      <option value={12}>12 ತಿಂಗಳ ಕಂತುಗಳು</option>
                      <option value={24}>24 ತಿಂಗಳ ಕಂತುಗಳು (Standard)</option>
                      <option value={36}>36 ತಿಂಗಳ ಕಂತುಗಳು</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಮಾಸಿಕ ಕಡಿತ (Monthly Recovery)
                    </label>
                    <div className="p-2 bg-white rounded-lg border border-stone-300 font-mono font-bold text-sky-950">
                      ₹{Math.round(orderModalGpfAmount / orderModalInstallments).toLocaleString('en-IN')}/-
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಮುಂಗಡ ಪಡೆಯುವ ಉದ್ದೇಶ (Purpose / Reason)
                    </label>
                    <input
                      type="text"
                      value={orderModalPurpose}
                      onChange={e => setOrderModalPurpose(e.target.value)}
                      placeholder="ಉದಾ: ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ / ಕೌಟುಂಬಿಕ ತುರ್ತು ಅಗತ್ಯ / ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ"
                      className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {orderModalType === 'GPF ಭಾಗಶಃ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಖಾತೆಯಲ್ಲಿನ ಒಟ್ಟು ಶಿಲ್ಕು (GPF Credit Balance ₹)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={orderModalGpfBalance}
                      onChange={e => setOrderModalGpfBalance(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಭಾಗಶಃ ಅಂತಿಮ ಮೊತ್ತ (Sanctioned Withdrawal ₹)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={orderModalGpfWithdrawal}
                      onChange={e => setOrderModalGpfWithdrawal(Number(e.target.value))}
                      className="w-full rounded-lg border border-emerald-400 bg-emerald-50/50 p-2 font-mono font-bold text-emerald-950"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಭಾಗಶಃ ಹಿಂಪಡೆಯುವ ಉದ್ದೇಶ (Rule 13 Purpose)
                    </label>
                    <input
                      type="text"
                      value={orderModalPurpose}
                      onChange={e => setOrderModalPurpose(e.target.value)}
                      placeholder="ಉದಾ: ಸ್ವಂತ ಮನೆ ನಿರ್ಮಾಣ / ನಿವೇಶನ ಖರೀದಿ / ಮಗಳ ಮದುವೆ ವೆಚ್ಚ"
                      className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {orderModalType === 'ಹೆಚ್ಚುವರಿ ಪ್ರಭಾರ ಭತ್ಯೆ' && (
                <div className="text-xs space-y-2">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ಹೆಚ್ಚುವರಿ ಹುದ್ದೆ & ಶಾಲೆ (In-charge Post & School)
                    </label>
                    <input
                      type="text"
                      value={orderModalInchargePost}
                      onChange={e => setOrderModalInchargePost(e.target.value)}
                      placeholder="ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಭದ್ರಾವತಿ"
                      className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {orderModalType === 'ಕರ್ತವ್ಯ ನಿಯೋಜನೆ' && (
                <div className="text-xs space-y-2">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      ನಿಯೋಜಿತ ಶಾಲೆ / ಕಚೇರಿ (Deputed Place of Work)
                    </label>
                    <input
                      type="text"
                      value={orderModalDeputationPlace}
                      onChange={e => setOrderModalDeputationPlace(e.target.value)}
                      placeholder="ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ"
                      className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEmployeeOrderModalOpen(false)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = employees.find(e => e.id === orderModalEmployeeId) || employees[0];
                  if (!sel) {
                    alert('ದಯವಿಟ್ಟು ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ.');
                    return;
                  }
                  handleApplyOfficeOrderTemplate(sel);
                }}
                className="px-5 py-2 bg-linear-to-r from-amber-700 to-amber-800 text-white font-bold rounded-lg text-xs hover:from-amber-800 hover:to-amber-900 shadow-md flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>ಈ ಕಛೇರಿ ಆದೇಶವನ್ನು ಪತ್ರಕ್ಕೆ ಅನ್ವಯಿಸಿ (Apply Order)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {isPrintPreviewOpen && (
        <PrintPreviewModal
          isOpen={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          letter={{
            ...activeLetterRecord,
            letterNumber: activeLetterRecord?.letterNumber || `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಸಾ.ಪ/${formData.fileNumber}/2026-27`,
            date: formData.date,
            subject: formData.subject,
            reference: formData.reference,
            recipient: formData.recipientOfficer ? `${formData.recipientOfficer}\n${formData.recipientOffice}` : formData.recipientOffice,
            bodyHtml: activeLetterRecord?.bodyHtml || `<p class="indent-8 text-justify leading-relaxed">${formData.mainContent || 'ಕಚೇರಿ ಆಡಳಿತಾತ್ಮಕ ವಿಷಯ.'}</p>`,
            endorsements: formData.copiesTo ? formData.copiesTo.split('\n') : [],
          }}
          printSettings={{
            paperSize,
            fontFamily: isEnglish ? 'Arial' : 'Noto Sans Kannada',
            showHeader: true,
            showFooter: true,
          }}
        />
      )}
    </div>
  );
};
