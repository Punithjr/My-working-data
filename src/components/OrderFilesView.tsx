import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  IndianRupee, 
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  User,
  ShieldCheck,
  FileDown,
  Layers,
  ArrowRight,
  Upload
} from 'lucide-react';
import { OrderFile, AdminAuthUser, EducationLetter } from '../types';
import { generateGovernmentOrderPdf } from '../utils/governmentOrderPdfExport';
import { generateLetterPdf } from '../utils/letterPdfExport';
import { CreateGovernmentOrderModal } from './CreateGovernmentOrderModal';
import { UploadGovernmentOrderModal } from './UploadGovernmentOrderModal';

interface OrderFilesViewProps {
  currentUser: AdminAuthUser | null;
  letters?: EducationLetter[];
  onOpenOrderGenerator?: () => void;
  onDraftLetterWithOrder?: (order: OrderFile) => void;
  onViewLetter?: (letter: EducationLetter) => void;
  onShowToast?: (message: string) => void;
}

// Canonical Pre-seeded Karnataka Government Orders for Education Department
const DEFAULT_GOVERNMENT_ORDERS: OrderFile[] = [
  {
    id: 'go-ed-143-slb-2024',
    fileId: 'ಕಡತ-ಆ2/ವೇಬ/45/2026',
    orderNumber: 'ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024',
    kgidNumber: '1084592',
    employeeName: 'ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಸ್, ಸ.ಶಿ',
    orderType: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ',
    orderDate: '15-05-2024',
    effectiveDate: '01-06-2024',
    oldBasicPay: 43100,
    newBasicPay: 44300,
    createdBy: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdDate: '2024-05-15T10:00:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a; margin-bottom: 4px;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h3>
        <h4 style="text-align: center; color: #334155; margin-top: 0;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h4>
        <p style="text-align: center; font-size: 11px; color: #64748b; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">ಸಂಖ್ಯೆ: ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024 | ದಿನಾಂಕ: 15-05-2024</p>
        <p><strong>ವಿಷಯ:</strong> 15 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ - ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಸ್, ಸ.ಶಿ (KGID: 1084592) - ಕುರಿತು.</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳನ್ವಯ ಸದರಿ ಶಿಕ್ಷಕರಿಗೆ 15 ವರ್ಷಗಳ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಅವರ ಮೂಲ ವೇತನವನ್ನು ₹43,100/- ರಿಂದ ₹44,300/- ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024 - 15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ - ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಸ್',
    remarks: 'ಶಾಖೆ: ಆ2 - ಸ.ಪ್ರಾ.ಶಿ'
  },
  {
    id: 'go-ed-42-pbs-2025',
    fileId: 'ಕಡತ-ಆ1/ವೇಬ/89/2026',
    orderNumber: 'ಇಡಿ 42 ಪಿಬಿಎಸ್ 2025',
    kgidNumber: '1092384',
    employeeName: 'ಶ್ರೀಮತಿ ಶೈಲಜಾ ಎಂ, ಪ್ರೌಢಶಾಲಾ ಮುಖ್ಯಸ್ಥರು',
    orderType: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    orderDate: '10-01-2025',
    effectiveDate: '01-02-2025',
    oldBasicPay: 58200,
    newBasicPay: 59700,
    createdBy: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdDate: '2025-01-10T11:30:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a; margin-bottom: 4px;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ</h3>
        <h4 style="text-align: center; color: #334155; margin-top: 0;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</h4>
        <p style="text-align: center; font-size: 11px; color: #64748b; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">ಸಂಖ್ಯೆ: ಇಡಿ 42 ಪಿಬಿಎಸ್ 2025 | ದಿನಾಂಕ: 10-01-2025</p>
        <p><strong>ವಿಷಯ:</strong> 20 ವರ್ಷಗಳ ಸತತ ಸೇವೆಗೆ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ - ಶ್ರೀಮತಿ ಶೈಲಜಾ ಎಂ (KGID: 1092384).</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮಾವಳಿಗಳನ್ವಯ ದಿನಾಂಕ 01-02-2025 ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ₹59,700/- ನೂತನ ಮೂಲ ವೇತನ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಇಡಿ 42 ಪಿಬಿಎಸ್ 2025 - 20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ - ಶ್ರೀಮತಿ ಶೈಲಜಾ ಎಂ',
    remarks: 'ಶಾಖೆ: ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ'
  },
  {
    id: 'go-fd-05-srs-2012',
    fileId: 'ಕಡತ-ಆಡಳಿತ/ರಜೆ/12/2026',
    orderNumber: 'ಎಫ್‌ಡಿ 05 ಎಸ್‌ಆರ್‌ಎಸ್ 2012',
    kgidNumber: '1014589',
    employeeName: 'ಶ್ರೀ ರಮೇಶ್ ಕುಮಾರ್, ಸ.ಶಿ',
    orderType: 'ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ',
    orderDate: '14-06-2012',
    effectiveDate: '14-06-2012',
    oldBasicPay: 37900,
    newBasicPay: 37900,
    createdBy: 'ಹಣಕಾಸು ಇಲಾಖೆ / ಬಿಇಒ',
    createdDate: '2012-06-14T09:00:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶ - ಎಫ್‌ಡಿ 05 ಎಸ್‌ಆರ್‌ಎಸ್ 2012</h3>
        <p><strong>ವಿಷಯ:</strong> ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮತ್ತು ಗರಿಷ್ಠ 300 ದಿನಗಳ ರಜೆ ಮಂಜೂರಾತಿ ನಿಯಮಾವಳಿ.</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಸಮರ್ಪಣೆಯನ್ನು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಮಂಜೂರು ಮಾಡಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಎಫ್‌ಡಿ 05 ಎಸ್‌ಆರ್‌ಎಸ್ 2012 - ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ',
    remarks: 'ಶಾಖೆ: ಆಡಳಿತ ಶಾಖೆ'
  },
  {
    id: 'go-ed-98-bgm-2026',
    fileId: 'ಕಡತ-ಆ3/ಅನುದಾನ/77/2026',
    orderNumber: 'ಇಡಿ 98 ಬಿಜಿಎಂ 2026',
    kgidNumber: 'ALL-STAFF',
    employeeName: 'ತಾಲ್ಲೂಕಿನ ಎಲ್ಲಾ ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢ ಶಾಲಾ ಶಿಕ್ಷಕರು',
    orderType: '7ನೇ ವೇತನ ಆಯೋಗ & ತುಟ್ಟಿಭತ್ಯೆ ಪರಿಷ್ಕರಣೆ',
    orderDate: '01-08-2024',
    effectiveDate: '01-07-2024',
    oldBasicPay: 40000,
    newBasicPay: 41200,
    createdBy: 'ಶಿಕ್ಷಣ ಸಚಿವಾಲಯ / ಬಿಇಒ ಭದ್ರಾವತಿ',
    createdDate: '2024-08-01T10:00:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶ: ಇಡಿ 98 ಬಿಜಿಎಂ 2026</h3>
        <p><strong>ವಿಷಯ:</strong> ರಾಜ್ಯ 7ನೇ ವೇತನ ಆಯೋಗದ ಶಿಫಾರಸುಗಳ ಜಾರಿ ಹಾಗೂ ಪರಿಷ್ಕೃತ ವೇತನ ಶ್ರೇಣಿ ನಿಗದಿ.</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ರಾಜ್ಯ ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಮತ್ತು ಪ್ರೌಢಶಾಲಾ ಬೋಧಕ ಸಿಬ್ಬಂದಿಗೆ ತುಟ್ಟಿಭತ್ಯೆ ಮತ್ತು ವೇತನ ಪರಿಷ್ಕರಣೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಇಡಿ 98 ಬಿಜಿಎಂ 2026 - 7ನೇ ವೇತನ ಆಯೋಗ & ತುಟ್ಟಿಭತ್ಯೆ ಪರಿಷ್ಕರಣೆ',
    remarks: 'ಶಾಖೆ: ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ'
  },
  {
    id: 'go-ed-64-dgo-2025',
    fileId: 'ಕಡತ-ಆ2/ರಜೆ/19/2026',
    orderNumber: 'ಇಡಿ 64 ಡಿಜಿಒ 2025',
    kgidNumber: '1078491',
    employeeName: 'ಶ್ರೀಮತಿ ಸುಧಾ ಕೆ.ಪಿ, ಸ.ಶಿ',
    orderType: 'ಶಿಶುಪಾಲನ ರಜೆ',
    orderDate: '22-03-2025',
    effectiveDate: '01-04-2025',
    oldBasicPay: 45600,
    newBasicPay: 45600,
    createdBy: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdDate: '2025-03-22T10:00:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶ: ಇಡಿ 64 ಡಿಜಿಒ 2025</h3>
        <p><strong>ವಿಷಯ:</strong> ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ 730 ದಿನಗಳ ಮಿತಿಯಲ್ಲಿ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ - ಶ್ರೀಮತಿ ಸುಧಾ ಕೆ.ಪಿ.</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ದಿನಾಂಕ 01-04-2025 ರಿಂದ 30-06-2025 ರ ವರೆಗೆ ಒಟ್ಟು 90 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು ನಿಯಮಾನುಸಾರ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಇಡಿ 64 ಡಿಜಿಒ 2025 - ಶಿಶುಪಾಲನ ರಜೆ - ಶ್ರೀಮತಿ ಸುಧಾ ಕೆ.ಪಿ',
    remarks: 'ಶಾಖೆ: ಆ2 - ಸ.ಪ್ರಾ.ಶಿ'
  },
  {
    id: 'go-ed-112-ssa-2026',
    fileId: 'ಕಡತ-ಆ4/ಕಾಮಗಾರಿ/08/2026',
    orderNumber: 'ಇಡಿ 112 ಎಸ್‌ಎಸ್‌ಎ 2026',
    kgidNumber: 'SCH-GRANT',
    employeeName: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹಳೇನಗರ ಭದ್ರಾವತಿ',
    orderType: 'ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ ಅನುದಾನ ಮಂಜೂರಾತಿ',
    orderDate: '18-09-2025',
    effectiveDate: '01-10-2025',
    oldBasicPay: 0,
    newBasicPay: 0,
    createdBy: 'ಸಮಗ್ರ ಶಿಕ್ಷಣ ಕರ್ನಾಟಕ / ಬಿಇಒ',
    createdDate: '2025-09-18T10:00:00Z',
    generatedDocumentHtml: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h3 style="text-align: center; color: #0f172a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶ: ಇಡಿ 112 ಎಸ್‌ಎಸ್‌ಎ 2026</h3>
        <p><strong>ವಿಷಯ:</strong> ವಿವೇಕ ಯೋಜನೆಯಡಿ 2 ನೂತನ ಶಾಲಾ ಕೊಠಡಿಗಳ ನಿರ್ಮಾಣಕ್ಕೆ ₹28.50 ಲಕ್ಷ ಅನುದಾನ ಮಂಜೂರಾತಿ.</p>
        <p><strong>ಸರ್ಕಾರಿ ಆದೇಶ:</strong> ಸದರಿ ಶಾಲೆಯ ಕೊಠಡಿ ನಿರ್ಮಾಣ ಕಾಮಗಾರಿಗೆ ಮೊದಲ ಕಂತಿನ ಅನುದಾನ ₹14.25 ಲಕ್ಷವನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲು ಆದೇಶಿಸಲಾಗಿದೆ.</p>
      </div>
    `,
    generatedDocumentText: 'ಇಡಿ 112 ಎಸ್‌ಎಸ್‌ಎ 2026 - ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ ಅನುದಾನ ಮಂಜೂರಾತಿ',
    remarks: 'ಶಾಖೆ: ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ'
  }
];

const LOCAL_STORAGE_KEY = 'edu_government_orders_registry';

export const OrderFilesView: React.FC<OrderFilesViewProps> = ({
  currentUser,
  letters = [],
  onOpenOrderGenerator,
  onDraftLetterWithOrder,
  onViewLetter,
  onShowToast,
}) => {
  const [files, setFiles] = useState<OrderFile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load orders from localStorage:', e);
    }
    return DEFAULT_GOVERNMENT_ORDERS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [viewingFile, setViewingFile] = useState<OrderFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedOrderForLetters, setSelectedOrderForLetters] = useState<OrderFile | null>(null);

  // Helper to find all letters issued/linked pursuant to a specific order
  const getLinkedLettersForOrder = (orderNumber: string) => {
    if (!letters || letters.length === 0 || !orderNumber) return [];
    const cleanNum = orderNumber.trim().toLowerCase();
    return letters.filter(l => {
      if (l.linkedOrderNumber && l.linkedOrderNumber.trim().toLowerCase() === cleanNum) return true;
      if (l.subject && l.subject.toLowerCase().includes(cleanNum)) return true;
      if (l.bodyText && l.bodyText.toLowerCase().includes(cleanNum)) return true;
      return false;
    });
  };

  // Sync state to localStorage whenever files change
  const saveFilesToStorage = (updatedFiles: OrderFile[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/memorandum/order-files?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const serverFiles: OrderFile[] = data.files || [];
        
        // Merge server files with local files and default orders
        const mergedMap = new Map<string, OrderFile>();
        
        // Add defaults first
        for (const f of DEFAULT_GOVERNMENT_ORDERS) {
          mergedMap.set(f.orderNumber || f.id, f);
        }
        
        // Add existing local files
        for (const f of files) {
          mergedMap.set(f.orderNumber || f.id, f);
        }

        // Add server files
        for (const f of serverFiles) {
          mergedMap.set(f.orderNumber || f.id, f);
        }

        const combined = Array.from(mergedMap.values());
        setFiles(combined);
        saveFilesToStorage(combined);
      }
    } catch (err) {
      console.error('Failed to fetch order files from server, using local store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCopyOrderNumber = (orderNumber: string, id: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    if (onShowToast) onShowToast(`ಆದೇಶ ಸಂಖ್ಯೆ "${orderNumber}" ನಕಲಿಸಲಾಗಿದೆ!`);
  };

  const handleDownloadPdf = (file: OrderFile) => {
    try {
      generateGovernmentOrderPdf(file);
      if (onShowToast) onShowToast(`ಸರ್ಕಾರಿ ಆದೇಶ (${file.orderNumber}) PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!`);
    } catch (err) {
      console.error('Failed to download order PDF:', err);
      alert('ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ.');
    }
  };

  const handleSaveNewOrder = async (newOrder: OrderFile) => {
    const updated = [newOrder, ...files];
    setFiles(updated);
    saveFilesToStorage(updated);

    // Also attempt server sync if possible
    try {
      await fetch('/api/memorandum/generate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: {
            orderTypeId: newOrder.orderType,
            orderTypeName: newOrder.orderType,
            kgidNumber: newOrder.kgidNumber,
            orderNumber: newOrder.orderNumber,
            orderDate: newOrder.orderDate,
            effectiveDate: newOrder.effectiveDate,
            officialRemarks: newOrder.remarks,
          },
          employeeUpdates: {
            basicPay: newOrder.newBasicPay,
          }
        }),
      });
    } catch (e) {
      // Offline or local mode is fine
    }
  };

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`ನೀವು ನಿಜವಾಗಿಯೂ ಈ ಆದೇಶ ಕಡತವನ್ನು (${orderNumber}) ಅಳಿಸಲು ಬಯಸುವಿರಾ?`)) {
      return;
    }
    const updated = files.filter(f => f.id !== id && f.fileId !== id);
    setFiles(updated);
    saveFilesToStorage(updated);
    if (viewingFile?.id === id) setViewingFile(null);

    try {
      await fetch(`/api/memorandum/order-files/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
      });
    } catch (err) {
      // local delete already performed
    }

    if (onShowToast) onShowToast(`ಆದೇಶ (${orderNumber}) ಅಳಿಸಲಾಗಿದೆ.`);
  };

  const handlePrint = (file: OrderFile) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ಸರ್ಕಾರಿ ಆದೇಶ - ${file.orderNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="bg-white">
            <div class="no-print mb-4 flex justify-end gap-2 p-3 bg-stone-100 border-b">
              <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Print Now</button>
              <button onclick="window.close()" class="bg-stone-600 text-white px-4 py-2 rounded text-sm font-bold">Close</button>
            </div>
            ${file.generatedDocumentHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };

  // Section & Type Filtering
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // Type Filter
      if (selectedType !== 'All' && !f.orderType?.includes(selectedType)) return false;

      // Section Filter (ಆ1, ಆ2, ಆ3, ಆ4, ಆಡಳಿತ ಶಾಖೆ)
      if (selectedSection !== 'All') {
        const secText = (f.remarks || '' + f.fileId + f.orderType + f.generatedDocumentText).toLowerCase();
        if (selectedSection === 'ಆ1' && !secText.includes('ಆ1') && !secText.includes('ಪ್ರೌಢ')) return false;
        if (selectedSection === 'ಆ2' && !secText.includes('ಆ2') && !secText.includes('ಸ.ಪ್ರಾ.ಶಿ') && !secText.includes('ಪ್ರಾಥಮಿಕ')) return false;
        if (selectedSection === 'ಆ3' && !secText.includes('ಆ3') && !secText.includes('ಅನುದಾನಿತ') && !secText.includes('ಲೆಕ್ಕ')) return false;
        if (selectedSection === 'ಆ4' && !secText.includes('ಆ4') && !secText.includes('ಭೌತಿಕ') && !secText.includes('ಪರೀಕ್ಷೆ')) return false;
        if (selectedSection === 'ಆಡಳಿತ ಶಾಖೆ' && !secText.includes('ಆಡಳಿತ')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (f.orderNumber || '').toLowerCase();
        const emp = (f.employeeName || '').toLowerCase();
        const kgid = (f.kgidNumber || '').toLowerCase();
        const typ = (f.orderType || '').toLowerCase();
        const fileId = (f.fileId || '').toLowerCase();
        const text = (f.generatedDocumentText || '').toLowerCase();
        return num.includes(q) || emp.includes(q) || kgid.includes(q) || typ.includes(q) || fileId.includes(q) || text.includes(q);
      }

      return true;
    });
  }, [files, selectedType, selectedSection, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl p-5 shadow-[4px_4px_0px_#2b2b2b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2b2b2b] text-[#f59e0b] border-2 border-[#2b2b2b] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#f59e0b]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#f59e0b] text-[#2b2b2b] rounded border border-[#2b2b2b]">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಭಂಡಾರ • GO MASTER ARCHIVE
                </span>
                <span className="text-xs text-stone-600 font-bold font-kannada">
                  ಒಟ್ಟು ಅಧಿಕೃತ ಆದೇಶಗಳು: <strong>{files.length}</strong>
                </span>
              </div>
              <h1 className="text-xl font-black text-[#2b2b2b] mt-1 font-kannada tracking-wide">
                ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಮಹಾ ಪಟ್ಟಿ (Government Orders Registry & PDF Download)
              </h1>
              <p className="text-xs text-stone-600 font-kannada mt-0.5">
                ಇಲಾಖೆಯಿಂದ ಹೊರಡಿಸಲಾದ ಎಲ್ಲಾ ಜ್ಞಾಪನಾ & ಶಾಸನಬದ್ಧ ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಪಟ್ಟಿ, ಆದೇಶ ಸಂಖ್ಯೆ, ಪೂರ್ಣ ವಿವರಗಳು ಹಾಗೂ ತ್ವರಿತ PDF ಡೌನ್‌ಲೋಡ್.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={fetchFiles}
              className="p-2 border-2 border-[#2b2b2b] bg-white hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer shadow-[2px_2px_0px_#2b2b2b]"
              title="ಮರುಲೋಡ್ ಮಾಡಿ (Refresh)"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] text-xs font-black rounded-lg border-2 border-[#2b2b2b] shadow-[2.5px_2.5px_0px_#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada"
            >
              <Plus className="w-4 h-4" />
              <span>+ ನೂತನ ಸರ್ಕಾರಿ ಆದೇಶ ದಾಖಲಿಸಿ</span>
            </button>

            {/* 🌟 Dedicated Government Order Upload Button */}
            <button
              type="button"
              id="btn-upload-government-order"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-lg border-2 border-[#064e3b] shadow-[2.5px_2.5px_0px_#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada"
              title="ಸರ್ಕಾರಿ ಆದೇಶ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload Official Government Order PDF)"
            >
              <Upload className="w-4 h-4 text-emerald-200" />
              <span>+ ಸರ್ಕಾರಿ ಆದೇಶ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
            </button>

            {onOpenOrderGenerator && (
              <button
                type="button"
                onClick={onOpenOrderGenerator}
                className="px-3.5 py-2 bg-[#2b2b2b] hover:bg-stone-800 text-white text-xs font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2.5px_2.5px_0px_#f59e0b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada"
              >
                <FileText className="w-4 h-4 text-[#f59e0b]" />
                <span>ಜ್ಞಾಪನಾ ಜನರೇಟರ್ ತೆರೆಯಿರಿ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl p-4 shadow-[4px_4px_0px_#2b2b2b] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ಆದೇಶ ಸಂಖ್ಯೆ, ನೌಕರರ ಹೆಸರು, KGID, ವಿಷಯ ಹುಡುಕಿ..."
            className="w-full pl-9 pr-3 py-2 text-xs font-kannada bg-white border-2 border-stone-300 rounded-lg focus:border-[#2b2b2b] focus:outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-700 font-kannada">ಶಾಖೆ:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="text-xs border-2 border-stone-300 rounded-lg px-2.5 py-1.5 bg-amber-50 font-bold text-stone-800 outline-none font-kannada"
            >
              <option value="All">ಎಲ್ಲಾ ಶಾಖೆಗಳು (All)</option>
              <option value="ಆ1">ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ</option>
              <option value="ಆ2">ಆ2 - ಸ.ಪ್ರಾ.ಶಿ</option>
              <option value="ಆ3">ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ</option>
              <option value="ಆ4">ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ</option>
              <option value="ಆಡಳಿತ ಶಾಖೆ">ಆಡಳಿತ ಶಾಖೆ</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border-2 border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-stone-800 outline-none font-kannada font-bold"
            >
              <option value="All">ಎಲ್ಲಾ ಆದೇಶ ಪ್ರಕಾರಗಳು (All Types)</option>
              <option value="ಗಳಿಕೆ ರಜೆ">ಗಳಿಕೆ ರಜೆ</option>
              <option value="ಶಿಶುಪಾಲನ ರಜೆ">ಶಿಶುಪಾಲನ ರಜೆ</option>
              <option value="ಪಿತೃತ್ವ ರಜೆ">ಪಿತೃತ್ವ ರಜೆ (Paternity Leave)</option>
              <option value="10 ವರ್ಷ">10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ</option>
              <option value="15 ವರ್ಷ">15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ</option>
              <option value="20 ವರ್ಷ">20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
              <option value="25 ವರ್ಷ">25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
              <option value="30 ವರ್ಷ">30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
              <option value="7ನೇ ವೇತನ">7ನೇ ವೇತನ ಆಯೋಗ</option>
              <option value="ಅನುದಾನ">ಅನುದಾನ ಮಂಜೂರಾತಿ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Grid of Orders */}
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl overflow-hidden shadow-[4px_4px_0px_#2b2b2b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#2b2b2b] text-white border-b-2 border-[#2b2b2b] text-[11px] font-kannada uppercase tracking-wide">
                <th className="py-3 px-4">ಆದೇಶ ಸಂಖ್ಯೆ (Order No)</th>
                <th className="py-3 px-4">ಕಡತ ಸಂಖ್ಯೆ & ದಿನಾಂಕ</th>
                <th className="py-3 px-4">ನೌಕರರ ಹೆಸರು & KGID</th>
                <th className="py-3 px-4">ಆದೇಶ ಪ್ರಕಾರ (Type)</th>
                <th className="py-3 px-4">ವೇತನ / ಆರ್ಥಿಕ ಪರಿಷ್ಕರಣೆ</th>
                <th className="py-3 px-4">ಶಾಖೆ & ಪ್ರಾಧಿಕಾರ</th>
                <th className="py-3 px-4 text-right">ಕ್ರಮಗಳು (Actions & PDF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-900 bg-white">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-500 font-kannada">
                    ಯಾವುದೇ ಸರ್ಕಾರಿ ಆದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ. "+ ನೂತನ ಸರ್ಕಾರಿ ಆದೇಶ ದಾಖಲಿಸಿ" ಬಟನ್ ಬಳಸಿ ನೂತನ ಆದೇಶ ಸೇರಿಸಿ.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-amber-50/50 transition-colors">
                    {/* Order Number with Copy action */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sky-950 text-xs px-2 py-0.5 bg-sky-100 rounded border border-sky-300 block">
                          {file.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderNumber(file.orderNumber, file.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                          title="ಆದೇಶ ಸಂಖ್ಯೆ ನಕಲಿಸಿ"
                        >
                          {copiedId === file.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                        ✓ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ
                      </span>
                    </td>

                    {/* File ID & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-stone-800 block text-[11px]">{file.fileId}</span>
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-600" /> ದಿನಾಂಕ: {file.orderDate}
                      </span>
                    </td>

                    {/* Employee & KGID */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-900 block font-kannada">{file.employeeName}</span>
                      {file.kgidNumber && file.kgidNumber !== 'N/A' && (
                        <span className="text-[11px] font-mono text-stone-600 font-semibold">
                          KGID: {file.kgidNumber}
                        </span>
                      )}
                    </td>

                    {/* Order Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-kannada">
                        {file.orderType}
                      </span>
                    </td>

                    {/* Salary Revision */}
                    <td className="py-3.5 px-4 font-mono">
                      {file.oldBasicPay > 0 && file.newBasicPay > 0 && file.oldBasicPay !== file.newBasicPay ? (
                        <div>
                          <span className="text-stone-400 line-through text-[11px]">₹{file.oldBasicPay.toLocaleString('en-IN')}</span>
                          <span className="text-emerald-700 font-bold block text-xs">₹{file.newBasicPay.toLocaleString('en-IN')}/-</span>
                        </div>
                      ) : file.newBasicPay > 0 ? (
                        <span className="text-emerald-700 font-bold text-xs">₹{file.newBasicPay.toLocaleString('en-IN')}/-</span>
                      ) : (
                        <span className="text-stone-600 font-medium text-[11px] font-kannada">ಸೇವಾ / ರಜೆ ಆದೇಶ</span>
                      )}
                    </td>

                    {/* Section & Authority + Letters Issued Pursuant to this Order */}
                    <td className="py-3.5 px-4 text-stone-700 text-[11px] font-kannada">
                      <span className="font-semibold block">{file.remarks || 'ಆಡಳಿತ ಶಾಖೆ'}</span>
                      <span className="text-[10px] text-stone-500">{file.createdBy || 'BEO ಭದ್ರಾವತಿ'}</span>
                      {(() => {
                        const linked = getLinkedLettersForOrder(file.orderNumber);
                        if (linked.length > 0) {
                          return (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForLetters(file)}
                              className="mt-1.5 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] rounded border border-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                              title="ಈ ಆದೇಶದಂತೆ ಹೊರಡಿಸಲಾದ ಪತ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
                            >
                              <Award className="w-3 h-3 text-amber-700" />
                              <span>ಈ ಆದೇಶದಂತೆ: {linked.length} ಪತ್ರ{linked.length > 1 ? 'ಗಳು' : ''}</span>
                            </button>
                          );
                        }
                        return (
                          <span className="mt-1 text-[10px] text-stone-400 block font-kannada">
                            ಪತ್ರ ಹೊರಡಿಸಿಲ್ಲ
                          </span>
                        );
                      })()}
                    </td>

                    {/* Actions: View, PDF Download, Print, Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 🌟 Draft Letter under this Order */}
                        {onDraftLetterWithOrder && (
                          <button
                            type="button"
                            onClick={() => onDraftLetterWithOrder(file)}
                            className="px-2 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded text-[11px] font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer border border-[#2b2b2b] font-kannada"
                            title="ಈ ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ಅಧಿಕೃತ ಪತ್ರ ರಚಿಸಿ (Draft Official Letter under this Order)"
                          >
                            <FileText className="w-3.5 h-3.5 text-stone-900" />
                            <span className="hidden lg:inline">ಈ ಆದೇಶದಂತೆ ಪತ್ರ ರಚಿಸಿ</span>
                          </button>
                        )}

                        {/* 🌟 Direct PDF Download Button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(file)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                          title="ಸರ್ಕಾರಿ ಆದೇಶ PDF ಡೌನ್‌ಲೋಡ್ (Download Order PDF)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">PDF ಡೌನ್‌ಲೋಡ್</span>
                        </button>

                        {/* View Order Modal */}
                        <button
                          type="button"
                          onClick={() => setViewingFile(file)}
                          className="p-1.5 text-sky-950 hover:bg-sky-50 rounded border border-sky-300 transition-colors cursor-pointer"
                          title="ಆದೇಶ ವೀಕ್ಷಿಸಿ (View Order Details)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button
                          type="button"
                          onClick={() => handlePrint(file)}
                          className="p-1.5 text-stone-700 hover:bg-stone-100 rounded border border-stone-300 transition-colors cursor-pointer"
                          title="ಮುದ್ರಿಸಿ (Print Order)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (Admin) */}
                        {(currentUser?.role === 'Admin' || currentUser?.role === 'Administrator') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(file.id, file.orderNumber)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-300 transition-colors cursor-pointer"
                            title="ಆದೇಶ ಅಳಿಸಿ (Delete Order)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#fffbf2] rounded-xl border-[2.5px] border-[#2b2b2b] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#2b2b2b] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#2b2b2b] bg-[#2b2b2b] text-white rounded-t-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#2b2b2b] px-2 py-0.5 bg-[#f59e0b] rounded font-mono">
                    {viewingFile.orderType}
                  </span>
                  <span className="text-xs text-stone-300 font-mono">
                    {viewingFile.orderDate}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1 font-mono tracking-wide">
                  {viewingFile.orderNumber}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* PDF Download in Modal */}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(viewingFile)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs font-kannada"
                >
                  <Download className="w-3.5 h-3.5" /> PDF ಡೌನ್‌ಲೋಡ್
                </button>

                <button
                  type="button"
                  onClick={() => handlePrint(viewingFile)}
                  className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs font-kannada"
                >
                  <Printer className="w-3.5 h-3.5" /> ಮುದ್ರಿಸಿ
                </button>

                <button
                  type="button"
                  onClick={() => setViewingFile(null)}
                  className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-100/70">
              <div 
                className="bg-white shadow-xs border border-stone-300 p-6 sm:p-8 rounded-lg max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: viewingFile.generatedDocumentHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE GOVERNMENT ORDER MODAL */}
      <CreateGovernmentOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveOrder={handleSaveNewOrder}
        onShowToast={onShowToast}
      />

      {/* UPLOAD GOVERNMENT ORDER MODAL (GOVERNMENT ORDERS ONLY) */}
      <UploadGovernmentOrderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveOrder={handleSaveNewOrder}
        onShowToast={onShowToast}
      />

      {/* 🌟 LETTERS ISSUED PURSUANT TO THIS GOVERNMENT ORDER MODAL */}
      {selectedOrderForLetters && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl max-w-2xl w-full shadow-[8px_8px_0px_#2b2b2b] flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#2b2b2b] bg-[#2b2b2b] text-white rounded-t-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-wide font-kannada">
                    ಈ ಆದೇಶದಂತೆ ಹೊರಡಿಸಲಾದ ಪತ್ರಗಳು (Pursuant Letters)
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-300 font-kannada">
                    <span>ಆದೇಶ: <strong className="text-[#f59e0b] font-mono">{selectedOrderForLetters.orderNumber}</strong></span>
                    <span>• ದಿನಾಂಕ: {selectedOrderForLetters.orderDate}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForLetters(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {(() => {
                const linked = getLinkedLettersForOrder(selectedOrderForLetters.orderNumber);
                if (linked.length === 0) {
                  return (
                    <div className="p-6 text-center text-stone-600 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                      <p className="font-kannada text-xs font-semibold">
                        ಈ ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ (<strong>{selectedOrderForLetters.orderNumber}</strong>) ಇನ್ನೂ ಯಾವುದೇ ಪತ್ರಗಳು ಸಿದ್ಧಪಡಿಸಿಲ್ಲ.
                      </p>
                      <p className="text-[11px] text-stone-500 font-kannada">
                        ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ ಈ ಆದೇಶದ ಉಲ್ಲೇಖದೊಂದಿಗೆ ತಕ್ಷಣವೇ ಅಧಿಕೃತ ಪತ್ರವನ್ನು ರಚಿಸಬಹುದು.
                      </p>
                    </div>
                  );
                }

                return linked.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-white border-2 border-stone-300 rounded-lg shadow-2xs hover:border-[#2b2b2b] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-stone-800">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>{l.referenceNumber}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        l.direction === 'inward' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {l.direction === 'inward' ? 'ಆವಕ (Inward)' : 'ಜಾವಕ (Outward)'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 font-kannada mb-1">
                      {l.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-stone-600 font-kannada border-t border-stone-100 pt-1.5 mt-1.5 flex-wrap gap-2">
                      <div>
                        <span>ಸ್ವೀಕೃತಿದಾರರು/ರವಾನಿಸಿದವರು: </span>
                        <strong className="text-stone-800">{l.recipientName || l.senderName}</strong>
                      </div>
                      <div>
                        <span>ದಿನಾಂಕ: </span>
                        <strong>{l.dateReceivedOrIssued}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onViewLetter && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForLetters(null);
                              onViewLetter(l);
                            }}
                            className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold rounded text-[10px] cursor-pointer"
                          >
                            ಪತ್ರ ವೀಕ್ಷಿಸಿ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => generateLetterPdf(l)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Footer */}
            <div className="p-3 border-t-2 border-[#2b2b2b] bg-amber-50/80 flex items-center justify-between gap-2 rounded-b-lg">
              <span className="text-xs text-stone-600 font-kannada">
                ಸರ್ಕಾರಿ ಆದೇಶ: <strong>{selectedOrderForLetters.orderNumber}</strong>
              </span>

              {onDraftLetterWithOrder && (
                <button
                  type="button"
                  onClick={() => {
                    const orderToDraft = selectedOrderForLetters;
                    setSelectedOrderForLetters(null);
                    onDraftLetterWithOrder(orderToDraft);
                  }}
                  className="px-3 py-1.5 bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] border-2 border-[#2b2b2b] text-xs font-black rounded-lg shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 font-kannada cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ಈ ಆದೇಶದಂತೆ ನೂತನ ಪತ್ರ ರಚಿಸಿ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
