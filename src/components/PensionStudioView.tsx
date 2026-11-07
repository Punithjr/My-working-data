import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Building2, 
  FileText, 
  Award, 
  FolderGit2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2,
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  CheckSquare, 
  Square, 
  Tag, 
  ExternalLink, 
  Send, 
  FileCheck2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Bookmark,
  Share2,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Calculator,
  TrendingUp,
  FileDown,
  Percent,
  Home,
  MapPin,
  UserCheck
} from 'lucide-react';
import { 
  PensionCaseRecord, 
  PensionRetirementType, 
  PensionCaseStatus, 
  PensionLetterFormatType,
  PensionDocumentsChecklist,
  PensionSchoolServiceRecord,
  PensionYearlyLeaveRecord,
  PensionAttachedWorksheet,
  Employee, 
  AdminAuthUser, 
  MasterDocketFile,
  EducationLetter,
  OfficeConfig
} from '../types';
import { 
  computePensionDetails, 
  calculateRetirementDate,
  formatINR, 
  numberToKannadaWords, 
  formatDDMMYYYY,
  renderPensionFormatHtml,
  DEFAULT_PENSION_OFFICE_CONFIG,
  KCSR_COMMUTATION_FACTORS,
  calculateQuickPensionEstimate,
  generatePensionEstimateSlipHtml,
  QuickPensionEstimateResult
} from '../utils/pensionCalculator';
import { calculateYearsServed } from './EmployeeRosterView';
import { UnifiedPensionSummaryCard } from './UnifiedPensionSummaryCard';

interface PensionStudioViewProps {
  currentUser?: AdminAuthUser | null;
  employees: Employee[];
  files: MasterDocketFile[];
  onSaveLetterToRegistry?: (letter: Partial<EducationLetter>) => void;
  onAttachToDocketFile?: (fileNumber: string, docName: string) => void;
  onRefreshData?: () => void;
  showToast: (msg: string) => void;
}

