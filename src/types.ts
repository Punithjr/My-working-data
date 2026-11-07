export interface OfficeSection {
  id: string;
  code: string; // e.g. 'ಆ1', 'ಆ2', 'ಆ3'
  name: string; // e.g. 'ಸ.ಪ್ರಾ.ಶಿ', 'ಪ್ರೌ.ಶಿ'
  description?: string;
  isDefault?: boolean;
}

export type LetterDirection = 'inward' | 'outward';

export type LetterCategory =
  | 'Government Order (GO)'
  | 'Circular & Directive'
  | 'School Inspection & Safety'
  | 'Grant & Budget Sanction'
  | 'Teacher Transfer & Deputation'
  | 'Scholarship & Student Welfare'
  | 'Examination & Curriculum'
  | 'Public Grievance & RTI'
  | 'Affiliation & NOC'
  | 'General Official Notice';

export type LetterPriority = 'Immediate' | 'Urgent' | 'Routine';

export type LetterStatus =
  | 'Pending Action'
  | 'Under Review'
  | 'Approved & Signed'
  | 'Dispatched'
  | 'Closed & Archived';

export type DepartmentSection =
  | 'Academic Wing'
  | 'Administration & Services'
  | 'Accounts & Grants'
  | 'Examination Board'
  | 'Inspection & Quality'
  | 'Legal & Grievances';

export type ConfidentialityLevel =
  | 'Public / Open'
  | 'Departmental Confidential'
  | 'Secret / Policy';

export interface ActionNote {
  id: string;
  author: string;
  designation: string;
  timestamp: string;
  note: string;
  actionType: 'Forward' | 'Approval' | 'Query' | 'Disposition' | 'Note';
}

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  pageCount?: number;
  uploadedAt: string;
  description?: string;
  dataUrl?: string; // Base64 or Object URL for genuine PDF/JPG viewing & downloading
}

export interface EducationLetter {
  id: string;
  referenceNumber: string; // e.g. EDN-DIR/2026/CIR-104
  fileNumber: string; // Master Docket/File link e.g. FILE-2026/SCH-AFFL/402
  direction: LetterDirection; // inward or outward
  subject: string;
  category: LetterCategory;
  senderName: string;
  senderDepartment: string;
  senderDesignation: string;
  recipientName: string;
  recipientDepartment: string;
  recipientDesignation: string;
  dateReceivedOrIssued: string; // YYYY-MM-DD
  dueDate: string; // Action target date
  priority: LetterPriority;
  status: LetterStatus;
  assignedOfficer: string;
  section: DepartmentSection;
  confidentiality: ConfidentialityLevel;
  bodyText: string;
  actionNotes: ActionNote[];
  attachments: DocumentAttachment[];
  endorsements?: string[]; // "Copy forwarded for information and necessary action to: 1..."
  tags: string[];
  financialAmount?: number; // E.g. for Grant-in-aid sanctions
  lastUpdated: string;
  // Official Karnataka Government Inward & Outward Register fields:
  inwardNumber?: string; // ಆವಕ ಸಂಖ್ಯೆ (e.g. ಆವಕ-1/2026-27)
  outwardNumber?: string; // ಜಾವಕ ಸಂಖ್ಯೆ (e.g. ಜಾವಕ-1/2026-27)
  senderLetterNo?: string; // ಮೂಲ ಪತ್ರ ಸಂಖ್ಯೆ
  senderLetterDate?: string; // ಮೂಲ ಪತ್ರ ದಿನಾಂಕ
  dispatchMode?: 'Registered Post' | 'Speed Post' | 'Ordinary Post' | 'By Hand / Peon Book' | 'Email' | 'WhatsApp / Digital'; // ರವಾನೆ ವಿಧಾನ
  trackingNumber?: string; // ಅಂಚೆ ರಶೀದಿ / RL / ಕನ್‌ಸೈನ್‌ಮೆಂಟ್ ಸಂಖ್ಯೆ
  postalStampAmount?: number; // ಅಂಚೆ ವೆಚ್ಚ
  remarks?: string; // ಷರಾ
  fileLetterNumber?: string; // e.g. 45-1, 45-2
  sectionCode?: string; // e.g. ಆ1
  sectionName?: string; // e.g. ಸ.ಪ್ರಾ.ಶಿ
  // ಸರ್ಕಾರಿ ಆದೇಶದಂತೆ ಲಿಂಕ್ (Pursuant to Government Order)
  linkedOrderNumber?: string; // ಆದೇಶ ಸಂಖ್ಯೆ (e.g. ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024)
  linkedOrderId?: string; // ಆದೇಶದ ಐಡಿ
  linkedOrderDate?: string; // ಆದೇಶದ ದಿನಾಂಕ
  linkedOrderSubject?: string; // ಆದೇಶದ ವಿಷಯ
  linkedOrderType?: string; // ಆದೇಶದ ಪ್ರಕಾರ
  // Caseworker details & Print tracking
  caseworkerName?: string; // ಪತ್ರ ತಯಾರಿಸಿದ ವಿಷಯ ನಿರ್ವಾಹಕರು (Caseworker)
  caseworkerDesignation?: string; // ಹುದ್ದೆ (e.g. ವಿಷಯ ನಿರ್ವಾಹಕರು / ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು)
  preparedDate?: string; // ಪತ್ರ ತಯಾರಿಸಿದ ದಿನಾಂಕ
  printStatus?: 'Printed' | 'Pending Print'; // ಮುದ್ರಣ ಸ್ಥಿತಿ
  isPrinted?: boolean; // ಮುದ್ರಿಸಲಾಗಿದೆಯೇ?
  printedAt?: string; // ಮುದ್ರಿಸಿದ ದಿನಾಂಕ/ಸಮಯ
  printCount?: number; // ಎಷ್ಟು ಬಾರಿ ಮುದ್ರಿಸಲಾಗಿದೆ
  showCaseworkerSignature?: boolean; // ಮುದ್ರಣದಲ್ಲಿ ವಿಷಯ ನಿರ್ವಾಹಕರ ಹೆಸರು/ಹುದ್ದೆ ತೋರಿಸಬೇಕೇ?
}

export interface FileMovementRecord {
  id: string;
  fromOfficer: string;
  toOfficer: string;
  sentDate: string;
  remarks: string;
  statusAfterMove: string;
  initiatingOfficer?: string;
  transferTimestamp?: string;
  fromSection?: string;
  toSection?: string;
}

export interface RtiDocketDetails {
  applicationNumber: string; // e.g. RTI/BEO/2026/042
  applicantName: string; // ಅರ್ಜಿದಾರರ ಹೆಸರು
  applicantAddress: string; // ವಿಳಾಸ
  applicantPhone?: string; // ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
  applicationDate: string; // ಸ್ವೀಕರಿಸಿದ ದಿನಾಂಕ (YYYY-MM-DD)
  statutoryDueDate: string; // 30 ದಿನಗಳ ಕಾಲಮಿತಿ ಗಡುವು
  feeDetails: string; // e.g. "₹10 ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್" / "IPO ಸಂ: 54F-9812"
  pioOfficer: string; // ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (BEO)
  apioOfficer: string; // ಸಹಾಯಕ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ
  informationSought: string; // ಕೋರಿದ ಮಾಹಿತಿಯ ವಿವರಗಳು
  rtiStatus: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' | 'ಕಡತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' | 'ಮಾಹಿತಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ' | 'ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ' | 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ';
  replyLetterReference?: string;
  replyDate?: string;
  firstAppellateAuthority: string; // ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ
  uploadedDocs?: DocumentAttachment[]; // PDF or JPG files uploaded
}

