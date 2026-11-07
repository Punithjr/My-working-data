import * as XLSX from 'xlsx';
import { Employee } from '../types';

// Karnataka State Civil Services Master Pay Stages (7th State Pay Commission)
export const KARNATAKA_MASTER_PAY_STAGES = [
  17000, 17400, 17800, 18200, 18600, 19000, 19400, 19900, 20400, 20900,
  21400, 21900, 22400, 23000, 23600, 24200, 24800, 25400, 26000, 26700,
  27400, 28100, 28800, 29600, 30400, 31200, 32000, 32900, 33800, 34700,
  35600, 36600, 37600, 38600, 39700, 40800, 41900, 43100, 44300, 45500,
  46800, 48100, 49400, 50800, 52200, 53600, 55100, 56600, 58100, 59700,
  61300, 62900, 64600, 66300, 68000, 69800, 71600, 73400, 75300, 77200,
  79100, 81100, 83100, 85100, 87200, 89300, 91400, 93600, 95800, 98000,
  100300, 102600, 104900, 107300, 109700, 112100, 114600, 117100, 119600,
  122200, 124800, 127400, 130100, 132800, 135500, 138300, 141100, 143900,
  146800, 149700, 150500, 152600, 155600, 158600, 161600, 164600
];

// Helper: Calculate next pay stage for an employee
export function getNextPayStage(currentPay: number): { nextPay: number; incrementAmt: number } {
  const sorted = [...KARNATAKA_MASTER_PAY_STAGES].sort((a, b) => a - b);
  const cur = currentPay || 49050;
  let currentIndex = sorted.findIndex(p => p >= cur);

  if (currentIndex === -1) {
    // Above matrix max or undefined, standard 3% increment
    const inc = Math.round(cur * 0.03);
    return { nextPay: cur + inc, incrementAmt: inc };
  }

  // Next stage in matrix
  const targetIndex = Math.min(sorted.length - 1, currentIndex + 1);
  const nextPay = sorted[targetIndex];
  const incrementAmt = Math.max(0, nextPay - cur);

  return {
    nextPay: incrementAmt > 0 ? nextPay : cur + Math.round(cur * 0.03),
    incrementAmt: incrementAmt > 0 ? incrementAmt : Math.round(cur * 0.03),
  };
}

export interface Prapathra28EmployeeRow {
  slNo: number;
  id: string;
  fullName: string;
  kgidNumber: string;
  designation: string;
  placeOfWork: string;
  payScale: string;
  presentBasicPay: number;
  incrementRate: number;
  newBasicPay: number;
  effectiveDate: string; // e.g. 01-01-2026 or 01-07-2026
  qualifyingPeriod: string; // e.g. 01-01-2025 ರಿಂದ 31-12-2025
  nonQualifyingAbsence: string; // e.g. 'ನಿಲ್ (Nil)'
  nextIncrementDate: string; // e.g. 01-01-2027 or 01-07-2027
  remarks: string;
  selected: boolean;
}

// Maintain standard English digits (0-9) as requested across the website
export function toKannadaDigits(num: number | string): string {
  return String(num);
}

