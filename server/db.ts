import fs from 'fs';
import path from 'path';
import {
  DbGeneratedLetter,
  DbLetterTemplate,
  DbLetterVersion,
  LetterDashboardStatistics,
  DEFAULT_LETTER_TEMPLATES,
  DEFAULT_GENERATED_LETTERS,
} from './letterDb';

// Relational Tables Types
export interface DbEmployee {
  id: string; // Internal Employee ID (UUID/pk)
  kgidNumber: string; // Unique KGID Number
  employeeCode: string;
  fullName: string;
  parentName: string; // ತಂದೆ/ತಾಯಿ ಹೆಸರು
  designation: string; // ಹುದ್ದೆ
  cadreGroup: 'ಗ್ರೂಪ್-ಎ' | 'ಗ್ರೂಪ್-ಬಿ' | 'ಗ್ರೂಪ್-ಸಿ' | 'ಗ್ರೂಪ್-ಡಿ'; // ಹುದ್ದೆಯ ವರ್ಗ
  section: string;
  officeLocation: string; // ಕಚೇರಿ/ಇಲಾಖೆ / ಶಾಲೆ
  appointmentDate: string; // ನೇಮಕಾತಿ ದಿನಾಂಕ
  joiningDate: string; // ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ
  currentBasicPay: number; // ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ
  payLevel?: string; // Pay Level
  payScale: string; // ಪ್ರಸ್ತುತ ವೇತನ ಶ್ರೇಣಿ
  lastIncrementDate: string; // ಹಿಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ
  nextIncrementDate: string; // ಮುಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ
  earnedLeaveBalance: number; // ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು
  childCareLeaveQuota?: number; // ಶಿಶುಪಾಲನ ರಜೆ ಒಟ್ಟು ಕೋಟಾ (Default 180 days, editable)
  childCareLeaveAvailed: number; // ಶಿಶುಪಾಲನ ರಜೆ ತೆಗೆದುಕೊಂಡ ದಿನಗಳು
  isDdo?: boolean; // ಡಿಡಿಓ ಅಧಿಕಾರ ಹೊಂದಿರುವರೇ
  ddoCode: string;
  placeOfWork: string;
  hometown: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  employmentType: string;
  status: string;
  role: string;
  qualifications: string;
  otherServiceDetails: string;
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

export interface DbEmployeeServiceDetail {
  id: string;
  employeeId: string;
  kgidNumber: string;
  probationDeclaredDate?: string;
  departmentExamPassed?: string;
  regularizationDate?: string;
  seniorityNumber?: string;
  qualfyingServiceYears: number;
  specialPay?: number;
  remarks?: string;
  updatedAt: string;
}

export interface DbSalaryHistory {
  id: string;
  employeeId: string;
  kgidNumber: string;
  employeeName: string;
  date: string;
  orderType: string;
  orderNumber: string;
  oldBasicPay: number;
  increment: number;
  newBasicPay: number;
  effectiveDate: string;
  changedBy: string;
  changedRole: string;
  timestamp: string;
  remarks?: string;
}

export interface DbOrderType {
  id: string;
  nameKannada: string;
  nameEnglish: string;
  category: 'leave' | 'increment' | 'advancement';
  description: string;
  isActive: boolean;
  minServiceYears?: number;
}

export interface DbPayRule {
  id: string;
  orderTypeId: string;
  orderTypeName: string;
  qualifyingYears: number;
  incrementType: 'matrix_stage' | 'percentage' | 'fixed_amount' | 'promotional_scale';
  incrementValue: number; // 1 stage, 3 percent, etc.
  minBasicPay?: number;
  maxBasicPay?: number;
  effectiveDateRule: 'completion_date' | 'first_of_next_month' | 'order_date';
  governmentOrderRef: string;
  kcsrRuleRef?: string;
  remarks?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface DbMemorandumOrder {
  id: string;
  orderNumber: string; // e.g. ಜ್ಞಾಪನ ಸಂಖ್ಯೆ: BEO/BHD/MEMO/2026/10Y-402
  orderDate: string;
  orderTypeId: string;
  orderTypeName: string;
  kgidNumber: string;
  employeeId: string;
  employeeName: string;
  parentName: string;
  designation: string;
  cadreGroup: string;
  officeName: string;
  officeDepartment: string;
  officeAddress: string;
  oldBasicPay: number;
  incrementAmount: number;
  newBasicPay: number;
  payScale: string;
  effectiveDate: string;
  ruleReference: string;
  subject: string;
  preamble: string;
  orderText: string;
  officialRemarks?: string;
  leaveDetails?: {
    leaveType: string;
    leaveFrom: string;
    leaveTo: string;
    totalDays: number;
    reason?: string;
    balanceBefore?: number;
    balanceAfter?: number;
  };
  signatoryName: string;
  signatoryDesignation: string;
  copiesForwardedTo: string[];
  status: 'Approved' | 'Draft' | 'Cancelled';
  createdBy: string;
  createdRole: string;
  createdAt: string;
  fileId?: string;
}

export interface DbOrderFile {
  id: string;
  fileId: string;
  orderNumber: string;
  kgidNumber: string;
  employeeName: string;
  orderType: string;
  orderDate: string;
  effectiveDate: string;
  oldBasicPay: number;
  newBasicPay: number;
  createdBy: string;
  createdDate: string;
  generatedDocumentHtml: string;
  generatedDocumentText: string;
  fileSize: string;
  remarks?: string;
}

export interface DbUser {
  id: string;
  username: string;
  displayName: string;
  designation: string;
  role: 'Admin' | 'Data Entry Operator' | 'Viewer';
  email: string;
  lastLogin?: string;
}

export interface DbAuditLog {
  id: string;
  timestamp: string;
  action: 'SALARY_CHANGE' | 'MEMORANDUM_GENERATED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_CREATED' | 'PAY_RULE_EDITED' | 'ORDER_DELETED' | 'BACKUP_RESTORED' | 'LOGIN' | 'ADD_SCHOOL' | 'UPDATE_SCHOOL' | 'DELETE_SCHOOL';
  kgidNumber?: string;
  employeeName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  role: string;
  details: string;
  orderNumber?: string;
}

export interface DbOfficeConfig {
  id: string;
  governmentName: string;
  departmentName: string;
  officeName: string;
  officeAddress: string;
  officerName: string;
  officerDesignation: string;
  district: string;
  pincode: string;
  email: string;
  phone: string;
  ddoCode?: string; // ಡಿಡಿಓ ಕೋಡ್
  ddoOfficerName?: string; // ಡಿಡಿಓ ಹೆಸರು
  ddoDesignation?: string; // ಡಿಡಿಓ ಪದನಾಮ
  ddoKgidNumber?: string; // ಡಿಡಿಓ ಕೆಜಿಐಡಿ
  ddoHrmsCode?: string; // ಡಿಡಿಓ HRMS ಕೋಡ್
  ddoEmployeeId?: string; // ನೌಕರರ ಐಡಿ
  ddoMobile?: string;
  ddoEmail?: string;
  ddoOfficeName?: string;
}

export interface DbSchoolInstitution {
  id: string;
  schoolCode: string;
  schoolName: string;
  udiseCode: string;
  institutionName: string; // ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ / ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು
  societyRegNumber: string; // ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ ಮತ್ತು ದಿನಾಂಕ
  grantStatus: 'Aided' | 'Unaided' | 'Proposed for Grant' | 'Partially Aided'; // ಅನುದಾನ ಸ್ಥಿತಿ
  grantOrderNumber?: string; // ಅನುದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂಖ್ಯೆ
  grantOrderDate?: string; // ಅನುದಾನ ಆದೇಶ ದಿನಾಂಕ
  schoolPhone: string; // ಶಾಲಾ ಕಚೇರಿ ದೂರವಾಣಿ
  hmName: string; // ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು
  hmPhone: string; // ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
  secretaryName: string; // ಸಂಸ್ಥೆಯ ಅಧ್ಯಕ್ಷರು / ಕಾರ್ಯದರ್ಶಿ ಹೆಸರು
  secretaryPhone: string; // ಕಾರ್ಯದರ್ಶಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
  email: string;
  address: string;
  locationCluster: string; // ಕ್ಲಸ್ಟರ್
  medium: 'Kannada' | 'English' | 'Kannada & English';
  schoolCategory: 'Primary (1-5)' | 'Higher Primary (1-8)' | 'High School (8-10)' | 'Composite (1-10)';
  studentCount: number;
  aidedTeachersCount: number;
  unaidedTeachersCount: number;
  recognitionValidUpto: string; // ಮಾನ್ಯತೆ ಅವಧಿ
  recognitionStatus: 'Valid' | 'Renewal Due' | 'Expired';
  fireSafetyNocValidUpto?: string;
  buildingSafetyValidUpto?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  notes?: string;
  lastUpdated?: string;
}

// Master Database Schema Container
export interface DatabaseSchema {
  employees: DbEmployee[];
  employee_service_details: DbEmployeeServiceDetail[];
  salary_history: DbSalaryHistory[];
  orders: DbMemorandumOrder[];
  order_files: DbOrderFile[];
  order_types: DbOrderType[];
  pay_rules: DbPayRule[];
  users: DbUser[];
  audit_logs: DbAuditLog[];
  offices: DbOfficeConfig[];
  generated_letters: DbGeneratedLetter[];
  letter_templates: DbLetterTemplate[];
  schools: DbSchoolInstitution[];
  pension_cases?: any[];
}

// Karnataka 7th Pay Commission Master Pay Scale Matrix Steps
export const KARNATAKA_MASTER_PAY_STAGES = [
  17000, 17400, 17800, 18200, 18600, 19050, 19500, 19950, 20400, 20900,
  21400, 21900, 22400, 22950, 23500, 24050, 24600, 25200, 25800, 26400,
  27000, 27650, 28300, 28950, 29600, 30350, 31100, 31850, 32600, 33450,
  34300, 35150, 36000, 36950, 37900, 38850, 39800, 40900, 42000, 43100,
  44200, 45300, 46400, 47650, 48900, 50150, 51400, 52650, 53900, 55350,
  56800, 58250, 59700, 61150, 62600, 64250, 65900, 67550, 69200, 70850,
  72750, 74650, 76550, 78450, 80350, 82450, 84550, 86650, 88750, 90850,
  93250, 95650, 98050, 100450, 102850, 105550, 108250, 110950, 113650, 116350,
  119350, 122350, 125350, 128350, 131350, 134650, 137950, 141250, 144550, 147850, 150500
];

// Helper: Calculate Next Stage in Pay Matrix
export function getNextPayStage(currentPay: number, stagesCount: number = 1): number {
  const sorted = [...KARNATAKA_MASTER_PAY_STAGES].sort((a, b) => a - b);
  let currentIndex = sorted.findIndex(p => p >= currentPay);
  if (currentIndex === -1) {
    // Above maximum or not found
    return Math.round(currentPay * Math.pow(1.03, stagesCount));
  }
  let targetIndex = Math.min(sorted.length - 1, currentIndex + stagesCount);
  if (sorted[currentIndex] === currentPay && stagesCount > 0) {
    targetIndex = Math.min(sorted.length - 1, currentIndex + stagesCount);
  }
  return sorted[targetIndex] || currentPay;
}

// Generate official Karnataka Education Department Letter / Order Number adhering to:
// "ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/_____/___/2026-27" and "ಸಂ: ಆ2/RTE/_______/___/2026-27"
// Clean single "ಸಂ:" prefix helper to strictly avoid double "ಸಂ: ಸಂ:"
export function formatSingleSamNumber(str?: string): string {
  if (!str) return '';
  const cleaned = str.replace(/^(ಸಂ\s*:\s*)+/gi, '').trim();
  return `ಸಂ: ${cleaned}`;
}

// e.g. for 10-year time-bound: "ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/10.ವ.ಕಾ.ಮಿ.ವೇ.ಬಡ್ತಿ/104/2026-27"
export function formatOfficialLetterNumber(options: {
  categoryOrType?: string;
  isRte?: boolean;
  sequenceNum?: number | string;
  academicYear?: string;
  customRawNumber?: string;
  fileNumber?: string | number;
}): string {
  const custom = (options.customRawNumber || '').trim();
  const fileNum = options.fileNumber ? String(options.fileNumber).trim() : '';

  // If user provided custom number that is already a full official pattern
  if (custom && (custom.startsWith('ಸಂ:') || custom.startsWith('ಆ2/'))) {
    return formatSingleSamNumber(custom);
  }

  const year = options.academicYear || '2026-27';
  // Use fileNumber or custom number (e.g. 57) if provided, otherwise sequenceNum or random fallback
  const seq = fileNum || (custom && /^[0-9A-Za-z\-_/]+$/.test(custom) ? custom : (options.sequenceNum || Math.floor(100 + Math.random() * 900)));
  const text = (options.categoryOrType || '').trim();

  // Check if RTE
  const isRte = options.isRte || /rte|ಆರ್\.?ಟಿ\.?ಇ/i.test(text) || /rte|ಆರ್\.?ಟಿ\.?ಇ/i.test(custom);
  if (isRte) {
    let subCategory = 'ಪ್ರವೇಶ';
    if (/ಶುಲ್ಕ|ಮರುಪಾವತಿ|reimbursement|fee/i.test(text) || /ಶುಲ್ಕ|ಮರುಪಾವತಿ/i.test(custom)) {
      subCategory = 'ಶುಲ್ಕ.ಮರುಪಾವತಿ';
    } else if (/ಪರಿಶೀಲನೆ|verification/i.test(text)) {
      subCategory = 'ಪರಿಶೀಲನೆ';
    } else if (/ಅನುಮೋದನೆ|approval/i.test(text)) {
      subCategory = 'ಅನುಮೋದನೆ';
    } else if (/ಸಾಮಾನ್ಯ|general/i.test(text)) {
      subCategory = 'ಸಾಮಾನ್ಯ';
    }
    return `ಸಂ: ಆ2/RTE/${subCategory}/${seq}/${year}`;
  }

  // Primary Education / Service Sanctions / General: "ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/_____/___/2026-27"
  let subCategory = 'ಇತರೆ';
  if (/10.*ವರ್ಷ|10.*ವ.*ಕಾ.*ಮಿ|10.*years?/i.test(text) || /10Y/i.test(custom) || /10\.ವ/i.test(custom)) {
    subCategory = '10.ವ.ಕಾ.ಮಿ';
  } else if (/15.*ವರ್ಷ|15.*ವ.*ಕಾ.*ಮಿ|15.*years?/i.test(text) || /15Y/i.test(custom) || /15\.ವ/i.test(custom)) {
    subCategory = '15.ವ.ಕಾ.ಮಿ';
  } else if (/20.*ವರ್ಷ|20.*ವ.*ಕಾ.*ಮಿ|20.*years?/i.test(text) || /20Y/i.test(custom) || /20\.ವ/i.test(custom)) {
    subCategory = '20.ವ.ಕಾ.ಮಿ';
  } else if (/25.*ವರ್ಷ|25.*ವ.*ಕಾ.*ಮಿ|25.*years?/i.test(text) || /25Y/i.test(custom) || /25\.ವ/i.test(custom)) {
    subCategory = '25.ವ.ಕಾ.ಮಿ';
  } else if (/30.*ವರ್ಷ|30.*ವ.*ಕಾ.*ಮಿ|30.*years?/i.test(text) || /30Y/i.test(custom) || /30\.ವ/i.test(custom)) {
    subCategory = '30.ವ.ಕಾ.ಮಿ';
  } else if (/ವಾರ್ಷಿಕ|annual.*increment/i.test(text) || /AI/i.test(custom)) {
    subCategory = 'ವಾ.ವೇ.ಬ';
  } else if (/ಗಳಿಕೆ|earned.*leave/i.test(text) || /EL/i.test(custom) || /ಗ\.ರ/i.test(custom)) {
    subCategory = 'ಗ.ರಜೆ.ಮಂ';
  } else if (/ಶಿಶುಪಾಲನ|child.*care/i.test(text) || /CCL/i.test(custom)) {
    subCategory = 'ಶಿ.ಪಾ.ರ.ಮಂ';
  } else if (/ಪಿತೃತ್ವ|paternity/i.test(text) || /PL/i.test(custom) || /ಪಿ\.ರ/i.test(custom)) {
    subCategory = 'ಪಿ.ರಜೆ.ಮಂ';
  } else if (/ಅರ್ಧ.*ವೇತನ|half.*pay/i.test(text)) {
    subCategory = 'ಅ.ವೇ.ರ.ಮಂ';
  } else if (/ಮಾಹಿತಿ.*ಹಕ್ಕು|rti/i.test(text) || /RTI/i.test(custom)) {
    subCategory = 'ಮಾ.ಹ.ಪ';
  } else if (/ಕಚೇರಿ.*ಆದೇಶ|ಕಛೇರಿ.*ಆದೇಶ|office.*order/i.test(text) || /ADMIN/i.test(custom)) {
    subCategory = 'ಕ.ಆ';
  } else if (/ಸಾಮಾನ್ಯ/i.test(text) || /ಸಾ\.ಪ/i.test(custom)) {
    subCategory = 'ಸಾ.ಪ';
  } else if (/ಸುತ್ತೋಲೆ|circular/i.test(text) || /CIR/i.test(custom)) {
    subCategory = 'ಸುತ್ತೋಲೆ';
  } else if (/ಪ್ರಮಾಣ.*ಪತ್ರ|certificate|noc/i.test(text)) {
    subCategory = 'ಪ್ರಮಾಣ.ಪತ್ರ';
  }

  return `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/${subCategory}/${seq}/${year}`;
}

// Calculate Service Years between two dates
export function calculateServiceYears(fromDateStr: string, toDateStr: string = new Date().toISOString().split('T')[0]): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} {
  try {
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return { years: 0, months: 0, days: 0, totalDays: 0 };
    }
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), totalDays };
  } catch {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }
}

// Default Seed Data
const DEFAULT_OFFICE: DbOfficeConfig = {
  id: 'off-bhd-1',
  governmentName: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
  departmentName: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ',
  officeName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
  officeAddress: 'ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301',
  officerName: 'ಹೆಚ್. ರವಿಕುಮಾರ್',
  officerDesignation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿ (DDO)',
  district: 'ಶಿವಮೊಗ್ಗ',
  pincode: '577301',
  email: 'beobhadravathi@karnataka.gov.in',
  phone: '08282-268241',
  ddoCode: '14041ED001',
  ddoOfficerName: 'ಹೆಚ್. ರವಿಕುಮಾರ್',
  ddoDesignation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿ (DDO)',
  ddoKgidNumber: '108294',
  ddoHrmsCode: 'BHD-BEO-001',
  ddoMobile: '+91 94480 12345',
  ddoEmail: 'beo.bhadravathi@karnataka.gov.in',
  ddoOfficeName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
};