export type DocketFileCategory = 
  | 'ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ ಕಡತ (Pension & Retirement)'
  | 'ವೇತನ ಬಡ್ತಿ & ಪರಿಷ್ಕರಣೆ ಕಡತ (Promotion & Pay Revision)'
  | 'ಇಲಾಖಾ ವಿಚಾರಣೆ & ಶಿಸ್ತು ಕ್ರಮ ಕಡತ (Disciplinary & Inquiries)'
  | 'ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ ಕಡತ (Administration & Personnel)'
  | 'ವೇತನ & ಭತ್ಯೆ ಕಡತ (Salary & Increments)'
  | 'ಶೈಕ್ಷಣಿಕ & ಪರೀಕ್ಷಾ ಕಡತ (Academic & Exams)'
  | 'ಲೆಕ್ಕಪತ್ರ & ಅನುದಾನ ಕಡತ (Accounts & Grants)'
  | 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (RTI & Legal)'
  | 'ಶಾಲಾ ತಪಾಸಣೆ & ಗುಣಮಟ್ಟ ಕಡತ (Inspection & Quality)'
  | 'ಇತರೆ ಸಾಮಾನ್ಯ ಕಡತ (General File)';

export interface MasterDocketFile {
  id: string;
  fileNumber: string;
  subject: string;
  section: DepartmentSection;
  fileCategory?: DocketFileCategory | string;
  initiatedDate: string;
  status: 'Active / Open' | 'Under Scrutiny' | 'Pending Higher Approval' | 'Disposed / Closed' | 'Withdrawn' | 'In-Transit' | 'Under Review' | string;
  currentCustodian: string;
  priority: LetterPriority;
  sectionCode?: string; // e.g. ಆ1
  sectionName?: string; // e.g. ಸ.ಪ್ರಾ.ಶಿ
  lettersCount?: number;
  linkedLetterIds: string[];
  movementHistory: FileMovementRecord[];
  movementTrail?: FileMovementRecord[];
  notes?: string;
  isRtiFile?: boolean;
  rtiDetails?: RtiDocketDetails;
  attachments?: DocumentAttachment[];
  createdBy?: string; // ಕಡತ ಸೃಜಿಸಿದ ಬಳಕೆದಾರರು (Admin / User-1 to 5)
  dueDate?: string; // ನಿಗದಿತ ದಿನಾಂಕ (SLA Due Date)
  lastMovedDate?: string;
  fileCode?: string; // e.g. FILE-0001, FILE-0002
  closedAt?: string;
  closedBy?: string;
  closureReason?: string;
  closureComplianceNotes?: string;
  auditLog?: Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
  }>;
}

export interface DakRegisterSummary {
  totalLetters: number;
  totalInward: number;
  totalOutward: number;
  pendingActionCount: number;
  overdueCount: number;
  closedCount: number;
  disposalRate: number; // percentage
  totalGrantsSanctioned: number;
  categoryBreakdown: Record<string, number>;
  sectionBreakdown: Record<string, { total: number; pending: number }>;
  priorityBreakdown: Record<string, number>;
  totalEmployees?: number;
  activeEmployees?: number;
  totalFiles?: number;
  filesBreakdown?: Record<string, number>;
  fileWiseTotals?: Array<{
    fileNumber: string;
    subject: string;
    section: string;
    currentCustodian: string;
    status: string;
    priority: string;
    lettersCount: number;
    financialAmount: number;
  }>;
  aiExecutiveOverview?: string;
}

export interface LetterTemplate {
  id: string;
  title: string;
  category: LetterCategory;
  description: string;
  defaultDirection: LetterDirection;
  suggestedRecipient: string;
  sampleBody: string;
}

export type EmploymentType = 'Permanent' | 'Contractual' | 'Deputation' | 'Probation';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Transferred' | 'Deputation' | 'Retired';
export type EmployeeRole = 
  | 'Director / HOD'
  | 'District Officer'
  | 'Section Officer'
  | 'Superintendent'
  | 'Clerk / Assistant'
  | 'Inspector / Evaluator'
  | 'Faculty / Principal';

export type ServiceSanctionType =
  | 'ಗಳಿಕೆ ರಜೆ'
  | 'ಶಿಶುಪಾಲನ ರಜೆ'
  | '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ'
  | '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ'
  | '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ'
  | '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ'
  | '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ';

export interface ServiceSanctionRecord {
  id: string;
  sanctionType: ServiceSanctionType;
  kgidNumber: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  schoolOrOffice: string;
  fileNumber: string;
  orderNumber: string;
  sanctionDate: string;
  effectiveDate: string;
  previousBasicPay?: number;
  revisedBasicPay?: number;
  payScale?: string;
  leaveFrom?: string;
  leaveTo?: string;
  totalDays?: number;
  leaveReason?: string;
  remarks?: string;
  status: 'Sanctioned' | 'In Process' | 'Forwarded to Treasury';
}

export interface AdminAuthUser {
  id?: string;
  username: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'Admin' | 'Administrator' | 'Case Worker' | 'Data Entry Operator' | 'Viewer' | 'Officer' | 'Superintendent' | 'FDA / Nodal';
  roles?: ('Admin' | 'Administrator' | 'Case Worker' | 'Data Entry Operator' | 'Viewer' | 'Officer' | 'Superintendent' | 'FDA / Nodal')[];
  hasAllRoles?: boolean;
  displayName: string;
  designation: string;
  loginTime: string;
  photoURL?: string;
  authProvider?: 'google' | 'password' | 'system';
  section?: string;
  kgidNumber?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  permissions?: string[];
  createdAt?: string;
}

export type CadreGroup = 'ಗ್ರೂಪ್-ಎ' | 'ಗ್ರೂಪ್-ಬಿ' | 'ಗ್ರೂಪ್-ಸಿ' | 'ಗ್ರೂಪ್-ಡಿ';

export interface Employee {
  id: string;
  employeeCode: string; // e.g. EDN-EMP-1042
  kgidNumber?: string; // Karnataka Government Insurance Department (KGID) Number
  basicPay?: number; // Current Basic Pay (ಮೂಲ ವೇತನ) in ₹
  payScale?: string; // e.g. 37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850
  payLevel?: string; // e.g. 'Level-9'
  fullName: string;
  parentName?: string; // ತಂದೆ/ತಾಯಿ ಹೆಸರು
  designation: string; // ಹುದ್ದೆ
  cadreGroup?: CadreGroup; // ಹುದ್ದೆಯ ವರ್ಗ (Group A/B/C/D)
  section: DepartmentSection;
  officeLocation: string; // ಕಚೇರಿ/ಇಲಾಖೆ / ಶಾಲೆ
  appointmentDate?: string; // ನೇಮಕಾತಿ ದಿನಾಂಕ
  joiningDate: string; // ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ
  lastIncrementDate?: string; // ಹಿಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ
  nextIncrementDate?: string; // ಮುಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ
  incrementMonth?: 'January' | 'July' | string; // ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ತಿಂಗಳು (ಜನವರಿ / ಜುಲೈ)
  earnedLeaveBalance?: number; // ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು (EL)
  halfPayLeaveBalance?: number; // ಅರ್ಧ ವೇತನ ರಜೆ ಶಿಲ್ಕು (HPL)
  casualLeaveBalance?: number; // ಸಾಂದರ್ಭಿಕ ರಜೆ ಶಿಲ್ಕು (CL)
  childCareLeaveQuota?: number; // ಶಿಶುಪಾಲನ ರಜೆ ಒಟ್ಟು ಕೋಟಾ (Default 180 days for female employees, editable)
  childCareLeaveAvailed?: number; // ಶಿಶುಪಾಲನ ರಜೆ ತೆಗೆದುಕೊಂಡ ದಿನಗಳು
  isDdo?: boolean; // ಕಚೇರಿಯ ಡಿಡಿಓ (ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿ) ಹೌದೇ?
  bankAccountNo?: string; // ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ
  bankIfsc?: string; // ಬ್ಯಾಂಕ್ IFSC ಕೋಡ್
  panNumber?: string; // ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ
  aadhaarNumber?: string; // ಆಧಾರ್ ಸಂಖ್ಯೆ
  casteCategory?: string; // ಜಾತಿ / ಪ್ರವರ್ಗ (GM, SC, ST, Cat-1, 2A, 2B, 3A, 3B)
  satsId?: string; // ಸ್ಯಾಟ್ಸ್ (SATS) ಶಿಕ್ಷಕರ ಐಡಿ
  serviceBookVolume?: string; // ಸೇವಾ ಪುಸ್ತಕ ಸಂಪುಟ ಸಂಖ್ಯೆ
  emergencyContact?: string; // ತುರ್ತು ಸಂಪರ್ಕ ವಿವರ
  gender?: string;
  dob?: string;
  age?: number;
  ddoCode?: string;
  placeOfWork?: string;
  epicNo?: string;
  hometown?: string;
  email: string;
  phone: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  role: EmployeeRole;
  qualifications?: string;
  notes?: string;
  otherServiceDetails?: string; // ಇತರೆ ಅಗತ್ಯ ಸೇವಾ ವಿವರಗಳು
  serviceHistory?: ServiceSanctionRecord[];
  salaryHistory?: SalaryHistoryRecord[];
  additionalFields?: Array<{ id: string; key: string; value: string }>; // ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ವಿವರಗಳು
  lastUpdated: string;
}