// Build Prapathra 28 rows from a list of employees for a selected cycle (January or July)
export function preparePrapathra28Data(
  employees: Employee[],
  month: 'January' | 'July',
  year: number = new Date().getFullYear()
): Prapathra28EmployeeRow[] {
  const effectiveDay = month === 'January' ? `01-01-${year}` : `01-07-${year}`;
  const nextYearDay = month === 'January' ? `01-01-${year + 1}` : `01-07-${year + 1}`;
  
  const fromYear = month === 'January' ? year - 1 : year - 1;
  const toYear = month === 'January' ? year - 1 : year;
  const periodText = month === 'January'
    ? `01-01-${fromYear} ರಿಂದ 31-12-${toYear}`
    : `01-07-${fromYear} ರಿಂದ 30-06-${year}`;

  return employees.map((emp, index) => {
    const presentBasic = emp.basicPay || 49050;
    const { nextPay, incrementAmt } = getNextPayStage(presentBasic);

    return {
      slNo: index + 1,
      id: emp.id,
      fullName: emp.fullName,
      kgidNumber: emp.kgidNumber || emp.employeeCode || `BHD-${1000 + index}`,
      designation: emp.designation || 'ಸಹ ಶಿಕ್ಷಕರು',
      placeOfWork: emp.placeOfWork || emp.officeLocation || 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಭದ್ರಾವತಿ',
      payScale: emp.payScale || '49050-92500',
      presentBasicPay: presentBasic,
      incrementRate: incrementAmt,
      newBasicPay: nextPay,
      effectiveDate: effectiveDay,
      qualifyingPeriod: periodText,
      nonQualifyingAbsence: 'ನಿಲ್ (Nil)',
      nextIncrementDate: nextYearDay,
      remarks: '1 ವರ್ಷದ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿರುತ್ತಾರೆ',
      selected: true,
    };
  });
}

