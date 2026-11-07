import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  UserPlus, 
  UploadCloud, 
  FileSpreadsheet,
  Download, 
  Search, 
  Filter, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  X,
  Award,
  TrendingUp,
  Coins,
  LayoutGrid,
  List
} from 'lucide-react';
import { Employee, DepartmentSection, EmployeeStatus, EmployeeRole, EducationLetter, MasterDocketFile } from '../types';

interface EmployeeRosterViewProps {
  employees: Employee[];
  letters: EducationLetter[];
  files: MasterDocketFile[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onUploadEmployees: () => void;
  onDeleteEmployee: (id: string) => Promise<void>;
  onBatchDeleteEmployees?: (ids: string[]) => Promise<void>;
  onClearAllEmployees?: () => Promise<void>;
  onSelectLetter?: (letter: EducationLetter) => void;
  onSeedEmployees?: () => Promise<void>;
  onOpenServiceSanctions?: (employee?: Employee) => void;
  onDraftLetterForEmployee?: (employee: Employee) => void;
  onOpenPrapathra28?: () => void;
  onGoBackHome?: () => void;
}

const SECTIONS: (DepartmentSection | 'all')[] = [
  'all',
  'Academic Wing',
  'Administration & Services',
  'Accounts & Grants',
  'Examination Board',
  'Inspection & Quality',
  'Legal & Grievances',
];

const STATUSES: (EmployeeStatus | 'all')[] = [
  'all',
  'Active',
  'On Leave',
  'Transferred',
  'Deputation',
  'Retired',
];

export interface YearsOfServiceInfo {
  years: number;
  months: number;
  days: number;
  decimalYears: number;
  yearsServedLabel: string;
  kannadaLabel: string;
  tenureTier: 'senior' | 'mid' | 'junior' | 'probation';
  tooltip: string;
}

/**
 * Robust date parser supporting YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
 */
export function parseDateFlexible(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Check ISO format YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

/**
 * Dynamically calculates years, months, and days of service using joiningDate compared to the current date
 */
export function calculateYearsServed(joiningDate?: string): YearsOfServiceInfo | null {
  const join = parseDateFlexible(joiningDate);
  if (!join) return null;

  const now = new Date();
  if (join > now) {
    return {
      years: 0,
      months: 0,
      days: 0,
      decimalYears: 0,
      yearsServedLabel: 'Upcoming Join',
      kannadaLabel: 'ಮುಂದಿನ ನೇಮಕಾತಿ',
      tenureTier: 'probation',
      tooltip: `Joining date is in the future: ${joiningDate}`
    };
  }

  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();
  let days = now.getDate() - join.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const decimalYears = Number((years + months / 12 + days / 365.25).toFixed(1));

  let yearsServedLabel = `${years} Yrs Served`;
  let kannadaLabel = `${years} ವರ್ಷಗಳ ಸೇವೆ`;

  if (years === 0) {
    if (months > 0) {
      yearsServedLabel = `${months} Mo${months > 1 ? 's' : ''} Served`;
      kannadaLabel = `${months} ತಿಂಗಳ ಸೇವೆ`;
    } else {
      yearsServedLabel = `${days} Day${days !== 1 ? 's' : ''} Served`;
      kannadaLabel = `${days} ದಿನಗಳ ಸೇವೆ`;
    }
  } else if (years === 1 && months === 0) {
    yearsServedLabel = '1 Yr Served';
    kannadaLabel = '1 ವರ್ಷದ ಸೇವೆ';
  }

  let tenureTier: 'senior' | 'mid' | 'junior' | 'probation' = 'junior';
  if (years >= 25) {
    tenureTier = 'senior';
  } else if (years >= 15) {
    tenureTier = 'mid';
  } else if (years >= 5) {
    tenureTier = 'junior';
  } else {
    tenureTier = 'probation';
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0 && years < 3) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  const tooltip = `Joined: ${joiningDate} (${parts.join(', ') || 'Just joined'}) • ${yearsServedLabel}`;

  return {
    years,
    months,
    days,
    decimalYears,
    yearsServedLabel,
    kannadaLabel,
    tenureTier,
    tooltip
  };
}

/**
 * Automated 'Years of Service' badge displaying the 'Years Served' indicator dynamically
 */
export const YearsOfServiceBadge: React.FC<{
  joiningDate?: string;
  size?: 'sm' | 'md' | 'lg';
  showKannada?: boolean;
  className?: string;
  id?: string;
}> = ({ joiningDate, size = 'sm', showKannada = false, className = '', id }) => {
  const service = calculateYearsServed(joiningDate);
  if (!service) {
    return (
      <span 
        id={id}
        data-testid="years-served-badge"
        className="text-[10px] text-stone-400 italic px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200 inline-flex items-center"
      >
        No Join Date
      </span>
    );
  }

  let colorClasses = 'bg-stone-100 text-stone-800 border-stone-300';
  let badgeIcon = <Clock className={size === 'lg' ? 'w-4 h-4 text-stone-600' : 'w-3 h-3 text-stone-600'} />;

  if (service.tenureTier === 'senior') {
    colorClasses = 'bg-amber-100 text-amber-950 border-amber-400 shadow-[1px_1px_0px_#78350f]';
    badgeIcon = <Award className={size === 'lg' ? 'w-4 h-4 text-amber-700' : 'w-3 h-3 text-amber-700'} />;
  } else if (service.tenureTier === 'mid') {
    colorClasses = 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-[1px_1px_0px_#065f46]';
    badgeIcon = <Award className={size === 'lg' ? 'w-4 h-4 text-emerald-700' : 'w-3 h-3 text-emerald-700'} />;
  } else if (service.tenureTier === 'junior') {
    colorClasses = 'bg-sky-100 text-sky-950 border-sky-400 shadow-[1px_1px_0px_#0369a1]';
    badgeIcon = <Clock className={size === 'lg' ? 'w-4 h-4 text-sky-700' : 'w-3 h-3 text-sky-700'} />;
  } else {
    colorClasses = 'bg-purple-100 text-purple-950 border-purple-400 shadow-[1px_1px_0px_#581c87]';
    badgeIcon = <Sparkles className={size === 'lg' ? 'w-4 h-4 text-purple-700' : 'w-3 h-3 text-purple-700'} />;
  }

  const sizeClasses = 
    size === 'lg' 
      ? 'px-3 py-1 text-xs' 
      : size === 'md' 
        ? 'px-2 py-0.5 text-[11px]' 
        : 'px-1.5 py-0.5 text-[10px]';

  return (
    <span
      id={id}
      data-testid="years-served-badge"
      className={`inline-flex items-center gap-1 font-bold rounded border tracking-tight cursor-help transition-all hover:scale-105 select-none ${colorClasses} ${sizeClasses} ${className}`}
      title={service.tooltip}
    >
      {badgeIcon}
      <span className="font-mono font-black">{service.yearsServedLabel}</span>
      {showKannada && (
        <span className="font-kannada font-normal text-[9px] opacity-85 border-l border-current pl-1 ml-0.5 hidden sm:inline">
          {service.kannadaLabel}
        </span>
      )}
    </span>
  );
};

export const EmployeeRosterView: React.FC<EmployeeRosterViewProps> = ({
  employees = [],
  letters = [],
  files = [],
  onAddEmployee,
  onEditEmployee,
  onUploadEmployees,
  onDeleteEmployee,
  onBatchDeleteEmployees,
  onClearAllEmployees,
  onSelectLetter,
  onSeedEmployees,
  onOpenServiceSanctions,
  onDraftLetterForEmployee,
  onOpenPrapathra28,
  onGoBackHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<DepartmentSection | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedEmployeeForDossier, setSelectedEmployeeForDossier] = useState<Employee | null>(null);
  const [rosterViewTab, setRosterViewTab] = useState<'all' | 'office' | 'additional'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Multi-selection for batch deletion
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Office staff and additional info counts
  const officeEmployeesCount = useMemo(() => {
    return employees.filter(e => 
      e.isDdo ||
      e.role === 'Director / HOD' || 
      e.role === 'Superintendent' || 
      e.role === 'Clerk / Assistant' ||
      e.designation.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ') ||
      e.designation.includes('ಅಧೀಕ್ಷಕ') ||
      e.designation.includes('FDA') ||
      e.designation.includes('SDA') ||
      e.designation.includes('ಪ್ರಥಮ ದರ್ಜೆ') ||
      e.designation.includes('ದ್ವಿತೀಯ ದರ್ಜೆ') ||
      e.designation.includes('BEO') ||
      e.designation.includes('ಆಡಳಿತ') ||
      (e.officeLocation && e.officeLocation.includes('ಕಛೇರಿ'))
    ).length;
  }, [employees]);

  const additionalInfoEmployeesCount = useMemo(() => {
    return employees.filter(e => 
      (e.additionalFields && e.additionalFields.length > 0) ||
      e.emergencyContact ||
      e.bankAccountNo ||
      e.panNumber ||
      e.aadhaarNumber ||
      e.satsId ||
      e.serviceBookVolume
    ).length;
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Sub-tab scoping
      if (rosterViewTab === 'office') {
        const isOffice = emp.isDdo ||
          emp.role === 'Director / HOD' || 
          emp.role === 'Superintendent' || 
          emp.role === 'Clerk / Assistant' ||
          emp.designation.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ') ||
          emp.designation.includes('ಅಧೀಕ್ಷಕ') ||
          emp.designation.includes('FDA') ||
          emp.designation.includes('SDA') ||
          emp.designation.includes('ಪ್ರಥಮ ದರ್ಜೆ') ||
          emp.designation.includes('ದ್ವಿತೀಯ ದರ್ಜೆ') ||
          emp.designation.includes('BEO') ||
          emp.designation.includes('ಆಡಳಿತ') ||
          (emp.officeLocation && emp.officeLocation.includes('ಕಛೇರಿ'));
        if (!isOffice) return false;
      }

      if (rosterViewTab === 'additional') {
        const hasExtra = (emp.additionalFields && emp.additionalFields.length > 0) ||
          emp.emergencyContact ||
          emp.bankAccountNo ||
          emp.panNumber ||
          emp.aadhaarNumber ||
          emp.satsId ||
          emp.serviceBookVolume;
        if (!hasExtra) return false;
      }
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          emp.fullName.toLowerCase().includes(q) ||
          emp.employeeCode.toLowerCase().includes(q) ||
          (emp.kgidNumber && emp.kgidNumber.toLowerCase().includes(q)) ||
          (emp.placeOfWork && emp.placeOfWork.toLowerCase().includes(q)) ||
          (emp.ddoCode && emp.ddoCode.toLowerCase().includes(q)) ||
          (emp.parentName && emp.parentName.toLowerCase().includes(q)) ||
          (emp.epicNo && emp.epicNo.toLowerCase().includes(q)) ||
          (emp.hometown && emp.hometown.toLowerCase().includes(q)) ||
          emp.designation.toLowerCase().includes(q) ||
          emp.section.toLowerCase().includes(q) ||
          emp.officeLocation.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.phone.toLowerCase().includes(q) ||
          (emp.qualifications && emp.qualifications.toLowerCase().includes(q));

        if (!matchesSearch) return false;
      }

      // Section
      if (selectedSection !== 'all' && emp.section !== selectedSection) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && emp.status !== selectedStatus) {
        return false;
      }

      // Role
      if (selectedRole !== 'all' && emp.role !== selectedRole) {
        return false;
      }

      return true;
    });
  }, [employees, searchTerm, selectedSection, selectedStatus, selectedRole]);

  // Quick statistics
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const leaveCount = employees.filter((e) => e.status === 'On Leave' || e.status === 'Deputation').length;
  const permanentCount = employees.filter((e) => e.employmentType === 'Permanent').length;

  // Export current filtered list to Microsoft Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = filteredEmployees.map((e) => ({
      'Employee Code': e.employeeCode,
      'KGID Number': e.kgidNumber || '',
      'Full Name': e.fullName,
      'Designation': e.designation,
      'Place of Work': e.placeOfWork || '',
      'Basic Pay (₹)': e.basicPay || 0,
      'Pay Scale': e.payScale || '',
      'Gender': e.gender || '',
      'DOB': e.dob || '',
      'Age': e.age || '',
      'DDO Code': e.ddoCode || '',
      'Parent Name': e.parentName || '',
      'EPIC No': e.epicNo || '',
      'Hometown': e.hometown || '',
      'Section': e.section,
      'Office Location': e.officeLocation,
      'Email': e.email,
      'Phone': e.phone,
      'Employment Type': e.employmentType,
      'Status': e.status,
      'Role': e.role,
      'Joining Date': e.joiningDate,
      'Qualifications': e.qualifications || '',
      'Notes': e.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 26 },
      { wch: 32 },
      { wch: 30 },
      { wch: 14 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 14 },
      { wch: 22 },
      { wch: 14 },
      { wch: 16 },
      { wch: 25 },
      { wch: 32 },
      { wch: 28 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 14 },
      { wch: 28 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Education_Staff_Establishment');
    XLSX.writeFile(wb, `BEO_Bhadravathi_Employees_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee Code',
      'KGID Number',
      'Full Name',
      'Designation',
      'Place of Work',
      'Basic Pay',
      'Pay Scale',
      'Gender',
      'DOB',
      'Age',
      'DDO Code',
      'Parent Name',
      'EPIC No',
      'Hometown',
      'Section',
      'Office Location',
      'Email',
      'Phone',
      'Employment Type',
      'Status',
      'Role',
      'Joining Date',
      'Qualifications',
      'Notes'
    ];

    const rows = filteredEmployees.map((e) => [
      `"${e.employeeCode}"`,
      `"${e.kgidNumber || ''}"`,
      `"${e.fullName}"`,
      `"${e.designation}"`,
      `"${e.placeOfWork || ''}"`,
      `"${e.basicPay || ''}"`,
      `"${e.payScale || ''}"`,
      `"${e.gender || ''}"`,
      `"${e.dob || ''}"`,
      `"${e.age || ''}"`,
      `"${e.ddoCode || ''}"`,
      `"${e.parentName || ''}"`,
      `"${e.epicNo || ''}"`,
      `"${e.hometown || ''}"`,
      `"${e.section}"`,
      `"${e.officeLocation}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.employmentType}"`,
      `"${e.status}"`,
      `"${e.role}"`,
      `"${e.joiningDate}"`,
      `"${(e.qualifications || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `beo_bhadravathi_employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Letters and Files handled by an employee
  const getEmployeeAssignments = (emp: Employee) => {
    const assignedLetters = letters.filter(
      (l) =>
        l.assignedOfficer.toLowerCase().includes(emp.fullName.toLowerCase()) ||
        l.assignedOfficer.toLowerCase().includes(emp.employeeCode.toLowerCase())
    );
    const custodianFiles = files.filter(
      (f) =>
        f.currentCustodian.toLowerCase().includes(emp.fullName.toLowerCase()) ||
        f.currentCustodian.toLowerCase().includes(emp.designation.toLowerCase())
    );
    return { assignedLetters, custodianFiles };
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            On Leave
          </span>
        );
      case 'Transferred':
      case 'Deputation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {status}
          </span>
        );
      case 'Retired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Retired
          </span>
        );
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExecuteBatchDelete = async () => {
    if (selectedIds.size === 0 || !onBatchDeleteEmployees) return;
    const confirmMsg = `ಖಚಿತಪಡಿಸಿ: ಆಯ್ಕೆಮಾಡಲಾದ ${selectedIds.size} ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆಯಬೇಕೆ?\nAre you sure you want to delete ${selectedIds.size} selected employee records?`;
    if (!window.confirm(confirmMsg)) return;

    setIsBatchDeleting(true);
    try {
      await onBatchDeleteEmployees(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const handleExecuteClearAll = async () => {
    if (!onClearAllEmployees) return;
    const confirmMsg = `ಎಚ್ಚರಿಕೆ! ಎಲ್ಲಾ ${employees.length} ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ಕಛೇರಿ ಪಟ್ಟಿಯಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ತೆಗೆದುಹಾಕಬೇಕೆ? ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂಪಡೆಯಲಾಗುವುದಿಲ್ಲ!\n(Are you sure you want to completely clear ALL ${employees.length} employee records?)`;
    if (!window.confirm(confirmMsg)) return;
    const doubleConfirm = window.prompt(`ದೃಢೀಕರಿಸಲು ದಯವಿಟ್ಟು "DELETE" ಎಂದು ಟೈಪ್ ಮಾಡಿ (Type "DELETE" to confirm):`);
    if (doubleConfirm !== 'DELETE') return;

    setIsClearingAll(true);
    try {
      await onClearAllEmployees();
      setSelectedIds(new Set());
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to Home & Roster Header Bar */}
      {onGoBackHome && (
        <div className="bg-stone-900 text-stone-100 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-stone-800">
          <div className="flex items-center gap-3">
            <button
              id="btn-employee-back-to-home"
              onClick={onGoBackHome}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ"
            >
              <span>&larr; ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Home)</span>
            </button>
            <div>
              <h2 className="text-sm font-bold text-amber-300">
                ನೌಕರರ ಮಾಹಿತಿ ವಿವರ (Employee Information & Service Records)
              </h2>
              <p className="text-[11px] text-stone-400">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ - ನೌಕರರ ಸೇವಾ ದಾಖಲೆಗಳು, ವೇತನ ವಿವರ ಮತ್ತು ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ನಿರ್ವಹಣೆ
              </p>
            </div>
          </div>

          {onOpenPrapathra28 && (
            <button
              id="btn-employee-open-prapathra"
              onClick={onOpenPrapathra28}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold rounded-lg border border-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>ಪ್ರಪತ್ರ-28 ವೇತನ ಬಡ್ತಿಗೆ ಹೋಗಿ &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner & Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-brutal p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="label-ink">TOTAL ROSTER</span>
            <div className="w-8 h-8 rounded-lg bg-[#fffbf2] border-2 border-[#2b2b2b] text-[#2b2b2b] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#2b2b2b] mt-2 font-mono-code">
            {totalCount}
          </div>
          <div className="text-xs text-[#2b2b2b]/70 mt-1 font-kannada">
            ನೋಂದಾಯಿತ ಸಿಬ್ಬಂದಿ ವರ್ಗ
          </div>
        </div>

        <div className="card-brutal p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="label-secondary">ACTIVE DUTY</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border-2 border-[#2b2b2b] text-[#10b981] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#10b981] mt-2 font-mono-code">
            {activeCount}
          </div>
          <div className="text-xs text-[#2b2b2b]/70 mt-1 font-kannada">
            ಕರ್ತವ್ಯದಲ್ಲಿರುವ ಅಧಿಕಾರಿಗಳು
          </div>
        </div>

        <div className="card-brutal p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="label-accent">LEAVE & DEP.</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-[#2b2b2b] text-[#f59e0b] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#f59e0b] mt-2 font-mono-code">
            {leaveCount}
          </div>
          <div className="text-xs text-[#2b2b2b]/70 mt-1 font-kannada">
            ರಜೆ / ನಿಯೋಜನೆ ಮೇಲಿರುವವರು
          </div>
        </div>

        <div className="card-brutal p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="label-ink">PERMANENT</span>
            <div className="w-8 h-8 rounded-lg bg-[#fffbf2] border-2 border-[#2b2b2b] text-[#2b2b2b] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#2b2b2b]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#2b2b2b] mt-2 font-mono-code">
            {permanentCount}
          </div>
          <div className="text-xs text-[#2b2b2b]/70 mt-1 font-kannada">
            ಖಾಯಂ ವೃಂದದ ನೌಕರರು
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-brutal bg-white overflow-hidden">
        {/* Action Header */}
        <div className="p-4 sm:p-5 border-b-3 border-[#2b2b2b] bg-[#fffbf2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-gaegu text-3xl font-bold text-[#2b2b2b] tracking-tight">
                Establishment & Staff Directory
              </h2>
              <span className="label-ink">
                {filteredEmployees.length} Shown
              </span>
            </div>
            <p className="text-xs text-[#2b2b2b]/80 mt-0.5 font-kannada">
              ಕಛೇರಿಯ ಅಧಿಕಾರಿ/ಸಿಬ್ಬಂದಿಗಳ ಸೇವಾ ವಿವರಗಳು, ವೇತನ ಬಡ್ತಿ ಮತ್ತು ಕಡತಗಳ ನಿರ್ವಹಣೆ
            </p>
          </div>

          {/* Action Buttons: Add, Upload Excel, Export Excel, Seed, Service Sanctions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenServiceSanctions && (
              <button
                id="btn-roster-service-sanctions"
                onClick={() => onOpenServiceSanctions()}
                className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-[#f59e0b] hover:bg-amber-400 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5 font-kannada"
                title="ಗಳಿಕೆ ರಜೆ, ಶಿಶುಪಾಲನ ರಜೆ, ಕಾಲಮಿತಿ / ಸ್ವಯಂಚಾಲಿತ / ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ ಕಡತ ಪ್ರಕ್ರಿಯೆ"
              >
                <Award className="w-3.5 h-3.5 text-[#2b2b2b]" />
                <span>ರಜೆ / ವೇತನ ಬಡ್ತಿ ಕಡತ</span>
              </button>
            )}

            {onOpenPrapathra28 && (
              <button
                id="btn-roster-prapathra28"
                onClick={onOpenPrapathra28}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#10b981] hover:bg-emerald-600 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5 font-kannada"
                title="ಕರ್ನಾಟಕ ನಾಗರೀಕ ಸೇವಾ ನಿಯಮಾವಳಿ ಪ್ರಪತ್ರ-28 ರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಪ್ರಮಾಣ ಪತ್ರ ರಚಿಸಿ"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span>ಪ್ರಪತ್ರ-28 (Form 28)</span>
              </button>
            )}

            {onSeedEmployees && (
              <button
                id="btn-seed-emp-data"
                onClick={onSeedEmployees}
                className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-[#fffbf2] border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5 font-kannada"
                title="Seed standard Education Department cadre and officer records"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>ಸಿಬ್ಬಂದಿ ಡೇಟಾ ರಚಿಸಿ</span>
              </button>
            )}

            <button
              id="btn-upload-emp-data"
              onClick={onUploadEmployees}
              className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-[#fffbf2] border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5 font-kannada"
              title="Bulk upload employee roster from Microsoft Excel (.xlsx) or CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#10b981]" />
              <span>ಎಕ್ಸೆಲ್ ಅಪ್ಲೋಡ್</span>
            </button>

            <button
              id="btn-export-emp-excel"
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-[#fffbf2] border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5 font-mono-code"
              title="Export current filtered roster to Microsoft Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-[#10b981]" />
              <span>.XLSX</span>
            </button>

            <button
              id="btn-export-emp-csv"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-stone-100 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1.5"
              title="Export staff establishment list to CSV for external reporting"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export as CSV</span>
            </button>

            {onClearAllEmployees && employees.length > 0 && (
              <button
                id="btn-clear-all-employees"
                onClick={handleExecuteClearAll}
                disabled={isClearingAll}
                className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer flex items-center gap-1 font-kannada"
                title="ಎಲ್ಲಾ ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ (Clear entire roster)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ತೆರವುಗೊಳಿಸಿ ({employees.length})</span>
              </button>
            )}

            <button
              id="btn-add-employee"
              onClick={onAddEmployee}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2b2b2b] hover:bg-stone-800 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#f59e0b] transition-all cursor-pointer flex items-center gap-1.5 font-kannada"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>ಹೊಸ ನೌಕರ (Add Employee)</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS: 1. ಎಲ್ಲಾ ನೌಕರರು | 2. ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ವಿವರಗಳು | 3. ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ವಿವರಗಳು */}
        <div className="flex border-b-2 border-[#2b2b2b] bg-amber-50/60 px-4 pt-2.5 gap-2 overflow-x-auto">
          <button
            id="subtab-all-employees"
            onClick={() => setRosterViewTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-2 border-b-0 border-[#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada ${
              rosterViewTab === 'all'
                ? 'bg-white text-[#2b2b2b] shadow-[0_-2px_0px_#f59e0b]'
                : 'bg-stone-100/90 text-stone-600 hover:bg-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>1. ಎಲ್ಲಾ ನೌಕರರು ({employees.length})</span>
          </button>

          <button
            id="subtab-office-staff"
            onClick={() => setRosterViewTab('office')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-2 border-b-0 border-[#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada ${
              rosterViewTab === 'office'
                ? 'bg-white text-[#2b2b2b] shadow-[0_-2px_0px_#0284c7]'
                : 'bg-stone-100/90 text-stone-600 hover:bg-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-sky-700" />
            <span>2. ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ವಿವರಗಳು ({officeEmployeesCount})</span>
          </button>

          <button
            id="subtab-additional-fields"
            onClick={() => setRosterViewTab('additional')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-2 border-b-0 border-[#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer font-kannada ${
              rosterViewTab === 'additional'
                ? 'bg-amber-100 text-amber-950 shadow-[0_-2px_0px_#f59e0b]'
                : 'bg-stone-100/90 text-stone-600 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>3. ನೌಕರರ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ವಿವರಗಳು ({additionalInfoEmployeesCount})</span>
            {additionalInfoEmployeesCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {additionalInfoEmployeesCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b-2 border-[#2b2b2b] bg-white flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#2b2b2b] absolute left-3 top-2.5" />
              <input
                id="input-search-employees"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, title, email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] focus:outline-none focus:bg-[#fffbf2]"
              />
            </div>

            {/* Section Filter */}
            <div>
              <select
                id="select-filter-section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] focus:outline-none text-[#2b2b2b] font-medium"
              >
                <option value="all">All Wings / Sections</option>
                {SECTIONS.filter(s => s !== 'all').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                id="select-filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] focus:outline-none text-[#2b2b2b] font-medium"
              >
                <option value="all">All Statuses</option>
                {STATUSES.filter(s => s !== 'all').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                id="select-filter-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-700"
              >
                <option value="all">All Role Categories</option>
                <option value="Director / HOD">Director / HOD</option>
                <option value="District Officer">District Officer</option>
                <option value="Section Officer">Section Officer</option>
                <option value="Superintendent">Superintendent</option>
                <option value="Inspector / Evaluator">Inspector / Evaluator</option>
                <option value="Clerk / Assistant">Clerk / Assistant</option>
                <option value="Faculty / Principal">Faculty / Principal</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center gap-1 bg-amber-50/80 p-1 rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] shrink-0 self-start xl:self-center">
            <button
              type="button"
              id="btn-roster-view-cards"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-kannada ${
                viewMode === 'cards'
                  ? 'bg-[#2b2b2b] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-white'
              }`}
              title="ಕಾರ್ಡ್ ವೀಕ್ಷಣೆ (Cards View - Detailed Employee Cards with Years Served badges)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>ಕಾರ್ಡ್‌ಗಳು (Cards)</span>
            </button>
            <button
              type="button"
              id="btn-roster-view-table"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-kannada ${
                viewMode === 'table'
                  ? 'bg-[#2b2b2b] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-white'
              }`}
              title="ಕೋಷ್ಟಕ ವೀಕ್ಷಣೆ (Table View)"
            >
              <List className="w-3.5 h-3.5 text-sky-400" />
              <span>ಕೋಷ್ಟಕ (Table)</span>
            </button>
          </div>
        </div>

        {/* Employee Roster Table */}
        {filteredEmployees.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No employees match your search</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your filters, or register a new employee into the establishment directory.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSection('all');
                  setSelectedStatus('all');
                  setSelectedRole('all');
                }}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={onAddEmployee}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
              >
                Add Employee
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Batch Selection Banner */}
            {selectedIds.size > 0 && (
              <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>{selectedIds.size} ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ ({selectedIds.size} Selected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="px-2.5 py-1 text-xs bg-white text-stone-700 font-medium rounded-md border border-amber-300 hover:bg-stone-50"
                  >
                    ಆಯ್ಕೆ ರದ್ದು (Deselect)
                  </button>
                  {onBatchDeleteEmployees && (
                    <button
                      type="button"
                      onClick={handleExecuteBatchDelete}
                      disabled={isBatchDeleting}
                      className="px-3 py-1 text-xs bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 shadow-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ಆಯ್ಕೆಮಾಡಿದವರನ್ನು ಅಳಿಸಿ ({selectedIds.size} Delete)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* DEDICATED SEPARATE SECTION FOR ADDITIONAL INFORMATION (ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಿದನ್ನು ಬೇರಿಕಡೆ ಬರುವಂತೆ ಇರಬೇಕು) */}
            {rosterViewTab === 'additional' && (
              <div className="p-4 sm:p-6 bg-amber-50/40 border-b-2 border-[#2b2b2b] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-300 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#2b2b2b] text-[#f59e0b]">
                        <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                      </span>
                      <h3 className="font-gaegu text-2xl font-bold text-amber-950">
                        ನೌಕರರ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ವಿವರಗಳ ಪ್ರತ್ಯೇಕ ಪಟ್ಟಿ (Additional & Custom Information)
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 font-kannada">
                      ನೌಕರರ ಮಾಹಿತಿಯಲ್ಲಿ ನಮೂದಿಸಲಾದ ಎಲ್ಲಾ ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ನಾಮಿನಿ, ಪಿ.ಎಫ್., ರಕ್ತದ ಗುಂಪು, ತುರ್ತು ಸಂಪರ್ಕ, ಬ್ಯಾಂಕ್ ವಿವರ ಇತ್ಯಾದಿ) ಇಲ್ಲಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಲಭ್ಯವಿವೆ.
                    </p>
                  </div>
                  <button
                    onClick={onAddEmployee}
                    className="px-3 py-1.5 bg-[#2b2b2b] text-white hover:bg-stone-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer font-kannada shadow-xs self-start sm:self-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>+ ಹೊಸ ನೌಕರ & ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಿ</span>
                  </button>
                </div>

                {filteredEmployees.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-xl border-2 border-dashed border-amber-300 p-6 space-y-2">
                    <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="font-bold text-sm text-stone-800 font-kannada">ಇನ್ನೂ ಯಾವುದೇ ನೌಕರರಿಗೆ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಲಾಗಿಲ್ಲ</p>
                    <p className="text-xs text-stone-500 font-kannada">
                      ನೌಕರರ ಪಟ್ಟಿಯಲ್ಲಿ &ldquo;Edit&rdquo; ಕ್ಲಿಕ್ ಮಾಡಿ ಕೆಳಭಾಗದಲ್ಲಿರುವ &ldquo;+ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಿ&rdquo; ಮೂಲಕ ಕಸ್ಟಮ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEmployees.map((emp) => (
                      <div key={emp.id} className="bg-white rounded-xl border-2 border-[#2b2b2b] p-4 shadow-[3px_3px_0px_#f59e0b] space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2">
                            <div>
                              <h4 className="font-bold text-sm text-[#2b2b2b]">{emp.fullName}</h4>
                              <p className="text-[11px] text-stone-600">{emp.designation}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                                  {emp.employeeCode}
                                </span>
                                {emp.kgidNumber && (
                                  <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                    KGID: {emp.kgidNumber}
                                  </span>
                                )}
                                {emp.isDdo && (
                                  <span className="text-[9px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded border border-[#2b2b2b]">
                                    ⭐ DDO
                                  </span>
                                )}
                                <YearsOfServiceBadge joiningDate={emp.joiningDate} size="sm" showKannada={true} />
                              </div>
                            </div>
                            <button
                              onClick={() => onEditEmployee(emp)}
                              className="p-1.5 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-300 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                              title="ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ತಿದ್ದುಪಡಿ ಮಾಡಿ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">ತಿದ್ದುಪಡಿ</span>
                            </button>
                          </div>

                          {/* Automated Years of Service Badge & Joining Date */}
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-2 rounded-lg border-2 border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="text-[11px]">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900/80 block leading-tight">
                                ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (Joining Date)
                              </span>
                              <span className="font-mono font-bold text-stone-900 text-xs">
                                {emp.joiningDate || 'N/A'}
                              </span>
                            </div>
                            <YearsOfServiceBadge joiningDate={emp.joiningDate} size="md" showKannada={true} />
                          </div>

                          {/* Built-in Extra Information Fields */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {emp.satsId && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">SATS ID:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.satsId}</span>
                              </div>
                            )}
                            {emp.serviceBookVolume && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">ಸೇವಾ ಪುಸ್ತಕ ಸಂಪುಟ:</span>
                                <span className="font-bold text-stone-800">{emp.serviceBookVolume}</span>
                              </div>
                            )}
                            {emp.emergencyContact && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">ತುರ್ತು ಸಂಪರ್ಕ:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.emergencyContact}</span>
                              </div>
                            )}
                            {emp.bankAccountNo && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">ಬ್ಯಾಂಕ್ ಖಾತೆ:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.bankAccountNo}</span>
                              </div>
                            )}
                            {emp.bankIfsc && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">IFSC ಕೋಡ್:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.bankIfsc}</span>
                              </div>
                            )}
                            {emp.panNumber && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">PAN ಸಂಖ್ಯೆ:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.panNumber}</span>
                              </div>
                            )}
                            {emp.aadhaarNumber && (
                              <div className="bg-stone-50 p-1.5 rounded border border-stone-200">
                                <span className="text-[10px] text-stone-500 block">ಆಧಾರ್ ಸಂಖ್ಯೆ:</span>
                                <span className="font-mono font-bold text-stone-800">{emp.aadhaarNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Dynamic Custom Key-Value Fields */}
                          {emp.additionalFields && emp.additionalFields.length > 0 && (
                            <div className="pt-2 border-t border-amber-200 space-y-1.5">
                              <span className="text-[10px] font-bold text-amber-900 font-kannada block">
                                ಕಸ್ಟಮ್ ಹೆಚ್ಚುವರಿ ವಿವರಗಳು ({emp.additionalFields.length}):
                              </span>
                              <div className="space-y-1">
                                {emp.additionalFields.map(f => (
                                  <div key={f.id} className="flex items-center justify-between text-xs bg-amber-50/80 px-2 py-1 rounded border border-amber-200">
                                    <span className="font-semibold text-stone-700">{f.key}:</span>
                                    <span className="font-bold text-amber-950 font-mono">{f.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                          <span>ರಜೆ ಶಿಲ್ಕು: EL: {emp.earnedLeaveBalance ?? 30} | HPL: {emp.halfPayLeaveBalance ?? 20}</span>
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="text-amber-800 font-bold hover:underline cursor-pointer"
                          >
                            + ಇನ್ನಷ್ಟು ಸೇರಿಸಿ &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CARDS VIEW: Detailed employee cards with automated 'Years of Service' badge displaying 'Years Served' indicator */}
            {viewMode === 'cards' && rosterViewTab !== 'additional' ? (
              <div className="p-4 sm:p-5 bg-stone-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredEmployees.map((emp) => {
                    const isSelected = selectedIds.has(emp.id);
                    const initials = emp.fullName
                      .replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
                      .split(' ')
                      .filter(Boolean)
                      .map(n => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={emp.id}
                        data-testid={`employee-card-${emp.id}`}
                        className={`bg-white rounded-xl border-2 border-[#2b2b2b] p-4 shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#f59e0b] transition-all flex flex-col justify-between space-y-3 ${
                          isSelected ? 'bg-amber-50/70 ring-2 ring-amber-500' : ''
                        }`}
                      >
                        {/* Card Header: Checkbox, Avatar, Name, Designation, Role */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2.5">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectOne(emp.id)}
                                className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer mt-1"
                                title="ಆಯ್ಕೆಮಾಡಿ (Select)"
                              />
                              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-950 font-black flex items-center justify-center text-xs shrink-0 border border-amber-300">
                                {initials || 'ED'}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-[#2b2b2b] leading-tight flex items-center gap-1.5 flex-wrap">
                                  <span>{emp.fullName}</span>
                                  {emp.isDdo && (
                                    <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 font-black text-[9px] rounded border border-[#2b2b2b] shadow-2xs font-kannada">
                                      ⭐ DDO
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{emp.designation}</p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                                    {emp.employeeCode}
                                  </span>
                                  {emp.kgidNumber ? (
                                    <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                      KGID: {emp.kgidNumber}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-stone-400 italic">No KGID</span>
                                  )}
                                  <span className="text-[10px] text-stone-500 font-normal">
                                    ({emp.employmentType})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {getStatusBadge(emp.status)}
                            </div>
                          </div>

                          {/* AUTOMATED YEARS OF SERVICE BADGE (YEARS SERVED INDICATOR) */}
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-2.5 rounded-lg border-2 border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="text-[11px]">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900/80 block leading-tight">
                                ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (Joining Date)
                              </span>
                              <span className="font-mono font-bold text-stone-900 text-xs">
                                {emp.joiningDate || 'N/A'}
                              </span>
                            </div>
                            {/* Dynamic Years Served Indicator Badge */}
                            <YearsOfServiceBadge 
                              joiningDate={emp.joiningDate} 
                              size="md" 
                              showKannada={true} 
                            />
                          </div>

                          {/* Section & Basic Pay */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                              <span className="text-[9px] font-bold text-stone-500 uppercase block">ಶಾಖೆ (Wing)</span>
                              <span className="font-semibold text-stone-800 truncate block">{emp.section}</span>
                              <span className="text-[10px] text-stone-500 truncate block mt-0.5">{emp.officeLocation}</span>
                            </div>
                            <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                              <span className="text-[9px] font-bold text-stone-500 uppercase block">ಮೂಲ ವೇತನ (Pay)</span>
                              <span className="font-mono font-bold text-stone-900 block">
                                ₹{(emp.basicPay || 37900).toLocaleString('en-IN')}/-
                              </span>
                              <span className="text-[10px] text-stone-500 truncate block">{emp.payScale || 'Level-9'}</span>
                            </div>
                          </div>

                          {/* Leave balances */}
                          <div className="flex items-center justify-between text-[11px] bg-stone-50 px-2 py-1.5 rounded-lg border border-stone-200">
                            <span className="text-stone-600 font-kannada text-[10px] font-bold">ರಜೆ ಶಿಲ್ಕು:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-950 font-bold rounded text-[10px] border border-emerald-300">
                                EL: {emp.earnedLeaveBalance ?? 30} ದಿನ
                              </span>
                              <span className="px-1.5 py-0.5 bg-sky-100 text-sky-950 font-bold rounded text-[10px] border border-sky-300">
                                HPL: {emp.halfPayLeaveBalance ?? 20} ದಿನ
                              </span>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-0.5">
                            <div className="flex items-center gap-1 truncate max-w-[140px]">
                              <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                              <a href={`mailto:${emp.email}`} className="truncate hover:text-amber-800 hover:underline">
                                {emp.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{emp.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {onOpenServiceSanctions && (
                              <button
                                id={`btn-sanction-emp-${emp.id}`}
                                onClick={() => onOpenServiceSanctions(emp)}
                                className="px-2 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="ರಜೆ ಅಥವಾ ವೇತನ ಬಡ್ತಿ ಆದೇಶ ರಚಿಸಿ"
                              >
                                <Award className="w-3 h-3 text-amber-700" />
                                <span>ಆದೇಶ</span>
                              </button>
                            )}
                            {onDraftLetterForEmployee && (
                              <button
                                id={`btn-draft-letter-emp-${emp.id}`}
                                onClick={() => onDraftLetterForEmployee(emp)}
                                className="px-2 py-1 text-[11px] font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="ಪತ್ರ ರಚಿಸಿ"
                              >
                                <FileText className="w-3 h-3 text-sky-700" />
                                <span>ಪತ್ರ</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              id={`btn-view-emp-${emp.id}`}
                              onClick={() => setSelectedEmployeeForDossier(emp)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="View Employee Dossier"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-edit-emp-${emp.id}`}
                              onClick={() => onEditEmployee(emp)}
                              className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-emp-${emp.id}`}
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to remove employee record "${emp.fullName}" (${emp.employeeCode})?`)) {
                                  await onDeleteEmployee(emp.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          title="Select All"
                        />
                      </th>
                      <th className="py-3 px-4">Official / Designation</th>
                      <th className="py-3 px-4">Emp Code & KGID</th>
                      <th className="py-3 px-4">Wing & Office Location</th>
                      <th className="py-3 px-4">ಮೂಲ ವೇತನ (Basic Pay)</th>
                      <th className="py-3 px-4">ರಜೆ ಶಿಲ್ಕು (EL & HPL)</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedIds.has(emp.id);
                      const initials = emp.fullName
                        .replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
                        .split(' ')
                        .filter(Boolean)
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      const { assignedLetters, custodianFiles } = getEmployeeAssignments(emp);

                      return (
                        <tr 
                          key={emp.id}
                          className={`transition-colors group ${
                            isSelected ? 'bg-amber-50/70' : 'hover:bg-amber-50/30'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(emp.id)}
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                          </td>

                          {/* Name, Title, and Years Served Badge */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-200">
                                {initials || 'ED'}
                              </div>
                              <div>
                                <div className="font-bold text-stone-900 flex items-center gap-1.5 flex-wrap">
                                  <span>{emp.fullName}</span>
                                  <span className="text-[10px] font-normal text-stone-500">
                                    ({emp.employmentType})
                                  </span>
                                  <YearsOfServiceBadge joiningDate={emp.joiningDate} size="sm" showKannada={true} />
                                  {emp.isDdo && (
                                    <span className="px-1.5 py-0.5 bg-amber-400 text-stone-950 font-black text-[9px] rounded border border-[#2b2b2b] inline-flex items-center gap-0.5 shadow-2xs font-kannada">
                                      ⭐ DDO
                                    </span>
                                  )}
                                  {emp.additionalFields && emp.additionalFields.length > 0 && (
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 text-[9px] rounded font-bold font-kannada">
                                      +{emp.additionalFields.length} ಹೆಚ್ಚುವರಿ ವಿವರ
                                    </span>
                                  )}
                                </div>
                                <div className="text-stone-600 text-[11px] flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span>{emp.designation}</span>
                                  <span className="text-stone-300">•</span>
                                  <span className="text-stone-500 text-[10px]">{emp.role}</span>
                                  {emp.joiningDate && (
                                    <>
                                      <span className="text-stone-300">•</span>
                                      <span className="text-stone-500 text-[10px] font-mono">
                                        ಸೇವೆ: {emp.joiningDate}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Employee Code & KGID */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 block w-fit">
                                {emp.employeeCode}
                              </span>
                              {emp.kgidNumber ? (
                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 block w-fit">
                                  KGID: {emp.kgidNumber}
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">No KGID</span>
                              )}
                            </div>
                          </td>

                          {/* Wing & Location */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-800">{emp.section}</div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{emp.officeLocation}</span>
                            </div>
                          </td>

                          {/* Basic Pay & Scale */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-stone-900 text-xs flex items-center gap-1">
                                <span className="text-stone-500 font-sans font-normal">₹</span>
                                <span>{(emp.basicPay || 37900).toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-stone-400 font-sans font-normal">/mo</span>
                              </div>
                              {emp.payScale && (
                                <div className="text-[10px] text-stone-500 font-mono">
                                  {emp.payScale}
                                </div>
                              )}
                              {emp.serviceHistory && emp.serviceHistory.length > 0 && (
                                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <TrendingUp className="w-2.5 h-2.5" />
                                  <span>{emp.serviceHistory.length} orders recorded</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Leave Balances: EL & HPL (ಗಳಿಕೆ ರಜೆ ಮತ್ತು ಎಚ್ ಪಿ ಎಲ್) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                                <span className="font-kannada">ಗಳಿಕೆ (EL):</span>
                                <span className="font-mono">{emp.earnedLeaveBalance ?? 30} ದಿನ</span>
                              </div>
                              <br />
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-300 text-[11px] font-bold">
                                <span className="font-kannada">HPL:</span>
                                <span className="font-mono">{emp.halfPayLeaveBalance ?? 20} ದಿನ</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-[11px] text-stone-700">
                              <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                              <a href={`mailto:${emp.email}`} className="hover:text-amber-700 hover:underline truncate max-w-[170px]">
                                {emp.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{emp.phone}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(emp.status)}
                          </td>

                          {/* Action buttons */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {onOpenServiceSanctions && (
                                <button
                                  id={`btn-sanction-emp-${emp.id}`}
                                  onClick={() => onOpenServiceSanctions(emp)}
                                  className="px-2 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                  title="ರಜೆ ಅಥವಾ ವೇತನ ಬಡ್ತಿ ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜಿಸಿ (Leave & Increment Sanction Memo)"
                                >
                                  <Award className="w-3 h-3 text-amber-700" />
                                  <span>ಆದೇಶ</span>
                                </button>
                              )}

                              {onDraftLetterForEmployee && (
                                <button
                                  id={`btn-draft-letter-emp-${emp.id}`}
                                  onClick={() => onDraftLetterForEmployee(emp)}
                                  className="px-2 py-1 text-[11px] font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                  title="ಈ ನೌಕರರಿಗೆ ಸಾಮಾನ್ಯ ಪತ್ರ ತಯಾರಿಸಿ (Draft General Letter for Employee)"
                                >
                                  <FileText className="w-3 h-3 text-sky-700" />
                                  <span>ಪತ್ರ</span>
                                </button>
                              )}

                              <button
                                id={`btn-view-emp-${emp.id}`}
                                onClick={() => setSelectedEmployeeForDossier(emp)}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                title="View Employee Dossier & Assignments"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                id={`btn-edit-emp-${emp.id}`}
                                onClick={() => onEditEmployee(emp)}
                                className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 rounded-lg transition-colors font-medium flex items-center gap-1"
                                title="Edit / Update Employee Data"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="text-[11px] hidden sm:inline">Edit</span>
                              </button>

                              <button
                                id={`btn-delete-emp-${emp.id}`}
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to remove employee record "${emp.fullName}" (${emp.employeeCode})?`)) {
                                    await onDeleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Archive / Remove Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Employee Service Dossier & Assigned Dockets */}
      {selectedEmployeeForDossier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Civil Service Officer Dossier
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {selectedEmployeeForDossier.employeeCode} • {selectedEmployeeForDossier.section}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeForDossier(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {selectedEmployeeForDossier.fullName}
                  </h4>
                  <div className="text-stone-700 font-medium mt-0.5">
                    {selectedEmployeeForDossier.designation}
                  </div>
                  <div className="text-stone-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedEmployeeForDossier.officeLocation}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(selectedEmployeeForDossier.status)}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                  <span className="text-amber-800 font-semibold block text-[10px] uppercase tracking-wider">KGID Number</span>
                  <span className="font-mono font-bold text-amber-950 text-xs">
                    {selectedEmployeeForDossier.kgidNumber || 'Not Registered'}
                  </span>
                </div>
                <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 font-semibold block text-[10px] uppercase tracking-wider">ಮೂಲ ವೇತನ (Basic Pay)</span>
                  <span className="font-mono font-bold text-emerald-950 text-xs">
                    ₹{(selectedEmployeeForDossier.basicPay || 37900).toLocaleString('en-IN')}/-
                  </span>
                </div>
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block text-[10px] uppercase tracking-wider">Pay Scale</span>
                  <span className="font-mono text-stone-800 font-semibold truncate block">
                    {selectedEmployeeForDossier.payScale || '37900-70850'}
                  </span>
                </div>
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block">Cadre Role</span>
                  <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.role}</span>
                </div>
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block">Employment Type</span>
                  <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.employmentType}</span>
                </div>
                {selectedEmployeeForDossier.placeOfWork && (
                  <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 sm:col-span-2">
                    <span className="text-amber-800 font-semibold block text-[10px] uppercase tracking-wider">Place of Work (ಶಾಲಾ ಸ್ಥಳ / ನಿಯೋಜನೆ)</span>
                    <span className="font-semibold text-stone-900">{selectedEmployeeForDossier.placeOfWork}</span>
                  </div>
                )}
                {selectedEmployeeForDossier.gender && (
                  <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 block">Gender (ಲಿಂಗ)</span>
                    <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.gender}</span>
                  </div>
                )}
                <div className="bg-sky-50/80 p-2.5 rounded-lg border border-sky-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-900 font-semibold block text-[10px] uppercase tracking-wider">
                      DOB & Age (ಜನ್ಮ ದಿನಾಂಕ)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const emp = selectedEmployeeForDossier;
                        setSelectedEmployeeForDossier(null);
                        onEditEmployee(emp);
                      }}
                      className="text-[10px] text-sky-800 hover:text-sky-950 font-bold font-kannada underline cursor-pointer"
                      title="ಜನ್ಮ ದಿನಾಂಕ / ಸೇವಾ ದಿನಾಂಕ ತಿದ್ದುಪಡಿ ಮಾಡಿ"
                    >
                      ✏️ ತಿದ್ದುಪಡಿ
                    </button>
                  </div>
                  <div className="font-semibold text-stone-900 font-mono mt-0.5">
                    {selectedEmployeeForDossier.dob ? (
                      <span>
                        {selectedEmployeeForDossier.dob}
                        {selectedEmployeeForDossier.age ? ` (${selectedEmployeeForDossier.age} ವರ್ಷ)` : ''}
                      </span>
                    ) : (
                      <span className="text-stone-400 italic">ನಮೂದಿಸಿಲ್ಲ (Click Edit to set DOB)</span>
                    )}
                  </div>
                </div>
                {selectedEmployeeForDossier.ddoCode && (
                  <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 block">DDO Code (ಡಿಡಿಒ ಕೋಡ್)</span>
                    <span className="font-mono font-semibold text-stone-800">{selectedEmployeeForDossier.ddoCode}</span>
                  </div>
                )}
                {selectedEmployeeForDossier.parentName && (
                  <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 block">Parent Name (ಪೋಷಕರ ಹೆಸರು)</span>
                    <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.parentName}</span>
                  </div>
                )}
                {selectedEmployeeForDossier.epicNo && (
                  <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 block">EPIC No (ಮತದಾರರ ಗುರುತು)</span>
                    <span className="font-mono font-semibold text-stone-800">{selectedEmployeeForDossier.epicNo}</span>
                  </div>
                )}
                {selectedEmployeeForDossier.hometown && (
                  <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 block">Hometown (ಸ್ವಂತ ಊರು)</span>
                    <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.hometown}</span>
                  </div>
                )}
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block">Official Email</span>
                  <span className="font-semibold text-stone-800 truncate block">{selectedEmployeeForDossier.email}</span>
                </div>
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block">Contact Phone</span>
                  <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.phone}</span>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/90 sm:col-span-2">
                  <span className="text-amber-800 font-semibold block text-[10px] uppercase tracking-wider">
                    Date of Joining & Service (ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ)
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-semibold text-stone-900 font-mono">{selectedEmployeeForDossier.joiningDate || 'N/A'}</span>
                    <YearsOfServiceBadge joiningDate={selectedEmployeeForDossier.joiningDate} size="md" showKannada={true} />
                  </div>
                </div>
                <div className="bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 block">Last Updated</span>
                  <span className="font-semibold text-stone-800">{selectedEmployeeForDossier.lastUpdated}</span>
                </div>
              </div>

              {/* Service Sanction History (Leave & Increments) */}
              {selectedEmployeeForDossier.serviceHistory && selectedEmployeeForDossier.serviceHistory.length > 0 && (
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>ಸೇವಾ ಇತಿಹಾಸ (Service & Pay Progression History)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                      {selectedEmployeeForDossier.serviceHistory.length} Sanctions
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedEmployeeForDossier.serviceHistory.map((rec) => (
                      <div key={rec.id} className="p-2 bg-white rounded-lg border border-stone-200 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{rec.sanctionType}</span>
                            <span className="text-[10px] font-normal text-stone-500">
                              (ದಿನಾಂಕ: {rec.effectiveDate})
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-600 mt-0.5">
                            ಆದೇಶ ಸಂ: {rec.orderNumber}
                          </div>
                          {(rec.totalDays || (rec as any).leaveDays) && (
                            <div className="text-[10px] text-amber-800 font-semibold">
                              ಮಂಜೂರಾದ ರಜೆ: {rec.totalDays || (rec as any).leaveDays} ದಿನಗಳು
                            </div>
                          )}
                        </div>
                        {Boolean((rec.revisedBasicPay || (rec as any).newBasicPay) && (rec.revisedBasicPay || (rec as any).newBasicPay) !== rec.previousBasicPay) && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-stone-400 line-through block">
                              ₹{rec.previousBasicPay?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 font-mono block">
                              ₹{(rec.revisedBasicPay || (rec as any).newBasicPay)?.toLocaleString('en-IN')}/-
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {selectedEmployeeForDossier.qualifications && (
                <div className="p-3 bg-stone-50/70 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 font-medium block mb-0.5">Qualifications & Degrees</span>
                  <p className="text-stone-800 font-medium">{selectedEmployeeForDossier.qualifications}</p>
                </div>
              )}

              {/* Service Remarks */}
              {selectedEmployeeForDossier.notes && (
                <div className="p-3 bg-stone-50/70 rounded-lg border border-stone-200/80">
                  <span className="text-stone-500 font-medium block mb-0.5">Dossier Notes</span>
                  <p className="text-stone-700">{selectedEmployeeForDossier.notes}</p>
                </div>
              )}

              {/* Active Department Correspondence & Dockets Handled */}
              {(() => {
                const { assignedLetters, custodianFiles } = getEmployeeAssignments(selectedEmployeeForDossier);
                return (
                  <div className="space-y-3 pt-2">
                    <h5 className="font-bold text-stone-900 flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <span>Assigned Departmental Workload</span>
                      <span className="text-stone-500 font-normal text-[11px]">
                        {assignedLetters.length} Letters • {custodianFiles.length} Master Dockets
                      </span>
                    </h5>

                    {assignedLetters.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-stone-600 block">
                          Assigned Correspondence ({assignedLetters.length})
                        </span>
                        {assignedLetters.map(l => (
                          <div 
                            key={l.id} 
                            onClick={() => {
                              if (onSelectLetter) {
                                onSelectLetter(l);
                                setSelectedEmployeeForDossier(null);
                              }
                            }}
                            className="p-2 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <span className="font-mono font-semibold text-[10px] text-stone-700 block">
                                {l.referenceNumber}
                              </span>
                              <span className="text-stone-800 font-medium line-clamp-1">
                                {l.subject}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {custodianFiles.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-stone-600 block">
                          Custodian of Master Dockets ({custodianFiles.length})
                        </span>
                        {custodianFiles.map(f => (
                          <div 
                            key={f.id} 
                            className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-mono font-semibold text-[10px] text-stone-700 block">
                                {f.fileNumber}
                              </span>
                              <span className="text-stone-800 font-medium line-clamp-1">
                                {f.subject}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 shrink-0">
                              {f.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {assignedLetters.length === 0 && custodianFiles.length === 0 && (
                      <p className="text-stone-400 italic text-center py-2">
                        No active dockets or letters currently assigned to this officer.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const emp = selectedEmployeeForDossier;
                    setSelectedEmployeeForDossier(null);
                    onEditEmployee(emp);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Official</span>
                </button>

                {onOpenServiceSanctions && (
                  <button
                    type="button"
                    onClick={() => {
                      const emp = selectedEmployeeForDossier;
                      setSelectedEmployeeForDossier(null);
                      onOpenServiceSanctions(emp);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-stone-950" />
                    <span>ರಜೆ / ವೇತನ ಬಡ್ತಿ ಪ್ರಕ್ರಿಯೆ</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployeeForDossier(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