export interface OrderTypeConfig {
  id: string;
  nameKannada: string;
  nameEnglish: string;
  category: 'leave' | 'increment' | 'advancement';
  description: string;
  isActive: boolean;
  defaultRuleId?: string;
}

export interface PayRule {
  id: string;
  orderTypeId: string;
  orderTypeName: string;
  qualifyingYears: number; // e.g. 10, 15, 20, 25, 30
  incrementType: 'matrix_stage' | 'percentage' | 'fixed_amount' | 'promotional_scale';
  incrementValue: number; // e.g. 1 (stage), 3 (percent), 1250 (amount)
  minBasicPay?: number;
  maxBasicPay?: number;
  effectiveDateRule: 'completion_date' | 'first_of_next_month' | 'order_date';
  governmentOrderRef: string; // e.g. 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018'
  kcsrRuleRef?: string; // e.g. 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 53(ಬಿ)'
  remarks?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  kgidNumber: string;
  employeeName: string;
  date: string; // Record date
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

export interface MemorandumOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderTypeId: string;
  orderTypeName: string;
  kgidNumber: string;
  employeeId?: string;
  employeeName: string;
  parentName?: string;
  designation: string;
  cadreGroup?: string;
  officeName?: string;
  officeLocation?: string;
  officeDepartment?: string;
  officeAddress?: string;
  oldBasicPay: number;
  incrementAmount: number;
  newBasicPay: number;
  payScale?: string;
  effectiveDate: string;
  ruleReference?: string;
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

export interface OrderFile {
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
  fileSize?: string;
  remarks?: string;
  fileDataUrl?: string;
  fileName?: string;
  subject?: string;
  department?: string;
  section?: string;
  status?: 'Active' | 'Disposed' | 'Superseded';
  issuingAuthority?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: 'SALARY_CHANGE' | 'MEMORANDUM_GENERATED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_CREATED' | 'PAY_RULE_EDITED' | 'ORDER_DELETED' | 'BACKUP_RESTORED' | 'LOGIN';
  kgidNumber?: string;
  employeeName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  role: string;
  details: string;
  orderNumber?: string;
}

export interface MemorandumDashboardSummary {
  totalOrders: number;
  totalEmployees: number;
  totalSalaryChanges: number;
  financialImpactMonthly: number;
  ordersByType: Record<string, number>;
  recentOrders: MemorandumOrder[];
  recentSalaryChanges: SalaryHistoryRecord[];
  recentAuditLogs: AuditLogRecord[];
}

export interface OfficeConfig {
  id?: string;
  governmentName?: string;
  departmentName?: string;
  officeName?: string;
  officeAddress: string;
  officerName: string;
  officerDesignation?: string;
  district: string;
  pincode?: string;
  email?: string;
  phone?: string;
  orderPrefix?: string;
  kcsrEdition?: string;
  officeNameKannada?: string;
  officeNameEnglish?: string;
  officerDesignationKannada?: string;
  departmentKannada?: string;
  contactEmail?: string;
  contactPhone?: string;
  ddoCode?: string; // ಡಿಡಿಓ ಕೋಡ್ (ಉದಾ: 14041ED001)
  ddoOfficerName?: string; // ಡಿಡಿಓ ಅಧಿಕಾರಿಗಳ ಹೆಸರು
  ddoDesignation?: string; // ಡಿಡಿಓ ಪದನಾಮ
  ddoKgidNumber?: string; // ಡಿಡಿಓ ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ
  ddoHrmsCode?: string; // ಡಿಡಿಓ HRMS ನೌಕರರ ಕೋಡ್
  ddoEmployeeId?: string; // ಲಿಂಕ್ ಆದ ನೌಕರರ ಗುರುತು (Employee ID)
  ddoMobile?: string;
  ddoEmail?: string;
  ddoOfficeName?: string;
}

export interface OcrExtractedData {
  letterNumber?: string;
  date?: string;
  employeeName?: string;
  kgidNumber?: string;
  designation?: string;
  officeName?: string;
  department?: string;
  subject?: string;
  reference?: string;
  serviceDetails?: string;
  leaveDetails?: string;
  salaryDetails?: string;
  otherInfo?: string;
}

export interface LetterVersion {
  versionNumber: number;
  updatedAt: string;
  updatedBy: string;
  letterHtml: string;
  letterText: string;
  notes?: string;
}

export interface LetterFormattingOptions {
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  margins: string;
  hasHeader: boolean;
  hasFooter: boolean;
}

export interface GeneratedOfficeLetter {
  id: string; // Internal PK
  documentId: string; // Formatted Document ID e.g. DOC-2026/09/LET-482
  letterNumber: string; // Official Letter or Order Number e.g. BEO/BHD/MEMO/2026/104
  date: string; // YYYY-MM-DD
  letterType: string; // e.g. 'ಸಾಮಾನ್ಯ ಪತ್ರ', 'ಜ್ಞಾಪನಾ ಆದೇಶ', 'ಕಚೇರಿ ಆದೇಶ', etc.
  letterCategory: 'normal' | 'memorandum' | 'office_order' | 'leave' | 'increment' | 'certificate' | 'custom';

  // Linked original document
  originalFile?: {
    fileName: string;
    fileSize: string;
    fileType: string;
    uploadedAt: string;
    dataUrl?: string; // base64 or preview data
  };

  // OCR raw & extracted
  ocrRawText?: string;
  ocrExtracted: OcrExtractedData;

  // Prompt / User instruction
  userPrompt: string;

  // Generated Content & Editor fields
  subject: string;
  reference: string;
  preamble?: string;
  recipient?: string;
  sender?: string;
  bodyHtml: string;
  bodyText: string;
  endorsements: string[]; // Copies to (ಪ್ರತಿ ರವಾನೆ)
  signatory: {
    name: string;
    designation: string;
    office: string;
  };

  // Linked employee fields
  employeeName?: string;
  kgidNumber?: string;
  designation?: string;
  officeName?: string;
  department?: string;

  // Formatting options
  formatting?: LetterFormattingOptions;