const DEFAULT_ORDER_TYPES: DbOrderType[] = [
  {
    id: 'ot-1',
    nameKannada: 'ಗಳಿಕೆ ರಜೆ',
    nameEnglish: 'Earned Leave Sanction / Surrender',
    category: 'leave',
    description: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 112 / 118 ರ ಅನ್ವಯ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಅಥವಾ ನಗದೀಕರಣ ಜ್ಞಾಪನ',
    isActive: true,
  },
  {
    id: 'ot-2',
    nameKannada: 'ಶಿಶುಪಾಲನ ರಜೆ',
    nameEnglish: 'Child Care Leave (CCL)',
    category: 'leave',
    description: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಎಸ್ 2021 ರನ್ವಯ ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
  },
  {
    id: 'ot-3',
    nameKannada: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ',
    nameEnglish: '10-Year Time Bound Scale (TBS)',
    category: 'increment',
    description: 'ಒಂದೇ ಕೇಡರ್‌ನಲ್ಲಿ 10 ವರ್ಷಗಳ ನಿರಂತರ ಹಾಗೂ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 10,
  },
  {
    id: 'ot-4',
    nameKannada: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ',
    nameEnglish: '15-Year Automatic Pay Advancement Scheme (AAS)',
    category: 'advancement',
    description: '15 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆಗಾಗಿ ಸ್ವಯಂಚಾಲಿತ ವಿಶೇಷ ವೇತನ ಬಡ್ತಿ / ಉನ್ನತ ಶ್ರೇಣಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 15,
  },
  {
    id: 'ot-5',
    nameKannada: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    nameEnglish: '20-Year Additional Increment',
    category: 'increment',
    description: '20 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆ ಸಲ್ಲಿಸಿದ ನೌಕರರಿಗೆ ಹೆಚ್ಚುವರಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 20,
  },
  {
    id: 'ot-6',
    nameKannada: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    nameEnglish: '25-Year Additional Increment',
    category: 'increment',
    description: '25 ವರ್ಷಗಳ ಸುದೀರ್ಘ ಹಾಗೂ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ನೌಕರರಿಗೆ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 25,
  },
  {
    id: 'ot-7',
    nameKannada: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    nameEnglish: '30-Year Additional Increment',
    category: 'increment',
    description: '30 ವರ್ಷಗಳ ನಿಷ್ಕಳಂಕ ಸೇವೆ ಸಲ್ಲಿಸಿದ ನೌಕರರಿಗೆ ನಿವೃತ್ತಿ ಪೂರ್ವ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 30,
  },
  {
    id: 'ot-stagnation',
    nameKannada: 'ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿ',
    nameEnglish: 'Stagnation Increment / Pay Sanction',
    category: 'increment',
    description: 'ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯಲ್ಲಿ 2 ವರ್ಷಗಳ ನಿರಂತರ ಹಾಗೂ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ನೌಕರರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 51A ರಂತೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ / ಭರ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
    minServiceYears: 2,
  },
  {
    id: 'ot-el-encashment',
    nameKannada: 'ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ',
    nameEnglish: 'Earned Leave Encashment (Surrender)',
    category: 'leave',
    description: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 118 ರನ್ವಯ 15 ಅಥವಾ 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ (ನಗದೀಕರಣ) ಮತ್ತು ಭತ್ಯೆ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
  },
  {
    id: 'ot-paternity-leave',
    nameKannada: 'ಪಿತೃತ್ವ ರಜೆ',
    nameEnglish: 'Paternity Leave',
    category: 'leave',
    description: 'ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಮಗುವಿನ ಜನನದ ಸಂದರ್ಭದಲ್ಲಿ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-A ರನ್ವಯ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    isActive: true,
  },
];

const DEFAULT_PAY_RULES: DbPayRule[] = [
  {
    id: 'pr-10y',
    orderTypeId: 'ot-3',
    orderTypeName: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ',
    qualifyingYears: 10,
    incrementType: 'matrix_stage',
    incrementValue: 1, // 1 Stage in Pay Matrix
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'completion_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018 ಮತ್ತು ಆಇ 26 ಎಸ್ಆರ್ಪಿ 2024',
    kcsrRuleRef: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ಮತ್ತು ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ನಿಯಮಾವಳಿ 1983',
    remarks: '10 ವರ್ಷಗಳ ನಿರಂತರ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ದಿನಾಂಕದಿಂದ ವೇತನ ಶ್ರೇಣಿಯ ಮುಂದಿನ ಒಂದು ಹಂತದ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗುತ್ತದೆ.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-15y',
    orderTypeId: 'ot-4',
    orderTypeName: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ',
    qualifyingYears: 15,
    incrementType: 'matrix_stage',
    incrementValue: 1,
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'completion_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018',
    kcsrRuleRef: 'ಸ್ವಯಂ ಚಾಲಿತ ಬಡ್ತಿ ಯೋಜನೆ (Automatic Advancement Scheme)',
    remarks: '15 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆಗೆ ಮಂಜೂರಾಗುವ ಒಂದು ಹಂತದ ವಿಶೇಷ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-20y',
    orderTypeId: 'ot-5',
    orderTypeName: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    qualifyingYears: 20,
    incrementType: 'matrix_stage',
    incrementValue: 1,
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'completion_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018',
    kcsrRuleRef: 'ಕೆಸಿಎಸ್ಆರ್ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ ನಿಯಮಗಳು',
    remarks: '20 ವರ್ಷಗಳ ಸೇವೆಗೆ ಹೆಚ್ಚುವರಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-25y',
    orderTypeId: 'ot-6',
    orderTypeName: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    qualifyingYears: 25,
    incrementType: 'matrix_stage',
    incrementValue: 1,
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'completion_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018',
    kcsrRuleRef: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿಗಳು',
    remarks: '25 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದಾಗ ನೀಡುವ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-30y',
    orderTypeId: 'ot-7',
    orderTypeName: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    qualifyingYears: 30,
    incrementType: 'matrix_stage',
    incrementValue: 1,
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'completion_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018',
    kcsrRuleRef: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿಗಳು',
    remarks: '30 ವರ್ಷಗಳ ಸುದೀರ್ಘ ಹಾಗೂ ತೃಪ್ತಿಕರ ಸೇವೆಗಾಗಿ ಅಂತಿಮ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-el',
    orderTypeId: 'ot-1',
    orderTypeName: 'ಗಳಿಕೆ ರಜೆ',
    qualifyingYears: 0,
    incrementType: 'fixed_amount',
    incrementValue: 0,
    effectiveDateRule: 'order_date',
    governmentOrderRef: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 112 ಹಾಗೂ 118 ಮತ್ತು ತಿದ್ದುಪಡಿ ನಿಯಮಗಳು',
    kcsrRuleRef: 'KCSR Rule 112 & 118',
    remarks: 'ಲಭ್ಯವಿರುವ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕಿನಲ್ಲಿ ಮಂಜೂರು ಮಾಡತಕ್ಕದ್ದು.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-ccl',
    orderTypeId: 'ot-2',
    orderTypeName: 'ಶಿಶುಪಾಲನ ರಜೆ',
    qualifyingYears: 0,
    incrementType: 'fixed_amount',
    incrementValue: 0,
    effectiveDateRule: 'order_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಎಸ್ 2021, ದಿನಾಂಕ: 04-01-2021',
    kcsrRuleRef: 'Child Care Leave Guidelines',
    remarks: 'ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಒಟ್ಟು 180 ದಿನಗಳ ಮಿತಿಗೆ ಒಳಪಟ್ಟು (ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದಿಂದ ಪರಿಷ್ಕರಿಸಬಹುದಾದ) ಮಕ್ಕಳ ಪಾಲನೆಗಾಗಿ ಮಂಜೂರು ಮಾಡಬಹುದು.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-stagnation',
    orderTypeId: 'ot-stagnation',
    orderTypeName: 'ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿ',
    qualifyingYears: 2,
    incrementType: 'matrix_stage',
    incrementValue: 1,
    minBasicPay: 17000,
    maxBasicPay: 150500,
    effectiveDateRule: 'order_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018 / ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 51A ಹಾಗೂ ವೇತನ ಆಯೋಗ ನಿಯಮಾವಳಿಗಳು',
    kcsrRuleRef: 'KCSR Rule 51A & Stagnation Increment Scheme',
    remarks: 'ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯಲ್ಲಿದ್ದು 2 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಸಲ್ಲಿಸಿದವರಿಗೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ / ಭರ್ತಿ ಮಂಜೂರು ಮಾಡುವುದು.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-el-encashment',
    orderTypeId: 'ot-el-encashment',
    orderTypeName: 'ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ',
    qualifyingYears: 0,
    incrementType: 'fixed_amount',
    incrementValue: 0,
    effectiveDateRule: 'order_date',
    governmentOrderRef: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 118 ಮತ್ತು ತಿದ್ದುಪಡಿ ಸರ್ಕಾರಿ ಆದೇಶಗಳು',
    kcsrRuleRef: 'KCSR Rule 118 (Encashment / Surrender of Earned Leave)',
    remarks: 'ನೌಕರರ ಖಾತೆಯಲ್ಲಿ ಕನಿಷ್ಠ ರಜೆ ಉಳಿಸಿಕೊಂಡು 15 ಅಥವಾ 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ ಭತ್ಯೆ ಮಂಜೂರು ಮಾಡುವುದು.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
  {
    id: 'pr-paternity',
    orderTypeId: 'ot-paternity-leave',
    orderTypeName: 'ಪಿತೃತ್ವ ರಜೆ',
    qualifyingYears: 0,
    incrementType: 'fixed_amount',
    incrementValue: 0,
    effectiveDateRule: 'order_date',
    governmentOrderRef: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 05 ಎಸ್ಆರ್ಎಸ್ 2012, ದಿನಾಂಕ: 14-06-2012',
    kcsrRuleRef: 'KCSR Paternity Leave Rules (Rule 135-A)',
    remarks: 'ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಪತ್ನಿಯ ಪ್ರಸವ ಮತ್ತು ನವಜಾತ ಶಿಶುವಿನ ಪಾಲನೆಗಾಗಿ ಗರಿಷ್ಠ 15 ದಿನಗಳ ರಜೆ ಮಂಜೂರು ಮಾಡುವುದು.',
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: 'Admin (System)',
  },
];

export const DEFAULT_SCHOOLS: DbSchoolInstitution[] = [
  {
    id: 'sch-bhd-01',
    schoolCode: 'BHD-AID-01',
    schoolName: 'ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಪ್ರೌಢಶಾಲೆ',
    udiseCode: '29160205801',
    institutionName: 'ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ವಿದ್ಯಾ ಸಂಸ್ಥೆ (ರಿ)',
    societyRegNumber: 'SOC/SHM/124/1982-83, ದಿನಾಂಕ: 15-08-1982',
    grantStatus: 'Aided',
    grantOrderNumber: 'ಇಡಿ 144 ಎಸ್ಇಡಬ್ಲ್ಯೂ 1994',
    grantOrderDate: '1994-06-18',
    schoolPhone: '08282-265112',
    hmName: 'ಶ್ರೀಮತಿ ಪುಷ್ಪಲತಾ ಎಂ.',
    hmPhone: '9845123456',
    secretaryName: 'ಶ್ರೀ ಕೆ. ರಾಮಚಂದ್ರ',
    secretaryPhone: '9448123456',
    email: 'svhs.bhd@karnatakaedu.org',
    address: 'ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ - 577301',
    locationCluster: 'ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada & English',
    schoolCategory: 'High School (8-10)',
    studentCount: 420,
    aidedTeachersCount: 8,
    unaidedTeachersCount: 4,
    recognitionValidUpto: '2027-28',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '2026-12-31',
    buildingSafetyValidUpto: '2027-05-31',
    bankAccountNumber: '64019283741',
    bankIfscCode: 'SBIN0040122',
    notes: '100% ವೇತನಾನುದಾನಿತ ಪ್ರೌಢಶಾಲೆ. 8 ಶಿಕ್ಷಕರ ಹುದ್ದೆಗಳು ಅನುದಾನಕ್ಕೆ ಒಳಪಟ್ಟಿವೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-02',
    schoolCode: 'BHD-AID-02',
    schoolName: 'ಶಾರದಾ ವಿದ್ಯಾಮಂದಿರ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ',
    udiseCode: '29160204205',
    institutionName: 'ಶಾರದಾ ಎಜುಕೇಷನಲ್ ಟ್ರಸ್ಟ್ (ರಿ)',
    societyRegNumber: 'SOC/BDVT/88/1976-77, ದಿನಾಂಕ: 10-11-1976',
    grantStatus: 'Aided',
    grantOrderNumber: 'ಇಡಿ 92 ಪಿಇಟಿ 1989',
    grantOrderDate: '1989-11-24',
    schoolPhone: '08282-271223',
    hmName: 'ಶ್ರೀ ಜಿ. ನಾಗರಾಜ್',
    hmPhone: '9741234567',
    secretaryName: 'ಶ್ರೀ ಎಸ್. ಸುರೇಶ್ ಬಾಬು',
    secretaryPhone: '9449876543',
    email: 'sharadavm.bhd@gmail.com',
    address: 'ಪೇಪರ್ ಟೌನ್, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577302',
    locationCluster: 'ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada',
    schoolCategory: 'Higher Primary (1-8)',
    studentCount: 310,
    aidedTeachersCount: 6,
    unaidedTeachersCount: 2,
    recognitionValidUpto: '2026-27',
    recognitionStatus: 'Renewal Due',
    fireSafetyNocValidUpto: '2026-08-30',
    buildingSafetyValidUpto: '2026-11-15',
    bankAccountNumber: '520101002341',
    bankIfscCode: 'CNRB0000520',
    notes: 'ಮಾನ್ಯತೆ ನವೀಕರಣ ಪ್ರಸ್ತಾವನೆ ಕಚೇರಿಯಲ್ಲಿ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ. ನೋಡಲ್ ಪತ್ರ ಅಗತ್ಯವಿದೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-03',
    schoolCode: 'BHD-PROP-01',
    schoolName: 'ನ್ಯಾಷನಲ್ ಹೈಸ್ಕೂಲ್',
    udiseCode: '29160203112',
    institutionName: 'ರಾಷ್ಟ್ರೀಯ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆ (ರಿ)',
    societyRegNumber: 'SOC/BDVT/205/1998-99, ದಿನಾಂಕ: 04-03-1999',
    grantStatus: 'Proposed for Grant',
    grantOrderNumber: 'ಪ್ರಸ್ತಾವನೆ ಸಂ: ಬಿಇಒ/ಭದ್ರಾ/ಅನುದಾನ-ಪ್ರಸ್ತಾವನೆ/2025-26/18',
    grantOrderDate: '2025-10-15',
    schoolPhone: '08282-268994',
    hmName: 'ಶ್ರೀ ಎಚ್. ಎಸ್. ಮಂಜುನಾಥ್',
    hmPhone: '9901456789',
    secretaryName: 'ಶ್ರೀ ಎಂ. ಚಂದ್ರಶೇಖರ್',
    secretaryPhone: '9886543210',
    email: 'nationalhighschool.bhd@yahoo.com',
    address: 'ಕುದ್ರಿಗೆರೆ ರಸ್ತೆ, ಜನ್ನಾಪುರ, ಭದ್ರಾವತಿ - 577301',
    locationCluster: 'ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada & English',
    schoolCategory: 'High School (8-10)',
    studentCount: 285,
    aidedTeachersCount: 0,
    unaidedTeachersCount: 9,
    recognitionValidUpto: '2026-27',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '2027-03-31',
    buildingSafetyValidUpto: '2027-04-30',
    bankAccountNumber: '38192019482',
    bankIfscCode: 'BARB0BHADRA',
    notes: 'ವೇತನಾನುದಾನ ಮಂಜೂರಾತಿಗೆ ಆಯುಕ್ತಾಲಯಕ್ಕೆ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಲಾಗಿದೆ. ನವೀಕರಣ ಮತ್ತು ಕಛೇರಿ ಆದೇಶ ಬಾಕಿ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-04',
    schoolCode: 'BHD-AID-03',
    schoolName: 'ಶ್ರೀ ಬಸವೇಶ್ವರ ಸಂಯುಕ್ತ ಪದವಿಪೂರ್ವ ಕಾಲೇಜು (ಪ್ರೌಢಶಾಲಾ ವಿಭಾಗ)',
    udiseCode: '29160206103',
    institutionName: 'ವೀರಶೈವ ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸಂಸ್ಥೆ (ರಿ)',
    societyRegNumber: 'SOC/SHM/45/1965-66, ದಿನಾಂಕ: 22-06-1965',
    grantStatus: 'Aided',
    grantOrderNumber: 'ಇಡಿ 118 ಎಸ್ಇಡಬ್ಲ್ಯೂ 1982',
    grantOrderDate: '1982-08-10',
    schoolPhone: '08282-266401',
    hmName: 'ಶ್ರೀಮತಿ ವಿ. ಗೀತಾ',
    hmPhone: '9448765432',
    secretaryName: 'ಶ್ರೀ ಬಿ. ಶಿವಮೂರ್ತಿ',
    secretaryPhone: '9980123456',
    email: 'basaveshwara.highschool@karnatakaedu.org',
    address: 'ಗಾಂಧಿ ವೃತ್ತ, ಹೊಸನಗರ, ಭದ್ರಾವತಿ - 577301',
    locationCluster: 'ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada & English',
    schoolCategory: 'Composite (1-10)',
    studentCount: 650,
    aidedTeachersCount: 14,
    unaidedTeachersCount: 6,
    recognitionValidUpto: '2028-29',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '2027-10-31',
    buildingSafetyValidUpto: '2028-06-30',
    bankAccountNumber: '048210108920',
    bankIfscCode: 'CNRB0000482',
    notes: 'ವಲಯದ ಅತಿದೊಡ್ಡ ಅನುದಾನಿತ ಶಾಲೆ. 14 ಶಿಕ್ಷಕರ ವೇತನ ಪಾವತಿ ಕಛೇರಿಯಿಂದ ಮಂಜೂರಾಗುತ್ತಿದೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-05',
    schoolCode: 'BHD-PROP-02',
    schoolName: 'ಬಾಪೂಜಿ ವಿದ್ಯಾಸಂಸ್ಥೆ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಹಾಗೂ ಪ್ರೌಢಶಾಲೆ',
    udiseCode: '29160201402',
    institutionName: 'ಬಾಪೂಜಿ ಗ್ರಾಮೀಣ ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸಂಘ (ರಿ)',
    societyRegNumber: 'SOC/BDVT/310/2004-05, ದಿನಾಂಕ: 12-09-2004',
    grantStatus: 'Proposed for Grant',
    grantOrderNumber: 'ಪ್ರಸ್ತಾವನೆ: ಜಿಪಂ/ಶಿಕ್ಷಣ/ಅನುದಾನ-ಪಟ್ಟಿ/2026/09',
    grantOrderDate: '2026-01-20',
    schoolPhone: '08282-282110',
    hmName: 'ಶ್ರೀ ಕೆ. ಆನಂದ್',
    hmPhone: '9844234567',
    secretaryName: 'ಶ್ರೀ ಆರ್. ತಿಪ್ಪೇಸ್ವಾಮಿ',
    secretaryPhone: '9448345678',
    email: 'bapujischool.holehonnur@gmail.com',
    address: 'ಹೊಳೆಹೊನ್ನೂರು ಪಟ್ಟಣ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - 577227',
    locationCluster: 'ಹೊಳೆಹೊನ್ನೂರು ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada',
    schoolCategory: 'Composite (1-10)',
    studentCount: 380,
    aidedTeachersCount: 0,
    unaidedTeachersCount: 11,
    recognitionValidUpto: '2026-27',
    recognitionStatus: 'Renewal Due',
    fireSafetyNocValidUpto: '2026-09-30',
    buildingSafetyValidUpto: '2026-12-31',
    bankAccountNumber: '10928374650',
    bankIfscCode: 'SBIN0001092',
    notes: 'ಗ್ರಾಮೀಣ ವಲಯದ ಶಾಲೆ. ಅನುದಾನಕ್ಕೆ ಅರ್ಹತಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಮಾನ್ಯತೆ ನವೀಕರಣ ಆದೇಶ ಬಾಕಿ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-06',
    schoolCode: 'BHD-UNAID-01',
    schoolName: 'ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ ಇಂಗ್ಲಿಷ್ ಮೀಡಿಯಂ ಹೈಸ್ಕೂಲ್',
    udiseCode: '29160207804',
    institutionName: 'ವಿವೇಕಾನಂದ ಶಿಕ್ಷಣ ಟ್ರಸ್ಟ್ (ರಿ)',
    societyRegNumber: 'SOC/BDVT/155/1992-93, ದಿನಾಂಕ: 28-01-1993',
    grantStatus: 'Unaided',
    schoolPhone: '08282-273445',
    hmName: 'ಶ್ರೀ ಟಿ. ಪ್ರವೀಣ್ ಕುಮಾರ್',
    hmPhone: '9916345678',
    secretaryName: 'ಶ್ರೀ ಡಿ. ಕೃಷ್ಣಮೂರ್ತಿ',
    secretaryPhone: '9448567890',
    email: 'vivekananda.ems@rediffmail.com',
    address: 'ಹುತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ - 577301',
    locationCluster: 'ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'English',
    schoolCategory: 'High School (8-10)',
    studentCount: 290,
    aidedTeachersCount: 0,
    unaidedTeachersCount: 10,
    recognitionValidUpto: '2027-28',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '2027-02-28',
    buildingSafetyValidUpto: '2027-08-31',
    bankAccountNumber: '20491827364',
    bankIfscCode: 'SBIN0040204',
    notes: 'ಖಾಸಗಿ ಅನುದಾನ ರಹಿತ ಶಾಲೆ. ಆರ್.ಟಿ.ಇ. ನಿಯಮಾವಳಿಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-07',
    schoolCode: 'BHD-AID-04',
    schoolName: 'ಸೇಂಟ್ ಚಾರ್ಲ್ಸ್ ಪ್ರೌಢಶಾಲೆ',
    udiseCode: '29160202901',
    institutionName: 'ಸಿಸ್ಟರ್ಸ್ ಆಫ್ ಸೇಂಟ್ ಚಾರ್ಲ್ಸ್ ಎಜುಕೇಷನಲ್ ಸೊಸೈಟಿ',
    societyRegNumber: 'SOC/MYS/29/1958-59, ದಿನಾಂಕ: 18-04-1958',
    grantStatus: 'Aided',
    grantOrderNumber: 'ಇಡಿ 64 ಎಸ್ಇಡಬ್ಲ್ಯೂ 1974',
    grantOrderDate: '1974-07-22',
    schoolPhone: '08282-267104',
    hmName: 'ಸಿಸ್ಟರ್ ಮೇರಿ ಸ್ಟೆಲ್ಲಾ',
    hmPhone: '9449123890',
    secretaryName: 'ಸಿಸ್ಟರ್ ತೆರೇಸಾ',
    secretaryPhone: '9845890123',
    email: 'stcharles.bhd@gmail.com',
    address: 'ನ್ಯೂ ಟೌನ್, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301',
    locationCluster: 'ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada & English',
    schoolCategory: 'High School (8-10)',
    studentCount: 540,
    aidedTeachersCount: 11,
    unaidedTeachersCount: 5,
    recognitionValidUpto: '2028-29',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '2027-11-30',
    buildingSafetyValidUpto: '2028-05-31',
    bankAccountNumber: '09811029384',
    bankIfscCode: 'KKBK0008123',
    notes: 'ಅಲ್ಪಸಂಖ್ಯಾತ ಅನುದಾನಿತ ಶಾಲೆ. 11 ಹುದ್ದೆಗಳಿಗೆ ವೇತನಾನುದಾನ ನೀಡಲಾಗುತ್ತಿದೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sch-bhd-08',
    schoolCode: 'BHD-PROP-03',
    schoolName: 'ಪ್ರಗತಿ ಗ್ರಾಮೀಣ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಹಾಗೂ ಪ್ರೌಢಶಾಲೆ',
    udiseCode: '29160209503',
    institutionName: 'ಪ್ರಗತಿ ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಪ್ರಸಾರಕ ಸಮಿತಿ (ರಿ)',
    societyRegNumber: 'SOC/BDVT/412/2009-10, ದಿನಾಂಕ: 07-12-2009',
    grantStatus: 'Proposed for Grant',
    grantOrderNumber: 'ಪ್ರಸ್ತಾವನೆ ಸಂ: ಬಿಇಒ/ಅನುದಾನ-ವಿಶೇಷ/2026/41',
    grantOrderDate: '2026-02-14',
    schoolPhone: '08282-289221',
    hmName: 'ಶ್ರೀ ಬಿ. ಆರ್. ಶ್ರೀನಿವಾಸ್',
    hmPhone: '9740123987',
    secretaryName: 'ಶ್ರೀ ಸಿ. ಮಹಾಲಿಂಗಪ್ಪ',
    secretaryPhone: '9448234012',
    email: 'pragathischool.kudligere@gmail.com',
    address: 'ಕುದ್ರಿಗೆರೆ ಅಂಚೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - 577227',
    locationCluster: 'ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada',
    schoolCategory: 'Composite (1-10)',
    studentCount: 245,
    aidedTeachersCount: 0,
    unaidedTeachersCount: 8,
    recognitionValidUpto: '2026-27',
    recognitionStatus: 'Renewal Due',
    fireSafetyNocValidUpto: '2026-07-31',
    buildingSafetyValidUpto: '2026-10-31',
    bankAccountNumber: '49102938471',
    bankIfscCode: 'SBIN0008491',
    notes: 'ಹಿಂದುಳಿದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ಶಾಲೆ. ವೇತನಾನುದಾನ ಮಂಜೂರಾತಿ ಪ್ರಕ್ರಿಯೆ ಚಾಲನೆಯಲ್ಲಿದೆ.',
    lastUpdated: new Date().toISOString().split('T')[0],
  }
];

const DEFAULT_USERS: DbUser[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    displayName: 'ಆಡಳಿತ ಶಾಖೆ (Admin)',
    designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು / ಮುಖ್ಯಸ್ಥರು',
    role: 'Admin',
    email: 'admin.beobhd@karnataka.gov.in',
  },
  {
    id: 'usr-operator',
    username: 'operator',
    displayName: 'ಎಂ. ವಿ. ಶೇಖರ್ (Operator)',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಸೇವಾ ಶಾಖೆ)',
    role: 'Data Entry Operator',
    email: 'operator.beobhd@karnataka.gov.in',
  },
  {
    id: 'usr-viewer',
    username: 'viewer',
    displayName: 'ಆರ್. ಸುಮಿತ್ರಾ (Auditor)',
    designation: 'ಆಡಿಟ್ ಹಾಗೂ ತಪಾಸಣಾ ಅಧಿಕಾರಿ',
    role: 'Viewer',
    email: 'viewer.beobhd@karnataka.gov.in',
  },
];

