import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Copy,
  Save,
  RefreshCw,
  Sparkles,
  History,
  Eye,
  Edit3,
  Sliders,
  Search,
  Trash2,
  RotateCcw,
  Building2,
  Calendar,
  User,
  ShieldAlert,
  ChevronRight,
  Check,
  Award,
  BookOpen,
  ArrowRight,
  Layers,
  FileCheck2,
  Users,
} from 'lucide-react';
import { 
  GeneratedOfficeLetter, 
  OcrExtractedData, 
  LetterVersion, 
  OfficeLetterTemplate,
  LetterFormattingOptions,
  Employee
} from '../types';
import { StatutoryRuleSelectorModal } from './StatutoryRuleSelectorModal';
import { KARNATAKA_STATUTORY_RULES, StatutoryRule } from '../data/karnatakaStatutoryBooks';

interface OfficialLetterStudioProps {
  currentUser?: { displayName: string; role: string } | null;
  employees?: Employee[];
  onSaveToRegistry?: (letterData: any) => Promise<void>;
  prefilledLetter?: any;
}

// 12 Standard Karnataka Government Office Letter Types
const KARNATAKA_LETTER_TYPES = [
  {
    key: 'normal',
    title: 'ಸಾಮಾನ್ಯ ಪತ್ರ',
    english: 'Normal Official Letter',
    desc: 'ಅಧಿಕೃತ ಕಚೇರಿ ಪತ್ರ ವ್ಯವಹಾರ, ಸ್ಪಷ್ಟೀಕರಣ ಹಾಗೂ ಮಾಹಿತಿ ಕೋರಿಕೆ',
    category: 'ಸಾಮಾನ್ಯ',
    iconColor: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    key: 'memorandum',
    title: 'ಜ್ಞಾಪನಾ ಆದೇಶ',
    english: 'Memorandum Order',
    desc: 'ನೌಕರರ ಸೇವೆ, ಭತ್ಯೆ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆಗಳ ಅಧಿಕೃತ ಜ್ಞಾಪನ',
    category: 'ಆದೇಶಗಳು',
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    key: 'office_order',
    title: 'ಕಚೇರಿ ಆದೇಶ',
    english: 'Office Order',
    desc: 'ಕಚೇರಿಯ ಆಂತರಿಕ ಕರ್ತವ್ಯ ಹಂಚಿಕೆ, ಪ್ರಭಾರ ವಹಿಸುವಿಕೆ ಹಾಗೂ ನಿಯೋಜನೆ',
    category: 'ಆದೇಶಗಳು',
    iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    key: 'earned_leave',
    title: 'ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ',
    english: 'Earned Leave Order',
    desc: 'KCSR ನಿಯಮಾವಳಿ 112 ರಂತೆ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಹಾಗೂ ಲೆಕ್ಕ ನಮೂದು',
    category: 'ರಜೆ ಆದೇಶ',
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    key: 'child_care_leave',
    title: 'ಶಿಶುಪಾಲನ ರಜೆ ಆದೇಶ',
    english: 'Child Care Leave (CCL)',
    desc: 'ಮಹಿಳಾ ನೌಕರರಿಗೆ ಗರಿಷ್ಠ 120 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ',
    category: 'ರಜೆ ಆದೇಶ',
    iconColor: 'text-pink-600 bg-pink-50 border-pink-200',
  },
  {
    key: 'increment_10',
    title: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿ',
    english: '10-Year Time Bound Promotion',
    desc: 'ಸತತ 10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಮುಂದಿನ ವೇತನ ಶ್ರೇಣಿ',
    category: 'ವೇತನ ಬಡ್ತಿ',
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    key: 'increment_15',
    title: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ಬಡ್ತಿ',
    english: '15-Year Automatic Promotion',
    desc: '15 ವರ್ಷಗಳ ಸೇವೆಗೆ ಸ್ವಯಂ ಚಾಲಿತ ಬಡ್ತಿ ಹಾಗೂ ವೇತನ ನಿಗದಿ',
    category: 'ವೇತನ ಬಡ್ತಿ',
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    key: 'increment_20',
    title: '20/25/30 ವರ್ಷಗಳ ಹೆಚ್ಚುವರಿ ಬಡ್ತಿ',
    english: 'Additional Increment',
    desc: 'ದೀರ್ಘಾವಧಿ ಸೇವೆ ಸಲ್ಲಿಸಿದ ನೌಕರರಿಗೆ ಹೆಚ್ಚುವರಿ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ',
    category: 'ವೇತನ ಬಡ್ತಿ',
    iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
  },
  {
    key: 'service_certificate',
    title: 'ಸೇವಾ ದೃಢೀಕರಣ / NOC',
    english: 'Service Certificate & NOC',
    desc: 'ಪಾಸ್‌ಪೋರ್ಟ್, ಸಾಲ, ಅಥವಾ ಉನ್ನತ ವ್ಯಾಸಂಗಕ್ಕಾಗಿ ಸೇವಾ ಪ್ರಮಾಣ ಪತ್ರ',
    category: 'ಪ್ರಮಾಣ ಪತ್ರ',
    iconColor: 'text-stone-600 bg-stone-50 border-stone-200',
  },
  {
    key: 'experience_cert',
    title: 'ಅನುಭವ ಪ್ರಮಾಣ ಪತ್ರ',
    english: 'Experience Certificate',
    desc: 'ನೌಕರರ ಸೇವಾ ಹಿರಿತನ ಮತ್ತು ಕಾರ್ಯಾನುಭವ ದೃಢೀಕರಣ ಪತ್ರ',
    category: 'ಪ್ರಮಾಣ ಪತ್ರ',
    iconColor: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    key: 'notice_inquiry',
    title: 'ಇಲಾಖಾ ವಿಚಾರಣೆ / ನೋಟಿಸ್',
    english: 'Inquiry Notice / Call Letter',
    desc: 'ಕರ್ತವ್ಯಲೋಪ ಅಥವಾ ಸ್ಪಷ್ಟೀಕರಣ ಕೋರಿ ನೀಡಲಾಗುವ ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್',
    category: 'ನೋಟಿಸ್',
    iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    key: 'custom',
    title: 'ಕಸ್ಟಮ್ ಪತ್ರ',
    english: 'Custom Government Letter',
    desc: 'ನಿಮ್ಮದೇ ನಿರ್ದಿಷ್ಟ ಸೂಚನೆಗಳ ಆಧಾರದ ಮೇಲೆ ಕಸ್ಟಮ್ ಪತ್ರ ರಚನೆ',
    category: 'ಇತರೆ',
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
];

// Quick Prompt Chips
const PROMPT_SUGGESTIONS = [
  '7 ದಿನಗಳ ಕಾಲಮಿತಿಯೊಳಗೆ ನಿಖರ ವರದಿ ಹಾಗೂ ದಾಖಲಾತಿಗಳನ್ನು ಸಲ್ಲಿಸಲು ಕಟ್ಟುನಿಟ್ಟಿನ ಸೂಚನೆ ನೀಡಿ.',
  'ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕದ ಮೂಲ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ರಜೆ ಶಿಲ್ಕು ಖಚಿತಪಡಿಸಿ ಆದೇಶಿಸಿ.',
  'ಕರ್ನಾಟಕ ನಾಗರೀಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳ ಷರತ್ತುಗಳ ಅನ್ವಯ 10 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರು ಮಾಡಿ.',
  '10 ವರ್ಷಗಳ ಸೇವಾ ದಾಖಲಾತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು ನಿಯಮಾನುಸಾರ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ನಿಗದಿಪಡಿಸಿ.',
  'ಪಾಸ್‌ಪೋರ್ಟ್ ಪಡೆಯಲು ಕಛೇರಿಯಿಂದ ಯಾವುದೇ ಆಕ್ಷೇಪಣೆ ಇಲ್ಲವೆಂದು (NOC) ಸೇವಾ ದೃಢೀಕರಣ ಪತ್ರ ಸಿದ್ಧಪಡಿಸಿ.',
  'ಹಣಕಾಸು ಉಪಶೀರ್ಷಿಕೆ 2202 ರಡಿ ಅನುದಾನ ಬಳಕೆಯ ಪ್ರಮಾಣ ಪತ್ರ (UC) ಸಲ್ಲಿಸಲು ಆದೇಶಿಸಿ.',
];

export const OfficialLetterStudio: React.FC<OfficialLetterStudioProps> = ({
  currentUser = { displayName: 'admin', role: 'Admin' },
  employees = [],
  onSaveToRegistry,
  prefilledLetter,
}) => {
  // Dynamic DDO Signatory from isDdo flag in employees list
  const ddoEmp = employees?.find(e => e.isDdo === true) || 
                 employees?.find(e => e.designation?.toLowerCase().includes('ddo')) ||
                 employees?.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
  const fallbackSignatoryName = ddoEmp?.fullName || 'ಹೆಚ್. ರವಿಕುಮಾರ್';
  const fallbackSignatoryDesig = ddoEmp?.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ';
  const fallbackSignatoryOffice = ddoEmp?.placeOfWork || ddoEmp?.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು';

  // Navigation Steps: 1: Upload, 2: OCR Review, 3: Letter Type & Prompt, 4: Live Editor & Preview
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [empSearchFilter, setEmpSearchFilter] = useState<string>('');

  // Step 1: Upload & Preview state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
    pageCount?: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isReadingOcr, setIsReadingOcr] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: OCR Extracted Fields
  const [ocrData, setOcrData] = useState<OcrExtractedData>({
    letterNumber: '',
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    kgidNumber: '',
    designation: '',
    officeName: '',
    department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ (School Education Department)',
    subject: '',
    reference: '',
    serviceDetails: '',
    leaveDetails: '',
    salaryDetails: '',
    otherInfo: '',
    rawText: '',
    confidence: 'High',
    missingCriticalFields: [],
    safetyWarning: '',
  });
  const [isOcrVerified, setIsOcrVerified] = useState<boolean>(false);

  // Step 3: Selection & Prompt
  const [selectedType, setSelectedType] = useState<string>('ಸಾಮಾನ್ಯ ಪತ್ರ');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [customLetterNo, setCustomLetterNo] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Step 4: Live Generation & Editor
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'editor' | 'versions' | 'history'>('preview');
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedOfficeLetter | null>(null);

  // Clean bodyHtml to prevent duplicate headers, duplicate subjects/dates, or removed officer names
  const cleanRenderedBodyHtml = useMemo(() => {
    if (!generatedLetter) return '';
    const raw = generatedLetter.bodyHtml || generatedLetter.bodyText || '';
    if (!raw) return '';

    let cleaned = raw;

    // 1. Remove duplicate top header container or paragraphs (ಕರ್ನಾಟಕ ಸರ್ಕಾರ, ಇಲಾಖೆ, ಕಛೇರಿ, ವಿಳಾಸ)
    cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?ಕರ್ನಾಟಕ ಸರ್ಕಾರ[\s\S]*?<\/div>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?<strong>\s*ಕರ್ನಾಟಕ ಸರ್ಕಾರ[\s\S]*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?ಕರ್ನಾಟಕ ಸರ್ಕಾರ[\s\S]*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?ಶಾಲಾ ಶಿಕ್ಷಣ[\s\S]*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ[\s\S]*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?ಬಿ\.ಹೆಚ್\.\s*ರಸ್ತೆ[\s\S]*?<\/p>/gi, '');

    // 2. Remove duplicate letter number / date lines
    cleaned = cleaned.replace(/<div[^>]*>[\s\S]*?(?:ಸಂಖ್ಯೆ|ಜ್ಞಾಪನ ಸಂಖ್ಯೆ|ಕ್ರ\.ಸಂಖ್ಯೆ|ಆದೇಶ ಸಂಖ್ಯೆ):[\s\S]*?ದಿನಾಂಕ:[\s\S]*?<\/div>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?(?:ಸಂಖ್ಯೆ|ಜ್ಞಾಪನ ಸಂಖ್ಯೆ|ಕ್ರ\.ಸಂಖ್ಯೆ|ಆದೇಶ ಸಂಖ್ಯೆ):[\s\S]*?ದಿನಾಂಕ:[\s\S]*?<\/p>/gi, '');

    // 3. Remove duplicate subject, reference, and preamble lines if already rendered in header
    if (generatedLetter.subject) {
      cleaned = cleaned.replace(/<p[^>]*>\s*<strong>\s*ವಿಷಯ:\s*<\/strong>[\s\S]*?<\/p>/gi, '');
    }
    if (generatedLetter.reference) {
      cleaned = cleaned.replace(/<p[^>]*>\s*<strong>\s*ಉಲ್ಲೇಖ:\s*<\/strong>[\s\S]*?<\/p>/gi, '');
    }
    if (generatedLetter.preamble) {
      cleaned = cleaned.replace(/<p[^>]*>\s*<strong>\s*ಪ್ರಸ್ತಾವನೆ:\s*<\/strong>[\s\S]*?<\/p>/gi, '');
    }

    // 4. Remove any occurrence of Sri S.K. Ravindranath
    cleaned = cleaned.replace(/ಶ್ರೀ\s*ಎಸ್\.\s*ಕೆ\.\s*ರವೀಂದ್ರನಾಥ್[,\s]*ಕೆ\.ಇ\.ಎಸ್\./gi, 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು');
    cleaned = cleaned.replace(/ಎಸ್\.\s*ಕೆ\.\s*ರವೀಂದ್ರನಾಥ್/gi, 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು');

    // 5. Remove duplicate bottom signature block if present in bodyHtml
    cleaned = cleaned.replace(/<p[^>]*text-align:\s*right[^>]*>[\s\S]*?ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು[\s\S]*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<div[^>]*text-align:\s*right[^>]*>[\s\S]*?ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು[\s\S]*?<\/div>/gi, '');

    return cleaned.trim();
  }, [generatedLetter?.bodyHtml, generatedLetter?.bodyText, generatedLetter?.subject, generatedLetter?.reference, generatedLetter?.preamble]);

  // Formatting State
  const [formatting, setFormatting] = useState<LetterFormattingOptions>({
    fontFamily: 'font-sans',
    fontSize: '12pt',
    lineSpacing: '1.5',
    margins: 'standard',
    hasHeader: true,
    hasFooter: true,
  });

  // Saved Letters Registry
  const [savedLetters, setSavedLetters] = useState<GeneratedOfficeLetter[]>([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newVersionNotes, setNewVersionNotes] = useState<string>('');
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);

  // Notification helper
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KCSR, KFC, CCA Statutory Rule Selector Modal State & Handlers
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState<boolean>(false);

  const handleInsertStatutoryRef = (citation: string, rule: StatutoryRule) => {
    if (generatedLetter) {
      const currentRef = generatedLetter.reference ? generatedLetter.reference.trim() : '';
      const lines = currentRef ? currentRef.split('\n') : [];
      const newRef = currentRef ? `${currentRef}\n${lines.length + 1}. ${citation}` : `1. ${citation}`;
      setGeneratedLetter({ ...generatedLetter, reference: newRef });
    } else {
      setUserPrompt(prev => prev ? `${prev}\n[ಉಲ್ಲೇಖ: ${citation}]` : `ಉಲ್ಲೇಖ: ${citation}`);
    }
    showNotification(`ಉಲ್ಲೇಖಕ್ಕೆ "${rule.ruleNumber}" (${rule.book}) ಸೇರಿಸಲಾಗಿದೆ!`);
  };

  const handleInsertStatutorySubject = (subject: string, rule: StatutoryRule) => {
    if (generatedLetter) {
      setGeneratedLetter({ ...generatedLetter, subject: subject });
    } else {
      setUserPrompt(prev => prev ? `${subject}\n${prev}` : subject);
    }
    showNotification(`ವಿಷಯಕ್ಕೆ "${rule.ruleNumber}" ಅಳವಡಿಸಲಾಗಿದೆ!`);
  };

  const handleInsertStatutoryBody = (orderClause: string, rule: StatutoryRule) => {
    if (generatedLetter) {
      const currentBody = generatedLetter.bodyHtml || generatedLetter.bodyText || '';
      const newBody = `${currentBody}<p>${orderClause}</p>`;
      setGeneratedLetter({ ...generatedLetter, bodyHtml: newBody });
    } else {
      setUserPrompt(prev => prev ? `${prev}\n${orderClause}` : orderClause);
    }
    showNotification(`ಪತ್ರಕ್ಕೆ "${rule.ruleNumber}" ನಿಯಮದ ಷರತ್ತು ಸೇರಿಸಲಾಗಿದೆ!`);
  };

  // Fetch saved letters from backend
  const fetchLetters = async () => {
    try {
      setIsLoadingRegistry(true);
      const res = await fetch('/api/letter-maker/letters');
      const data = await res.json();
      if (res.ok && data.letters) {
        setSavedLetters(data.letters);
      }
    } catch (err) {
      console.error('Failed to fetch saved letters:', err);
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // Handle File Drag and Selection
  const processUploadedFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const fileInfo = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/pdf',
        dataUrl,
        pageCount: 1,
      };
      setUploadedFile(fileInfo);
      runOcrProcess(fileInfo);
    };
    reader.readAsDataURL(file);
  };

  // Run OCR on the uploaded document
  const runOcrProcess = async (
    fileInfo: { name: string; type: string; dataUrl: string },
    sampleScenario?: string
  ) => {
    setIsReadingOcr(true);
    try {
      const res = await fetch('/api/letter-maker/ocr-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileInfo.dataUrl,
          fileName: fileInfo.name,
          mimeType: fileInfo.type,
          sampleScenario,
        }),
      });
      const data = await res.json();
      if (res.ok && data.extractedData) {
        setOcrData(data.extractedData);
        if (data.extractedData.letterNumber) {
          setCustomLetterNo(data.extractedData.letterNumber);
        }
        if (data.extractedData.date) {
          setCustomDate(data.extractedData.date);
        }
        setIsOcrVerified(false);
        setCurrentStep(2);
        showNotification('ದಾಖಲೆ ಓದುವಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ (OCR Extracted). ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.');
      } else {
        throw new Error(data.error || 'ದಾಖಲೆ ಓದುವಿಕೆಯಲ್ಲಿ ದೋಷ');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('ದಾಖಲೆ ಓದುವಿಕೆಯಲ್ಲಿ ದೋಷ: ' + err.message);
    } finally {
      setIsReadingOcr(false);
    }
  };

  // Quick Sample Loader
  const handleLoadSample = (scenario: string) => {
    const scenarioNames: Record<string, string> = {
      leave_application: 'ರಜೆ_ಅರ್ಜಿ_ನಮೂನೆ_ರಮೇಶ್_ಎನ್.pdf',
      increment_proposal: 'ಕಾಲಮಿತಿ_ವೇತನ_ಬಡ್ತಿ_ಪ್ರಸ್ತಾವನೆ_ಮಂಜುಳಾ.pdf',
      service_certificate: 'ಸೇವಾ_ಪ್ರಮಾಣ_ಪತ್ರ_ಕೋರಿಕೆ_ಆನಂದ್.pdf',
    };
    const fileName = scenarioNames[scenario] || 'ಅಧಿಕೃತ_ದಾಖಲೆ.pdf';
    const mockFile = {
      name: fileName,
      size: '245.0 KB',
      type: 'application/pdf',
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
      pageCount: 1,
    };
    setUploadedFile(mockFile);
    runOcrProcess(mockFile, scenario);
  };

  // Generate Letter Handler
  const handleGenerateLetter = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/letter-maker/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterType: selectedType,
          ocrExtracted: ocrData,
          userPrompt,
          originalFile: uploadedFile
            ? {
                fileName: uploadedFile.name,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
                dataUrl: uploadedFile.dataUrl,
              }
            : null,
          formatting,
          customLetterNumber: customLetterNo,
          customDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.letter) {
        setGeneratedLetter(data.letter);
        setCurrentStep(4);
        setActiveViewMode('preview');
        showNotification('ಅಧಿಕೃತ ಕನ್ನಡ ಪತ್ರ ಕರಡು ಸಿದ್ಧಗೊಂಡಿದೆ.');
      } else {
        throw new Error(data.error || 'ಪತ್ರ ಸೃಜನೆ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('ಪತ್ರ ಸೃಜಿಸುವಲ್ಲಿ ದೋಷ: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Generated Letter to Database
  const handleSaveLetter = async (statusOverride?: 'Draft' | 'Finalized' | 'Issued') => {
    if (!generatedLetter) return;
    try {
      setIsSaving(true);
      const payload: Partial<GeneratedOfficeLetter> = {
        ...generatedLetter,
        status: statusOverride || generatedLetter.status || 'Finalized',
        userPrompt,
        formatting,
        originalFile: uploadedFile
          ? {
              fileName: uploadedFile.name,
              fileSize: uploadedFile.size,
              fileType: uploadedFile.type,
              dataUrl: uploadedFile.dataUrl,
            }
          : generatedLetter.originalFile,
      };

      const res = await fetch('/api/letter-maker/letters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.letter) {
        setGeneratedLetter(data.letter);
        fetchLetters();
        showNotification(`ಪತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ (${data.letter.documentId})`);
        setShowVersionModal(false);
        setNewVersionNotes('');
      } else {
        throw new Error(data.error || 'ಪತ್ರ ಉಳಿಸುವಲ್ಲಿ ದೋಷ');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('ಪತ್ರ ಉಳಿಸುವಲ್ಲಿ ದೋಷ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Restore Letter Version
  const handleRestoreVersion = async (versionNumber: number) => {
    if (!generatedLetter?.id) return;
    try {
      const res = await fetch(`/api/letter-maker/letters/${generatedLetter.id}/version-restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionNumber }),
      });
      const data = await res.json();
      if (res.ok && data.letter) {
        setGeneratedLetter(data.letter);
        showNotification(`ಆವೃತ್ತಿ ${versionNumber} ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ.`);
      } else {
        throw new Error(data.error || 'ಮರುಸ್ಥಾಪನೆ ವಿಫಲವಾಗಿದೆ.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('ದೋಷ: ' + err.message);
    }
  };

  // Download DOCX
  const handleDownloadDocx = () => {
    if (!generatedLetter?.id) {
      // If not yet saved with ID, save first then trigger download
      handleSaveLetter('Finalized').then(() => {
        showNotification('ದಯವಿಟ್ಟು ಉಳಿಸಿದ ನಂತರ ಮತ್ತೊಮ್ಮೆ ಡೌನ್‌ಲೋಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ.');
      });
      return;
    }
    window.open(`/api/letter-maker/letters/${generatedLetter.id}/download-docx`, '_blank');
    showNotification('Microsoft Word (.docx) ಕಡತ ಡೌನ್‌ಲೋಡ್ ಆರಂಭವಾಗಿದೆ.');
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Copy Plain Text
  const handleCopyText = () => {
    if (!generatedLetter) return;
    const textToCopy =
      generatedLetter.bodyText ||
      document.getElementById('official-letter-content')?.innerText ||
      '';
    navigator.clipboard.writeText(textToCopy);
    showNotification('ಪತ್ರದ ಪಠ್ಯವನ್ನು ನಕಲಿಸಲಾಗಿದೆ (Copied to Clipboard).');
  };

  // Filtered Letters
  const filteredLetters = savedLetters.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      l.letterNumber.toLowerCase().includes(q) ||
      l.documentId.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      (l.employeeName && l.employeeName.toLowerCase().includes(q)) ||
      (l.kgidNumber && l.kgidNumber.toLowerCase().includes(q));

    const matchesType = filterType === 'All' || l.letterType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-stone-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-inner shrink-0">
              <FileText className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  📄 ಪತ್ರ ತಯಾರಿಸಿ (Official Letter Generation Studio)
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  OCR & AI Powered
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                PDF/JPG ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, OCR ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮಾಹಿತಿ ಪಡೆದು, ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ನಿಯಮಾನುಸಾರ ಪತ್ರ ಸಿದ್ಧಪಡಿಸಿ.
              </p>
            </div>
          </div>

          {/* Quick Hub Navigation & Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-switch-studio-flow"
              onClick={() => setActiveViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode !== 'history'
                  ? 'bg-sky-950 text-amber-300 shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ಹೊಸ ಪತ್ರ ರಚನೆ (Studio)</span>
            </button>
            <button
              id="btn-switch-history-view"
              onClick={() => {
                setActiveViewMode('history');
                fetchLetters();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'history'
                  ? 'bg-sky-950 text-amber-300 shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ಪತ್ರಗಳ ದಾಖಲಾತಿ ({savedLetters.length})</span>
            </button>
          </div>
        </div>

        {/* 5-Step Process Bar */}
        {activeViewMode !== 'history' && (
          <div className="mt-6 pt-5 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400'
                  : uploadedFile
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold">ಹಂತ 1</span>
                {uploadedFile ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
              <p className="font-semibold text-[11px] truncate">1. ದಾಖಲೆ ಅಪ್‌ಲೋಡ್</p>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              disabled={!uploadedFile && !ocrData.employeeName}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400'
                  : isOcrVerified
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold">ಹಂತ 2</span>
                {isOcrVerified ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <FileCheck2 className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
              <p className="font-semibold text-[11px] truncate">2. OCR ಮಾಹಿತಿ ಪರಿಶೀಲನೆ</p>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              disabled={!uploadedFile && !ocrData.employeeName}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400'
                  : selectedType
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold">ಹಂತ 3</span>
                <Award className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <p className="font-semibold text-[11px] truncate">3. ಪ್ರಕಾರ & ಸೂಚನೆ</p>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              disabled={!generatedLetter}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                currentStep === 4
                  ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400'
                  : generatedLetter
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold">ಹಂತ 4</span>
                <Edit3 className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <p className="font-semibold text-[11px] truncate">4. ಕರಡು ಸಂಪಾದನೆ</p>
            </button>

            <button
              onClick={() => {
                if (generatedLetter) {
                  setCurrentStep(4);
                  setActiveViewMode('preview');
                }
              }}
              disabled={!generatedLetter}
              className="p-2.5 rounded-lg border text-left transition-all bg-stone-50 border-stone-200 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold">ಹಂತ 5</span>
                <Download className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <p className="font-semibold text-[11px] truncate">5. ಡೌನ್‌ಲೋಡ್ / ಪ್ರಿಂಟ್</p>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: THE STUDIO PIPELINE (STEPS 1, 2, 3, 4)                       */}
      {/* ========================================================================= */}
      {activeViewMode !== 'history' && (
        <div className="space-y-6">
          {/* STEP 1: DOCUMENT UPLOAD & PREVIEW */}
          {currentStep === 1 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-sky-900" />
                    <span>ಹಂತ 1: PDF / JPG ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Document Upload)</span>
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    ಪತ್ರ, ಅರ್ಜಿ, ರಜೆ ಪತ್ರ ಅಥವಾ ಪ್ರಸ್ತಾವನೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. OCR ತಂತ್ರಜ್ಞಾನವು ಪಠ್ಯವನ್ನು ಓದುತ್ತದೆ.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                  <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px]">
                    ಬೆಂಬಲಿತ: PDF, JPG, JPEG, PNG
                  </span>
                </div>
              </div>

              {/* Upload Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUploadedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/50'
                    : uploadedFile
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : 'border-stone-300 hover:border-sky-900 bg-stone-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processUploadedFile(e.target.files[0]);
                    }
                  }}
                />

                {isReadingOcr ? (
                  <div className="py-6 space-y-3">
                    <div className="w-9 h-9 border-3 border-sky-950 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-stone-800">
                      OCR ಓದುವಿಕೆ ಪ್ರಕ್ರಿಯೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ...
                    </p>
                    <p className="text-xs text-stone-500">
                      ಕನ್ನಡ ಪಠ್ಯ, ನೌಕರರ ವಿವರಗಳು ಮತ್ತು ದಿನಾಂಕವನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ.
                    </p>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{uploadedFile.name}</p>
                      <p className="text-xs text-stone-500">
                        ಗಾತ್ರ: {uploadedFile.size} • ಪ್ರಕಾರ: {uploadedFile.type}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep(2);
                        }}
                        className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <span>OCR ಮಾಹಿತಿ ವೀಕ್ಷಿಸಿ & ಮುಂದುವರಿಯಿರಿ</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-stone-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ದಾಖಲೆ ಬದಲಾಯಿಸಿ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಹಾಕಿ (Drag & Drop) ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಿಂದ ಆಯ್ಕೆ ಮಾಡಿ
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        PDF, JPG, JPEG, PNG ಫೈಲ್‌ಗಳು ಬೆಂಬಲಿತವಾಗಿವೆ (ಗರಿಷ್ಠ 25MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-amber-300" />
                      <span>ಕಡತ ಹುಡುಕಿ (Browse File)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Documents for Instant Prototyping */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>ಅಧಿಕೃತ ಇಲಾಖಾ ಕಡತ ಪ್ರಕ್ರಿಯೆಗಳು (Standard Procedures):</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleLoadSample('leave_application')}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-amber-400 text-left transition-all flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      ರಜೆ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        1. ಗಳಿಕೆ ರಜೆ ಅರ್ಜಿ
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                        ಶ್ರೀ ರಮೇಶ್ ಎನ್., ಸಹಾಯಕ ಶಿಕ್ಷಕರು (10 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಕೋರಿಕೆ)
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadSample('increment_proposal')}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-amber-400 text-left transition-all flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      ಬಡ್ತಿ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        2. 10 ವರ್ಷ ಕಾಲಮಿತಿ ಪ್ರಸ್ತಾವನೆ
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                        ಶ್ರೀಮತಿ ಮಂಜುಳಾ ಕೆ. ಎಸ್., ಮುಖ್ಯ ಶಿಕ್ಷಕರು (ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ)
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadSample('service_certificate')}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-amber-400 text-left transition-all flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      NOC
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                        3. ಸೇವಾ ಪ್ರಮಾಣ ಪತ್ರ & NOC
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                        ಶ್ರೀ ಆನಂದ್ ಕುಮಾರ್ ಬಿ., ಎಫ್‌ಡಿಎ (ಪಾಸ್‌ಪೋರ್ಟ್ ಅರ್ಜಿಗಾಗಿ)
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Registered & Newly Added Employees Quick Selector */}
              {employees && employees.length > 0 && (
                <div className="pt-4 border-t border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5 font-kannada">
                      <Users className="w-4 h-4 text-sky-900" />
                      <span>ನೌಕರರ ಪಟ್ಟಿಯಿಂದ ಪತ್ರ ರಚನೆ (Create Letter for Registered/New Employee):</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">
                        {employees.length} ನೌಕರರು
                      </span>
                    </span>
                    <input
                      type="text"
                      value={empSearchFilter}
                      onChange={(e) => setEmpSearchFilter(e.target.value)}
                      placeholder="ಹೆಸರು ಅಥವಾ KGID ಇಂದ ಶೋಧಿಸಿ..."
                      className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-900 w-full sm:w-56"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-stone-50 rounded-lg border border-stone-200">
                    {employees
                      .filter((emp) => {
                        const q = empSearchFilter.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
                          (emp.kgidNumber && emp.kgidNumber.toLowerCase().includes(q)) ||
                          (emp.employeeCode && emp.employeeCode.toLowerCase().includes(q)) ||
                          (emp.designation && emp.designation.toLowerCase().includes(q))
                        );
                      })
                      .map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => {
                            setOcrData((prev) => ({
                              ...prev,
                              employeeName: emp.fullName,
                              kgidNumber: emp.kgidNumber || emp.employeeCode || '',
                              designation: emp.designation,
                              officeName: emp.placeOfWork || emp.officeLocation || 'ಸರ್ಕಾರಿ ಕಚೇರಿ / ಶಾಲೆ, ಭದ್ರಾವತಿ',
                              basicPay: emp.basicPay || 37900,
                              payScale: emp.payScale || '37900-70850',
                              leaveType: 'ಗಳಿಕೆ ರಜೆ (Earned Leave)',
                              leaveBalance: emp.earnedLeaveBalance || 45,
                              requestedDays: 10,
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                              reason: 'ವೈಯಕ್ತಿಕ ಮತ್ತು ಕೌಟುಂಬಿಕ ಕಾರ್ಯಗಳಿಗಾಗಿ ರಜೆ ಕೋರಿಕೆ',
                              subject: `ಶ್ರೀ/ಶ್ರೀಮತಿ ${emp.fullName}, ${emp.designation} ರವರ ರಜೆ / ಸೇವಾ ಮಂಜೂರಾತಿ ಕುರಿತು.`,
                            }));
                            setUploadedFile({
                              name: `${emp.fullName}_Profile_Card.pdf`,
                              size: '32 KB',
                              type: 'application/pdf',
                              dataUrl: '',
                              pageCount: 1,
                            });
                            setIsOcrVerified(true);
                            setCurrentStep(2);
                            showNotification(`${emp.fullName} ರವರ ವಿವರಗಳನ್ನು ಪತ್ರಕ್ಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.`);
                          }}
                          className="p-2 rounded bg-white hover:bg-sky-50 border border-stone-200 hover:border-sky-700 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900 truncate font-kannada">
                              {emp.fullName}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-sky-950 bg-sky-100 px-1 py-0.2 rounded shrink-0">
                              {emp.kgidNumber || emp.employeeCode || '-'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 truncate mt-0.5">
                            {emp.designation} • ₹{(emp.basicPay || 37900).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: OCR INFORMATION VERIFICATION & EDIT PANEL */}
          {currentStep === 2 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-700" />
                    <span>ಹಂತ 2: OCR ಮಾಹಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ತಿದ್ದುಪಡಿ (Information Verification)</span>
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    ದಾಖಲೆಯಿಂದ ಪಡೆದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಯಾವುದೇ ತಪ್ಪಿದ್ದಲ್ಲಿ ನೇರವಾಗಿ ತಿದ್ದಬಹುದು.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>OCR Confirmed</span>
                  </span>
                </div>
              </div>

              {/* Safety Alert if Critical Fields are Missing */}
              {ocrData.missingCriticalFields && ocrData.missingCriticalFields.length > 0 && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ:</span>
                  </div>
                  <p className="text-amber-900 pl-6">
                    {ocrData.missingCriticalFields.join(', ')} ಪತ್ತೆಯಾಗಿಲ್ಲ. ಸುರಕ್ಷತೆಯ ನಿಯಮದಂತೆ, ನೌಕರರ ಮಾಹಿತಿಯನ್ನು ಊಹಿಸುವುದಿಲ್ಲ. ಭರ್ತಿ ಮಾಡದಿದ್ದಲ್ಲಿ ಪತ್ರದಲ್ಲಿ <strong>[ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ]</strong> ಎಂದು ನಮೂದಿಸಲಾಗುತ್ತದೆ.
                  </p>
                </div>
              )}

              {/* Editable Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Letter Number */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ಪತ್ರದ ಸಂಖ್ಯೆ (Letter Number):
                  </label>
                  <input
                    type="text"
                    value={ocrData.letterNumber}
                    onChange={(e) => setOcrData({ ...ocrData, letterNumber: e.target.value })}
                    placeholder="ಉದಾ: BEO/BHD/2026/102"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none font-mono"
                  />
                </div>

                {/* 2. Date */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ದಿನಾಂಕ (Date):
                  </label>
                  <input
                    type="date"
                    value={ocrData.date}
                    onChange={(e) => setOcrData({ ...ocrData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                {/* 3. KGID Number */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID Number):
                  </label>
                  <input
                    type="text"
                    value={ocrData.kgidNumber}
                    onChange={(e) => setOcrData({ ...ocrData, kgidNumber: e.target.value })}
                    placeholder="ಉದಾ: 1122334"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none font-mono ${
                      !ocrData.kgidNumber ? 'border-amber-400 bg-amber-50/50' : 'border-stone-300'
                    }`}
                  />
                </div>

                {/* 4. Employee Name */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ನೌಕರರ ಹೆಸರು (Employee Name):
                  </label>
                  <input
                    type="text"
                    value={ocrData.employeeName}
                    onChange={(e) => setOcrData({ ...ocrData, employeeName: e.target.value })}
                    placeholder="ಉದಾ: ಶ್ರೀ ರಮೇಶ್ ಎನ್."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      !ocrData.employeeName ? 'border-amber-400 bg-amber-50/50' : 'border-stone-300'
                    }`}
                  />
                </div>

                {/* 5. Designation */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ಹುದ್ದೆ (Designation):
                  </label>
                  <input
                    type="text"
                    value={ocrData.designation}
                    onChange={(e) => setOcrData({ ...ocrData, designation: e.target.value })}
                    placeholder="ಉದಾ: ಸಹಾಯಕ ಶಿಕ್ಷಕರು"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                {/* 6. Office / School */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ಕಚೇರಿ / ಶಾಲೆ (Office / School):
                  </label>
                  <input
                    type="text"
                    value={ocrData.officeName}
                    onChange={(e) => setOcrData({ ...ocrData, officeName: e.target.value })}
                    placeholder="ಉದಾ: ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಕಡೂರು"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                {/* 7. Subject */}
                <div className="md:col-span-3">
                  <label className="block font-bold text-stone-700 mb-1">
                    ವಿಷಯ (Subject of Letter):
                  </label>
                  <input
                    type="text"
                    value={ocrData.subject}
                    onChange={(e) => setOcrData({ ...ocrData, subject: e.target.value })}
                    placeholder="ವಿಷಯ ನಮೂದಿಸಿ..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                {/* 8. Reference */}
                <div className="md:col-span-3">
                  <label className="block font-bold text-stone-700 mb-1">
                    ಉಲ್ಲೇಖ (References / GOs):
                  </label>
                  <textarea
                    rows={2}
                    value={ocrData.reference}
                    onChange={(e) => setOcrData({ ...ocrData, reference: e.target.value })}
                    placeholder="1. ನೌಕರರ ಮನವಿ ಪತ್ರ..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none resize-none font-mono text-xs"
                  />
                </div>

                {/* 9. Service / Leave / Salary Specifics */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ಸೇವಾ ವಿವರಗಳು (Service Details):
                  </label>
                  <input
                    type="text"
                    value={ocrData.serviceDetails}
                    onChange={(e) => setOcrData({ ...ocrData, serviceDetails: e.target.value })}
                    placeholder="ನೇಮಕಾತಿ ದಿನಾಂಕ, ಒಟ್ಟು ಸೇವೆ..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ರಜೆ ವಿವರಗಳು (Leave Details):
                  </label>
                  <input
                    type="text"
                    value={ocrData.leaveDetails}
                    onChange={(e) => setOcrData({ ...ocrData, leaveDetails: e.target.value })}
                    placeholder="ರಜೆ ಅವಧಿ, ದಿನಗಳು..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    ವೇತನ ವಿವರಗಳು (Salary Details):
                  </label>
                  <input
                    type="text"
                    value={ocrData.salaryDetails}
                    onChange={(e) => setOcrData({ ...ocrData, salaryDetails: e.target.value })}
                    placeholder="ಮೂಲ ವೇತನ, ಶ್ರೇಣಿ..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Raw OCR Text Collapsible */}
              <details className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs">
                <summary className="font-bold text-stone-700 cursor-pointer select-none">
                  ಪೂರ್ಣ OCR ಪಠ್ಯ ವೀಕ್ಷಿಸಿ (Full Raw Extracted Text)
                </summary>
                <div className="mt-3 p-3 bg-white border border-stone-200 rounded font-mono text-[11px] text-stone-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {ocrData.rawText || 'ಯಾವುದೇ ಪಠ್ಯ ಲಭ್ಯವಿಲ್ಲ.'}
                </div>
              </details>

              {/* Verification & Continue Button */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  ← ಹಿಂದಿನ ಹಂತ (Upload)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOcrVerified(true);
                    setCurrentStep(3);
                    showNotification('ಮಾಹಿತಿ ಖಚಿತಪಡಿಸಲಾಗಿದೆ. ಪತ್ರದ ಪ್ರಕಾರ ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ನಮೂದಿಸಿ.');
                  }}
                  className="px-5 py-2.5 bg-sky-950 hover:bg-sky-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ಮಾಹಿತಿ ಖಚಿತಪಡಿಸಿ & ಹಂತ 3 ಕ್ಕೆ ತೆರಳಿ</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT LETTER TYPE & ENTER PROMPT */}
          {currentStep === 3 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span>ಹಂತ 3: ಪತ್ರದ ಪ್ರಕಾರ ಮತ್ತು ಸೂಚನೆಗಳು (Letter Type & Instructions)</span>
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    ತಯಾರಿಸಬೇಕಾದ ಅಧಿಕೃತ ಪತ್ರದ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಸೂಚನೆಗಳನ್ನು ನೀಡಿ.
                  </p>
                </div>
                <div className="text-xs font-semibold text-stone-500">
                  ಆಯ್ಕೆಯಾದ ಪ್ರಕಾರ: <strong className="text-stone-900">{selectedType}</strong>
                </div>
              </div>

              {/* 12 Karnataka Government Letter Types Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {KARNATAKA_LETTER_TYPES.map((t) => {
                  const isSelected = selectedType === t.title;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setSelectedType(t.title)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400 shadow-xs'
                          : 'bg-stone-50/60 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${t.iconColor}`}
                        >
                          {t.category}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-stone-900">{t.title}</h3>
                      <p className="text-[10px] text-stone-500 font-mono">{t.english}</p>
                      <p className="text-[11px] text-stone-600 mt-1 leading-snug">{t.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Prompt & Specific Directives */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800">
                    ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಸೂಚನೆ / ವಿಷಯ ವಿವರಣೆ (Custom Prompt / Instructions):
                  </label>
                  <span className="text-[11px] text-stone-500">ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬರೆಯಿರಿ</span>
                </div>

                <textarea
                  rows={3}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="ಉದಾಹರಣೆ: 7 ದಿನಗಳೊಳಗಾಗಿ ಸೇವಾ ದಾಖಲಾತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ವರದಿ ಸಲ್ಲಿಸಲು ಸೂಚಿಸಿ. ತಪ್ಪಿದಲ್ಲಿ ನಿಯಮಾನುಸಾರ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗುವುದು ಎಂದು ತಿಳಿಸಿ..."
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-sky-900 focus:outline-none"
                />

                {/* Quick Prompt Suggestion Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-600">
                    ಸೂಚನೆಗಳ ಆಯ್ಕೆ (Quick Suggestion Chips):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserPrompt(chip)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-950 text-stone-700 rounded-md text-[11px] border border-stone-200 transition-colors text-left cursor-pointer"
                      >
                        + {chip.substring(0, 45)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* KCSR, KFC, CCA Statutory Rule Reference Chips */}
                <div className="p-3 bg-[#fffbf2] border-2 border-amber-300 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1 font-kannada">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>KCSR, KFC & CCA ಶಾಸನಬದ್ಧ ನಿಯಮ ಪುಸ್ತಕಗಳಿಂದ ಉಲ್ಲೇಖ ಸೇರಿಸಿ:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsStatutoryModalOpen(true)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] border border-[#2b2b2b] flex items-center gap-1 cursor-pointer font-kannada shadow-2xs"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>📚 ನಿಯಮಾವಳಿ ಪುಸ್ತಕ ತೆರೆಯಿರಿ...</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-112');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer font-kannada"
                    >
                      + KCSR 112 (ಗಳಿಕೆ ರಜೆ)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-51');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 cursor-pointer font-kannada"
                    >
                      + KCSR 51 (ವೇತನ ಬಡ್ತಿ)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kfc-article-99');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 cursor-pointer font-kannada"
                    >
                      + KFC 99 (ಹಣಕಾಸು)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'cca-rule-10');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 cursor-pointer font-kannada"
                    >
                      + CCA 10 (ಅಮಾನತು)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'cca-rule-11');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 cursor-pointer font-kannada"
                    >
                      + CCA 11 (ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-287');
                        if (r) handleInsertStatutoryRef(r.citationSnippet, r);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 cursor-pointer font-kannada"
                    >
                      + KCSR 287 (ಪಿಂಚಣಿ)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  ← ಹಿಂದಿನ ಹಂತ (OCR ಪರಿಶೀಲನೆ)
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateLetter}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-xs border border-amber-600 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>ಪತ್ರ ಕರಡು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>ಎಐ ಪತ್ರ ತಯಾರಿಸಿ (Generate Official Letter)</span>
                      <ArrowRight className="w-4 h-4 text-stone-950" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LIVE EDITOR, PREVIEW & VERSION HISTORY */}
          {currentStep === 4 && generatedLetter && (
            <div className="space-y-4">
              {/* Studio Toolbar & Controls */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
                  <button
                    onClick={() => setActiveViewMode('preview')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeViewMode === 'preview'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-700" />
                    <span>ಅಧಿಕೃತ ಮುನ್ನೋಟ (Preview)</span>
                  </button>
                  <button
                    onClick={() => setActiveViewMode('editor')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeViewMode === 'editor'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>ನೇರ ತಿದ್ದುಪಡಿ (Editor)</span>
                  </button>
                  <button
                    onClick={() => setActiveViewMode('versions')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeViewMode === 'versions'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-purple-700" />
                    <span>ಆವೃತ್ತಿ ಇತಿಹಾಸ (v{generatedLetter.currentVersion || 1})</span>
                  </button>
                </div>

                {/* Formatting Controls Bar */}
                <div className="flex items-center gap-2 text-xs">
                  {/* Font Size */}
                  <select
                    value={formatting.fontSize}
                    onChange={(e) => setFormatting({ ...formatting, fontSize: e.target.value })}
                    className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-800 bg-white font-medium"
                    title="ಅಕ್ಷರ ಗಾತ್ರ"
                  >
                    <option value="12pt">ಅಕ್ಷರ: 12pt (ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮಾನದಂಡ)</option>
                    <option value="11pt">ಅಕ್ಷರ: 11pt</option>
                    <option value="13pt">ಅಕ್ಷರ: 13pt</option>
                    <option value="12px">ಅಕ್ಷರ: 12px (ಚಿಕ್ಕದು)</option>
                    <option value="14px">ಅಕ್ಷರ: 14px</option>
                  </select>

                  {/* Line Spacing */}
                  <select
                    value={formatting.lineSpacing}
                    onChange={(e) => setFormatting({ ...formatting, lineSpacing: e.target.value })}
                    className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-800 bg-white font-medium"
                    title="ಸಾಲುಗಳ ಅಂತರ"
                  >
                    <option value="1.4">ಅಂತರ: 1.4</option>
                    <option value="1.6">ಅಂತರ: 1.6 (ಪ್ರಮಾಣಿತ)</option>
                    <option value="1.8">ಅಂತರ: 1.8</option>
                    <option value="2.0">ಅಂತರ: 2.0 (ವಿಶಾಲ)</option>
                  </select>

                  {/* Header & Emblem Toggle */}
                  <button
                    onClick={() => setFormatting({ ...formatting, hasHeader: !formatting.hasHeader })}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      formatting.hasHeader
                        ? 'bg-sky-50 text-sky-900 border-sky-300'
                        : 'bg-white text-stone-500 border-stone-200'
                    }`}
                    title="ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಲಾಂಛನ ಮತ್ತು ಹೆಡರ್"
                  >
                    ಲಾಂಛನ: {formatting.hasHeader ? 'ಆನ್' : 'ಆಫ್'}
                  </button>
                </div>

                {/* Export & Save Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="p-2 text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    title="ಪಠ್ಯ ನಕಲಿಸಿ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ನಕಲಿಸಿ</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    title="ಮುದ್ರಿಸಿ / PDF ಆಗಿ ಉಳಿಸಿ"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-700" />
                    <span>ಮುದ್ರಿಸಿ</span>
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    className="px-3.5 py-1.5 text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Microsoft Word (.docx) ಕಡತ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => handleSaveLetter('Finalized')}
                    disabled={isSaving}
                    className="px-4 py-1.5 text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-2xs border border-amber-500/50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ದಾಖಲಿಗೆ ಉಳಿಸಿ'}</span>
                  </button>
                </div>
              </div>

              {/* Safety Warning Banner if missing values remain */}
              {generatedLetter.hasMissingInfo && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      ಕರಡಿನಲ್ಲಿ <strong>[ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ]</strong> ಎಂಬ ಸ್ಥಳಗಳಿವೆ. ದಯವಿಟ್ಟು &quot;ನೇರ ತಿದ್ದುಪಡಿ&quot; ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಸರಿಯಾದ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveViewMode('editor')}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-[11px] cursor-pointer"
                  >
                    ಈಗಲೇ ತಿದ್ದಿ
                  </button>
                </div>
              )}

              {/* VIEW 1: OFFICIAL VISUAL PREVIEW (REALISTIC A4 GOVERNMENT PAPER) */}
              {activeViewMode === 'preview' && (
                <div className="bg-stone-200/70 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto">
                  <div
                    id="official-letter-paper"
                    className="bg-white text-stone-900 shadow-xl border border-stone-300 w-full max-w-[820px] min-h-[1080px] p-8 sm:p-14 relative"
                    style={{
                      fontSize: formatting.fontSize,
                      lineHeight: formatting.lineSpacing,
                    }}
                  >
                    {/* Official Karnataka Government Mandatory Header */}
                    {formatting.hasHeader && (
                      <div className="text-center border-b border-stone-800 pb-3 mb-5 space-y-1">
                        <p className="font-extrabold text-base text-stone-950 tracking-wide">
                          ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                        </p>
                        <p className="font-bold text-sm text-stone-900">
                          ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
                        </p>
                        <p className="font-bold text-sm text-stone-900">
                          ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
                        </p>
                        <p className="font-bold text-xs text-stone-800">
                          ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301
                        </p>
                      </div>
                    )}

                    {/* Letter Number and Date Line */}
                    <div className="flex justify-between items-center text-xs font-bold border-b border-stone-300 pb-2 mb-4 font-mono">
                      <div>
                        ಸಂ: <span>{generatedLetter.letterNumber}</span>
                      </div>
                      <div>
                        ದಿನಾಂಕ: <span>{generatedLetter.date}</span>
                      </div>
                    </div>

                    {/* Recipient / Address (ರಿಗೆ:) */}
                    {generatedLetter.recipient && (
                      <div className="mb-4 text-xs font-kannada">
                        <div className="font-bold text-stone-950 text-sm mb-1">ರಿಗೆ:</div>
                        <div className="text-stone-900 pl-4 whitespace-pre-line font-medium leading-relaxed">
                          {generatedLetter.recipient.replace(/^(ಇವರಿಗೆ\s*,?|ರಿಗೆ\s*:?)/gi, '').trim()}
                        </div>
                      </div>
                    )}

                    {/* Subject Line (ವಿಷಯ) */}
                    <div className="mb-3 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-bold whitespace-nowrap text-stone-950">ವಿಷಯ:</span>
                        <span className="font-extrabold text-stone-900 underline decoration-stone-400 underline-offset-4 leading-relaxed">
                          {generatedLetter.subject}
                        </span>
                      </div>
                    </div>

                    {/* Reference Line (ಉಲ್ಲೇಖ) */}
                    {generatedLetter.reference && (
                      <div className="mb-4 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="font-bold whitespace-nowrap text-stone-950">ಉಲ್ಲೇಖ:</span>
                          <div className="text-stone-800 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                            {generatedLetter.reference}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preamble (ಪ್ರಸ್ತಾವನೆ) if present */}
                    {generatedLetter.preamble && (
                      <div className="mb-4 text-xs">
                        <p className="font-bold text-stone-950 mb-1">ಪ್ರಸ್ತಾವನೆ:</p>
                        <p className="text-stone-800 leading-relaxed indent-8 text-justify">
                          {generatedLetter.preamble}
                        </p>
                      </div>
                    )}

                    {/* Official Letter Main Body (HTML or Plain) */}
                    <div
                      id="official-letter-content"
                      className="text-xs text-stone-900 space-y-3 leading-relaxed text-justify mb-8"
                      dangerouslySetInnerHTML={{
                        __html: cleanRenderedBodyHtml,
                      }}
                    />

                    {/* Signatory Block (ಸಹಿ ಹಾಗೂ ಮೊಹರು) */}
                    <div className="flex justify-end pt-8 pb-6">
                      <div className="text-center min-w-[240px] text-xs space-y-1">
                        <div className="h-10"></div>
                        <p className="font-extrabold text-stone-950">
                          ({generatedLetter.signatory?.name || fallbackSignatoryName})
                        </p>
                        <p className="font-bold text-stone-900">
                          {generatedLetter.signatory?.designation || fallbackSignatoryDesig}
                        </p>
                        <p className="font-semibold text-stone-700 text-[11px]">
                          {generatedLetter.signatory?.office || fallbackSignatoryOffice}
                        </p>
                      </div>
                    </div>

                    {/* Endorsements / Distribution List (ಪ್ರತಿಯನ್ನು ರವಾನಿಸಲಾಗಿದೆ) */}
                    {generatedLetter.endorsements && generatedLetter.endorsements.length > 0 && (
                      <div className="border-t border-stone-300 pt-4 text-xs space-y-1 text-stone-800">
                        <p className="font-bold text-stone-950 mb-1">
                          ಪ್ರತಿಯನ್ನು ಗೌರವಪೂರ್ವಕವಾಗಿ / ಮಾಹಿತಿಗಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:
                        </p>
                        <ol className="list-decimal pl-6 space-y-1 font-medium text-[11px]">
                          {generatedLetter.endorsements.map((end, idx) => (
                            <li key={idx}>{end}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Linked Original Document Watermark / Reference Badge */}
                    {generatedLetter.originalFile && (
                      <div className="mt-8 pt-3 border-t border-dashed border-stone-300 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                        <span>
                          ಮೂಲ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ: <strong>{generatedLetter.originalFile.fileName}</strong>
                        </span>
                        <span>ಕಡತ ID: {generatedLetter.documentId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: WYSIWYG / RICH TEXT INLINE EDITOR */}
              {activeViewMode === 'editor' && (
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-stone-900">
                        ಪತ್ರ ತಿದ್ದುಪಡಿ ಫಲಕ (Direct Editor Panel)
                      </h3>
                    </div>
                    <span className="text-xs text-stone-500">
                      ಇಲ್ಲಿ ಮಾಡುವ ಯಾವುದೇ ಬದಲಾವಣೆಗಳು ನೈಜ ಪತ್ರದಲ್ಲಿ ತಕ್ಷಣ ಅನ್ವಯವಾಗುತ್ತವೆ.
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ವಿಷಯ (Subject):</label>
                      <input
                        type="text"
                        value={generatedLetter.subject}
                        onChange={(e) =>
                          setGeneratedLetter({ ...generatedLetter, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ಉಲ್ಲೇಖ (Reference):</label>
                      <textarea
                        rows={2}
                        value={generatedLetter.reference}
                        onChange={(e) =>
                          setGeneratedLetter({ ...generatedLetter, reference: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        ಪತ್ರದ ಮುಖ್ಯ ಒಡಲು (HTML/Body Text):
                      </label>
                      <textarea
                        rows={12}
                        value={generatedLetter.bodyHtml || generatedLetter.bodyText}
                        onChange={(e) =>
                          setGeneratedLetter({
                            ...generatedLetter,
                            bodyHtml: e.target.value,
                            bodyText: e.target.value.replace(/<[^>]*>/g, ''),
                          })
                        }
                        className="w-full px-3 py-3 border border-stone-300 rounded-lg text-stone-900 font-sans text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowVersionModal(true)}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>ಹೊಸ ಆವೃತ್ತಿಯಾಗಿ ಉಳಿಸಿ (Save Version)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveLetter()}
                        className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ (Apply Changes)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: VERSION HISTORY & RESTORATION */}
              {activeViewMode === 'versions' && (
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-purple-700" />
                        <span>ಪತ್ರದ ಆವೃತ್ತಿ ಇತಿಹಾಸ (Version History & Revisions)</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        ಪ್ರತಿಯೊಂದು ತಿದ್ದುಪಡಿಯೂ ಇಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಾಗುತ್ತದೆ. ಅಗತ್ಯವಿದ್ದಾಗ ಹಳೆಯ ಆವೃತ್ತಿಯನ್ನು ಮರುಸ್ಥಾಪಿಸಬಹುದು.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded">
                      ಪ್ರಸ್ತುತ ಆವೃತ್ತಿ: v{generatedLetter.currentVersion || 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {generatedLetter.versions && generatedLetter.versions.length > 0 ? (
                      generatedLetter.versions.map((ver) => (
                        <div
                          key={ver.versionNumber}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                            ver.versionNumber === generatedLetter.currentVersion
                              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-stone-900 text-sm">
                                ಆವೃತ್ತಿ {ver.versionNumber}
                              </span>
                              {ver.versionNumber === generatedLetter.currentVersion && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  ಚಾಲ್ತಿಯಲ್ಲಿರುವುದು (Active)
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600">{ver.notes || 'ಸಾಮಾನ್ಯ ತಿದ್ದುಪಡಿ'}</p>
                            <p className="text-[11px] text-stone-400 font-mono">
                              ದಿನಾಂಕ: {ver.updatedAt ? ver.updatedAt.replace('T', ' ').substring(0, 19) : ''} • ಸಂಪಾದಕ: {ver.updatedBy || 'admin'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ver.versionNumber !== generatedLetter.currentVersion && (
                              <button
                                type="button"
                                onClick={() => handleRestoreVersion(ver.versionNumber)}
                                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-purple-900 border border-purple-300 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>ಈ ಆವೃತ್ತಿ ಮರುಸ್ಥಾಪಿಸಿ</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-500 text-xs text-center py-6">
                        ಯಾವುದೇ ಹಿಂದಿನ ಆವೃತ್ತಿಗಳು ಲಭ್ಯವಿಲ್ಲ.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: SAVED LETTERS ARCHIVE & FILE REGISTER                       */}
      {/* ========================================================================= */}
      {activeViewMode === 'history' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-950" />
                <span>ತಯಾರಿಸಿದ ಪತ್ರಗಳ ಕಡತ ದಾಖಲಾತಿ (Letter Register & Archive)</span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                ಈ ಕಚೇರಿಯಲ್ಲಿ OCR ಮತ್ತು AI ಮೂಲಕ ರಚಿಸಲಾದ ಎಲ್ಲಾ ಅಧಿಕೃತ ಪತ್ರಗಳ ಶಾಶ್ವತ ಕಡತ.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveViewMode('preview');
                setCurrentStep(1);
              }}
              className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ ಹೊಸ ಪತ್ರ ತಯಾರಿಸಿ</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ಪತ್ರ ಸಂಖ್ಯೆ, ನೌಕರರ ಹೆಸರು, ಕೆಜಿಐಡಿ..."
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-stone-600">ಪ್ರಕಾರ:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-800"
              >
                <option value="All">ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು ({savedLetters.length})</option>
                <option value="ಸಾಮಾನ್ಯ ಪತ್ರ">ಸಾಮಾನ್ಯ ಪತ್ರ</option>
                <option value="ಜ್ಞಾಪನಾ ಆದೇಶ">ಜ್ಞಾಪನಾ ಆದೇಶ</option>
                <option value="ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ">ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ</option>
                <option value="10 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿ">10 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿ</option>
                <option value="ಸೇವಾ ದೃಢೀಕರಣ / NOC">ಸೇವಾ ದೃಢೀಕರಣ / NOC</option>
              </select>
            </div>
          </div>

          {/* Table of Letters */}
          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">ಕಡತ / ಪತ್ರ ಸಂಖ್ಯೆ</th>
                  <th className="py-3 px-4">ದಿನಾಂಕ</th>
                  <th className="py-3 px-4">ಪತ್ರದ ಪ್ರಕಾರ</th>
                  <th className="py-3 px-4">ನೌಕರರ ಹೆಸರು & ಕೆಜಿಐಡಿ</th>
                  <th className="py-3 px-4">ವಿಷಯ</th>
                  <th className="py-3 px-4">ಆವೃತ್ತಿ</th>
                  <th className="py-3 px-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {isLoadingRegistry ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...
                    </td>
                  </tr>
                ) : filteredLetters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      ಯಾವುದೇ ಪತ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                    </td>
                  </tr>
                ) : (
                  filteredLetters.map((letItem) => (
                    <tr key={letItem.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-950">
                        {letItem.letterNumber}
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {letItem.documentId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-mono whitespace-nowrap">
                        {letItem.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px] whitespace-nowrap">
                          {letItem.letterType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{letItem.employeeName || '—'}</p>
                        {letItem.kgidNumber && (
                          <p className="text-[11px] text-stone-500 font-mono">
                            KGID: {letItem.kgidNumber}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-stone-700" title={letItem.subject}>
                        {letItem.subject}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-800">
                        v{letItem.currentVersion || 1}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setGeneratedLetter(letItem);
                              setActiveViewMode('preview');
                              setCurrentStep(4);
                            }}
                            className="p-1.5 text-stone-700 hover:text-sky-950 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="ವೀಕ್ಷಿಸಿ & ಸಂಪಾದಿಸಿ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/api/letter-maker/letters/${letItem.id}/download-docx`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Word (.docx) ಡೌನ್‌ಲೋಡ್"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAVE NEW VERSION MODAL */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-700" />
              <span>ಹೊಸ ಆವೃತ್ತಿಯಾಗಿ ಉಳಿಸಿ (Save as New Version)</span>
            </h3>
            <p className="text-xs text-stone-600">
              ಈ ತಿದ್ದುಪಡಿಗೆ ಸಂಬಂಧಿಸಿದ ಟಿಪ್ಪಣಿ ನಮೂದಿಸಿ. ಮುಂದಿನ ಆವೃತ್ತಿ ಸಂಖ್ಯೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಏರಿಕೆಯಾಗುತ್ತದೆ.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ತಿದ್ದುಪಡಿ ಟಿಪ್ಪಣಿ (Revision Notes):
              </label>
              <textarea
                rows={3}
                value={newVersionNotes}
                onChange={(e) => setNewVersionNotes(e.target.value)}
                placeholder="ಉದಾಹರಣೆ: ಷರತ್ತು 3 ರಲ್ಲಿ ದಿನಾಂಕ ಬದಲಾವಣೆ ಮಾಡಲಾಗಿದೆ..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-700 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-bold cursor-pointer"
              >
                ರದ್ದುಗೊಳಿಸಿ
              </button>
              <button
                type="button"
                onClick={() => handleSaveLetter()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
              >
                ಆವೃತ್ತಿ ಉಳಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KCSR, KFC, CCA STATUTORY RULE SELECTOR MODAL */}
      <StatutoryRuleSelectorModal
        isOpen={isStatutoryModalOpen}
        onClose={() => setIsStatutoryModalOpen(false)}
        onInsertReference={handleInsertStatutoryRef}
        onInsertSubject={handleInsertStatutorySubject}
        onInsertBody={handleInsertStatutoryBody}
        targetContextName="ಅಧಿಕೃತ ಪತ್ರ"
      />
    </div>
  );
};