  status: 'Draft' | 'Finalized' | 'Approved' | 'Dispatched';
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  // Caseworker details & Print tracking
  caseworkerName?: string;
  caseworkerDesignation?: string;
  preparedDate?: string;
  printStatus?: 'Printed' | 'Pending Print';
  isPrinted?: boolean;
  printedAt?: string;
  printCount?: number;
  showCaseworkerSignature?: boolean;

  // Versioning
  currentVersion: number;
  versions: LetterVersion[];
}

export interface OfficeLetterTemplate {
  id: string;
  typeKey: string;
  nameKannada: string;
  nameEnglish: string;
  category: string;
  description: string;
  defaultSubject: string;
  defaultReference: string;
  templateHtml: string;
  templateText: string;
  defaultEndorsements: string[];
  isCustom?: boolean;
  updatedAt: string;
}

export interface LetterDashboardStatistics {
  totalLetters: number;
  todayCount: number;
  normalLettersCount: number;
  memorandumOrdersCount: number;
  leaveOrdersCount: number;
  incrementOrdersCount: number;
  pendingDraftsCount: number;
  customLettersCount: number;
}

export type GeneralLetterCategory = 'employee' | 'other';

export type GeneralLetterOfficialType =
  | 'ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಪತ್ರ'
  | 'ಮನವಿ ಪತ್ರ'
  | 'ಮಾಹಿತಿ ಕೋರುವ ಪತ್ರ'
  | 'ಮಾಹಿತಿ ನೀಡುವ ಪತ್ರ'
  | 'ಉತ್ತರ ಪತ್ರ'
  | 'ವಿವರಣಾತ್ಮಕ ಪತ್ರ'
  | 'ಶಾಲೆಗಳಿಗೆ ಸೂಚನಾ ಪತ್ರ'
  | 'ಶಾಲೆಗಳಿಂದ ವರದಿ ಕೋರುವ ಪತ್ರ'
  | 'ಇತರೆ ಕಚೇರಿಗಳಿಗೆ ಪತ್ರ'
  | 'ಮೇಲಧಿಕಾರಿಗಳಿಗೆ ಪತ್ರ'
  | 'ನೆನಪೋಲೆ ಪತ್ರ'
  | 'ಅನುಮತಿ ಕೋರುವ ಪತ್ರ'
  | 'ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸುವ ಪತ್ರ'
  | 'ವರದಿ ಸಲ್ಲಿಸುವ ಪತ್ರ'
  | 'ದೃಢೀಕರಣ ಪತ್ರ'
  | 'ಸ್ವೀಕೃತಿ ಪತ್ರ'
  | 'ಕಚೇರಿ ವ್ಯವಹಾರಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಇತರೆ ಪತ್ರಗಳು';

export interface GeneralLetterFormData {
  category?: GeneralLetterCategory;
  letterType: GeneralLetterOfficialType;
  language: 'kannada' | 'english';
  fileId?: string;
  fileNumber?: string;
  letterNumber?: string;
  date: string;
  // Recipient details
  recipientOfficer: string;
  recipientDesignation: string;
  recipientOffice: string;
  recipientAddress: string;
  recipient?: string;
  // Content details
  subject: string;
  reference: string; // Optional - never forced
  mainContent: string;
  actionRequired: string;
  deadline?: string;
  enclosures?: string;
  copiesTo?: string;
  additionalPrompt?: string;
  // Backward compatibility fields
  employeeName?: string;
  kgidNumber?: string;
  designation?: string;
  otherInstructions?: string;
  // Caseworker details & Print settings
  caseworkerName?: string;
  caseworkerDesignation?: string;
  preparedDate?: string;
  printStatus?: 'Printed' | 'Pending Print';
  showCaseworkerSignature?: boolean;
}

// ==================== NAVIGATION TABS ====================
export type AppNavTab = 
  | 'home'
  | 'fileDashboard'
  | 'hrms'
  | 'leaveCalendar'
  | 'pension'
  | 'generalLetter'
  | 'officialLetter'
  | 'memorandum' 
  | 'employees' 
  | 'orderFiles' 
  | 'salaryChanges' 
  | 'reports' 
  | 'search' 
  | 'settings' 
  | 'schools'
  | 'registry' 
  | 'files' 
  | 'drafter' 
  | 'rti'
  | 'prapathra28'
  | 'circularStudio'
  | 'masterAudit'
  | 'statutoryBooks'
  | 'govOrders'
  | 'userManagement'
  | 'pdfScanner'
  | 'pdfCompressor'
  | 'pdfMerger'
  | 'jpgConverter'
  | 'imageCompressor'
  | 'mobileApp';

// ==================== HRMS (HUMAN RESOURCE MANAGEMENT SYSTEM) TYPES ====================
export interface HrmsTransferRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  kgidNumber: string;
  designation: string;
  orderNumber: string;
  orderDate: string;
  issuingAuthority?: string; // ವರ್ಗಾವಣೆ ಆದೇಶ ನೀಡಿದ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ / ಅಧಿಕಾರಿಯ ವಿವರ (Issuing Authority)
  orderFileUrl?: string; // ವರ್ಗಾವಣೆ ಆದೇಶದ ಪ್ರತಿ (Uploaded document / PDF / scan)
  orderFileName?: string; // ಕಡತದ ಹೆಸರು (e.g. transfer_order_2026.pdf)
  orderFileSize?: string;
  orderUploadedAt?: string;
  transferType: 'ಆಡಳಿತಾತ್ಮಕ ವರ್ಗಾವಣೆ' | 'ಕೌನ್ಸಿಲಿಂಗ್ ವರ್ಗಾವಣೆ' | 'ಪರಸ್ಪರ ವರ್ಗಾವಣೆ' | 'ಕೋರಿಕೆ ವರ್ಗಾವಣೆ' | 'ನಿಯೋಜನೆ';
  fromOffice: string;
  toOffice: string;
  relievingDate?: string;
  joiningDate?: string;
  status: 'ಆದೇಶ ಜಾರಿ' | 'ಕಾರ್ಯಮುಕ್ತ' | 'ವರದಿ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ' | 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ';
  lpcGenerated: boolean;
  notes?: string;
}

export interface HrmsLeaveSanctionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  kgidNumber: string;
  designation: string;
  leaveType: 'ಸಾಂದರ್ಭಿಕ ರಜೆ (CL)' | 'ಗಳಿಕೆ ರಜೆ (EL)' | 'ಅರ್ಧ ವೇತನ ರಜೆ (HPL)' | 'ಪರಿವರ್ತಿತ ರಜೆ (Commuted)' | 'ಶಿಶುಪಾಲನ ರಜೆ (CCL)' | 'ಹೆರಿಗೆ ರಜೆ (Maternity)' | 'ಪಿತೃತ್ವ ರಜೆ (Paternity)';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  sanctionOrderNumber: string;
  sanctionDate: string;
  approvingAuthority: string;
  status: 'ಮಂಜೂರಾಗಿದೆ' | 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' | 'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ' | 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ';
}

export interface HrmsPayBillRecord {
  id: string;
  billMonth: string; // e.g. 'ಮಾರ್ಚ್ 2026'
  billYear: number;
  billNumber: string;
  ddoCode: string;
  treasuryCode: string;
  majorHead: string;
  totalEmployees: number;
  grossAmount: number;
  totalDeductions: number;
  netPayable: number;
  tokenNumber?: string;
  tokenDate?: string;
  status: 'DDO ತಯಾರಿಸಿದೆ' | 'ಖಜಾನೆಗೆ ಸಲ್ಲಿಕೆ' | 'ಖಜಾನೆ ಪಾಸ್' | 'ಖಾತೆಗೆ ಜಮೆ';
  generatedAt: string;
}