// Export Form-28 to Excel (.xlsx)
export function exportPrapathra28ToExcel(
  rows: Prapathra28EmployeeRow[],
  month: 'January' | 'July',
  year: number
) {
  const monthNameKn = month === 'January' ? 'ಜನವರಿ' : 'ಜುಲೈ';
  const wb = XLSX.utils.book_new();

  const excelData = rows.map((r, i) => ({
    'ಕ್ರ.ಸಂ. (Sl No)': i + 1,
    'ನೌಕರರ ಹೆಸರು (Name)': r.fullName,
    'ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂ. (KGID No)': r.kgidNumber,
    'ಹುದ್ದೆ (Designation)': r.designation,
    'ಶಾಲೆ / ಕಛೇರಿ (Place of Work)': r.placeOfWork,
    'ವೇತನ ಶ್ರೇಣಿ (Scale of Pay)': r.payScale,
    'ಹಾಲಿ ಮೂಲ ವೇತನ ₹ (Present Basic)': r.presentBasicPay,
    'ಮಂಜೂರಾದ ಬಡ್ತಿ ದರ ₹ (Increment Rate)': r.incrementRate,
    'ಹೊಸ ಮೂಲ ವೇತನ ₹ (New Basic Pay)': r.newBasicPay,
    'ಬಡ್ತಿ ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ (Date of Increment)': r.effectiveDate,
    'ಅರ್ಹತಾ ಸೇವಾ ಅವಧಿ (Period of Service)': r.qualifyingPeriod,
    'ರಜೆ/ಅಮಾನತು ಅವಧಿ (Leave/Absence)': r.nonQualifyingAbsence,
    'ಮುಂದಿನ ಬಡ್ತಿ ದಿನಾಂಕ (Next Increment Date)': r.nextIncrementDate,
    'ಷರಾ (Remarks)': r.remarks,
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, `ಪ್ರಪತ್ರ-28_${monthNameKn}_${year}`);
  XLSX.writeFile(wb, `Prapathra_28_Form28_${month}_${year}_BEO_Bhadravathi.xlsx`);
}

// ==================== ANNUAL SALARY GRANT DEMAND TYPES & CALCULATIONS ====================
export interface SalaryGrantDemandRow {
  slNo: number;
  id: string;
  fullName: string;
  designation: string;
  kgidNumber: string;
  placeOfWork: string;
  payScale: string;
  incrementMonth: 'January' | 'July';
  currentBasicPay: number;
  stage1Pay: number;
  stage2Pay?: number;
  period1Months: number;
  period1Rate: number;
  period2Months: number;
  period2Rate: number;
  annualBasicPay: number;
  annualDa: number;
  annualHra: number;
  annualMedical: number;
  annualGrossDemand: number;
  formulaDesc: string;
}

// Prepare 12-month Financial Year Salary Grant Demand (ಮುಂದಿನ ವರ್ಷದ ವೇತನ ಅನುದಾನ ಬೇಡಿಕೆ ಅಂದಾಜು)
// Jan increment: First increment applied, then March-Dec (9 months) at stage1 + next Jan-March (3 months) at stage2
// July increment: March-June (3 months) at current basic + July-March (9 months) at July increment stage1
export function prepareSalaryGrantDemandData(
  employees: Employee[],
  daPercentage: number = 50,
  hraPercentage: number = 8
): SalaryGrantDemandRow[] {
  return employees.map((emp, idx) => {
    const incMonth: 'January' | 'July' = emp.incrementMonth === 'January' ? 'January' : 'July';
    const p0 = emp.basicPay || 37900;
    const stage1 = getNextPayStage(p0).nextPay;

    let stage2: number | undefined;
    let period1Months = 0;
    let period1Rate = 0;
    let period2Months = 0;
    let period2Rate = 0;
    let formulaDesc = '';

    if (incMonth === 'January') {
      // First increment applied to current pay -> stage1
      // March to December (9 months) at stage1
      // Next Jan to March (3 months) at stage2
      stage2 = getNextPayStage(stage1).nextPay;
      period1Months = 9;
      period1Rate = stage1;
      period2Months = 3;
      period2Rate = stage2;
      formulaDesc = `(₹${stage1.toLocaleString('en-IN')} × 9 ತಿಂಗಳು) + (₹${stage2.toLocaleString('en-IN')} × 3 ತಿಂಗಳು)`;
    } else {
      // July increment:
      // March to June (3 months) at P0 (current basic)
      // July to March (9 months) at stage1 (July increment)
      period1Months = 3;
      period1Rate = p0;
      period2Months = 9;
      period2Rate = stage1;
      formulaDesc = `(₹${p0.toLocaleString('en-IN')} × 3 ತಿಂಗಳು) + (₹${stage1.toLocaleString('en-IN')} × 9 ತಿಂಗಳು)`;
    }

    const annualBasic = (period1Rate * period1Months) + (period2Rate * period2Months);
    const annualDa = Math.round(annualBasic * (daPercentage / 100));
    const annualHra = Math.round(annualBasic * (hraPercentage / 100));
    const annualMedical = 2400; // ₹200 * 12 months
    const annualGross = annualBasic + annualDa + annualHra + annualMedical;

    return {
      slNo: idx + 1,
      id: emp.id,
      fullName: emp.fullName,
      designation: emp.designation,
      kgidNumber: emp.kgidNumber || emp.employeeCode || `BHD-${1000 + idx}`,
      placeOfWork: emp.placeOfWork || emp.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
      payScale: emp.payScale || '37900-70850',
      incrementMonth: incMonth,
      currentBasicPay: p0,
      stage1Pay: stage1,
      stage2Pay: stage2,
      period1Months,
      period1Rate,
      period2Months,
      period2Rate,
      annualBasicPay: annualBasic,
      annualDa,
      annualHra,
      annualMedical,
      annualGrossDemand: annualGross,
      formulaDesc
    };
  });
}

// Export Annual Salary Grant Demand to Excel (.xlsx)
export function exportGrantDemandToExcel(
  rows: SalaryGrantDemandRow[],
  financialYear: string = '2026-2027'
) {
  const wb = XLSX.utils.book_new();

  const excelData = rows.map((r, i) => ({
    'ಕ್ರ.ಸಂ. (Sl No)': i + 1,
    'ನೌಕರರ ಹೆಸರು (Name)': r.fullName,
    'ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID No)': r.kgidNumber,
    'ಹುದ್ದೆ (Designation)': r.designation,
    'ಶಾಲೆ / ಕಛೇರಿ (Office / School)': r.placeOfWork,
    'ವೇತನ ಶ್ರೇಣಿ (Pay Scale)': r.payScale,
    'ಬಡ್ತಿ ತಿಂಗಳು (Increment Month)': r.incrementMonth === 'January' ? 'ಜನವರಿ (Jan)' : 'ಜುಲೈ (July)',
    'ಹಾಲಿ ಮೂಲ ವೇತನ ₹': r.currentBasicPay,
    'ಮೊದಲ ಬಡ್ತಿ ವೇತನ ₹': r.stage1Pay,
    'ಮುಂದಿನ ಜನವರಿ ಬಡ್ತಿ ವೇತನ ₹': r.stage2Pay || '—',
    '12 ತಿಂಗಳ ಲೆಕ್ಕಾಚಾರ ಸೂತ್ರ': r.formulaDesc,
    'ವಾರ್ಷಿಕ ಮೂಲ ವೇತನ ಬೇಡಿಕೆ ₹ (Basic)': r.annualBasicPay,
    'ವಾರ್ಷಿಕ ತುಟ್ಟಿಭತ್ಯೆ ₹ (DA)': r.annualDa,
    'ವಾರ್ಷಿಕ ಮನೆ ಬಾಡಿಗೆ ಭತ್ಯೆ ₹ (HRA)': r.annualHra,
    'ವಾರ್ಷಿಕ ವೈದ್ಯಕೀಯ ಭತ್ಯೆ ₹ (Med)': r.annualMedical,
    'ಒಟ್ಟು ವಾರ್ಷಿಕ ಅನುದಾನ ಬೇಡಿಕೆ ₹ (Gross Demand)': r.annualGrossDemand
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, `ವೇತನ_ಅನುದಾನ_${financialYear}`);
  XLSX.writeFile(wb, `Salary_Grant_Demand_Budget_Estimate_${financialYear}_BEO_Bhadravathi.xlsx`);
}

// Export Annual Salary Grant Demand to CSV (.csv)
export function exportGrantDemandToCsv(
  rows: SalaryGrantDemandRow[],
  financialYear: string = '2026-2027'
) {
  const headers = [
    'ಕ್ರ.ಸಂ.',
    'ನೌಕರರ ಹೆಸರು (Name)',
    'ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID)',
    'ಹುದ್ದೆ (Designation)',
    'ಶಾಲೆ / ಕಛೇರಿ (School/Office)',
    'ವೇತನ ಶ್ರೇಣಿ (Pay Scale)',
    'ಬಡ್ತಿ ಮಾಹೆ (Increment Month)',
    'ಹಾಲಿ ಮೂಲ ವೇತನ (₹)',
    'ಮೊದಲ ಬಡ್ತಿ ವೇತನ (₹)',
    'ಮುಂದಿನ ಜನವರಿ ಬಡ್ತಿ ವೇತನ (₹)',
    '12 ತಿಂಗಳ ಲೆಕ್ಕಾಚಾರ ಸೂತ್ರ',
    'ವಾರ್ಷಿಕ ಮೂಲ ವೇತನ (₹)',
    'ವಾರ್ಷಿಕ ತುಟ್ಟಿಭತ್ಯೆ DA (₹)',
    'ವಾರ್ಷಿಕ ಮನೆ ಬಾಡಿಗೆ ಭತ್ಯೆ HRA (₹)',
    'ವಾರ್ಷಿಕ ವೈದ್ಯಕೀಯ ಭತ್ಯೆ (₹)',
    'ಒಟ್ಟು ವಾರ್ಷಿಕ ಅನುದಾನ ಬೇಡಿಕೆ (₹)'
  ];

  const csvRows = rows.map((r, i) => [
    i + 1,
    `"${r.fullName.replace(/"/g, '""')}"`,
    `"${r.kgidNumber}"`,
    `"${r.designation.replace(/"/g, '""')}"`,
    `"${r.placeOfWork.replace(/"/g, '""')}"`,
    `"${r.payScale}"`,
    r.incrementMonth === 'January' ? 'January (ಜನವರಿ)' : 'July (ಜುಲೈ)',
    r.currentBasicPay,
    r.stage1Pay,
    r.stage2Pay || 0,
    `"${r.formulaDesc.replace(/"/g, '""')}"`,
    r.annualBasicPay,
    r.annualDa,
    r.annualHra,
    r.annualMedical,
    r.annualGrossDemand
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Salary_Grant_Demand_Budget_Estimate_${financialYear}_BEO_Bhadravathi.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
