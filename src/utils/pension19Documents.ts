import * as XLSX from 'xlsx';
import { PensionCaseRecord, PensionProposalDocumentItem, OfficeConfig } from '../types';
import { formatINR, numberToKannadaWords, renderPensionFormatHtml, DEFAULT_PENSION_OFFICE_CONFIG } from './pensionCalculator';

export const STATUTORY_19_DOCUMENTS_META: Array<{ number: number; nameKannada: string; nameEnglish: string; defaultStatus?: 'available' | 'pending' | 'not_applicable' }> = [
  {
    number: 1,
    nameKannada: 'ಸರ್ಕಾರಿ ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕ (Service Book of the Government Servant)',
    nameEnglish: 'Service Book of the Government Servant',
    defaultStatus: 'available',
  },
  {
    number: 2,
    nameKannada: 'ಪಿಂಚಣಿ ರೂಪಾಂತರಿಸುವ / ರೂಪಾಂತರಿಸದಿರುವ ಘೋಷಣಾಪತ್ರ (Declaration to Commute / Not to Commute)',
    nameEnglish: 'Declaration of Pensioner to Commute / Not to Commute Pension',
    defaultStatus: 'available',
  },
  {
    number: 3,
    nameKannada: 'ರಜೆ ಲೆಕ್ಕ ಪತ್ರ - ಗಳಿಕೆ ರಜೆ ಖಾತೆ (Leave Account)',
    nameEnglish: 'Leave Account',
    defaultStatus: 'available',
  },
  {
    number: 4,
    nameKannada: 'ಸಲ್ಲಿಸಿದ ಸೇವಾ ವಿವರಣೆ ಪಟ್ಟಿ (Details of Service Rendered)',
    nameEnglish: 'Details of Service Rendered',
    defaultStatus: 'available',
  },
  {
    number: 5,
    nameKannada: 'ಗೆಜೆಟೆಡ್ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಜಂಟಿ / ಏಕ ಭಾವಚಿತ್ರಗಳು (Joint / Single Photos attested)',
    nameEnglish: 'Joint Photos / Single Photos attested by Gazetted Officer',
    defaultStatus: 'available',
  },
  {
    number: 6,
    nameKannada: 'ಗೆಜೆಟೆಡ್ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಮಾದರಿ ಸಹಿ (Specimen Signature attested)',
    nameEnglish: 'Specimen Signature attested by Gazetted Officer',
    defaultStatus: 'available',
  },
  {
    number: 7,
    nameKannada: 'ಗೆಜೆಟೆಡ್ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ವೈಯಕ್ತಿಕ ಗುರುತುಗಳು (Personal Identification Marks)',
    nameEnglish: 'Personal Identification Marks attested by Gazetted Officer',
    defaultStatus: 'available',
  },
  {
    number: 8,
    nameKannada: 'ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಯ ಡಾಟಾ ಇನ್‌ಪುಟ್ ಶೀಟ್ (Data Input Sheet - PAG Karnataka)',
    nameEnglish: 'Data Input Sheet (PAG Karnataka)',
    defaultStatus: 'available',
  },
  {
    number: 9,
    nameKannada: 'ನಿವೃತ್ತಿ ಸೌಲಭ್ಯಗಳ ಲೆಕ್ಕಾಚಾರ ಪಟ್ಟಿ (Calculation Sheet for Pensionary Benefits)',
    nameEnglish: 'Calculation Sheet for Pensionary Benefits',
    defaultStatus: 'available',
  },
  {
    number: 10,
    nameKannada: 'ಫಲಾನುಭವಿ / ಪಾಲಕರ ಗುರುತಿನ ದಾಖಲೆಗಳು (Beneficiary / Guardian Identification Documents)',
    nameEnglish: 'Beneficiary / Guardian Identification Documents',
    defaultStatus: 'available',
  },
  {
    number: 11,
    nameKannada: 'ಇಲಾಖಾ ವಿಚಾರಣೆ / ನ್ಯಾಯಾಂಗ ವಿಚಾರಣೆ ಇಲ್ಲದಿರುವ ವಿವರ (Departmental / Judicial Enquiry Details)',
    nameEnglish: 'Departmental / Judicial Enquiry Details',
    defaultStatus: 'available',
  },
  {
    number: 12,
    nameKannada: 'ಕುಟುಂಬ ಸದಸ್ಯರ ಪಟ್ಟಿ (Family Members List with DOB & Marital Status)',
    nameEnglish: 'Family Members List with Date of Birth and Marital Status',
    defaultStatus: 'available',
  },
  {
    number: 13,
    nameKannada: 'ಸರ್ಕಾರಿ ಬಾಕಿ ವಿವರಗಳು / ನಿರಾಕ್ಷೇಪಣಾ ಪ್ರಮಾಣಪತ್ರ (Outstanding Dues Details)',
    nameEnglish: 'Outstanding Dues Details',
    defaultStatus: 'available',
  },
  {
    number: 14,
    nameKannada: 'ಸರ್ಕಾರೇತರ ಬಾಕಿ ವಸೂಲಾತಿಗೆ ಒಪ್ಪಿಗೆ ಪತ್ರ (Consent for Recovery of Non-Governmental Dues)',
    nameEnglish: 'Consent for Recovery of Non-Governmental Dues',
    defaultStatus: 'available',
  },
  {
    number: 15,
    nameKannada: 'ಅನಾರೋಗ್ಯ ನಿವೃತ್ತಿಯ ವೈದ್ಯಕೀಯ ಮಂಡಳಿ ಪ್ರಮಾಣಪತ್ರ (Medical Certificate for Invalid Retirement)',
    nameEnglish: 'Medical Certificate for Invalid Retirement',
    defaultStatus: 'not_applicable',
  },
  {
    number: 16,
    nameKannada: 'ಸ್ವಯಂಪ್ರೇರಿತ / ಅನಾರೋಗ್ಯ ನಿವೃತ್ತಿಯ ಮಂಜೂರಾತಿ ಆದೇಶ (Sanction Order for Voluntary / Invalid Retirement)',
    nameEnglish: 'Sanction Order for Voluntary / Invalid Retirement',
    defaultStatus: 'not_applicable',
  },
  {
    number: 17,
    nameKannada: 'ಕರ್ತವ್ಯ ಬಿಡುಗಡೆ ಜ್ಞಾಪನ ಪತ್ರ (Relief Memo)',
    nameEnglish: 'Relief Memo',
    defaultStatus: 'available',
  },
  {
    number: 18,
    nameKannada: 'ಅಪ್ರಾಪ್ತ ವಯಸ್ಕ ಫಲಾನುಭವಿಗಳ ಜನನ ಪ್ರಮಾಣಪತ್ರ (Proof of Date of Birth of Minor Beneficiaries)',
    nameEnglish: 'Proof of Date of Birth of Minor Beneficiaries',
    defaultStatus: 'not_applicable',
  },
  {
    number: 19,
    nameKannada: 'ಪಾಲಕತ್ವ ಪ್ರಮಾಣಪತ್ರ (Guardianship Certificate)',
    nameEnglish: 'Guardianship Certificate',
    defaultStatus: 'not_applicable',
  },
];