export interface HrmsAparRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  kgidNumber: string;
  designation: string;
  cadre: string;
  reportingYear: string;
  selfAppraisalDate: string;
  reportingOfficer: string;
  reviewingOfficer: string;
  overallGrading: 'ಅತ್ಯುತ್ತಮ (Outstanding)' | 'ಬಹಳ ಉತ್ತಮ (Very Good)' | 'ಉತ್ತಮ (Good)' | 'ಸಾಧಾರಣ (Average)';
  adverseRemarks: boolean;
  status: 'ಅಂತಿಮಗೊಂಡಿದೆ' | 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' | 'ಸ್ವಯಂ ಮೌಲ್ಯಮಾಪನ';
}

export interface HrmsLpcCertificate {
  id: string;
  employeeName: string;
  kgidNumber: string;
  hrmsCode: string;
  designation: string;
  fromOffice: string;
  toOffice: string;
  relievingDate: string;
  lastBasicPay: number;
  daAmount: number;
  hraAmount: number;
  medicalAllowance: number;
  kgidPremium: number;
  gpfNpsDeduction: number;
  gisDeduction: number;
  ptDeduction: number;
  incomeTaxDeduction: number;
  licDeduction: number;
  festivalAdvanceBalance: number;
  earnedLeaveBalance: number;
  halfPayLeaveBalance: number;
  ddoSignatory: string;
  orderNumber: string;
}

export interface HrmsServiceBookEntry {
  id: string;
  entryDate: string;
  category: 'ನೇಮಕಾತಿ' | 'ಪರಿವೀಕ್ಷಣಾ ಅವಧಿ' | 'ಸಕ್ರಮೀಕರಣ' | 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ' | 'ಕಾಲಬದ್ಧ ಬಡ್ತಿ (TBAS)' | 'ವರ್ಗಾವಣೆ / ಸ್ಥಳನಿಯುಕ್ತಿ' | 'ಪದೋನ್ನತಿ' | 'ವಿಶೇಷ ಸೇವೆ';
  orderNoAndDate: string;
  details: string;
  payScale: string;
  basicPay: number;
  verifiedByDdo: boolean;
  verifiedDate?: string;
}

export type LeaveCategory = 
  | 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)' 
  | 'ಹೆರಿಗೆ ರಜೆ (Maternity Leave)' 
  | 'ಗಳಿಕೆ ರಜೆ (Earned Leave)' 
  | 'ಪರಿವರ್ತಿತ ರಜೆ (Commuted Leave)' 
  | 'ಸಾಂದರ್ಭಿಕ ರಜೆ (Casual Leave)';

export interface LeaveRequestRecord {
  id: string;
  employeeId?: string;
  employeeName: string;
  kgidNumber: string;
  designation: string;
  gender?: string;
  placeOfWork?: string;
  leaveType: LeaveCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  status: 'Sanctioned' | 'Pending Approval' | 'Under Review' | 'Completed' | 'Rejected';
  orderNumber?: string;
  orderDate?: string;
  reason: string;
  quotaBefore: number;
  quotaConsumed: number;
  quotaRemaining: number;
  childDetails?: string; // e.g. "ಮಗುವಿನ ಹೆಸರು: ಆನ್ವಿ (ವಯಸ್ಸು 4 ವರ್ಷ)"
  sanctioningAuthority?: string; // e.g. "ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ"
  notes?: string;
  createdAt?: string;
}


export type SchoolGrantStatus = 'Aided' | 'Unaided' | 'Proposed for Grant' | 'Partially Aided';
export type SchoolCategoryType = 'Pre-Primary' | 'Primary (1-5)' | 'Higher Primary (1-8)' | 'High School (8-10)' | 'Composite (1-10)';

export interface SchoolInstitution {
  id: string;
  schoolCode: string;
  schoolName: string;
  udiseCode: string;
  institutionName: string; // ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ / ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು
  managementName?: string; // ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು (Alias)
  societyRegNumber: string; // ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ ಮತ್ತು ದಿನಾಂಕ
  grantStatus: SchoolGrantStatus; // ಅನುದಾನ ಸ್ಥಿತಿ (ವೇತನಾನುದಾನಿತ / ಅನುದಾನ ರಹಿತ / ಪ್ರಸ್ತಾವಿತ ಅನುದಾನ)
  grantOrderNumber?: string; // ಅನುದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂಖ್ಯೆ
  grantOrderDate?: string; // ಅನುದಾನ ಆದೇಶ ದಿನಾಂಕ
  schoolPhone?: string; // ಶಾಲಾ ಕಚೇರಿ ದೂರವಾಣಿ
  hmName: string; // ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು
  hmPhone: string; // ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
  secretaryName?: string; // ಸಂಸ್ಥೆಯ ಅಧ್ಯಕ್ಷರು / ಕಾರ್ಯದರ್ಶಿ ಹೆಸರು
  secretaryPhone?: string; // ಕಾರ್ಯದರ್ಶಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
  email?: string;
  address?: string;
  locationCluster: string; // ಕ್ಲಸ್ಟರ್ (e.g. ಹಳೇನಗರ, ಹೊಸನಗರ, ಕುದ್ರಿಗೆರೆ, ಹೊಳೆಹೊನ್ನೂರು)
  medium: 'Kannada' | 'English' | 'Kannada & English';
  schoolCategory: SchoolCategoryType;
  studentCount: number;
  aidedTeachersCount: number;
  unaidedTeachersCount: number;
  recognitionValidUpto: string; // e.g. '2026-27'
  recognitionStatus: 'Valid' | 'Renewal Due' | 'Expired';
  fireSafetyNocValidUpto?: string;
  buildingSafetyValidUpto?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  notes?: string;
  lastUpdated?: string;
}

// ==================== PENSION MANAGEMENT & RETIREMENT BENEFITS ====================

export type PensionRetirementType = 
  | 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)'
  | 'ಸ್ವಯಂ ನಿವೃತ್ತಿ (Voluntary Retirement)'
  | 'ಅಶಕ್ತತಾ ಪಿಂಚಣಿ (Invalid Pension)'
  | 'ಸೇವೆಯಲ್ಲಿದ್ದಾಗ ಮರಣ (Family Pension on Death)'
  | 'ಕಡ್ಡಾಯ ನಿವೃತ್ತಿ (Compulsory Retirement)';

export interface PensionCalculationResult {
  // Service calculations
  grossYears: number;
  grossMonths: number;
  grossDays: number;
  nonQualifyingDays: number;
  netQualifyingYears: number;
  netQualifyingMonths: number;
  netQualifyingDays: number;
  qualifyingHalfYears: number; // completed 6-monthly periods (cap: 60 for pension, 66 for DCRG)
  isEligibleForFullPension: boolean; // 60 half-years (30 years)
  isEligibleForRegularPension: boolean; // >= 20 half-years (10 years)
  retirementAgeYears: number; // 60 or 65 years

  // Emoluments
  lastBasicPay: number;
  daPercentage: number;
  daAmount: number;
  averageEmoluments: number;

  // Monthly Pension (1. ಮಾಸಿಕ ಪಿಂಚಣಿ)
  fullPension: number; // 50% of Basic Pay
  basicServicePension: number; // proportionate to qualifying service
  commutedPortion: number; // Portion commuted (up to 40% or 33.33%)
  reducedMonthlyPension: number; // basicServicePension - commutedPortion
  dearnessRelief: number; // DR on basicServicePension
  medicalAllowance: number; // Fixed ₹500
  totalMonthlyReceivable: number; // reducedMonthlyPension + DR + medical

  // Lump sum Benefits - Commutation (3. ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ)
  commutationFactor: number;
  commutationLumpSum: number; // commutedPortion * 12 * factor
  commutationRestorationYears: number; // 15 years

  // DCRG (2. ನಿವೃತ್ತಿ ಉಪದಾನ - Death-cum-Retirement Gratuity)
  dcrgRaw: number;
  dcrgSanctioned: number; // Capped at ₹20,00,000 & 16.5 months

