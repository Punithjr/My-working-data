import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  Award, 
  Calendar, 
  TrendingUp, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  IndianRupee, 
  FileSpreadsheet, 
  Briefcase, 
  RefreshCw, 
  X, 
  Eye, 
  FileCheck2, 
  Share2, 
  Layers, 
  ChevronRight,
  ExternalLink,
  BookOpen,
  Send,
  UserCheck,
  Upload,
  Paperclip,
  File,
  Trash2
} from 'lucide-react';
import { 
  Employee, 
  AdminAuthUser, 
  HrmsTransferRecord, 
  HrmsLeaveSanctionRecord, 
  HrmsPayBillRecord, 
  HrmsAparRecord, 
  HrmsLpcCertificate,
  HrmsServiceBookEntry 
} from '../types';
import { formatCurrency, formatBytes } from '../utils/formatters';

interface HrmsViewProps {
  currentUser: AdminAuthUser | null;
  employees: Employee[];
  onOpenEmployeeProfile?: (emp: Employee) => void;
  onNavigateTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

type HrmsSubTab = 
  | 'overview' 
  | 'serviceBook' 
  | 'transfers' 
  | 'leaveSanction' 
  | 'payBill' 
  | 'apar' 
  | 'seniorityTbas';

// Initial Mock Seed for HRMS Transfers
const INITIAL_TRANSFERS: HrmsTransferRecord[] = [
  {
    id: 'tr-01',
    employeeId: 'emp-bhd-staff-ramesh',
    employeeName: 'ಸಿ. ರಮೇಶ್ (C. Ramesh)',
    kgidNumber: '294812',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
    orderNumber: 'ಇಡಿ/41/ವರ್ಗ/2025-26',
    orderDate: '2026-02-15',
    issuingAuthority: 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI Shivamogga)',
    orderFileName: 'ವರ್ಗಾವಣೆ_ಆದೇಶ_ಇಡಿ_41_ರಮೇಶ್.pdf',
    transferType: 'ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ',
    fromOffice: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ತರೀಕೆರೆ',
    toOffice: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    relievingDate: '2026-02-28',
    joiningDate: '2026-03-02',
    status: 'ವರದಿ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ',
    lpcGenerated: true,
    notes: 'ತರೀಕೆರೆಯಿಂದ ಭದ್ರಾವತಿ ಬಿಇಒ ಕಛೇರಿಗೆ ಖಾಲಿ ಹುದ್ದೆಗೆ ಸ್ಥಳ ನಿಯುಕ್ತಿ.'
  },
  {
    id: 'tr-02',
    employeeId: 'emp-bhd-staff-lakshmi',
    employeeName: 'ಕೆ.ವಿ. ಲಕ್ಷ್ಮೀದೇವಿ (K.V. Lakshmidevi)',
    kgidNumber: '381920',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA)',
    orderNumber: 'ಡಿಡಿಪಿಐ/ಶಿಮ/ಸಿಬ್ಬಂದಿ-2/2025',
    orderDate: '2026-03-10',
    issuingAuthority: 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI Shivamogga)',
    orderFileName: 'ಪರಸ್ಪರ_ವರ್ಗಾವಣೆ_ಆದೇಶ_ಲಕ್ಷ್ಮೀದೇವಿ.pdf',
    transferType: 'ಪರಸ್ಪರ ವರ್ಗಾವಣೆ',
    fromOffice: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಕಾಗದನಗರ',
    toOffice: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    relievingDate: '2026-03-25',
    joiningDate: '2026-03-27',
    status: 'ಆದೇಶ ಜಾರಿ',
    lpcGenerated: false,
    notes: 'ಕೌನ್ಸಿಲಿಂಗ್ ಮೂಲಕ ಪರಸ್ಪರ ಕೋರಿಕೆ ವರ್ಗಾವಣೆ ಅನುಮೋದನೆ.'
  },
  {
    id: 'tr-03',
    employeeId: 'emp-bhd-beo-narayanappa',
    employeeName: 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ (B.K. Narayanappa)',
    kgidNumber: '100101',
    designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)',
    orderNumber: 'ಸರ್ಕಾರದ ಆದೇಶ ಸಂ: ಇಡಿ 12 ಕೆಇಎಸ್ 2024',
    orderDate: '2024-08-01',
    issuingAuthority: 'ಸರ್ಕಾರದ ಪ್ರಧಾನ ಕಾರ್ಯದರ್ಶಿಗಳು, ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಬೆಂಗಳೂರು',
    orderFileName: 'ಸರ್ಕಾರದ_ಆದೇಶ_ಇಡಿ_12_ಕೆಇಎಸ್_ನಾರಾಯಣಪ್ಪ.pdf',
    transferType: 'ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ',
    fromOffice: 'ಸಹಾಯಕ ನಿರ್ದೇಶಕರ ಕಛೇರಿ, ಶಿವಮೊಗ್ಗ',
    toOffice: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    relievingDate: '2024-08-09',
    joiningDate: '2024-08-10',
    status: 'ವರದಿ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ',
    lpcGenerated: true,
    notes: 'ಬಿಇಒ ಭದ್ರಾವತಿ ಹುದ್ದೆಗೆ ಪದೋನ್ನತಿ ಮೇರೆಗೆ ಸ್ಥಳನಿಯುಕ್ತಿ.'
  }
];

// Initial Leave Sanction Records
const INITIAL_LEAVE_SANCTIONS: HrmsLeaveSanctionRecord[] = [
  {
    id: 'ls-01',
    employeeId: 'emp-bhd-staff-lakshmi',
    employeeName: 'ಕೆ.ವಿ. ಲಕ್ಷ್ಮೀದೇವಿ (K.V. Lakshmidevi)',
    kgidNumber: '381920',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA)',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (CCL)',
    startDate: '2026-01-05',
    endDate: '2026-01-25',
    daysCount: 21,
    reason: 'ಮಗುವಿನ ಶಾಲಾ ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆ ಮತ್ತು ಆರೋಗ್ಯ ಪಾಲನೆ',
    sanctionOrderNumber: 'ಬಿಇಒ/ಭದ್ರಾ/ರಜೆ-ಮಂ/89/2026',
    sanctionDate: '2026-01-02',
    approvingAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    status: 'ಮಂಜೂರಾಗಿದೆ'
  },
  {
    id: 'ls-02',
    employeeId: 'emp-bhd-staff-ramesh',
    employeeName: 'ಸಿ. ರಮೇಶ್ (C. Ramesh)',
    kgidNumber: '294812',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
    leaveType: 'ಗಳಿಕೆ ರಜೆ (EL)',
    startDate: '2026-02-10',
    endDate: '2026-02-18',
    daysCount: 9,
    reason: 'ಸ್ವಂತ ಗೃಹ ನಿರ್ಮಾಣ ಕಾರ್ಯ ಹಾಗೂ ಖಾಸಗಿ ಕೆಲಸದ ನಿಮಿತ್ತ',
    sanctionOrderNumber: 'ಬಿಇಒ/ಭದ್ರಾ/ರಜೆ-ಮಂ/104/2026',
    sanctionDate: '2026-02-08',
    approvingAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    status: 'ಮಂಜೂರಾಗಿದೆ'
  },
  {
    id: 'ls-03',
    employeeId: 'emp-bhd-supt-manjunath',
    employeeName: 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ (H.S. Manjunatha)',
    kgidNumber: '184920',
    designation: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
    leaveType: 'ಸಾಂದರ್ಭಿಕ ರಜೆ (CL)',
    startDate: '2026-03-16',
    endDate: '2026-03-17',
    daysCount: 2,
    reason: 'ಕುಟುಂಬದ ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಹಾಜರಾಗಲು',
    sanctionOrderNumber: 'ಬಿಇಒ/ಭದ್ರಾ/ಸಿಎಲ್/22/2026',
    sanctionDate: '2026-03-14',
    approvingAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    status: 'ಮಂಜೂರಾಗಿದೆ'
  }
];

// Initial APAR Records
const INITIAL_APAR_RECORDS: HrmsAparRecord[] = [
  {
    id: 'apar-01',
    employeeId: 'emp-bhd-supt-manjunath',
    employeeName: 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ (H.S. Manjunatha)',
    kgidNumber: '184920',
    designation: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    cadre: 'Group-B (ಆಡಳಿತ)',
    reportingYear: '2024-25',
    selfAppraisalDate: '2025-05-15',
    reportingOfficer: 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ, ಬಿಇಒ ಭದ್ರಾವತಿ',
    reviewingOfficer: 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಿವಮೊಗ್ಗ',
    overallGrading: 'ಅತ್ಯುತ್ತಮ (Outstanding)',
    adverseRemarks: false,
    status: 'ಅಂತಿಮಗೊಂಡಿದೆ'
  },
  {
    id: 'apar-02',
    employeeId: 'emp-bhd-staff-ramesh',
    employeeName: 'ಸಿ. ರಮೇಶ್ (C. Ramesh)',
    kgidNumber: '294812',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
    cadre: 'Group-C (ಸಹಾಯಕ)',
    reportingYear: '2024-25',
    selfAppraisalDate: '2025-05-20',
    reportingOfficer: 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ, ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    reviewingOfficer: 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ, ಬಿಇಒ ಭದ್ರಾವತಿ',
    overallGrading: 'ಬಹಳ ಉತ್ತಮ (Very Good)',
    adverseRemarks: false,
    status: 'ಅಂತಿಮಗೊಂಡಿದೆ'
  },
  {
    id: 'apar-03',
    employeeId: 'emp-bhd-staff-lakshmi',
    employeeName: 'ಕೆ.ವಿ. ಲಕ್ಷ್ಮೀದೇವಿ (K.V. Lakshmidevi)',
    kgidNumber: '381920',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA)',
    cadre: 'Group-C (ಸಹಾಯಕ)',
    reportingYear: '2024-25',
    selfAppraisalDate: '2025-05-22',
    reportingOfficer: 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ, ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
    reviewingOfficer: 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ, ಬಿಇಒ ಭದ್ರಾವತಿ',
    overallGrading: 'ಬಹಳ ಉತ್ತಮ (Very Good)',
    adverseRemarks: false,
    status: 'ಅಂತಿಮಗೊಂಡಿದೆ'
  }
];