export const DEFAULT_EMPLOYEES: DbEmployee[] = [
  // 1. ANANDA M C
  {
    id: 'emp-1515985',
    employeeCode: 'BHD-PST-1515985',
    kgidNumber: '1515985',
    fullName: 'ಆನಂದ ಎಂ. ಸಿ. (ANANDA M C)',
    parentName: 'ಚನ್ನಯ್ಯ ಎಂ.',
    designation: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು (Headmaster)',
    cadreGroup: 'ಗ್ರೂಪ್-ಬಿ',
    section: 'Administration & Services',
    officeLocation: 'KPS GHPS ANTHARAGANGE (29150109702)',
    appointmentDate: '1999-11-30',
    joiningDate: '1999-11-30',
    currentBasicPay: 74200,
    payScale: '43100-1100-46400-1250-53900-1450-62600-1650-70850-1850-80400',
    lastIncrementDate: '2025-01-01',
    nextIncrementDate: '2026-01-01',
    earnedLeaveBalance: 240,
    childCareLeaveQuota: 180,
    childCareLeaveAvailed: 0,
    ddoCode: '291501',
    placeOfWork: 'KPS GHPS ANTHARAGANGE',
    hometown: 'ಭದ್ರಾವತಿ',
    gender: 'Male',
    dob: '1974-05-15',
    email: 'ananda.mc@karnataka.gov.in',
    phone: '9845595268',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Faculty / Principal',
    qualifications: 'B.Sc., B.Ed.',
    otherServiceDetails: 'ಸೇವಾ ಪುಸ್ತಕ ಸಂಪುಟ 1 & 2 ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಪ್ರೊಬೇಷನರಿ ಅವಧಿ ತೃಪ್ತಿಕರವಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.',
    notes: 'Zone B, Primary, DISE: 29150109702',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
  // 2. ANANDAMURTHY U R
  {
    id: 'emp-4049343',
    employeeCode: 'BHD-GPT-4049343',
    kgidNumber: '4049343',
    fullName: 'ಆನಂದಮೂರ್ತಿ ಯು. ಆರ್. (ANANDAMURTHY U R)',
    parentName: 'ರಾಮಪ್ಪ ಯು.',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (ಗಣಿತ & ವಿಜ್ಞಾನ) - GPT',
    cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
    section: 'Administration & Services',
    officeLocation: 'GHPS BELLIGERE (29150105701)',
    appointmentDate: '2023-10-30',
    joiningDate: '2023-10-30',
    currentBasicPay: 44425,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    lastIncrementDate: '2024-07-01',
    nextIncrementDate: '2025-07-01',
    earnedLeaveBalance: 45,
    childCareLeaveQuota: 180,
    childCareLeaveAvailed: 0,
    ddoCode: '291501',
    placeOfWork: 'GHPS BELLIGERE',
    hometown: 'ಶಿವಮೊಗ್ಗ',
    gender: 'Male',
    dob: '1992-08-20',
    email: 'anandamurthy.ur@karnataka.gov.in',
    phone: '7353229576',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Faculty / Principal',
    qualifications: 'B.Sc. (PCM), B.Ed.',
    otherServiceDetails: 'ಪ್ರೊಬೇಷನರಿ ಅವಧಿ ಚಾಲ್ತಿಯಲ್ಲಿದೆ.',
    notes: 'Zone C, Primary, DISE: 29150105701',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
  // 3. ASHA V (Female - with 180 days CCL quota)
  {
    id: 'emp-2264980',
    employeeCode: 'BHD-PST-2264980',
    kgidNumber: '2264980',
    fullName: 'ಆಶಾ ವಿ. (ASHA V)',
    parentName: 'ವೆಂಕಟೇಶ್ವರ ರಾವ್',
    designation: 'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರು (PST)',
    cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
    section: 'Administration & Services',
    officeLocation: 'GLPS BELALAKATTE (29150109401)',
    appointmentDate: '2008-01-03',
    joiningDate: '2008-01-03',
    currentBasicPay: 55350,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    lastIncrementDate: '2025-01-01',
    nextIncrementDate: '2026-01-01',
    earnedLeaveBalance: 180,
    childCareLeaveQuota: 180,
    childCareLeaveAvailed: 30,
    ddoCode: '291501',
    placeOfWork: 'GLPS BELALAKATTE',
    hometown: 'ಭದ್ರಾವತಿ',
    gender: 'Female',
    dob: '1982-04-10',
    email: 'asha.v@karnataka.gov.in',
    phone: '9480432130',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Faculty / Principal',
    qualifications: 'PUC, D.Ed., B.A.',
    otherServiceDetails: '10 & 15 ವರ್ಷಗಳ ಕಾಲಮಿತಿ ಬಡ್ತಿ ಮಂಜೂರಾಗಿದೆ. 180 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜಾ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.',
    notes: 'Zone C, Primary, DISE: 29150109401',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
  // 4. CHANDRAKALA S (Female - with 180 days CCL quota)
  {
    id: 'emp-2018892',
    employeeCode: 'BHD-PST-2018892',
    kgidNumber: '2018892',
    fullName: 'ಚಂದ್ರಕಲಾ ಎಸ್. (CHANDRAKALA S)',
    parentName: 'ಶಿವಲಿಂಗಪ್ಪ',
    designation: 'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರು (PST)',
    cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
    section: 'Administration & Services',
    officeLocation: 'HPS KALLIHAL (29150110302)',
    appointmentDate: '2006-12-11',
    joiningDate: '2006-12-11',
    currentBasicPay: 56800,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    lastIncrementDate: '2025-07-01',
    nextIncrementDate: '2026-07-01',
    earnedLeaveBalance: 165,
    childCareLeaveQuota: 180,
    childCareLeaveAvailed: 45,
    ddoCode: '291501',
    placeOfWork: 'HPS KALLIHAL',
    hometown: 'ಭದ್ರಾವತಿ',
    gender: 'Female',
    dob: '1981-11-25',
    email: 'chandrakala.s@karnataka.gov.in',
    phone: '9481976020',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Faculty / Principal',
    qualifications: 'B.A., B.Ed.',
    otherServiceDetails: 'ಸೇವಾ ಪುಸ್ತಕ ಸುವ್ಯವಸ್ಥಿತವಾಗಿದೆ.',
    notes: 'Zone C, Primary, DISE: 29150110302',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
  // 5. SUNITHA M (Female Office Staff)
  {
    id: 'emp-off-2',
    employeeCode: 'BHD-OFF-002',
    kgidNumber: '240918',
    fullName: 'ಸುನಿತಾ ಎಂ. (Sunitha M)',
    parentName: 'ಮಲ್ಲಿಕಾರ್ಜುನಯ್ಯ',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA) - ಆಡಳಿತ',
    cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    appointmentDate: '2016-04-12',
    joiningDate: '2016-04-12',
    currentBasicPay: 43100,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    lastIncrementDate: '2025-07-01',
    nextIncrementDate: '2026-07-01',
    earnedLeaveBalance: 120,
    childCareLeaveQuota: 180,
    childCareLeaveAvailed: 15,
    ddoCode: '291501',
    placeOfWork: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    hometown: 'ಶಿವಮೊಗ್ಗ',
    gender: 'Female',
    dob: '1988-03-14',
    email: 'sunitha.m.fda@karnataka.gov.in',
    phone: '9845012345',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Administrative Officer',
    qualifications: 'B.Com., M.A.',
    otherServiceDetails: 'ಕಡತ ನಿರ್ವಹಣೆ, ಸೇವಾ ಪುಸ್ತಕ ಹಾಗೂ ಜ್ಞಾಪನಾ ಆದೇಶಗಳ ಕಡತ ನಿರ್ವಾಹಕಿ.',
    notes: 'Establishment & Service Register Desk',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
  // 6. RAVIKUMAR H (BEO Officer)
  {
    id: 'emp-off-1',
    employeeCode: 'BHD-OFF-001',
    kgidNumber: '108294',
    fullName: 'ಹೆಚ್. ರವಿಕುಮಾರ್ (H. Ravikumar)',
    parentName: 'ಹನುಮಂತರಾಯಪ್ಪ',
    designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO) & ಡಿಡಿಓ',
    cadreGroup: 'ಗ್ರೂಪ್-ಎ',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    appointmentDate: '2005-08-15',
    joiningDate: '2005-08-15',
    currentBasicPay: 82600,
    payScale: '67550-1650-70850-1850-80400-2050-90650-2300-104600',
    lastIncrementDate: '2025-01-01',
    nextIncrementDate: '2026-01-01',
    earnedLeaveBalance: 280,
    childCareLeaveQuota: 0,
    childCareLeaveAvailed: 0,
    isDdo: true,
    ddoCode: '14041ED001',
    placeOfWork: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
    hometown: 'ದಾವಣಗೆರೆ',
    gender: 'Male',
    dob: '1976-06-10',
    email: 'beo.bhadravathi@karnataka.gov.in',
    phone: '9448012345',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Faculty / Principal',
    qualifications: 'M.Sc., M.Ed., KES',
    otherServiceDetails: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ.',
    notes: 'Drawing & Disbursing Officer (DDO)',
    createdAt: '2024-01-01',
    lastUpdated: '2026-09-17',
  },
];

const DEFAULT_SALARY_HISTORY: DbSalaryHistory[] = [];

// In-Memory Database Store with Disk Persistence
class RelationalDatabase {
  private dbPath: string;
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir:', err);
      }
    }
    this.dbPath = path.join(dataDir, 'gov_memorandum_db.json');
    this.data = this.loadData();
    this.isInitialized = true;
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.employees)) {
          const existingOrderTypes: DbOrderType[] = parsed.order_types || [];
          for (const dot of DEFAULT_ORDER_TYPES) {
            if (!existingOrderTypes.some(ot => ot.id === dot.id || ot.nameKannada === dot.nameKannada)) {
              existingOrderTypes.push(dot);
            }
          }

          const existingPayRules: DbPayRule[] = parsed.pay_rules || [];
          for (const dpr of DEFAULT_PAY_RULES) {
            if (!existingPayRules.some(pr => pr.id === dpr.id || pr.orderTypeName === dpr.orderTypeName)) {
              existingPayRules.push(dpr);
            }
          }

          const existingTemplates: DbLetterTemplate[] = parsed.letter_templates || [];
          for (const dlt of DEFAULT_LETTER_TEMPLATES) {
            if (!existingTemplates.some(lt => lt.id === dlt.id)) {
              existingTemplates.push(dlt);
            }
          }

          const loadedSchools: DbSchoolInstitution[] = 
            parsed.schools && Array.isArray(parsed.schools) && parsed.schools.length > 0
              ? parsed.schools
              : DEFAULT_SCHOOLS;

          const loadedEmployees: DbEmployee[] = parsed.employees && Array.isArray(parsed.employees) && parsed.employees.length > 0
            ? parsed.employees
            : [...DEFAULT_EMPLOYEES];
          for (const de of DEFAULT_EMPLOYEES) {
            if (!loadedEmployees.some(e => e.kgidNumber === de.kgidNumber || e.id === de.id)) {
              loadedEmployees.push({ ...de });
            }
          }

          return {
            employees: loadedEmployees,
            employee_service_details: parsed.employee_service_details || [],
            salary_history: parsed.salary_history || [],
            orders: parsed.orders || [],
            order_files: parsed.order_files || [],
            order_types: existingOrderTypes,
            pay_rules: existingPayRules,
            users: parsed.users || DEFAULT_USERS,
            audit_logs: parsed.audit_logs || [],
            offices: parsed.offices || [DEFAULT_OFFICE],
            generated_letters: parsed.generated_letters || [],
            letter_templates: existingTemplates,
            schools: loadedSchools,
            pension_cases: parsed.pension_cases || [],
          };
        }
      }
    } catch (err) {
      console.error('Failed to read database file, initializing defaults:', err);
    }
    return this.createDefaultData();
  }

  private createDefaultData(): DatabaseSchema {
    const initData: DatabaseSchema = {
      employees: [...DEFAULT_EMPLOYEES],
      employee_service_details: [],
      salary_history: [],
      orders: [],
      order_files: [],
      order_types: DEFAULT_ORDER_TYPES,
      pay_rules: DEFAULT_PAY_RULES,
      users: DEFAULT_USERS,
      audit_logs: [
        {
          id: `aud-init-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: 'LOGIN',
          performedBy: 'System',
          role: 'Admin',
          details: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಜ್ಞಾಪನಾ ಆದೇಶ ತಂತ್ರಾಂಶ ಡೇಟಾಬೇಸ್ ಸಿದ್ಧಗೊಂಡಿದೆ.',
        }
      ],
      offices: [DEFAULT_OFFICE],
      generated_letters: [],
      letter_templates: DEFAULT_LETTER_TEMPLATES,
      schools: DEFAULT_SCHOOLS,
      pension_cases: [],
    };
    this.saveData(initData);
    return initData;
  }

  private saveData(dataToSave: DatabaseSchema = this.data): void {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.error('Failed to atomically write database file:', err);
    }
  }

  // AUDIT LOG HELPER
  public logAudit(
    action: DbAuditLog['action'],
    performedBy: string,
    role: string,
    details: string,
    extra?: { kgidNumber?: string; employeeName?: string; oldValue?: string; newValue?: string; orderNumber?: string }
  ): DbAuditLog {
    const entry: DbAuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      performedBy: performedBy || 'Operator',
      role: role || 'Data Entry Operator',
      details,
      ...extra,
    };
    this.data.audit_logs.unshift(entry);
    // Keep max 2000 audit records
    if (this.data.audit_logs.length > 2000) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 2000);
    }
    this.saveData();
    return entry;
  }

  // 1. EMPLOYEES & KGID LOOKUP
  public getAllEmployees(query?: string, section?: string, cadre?: string): DbEmployee[] {
    let result = [...this.data.employees];
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(e =>
        (e.kgidNumber && e.kgidNumber.toLowerCase().includes(q)) ||
        (e.fullName && e.fullName.toLowerCase().includes(q)) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.officeLocation && e.officeLocation.toLowerCase().includes(q))
      );
    }
    if (section && section !== 'All') {
      result = result.filter(e => e.section === section);
    }
    if (cadre && cadre !== 'All') {
      result = result.filter(e => e.cadreGroup === cadre);
    }
    return result;
  }

  public getEmployeeByKgid(kgid: string): DbEmployee | null {
    if (!kgid) return null;
    const clean = kgid.trim().toLowerCase();
    const cleanDigits = clean.replace(/[^0-9]/g, '');
    return this.data.employees.find(e =>
      (e.kgidNumber && e.kgidNumber.toLowerCase() === clean) ||
      (cleanDigits && e.kgidNumber && e.kgidNumber.replace(/[^0-9]/g, '') === cleanDigits)
    ) || null;
  }

  public getEmployeeById(id: string): DbEmployee | null {
    return this.data.employees.find(e => e.id === id) || null;
  }

  public saveEmployee(empData: Partial<DbEmployee>, performedBy: string, role: string): DbEmployee {
    if (!empData.kgidNumber || !empData.kgidNumber.trim()) {
      throw new Error('ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ (KGID Number) ಕಡ್ಡಾಯವಾಗಿದೆ.');
    }
    const cleanKgid = empData.kgidNumber.trim();
    const existing = this.getEmployeeByKgid(cleanKgid);
    if (existing) {
      throw new Error(`ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ "${cleanKgid}" ಈಗಾಗಲೇ ಶ್ರೀ/ಶ್ರೀಮತಿ ${existing.fullName} ಹೆಸರಿನಲ್ಲಿ ನೋಂದಣಿಯಾಗಿದೆ.`);
    }

    const now = new Date().toISOString().split('T')[0];
    const newEmp: DbEmployee = {
      id: `emp-bhd-${Date.now()}`,
      kgidNumber: cleanKgid,
      employeeCode: empData.employeeCode?.trim() || `BHD-EDN-${cleanKgid}`,
      fullName: empData.fullName?.trim() || `ನೌಕರರು (KGID: ${cleanKgid})`,
      parentName: empData.parentName?.trim() || '',
      designation: empData.designation?.trim() || 'ಸಹ ಶಿಕ್ಷಕರು',
      cadreGroup: empData.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ',
      section: empData.section || 'Administration & Services',
      officeLocation: empData.officeLocation?.trim() || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
      appointmentDate: empData.appointmentDate || now,
      joiningDate: empData.joiningDate || now,
      currentBasicPay: Number(empData.currentBasicPay) || 37900,
      payLevel: empData.payLevel || 'Level-9',
      payScale: empData.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
      lastIncrementDate: empData.lastIncrementDate || now,
      nextIncrementDate: empData.nextIncrementDate || '',
      earnedLeaveBalance: Number(empData.earnedLeaveBalance) >= 0 ? Number(empData.earnedLeaveBalance) : 120,
      childCareLeaveAvailed: Number(empData.childCareLeaveAvailed) >= 0 ? Number(empData.childCareLeaveAvailed) : 0,
      ddoCode: empData.ddoCode || '0402EDN101',
      placeOfWork: empData.placeOfWork || 'ಭದ್ರಾವತಿ',
      hometown: empData.hometown || '',
      gender: empData.gender || 'Male',
      dob: empData.dob || '',
      email: empData.email || `${cleanKgid.toLowerCase()}@karnataka.gov.in`,
      phone: empData.phone || '+91 94480 00000',
      employmentType: empData.employmentType || 'Permanent',
      status: empData.status || 'Active',
      role: empData.role || 'Faculty / Principal',
      qualifications: empData.qualifications || '',
      otherServiceDetails: empData.otherServiceDetails || '',
      notes: empData.notes || '',
      createdAt: now,
      lastUpdated: now,
    };

    this.data.employees.unshift(newEmp);
    this.saveData();

    this.logAudit('EMPLOYEE_CREATED', performedBy, role, `ನೂತನ ನೌಕರರ ದಾಖಲೆ ಸೇರಿಸಲಾಗಿದೆ: ${newEmp.fullName} (KGID: ${newEmp.kgidNumber})`, {
      kgidNumber: newEmp.kgidNumber,
      employeeName: newEmp.fullName,
      newValue: JSON.stringify(newEmp),
    });

    return newEmp;
  }

  public updateEmployee(id: string, empData: Partial<DbEmployee>, performedBy: string, role: string): DbEmployee {
    const index = this.data.employees.findIndex(e => e.id === id || e.kgidNumber === id);
    if (index === -1) {
      throw new Error('ನೌಕರರ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ (Employee not found).');
    }

    const existing = this.data.employees[index];
    // Check KGID collision if changed
    if (empData.kgidNumber && empData.kgidNumber.trim() !== existing.kgidNumber) {
      const collision = this.getEmployeeByKgid(empData.kgidNumber.trim());
      if (collision && collision.id !== existing.id) {
        throw new Error(`ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ "${empData.kgidNumber}" ಈಗಾಗಲೇ ಬೇರೆ ನೌಕರರಿಗೆ ಹಂಚಿಕೆಯಾಗಿದೆ.`);
      }
    }

    const now = new Date().toISOString().split('T')[0];
    const updated: DbEmployee = {
      ...existing,
      ...empData,
      id: existing.id,
      kgidNumber: empData.kgidNumber ? empData.kgidNumber.trim() : existing.kgidNumber,
      currentBasicPay: empData.currentBasicPay !== undefined ? Number(empData.currentBasicPay) : existing.currentBasicPay,
      earnedLeaveBalance: empData.earnedLeaveBalance !== undefined ? Number(empData.earnedLeaveBalance) : existing.earnedLeaveBalance,
      childCareLeaveAvailed: empData.childCareLeaveAvailed !== undefined ? Number(empData.childCareLeaveAvailed) : existing.childCareLeaveAvailed,
      lastUpdated: now,
    };

    this.data.employees[index] = updated;
    this.saveData();

    this.logAudit('EMPLOYEE_UPDATED', performedBy, role, `ನೌಕರರ ಮಾಹಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${updated.fullName} (KGID: ${updated.kgidNumber})`, {
      kgidNumber: updated.kgidNumber,
      employeeName: updated.fullName,
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(updated),
    });

    return updated;
  }

  public deleteEmployee(id: string, performedBy: string, role: string): DbEmployee {
    const index = this.data.employees.findIndex(e => e.id === id || e.kgidNumber === id);
    if (index === -1) {
      throw new Error('ನೌಕರರ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ.');
    }
    const deleted = this.data.employees.splice(index, 1)[0];
    this.saveData();

    this.logAudit('EMPLOYEE_UPDATED', performedBy, role, `ನೌಕರರ ದಾಖಲೆ ಅಳಿಸಲಾಗಿದೆ: ${deleted.fullName} (KGID: ${deleted.kgidNumber})`, {
      kgidNumber: deleted.kgidNumber,
      employeeName: deleted.fullName,
      oldValue: JSON.stringify(deleted),
    });

    return deleted;
  }

  public deleteBatchEmployees(ids: string[], performedBy: string, role: string): number {
    const idSet = new Set(ids);
    const beforeCount = this.data.employees.length;
    this.data.employees = this.data.employees.filter(e => !idSet.has(e.id) && !idSet.has(e.kgidNumber));
    const deletedCount = beforeCount - this.data.employees.length;
    this.saveData();

    this.logAudit('EMPLOYEE_UPDATED', performedBy, role, `${deletedCount} ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ಬ್ಯಾಚ್ ಮೂಲಕ ಅಳಿಸಲಾಗಿದೆ`, {
      oldValue: `Deleted ${deletedCount} records: ${ids.slice(0, 5).join(', ')}...`,
    });

    return deletedCount;
  }

  public clearAllEmployees(performedBy: string, role: string): number {
    const count = this.data.employees.length;
    this.data.employees = [];
    this.saveData();

    this.logAudit('EMPLOYEE_UPDATED', performedBy, role, `ಎಲ್ಲಾ (${count}) ನೌಕರರ ದಾಖಲೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ`, {
      oldValue: `Cleared all ${count} records`,
    });

    return count;
  }

  // 2. ORDER TYPES & CONFIGURABLE PAY RULES
  public getOrderTypes(): DbOrderType[] {
    return this.data.order_types;
  }

  public getPayRules(): DbPayRule[] {
    return this.data.pay_rules;
  }

  public getPayRuleForOrderType(orderTypeId: string): DbPayRule | null {
    return this.data.pay_rules.find(r => r.orderTypeId === orderTypeId) || null;
  }

  public savePayRule(ruleData: Partial<DbPayRule>, performedBy: string, role: string): DbPayRule {
    const now = new Date().toISOString().split('T')[0];
    const index = this.data.pay_rules.findIndex(r => r.id === ruleData.id || r.orderTypeId === ruleData.orderTypeId);
    let saved: DbPayRule;

    if (index >= 0) {
      const oldRule = this.data.pay_rules[index];
      saved = {
        ...oldRule,
        ...ruleData,
        id: oldRule.id,
        updatedAt: now,
        updatedBy: `${performedBy} (${role})`,
      };
      this.data.pay_rules[index] = saved;
      this.logAudit('PAY_RULE_EDITED', performedBy, role, `ವೇತನ ಬಡ್ತಿ ನಿಯಮ ನವೀಕರಿಸಲಾಗಿದೆ: ${saved.orderTypeName}`, {
        oldValue: JSON.stringify(oldRule),
        newValue: JSON.stringify(saved),
      });
    } else {
      saved = {
        id: ruleData.id || `pr-${Date.now()}`,
        orderTypeId: ruleData.orderTypeId || 'ot-3',
        orderTypeName: ruleData.orderTypeName || 'ವೇತನ ಬಡ್ತಿ ನಿಯಮ',
        qualifyingYears: Number(ruleData.qualifyingYears) || 10,
        incrementType: ruleData.incrementType || 'matrix_stage',
        incrementValue: Number(ruleData.incrementValue) || 1,
        minBasicPay: Number(ruleData.minBasicPay) || 17000,
        maxBasicPay: Number(ruleData.maxBasicPay) || 150500,
        effectiveDateRule: ruleData.effectiveDateRule || 'completion_date',
        governmentOrderRef: ruleData.governmentOrderRef || 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018',
        kcsrRuleRef: ruleData.kcsrRuleRef || '',
        remarks: ruleData.remarks || '',
        updatedAt: now,
        updatedBy: `${performedBy} (${role})`,
      };
      this.data.pay_rules.push(saved);
      this.logAudit('PAY_RULE_EDITED', performedBy, role, `ನೂತನ ವೇತನ ಬಡ್ತಿ ನಿಯಮ ಸೇರಿಸಲಾಗಿದೆ: ${saved.orderTypeName}`, {
        newValue: JSON.stringify(saved),
      });
    }

    this.saveData();
    return saved;
  }

  // 3. CALCULATION ENGINE (Configurable Rules)
  public calculateOrderDetails(params: {
    kgidNumber: string;
    orderTypeId: string;
    orderTypeName?: string;
    customEffectiveDate?: string;
    leaveFrom?: string;
    leaveTo?: string;
    leaveDaysRequested?: number;
    employeeData?: any;
  }): {
    eligible: boolean;
    reason: string;
    employee: DbEmployee;
    orderType: DbOrderType;
    payRule: DbPayRule | null;
    serviceInfo: {
      joiningDate: string;
      years: number;
      months: number;
      days: number;
      formattedService: string;
    };
    oldBasicPay: number;
    incrementAmount: number;
    newBasicPay: number;
    effectiveDate: string;
    leaveCalculation?: {
      leaveFrom: string;
      leaveTo: string;
      totalDays: number;
      currentBalance: number;
      balanceAfter: number;
    };
  } {
    let employee = this.getEmployeeByKgid(params.kgidNumber);
    if (!employee) {
      const empData = (params as any).employeeData || (params as any).employee;
      if (empData && (empData.fullName || empData.name)) {
        employee = {
          id: empData.id || `emp-${Date.now()}`,
          kgidNumber: params.kgidNumber,
          employeeCode: empData.employeeCode || `BHD-${params.kgidNumber}`,
          fullName: empData.fullName || empData.name || `ನೌಕರರು (${params.kgidNumber})`,
          parentName: empData.parentName || '',
          designation: empData.designation || 'ಸಹ ಶಿಕ್ಷಕರು',
          cadreGroup: empData.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ',
          section: empData.section || 'Administration & Services',
          officeLocation: empData.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
          appointmentDate: empData.appointmentDate || empData.joiningDate || '2015-06-01',
          joiningDate: empData.joiningDate || '2015-06-01',
          currentBasicPay: Number(empData.currentBasicPay || empData.basicPay || 37900),
          payScale: empData.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
          lastIncrementDate: empData.lastIncrementDate || '2024-01-01',
          nextIncrementDate: empData.nextIncrementDate || '2025-01-01',
          earnedLeaveBalance: empData.earnedLeaveBalance !== undefined ? Number(empData.earnedLeaveBalance) : 120,
          childCareLeaveQuota: empData.childCareLeaveQuota !== undefined ? Number(empData.childCareLeaveQuota) : 180,
          childCareLeaveAvailed: empData.childCareLeaveAvailed !== undefined ? Number(empData.childCareLeaveAvailed) : 0,
          ddoCode: empData.ddoCode || '291501',
          placeOfWork: empData.placeOfWork || empData.officeLocation || 'ಭದ್ರಾವತಿ',
          hometown: empData.hometown || 'ಭದ್ರಾವತಿ',
          gender: empData.gender || 'Female',
          dob: empData.dob || '1985-05-15',
          email: empData.email || '',
          phone: empData.phone || '',
          employmentType: empData.employmentType || 'Permanent',
          status: empData.status || 'Active',
          role: empData.role || 'Faculty / Principal',
          qualifications: empData.qualifications || '',
          otherServiceDetails: empData.otherServiceDetails || '',
          notes: empData.notes || '',
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        this.data.employees.push(employee);
        this.saveData();
      } else {
        employee = {
          id: `emp-auto-${Date.now()}`,
          kgidNumber: params.kgidNumber,
          employeeCode: `BHD-${params.kgidNumber}`,
          fullName: `ನೌಕರರು (KGID: ${params.kgidNumber})`,
          parentName: '',
          designation: 'ಸಹ ಶಿಕ್ಷಕರು',
          cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
          section: 'Administration & Services',
          officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
          appointmentDate: '2015-06-01',
          joiningDate: '2015-06-01',
          currentBasicPay: 37900,
          payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
          lastIncrementDate: '2024-01-01',
          nextIncrementDate: '2025-01-01',
          earnedLeaveBalance: 120,
          childCareLeaveQuota: 180,
          childCareLeaveAvailed: 0,
          ddoCode: '291501',
          placeOfWork: 'ಭದ್ರಾವತಿ',
          hometown: 'ಭದ್ರಾವತಿ',
          gender: 'Female',
          dob: '1985-05-15',
          email: '',
          phone: '',
          employmentType: 'Permanent',
          status: 'Active',
          role: 'Faculty / Principal',
          qualifications: '',
          otherServiceDetails: '',
          notes: '',
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        this.data.employees.push(employee);
        this.saveData();
      }
    }

    const orderType = this.data.order_types.find(ot => ot.id === params.orderTypeId || ot.nameKannada === params.orderTypeName);
    if (!orderType) {
      throw new Error('ಆಯ್ಕೆ ಮಾಡಿದ ಆದೇಶ ಪ್ರಕಾರ ಮಾನ್ಯವಾಗಿಲ್ಲ.');
    }

    const payRule = this.getPayRuleForOrderType(orderType.id);
    const today = new Date().toISOString().split('T')[0];
    const effDate = params.customEffectiveDate || today;

    // Service Calculation
    const s = calculateServiceYears(employee.joiningDate, effDate);
    const serviceInfo = {
      joiningDate: employee.joiningDate,
      years: s.years,
      months: s.months,
      days: s.days,
      formattedService: `${s.years} ವರ್ಷಗಳು, ${s.months} ತಿಂಗಳುಗಳು, ${s.days} ದಿನಗಳು`,
    };

    const oldBasicPay = employee.currentBasicPay || 37900;
    let incrementAmount = 0;
    let newBasicPay = oldBasicPay;
    let eligible = true;
    let reason = 'ಅರ್ಹತೆ ಪೂರೈಸಲಾಗಿದೆ.';

    // Check Leave Types
    if (orderType.category === 'leave') {
      const daysReq = params.leaveDaysRequested || 15;
      const lFrom = params.leaveFrom || today;
      const lTo = params.leaveTo || new Date(Date.now() + daysReq * 86400000).toISOString().split('T')[0];

      if (orderType.nameKannada.includes('ಗಳಿಕೆ')) {
        const bal = employee.earnedLeaveBalance || 0;
        if (bal < daysReq) {
          eligible = false;
          reason = `ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು ಕೊರತೆಯಿದೆ. ಲಭ್ಯವಿರುವ ಶಿಲ್ಕು: ${bal} ದಿನಗಳು, ಕೋರಿದ ರಜೆ: ${daysReq} ದಿನಗಳು.`;
        } else {
          reason = `ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿಗೆ ಶಿಲ್ಕು ಲಭ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ಶಿಲ್ಕು: ${bal} ದಿನಗಳು.`;
        }
        return {
          eligible,
          reason,
          employee,
          orderType,
          payRule,
          serviceInfo,
          oldBasicPay,
          incrementAmount: 0,
          newBasicPay: oldBasicPay,
          effectiveDate: lFrom,
          leaveCalculation: {
            leaveFrom: lFrom,
            leaveTo: lTo,
            totalDays: daysReq,
            currentBalance: bal,
            balanceAfter: Math.max(0, bal - daysReq),
          }
        };
      } else if (orderType.nameKannada.includes('ಶಿಶುಪಾಲನ')) {
        if (employee.gender !== 'Female') {
          eligible = false;
          reason = 'ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಕೇವಲ ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಮಾತ್ರ ಮಂಜೂರು ಮಾಡಬಹುದಾಗಿದೆ.';
        }
        const availed = employee.childCareLeaveAvailed || 0;
        const maxCcl = (employee.childCareLeaveQuota !== undefined && employee.childCareLeaveQuota !== null) 
          ? employee.childCareLeaveQuota 
          : 180;
        if (availed + daysReq > maxCcl) {
          eligible = false;
          reason = `ಶಿಶುಪಾಲನ ರಜಾ ಮಿತಿ (${maxCcl} ದಿನಗಳು) ಮೀರಿದೆ. ಈಗಾಗಲೇ ಪಡೆದ ರಜೆ: ${availed} ದಿನಗಳು.`;
        } else {
          reason = `ಶಿಶುಪಾಲನ ರಜೆಗೆ ಶಿಲ್ಕು ಲಭ್ಯವಿದೆ. ಒಟ್ಟು ಕೋಟಾ: ${maxCcl} ದಿನಗಳು, ಪಡೆದ ರಜೆ: ${availed} ದಿನಗಳು, ಲಭ್ಯವಿರುವ ಶಿಲ್ಕು: ${maxCcl - availed} ದಿನಗಳು.`;
        }
        return {
          eligible,
          reason,
          employee,
          orderType,
          payRule,
          serviceInfo,
          oldBasicPay,
          incrementAmount: 0,
          newBasicPay: oldBasicPay,
          effectiveDate: lFrom,
          leaveCalculation: {
            leaveFrom: lFrom,
            leaveTo: lTo,
            totalDays: daysReq,
            currentBalance: Math.max(0, maxCcl - availed),
            balanceAfter: Math.max(0, maxCcl - (availed + daysReq)),
          }
        };
      } else if (orderType.nameKannada.includes('ಪಿತೃತ್ವ')) {
        const childOrder = (params as any).childOrder || (params as any).employeeData?.childOrder || '1ನೇ ಜೀವಂತ ಮಗು';
        const patDays = Math.min(15, daysReq || 15);
        if (childOrder.includes('3') || childOrder.includes('ನಂತರದ')) {
          eligible = false;
          reason = 'KCSR ನಿಯಮ 135-ಎ ರನ್ವಯ ಇಬ್ಬರಿಗಿಂತ ಹೆಚ್ಚು ಜೀವಂತ ಮಕ್ಕಳಿರುವ ನೌಕರರಿಗೆ ಪಿತೃತ್ವ ರಜೆ ಸೌಲಭ್ಯ ಲಭ್ಯವಿರುವುದಿಲ್ಲ (ಗರಿಷ್ಠ 2 ಜೀವಂತ ಮಕ್ಕಳಿಗೆ ಮಾತ್ರ).';
        } else if (daysReq > 15) {
          eligible = false;
          reason = 'KCSR ನಿಯಮ 135-ಎ ರನ್ವಯ ಪಿತೃತ್ವ ರಜೆಯ ಗರಿಷ್ಠ ಅವಧಿ 15 ದಿನಗಳು ಮಾತ್ರ.';
        } else if (employee.gender === 'Female') {
          eligible = false;
          reason = 'ಪಿತೃತ್ವ ರಜೆಯನ್ನು ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-ಎ ಅನ್ವಯ ಕೇವಲ ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಮಾತ್ರ ಮಂಜೂರು ಮಾಡಬಹುದಾಗಿದೆ (ಮಹಿಳಾ ನೌಕರರಿಗೆ KCSR 135 ಹೆರಿಗೆ ರಜೆ ಅನ್ವಯಿಸುತ್ತದೆ).';
        } else {
          eligible = true;
          reason = `KCSR ನಿಯಮ 135-ಎ ಹಾಗೂ FD 4 SRS 99 ರನ್ವಯ ${childOrder} ಸಂಬಂಧವಾಗಿ ${patDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಗೆ (ಪೂರ್ಣ ವೇತನ ಸಹಿತ) ಸಂಪೂರ್ಣ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.`;
        }
        return {
          eligible,
          reason,
          employee,
          orderType,
          payRule,
          serviceInfo,
          oldBasicPay,
          incrementAmount: 0,
          newBasicPay: oldBasicPay,
          effectiveDate: lFrom,
          leaveCalculation: {
            leaveFrom: lFrom,
            leaveTo: lTo,
            totalDays: patDays,
            currentBalance: 15,
            balanceAfter: Math.max(0, 15 - patDays),
          }
        };
      } else if (orderType.nameKannada.includes('ನಗರೀಕರಣ') || orderType.nameKannada.includes('ನಗದೀಕರಣ')) {
        const bal = employee.earnedLeaveBalance || 0;
        const encashDays = (daysReq === 30 || daysReq === 15) ? daysReq : (daysReq > 15 ? 30 : 15);
        if (bal < encashDays) {
          eligible = false;
          reason = `ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣಕ್ಕೆ (Surrender) ಶಿಲ್ಕು ಕೊರತೆಯಿದೆ. ಖಾತೆಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು: ${bal} ದಿನಗಳು, ನಗರೀಕರಣಕ್ಕೆ ಕೋರಿದ ದಿನಗಳು: ${encashDays}.`;
        } else {
          const estEncashAmt = Math.round(((oldBasicPay + (oldBasicPay * 0.45)) / 30) * encashDays);
          reason = `ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರನ್ವಯ ${encashDays} ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣಕ್ಕೆ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ. ಅಂದಾಜು ನಗದೀಕರಣ ಮೊತ್ತ: ₹${estEncashAmt.toLocaleString('en-IN')}/- (ಮೂಲ ವೇತನ + DA).`;
        }
        return {
          eligible,
          reason,
          employee,
          orderType,
          payRule,
          serviceInfo,
          oldBasicPay,
          incrementAmount: 0,
          newBasicPay: oldBasicPay,
          effectiveDate: lFrom,
          leaveCalculation: {
            leaveFrom: lFrom,
            leaveTo: lTo,
            totalDays: encashDays,
            currentBalance: bal,
            balanceAfter: Math.max(0, bal - encashDays),
          }
        };
      }
    }

    // Increments & Promotions Calculation
    const isStagnation = orderType.nameKannada.includes('ಸ್ಥಗಿತ');
    const requiredYears = payRule ? payRule.qualifyingYears : (orderType.minServiceYears || (isStagnation ? 2 : 10));
    if (isStagnation) {
      if (s.years < 2) {
        eligible = false;
        reason = `ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿಗೆ ಕನಿಷ್ಠ 2 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ಸೇವೆ: ${s.years} ವರ್ಷಗಳು.`;
      } else {
        reason = `ಹಾಲಿ ವೇತನ ಹಂತದಲ್ಲಿ 2 ವರ್ಷಗಳ ನಿರಂತರ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿರುವುದರಿಂದ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 51A ಹಾಗೂ ವೇತನ ಆಯೋಗ ನಿಯಮಗಳಂತೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ / ಭರ್ತಿಗೆ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.`;
      }
    } else if (s.years < requiredYears) {
      eligible = false;
      reason = `ಅರ್ಹತಾ ಸೇವಾ ಅವಧಿ ಕೊರತೆಯಿದೆ. ಅಗತ್ಯ ಸೇವೆ: ${requiredYears} ವರ್ಷಗಳು. ಪ್ರಸ್ತುತ ಸೇವೆ: ${s.years} ವರ್ಷಗಳು (${s.months} ತಿಂಗಳು).`;
    } else {
      reason = `ಸೇವಾ ಅವಧಿ ${s.years} ವರ್ಷಗಳು ಪೂರೈಸಿದ್ದು, ನಿಯಮಾನುಸಾರ ${requiredYears} ವರ್ಷದ ವೇತನ ಬಡ್ತಿಗೆ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.`;
    }

    if (payRule) {
      if (payRule.incrementType === 'matrix_stage') {
        newBasicPay = getNextPayStage(oldBasicPay, payRule.incrementValue || 1);
        incrementAmount = newBasicPay - oldBasicPay;
      } else if (payRule.incrementType === 'percentage') {
        const pct = payRule.incrementValue || 3;
        incrementAmount = Math.round((oldBasicPay * pct) / 100);
        newBasicPay = oldBasicPay + incrementAmount;
      } else if (payRule.incrementType === 'fixed_amount') {
        incrementAmount = payRule.incrementValue || 1000;
        newBasicPay = oldBasicPay + incrementAmount;
      } else {
        newBasicPay = getNextPayStage(oldBasicPay, 1);
        incrementAmount = newBasicPay - oldBasicPay;
      }
    } else {
      // Default standard 1 stage matrix increment
      newBasicPay = getNextPayStage(oldBasicPay, 1);
      incrementAmount = newBasicPay - oldBasicPay;
    }

    // Effective date resolution
    let resolvedEffectiveDate = effDate;
    if (payRule?.effectiveDateRule === 'completion_date' && employee.joiningDate) {
      // Date of completing required years
      const join = new Date(employee.joiningDate);
      join.setFullYear(join.getFullYear() + requiredYears);
      resolvedEffectiveDate = join.toISOString().split('T')[0];
    }

    return {
      eligible,
      reason,
      employee,
      orderType,
      payRule,
      serviceInfo,
      oldBasicPay,
      incrementAmount,
      newBasicPay,
      effectiveDate: resolvedEffectiveDate,
    };
  }

  // 4. ATOMIC MEMORANDUM ORDER TRANSACTION
  // 1. Save order in Orders table
  // 2. Save/update employee information in Employee Data table
  // 3. Save salary change in Salary History table
  // 4. Update current Basic Pay in Employee Data
  // 5. Save generated order file in Order Files
  // 6. Create Audit Log
  public executeMemorandumOrderTransaction(params: {
    orderData: {
      orderTypeId: string;
      orderTypeName: string;
      kgidNumber: string;
      orderNumber?: string;
      orderDate?: string;
      effectiveDate?: string;
      officialRemarks?: string;
      leaveDetails?: {
        leaveType: string;
        leaveFrom: string;
        leaveTo: string;
        totalDays: number;
        reason?: string;
      };
    };
    employeeUpdates?: Partial<DbEmployee>;
    user: { username: string; displayName: string; role: 'Admin' | 'Data Entry Operator' | 'Viewer' };
    skipDuplicateCheck?: boolean;
  }): {
    success: boolean;
    message: string;
    order: DbMemorandumOrder;
    orderFile: DbOrderFile;
    salaryRecord?: DbSalaryHistory;
    updatedEmployee: DbEmployee;
  } {
    const { orderData, employeeUpdates, user, skipDuplicateCheck } = params;
    const cleanKgid = String(orderData.kgidNumber || '').trim();

    if (!cleanKgid) {
      throw new Error('ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ (KGID Number) ಕಡ್ಡಾಯವಾಗಿದೆ.');
    }

    // Role Permission Check
    if (user.role === 'Viewer') {
      throw new Error('ವೀಕ್ಷಕರಿಗೆ (Viewer) ವೇತನ ಬದಲಾವಣೆ ಅಥವಾ ಆದೇಶ ರಚಿಸುವ ಅಧಿಕಾರವಿಲ್ಲ.');
    }

    let employee = this.getEmployeeByKgid(cleanKgid);
    if (!employee) {
      const empData = (orderData as any).employeeData || (params as any).employeeData;
      if (empData && (empData.fullName || empData.name)) {
        employee = {
          id: empData.id || `emp-${Date.now()}`,
          kgidNumber: cleanKgid,
          employeeCode: empData.employeeCode || `BHD-${cleanKgid}`,
          fullName: empData.fullName || empData.name || `ನೌಕರರು (${cleanKgid})`,
          parentName: empData.parentName || '',
          designation: empData.designation || 'ಸಹ ಶಿಕ್ಷಕರು',
          cadreGroup: empData.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ',
          section: empData.section || 'Administration & Services',
          officeLocation: empData.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
          appointmentDate: empData.appointmentDate || empData.joiningDate || '2015-06-01',
          joiningDate: empData.joiningDate || '2015-06-01',
          currentBasicPay: Number(empData.currentBasicPay || empData.basicPay || 37900),
          payScale: empData.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
          lastIncrementDate: empData.lastIncrementDate || '2024-01-01',
          nextIncrementDate: empData.nextIncrementDate || '2025-01-01',
          earnedLeaveBalance: empData.earnedLeaveBalance !== undefined ? Number(empData.earnedLeaveBalance) : 120,
          childCareLeaveQuota: empData.childCareLeaveQuota !== undefined ? Number(empData.childCareLeaveQuota) : 180,
          childCareLeaveAvailed: empData.childCareLeaveAvailed !== undefined ? Number(empData.childCareLeaveAvailed) : 0,
          ddoCode: empData.ddoCode || '291501',
          placeOfWork: empData.placeOfWork || empData.officeLocation || 'ಭದ್ರಾವತಿ',
          hometown: empData.hometown || 'ಭದ್ರಾವತಿ',
          gender: empData.gender || 'Female',
          dob: empData.dob || '1985-05-15',
          email: empData.email || '',
          phone: empData.phone || '',
          employmentType: empData.employmentType || 'Permanent',
          status: empData.status || 'Active',
          role: empData.role || 'Faculty / Principal',
          qualifications: empData.qualifications || '',
          otherServiceDetails: empData.otherServiceDetails || '',
          notes: empData.notes || '',
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        this.data.employees.push(employee);
        this.saveData();
      } else {
        employee = {
          id: `emp-auto-${Date.now()}`,
          kgidNumber: cleanKgid,
          employeeCode: `BHD-${cleanKgid}`,
          fullName: `ನೌಕರರು (KGID: ${cleanKgid})`,
          parentName: '',
          designation: 'ಸಹ ಶಿಕ್ಷಕರು',
          cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
          section: 'Administration & Services',
          officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
          appointmentDate: '2015-06-01',
          joiningDate: '2015-06-01',
          currentBasicPay: 37900,
          payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
          lastIncrementDate: '2024-01-01',
          nextIncrementDate: '2025-01-01',
          earnedLeaveBalance: 120,
          childCareLeaveQuota: 180,
          childCareLeaveAvailed: 0,
          ddoCode: '291501',
          placeOfWork: 'ಭದ್ರಾವತಿ',
          hometown: 'ಭದ್ರಾವತಿ',
          gender: 'Female',
          dob: '1985-05-15',
          email: '',
          phone: '',
          employmentType: 'Permanent',
          status: 'Active',
          role: 'Faculty / Principal',
          qualifications: '',
          otherServiceDetails: '',
          notes: '',
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        this.data.employees.push(employee);
        this.saveData();
      }
    }

    const office = this.getOfficeConfig();
    const today = new Date().toISOString().split('T')[0];
    const orderDate = orderData.orderDate || today;

    // Check duplicate order for same employee and same order type/effective period
    if (!skipDuplicateCheck) {
      const existingOrder = this.data.orders.find(o =>
        o.kgidNumber === cleanKgid &&
        (o.orderTypeId === orderData.orderTypeId || o.orderTypeName === orderData.orderTypeName) &&
        o.status === 'Approved'
      );
      if (existingOrder && user?.role && (user.role as string) !== 'Admin' && (user.role as string) !== 'Superintendent') {
        // If not admin, inform about existing order
        console.warn(`Duplicate order warning for ${cleanKgid}: existing order ${existingOrder.orderNumber}`);
      }
    }

    // Run Calculation
    const calc = this.calculateOrderDetails({
      kgidNumber: cleanKgid,
      orderTypeId: orderData.orderTypeId,
      orderTypeName: orderData.orderTypeName,
      customEffectiveDate: orderData.effectiveDate,
      leaveFrom: orderData.leaveDetails?.leaveFrom,
      leaveTo: orderData.leaveDetails?.leaveTo,
      leaveDaysRequested: orderData.leaveDetails?.totalDays,
    });

    const isLeave = calc.orderType.category === 'leave';
    const oldBasic = employee.currentBasicPay || 37900;
    const newBasic = isLeave ? oldBasic : calc.newBasicPay;
    const incrementAmt = isLeave ? 0 : calc.incrementAmount;
    const effectiveDate = orderData.effectiveDate || calc.effectiveDate || today;
    const orderTypeName = orderData.orderTypeName || calc.orderType?.nameKannada || 'ಜ್ಞಾಪನಾ ಆದೇಶ';

    // Generate Official Order Number adhering to Karnataka Education Department standard:
    // "ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/_____/___/2026-27" or "ಸಂ: ಆ2/RTE/_______/___/2026-27"
    const orderNumber = formatOfficialLetterNumber({
      categoryOrType: orderTypeName,
      customRawNumber: orderData.orderNumber,
      fileNumber: (orderData as any).fileNumber || (orderData as any).docketNumber || '',
    });
    const isPaternity = orderTypeName.includes('ಪಿತೃತ್ವ');
    const childDobVal = (orderData as any).childDob || (orderData.leaveDetails as any)?.childDob || '';
    const childOrderVal = (orderData as any).childOrder || (orderData.leaveDetails as any)?.childOrder || '1ನೇ ಜೀವಂತ ಮಗು';
    const appDateVal = (orderData as any).applicationDate || (orderData.leaveDetails as any)?.applicationDate || orderDate;
    const certDetails = (orderData as any).birthCertificateDetails || (orderData.leaveDetails as any)?.birthCertificateDetails || 'ಜನನ ಪ್ರಮಾಣಪತ್ರ';

    const typeCode = isPaternity
      ? 'PL'
      : (orderTypeName.includes('ರಜೆ')
        ? (orderTypeName.includes('ಗಳಿಕೆ') ? 'EL' : 'CCL')
        : (orderTypeName.replace(/[^0-9]/g, '') || 'INC') + 'Y');
    const fileId = `FILE-${new Date().getFullYear()}/SR-${typeCode}/${cleanKgid}`;

    const ruleRef = isPaternity
      ? 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999.'
      : (calc.payRule?.governmentOrderRef || 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ಮತ್ತು ಸರ್ಕಾರದ ಅಧಿಕೃತ ಆದೇಶಗಳು.');

    // Generate Official Kannada Memorandum Order Text
    const preambleText = isPaternity
      ? `ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ ${employee.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ ${employee.fullName}, ${employee.designation} (KGID: ${employee.kgidNumber}) ಇವರು ತಮ್ಮ ${childOrderVal}ಯ ಜನನದ (ದಿನಾಂಕ: ${childDobVal || 'ಲಭ್ಯವಿಲ್ಲ'}) ಪ್ರಯುಕ್ತ ದಿನಾಂಕ: ${appDateVal} ರಂದು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ, ದಿನಾಂಕ: ${orderData.leaveDetails?.leaveFrom || today} ರಿಂದ ${orderData.leaveDetails?.leaveTo || today} ರವರೆಗೆ ಒಟ್ಟು ${orderData.leaveDetails?.totalDays || 15} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ಅರ್ಜಿಯೊಂದಿಗೆ ಮಗುವಿನ ಜನನ ಪ್ರಮಾಣಪತ್ರ / ಆಸ್ಪತ್ರೆ ದಾಖಲೆಯನ್ನು (${certDetails}) ಲಗತ್ತಿಸಿರುತ್ತಾರೆ. ಅರ್ಜಿದಾರರು 2ಕ್ಕಿಂತ ಕಡಿಮೆ ಜೀವಂತ ಮಕ್ಕಳನ್ನು ಹೊಂದಿರುವ ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಾಗಿದ್ದು, ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಕೆಳಕಂಡಂತೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`
      : `ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ ${employee.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation} ಇವರು ನಿಯಮಾನುಸಾರ ${orderTypeName} ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ. ಸದರಿಯವರ ಸೇವಾ ಪುಸ್ತಕವನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿ, ಅರ್ಹತಾ ಸೇವಾವಧಿಯು ತೃಪ್ತಿಕರವಾಗಿದ್ದು ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲವೆಂದು ದೃಢೀಕರಿಸಿ, ಕೆಳಕಂಡಂತೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`;

    const orderBodyText = isPaternity
      ? `ಶ್ರೀ ${employee.fullName}, ${employee.designation}, ${employee.officeLocation} ಇವರಿಗೆ ತಮ್ಮ ${childOrderVal}ಯ ಜನನದ ನಿಮಿತ್ತ ದಿನಾಂಕ: ${orderData.leaveDetails?.leaveFrom || today} ರಿಂದ ${orderData.leaveDetails?.leaveTo || today} ರವರೆಗೆ ಒಟ್ಟು ${orderData.leaveDetails?.totalDays || 15} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಯನ್ನು (Paternity Leave) ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSRs) ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಕರ್ತವ್ಯದ ಮೇಲಿರುವಂತೆ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`
      : (isLeave
        ? `ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation} ಇವರಿಗೆ ದಿನಾಂಕ: ${orderData.leaveDetails?.leaveFrom || today} ರಿಂದ ${orderData.leaveDetails?.leaveTo || today} ರವರೆಗೆ ಒಟ್ಟು ${orderData.leaveDetails?.totalDays || 1} ದಿನಗಳ ${orderTypeName}ಯನ್ನು ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`
        : `ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation} ಇವರ ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ ₹${oldBasic.toLocaleString('en-IN')}/- (ವೇತನ ಶ್ರೇಣಿ: ${employee.payScale}) ಗೆ ದಿನಾಂಕ: ${effectiveDate} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ₹${incrementAmt.toLocaleString('en-IN')}/- ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ, ಇವರ ನೂತನ ಮೂಲ ವೇತನವನ್ನು ₹${newBasic.toLocaleString('en-IN')}/- ಗೆ ಪರಿಷ್ಕರಿಸಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`);

    const copiesList = [
      `ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ: ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation}`,
      `ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರು, ${employee.officeLocation}`,
      `ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ`,
      `ಸಹಾಯಕ ಲೆಕ್ಕಾಧಿಕಾರಿಗಳು / ವೇತನ ಪರಿಷ್ಕರಣಾ ಶಾಖೆ, ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
      `ಕಛೇರಿ ಕಡತ / ಆದೇಶ ಪುಸ್ತಕ / ಎಚ್‌ಆರ್‌ಎಂಎಸ್ ತಂತ್ರಾಂಶ ದಾಖಲಾತಿಗಾಗಿ.`
    ];

    // DDO Signatory Resolution:
    // Dynamically pull DDO officer information from employee where isDdo === true
    const ddoEmp = this.data.employees.find(e => (e as any).isDdo === true);
    const resolvedSignatoryName = ddoEmp?.fullName || (orderData as any).signatoryName || office.ddoOfficerName || office.officerName || 'ಹೆಚ್. ರವಿಕುಮಾರ್';
    const resolvedSignatoryDesignation = ddoEmp?.designation || (orderData as any).signatoryDesignation || office.ddoDesignation || office.officerDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ';
    const resolvedSignatoryOffice = ddoEmp?.placeOfWork || ddoEmp?.officeLocation || (orderData as any).signatoryOffice || office.ddoOfficeName || office.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು';

    // Build the Memorandum Order Record
    const orderRecord: DbMemorandumOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      orderDate,
      orderTypeId: calc.orderType.id,
      orderTypeName: calc.orderType.nameKannada,
      kgidNumber: cleanKgid,
      employeeId: employee.id,
      employeeName: employee.fullName,
      parentName: employee.parentName,
      designation: employee.designation,
      cadreGroup: employee.cadreGroup || 'ಗ್ರೂಪ್-ಬಿ',
      officeName: office.officeName,
      officeDepartment: office.departmentName,
      officeAddress: office.officeAddress,
      oldBasicPay: oldBasic,
      incrementAmount: incrementAmt,
      newBasicPay: newBasic,
      payScale: employee.payScale,
      effectiveDate,
      ruleReference: ruleRef,
      subject: `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ವಲಯ - ${orderTypeName} ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.`,
      preamble: preambleText,
      orderText: orderBodyText,
      officialRemarks: orderData.officialRemarks || `${calc.reason}`,
      leaveDetails: orderData.leaveDetails ? {
        ...orderData.leaveDetails,
        balanceBefore: calc.leaveCalculation?.currentBalance,
        balanceAfter: calc.leaveCalculation?.balanceAfter,
      } : undefined,
      signatoryName: resolvedSignatoryName,
      signatoryDesignation: resolvedSignatoryDesignation,
      copiesForwardedTo: copiesList,
      status: 'Approved',
      createdBy: user.displayName,
      createdRole: user.role,
      createdAt: new Date().toISOString(),
      fileId,
    };

    // Build Compact Formatted HTML Document for Single-Page Printing / PDF
    const documentHtml = `
      <div class="memorandum-doc fit-paper-a4 p-8 bg-white font-sans text-stone-900 max-w-4xl mx-auto border border-stone-300 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0" style="font-size: 12pt; line-height: 1.5;">
        <div class="text-center border-b border-stone-800 pb-2 mb-2">
          <h1 class="text-sm font-bold tracking-wide text-stone-900 leading-tight">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
          <h2 class="text-xs font-semibold text-stone-800 leading-tight">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
          <h3 class="text-xs font-bold text-sky-950 mt-0.5 leading-tight">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
          <p class="text-[10px] text-stone-600">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</p>
        </div>

        <div class="flex justify-between items-center text-[11px] font-semibold text-stone-800 mb-2 border-b border-stone-200 pb-1 font-mono">
          <div>ಸಂ: <span class="font-bold text-stone-950">${orderNumber}</span></div>
          <div>ದಿನಾಂಕ: <span class="text-stone-950">${orderDate}</span></div>
        </div>

        <div class="text-center mb-2">
          <h2 class="text-xs font-extrabold uppercase tracking-wider text-stone-950 bg-stone-100 inline-block px-3 py-1 border border-stone-300 rounded">
            ಅಧಿಕೃತ ಜ್ಞಾಪನ
          </h2>
        </div>

        <div class="space-y-1 text-[11px] leading-snug text-stone-800 mb-2">
          <p><strong>ವಿಷಯ:</strong> ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ${isPaternity ? `ಶ್ರೀ ${employee.fullName}, ${employee.designation} ಇವರಿಗೆ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರಾತಿ ಕುರಿತು.` : `${orderData.orderTypeName || orderTypeName} ಮಂಜೂರಾತಿ ಕುರಿತು.`}</p>
          ${isPaternity ? `
            <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಅರ್ಜಿ ದಿನಾಂಕ: ${appDateVal}.</p>
            <p class="pl-11">2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಚೇರಿ ಮುಖ್ಯಸ್ಥರ ಶಿಫಾರಸು ಪತ್ರ.</p>
            <p class="pl-11">3. ಮಗುವಿನ ಜನನ ಪ್ರಮಾಣಪತ್ರ / ಆಸ್ಪತ್ರೆ ದಾಖಲೆ: ${certDetails}.</p>
            <p class="pl-11">4. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 135-ಎ (KCSR Rule 135-A).</p>
            <p class="pl-11">5. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99, ದಿನಾಂಕ: 08-02-1999.</p>
          ` : `
            <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರ ಶಿಫಾರಸು.</p>
            <p class="pl-11">2. ನೌಕರರ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ (Service Register) ಸಂಪುಟ 1 ಮತ್ತು 2.</p>
            <p class="pl-11">3. ${ruleRef}</p>
          `}
        </div>

        <div class="space-y-2 text-[11px] text-stone-900 leading-snug mb-2">
          <p class="text-justify font-serif"><strong>ಪ್ರಸ್ತಾವನೆ:</strong> ${preambleText}</p>
          
          <p class="font-bold text-[11px] text-stone-950 pt-0.5">ಆದೇಶ:</p>

          ${!isLeave ? `
            <div class="overflow-x-auto my-1">
              <table class="w-full border-collapse border border-stone-400 text-[10.5px] bg-white">
                <thead>
                  <tr class="bg-stone-100 text-stone-900 font-bold text-center">
                    <th class="border border-stone-400 p-1.5 text-center w-8">ಕ್ರ.ಸಂ.</th>
                    <th class="border border-stone-400 p-1.5 text-left">ನೌಕರರ ಹೆಸರು ಮತ್ತು ಹುದ್ದೆ</th>
                    <th class="border border-stone-400 p-1.5 text-left">ಕಾರ್ಯಸ್ಥಳ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಮಂಜೂರಾದ ಸೇವಾ ಪ್ರಕಾರ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಹಿಂದಿನ ಮೂಲ ವೇತನ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಮಂಜೂರಾದ ವೇತನ ಬಡ್ತಿ</th>
                    <th class="border border-stone-400 p-1.5 text-center bg-sky-50">ಪರಿಷ್ಕೃತ ನೂತನ ಮೂಲ ವೇತನ</th>
                    <th class="border border-stone-400 p-1.5 text-left">ವೇತನ ಶ್ರೇಣಿ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="text-stone-800">
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-bold">1</td>
                    <td class="border border-stone-400 p-1.5 text-left font-semibold">
                      ${employee.fullName}<br/>
                      <span class="text-[9.5px] font-normal text-stone-600">${employee.designation}</span>
                    </td>
                    <td class="border border-stone-400 p-1.5 text-left text-[10px]">${employee.officeLocation}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-medium">${orderTypeName}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono">${effectiveDate}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-semibold">₹${oldBasic.toLocaleString('en-IN')}/-</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-semibold text-emerald-800">+ ₹${incrementAmt.toLocaleString('en-IN')}/-</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-bold text-sky-950 bg-sky-50 text-xs">₹${newBasic.toLocaleString('en-IN')}/-</td>
                    <td class="border border-stone-400 p-1.5 text-left font-mono text-[9px] leading-tight">${employee.payScale}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : `
            <div class="overflow-x-auto my-1">
              <table class="w-full border-collapse border border-stone-400 text-[10.5px] bg-white">
                <thead>
                  <tr class="bg-stone-100 text-stone-900 font-bold text-center">
                    <th class="border border-stone-400 p-1.5 text-center w-8">ಕ್ರ.ಸಂ.</th>
                    <th class="border border-stone-400 p-1.5 text-left">ನೌಕರರ ಹೆಸರು ಮತ್ತು ಹುದ್ದೆ</th>
                    <th class="border border-stone-400 p-1.5 text-left">ಕಾರ್ಯಸ್ಥಳ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ರಜೆಯ ಪ್ರಕಾರ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಮಂಜೂರಾದ ರಜಾ ಅವಧಿ</th>
                    <th class="border border-stone-400 p-1.5 text-center">ಒಟ್ಟು ದಿನಗಳು</th>
                    <th class="border border-stone-400 p-1.5 text-center">ರಜಾ ಪೂರ್ವ ಶಿಲ್ಕು</th>
                    <th class="border border-stone-400 p-1.5 text-center bg-sky-50">ಉಳಿಯುವ ರಜಾ ಶಿಲ್ಕು</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="text-stone-800">
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-bold">1</td>
                    <td class="border border-stone-400 p-1.5 text-left font-semibold">
                      ${employee.fullName}<br/>
                      <span class="text-[9.5px] font-normal text-stone-600">${employee.designation}</span>
                    </td>
                    <td class="border border-stone-400 p-1.5 text-left text-[10px]">${employee.officeLocation}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-medium">${orderTypeName}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono">${orderData.leaveDetails?.leaveFrom} ರಿಂದ ${orderData.leaveDetails?.leaveTo}</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-bold">${orderData.leaveDetails?.totalDays} ದಿನಗಳು</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono">${calc.leaveCalculation?.currentBalance ?? '-'} ದಿನಗಳು</td>
                    <td class="border border-stone-400 p-1.5 text-center font-mono font-bold text-sky-950 bg-sky-50">${calc.leaveCalculation?.balanceAfter ?? '-'} ದಿನಗಳು</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `}

          <p class="text-justify leading-relaxed">${orderBodyText}</p>
          ${orderData.officialRemarks ? `<p class="text-stone-700 italic text-[10px]">ಷರಾ: ${orderData.officialRemarks}</p>` : ''}

          <p class="text-[10px] text-stone-700 mt-1">
            ಈ ಜ್ಞಾಪನದ ಪ್ರತಿಯನ್ನು ನೌಕರರ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ (Service Book) ದಾಖಲಿಸಲು ಹಾಗೂ ಎಚ್‌ಆರ್‌ಎಂಎಸ್ (HRMS) ತಂತ್ರಾಂಶದಲ್ಲಿ ನವೀಕರಿಸಿ ವೇತನ ಸೆಳೆಯಲು ಸೂಚಿಸಲಾಗಿದೆ.
          </p>
        </div>

        <div class="mt-6 flex justify-end">
          <div class="text-center min-w-52 space-y-1">
            <p class="text-xs text-stone-700 font-medium">ತಮ್ಮ ನಂಬುಗೆಯ,</p>
            <div style="height: 48px;"></div>
            ${(orderData as any).showCaseworkerSignature && user?.displayName ? `
              <p class="font-bold text-xs text-stone-950">(${user.displayName})</p>
              <p class="text-[11px] text-stone-700">ವಿಷಯ ನಿರ್ವಾಹಕರು (Caseworker)</p>
            ` : ''}
          </div>
        </div>

        <div class="mt-3 pt-2 border-t border-stone-300 text-[9.5px] text-stone-700 space-y-0.5">
          <p class="font-bold text-stone-900">ಪ್ರತಿಯನ್ನು ಮಾಹಿತಿ ಮತ್ತು ಸೂಕ್ತ ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:</p>
          ${copiesList.map((c, i) => `<p>${i + 1}. ${c}</p>`).join('')}
        </div>
      </div>
    `;

    // 5. Build Order File Record (ಆದೇಶಗಳ ಕಡತ)
    const orderFileRecord: DbOrderFile = {
      id: `file-rec-${Date.now()}`,
      fileId,
      orderNumber,
      kgidNumber: cleanKgid,
      employeeName: employee.fullName,
      orderType: orderTypeName,
      orderDate,
      effectiveDate,
      oldBasicPay: oldBasic,
      newBasicPay: newBasic,
      createdBy: user.displayName,
      createdDate: orderDate,
      generatedDocumentHtml: documentHtml,
      generatedDocumentText: `${office.governmentName}\n${office.officeName}\nಸಂ: ${orderNumber}\nದಿನಾಂಕ: ${orderDate}\nವಿಷಯ: ${orderTypeName}\nನೌಕರರು: ${employee.fullName} (KGID: ${cleanKgid})\nಮೂಲ ವೇತನ: ₹${oldBasic} -> ₹${newBasic}\nಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ: ${effectiveDate}`,
      fileSize: '184 KB',
      remarks: orderData.officialRemarks,
    };

    // 3. Build Salary History Record (ವೇತನ ಬದಲಾವಣೆ ಇತಿಹಾಸ)
    let salaryRecord: DbSalaryHistory | undefined = undefined;
    if (!isLeave && incrementAmt > 0) {
      salaryRecord = {
        id: `sh-${Date.now()}`,
        employeeId: employee.id,
        kgidNumber: cleanKgid,
        employeeName: employee.fullName,
        date: orderDate,
        orderType: orderTypeName,
        orderNumber,
        oldBasicPay: oldBasic,
        increment: incrementAmt,
        newBasicPay: newBasic,
        effectiveDate,
        changedBy: user.displayName,
        changedRole: user.role,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        remarks: orderData.officialRemarks || `ಜ್ಞಾಪನಾ ಆದೇಶ ${orderNumber} ಅನ್ವಯ ಮೂಲ ವೇತನ ನವೀಕರಿಸಲಾಗಿದೆ.`,
      };
    }

    // 2 & 4. Update Employee in Database
    const empIndex = this.data.employees.findIndex(e => e.id === employee.id);
    let updatedLeaveBalance = employee.earnedLeaveBalance;
    let updatedCclAvailed = employee.childCareLeaveAvailed;
    if (isLeave && orderData.leaveDetails?.totalDays) {
      if (orderTypeName.includes('ಗಳಿಕೆ')) {
        updatedLeaveBalance = Math.max(0, (employee.earnedLeaveBalance || 0) - orderData.leaveDetails.totalDays);
      } else if (orderTypeName.includes('ಶಿಶುಪಾಲನ')) {
        updatedCclAvailed = (employee.childCareLeaveAvailed || 0) + orderData.leaveDetails.totalDays;
      }
    }

    const updatedEmployee: DbEmployee = {
      ...employee,
      ...(employeeUpdates || {}),
      currentBasicPay: newBasic,
      lastIncrementDate: isLeave ? employee.lastIncrementDate : effectiveDate,
      earnedLeaveBalance: updatedLeaveBalance,
      childCareLeaveAvailed: updatedCclAvailed,
      status: isLeave ? 'On Leave' : employee.status,
      lastUpdated: today,
    };

    // ATOMIC WRITE IN MEMORY
    this.data.orders.unshift(orderRecord);
    this.data.order_files.unshift(orderFileRecord);
    if (salaryRecord) {
      this.data.salary_history.unshift(salaryRecord);
    }
    if (empIndex >= 0) {
      this.data.employees[empIndex] = updatedEmployee;
    }

    // 6. Create Audit Log
    this.logAudit(
      'MEMORANDUM_GENERATED',
      user.displayName,
      user.role,
      `ಜ್ಞಾಪನಾ ಆದೇಶ ರಚಿಸಲಾಗಿದೆ: ${orderNumber} (${orderData.orderTypeName}) - ${employee.fullName} (KGID: ${cleanKgid})`,
      {
        kgidNumber: cleanKgid,
        employeeName: employee.fullName,
        orderNumber,
        oldValue: `₹${oldBasic}`,
        newValue: `₹${newBasic}`,
      }
    );

    if (!isLeave) {
      this.logAudit(
        'SALARY_CHANGE',
        user.displayName,
        user.role,
        `ಮೂಲ ವೇತನ ಬದಲಾವಣೆ: ${employee.fullName} (KGID: ${cleanKgid}) - ₹${oldBasic} ರಿಂದ ₹${newBasic} (ಆದೇಶ: ${orderNumber})`,
        {
          kgidNumber: cleanKgid,
          employeeName: employee.fullName,
          orderNumber,
          oldValue: `₹${oldBasic}`,
          newValue: `₹${newBasic}`,
        }
      );
    }

    // PERSIST ATOMICALLY TO DISK
    this.saveData();

    return {
      success: true,
      message: 'ಜ್ಞಾಪನಾ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ ಮತ್ತು ನೌಕರರ ಮೂಲ ವೇತನವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.',
      order: orderRecord,
      orderFile: orderFileRecord,
      salaryRecord,
      updatedEmployee,
    };
  }

  // 5. ORDERS & FILES QUERIES
  public getOrders(kgid?: string, orderType?: string): DbMemorandumOrder[] {
    let list = [...this.data.orders];
    if (kgid) {
      list = list.filter(o => o.kgidNumber === kgid.trim());
    }
    if (orderType && orderType !== 'All') {
      list = list.filter(o => o.orderTypeId === orderType || o.orderTypeName === orderType);
    }
    return list;
  }

  public getOrderFiles(search?: string): DbOrderFile[] {
    let list = [...this.data.order_files];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(f =>
        f.orderNumber.toLowerCase().includes(q) ||
        f.kgidNumber.toLowerCase().includes(q) ||
        f.employeeName.toLowerCase().includes(q) ||
        f.orderType.toLowerCase().includes(q) ||
        f.fileId.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getOrderFileById(id: string): DbOrderFile | null {
    return this.data.order_files.find(f => f.id === id || f.fileId === id || f.orderNumber === id) || null;
  }

  public deleteOrderFile(id: string, performedBy: string, role: string): boolean {
    const index = this.data.order_files.findIndex(f => f.id === id || f.fileId === id);
    if (index === -1) return false;
    const deleted = this.data.order_files.splice(index, 1)[0];
    this.saveData();

    this.logAudit('ORDER_DELETED', performedBy, role, `ಆದೇಶ ಕಡತ ಅಳಿಸಲಾಗಿದೆ: ${deleted.orderNumber} (${deleted.employeeName})`, {
      orderNumber: deleted.orderNumber,
      kgidNumber: deleted.kgidNumber,
      employeeName: deleted.employeeName,
    });
    return true;
  }

  // 6. SALARY HISTORY QUERIES
  public getSalaryHistory(kgid?: string): DbSalaryHistory[] {
    if (kgid && kgid.trim()) {
      const clean = kgid.trim();
      return this.data.salary_history.filter(sh => sh.kgidNumber === clean);
    }
    return this.data.salary_history;
  }

  // 7. AUDIT LOGS QUERIES
  public getAuditLogs(limit: number = 100): DbAuditLog[] {
    return this.data.audit_logs.slice(0, limit);
  }

  // 8. OFFICE CONFIG
  public getOfficeConfig(): DbOfficeConfig {
    const office = this.data.offices[0] || DEFAULT_OFFICE;
    const ddoEmp = this.data.employees.find(e => (e as any).isDdo === true);
    if (ddoEmp) {
      return {
        ...office,
        ddoOfficerName: ddoEmp.fullName,
        ddoDesignation: ddoEmp.designation,
        ddoCode: ddoEmp.ddoCode || office.ddoCode || '14041ED001',
        ddoKgidNumber: ddoEmp.kgidNumber || office.ddoKgidNumber,
        ddoMobile: ddoEmp.phone || office.ddoMobile,
        ddoEmail: ddoEmp.email || office.ddoEmail,
        ddoOfficeName: ddoEmp.placeOfWork || ddoEmp.officeLocation || office.ddoOfficeName || office.officeName,
        officerName: ddoEmp.fullName,
        officerDesignation: ddoEmp.designation,
      };
    }
    return office;
  }

  public updateOfficeConfig(updates: Partial<DbOfficeConfig>, performedBy: string, role: string): DbOfficeConfig {
    const current = this.getOfficeConfig();
    const updated = { ...current, ...updates, id: current.id };
    this.data.offices[0] = updated;
    this.saveData();

    this.logAudit('PAY_RULE_EDITED', performedBy, role, 'ಕಛೇರಿಯ ಅಧಿಕೃತ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.');
    return updated;
  }

  // 9. USERS
  public getUsers(): DbUser[] {
    return this.data.users;
  }

  // 10. UNIFIED SEARCH
  public unifiedSearch(query: string): {
    employees: DbEmployee[];
    orders: DbMemorandumOrder[];
    orderFiles: DbOrderFile[];
    salaryRecords: DbSalaryHistory[];
    generatedLetters: DbGeneratedLetter[];
  } {
    if (!query || !query.trim()) {
      return { employees: [], orders: [], orderFiles: [], salaryRecords: [], generatedLetters: [] };
    }
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/[^0-9]/g, '');

    const matchingEmployees = this.data.employees.filter(e =>
      e.kgidNumber.toLowerCase().includes(q) ||
      (qDigits && e.kgidNumber.replace(/[^0-9]/g, '').includes(qDigits)) ||
      e.fullName.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.officeLocation.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q)
    );

    const matchingOrders = this.data.orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.kgidNumber.toLowerCase().includes(q) ||
      o.employeeName.toLowerCase().includes(q) ||
      o.orderTypeName.toLowerCase().includes(q) ||
      o.designation.toLowerCase().includes(q)
    );

    const matchingFiles = this.data.order_files.filter(f =>
      f.orderNumber.toLowerCase().includes(q) ||
      f.kgidNumber.toLowerCase().includes(q) ||
      f.employeeName.toLowerCase().includes(q) ||
      f.orderType.toLowerCase().includes(q)
    );

    const matchingSalaries = this.data.salary_history.filter(s =>
      s.kgidNumber.toLowerCase().includes(q) ||
      s.employeeName.toLowerCase().includes(q) ||
      s.orderNumber.toLowerCase().includes(q) ||
      s.orderType.toLowerCase().includes(q)
    );

    const matchingLetters = (this.data.generated_letters || []).filter(l =>
      l.letterNumber.toLowerCase().includes(q) ||
      l.documentId.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      (l.employeeName && l.employeeName.toLowerCase().includes(q)) ||
      (l.kgidNumber && l.kgidNumber.toLowerCase().includes(q)) ||
      l.letterType.toLowerCase().includes(q) ||
      (l.officeName && l.officeName.toLowerCase().includes(q))
    );

    return {
      employees: matchingEmployees,
      orders: matchingOrders,
      orderFiles: matchingFiles,
      salaryRecords: matchingSalaries,
      generatedLetters: matchingLetters,
    };
  }

  // 11. BACKUP & RESTORE
  public exportBackup(): DatabaseSchema {
    return this.data;
  }

  public restoreBackup(imported: any, performedBy: string, role: string): boolean {
    if (!imported || !Array.isArray(imported.employees)) {
      throw new Error('ಅಮಾನ್ಯ ಬ್ಯಾಕಪ್ ಫೈಲ್. ಡೇಟಾ ಮರುಸ್ಥಾಪನೆ ವಿಫಲವಾಗಿದೆ.');
    }
    this.data = {
      employees: imported.employees || [],
      employee_service_details: imported.employee_service_details || [],
      salary_history: imported.salary_history || [],
      orders: imported.orders || [],
      order_files: imported.order_files || [],
      order_types: imported.order_types || DEFAULT_ORDER_TYPES,
      pay_rules: imported.pay_rules || DEFAULT_PAY_RULES,
      users: imported.users || DEFAULT_USERS,
      audit_logs: imported.audit_logs || [],
      offices: imported.offices || [DEFAULT_OFFICE],
      generated_letters: imported.generated_letters || DEFAULT_GENERATED_LETTERS,
      letter_templates: imported.letter_templates || DEFAULT_LETTER_TEMPLATES,
      schools: imported.schools || DEFAULT_SCHOOLS,
    };
    this.saveData();

    this.logAudit('BACKUP_RESTORED', performedBy, role, `ಡೇಟಾಬೇಸ್ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ (${this.data.employees.length} ನೌಕರರ ದಾಖಲೆಗಳು).`);
    return true;
  }

  public resetToDefaults(performedBy: string = 'Admin'): void {
    this.data = this.createDefaultData();
    this.logAudit('BACKUP_RESTORED', performedBy, 'Admin', 'ಡೇಟಾಬೇಸ್ ಅನ್ನು ಮೂಲ ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಗೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
  }

  // 12. SUMMARY STATS
  public getDashboardStats(): {
    totalEmployees: number;
    totalOrdersGenerated: number;
    totalSalaryChanges: number;
    totalOrderFiles: number;
    recentOrders: DbMemorandumOrder[];
    recentSalaryChanges: DbSalaryHistory[];
    recentAuditLogs: DbAuditLog[];
    orderTypeCounts: Record<string, number>;
  } {
    const orderTypeCounts: Record<string, number> = {};
    for (const ord of this.data.orders) {
      orderTypeCounts[ord.orderTypeName] = (orderTypeCounts[ord.orderTypeName] || 0) + 1;
    }

    return {
      totalEmployees: this.data.employees.length,
      totalOrdersGenerated: this.data.orders.length,
      totalSalaryChanges: this.data.salary_history.length,
      totalOrderFiles: this.data.order_files.length,
      recentOrders: this.data.orders.slice(0, 5),
      recentSalaryChanges: this.data.salary_history.slice(0, 5),
      recentAuditLogs: this.data.audit_logs.slice(0, 8),
      orderTypeCounts,
    };
  }

  // 13. GENERATED OFFICE LETTERS & OCR STUDIO
  public getGeneratedLetters(filters?: {
    search?: string;
    letterType?: string;
    status?: string;
    kgid?: string;
  }): DbGeneratedLetter[] {
    let list = [...(this.data.generated_letters || [])];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const qDigits = q.replace(/[^0-9]/g, '');
      list = list.filter(l =>
        l.letterNumber.toLowerCase().includes(q) ||
        l.documentId.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        (l.employeeName && l.employeeName.toLowerCase().includes(q)) ||
        (l.kgidNumber && l.kgidNumber.toLowerCase().includes(q)) ||
        (qDigits && l.kgidNumber && l.kgidNumber.includes(qDigits)) ||
        l.letterType.toLowerCase().includes(q) ||
        (l.officeName && l.officeName.toLowerCase().includes(q)) ||
        (l.ocrRawText && l.ocrRawText.toLowerCase().includes(q))
      );
    }

    if (filters?.letterType && filters.letterType !== 'All') {
      list = list.filter(l => l.letterType === filters.letterType);
    }

    if (filters?.status && filters.status !== 'All') {
      list = list.filter(l => l.status === filters.status);
    }

    if (filters?.kgid && filters.kgid.trim()) {
      const k = filters.kgid.trim().toLowerCase();
      list = list.filter(l => l.kgidNumber && l.kgidNumber.toLowerCase() === k);
    }

    // Sort descending by date / updated
    list.sort((a, b) => new Date(b.lastUpdated || b.createdAt).getTime() - new Date(a.lastUpdated || a.createdAt).getTime());
    return list;
  }

  public getGeneratedLetterById(id: string): DbGeneratedLetter | null {
    if (!this.data.generated_letters) return null;
    return this.data.generated_letters.find(l => l.id === id || l.documentId === id) || null;
  }

  public saveGeneratedLetter(
    letterData: Partial<DbGeneratedLetter>,
    performedBy: string = 'admin',
    role: string = 'Admin'
  ): DbGeneratedLetter {
    if (!this.data.generated_letters) {
      this.data.generated_letters = [];
    }

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // If existing letter, check if updating or saving new version
    if (letterData.id) {
      const idx = this.data.generated_letters.findIndex(l => l.id === letterData.id);
      if (idx !== -1) {
        const existing = this.data.generated_letters[idx];

        // Increment version number and push previous state to version history
        const newVersionNumber = (existing.currentVersion || 1) + 1;
        const newVersionEntry: DbLetterVersion = {
          versionNumber: newVersionNumber,
          updatedAt: now,
          updatedBy: performedBy,
          letterHtml: letterData.bodyHtml || existing.bodyHtml,
          letterText: letterData.bodyText || existing.bodyText,
          notes: letterData.userPrompt ? `ಸೂಚನೆ: ${letterData.userPrompt.substring(0, 80)}` : 'ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ',
        };

        const updated: DbGeneratedLetter = {
          ...existing,
          ...letterData,
          id: existing.id,
          documentId: existing.documentId,
          // CRITICAL: NEVER overwrite original uploaded document
          originalFile: existing.originalFile || letterData.originalFile,
          currentVersion: newVersionNumber,
          versions: [...(existing.versions || []), newVersionEntry],
          lastUpdated: now,
        };

        this.data.generated_letters[idx] = updated;
        this.saveData();

        this.logAudit(
          'MEMORANDUM_GENERATED',
          performedBy,
          role,
          `ಪತ್ರ ನವೀಕರಿಸಲಾಗಿದೆ (v${newVersionNumber}): ${updated.letterNumber} (${updated.letterType})`,
          { orderNumber: updated.letterNumber, employeeName: updated.employeeName, kgidNumber: updated.kgidNumber }
        );

        return updated;
      }
    }

    // Creating a brand new Generated Letter
    const seq = (this.data.generated_letters.length + 1).toString().padStart(3, '0');
    const docId = `DOC-2026/${today.split('-')[1]}/LET-${seq}`;
    const newId = `gen-let-${Date.now()}`;

    const initialVersion: DbLetterVersion = {
      versionNumber: 1,
      updatedAt: now,
      updatedBy: performedBy,
      letterHtml: letterData.bodyHtml || '',
      letterText: letterData.bodyText || '',
      notes: 'ಆರಂಭಿಕ ಎಐ ಸೃಜನೆ ಮತ್ತು ಕರಡು ರಚನೆ',
    };

    const newLetter: DbGeneratedLetter = {
      id: newId,
      documentId: docId,
      letterNumber: letterData.letterNumber
        ? formatOfficialLetterNumber({ categoryOrType: letterData.letterType, customRawNumber: letterData.letterNumber })
        : formatOfficialLetterNumber({ categoryOrType: letterData.letterType, sequenceNum: seq }),
      date: letterData.date || today,
      letterType: letterData.letterType || 'ಸಾಮಾನ್ಯ ಪತ್ರ',
      letterCategory: (letterData.letterCategory as any) || 'normal',
      originalFile: letterData.originalFile,
      ocrRawText: letterData.ocrRawText || '',
      ocrExtracted: letterData.ocrExtracted || {},
      userPrompt: letterData.userPrompt || '',
      subject: letterData.subject || 'ಅಧಿಕೃತ ಕಛೇರಿ ಪತ್ರ.',
      reference: letterData.reference || '',
      preamble: letterData.preamble || '',
      recipient: letterData.recipient || '',
      sender: letterData.sender || '',
      bodyHtml: letterData.bodyHtml || '',
      bodyText: letterData.bodyText || '',
      endorsements: letterData.endorsements || [
        'ಸಂಬಂಧಪಟ್ಟವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
        'ಕಛೇರಿ ಕಡತ.'
      ],
      signatory: letterData.signatory || {
        name: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
      },
      employeeName: letterData.employeeName || '',
      kgidNumber: letterData.kgidNumber || '',
      designation: letterData.designation || '',
      officeName: letterData.officeName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
      department: letterData.department || 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
      formatting: letterData.formatting || {
        fontFamily: 'font-sans',
        fontSize: '14px',
        lineSpacing: '1.6',
        margins: 'standard',
        hasHeader: true,
        hasFooter: true,
      },
      status: letterData.status || 'Finalized',
      createdBy: performedBy,
      createdAt: now,
      lastUpdated: now,
      currentVersion: 1,
      versions: [initialVersion],
    };

    this.data.generated_letters.unshift(newLetter);
    this.saveData();

    this.logAudit(
      'MEMORANDUM_GENERATED',
      performedBy,
      role,
      `ಹೊಸ ಪತ್ರ ಸೃಜಿಸಲಾಗಿದೆ: ${newLetter.letterNumber} (${newLetter.letterType})`,
      { orderNumber: newLetter.letterNumber, employeeName: newLetter.employeeName, kgidNumber: newLetter.kgidNumber }
    );

    return newLetter;
  }

  public saveLetterNewVersion(
    id: string,
    newHtml: string,
    newText: string,
    notes: string,
    updatedBy: string = 'admin'
  ): DbGeneratedLetter {
    const letter = this.getGeneratedLetterById(id);
    if (!letter) {
      throw new Error('ಪತ್ರ ಕಂಡುಬಂದಿಲ್ಲ.');
    }

    const now = new Date().toISOString();
    const newVersionNumber = (letter.currentVersion || 1) + 1;
    const newVersionEntry: DbLetterVersion = {
      versionNumber: newVersionNumber,
      updatedAt: now,
      updatedBy,
      letterHtml: newHtml,
      letterText: newText,
      notes: notes || `ಆವೃತ್ತಿ ${newVersionNumber} ತಿದ್ದುಪಡಿ`,
    };

    letter.currentVersion = newVersionNumber;
    letter.bodyHtml = newHtml;
    letter.bodyText = newText;
    letter.lastUpdated = now;
    letter.versions.push(newVersionEntry);

    this.saveData();
    return letter;
  }

  public restoreLetterVersion(
    id: string,
    versionNumber: number,
    restoredBy: string = 'admin'
  ): DbGeneratedLetter {
    const letter = this.getGeneratedLetterById(id);
    if (!letter) {
      throw new Error('ಪತ್ರ ಕಂಡುಬಂದಿಲ್ಲ.');
    }

    const targetVersion = letter.versions.find(v => v.versionNumber === versionNumber);
    if (!targetVersion) {
      throw new Error(`ಆವೃತ್ತಿ ${versionNumber} ಲಭ್ಯವಿಲ್ಲ.`);
    }

    const now = new Date().toISOString();
    const newVersionNumber = (letter.currentVersion || 1) + 1;
    const restoredEntry: DbLetterVersion = {
      versionNumber: newVersionNumber,
      updatedAt: now,
      updatedBy: restoredBy,
      letterHtml: targetVersion.letterHtml,
      letterText: targetVersion.letterText,
      notes: `ಆವೃತ್ತಿ ${versionNumber} ರಿಂದ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ (Restored from Version ${versionNumber})`,
    };

    letter.currentVersion = newVersionNumber;
    letter.bodyHtml = targetVersion.letterHtml;
    letter.bodyText = targetVersion.letterText;
    letter.lastUpdated = now;
    letter.versions.push(restoredEntry);

    this.saveData();
    return letter;
  }

  public deleteGeneratedLetter(id: string, performedBy: string, role: string): boolean {
    if (!this.data.generated_letters) return false;
    const idx = this.data.generated_letters.findIndex(l => l.id === id);
    if (idx === -1) return false;

    const removed = this.data.generated_letters.splice(idx, 1)[0];
    this.saveData();

    this.logAudit(
      'ORDER_DELETED',
      performedBy,
      role,
      `ಪತ್ರ ಅಳಿಸಲಾಗಿದೆ: ${removed.letterNumber} (${removed.letterType})`,
      { orderNumber: removed.letterNumber, employeeName: removed.employeeName }
    );
    return true;
  }

  // 14. LETTER TEMPLATES MANAGEMENT
  public getLetterTemplates(): DbLetterTemplate[] {
    if (!this.data.letter_templates || this.data.letter_templates.length === 0) {
      this.data.letter_templates = DEFAULT_LETTER_TEMPLATES;
      this.saveData();
    }
    return this.data.letter_templates;
  }

  public getLetterTemplateById(id: string): DbLetterTemplate | null {
    return this.getLetterTemplates().find(t => t.id === id || t.typeKey === id) || null;
  }

  public saveLetterTemplate(
    tmpl: Partial<DbLetterTemplate>,
    performedBy: string = 'admin'
  ): DbLetterTemplate {
    if (!this.data.letter_templates) {
      this.data.letter_templates = [...DEFAULT_LETTER_TEMPLATES];
    }

    const now = new Date().toISOString().split('T')[0];

    if (tmpl.id) {
      const idx = this.data.letter_templates.findIndex(t => t.id === tmpl.id);
      if (idx !== -1) {
        const updated: DbLetterTemplate = {
          ...this.data.letter_templates[idx],
          ...tmpl,
          id: this.data.letter_templates[idx].id,
          updatedAt: now,
        };
        this.data.letter_templates[idx] = updated;
        this.saveData();
        return updated;
      }
    }

    const newId = `tmpl-custom-${Date.now()}`;
    const newTmpl: DbLetterTemplate = {
      id: newId,
      typeKey: tmpl.typeKey || `custom_${Date.now()}`,
      nameKannada: tmpl.nameKannada || 'ಹೊಸ ಪತ್ರ ಟೆಂಪ್ಲೇಟ್',
      nameEnglish: tmpl.nameEnglish || 'New Letter Template',
      category: tmpl.category || 'General Correspondence',
      description: tmpl.description || '',
      defaultSubject: tmpl.defaultSubject || '',
      defaultReference: tmpl.defaultReference || '',
      templateHtml: tmpl.templateHtml || '',
      templateText: tmpl.templateText || '',
      defaultEndorsements: tmpl.defaultEndorsements || ['ಕಛೇರಿ ಕಡತ.'],
      isCustom: true,
      updatedAt: now,
    };

    this.data.letter_templates.push(newTmpl);
    this.saveData();
    return newTmpl;
  }

  // 15. LETTER DASHBOARD STATISTICS
  public getLetterDashboardStats(): LetterDashboardStatistics {
    const letters = this.data.generated_letters || [];
    const today = new Date().toISOString().split('T')[0];

    let todayCount = 0;
    let normalCount = 0;
    let memoCount = 0;
    let leaveCount = 0;
    let incCount = 0;
    let pendingDrafts = 0;
    let customCount = 0;

    for (const l of letters) {
      if (l.date === today || (l.createdAt && l.createdAt.startsWith(today))) {
        todayCount++;
      }
      if (l.status === 'Draft') {
        pendingDrafts++;
      }

      const type = (l.letterType || '').toLowerCase();
      if (type.includes('ಸಾಮಾನ್ಯ') || type.includes('normal')) {
        normalCount++;
      } else if (type.includes('ಜ್ಞಾಪನಾ') || type.includes('memorandum')) {
        memoCount++;
      } else if (type.includes('ರಜೆ') || type.includes('leave')) {
        leaveCount++;
      } else if (type.includes('ಬಡ್ತಿ') || type.includes('increment') || type.includes('ಕಾಲಮಿತಿ') || type.includes('ಸ್ವಯಂ ಚಾಲಿತ')) {
        incCount++;
      } else {
        customCount++;
      }
    }

    return {
      totalLetters: letters.length,
      todayCount,
      normalLettersCount: normalCount,
      memorandumOrdersCount: memoCount,
      leaveOrdersCount: leaveCount,
      incrementOrdersCount: incCount,
      pendingDraftsCount: pendingDrafts,
      customLettersCount: customCount,
    };
  }

  // 16. SCHOOLS & INSTITUTION DETAILS (ಅನುದಾನಕ್ಕೆ ಶಾಲೆಗಳ ಪಟ್ಟಿ ಹಾಗೂ ಸಂಸ್ಥೆಗಳ ವಿವರ)
  public getSchools(filter?: {
    search?: string;
    grantStatus?: string;
    recognitionStatus?: string;
    cluster?: string;
  }): DbSchoolInstitution[] {
    let list = this.data.schools || [];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s =>
        (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
        (s.udiseCode && s.udiseCode.toLowerCase().includes(q)) ||
        (s.institutionName && s.institutionName.toLowerCase().includes(q)) ||
        (s.schoolCode && s.schoolCode.toLowerCase().includes(q)) ||
        (s.hmName && s.hmName.toLowerCase().includes(q)) ||
        (s.secretaryName && s.secretaryName.toLowerCase().includes(q)) ||
        (s.schoolPhone && s.schoolPhone.toLowerCase().includes(q)) ||
        (s.hmPhone && s.hmPhone.toLowerCase().includes(q)) ||
        (s.secretaryPhone && s.secretaryPhone.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    }

    if (filter?.grantStatus && filter.grantStatus !== 'all') {
      list = list.filter(s => s.grantStatus === filter.grantStatus);
    }

    if (filter?.recognitionStatus && filter.recognitionStatus !== 'all') {
      list = list.filter(s => s.recognitionStatus === filter.recognitionStatus);
    }

    if (filter?.cluster && filter.cluster !== 'all') {
      list = list.filter(s => s.locationCluster === filter.cluster);
    }

    return list;
  }

  public getSchoolById(id: string): DbSchoolInstitution | undefined {
    return (this.data.schools || []).find(s => s.id === id || s.schoolCode === id || s.udiseCode === id);
  }

  public createSchool(schoolData: Partial<DbSchoolInstitution>, user?: { displayName: string; role: string }): DbSchoolInstitution {
    if (!this.data.schools) {
      this.data.schools = [];
    }

    const id = `sch-${Date.now()}`;
    const code = schoolData.schoolCode || `BHD-${Math.floor(100 + Math.random() * 900)}`;

    const newSchool: DbSchoolInstitution = {
      id,
      schoolCode: code,
      schoolName: schoolData.schoolName || 'ಹೊಸ ಶಾಲೆ',
      udiseCode: schoolData.udiseCode || '',
      institutionName: schoolData.institutionName || '',
      societyRegNumber: schoolData.societyRegNumber || '',
      grantStatus: schoolData.grantStatus || 'Unaided',
      grantOrderNumber: schoolData.grantOrderNumber || '',
      grantOrderDate: schoolData.grantOrderDate || '',
      schoolPhone: schoolData.schoolPhone || '',
      hmName: schoolData.hmName || '',
      hmPhone: schoolData.hmPhone || '',
      secretaryName: schoolData.secretaryName || '',
      secretaryPhone: schoolData.secretaryPhone || '',
      email: schoolData.email || '',
      address: schoolData.address || '',
      locationCluster: schoolData.locationCluster || 'ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್',
      medium: schoolData.medium || 'Kannada & English',
      schoolCategory: schoolData.schoolCategory || 'High School (8-10)',
      studentCount: Number(schoolData.studentCount) || 0,
      aidedTeachersCount: Number(schoolData.aidedTeachersCount) || 0,
      unaidedTeachersCount: Number(schoolData.unaidedTeachersCount) || 0,
      recognitionValidUpto: schoolData.recognitionValidUpto || '2026-27',
      recognitionStatus: schoolData.recognitionStatus || 'Valid',
      fireSafetyNocValidUpto: schoolData.fireSafetyNocValidUpto || '',
      buildingSafetyValidUpto: schoolData.buildingSafetyValidUpto || '',
      bankAccountNumber: schoolData.bankAccountNumber || '',
      bankIfscCode: schoolData.bankIfscCode || '',
      notes: schoolData.notes || '',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    this.data.schools.unshift(newSchool);

    this.data.audit_logs.unshift({
      id: `aud-sch-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'ADD_SCHOOL',
      performedBy: user?.displayName || 'Admin',
      role: user?.role || 'Admin',
      details: `ಹೊಸ ಶಾಲೆಯನ್ನು ನೋಂದಾಯಿಸಲಾಗಿದೆ: "${newSchool.schoolName}" (UDISE: ${newSchool.udiseCode}, ಸ್ಥಿತಿ: ${newSchool.grantStatus})`,
    });

    this.saveData();
    return newSchool;
  }

  public updateSchool(
    id: string,
    updates: Partial<DbSchoolInstitution>,
    user?: { displayName: string; role: string }
  ): DbSchoolInstitution {
    if (!this.data.schools) {
      this.data.schools = [];
    }

    const index = this.data.schools.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`School with ID "${id}" not found`);
    }

    const existing = this.data.schools[index];
    const updated: DbSchoolInstitution = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    this.data.schools[index] = updated;

    this.data.audit_logs.unshift({
      id: `aud-sch-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'UPDATE_SCHOOL',
      performedBy: user?.displayName || 'Admin',
      role: user?.role || 'Admin',
      details: `ಶಾಲೆಯ ವಿವರ ನವೀಕರಿಸಲಾಗಿದೆ: "${updated.schoolName}" (ಅನುದಾನ ಸ್ಥಿತಿ: ${updated.grantStatus})`,
    });

    this.saveData();
    return updated;
  }

  public deleteSchool(id: string, user?: { displayName: string; role: string }): boolean {
    if (!this.data.schools) return false;

    const school = this.data.schools.find(s => s.id === id);
    if (!school) return false;

    this.data.schools = this.data.schools.filter(s => s.id !== id);

    this.data.audit_logs.unshift({
      id: `aud-sch-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'DELETE_SCHOOL',
      performedBy: user?.displayName || 'Admin',
      role: user?.role || 'Admin',
      details: `ಶಾಲೆಯ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ: "${school.schoolName}" (UDISE: ${school.udiseCode})`,
    });

    this.saveData();
    return true;
  }

  public resetSchools(): DbSchoolInstitution[] {
    this.data.schools = JSON.parse(JSON.stringify(DEFAULT_SCHOOLS));
    this.saveData();
    return this.data.schools;
  }

  // ==================== PENSION CASE RECORDS (ಪಿಂಚಣಿ ಕಡತ & ಪ್ರಕರಣಗಳ ನಿರ್ವಹಣೆ) ====================
  public getPensionCases(query?: string): any[] {
    if (!this.data.pension_cases) {
      this.data.pension_cases = [];
    }
    let list = [...this.data.pension_cases];
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c: any) =>
        (c.employeeName && c.employeeName.toLowerCase().includes(q)) ||
        (c.kgidNumber && c.kgidNumber.toLowerCase().includes(q)) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(q)) ||
        (c.fileNumber && c.fileNumber.toLowerCase().includes(q)) ||
        (c.fileId && c.fileId.toLowerCase().includes(q)) ||
        (c.designation && c.designation.toLowerCase().includes(q)) ||
        (c.officeOrSchool && c.officeOrSchool.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getPensionCaseById(id: string): any | null {
    if (!this.data.pension_cases) return null;
    return this.data.pension_cases.find((c: any) => c.id === id || c.fileId === id || c.caseNumber === id) || null;
  }

  public savePensionCase(caseData: any, user?: { displayName: string; role: string }): any {
    if (!this.data.pension_cases) {
      this.data.pension_cases = [];
    }
    const now = new Date().toISOString();
    const existingIndex = this.data.pension_cases.findIndex((c: any) => c.id === caseData.id);

    if (existingIndex !== -1) {
      const existing = this.data.pension_cases[existingIndex];
      const updated = {
        ...existing,
        ...caseData,
        lastUpdated: now,
      };
      this.data.pension_cases[existingIndex] = updated;
      this.saveData();

      this.data.audit_logs.unshift({
        id: `aud-pen-${Date.now()}`,
        timestamp: now.replace('T', ' ').substring(0, 19),
        action: 'UPDATE_PENSION_CASE' as any,
        performedBy: user?.displayName || 'Case Worker',
        role: user?.role || 'Case Worker',
        details: `ಪಿಂಚಣಿ ಪ್ರಕರಣ ನವೀಕರಿಸಲಾಗಿದೆ: ${updated.employeeName} (KGID: ${updated.kgidNumber || 'N/A'}, ಕಡತ: ${updated.fileNumber})`,
      });
      return updated;
    }

    const newCase = {
      ...caseData,
      id: caseData.id || `pen-case-${Date.now()}`,
      createdAt: now,
      lastUpdated: now,
    };
    this.data.pension_cases.unshift(newCase);
    this.saveData();

    this.data.audit_logs.unshift({
      id: `aud-pen-${Date.now()}`,
      timestamp: now.replace('T', ' ').substring(0, 19),
      action: 'CREATE_PENSION_CASE' as any,
      performedBy: user?.displayName || 'Case Worker',
      role: user?.role || 'Case Worker',
      details: `ಹೊಸ ಪಿಂಚಣಿ ಪ್ರಕರಣ ಸೃಜಿಸಲಾಗಿದೆ: ${newCase.employeeName} (KGID: ${newCase.kgidNumber || 'N/A'}, ಕಡತ: ${newCase.fileNumber})`,
    });

    return newCase;
  }

  public updatePensionCase(id: string, updates: any, user?: { displayName: string; role: string }): any {
    if (!this.data.pension_cases) return null;
    const index = this.data.pension_cases.findIndex((c: any) => c.id === id);
    if (index === -1) return null;

    const existing = this.data.pension_cases[index];
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      lastUpdated: now,
    };
    this.data.pension_cases[index] = updated;
    this.saveData();

    this.data.audit_logs.unshift({
      id: `aud-pen-${Date.now()}`,
      timestamp: now.replace('T', ' ').substring(0, 19),
      action: 'UPDATE_PENSION_CASE' as any,
      performedBy: user?.displayName || 'Case Worker',
      role: user?.role || 'Case Worker',
      details: `ಪಿಂಚಣಿ ಪ್ರಕರಣ ನವೀಕರಿಸಲಾಗಿದೆ: ${updated.employeeName} (KGID: ${updated.kgidNumber})`,
    });

    return updated;
  }

  public deletePensionCase(id: string, user?: { displayName: string; role: string }): boolean {
    if (!this.data.pension_cases) return false;
    const c = this.data.pension_cases.find((item: any) => item.id === id);
    if (!c) return false;

    this.data.pension_cases = this.data.pension_cases.filter((item: any) => item.id !== id);
    this.saveData();

    this.data.audit_logs.unshift({
      id: `aud-pen-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'DELETE_PENSION_CASE' as any,
      performedBy: user?.displayName || 'Admin',
      role: user?.role || 'Admin',
      details: `ಪಿಂಚಣಿ ಪ್ರಕರಣ ಅಳಿಸಲಾಗಿದೆ: ${c.employeeName} (KGID: ${c.kgidNumber})`,
    });

    return true;
  }
}

// Global Singleton Instance
export const db = new RelationalDatabase();