  // Family Pension
  familyPensionNormal: number; // 30% of Basic Pay (min ₹13,500)
  familyPensionEnhanced: number; // 50% of Basic Pay (for 7 yrs or till 67 age)

  // Leave Encashment (4. ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ)
  earnedLeaveDays: number;
  leaveEncashmentAmount: number; // (Basic + DA) / 30 * days (max 300)
  halfPayLeaveDays?: number;
  halfPayEncashmentAmount?: number;
  totalLeaveEncashmentSanctioned: number;

  // Grand Total Terminal Lump Sum (ಒಟ್ಟು ಅಂತಿಮ ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳು = Gratuity + Commutation + EL)
  totalTerminalLumpSum: number; // DCRG + Commutation + Leave Encashment
}

export interface PensionDocumentsChecklist {
  serviceBookVerified: boolean; // ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ & ದೃಢೀಕರಣ
  form7Triplicate: boolean; // ಪ್ರಪತ್ರ-7 (ಮೂರು ಪ್ರತಿಗಳಲ್ಲಿ)
  jointPhotosAttested: boolean; // ಜಂಟಿ ಭಾವಚಿತ್ರಗಳು (ದೃಢೀಕರಿಸಿದ)
  specimenSignatures: boolean; // ಮಾದರಿ ಸಹಿ & ಹೆಬ್ಬೆರಳ ಗುರುತು (ನಮೂನೆ-1/2)
  noDueCertificate: boolean; // ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ (NDC)
  lastPayCertificate: boolean; // ಕೊನೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (LPC)
  form1And2Nomination: boolean; // ನಾಮನಿರ್ದೇಶನ ಪತ್ರ
  aadharBankPassbook: boolean; // ಆಧಾರ್ & ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ಪ್ರತಿ
}

export type PensionCaseStatus = 
  | 'ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ (Drafting)'
  | 'ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)'
  | 'BEO ಅನುಮೋದಿತ (Sanctioned by BEO)'
  | 'ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ರವಾನೆ (Sent to AG Karnataka)'
  | 'PPO ಮಂಜೂರಾಗಿದೆ (PPO Issued)'
  | 'ವಿಲೇವಾರಿ ಮುಕ್ತಾಯ (Completed & Disposed)';

export interface PensionSchoolServiceRecord {
  id: string;
  schoolName: string; // ಶಾಲೆಯ ಹೆಸರು & ಸ್ಥಳ
  designation: string; // ಹುದ್ದೆ (ಸಹ ಶಿಕ್ಷಕರು)
  appointmentType: string; // ಮೂಲ / ಪ್ರಭಾರ
  startDate: string; // ಪ್ರಾರಂಭ ದಿನಾಂಕ
  endDate: string; // ಮುಕ್ತಾಯ ದಿನಾಂಕ
  qualifyingServiceString: string; // e.g. "8-4-13" (8 ವರ್ಷ, 4 ತಿಂಗಳು, 13 ದಿನ)
  remarks?: string; // ಪರಿಶೋಧನಾ ಅಧಿಕಾರಿಯ ಷರಾ
}

export interface PensionYearlyLeaveRecord {
  id: string;
  year: number; // e.g. 1994, 1995...
  openingBalance: number; // ಪ್ರಾರಂಭಿಕ ಶಿಲ್ಕು (Opening)
  credited: number; // ಜಮೆ (Credited - 10 for teachers, 30 for non-teachers, pro-rated in joining year)
  specialCovidDutyDays?: number; // Legacy alias for backward compatibility
  otherSanctionedDays?: number; // ಇತರೆ ಮಂಜೂರಾದ ರಜೆ (Other Sanctioned Leave)
  totalAvailable?: number; // ಒಟ್ಟು ಜಮೆ / ಶಿಲ್ಕು (Auto count: Opening + Credited + Other Sanctioned)
  availed: number; // ಬಳಕೆ (Availed)
  leaveTakenDetails?: string; // ಭರ್ತಿ ಮಾಡಿದಾಗ ರಜೆ ವಿವರ (Leave Taken / Sanction Order details)
  availedSpellDetails?: string; // ರಜೆ ವಿವರ / ಅವಧಿ & ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವಿವರ (Leave Details, Period & Encashment)
  encashmentDetails?: string; // ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವಿವರ (Earned Leave Encashment Details)
  closingBalance: number; // ಅಂತಿಮ ಶಿಲ್ಕು (Closing Balance)
}

export interface PensionAttachedWorksheet {
  id: string;
  name: string; // e.g. "ಸೇವಾ ಪರಿಶೋಧನಾ ವರ್ಕ್‌ಶೀಟ್", "ವೇತನ ಬಾಕಿ ವರ್ಕ್‌ಶೀಟ್"
  worksheetType: 'service_worksheet' | 'pay_worksheet' | 'leave_account' | 'service_book_extract' | 'other';
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt: string;
  verifiedBy?: string;
  verified: boolean;
  notes?: string;
}

export interface PensionCaseRecord {
  id: string;
  caseNumber: string; // e.g. BEO/BHD/PEN/2026/01
  fileNumber: string; // e.g. ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಪಿಂಚಣಿ/ಕಡತ-14/2026-27
  fileId?: string;
  employeeId?: string;
  kgidNumber: string;
  employeeName: string;
  parentOrSpouseName: string;
  fatherName?: string;
  religionNationality?: string;
  permanentAddress?: string;
  homeAddress?: string; // ನೌಕರರ ಮನೆ ವಿಳಾಸ / ಶಾಶ್ವತ ವಾಸಸ್ಥಳದ ವಿಳಾಸ
  identificationMarks?: string[];
  heightFeet?: string;
  designation: string;
  cadreGroup: string;
  officeOrSchool: string;
  gender: string;
  dob: string;
  doa: string; // Date of Appointment
  dor: string; // Date of Retirement
  pensionStartDate?: string; // Date from which pension commences (e.g., 01-08-2026)
  retirementAgeYears?: 60 | 65; // 60 for state govt/school, 65 for UGC/special cadres
  retirementType: PensionRetirementType;

  // Pay & Service
  payScale: string;
  lastBasicPay: number;
  daPercentage: number;
  averageEmoluments?: number;
  earnedLeaveDays: number; // EL balance (max 300)
  halfPayLeaveDays?: number; // HPL balance
  nonQualifyingDays: number; // EOL, Dies-non etc.

  // Dynamic Work History & Leave Records
  workHistorySchools?: PensionSchoolServiceRecord[];
  yearlyLeaveHistory?: PensionYearlyLeaveRecord[];
  attachedWorksheets?: PensionAttachedWorksheet[];

  // GPF & GIS Settlement Details
  gpfAgOrderNumber?: string;
  gpfAgSanctionedAmount?: number;
  gpfHeadOfAccount?: string;
  gisSavingsFundAmount?: number;
  gisHeadOfAccount?: string;
  elEncashmentHeadOfAccount?: string;

  // Commutation
  commutationOpted: boolean;
  commutationPercentage: number; // e.g. 40 or 33.33
  ageNextBirthday: number; // e.g. 61 for age 60, 66 for age 65

  // Nominee & Bank Details
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
  familyMembers?: { name: string; relation: string; dob: string; maritalStatus?: string }[];
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  ifscCode: string;
  treasuryName: string; // e.g. 'ಉಪ ಖಜಾನೆ, ಭದ್ರಾವತಿ'
  ppoNumber?: string; // Pension Payment Order Number

  // Calculations & Checklist
  calculation: PensionCalculationResult;
  checklist: PensionDocumentsChecklist;
  status: PensionCaseStatus;
  movementHistory: FileMovementRecord[];
  remarks?: string;
  createdAt: string;
  lastUpdated: string;
}