export const HrmsView: React.FC<HrmsViewProps> = ({
  currentUser,
  employees,
  onOpenEmployeeProfile,
  onNavigateTab,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<HrmsSubTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCadreFilter, setSelectedCadreFilter] = useState('ALL');

  // Sub-module states
  const [transfers, setTransfers] = useState<HrmsTransferRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edu_hrms_transfers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TRANSFERS;
  });
  const [leaveSanctions, setLeaveSanctions] = useState<HrmsLeaveSanctionRecord[]>(INITIAL_LEAVE_SANCTIONS);
  const [aparRecords, setAparRecords] = useState<HrmsAparRecord[]>(INITIAL_APAR_RECORDS);

  // Modals
  const [selectedEmployeeForBook, setSelectedEmployeeForBook] = useState<Employee | null>(null);
  const [selectedEmployeeForLpc, setSelectedEmployeeForLpc] = useState<Employee | null>(null);
  const [selectedTransferForLpc, setSelectedTransferForLpc] = useState<HrmsTransferRecord | null>(null);
  const [isLpcModalOpen, setIsLpcModalOpen] = useState(false);
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [selectedEmployeeForSlip, setSelectedEmployeeForSlip] = useState<Employee | null>(null);
  const [isNewServiceEntryModalOpen, setIsNewServiceEntryModalOpen] = useState(false);
  const [previewOrderDoc, setPreviewOrderDoc] = useState<{ url: string; name: string; title: string } | null>(null);
  const [uploadTargetTransfer, setUploadTargetTransfer] = useState<HrmsTransferRecord | null>(null);

  // LPC Dynamic Field States (live editable and auto-populated from transfer record)
  const [lpcOrderNumber, setLpcOrderNumber] = useState('');
  const [lpcOrderDate, setLpcOrderDate] = useState('');
  const [lpcIssuingAuthority, setLpcIssuingAuthority] = useState('');
  const [lpcFromOffice, setLpcFromOffice] = useState('');
  const [lpcToOffice, setLpcToOffice] = useState('');
  const [lpcRelievingDate, setLpcRelievingDate] = useState('');

  // Form states for New Transfer (with Issuing Authority & Upload)
  const [transferForm, setTransferForm] = useState({
    employeeKgid: '',
    transferType: 'ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ' as HrmsTransferRecord['transferType'],
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    issuingAuthority: 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI Shivamogga)',
    customIssuingAuthority: '',
    orderFileUrl: '',
    orderFileName: '',
    orderFileSize: '',
    fromOffice: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    toOffice: '',
    relievingDate: new Date().toISOString().split('T')[0],
    joiningDate: '',
    notes: ''
  });

  // Open LPC certificate modal prefilled with Transfer Order details
  const openLpcForTransfer = (tr: HrmsTransferRecord) => {
    setSelectedTransferForLpc(tr);
    const emp = employees.find(e => (tr.kgidNumber && e.kgidNumber === tr.kgidNumber) || e.id === tr.employeeId);
    if (emp) {
      setSelectedEmployeeForLpc(emp);
    } else {
      setSelectedEmployeeForLpc({
        id: tr.employeeId,
        employeeCode: `HRMS-${tr.kgidNumber}`,
        fullName: tr.employeeName,
        kgidNumber: tr.kgidNumber,
        designation: tr.designation,
        basicPay: 52650,
        section: 'Administration & Services',
        officeLocation: tr.fromOffice,
        joiningDate: '2010-01-01',
        email: '',
        phone: ''
      });
    }

    setLpcOrderNumber(tr.orderNumber || '');
    setLpcOrderDate(tr.orderDate || new Date().toISOString().split('T')[0]);
    setLpcIssuingAuthority(tr.issuingAuthority || 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI Shivamogga)');
    setLpcFromOffice(tr.fromOffice || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ');
    setLpcToOffice(tr.toOffice || '');
    setLpcRelievingDate(tr.relievingDate || new Date().toISOString().split('T')[0]);
    setIsLpcModalOpen(true);
  };

  // Handle uploading transfer order document file
  const handleTransferFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setTransferForm(prev => ({
        ...prev,
        orderFileUrl: result,
        orderFileName: file.name,
        orderFileSize: formatBytes(file.size)
      }));
    };
    reader.readAsDataURL(file);
  };

  // Attach order document to an existing transfer record
  const handleAttachOrderToExistingTransfer = (trId: string, file: File, issuingAuth?: string) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setTransfers(prev => {
        const updated = prev.map(t => {
          if (t.id === trId) {
            return {
              ...t,
              orderFileUrl: result,
              orderFileName: file.name,
              orderFileSize: formatBytes(file.size),
              orderUploadedAt: new Date().toISOString().split('T')[0],
              issuingAuthority: issuingAuth || t.issuingAuthority
            };
          }
          return t;
        });
        try {
          localStorage.setItem('edu_hrms_transfers', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      setUploadTargetTransfer(null);
      onShowToast?.(`ವರ್ಗಾವಣೆ ಆದೇಶದ ಪ್ರತಿ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!`);
    };
    reader.readAsDataURL(file);
  };

  // Form states for New Leave
  const [leaveForm, setLeaveForm] = useState({
    employeeKgid: '',
    leaveType: 'ಸಾಂದರ್ಭಿಕ ರಜೆ (CL)' as HrmsLeaveSanctionRecord['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    reason: '',
    orderNumber: `ಬಿಇಒ/ಭದ್ರಾ/ರಜೆ-ಮಂ/${Math.floor(Math.random() * 800 + 100)}/2026`
  });

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        emp.fullName.toLowerCase().includes(q) ||
        (emp.kgidNumber && emp.kgidNumber.toLowerCase().includes(q)) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(q)) ||
        (emp.designation && emp.designation.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (selectedCadreFilter === 'TEACHING') {
        return emp.designation?.includes('ಶಿಕ್ಷಕ') || emp.designation?.includes('Teacher');
      }
      if (selectedCadreFilter === 'NON_TEACHING') {
        return !emp.designation?.includes('ಶಿಕ್ಷಕ') && !emp.designation?.includes('Teacher');
      }
      if (selectedCadreFilter === 'GROUP_A_B') {
        return emp.basicPay && emp.basicPay >= 50000;
      }
      if (selectedCadreFilter === 'GROUP_C_D') {
        return !emp.basicPay || emp.basicPay < 50000;
      }
      return true;
    });
  }, [employees, searchQuery, selectedCadreFilter]);

  // Quick stats
  const totalStaffCount = employees.length;
  const sanctionedPosts = 142; // Karnataka standard sanctioned posts for taluk
  const vacantPosts = sanctionedPosts - totalStaffCount > 0 ? sanctionedPosts - totalStaffCount : 18;

  // Monthly Pay Bill Summary for Current Month (March 2026)
  const payBillSummary = useMemo(() => {
    let grossTotal = 0;
    let deductionTotal = 0;

    employees.forEach(emp => {
      const bp = emp.basicPay || 37900;
      const da = Math.round(bp * 0.50); // 50% DA
      const hra = Math.round(bp * 0.08); // 8% taluk HRA
      const med = 200;
      const gross = bp + da + hra + med;

      const kgid = Math.round(bp * 0.06); // 6% KGID
      const gpfNps = Math.round((bp + da) * 0.10); // 10% NPS
      const gis = 240;
      const pt = 200;
      const it = bp > 60000 ? 3500 : 0;
      const deductions = kgid + gpfNps + gis + pt + it;

      grossTotal += gross;
      deductionTotal += deductions;
    });

    const netTotal = grossTotal - deductionTotal;

    return {
      billMonth: 'ಮಾರ್ಚ್ 2026 (March 2026)',
      ddoCode: '0814EDN001',
      treasuryCode: '2601 - ಉಪಖಜಾನೆ, ಭದ್ರಾವತಿ',
      tokenNo: 'K2-BHD-2026-09824',
      tokenDate: '2026-03-25',
      grossTotal,
      deductionTotal,
      netTotal,
      staffCount: employees.length
    };
  }, [employees]);

  // Handle Create Transfer
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(ep => ep.kgidNumber === transferForm.employeeKgid || ep.id === transferForm.employeeKgid);
    if (!emp) {
      alert('ದಯವಿಟ್ಟು ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.');
      return;
    }

    const finalIssuingAuth = transferForm.issuingAuthority === 'CUSTOM'
      ? (transferForm.customIssuingAuthority.trim() || 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ')
      : transferForm.issuingAuthority;

    const newRecord: HrmsTransferRecord = {
      id: `tr-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      kgidNumber: emp.kgidNumber || '',
      designation: emp.designation,
      orderNumber: transferForm.orderNumber.trim() || `ಬಿಇಒ/ಭದ್ರಾ/ವರ್ಗ/${Math.floor(Math.random() * 500 + 10)}/2026`,
      orderDate: transferForm.orderDate,
      issuingAuthority: finalIssuingAuth,
      orderFileUrl: transferForm.orderFileUrl || undefined,
      orderFileName: transferForm.orderFileName || undefined,
      orderFileSize: transferForm.orderFileSize || undefined,
      orderUploadedAt: transferForm.orderFileUrl ? new Date().toISOString().split('T')[0] : undefined,
      transferType: transferForm.transferType,
      fromOffice: transferForm.fromOffice,
      toOffice: transferForm.toOffice,
      relievingDate: transferForm.relievingDate || undefined,
      joiningDate: transferForm.joiningDate || undefined,
      status: 'ಆದೇಶ ಜಾರಿ',
      lpcGenerated: false,
      notes: transferForm.notes
    };

    const updated = [newRecord, ...transfers];
    setTransfers(updated);
    try {
      localStorage.setItem('edu_hrms_transfers', JSON.stringify(updated));
    } catch (err) {}

    setIsNewTransferModalOpen(false);
    onShowToast?.(`ವರ್ಗಾವಣೆ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಯಿತು (${emp.fullName}) - LPC ಗೆ ಸಿದ್ಧವಾಗಿದೆ!`);
  };

  // Handle Create Leave Sanction
  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(ep => ep.kgidNumber === leaveForm.employeeKgid);
    if (!emp) {
      alert('ದಯವಿಟ್ಟು ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.');
      return;
    }

    const newSanction: HrmsLeaveSanctionRecord = {
      id: `ls-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      kgidNumber: emp.kgidNumber || '',
      designation: emp.designation,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      daysCount: Number(leaveForm.daysCount) || 1,
      reason: leaveForm.reason || 'ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಿಗಾಗಿ',
      sanctionOrderNumber: leaveForm.orderNumber,
      sanctionDate: new Date().toISOString().split('T')[0],
      approvingAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
      status: 'ಮಂಜೂರಾಗಿದೆ'
    };

    setLeaveSanctions([newSanction, ...leaveSanctions]);
    setIsNewLeaveModalOpen(false);
    onShowToast?.(`ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ಸೃಜಿಸಲಾಗಿದೆ: ${emp.fullName}`);
  };

  // Print LPC Certificate
  const handlePrintLpc = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Official Karnataka Government HRMS Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white p-5 sm:p-7 rounded-2xl border-2 border-emerald-600/50 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Building2 className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[11px] font-black uppercase font-mono tracking-wider">
                HRMS 2.0 • KHAJANE-2 LINKED
              </span>
              <span className="text-xs text-emerald-300 font-bold font-kannada">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣಾ ಇಲಾಖೆ (DPAR)
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                DDO CODE: 0814EDN001
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-kannada tracking-tight">
              ಮಾನವ ಸಂಪನ್ಮೂಲ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ (HRMS 2.0)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-kannada max-w-3xl leading-relaxed">
              ಡಿಜಿಟಲ್ ಸೇವಾ ಪುಸ್ತಕ (e-Service Book), ವರ್ಗಾವಣೆ & ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (LPC), ರಜೆ ಮಂಜೂರಾತಿ (e-Leave), ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ಷಮತೆ (APAR) ಹಾಗೂ ಖಜಾನೆ-2 ಮಾಸಿಕ ವೇತನ ಬಿಲ್ಲು ನಿರ್ವಹಣಾ ಅಧಿಕೃತ ಪೋರ್ಟಲ್.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setIsNewTransferModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>+ ವರ್ಗಾವಣೆ ಆದೇಶ</span>
            </button>
            <button
              onClick={() => setIsNewLeaveModalOpen(true)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-200 border border-emerald-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>+ ರಜೆ ಮಂಜೂರಾತಿ</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60 text-xs">
          <div className="bg-stone-900/80 p-3 rounded-xl border border-emerald-700/40">
            <div className="text-[11px] text-emerald-300 font-kannada">ಮಂಜೂರಾದ ಹುದ್ದೆಗಳು (Sanctioned)</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{sanctionedPosts}</div>
            <div className="text-[10px] text-stone-400">ಸರ್ಕಾರಿ & ಅನುದಾನಿತ ಒಟ್ಟು</div>
          </div>
          <div className="bg-stone-900/80 p-3 rounded-xl border border-emerald-700/40">
            <div className="text-[11px] text-emerald-300 font-kannada">ಕಾರ್ಯನಿರತ ಸಿಬ್ಬಂದಿ (In-Position)</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{totalStaffCount}</div>
            <div className="text-[10px] text-emerald-200/80">ಸಕ್ರಿಯ ನೌಕರರು (HRMS Verified)</div>
          </div>
          <div className="bg-stone-900/80 p-3 rounded-xl border border-emerald-700/40">
            <div className="text-[11px] text-amber-300 font-kannada">ಖಾಲಿ ಹುದ್ದೆಗಳು (Vacancies)</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">{vacantPosts}</div>
            <div className="text-[10px] text-stone-400">ನೇಮಕಾತಿ / ವರ್ಗಾವಣೆಗೆ ಲಭ್ಯ</div>
          </div>
          <div className="bg-stone-900/80 p-3 rounded-xl border border-emerald-700/40">
            <div className="text-[11px] text-sky-300 font-kannada">ಮಾಸಿಕ ವೇತನ ಬಿಲ್ಲು (Khajane-2)</div>
            <div className="text-sm font-bold text-sky-400 mt-1 font-mono">PASS • TOKEN ISSUED</div>
            <div className="text-[10px] text-stone-400">ಮಾರ್ಚ್ 2026 ವೇತನ ಪಟ್ಟಿ</div>
          </div>
        </div>
      </div>

      {/* 2. HRMS Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border-2 border-stone-800 shadow-sm flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'overview'
              ? 'bg-stone-900 text-amber-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>1. ಮುಖಪುಟ & ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
        </button>

        <button
          onClick={() => setActiveSubTab('serviceBook')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'serviceBook'
              ? 'bg-stone-900 text-emerald-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>2. ಇ-ಸರ್ವೀಸ್ ಬುಕ್ (Service Book)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'transfers'
              ? 'bg-stone-900 text-sky-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>3. ವರ್ಗಾವಣೆ & LPC ಪ್ರಮಾಣಪತ್ರ</span>
          <span className="px-1.5 py-0.2 rounded-full bg-sky-900 text-sky-200 text-[10px] font-mono">
            {transfers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaveSanction')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'leaveSanction'
              ? 'bg-stone-900 text-rose-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-rose-400" />
          <span>4. ರಜೆ ಮಂಜೂರಾತಿ (e-Leave)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-200 text-[10px] font-mono">
            {leaveSanctions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payBill')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'payBill'
              ? 'bg-stone-900 text-amber-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
          <span>5. ಮಾಸಿಕ ವೇತನ ಪಟ್ಟಿ (Khajane-2)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('apar')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'apar'
              ? 'bg-stone-900 text-purple-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
          <span>6. ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ಷಮತೆ (APAR)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('seniorityTbas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-kannada ${
            activeSubTab === 'seniorityTbas'
              ? 'bg-stone-900 text-emerald-300 shadow-sm'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>7. ಜ್ಯೇಷ್ಠತಾ & ಕಾಲಬದ್ಧ ಬಡ್ತಿ (TBAS)</span>
        </button>
      </div>

      {/* ========================================================
          SUB-TAB 1: OVERVIEW & EXECUTIVE HRMS DASHBOARD
         ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveSubTab('serviceBook')}
              className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm hover:border-emerald-600 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 font-kannada group-hover:text-emerald-700 transition">
                    ಇ-ಸರ್ವೀಸ್ ಬುಕ್ (Digital Service Register)
                  </h3>
                  <p className="text-xs text-stone-600 font-kannada mt-1 leading-relaxed">
                    ನೌಕರರ ಮೂಲ ಸೇವಾ ದಾಖಲೆ, ವೇತನ ಶ್ರೇಣಿ, ವಾರ್ಷಿಕ ಬಡ್ತಿ ಹಾಗೂ ಪರಿವೀಕ್ಷಣಾ ಅವಧಿ ಸಕ್ರಮೀಕರಣ ವಹಿ.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-stone-200 flex items-center justify-between text-xs text-emerald-700 font-bold font-kannada">
                <span>ಸೇವಾ ವಹಿ ಪರಿಶೀಲಿಸಿ ({employees.length} ನೌಕರರು)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => setActiveSubTab('transfers')}
              className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm hover:border-sky-600 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 font-kannada group-hover:text-sky-700 transition">
                    ವರ್ಗಾವಣೆ, ಕಾರ್ಯಮುಕ್ತ & LPC ಪ್ರಮಾಣಪತ್ರ
                  </h3>
                  <p className="text-xs text-stone-600 font-kannada mt-1 leading-relaxed">
                    ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ, ಕೌನ್ಸಿಲಿಂಗ್, ಕಾರ್ಯಮುಕ್ತ ಆದೇಶ ಹಾಗೂ ಅಧಿಕೃತ ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-stone-200 flex items-center justify-between text-xs text-sky-700 font-bold font-kannada">
                <span>LPC ಜನರೇಟ್ ಮಾಡಿ</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => setActiveSubTab('payBill')}
              className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm hover:border-amber-600 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 font-kannada group-hover:text-amber-700 transition">
                    ಖಜಾನೆ-2 ಮಾಸಿಕ ವೇತನ ಬಿಲ್ಲು & ಸ್ಲಿಪ್
                  </h3>
                  <p className="text-xs text-stone-600 font-kannada mt-1 leading-relaxed">
                    ಮಾರ್ಚ್ 2026 ಮಾಸಿಕ ವೇತನ ಪಟ್ಟಿ, ಡಿಡಿಓ ಟೋಕನ್ ಸಲ್ಲಿಕೆ ಹಾಗೂ ನೌಕರರ ಅಧಿಕೃತ ವೇತನ ಚೀಟಿ (Salary Slip).
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-stone-200 flex items-center justify-between text-xs text-amber-700 font-bold font-kannada">
                <span>ವೇತನ ಬಿಲ್ಲು ವೀಕ್ಷಿಸಿ</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Recent HRMS Activity Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Transfers */}
            <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-stone-900 font-kannada text-sm">
                    ಇತ್ತೀಚಿನ ವರ್ಗಾವಣೆ & ನಿಯೋಜನೆಗಳು (Transfers)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('transfers')}
                  className="text-xs text-sky-700 font-bold font-kannada hover:underline cursor-pointer"
                >
                  ಎಲ್ಲಾ ವರ್ಗಾವಣೆಗಳು &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {transfers.slice(0, 3).map(tr => (
                  <div key={tr.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 font-kannada">{tr.employeeName}</div>
                      <div className="text-[11px] text-stone-500 font-kannada mt-0.5">
                        {tr.fromOffice} &rarr; {tr.toOffice}
                      </div>
                      <div className="text-[10px] font-mono text-stone-600 mt-0.5">
                        KGID: {tr.kgidNumber} • ಆದೇಶ: {tr.orderNumber}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 font-kannada shrink-0">
                      {tr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leave Sanctions */}
            <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-stone-900 font-kannada text-sm">
                    ಇತ್ತೀಚಿನ ರಜೆ ಮಂಜೂರಾತಿಗಳು (Leave Sanctions)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('leaveSanction')}
                  className="text-xs text-rose-700 font-bold font-kannada hover:underline cursor-pointer"
                >
                  ರಜೆ ರಿಜಿಸ್ಟರ್ &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {leaveSanctions.slice(0, 3).map(ls => (
                  <div key={ls.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 font-kannada">{ls.employeeName}</div>
                      <div className="text-[11px] text-rose-800 font-bold font-kannada mt-0.5">
                        {ls.leaveType} ({ls.daysCount} ದಿನಗಳು)
                      </div>
                      <div className="text-[10px] text-stone-500 font-kannada mt-0.5">
                        {ls.startDate} ರಿಂದ {ls.endDate} • {ls.reason}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 font-kannada shrink-0">
                      {ls.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: DIGITAL SERVICE BOOK (ಇ-ಸರ್ವೀಸ್ ಬುಕ್)
         ======================================================== */}
      {activeSubTab === 'serviceBook' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>ಇ-ಸರ್ವೀಸ್ ಬುಕ್ ರಿಜಿಸ್ಟರ್ (Digital Service Book)</span>
              </h3>
              <p className="text-xs text-stone-500 font-kannada mt-0.5">
                ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿ (KCSR) ಅನ್ವಯ ನೌಕರರ ಡಿಜಿಟಲ್ ಸೇವಾ ಪುಸ್ತಕ ಹಾಗೂ ಪ್ರಮಾಣೀಕರಣ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="KGID / ಹೆಸರು / ಹುದ್ದೆ ಹುಡುಕಿ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 w-56 font-kannada"
                />
              </div>

              <select
                value={selectedCadreFilter}
                onChange={(e) => setSelectedCadreFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white font-kannada cursor-pointer"
              >
                <option value="ALL">ಎಲ್ಲಾ ಸಿಬ್ಬಂದಿ</option>
                <option value="TEACHING">ಬೋಧಕ ಸಿಬ್ಬಂದಿ (Teachers)</option>
                <option value="NON_TEACHING">ಬೋಧಕೇತರ ಸಿಬ್ಬಂದಿ (Office Staff)</option>
                <option value="GROUP_A_B">ಗ್ರೂಪ್-ಎ & ಬಿ</option>
                <option value="GROUP_C_D">ಗ್ರೂಪ್-ಸಿ & ಡಿ</option>
              </select>
            </div>
          </div>

          {/* Employee Service Book List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                  <th className="p-3">ಕ್ರಮ ಸಂ.</th>
                  <th className="p-3">ನೌಕರರ ಹೆಸರು & ಹುದ್ದೆ</th>
                  <th className="p-3">KGID ಸಂಖ್ಯೆ</th>
                  <th className="p-3">HRMS ಕೋಡ್</th>
                  <th className="p-3">ಮೂಲ ವೇತನ / ಶ್ರೇಣಿ</th>
                  <th className="p-3">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ</th>
                  <th className="p-3">ವಾರ್ಷಿಕ ಬಡ್ತಿ ತಿಂಗಳು</th>
                  <th className="p-3 text-right">ಕ್ರಮ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-500">{index + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900 font-kannada">{emp.fullName}</div>
                      <div className="text-[11px] text-stone-500 font-kannada">{emp.designation}</div>
                      <div className="text-[10px] text-emerald-700 font-kannada">{emp.officeLocation}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800">
                      {emp.kgidNumber || '—'}
                    </td>
                    <td className="p-3 font-mono text-stone-600">
                      {emp.employeeCode || `HRMS-${emp.kgidNumber || '00'}`}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900 font-mono">
                        {emp.basicPay ? formatCurrency(emp.basicPay) : '₹37,900'}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono truncate max-w-[150px]">
                        {emp.payScale || '37900-70850'}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-stone-700">
                      {emp.joiningDate || emp.appointmentDate || '2012-06-15'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-kannada">
                        {emp.incrementMonth === 'July' ? 'ಜುಲೈ' : 'ಜನವರಿ'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEmployeeForBook(emp)}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs font-kannada flex items-center gap-1 cursor-pointer shadow-xs"
                          title="ಇ-ಸರ್ವೀಸ್ ಬುಕ್ ವೀಕ್ಷಿಸಿ"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>ಇ-ಸರ್ವೀಸ್ ಬುಕ್</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployeeForSlip(emp);
                            setIsSalarySlipModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg font-bold text-xs font-kannada flex items-center gap-1 cursor-pointer"
                          title="ವೇತನ ಚೀಟಿ (Salary Slip)"
                        >
                          <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                          <span>ವೇತನ ಚೀಟಿ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: TRANSFERS, RELIEVING & LPC CERTIFICATE
         ======================================================== */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada flex items-center gap-2">
                  <Send className="w-5 h-5 text-sky-600" />
                  <span>ವರ್ಗಾವಣೆ, ನಿಯೋಜನೆ & ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (Transfers & LPC)</span>
                </h3>
                <p className="text-xs text-stone-500 font-kannada mt-0.5">
                  ವರ್ಗಾವಣೆ ಆದೇಶಗಳು, ಕಾರ್ಯಮುಕ್ತ (Relieving) ಆದೇಶ & ಅಧಿಕೃತ KCSR LPC ಪ್ರಮಾಣಪತ್ರ ಸೃಜನೆ.
                </p>
              </div>

              <button
                onClick={() => setIsNewTransferModalOpen(true)}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer font-kannada"
              >
                <Plus className="w-4 h-4" />
                <span>+ ನೂತನ ವರ್ಗಾವಣೆ ದಾಖಲಿಸಿ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                    <th className="p-3">ಕ್ರಮ ಸಂ.</th>
                    <th className="p-3">ನೌಕರರ ವಿವರ</th>
                    <th className="p-3">ಆದೇಶ ಸಂಖ್ಯೆ & ದಿನಾಂಕ</th>
                    <th className="p-3 min-w-[170px]">ಆದೇಶ ನೀಡಿದವರ ವಿವರ</th>
                    <th className="p-3 min-w-[130px]">ಆದೇಶದ ಪ್ರತಿ (Upload)</th>
                    <th className="p-3">ಕಾರ್ಯಸ್ಥಳ (From ➔ To)</th>
                    <th className="p-3">ಸ್ಥಿತಿ</th>
                    <th className="p-3 text-right">LPC / ಕ್ರಮ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {transfers.map((tr, idx) => {
                    const emp = employees.find(e => (tr.kgidNumber && e.kgidNumber === tr.kgidNumber) || e.id === tr.employeeId);
                    return (
                      <tr key={tr.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-stone-900 font-kannada">{tr.employeeName}</div>
                          <div className="text-[11px] text-stone-500 font-kannada">{tr.designation}</div>
                          <div className="text-[10px] text-stone-600 font-mono">KGID: {tr.kgidNumber || '—'}</div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="font-bold text-stone-800 text-xs">{tr.orderNumber}</div>
                          <div className="text-[11px] text-stone-500">{tr.orderDate}</div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-stone-100 text-stone-700 font-kannada">
                            {tr.transferType}
                          </span>
                        </td>
                        {/* Column: Issuing Authority */}
                        <td className="p-3">
                          <div className="text-xs font-bold text-sky-950 font-kannada">
                            🏛️ {tr.issuingAuthority || 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ'}
                          </div>
                          <div className="text-[10px] text-stone-500 font-kannada mt-0.5">
                            ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ (Competent Authority)
                          </div>
                        </td>
                        {/* Column: Uploaded Order Copy / Quick Upload */}
                        <td className="p-3">
                          {tr.orderFileName || tr.orderFileUrl ? (
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (tr.orderFileUrl) {
                                    setPreviewOrderDoc({
                                      url: tr.orderFileUrl,
                                      name: tr.orderFileName || 'Transfer Order',
                                      title: `ವರ್ಗಾವಣೆ ಆದೇಶ: ${tr.orderNumber}`
                                    });
                                  } else {
                                    alert(`ಆದೇಶ ಕಡತ: ${tr.orderFileName}`);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-bold cursor-pointer font-kannada transition"
                                title="ಆದೇಶ ಪ್ರತಿ ವೀಕ್ಷಿಸಿ"
                              >
                                <Paperclip className="w-3 h-3 text-emerald-600" />
                                <span className="truncate max-w-[110px]">{tr.orderFileName || 'ಆದೇಶ ಪ್ರತಿ'}</span>
                              </button>
                              <div>
                                <label className="text-[10px] text-sky-700 hover:underline cursor-pointer inline-flex items-center gap-1 font-kannada">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>ಬದಲಾಯಿಸಿ</span>
                                  <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleAttachOrderToExistingTransfer(tr.id, file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-bold cursor-pointer font-kannada transition">
                              <Upload className="w-3 h-3 text-amber-600" />
                              <span>+ ಆದೇಶ ಪ್ರತಿ Upload</span>
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAttachOrderToExistingTransfer(tr.id, file);
                                }}
                              />
                            </label>
                          )}
                        </td>
                        {/* Column: From / To Offices */}
                        <td className="p-3 font-kannada">
                          <div className="text-stone-600 text-[11px]">ಇಲ್ಲಿಂದ: {tr.fromOffice}</div>
                          <div className="font-bold text-stone-900 text-xs">ಇಲ್ಲಿಗೆ: ➔ {tr.toOffice}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-kannada ${
                            tr.status === 'ವರದಿ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ' 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {tr.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openLpcForTransfer(tr)}
                            className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg font-bold text-xs font-kannada inline-flex items-center gap-1 cursor-pointer shadow-xs"
                            title="ಈ ಆದೇಶದ ಆಧಾರದ ಮೇಲೆ LPC ಪ್ರಮಾಣಪತ್ರ ಸೃಜಿಸಿ"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>LPC ಪ್ರಮಾಣಪತ್ರ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: LEAVE SANCTIONS (ರಜೆ ಮಂಜೂರಾತಿ)
         ======================================================== */}
      {activeSubTab === 'leaveSanction' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <span>ರಜೆ ನಿರ್ವಹಣೆ & ಮಂಜೂರಾತಿ ರಿಜಿಸ್ಟರ್ (e-Leave Sanctions)</span>
              </h3>
              <p className="text-xs text-stone-500 font-kannada mt-0.5">
                KCSR ರಜೆ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಗಳಿಕೆ ರಜೆ, ಸಾಂದರ್ಭಿಕ ರಜೆ ಹಾಗೂ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶಗಳು.
              </p>
            </div>

            <button
              onClick={() => setIsNewLeaveModalOpen(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Plus className="w-4 h-4" />
              <span>+ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ರಚಿಸಿ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                  <th className="p-3">ಕ್ರಮ ಸಂ.</th>
                  <th className="p-3">ನೌಕರರ ವಿವರ</th>
                  <th className="p-3">ರಜೆಯ ವಿಧ</th>
                  <th className="p-3">ಅವಧಿ (From - To)</th>
                  <th className="p-3">ದಿನಗಳು</th>
                  <th className="p-3">ಕಾರಣ</th>
                  <th className="p-3">ಆದೇಶ ಸಂ. & ಪ್ರಾಧಿಕಾರ</th>
                  <th className="p-3 text-right">ಸ್ಥಿತಿ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {leaveSanctions.map((ls, idx) => (
                  <tr key={ls.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900 font-kannada">{ls.employeeName}</div>
                      <div className="text-[11px] text-stone-500 font-kannada">{ls.designation}</div>
                      <div className="text-[10px] text-stone-600 font-mono">KGID: {ls.kgidNumber}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 font-kannada">
                        {ls.leaveType}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <div>{ls.startDate}</div>
                      <div className="text-stone-500">ಇಂದ {ls.endDate} ವರೆಗೆ</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900">
                      {ls.daysCount} ದಿನಗಳು
                    </td>
                    <td className="p-3 font-kannada text-stone-700 max-w-xs">
                      {ls.reason}
                    </td>
                    <td className="p-3 font-kannada">
                      <div className="font-bold text-stone-800 text-[11px]">{ls.sanctionOrderNumber}</div>
                      <div className="text-[10px] text-stone-500">{ls.approvingAuthority}</div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 font-kannada">
                        {ls.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 5: KHAJANE-2 MONTHLY PAY BILL (ಮಾಸಿಕ ವೇತನ ಪಟ್ಟಿ)
         ======================================================== */}
      {activeSubTab === 'payBill' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black uppercase font-mono">
                    KHAJANE-2 INTEGRATED
                  </span>
                  <span className="text-xs text-stone-500 font-mono">DDO CODE: 0814EDN001</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada mt-1 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-amber-600" />
                  <span>ಖಜಾನೆ-2 ಮಾಸಿಕ ವೇತನ ಪಟ್ಟಿ & ಬಿಲ್ಲು ಸಲ್ಲಿಕೆ ({payBillSummary.billMonth})</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-kannada flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ಬಿಲ್ಲು ಮುದ್ರಿಸಿ</span>
                </button>
              </div>
            </div>

            {/* Bill Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-800 font-kannada">ಒಟ್ಟು ಒಟ್ಟು ವೇತನ (Gross Amount)</div>
                <div className="text-2xl font-bold font-mono text-emerald-950 mt-1">
                  {formatCurrency(payBillSummary.grossTotal)}
                </div>
                <div className="text-[11px] text-emerald-700 font-kannada mt-1">
                  {payBillSummary.staffCount} ನೌಕರರ ಮೂಲ ವೇತನ + ಡಿಎ (50%) + ಮನೆ ಬಾಡಿಗೆ
                </div>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div className="text-xs text-rose-800 font-kannada">ಒಟ್ಟು ಕಡಿತಗಳು (Total Deductions)</div>
                <div className="text-2xl font-bold font-mono text-rose-950 mt-1">
                  {formatCurrency(payBillSummary.deductionTotal)}
                </div>
                <div className="text-[11px] text-rose-700 font-kannada mt-1">
                  KGID + NPS (10%) + GIS + PT + TDS ಕಡಿತ
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300">
                <div className="text-xs text-amber-900 font-kannada">ಖಾತೆಗೆ ಜಮೆ ಆಗುವ ನಿವ್ವಳ ಮೊತ್ತ (Net Payable)</div>
                <div className="text-2xl font-bold font-mono text-stone-950 mt-1">
                  {formatCurrency(payBillSummary.netTotal)}
                </div>
                <div className="text-[11px] text-amber-800 font-kannada mt-1">
                  ಟೋಕನ್ ಸಂ: {payBillSummary.tokenNo}
                </div>
              </div>
            </div>

            {/* Detailed Salary Register Table */}
            <div>
              <h4 className="font-bold text-stone-900 font-kannada text-sm mb-3">
                ನೌಕರರ ಮಾಸಿಕ ವೇತನ ಪಟ್ಟಿ (Employee-wise Pay Bill Breakup)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                      <th className="p-2.5">ಕ್ರಮ</th>
                      <th className="p-2.5">ನೌಕರರ ಹೆಸರು & KGID</th>
                      <th className="p-2.5">ಮೂಲ ವೇತನ (BP)</th>
                      <th className="p-2.5">ತುಟ್ಟಿಭತ್ಯೆ (DA 50%)</th>
                      <th className="p-2.5">HRA (8%)</th>
                      <th className="p-2.5">ಒಟ್ಟು (Gross)</th>
                      <th className="p-2.5">KGID</th>
                      <th className="p-2.5">NPS / GPF</th>
                      <th className="p-2.5">ಒಟ್ಟು ಕಡಿತ</th>
                      <th className="p-2.5">ನಿವ್ವಳ ವೇತನ (Net)</th>
                      <th className="p-2.5 text-right">ಸ್ಲಿಪ್</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {employees.map((emp, index) => {
                      const bp = emp.basicPay || 37900;
                      const da = Math.round(bp * 0.50);
                      const hra = Math.round(bp * 0.08);
                      const gross = bp + da + hra + 200;
                      const kgid = Math.round(bp * 0.06);
                      const gpfNps = Math.round((bp + da) * 0.10);
                      const deductions = kgid + gpfNps + 240 + 200;
                      const net = gross - deductions;

                      return (
                        <tr key={emp.id} className="hover:bg-amber-50/40">
                          <td className="p-2.5 font-mono text-stone-500">{index + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-stone-900 font-kannada">{emp.fullName}</div>
                            <div className="text-[10px] text-stone-500 font-mono">KGID: {emp.kgidNumber || '—'}</div>
                          </td>
                          <td className="p-2.5 font-mono">{formatCurrency(bp)}</td>
                          <td className="p-2.5 font-mono text-emerald-800">{formatCurrency(da)}</td>
                          <td className="p-2.5 font-mono">{formatCurrency(hra)}</td>
                          <td className="p-2.5 font-mono font-bold text-stone-900">{formatCurrency(gross)}</td>
                          <td className="p-2.5 font-mono text-rose-700">{formatCurrency(kgid)}</td>
                          <td className="p-2.5 font-mono text-rose-700">{formatCurrency(gpfNps)}</td>
                          <td className="p-2.5 font-mono font-bold text-rose-900">{formatCurrency(deductions)}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-950 bg-emerald-50/60">
                            {formatCurrency(net)}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedEmployeeForSlip(emp);
                                setIsSalarySlipModalOpen(true);
                              }}
                              className="px-2 py-1 bg-stone-900 text-amber-300 rounded text-[11px] font-bold font-kannada hover:bg-stone-800 cursor-pointer"
                            >
                              ಸ್ಲಿಪ್
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 6: ANNUAL PERFORMANCE APPRAISAL (APAR / APR)
         ======================================================== */}
      {activeSubTab === 'apar' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-600" />
                <span>ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ಷಮತೆ ಮೌಲ್ಯಮಾಪನ / ಗೌಪ್ಯ ವರದಿ (APAR / APR)</span>
              </h3>
              <p className="text-xs text-stone-500 font-kannada mt-0.5">
                ವರ್ಷ 2024-25 ಹಾಗೂ 2025-26 ನೌಕರರ ವಾರ್ಷಿಕ ಕಾರ್ಯಕ್ಷಮತೆ ವರದಿ, ಸ್ವಯಂ ಮೌಲ್ಯಮಾಪನ & ಗ್ರೇಡಿಂಗ್.
              </p>
            </div>

            <button
              onClick={() => onShowToast?.('ನೂತನ APAR ನಮೂನೆ ತೆರೆಯಲಾಗಿದೆ.')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Plus className="w-4 h-4" />
              <span>+ APAR ನಮೂನೆ ದಾಖಲಿಸಿ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                  <th className="p-3">ಕ್ರಮ</th>
                  <th className="p-3">ನೌಕರರ ಹೆಸರು & ಹುದ್ದೆ</th>
                  <th className="p-3">ವರ್ಗ (Cadre)</th>
                  <th className="p-3">ವರದಿ ಸಾಲು</th>
                  <th className="p-3">ವರದಿ ನೀಡಿದ ಅಧಿಕಾರಿ</th>
                  <th className="p-3">ಪರಿಶೀಲನಾ ಅಧಿಕಾರಿ</th>
                  <th className="p-3">ಅಂತಿಮ ಗ್ರೇಡಿಂಗ್</th>
                  <th className="p-3 text-right">ಸ್ಥಿತಿ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {aparRecords.map((ap, idx) => (
                  <tr key={ap.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900 font-kannada">{ap.employeeName}</div>
                      <div className="text-[11px] text-stone-500 font-kannada">{ap.designation}</div>
                      <div className="text-[10px] text-stone-600 font-mono">KGID: {ap.kgidNumber}</div>
                    </td>
                    <td className="p-3 font-mono text-stone-700">{ap.cadre}</td>
                    <td className="p-3 font-mono font-bold text-purple-900">{ap.reportingYear}</td>
                    <td className="p-3 font-kannada text-stone-700">{ap.reportingOfficer}</td>
                    <td className="p-3 font-kannada text-stone-700">{ap.reviewingOfficer}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-950 font-kannada">
                        {ap.overallGrading}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 font-kannada">
                        {ap.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 7: SENIORITY & TIME BOUND ADVANCEMENT (TBAS)
         ======================================================== */}
      {activeSubTab === 'seniorityTbas' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-kannada flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>ಜ್ಯೇಷ್ಠತಾ ಪಟ್ಟಿ & ಕಾಲಬದ್ಧ ಬಡ್ತಿ ಅರ್ಹತೆ (Seniority & TBAS Eligibility)</span>
              </h3>
              <p className="text-xs text-stone-500 font-kannada mt-0.5">
                10, 15, 20, 25 ಹಾಗೂ 30 ವರ್ಷಗಳ ಸೇವಾ ಪೂರೈಕೆ ಕಾಲಬದ್ಧ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಬಡ್ತಿ ಮತ್ತು ಜ್ಯೇಷ್ಠತಾ ಪಟ್ಟಿ.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-kannada flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ಜ್ಯೇಷ್ಠತಾ ಪಟ್ಟಿ ಮುದ್ರಿಸಿ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-kannada border-b-2 border-stone-300">
                  <th className="p-3">ಜ್ಯೇಷ್ಠತಾ ಕ್ರ.ಸಂ</th>
                  <th className="p-3">ನೌಕರರ ಹೆಸರು & ಪದನಾಮ</th>
                  <th className="p-3">KGID ಸಂಖ್ಯೆ</th>
                  <th className="p-3">ನೇಮಕಾತಿ ದಿನಾಂಕ</th>
                  <th className="p-3">ಒಟ್ಟು ಸೇವಾ ಅವಧಿ</th>
                  <th className="p-3">ಕಾಲಬದ್ಧ ಬಡ್ತಿ ಹಂತ (TBAS)</th>
                  <th className="p-3 text-right">ಅರ್ಹತಾ ಸ್ಥಿತಿ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {employees.map((emp, idx) => {
                  const joinYear = emp.joiningDate ? parseInt(emp.joiningDate.split('-')[0]) : 2012;
                  const currentYear = 2026;
                  const serviceYears = currentYear - joinYear;
                  
                  let tbasStage = 'ಪ್ರಾರಂಭಿಕ ಹಂತ';
                  if (serviceYears >= 30) tbasStage = '30 ವರ್ಷಗಳ ವಿಶೇಷ ಬಡ್ತಿ';
                  else if (serviceYears >= 25) tbasStage = '25 ವರ್ಷಗಳ ಕಾಲಬದ್ಧ ಬಡ್ತಿ';
                  else if (serviceYears >= 20) tbasStage = '20 ವರ್ಷಗಳ ಕಾಲಬದ್ಧ ಬಡ್ತಿ';
                  else if (serviceYears >= 15) tbasStage = '15 ವರ್ಷಗಳ ಕಾಲಬದ್ಧ ಬಡ್ತಿ';
                  else if (serviceYears >= 10) tbasStage = '10 ವರ್ಷಗಳ ಕಾಲಬದ್ಧ ಬಡ್ತಿ';

                  return (
                    <tr key={emp.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900">#{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900 font-kannada">{emp.fullName}</div>
                        <div className="text-[11px] text-stone-500 font-kannada">{emp.designation}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">{emp.kgidNumber || '—'}</td>
                      <td className="p-3 font-mono text-stone-700">{emp.joiningDate || '2012-06-15'}</td>
                      <td className="p-3 font-mono font-bold text-stone-900">
                        {serviceYears} ವರ್ಷಗಳು
                      </td>
                      <td className="p-3 font-kannada">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-950">
                          {tbasStage}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800 font-kannada">
                          ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲಿತ
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: INTERACTIVE DIGITAL SERVICE BOOK MODAL
         ======================================================== */}
      {selectedEmployeeForBook && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 font-mono">
                      GOVERNMENT OF KARNATAKA • e-SERVICE REGISTER
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono">
                      KGID: {selectedEmployeeForBook.kgidNumber}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-kannada mt-0.5">
                    ಡಿಜಿಟಲ್ ಇ-ಸರ್ವೀಸ್ ಬುಕ್ — {selectedEmployeeForBook.fullName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition cursor-pointer"
                  title="ಮುದ್ರಿಸಿ"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEmployeeForBook(null)}
                  className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Service Book Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Part 1: Employee Particulars */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-300 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h4 className="font-bold text-stone-900 font-kannada text-xs uppercase tracking-wider text-emerald-800">
                    ಭಾಗ 1: ವೈಯಕ್ತಿಕ & ನೇಮಕಾತಿ ವಿವರಗಳು (Personal & Cadre Particulars)
                  </h4>
                  {onOpenEmployeeProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEmployeeProfile(selectedEmployeeForBook);
                        setSelectedEmployeeForBook(null);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold font-kannada flex items-center gap-1 cursor-pointer shadow-xs"
                      title="ಜನ್ಮ ದಿನಾಂಕ (DOB) ಮತ್ತು ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOJ) ತಿದ್ದುಪಡಿ ಮಾಡಿ"
                    >
                      ✏️ DOB & DOJ ತಿದ್ದುಪಡಿ (Edit Dates)
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ನೌಕರರ ಪೂರ್ಣ ಹೆಸರು:</span>
                    <span className="font-bold text-stone-900 font-kannada">{selectedEmployeeForBook.fullName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಹುದ್ದೆ (Designation):</span>
                    <span className="font-bold text-stone-900 font-kannada">{selectedEmployeeForBook.designation}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ:</span>
                    <span className="font-bold font-mono text-emerald-800">{selectedEmployeeForBook.kgidNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಜನ್ಮ ದಿನಾಂಕ (DOB):</span>
                    <span className="font-bold font-mono text-sky-900">
                      {selectedEmployeeForBook.dob || '—'}
                      {selectedEmployeeForBook.age ? ` (${selectedEmployeeForBook.age} Yrs)` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOJ):</span>
                    <span className="font-bold font-mono text-stone-900">{selectedEmployeeForBook.joiningDate || '2012-06-15'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಮೂಲ ವೇತನ:</span>
                    <span className="font-bold font-mono text-stone-900">{formatCurrency(selectedEmployeeForBook.basicPay || 37900)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ವೇತನ ಶ್ರೇಣಿ:</span>
                    <span className="font-mono text-stone-800 text-[11px]">{selectedEmployeeForBook.payScale || '37900-70850'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] font-kannada">ಬಡ್ತಿ ತಿಂಗಳು:</span>
                    <span className="font-kannada font-bold text-amber-900">
                      {selectedEmployeeForBook.incrementMonth === 'July' ? 'ಜುಲೈ' : 'ಜನವರಿ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Part 2: Service History Timeline Entries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h4 className="font-bold text-stone-900 font-kannada text-xs uppercase tracking-wider text-emerald-800">
                    ಭಾಗ 2: ಸೇವಾ ಘಟನೆಗಳು & ಬಡ್ತಿ ನಮೂದುಗಳು (Service Events Ledger)
                  </h4>
                  <button
                    onClick={() => {
                      setIsNewServiceEntryModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold font-kannada flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ಸೇವಾ ನಮೂದು ಸೇರಿಸಿ</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-kannada">ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ (Annual Increment)</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] font-kannada">ಸ್ಥಿರೀಕೃತ</span>
                      </div>
                      <div className="text-stone-600 font-kannada">
                        ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿ ನಿಯಮ 53 ರಂತೆ ಪ್ರಪತ್ರ-28 ರಲ್ಲಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ₹39,800 ರಿಂದ ₹40,900 ಕ್ಕೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        ಆದೇಶ ಸಂ: ಬಿಇಒ/ವೇತನ-ಬಡ್ತಿ/71/2026 • ದಿನಾಂಕ: 2026-01-01
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-emerald-800">₹40,900</div>
                      <div className="text-[10px] text-stone-500 font-mono">Level-9</div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-kannada">ಪರಿವೀಕ್ಷಣಾ ಅವಧಿ ತೃಪ್ತಿಕರ ಸಮಾಪ್ತಿ (Probation Declaration)</span>
                        <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-bold text-[10px] font-kannada">ಸಕ್ರಮೀಕರಣ</span>
                      </div>
                      <div className="text-stone-600 font-kannada">
                        ಎರಡು ವರ್ಷಗಳ ಪರಿವೀಕ್ಷಣಾ ಅವಧಿಯನ್ನು ಯಾವುದೇ ದೂರುಗಳಿಲ್ಲದೆ ತೃಪ್ತಿಕರವಾಗಿ ಪೂರೈಸಿದ್ದರಿಂದ ಕಾಯಂಗೊಳಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        ಆದೇಶ ಸಂ: ಡಿಡಿಪಿಐ/ಸಿಬ್ಬಂದಿ-1/29/2014 • ದಿನಾಂಕ: 2014-08-15
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-stone-900">₹27,650</div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-kannada">ಮೂಲ ನೇಮಕಾತಿ ಆದೇಶ (Initial Appointment)</span>
                        <span className="px-1.5 py-0.2 rounded bg-stone-200 text-stone-900 font-bold text-[10px] font-kannada">ನೇಮಕಾತಿ</span>
                      </div>
                      <div className="text-stone-600 font-kannada">
                        ಕೆಪಿಎಸ್‌ಸಿ / ಇಲಾಖಾ ಆಯ್ಕೆ ಸಮಿತಿ ಶಿಫಾರಸಿನಂತೆ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕರ್ತವ್ಯಕ್ಕೆ ಹಾಜರಾಗಲು ಆದೇಶ.
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        ಆದೇಶ ಸಂ: ಶಿಇ/ನೇಮಕಾತಿ/104/2012 • ದಿನಾಂಕ: 2012-06-10
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-stone-900">₹16,000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 3: Official Digital Attestation & DDO Seal */}
              <div className="p-4 bg-emerald-50/70 border-2 border-dashed border-emerald-600 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 font-kannada text-xs">
                      ಡಿಜಿಟಲ್ ಇ-ಸರ್ವೀಸ್ ಬುಕ್ ದೃಢೀಕರಣ (DDO Digital Verification Stamp)
                    </div>
                    <div className="text-[11px] text-emerald-800 font-kannada mt-0.5">
                      ಈ ಸೇವಾವಹಿಯ ಪ್ರತಿಯೊಂದು ನಮೂದನ್ನು ಮೂಲ ಸೇವಾಪುಸ್ತಕ ಹಾಗೂ ಖಜಾನೆ-2 ತಂತ್ರಾಂಶದೊಂದಿಗೆ ತಾಳೆ ನೋಡಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-300">
                  <div className="font-bold text-stone-900 font-kannada text-xs">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಡಿಡಿಓ
                  </div>
                  <div className="text-[10px] text-stone-600 font-kannada">
                    ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ತಾಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ
                  </div>
                  <div className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">
                    DIGITALLY SIGNED • {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: OFFICIAL LAST PAY CERTIFICATE (LPC) PRINT MODAL
         ======================================================== */}
      {isLpcModalOpen && selectedEmployeeForLpc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-sky-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-300" />
                <div>
                  <h3 className="font-bold font-kannada text-sm sm:text-base">
                    ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (Last Pay Certificate - Form KCSR 297)
                  </h3>
                  <p className="text-[11px] text-sky-200 font-kannada">
                    ವರ್ಗಾವಣೆ ಆದೇಶ ಸಂಖ್ಯೆ ಮತ್ತು ಆದೇಶ ನೀಡಿದ ಪ್ರಾಧಿಕಾರದ ಅಧಿಕೃತ ವಿವರಗಳೊಂದಿಗೆ.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTransferForLpc?.orderFileUrl && (
                  <button
                    onClick={() => {
                      setPreviewOrderDoc({
                        url: selectedTransferForLpc.orderFileUrl!,
                        name: selectedTransferForLpc.orderFileName || 'Transfer Order',
                        title: `ವರ್ಗಾವಣೆ ಆದೇಶ: ${selectedTransferForLpc.orderNumber}`
                      });
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 font-kannada cursor-pointer border border-emerald-500 shadow-xs"
                    title="ಲಗತ್ತಿಸಲಾದ ವರ್ಗಾವಣೆ ಆದೇಶ ಪ್ರತಿ ವೀಕ್ಷಿಸಿ"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>ಆದೇಶ ಪ್ರತಿ ವೀಕ್ಷಿಸಿ</span>
                  </button>
                )}
                <button
                  onClick={handlePrintLpc}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 font-kannada cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ (Print)</span>
                </button>
                <button
                  onClick={() => setIsLpcModalOpen(false)}
                  className="p-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Live Editor Toolbar for Transfer Order Details in LPC */}
            <div className="p-3 bg-sky-50 border-b border-sky-200 text-xs font-kannada shrink-0 space-y-2">
              <div className="font-bold text-sky-950 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-sky-700" />
                  <span>LPC ಯಲ್ಲಿ ವರ್ಗಾವಣೆ ಆದೇಶ & ಆದೇಶ ನೀಡಿದವರ ವಿವರ ತಿದ್ದುವಿಕೆ (Live Edit Order Details):</span>
                </span>
                <span className="text-[11px] text-stone-500 font-normal">
                  (ಕೆಳಗಿನ ವಿವರಗಳು LPC ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ನೇರವಾಗಿ ಮುದ್ರಿತವಾಗುತ್ತವೆ)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    ವರ್ಗಾವಣೆ ಆದೇಶ ಸಂಖ್ಯೆ (Order No):
                  </label>
                  <input
                    type="text"
                    value={lpcOrderNumber}
                    onChange={(e) => setLpcOrderNumber(e.target.value)}
                    placeholder="ಉದಾ: ಇಡಿ/41/ವರ್ಗ/2026"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-sky-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    ಆದೇಶ ದಿನಾಂಕ (Order Date):
                  </label>
                  <input
                    type="date"
                    value={lpcOrderDate}
                    onChange={(e) => setLpcOrderDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-sky-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    ಕಾರ್ಯಮುಕ್ತ ದಿನಾಂಕ (Relieving Date):
                  </label>
                  <input
                    type="date"
                    value={lpcRelievingDate}
                    onChange={(e) => setLpcRelievingDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-sky-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 text-stone-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    ಆದೇಶ ನೀಡಿದ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ / ಅಧಿಕಾರಿಯ ವಿವರ (Issuing Authority):
                  </label>
                  <input
                    type="text"
                    value={lpcIssuingAuthority}
                    onChange={(e) => setLpcIssuingAuthority(e.target.value)}
                    placeholder="ಉದಾ: ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-sky-300 bg-white font-kannada font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    ಸ್ಥಳ ನಿಯುಕ್ತಿ ಕಛೇರಿ / ಶಾಲೆ (To Office):
                  </label>
                  <input
                    type="text"
                    value={lpcToOffice}
                    onChange={(e) => setLpcToOffice(e.target.value)}
                    placeholder="ಉದಾ: ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-sky-300 bg-white font-kannada text-stone-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Printable LPC Certificate Preview */}
            <div className="p-6 sm:p-8 space-y-5 text-stone-900 font-serif bg-[#fffbf2] overflow-y-auto">
              {/* Govt Heading */}
              <div className="text-center space-y-1 border-b-2 border-stone-800 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider font-sans text-stone-700">
                  GOVERNMENT OF KARNATAKA • DEPARTMENT OF SCHOOL EDUCATION
                </div>
                <div className="text-sm font-bold font-kannada text-stone-900">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ
                </div>
                <h2 className="text-lg font-black font-kannada uppercase text-stone-950 underline decoration-2">
                  ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (LAST PAY CERTIFICATE)
                </h2>
                <div className="text-xs font-mono text-stone-600">
                  (Under Rule 297 of Karnataka Civil Services Rules & Karnataka Treasury Code Form 297)
                </div>
              </div>

              {/* Official Transfer Order & Issuing Authority Reference Box */}
              <div className="bg-sky-50/80 p-3.5 rounded-xl border-2 border-sky-400/80 font-sans text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sky-950 font-kannada">ಉಲ್ಲೇಖ: ವರ್ಗಾವಣೆ ಆದೇಶ ಸಂಖ್ಯೆ: </span>
                    <strong className="font-mono text-stone-950 text-xs font-bold bg-white px-2 py-0.5 rounded border border-sky-300 shadow-2xs">
                      {lpcOrderNumber || '—'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sky-950 font-kannada">ಆದೇಶ ದಿನಾಂಕ: </span>
                    <strong className="font-mono text-stone-950 text-xs bg-white px-2 py-0.5 rounded border border-sky-300">
                      {lpcOrderDate || '—'}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="font-bold text-sky-950 font-kannada">ವರ್ಗಾವಣೆ ಆದೇಶ ನೀಡಿದ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ / ಅಧಿಕಾರಿಗಳ ವಿವರ: </span>
                  <div className="font-bold text-stone-950 font-kannada text-xs bg-white px-2.5 py-1 rounded border border-sky-300 inline-flex items-center gap-1">
                    <span>🏛️</span>
                    <span>{lpcIssuingAuthority || 'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-700 font-kannada border-t border-sky-200">
                  <div>
                    <span>ಹಿಂದಿನ ಕರ್ತವ್ಯ ಕಛೇರಿ: </span>
                    <strong className="text-stone-900">{lpcFromOffice}</strong>
                  </div>
                  <div>
                    <span>ಸ್ಥಳ ನಿಯುಕ್ತಿ ಕಛೇರಿ: </span>
                    <strong className="text-sky-900">{lpcToOffice || '—'}</strong>
                  </div>
                  <div>
                    <span>ಕಾರ್ಯಮುಕ್ತ ದಿನಾಂಕ: </span>
                    <strong className="font-mono text-stone-900">{lpcRelievingDate || new Date().toISOString().split('T')[0]} (ಅಪರಾಹ್ನ)</strong>
                  </div>
                </div>

                {selectedTransferForLpc?.orderFileName && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-900 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-300 font-kannada">
                    <div className="flex items-center gap-1 font-bold">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ಲಗತ್ತಿಸಲಾದ ವರ್ಗಾವಣೆ ಆದೇಶ ಕಡತ: </span>
                      <span className="font-mono text-emerald-950 font-bold">{selectedTransferForLpc.orderFileName}</span>
                    </div>
                    {selectedTransferForLpc.orderFileUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewOrderDoc({
                            url: selectedTransferForLpc.orderFileUrl!,
                            name: selectedTransferForLpc.orderFileName || 'Transfer Order',
                            title: `ವರ್ಗಾವಣೆ ಆದೇಶ: ${selectedTransferForLpc.orderNumber}`
                          });
                        }}
                        className="text-xs text-sky-800 underline font-bold cursor-pointer hover:text-sky-950"
                      >
                        ಆದೇಶ ಪ್ರತಿ ಪರಿಶೀಲಿಸಿ ➔
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Certificate Body Paragraph */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-kannada text-stone-900">
                <p>
                  ಶ್ರೀ/ಶ್ರೀಮತಿ <strong className="font-bold text-stone-950">{selectedEmployeeForLpc.fullName}</strong>, 
                  ಹುದ್ದೆ: <strong className="font-bold text-stone-950">{selectedEmployeeForLpc.designation}</strong>, 
                  ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ: <strong className="font-mono font-bold text-stone-950">{selectedEmployeeForLpc.kgidNumber || '—'}</strong> 
                  ಇವರು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವಾದ <strong className="font-bold text-stone-950 underline decoration-sky-600">{lpcIssuingAuthority || 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ'}</strong> ಇವರ 
                  ವರ್ಗಾವಣೆ ಆದೇಶ ಸಂಖ್ಯೆ: <strong className="font-mono font-bold text-stone-950 bg-amber-100 px-1 py-0.5 rounded border border-amber-300">{lpcOrderNumber || '—'}</strong>, 
                  ದಿನಾಂಕ: <strong className="font-mono font-bold text-stone-950">{lpcOrderDate || '—'}</strong> ರನ್ವಯ 
                  <strong className="font-bold text-stone-950"> {lpcFromOffice}</strong> ಇಲ್ಲಿಂದ ದಿನಾಂಕ <strong className="font-mono font-bold text-stone-950">{lpcRelievingDate || new Date().toISOString().split('T')[0]}</strong> ರ ಅಪರಾಹ್ನದಿಂದ ಕರ್ತವ್ಯ ಮುಕ್ತರಾಗಿರುತ್ತಾರೆ. 
                  ಸದರಿಯವರು <strong className="font-bold text-sky-950">{lpcToOffice || 'ನಿಯುಕ್ತಿ ಸ್ಥಳ'}</strong> ಇಲ್ಲಿ ಕರ್ತವ್ಯಕ್ಕೆ ವರದಿ ಮಾಡಿಕೊಳ್ಳಲು ಈ ಕಡೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರವನ್ನು (LPC) ನೀಡಲಾಗಿದೆ. 
                  ಇವರ ಮಾಹೆಯಾನ ವೇತನ, ಭತ್ಯೆ ಹಾಗೂ ಕಡಿತಗಳ ಅಧಿಕೃತ ವಿವರಗಳು ಈ ಕೆಳಗಿನಂತಿವೆ:
                </p>

                {/* LPC Rate Table */}
                <div className="border-2 border-stone-800 rounded-lg overflow-hidden font-sans text-xs">
                  <div className="bg-stone-200 p-2 font-bold font-kannada border-b border-stone-800 flex items-center justify-between">
                    <span>ವೇತನ & ಭತ್ಯೆಗಳ ವಿವರ (Pay & Allowances Last Drawn)</span>
                    <span className="text-[10px] text-stone-600 font-mono">KCSR RULE 297</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 gap-2 border-b border-stone-300">
                    <div>
                      <span className="text-stone-600 block">ಮೂಲ ವೇತನ (Basic Pay):</span>
                      <strong className="font-mono text-sm">{formatCurrency(selectedEmployeeForLpc.basicPay || 52650)}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ತುಟ್ಟಿಭತ್ಯೆ (DA @ 50%):</span>
                      <strong className="font-mono text-sm">{formatCurrency(Math.round((selectedEmployeeForLpc.basicPay || 52650) * 0.50))}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ಮನೆ ಬಾಡಿಗೆ ಭತ್ಯೆ (HRA @ 8%):</span>
                      <strong className="font-mono text-sm">{formatCurrency(Math.round((selectedEmployeeForLpc.basicPay || 52650) * 0.08))}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ವೈದ್ಯಕೀಯ ಭತ್ಯೆ (Medical):</span>
                      <strong className="font-mono text-sm">₹200.00</strong>
                    </div>
                  </div>

                  <div className="bg-stone-200 p-2 font-bold font-kannada border-b border-stone-800">
                    ಮಾಸಿಕ ಕಡಿತಗಳ ವಿವರ (Monthly Deductions)
                  </div>
                  <div className="grid grid-cols-2 p-3 gap-2">
                    <div>
                      <span className="text-stone-600 block">ಕೆ.ಜಿ.ಐ.ಡಿ ಪ್ರೀಮಿಯಂ:</span>
                      <strong className="font-mono">{formatCurrency(Math.round((selectedEmployeeForLpc.basicPay || 52650) * 0.06))}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ಎನ್‌ಪಿಎಸ್ / ಜಿಪಿಎಫ್ (10%):</span>
                      <strong className="font-mono">{formatCurrency(Math.round((selectedEmployeeForLpc.basicPay || 52650) * 1.5 * 0.10))}</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ಗುಂಪು ವಿಮೆ (GIS):</span>
                      <strong className="font-mono">₹240.00</strong>
                    </div>
                    <div>
                      <span className="text-stone-600 block">ವೃತ್ತಿ ತೆರಿಗೆ (PT):</span>
                      <strong className="font-mono">₹200.00</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-700">
                  ಸದರಿ ನೌಕರರಿಗೆ ದಿನಾಂಕ <strong>{lpcRelievingDate || new Date().toISOString().split('T')[0]}</strong> ರವರೆಗೆ ವೇತನವನ್ನು ಈ ಕಛೇರಿಯಿಂದ ಪಾವತಿಸಲಾಗಿದ್ದು, ಮುಂದಿನ ಕಛೇರಿಯಲ್ಲಿ ಕರ್ತವ್ಯಕ್ಕೆ ವರದಿ ಮಾಡಿಕೊಂಡ ದಿನಾಂಕದಿಂದ ನಿಯಮಾನುಸಾರ ವೇತನವನ್ನು ಸೆಳೆಯಲು ಅಧಿಕಾರ ನೀಡಲಾಗಿದೆ.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex items-center justify-between font-kannada text-xs border-t border-stone-300">
                <div>
                  <div>ದಿನಾಂಕ: {new Date().toISOString().split('T')[0]}</div>
                  <div>ಸ್ಥಳ: ಭದ್ರಾವತಿ</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="font-bold text-stone-900">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ</div>
                  <div className="text-stone-600">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</div>
                  <div className="text-[10px] text-stone-500 font-mono">DDO CODE: 0814EDN001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: EMPLOYEE SALARY SLIP (ವೇತನ ಚೀಟಿ)
         ======================================================== */}
      {isSalarySlipModalOpen && selectedEmployeeForSlip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold font-kannada text-sm">
                  ಮಾಸಿಕ ವೇತನ ಚೀಟಿ (Salary Slip) — {payBillSummary.billMonth}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-amber-400 text-stone-950 font-bold text-xs rounded-lg font-kannada cursor-pointer"
                >
                  ಮುದ್ರಿಸಿ
                </button>
                <button
                  onClick={() => setIsSalarySlipModalOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs text-stone-900">
              <div className="text-center border-b border-stone-200 pb-3">
                <div className="font-bold font-kannada text-sm text-stone-950">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ
                </div>
                <div className="text-[11px] text-stone-600 font-mono">
                  ಖಜಾನೆ-2 ತಂತ್ರಾಂಶ • ವೇತನ ಚೀಟಿ (DDO: 0814EDN001)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[11px] font-kannada">ನೌಕರರ ಹೆಸರು:</span>
                  <span className="font-bold text-stone-950 font-kannada">{selectedEmployeeForSlip.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-kannada">ಹುದ್ದೆ:</span>
                  <span className="font-bold text-stone-950 font-kannada">{selectedEmployeeForSlip.designation}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-kannada">ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ:</span>
                  <span className="font-bold font-mono text-emerald-800">{selectedEmployeeForSlip.kgidNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-kannada">HRMS ಕೋಡ್:</span>
                  <span className="font-mono text-stone-800">{selectedEmployeeForSlip.employeeCode || 'HRMS-001'}</span>
                </div>
              </div>

              {/* Earnings & Deductions Split */}
              {(() => {
                const bp = selectedEmployeeForSlip.basicPay || 37900;
                const da = Math.round(bp * 0.50);
                const hra = Math.round(bp * 0.08);
                const gross = bp + da + hra + 200;
                const kgid = Math.round(bp * 0.06);
                const gpfNps = Math.round((bp + da) * 0.10);
                const gis = 240;
                const pt = 200;
                const deductions = kgid + gpfNps + gis + pt;
                const net = gross - deductions;

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Earnings */}
                      <div className="space-y-2 border border-emerald-200 p-3 rounded-xl bg-emerald-50/40">
                        <div className="font-bold text-emerald-900 font-kannada border-b border-emerald-200 pb-1">
                          ಗಳಿಕೆಗಳು (Earnings)
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ಮೂಲ ವೇತನ (BP):</span>
                          <span className="font-mono font-bold">{formatCurrency(bp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ತುಟ್ಟಿಭತ್ಯೆ (DA 50%):</span>
                          <span className="font-mono font-bold">{formatCurrency(da)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ಮನೆ ಬಾಡಿಗೆ (HRA 8%):</span>
                          <span className="font-mono font-bold">{formatCurrency(hra)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ವೈದ್ಯಕೀಯ ಭತ್ಯೆ:</span>
                          <span className="font-mono font-bold">₹200.00</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-300 pt-1 font-bold text-emerald-950">
                          <span>ಒಟ್ಟು ಗಳಿಕೆ (Gross):</span>
                          <span className="font-mono">{formatCurrency(gross)}</span>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="space-y-2 border border-rose-200 p-3 rounded-xl bg-rose-50/40">
                        <div className="font-bold text-rose-900 font-kannada border-b border-rose-200 pb-1">
                          ಕಡಿತಗಳು (Deductions)
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">KGID ವಿಮೆ:</span>
                          <span className="font-mono font-bold text-rose-800">{formatCurrency(kgid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">NPS / GPF (10%):</span>
                          <span className="font-mono font-bold text-rose-800">{formatCurrency(gpfNps)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ಗುಂಪು ವಿಮೆ (GIS):</span>
                          <span className="font-mono font-bold text-rose-800">₹240.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">ವೃತ್ತಿ ತೆರಿಗೆ (PT):</span>
                          <span className="font-mono font-bold text-rose-800">₹200.00</span>
                        </div>
                        <div className="flex justify-between border-t border-rose-300 pt-1 font-bold text-rose-950">
                          <span>ಒಟ್ಟು ಕಡಿತ:</span>
                          <span className="font-mono">{formatCurrency(deductions)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 flex items-center justify-between">
                      <div className="font-bold text-stone-900 font-kannada">
                        ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಆಗುವ ನಿವ್ವಳ ವೇತನ (Net Salary):
                      </div>
                      <div className="text-base font-bold font-mono text-stone-950">
                        {formatCurrency(net)}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: RECORD NEW TRANSFER
         ======================================================== */}
      {isNewTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto">
            <div className="bg-sky-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <h3 className="font-bold font-kannada text-sm">
                ನೂತನ ವರ್ಗಾವಣೆ / ನಿಯೋಜನೆ ಆದೇಶ ದಾಖಲಿಸಿ
              </h3>
              <button
                onClick={() => setIsNewTransferModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sky-800 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-5 space-y-4 text-xs font-kannada">
              <div>
                <label className="block text-stone-700 font-bold mb-1">ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ *</label>
                <select
                  required
                  value={transferForm.employeeKgid}
                  onChange={(e) => setTransferForm({ ...transferForm, employeeKgid: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-sky-600 bg-white"
                >
                  <option value="">-- ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.kgidNumber}>
                      {e.fullName} ({e.designation} - KGID: {e.kgidNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ವರ್ಗಾವಣೆ ಪ್ರಕಾರ</label>
                <select
                  value={transferForm.transferType}
                  onChange={(e) => setTransferForm({ ...transferForm, transferType: e.target.value as any })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-sky-600 bg-white"
                >
                  <option value="ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ">ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ (Administrative)</option>
                  <option value="ಕೌನ್ಸಿಲಿಂಗ್ ವರ್ಗಾವಣೆ">ಕೌನ್ಸಿಲಿಂಗ್ ವರ್ಗಾವಣೆ (Counseling)</option>
                  <option value="ಪರಸ್ಪರ ವರ್ಗಾವಣೆ">ಪರಸ್ಪರ ವರ್ಗಾವಣೆ (Mutual)</option>
                  <option value="ಕೋರಿಕೆ ವರ್ಗಾವಣೆ">ಕೋರಿಕೆ ವರ್ಗಾವಣೆ (Request)</option>
                  <option value="ನಿಯೋಜನೆ">ನಿಯೋಜನೆ (Deputation)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಆದೇಶ ಸಂಖ್ಯೆ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: ಬಿಇಒ/ಭದ್ರಾ/ವರ್ಗ/42/26"
                    value={transferForm.orderNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, orderNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಆದೇಶ ದಿನಾಂಕ *</label>
                  <input
                    type="date"
                    required
                    value={transferForm.orderDate}
                    onChange={(e) => setTransferForm({ ...transferForm, orderDate: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Field: Issuing Authority Details (ಆದೇಶ ನೀಡಿದವರ ವಿವರ) */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  ವರ್ಗಾವಣೆ ಆದೇಶ ನೀಡಿದ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ / ಅಧಿಕಾರಿಗಳ ವಿವರ *
                </label>
                <select
                  value={transferForm.issuingAuthority}
                  onChange={(e) => setTransferForm({ ...transferForm, issuingAuthority: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-sky-600 bg-white"
                >
                  <option value="ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI Shivamogga)">
                    ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ (DDPI)
                  </option>
                  <option value="ಆಯುಕ್ತರು, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ನೃಪತುಂಗ ರಸ್ತೆ, ಬೆಂಗಳೂರು">
                    ಆಯುಕ್ತರು, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ನೃಪತುಂಗ ರಸ್ತೆ, ಬೆಂಗಳೂರು
                  </option>
                  <option value="ನಿರ್ದೇಶಕರು (ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢ ಶಿಕ್ಷಣ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಬೆಂಗಳೂರು">
                    ನಿರ್ದೇಶಕರು (ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢ ಶಿಕ್ಷಣ), ಬೆಂಗಳೂರು
                  </option>
                  <option value="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು
                  </option>
                  <option value="ಸರ್ಕಾರದ ಅಧೀನ ಕಾರ್ಯದರ್ಶಿಗಳು, ಪ್ರಾಥಮಿಕ ಮತ್ತು ಪ್ರೌಢ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ">
                    ಸರ್ಕಾರದ ಅಧೀನ ಕಾರ್ಯದರ್ಶಿಗಳು, ಪ್ರಾಥಮಿಕ ಮತ್ತು ಪ್ರೌಢ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ
                  </option>
                  <option value="ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ಅಕ್ಷರ ದಾಸೋಹ), ಭದ್ರಾವತಿ">
                    ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ಅಕ್ಷರ ದಾಸೋಹ), ಭದ್ರಾವತಿ
                  </option>
                  <option value="CUSTOM">ಇತರೆ ಪ್ರಾಧಿಕಾರ (ಕಸ್ಟಮ್ ವಿವರ ನಮೂದಿಸಿ)...</option>
                </select>

                {transferForm.issuingAuthority === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    placeholder="ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಹುದ್ದೆ ಮತ್ತು ಕಛೇರಿ ಹೆಸರು ನಮೂದಿಸಿ..."
                    value={transferForm.customIssuingAuthority}
                    onChange={(e) => setTransferForm({ ...transferForm, customIssuingAuthority: e.target.value })}
                    className="w-full mt-2 p-2 border border-sky-400 rounded-xl focus:outline-none bg-sky-50/50"
                  />
                )}
              </div>

              {/* Field: Transfer Order File Upload (ವರ್ಗಾವಣೆ ಆದೇಶದ ಪ್ರತಿ Upload) */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="block text-stone-800 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-sky-700" />
                    <span>ವರ್ಗಾವಣೆ ಆದೇಶದ ಪ್ರತಿ Upload (Order Copy Document / PDF / Scan)</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-normal">ಐಚ್ಛಿಕ (Optional)</span>
                </label>

                {transferForm.orderFileName ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="font-bold text-emerald-950 font-mono text-[11px] truncate max-w-[200px]">
                          {transferForm.orderFileName}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {transferForm.orderFileSize || 'ಕಡತ ಸಿದ್ಧವಾಗಿದೆ'} • LPC ಗೆ ಲಿಂಕ್ ಆಗಿದೆ
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {transferForm.orderFileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewOrderDoc({
                              url: transferForm.orderFileUrl,
                              name: transferForm.orderFileName,
                              title: `ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಆದೇಶ: ${transferForm.orderNumber || 'ವರ್ಗಾವಣೆ ಆದೇಶ'}`
                            });
                          }}
                          className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-800 text-[10px] font-bold hover:bg-emerald-100"
                        >
                          ವೀಕ್ಷಿಸಿ
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTransferForm(prev => ({
                            ...prev,
                            orderFileUrl: '',
                            orderFileName: '',
                            orderFileSize: ''
                          }));
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="ತೆಗೆದುಹಾಕಿ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-sky-300 rounded-xl p-3 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-sky-50/50 transition">
                    <Upload className="w-5 h-5 text-sky-600" />
                    <span className="font-bold text-sky-900 text-xs">ಆದೇಶದ PDF ಅಥವಾ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ</span>
                    <span className="text-[10px] text-stone-500 font-sans">PDF, JPG, PNG ಫೈಲ್‌ಗಳು ಬೆಂಬಲಿತವಾಗಿವೆ</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleTransferFileUpload(f);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Offices & Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಹಿಂದಿನ ಕಛೇರಿ (From Office) *</label>
                  <input
                    type="text"
                    required
                    value={transferForm.fromOffice}
                    onChange={(e) => setTransferForm({ ...transferForm, fromOffice: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಸ್ಥಳ ನಿಯುಕ್ತಿ ಕಛೇರಿ / ಶಾಲೆ (To Office) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: ಸ.ಪ್ರೌ.ಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ"
                    value={transferForm.toOffice}
                    onChange={(e) => setTransferForm({ ...transferForm, toOffice: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಕಾರ್ಯಮುಕ್ತ ದಿನಾಂಕ (Relieving Date)</label>
                  <input
                    type="date"
                    value={transferForm.relievingDate}
                    onChange={(e) => setTransferForm({ ...transferForm, relievingDate: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಕರ್ತವ್ಯ ವರದಿ ದಿನಾಂಕ (Joining Date)</label>
                  <input
                    type="date"
                    value={transferForm.joiningDate}
                    onChange={(e) => setTransferForm({ ...transferForm, joiningDate: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ಷರಾ / ಟಿಪ್ಪಣಿ (Remarks)</label>
                <input
                  type="text"
                  placeholder="ಉದಾ: ಸಾರ್ವಜನಿಕ ಹಿತದೃಷ್ಟಿಯಿಂದ ಸ್ಥಳನಿಯುಕ್ತಿ..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewTransferModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 font-bold cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-600 rounded-xl text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ಆದೇಶ ದಾಖಲಿಸಿ & LPC ಸಿದ್ಧಪಡಿಸಿ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TRANSFER ORDER DOCUMENT PREVIEW MODAL
         ======================================================== */}
      {previewOrderDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-kannada">
                    {previewOrderDoc.title}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {previewOrderDoc.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewOrderDoc.url}
                  download={previewOrderDoc.name}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1 font-kannada cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ಡೌನ್‌ಲೋಡ್</span>
                </a>
                <button
                  onClick={() => setPreviewOrderDoc(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 bg-stone-100 flex items-center justify-center min-h-[350px]">
              {previewOrderDoc.url.startsWith('data:image/') ? (
                <img
                  src={previewOrderDoc.url}
                  alt={previewOrderDoc.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg border border-stone-300 shadow-md"
                />
              ) : previewOrderDoc.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewOrderDoc.url}
                  title={previewOrderDoc.name}
                  className="w-full h-[65vh] rounded-lg border border-stone-300 bg-white"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-stone-200 space-y-3">
                  <FileText className="w-12 h-12 text-sky-600 mx-auto" />
                  <div className="font-bold text-sm text-stone-800 font-kannada">
                    {previewOrderDoc.name}
                  </div>
                  <p className="text-xs text-stone-500">
                    ಕಡತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ. ಕೆಳಗಿನ ಬಟನ್ ಮೂಲಕ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ವೀಕ್ಷಿಸಬಹುದು.
                  </p>
                  <a
                    href={previewOrderDoc.url}
                    download={previewOrderDoc.name}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-xl font-bold text-xs font-kannada"
                  >
                    <Download className="w-4 h-4" />
                    <span>ಕಡತ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: RECORD NEW LEAVE SANCTION
         ======================================================== */}
      {isNewLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <h3 className="font-bold font-kannada text-sm">
                ನೂತನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ (e-Leave Sanction)
              </h3>
              <button
                onClick={() => setIsNewLeaveModalOpen(false)}
                className="p-1 rounded-lg hover:bg-rose-800 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="p-5 space-y-4 text-xs font-kannada">
              <div>
                <label className="block text-stone-700 font-bold mb-1">ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ *</label>
                <select
                  required
                  value={leaveForm.employeeKgid}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeKgid: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-600 bg-white"
                >
                  <option value="">-- ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.kgidNumber}>
                      {e.fullName} ({e.designation} - KGID: {e.kgidNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ರಜೆಯ ಪ್ರಕಾರ *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-600 bg-white"
                >
                  <option value="ಸಾಂದರ್ಭಿಕ ರಜೆ (CL)">ಸಾಂದರ್ಭಿಕ ರಜೆ (Casual Leave - CL)</option>
                  <option value="ಗಳಿಕೆ ರಜೆ (EL)">ಗಳಿಕೆ ರಜೆ (Earned Leave - EL)</option>
                  <option value="ಅರ್ಧ ವೇತನ ರಜೆ (HPL)">ಅರ್ಧ ವೇತನ ರಜೆ (Half Pay Leave - HPL)</option>
                  <option value="ಪರಿವರ್ತಿತ ರಜೆ (Commuted)">ಪರಿವರ್ತಿತ ರಜೆ (Commuted Leave)</option>
                  <option value="ಶಿಶುಪಾಲನ ರಜೆ (CCL)">ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave - CCL)</option>
                  <option value="ಹೆರಿಗೆ ರಜೆ (Maternity)">ಹೆರಿಗೆ ರಜೆ (Maternity Leave - 180 Days)</option>
                  <option value="ಪಿತೃತ್ವ ರಜೆ (Paternity)">ಪಿತೃತ್ವ ರಜೆ (Paternity Leave - 15 Days)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪ್ರಾರಂಭ ದಿನಾಂಕ *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಅಂತ್ಯ ದಿನಾಂಕ *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಒಟ್ಟು ದಿನಗಳ ಸಂಖ್ಯೆ *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leaveForm.daysCount}
                    onChange={(e) => setLeaveForm({ ...leaveForm, daysCount: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂಖ್ಯೆ</label>
                  <input
                    type="text"
                    value={leaveForm.orderNumber}
                    onChange={(e) => setLeaveForm({ ...leaveForm, orderNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ರಜೆ ಕಾರಣ *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ಉದಾ: ಸ್ವಂತ ಗೃಹ ನಿರ್ಮಾಣ, ಕುಟುಂಬ ಸಮಾರಂಭ ಅಥವಾ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಾಗಿ..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 font-bold cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 rounded-xl text-white font-bold cursor-pointer"
                >
                  ಮಂಜೂರು ಮಾಡಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: ADD SERVICE BOOK ENTRY MODAL
         ======================================================== */}
      {isNewServiceEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-stone-800 shadow-2xl overflow-hidden my-auto">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <h3 className="font-bold font-kannada text-sm">
                ನೂತನ ಸೇವಾ ನಮೂದು ದಾಖಲಿಸಿ (Service Book Entry)
              </h3>
              <button
                onClick={() => setIsNewServiceEntryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-800 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-kannada">
              <div>
                <label className="block text-stone-700 font-bold mb-1">ನಮೂದಿನ ವರ್ಗ (Category)</label>
                <select className="w-full p-2 border border-stone-300 rounded-xl bg-white">
                  <option>ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (Annual Increment)</option>
                  <option>ಕಾಲಬದ್ಧ ಬಡ್ತಿ (TBAS 10/15/20/25/30)</option>
                  <option>ವರ್ಗಾವಣೆ / ಸ್ಥಳನಿಯುಕ್ತಿ (Transfer / Posting)</option>
                  <option>ಪದೋನ್ನತಿ (Promotion)</option>
                  <option>ಪರಿವೀಕ್ಷಣಾ ಸಕ್ರಮೀಕರಣ (Probation Declaration)</option>
                  <option>ವಿಶೇಷ ಪ್ರಶಂಸನೆ (Special Service Commendation)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ಆದೇಶ ಸಂಖ್ಯೆ & ದಿನಾಂಕ</label>
                <input
                  type="text"
                  placeholder="ಉದಾ: ಬಿಇಒ/ವೇತನ-ಬಡ್ತಿ/71/2026, ದಿನಾಂಕ: 2026-01-01"
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ವಿವರಣೆ (Entry Details)</label>
                <textarea
                  rows={3}
                  placeholder="ನಿಯಮಾವಳಿಗಳ ಉಲ್ಲೇಖ ಹಾಗೂ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..."
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪರಿಷ್ಕೃತ ಮೂಲ ವೇತನ</label>
                  <input
                    type="number"
                    placeholder="₹"
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">DDO ದೃಢೀಕರಣ</label>
                  <div className="p-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 font-bold">
                    ✓ ಡಿಜಿಟಲ್ ಮುದ್ರೆ
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewServiceEntryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 font-bold cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewServiceEntryModalOpen(false);
                    onShowToast?.('ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ನೂತನ ನಮೂದು ದಾಖಲಾಗಿದೆ.');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-white font-bold cursor-pointer"
                >
                  ಉಳಿಸಿ & ದೃಢೀಕರಿಸಿ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