export function getInitial19Checklist(): PensionProposalDocumentItem[] {
  return STATUTORY_19_DOCUMENTS_META.map(doc => ({
    id: `doc-${doc.number}`,
    number: doc.number,
    nameKannada: doc.nameKannada,
    nameEnglish: doc.nameEnglish,
    status: doc.defaultStatus || 'available',
    remarks: doc.defaultStatus === 'not_applicable' ? 'ಅನ್ವಯಿಸುವುದಿಲ್ಲ (N/A)' : 'ಮೂಲ ಪರಿಶೀಲಿಸಿ ಲಗತ್ತಿಸಲಾಗಿದೆ.',
  }));
}

/**
 * Generates an official HTML Document for the 19-point Checklist table
 */
export function generateChecklistDocumentHtml(
  record: PensionCaseRecord,
  office?: OfficeConfig
): string {
  const items = record.statutory19Checklist && record.statutory19Checklist.length === 19
    ? record.statutory19Checklist
    : getInitial19Checklist();

  const availableCount = items.filter(i => i.status === 'available').length;
  const pendingCount = items.filter(i => i.status === 'pending').length;
  const naCount = items.filter(i => i.status === 'not_applicable').length;

  return `
    <div style="font-family: 'Noto Sans Kannada', sans-serif; padding: 24px; color: #1c1917; line-height: 1.5;">
      <!-- Canonical BEO Header -->
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 17px; font-weight: bold;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ – 577301</p>
        <div style="margin-top: 10px; font-size: 15px; font-weight: bold; text-decoration: underline;">
          ನಿವೃತ್ತಿ ವೇತನ ಪ್ರಸ್ತಾವನೆಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ (PENSION PROPOSAL DOCUMENT CHECKLIST)
        </div>
      </div>

      <!-- Employee Details Bar -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; border: 1px solid #cbd5e1; background: #f8fafc;">
        <tr>
          <td style="padding: 6px 10px; width: 50%;"><strong>ನೌಕರರ ಹೆಸರು:</strong> ${record.employeeName}</td>
          <td style="padding: 6px 10px; width: 50%;"><strong>ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ:</strong> ${record.kgidNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>ಹುದ್ದೆ:</strong> ${record.designation}</td>
          <td style="padding: 6px 10px;"><strong>ಶಾಲೆ / ಕಚೇರಿ:</strong> ${record.officeOrSchool}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>ನಿವೃತ್ತಿ ದಿನಾಂಕ:</strong> ${record.dor}</td>
          <td style="padding: 6px 10px;"><strong>ಕಡತ ಸಂಖ್ಯೆ:</strong> ${record.fileNumber}</td>
        </tr>
      </table>

      <!-- Summary Badges -->
      <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 11px;">
        <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 4px; font-weight: bold; border: 1px solid #86efac;">
          ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳು: ${availableCount}
        </span>
        <span style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 4px; font-weight: bold; border: 1px solid #fca5a5;">
          ಬಾಕಿ ಇರುವ ದಾಖಲೆಗಳು: ${pendingCount}
        </span>
        <span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 4px; font-weight: bold; border: 1px solid #cbd5e1;">
          ಅನ್ವಯಿಸುವುದಿಲ್ಲ: ${naCount}
        </span>
      </div>

      <!-- 19 Documents Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
        <thead>
          <tr style="background: #0f172a; color: white;">
            <th style="border: 1px solid #334155; padding: 6px 8px; width: 40px; text-align: center;">ಕ್ರಮ</th>
            <th style="border: 1px solid #334155; padding: 6px 8px; text-align: left;">ದಾಖಲೆಯ ಹೆಸರು (Document Name)</th>
            <th style="border: 1px solid #334155; padding: 6px 8px; width: 110px; text-align: center;">ಸ್ಥಿತಿ (Status)</th>
            <th style="border: 1px solid #334155; padding: 6px 8px; width: 180px; text-align: left;">ಷರಾ (Remarks)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const statusLabel = item.status === 'available'
              ? '<span style="color: #166534; font-weight: bold;">✓ ಲಭ್ಯವಿದೆ</span>'
              : item.status === 'pending'
              ? '<span style="color: #b91c1c; font-weight: bold;">✗ ಬಾಕಿ ಇದೆ</span>'
              : '<span style="color: #64748b;">N/A (ಅನ್ವಯಿಸುವುದಿಲ್ಲ)</span>';

            const bg = item.status === 'pending' ? '#fff1f2' : item.number % 2 === 0 ? '#f8fafc' : '#ffffff';

            return `
              <tr style="background: ${bg};">
                <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: center; font-weight: bold;">${item.number}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px 8px;">
                  <div style="font-weight: 600; color: #0f172a;">${item.nameKannada}</div>
                  <div style="font-size: 10px; color: #64748b;">${item.nameEnglish}</div>
                  ${item.fileName ? `<div style="font-size: 9px; color: #0284c7; font-family: monospace;">ಲಗತ್ತು: ${item.fileName}</div>` : ''}
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: center;">${statusLabel}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 10px; color: #334155;">${item.remarks || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Signature Section: Strictly BEO Office Bhadravathi Taluk -->
      <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px;">
        <div>
          <p style="margin: 0;"><strong>ದಿನಾಂಕ:</strong> ${record.dor || new Date().toISOString().split('T')[0]}</p>
          <p style="margin: 4px 0 0 0;"><strong>ಸ್ಥಳ:</strong> ಭದ್ರಾವತಿ</p>
          <p style="margin: 8px 0 0 0; font-size: 10px; color: #64748b;">ಕಡತ ನಿರ್ವಹಣೆ: ವಿಷಯ ನಿರ್ವಾಹಕರು (ಆಂತರಿಕ ದಾಖಲೆ)</p>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <p style="margin: 0 0 45px 0;">ತಮ್ಮ ನಂಬುಗೆಯ,</p>
          <p style="margin: 0; font-weight: bold; font-size: 13px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Export a single or multiple Pension Cases to Excel
 */
export function exportPensionCasesToExcel(cases: PensionCaseRecord[], fileName = 'BEO_Bhadravathi_Pension_Cases.xlsx'): void {
  const rows = cases.map((c, idx) => ({
    'ಕ್ರಮ ಸಂಖ್ಯೆ (Sl No)': idx + 1,
    'ಕಡತ ಸಂಖ್ಯೆ (File No)': c.fileNumber,
    'ನೌಕರರ ಹೆಸರು (Name)': c.employeeName,
    'ಕೆ.ಜಿ.ಐ.ಡಿ (KGID)': c.kgidNumber,
    'ಹುದ್ದೆ (Designation)': c.designation,
    'ಶಾಲೆ / ಕಚೇರಿ (Office / School)': c.officeOrSchool,
    'ಜನನ ದಿನಾಂಕ (DOB)': c.dob,
    'ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOA)': c.doa,
    'ನಿವೃತ್ತಿ ದಿನಾಂಕ (DOR)': c.dor,
    'ಅರ್ಹತಾ ಸೇವೆ (Qualifying Service)': (c as any).qualifyingServiceYears || (c.calculation ? `${c.calculation.netQualifyingYears} ವರ್ಷ` : '-'),
    'ಕೊನೆಯ ಮೂಲ ವೇತನ (Basic Pay)': c.lastBasicPay,
    'ಅರ್ಹ ಪಿಂಚಣಿ (Pension)': c.calculation?.basicServicePension || c.calculation?.fullPension || 0,
    'ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG Gratuity)': c.calculation?.dcrgSanctioned || 0,
    'ರೂಪಾಂತರಿತ ಪಿಂಚಣಿ (Commutation)': c.calculation?.commutationLumpSum || 0,
    'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (Leave Encashment)': c.calculation?.leaveEncashmentAmount || 0,
    'ಒಟ್ಟು ಅಂತಿಮ ಮೊತ್ತ (Total Terminal Lump Sum)': c.calculation?.totalTerminalLumpSum || 0,
    'ಕುಟುಂಬ ಪಿಂಚಣಿ (Family Pension)': c.calculation?.familyPensionNormal || 0,
    'ಬ್ಯಾಂಕ್ ಖಾತೆ (Bank A/c)': c.bankAccountNo,
    'ಬ್ಯಾಂಕ್ & ಶಾಖೆ (Bank & Branch)': `${c.bankName} - ${c.bankBranch}`,
    'IFSC ಕೋಡ್': c.ifscCode,
    'ಸ್ಥಿತಿ (Status)': c.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pension_Cases');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Pension Checklist to Excel
 */
export function exportChecklistToExcel(record: PensionCaseRecord): void {
  const items = record.statutory19Checklist && record.statutory19Checklist.length === 19
    ? record.statutory19Checklist
    : getInitial19Checklist();

  const rows = items.map(item => ({
    'ಕ್ರಮ ಸಂಖ್ಯೆ (No)': item.number,
    'ದಾಖಲೆಯ ವಿವರ (Kannada)': item.nameKannada,
    'Document Name (English)': item.nameEnglish,
    'ಸ್ಥಿತಿ (Status)': item.status === 'available' ? 'ಲಭ್ಯವಿದೆ (Available)' : item.status === 'pending' ? 'ಬಾಕಿ ಇದೆ (Pending)' : 'ಅನ್ವಯಿಸುವುದಿಲ್ಲ (N/A)',
    'ಷರಾ (Remarks)': item.remarks || '',
    'ಲಗತ್ತು ಫೈಲ್ (File)': item.fileName || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist_19_Docs');
  XLSX.writeFile(workbook, `Pension_Checklist_${record.kgidNumber}_${record.fileNumber.replace(/[/\\?%*:|"<>]/g, '_')}.xlsx`);
}

/**
 * Export HTML Content as MS Word (.docx) document via Blob
 */
export function exportHtmlToWordDoc(htmlContent: string, fileName: string): void {
  const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title>
  <style>
    body { font-family: 'Noto Sans Kannada', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 20mm; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
    td, th { border: 1px solid #333; padding: 5pt; font-size: 10pt; vertical-align: top; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
  </style></head><body>`;
  const footer = `</body></html>`;

  const blob = new Blob([header + htmlContent + footer], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.doc') || fileName.endsWith('.docx') ? fileName : `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a complete unified Pension Proposal Dossier containing all key statutory documents
 * separated by page breaks for single-click printing or Word/PDF export.
 */
export function generateCompletePensionDossierHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const sections = [
    { title: '1. ಮಹಾಲೆಕ್ಕಪಾಲರಿಗೆ ರವಾನೆ ಪತ್ರ (Covering Forwarding Letter to AG)', html: renderPensionFormatHtml('ag_forwarding', record, office) },
    { title: '2. 19 ಅಂಶಗಳ ಶಾಸನಬದ್ಧ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ (19-Point Statutory Document Checklist)', html: generateChecklistDocumentHtml(record, office) },
    { title: '3. ಪ್ರಪತ್ರ-7 (Form 7 - 21 ಕಾಲಂಗಳು)', html: renderPensionFormatHtml('form7', record, office) },
    { title: '4. 4 ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕಾಚಾರ ತಃಖ್ಯೆ (Comprehensive Calculation Sheet)', html: renderPensionFormatHtml('pension_calc_sheet', record, office) },
    { title: '5. ಕರ್ತವ್ಯ ಶಾಲೆಗಳ ಸೇವಾ ವಿವರಣೆ (Details of Service Rendered)', html: renderPensionFormatHtml('schools_service_history', record, office) },
    { title: '6. ಉಪದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ (DCRG Sanction Order)', html: renderPensionFormatHtml('gratuity_order', record, office) },
    { title: '7. ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಆದೇಶ (Commutation Order - CVP)', html: renderPensionFormatHtml('commutation_order', record, office) },
    { title: '8. ಗಳಿಕೆ ರಜೆ ಲೆಕ್ಕ ತಃಖ್ಯೆ & ಮಂಜೂರಾತಿ ಆದೇಶ (Leave Encashment Statement & Order)', html: renderPensionFormatHtml('earned_leave_sheet', record, office) + '<div style="margin-top:24px;"></div>' + renderPensionFormatHtml('el_office_order_kannada', record, office) },
    { title: '9. ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ & ನಾಮನಿರ್ದೇಶನ (Family Details & Nomination)', html: renderPensionFormatHtml('family_pension_nomination', record, office) },
    { title: '10. ಬಾಕಿ ರಹಿತ & ವಸೂಲಾತಿ ಒಪ್ಪಿಗೆ ಪ್ರಮಾಣಪತ್ರ (No Dues & Recovery Undertaking)', html: renderPensionFormatHtml('no_dues_cert', record, office) + '<div style="margin-top:24px;"></div>' + renderPensionFormatHtml('non_receipt_recovery', record, office) },
    { title: '11. ಮಾದರಿ ಸಹಿ, ಹೆಬ್ಬೆರಳ ಗುರುತು & ಜಂಟಿ ಭಾವಚಿತ್ರ ವಿವರ (Specimen Signature & Photos)', html: renderPensionFormatHtml('specimen_signatures_photo', record, office) },
  ];

  return `
    <div class="complete-dossier" style="font-family: 'Noto Sans Kannada', Arial, sans-serif; color: #1c1917; line-height: 1.5;">
      <!-- Title Cover Page -->
      <div style="text-align: center; padding: 40px 24px; page-break-after: always; min-height: 80vh; display: flex; flex-direction: column; justify-content: space-between; border: 4px double #1e293b; background: #fff; margin-bottom: 24px;">
        <div style="border-bottom: 3px double #000; padding-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #000;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
          <h2 style="font-size: 18px; font-weight: bold; margin: 6px 0; color: #000;">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
          <h3 style="font-size: 16px; font-weight: bold; margin: 4px 0; color: #000;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
          <p style="font-size: 13px; margin: 4px 0; color: #334155;">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ – 577301</p>
        </div>

        <div style="margin: 36px 0; border: 2px solid #000; padding: 24px; background: #fafafa; border-radius: 4px;">
          <div style="font-size: 22px; font-weight: 800; color: #0f172a; text-decoration: underline; margin-bottom: 10px;">
            ಸಮಗ್ರ ನಿವೃತ್ತಿ ವೇತನ ಪ್ರಸ್ತಾವನಾ ಸಂಪುಟ
          </div>
          <div style="font-size: 15px; font-weight: 600; color: #334155;">
            COMPREHENSIVE PENSION PROPOSAL DOSSIER
          </div>
          <div style="font-size: 12px; margin-top: 6px; color: #64748b;">
            (ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು - KCSR / PAG Karnataka ಮಾನದಂಡಗಳಂತೆ)
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; text-align: left; background: #fff; border: 1px solid #cbd5e1;">
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; width: 40%; font-weight: bold; background: #f8fafc;">ನೌಕರರ ಹೆಸರು (Employee Name):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${record.employeeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID No):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${record.kgidNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">ಹುದ್ದೆ (Designation):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${record.designation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">ಶಾಲೆ / ಕಛೇರಿ (Office / School):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${record.officeOrSchool}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">ನಿವೃತ್ತಿ ದಿನಾಂಕ (Date of Retirement):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #991b1b;">${record.dor}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc;">ಪಿಂಚಣಿ ಕಡತ ಸಂಖ್ಯೆ (File No):</td>
              <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${record.fileNumber}</td>
            </tr>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 13px;">
          <div style="text-align: left;">
            <p style="margin: 0;"><strong>ದಿನಾಂಕ:</strong> ${record.dor || new Date().toISOString().split('T')[0]}</p>
            <p style="margin: 4px 0 0 0;"><strong>ಸ್ಥಳ:</strong> ಭದ್ರಾವತಿ</p>
          </div>
          <div style="text-align: center; min-width: 220px;">
            <p style="margin: 0 0 45px 0;">ತಮ್ಮ ನಂಬುಗೆಯ,</p>
            <p style="margin: 0; font-weight: bold; font-size: 14px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</p>
          </div>
        </div>
      </div>

      <!-- Dossier Sections -->
      ${sections.map((sec, idx) => `
        <div class="dossier-section" style="${idx < sections.length - 1 ? 'page-break-after: always; margin-bottom: 28px;' : ''}">
          <div style="background: #e0f2fe; padding: 6px 10px; border-left: 4px solid #0284c7; font-size: 11px; font-weight: bold; color: #0369a1; margin-bottom: 12px;">
            ${sec.title}
          </div>
          ${sec.html}
        </div>
      `).join('')}
    </div>
  `;
}