export type PensionLetterFormatType = 
  | 'pension_calc_sheet' // 1. ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ - Calculation Statement)
  | 'form7' // 2. ಪ್ರಪತ್ರ-7 (ಪಿಂಚಣಿ ಮತ್ತು ಉಪದಾನದ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ - Form 7)
  | 'avg_emoluments_12m' // 3. ವಿಭಾಗ-II : ಕಳೆದ 12 ತಿಂಗಳಲ್ಲಿ ಪಡೆದ ಉಪಲಬ್ಧಗಳು (Average Emoluments 12 Months)
  | 'schools_service_history' // 4. ವಿಭಾಗ-1 : ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಶಾಲೆಗಳ ಸೇವಾ ವಿವರಗಳು (Schools Work History)
  | 'sanction_order' // 5. ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಸಕ್ಷಮ ಅಧಿಕಾರಿಯ ಆದೇಶ (BEO Sanction Order)
  | 'gratuity_order' // 6. ನಿವೃತ್ತಿ ಉಪದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ (DCRG Sanction Order ₹14,43,200)
  | 'earned_leave_sheet' // 7. ಗಳಿಕೆ ರಜೆ ವಿವರಣೆ ಪಟ್ಟಿ (Earned Leave History & Encashment Sheet)
  | 'el_office_order_kannada' // 8. ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಕಚೇರಿ ಆದೇಶ (ಕನ್ನಡ)
  | 'el_office_order_english' // 9. Earned Leave Encashment Office Order (English)
  | 'provisional_order' // 10. ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನ (Anticipatory Pension KCSR 341)
  | 'non_receipt_recovery' // 11. ಯಾವುದೇ ನಿವೃತ್ತಿ ವೇತನ ಸ್ವೀಕರಿಸದಿರುವ ಘೋಷಣೆ & ವಸೂಲಿ ಒಪ್ಪಿಗೆ ಪತ್ರ
  | 'specimen_signatures_photo' // 12. ಮಾದರಿ ಸಹಿ, ಎತ್ತರ, ಗುರುತು, ಜಂಟಿ ಭಾವಚಿತ್ರ & ಬಾಕಿ ರಹಿತ ಪತ್ರ
  | 'self_address_slips' // ಸ್ವವಿಳಾಸ ಚೀಟಿ (Self Address Slips - 2 Slips)
  | 'family_pension_nomination' // 13. ಕುಟುಂಬ ವೇತನದ ಬಗ್ಗೆ ನಾಮ ನಿರ್ದೇಶನ (Nomination Form)
  | 'non_reemployment_undertaking' // ಮರು ನೌಕರಿಯಿಲ್ಲ ದೃಢೀಕರಣ & ಅಗತ್ಯವಾದ ಘೋಷಣೆ
  | 'pension_sanction_summary' // ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರಾತಿ ಸಾರಾಂಶ ಪಟ್ಟಿ
  | 'gpf_final_withdrawal' // 14. ಜಿ.ಪಿ.ಎಫ್ (GPF) ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ & 12 ತಿಂಗಳ ಮುಂಗಡರಹಿತ ಪ್ರಮಾಣಪತ್ರ
  | 'gpf_form_6b' // 15. ನಮೂನೆ 6 (ಬಿ) : ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ಉಳಿಕೆಯ ಅಂತಿಮ ಸಂದಾಯಕ್ಕೆ ಅರ್ಜಿ
  | 'gpf_office_order' // 16. ಜಿ.ಪಿ.ಎಫ್ ಅಂತಿಮ ಪಾವತಿ ಕಚೇರಿ ಆದೇಶ (GPF Final Payment Office Order)
  | 'gis_office_order' // 17. ಜಿ.ಐ.ಎಸ್ (GIS) ಅಂತಿಮ ಉಳಿತಾಯ ನಿಧಿ ಮಂಜೂರಾತಿ ಕಚೇರಿ ಆದೇಶ
  | 'fingerprints_sheet' // 18. 10 ಬೆರಳುಗಳ ಗುರುತು ಪಟ್ಟಿ (Left Hand Fingerprints for Pensioner & Spouse)
  | 'retirement_advance_form' // 19. ನಿವೃತ್ತಿ ದಿನಾಂಕಕ್ಕಿಂತ 1 ವರ್ಷ ಮುಂಚಿತವಾಗಿ ಪಡೆಯಬೇಕಾದ ವಿವರ (Retirement Bio-data & 1/3 Commutation)
  | 'non_qualifying_service' // 20. ವಿಭಾಗ-III & IV : ಅನರ್ಹತಾ ಸೇವೆ & ವೇತನ ಪಟ್ಟಿಗೆ ಸಂಬಂಧಿಸಿದ ಶೋಧಿಸದಿದ್ದ ಸೇವಾ ಅವಧಿ
  | 'form1_2' // ನಮೂನೆ-1 & 2 (ಪಿಂಚಣಿ ಅರ್ಜಿ ಮತ್ತು ಕುಟುಂಬ ವಿವರ / ನಾಮನಿರ್ದೇಶನ)
  | 'form6' // ನಮೂನೆ-6 (ಸೇವಾ ಪರಿಶೀಲನೆ ಮತ್ತು ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ)
  | 'commutation_order' // ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಮಂಜೂರಾತಿ ಆದೇಶ (Commutation Sanction Order)
  | 'el_encashment_order' // ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರಾತಿ ಆದೇಶ (EL Encashment Sanction Order)
  | 'service_verification_cert' // ಸೇವಾ ಪರಿಶೀಲನಾ ಪ್ರಮಾಣಪತ್ರ (Service Verification Certificate)
  | 'ag_forwarding' // ಮಹಾಲೆಕ್ಕಪಾಲರಿಗೆ (AG Karnataka) ಪ್ರಸ್ತಾವನಾ ರವಾನೆ ಪತ್ರ
  | 'no_dues_cert'; // ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ (No Dues & Vigilance Clearance Certificate)

// ==================== RTI (RIGHT TO INFORMATION ACT) TYPES ====================
export type RtiStatus = 
  | 'ಸ್ವೀಕೃತ (Pending)' 
  | 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)' 
  | 'ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ (Information Furnished)' 
  | 'ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾಯಿಸಲಾಗಿದೆ (Transferred Sec 6(3))' 
  | 'ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ (Fee Demanded)' 
  | 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (Rejected Sec 8/9)' 
  | 'ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ವಿಚಾರಣೆ (First Appeal Hearing)' 
  | 'ವಿಲೇವಾರಿ & ದಾಖಲಿಸಲಾಗಿದೆ (Closed & Disposed)';

export type RtiFeePaymentMode = 
  | 'ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ (Court Fee Stamp ₹10)' 
  | 'ಐ.ಪಿ.ಓ (Indian Postal Order - IPO)' 
  | 'ಡಿ.ಡಿ (Demand Draft)' 
  | 'ಖಜಾನೆ ಚಲನ್ (Treasury Challan)' 
  | 'ನಗದು ಪಾವತಿ (Cash Receipt)' 
  | 'ಬಿ.ಪಿ.ಎಲ್ ವಿನಾಯಿತಿ (BPL Exemption - ಉಚಿತ)';

export type RtiSectionClause = 
  | 'ಕಲಂ 6(1) - ಸಾಮಾನ್ಯ ಅರ್ಜಿ (30 Days)' 
  | 'ಕಲಂ 6(3) - ಇತರೆ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾವಣೆ (5 Days)' 
  | 'ಕಲಂ 7(1) - ಜೀವ ಅಥವಾ ಸ್ವಾತಂತ್ರ್ಯ (48 Hours)' 
  | 'ಕಲಂ 19(1) - ಪ್ರಥಮ ಮೇಲ್ಮನವಿ (First Appeal)';

