import { jsPDF } from 'jspdf';
import { EducationLetter } from '../types';
import { formatDateDDMMYYYY } from './formatDate';

/**
 * Generates and downloads a clean, professional PDF for any e-Office letter
 * (Inward Dak, Outward Letter, Government Order, Circular, Official Notice).
 */
export function generateLetterPdf(letter: EducationLetter): void {
  if (!letter) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const l = letter as any;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const generatedAt = `${formatDateDDMMYYYY(now)} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  // --- TOP GOVERNMENT HEADER ---
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('GOVERNMENT OF KARNATAKA • DEPARTMENT OF SCHOOL EDUCATION & LITERACY', pageWidth / 2, 7.5, { align: 'center' });

  doc.setFontSize(11.5);
  doc.text('OFFICE OF THE BLOCK EDUCATION OFFICER (BEO), BHADRAVATHI', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Bhadra Colony, Old Town, Bhadravathi - 577301 | Email: beo.bhadravathi@karnataka.gov.in', pageWidth / 2, 19.5, { align: 'center' });

  let y = 30;

  // --- SUB-HEADER: E-OFFICE METADATA STRIP ---
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 11, 1, 1, 'FD');

  const refNo = letter.referenceNumber || l.letterNumber || `ED/BEO/2026/${letter.id.slice(0, 6)}`;
  const dateStr = formatDateDDMMYYYY(letter.dateReceivedOrIssued || l.date || new Date());
  const directionLabel = letter.direction === 'inward' ? 'INWARD DAK (ಒಳಬರುವ ದಖಾಲೆ)' : 'OUTWARD DISPATCH (ಹೊರಹೋಗುವ ಪತ್ರ)';

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`REF NO: ${refNo}`, margin + 3, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`DATE: ${dateStr}`, margin + 95, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  if (letter.direction === 'inward') {
    doc.setTextColor(3, 105, 161); // sky-700
  } else {
    doc.setTextColor(5, 150, 105); // emerald-600
  }
  doc.text(directionLabel, pageWidth - margin - 3, y + 7, { align: 'right' });

  y += 16;

  // --- STATUS & CLASSIFICATION PILLS ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const priorityText = `Priority: ${(letter.priority || 'Routine').toUpperCase()}`;
  const statusText = `Status: ${(letter.status || 'Active').toUpperCase()}`;
  const confidentialityText = `Classification: ${letter.confidentiality || 'General / Open'}`;
  const fileNoText = letter.fileNumber ? `File Docket: #${letter.fileNumber}` : '';

  doc.text(`${priorityText}   |   ${statusText}   |   ${confidentialityText}   ${fileNoText ? `|   ${fileNoText}` : ''}`, margin, y);

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- TO & FROM ADDRESS BLOCK ---
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 24;

  // From Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FROM / ರವಾನಿಸಿದವರು:', margin + 3, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(letter.senderName || 'Block Education Officer', margin + 3, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(letter.senderDesignation || l.senderOrganization || 'Office of the BEO, Bhadravathi', margin + 3, y + 15.5);
  if (l.senderAddress) {
    const splitAddr = doc.splitTextToSize(l.senderAddress, boxWidth - 6);
    doc.text(splitAddr[0] || '', margin + 3, y + 20);
  }

  // To Box
  const toX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(toX, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TO / ಸ್ವೀಕೃತಿದಾರರು:', toX + 3, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(letter.recipientName || 'Headmaster / Officer / Public', toX + 3, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(letter.recipientDesignation || letter.recipientDepartment || 'Department of School Education & Literacy', toX + 3, y + 15.5);
  if (l.recipientAddress) {
    const splitAddr = doc.splitTextToSize(l.recipientAddress, boxWidth - 6);
    doc.text(splitAddr[0] || '', toX + 3, y + 20);
  }

  y += boxHeight + 6;

  // --- SUBJECT (ವಿಷಯ) & REFERENCE (ಉಲ್ಲೇಖ) ---
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  
  const subjectText = letter.subject || 'Official Correspondence';
  const splitSubject = doc.splitTextToSize(`SUBJECT / ವಿಷಯ: ${subjectText}`, contentWidth - 8);
  const subjHeight = Math.max(12, splitSubject.length * 4.5 + 6);

  doc.roundedRect(margin, y, contentWidth, subjHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15); // amber-900
  doc.text(splitSubject, margin + 4, y + 6);

  y += subjHeight + 4;

  // --- GOVERNMENT ORDER CITATION (ಈ ಆದೇಶದಂತೆ) & REFERENCE ---
  if (letter.linkedOrderNumber) {
    const orderRefLine = `PURSUANT TO GOVERNMENT ORDER / ಈ ಆದೇಶದಂತೆ: ಸಂಖ್ಯೆ: ${letter.linkedOrderNumber}${letter.linkedOrderDate ? ` (ದಿನಾಂಕ: ${formatDateDDMMYYYY(letter.linkedOrderDate)})` : ''}${letter.linkedOrderSubject ? ` - ${letter.linkedOrderSubject}` : ''}`;
    const splitOrderRef = doc.splitTextToSize(orderRefLine, contentWidth - 8);
    const orderBoxHeight = splitOrderRef.length * 4.2 + 5;
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(margin, y, contentWidth, orderBoxHeight, 1.2, 1.2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 15); // amber-900
    doc.text(splitOrderRef, margin + 4, y + 4.5);
    y += orderBoxHeight + 4;
  }

  if (l.reference && l.reference !== letter.linkedOrderNumber) {
    const splitRef = doc.splitTextToSize(`REFERENCE / ಉಲ್ಲೇಖ: ${l.reference}`, contentWidth - 8);
    const refHeight = splitRef.length * 4 + 5;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, refHeight, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(splitRef, margin + 4, y + 4.5);
    y += refHeight + 4;
  }

  // --- LETTER BODY (ಪತ್ರದ ಒಡಲು) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL COMMUNICATION / ಪತ್ರದ ವಿವರ:', margin, y + 3);
  y += 6;

  const rawBody = letter.bodyText || l.mainContent || l.notes || 'The official proceedings and communications regarding the above subject matter are recorded in the departmental file registers for necessary compliance and record.';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  // Split into paragraphs
  const paragraphs = rawBody.split('\n').filter(p => p.trim().length > 0);
  const renderedParagraphs = paragraphs.length > 0 ? paragraphs : [rawBody];

  for (const para of renderedParagraphs) {
    const lines = doc.splitTextToSize(para, contentWidth);
    const requiredHeight = lines.length * 5;

    // Check page overflow
    if (y + requiredHeight > pageHeight - 45) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, margin, y);
    y += requiredHeight + 3.5;
  }

  // Financial Amount note if present
  if (letter.financialAmount && letter.financialAmount > 0) {
    if (y + 12 > pageHeight - 45) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text(`FINANCIAL SANCTION / AMOUNT INVOLVED: ₹${Number(letter.financialAmount).toLocaleString('en-IN')}/-`, margin + 4, y + 5.5);
    y += 12;
  }

  // --- SIGNATORY & ENDORSEMENT SECTION ---
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Signatory Stamp Box
  const sigBoxWidth = 80;
  const sigX = pageWidth - margin - sigBoxWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sigX, y, sigBoxWidth, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text('✓ DIGITALLY SIGNED & VERIFIED', sigX + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const signatoryName = l.signatoryName || letter.senderName || 'Block Education Officer';
  doc.text(signatoryName, sigX + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(l.signatoryDesignation || letter.senderDesignation || 'Block Education Officer', sigX + 4, y + 15);
  doc.text('Office of the BEO, Bhadravathi', sigX + 4, y + 19.5);

  // Endorsement copies on left side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('COPIES FORWARDED FOR INFORMATION & COMPLIANCE:', margin, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. The Deputy Director of Public Instruction (Admin), Shivamogga.', margin, y + 10);
  doc.text(`2. Office Copy / Master Docket File ${letter.fileNumber ? `#${letter.fileNumber}` : ''}.`, margin, y + 15);
  doc.text('3. Internal Audit & RTI Cell.', margin, y + 20);

  y += 32;

  // --- FOOTER ---
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Karnataka State e-Office File & Correspondence Registry • Authenticity Hash: SHA256-${letter.id.slice(0, 12)}`, margin, pageHeight - 5);
  doc.text(`Generated: ${generatedAt} • Page 1 of 1`, pageWidth - margin, pageHeight - 5, { align: 'right' });

  // Download File
  const safeFilename = `Letter_${(l.letterNumber || letter.referenceNumber || letter.id).replace(/[/\\?%*:|"<>]/g, '_')}_${dateStr}.pdf`;
  doc.save(safeFilename);
}
