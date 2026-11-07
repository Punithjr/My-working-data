import { jsPDF } from 'jspdf';
import { OrderFile } from '../types';

export interface GovernmentOrderData {
  orderNumber: string;
  orderDate: string;
  effectiveDate?: string;
  department?: string;
  section?: string;
  orderType: string;
  subject: string;
  preamble?: string;
  orderContent?: string;
  beneficiaryName?: string;
  kgidNumber?: string;
  designation?: string;
  institution?: string;
  oldBasicPay?: number;
  newBasicPay?: number;
  financialAmount?: number;
  sanctionHead?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  copiesTo?: string[];
  status?: string;
}

/**
 * Generates and downloads an executive, structured Karnataka Government Order PDF.
 */
export function generateGovernmentOrderPdf(
  order: GovernmentOrderData | OrderFile,
  customSignatory?: { name: string; designation: string }
): void {
  if (!order) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const generatedAt = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  const orderNo = 'orderNumber' in order ? order.orderNumber : (order as any).fileId || 'ED/GO/2026/01';
  const orderDate = order.orderDate || new Date().toISOString().split('T')[0];
  const effectiveDate = order.effectiveDate || orderDate;
  const employeeName = 'employeeName' in order ? order.employeeName : (order as any).beneficiaryName || 'All Concerned Staff';
  const kgid = 'kgidNumber' in order ? order.kgidNumber : '';
  const orderType = order.orderType || 'ಸರ್ಕಾರಿ ಆದೇಶ (Government Order)';
  const oldPay = 'oldBasicPay' in order ? order.oldBasicPay : 0;
  const newPay = 'newBasicPay' in order ? order.newBasicPay : 0;

  // --- HEADER: Government of Karnataka Official Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GOVERNMENT OF KARNATAKA', pageWidth / 2, 7.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('DEPARTMENT OF SCHOOL EDUCATION AND LITERACY', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('OFFICE OF THE BLOCK EDUCATION OFFICER, BHADRAVATHI TALUK, SHIVAMOGGA DISTRICT', pageWidth / 2, 19.5, { align: 'center' });
  doc.text('Official Government Proceedings & Statutory Orders Gazette Archive', pageWidth / 2, 24.5, { align: 'center' });

  let y = 35;

  // --- ORDER NUMBER & DATE BOX ---
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`GOVERNMENT ORDER NO: ${orderNo}`, margin + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`DATE: ${orderDate}`, margin + 115, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(`EFFECTIVE: ${effectiveDate}`, pageWidth - margin - 4, y + 8, { align: 'right' });

  y += 18;

  // --- ORDER CLASSIFICATION & CADRE STRIP ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const categoryStr = `CATEGORY: ${orderType.toUpperCase()}`;
  const sectionStr = `SECTION: ${(order as any).section || 'ಆ2 - ಸ.ಪ್ರಾ.ಶಿ'}`;
  const kgidStr = kgid ? `KGID: ${kgid}` : '';
  doc.text(`${categoryStr}   |   ${sectionStr}   ${kgidStr ? `|   ${kgidStr}` : ''}`, margin, y);

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- PREAMBLE (ಪ್ರಸ್ತಾವನೆ) ---
  const preambleHeader = 'PREAMBLE / ಪ್ರಸ್ತಾವನೆ:';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(preambleHeader, margin, y);
  y += 4.5;

  const defaultPreamble = `In reference to the statutory service records, performance appraisal, and continuous satisfactory service of ${employeeName} ${kgid ? `(KGID: ${kgid})` : ''}, the proposal has been scrutinized under the relevant Karnataka Civil Services Rules (KCSRs) and Karnataka Educational Department Service Regulations. The competent administrative authority has examined the case and satisfied all required statutory prerequisites.`;
  const rawPreamble = (order as any).preamble || defaultPreamble;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const preambleLines = doc.splitTextToSize(rawPreamble, contentWidth);
  doc.text(preambleLines, margin, y);
  y += preambleLines.length * 4.5 + 5;

  // --- OPERATIVE GOVERNMENT ORDER (ಸರ್ಕಾರಿ ಆದೇಶ) ---
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('GOVERNMENT ORDER / ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ:', margin + 4, y + 5.5);
  y += 12;

  const defaultOrderContent = `Sanction is hereby accorded under Government Order provisions and KCSR Rule 118 / 6th-7th State Pay Commission guidelines to regulate the service entitlement and benefits of ${employeeName} ${kgid ? `(KGID No: ${kgid})` : ''} as specified below with effect from ${effectiveDate}.`;
  const rawContent = (order as any).orderContent || defaultOrderContent;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const contentLines = doc.splitTextToSize(rawContent, contentWidth);
  doc.text(contentLines, margin, y);
  y += contentLines.length * 4.5 + 6;

  // --- FINANCIAL / SALARY REVISION DETAILS TABLE ---
  if (oldPay > 0 || newPay > 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('FINANCIAL IMPLICATION & BASIC PAY REVISION (ವೇತನ ಶ್ರೇಣಿ ವಿವರ)', margin + 3, y + 4.2);

    const diff = newPay - oldPay;
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Existing Basic Pay (ಹಳೆಯ ಮೂಲ ವೇತನ): Rs. ${oldPay.toLocaleString('en-IN')}/-`, margin + 4, y + 11);
    doc.setTextColor(22, 101, 52); // green-700
    doc.setFont('helvetica', 'bold');
    doc.text(`Revised Basic Pay (ನೂತನ ಮೂಲ ವೇತನ): Rs. ${newPay.toLocaleString('en-IN')}/-`, margin + 4, y + 17);

    doc.setTextColor(15, 23, 42);
    doc.text(`Monthly Difference: +Rs. ${diff.toLocaleString('en-IN')}/-`, margin + 105, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Chargeable Budget Head: 2202-01-101-0-01`, margin + 105, y + 17);

    y += 26;
  }

  // --- STATUTORY CONDITIONS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & REGULATORY CONDITIONS / ಷರತ್ತುಗಳು:', margin, y);
  y += 4.5;

  const conditions = [
    '1. The pay fixation / leave sanction is subject to final verification and audit review by the State Audit Department.',
    '2. Any excess payment made due to inadvertent calculation error shall be recoverable from future emoluments without further notice.',
    '3. This order must be entered in the Physical and HRMS Service Book of the employee with due endorsement of the Drawing & Disbursing Officer (DDO).',
    '4. The order conforms to Government of Karnataka Financial Department guidelines and prevailing circular instructions.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  for (const cond of conditions) {
    doc.text(cond, margin, y);
    y += 4;
  }

  y += 4;

  // --- SIGNATORY & ENDORSEMENT SECTION ---
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Signatory Box
  const sigBoxWidth = 80;
  const sigX = pageWidth - margin - sigBoxWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sigX, y, sigBoxWidth, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text('✓ DIGITALLY SIGNED STATUTORY ORDER', sigX + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const signer = customSignatory || {
    name: (order as any).signatoryName || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
    designation: (order as any).signatoryDesignation || 'Block Education Officer, Bhadravathi'
  };
  doc.text(signer.name, sigX + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(signer.designation, sigX + 4, y + 15);
  doc.text('Department of School Education & Literacy', sigX + 4, y + 19.5);

  // Distribution List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('COPIES FORWARDED FOR FAVOR OF INFORMATION AND ACTION:', margin, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`1. ${employeeName} ${kgid ? `(KGID: ${kgid})` : ''} - for information.`, margin, y + 10);
  doc.text('2. The Drawing and Disbursing Officer (DDO) / Headmaster concerned.', margin, y + 14.5);
  doc.text('3. The Deputy Director of Public Instruction (Admin), Shivamogga.', margin, y + 19);
  doc.text('4. HRMS Section & Office Gazette Order Register.', margin, y + 23.5);

  y += 32;

  // --- FOOTER ---
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Karnataka State Official Gazette & Orders Archive • Auth Code: KGO-${orderNo.replace(/[^a-zA-Z0-9]/g, '')}`, margin, pageHeight - 5);
  doc.text(`Generated: ${generatedAt} • Page 1 of 1`, pageWidth - margin, pageHeight - 5, { align: 'right' });

  // Download Order PDF
  const safeFilename = `Govt_Order_${orderNo.replace(/[/\\?%*:|"<>]/g, '_')}_${orderDate}.pdf`;
  doc.save(safeFilename);
}