export interface RtiCaseRecord {
  id: string;
  applicationNumber: string; // e.g. RTI/BEO/BHD/2026/01
  fileNumber: string; // e.g. ಆ2/ಮಾಹಿತಿ ಹಕ್ಕು/ಕಡತ-04/2026-27
  applicantName: string;
  applicantAddress: string;
  applicantPhone?: string;
  applicantEmail?: string;
  isBpl: boolean;
  bplCardNumber?: string;
  feeMode: RtiFeePaymentMode;
  feeReceiptNumber?: string;
  feeAmount: number;
  receivedDate: string; // YYYY-MM-DD
  targetResponseDate: string; // 30-day deadline
  sectionClause: RtiSectionClause;
  subject: string;
  informationSought: string;
  assignedOfficer: string; // PIO designation
  firstAppellateAuthority: string; // BEO
  status: RtiStatus;
  disposalDate?: string;
  disposalSummary?: string;
  furtherFeeAmount?: number;
  furtherFeePages?: number;
  transfereeAuthorityName?: string;
  transferDate?: string;
  rejectionClause?: string;
  appealNumber?: string;
  appealHearingDate?: string;
  appealDecision?: string;
  notes?: { id: string; author: string; date: string; text: string }[];
  attachments?: DocumentAttachment[];
  createdAt: string;
  lastUpdated: string;
}

export type RtiLetterFormatType = 
  | 'info_furnish_letter' // ಮಾಹಿತಿ ಒದಗಿಸುವ ಅಧಿಕೃತ ಪತ್ರ
  | 'sec6_3_transfer' // ಕಲಂ 6(3) ರನ್ವಯ ವರ್ಗಾವಣೆ ಪತ್ರ
  | 'further_fee_demand' // ಕಲಂ 7(3) ರನ್ವಯ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಬೇಡಿಕೆ ಪತ್ರ
  | 'first_appeal_notice' // ಕಲಂ 19(1) ರನ್ವಯ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ವಿಚಾರಣಾ ನೋಟಿಸ್
  | 'sec8_rejection' // ಕಲಂ 8/9 ರನ್ವಯ ಮಾಹಿತಿ ತಿರಸ್ಕಾರ ಆದೇಶ
  | 'quarterly_proforma'; // ಮಾಹಿತಿ ಹಕ್ಕು ತ್ರೈಮಾಸಿಕ/ವಾರ್ಷಿಕ ರಿಜಿಸ್ಟರ್ ತಃಖ್ಯೆ

// ==================== GOVERNMENT ORDERS LIBRARY TYPES ====================
export type GovOrderType =
  | 'Government Order (ಸರ್ಕಾರಿ ಆದೇಶಗಳು)'
  | 'Circular (ಸುತ್ತೋಲೆಗಳು)'
  | 'Notification (ಅಧಿಸೂಚನೆಗಳು)'
  | 'Government Rules (ನಿಯಮಾವಳಿಗಳು)'
  | 'Amendment (ತಿದ್ದುಪಡಿಗಳು)'
  | 'Department Instructions (ಇಲಾಖಾ ಸೂಚನೆಗಳು)'
  | 'Court Order (ನ್ಯಾಯಾಲಯದ ಆದೇಶಗಳು)'
  | 'Office Proceedings (ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನಗಳು)';

export type GovOrderCategory =
  | 'School Education Department'
  | 'Primary Education'
  | 'High School Education'
  | 'Employee Service Rules'
  | 'Leave Rules'
  | 'Earned Leave'
  | 'Half Pay Leave'
  | 'Child Care Leave'
  | 'Pay Fixation'
  | 'Annual Increment'
  | 'Time Bound Advancement'
  | 'Automatic Advancement Scheme'
  | 'Promotion'
  | 'Seniority'
  | 'Transfer'
  | 'Suspension'
  | 'Disciplinary Proceedings'
  | 'Pension'
  | 'Retirement Benefits'
  | 'HRMS'
  | 'Finance Department'
  | 'Treasury'
  | 'RTI'
  | 'School Administration'
  | 'Recruitment'
  | 'Training'
  | 'Other Government Orders';

export type GovValidityStatus =
  | 'Active'
  | 'Amended'
  | 'Superseded'
  | 'Withdrawn'
  | 'Cancelled'
  | 'Under Verification'
  | 'Historical Reference';

export interface GovOrderRecord {
  id: string;
  orderNumber: string; // e.g. ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024 / FD 08 SRP 2018
  orderDate: string; // YYYY-MM-DD
  department: string; // e.g. ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
  section?: string;
  subject: string;
  category: GovOrderCategory;
  subcategory?: string;
  orderType: GovOrderType;
  language: 'Kannada' | 'English' | 'Bilingual';
  financialYear?: string;
  applicableFrom?: string;
  applicableTo?: string;
  referenceNumber?: string;
  keywords: string[];
  description: string;
  pdfPath?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  sourceWebsite?: string;
  sourceUrl?: string;
  verificationStatus: 'Verified' | 'Under Verification' | 'Unverified';
  validityStatus: GovValidityStatus;
  supersededBy?: string; // Links to newer order number if superseded
  amendmentOrderNumber?: string;
  latestAmendmentDate?: string;
  amendmentDetails?: string;
  extractedText?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DIGITAL REFERENCE BOOK TYPES ====================
export type BookMajorCategory =
  | 'Service Rules'
  | 'Education Rules'
  | 'Finance & Treasury'
  | 'Pension & Retirement'
  | 'Office Administration'
  | 'Other Reference Books';

export interface DigitalReferenceBook {
  id: string;
  bookKey: string; // KCSR, KFC, CCA, CONDUCT, KSMOP, KTC, EDU_ACT, PENSION, RTI_ACT, KACHERI_KAIPIDI
  bookNameKannada: string;
  bookNameEnglish: string;
  category: BookMajorCategory;
  authorOrDept: string;
  publisher?: string;
  edition: string;
  publicationYear: string;
  language: 'Kannada' | 'English' | 'Bilingual';
  volumeNumber?: string;
  description: string;
  pdfPath?: string;
  fileUrl?: string;
  source: string;
  verificationStatus: 'Verified' | 'Official Gazette' | 'Under Verification';
  totalChapters: number;
  totalRules: number;
  lastOpenedPage?: number;
  createdAt: string;
}

export interface BookRuleChapter {
  id: string;
  bookId: string;
  bookKey: string;
  bookNameKannada: string;
  ruleNumber: string; // e.g. "ನಿಯಮ 112", "ಅನುಚ್ಛೇದ 99", "ಕಲಂ 39"
  chapterOrPart: string;
  pageNumber?: number;
  titleKannada: string;
  titleEnglish?: string;
  category: string;
  summaryKannada: string;
  legalTextKannada?: string;
  citationSnippet: string; // Ready for Insertion into Letters (ಉಲ್ಲೇಖ)
  orderClauseSnippet?: string; // Ready for Body / Preamble
  validityStatus: GovValidityStatus;
  supersededBy?: string;
  amendmentNotes?: string;
  tags: string[];
}

export interface FileReferenceAttachment {
  id: string;
  fileId: string;
  referenceType: 'gov_order' | 'book_rule' | 'circular' | 'custom';
  referenceId: string; // GO ID or Book Rule ID
  title: string;
  citation: string;
  subject?: string;
  ruleOrOrderNumber: string;
  attachedBy: string;
  attachedAt: string;
  notes?: string;
}

export interface OfficialSourceRecord {
  id: string;
  sourceNameKannada: string;
  sourceNameEnglish: string;
  sourceUrl: string;
  authority: string;
  description: string;
  isVerified: boolean;
  lastCheckedDate: string;
}