// Helper to compute duration string between two dates (years, months, days)
export function computeServiceDurationText(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return '0 ವರ್ಷ, 0 ತಿಂಗಳು, 0 ದಿನ';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '0 ವರ್ಷ, 0 ತಿಂಗಳು, 0 ದಿನ';
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate() + 1;
  
  if (days < 0) {
    months -= 1;
    days += 30;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} ವರ್ಷ, ${months} ತಿಂಗಳು, ${days} ದಿನ`;
}

// Initial Sample Pension Cases for BEO Bhadravathi - including Sri Giriyappa H.
const INITIAL_PENSION_CASES: PensionCaseRecord[] = [
  {
    id: 'pen-case-sulochana',
    caseNumber: 'BEO/BHD/PEN/2026/01',
    fileNumber: 'ಎ10(8)/ಶಾ.ಶಿ.ಇ/ನಿ.ವೇ.ಮಂ/49/2026-27',
    fileId: 'ಎ10(8)/ಶಾ.ಶಿ.ಇ/ನಿ.ವೇ.ಮಂ/49/2026-27',
    employeeId: 'emp-sulochana',
    kgidNumber: '1042891',
    employeeName: 'C M SULOCHANA (ಶ್ರೀಮತಿ ಸಿ. ಎಂ. ಸುಲೋಚನಾ)',
    parentOrSpouseName: 'ದಾಸಪ್ಪ',
    fatherName: 'ದಾಸಪ್ಪ',
    religionNationality: 'ಹಿಂದೂ, ಭಾರತೀಯ',
    permanentAddress: 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (Assistant Teacher)',
    cadreGroup: 'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರು (PST)',
    officeOrSchool: 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI',
    gender: 'Female',
    dob: '1966-11-08',
    doa: '1994-08-01',
    dor: '2026-11-30',
    retirementAgeYears: 60,
    retirementType: 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)',
    payScale: '45300-1100-46400-1250-53900-1450-62600-1650-72500-1900-83900-2200-90200',
    lastBasicPay: 90200,
    daPercentage: 42.5,
    averageEmoluments: 88820,
    earnedLeaveDays: 300,
    halfPayLeaveDays: 38,
    nonQualifyingDays: 0,
    heightFeet: '5.2 ಅಡಿ',
    identificationMarks: [
      'ಹಣೆಯ ಬಲಭಾಗದಲ್ಲಿ ಸಣ್ಣ ಮಚ್ಚೆ ಗುರುತು',
      'ಬಲಗೈ ತೋಳಿನ ಮೇಲೆ ಕಪ್ಪು ಮಚ್ಚೆ ಗುರುತು'
    ],
    familyMembers: [
      { name: 'ದಾಸಪ್ಪ', relation: 'ಗಂಡ', dob: '1960-05-10', maritalStatus: 'ವಿವಾಹಿತ' }
    ],
    workHistorySchools: [
      {
        id: 'wh-g1',
        schoolName: 'ಸ.ಕಿ.ಪ್ರಾ.ಶಾಲೆ ಸಂಕ್ಲಪುರ ತೀರ್ಥಹಳ್ಳಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
        designation: 'ಸಹ ಶಿಕ್ಷಕರು',
        appointmentType: 'ಮೂಲ',
        startDate: '1994-08-01',
        endDate: '2002-12-14',
        qualifyingServiceString: '8-4-13',
        remarks: 'ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ'
      },
      {
        id: 'wh-g2',
        schoolName: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹಳೆಗೌರ ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
        designation: 'ಸಹ ಶಿಕ್ಷಕರು',
        appointmentType: 'ಮೂಲ',
        startDate: '2002-12-15',
        endDate: '2011-06-17',
        qualifyingServiceString: '8-6-2',
        remarks: 'ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ'
      },
      {
        id: 'wh-g3',
        schoolName: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಅಂತರಗಂಗೆ ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
        designation: 'ಸಹ ಶಿಕ್ಷಕರು',
        appointmentType: 'ಮೂಲ',
        startDate: '2011-06-17',
        endDate: '2026-07-31',
        qualifyingServiceString: '15-1-14',
        remarks: 'ನಿವೃತ್ತಿ ಶಾಲೆ - ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರ ಲಭ್ಯ'
      }
    ],
    yearlyLeaveHistory: [
      { id: 'yl-1993', year: 1993, openingBalance: 0, credited: 5, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 5, availed: 0, leaveTakenDetails: 'ಸೇವೆಗೆ ಸೇರಿದ ವರ್ಷ (ಜುಲೈ-ಡಿಸೆಂಬರ್ 6 ತಿಂಗಳು: 6 x 0.83 = 5 ದಿನ)', availedSpellDetails: 'ಗಳಿಕೆ ರಜೆ ಜಮೆ', closingBalance: 5 },
      { id: 'yl-1994', year: 1994, openingBalance: 5, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 15, availed: 0, leaveTakenDetails: 'ಪೂರ್ಣ ವರ್ಷ ಸೇವೆ', availedSpellDetails: 'ಗಳಿಕೆ ರಜೆ ಜಮೆ', closingBalance: 15 },
      { id: 'yl-1997', year: 1997, openingBalance: 35, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 45, availed: 10, leaveTakenDetails: 'ಗಳಿಕೆ ರಜೆ ಬಳಕೆ - ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂ: 24/1997', availedSpellDetails: '02-12-1997 ರಿಂದ 11-12-1997 (10 ದಿನ)', closingBalance: 35 },
      { id: 'yl-2000', year: 2000, openingBalance: 55, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 65, availed: 0, leaveTakenDetails: 'ಪೂರ್ಣ ವರ್ಷ ಸೇವೆ', availedSpellDetails: '15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರು (ಆದೇಶ ಸಂ: ಬಿಇಒ/ವೇತನ/2000)', closingBalance: 65 },
      { id: 'yl-2005', year: 2005, openingBalance: 105, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 115, availed: 5, leaveTakenDetails: 'ವೈದ್ಯಕೀಯ ಕಾರಣ ಗಳಿಕೆ ರಜೆ ಬಳಕೆ', availedSpellDetails: '02-12-2005 ರಿಂದ 06-12-2005 (5 ದಿನ)', closingBalance: 110 },
      { id: 'yl-2010', year: 2010, openingBalance: 150, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 160, availed: 0, leaveTakenDetails: 'ಪೂರ್ಣ ವರ್ಷ ಸೇವೆ', availedSpellDetails: '15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (ದಿನಾಂಕ: 10-09-2010)', closingBalance: 160 },
      { id: 'yl-2015', year: 2015, openingBalance: 200, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 210, availed: 0, leaveTakenDetails: 'ಪೂರ್ಣ ವರ್ಷ ಸೇವೆ', availedSpellDetails: '15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರು', closingBalance: 210 },
      { id: 'yl-2020', year: 2020, openingBalance: 240, credited: 10, otherSanctionedDays: 15, specialCovidDutyDays: 15, totalAvailable: 265, availed: 5, leaveTakenDetails: 'ಕೋವಿಡ್-19 ಕರ್ತವ್ಯ 15 ದಿನ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ', availedSpellDetails: 'ಕೋವಿಡ್ ಕರ್ತವ್ಯ 15 ದಿನ ಜಮೆ / 5 ದಿನ ರಜೆ ಬಳಕೆ', closingBalance: 260 },
      { id: 'yl-2021', year: 2021, openingBalance: 260, credited: 10, otherSanctionedDays: 14, specialCovidDutyDays: 14, totalAvailable: 284, availed: 0, leaveTakenDetails: 'ಕೋವಿಡ್-19 ಕರ್ತವ್ಯ 14 ದಿನ ವಿಶೇಷ ಕರ್ತವ್ಯ ರಜೆ', availedSpellDetails: '15 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (ದಿನಾಂಕ: 12-08-2021)', closingBalance: 284 },
      { id: 'yl-2025', year: 2025, openingBalance: 295, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 305, availed: 5, leaveTakenDetails: 'ಸಾಂದರ್ಭಿಕ/ಗಳಿಕೆ ರಜೆ ಬಳಕೆ', availedSpellDetails: 'ಸಾಮಾನ್ಯ ಗಳಿಕೆ ರಜೆ', closingBalance: 300 },
      { id: 'yl-2026', year: 2026, openingBalance: 300, credited: 4.17, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 304.17, availed: 0, leaveTakenDetails: 'ನಿವೃತ್ತಿ ವರ್ಷ (ಜನವರಿ-ಮೇ 5 ತಿಂಗಳು: 5 x 0.83 = 4.17 ದಿನ)', availedSpellDetails: 'ನಿವೃತ್ತಿ ಪೂರ್ವ ಶಿಲ್ಕು - ಗರಿಷ್ಠ 300 ದಿನ ನಗದೀಕರಣಕ್ಕೆ ಶಿಫಾರಸ್ಸು', closingBalance: 300 }
    ],
    attachedWorksheets: [
      {
        id: 'ws-1',
        name: 'ಸೇವಾ ವಿವರ ಪರಿಶೋಧನಾ ವರ್ಕ್‌ಶೀಟ್ (Service Verification Worksheet)',
        worksheetType: 'service_worksheet',
        fileName: 'Service_Worksheet_Giriyappa_1042891.pdf',
        fileSize: '1.4 MB',
        uploadedAt: '2026-02-15',
        verified: true,
        verifiedBy: 'ಆ4 ಶಾಖೆ & AAO Finance',
        notes: '31 ವರ್ಷ 11 ತಿಂಗಳು 30 ದಿನ ಸೇವೆ ಸಂಪೂರ್ಣ ದೃಢೀಕರಿಸಲಾಗಿದೆ'
      },
      {
        id: 'ws-2',
        name: 'ವೇತನ ಬಾಕಿ & ಕೊನೆಯ ವೇತನ ವರ್ಕ್‌ಶೀಟ್ (Pay & LPC Worksheet)',
        worksheetType: 'pay_worksheet',
        fileName: 'Pay_LPC_Worksheet_Basic90200.pdf',
        fileSize: '890 KB',
        uploadedAt: '2026-02-16',
        verified: true,
        verifiedBy: 'BEO Bhadravathi',
        notes: 'ಕೊನೆಯ ಮೂಲ ವೇತನ ₹90,200/- ಮತ್ತು DA 42.5% ಸರಿಯಾಗಿದೆ'
      },
      {
        id: 'ws-3',
        name: 'ಗಳಿಕೆ ರಜೆ ಹಾಗೂ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ (Earned Leave & Other Sanctioned Leave Worksheet)',
        worksheetType: 'leave_account',
        fileName: 'Leave_Account_SanctionedLeave_300Days.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-02-18',
        verified: true,
        verifiedBy: 'Case Worker (RTI/Pension)',
        notes: 'ಗಳಿಕೆ ರಜೆ, ಇತರೆ ಮಂಜೂರಾದ ರಜೆ ಹಾಗೂ ಬಳಕೆ ಲೆಕ್ಕಾಚಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ, ಗರಿಷ್ಠ 300 ದಿನಗಳ ನಗದೀಕರಣಕ್ಕೆ ಅರ್ಹರು'
      }
    ],
    commutationOpted: true,
    commutationPercentage: 33.33,
    ageNextBirthday: 61,
    nomineeName: 'ದಾಸಪ್ಪ',
    nomineeRelation: 'ಗಂಡ (Husband)',
    nomineeDob: '1960-05-10',
    bankName: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (SBI)',
    bankBranch: 'ಭದ್ರಾವತಿ ಮುಖ್ಯ ಶಾಖೆ',
    bankAccountNo: '30849201948',
    ifscCode: 'SBIN0000812',
    treasuryName: 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ',
    ppoNumber: 'PPO/EDN/BHD/2026/1083',
    gpfAgOrderNumber: 'AG/KAR/GPF/FIN/2026/89412',
    gpfAgSanctionedAmount: 842600,
    gpfHeadOfAccount: '8009-01-101-0-01 (ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ - State Teachers GPF)',
    gisSavingsFundAmount: 120000,
    gisHeadOfAccount: '8011-00-107-0-01 (ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರರ ಗುಂಪು ವಿಮಾ ಉಳಿತಾಯ ನಿಧಿ)',
    elEncashmentHeadOfAccount: '2202-01-101-1-01-052 (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವೆಚ್ಚ)',
    calculation: computePensionDetails({
      doa: '1994-08-01',
      dor: '2026-11-30',
      dob: '1966-11-08',
      retirementAgeYears: 60,
      lastBasicPay: 90200,
      daPercentage: 42.5,
      earnedLeaveDays: 300,
      halfPayLeaveDays: 38,
      commutationOpted: true,
      commutationPercentage: 33.33,
      ageNextBirthday: 61,
      nonQualifyingDays: 0
    }),
    checklist: {
      serviceBookVerified: true,
      form7Triplicate: true,
      jointPhotosAttested: true,
      specimenSignatures: true,
      noDueCertificate: true,
      lastPayCertificate: true,
      form1And2Nomination: true,
      aadharBankPassbook: true
    },
    status: 'BEO ಅನುಮೋದಿತ (Sanctioned by BEO)',
    movementHistory: [
      {
        id: 'mov-g1',
        fromOfficer: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಪಿಂಚಣಿ)',
        toOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
        sentDate: '2026-02-05 10:30',
        remarks: 'ಶ್ರೀಮತಿ ಸಿ. ಎಂ. ಸುಲೋಚನಾ ಇವರ ಸೇವಾ ಪುಸ್ತಕ ಹಾಗೂ ರಜೆ ಲೆಕ್ಕ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ. 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ ಸಿದ್ಧವಾಗಿದೆ.',
        statusAfterMove: 'ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)'
      },
      {
        id: 'mov-g2',
        fromOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
        toOfficer: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)',
        sentDate: '2026-02-12 14:00',
        remarks: 'ಪಿಂಚಣಿ, ಉಪದಾನ, ಪರಿವರ್ತನೆ ಮತ್ತು ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶಗಳ ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ.',
        statusAfterMove: 'BEO ಅನುಮೋದಿತ (Sanctioned by BEO)'
      }
    ],
    remarks: 'C M SULOCHANA ಪ್ರಕರಣ (GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI) - 31 ವರ್ಷ 11 ತಿಂಗಳು 30 ದಿನ ಅರ್ಹತಾ ಸೇವೆ. ಪೂರ್ಣ ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳಿಗೆ ಅರ್ಹರು.',
    createdAt: '2026-02-01',
    lastUpdated: '2026-02-12'
  },
  {
    id: 'pen-case-01',
    caseNumber: 'BEO/BHD/PEN/2026/02',
    fileNumber: '57',
    fileId: 'file-pen-57',
    employeeId: 'emp-sunandamma',
    kgidNumber: '1182740',
    employeeName: 'ಸುನಂದಮ್ಮ ಬಿ. ಆರ್. (SUNANDAMMA B R)',
    parentOrSpouseName: 'ರಾಮಚಂದ್ರಪ್ಪ ಬಿ.',
    designation: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು (Headmaster - Grade 1)',
    cadreGroup: 'ಗ್ರೂಪ್-ಬಿ',
    officeOrSchool: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹಳೇನಗರ, ಭದ್ರಾವತಿ (DISE: 29150109701)',
    gender: 'Female',
    dob: '1966-04-15',
    doa: '1993-06-10',
    dor: '2026-04-30',
    retirementAgeYears: 60,
    retirementType: 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)',
    payScale: '43100-1100-46400-1250-53900-1450-62600-1650-70850-1850-80400',
    lastBasicPay: 76550,
    daPercentage: 42.5,
    averageEmoluments: 76550,
    earnedLeaveDays: 284,
    halfPayLeaveDays: 20,
    nonQualifyingDays: 0,
    commutationOpted: true,
    commutationPercentage: 40,
    ageNextBirthday: 61,
    nomineeName: 'ರಾಮಚಂದ್ರಪ್ಪ ಬಿ. (ಪತಿ)',
    nomineeRelation: 'ಪತಿ (Husband)',
    nomineeDob: '1962-08-20',
    bankName: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (SBI)',
    bankBranch: 'ಭದ್ರಾವತಿ ಮುಖ್ಯ ಶಾಖೆ',
    bankAccountNo: '30492817402',
    ifscCode: 'SBIN0000812',
    treasuryName: 'ಉಪ ಖಜಾನೆ, ಭದ್ರಾವತಿ',
    ppoNumber: 'PPO/EDN/BHD/2026/1084',
    calculation: computePensionDetails({
      doa: '1993-06-10',
      dor: '2026-04-30',
      dob: '1966-04-15',
      retirementAgeYears: 60,
      lastBasicPay: 76550,
      daPercentage: 42.5,
      earnedLeaveDays: 284,
      halfPayLeaveDays: 20,
      commutationOpted: true,
      commutationPercentage: 40,
      ageNextBirthday: 61,
      nonQualifyingDays: 0
    }),
    checklist: {
      serviceBookVerified: true,
      form7Triplicate: true,
      jointPhotosAttested: true,
      specimenSignatures: true,
      noDueCertificate: true,
      lastPayCertificate: true,
      form1And2Nomination: true,
      aadharBankPassbook: true
    },
    status: 'BEO ಅನುಮೋದಿತ (Sanctioned by BEO)',
    movementHistory: [
      {
        id: 'mov-p1',
        fromOfficer: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಪಿಂಚಣಿ)',
        toOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
        sentDate: '2026-02-10 11:30',
        remarks: 'ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಪ್ರಪತ್ರ-7 ತಯಾರಿಸಿ ಮಂಡಿಸಲಾಗಿದೆ.',
        statusAfterMove: 'ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)'
      },
      {
        id: 'mov-p2',
        fromOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
        toOfficer: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)',
        sentDate: '2026-02-18 15:00',
        remarks: 'ಪಿಂಚಣಿ ಮಂಜೂರಾತಿ ಆದೇಶ ಮತ್ತು ಪರಿವರ್ತನೆ ಮಂಜೂರಾತಿಗಾಗಿ ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ.',
        statusAfterMove: 'BEO ಅನುಮೋದಿತ (Sanctioned by BEO)'
      }
    ],
    remarks: 'ಅರ್ಹತಾ ಸೇವೆ 32 ವರ್ಷ 10 ತಿಂಗಳು 21 ದಿನಗಳು. ಪೂರ್ಣ ಪಿಂಚಣಿ ಸೌಲಭ್ಯಕ್ಕೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ.',
    createdAt: '2026-02-01',
    lastUpdated: '2026-02-18'
  },
  {
    id: 'pen-case-02',
    caseNumber: 'BEO/BHD/PEN/2026/02',
    fileNumber: '72',
    fileId: 'file-pen-72',
    employeeId: 'emp-1515985',
    kgidNumber: '1515985',
    employeeName: 'ಆನಂದ ಎಂ. ಸಿ. (ANANDA M C)',
    parentOrSpouseName: 'ಚನ್ನಬಸಪ್ಪ ಎಂ.',
    designation: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು (Headmaster)',
    cadreGroup: 'ಗ್ರೂಪ್-ಬಿ',
    officeOrSchool: 'KPS GHPS ANTHARAGANGE (29150109702)',
    gender: 'Male',
    dob: '1966-07-20',
    doa: '1999-11-30',
    dor: '2026-07-31',
    retirementType: 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)',
    payScale: '43100-1100-46400-1250-53900-1450-62600-1650-70850-1850-80400',
    lastBasicPay: 74200,
    daPercentage: 42.5,
    averageEmoluments: 74200,
    earnedLeaveDays: 300,
    nonQualifyingDays: 0,
    commutationOpted: true,
    commutationPercentage: 40,
    ageNextBirthday: 61,
    nomineeName: 'ರತ್ನಮ್ಮ ಎಂ. ಸಿ. (ಪತ್ನಿ)',
    nomineeRelation: 'ಪತ್ನಿ (Wife)',
    nomineeDob: '1970-03-12',
    bankName: 'ಕೆನರಾ ಬ್ಯಾಂಕ್ (Canara Bank)',
    bankBranch: 'ಹೊಳೆಹೊನ್ನೂರು ಶಾಖೆ',
    bankAccountNo: '11920834019',
    ifscCode: 'CNRB0001192',
    treasuryName: 'ಉಪ ಖಜಾನೆ, ಭದ್ರಾವತಿ',
    calculation: computePensionDetails({
      doa: '1999-11-30',
      dor: '2026-07-31',
      lastBasicPay: 74200,
      daPercentage: 42.5,
      earnedLeaveDays: 300,
      commutationOpted: true,
      commutationPercentage: 40,
      ageNextBirthday: 61,
      nonQualifyingDays: 0
    }),
    checklist: {
      serviceBookVerified: true,
      form7Triplicate: true,
      jointPhotosAttested: true,
      specimenSignatures: true,
      noDueCertificate: true,
      lastPayCertificate: false,
      form1And2Nomination: true,
      aadharBankPassbook: true
    },
    status: 'ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)',
    movementHistory: [
      {
        id: 'mov-p3',
        fromOfficer: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಪಿಂಚಣಿ)',
        toOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
        sentDate: '2026-03-01 10:45',
        remarks: 'ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ ಮುಕ್ತಾಯ. LPC ಹೊರತುಪಡಿಸಿ ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಸಿದ್ಧವಾಗಿವೆ.',
        statusAfterMove: 'ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)'
      }
    ],
    remarks: 'ಜುಲೈ-2026 ರ ನಿವೃತ್ತಿ ಪ್ರಕರಣ. ಕಡತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ.',
    createdAt: '2026-02-15',
    lastUpdated: '2026-03-01'
  }
];

export const PensionStudioView: React.FC<PensionStudioViewProps> = ({
  currentUser,
  employees,
  files,
  onSaveLetterToRegistry,
  onAttachToDocketFile,
  showToast
}) => {
  // Navigation tabs within Pension Module: includes dedicated calculator, cases, and calculations tabs
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'calculator' | 'input' | 'calculations' | 'letters' | 'checklist' | 'labels'>('cases');

  // ---------------------------------------------------------------------------
  // PENSION CALCULATOR TOOL STATE (Estimates total benefits from Years of Service & Basic Pay)
  // ---------------------------------------------------------------------------
  const [calcYearsOfService, setCalcYearsOfService] = useState<number | string>(30);
  const [calcLastBasicPay, setCalcLastBasicPay] = useState<number | string>(68550);
  const [calcSelectedEmpId, setCalcSelectedEmpId] = useState<string>('');
  const [calcEmployeeName, setCalcEmployeeName] = useState<string>('ಶ್ರೀ ಗಿರಿಯಪ್ಪ ಎಚ್. (GIRIYAPPA H)');
  const [calcDesignation, setCalcDesignation] = useState<string>('ಸಹ ಶಿಕ್ಷಕರು (Assistant Teacher)');
  const [calcKgid, setCalcKgid] = useState<string>('1042891');
  const [calcDaPercentage, setCalcDaPercentage] = useState<number>(42.5);
  const [calcCommutationOpted, setCalcCommutationOpted] = useState<boolean>(true);
  const [calcCommutationPercentage, setCalcCommutationPercentage] = useState<number>(40);
  const [calcEarnedLeaveDays, setCalcEarnedLeaveDays] = useState<number>(300);
  const [calcHalfPayLeaveDays, setCalcHalfPayLeaveDays] = useState<number>(38);
  const [calcAgeNextBirthday, setCalcAgeNextBirthday] = useState<number>(61);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [calcShowAdvanced, setCalcShowAdvanced] = useState<boolean>(false);
  const [annualIncrementPercent, setAnnualIncrementPercent] = useState<number>(3);

  // Stored Pension Cases
  const [pensionCases, setPensionCases] = useState<PensionCaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edu_pension_cases_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load pension cases from localStorage:', e);
    }
    return INITIAL_PENSION_CASES;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edu_pension_cases_data', JSON.stringify(pensionCases));
    } catch (e) {
      console.error('Failed to save pension cases to localStorage:', e);
    }
  }, [pensionCases]);

  // Load from backend SQLite/JSON database on mount
  useEffect(() => {
    fetch('/api/pension-cases')
      .then(res => res.json())
      .then(data => {
        if (data.cases && data.cases.length > 0) {
          setPensionCases(data.cases);
          if (data.cases[0]) setSelectedCase(data.cases[0]);
        } else {
          // seed initial cases to SQLite database
          INITIAL_PENSION_CASES.forEach(c => {
            fetch('/api/pension-cases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(c)
            }).catch(() => {});
          });
        }
      })
      .catch(e => {
        console.warn('Backend pension-cases fetch failed, using local storage cache:', e);
      });
  }, []);

  // Active / Selected Case for Viewing & Letter Studio
  const [selectedCase, setSelectedCase] = useState<PensionCaseRecord>(() => pensionCases[0] || INITIAL_PENSION_CASES[0]);

  // Selected Letter Format for Preview & Print
  const [selectedFormat, setSelectedFormat] = useState<PensionLetterFormatType>('pension_calc_sheet');

  // Search & Filter in Cases Table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ---------------------------------------------------------------------------
  // NEW / EDIT PENSION CASE FORM STATE (Supports 60 vs 65 years retirement age)
  // ---------------------------------------------------------------------------
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fileNumber: '56',
    fileId: 'PEN-FILE-2026-056',
    kgidNumber: '1042891',
    employeeName: 'C M SULOCHANA (ಶ್ರೀಮತಿ ಸಿ. ಎಂ. ಸುಲೋಚನಾ)',
    parentOrSpouseName: 'ದಾಸಪ್ಪ',
    permanentAddress: 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (Assistant Teacher)',
    cadreGroup: 'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರು (PST)',
    officeOrSchool: 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI',
    gender: 'Female',
    dob: '1966-11-08',
    doa: '1994-08-01',
    dor: '2026-11-30',
    retirementAgeYears: 60 as 60 | 65,
    retirementType: 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)' as PensionRetirementType,
    payScale: '45300-1100-46400-1250-53900-1450-62600-1650-72500-1900-83900-2200-90200',
    lastBasicPay: 90200,
    daPercentage: 42.5,
    averageEmoluments: 88820,
    earnedLeaveDays: 300,
    halfPayLeaveDays: 38,
    nonQualifyingDays: 0,
    workHistorySchools: INITIAL_PENSION_CASES[0].workHistorySchools || [] as PensionSchoolServiceRecord[],
    yearlyLeaveHistory: INITIAL_PENSION_CASES[0].yearlyLeaveHistory || [] as PensionYearlyLeaveRecord[],
    attachedWorksheets: INITIAL_PENSION_CASES[0].attachedWorksheets || [] as PensionAttachedWorksheet[],
    commutationOpted: true,
    commutationPercentage: 33.33,
    ageNextBirthday: 61,
    nomineeName: 'ದಾಸಪ್ಪ',
    nomineeRelation: 'ಗಂಡ (Husband)',
    nomineeDob: '1960-05-10',
    familyMembers: [
      { name: 'ದಾಸಪ್ಪ', relation: 'ಗಂಡ (Husband)', dob: '1960-05-10', maritalStatus: 'ವಿವಾಹಿತ' }
    ] as { name: string; relation: string; dob: string; maritalStatus?: string }[],
    bankName: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (SBI)',
    bankBranch: 'ಭದ್ರಾವತಿ ಮುಖ್ಯ ಶಾಖೆ',
    bankAccountNo: '30849201948',
    ifscCode: 'SBIN0000812',
    treasuryName: 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ',
    gpfAgOrderNumber: 'AG/KAR/GPF/FIN/2026/89412',
    gpfAgSanctionedAmount: 842600,
    gpfHeadOfAccount: '8009-01-101-0-01 (ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ - State Teachers GPF)',
    gisSavingsFundAmount: 120000,
    gisHeadOfAccount: '8011-00-107-0-01 (ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರರ ಗುಂಪು ವಿಮಾ ಉಳಿತಾಯ ನಿಧಿ)',
    elEncashmentHeadOfAccount: '2202-01-101-1-01-052 (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವೆಚ್ಚ)',
    remarks: 'C M SULOCHANA ಪ್ರಕರಣ - 31 ವರ್ಷ 11 ತಿಂಗಳು 30 ದಿನ ಅರ್ಹತಾ ಸೇವೆ. GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI'
  });

  // Modal / Input State for Adding Worksheet
  const [showAddWorksheetModal, setShowAddWorksheetModal] = useState(false);
  const [newWorksheetData, setNewWorksheetData] = useState<{
    name: string;
    worksheetType: 'service_worksheet' | 'pay_worksheet' | 'leave_account' | 'service_book_extract' | 'other';
    fileName: string;
    fileSize: string;
    notes: string;
  }>({
    name: '',
    worksheetType: 'service_worksheet',
    fileName: '',
    fileSize: '1.2 MB',
    notes: ''
  });

  // Quick Employee Search Dropdown Filter
  const [empSearch, setEmpSearch] = useState('');

  // Leave Cadre Type for Earned Leave crediting
  // Sahakari Shikshakaru / Teachers get 10 days/yr = ~0.83 days/month (Vacation Dept)
  // Non-teaching staff get 30 days/yr = 2.5 days/month (Non-Vacation Dept)
  const [leaveCadreType, setLeaveCadreType] = useState<'teacher' | 'non_teacher'>('teacher');

  // Handle Retirement Age Selection (60 Years vs 65 Years)
  const handleRetirementAgeChange = (age: 60 | 65) => {
    const verified = calculateRetirementDate(formData.dob, age);
    setFormData(prev => ({
      ...prev,
      retirementAgeYears: age,
      dor: verified.dor || prev.dor,
      ageNextBirthday: verified.ageNextBirthday,
      retirementType: (age === 65 
        ? 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)' // standard retirement category
        : 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)') as PensionRetirementType
    }));
    showToast(`ನಿವೃತ್ತಿ ವಯಸ್ಸು ${age} ವರ್ಷಗಳಿಗೆ ಹೊಂದಿಸಲಾಗಿದೆ: ನಿವೃತ್ತಿ ದಿನಾಂಕ ${verified.dor}`);
  };

  // Handle Date of Birth Change with KCSR Rule 95 Auto-Verification
  const handleDobChange = (newDob: string) => {
    const verified = calculateRetirementDate(newDob, formData.retirementAgeYears || 60);
    setFormData(prev => ({
      ...prev,
      dob: newDob,
      dor: verified.dor || prev.dor,
      ageNextBirthday: verified.ageNextBirthday
    }));
  };

  // Family Member Handlers (ಕುಟುಂಬ ಸದಸ್ಯರ ನಿರ್ವಹಣೆ)
  const handleAddFamilyMember = () => {
    const newMember = {
      name: '',
      relation: 'ಗಂಡ (Husband)',
      dob: '',
      maritalStatus: 'ವಿವಾಹಿತ'
    };
    setFormData(prev => ({
      ...prev,
      familyMembers: [...(prev.familyMembers || []), newMember]
    }));
    showToast('ಹೊಸ ಕುಟುಂಬ ಸದಸ್ಯರ ಸಾಲು ಸೇರಿಸಲಾಗಿದೆ (+ Family Member Added)');
  };

  const handleUpdateFamilyMember = (index: number, updates: Partial<{ name: string; relation: string; dob: string; maritalStatus: string }>) => {
    setFormData(prev => {
      const updated = [...(prev.familyMembers || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...updates };
      }
      return { ...prev, familyMembers: updated };
    });
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: (prev.familyMembers || []).filter((_, idx) => idx !== index)
    }));
    showToast('ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.');
  };

  const handleSetFamilyMemberAsNominee = (member: { name: string; relation: string; dob: string }) => {
    setFormData(prev => ({
      ...prev,
      nomineeName: member.name,
      nomineeRelation: member.relation,
      nomineeDob: member.dob
    }));
    showToast(`ನಾಮನಿರ್ದೇಶಿತರನ್ನಾಗಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ: ${member.name}`);
  };

  // Recalculate row and cascade subsequent rows automatically
  const handleUpdateLeaveRow = (index: number, updates: Partial<PensionYearlyLeaveRecord>) => {
    setFormData(prev => {
      const list = (prev.yearlyLeaveHistory || []).map(item => ({ ...item }));
      if (!list[index]) return prev;
      list[index] = { ...list[index], ...updates };

      // Cascade calculation from index to end of table
      for (let i = index; i < list.length; i++) {
        const row = list[i];
        if (i > 0 && i > index) {
          row.openingBalance = list[i - 1].closingBalance;
        }
        const other = Number(row.otherSanctionedDays ?? row.specialCovidDutyDays ?? 0);
        const total = Number((Number(row.openingBalance || 0) + Number(row.credited || 0) + other).toFixed(2));
        row.totalAvailable = total;
        const av = Number(row.availed || 0);
        row.closingBalance = Math.min(300, Math.max(0, Number((total - av).toFixed(2))));
      }

      const finalBal = list.length > 0 ? list[list.length - 1].closingBalance : 0;
      return {
        ...prev,
        yearlyLeaveHistory: list,
        earnedLeaveDays: finalBal
      };
    });
  };

  // Auto-generate full leave history from DOA to DOR according to KCSR rules
  const handleAutoGenerateLeaveHistory = () => {
    // Determine start & end years and months
    const doa = formData.doa ? new Date(formData.doa) : new Date(1993, 6, 1);
    const dor = formData.dor ? new Date(formData.dor) : new Date(2026, 4, 31);
    const startYear = isNaN(doa.getFullYear()) ? 1993 : doa.getFullYear();
    const endYear = isNaN(dor.getFullYear()) ? 2026 : dor.getFullYear();
    const startMonth = isNaN(doa.getMonth()) ? 7 : doa.getMonth() + 1; // 1 to 12
    const endMonth = isNaN(dor.getMonth()) ? 5 : dor.getMonth() + 1; // 1 to 12

    const isTeacher = leaveCadreType === 'teacher' || /ಶಿಕ್ಷಕ|teacher|pst|hps/i.test(formData.designation || '');
    const annualCredit = isTeacher ? 10 : 30;
    const monthlyRate = annualCredit / 12; // 0.8333... for teachers, 2.5 for others

    const yearsToGen: PensionYearlyLeaveRecord[] = [];
    let currentBal = 0;

    for (let y = startYear; y <= endYear; y++) {
      let cred = annualCredit;
      let reasonDetails = '';

      if (y === startYear) {
        // Apportioned from joining month to end of the year: (12 - startMonth + 1) months
        const monthsServed = Math.max(1, 12 - startMonth + 1);
        cred = monthsServed === 12 ? annualCredit : Number((monthsServed * monthlyRate).toFixed(2));
        reasonDetails = `ಸೇವೆಗೆ ಸೇರಿದ ವರ್ಷ (${startMonth}ನೇ ತಿಂಗಳಿನಿಂದ ವರ್ಷಾಂತ್ಯಕ್ಕೆ ${monthsServed} ತಿಂಗಳು x ${monthlyRate.toFixed(2)} = ${cred} ದಿನ)`;
      } else if (y === endYear) {
        // Apportioned from January to retirement month
        const monthsServed = Math.max(1, endMonth);
        cred = monthsServed === 12 ? annualCredit : Number((monthsServed * monthlyRate).toFixed(2));
        reasonDetails = `ನಿವೃತ್ತಿ ವರ್ಷ (ಜನವರಿಯಿಂದ ${endMonth}ನೇ ತಿಂಗಳವರೆಗೆ ${monthsServed} ತಿಂಗಳು x ${monthlyRate.toFixed(2)} = ${cred} ದಿನ)`;
      } else {
        reasonDetails = isTeacher ? 'ಸಾಮಾನ್ಯ ವಾರ್ಷಿಕ ಗಳಿಕೆ ರಜೆ ಜಮೆ (10 ದಿನ)' : 'ಸಾಮಾನ್ಯ ವಾರ್ಷಿಕ ಗಳಿಕೆ ರಜೆ ಜಮೆ (30 ದಿನ)';
      }

      // Covid duty / special sanctioned leaves during pandemic years
      const otherDays = (y === 2020) ? 15 : (y === 2021 ? 14 : 0);
      const otherNote = otherDays > 0 ? `ಕೋವಿಡ್-19 ಕರ್ತವ್ಯ ನಿರ್ವಹಣೆಯ ${otherDays} ದಿನ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ ಜಮೆ` : '';

      // Sample availed or leave taken
      const avail = (y === 2018 ? 10 : (y === 2022 ? 15 : 0));
      const leaveTakenText = avail > 0 
        ? `${avail} ದಿನಗಳ ರಜೆ ಬಳಕೆ (ಆದೇಶ ದಿನಾಂಕ: ${y}-06-15)` 
        : (otherDays > 0 ? otherNote : 'ರಜೆ ಬಳಕೆ ಇಲ್ಲ');

      const open = currentBal;
      const totalAvail = Number((open + cred + otherDays).toFixed(2));
      currentBal = Math.min(300, Math.max(0, Number((totalAvail - avail).toFixed(2))));

      const encashmentText = (y === 2015 || y === 2020) 
        ? '15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರು' 
        : (y === endYear ? 'ನಿವೃತ್ತಿ ಪೂರ್ವ ಶಿಲ್ಕು - ಗರಿಷ್ಠ 300 ದಿನ ನಗದೀಕರಣಕ್ಕೆ ಶಿಫಾರಸ್ಸು' : reasonDetails);

      yearsToGen.push({
        id: `yl-${y}`,
        year: y,
        openingBalance: open,
        credited: cred,
        otherSanctionedDays: otherDays,
        specialCovidDutyDays: otherDays,
        totalAvailable: totalAvail,
        availed: avail,
        leaveTakenDetails: leaveTakenText,
        availedSpellDetails: encashmentText,
        encashmentDetails: (y === 2015 || y === 2020) ? '15 ದಿನ ನಗದೀಕರಣ' : '',
        closingBalance: currentBal
      });
    }

    setFormData(prev => ({
      ...prev,
      yearlyLeaveHistory: yearsToGen,
      earnedLeaveDays: currentBal
    }));
    showToast(`ವಾರ್ಷಿಕ ರಜೆ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಲಾಗಿದೆ (${yearsToGen.length} ವರ್ಷಗಳು: ${startYear} ರಿಂದ ${endYear})`);
  };

  // Add next leave year
  const handleAddLeaveYear = () => {
    const history = formData.yearlyLeaveHistory || [];
    const last = history[history.length - 1];
    const nextYear = last ? last.year + 1 : new Date().getFullYear();
    const openBal = last ? last.closingBalance : 0;
    const isTeacher = leaveCadreType === 'teacher' || /ಶಿಕ್ಷಕ|teacher|pst|hps/i.test(formData.designation || '');
    const defaultCredit = isTeacher ? 10 : 30;
    const total = Number((openBal + defaultCredit).toFixed(2));
    const newRow: PensionYearlyLeaveRecord = {
      id: `yl-${Date.now()}`,
      year: nextYear,
      openingBalance: openBal,
      credited: defaultCredit,
      otherSanctionedDays: 0,
      specialCovidDutyDays: 0,
      totalAvailable: total,
      availed: 0,
      leaveTakenDetails: '',
      availedSpellDetails: '',
      encashmentDetails: '',
      closingBalance: Math.min(300, total)
    };
    setFormData(prev => ({
      ...prev,
      yearlyLeaveHistory: [...history, newRow],
      earnedLeaveDays: Math.min(300, total)
    }));
    showToast(`ಹೊಸ ರಜೆ ವರ್ಷ (${nextYear}) ಸೇರಿಸಲಾಗಿದೆ`);
  };

  // Recalculate all leave rows
  const handleRecalculateAllLeaveRows = () => {
    setFormData(prev => {
      const list = (prev.yearlyLeaveHistory || []).map(item => ({ ...item }));
      if (list.length === 0) return prev;
      let prevBal = list[0].openingBalance || 0;
      for (let i = 0; i < list.length; i++) {
        if (i > 0) {
          list[i].openingBalance = prevBal;
        }
        const other = Number(list[i].otherSanctionedDays ?? list[i].specialCovidDutyDays ?? 0);
        const total = Number((Number(list[i].openingBalance || 0) + Number(list[i].credited || 0) + other).toFixed(2));
        list[i].totalAvailable = total;
        const av = Number(list[i].availed || 0);
        const cl = Math.min(300, Math.max(0, Number((total - av).toFixed(2))));
        list[i].closingBalance = cl;
        prevBal = cl;
      }
      const finalBal = list[list.length - 1].closingBalance;
      return {
        ...prev,
        yearlyLeaveHistory: list,
        earnedLeaveDays: finalBal
      };
    });
    showToast('ಎಲ್ಲಾ ರಜೆ ವರ್ಷಗಳ ಶಿಲ್ಕು ಯಶಸ್ವಿಯಾಗಿ ಮರುಲೆಕ್ಕಾಚಾರಗೊಂಡಿದೆ (All Rows Recalculated)');
  };

  // 1-Click Preset to Load Smt. C M SULOCHANA Case (LOYAR HUTTHA)
  const handleLoadSulochanaCase = () => {
    const sulochana = INITIAL_PENSION_CASES[0];
    setEditingCaseId(null);
    setFormData({
      fileNumber: sulochana.fileNumber,
      fileId: sulochana.fileId || `PEN-FILE-2026-${sulochana.fileNumber || '01'}`,
      kgidNumber: sulochana.kgidNumber,
      employeeName: sulochana.employeeName,
      parentOrSpouseName: sulochana.parentOrSpouseName,
      permanentAddress: sulochana.permanentAddress || 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
      designation: sulochana.designation,
      cadreGroup: sulochana.cadreGroup,
      officeOrSchool: sulochana.officeOrSchool,
      gender: sulochana.gender,
      dob: sulochana.dob,
      doa: sulochana.doa,
      dor: sulochana.dor,
      retirementAgeYears: sulochana.retirementAgeYears || 60,
      retirementType: sulochana.retirementType,
      payScale: sulochana.payScale,
      lastBasicPay: sulochana.lastBasicPay,
      daPercentage: sulochana.daPercentage,
      averageEmoluments: sulochana.averageEmoluments || sulochana.lastBasicPay,
      earnedLeaveDays: sulochana.earnedLeaveDays,
      halfPayLeaveDays: sulochana.halfPayLeaveDays || 38,
      nonQualifyingDays: sulochana.nonQualifyingDays || 0,
      workHistorySchools: sulochana.workHistorySchools ? [...sulochana.workHistorySchools] : [],
      yearlyLeaveHistory: sulochana.yearlyLeaveHistory ? [...sulochana.yearlyLeaveHistory] : [],
      attachedWorksheets: sulochana.attachedWorksheets ? [...sulochana.attachedWorksheets] : [],
      commutationOpted: sulochana.commutationOpted,
      commutationPercentage: sulochana.commutationPercentage,
      ageNextBirthday: sulochana.ageNextBirthday,
      nomineeName: sulochana.nomineeName,
      nomineeRelation: sulochana.nomineeRelation,
      nomineeDob: sulochana.nomineeDob,
      familyMembers: (sulochana.familyMembers && sulochana.familyMembers.length > 0)
        ? [...sulochana.familyMembers]
        : [{ name: 'ದಾಸಪ್ಪ', relation: 'ಗಂಡ (Husband)', dob: '1960-05-10', maritalStatus: 'ವಿವಾಹಿತ' }],
      bankName: sulochana.bankName,
      bankBranch: sulochana.bankBranch,
      bankAccountNo: sulochana.bankAccountNo,
      ifscCode: sulochana.ifscCode,
      treasuryName: sulochana.treasuryName,
      gpfAgOrderNumber: sulochana.gpfAgOrderNumber || 'AG/KAR/GPF/FIN/2026/89412',
      gpfAgSanctionedAmount: sulochana.gpfAgSanctionedAmount || 842600,
      gpfHeadOfAccount: sulochana.gpfHeadOfAccount || '8009-01-101-0-01 (ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ - State Teachers GPF)',
      gisSavingsFundAmount: sulochana.gisSavingsFundAmount || 120000,
      gisHeadOfAccount: sulochana.gisHeadOfAccount || '8011-00-107-0-01 (ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರರ ಗುಂಪು ವಿಮಾ ಉಳಿತಾಯ ನಿಧಿ)',
      elEncashmentHeadOfAccount: sulochana.elEncashmentHeadOfAccount || '2202-01-101-1-01-052 (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವೆಚ್ಚ)',
      remarks: sulochana.remarks || ''
    });
    setSelectedCase(sulochana);
    showToast('ಶ್ರೀಮತಿ ಸಿ. ಎಂ. ಸುಲೋಚನಾ (C M SULOCHANA) ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!');
  };

  const handleLoadGiriyappaCase = handleLoadSulochanaCase;

  // Live Pension Calculation based on Form Data
  const liveCalculation = useMemo(() => {
    return computePensionDetails({
      doa: formData.doa,
      dor: formData.dor,
      dob: formData.dob,
      retirementAgeYears: formData.retirementAgeYears || 60,
      nonQualifyingDays: Number(formData.nonQualifyingDays) || 0,
      lastBasicPay: Number(formData.lastBasicPay) || 0,
      daPercentage: Number(formData.daPercentage) || 0,
      averageEmoluments: Number(formData.averageEmoluments) || Number(formData.lastBasicPay) || 0,
      earnedLeaveDays: Number(formData.earnedLeaveDays) || 0,
      halfPayLeaveDays: Number(formData.halfPayLeaveDays) || 0,
      commutationOpted: formData.commutationOpted,
      commutationPercentage: Number(formData.commutationPercentage) || 0,
      ageNextBirthday: Number(formData.ageNextBirthday) || (formData.retirementAgeYears === 65 ? 66 : 61)
    });
  }, [
    formData.doa,
    formData.dor,
    formData.dob,
    formData.retirementAgeYears,
    formData.nonQualifyingDays,
    formData.lastBasicPay,
    formData.daPercentage,
    formData.averageEmoluments,
    formData.earnedLeaveDays,
    formData.halfPayLeaveDays,
    formData.commutationOpted,
    formData.commutationPercentage,
    formData.ageNextBirthday
  ]);

  // Handle selecting an employee from the staff directory to auto-fill
  const handleSelectEmployee = (emp: Employee) => {
    const dob = emp.dob || '1966-01-01';
    const verified = calculateRetirementDate(dob, formData.retirementAgeYears || 60);

    setFormData(prev => ({
      ...prev,
      kgidNumber: emp.kgidNumber || '',
      employeeName: emp.fullName,
      parentOrSpouseName: emp.parentName || '',
      designation: emp.designation,
      cadreGroup: emp.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ',
      officeOrSchool: emp.officeLocation || emp.placeOfWork || 'ಸರ್ಕಾರಿ ಶಾಲೆ, ಭದ್ರಾವತಿ',
      gender: emp.gender || 'Male',
      dob,
      doa: emp.joiningDate || '1995-01-01',
      dor: verified.dor || '2026-05-31',
      ageNextBirthday: verified.ageNextBirthday,
      payScale: emp.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
      lastBasicPay: emp.basicPay || 53900,
      averageEmoluments: emp.basicPay || 53900,
      earnedLeaveDays: emp.earnedLeaveBalance || 240,
      nomineeName: emp.parentName ? `${emp.parentName} (ಕುಟುಂಬ ಸದಸ್ಯರು)` : '',
      bankName: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (SBI)',
      bankBranch: 'ಭದ್ರಾವತಿ ಶಾಖೆ',
      bankAccountNo: '',
      ifscCode: 'SBIN0000812'
    }));

    showToast(`ನೌಕರರ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ: ${emp.fullName}`);
    setEmpSearch('');
  };

  // Handle Save / Submit of Pension Case
  const handleSavePensionCase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kgidNumber || !formData.employeeName) {
      showToast('ದಯವಿಟ್ಟು KGID ಸಂಖ್ಯೆ ಮತ್ತು ನೌಕರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    const calc = computePensionDetails({
      doa: formData.doa,
      dor: formData.dor,
      dob: formData.dob,
      retirementAgeYears: formData.retirementAgeYears || 60,
      nonQualifyingDays: Number(formData.nonQualifyingDays) || 0,
      lastBasicPay: Number(formData.lastBasicPay) || 0,
      daPercentage: Number(formData.daPercentage) || 0,
      averageEmoluments: Number(formData.averageEmoluments) || Number(formData.lastBasicPay) || 0,
      earnedLeaveDays: Number(formData.earnedLeaveDays) || 0,
      halfPayLeaveDays: Number(formData.halfPayLeaveDays) || 0,
      commutationOpted: formData.commutationOpted,
      commutationPercentage: Number(formData.commutationPercentage) || 0,
      ageNextBirthday: Number(formData.ageNextBirthday) || (formData.retirementAgeYears === 65 ? 66 : 61)
    });

    const now = new Date().toISOString().split('T')[0];

    if (editingCaseId) {
      // Update existing
      setPensionCases(prev => prev.map(c => {
        if (c.id === editingCaseId) {
          const updated: PensionCaseRecord = {
            ...c,
            fileNumber: formData.fileNumber,
            fileId: formData.fileId || c.fileId || `PEN-FILE-2026-${formData.fileNumber || '01'}`,
            kgidNumber: formData.kgidNumber,
            employeeName: formData.employeeName,
            parentOrSpouseName: formData.parentOrSpouseName,
            permanentAddress: formData.permanentAddress,
            designation: formData.designation,
            cadreGroup: formData.cadreGroup,
            officeOrSchool: formData.officeOrSchool,
            gender: formData.gender,
            dob: formData.dob,
            doa: formData.doa,
            dor: formData.dor,
            retirementAgeYears: formData.retirementAgeYears,
            retirementType: formData.retirementType,
            payScale: formData.payScale,
            lastBasicPay: formData.lastBasicPay,
            daPercentage: formData.daPercentage,
            averageEmoluments: formData.averageEmoluments,
            earnedLeaveDays: formData.earnedLeaveDays,
            halfPayLeaveDays: formData.halfPayLeaveDays,
            nonQualifyingDays: formData.nonQualifyingDays,
            workHistorySchools: formData.workHistorySchools ? [...formData.workHistorySchools] : [],
            yearlyLeaveHistory: formData.yearlyLeaveHistory ? [...formData.yearlyLeaveHistory] : [],
            attachedWorksheets: formData.attachedWorksheets ? [...formData.attachedWorksheets] : [],
            commutationOpted: formData.commutationOpted,
            commutationPercentage: formData.commutationPercentage,
            ageNextBirthday: formData.ageNextBirthday,
            nomineeName: formData.nomineeName,
            nomineeRelation: formData.nomineeRelation,
            nomineeDob: formData.nomineeDob,
            familyMembers: formData.familyMembers ? [...formData.familyMembers] : [],
            bankName: formData.bankName,
            bankBranch: formData.bankBranch,
            bankAccountNo: formData.bankAccountNo,
            ifscCode: formData.ifscCode,
            treasuryName: formData.treasuryName,
            gpfAgOrderNumber: formData.gpfAgOrderNumber,
            gpfAgSanctionedAmount: formData.gpfAgSanctionedAmount,
            gpfHeadOfAccount: formData.gpfHeadOfAccount,
            gisSavingsFundAmount: formData.gisSavingsFundAmount,
            gisHeadOfAccount: formData.gisHeadOfAccount,
            elEncashmentHeadOfAccount: formData.elEncashmentHeadOfAccount,
            calculation: calc,
            remarks: formData.remarks,
            lastUpdated: now
          };
          if (selectedCase.id === editingCaseId) setSelectedCase(updated);
          // Persist to backend database (SQLite/JSON)
          fetch('/api/pension-cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch(err => console.error('Failed to update pension case in SQLite:', err));
          return updated;
        }
        return c;
      }));
      showToast(`ಪಿಂಚಣಿ ಪ್ರಕರಣವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (Case Updated): ${formData.employeeName}`);
    } else {
      // Create new
      const newCase: PensionCaseRecord = {
        id: `pen-case-${Date.now()}`,
        caseNumber: `BEO/BHD/PEN/${new Date().getFullYear()}/${String(pensionCases.length + 1).padStart(2, '0')}`,
        fileNumber: formData.fileNumber,
        fileId: formData.fileId || `PEN-FILE-2026-${formData.fileNumber || String(pensionCases.length + 1).padStart(2, '0')}`,
        kgidNumber: formData.kgidNumber,
        employeeName: formData.employeeName,
        parentOrSpouseName: formData.parentOrSpouseName,
        permanentAddress: formData.permanentAddress,
        designation: formData.designation,
        cadreGroup: formData.cadreGroup,
        officeOrSchool: formData.officeOrSchool,
        gender: formData.gender,
        dob: formData.dob,
        doa: formData.doa,
        dor: formData.dor,
        retirementAgeYears: formData.retirementAgeYears,
        retirementType: formData.retirementType,
        payScale: formData.payScale,
        lastBasicPay: formData.lastBasicPay,
        daPercentage: formData.daPercentage,
        averageEmoluments: formData.averageEmoluments,
        earnedLeaveDays: formData.earnedLeaveDays,
        halfPayLeaveDays: formData.halfPayLeaveDays,
        nonQualifyingDays: formData.nonQualifyingDays,
        workHistorySchools: formData.workHistorySchools ? [...formData.workHistorySchools] : [],
        yearlyLeaveHistory: formData.yearlyLeaveHistory ? [...formData.yearlyLeaveHistory] : [],
        attachedWorksheets: formData.attachedWorksheets ? [...formData.attachedWorksheets] : [],
        commutationOpted: formData.commutationOpted,
        commutationPercentage: formData.commutationPercentage,
        ageNextBirthday: formData.ageNextBirthday,
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        nomineeDob: formData.nomineeDob,
        familyMembers: formData.familyMembers ? [...formData.familyMembers] : [],
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        bankAccountNo: formData.bankAccountNo,
        ifscCode: formData.ifscCode,
        treasuryName: formData.treasuryName,
        gpfAgOrderNumber: formData.gpfAgOrderNumber,
        gpfAgSanctionedAmount: formData.gpfAgSanctionedAmount,
        gpfHeadOfAccount: formData.gpfHeadOfAccount,
        gisSavingsFundAmount: formData.gisSavingsFundAmount,
        gisHeadOfAccount: formData.gisHeadOfAccount,
        elEncashmentHeadOfAccount: formData.elEncashmentHeadOfAccount,
        calculation: calc,
        checklist: {
          serviceBookVerified: true,
          form7Triplicate: true,
          jointPhotosAttested: false,
          specimenSignatures: false,
          noDueCertificate: false,
          lastPayCertificate: false,
          form1And2Nomination: false,
          aadharBankPassbook: false
        },
        status: 'ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ (Drafting)',
        movementHistory: [
          {
            id: `mov-${Date.now()}`,
            fromOfficer: currentUser?.displayName || 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA - ಪಿಂಚಣಿ)',
            toOfficer: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)',
            sentDate: now,
            remarks: 'ಹೊಸ ಪಿಂಚಣಿ ಪ್ರಕರಣ ದಾಖಲಿಸಲಾಗಿದೆ. 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ ಸಿದ್ಧವಾಗಿದೆ.',
            statusAfterMove: 'ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ (Drafting)'
          }
        ],
        remarks: formData.remarks,
        createdAt: now,
        lastUpdated: now
      };

      setPensionCases(prev => [newCase, ...prev]);
      setSelectedCase(newCase);
      // Persist to backend database (SQLite/JSON)
      fetch('/api/pension-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      }).catch(err => console.error('Failed to create pension case in SQLite:', err));
      showToast(`ಹೊಸ ಪಿಂಚಣಿ ಪ್ರಕರಣ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ: ${formData.employeeName}`);
    }

    setEditingCaseId(null);
    setActiveSubTab('calculations'); // Switch to 4 separate calculations view
  };

  // Switch to Edit Mode
  const handleEditCase = (c: PensionCaseRecord) => {
    setEditingCaseId(c.id);
    setFormData({
      fileNumber: c.fileNumber,
      fileId: c.fileId || `PEN-FILE-2026-${c.fileNumber || '01'}`,
      kgidNumber: c.kgidNumber,
      employeeName: c.employeeName,
      parentOrSpouseName: c.parentOrSpouseName || '',
      permanentAddress: c.permanentAddress || '',
      designation: c.designation,
      cadreGroup: c.cadreGroup,
      officeOrSchool: c.officeOrSchool,
      gender: c.gender || 'Male',
      dob: c.dob,
      doa: c.doa,
      dor: c.dor,
      retirementAgeYears: c.retirementAgeYears || 60,
      retirementType: c.retirementType,
      payScale: c.payScale,
      lastBasicPay: c.lastBasicPay,
      daPercentage: c.daPercentage,
      averageEmoluments: c.averageEmoluments || c.lastBasicPay,
      earnedLeaveDays: c.earnedLeaveDays,
      halfPayLeaveDays: c.halfPayLeaveDays || 0,
      nonQualifyingDays: c.nonQualifyingDays || 0,
      workHistorySchools: c.workHistorySchools ? [...c.workHistorySchools] : [],
      yearlyLeaveHistory: c.yearlyLeaveHistory ? [...c.yearlyLeaveHistory] : [],
      attachedWorksheets: c.attachedWorksheets ? [...c.attachedWorksheets] : [],
      commutationOpted: c.commutationOpted,
      commutationPercentage: c.commutationPercentage,
      ageNextBirthday: c.ageNextBirthday,
      nomineeName: c.nomineeName,
      nomineeRelation: c.nomineeRelation,
      nomineeDob: c.nomineeDob,
      familyMembers: c.familyMembers ? [...c.familyMembers] : [],
      bankName: c.bankName,
      bankBranch: c.bankBranch,
      bankAccountNo: c.bankAccountNo,
      ifscCode: c.ifscCode,
      treasuryName: c.treasuryName,
      gpfAgOrderNumber: c.gpfAgOrderNumber || 'AG/KAR/GPF/FIN/2026/89412',
      gpfAgSanctionedAmount: c.gpfAgSanctionedAmount || 842600,
      gpfHeadOfAccount: c.gpfHeadOfAccount || '8009-01-101-0-01 (ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ - State Teachers GPF)',
      gisSavingsFundAmount: c.gisSavingsFundAmount || 86400,
      gisHeadOfAccount: c.gisHeadOfAccount || '8011-00-107-0-01 (ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರರ ಗುಂಪು ವಿಮಾ ಉಳಿತಾಯ ನಿಧಿ)',
      elEncashmentHeadOfAccount: c.elEncashmentHeadOfAccount || '2202-01-101-1-01-052 (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವೆಚ್ಚ)',
      remarks: c.remarks || ''
    });
    setActiveSubTab('input');
  };

  // Toggle checklist item
  const handleToggleChecklist = (caseId: string, itemKey: keyof PensionDocumentsChecklist) => {
    setPensionCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedChecklist = {
          ...c.checklist,
          [itemKey]: !c.checklist[itemKey]
        };
        const updated = {
          ...c,
          checklist: updatedChecklist,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        if (selectedCase.id === caseId) setSelectedCase(updated);
        return updated;
      }
      return c;
    }));
    showToast('ದಾಖಲಾತಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ನವೀಕರಿಸಲಾಗಿದೆ.');
  };

  // Update Status of Case
  const handleUpdateStatus = (caseId: string, newStatus: PensionCaseStatus) => {
    setPensionCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const now = new Date().toISOString().split('T')[0];
        const newMov = {
          id: `mov-${Date.now()}`,
          fromOfficer: currentUser?.displayName || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
          toOfficer: newStatus.includes('ರವಾನೆ') ? 'ಮಹಾಲೆಕ್ಕಪಾಲರು (AG), ಬೆಂಗಳೂರು' : 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
          sentDate: now,
          remarks: `ಸ್ಥಿತಿಯನ್ನು "${newStatus}" ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.`,
          statusAfterMove: newStatus
        };
        const updated = {
          ...c,
          status: newStatus,
          movementHistory: [...c.movementHistory, newMov],
          lastUpdated: now
        };
        if (selectedCase.id === caseId) setSelectedCase(updated);
        return updated;
      }
      return c;
    }));
    showToast(`ಪ್ರಕರಣದ ಸ್ಥಿತಿಯನ್ನು "${newStatus}" ಗೆ ನವೀಕರಿಸಲಾಗಿದೆ.`);
  };

  // Save active letter format to Dak Registry
  const handleSaveActiveLetterToRegistry = () => {
    if (!selectedCase) return;
    const refNum = selectedCase.fileNumber
      ? (selectedCase.fileNumber.startsWith('ಸಂ:') ? selectedCase.fileNumber : `ಸಂ: ${selectedCase.fileNumber}`)
      : (selectedCase.fileId ? `ಸಂ: ${selectedCase.fileId}` : `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಪಿಂಚಣಿ/${selectedCase.kgidNumber}/${selectedFormat}/2026-27`);
    const formatTitles: Record<PensionLetterFormatType, string> = {
      pension_calc_sheet: '4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (ಪಿಂಚಣಿ, ಉಪದಾನ, ಪರಿವರ್ತನೆ & ರಜೆ ನಗದೀಕರಣ)',
      form7: 'ಪ್ರಪತ್ರ-7 ಪಿಂಚಣಿ ಮತ್ತು ಉಪದಾನ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ',
      avg_emoluments_12m: 'ಕಳೆದ 12 ತಿಂಗಳಲ್ಲಿ ಪಡೆದ ಉಪಲಬ್ಧಗಳು (Average Emoluments)',
      schools_service_history: 'ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಶಾಲೆಗಳ ಸೇವಾ ವಿವರಗಳು (Schools History)',
      form1_2: 'ನಮೂನೆ-1 ಮತ್ತು 2 ಪಿಂಚಣಿ ಅರ್ಜಿ ಹಾಗೂ ಕುಟುಂಬ ನಾಮನಿರ್ದೇಶನ',
      form6: 'ನಮೂನೆ-6 ಸೇವಾ ಪರಿಶೀಲನೆ ಹಾಗೂ ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ',
      sanction_order: 'ಪಿಂಚಣಿ ಮತ್ತು ನಿವೃತ್ತಿ ಉಪದಾನ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನಾ ಆದೇಶ',
      gratuity_order: 'ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG) ಮಂಜೂರಾತಿ ಆದೇಶ',
      commutation_order: 'ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (CVP) ಮಂಜೂರಾತಿ ಆದೇಶ',
      el_encashment_order: 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರಾತಿ ಆದೇಶ',
      el_office_order_kannada: 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಕಚೇರಿ ಆದೇಶ (ಕನ್ನಡ - Head of Account)',
      el_office_order_english: 'Earned Leave Encashment Office Order (English)',
      gpf_office_order: 'ಜಿ.ಪಿ.ಎಫ್ (GPF) ಅಂತಿಮ ಪಾವತಿ ಕಚೇರಿ ಆದೇಶ (AG Order)',
      gpf_final_withdrawal: 'ಜಿ.ಪಿ.ಎಫ್ ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ ಪ್ರಮಾಣಪತ್ರ',
      gpf_form_6b: 'ನಮೂನೆ 6 (ಬಿ) ಜಿ.ಪಿ.ಎಫ್ ಅಂತಿಮ ಸಂದಾಯಕ್ಕೆ ಅರ್ಜಿ',
      gis_office_order: 'ಜಿ.ಐ.ಎಸ್ (GIS) ಅಂತಿಮ ಉಳಿತಾಯ ನಿಧಿ ಮಂಜೂರಾತಿ ಆದೇಶ',
      fingerprints_sheet: '10 ಬೆರಳುಗಳ ಗುರುತು ಪಟ್ಟಿ',
      service_verification_cert: 'ಸೇವಾ ಪರಿಶೀಲನಾ ಪ್ರಮಾಣಪತ್ರ',
      provisional_order: 'ತಾತ್ಕಾಲಿಕ ಪಿಂಚಣಿ ಮತ್ತು ಉಪದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ (KCSR 341)',
      ag_forwarding: 'ಮಹಾಲೆಕ್ಕಪಾಲರಿಗೆ (AG Karnataka) ಪ್ರಸ್ತಾವನಾ ರವಾನೆ ಪತ್ರ',
      no_dues_cert: 'ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ (No Dues Certificate)',
      earned_leave_sheet: 'ಗಳಿಕೆ ರಜೆ ವಿವರಣೆ ಪಟ್ಟಿ (17 ರಜೆ ಅವಧಿಗಳು)',
      non_receipt_recovery: 'ನಿವೃತ್ತಿ ವೇತನ ಸ್ವೀಕರಿಸದಿರುವ ಘೋಷಣೆ & ವಸೂಲಿ ಒಪ್ಪಿಗೆ ಪತ್ರ',
      specimen_signatures_photo: 'ಮಾದರಿ ಸಹಿ, ಎತ್ತರ, ಗುರುತು & ಜಂಟಿ ಭಾವಚಿತ್ರ ಪತ್ರ',
      self_address_slips: 'ಸ್ವವಿಳಾಸ ಚೀಟಿ (Self-Address Slips)',
      family_pension_nomination: 'ಕುಟುಂಬ ವೇತನ ನಾಮನಿರ್ದೇಶನ ಪತ್ರ (1964 Rules)',
      non_reemployment_undertaking: 'ಮರು ನೌಕರಿಯಿಲ್ಲ ದೃಢೀಕರಣ & ಅಗತ್ಯವಾದ ಘೋಷಣೆ',
      pension_sanction_summary: 'ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರಾತಿ ಸಾರಾಂಶ ಪಟ್ಟಿ',
      retirement_advance_form: 'ನಿವೃತ್ತಿ ದಿನಾಂಕಕ್ಕಿಂತ 1 ವರ್ಷ ಮುಂಚಿತವಾಗಿ ಪಡೆಯಬೇಕಾದ ವಿವರ (Bio-data & 1/3 CVP)',
      non_qualifying_service: 'ವಿಭಾಗ-III & IV ಅನರ್ಹತಾ ಸೇವೆ & ಪರಿಶೋಧನೆ'
    };

    const htmlContent = renderPensionFormatHtml(selectedFormat, selectedCase, DEFAULT_PENSION_OFFICE_CONFIG);

    if (onSaveLetterToRegistry) {
      onSaveLetterToRegistry({
        referenceNumber: refNum,
        fileNumber: selectedCase.fileNumber,
        direction: 'outward',
        subject: `${formatTitles[selectedFormat]} - ಶ್ರೀ/ಶ್ರೀಮತಿ ${selectedCase.employeeName}, KGID: ${selectedCase.kgidNumber}`,
        category: 'Official Order',
        senderName: DEFAULT_PENSION_OFFICE_CONFIG.officerName,
        senderDesignation: DEFAULT_PENSION_OFFICE_CONFIG.officerDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
        senderDepartment: DEFAULT_PENSION_OFFICE_CONFIG.officeName,
        recipientName: selectedFormat === 'ag_forwarding' ? 'ಪ್ರಧಾನ ಮಹಾಲೆಕ್ಕಪಾಲರು (A&E), ಕರ್ನಾಟಕ, ಬೆಂಗಳೂರು' : selectedCase.employeeName,
        recipientDesignation: selectedFormat === 'ag_forwarding' ? 'Accountant General' : selectedCase.designation,
        recipientDepartment: selectedCase.officeOrSchool,
        priority: 'Immediate',
        status: 'Approved & Signed',
        section: 'Administration & Services',
        sectionCode: 'ಆ2',
        sectionName: 'ಸ.ಪ್ರಾ.ಶಿ',
        bodyText: htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        financialAmount: selectedCase.calculation.dcrgSanctioned + selectedCase.calculation.commutationLumpSum,
        tags: ['Pension', 'KCSR', 'Retirement', selectedCase.kgidNumber, selectedFormat]
      });
      showToast(`ಪತ್ರವನ್ನು ಜಾವಕ ರಿಜಿಸ್ಟ್ರಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ: ${refNum}`);
    } else {
      showToast('ಪತ್ರವನ್ನು ರಿಜಿಸ್ಟ್ರಿಗೆ ನಮೂದಿಸಲಾಗಿದೆ.');
    }
  };

  // Print Active Letter
  const handlePrintDocument = () => {
    window.print();
  };

  // Copy HTML to Clipboard
  const handleCopyHtml = () => {
    if (!selectedCase) return;
    const html = renderPensionFormatHtml(selectedFormat, selectedCase, DEFAULT_PENSION_OFFICE_CONFIG);
    navigator.clipboard.writeText(html);
    showToast('ದಾಖಲಾತಿಯ HTML ಪಠ್ಯವನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ.');
  };

  // ---------------------------------------------------------------------------
  // PENSION CALCULATOR COMPUTATION & HANDLERS
  // ---------------------------------------------------------------------------
  // Compute live estimate using Karnataka Government 7th Pay Commission & KCSR rules
  const quickEstimateResult: QuickPensionEstimateResult = useMemo(() => {
    return calculateQuickPensionEstimate({
      yearsOfService: Number(calcYearsOfService) || 0,
      lastBasicPay: Number(calcLastBasicPay) || 0,
      daPercentage: calcDaPercentage,
      commutationOpted: calcCommutationOpted,
      commutationPercentage: calcCommutationPercentage,
      earnedLeaveDays: calcEarnedLeaveDays,
      halfPayLeaveDays: calcHalfPayLeaveDays,
      ageNextBirthday: calcAgeNextBirthday
    });
  }, [
    calcYearsOfService,
    calcLastBasicPay,
    calcDaPercentage,
    calcCommutationOpted,
    calcCommutationPercentage,
    calcEarnedLeaveDays,
    calcHalfPayLeaveDays,
    calcAgeNextBirthday
  ]);

  // Handle employee selection from Roster to auto-populate Years of Service and Last Basic Pay
  const handleSelectEmployeeForCalc = (empId: string) => {
    setCalcSelectedEmpId(empId);
    if (!empId) return;
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const empName = emp.fullName || emp.name || '';
    setCalcEmployeeName(empName);
    setCalcDesignation(emp.designation || 'ಶಿಕ್ಷಕರು / ಸಿಬ್ಬಂದಿ');
    setCalcKgid(emp.kgidNumber || emp.employeeCode || '');
    if (emp.basicPay) {
      setCalcLastBasicPay(emp.basicPay);
    }
    if (emp.joiningDate) {
      const served = calculateYearsServed(emp.joiningDate);
      if (served) {
        setCalcYearsOfService(served.decimalYears);
      }
    }
    showToast(`ನೌಕರರ ವಿವರ & ಸೇವಾ ವರ್ಷಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿದೆ: ${empName}`);
  };

  // Handle copying calculation summary
  const handleCopyCalcSummary = () => {
    const summary = `
================================================================
ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ಅಂದಾಜು ಲೆಕ್ಕಾಚಾರ (PENSION ESTIMATE)
================================================================
ನೌಕರರ ಹೆಸರು: ${calcEmployeeName || 'ನೌಕರರು'} (${calcDesignation || ''})
ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ: ${calcKgid || 'N/A'}
ಸೇವಾ ಅವಧಿ (Years of Service): ${calcYearsOfService} ವರ್ಷಗಳು (${quickEstimateResult.completedHalfYears} ಅರ್ಧವರ್ಷಗಳು)
ಕೊನೆಯ ಮೂಲ ವೇತನ (Last Basic Pay): ₹${formatINR(quickEstimateResult.lastBasicPay)}
ತುಟ್ಟಿಭತ್ಯೆ ದರ (DA Rate): ${quickEstimateResult.daPercentage}% (₹${formatINR(quickEstimateResult.daAmount)})
ಮಾಸಿಕ ಒಟ್ಟು ವೇತನ (Monthly Emoluments): ₹${formatINR(quickEstimateResult.monthlyEmoluments)}

----------------------------------------------------------------
1. ಒಟ್ಟು ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳು (TOTAL TERMINAL BENEFITS - LUMP SUM):
----------------------------------------------------------------
• ನಿವೃತ್ತಿ ಉಪದಾನ (Retirement Gratuity/DCRG): ₹${formatINR(quickEstimateResult.dcrgSanctioned)}
• ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಇಡುಗಂಟು (Commutation - CVP 40%): ₹${formatINR(quickEstimateResult.commutationLumpSum)}
• ರಜೆ ನಗದೀಕರಣ ಮೊತ್ತ (Leave Encashment): ₹${formatINR(quickEstimateResult.totalLeaveEncashment)}
>>> ಒಟ್ಟು ಇಡುಗಂಟು ಸೌಲಭ್ಯಗಳು (GRAND TOTAL): ₹${formatINR(quickEstimateResult.totalTerminalBenefits)}
(${numberToKannadaWords(quickEstimateResult.totalTerminalBenefits)})

----------------------------------------------------------------
2. ಮಾಸಿಕ ಪಿಂಚಣಿ ಸೌಲಭ್ಯಗಳು (MONTHLY PENSION RECEIVABLE):
----------------------------------------------------------------
• ಪೂರ್ಣ ಮೂಲ ಪಿಂಚಣಿ (50% Basic): ₹${formatINR(quickEstimateResult.fullPension)}
• ನಿವ್ವಳ ಮೂಲ ಪಿಂಚಣಿ (ಪರಿವರ್ತನೆ ನಂತರ): ₹${formatINR(quickEstimateResult.reducedMonthlyPension)}
• ತುಟ್ಟಿ ಪರಿಹಾರ (Dearness Relief): ₹${formatINR(quickEstimateResult.dearnessRelief)}
>>> ಒಟ್ಟು ಮಾಸಿಕ ಜಮೆ (MONTHLY NET RECEIVABLE): ₹${formatINR(quickEstimateResult.totalMonthlyReceivable)} / ತಿಂಗಳು

----------------------------------------------------------------
3. ಕುಟುಂಬ ಪಿಂಚಣಿ (FAMILY PENSION):
----------------------------------------------------------------
• ಸಾಮಾನ್ಯ ದರ (30% Normal): ₹${formatINR(quickEstimateResult.familyPensionNormal)} / ತಿಂಗಳು
• ಹೆಚ್ಚುವರಿ ದರ (50% Enhanced): ₹${formatINR(quickEstimateResult.familyPensionEnhanced)} / ತಿಂಗಳು
================================================================
    `.trim();

    navigator.clipboard.writeText(summary);
    showToast('ಪಿಂಚಣಿ ಅಂದಾಜು ಸಾರಾಂಶವನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ.');
  };

  // Convert Estimate to a New Pension Case in Sub-tab 2
  const handleTransferToPensionCase = () => {
    setEditingCaseId(null);
    setFormData(prev => ({
      ...prev,
      employeeName: calcEmployeeName || prev.employeeName,
      designation: calcDesignation || prev.designation,
      kgidNumber: calcKgid || prev.kgidNumber,
      lastBasicPay: Number(calcLastBasicPay) || prev.lastBasicPay,
      averageEmoluments: Number(calcLastBasicPay) || prev.averageEmoluments,
      daPercentage: calcDaPercentage,
      commutationOpted: calcCommutationOpted,
      commutationPercentage: calcCommutationPercentage,
      earnedLeaveDays: calcEarnedLeaveDays,
      halfPayLeaveDays: calcHalfPayLeaveDays,
      remarks: `ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ನಿಂದ ರಚಿಸಲಾಗಿದೆ (ಸೇವೆ: ${calcYearsOfService} ವರ್ಷಗಳು, ಮೂಲವೇತನ: ₹${calcLastBasicPay})`
    }));
    setActiveSubTab('input');
    showToast('ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ನ ದತ್ತಾಂಶವನ್ನು ಪಿಂಚಣಿ ಕಡತ ನಮೂದಿಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.');
  };

  // 10-Year Retirement Benefits Growth Trendline Data Projection (Recharts)
  const tenYearTrendData = useMemo(() => {
    const currentPay = Number(calcLastBasicPay) || 50000;
    const currentYears = Number(calcYearsOfService) || 25;
    const daRate = Number(calcDaPercentage) || 42.5;
    const commutationOpted = calcCommutationOpted;
    const commPercent = Number(calcCommutationPercentage) || 40;
    const leaveDays = Number(calcEarnedLeaveDays) || 300;
    const hplDays = Number(calcHalfPayLeaveDays) || 30;

    const data = [];
    const baseEstimate = calculateQuickPensionEstimate({
      yearsOfService: currentYears,
      lastBasicPay: currentPay,
      daPercentage: daRate,
      commutationOpted,
      commutationPercentage: commPercent,
      earnedLeaveDays: leaveDays,
      halfPayLeaveDays: hplDays
    });

    data.push({
      year: 0,
      yearLabel: 'ಪ್ರಸ್ತುತ (Now)',
      basicPay: Math.round(currentPay),
      terminalBenefits: Math.round(baseEstimate.totalTerminalBenefits),
      monthlyPension: Math.round(baseEstimate.totalMonthlyReceivable),
      gratuity: Math.round(baseEstimate.dcrgSanctioned),
      commutation: Math.round(baseEstimate.commutationLumpSum),
    });

    for (let y = 1; y <= 10; y++) {
      const projectedPay = currentPay * Math.pow(1 + annualIncrementPercent / 100, y);
      const projectedYears = Math.min(33, currentYears + y);
      const est = calculateQuickPensionEstimate({
        yearsOfService: projectedYears,
        lastBasicPay: projectedPay,
        daPercentage: daRate + y * 2, // DA historically increases over time
        commutationOpted,
        commutationPercentage: commPercent,
        earnedLeaveDays: leaveDays,
        halfPayLeaveDays: hplDays
      });

      data.push({
        year: y,
        yearLabel: `+${y} ವ (${2026 + y})`,
        basicPay: Math.round(projectedPay),
        terminalBenefits: Math.round(est.totalTerminalBenefits),
        monthlyPension: Math.round(est.totalMonthlyReceivable),
        gratuity: Math.round(est.dcrgSanctioned),
        commutation: Math.round(est.commutationLumpSum),
      });
    }

    return data;
  }, [
    calcLastBasicPay, 
    calcYearsOfService, 
    calcDaPercentage, 
    calcCommutationOpted, 
    calcCommutationPercentage, 
    calcEarnedLeaveDays, 
    calcHalfPayLeaveDays, 
    annualIncrementPercent
  ]);

  // Handle downloading official Service Record & Pension Projection summary document (PDF)
  const handleDownloadServiceRecordPdf = () => {
    const currentPay = Number(calcLastBasicPay) || 0;
    const years = Number(calcYearsOfService) || 0;
    const empName = calcEmployeeName || 'ನೌಕರರ ಹೆಸರು (ಹೆಸರು ನಮೂದಿಸಿಲ್ಲ)';
    const desig = calcDesignation || 'ಸಹ ಶಿಕ್ಷಕರು';
    const kgid = calcKgid || 'KGID-104928';
    const qualifyingHalfYears = quickEstimateResult.completedHalfYears;
    const gratuity = quickEstimateResult.dcrgSanctioned;
    const commutation = quickEstimateResult.commutationLumpSum;
    const totalLumpSum = quickEstimateResult.totalTerminalBenefits;
    const basicPension = quickEstimateResult.fullPension;
    const reducedPension = quickEstimateResult.reducedMonthlyPension;
    const dearnessRelief = quickEstimateResult.dearnessRelief;
    const monthlyNetPension = quickEstimateResult.totalMonthlyReceivable;
    const familyNormal = quickEstimateResult.familyPensionNormal;
    const familyEnhanced = quickEstimateResult.familyPensionEnhanced;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html lang="kn">
        <head>
          <meta charset="utf-8" />
          <title>ಸೇವಾ ವಹಿ & ಪಿಂಚಣಿ ಸಾರಾಂಶ - ${empName}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: 'Noto Sans Kannada', Arial, sans-serif; color: #1c1917; font-size: 11px; line-height: 1.45; margin: 0; padding: 15px; }
            .header { text-align: center; border-bottom: 2px solid #1c1917; padding-bottom: 10px; margin-bottom: 12px; }
            .title { font-size: 15px; font-weight: bold; margin-bottom: 3px; color: #1c1917; }
            .sub { font-size: 11px; color: #444; }
            .badge { display: inline-block; background: #fef3c7; border: 1px solid #f59e0b; padding: 2px 8px; font-weight: bold; font-size: 10px; border-radius: 4px; margin-top: 4px; color: #78350f; }
            .section-title { font-size: 12px; font-weight: bold; background: #f3f4f6; padding: 4px 8px; border-left: 4px solid #d97706; margin-top: 12px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10.5px; }
            th, td { border: 1px solid #d1d5db; padding: 5px 7px; text-align: left; }
            th { background: #f9fafb; font-weight: bold; color: #374151; }
            .amount { font-family: monospace; font-weight: bold; text-align: right; }
            .total-row { background: #fef3c7; font-weight: bold; }
            .footer-signs { display: flex; justify-content: space-between; margin-top: 35px; padding-top: 15px; }
            .sign-box { text-align: center; width: 45%; }
            .sign-line { border-top: 1px dashed #4b5563; margin-top: 45px; padding-top: 4px; font-size: 10.5px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="font-weight: bold; font-size: 10.5px; text-transform: uppercase;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
            <div class="title">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
            <div class="sub">ಸರ್ಕಾರಿ ನೌಕರರ ಅಧಿಕೃತ ಸೇವಾ ವಹಿ ಹಾಗೂ ನಿವೃತ್ತಿ ವೇತನ ಸೌಲಭ್ಯಗಳ ಸಾರಾಂಶ ಪತ್ರ</div>
            <div class="badge">KCSR ನಿಯಮಾವಳಿಗಳು • 7ನೇ ರಾಜ್ಯ ವೇತನ ಆಯೋಗ (42.5% DA)</div>
          </div>

          <div class="section-title">1. ನೌಕರರ ಸೇವಾ ವಿವರಗಳು (Employee Service Summary)</div>
          <table>
            <tr>
              <th width="25%">ನೌಕರರ ಪೂರ್ಣ ಹೆಸರು:</th>
              <td width="35%"><strong>${empName}</strong></td>
              <th width="20%">ಹುದ್ದೆಯ ಹೆಸರು:</th>
              <td width="20%">${desig}</td>
            </tr>
            <tr>
              <th>KGID / HRMS ಸಂಖ್ಯೆ:</th>
              <td style="font-family: monospace;">${kgid}</td>
              <th>ಕಛೇರಿ / ಶಾಲೆಯ ಹೆಸರು:</th>
              <td>ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ / ಪ್ರೌಢಶಾಲೆ, ಭದ್ರಾವತಿ</td>
            </tr>
            <tr>
              <th>ಪರಿಗಣಿತ ಅರ್ಹತಾ ಸೇವೆ:</th>
              <td><strong>${years} ವರ್ಷಗಳು</strong></td>
              <th>ಒಟ್ಟು ಅರ್ಧವರ್ಷಗಳು:</th>
              <td style="font-family: monospace;">${qualifyingHalfYears} ಅರ್ಧವರ್ಷಗಳು (ಗರಿಷ್ಠ 60)</td>
            </tr>
            <tr>
              <th>ಕೊನೆಯ ಮೂಲ ವೇತನ:</th>
              <td class="amount">₹${formatINR(currentPay)}</td>
              <th>ತುಟ್ಟಿಭತ್ಯೆ (DA @ 42.5%):</th>
              <td class="amount">₹${formatINR(Math.round(currentPay * 0.425))}</td>
            </tr>
          </table>

          <div class="section-title">2. ನಿವೃತ್ತಿ ಇಡುಗಂಟು ಸೌಲಭ್ಯಗಳು (Terminal Lump Sum Benefits)</div>
          <table>
            <thead>
              <tr>
                <th width="8%">ಕ್ರ.ಸಂ</th>
                <th>ಸೌಲಭ್ಯದ ವಿವರ</th>
                <th>ಸೂತ್ರ / ನಿಯಮಾವಳಿ</th>
                <th style="text-align: right;" width="25%">ಅಂದಾಜು ಮೊತ್ತ (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG / Gratuity)</strong></td>
                <td>(ವೇತನ + DA) ÷ 4 × ${Math.min(66, qualifyingHalfYears)} ಅರ್ಧವರ್ಷಗಳು (ಗರಿಷ್ಠ ₹20 ಲಕ್ಷ)</td>
                <td class="amount">₹${formatINR(gratuity)}</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಇಡುಗಂಟು (Commutation - CVP 40%)</strong></td>
                <td>40% ಪರಿವರ್ತನೆ × 12 × 8.194 ಗುಣಕ</td>
                <td class="amount">₹${formatINR(commutation)}</td>
              </tr>
              <tr>
                <td>3</td>
                <td><strong>ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (${quickEstimateResult.earnedLeaveDays} ದಿನ)</strong></td>
                <td>(ವೇತನ + DA) ÷ 30 × ${quickEstimateResult.earnedLeaveDays} ದಿನಗಳು</td>
                <td class="amount">₹${formatINR(quickEstimateResult.leaveEncashmentAmount)}</td>
              </tr>
              <tr>
                <td>4</td>
                <td><strong>ಅರೆವೇತನ ರಜೆ ನಗದೀಕರಣ (${quickEstimateResult.halfPayLeaveDays} ದಿನ)</strong></td>
                <td>(ಅರೆವೇತನ + DA) ÷ 30 × ${quickEstimateResult.halfPayLeaveDays} ದಿನಗಳು</td>
                <td class="amount">₹${formatINR(quickEstimateResult.halfPayEncashmentAmount)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>ಒಟ್ಟು ನಿವೃತ್ತಿ ಇಡುಗಂಟು (Grand Total Lump Sum):</strong></td>
                <td class="amount" style="font-size: 12px; color: #92400e;">₹${formatINR(totalLumpSum)}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">3. ಮಾಸಿಕ ನಿವ್ವಳ ಪಿಂಚಣಿ ವಿವರಗಳು (Monthly Net Pension Receivable)</div>
          <table>
            <tr>
              <th width="35%">ಪೂರ್ಣ ಮೂಲ ಪಿಂಚಣಿ (Gross 50%):</th>
              <td class="amount" width="15%">₹${formatINR(basicPension)}</td>
              <th width="35%">40% ಪರಿವರ್ತನೆ ಕಡಿತ (CVP Deduction):</th>
              <td class="amount" width="15%">-₹${formatINR(quickEstimateResult.commutedPortion)}</td>
            </tr>
            <tr>
              <th>ಕಡಿತದ ನಂತರದ ಮೂಲ ಪಿಂಚಣಿ:</th>
              <td class="amount">₹${formatINR(reducedPension)}</td>
              <th>ತುಟ್ಟಿ ಪರಿಹಾರ (Dearness Relief @ 42.5%):</th>
              <td class="amount">₹${formatINR(dearnessRelief)}</td>
            </tr>
            <tr class="total-row">
              <th colspan="2" style="text-align: right;">ನಿವ್ವಳ ಮಾಸಿಕ ಪಾವತಿ ಪಿಂಚಣಿ (Net Monthly Receivable):</th>
              <td colspan="2" class="amount" style="font-size: 12px; color: #065f46;">₹${formatINR(monthlyNetPension)} / ತಿಂಗಳು</td>
            </tr>
            <tr>
              <th>ಕುಟುಂಬ ಪಿಂಚಣಿ (ಸಾಮಾನ್ಯ ದರ 30%):</th>
              <td class="amount">₹${formatINR(familyNormal)} / ತಿಂಗಳು</td>
              <th>ಕುಟುಂಬ ಪಿಂಚಣಿ (ಹೆಚ್ಚುವರಿ ದರ 50%):</th>
              <td class="amount">₹${formatINR(familyEnhanced)} / ತಿಂಗಳು</td>
            </tr>
          </table>

          <div class="footer-signs">
            <div class="sign-box">
              <div class="sign-line">
                ಲೆಕ್ಕ ಪರಿಶೋಧಕರು / ವಿಷಯ ನಿರ್ವಾಹಕರು<br/>
                (ಪರಿಶೀಲಿಸಿದವರು)
              </div>
            </div>
            <div class="sign-box">
              <div class="sign-line">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ<br/>
                ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು (ದೃಢೀಕರಿಸಿದವರು)
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    showToast('ಸೇವಾ ವಹಿ & ಪಿಂಚಣಿ ಸಾರಾಂಶ ದಾಖಲೆಯನ್ನು ಮುದ್ರಣಕ್ಕೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.');
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return pensionCases.filter(c => {
      const matchSearch = searchQuery === '' || 
        c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.kgidNumber.includes(searchQuery) ||
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fileNumber.includes(searchQuery) ||
        c.officeOrSchool.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pensionCases, searchQuery, statusFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = pensionCases.length;
    const sanctioned = pensionCases.filter(c => c.status.includes('ಅನುಮೋದಿತ') || c.status.includes('PPO')).length;
    const sentToAg = pensionCases.filter(c => c.status.includes('ರವಾನೆ')).length;
    const inProcess = total - sanctioned;
    const totalTerminalLumpSum = pensionCases.reduce((sum, c) => sum + (c.calculation?.totalTerminalLumpSum || 0), 0);
    const totalMonthlyPension = pensionCases.reduce((sum, c) => sum + (c.calculation?.basicServicePension || 0), 0);

    return { total, sanctioned, sentToAg, inProcess, totalTerminalLumpSum, totalMonthlyPension };
  }, [pensionCases]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 pb-12 font-sans">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-xl p-4 sm:p-5 border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-kannada text-amber-300">
                  ಪಿಂಚಣಿ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶ (Pension Management System)
                </h1>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded">
                  KCSR & 7TH PAY
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 font-kannada">
                ನಿವೃತ್ತಿ ವೇತನ ಲೆಕ್ಕಾಚಾರ (60/65 ವರ್ಷಗಳ ಪರಿಶೀಲನೆ), 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರಗಳು (ಪಿಂಚಣಿ, ಉಪದಾನ, ಪರಿವರ್ತನೆ, ಗಳಿಕೆ ರಜೆ), ನಮೂನೆಗಳು & ಕಡತ ನಿರ್ವಹಣೆ
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 block text-[10px]">ಒಟ್ಟು ಪ್ರಕರಣಗಳು</span>
              <span className="font-bold text-base text-amber-400 font-mono-code">{stats.total}</span>
            </div>
            <div className="bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 block text-[10px]">ಮಂಜೂರಾದವು</span>
              <span className="font-bold text-base text-emerald-400 font-mono-code">{stats.sanctioned}</span>
            </div>
            <div className="bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 block text-[10px]">ಒಟ್ಟು ಉಪದಾನ & ಗಂಟು ಮೊತ್ತ</span>
              <span className="font-bold text-base text-sky-400 font-mono-code">{formatINR(stats.totalTerminalLumpSum)}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('calculator')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer"
              title="ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಪರಿಕರ - ಸೇವಾ ವರ್ಷಗಳು & ಮೂಲವೇತನ ಆಧಾರಿತ ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ಅಂದಾಜು"
            >
              <Calculator className="w-4 h-4 text-stone-950" />
              <span>ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್</span>
              <span className="text-[10px] bg-stone-950 text-amber-300 px-1 py-0.5 rounded font-black font-mono">TOOL</span>
            </button>
            <button
              onClick={() => {
                setEditingCaseId(null);
                setActiveSubTab('input');
              }}
              className="bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 border border-stone-700 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>ಹೊಸ ಪಿಂಚಣಿ ಪ್ರಕರಣ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2 overflow-x-auto gap-2 scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'cases'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-amber-500" />
            <span>1. ಪ್ರಕರಣಗಳು & ಕಡತಗಳು ({pensionCases.length})</span>
          </button>

          {/* Dedicated Pension Calculator Tool Tab */}
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'calculator'
                ? 'bg-amber-400 text-stone-950 shadow-[3px_3px_0px_#000] ring-1 ring-amber-500'
                : 'bg-white text-stone-800 hover:bg-amber-50 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>2. ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ (Pension Calculator)</span>
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono font-bold">ಪರಿಕರ</span>
          </button>

          <button
            onClick={() => {
              if (!editingCaseId) {
                // reset form
                setFormData({
                  fileNumber: '56',
                  kgidNumber: '1042891',
                  employeeName: 'ಶ್ರೀ ಗಿರಿಯಪ್ಪ ಎಚ್. (GIRIYAPPA H)',
                  parentOrSpouseName: 'ಹನುಮಂತಪ್ಪ',
                  designation: 'ಸಹ ಶಿಕ್ಷಕರು (Assistant Teacher)',
                  cadreGroup: 'ಗ್ರೂಪ್-ಸಿ',
                  officeOrSchool: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹಳೇನಗರ, ಭದ್ರಾವತಿ (DISE: 29150109701)',
                  gender: 'Male',
                  dob: '1966-05-12',
                  doa: '1993-07-01',
                  dor: '2026-05-31',
                  retirementAgeYears: 60,
                  retirementType: 'ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)',
                  payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
                  lastBasicPay: 68550,
                  daPercentage: 42.5,
                  averageEmoluments: 68550,
                  earnedLeaveDays: 300,
                  halfPayLeaveDays: 38,
                  nonQualifyingDays: 0,
                  commutationOpted: true,
                  commutationPercentage: 40,
                  ageNextBirthday: 61,
                  nomineeName: 'ಶ್ರೀಮತಿ ಗಿರಿಜಮ್ಮ ಎಚ್. (ಪತ್ನಿ)',
                  nomineeRelation: 'ಪತ್ನಿ (Wife)',
                  nomineeDob: '1970-08-15',
                  bankName: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (SBI)',
                  bankBranch: 'ಭದ್ರಾವತಿ ಮುಖ್ಯ ಶಾಖೆ',
                  bankAccountNo: '30849201948',
                  ifscCode: 'SBIN0000812',
                  treasuryName: 'ಉಪ ಖಜಾನೆ, ಭದ್ರಾವತಿ',
                  workHistorySchools: INITIAL_PENSION_CASES[0].workHistorySchools ? [...INITIAL_PENSION_CASES[0].workHistorySchools] : [],
                  yearlyLeaveHistory: INITIAL_PENSION_CASES[0].yearlyLeaveHistory ? [...INITIAL_PENSION_CASES[0].yearlyLeaveHistory] : [],
                  attachedWorksheets: INITIAL_PENSION_CASES[0].attachedWorksheets ? [...INITIAL_PENSION_CASES[0].attachedWorksheets] : [],
                  remarks: 'ಶ್ರೀ ಗಿರಿಯಪ್ಪ ಪ್ರಕರಣ - 32 ವರ್ಷ 11 ತಿಂಗಳು ಅರ್ಹತಾ ಸೇವೆ.'
                });
              }
              setActiveSubTab('input');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'input'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>3. ದತ್ತಾಂಶ ನಮೂದು & ವಯೋನಿವೃತ್ತಿ ಪರಿಶೀಲನೆ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'calculations'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-500" />
            <span>4. 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರಗಳು (4 Calculations)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('letters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'letters'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>5. ಅಧಿಕೃತ ನಮೂನೆಗಳು & ಮಂಜೂರಾತಿ ಆದೇಶಗಳು</span>
          </button>

          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'checklist'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <span>6. ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('labels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-stone-800 ${
              activeSubTab === 'labels'
                ? 'bg-stone-900 text-amber-300 shadow-[3px_3px_0px_#f59e0b]'
                : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_#2b2b2b]'
            }`}
          >
            <Tag className="w-4 h-4 text-purple-600" />
            <span>7. ಕಡತ ಅಂಟಿಸುವ ಲೇಬಲ್‌ಗಳು (Docket Labels)</span>
          </button>
        </div>

        {/* Selected Case Indicator Chip */}
        {selectedCase && (
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg text-xs">
            <span className="text-stone-500 font-medium">ಪ್ರಸ್ತುತ ಪ್ರಕರಣ:</span>
            <span className="font-bold text-stone-900">{selectedCase.employeeName}</span>
            <span className="font-mono-code text-[11px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">
              KGID: {selectedCase.kgidNumber}
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PENSION CASES DIRECTORY & FILE DOCKET TRACKER                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'cases' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="ಹೆಸರು, KGID, ಕಡತ ಸಂಖ್ಯೆ ಅಥವಾ ಶಾಲೆಯಿಂದ ಹುಡುಕಿ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-600 font-medium whitespace-nowrap">ಸ್ಥಿತಿ:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-stone-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು ({pensionCases.length})</option>
                <option value="ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ (Drafting)">ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ</option>
                <option value="ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)">ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ</option>
                <option value="BEO ಅನುಮೋದಿತ (Sanctioned by BEO)">BEO ಅನುಮೋದಿತ</option>
                <option value="ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ರವಾನೆ (Sent to AG Karnataka)">ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ರವಾನೆ</option>
                <option value="PPO ಮಂಜೂರಾಗಿದೆ (PPO Issued)">PPO ಮಂಜೂರಾಗಿದೆ</option>
              </select>
            </div>
          </div>

          {/* UNIFIED 'PENSION SUMMARY' CARD FOR SELECTED CASE */}
          {selectedCase && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                    ಪ್ರಸ್ತುತ ಆಯ್ಕೆಯಾದ ಪ್ರಕರಣದ ಏಕೀಕೃತ ಪಿಂಚಣಿ ಸಾರಾಂಶ (Unified Pension Summary):
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  ಕೆಳಗಿನ ಪ್ರಕರಣಗಳ ಪಟ್ಟಿಯಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಬೇರೆ ಪ್ರಕರಣವನ್ನು ಲೋಡ್ ಮಾಡಬಹುದು
                </span>
              </div>

              <UnifiedPensionSummaryCard
                pensionCase={selectedCase}
                onViewLetters={() => {
                  setSelectedFormat('form7');
                  setActiveSubTab('letters');
                }}
                onViewCalcSheet={() => {
                  setSelectedFormat('pension_calc_sheet');
                  setActiveSubTab('letters');
                }}
                onEditCase={() => {
                  handleEditCase(selectedCase);
                  setActiveSubTab('input');
                }}
              />
            </div>
          )}

          {/* Cases Cards / Table */}
          <div className="grid grid-cols-1 gap-3">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] p-6">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-stone-800">ಯಾವುದೇ ಪಿಂಚಣಿ ಪ್ರಕರಣ ಕಂಡುಬಂದಿಲ್ಲ</h3>
                <p className="text-xs text-stone-500 mt-1">ಹೊಸ ಪ್ರಕರಣವನ್ನು ಸೇರಿಸಲು ಮೇಲಿನ ಬಟನ್ ಬಳಸಿ.</p>
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = selectedCase?.id === c.id;
                const calc = c.calculation;
                const verifiedDocsCount = Object.values(c.checklist).filter(Boolean).length;

                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-xl border-2 border-stone-800 p-4 transition-all shadow-[3px_3px_0px_#2b2b2b] ${
                      isSelected ? 'ring-2 ring-amber-500 bg-amber-50/20' : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Employee info & File identifiers */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code font-bold text-xs bg-stone-900 text-amber-400 px-2 py-0.5 rounded">
                            {c.caseNumber}
                          </span>
                          <span className="font-bold text-xs bg-amber-100 text-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                            📁 ಕಡತ ಸಂ: {c.fileNumber}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-stone-700 bg-stone-100 text-stone-800">
                            {c.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <h3 className="font-bold text-base text-stone-900 font-kannada">
                            {c.employeeName}
                          </h3>
                          <span className="font-mono-code text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                            KGID: {c.kgidNumber}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{c.designation} ({c.cadreGroup})</span>
                          <span>•</span>
                          <span className="text-stone-800 font-medium">{c.officeOrSchool}</span>
                          <span>•</span>
                          <span className="text-rose-800 font-bold">ನಿವೃತ್ತಿ: {c.dor} ({c.retirementType.split(' ')[0]})</span>
                        </div>
                      </div>

                      {/* Middle: Calculated Benefit Highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-300 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block">ಅರ್ಹತಾ ಸೇವೆ</span>
                          <span className="font-bold text-stone-900">
                            {calc.netQualifyingYears}ವ {calc.netQualifyingMonths}ತಿ ({calc.qualifyingHalfYears} ಅರ್ಧವಾರ್ಷಿಕ)
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">ಮೂಲ ಮಾಸಿಕ ಪಿಂಚಣಿ</span>
                          <span className="font-bold text-emerald-800 font-mono-code text-sm">
                            {formatINR(calc.basicServicePension)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG)</span>
                          <span className="font-bold text-blue-900 font-mono-code text-sm">
                            {formatINR(calc.dcrgSanctioned)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">ಪರಿವರ್ತನೆ ಗಂಟು ಮೊತ್ತ</span>
                          <span className="font-bold text-purple-900 font-mono-code text-sm">
                            {formatINR(calc.commutationLumpSum)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-1.5 lg:justify-end shrink-0">
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setCalcEmployeeName(c.employeeName);
                            setCalcDesignation(c.designation);
                            setCalcKgid(c.kgidNumber);
                            setCalcLastBasicPay(c.lastBasicPay);
                            setCalcYearsOfService(c.calculation.completedSixMonthlyPeriods / 2);
                            setCalcDaPercentage(c.daPercentage);
                            setCalcEarnedLeaveDays(c.earnedLeaveDays);
                            setCalcHalfPayLeaveDays(c.halfPayLeaveDays);
                            setActiveSubTab('calculator');
                            showToast(`ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗೆ ಲೋಡ್ ಮಾಡಲಾಗಿದೆ: ${c.employeeName}`);
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                          title="ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಪರಿಕರದಲ್ಲಿ ಲೆಕ್ಕ ಹಾಕಿ"
                        >
                          <Calculator className="w-3.5 h-3.5 text-amber-800" />
                          <span>ಕ್ಯಾಲ್ಕುಲೇಟರ್</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setSelectedFormat('form7');
                            setActiveSubTab('letters');
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                          title="ಎಲ್ಲಾ ನಮೂನೆ ಪತ್ರಗಳು & ಆದೇಶಗಳು"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ಪತ್ರಗಳು & ಆದೇಶಗಳು</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveSubTab('checklist');
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                          title="ದಾಖಲಾತಿಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-700" />
                          <span>ದಾಖಲೆಗಳು ({verifiedDocsCount}/8)</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveSubTab('labels');
                          }}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-950 p-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                          title="ಭೌತಿಕ ಕಡತ ಲೇಬಲ್ & QR ಕೋಡ್"
                        >
                          <Tag className="w-4 h-4 text-purple-700" />
                        </button>

                        <button
                          onClick={() => handleEditCase(c)}
                          className="bg-white hover:bg-stone-100 text-stone-800 p-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                          title="ಸಂಪಾದಿಸಿ"
                        >
                          <Edit className="w-4 h-4 text-stone-600" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`ಶ್ರೀ/ಶ್ರೀಮತಿ ${c.employeeName} ರವರ ಪಿಂಚಣಿ ಪ್ರಕರಣವನ್ನು ಅಳಿಸಲು ಖಚಿತಪಡಿಸಿ?`)) {
                              setPensionCases(prev => prev.filter(item => item.id !== c.id));
                              showToast('ಪಿಂಚಣಿ ಪ್ರಕರಣವನ್ನು ಅಳಿಸಲಾಗಿದೆ.');
                            }
                          }}
                          className="bg-white hover:bg-rose-50 text-rose-700 p-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                          title="ಅಳಿಸಿ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress / Status Update row */}
                    <div className="mt-3 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-500">ಸ್ಥಿತಿ ಬದಲಿಸಿ:</span>
                        <select
                          value={c.status}
                          onChange={e => handleUpdateStatus(c.id, e.target.value as PensionCaseStatus)}
                          className="text-[11px] font-bold border border-stone-400 rounded px-2 py-0.5 bg-white cursor-pointer"
                        >
                          <option value="ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ (Drafting)">ದಾಖಲಾತಿ ಹಂತದಲ್ಲಿದೆ</option>
                          <option value="ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ (Service Verified)">ಸೇವಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣ</option>
                          <option value="BEO ಅನುಮೋದಿತ (Sanctioned by BEO)">BEO ಅನುಮೋದಿತ</option>
                          <option value="ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ರವಾನೆ (Sent to AG Karnataka)">ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ರವಾನೆ</option>
                          <option value="PPO ಮಂಜೂರಾಗಿದೆ (PPO Issued)">PPO ಮಂಜೂರಾಗಿದೆ</option>
                          <option value="ವಿಲೇವಾರಿ ಮುಕ್ತಾಯ (Completed & Disposed)">ವಿಲೇವಾರಿ ಮುಕ್ತಾಯ</option>
                        </select>
                      </div>

                      <div className="text-[11px] text-stone-500 font-mono-code">
                        ಬ್ಯಾಂಕ್: {c.bankName} (ಖಾತೆ: {c.bankAccountNo || 'ನಮೂದಿಸಿಲ್ಲ'}) | ಖಜಾನೆ: {c.treasuryName}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED PENSION CALCULATOR TOOL (Years of Service & Last Basic Pay)    */}
      {/* ========================================================================= */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-5">
          {/* Top Banner & Quick Controls */}
          <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded text-[11px] font-black tracking-wide font-mono">
                  7TH PAY COMMISSION • KCSR RULES
                </span>
                <span className="bg-stone-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold border border-stone-700">
                  ಅಧಿಕೃತ ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300 font-kannada flex items-center gap-2">
                <Calculator className="w-6 h-6 text-amber-400" />
                <span>ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ತ್ವರಿತ ಪಿಂಚಣಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ (Pension Calculator Tool)</span>
              </h2>
              <p className="text-xs text-stone-400 font-kannada max-w-3xl">
                ಸೇವಾ ವರ್ಷಗಳು (Years of Service) ಮತ್ತು ಕೊನೆಯ ಮೂಲ ವೇತನ (Last Basic Pay) ಆಧಾರದ ಮೇಲೆ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳಂತೆ ನಿವೃತ್ತಿ ಉಪದಾನ, ಪರಿವರ್ತನೆ ಇಡುಗಂಟು, ರಜೆ ನಗದೀಕರಣ ಮತ್ತು ಮಾಸಿಕ ಪಿಂಚಣಿಯ ನಿಖರ ಅಂದಾಜು.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadServiceRecordPdf}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
                title="ಸೇವಾ ವಹಿ & ಪಿಂಚಣಿ ಸಾರಾಂಶ ದಾಖಲೆ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download Service Record PDF)"
              >
                <FileDown className="w-4 h-4 text-white" />
                <span>Download Service Record PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all border-2 border-stone-900 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
                title="ಅಂದಾಜು ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ ಮುದ್ರಿಸಿ"
              >
                <Printer className="w-4 h-4" />
                <span>ಅಂದಾಜು ಪಟ್ಟಿ ಮುದ್ರಿಸಿ</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCalcSummary}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-all border border-stone-700 shadow-sm cursor-pointer flex items-center gap-1.5"
                title="ಸಾರಾಂಶ ನಕಲಿಸಿ"
              >
                <Copy className="w-4 h-4" />
                <span>ಸಾರಾಂಶ ನಕಲಿಸಿ</span>
              </button>

              <button
                type="button"
                onClick={handleTransferToPensionCase}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all border border-emerald-700 shadow-sm cursor-pointer flex items-center gap-1.5"
                title="ಈ ಅಂದಾಜನ್ನು ಅಧಿಕೃತ ಪಿಂಚಣಿ ಕಡತಕ್ಕೆ ಪರಿವರ್ತಿಸಿ"
              >
                <ArrowRight className="w-4 h-4" />
                <span>ಪ್ರಕರಣಕ್ಕೆ ವರ್ಗಾಯಿಸಿ</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Input Fields (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] space-y-5">
                <div className="pb-3 border-b-2 border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-stone-900 text-sm font-kannada">
                      ಮೂಲ ದತ್ತಾಂಶ ನಮೂದು (Calculator Inputs)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcYearsOfService(30);
                      setCalcLastBasicPay(68550);
                      setCalcDaPercentage(42.5);
                      setCalcCommutationOpted(true);
                      setCalcCommutationPercentage(40);
                      setCalcEarnedLeaveDays(300);
                      setCalcHalfPayLeaveDays(38);
                      setCalcSelectedEmpId('');
                      showToast('ಮೂಲ ಮೌಲ್ಯಗಳಿಗೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
                    }}
                    className="text-stone-500 hover:text-stone-900 text-xs flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ರೀಸೆಟ್</span>
                  </button>
                </div>

                {/* Optional Employee Quick Loader from Roster */}
                <div className="space-y-1.5 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      <span>ನೌಕರರ ರೋಸ್ಟರ್‌ನಿಂದ ಸ್ವಯಂ-ಭರ್ತಿ (ಐಚ್ಛಿಕ)</span>
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded font-bold font-mono">
                      Auto-Fill Roster
                    </span>
                  </label>
                  <select
                    value={calcSelectedEmpId}
                    onChange={e => handleSelectEmployeeForCalc(e.target.value)}
                    className="w-full text-xs border border-stone-400 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500 font-bold text-stone-800"
                  >
                    <option value="">-- ಸಿಬ್ಬಂದಿ ಪಟ್ಟಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ (Select Employee) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName || emp.name} - {emp.designation} (ಮೂಲವೇತನ: ₹{emp.basicPay || 'N/A'})
                      </option>
                    ))}
                  </select>
                  {calcEmployeeName && (
                    <div className="text-[11px] text-stone-600 pt-1 flex items-center justify-between">
                      <span>ಆಯ್ಕೆ: <strong>{calcEmployeeName}</strong> ({calcDesignation})</span>
                      {calcKgid && <span className="font-mono-code font-bold text-amber-900">KGID: {calcKgid}</span>}
                    </div>
                  )}
                </div>

                {/* PRIMARY FIELD 1: Years of Service */}
                <div className="space-y-2 p-3.5 bg-stone-50 rounded-xl border-2 border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 font-kannada flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>1. ಸೇವಾ ವರ್ಷಗಳು (Years of Service) *</span>
                    </label>
                    <span className="text-[11px] font-mono-code font-bold bg-stone-900 text-amber-400 px-2 py-0.5 rounded">
                      {quickEstimateResult.completedHalfYears} ಅರ್ಧವರ್ಷಗಳು
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="45"
                      value={calcYearsOfService}
                      onChange={e => setCalcYearsOfService(e.target.value)}
                      className="w-full text-lg font-bold font-mono-code border-2 border-stone-800 rounded-xl py-2.5 px-3 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="ಉದಾ: 30"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-stone-500 font-mono-code">
                      ವರ್ಷಗಳು (Years)
                    </span>
                  </div>

                  {/* Quick Stepper Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCalcYearsOfService(prev => Math.max(0, +(+prev - 1).toFixed(1)))}
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-400 rounded text-xs font-bold font-mono cursor-pointer"
                    >
                      -1 yr
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcYearsOfService(prev => Math.max(0, +(+prev - 0.5).toFixed(1)))}
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-400 rounded text-xs font-bold font-mono cursor-pointer"
                    >
                      -0.5 yr
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcYearsOfService(prev => +(+prev + 0.5).toFixed(1))}
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-400 rounded text-xs font-bold font-mono cursor-pointer"
                    >
                      +0.5 yr
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcYearsOfService(prev => +(+prev + 1).toFixed(1))}
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-400 rounded text-xs font-bold font-mono cursor-pointer"
                    >
                      +1 yr
                    </button>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-stone-500 text-[10px]">ತ್ವರಿತ ಆಯ್ಕೆ:</span>
                    {[
                      { label: '10 ವ (Min)', val: 10 },
                      { label: '20 ವ', val: 20 },
                      { label: '25 ವ', val: 25 },
                      { label: '30 ವ (Full 50%)', val: 30 },
                      { label: '33 ವ (Max DCRG)', val: 33 }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setCalcYearsOfService(p.val)}
                        className={`px-2 py-0.5 rounded border text-xs font-bold transition-all cursor-pointer ${
                          Number(calcYearsOfService) === p.val
                            ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-stone-500 font-kannada">
                    {Number(calcYearsOfService) >= 30 ? (
                      <span className="text-emerald-700 font-bold">✓ 30 ವರ್ಷ ಪೂರ್ಣ - 50% ಗರಿಷ್ಠ ಪೂರ್ಣ ಪಿಂಚಣಿಗೆ ಅರ್ಹರು (60 ಅರ್ಧವರ್ಷಗಳು)</span>
                    ) : Number(calcYearsOfService) >= 10 ? (
                      <span className="text-amber-800 font-bold">ಅನುಪಾತಿಕ ಪಿಂಚಣಿ: {quickEstimateResult.completedHalfYears}/60 ಭಾಗ</span>
                    ) : (
                      <span className="text-rose-700 font-bold">⚠️ 10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ - ಸೇವಾ ಉಪದಾನ (Service Gratuity) ಮಾತ್ರ</span>
                    )}
                  </p>
                </div>

                {/* PRIMARY FIELD 2: Last Basic Pay */}
                <div className="space-y-2 p-3.5 bg-stone-50 rounded-xl border-2 border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-stone-900 font-kannada flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>2. ಕೊನೆಯ ಮೂಲ ವೇತನ (Last Basic Pay) *</span>
                    </label>
                    <span className="text-[11px] font-mono-code font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      ₹{formatINR(Number(calcLastBasicPay) || 0)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base font-bold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="10000"
                      max="250000"
                      value={calcLastBasicPay}
                      onChange={e => setCalcLastBasicPay(e.target.value)}
                      className="w-full text-lg font-bold font-mono-code border-2 border-stone-800 rounded-xl py-2.5 pl-8 pr-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="ಉದಾ: 68550"
                    />
                  </div>

                  {/* 7th Pay Commission Quick Pay Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-stone-500 text-[10px]">7ನೇ ವೇತನ ಶ್ರೇಣಿ:</span>
                    {[37900, 43100, 53900, 68550, 76550, 98200].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCalcLastBasicPay(amt)}
                        className={`px-2 py-0.5 rounded border text-xs font-mono font-bold transition-all cursor-pointer ${
                          Number(calcLastBasicPay) === amt
                            ? 'bg-emerald-600 text-white border-stone-900 shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        ₹{formatINR(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-600">
                    ವೇತನ ಅಕ್ಷರಗಳಲ್ಲಿ: <strong className="text-stone-900 font-kannada">{numberToKannadaWords(Number(calcLastBasicPay) || 0)}</strong>
                  </div>
                </div>

                {/* Collapsible Fine Tuning Parameters */}
                <div className="border border-stone-300 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCalcShowAdvanced(!calcShowAdvanced)}
                    className="w-full p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-stone-600" />
                      <span>ಹೆಚ್ಚುವರಿ ನಿಯತಾಂಕಗಳು (DA %, ಪರಿವರ್ತನೆ, ರಜೆ ದಿನಗಳು)</span>
                    </span>
                    <span className="text-stone-500">{calcShowAdvanced ? '▲ ಮರೆಮಾಡಿ' : '▼ ವಿಸ್ತರಿಸಿ'}</span>
                  </button>

                  {calcShowAdvanced && (
                    <div className="p-3 bg-white space-y-3 text-xs border-t border-stone-200">
                      {/* DA Rate */}
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-bold text-stone-700">ತುಟ್ಟಿಭತ್ಯೆ ದರ (DA %):</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            value={calcDaPercentage}
                            onChange={e => setCalcDaPercentage(Number(e.target.value))}
                            className="w-20 p-1 border border-stone-400 rounded text-right font-mono font-bold"
                          />
                          <span className="font-mono">%</span>
                        </div>
                      </div>

                      {/* Commutation Opted & Percentage */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-stone-700">ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (CVP):</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={calcCommutationOpted}
                              onChange={e => setCalcCommutationOpted(e.target.checked)}
                              className="rounded text-amber-600 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-stone-800">ಪರಿವರ್ತನೆ ಬಯಸಲಾಗಿದೆ (Opted)</span>
                          </label>
                        </div>
                        {calcCommutationOpted && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] text-stone-500 block">ಪರಿವರ್ತನೆ ಶೇಕಡಾವಾರು (ಗರಿಷ್ಠ 40%):</span>
                              <input
                                type="number"
                                min="0"
                                max="40"
                                value={calcCommutationPercentage}
                                onChange={e => setCalcCommutationPercentage(Number(e.target.value))}
                                className="w-full p-1 border border-stone-400 rounded font-mono font-bold text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-500 block">ವಯಸ್ಸು (ಮುಂದಿನ ಜನ್ಮದಿನ):</span>
                              <input
                                type="number"
                                min="50"
                                max="70"
                                value={calcAgeNextBirthday}
                                onChange={e => setCalcAgeNextBirthday(Number(e.target.value))}
                                className="w-full p-1 border border-stone-400 rounded font-mono font-bold text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Leave Balances */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                        <div>
                          <label className="font-bold text-stone-700 block text-[11px]">ಗಳಿಕೆ ರಜೆ (EL - ಗರಿಷ್ಠ 300):</label>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={calcEarnedLeaveDays}
                            onChange={e => setCalcEarnedLeaveDays(Number(e.target.value))}
                            className="w-full p-1 border border-stone-400 rounded font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block text-[11px]">ಅರ್ಧವೇತನ ರಜೆ (HPL ದಿನಗಳು):</label>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={calcHalfPayLeaveDays}
                            onChange={e => setCalcHalfPayLeaveDays(Number(e.target.value))}
                            className="w-full p-1 border border-stone-400 rounded font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* Custom Employee Labels */}
                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        <span className="text-[10px] text-stone-500 block font-bold">ಮುದ್ರಣಕ್ಕೆ ನೌಕರರ ಹೆಸರು & ವಿವರಗಳು:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="ನೌಕರರ ಹೆಸರು"
                            value={calcEmployeeName}
                            onChange={e => setCalcEmployeeName(e.target.value)}
                            className="p-1 border border-stone-400 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="ಪದನಾಮ"
                            value={calcDesignation}
                            onChange={e => setCalcDesignation(e.target.value)}
                            className="p-1 border border-stone-400 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Results Dashboard (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              {/* GRAND HERO CARD: Total Terminal Benefits */}
              <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-6 rounded-2xl border-2 border-stone-800 shadow-[5px_5px_0px_#2b2b2b] relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-kannada font-bold text-xs tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>ಒಟ್ಟು ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳು (TOTAL TERMINAL BENEFITS - LUMP SUM)</span>
                    </span>
                    <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded font-mono">
                      ಇಡುಗಂಟು ಮೊತ್ತ
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono-code text-amber-300 tracking-tight">
                    ₹{formatINR(quickEstimateResult.totalTerminalBenefits)}
                  </div>

                  <div className="text-xs text-amber-100/90 font-kannada pt-1">
                    ಅಕ್ಷರಗಳಲ್ಲಿ: <strong>{numberToKannadaWords(quickEstimateResult.totalTerminalBenefits)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ</strong>
                  </div>

                  {/* Summary Breakdown Tags */}
                  <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-stone-800/90 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-700">
                      ಉಪದಾನ (DCRG): <strong className="text-sky-300 font-mono">₹{formatINR(quickEstimateResult.dcrgSanctioned)}</strong>
                    </span>
                    <span className="bg-stone-800/90 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-700">
                      ಪರಿವರ್ತನೆ (CVP): <strong className="text-purple-300 font-mono">₹{formatINR(quickEstimateResult.commutationLumpSum)}</strong>
                    </span>
                    <span className="bg-stone-800/90 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-700">
                      ರಜೆ ನಗದೀಕರಣ: <strong className="text-amber-300 font-mono">₹{formatINR(quickEstimateResult.totalLeaveEncashment)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECONDARY HERO CARD: Monthly Net Pension */}
              <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border-2 border-emerald-900 shadow-[4px_4px_0px_#064e3b]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-400 text-stone-950 font-black px-2 py-0.5 rounded font-mono">
                        MONTHLY PENSION
                      </span>
                      <span className="text-xs font-bold text-emerald-300 font-kannada">
                        ಮಾಸಿಕ ನಿವ್ವಳ ಪಿಂಚಣಿ ಜಮೆ (Net Monthly Pension)
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono-code text-white">
                      ₹{formatINR(quickEstimateResult.totalMonthlyReceivable)}
                      <span className="text-xs font-normal text-emerald-300 font-sans ml-2">/ ಪ್ರತಿ ತಿಂಗಳು</span>
                    </div>
                  </div>

                  <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800 text-xs space-y-1 sm:text-right">
                    <div className="text-emerald-300">
                      ಮೂಲ ಪಿಂಚಣಿ: <strong className="font-mono text-white">₹{formatINR(quickEstimateResult.reducedMonthlyPension)}</strong>
                    </div>
                    <div className="text-emerald-300">
                      ತುಟ್ಟಿ ಪರಿಹಾರ ({quickEstimateResult.daPercentage}%): <strong className="font-mono text-white">₹{formatINR(quickEstimateResult.dearnessRelief)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-COMPONENT BENEFIT BREAKDOWN MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Retirement Gratuity */}
                <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                    <span className="font-bold text-xs text-stone-900 font-kannada">1. ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG)</span>
                    <span className="text-[10px] bg-sky-100 text-sky-950 font-mono font-bold px-1.5 py-0.5 rounded">
                      KCSR 292B
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono-code text-sky-800">
                    ₹{formatINR(quickEstimateResult.dcrgSanctioned)}
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <div>ಅರ್ಧವರ್ಷಗಳು: <strong className="font-mono">{quickEstimateResult.gratuityHalfYears}</strong> (ಗರಿಷ್ಠ 66)</div>
                    <div>ಸೂತ್ರ: (ಮೂಲವೇತನ + DA) ÷ 4 × {quickEstimateResult.gratuityHalfYears}</div>
                    {quickEstimateResult.isDcrgCapped ? (
                      <div className="text-amber-800 font-bold">⚠️ ₹20,00,000 ಗರಿಷ್ಠ ಮಿತಿಗೆ ಮಿತಿಗೊಳಿಸಲಾಗಿದೆ</div>
                    ) : (
                      <div className="text-emerald-700 font-bold">✓ ₹20 ಲಕ್ಷ ಮಿತಿಯೊಳಗಿದೆ</div>
                    )}
                  </div>
                </div>

                {/* 2. Commutation of Pension */}
                <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                    <span className="font-bold text-xs text-stone-900 font-kannada">2. ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (CVP)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-950 font-mono font-bold px-1.5 py-0.5 rounded">
                      KCSR 376
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono-code text-purple-800">
                    ₹{formatINR(quickEstimateResult.commutationLumpSum)}
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <div>ಪರಿವರ್ತಿತ ಭಾಗ: <strong className="font-mono">₹{formatINR(quickEstimateResult.commutedPortion)}</strong> ({quickEstimateResult.commutationPercentage}%)</div>
                    <div>ಗುಣಕ (Factor): <strong className="font-mono">{quickEstimateResult.commutationFactor}</strong> (ವಯಸ್ಸು 61)</div>
                    <div>ಸೂತ್ರ: ಪರಿವರ್ತಿತ ಭಾಗ × 12 × {quickEstimateResult.commutationFactor}</div>
                  </div>
                </div>

                {/* 3. Leave Encashment */}
                <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                    <span className="font-bold text-xs text-stone-900 font-kannada">3. ರಜೆ ನಗದೀಕರಣ (Encashment)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-950 font-mono font-bold px-1.5 py-0.5 rounded">
                      KCSR 118A
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono-code text-amber-800">
                    ₹{formatINR(quickEstimateResult.totalLeaveEncashment)}
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <div>ಗಳಿಕೆ ರಜೆ ({quickEstimateResult.earnedLeaveDays} ದಿನ): <strong className="font-mono">₹{formatINR(quickEstimateResult.leaveEncashmentAmount)}</strong></div>
                    <div>ಅರೆವೇತನ ರಜೆ ({quickEstimateResult.halfPayLeaveDays} ದಿನ): <strong className="font-mono">₹{formatINR(quickEstimateResult.halfPayEncashmentAmount)}</strong></div>
                    <div>ದೈನಿಕ ದರ: (ವೇತನ + DA) ÷ 30 = <strong className="font-mono">₹{formatINR(Math.round(quickEstimateResult.monthlyEmoluments / 30))}</strong></div>
                  </div>
                </div>

                {/* 4. Family Pension */}
                <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                    <span className="font-bold text-xs text-stone-900 font-kannada">4. ಕುಟುಂಬ ಪಿಂಚಣಿ (Family Pension)</span>
                    <span className="text-[10px] bg-rose-100 text-rose-950 font-mono font-bold px-1.5 py-0.5 rounded">
                      KCSR 294
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-stone-900 flex justify-between">
                      <span>ಸಾಮಾನ್ಯ ದರ (30%):</span>
                      <strong className="font-mono text-emerald-800 font-bold">₹{formatINR(quickEstimateResult.familyPensionNormal)}/ತಿಂಗಳು</strong>
                    </div>
                    <div className="text-sm font-bold text-stone-900 flex justify-between">
                      <span>ಹೆಚ್ಚುವರಿ ದರ (50%):</span>
                      <strong className="font-mono text-rose-800 font-bold">₹{formatINR(quickEstimateResult.familyPensionEnhanced)}/ತಿಂಗಳು</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                    ಕನಿಷ್ಠ ಕುಟುಂಬ ಪಿಂಚಣಿ ₹13,500 ಖಾತರಿಯೊಂದಿಗೆ ಅನ್ವಯ.
                  </div>
                </div>
              </div>

              {/* STATUTORY RULES REFERENCE BANNER */}
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-300 text-xs text-stone-700 space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>ಶಾಸನಬದ್ಧ ನಿಯಮಾವಳಿಗಳು & ಮಾರ್ಗಸೂಚಿಗಳು (Statutory Guidelines)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded border border-stone-200">
                    <span className="text-stone-500 block">ಅರ್ಹತಾ ಸೇವೆ:</span>
                    <strong>{quickEstimateResult.completedHalfYears} ಅರ್ಧವರ್ಷಗಳು ({calcYearsOfService} ವರ್ಷ)</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-stone-200">
                    <span className="text-stone-500 block">ಪೂರ್ಣ ಪಿಂಚಣಿ ಅರ್ಹತೆ:</span>
                    <strong className={quickEstimateResult.isEligibleForFullPension ? 'text-emerald-700' : 'text-amber-800'}>
                      {quickEstimateResult.isEligibleForFullPension ? '✓ ಪೂರ್ಣ 50% ಅರ್ಹರು' : 'ಅನುಪಾತಿಕ ಪಿಂಚಣಿ'}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-stone-200">
                    <span className="text-stone-500 block">ವೇತನ ಆಯೋಗ:</span>
                    <strong>7ನೇ ರಾಜ್ಯ ವೇತನ ಆಯೋಗ (42.5% DA)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 10-YEAR RETIREMENT BENEFITS GROWTH TRENDLINE CHART (RECHARTS)            */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 rounded-2xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded text-[11px] font-black uppercase font-mono">
                    RECHARTS TREND-LINE VISUALIZATION
                  </span>
                  <span className="text-stone-500 text-xs font-bold">
                    ಮುಂದಿನ 10 ವರ್ಷಗಳ ಪ್ರಕ್ಷೇಪಣ (10-Year Forecast)
                  </span>
                </div>
                <h3 className="text-base font-black text-stone-900 font-kannada flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span>ಮುಂದಿನ 10 ವರ್ಷಗಳ ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ಬೆಳವಣಿಗೆಯ ಪ್ರಕ್ಷೇಪಣ (10-Year Benefits Growth Trend)</span>
                </h3>
                <p className="text-xs text-stone-600 font-kannada">
                  ಸ್ಥಿರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮತ್ತು ಹೆಚ್ಚುವರಿ ಅರ್ಹತಾ ಸೇವಾ ವರ್ಷಗಳ ಆಧಾರದ ಮೇಲೆ ಒಟ್ಟು ಇಡುಗಂಟು ಮತ್ತು ಮಾಸಿಕ ಪಿಂಚಣಿಯ ಏರಿಕೆಯ ಗ್ರಾಫ್.
                </p>
              </div>

              {/* Annual Increment Rate Selector */}
              <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Percent className="w-4 h-4 text-amber-700" />
                  <span>ವಾರ್ಷಿಕ ಬಡ್ತಿ ದರ:</span>
                </div>
                <div className="flex items-center gap-1">
                  {[2, 2.5, 3, 3.5, 4, 5].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAnnualIncrementPercent(pct)}
                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                        annualIncrementPercent === pct
                          ? 'bg-amber-500 text-stone-950 border-stone-900 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recharts LineChart */}
            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tenYearTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="yearLabel" 
                    tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(val: number) => `₹${(val / 100000).toFixed(1)}L`}
                    tick={{ fontSize: 11, fill: '#b45309', fontWeight: 600 }}
                    label={{ value: 'ಒಟ್ಟು ಇಡುಗಂಟು (₹ ಲಕ್ಷಗಳಲ್ಲಿ)', angle: -90, position: 'insideLeft', fill: '#b45309', fontSize: 11, offset: 0 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val: number) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#047857', fontWeight: 600 }}
                    label={{ value: 'ಮಾಸಿಕ ಪಿಂಚಣಿ (₹ ಸಾವಿರಗಳಲ್ಲಿ)', angle: 90, position: 'insideRight', fill: '#047857', fontSize: 11, offset: 0 }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `₹${formatINR(Number(value))}`, 
                      name === 'terminalBenefits' ? 'ಒಟ್ಟು ನಿವೃತ್ತಿ ಇಡುಗಂಟು (Lump Sum)' : 'ಮಾಸಿಕ ನಿವ್ವಳ ಪಿಂಚಣಿ (Monthly Pension)'
                    ]}
                    labelFormatter={(label) => `ಅವಧಿ: ${label}`}
                    contentStyle={{ backgroundColor: '#1c1917', color: '#ffffff', borderRadius: '12px', border: '1px solid #444', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-stone-800">
                        {value === 'terminalBenefits' ? 'ಒಟ್ಟು ನಿವೃತ್ತಿ ಇಡುಗಂಟು (DCRG + Commutation + Leave)' : 'ಮಾಸಿಕ ನಿವ್ವಳ ಪಿಂಚಣಿ (Monthly Net Pension)'}
                      </span>
                    )}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="terminalBenefits" 
                    stroke="#d97706" 
                    strokeWidth={3.5}
                    dot={{ r: 4, fill: '#d97706', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 7, stroke: '#b45309', strokeWidth: 2 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="monthlyPension" 
                    stroke="#059669" 
                    strokeWidth={3.5}
                    dot={{ r: 4, fill: '#059669', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 7, stroke: '#047857', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Milestones Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  ಪ್ರಸ್ತುತ ಮೌಲ್ಯ (Today):
                </span>
                <div className="text-base font-black text-stone-900 font-mono">
                  ₹{formatINR(tenYearTrendData[0]?.terminalBenefits || 0)}
                </div>
                <div className="text-[11px] text-stone-600">
                  ಮಾಸಿಕ ಪಿಂಚಣಿ: <strong className="font-mono text-emerald-800">₹{formatINR(tenYearTrendData[0]?.monthlyPension || 0)}</strong>
                </div>
              </div>

              <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  5 ವರ್ಷಗಳ ನಂತರ (+5 Years):
                </span>
                <div className="text-base font-black text-amber-950 font-mono">
                  ₹{formatINR(tenYearTrendData[5]?.terminalBenefits || 0)}
                </div>
                <div className="text-[11px] text-stone-700">
                  ಮಾಸಿಕ ಪಿಂಚಣಿ: <strong className="font-mono text-emerald-800">₹{formatINR(tenYearTrendData[5]?.monthlyPension || 0)}</strong>
                  <span className="ml-1 text-[10px] text-emerald-700 font-bold">
                    (+{tenYearTrendData[0]?.terminalBenefits ? Math.round(((tenYearTrendData[5]?.terminalBenefits - tenYearTrendData[0]?.terminalBenefits) / tenYearTrendData[0]?.terminalBenefits) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-100 p-3 rounded-xl border border-stone-800 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  10 ವರ್ಷಗಳ ನಂತರ (+10 Years):
                </span>
                <div className="text-base font-black text-amber-300 font-mono">
                  ₹{formatINR(tenYearTrendData[10]?.terminalBenefits || 0)}
                </div>
                <div className="text-[11px] text-stone-300">
                  ಮಾಸಿಕ ಪಿಂಚಣಿ: <strong className="font-mono text-emerald-400">₹{formatINR(tenYearTrendData[10]?.monthlyPension || 0)}</strong>
                  <span className="ml-1 text-[10px] text-amber-400 font-bold">
                    (+{tenYearTrendData[0]?.terminalBenefits ? Math.round(((tenYearTrendData[10]?.terminalBenefits - tenYearTrendData[0]?.terminalBenefits) / tenYearTrendData[0]?.terminalBenefits) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PENSION DATA INPUT & LIVE CALCULATION ENGINE                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Data Entry (8 Columns) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-stone-900 font-kannada">
                  {editingCaseId ? 'ಪಿಂಚಣಿ ಪ್ರಕರಣದ ವಿವರಗಳ ತಿದ್ದುಪಡಿ' : 'ಹೊಸ ಪಿಂಚಣಿ ಪ್ರಕರಣ - ದತ್ತಾಂಶ ನಮೂದು'}
                </h2>
              </div>
              <span className="text-[11px] text-stone-500 font-mono-code">
                ಆ2 (ಸ.ಪ್ರಾ.ಶಿ) ಶಾಖೆ
              </span>
            </div>

            {/* Quick Employee Selector dropdown & 1-Click Giriyappa Case Preset */}
            <div className="mb-5 p-3 bg-amber-50 rounded-lg border border-amber-300 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold text-stone-800">
                  ⚡ ನೌಕರರ ಡೇಟಾಬೇಸ್‌ನಿಂದ ತ್ವರಿತವಾಗಿ ಆಯ್ಕೆಮಾಡಿ (Quick Auto-Fill from Staff Directory):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSulochanaCase}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>👩‍🏫 ಸಿ. ಎಂ. ಸುಲೋಚನಾ ಪ್ರಕರಣ ಲೋಡ್ ಮಾಡಿ (C M Sulochana Case)</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="ನೌಕರರ ಹೆಸರು ಅಥವಾ KGID ನಮೂದಿಸಿ..."
                  value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {empSearch && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border-2 border-stone-800 rounded-lg shadow-lg">
                    {employees
                      .filter(e => 
                        e.fullName.toLowerCase().includes(empSearch.toLowerCase()) || 
                        (e.kgidNumber && e.kgidNumber.includes(empSearch))
                      )
                      .slice(0, 8)
                      .map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp)}
                          className="p-2 text-xs hover:bg-amber-100 cursor-pointer border-b border-stone-100 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-stone-900 block">{emp.fullName}</span>
                            <span className="text-[11px] text-stone-500">{emp.designation} • {emp.officeLocation}</span>
                          </div>
                          <span className="font-mono-code font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                            KGID: {emp.kgidNumber || 'N/A'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSavePensionCase} className="space-y-4">
              {/* SECTION 1: Personal & Service Identifiers */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border-l-4 border-amber-500 mb-3">
                  1. ನೌಕರರ ಸೇವಾ ವಿವರಗಳು & ವಯೋನಿವೃತ್ತಿ ಪರಿಶೀಲನೆ (Employee & Service Details)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಕಡತ ಸಂಖ್ಯೆ (File No)*</label>
                    <input
                      type="text"
                      required
                      value={formData.fileNumber}
                      onChange={e => setFormData({ ...formData, fileNumber: e.target.value })}
                      placeholder="ಉದಾ: ಎ10(8)/ಶಾ.ಶಿ.ಇ/ನಿ.ವೇ.ಮಂ/49/2026-27"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-700 font-bold">ಕಡತ ಐಡಿ (Unique File ID)*</label>
                      <button
                        type="button"
                        onClick={() => {
                          const num = formData.fileNumber ? formData.fileNumber.trim() : '56';
                          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                          const generatedId = `PEN-FILE-2026-${num}-${randomSuffix}`;
                          setFormData(prev => ({ ...prev, fileId: generatedId }));
                          showToast(`ಹೊಸ ಅನನ್ಯ ಕಡತ ಐಡಿ ಸೃಜಿಸಲಾಗಿದೆ: ${generatedId}`);
                        }}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 underline cursor-pointer"
                        title="ಹೊಸ ಅನನ್ಯ ಕಡತ ಐಡಿ ಸೃಜಿಸಿ"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>ಹೊಸ ಐಡಿ ಸೃಜಿಸಿ</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.fileId}
                      onChange={e => setFormData({ ...formData, fileId: e.target.value })}
                      placeholder="ಉದಾ: PEN-FILE-2026-56"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-amber-950 bg-amber-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">KGID ಸಂಖ್ಯೆ*</label>
                    <input
                      type="text"
                      required
                      value={formData.kgidNumber}
                      onChange={e => setFormData({ ...formData, kgidNumber: e.target.value })}
                      placeholder="ಉದಾ: 1042891"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ನೌಕರರ ಪೂರ್ಣ ಹೆಸರು*</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                      placeholder="ನೌಕರರ ಹೆಸರು"
                      className="w-full p-2 border border-stone-300 rounded font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ತಂದೆ / ಗಂಡನ ಹೆಸರು</label>
                    <input
                      type="text"
                      value={formData.parentOrSpouseName}
                      onChange={e => setFormData({ ...formData, parentOrSpouseName: e.target.value })}
                      placeholder="ತಂದೆ/ಗಂಡನ ಹೆಸರು"
                      className="w-full p-2 border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆ (Designation)*</label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆಯ ವರ್ಗ (Cadre)</label>
                    <select
                      value={formData.cadreGroup}
                      onChange={e => setFormData({ ...formData, cadreGroup: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded bg-white"
                    >
                      <option value="ಗ್ರೂಪ್-ಎ">ಗ್ರೂಪ್-ಎ</option>
                      <option value="ಗ್ರೂಪ್-ಬಿ">ಗ್ರೂಪ್-ಬಿ</option>
                      <option value="ಗ್ರೂಪ್-ಸಿ">ಗ್ರೂಪ್-ಸಿ</option>
                      <option value="ಗ್ರೂಪ್-ಡಿ">ಗ್ರೂಪ್-ಡಿ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-bold mb-1">ಕೊನೆಯದಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಶಾಲೆ / ಕಚೇರಿ</label>
                    <input
                      type="text"
                      value={formData.officeOrSchool}
                      onChange={e => setFormData({ ...formData, officeOrSchool: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ನಿವೃತ್ತಿ ಪ್ರಕಾರ (Retirement Type)</label>
                    <select
                      value={formData.retirementType}
                      onChange={e => setFormData({ ...formData, retirementType: e.target.value as PensionRetirementType })}
                      className="w-full p-2 border border-stone-300 rounded bg-white font-medium"
                    >
                      <option value="ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)">ವಯೋನಿವೃತ್ತಿ (Superannuation - 60 Years)</option>
                      <option value="ಸ್ವಯಂ ನಿವೃತ್ತಿ (Voluntary Retirement)">ಸ್ವಯಂ ನಿವೃತ್ತಿ (Voluntary Retirement)</option>
                      <option value="ಅಶಕ್ತತಾ ಪಿಂಚಣಿ (Invalid Pension)">ಅಶಕ್ತತಾ ಪಿಂಚಣಿ (Invalid Pension)</option>
                      <option value="ಸೇವೆಯಲ್ಲಿದ್ದಾಗ ಮರಣ (Family Pension on Death)">ಸೇವೆಯಲ್ಲಿದ್ದಾಗ ಮರಣ (Family Pension)</option>
                      <option value="ಕಡ್ಡಾಯ ನಿವೃತ್ತಿ (Compulsory Retirement)">ಕಡ್ಡಾಯ ನಿವೃತ್ತಿ (Compulsory)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-700 font-bold">ಜನ್ಮ ದಿನಾಂಕ (DOB)*</label>
                      <span className="text-[10px] bg-stone-100 text-stone-700 font-mono font-bold px-1.5 py-0.5 rounded border border-stone-300">
                        {formatDDMMYYYY(formData.dob) || 'dd-mm-yyyy'}
                      </span>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => handleDobChange(e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-700 font-bold">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOA)*</label>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                        {formatDDMMYYYY(formData.doa) || 'dd-mm-yyyy'}
                      </span>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.doa}
                      onChange={e => setFormData({ ...formData, doa: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-emerald-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-700 font-bold">ನಿವೃತ್ತಿ ದಿನಾಂಕ (DOR)*</label>
                      <span className="text-[10px] bg-rose-50 text-rose-800 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-300">
                        {formatDDMMYYYY(formData.dor) || 'dd-mm-yyyy'}
                      </span>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dor}
                      onChange={e => setFormData({ ...formData, dor: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-rose-900"
                    />
                  </div>

                  {/* RETIREMENT AGE VERIFICATION (60 vs 65 ವರ್ಷಗಳು) */}
                  <div className="sm:col-span-3 p-3 bg-stone-100 rounded-lg border-2 border-stone-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span className="font-bold text-xs text-stone-900">
                          ವಯೋನಿವೃತ್ತಿ ವಯಸ್ಸು ಪರಿಶೀಲನೆ (Retirement Age Verification - KCSR Rule 95):
                        </span>
                      </div>
                      <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-700 font-mono-code">
                        ಪರಿಶೀಲಿಸಿ ಆಯ್ಕೆಮಾಡಿ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleRetirementAgeChange(60)}
                        className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition-all ${
                          formData.retirementAgeYears === 60
                            ? 'bg-amber-100 border-amber-600 shadow-sm text-amber-950 font-bold'
                            : 'bg-white border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">60 ವರ್ಷಗಳು (60 Years)</span>
                          {formData.retirementAgeYears === 60 && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 font-normal">
                          ಸಾಮಾನ್ಯ ಸರ್ಕಾರಿ ನೌಕರರು / ಪ್ರಾಥಮಿಕ & ಪ್ರೌಢಶಾಲಾ ಶಿಕ್ಷಕರು
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRetirementAgeChange(65)}
                        className={`p-2.5 rounded-lg border-2 text-left cursor-pointer transition-all ${
                          formData.retirementAgeYears === 65
                            ? 'bg-indigo-100 border-indigo-600 shadow-sm text-indigo-950 font-bold'
                            : 'bg-white border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">65 ವರ್ಷಗಳು (65 Years)</span>
                          {formData.retirementAgeYears === 65 && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 font-normal">
                          ಯುಜಿಸಿ / ವಿಶ್ವವಿದ್ಯಾಲಯ / ಕಾಲೇಜು ಪ್ರಾಧ್ಯಾಪಕರು / ವೈದ್ಯಕೀಯ ವಿಶೇಷ ವೃಂದ
                        </div>
                      </button>
                    </div>

                    {/* Verification Live Details */}
                    <div className="bg-white p-2.5 rounded border border-stone-300 text-[11px] space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-stone-700">
                        <span>
                          ಹುಟ್ಟಿದ ದಿನಾಂಕ: <strong className="font-mono-code">{formData.dob}</strong> ➔ 
                          ವಯೋನಿವೃತ್ತಿ ದಿನಾಂಕ: <strong className="font-mono-code text-rose-700 font-bold">{formData.dor}</strong>
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono-code text-[10px]">
                          ವಯಸ್ಸು: {formData.retirementAgeYears} ವರ್ಷಗಳು
                        </span>
                      </div>
                      <div className="text-stone-600 flex flex-wrap justify-between gap-1 pt-0.5 border-t border-stone-200">
                        <span>ಮುಂದಿನ ಜನ್ಮದಿನದ ವಯಸ್ಸು (Age next birthday): <strong className="font-mono-code">{formData.ageNextBirthday}</strong></span>
                        <span>ಪರಿವರ್ತನಾ ಅಪವರ್ತನ: <strong className="font-mono-code">{liveCalculation.commutationFactor}</strong></span>
                        <span>ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು: <strong className="font-mono-code">{liveCalculation.qualifyingHalfYears} / 60</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Pay, Emoluments & Leave Encashment */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border-l-4 border-emerald-500 mb-3">
                  2. ವೇತನ, ಭತ್ಯೆ ಹಾಗೂ ರಜೆ ವಿವರಗಳು (Pay, Allowances & Leave Details)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-bold mb-1">ವೇತನ ಶ್ರೇಣಿ (Pay Scale)</label>
                    <input
                      type="text"
                      value={formData.payScale}
                      onChange={e => setFormData({ ...formData, payScale: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಕೊನೆಯ ಮೂಲ ವೇತನ (Last Basic Pay ₹)*</label>
                    <input
                      type="number"
                      required
                      value={formData.lastBasicPay}
                      onChange={e => setFormData({ ...formData, lastBasicPay: Number(e.target.value) || 0, averageEmoluments: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-emerald-950 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ತುಟ್ಟಿಭತ್ಯೆ ದರ (DA Rate %)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.daPercentage}
                      onChange={e => setFormData({ ...formData, daPercentage: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು (EL Days - ಗರಿಷ್ಠ 300)</label>
                    <input
                      type="number"
                      max={300}
                      value={formData.earnedLeaveDays}
                      onChange={e => setFormData({ ...formData, earnedLeaveDays: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಅರ್ಧ ವೇತನ ರಜೆ (HPL Days)</label>
                    <input
                      type="number"
                      value={formData.halfPayLeaveDays}
                      onChange={e => setFormData({ ...formData, halfPayLeaveDays: Number(e.target.value) || 0 })}
                      placeholder="ಉದಾ: 38"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಅನರ್ಹತಾ ಸೇವೆ (Non-qualifying days - EOL)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.nonQualifyingDays}
                      onChange={e => setFormData({ ...formData, nonQualifyingDays: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2-A: Dynamic Work History Table for Schools (ಶಾಲಾ ಸೇವಾ ಇತಿಹಾಸ) */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-100 p-2.5 rounded border-l-4 border-amber-600">
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>2-ಎ. ಶಾಲಾ ಸೇವಾ ಇತಿಹಾಸ (Work History Schools & Institutions)</span>
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      ನೌಕರರು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಶಾಲೆಗಳು, ಹುದ್ದೆ ಮತ್ತು ಪ್ರಾರಂಭ/ಮುಕ್ತಾಯ ದಿನಾಂಕಗಳನ್ನು ನಮೂದಿಸಿ (KCSR Rule 287)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newRow: PensionSchoolServiceRecord = {
                          id: `wh-${Date.now()}`,
                          schoolName: '',
                          designation: formData.designation || 'ಸಹ ಶಿಕ್ಷಕರು',
                          appointmentType: 'ಮೂಲ ನೇಮಕಾತಿ',
                          startDate: '',
                          endDate: '',
                          qualifyingServiceString: '0 ವರ್ಷ, 0 ತಿಂಗಳು, 0 ದಿನ',
                          remarks: ''
                        };
                        setFormData(prev => ({
                          ...prev,
                          workHistorySchools: [...(prev.workHistorySchools || []), newRow]
                        }));
                        showToast('ಹೊಸ ಶಾಲಾ ಸೇವಾ ಸಾಲು ಸೇರಿಸಲಾಗಿದೆ (+ School Row Added)');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-y-0.5"
                    >
                      <Plus className="w-4 h-4 text-stone-950" />
                      <span>+ ಶಾಲಾ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ (+ Add School Row)</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Table */}
                <div className="overflow-x-auto border-2 border-stone-800 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-stone-900 text-amber-300 font-bold border-b border-stone-800">
                      <tr>
                        <th className="p-2 text-center w-10">#</th>
                        <th className="p-2 min-w-[200px]">ಶಾಲೆಯ ಹೆಸರು & ಸ್ಥಳ (School Name)*</th>
                        <th className="p-2 min-w-[120px]">ಪ್ರಾರಂಭ ದಿನಾಂಕ (Start)</th>
                        <th className="p-2 min-w-[120px]">ಮುಕ್ತಾಯ ದಿನಾಂಕ (End)</th>
                        <th className="p-2 min-w-[130px]">ಹುದ್ದೆ (Designation)</th>
                        <th className="p-2 min-w-[110px]">ವಿಧ (Type)</th>
                        <th className="p-2 min-w-[130px]">ಅರ್ಹತಾ ಸೇವೆ (Duration)</th>
                        <th className="p-2 min-w-[130px]">ಷರಾ (Remarks)</th>
                        <th className="p-2 text-center w-12">ಕ್ರಮ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {(!formData.workHistorySchools || formData.workHistorySchools.length === 0) ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-stone-500 bg-stone-50">
                            <Building2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="font-semibold text-stone-700">ಯಾವುದೇ ಶಾಲಾ ಸೇವಾ ಇತಿಹಾಸ ನಮೂದಿಸಿಲ್ಲ.</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">ಮೇಲಿನ "+ ಶಾಲಾ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿ ಶಾಲೆಗಳನ್ನು ಸೇರಿಸಿ.</p>
                          </td>
                        </tr>
                      ) : (
                        formData.workHistorySchools.map((school, sIdx) => (
                          <tr key={school.id || sIdx} className="hover:bg-amber-50/40">
                            <td className="p-2 text-center font-bold text-stone-600 bg-stone-50">{sIdx + 1}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={school.schoolName}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    updated[sIdx] = { ...updated[sIdx], schoolName: val };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                placeholder="ಉದಾ: ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹಳೇನಗರ, ಭದ್ರಾವತಿ"
                                className="w-full p-1.5 border border-stone-300 rounded font-medium text-xs focus:ring-1 focus:ring-amber-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={school.startDate}
                                onChange={e => {
                                  const startVal = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    const endVal = updated[sIdx].endDate;
                                    const dur = computeServiceDurationText(startVal, endVal);
                                    updated[sIdx] = { ...updated[sIdx], startDate: startVal, qualifyingServiceString: dur };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                className="w-full p-1.5 border border-stone-300 rounded font-mono text-[11px]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="date"
                                value={school.endDate}
                                onChange={e => {
                                  const endVal = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    const startVal = updated[sIdx].startDate;
                                    const dur = computeServiceDurationText(startVal, endVal);
                                    updated[sIdx] = { ...updated[sIdx], endDate: endVal, qualifyingServiceString: dur };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                className="w-full p-1.5 border border-stone-300 rounded font-mono text-[11px]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={school.designation}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    updated[sIdx] = { ...updated[sIdx], designation: val };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                placeholder="ಸಹ ಶಿಕ್ಷಕರು"
                                className="w-full p-1.5 border border-stone-300 rounded text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={school.appointmentType || 'ಮೂಲ ನೇಮಕಾತಿ'}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    updated[sIdx] = { ...updated[sIdx], appointmentType: val };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                className="w-full p-1.5 border border-stone-300 rounded bg-white text-[11px]"
                              >
                                <option value="ಮೂಲ ನೇಮಕಾತಿ">ಮೂಲ ನೇಮಕಾತಿ</option>
                                <option value="ವರ್ಗಾವಣೆ">ವರ್ಗಾವಣೆ</option>
                                <option value="ಪ್ರಭಾರ">ಪ್ರಭಾರ</option>
                                <option value="ನಿಯೋಜನೆ">ನಿಯೋಜನೆ</option>
                              </select>
                            </td>
                            <td className="p-2 font-mono text-[11px] font-bold text-emerald-800">
                              {school.qualifyingServiceString || computeServiceDurationText(school.startDate, school.endDate)}
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={school.remarks || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFormData(prev => {
                                    const updated = [...(prev.workHistorySchools || [])];
                                    updated[sIdx] = { ...updated[sIdx], remarks: val };
                                    return { ...prev, workHistorySchools: updated };
                                  });
                                }}
                                placeholder="ಷರಾ / ಪರಿಶೀಲನೆ"
                                className="w-full p-1.5 border border-stone-300 rounded text-[11px]"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    workHistorySchools: (prev.workHistorySchools || []).filter((_, idx) => idx !== sIdx)
                                  }));
                                }}
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="ಸಾಲನ್ನು ಅಳಿಸಿ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2-B: Earned Leave Management & Other Sanctioned Leave Tracking */}
              <div className="space-y-3 pt-4 font-kannada">
                <div className="bg-stone-100 p-3 rounded-xl border-l-4 border-emerald-600 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-emerald-600" />
                        <span>2-ಬಿ. ಗಳಿಕೆ ರಜೆ ನಿರ್ವಹಣೆ ಹಾಗೂ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ ಲೆಕ್ಕಾಚಾರ (Earned Leave & Other Sanctioned Leave Tracking)</span>
                      </h3>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        ವರ್ಷವಾರು ಪ್ರಾರಂಭಿಕ ಶಿಲ್ಕು, ಜಮೆ, ಇತರೆ ಮಂಜೂರಾದ ರಜೆ, ಬಳಕೆ ಮತ್ತು ಅಂತಿಮ ಶಿಲ್ಕು ನಮೂದಿಸಿ (KCSR Rule 118A)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAutoGenerateLeaveHistory}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                        title="ಸೇವಾ ಅವಧಿಯಿಂದ ವಾರ್ಷಿಕ ರಜೆ ಪಟ್ಟಿ ಸ್ವಯಂ ರಚಿಸಿ (DOA ಇಂದ DOR)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>⚡ ಸ್ವಯಂ ರಜೆ ಪಟ್ಟಿ ರಚಿಸಿ (DOA-DOR)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddLeaveYear}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                        title="ಮುಂದಿನ ವರ್ಷವನ್ನು ಸೇರಿಸಿ"
                      >
                        <Plus className="w-4 h-4 text-stone-950" />
                        <span>+ ರಜೆ ವರ್ಷ ಸೇರಿಸಿ</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRecalculateAllLeaveRows}
                        className="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-lg border border-stone-400 flex items-center gap-1 cursor-pointer"
                        title="ಎಲ್ಲಾ ವರ್ಷಗಳ ಶಿಲ್ಕು ಕ್ಯಾಸ್ಕೇಡ್ ಮರುಲೆಕ್ಕಾಚಾರ"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                        <span>🔄 ಮರುಲೆಕ್ಕಾಚಾರ</span>
                      </button>
                    </div>
                  </div>

                  {/* Cadre Selection / Rule explanation banner */}
                  <div className="bg-white p-2.5 rounded-lg border border-stone-300 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800 text-xs shrink-0">ನೌಕರರ ವರ್ಗ (Employee Category):</span>
                      <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100">
                        <button
                          type="button"
                          onClick={() => setLeaveCadreType('teacher')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            leaveCadreType === 'teacher'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          🎒 ಸಹ ಶಿಕ್ಷಕರು / ಬೋಧಕ ಸಿಬ್ಬಂದಿ (10 ದಿನ/ವರ್ಷ • 0.83 ದಿನ/ತಿಂಗಳು)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaveCadreType('non_teacher')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            leaveCadreType === 'non_teacher'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          🏢 ಶಿಕ್ಷಕೇತರ / ಇತರ ನೌಕರರು (30 ದಿನ/ವರ್ಷ • 2.5 ದಿನ/ತಿಂಗಳು)
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                      <span className="font-semibold text-amber-900">💡 KCSR ನಿಯಮ: </span>
                      {leaveCadreType === 'teacher'
                        ? 'ಸಹ ಶಿಕ್ಷಕರಿಗೆ ವಾರ್ಷಿಕ 10 ಗಳಿಕೆ ರಜೆ (0.83 ದಿನ/ತಿಂಗಳು). ಸೇರಿದ ವರ್ಷದಲ್ಲಿ (12 - ಸೇರಿದ ತಿಂಗಳು + 1) × 0.83 ದಿನಗಳು.'
                        : 'ಶಿಕ್ಷಕೇತರ ಇತರ ನೌಕರರಿಗೆ ವಾರ್ಷಿಕ 30 ಗಳಿಕೆ ರಜೆ (2.5 ದಿನ/ತಿಂಗಳು). ಸೇರಿದ ವರ್ಷದಲ್ಲಿ (12 - ಸೇರಿದ ತಿಂಗಳು + 1) × 2.5 ದಿನಗಳು.'
                      }
                    </div>
                  </div>
                </div>

                {/* Yearly Leave Table */}
                <div className="overflow-x-auto border-2 border-stone-800 rounded-lg bg-white shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-stone-900 text-emerald-300 font-bold border-b border-stone-800">
                      <tr>
                        <th className="p-2 w-16 text-center">ವರ್ಷ<br/><span className="text-[10px] text-stone-400 font-normal">Year*</span></th>
                        <th className="p-2 w-24 text-center">ಪ್ರಾರಂಭಿಕ ಶಿಲ್ಕು<br/><span className="text-[10px] text-stone-400 font-normal">Opening</span></th>
                        <th className="p-2 w-24 text-center">ಜಮೆ<br/><span className="text-[10px] text-stone-400 font-normal">Credited</span></th>
                        <th className="p-2 w-28 bg-sky-950 text-sky-200 border-x border-sky-800 text-center">
                          ಇತರೆ ಮಂಜೂರಾದ ರಜೆ<br/><span className="text-[10px] text-sky-400 font-normal">Other Sanctioned*</span>
                        </th>
                        <th className="p-2 w-24 bg-emerald-950 text-emerald-300 border-r border-emerald-800 text-center">
                          ಒಟ್ಟು (Auto)<br/><span className="text-[10px] text-emerald-400 font-normal">Total Available</span>
                        </th>
                        <th className="p-2 w-20 text-center">ಬಳಕೆ<br/><span className="text-[10px] text-stone-400 font-normal">Availed</span></th>
                        <th className="p-2 min-w-[180px] bg-stone-800 text-stone-200 border-x border-stone-700">
                          ಭರ್ತಿ ಮಾಡಿದಾಗ ರಜೆ ವಿವರ<br/><span className="text-[10px] text-stone-400 font-normal">Leave Taken Details / Order*</span>
                        </th>
                        <th className="p-2 min-w-[200px] bg-amber-950/60 text-amber-200 border-r border-amber-800">
                          ರಜೆ ವಿವರ / ಅವಧಿ & ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವಿವರ<br/><span className="text-[10px] text-amber-300 font-normal">Details & Encashment*</span>
                        </th>
                        <th className="p-2 w-24 bg-emerald-950 text-emerald-200 text-center">
                          ಅಂತಿಮ ಶಿಲ್ಕು<br/><span className="text-[10px] text-emerald-400 font-normal">Closing (≤300)</span>
                        </th>
                        <th className="p-2 text-center w-10">ಕ್ರಮ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {(!formData.yearlyLeaveHistory || formData.yearlyLeaveHistory.length === 0) ? (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-stone-500 bg-stone-50">
                            <Calculator className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="font-semibold text-stone-700">ಯಾವುದೇ ವಾರ್ಷಿಕ ರಜೆ ವಿವರ ನಮೂದಿಸಿಲ್ಲ.</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">ಮೇಲಿನ "⚡ ಸ್ವಯಂ ರಜೆ ಪಟ್ಟಿ ರಚಿಸಿ (DOA-DOR)" ಅಥವಾ "+ ರಜೆ ವರ್ಷ ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿ.</p>
                          </td>
                        </tr>
                      ) : (
                        formData.yearlyLeaveHistory.map((leave, lIdx) => {
                          const otherSanctioned = Number(leave.otherSanctionedDays ?? leave.specialCovidDutyDays ?? 0);
                          const totalAvailable = Number((Number(leave.openingBalance || 0) + Number(leave.credited || 0) + otherSanctioned).toFixed(2));
                          const closing = Math.min(300, Math.max(0, Number((totalAvailable - Number(leave.availed || 0)).toFixed(2))));

                          return (
                            <tr key={leave.id || lIdx} className="hover:bg-emerald-50/30">
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={leave.year}
                                  onChange={e => handleUpdateLeaveRow(lIdx, { year: Number(e.target.value) || 2026 })}
                                  className="w-full p-1 border border-stone-300 rounded font-mono font-bold text-center"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={leave.openingBalance}
                                  onChange={e => handleUpdateLeaveRow(lIdx, { openingBalance: Number(e.target.value) || 0 })}
                                  className="w-full p-1 border border-stone-300 rounded font-mono text-center font-medium bg-stone-50"
                                  title="ಪ್ರಾರಂಭಿಕ ಶಿಲ್ಕು ಬದಲಾಯಿಸಿದರೆ ಮುಂದಿನ ಎಲ್ಲಾ ಸಾಲುಗಳು ಸ್ವಯಂ ಪರಿಷ್ಕರಣೆಯಾಗುತ್ತವೆ"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={leave.credited}
                                  onChange={e => handleUpdateLeaveRow(lIdx, { credited: Number(e.target.value) || 0 })}
                                  className="w-full p-1 border border-stone-300 rounded font-mono text-center text-emerald-800 font-bold"
                                  title="ವಾರ್ಷಿಕ ಗಳಿಕೆ ರಜೆ ಜಮೆ (ಸಹ ಶಿಕ್ಷಕರಿಗೆ 10 ದಿನ, ಇತರರಿಗೆ 30 ದಿನ; ಸೇರಿದ ವರ್ಷದಲ್ಲಿ ತಿಂಗಳಿಗನುಗುಣವಾಗಿ 0.83 ಅಥವಾ 2.5 ದಿನಗಳು)"
                                />
                              </td>
                              <td className="p-2 bg-sky-50/70 border-x border-sky-200">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={otherSanctioned}
                                  onChange={e => {
                                    const val = Number(e.target.value) || 0;
                                    handleUpdateLeaveRow(lIdx, {
                                      otherSanctionedDays: val,
                                      specialCovidDutyDays: val
                                    });
                                  }}
                                  placeholder="0"
                                  className="w-full p-1 border-2 border-sky-400 bg-white rounded font-mono text-center font-bold text-sky-950"
                                  title="ಇತರೆ ಮಂಜೂರಾದ ರಜೆ (ಉದಾ: ಕೋವಿಡ್ ಕರ್ತವ್ಯ ಅಥವಾ ವಿಶೇಷ ಕರ್ತವ್ಯ ರಜೆ)"
                                />
                              </td>
                              <td className="p-2 bg-emerald-50 border-r border-emerald-200 text-center font-mono font-bold text-emerald-900 text-xs">
                                {totalAvailable}
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={leave.availed}
                                  onChange={e => handleUpdateLeaveRow(lIdx, { availed: Number(e.target.value) || 0 })}
                                  className="w-full p-1 border border-stone-300 rounded font-mono text-center text-rose-800 font-medium"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-2 bg-stone-50/70 border-x border-stone-200">
                                <input
                                  type="text"
                                  value={leave.leaveTakenDetails || ''}
                                  onChange={e => {
                                    const text = e.target.value;
                                    setFormData(prev => {
                                      const updated = [...(prev.yearlyLeaveHistory || [])];
                                      updated[lIdx] = { ...updated[lIdx], leaveTakenDetails: text };
                                      return { ...prev, yearlyLeaveHistory: updated };
                                    });
                                  }}
                                  placeholder="ಉದಾ: 10 ದಿನ ರಜೆ ಮಂಜೂರು / ಆದೇಶ ಸಂ: 12"
                                  className="w-full p-1 border border-stone-300 rounded text-[11px] bg-white"
                                  title="ಭರ್ತಿ ಮಾಡಿದಾಗ ರಜೆ ವಿವರ, ಆದೇಶ ಸಂಖ್ಯೆ ಮತ್ತು ಕಾರಣ"
                                />
                              </td>
                              <td className="p-2 bg-amber-50/40 border-r border-amber-200">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={leave.availedSpellDetails || ''}
                                    onChange={e => {
                                      const det = e.target.value;
                                      setFormData(prev => {
                                        const updated = [...(prev.yearlyLeaveHistory || [])];
                                        updated[lIdx] = { ...updated[lIdx], availedSpellDetails: det };
                                        return { ...prev, yearlyLeaveHistory: updated };
                                      });
                                    }}
                                    placeholder="ಉದಾ: 15 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ / 02-12 ರಿಂದ 16-12"
                                    className="w-full p-1 border border-amber-300 rounded text-[11px] bg-white"
                                    title="ರಜೆ ವಿವರ / ಅವಧಿ ಮತ್ತು ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ವಿವರ"
                                  />
                                  <div className="flex flex-wrap items-center gap-1 text-[9px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const note = leave.availedSpellDetails ? `${leave.availedSpellDetails}; 15 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ` : '15 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರು';
                                        setFormData(prev => {
                                          const updated = [...(prev.yearlyLeaveHistory || [])];
                                          updated[lIdx] = { ...updated[lIdx], availedSpellDetails: note, encashmentDetails: '15 ದಿನ ನಗದೀಕರಣ' };
                                          return { ...prev, yearlyLeaveHistory: updated };
                                        });
                                      }}
                                      className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded cursor-pointer font-medium"
                                    >
                                      + 15 ದಿನ ನಗದೀಕರಣ
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const note = leave.availedSpellDetails ? `${leave.availedSpellDetails}; 30 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ` : '30 ದಿನ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರು';
                                        setFormData(prev => {
                                          const updated = [...(prev.yearlyLeaveHistory || [])];
                                          updated[lIdx] = { ...updated[lIdx], availedSpellDetails: note, encashmentDetails: '30 ದಿನ ನಗದೀಕರಣ' };
                                          return { ...prev, yearlyLeaveHistory: updated };
                                        });
                                      }}
                                      className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded cursor-pointer font-medium"
                                    >
                                      + 30 ದಿನ ನಗದೀಕರಣ
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 bg-emerald-50 text-center font-mono font-bold text-emerald-950 text-sm">
                                {closing}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => {
                                      const filtered = (prev.yearlyLeaveHistory || []).filter((_, idx) => idx !== lIdx);
                                      const lastBal = filtered.length > 0 ? filtered[filtered.length - 1].closingBalance : 0;
                                      return {
                                        ...prev,
                                        yearlyLeaveHistory: filtered,
                                        earnedLeaveDays: lastBal
                                      };
                                    });
                                  }}
                                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="ವರ್ಷವನ್ನು ಅಳಿಸಿ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* AUTOMATED CALCULATION FIELD AT BOTTOM OF TABLE: (Basic Pay + DA) * 30 */}
                {(() => {
                  const basic = Number(formData.lastBasicPay) || 0;
                  const daRate = Number(formData.daPercentage) || 0;
                  const daAmt = Math.round(basic * daRate / 100);
                  const basicPlusDa = basic + daAmt;
                  const formula30Times = basicPlusDa * 30;
                  const dailyRate = Math.round(basicPlusDa / 30);
                  const elDays = Math.min(300, Math.max(0, Number(formData.earnedLeaveDays) || 0));
                  const encashmentPayable = Math.round(dailyRate * elDays);

                  return (
                    <div className="mt-3 p-4 bg-stone-900 text-white rounded-xl border-2 border-stone-800 shadow-md space-y-3 font-kannada">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-stone-700 gap-2">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-amber-400" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                            ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಸ್ವಯಂಚಾಲಿತ ಲೆಕ್ಕಾಚಾರ (Automatic Encashment Calculation - KCSR Rule 118A)
                          </h4>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                          ಅಧಿಕೃತ ಸೂತ್ರ: (Basic Pay + DA) ÷ 30 × ಗಳಿಕೆ ರಜೆ ದಿನಗಳು
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                          <span className="text-[10px] text-stone-400 block">ಮೂಲ ವೇತನ (Basic Pay):</span>
                          <strong className="text-amber-300 font-mono text-sm">₹{formatINR(basic)}</strong>
                        </div>

                        <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                          <span className="text-[10px] text-stone-400 block">ತುಟ್ಟಿಭತ್ಯೆ (DA {daRate}%):</span>
                          <strong className="text-stone-200 font-mono text-sm">₹{formatINR(daAmt)}</strong>
                        </div>

                        <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                          <span className="text-[10px] text-stone-400 block">(Basic Pay + DA) ಒಟ್ಟು:</span>
                          <strong className="text-emerald-300 font-mono text-sm">₹{formatINR(basicPlusDa)}</strong>
                        </div>

                        <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                          <span className="text-[10px] text-amber-400 font-bold block">(Basic Pay + DA) × 30:</span>
                          <strong className="text-amber-200 font-mono text-sm">₹{formatINR(formula30Times)}</strong>
                        </div>
                      </div>

                      <div className="bg-stone-800 p-3 rounded-xl border border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-xs text-stone-300 flex items-center gap-2">
                            <span>ದಿನದ ನಗದೀಕರಣ ದರ (Daily Rate):</span>
                            <span className="font-mono font-bold text-amber-400">₹{formatINR(dailyRate)} / ದಿನ</span>
                            <span className="text-[10px] text-stone-400">({formatINR(basicPlusDa)} ÷ 30)</span>
                          </div>
                          <div className="text-xs text-stone-300">
                            ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು: <strong className="font-mono text-amber-300 font-bold">{elDays} ದಿನಗಳು</strong> (ಗರಿಷ್ಠ ಮಿತಿ: 300 ದಿನಗಳು)
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-stone-700 sm:pl-4">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                            ಒಟ್ಟು ನಗದೀಕರಣ ಪಾವತಿ ಮೊತ್ತ (Net Leave Encashment):
                          </span>
                          <div className="text-xl font-black text-emerald-300 font-mono">
                            ₹{formatINR(encashmentPayable)}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {numberToKannadaWords(encashmentPayable)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ
                          </div>
                          <div className="mt-2 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormat('el_office_order_kannada');
                                setActiveSubTab('letters');
                              }}
                              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] rounded transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              title="ಕನ್ನಡ ಕಚೇರಿ ಆದೇಶ ತಯಾರಿಸಿ"
                            >
                              <FileText className="w-3 h-3 text-stone-950" />
                              <span>ಕನ್ನಡ ಕಚೇರಿ ಆದೇಶ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormat('el_office_order_english');
                                setActiveSubTab('letters');
                              }}
                              className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold text-[11px] rounded transition-all cursor-pointer flex items-center gap-1"
                              title="English Office Order"
                            >
                              <span>English Order</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2-C: Attached Service & Pay Worksheets Workflow */}
              <div className="space-y-2 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-100 p-2.5 rounded border-l-4 border-indigo-600">
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>2-ಸಿ. ಲಗತ್ತಿಸಲಾದ ಸೇವಾ & ವೇತನ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು (Attached Service & Pay Worksheets)</span>
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      ಅಧಿಕೃತ ನಮೂನೆಗಳು ಸೃಜನೆಗೆ ಮುನ್ನ ಸೇವಾ ಪರಿಶೋಧನೆ ಹಾಗೂ ವೇತನ ದೃಢೀಕರಣ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಲಗತ್ತಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddWorksheetModal(true)}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ವರ್ಕ್‌ಶೀಟ್ ಲಗತ್ತಿಸಿ (+ Attach Worksheet)</span>
                    </button>
                  </div>
                </div>

                {/* Worksheets Grid / Cards */}
                {(!formData.attachedWorksheets || formData.attachedWorksheets.length === 0) ? (
                  <div className="p-5 text-center bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-xs">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                    <p className="font-bold text-stone-900">ಯಾವುದೇ ಸೇವಾ/ವೇತನ ವರ್ಕ್‌ಶೀಟ್ ಲಗತ್ತಿಸಿಲ್ಲ (No Worksheets Attached)</p>
                    <p className="text-[11px] text-stone-600">
                      ಅಧಿಕೃತ ನಮೂನೆಗಳು ಸೃಜನೆಗೆ ಮುನ್ನ ಸೇವಾ ಪರಿಶೋಧನಾ ವರ್ಕ್‌ಶೀಟ್ ಹಾಗೂ ವೇತನ ಬಾಕಿ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ಲಗತ್ತಿಸಿ.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formData.attachedWorksheets.map((ws, wIdx) => (
                      <div
                        key={ws.id || wIdx}
                        className="p-3 bg-white border border-stone-300 rounded-xl hover:border-indigo-500 shadow-2xs space-y-2 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-stone-900 block truncate" title={ws.name}>
                                {ws.name}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono-code block truncate">
                                {ws.fileName}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                attachedWorksheets: (prev.attachedWorksheets || []).filter((_, idx) => idx !== wIdx)
                              }));
                            }}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="ವರ್ಕ್‌ಶೀಟ್ ತೆಗೆದುಹಾಕಿ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-stone-600 flex items-center justify-between pt-1 border-t border-stone-100">
                          <span>ದಿನಾಂಕ: {ws.uploadedAt}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const updated = [...(prev.attachedWorksheets || [])];
                                updated[wIdx] = { ...updated[wIdx], verified: !updated[wIdx].verified };
                                return { ...prev, attachedWorksheets: updated };
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              ws.verified
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {ws.verified ? '✓ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (Verified)' : 'ಪರಿಶೀಲಿಸಿ (Pending)'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: Commutation of Pension */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border-l-4 border-purple-500 mb-3">
                  3. ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (Commutation of Pension - CVP)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-purple-50/40 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="chk-commutation"
                      checked={formData.commutationOpted}
                      onChange={e => setFormData({ ...formData, commutationOpted: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="chk-commutation" className="font-bold text-stone-800 cursor-pointer">
                      ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಬಯಸಿದ್ದಾರೆ (Opted for CVP)
                    </label>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಪರಿವರ್ತನಾ ಶೇಕಡಾವಾರು (% - ಗರಿಷ್ಠ 40%)</label>
                    <input
                      type="number"
                      max={40}
                      min={1}
                      disabled={!formData.commutationOpted}
                      value={formData.commutationPercentage}
                      onChange={e => setFormData({ ...formData, commutationPercentage: Math.min(40, Math.max(1, Number(e.target.value) || 0)) })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold disabled:bg-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಮುಂದಿನ ಜನ್ಮದಿನದ ವಯಸ್ಸು (Age Next Birthday)</label>
                    <input
                      type="number"
                      min={50}
                      max={70}
                      disabled={!formData.commutationOpted}
                      value={formData.ageNextBirthday}
                      onChange={e => setFormData({ ...formData, ageNextBirthday: Number(e.target.value) || 61 })}
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold disabled:bg-stone-200"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Family and Residential Information (ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ & ನೌಕರರ ಮನೆ ವಿಳಾಸ) */}
              <div className="space-y-4 pt-1">
                <div className="bg-stone-100 p-3 rounded-lg border-l-4 border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>4. ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ & ವಾಸಸ್ಥಳದ ವಿಳಾಸ (Family and Residential Information - KCSR 1964)</span>
                    </h3>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      ನೌಕರರ ಖಾಯಂ ಮನೆ ವಿಳಾಸ ಹಾಗೂ ಕುಟುಂಬ ಪಿಂಚಣಿ ಹಕ್ಕುಳ್ಳ ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-transform active:translate-y-0.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-950" />
                    <span>+ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ (+ Add Family Member)</span>
                  </button>
                </div>

                {/* 4-A: Home Address / Residential Location Textarea */}
                <div className="bg-amber-50/50 p-3.5 rounded-lg border-2 border-amber-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-amber-700" />
                      <span>ನೌಕರರ ಮನೆ ವಿಳಾಸ / ನಿವೃತ್ತಿ ತರವಾಯದ ಶಾಶ್ವತ ವಿಳಾಸ (Employee Home Address)*</span>
                    </label>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium border border-amber-200">
                      ಪ್ರಪತ್ರ-7, ಪಿಂಚಣಿ ಪತ್ರ & ಸ್ವವಿಳಾಸ ಚೀಟಿಗಳಲ್ಲಿ ಮುದ್ರಿಸಲ್ಪಡುತ್ತದೆ
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={formData.permanentAddress}
                    onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
                    placeholder="ಉದಾ: ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಮನೆ ನಂ. 142, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577245"
                    className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>ನೌಕರರ ನಿವಾಸದ ಸ್ಥಳ, ಗ್ರಾಮ/ಬಡಾವಣೆ, ತಾಲ್ಲೂಕು ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನು ನಿಖರವಾಗಿ ನಮೂದಿಸಿ.</span>
                  </div>
                </div>

                {/* 4-B: Nested Family Members Table */}
                <div className="overflow-x-auto border-2 border-stone-800 rounded-lg bg-white shadow-xs">
                  <div className="bg-stone-900 text-amber-300 px-3 py-2 font-bold text-xs flex items-center justify-between">
                    <span>ಕುಟುಂಬ ಸದಸ್ಯರ ಪಟ್ಟಿ (Family Members Roster - 1964 Family Pension Rules)</span>
                    <span className="text-[10px] text-stone-300 font-normal">
                      ಒಟ್ಟು ಸದಸ್ಯರು: {formData.familyMembers?.length || 0}
                    </span>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                      <tr>
                        <th className="p-2 text-center w-10">#</th>
                        <th className="p-2 min-w-[180px]">ಸದಸ್ಯರ ಹೆಸರು (Family Member Name)*</th>
                        <th className="p-2 min-w-[140px]">ಸಂಬಂಧ (Relationship)*</th>
                        <th className="p-2 min-w-[140px]">ಜನ್ಮ ದಿನಾಂಕ (DOB)*</th>
                        <th className="p-2 min-w-[120px]">ವೈವಾಹಿಕ ಸ್ಥಿತಿ (Marital Status)</th>
                        <th className="p-2 text-center w-28">ನಾಮನಿರ್ದೇಶನ</th>
                        <th className="p-2 text-center w-12">ಕ್ರಮ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {(!formData.familyMembers || formData.familyMembers.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="p-5 text-center text-stone-500 bg-stone-50">
                            <Users className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                            <p className="font-semibold text-stone-700">ಯಾವುದೇ ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ ದಾಖಲಿಸಿಲ್ಲ.</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">ಮೇಲಿನ "+ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ.</p>
                          </td>
                        </tr>
                      ) : (
                        formData.familyMembers.map((member, mIdx) => (
                          <tr key={mIdx} className="hover:bg-amber-50/30">
                            <td className="p-2 text-center font-bold text-stone-600 bg-stone-50">{mIdx + 1}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                required
                                value={member.name}
                                onChange={e => handleUpdateFamilyMember(mIdx, { name: e.target.value })}
                                placeholder="ಉದಾ: ದಾಸಪ್ಪ"
                                className="w-full p-1.5 border border-stone-300 rounded font-bold text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={member.relation}
                                onChange={e => handleUpdateFamilyMember(mIdx, { relation: e.target.value })}
                                className="w-full p-1.5 border border-stone-300 rounded bg-white text-xs"
                              >
                                <option value="ಗಂಡ (Husband)">ಗಂಡ (Husband)</option>
                                <option value="ಪತ್ನಿ (Wife)">ಪತ್ನಿ (Wife)</option>
                                <option value="ಮಗ (Son)">ಮಗ (Son)</option>
                                <option value="ಮಗಳು (Daughter)">ಮಗಳು (Daughter)</option>
                                <option value="ತಾಯಿ (Mother)">ತಾಯಿ (Mother)</option>
                                <option value="ತಂದೆ (Father)">ತಂದೆ (Father)</option>
                                <option value="ಇತರೆ (Other)">ಇತರೆ (Other)</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <div className="space-y-1">
                                <input
                                  type="date"
                                  value={member.dob}
                                  onChange={e => handleUpdateFamilyMember(mIdx, { dob: e.target.value })}
                                  className="w-full p-1 border border-stone-300 rounded font-mono text-[11px]"
                                />
                                {member.dob && (
                                  <div className="text-[10px] text-stone-500 font-mono">
                                    ಫಾರ್ಮ್ಯಾಟ್: <strong className="text-stone-800">{formatDDMMYYYY(member.dob)}</strong>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <select
                                value={member.maritalStatus || 'ವಿವಾಹಿತ'}
                                onChange={e => handleUpdateFamilyMember(mIdx, { maritalStatus: e.target.value })}
                                className="w-full p-1.5 border border-stone-300 rounded bg-white text-xs"
                              >
                                <option value="ವಿವಾಹಿತ">ವಿವಾಹಿತ (Married)</option>
                                <option value="ಅವಿವಾಹಿತ">ಅವಿವಾಹಿತ (Unmarried)</option>
                                <option value="ವಿಧವೆ / ವಿಧುರ">ವಿಧವೆ / ವಿಧುರ (Widowed)</option>
                                <option value="ಇತರೆ">ಇತರೆ (Other)</option>
                              </select>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleSetFamilyMemberAsNominee(member)}
                                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 mx-auto ${
                                  formData.nomineeName === member.name
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                                }`}
                                title="ಇವರನ್ನು ಪ್ರಾಥಮಿಕ ಪಿಂಚಣಿ ನಾಮನಿರ್ದೇಶಿತರನ್ನಾಗಿ ಆಯ್ಕೆಮಾಡಿ"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>{formData.nomineeName === member.name ? '✓ ನಾಮನಿರ್ದೇಶಿತ' : 'ನಾಮನಿರ್ದೇಶಿಸಿ'}</span>
                              </button>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveFamilyMember(mIdx)}
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಿ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4-C: Nominee & Treasury Bank Details */}
                <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-300 space-y-3">
                  <div className="text-xs font-bold text-stone-800 uppercase tracking-wider pb-1 border-b border-stone-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>ಪಿಂಚಣಿ ನಾಮನಿರ್ದೇಶಿತರು & ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ (Nominee & Treasury Bank Details)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">ನಾಮನಿರ್ದೇಶಿತರ ಹೆಸರು (Nominee Name)*</label>
                      <input
                        type="text"
                        required
                        value={formData.nomineeName}
                        onChange={e => setFormData({ ...formData, nomineeName: e.target.value })}
                        placeholder="ಪತಿ / ಪತ್ನಿ ಹೆಸರು"
                        className="w-full p-2 border border-stone-300 rounded font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">ಸಂಬಂಧ (Relationship)</label>
                      <input
                        type="text"
                        value={formData.nomineeRelation}
                        onChange={e => setFormData({ ...formData, nomineeRelation: e.target.value })}
                        placeholder="ಪತಿ / ಪತ್ನಿ"
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-stone-700 font-bold">ನಾಮನಿರ್ದೇಶಿತರ ಜನ್ಮ ದಿನಾಂಕ</label>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {formatDDMMYYYY(formData.nomineeDob)}
                        </span>
                      </div>
                      <input
                        type="date"
                        value={formData.nomineeDob}
                        onChange={e => setFormData({ ...formData, nomineeDob: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">ಬ್ಯಾಂಕ್ ಹೆಸರು</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">ಶಾಖೆ (Branch)</label>
                      <input
                        type="text"
                        value={formData.bankBranch}
                        onChange={e => setFormData({ ...formData, bankBranch: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">ಖಾತೆ ಸಂಖ್ಯೆ (Bank A/c No)</label>
                      <input
                        type="text"
                        value={formData.bankAccountNo}
                        onChange={e => setFormData({ ...formData, bankAccountNo: e.target.value })}
                        placeholder="ಖಾತೆ ಸಂಖ್ಯೆ"
                        className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">IFSC ಕೋಡ್</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">ಸಂಬಂಧಪಟ್ಟ ಖಜಾನೆ (Treasury)</label>
                      <input
                        type="text"
                        value={formData.treasuryName}
                        onChange={e => setFormData({ ...formData, treasuryName: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded font-medium bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Integrated DCRG Calculation Section (ಮರಣ ಹಾಗೂ ನಿವೃತ್ತಿ ಉಪದಾನ ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ - Excel Formula) */}
              <div className="space-y-3 pt-2">
                <div className="bg-blue-950 text-white p-4 rounded-xl border-2 border-stone-800 shadow-md space-y-3 font-kannada">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-blue-800 gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                          5. ಮರಣ ಹಾಗೂ ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG) ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ (Integrated DCRG Calculation Section)
                        </h4>
                        <p className="text-[11px] text-blue-200 mt-0.5 font-normal">
                          KCSR Rule 292 ಹಾಗೂ 7ನೇ ವೇತನ ಆಯೋಗದ ಎಕ್ಸೆಲ್ ನಿಯಮಾನುಸಾರ ಸ್ವಯಂಚಾಲಿತ ಲೆಕ್ಕಾಚಾರ
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2.5 py-1 rounded">
                      Excel Formula: [(Basic Pay + DA) ÷ 4] × ಅರ್ಧವಾರ್ಷಿಕಗಳು
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-blue-900/60 p-2.5 rounded-lg border border-blue-800">
                      <span className="text-[10px] text-blue-300 block">ಕೊನೆಯ ಮೂಲ ವೇತನ (Basic):</span>
                      <strong className="text-white font-mono text-sm">₹{formatINR(Number(formData.lastBasicPay) || 0)}</strong>
                    </div>

                    <div className="bg-blue-900/60 p-2.5 rounded-lg border border-blue-800">
                      <span className="text-[10px] text-blue-300 block">ತುಟ್ಟಿಭತ್ಯೆ (DA {formData.daPercentage}%):</span>
                      <strong className="text-amber-300 font-mono text-sm">₹{formatINR(liveCalculation.daAmount)}</strong>
                    </div>

                    <div className="bg-blue-900/60 p-2.5 rounded-lg border border-blue-800">
                      <span className="text-[10px] text-blue-300 block">ಒಟ್ಟು ಉಪಲಬ್ಧಗಳು (Basic + DA):</span>
                      <strong className="text-emerald-300 font-mono text-sm">₹{formatINR((Number(formData.lastBasicPay) || 0) + liveCalculation.daAmount)}</strong>
                    </div>

                    <div className="bg-blue-900/60 p-2.5 rounded-lg border border-blue-800">
                      <span className="text-[10px] text-blue-300 block">ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕಗಳು (Half-Years):</span>
                      <strong className="text-sky-300 font-mono text-sm">{liveCalculation.qualifyingHalfYears} / 66 (ಗರಿಷ್ಠ)</strong>
                    </div>
                  </div>

                  {/* Step-by-Step Excel Logic Display */}
                  <div className="bg-stone-900/80 p-3 rounded-xl border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-stone-300 flex flex-wrap items-center gap-1.5">
                        <span className="text-amber-400 font-bold">1/4th ಸೂತ್ರ:</span>
                        <span>[₹{formatINR((Number(formData.lastBasicPay) || 0) + liveCalculation.daAmount)} ÷ 4] = </span>
                        <strong className="font-mono text-white">₹{formatINR(Math.round(((Number(formData.lastBasicPay) || 0) + liveCalculation.daAmount) / 4))}</strong>
                        <span>× {liveCalculation.qualifyingHalfYears} ಅರ್ಧವಾರ್ಷಿಕಗಳು</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        ಕಚ್ಚಾ ಉಪದಾನ ಮೊತ್ತ: <strong className="text-stone-200 font-mono">₹{formatINR(liveCalculation.dcrgRaw)}</strong> | 
                        ಗರಿಷ್ಠ ಶಾಸನಬದ್ಧ ಮಿತಿ: <strong className="text-amber-300 font-mono">₹20,00,000</strong> (ಅಥವಾ 16½ ತಿಂಗಳ ವೇತನ)
                      </div>
                    </div>

                    <div className="text-right md:border-l md:border-blue-800 md:pl-4 shrink-0">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                        ಅಂತಿಮ ಮಂಜೂರಾದ ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG Sanctioned):
                      </span>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        ₹{formatINR(liveCalculation.dcrgSanctioned)}
                      </div>
                      <div className="text-[10px] text-stone-300">
                        {numberToKannadaWords(liveCalculation.dcrgSanctioned)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: GPF, GIS ಅಂತಿಮ ಸಂದಾಯ & ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆಗಳು (GPF & GIS Final Settlement & Heads of Account) */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider bg-stone-100 px-2 py-1 rounded border-l-4 border-emerald-600 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>6. ಜಿ.ಪಿ.ಎಫ್ (GPF), ಜಿ.ಐ.ಎಸ್ (GIS) ಅಂತಿಮ ಸಂದಾಯ & ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆಗಳು (Final Settlement & Heads of Account)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-emerald-50/40 p-3 rounded-lg border border-emerald-200">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಸರ್ಕಾರಿ AG ಆದೇಶ ಸಂಖ್ಯೆ (GPF AG Order No)*</label>
                    <input
                      type="text"
                      value={formData.gpfAgOrderNumber}
                      onChange={e => setFormData({ ...formData, gpfAgOrderNumber: e.target.value })}
                      placeholder="ಉದಾ: AG/KAR/GPF/FIN/2026/89412"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">AG ಕಚೇರಿಯಿಂದ ಮಂಜೂರಾದ ಒಟ್ಟು GPF ಮೊತ್ತ (₹)*</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.gpfAgSanctionedAmount}
                      onChange={e => setFormData({ ...formData, gpfAgSanctionedAmount: Number(e.target.value) || 0 })}
                      placeholder="842600"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">GPF ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆ (Head of Account)*</label>
                    <input
                      type="text"
                      value={formData.gpfHeadOfAccount}
                      onChange={e => setFormData({ ...formData, gpfHeadOfAccount: e.target.value })}
                      placeholder="8009-01-101-0-01"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">GIS ಅಂತಿಮ ಉಳಿತಾಯ ನಿಧಿ ಮೊತ್ತ (₹)*</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.gisSavingsFundAmount}
                      onChange={e => setFormData({ ...formData, gisSavingsFundAmount: Number(e.target.value) || 0 })}
                      placeholder="86400"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">GIS ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆ (Head of Account)*</label>
                    <input
                      type="text"
                      value={formData.gisHeadOfAccount}
                      onChange={e => setFormData({ ...formData, gisHeadOfAccount: e.target.value })}
                      placeholder="8011-00-107-0-01"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆ (EL Head)*</label>
                    <input
                      type="text"
                      value={formData.elEncashmentHeadOfAccount}
                      onChange={e => setFormData({ ...formData, elEncashmentHeadOfAccount: e.target.value })}
                      placeholder="2202-01-101-1-01-052 (ರಜೆ ನಗದೀಕರಣ)"
                      className="w-full p-2 border border-stone-300 rounded font-mono-code text-xs text-amber-950 bg-amber-50"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-stone-800 flex items-center justify-end gap-3">
                {editingCaseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCaseId(null);
                      setActiveSubTab('cases');
                    }}
                    className="px-4 py-2 border-2 border-stone-800 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 cursor-pointer"
                  >
                    ರದ್ದುಗೊಳಿಸಿ (Cancel)
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all border-2 border-stone-800 shadow-[3px_3px_0px_#000] cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCaseId ? 'ಪ್ರಕರಣ ನವೀಕರಿಸಿ (Update Case)' : 'ಪಿಂಚಣಿ ಪ್ರಕರಣ ಉಳಿಸಿ (Save Pension Case)'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Calculation Inspector Card (4 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-stone-900 text-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
              <div className="flex items-center justify-between pb-2 border-b border-stone-700 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-amber-300 font-kannada">
                    ಸ್ವಯಂಚಾಲಿತ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ (Live Calculation Inspector)
                  </h3>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono-code font-bold">
                  KCSR Rule 287
                </span>
              </div>

              {/* Service Calculation */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
                  <div className="text-[10px] text-stone-400">ನಿವ್ವಳ ಅರ್ಹತಾ ಸೇವೆ (Qualifying Service):</div>
                  <div className="font-bold text-sm text-amber-300 font-mono-code mt-0.5">
                    {liveCalculation.netQualifyingYears} ವರ್ಷ {liveCalculation.netQualifyingMonths} ತಿಂಗಳು {liveCalculation.netQualifyingDays} ದಿನ
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1 flex justify-between">
                    <span>ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು:</span>
                    <strong className="text-white font-mono-code">{liveCalculation.qualifyingHalfYears} / 60 (ಗರಿಷ್ಠ)</strong>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {liveCalculation.isEligibleForFullPension ? '✓ ಪೂರ್ಣ ಪಿಂಚಣಿಗೆ ಅರ್ಹರು (30+ ವರ್ಷ)' : '✓ ಸೇವಾ ಅವಧಿಗೆ ಅನುಗುಣವಾದ ಪಿಂಚಣಿ'}
                  </div>
                </div>

                {/* Monthly Pension Box */}
                <div className="bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800">
                  <div className="text-[10px] text-emerald-300">ಮೂಲ ಮಾಸಿಕ ಪಿಂಚಣಿ (Basic Monthly Pension):</div>
                  <div className="font-bold text-lg text-emerald-300 font-mono-code">
                    {formatINR(liveCalculation.basicServicePension)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    50% of Basic Pay ({formatINR(liveCalculation.lastBasicPay)})
                  </div>
                </div>

                {/* Commutation Details */}
                {formData.commutationOpted && (
                  <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-800 space-y-1">
                    <div className="text-[10px] text-purple-300 flex justify-between">
                      <span>ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ({formData.commutationPercentage}%):</span>
                      <strong className="font-mono-code">{formatINR(liveCalculation.commutedPortion)} / ತಿಂಗಳು</strong>
                    </div>
                    <div className="text-[10px] text-stone-400 flex justify-between">
                      <span>ಪರಿವರ್ತನಾ ಅಪವರ್ತನ (ವಯಸ್ಸು {formData.ageNextBirthday}):</span>
                      <strong className="font-mono-code text-white">{liveCalculation.commutationFactor}</strong>
                    </div>
                    <div className="text-[11px] text-purple-200 font-bold pt-1 border-t border-purple-800/60 flex justify-between">
                      <span>ಪರಿವರ್ತಿತ ಗಂಟು ಮೊತ್ತ (CVP):</span>
                      <strong className="text-amber-300 font-mono-code">{formatINR(liveCalculation.commutationLumpSum)}</strong>
                    </div>
                    <div className="text-[10px] text-stone-400 pt-0.5 flex justify-between">
                      <span>ಪರಿವರ್ತನೆಯ ನಂತರದ ಮಾಸಿಕ ಪಿಂಚಣಿ:</span>
                      <strong className="text-white font-mono-code">{formatINR(liveCalculation.reducedMonthlyPension)}</strong>
                    </div>
                  </div>
                )}

                {/* DCRG / Gratuity */}
                <div className="bg-blue-950/40 p-2.5 rounded-lg border border-blue-800">
                  <div className="text-[10px] text-blue-300">ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG):</div>
                  <div className="font-bold text-base text-blue-300 font-mono-code">
                    {formatINR(liveCalculation.dcrgSanctioned)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    ಗರಿಷ್ಠ ಮಿತಿ: ₹20,00,000 | ಸೂತ್ರ: (ವೇತನ + DA) / 4 × {liveCalculation.qualifyingHalfYears}
                  </div>
                </div>

                {/* Leave Encashment */}
                <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-stone-400 block">ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ({liveCalculation.earnedLeaveDays} ದಿನ)</span>
                    <span className="font-bold text-stone-200 font-mono-code">{formatINR(liveCalculation.leaveEncashmentAmount)}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono-code font-bold">ಗರಿಷ್ಠ 300 ದಿನ</span>
                </div>

                {/* Family Pension */}
                <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700 text-[11px] space-y-1">
                  <div className="text-[10px] text-stone-400">ಕುಟುಂಬ ಪಿಂಚಣಿ (Family Pension):</div>
                  <div className="flex justify-between">
                    <span className="text-stone-300">ಸಾಮಾನ್ಯ ದರ (30%):</span>
                    <strong className="font-mono-code text-white">{formatINR(liveCalculation.familyPensionNormal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-300">ಹೆಚ್ಚುವರಿ ದರ (50%):</span>
                    <strong className="font-mono-code text-amber-300">{formatINR(liveCalculation.familyPensionEnhanced)}</strong>
                  </div>
                </div>

                {/* Grand Total Terminal Benefits */}
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 p-3 rounded-lg border border-amber-400 shadow-md">
                  <div className="text-[10px] font-bold uppercase tracking-wider">
                    ಒಟ್ಟು ಇಡಿಗಂಟು ಸೌಲಭ್ಯಗಳು (Grand Total Terminal Lump Sum):
                  </div>
                  <div className="font-bold text-xl font-mono-code mt-0.5">
                    {formatINR(liveCalculation.totalTerminalLumpSum)}
                  </div>
                  <div className="text-[10px] font-medium text-stone-900 mt-1">
                    (DCRG + ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ + ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರಗಳು (4 DISTINCT SEPARATE PENSION CALCULATIONS) */}
      {/* 1. Monthly Pension, 2. Retirement Gratuity, 3. Commutation, 4. EL Encashment */}
      {/* ========================================================================= */}
      {activeSubTab === 'calculations' && selectedCase && (
        <div className="space-y-5">
          {/* Header & Quick Case Switcher Bar */}
          <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold border-2 border-stone-800 shadow-[2px_2px_0px_#000]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 font-kannada">
                  ಪಿಂಚಣಿ ಹಾಗೂ ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರಗಳು (4 Distinct Calculations)
                </h3>
                <p className="text-xs text-stone-600 font-kannada">
                  ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿ (KCSR) & 7ನೇ ವೇತನ ಆಯೋಗದ ನಿಯಮಾನುಸಾರ ಅಧಿಕೃತ ಲೆಕ್ಕಾಚಾರ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat('pension_calc_sheet');
                  setActiveSubTab('letters');
                }}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (Full Sheet)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleEditCase(selectedCase);
                  setActiveSubTab('input');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-stone-600" />
                <span>ದತ್ತಾಂಶ ತಿದ್ದುಪಡಿ</span>
              </button>
            </div>
          </div>

          {/* RETIREMENT AGE VERIFICATION BANNER (60 ವರ್ಷಗಳು vs 65 ವರ್ಷಗಳು ಪರಿಶೀಲನೆ) */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wide uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ವಯೋನಿವೃತ್ತಿ ವಯಸ್ಸು & ಅರ್ಹತಾ ಸೇವಾ ಪರಿಶೀಲನೆ (Retirement Age Verification - KCSR Rule 95):</span>
                </div>
                <div className="text-base font-bold font-kannada text-white mt-1">
                  {selectedCase.employeeName} — {selectedCase.designation} ({selectedCase.officeOrSchool})
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-300 mt-1 font-mono-code">
                  <span>KGID: <strong className="text-amber-300">{selectedCase.kgidNumber}</strong></span>
                  <span>ಜನ್ಮ ದಿನಾಂಕ (DOB): <strong className="text-white">{selectedCase.dob}</strong></span>
                  <span>ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOA): <strong className="text-white">{selectedCase.doa}</strong></span>
                  <span>ನಿವೃತ್ತಿ ದಿನಾಂಕ (DOR): <strong className="text-rose-400 font-bold">{selectedCase.dor}</strong></span>
                  <span>ಅರ್ಹತಾ ಸೇವೆ: <strong className="text-emerald-400">{selectedCase.calculation.netQualifyingYears} ವರ್ಷ {selectedCase.calculation.netQualifyingMonths} ತಿಂಗಳು</strong></span>
                </div>
              </div>

              {/* Age Selection Toggle (60 vs 65) */}
              <div className="bg-stone-800/90 p-2.5 rounded-lg border border-stone-700 space-y-1.5 shrink-0 min-w-[320px]">
                <div className="text-[11px] font-bold text-stone-300 flex items-center justify-between">
                  <span>ವಯೋನಿವೃತ್ತಿ ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ:</span>
                  <span className="font-mono-code text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-bold">
                    ಪ್ರಸ್ತುತ: {selectedCase.calculation.retirementAgeYears || 60} ವರ್ಷಗಳು
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const verified = calculateRetirementDate(selectedCase.dob, 60);
                      const updatedCalc = computePensionDetails({
                        doa: selectedCase.doa,
                        dor: verified.dor,
                        dob: selectedCase.dob,
                        retirementAgeYears: 60,
                        nonQualifyingDays: selectedCase.nonQualifyingDays,
                        lastBasicPay: selectedCase.lastBasicPay,
                        daPercentage: selectedCase.daPercentage,
                        averageEmoluments: selectedCase.averageEmoluments,
                        earnedLeaveDays: selectedCase.earnedLeaveDays,
                        halfPayLeaveDays: selectedCase.halfPayLeaveDays,
                        commutationOpted: selectedCase.commutationOpted,
                        commutationPercentage: selectedCase.commutationPercentage,
                        ageNextBirthday: verified.ageNextBirthday
                      });
                      const updatedCase: PensionCaseRecord = {
                        ...selectedCase,
                        dor: verified.dor,
                        retirementAgeYears: 60,
                        ageNextBirthday: verified.ageNextBirthday,
                        calculation: updatedCalc,
                        lastUpdated: new Date().toISOString().split('T')[0]
                      };
                      setPensionCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
                      setSelectedCase(updatedCase);
                      showToast('60 ವರ್ಷಗಳ ವಯೋನಿವೃತ್ತಿ ಪರಿಶೀಲಿಸಿ ಲೆಕ್ಕಾಚಾರ ನವೀಕರಿಸಲಾಗಿದೆ.');
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-bold transition-all border text-center cursor-pointer ${
                      (selectedCase.calculation.retirementAgeYears || 60) === 60
                        ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    60 ವರ್ಷಗಳು (60 Yrs)
                    <div className="text-[9px] font-normal text-stone-800 leading-tight">ಸಾಮಾನ್ಯ ಶಿಕ್ಷಕರು / ನೌಕರರು</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const verified = calculateRetirementDate(selectedCase.dob, 65);
                      const updatedCalc = computePensionDetails({
                        doa: selectedCase.doa,
                        dor: verified.dor,
                        dob: selectedCase.dob,
                        retirementAgeYears: 65,
                        nonQualifyingDays: selectedCase.nonQualifyingDays,
                        lastBasicPay: selectedCase.lastBasicPay,
                        daPercentage: selectedCase.daPercentage,
                        averageEmoluments: selectedCase.averageEmoluments,
                        earnedLeaveDays: selectedCase.earnedLeaveDays,
                        halfPayLeaveDays: selectedCase.halfPayLeaveDays,
                        commutationOpted: selectedCase.commutationOpted,
                        commutationPercentage: selectedCase.commutationPercentage,
                        ageNextBirthday: verified.ageNextBirthday
                      });
                      const updatedCase: PensionCaseRecord = {
                        ...selectedCase,
                        dor: verified.dor,
                        retirementAgeYears: 65,
                        ageNextBirthday: verified.ageNextBirthday,
                        calculation: updatedCalc,
                        lastUpdated: new Date().toISOString().split('T')[0]
                      };
                      setPensionCases(prev => prev.map(c => c.id === selectedCase.id ? updatedCase : c));
                      setSelectedCase(updatedCase);
                      showToast('65 ವರ್ಷಗಳ (UGC/ವಿಶೇಷ ವೃಂದ) ವಯೋನಿವೃತ್ತಿ ಪರಿಶೀಲಿಸಿ ಲೆಕ್ಕಾಚಾರ ನವೀಕರಿಸಲಾಗಿದೆ.');
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-bold transition-all border text-center cursor-pointer ${
                      selectedCase.calculation.retirementAgeYears === 65
                        ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    65 ವರ್ಷಗಳು (65 Yrs)
                    <div className="text-[9px] font-normal text-stone-800 leading-tight">UGC / ವಿಶೇಷ ವೃಂದ</div>
                  </button>
                </div>
                <div className="text-[10px] text-stone-400 text-center">
                  ಪರಿವರ್ತನಾ ಅಪವರ್ತನ: <strong className="text-amber-300 font-mono-code">{selectedCase.calculation.commutationFactor}</strong> (ಮುಂದಿನ ಜನ್ಮದಿನದ ವಯಸ್ಸು {selectedCase.calculation.ageNextBirthday})
                </div>
              </div>
            </div>
          </div>

          {/* UNIFIED 'PENSION SUMMARY' CARD (Retirement Pension, Family Pension & DCRG Calculations Side-by-Side) */}
          <UnifiedPensionSummaryCard
            pensionCase={selectedCase}
            onViewLetters={() => {
              setSelectedFormat('sanction_order');
              setActiveSubTab('letters');
            }}
            onViewCalcSheet={() => {
              setSelectedFormat('pension_calc_sheet');
              setActiveSubTab('letters');
            }}
            onEditCase={() => {
              handleEditCase(selectedCase);
              setActiveSubTab('input');
            }}
          />

          {/* THE 4 DISTINCT PENSION CALCULATIONS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* --------------------------------------------------------------------- */}
            {/* 1. MONTHLY PENSION CALCULATION (ಮಾಸಿಕ ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರ)                   */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-emerald-800 text-white p-3.5 flex items-center justify-between border-b-2 border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs border border-emerald-400">
                      1
                    </span>
                    <h4 className="font-bold text-sm font-kannada">
                      ಮಾಸಿಕ ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರ (Monthly Pension Calculation)
                    </h4>
                  </div>
                  <span className="bg-emerald-950 text-emerald-200 text-[10px] font-mono-code px-2 py-0.5 rounded font-bold border border-emerald-600">
                    KCSR Rule 287(2)
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Formula banner */}
                  <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-emerald-950">
                    <span className="font-bold block text-[11px] text-emerald-900">ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ (Formula):</span>
                    <span className="font-mono-code font-bold text-xs">
                      (ಕೊನೆಯ ಮೂಲ ವೇತನ ÷ 2) × (ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು ÷ 60)
                    </span>
                    <div className="text-[10px] text-emerald-800 mt-1">
                      (ಕನಿಷ್ಠ ಪಿಂಚಣಿ: ₹13,500 | ಗರಿಷ್ಠ ಪಿಂಚಣಿ: ₹75,300)
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="space-y-1.5 divide-y divide-stone-200">
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಕೊನೆಯ ಮೂಲ ವೇತನ (Last Basic Pay):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.lastBasicPay)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಸರಾಸರಿ ಲಭ್ಯತೆಗಳು (Average Emoluments):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.averageEmoluments)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಅರ್ಹತಾ ಸೇವೆ (Qualifying Service):</span>
                      <strong className="font-mono-code text-stone-900">
                        {selectedCase.calculation.netQualifyingYears} ವರ್ಷ {selectedCase.calculation.netQualifyingMonths} ತಿಂಗಳು {selectedCase.calculation.netQualifyingDays} ದಿನ
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು (Qualifying Half Years):</span>
                      <strong className="font-mono-code text-emerald-800 font-bold">
                        {selectedCase.calculation.qualifyingHalfYears} / 60 (ಗರಿಷ್ಠ)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಪೂರ್ಣ ಪಿಂಚಣಿ ಅರ್ಹತೆ (Full Pension Status):</span>
                      <span className="font-bold text-emerald-700">
                        {selectedCase.calculation.isEligibleForFullPension ? '✓ ಪೂರ್ಣ ಪಿಂಚಣಿಗೆ ಅರ್ಹರು (30+ ವರ್ಷ)' : 'ಅವಧಿಗೆ ಅನುಗುಣವಾದ ಪಿಂಚಣಿ'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 bg-emerald-100/60 px-2 rounded">
                      <span className="font-bold text-emerald-950">ಮಂಜೂರಾದ ಮಾಸಿಕ ಮೂಲ ಪಿಂಚಣಿ (Basic Monthly Pension):</span>
                      <strong className="font-mono-code font-bold text-base text-emerald-900">
                        {formatINR(selectedCase.calculation.basicServicePension)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ತುಟ್ಟಿಭತ್ಯೆ (DA on Pension @ {selectedCase.calculation.daPercentage}%):</span>
                      <strong className="font-mono-code text-stone-800">{formatINR(selectedCase.calculation.daOnPension)}</strong>
                    </div>
                    <div className="flex justify-between py-1 bg-stone-100 px-2 rounded font-bold text-stone-900">
                      <span>ಒಟ್ಟು ಮಾಸಿಕ ಪಿಂಚಣಿ (Gross Monthly Pension):</span>
                      <strong className="font-mono-code text-base text-emerald-950">
                        {formatINR(selectedCase.calculation.grossMonthlyPension)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">ಪ್ರಪತ್ರ-7 & ಮಂಜೂರಾತಿ ಆದೇಶ</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('sanction_order');
                    setActiveSubTab('letters');
                  }}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>ಪಿಂಚಣಿ ಆದೇಶ ವೀಕ್ಷಿಸಿ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* 2. RETIREMENT GRATUITY (DCRG) CALCULATION (ನಿವೃತ್ತಿ ಉಪದಾನ ಲೆಕ್ಕಾಚಾರ)      */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-blue-800 text-white p-3.5 flex items-center justify-between border-b-2 border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-blue-400">
                      2
                    </span>
                    <h4 className="font-bold text-sm font-kannada">
                      ನಿವೃತ್ತಿ ಉಪದಾನ ಲೆಕ್ಕಾಚಾರ (Retirement Gratuity / DCRG)
                    </h4>
                  </div>
                  <span className="bg-blue-950 text-blue-200 text-[10px] font-mono-code px-2 py-0.5 rounded font-bold border border-blue-600">
                    KCSR Rule 292B
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Formula banner */}
                  <div className="bg-blue-50 border border-blue-300 p-2.5 rounded-lg text-blue-950">
                    <span className="font-bold block text-[11px] text-blue-900">ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ (Formula):</span>
                    <span className="font-mono-code font-bold text-xs">
                      (ಕೊನೆಯ ಮೂಲ ವೇತನ + ತುಟ್ಟಿಭತ್ಯೆ) ÷ 4 × ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು
                    </span>
                    <div className="text-[10px] text-blue-800 mt-1">
                      (ಗರಿಷ್ಠ 16.5 ತಿಂಗಳ ಲಭ್ಯತೆಗಳು | ಸರ್ಕಾರದ ಶಾಸನಬದ್ಧ ಗರಿಷ್ಠ ಮಿತಿ: ₹20,00,000)
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="space-y-1.5 divide-y divide-stone-200">
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಮೂಲ ವೇತನ (Basic Pay):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.lastBasicPay)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ತುಟ್ಟಿಭತ್ಯೆ (DA @ {selectedCase.calculation.daPercentage}%):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.dcrgDaAmount)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಒಟ್ಟು ಲಭ್ಯತೆಗಳು (Pay + DA Emoluments):</span>
                      <strong className="font-mono-code text-blue-900 font-bold">{formatINR(selectedCase.calculation.dcrgEmoluments)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಅರ್ಹತಾ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗಳು:</span>
                      <strong className="font-mono-code text-stone-900">{selectedCase.calculation.qualifyingHalfYears} ಅವಧಿಗಳು</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಪ್ರತಿ ಅರ್ಧವಾರ್ಷಿಕ ಅವಧಿಗೆ 1/4 ರಷ್ಟು ಲಭ್ಯತೆ:</span>
                      <strong className="font-mono-code text-stone-700">{formatINR(selectedCase.calculation.dcrgEmoluments / 4)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಸೂತ್ರದನ್ವಯ ಲೆಕ್ಕಾಚಾರ ಮೊತ್ತ:</span>
                      <strong className="font-mono-code text-stone-800">
                        {formatINR((selectedCase.calculation.dcrgEmoluments / 4) * selectedCase.calculation.qualifyingHalfYears)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">16.5 ತಿಂಗಳುಗಳ ಲಭ್ಯತೆಯ ಮಿತಿ:</span>
                      <strong className="font-mono-code text-stone-700">{formatINR(selectedCase.calculation.dcrgMax16HalfMonths)}</strong>
                    </div>
                    <div className="flex justify-between py-1 bg-blue-100/60 px-2 rounded">
                      <span className="font-bold text-blue-950">ಅಂತಿಮ ಮಂಜೂರಾದ ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG):</span>
                      <strong className="font-mono-code font-bold text-base text-blue-950">
                        {formatINR(selectedCase.calculation.dcrgSanctioned)}
                      </strong>
                    </div>
                    <div className="py-1 text-[10px] text-stone-600 font-kannada">
                      ಅಕ್ಷರಗಳಲ್ಲಿ: <strong>{numberToKannadaWords(selectedCase.calculation.dcrgSanctioned)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">KCSR ನಿಯಮ 292B ಉಪದಾನ ಆದೇಶ</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('gratuity_order');
                    setActiveSubTab('letters');
                  }}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>ಉಪದಾನ ಆದೇಶ ವೀಕ್ಷಿಸಿ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* 3. COMMUTATION OF PENSION (ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ - CVP ಲೆಕ್ಕಾಚಾರ)               */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-purple-800 text-white p-3.5 flex items-center justify-between border-b-2 border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs border border-purple-400">
                      3
                    </span>
                    <h4 className="font-bold text-sm font-kannada">
                      ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಲೆಕ್ಕಾಚಾರ (Commutation of Pension - CVP)
                    </h4>
                  </div>
                  <span className="bg-purple-950 text-purple-200 text-[10px] font-mono-code px-2 py-0.5 rounded font-bold border border-purple-600">
                    KCSR Appendix-I
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Formula banner */}
                  <div className="bg-purple-50 border border-purple-300 p-2.5 rounded-lg text-purple-950">
                    <span className="font-bold block text-[11px] text-purple-900">ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ (Formula):</span>
                    <span className="font-mono-code font-bold text-xs">
                      ಮಾಸಿಕ ಪರಿವರ್ತಿತ ಭಾಗ × 12 × ವಯೋಮಾನ ಅಪವರ್ತನ (Commutation Factor)
                    </span>
                    <div className="text-[10px] text-purple-800 mt-1">
                      (ಗರಿಷ್ಠ 40% ಪರಿವರ್ತನೆಗೆ ಅವಕಾಶ | 15 ವರ್ಷಗಳ ನಂತರ ಪೂರ್ಣ ಪಿಂಚಣಿ ಮರುಸ್ಥಾಪನೆ)
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="space-y-1.5 divide-y divide-stone-200">
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಮೂಲ ಮಾಸಿಕ ಪಿಂಚಣಿ:</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.basicServicePension)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಪರಿವರ್ತನೆ ಬಯಸಿದ ಶೇಕಡಾವಾರು (%):</span>
                      <strong className="font-mono-code text-purple-800 font-bold">{selectedCase.calculation.commutationPercentage}%</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಮಾಸಿಕ ಪರಿವರ್ತಿತ ಭಾಗ (Commuted Portion):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.commutedPortion)} / ತಿಂಗಳಿಗೆ</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಮುಂದಿನ ಜನ್ಮದಿನದ ವಯಸ್ಸು (Age Next Birthday):</span>
                      <strong className="font-mono-code text-stone-900">
                        {selectedCase.calculation.ageNextBirthday} ವರ್ಷಗಳು 
                        <span className="text-stone-500 font-normal text-[11px]"> ({selectedCase.calculation.retirementAgeYears || 60} ವರ್ಷದ ನಿವೃತ್ತಿಗೆ)</span>
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 bg-purple-50 px-2 rounded">
                      <span className="font-bold text-purple-900">ಸರ್ಕಾರಿ ಪರಿವರ್ತನಾ ಅಪವರ್ತನ (Factor):</span>
                      <strong className="font-mono-code text-purple-950 font-bold text-sm">
                        {selectedCase.calculation.commutationFactor}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 bg-purple-100/60 px-2 rounded">
                      <span className="font-bold text-purple-950">ಪರಿವರ್ತಿತ ಪಿಂಚಣಿ ಗಂಟು ಮೊತ್ತ (CVP Lump Sum):</span>
                      <strong className="font-mono-code font-bold text-base text-purple-950">
                        {formatINR(selectedCase.calculation.commutationLumpSum)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಪರಿವರ್ತನೆ ನಂತರದ ನಿವ್ವಳ ಮೂಲ ಪಿಂಚಣಿ:</span>
                      <strong className="font-mono-code text-emerald-800 font-bold">
                        {formatINR(selectedCase.calculation.reducedMonthlyPension)} / ತಿಂಗಳಿಗೆ
                      </strong>
                    </div>
                    <div className="py-1 text-[10px] text-stone-600 font-kannada">
                      15 ವರ್ಷಗಳ ನಂತರ (Rule 376 ರಂತೆ) ಮೂಲ ಪಿಂಚಣಿ {formatINR(selectedCase.calculation.basicServicePension)} ಮರುಸ್ಥಾಪನೆಯಾಗುತ್ತದೆ.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">CVP ಅಧಿಕೃತ ಮಂಜೂರಾತಿ ಆದೇಶ</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('commutation_order');
                    setActiveSubTab('letters');
                  }}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>ಪರಿವರ್ತನೆ ಆದೇಶ ವೀಕ್ಷಿಸಿ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* 4. EARNED LEAVE ENCASHMENT (ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಲೆಕ್ಕಾಚಾರ)                  */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-amber-700 text-white p-3.5 flex items-center justify-between border-b-2 border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs border border-amber-400">
                      4
                    </span>
                    <h4 className="font-bold text-sm font-kannada">
                      ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಲೆಕ್ಕಾಚಾರ (Earned Leave & HPL Encashment)
                    </h4>
                  </div>
                  <span className="bg-amber-950 text-amber-200 text-[10px] font-mono-code px-2 py-0.5 rounded font-bold border border-amber-500">
                    KCSR Rule 118A
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Formula banner */}
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-amber-950">
                    <span className="font-bold block text-[11px] text-amber-900">ಲೆಕ್ಕಾಚಾರದ ಸೂತ್ರ (Formula):</span>
                    <span className="font-mono-code font-bold text-xs">
                      (ಕೊನೆಯ ಮೂಲ ವೇತನ + ತುಟ್ಟಿಭತ್ಯೆ) ÷ 30 × ಗಳಿಕೆ ರಜೆ ದಿನಗಳು
                    </span>
                    <div className="text-[10px] text-amber-800 mt-1">
                      (ಗರಿಷ್ಠ 300 ದಿನಗಳ ಮಿತಿಯೊಳಗೆ ಗಳಿಕೆ ರಜೆ ಹಾಗೂ ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಅರ್ಧವೇತನ ರಜೆ ಸರಿಹೊಂದಿಕೆ)
                    </div>
                  </div>

                  {/* Calculations Table */}
                  <div className="space-y-1.5 divide-y divide-stone-200">
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಕೊನೆಯ ಮೂಲ ವೇತನ (Basic Pay):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.lastBasicPay)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ತುಟ್ಟಿಭತ್ಯೆ (DA @ {selectedCase.calculation.daPercentage}%):</span>
                      <strong className="font-mono-code text-stone-900">
                        {formatINR(Math.round((selectedCase.calculation.lastBasicPay * selectedCase.calculation.daPercentage) / 100))}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ರಜೆ ನಗದೀಕರಣದ ಮಾಸಿಕ ಲಭ್ಯತೆಗಳು (Pay + DA):</span>
                      <strong className="font-mono-code text-amber-950 font-bold">{formatINR(selectedCase.calculation.leaveEmoluments)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ದಿನವೊಂದರ ವೇತನ ದರ (Daily Rate = Emoluments ÷ 30):</span>
                      <strong className="font-mono-code text-stone-900">{formatINR(selectedCase.calculation.leaveDailyRate)} / ದಿನಕ್ಕೆ</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಜಮೆಯಿರುವ ಗಳಿಕೆ ರಜೆ ದಿನಗಳು (EL Balance Days):</span>
                      <strong className="font-mono-code text-amber-900 font-bold">{selectedCase.calculation.earnedLeaveDays} ದಿನಗಳು (ಗರಿಷ್ಠ 300)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-600">ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮೊತ್ತ:</span>
                      <strong className="font-mono-code text-stone-800">{formatINR(selectedCase.calculation.earnedLeaveAmount)}</strong>
                    </div>
                    {selectedCase.calculation.halfPayLeaveDays > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-stone-600">ಅರ್ಧ ವೇತನ ರಜೆ (HPL) ದಿನಗಳು:</span>
                        <strong className="font-mono-code text-stone-700">{selectedCase.calculation.halfPayLeaveDays} ದಿನಗಳು</strong>
                      </div>
                    )}
                    <div className="flex justify-between py-1 bg-amber-100/60 px-2 rounded">
                      <span className="font-bold text-amber-950">ಒಟ್ಟು ಮಂಜೂರಾದ ರಜೆ ನಗದೀಕರಣ ಮೊತ್ತ:</span>
                      <strong className="font-mono-code font-bold text-base text-amber-950">
                        {formatINR(selectedCase.calculation.leaveEncashmentAmount)}
                      </strong>
                    </div>
                    <div className="py-1 text-[10px] text-stone-600 font-kannada">
                      ಅಕ್ಷರಗಳಲ್ಲಿ: <strong>{numberToKannadaWords(selectedCase.calculation.leaveEncashmentAmount)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">KCSR ನಿಯಮ 118A ನಗದೀಕರಣ ಆದೇಶ</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('el_encashment_order');
                    setActiveSubTab('letters');
                  }}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>ರಜೆ ನಗದೀಕರಣ ಆದೇಶ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUMMARY OF TERMINAL BENEFITS (ಸಮಗ್ರ ನಿವೃತ್ತಿ ಇಡಿಗಂಟು ಸೌಲಭ್ಯಗಳ ಸಾರಾಂಶ)         */}
          {/* ========================================================================= */}
          <div className="bg-stone-900 text-white p-5 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-700">
              <div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
                  ಸಮಗ್ರ ಪಾವತಿ ಸಾರಾಂಶ (Grand Summary of Terminal Benefits)
                </span>
                <h3 className="text-xl font-bold font-kannada text-white mt-0.5">
                  ಒಟ್ಟು ನಿವೃತ್ತಿ ಇಡಿಗಂಟು ಮೊತ್ತ & ಮಾಸಿಕ ಪಿಂಚಣಿ ಸಾರಾಂಶ
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('pension_calc_sheet');
                    setActiveSubTab('letters');
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-all border-2 border-stone-700 shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ ಮುದ್ರಿಸಿ (Print Statement)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-stone-800 p-3 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-xs block">1. ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG):</span>
                <span className="text-lg font-bold text-blue-300 font-mono-code mt-1 block">
                  {formatINR(selectedCase.calculation.dcrgSanctioned)}
                </span>
                <span className="text-[10px] text-stone-400">KCSR ನಿಯಮ 292B</span>
              </div>

              <div className="bg-stone-800 p-3 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-xs block">2. ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (CVP):</span>
                <span className="text-lg font-bold text-purple-300 font-mono-code mt-1 block">
                  {formatINR(selectedCase.calculation.commutationLumpSum)}
                </span>
                <span className="text-[10px] text-stone-400">ಅಪವರ್ತನ {selectedCase.calculation.commutationFactor} (ವಯಸ್ಸು {selectedCase.calculation.ageNextBirthday})</span>
              </div>

              <div className="bg-stone-800 p-3 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-xs block">3. ರಜೆ ನಗದೀಕರಣ (EL Encashment):</span>
                <span className="text-lg font-bold text-amber-300 font-mono-code mt-1 block">
                  {formatINR(selectedCase.calculation.leaveEncashmentAmount)}
                </span>
                <span className="text-[10px] text-stone-400">{selectedCase.calculation.earnedLeaveDays} ದಿನಗಳ ಗಳಿಕೆ ರಜೆ</span>
              </div>

              <div className="bg-stone-800 p-3 rounded-lg border border-emerald-500/60 bg-emerald-950/40">
                <span className="text-emerald-300 text-xs block">4. ಪ್ರತಿ ತಿಂಗಳ ನಿವ್ವಳ ಪಿಂಚಣಿ:</span>
                <span className="text-lg font-bold text-emerald-300 font-mono-code mt-1 block">
                  {formatINR(selectedCase.calculation.reducedMonthlyPension + selectedCase.calculation.daOnPension)}
                </span>
                <span className="text-[10px] text-stone-400">(ಮೂಲ {formatINR(selectedCase.calculation.reducedMonthlyPension)} + DA)</span>
              </div>
            </div>

            {/* Big Grand Total Highlight */}
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  ಒಟ್ಟು ಇಡಿಗಂಟು ಸೌಲಭ್ಯಗಳ ಪಾವತಿ ಮೊತ್ತ (Grand Total Lump Sum Amount):
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono-code mt-0.5 block">
                  {formatINR(selectedCase.calculation.totalTerminalLumpSum)}
                </span>
                <span className="text-xs font-bold text-stone-900 mt-1 block font-kannada">
                  (ಅಕ್ಷರಗಳಲ್ಲಿ: {numberToKannadaWords(selectedCase.calculation.totalTerminalLumpSum)} ರೂಪಾಯಿಗಳು ಮಾತ್ರ)
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block bg-stone-900 text-amber-300 font-mono-code text-xs px-3 py-1.5 rounded-lg border border-stone-800 font-bold">
                  BEO ಭದ್ರಾವತಿ ಕಾರ್ಯಾಲಯ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: ALL FORMAT LETTERS & SANCTION ORDERS STUDIO (NO QR CODE!)      */}
      {/* ========================================================================= */}
      {activeSubTab === 'letters' && selectedCase && (
        <div className="space-y-4">
          {/* Pension Case File Worksheet Verification Gate Banner */}
          {(() => {
            const worksheets = selectedCase.attachedWorksheets || [];
            const hasWorksheets = worksheets.length > 0;
            const verifiedCount = worksheets.filter(w => w.verified).length;

            if (hasWorksheets) {
              return (
                <div className="bg-emerald-50 border-2 border-emerald-600 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      ಕಡತ ಐಡಿ: <strong className="font-mono">{selectedCase.fileId || `PEN-FILE-2026-${selectedCase.fileNumber}`}</strong> • {worksheets.length} ಸೇವಾ/ವೇತನ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು ಲಗತ್ತಿಸಲಾಗಿದೆ ({verifiedCount} ದೃಢೀಕರಿಸಲಾಗಿದೆ). ಅಧಿಕೃತ ನಮೂನೆ ಸೃಜನೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      VERIFIED WORKFLOW
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-amber-50 border-2 border-amber-600 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">ವರ್ಕ್‌ಶೀಟ್ ಪರಿಶೀಲನಾ ಎಚ್ಚರಿಕೆ (Worksheet Verification Requirement):</span>
                    <span className="block text-[11px] text-stone-700">
                      ಈ ಪಿಂಚಣಿ ಕಡತಕ್ಕೆ ಸೇವಾ ಹಾಗೂ ವೇತನ ವರ್ಕ್‌ಶೀಟ್‌ಗಳನ್ನು ಲಗತ್ತಿಸಿ ಪರಿಶೀಲಿಸಿದ ನಂತರ ಅಧಿಕೃತ ನಮೂನೆಗಳನ್ನು AG ಕಚೇರಿಗೆ ಸಲ್ಲಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleEditCase(selectedCase);
                    setActiveSubTab('input');
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg border border-amber-700 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ವರ್ಕ್‌ಶೀಟ್ ಲಗತ್ತಿಸಿ (Go to Worksheets)</span>
                </button>
              </div>
            );
          })()}

          {/* Top Controls: 18 Official Pension Dossier Formats Switcher & Actions */}
          <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-stone-900">
                  18 ಅಧಿಕೃತ ಪಿಂಚಣಿ ಪ್ರಸ್ತಾವನಾ ಪತ್ರಗಳು (18 Official Pension Proposal Forms - KCSR Dossier):
                </span>
                <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded font-mono font-bold">
                  KCSR ಅಧಿಕೃತ ನಮೂನೆಗಳು
                </span>
              </div>

              {/* Action Buttons: Print, Registry, Copy */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  title="A4 ಗಾತ್ರದಲ್ಲಿ ಮುದ್ರಿಸಿ ಅಥವಾ PDF ಉಳಿಸಿ"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>ಮುದ್ರಿಸಿ (Print A4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveActiveLetterToRegistry}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  title="ಅಧಿಕೃತ ಜಾವಕ ರಿಜಿಸ್ಟ್ರಿಗೆ ಸೇರಿಸಿ"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ರಿಜಿಸ್ಟ್ರಿಗೆ ಉಳಿಸಿ</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold p-1.5 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer"
                  title="HTML ಪಠ್ಯ ನಕಲಿಸಿ"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Categorized Format Buttons Grid */}
            <div className="space-y-2">
              {/* CATEGORY 1: FORM 7 & SERVICE HISTORY */}
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                  ಭಾಗ 1 : ಪ್ರಪತ್ರ-7, ಸೇವಾ ವಿವರ & ಮಂಜೂರಾತಿ ಆದೇಶ (Service History & Form 7)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('form7')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'form7' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    1. ಪ್ರಪತ್ರ-7 (Form 7 - 21 ಕಾಲಂಗಳು)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('avg_emoluments_12m')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'avg_emoluments_12m' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    2. ವಿಭಾಗ-II : 12 ತಿಂಗಳ ವೇತನ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('schools_service_history')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'schools_service_history' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    3. ವಿಭಾಗ-I : ಕರ್ತವ್ಯ ಶಾಲೆಗಳು (3 Schools)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('sanction_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'sanction_order' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    4. ಸಕ್ಷಮ ಅಧಿಕಾರಿಯ ಮಂಜೂರಾತಿ ಆದೇಶ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('pension_calc_sheet')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'pension_calc_sheet' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    5. 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (Calc Sheet)
                  </button>
                </div>
              </div>

              {/* CATEGORY 2: GRATUITY, EARNED LEAVE, GPF & GIS */}
              <div className="pt-1.5 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                  ಭಾಗ 2 : ಉಪದಾನ, ಗಳಿಕೆ ರಜೆ, GPF & GIS ಮಂಜೂರಾತಿ (Terminal Benefits & Sanctions)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('gratuity_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'gratuity_order' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    6. ಉಪದಾನ ಆದೇಶ (DCRG ₹14,43,200)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('earned_leave_sheet')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'earned_leave_sheet' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    7. ವಿಭಾಗ-I : ಗಳಿಕೆ ರಜೆ ತಃಖ್ಯೆ (356 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('el_office_order_kannada')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'el_office_order_kannada' || selectedFormat === 'el_encashment_order' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    8. ಗಳಿಕೆ ರಜೆ ಕಚೇರಿ ಆದೇಶ (ಕನ್ನಡ)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('el_office_order_english')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'el_office_order_english' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    9. EL Encashment Order (English)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('provisional_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'provisional_order' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    10. ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ (KCSR 34/341)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('gpf_final_withdrawal')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'gpf_final_withdrawal' ? 'bg-blue-600 text-white shadow-[2px_2px_0px_#000]' : 'bg-blue-50 text-blue-950 hover:bg-blue-100 border-blue-400'
                    }`}
                  >
                    11. GPF ಮುಂಗಡರಹಿತ ಪ್ರಮಾಣಪತ್ರ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('gpf_form_6b')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'gpf_form_6b' ? 'bg-blue-600 text-white shadow-[2px_2px_0px_#000]' : 'bg-blue-50 text-blue-950 hover:bg-blue-100 border-blue-400'
                    }`}
                  >
                    12. ನಮೂನೆ 6 (ಬಿ) : GPF ಅಂತಿಮ ಸಂದಾಯಕ್ಕೆ ಅರ್ಜಿ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('gpf_office_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'gpf_office_order' ? 'bg-blue-700 text-white shadow-[2px_2px_0px_#000]' : 'bg-blue-50 text-blue-950 hover:bg-blue-100 border-blue-400'
                    }`}
                  >
                    13. GPF ಅಂತಿಮ ಪಾವತಿ ಆದೇಶ (AG)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('gis_office_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'gis_office_order' ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_#000]' : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border-emerald-400'
                    }`}
                  >
                    14. GIS ಉಳಿತಾಯ ನಿಧಿ ಆದೇಶ (₹1.20L)
                  </button>
                </div>
              </div>

              {/* CATEGORY 3: DECLARATIONS, CERTIFICATES & IDENTITY SLIPS */}
              <div className="pt-1.5 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                  ಭಾಗ 3 : ಪ್ರಮಾಣಪತ್ರಗಳು, ಘೋಷಣೆಗಳು & ಗುರುತುಗಳು (Certificates, Slips & Verification)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('non_receipt_recovery')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'non_receipt_recovery' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    15. ವೇತನ ಸ್ವೀಕರಿಸದಿರುವ ಘೋಷಣೆ & ಒಪ್ಪಿಗೆ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('specimen_signatures_photo')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'specimen_signatures_photo' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    16. ಮಾದರಿ ಸಹಿ, ಗುರುತು & ಜಂಟಿ ಫೋಟೋ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('no_dues_cert')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'no_dues_cert' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    17. ತನಿಖೆ ರಹಿತ, ಬಾಕಿ ರಹಿತ & ಸ್ವೀಕೃತಿ ರಶೀದಿ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('self_address_slips')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'self_address_slips' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    18. ಸ್ವವಿಳಾಸ ಚೀಟಿ (Self-Address Slips)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('family_pension_nomination')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'family_pension_nomination' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಕುಟುಂಬ ವೇತನ ನಾಮನಿರ್ದೇಶನ (1964 Rules)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('non_reemployment_undertaking')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'non_reemployment_undertaking' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಮರು ನೌಕರಿಯಿಲ್ಲ ದೃಢೀಕರಣ & ಘೋಷಣೆ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('pension_sanction_summary')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'pension_sanction_summary' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಮಂಜೂರಾತಿ ವಿವರ ಸಾರಾಂಶ ಪಟ್ಟಿ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('fingerprints_sheet')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'fingerprints_sheet' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಎಡಗೈ 10 ಬೆರಳುಗಳ ಗುರುತು ಪಟ್ಟಿ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('retirement_advance_form')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'retirement_advance_form' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ನಿವೃತ್ತಿ ಪೂರ್ವ 1 ವರ್ಷದ ವಿವರ (Bio-data & 1/3 CVP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('non_qualifying_service')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'non_qualifying_service' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ವಿಭಾಗ-III & IV ಅನರ್ಹತಾ ಸೇವೆ & ಪರಿಶೋಧನೆ
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('commutation_order')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'commutation_order' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಪರಿವರ್ತನೆ ಆದೇಶ (CVP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('ag_forwarding')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-stone-800 cursor-pointer ${
                      selectedFormat === 'ag_forwarding' ? 'bg-amber-400 text-stone-950 shadow-[2px_2px_0px_#000]' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    ಮಹಾಲೆಕ್ಕಪಾಲರಿಗೆ ರವಾನೆ ಪತ್ರ (AG)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview Card with A4 Paper Container (NO QR Code as per strict instruction) */}
          <div className="bg-stone-200/80 p-4 sm:p-8 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-x-auto">
            <div className="max-w-[820px] mx-auto bg-white shadow-2xl rounded-sm p-4 sm:p-8 border border-stone-400 relative">
              {/* Rendered HTML */}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderPensionFormatHtml(selectedFormat, selectedCase, DEFAULT_PENSION_OFFICE_CONFIG) 
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PHYSICAL DOCUMENTS CHECKLIST & MOVEMENT HISTORY                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'checklist' && selectedCase && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Statutory 8 Documents Checklist */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-kannada">
                  ಭೌತಿಕ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ (Physical Documents Checklist)
                </h3>
                <p className="text-xs text-stone-500 font-kannada">
                  ಪ್ರಕರಣ: <strong>{selectedCase.employeeName}</strong> | ಕಡತ: <strong>{selectedCase.fileNumber}</strong>
                </p>
              </div>
              <span className="bg-amber-100 text-stone-900 font-bold px-2 py-0.5 rounded border border-stone-800 text-xs font-mono-code">
                {Object.values(selectedCase.checklist).filter(Boolean).length} / 8 ಪೂರ್ಣ
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'serviceBookVerified' as const, label: '1. ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ (Service Book - Volume I & II)', desc: 'ಎಲ್ಲಾ ವೇತನ ಬಡ್ತಿ ಮತ್ತು ಸೇವಾ ದೃಢೀಕರಣ ನಮೂದುಗಳು ಸಹಿ ಆಗಿರಬೇಕು.' },
                { key: 'form7Triplicate' as const, label: '2. ಪ್ರಪತ್ರ-7 (Form 7 - 3 ಪ್ರತಿಗಳಲ್ಲಿ)', desc: 'ನೇಮಕಾತಿ ಪ್ರಾಧಿಕಾರದ ಸಹಿ ಮತ್ತು ಕಚೇರಿ ಅಧಿಕೃತ ಮೊಹರು ಹೊಂದಿರಬೇಕು.' },
                { key: 'jointPhotosAttested' as const, label: '3. ಜಂಟಿ ಭಾವಚಿತ್ರಗಳು (Joint Photos - 4 ಪ್ರತಿಗಳು)', desc: 'ಗೆಜೆಟೆಡ್ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಭಾವಚಿತ್ರಗಳು.' },
                { key: 'specimenSignatures' as const, label: '4. ಮಾದರಿ ಸಹಿ & ಹೆಬ್ಬೆರಳ ಗುರುತು (Specimen Signatures)', desc: 'ನಮೂನೆ-1 ಮತ್ತು ನಮೂನೆ-2 ರಂತೆ 3 ಮಾದರಿ ಸಹಿಗಳು ಹಾಗೂ ಎಡಗೈ ಹೆಬ್ಬೆರಳ ಗುರುತು.' },
                { key: 'noDueCertificate' as const, label: '5. ಬಾಕಿ ರಹಿತ ಪ್ರಮಾಣಪತ್ರ (No Dues Certificate - NDC)', desc: 'ಶಾಲೆ, ಇಲಾಖೆ ಹಾಗೂ ಸರ್ಕಾರಕ್ಕೆ ಯಾವುದೇ ಬಾಕಿ ಇಲ್ಲವೆಂದು ದೃಢೀಕರಣ.' },
                { key: 'lastPayCertificate' as const, label: '6. ಕೊನೆಯ ವೇತನ ಪ್ರಮಾಣಪತ್ರ (Last Pay Certificate - LPC)', desc: 'DDO ರವರಿಂದ ಅಧಿಕೃತವಾಗಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಕೊನೆಯ ತಿಂಗಳ ವೇತನ ಪ್ರಮಾಣಪತ್ರ.' },
                { key: 'form1And2Nomination' as const, label: '7. ಪಿಂಚಣಿ ಅರ್ಜಿ & ನಾಮನಿರ್ದೇಶನ ಪತ್ರ (Form 1 & 2)', desc: 'ನೌಕರರ ಪೂರ್ಣ ವಿವರಗಳು ಮತ್ತು ಕುಟುಂಬ ಸದಸ್ಯರ ನಾಮನಿರ್ದೇಶನ ವಿವರಗಳು.' },
                { key: 'aadharBankPassbook' as const, label: '8. ಆಧಾರ್ ಕಾರ್ಡ್ & ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ಪ್ರತಿ', desc: 'ಪಿಂಚಣಿ ಜಮೆ ಮಾಡುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ & IFSC ವಿವರಗಳ ದೃಢೀಕೃತ ಪ್ರತಿ.' },
              ].map(item => {
                const isChecked = selectedCase.checklist[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleChecklist(selectedCase.id, item.key)}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked 
                        ? 'bg-emerald-50 border-emerald-700 text-emerald-950' 
                        : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-stone-400 bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs font-kannada">{item.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: File Movement Tracking History */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] space-y-4">
            <div className="pb-3 border-b-2 border-stone-800">
              <h3 className="font-bold text-base text-stone-900 font-kannada">
                ಕಡತ ಚಲನವಲನ ಇತಿಹಾಸ (File Movement & Audit Trail)
              </h3>
              <p className="text-xs text-stone-500 font-kannada">
                ಕಡತ ಸಂ: <strong>{selectedCase.fileNumber}</strong> | BEO ಕಾರ್ಯಾಲಯ ಭದ್ರಾವತಿ
              </p>
            </div>

            <div className="space-y-3">
              {selectedCase.movementHistory.map((mov, idx) => (
                <div key={mov.id} className="relative pl-6 pb-2 border-l-2 border-amber-500 text-xs">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
                  <div className="font-bold text-stone-900">{mov.sentDate}</div>
                  <div className="text-stone-600 mt-0.5">
                    <strong>{mov.fromOfficer}</strong> ➔ <strong>{mov.toOfficer}</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded border border-stone-200 mt-1 text-[11px] text-stone-700">
                    {mov.remarks}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Movement Add */}
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-300 text-xs space-y-2">
              <div className="font-bold text-stone-800">ಹೊಸ ಚಲನವಲನ ನಮೂದು (Forward File):</div>
              <input
                type="text"
                id="inp-mov-to"
                placeholder="ಸ್ವೀಕರಿಸುವ ಅಧಿಕಾರಿ (ಉದಾ: AAO / BEO / ಮಹಾಲೆಕ್ಕಪಾಲರು)"
                className="w-full p-2 border border-stone-300 rounded text-xs"
              />
              <textarea
                id="inp-mov-rem"
                placeholder="ಷರಾ / ಟಿಪ್ಪಣಿ ನಮೂದಿಸಿ..."
                className="w-full p-2 border border-stone-300 rounded text-xs resize-none"
                rows={2}
              />
              <button
                type="button"
                onClick={() => {
                  const toInput = (document.getElementById('inp-mov-to') as HTMLInputElement)?.value;
                  const remInput = (document.getElementById('inp-mov-rem') as HTMLTextAreaElement)?.value;
                  if (!toInput) {
                    showToast('ದಯವಿಟ್ಟು ಅಧಿಕಾರಿಯ ಹುದ್ದೆ ನಮೂದಿಸಿ.');
                    return;
                  }
                  const now = new Date().toISOString().split('T')[0];
                  const newMov = {
                    id: `mov-${Date.now()}`,
                    fromOfficer: currentUser?.displayName || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
                    toOfficer: toInput,
                    sentDate: now,
                    remarks: remInput || 'ಕಡತವನ್ನು ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ.',
                    statusAfterMove: selectedCase.status
                  };
                  setPensionCases(prev => prev.map(c => {
                    if (c.id === selectedCase.id) {
                      const updated = {
                        ...c,
                        movementHistory: [...c.movementHistory, newMov],
                        lastUpdated: now
                      };
                      setSelectedCase(updated);
                      return updated;
                    }
                    return c;
                  }));
                  (document.getElementById('inp-mov-to') as HTMLInputElement).value = '';
                  (document.getElementById('inp-mov-rem') as HTMLTextAreaElement).value = '';
                  showToast('ಕಡತ ಚಲನವಲನ ನಮೂದಿಸಲಾಗಿದೆ.');
                }}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded text-xs transition-all border border-stone-800 cursor-pointer"
              >
                ಕಡತ ರವಾನೆ ದಾಖಲಿಸಿ (Record Movement)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: ಭೌತಿಕ ಕಡತ ಅಂಟಿಸುವ ಅಧಿಕೃತ ಲೇಬಲ್‌ಗಳು (NO QR CODE!)                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'labels' && selectedCase && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900 font-kannada">
                ಭೌತಿಕ ಕಡತ ಅಂಟಿಸುವ ಲೇಬಲ್‌ಗಳು (Printable Adhesive Labels for Physical Files)
              </h3>
              <p className="text-xs text-stone-500 font-kannada">
                ಭೌತಿಕ ಕಡತಗಳಿಗೆ ಅಂಟಿಸಲು ಅಧಿಕೃತ ಮುದ್ರಿಕೆ ಸಹಿತ ಲೇಬಲ್ - ಕಚೇರಿ ಕಡತಗಳ ಭಂಡಾರ ಮತ್ತು ರ್ಯಾಕ್ ನಿರ್ವಹಣೆಗೆ
              </p>
            </div>
            <button
              onClick={handlePrintDocument}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-lg transition-all border-2 border-stone-800 shadow-[2px_2px_0px_#000] flex items-center gap-2 cursor-pointer text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>ಲೇಬಲ್‌ಗಳನ್ನು ಮುದ್ರಿಸಿ (Print Labels)</span>
            </button>
          </div>

          {/* Printable Labels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label 1: Main Front Cover Label (No QR Code) */}
            <div className="bg-white border-2 border-dashed border-stone-800 rounded-lg p-5 shadow-sm space-y-3 relative">
              <div className="text-center pb-2 border-b-2 border-stone-800">
                <div className="font-bold text-xs tracking-wide">ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</div>
                <div className="font-bold text-sm text-stone-950 font-kannada">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</div>
                <div className="font-bold text-xs bg-amber-400 text-stone-950 inline-block px-3 py-0.5 rounded mt-1">
                  ಪಿಂಚಣಿ ಮತ್ತು ನಿವೃತ್ತಿ ಕಡತ (PENSION DOCKET)
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1.5 text-xs">
                  <div><strong>ಕಡತ ಸಂಖ್ಯೆ:</strong> <span className="font-mono-code font-bold text-base bg-stone-100 px-2 py-0.5 rounded border border-stone-400">{selectedCase.fileNumber}</span></div>
                  <div><strong>ಪ್ರಕರಣ ಸಂಖ್ಯೆ:</strong> <span className="font-mono-code font-bold">{selectedCase.caseNumber}</span></div>
                  <div><strong>ನೌಕರರ ಹೆಸರು:</strong> <span className="font-bold font-kannada text-sm text-stone-900">{selectedCase.employeeName}</span></div>
                  <div><strong>KGID ಸಂಖ್ಯೆ:</strong> <span className="font-mono-code font-bold">{selectedCase.kgidNumber}</span></div>
                  <div><strong>ಹುದ್ದೆ:</strong> {selectedCase.designation}</div>
                  <div><strong>ಶಾಲೆ / ಕಚೇರಿ:</strong> {selectedCase.officeOrSchool}</div>
                  <div><strong>ನಿವೃತ್ತಿ ದಿನಾಂಕ:</strong> <span className="font-bold text-rose-800 font-mono-code">{selectedCase.dor}</span></div>
                  <div><strong>ಶಾಖೆ:</strong> ಆ2 (ಸ.ಪ್ರಾ.ಶಿ)</div>
                </div>

                {/* Official Government Seal & Office Dispatch Docket Badge (NO QR) */}
                <div className="shrink-0 text-center border-2 border-stone-800 p-2.5 rounded bg-stone-50 min-w-[100px]">
                  <div className="font-bold text-xs font-mono-code text-stone-900">BEO OFFICE</div>
                  <div className="font-mono-code text-[11px] text-amber-800 font-bold mt-1">BHADRAVATHI</div>
                  <div className="text-[9px] font-bold text-stone-600 border-t border-stone-300 pt-1 mt-1">DAK VERIFIED</div>
                  <div className="text-[8px] bg-stone-900 text-amber-300 px-1 py-0.5 rounded font-mono-code mt-1 font-bold">ಆ2 ಶಾಖೆ</div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-300 text-[10px] text-stone-600 flex justify-between">
                <span>ರಕ್ಷಣಾ ವರ್ಗ: ಶಾಶ್ವತ ಕಡತ (Class A)</span>
                <span>ದಾಖಲಿಸಿದ ದಿನಾಂಕ: {selectedCase.createdAt}</span>
              </div>
            </div>

            {/* Label 2: File Spine / Side Strip Label (No QR Code) */}
            <div className="bg-white border-2 border-dashed border-stone-800 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="text-center pb-2 border-b-2 border-stone-800">
                <div className="font-bold text-xs">ಕಡತ ಪಟ್ಟಿಕೆ ಲೇಬಲ್ (FILE SPINE LABEL)</div>
                <div className="text-xs text-stone-600">ಕಡತಗಳ ರ್ಯಾಕ್‌ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಗುರುತಿಸಲು</div>
              </div>

              <div className="bg-amber-100/60 p-3 rounded border border-amber-300 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold font-mono-code text-stone-950">ಕಡತ: {selectedCase.fileNumber}</div>
                  <div className="font-bold font-kannada text-sm text-stone-900 mt-1">{selectedCase.employeeName}</div>
                  <div className="text-xs font-mono-code text-stone-700">KGID: {selectedCase.kgidNumber} • DOR: {selectedCase.dor}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-stone-900 text-amber-300 px-2 py-1 rounded text-xs font-mono-code font-bold border border-stone-700">
                    BEO/BHD/PEN
                  </span>
                  <div className="text-[10px] font-mono-code text-stone-700 mt-1 font-bold">ಆ2/ಸ.ಪ್ರಾ.ಶಿ</div>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 text-center italic">
                ಕಡತಗಳ ಭಂಡಾರ (Record Room) • ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ ಭದ್ರಾವತಿ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ATTACH WORKSHEET MODAL                                                    */}
      {/* ========================================================================= */}
      {showAddWorksheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[6px_6px_0px_#000] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm font-kannada">ಸೇವಾ / ವೇತನ ವರ್ಕ್‌ಶೀಟ್ ಲಗತ್ತಿಸಿ (Attach Worksheet)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWorksheetModal(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newWorksheetData.name) {
                  showToast('ದಯವಿಟ್ಟು ವರ್ಕ್‌ಶೀಟ್ ಹೆಸರು ನಮೂದಿಸಿ.');
                  return;
                }
                const newWs: PensionAttachedWorksheet = {
                  id: `ws-${Date.now()}`,
                  name: newWorksheetData.name,
                  worksheetType: newWorksheetData.worksheetType,
                  fileName: newWorksheetData.fileName || `${newWorksheetData.name.replace(/\s+/g, '_')}.pdf`,
                  fileSize: newWorksheetData.fileSize || '1.2 MB',
                  uploadedAt: new Date().toISOString().split('T')[0],
                  verified: true,
                  verifiedBy: currentUser?.displayName || 'Case Worker',
                  notes: newWorksheetData.notes
                };
                setFormData(prev => ({
                  ...prev,
                  attachedWorksheets: [...(prev.attachedWorksheets || []), newWs]
                }));
                showToast(`ವರ್ಕ್‌ಶೀಟ್ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ: ${newWorksheetData.name}`);
                setShowAddWorksheetModal(false);
                setNewWorksheetData({
                  name: '',
                  worksheetType: 'service_worksheet',
                  fileName: '',
                  fileSize: '1.2 MB',
                  notes: ''
                });
              }}
              className="p-5 space-y-3.5 text-xs font-kannada"
            >
              <div>
                <label className="block text-stone-700 font-bold mb-1">ವರ್ಕ್‌ಶೀಟ್ ಹೆಸರು (Worksheet Title)*</label>
                <input
                  type="text"
                  required
                  value={newWorksheetData.name}
                  onChange={e => setNewWorksheetData({ ...newWorksheetData, name: e.target.value })}
                  placeholder="ಉದಾ: ಸೇವಾ ವಿವರ ಪರಿಶೋಧನಾ ವರ್ಕ್‌ಶೀಟ್"
                  className="w-full p-2 border border-stone-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ವರ್ಕ್‌ಶೀಟ್ ವಿಧ (Worksheet Category)*</label>
                <select
                  value={newWorksheetData.worksheetType}
                  onChange={e => setNewWorksheetData({ ...newWorksheetData, worksheetType: e.target.value as any })}
                  className="w-full p-2 border border-stone-300 rounded bg-white font-medium"
                >
                  <option value="service_worksheet">ಸೇವಾ ಪರಿಶೋಧನಾ ವರ್ಕ್‌ಶೀಟ್ (Service History Worksheet)</option>
                  <option value="pay_worksheet">ವೇತನ ಬಾಕಿ & ಕೊನೆಯ ವೇತನ ವರ್ಕ್‌ಶೀಟ್ (Pay / LPC Worksheet)</option>
                  <option value="leave_account">ಗಳಿಕೆ ರಜೆ ಹಾಗೂ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ (Leave Worksheet)</option>
                  <option value="service_book_extract">ಸೇವಾ ಪುಸ್ತಕ ಸಾರಾಂಶ (Service Book Extract)</option>
                  <option value="other">ಇತರ ಅನುಬಂಧ ದಾಖಲೆ (Other Annexure)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ಕಡತದ ಹೆಸರು (File Name / PDF)</label>
                <input
                  type="text"
                  value={newWorksheetData.fileName}
                  onChange={e => setNewWorksheetData({ ...newWorksheetData, fileName: e.target.value })}
                  placeholder="ಉದಾ: Service_Verification_Sheet.pdf"
                  className="w-full p-2 border border-stone-300 rounded font-mono-code"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">ಷರಾ / ಪರಿಶೀಲನೆ ಟಿಪ್ಪಣಿ (Notes)</label>
                <textarea
                  rows={2}
                  value={newWorksheetData.notes}
                  onChange={e => setNewWorksheetData({ ...newWorksheetData, notes: e.target.value })}
                  placeholder="ಕಛೇರಿ ಪರಿಶೀಲನೆ ವಿವರ..."
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorksheetModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  ರದ್ದು (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ಲಗತ್ತಿಸಿ (Attach)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ESTIMATE PRINT SLIP MODAL                                                 */}
      {/* ========================================================================= */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[6px_6px_0px_#000] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm font-kannada">ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ಅಂದಾಜು ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ (Print Slip Preview)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>ಮುದ್ರಿಸಿ (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-lg cursor-pointer"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-stone-100 flex-1">
              <div 
                className="bg-white shadow-lg p-4 rounded border border-stone-300"
                dangerouslySetInnerHTML={{
                  __html: generatePensionEstimateSlipHtml(
                    quickEstimateResult,
                    {
                      name: calcEmployeeName,
                      designation: calcDesignation,
                      kgidNumber: calcKgid
                    },
                    DEFAULT_PENSION_OFFICE_CONFIG
                  )
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
