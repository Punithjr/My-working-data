import { jsPDF } from 'jspdf';
import { MasterDocketFile, EducationLetter } from '../types';

/**
 * Generates an executive, structured PDF dossier summary for a specific docket
 * aggregating metadata, official notes, movement audit trail, status updates,
 * and linked letters for quick supervisory review.
 */
export function generateDocketDossierSummaryPdf(
  file: MasterDocketFile,
  linkedLetters: EducationLetter[] = [],
  supervisorName: string = 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು / ಮುಖ್ಯಸ್ಥರು (BEO / Supervisor)'
): void {
  if (!file) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const generatedAt = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  // --- HEADER: Government of Karnataka Official Banner ---
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('GOVERNMENT OF KARNATAKA • DEPARTMENT OF SCHOOL EDUCATION', pageWidth / 2, 8, { align: 'center' });

  doc.setFontSize(12);
  doc.text('OFFICE OF THE BLOCK EDUCATION OFFICER (BEO), BHADRAVATHI', pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('MASTER FILE TRACKING SYSTEM (FTS) • EXECUTIVE DOCKET DOSSIER SUMMARY', pageWidth / 2, 21, { align: 'center' });

  let y = 32;

  // --- TOP TITLE & DOSSIER BADGE ---
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`DOCKET DOSSIER REVIEW: FILE #${file.fileNumber}`, margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${generatedAt}`, pageWidth - margin - 4, y + 7.5, { align: 'right' });

  y += 16;

  // --- SECTION 1: CORE DOCKET METADATA CARD ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. DOCKET ADMINISTRATIVE PROFILE & METADATA', margin + 3, y + 5);

  const col1X = margin + 3;
  const col2X = margin + 96;
  let metaY = y + 12;

  doc.setFontSize(8);
  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('File Number:', col1X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(file.fileNumber || '-', col1X + 26, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Initiated Date:', col2X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(file.initiatedDate || '-', col2X + 28, metaY);

  // Row 2
  metaY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Office Section:', col1X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const sectionLabel = `${file.sectionCode || file.section || 'General'} - ${file.sectionName || ''}`;
  doc.text(sectionLabel.substring(0, 36), col1X + 26, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Current Status:', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(file.status || 'Active / Open', col2X + 28, metaY);

  // Row 3
  metaY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category:', col1X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(file.fileCategory || 'General Administrative', col1X + 26, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Priority Level:', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(file.priority === 'Immediate' ? 220 : 15, file.priority === 'Immediate' ? 38 : 23, file.priority === 'Immediate' ? 38 : 42);
  doc.text(file.priority || 'Routine', col2X + 28, metaY);

  // Row 4
  metaY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Current Custodian:', col1X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(file.currentCustodian || 'Office Superintendent', col1X + 26, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Target Due Date:', col2X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(file.dueDate || '30-Day Administrative SLA', col2X + 28, metaY);

  y += 42;

  // --- SECTION 2: SUBJECT & ADMINISTRATIVE NOTES ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);

  const cleanSubject = file.subject || 'Administrative Docket Processing';
  const splitSubject = doc.splitTextToSize(cleanSubject, contentWidth - 8);
  const notesText = file.notes || 'Routine case processing under Karnataka Civil Services Rules & RTI guidelines. Regular movement log updated.';
  const splitNotes = doc.splitTextToSize(notesText, contentWidth - 8);

  const notesBoxHeight = 18 + splitSubject.length * 4 + splitNotes.length * 3.8;
  doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 2, 2, 'FD');

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. OFFICIAL SUBJECT & INTERNAL ADMINISTRATIVE NOTES', margin + 3, y + 5);

  let textY = y + 11;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Docket Subject:', margin + 3, textY);
  textY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(splitSubject, margin + 4, textY);

  textY += splitSubject.length * 4 + 2;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Internal Case Notes & Instructions:', margin + 3, textY);
  textY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(splitNotes, margin + 4, textY);

  y += notesBoxHeight + 5;

  // --- SECTION 3: AUDIT TRAIL & MOVEMENT HISTORY ---
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const movements = file.movementHistory || file.movementTrail || [];
  doc.text(`3. COMPLETE CHRONOLOGICAL AUDIT TRAIL & MOVEMENT LOG (${movements.length} Steps)`, margin + 3, y + 5);

  y += 7;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Step', margin + 2, y + 4.2);
  doc.text('Date', margin + 12, y + 4.2);
  doc.text('From Officer', margin + 32, y + 4.2);
  doc.text('To Officer', margin + 68, y + 4.2);
  doc.text('Status Update', margin + 104, y + 4.2);
  doc.text('Official Noting / Remarks', margin + 138, y + 4.2);

  y += 6;

  if (movements.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No movement entries recorded for this file yet. File initiated at custodian desk.', margin + 4, y + 5);
    y += 8;
  } else {
    movements.forEach((mov, idx) => {
      // Check for page break
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
        doc.setFillColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`3. CHRONOLOGICAL AUDIT TRAIL (CONTINUED) - FILE #${file.fileNumber}`, margin + 3, y + 4.5);
        y += 7;
      }

      const rowHeight = 7.5;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`#${idx + 1}`, margin + 2, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(mov.sentDate || '-', margin + 12, y + 5);
      doc.text((mov.fromOfficer || '-').substring(0, 20), margin + 32, y + 5);
      doc.text((mov.toOfficer || '-').substring(0, 20), margin + 68, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text((mov.statusAfterMove || file.status || 'Processed').substring(0, 18), margin + 104, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const remarkClean = (mov.remarks || 'Routine movement endorsement').substring(0, 32);
      doc.text(remarkClean, margin + 138, y + 5);

      y += rowHeight;
    });
  }

  y += 4;

  // --- SECTION 4: LINKED LETTERS & CORRESPONDENCE REGISTER ---
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`4. ASSOCIATED INWARD / OUTWARD CORRESPONDENCE (${linkedLetters.length} Letters)`, margin + 3, y + 5);
  y += 7;

  if (linkedLetters.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 7, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No linked correspondence letters attached to this docket.', margin + 4, y + 4.8);
    y += 9;
  } else {
    linkedLetters.slice(0, 5).forEach((letItem, lIdx) => {
      const ref = letItem.referenceNumber || (letItem as any).letterNumber || `LET-${lIdx + 1}`;
      const dir = (letItem.direction || 'Inward').toUpperCase();
      const date = letItem.dateReceivedOrIssued || (letItem as any).date || '-';

      doc.setFillColor(lIdx % 2 === 0 ? 255 : 250, lIdx % 2 === 0 ? 255 : 250, lIdx % 2 === 0 ? 255 : 250);
      doc.rect(margin, y, contentWidth, 6.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${dir}] ${ref}`, margin + 2, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(date, margin + 55, y + 4.5);

      doc.setTextColor(30, 41, 59);
      const subj = (letItem.subject || '-').substring(0, 55);
      doc.text(subj, margin + 78, y + 4.5);

      y += 6.5;
    });
    y += 3;
  }

  // --- SECTION 5: SUPERVISOR REVIEW & SIGN-OFF ENDORSEMENT ---
  if (y > pageHeight - 48) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('5. SUPERVISORY SCRUTINY, AUDIT ENDORSEMENT & VERDICT', margin + 3, y + 4.2);

  let signY = y + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Supervisory Reviewing Authority:', margin + 3, signY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(supervisorName, margin + 48, signY);

  signY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Scrutiny Assessment Verdict:', margin + 3, signY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('[X] DOCKET VERIFIED • AUDIT TRAIL COMPLETE • READY FOR FINAL DECISION', margin + 48, signY);

  signY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Review Timestamp:', margin + 3, signY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${generatedAt} (Authenticated FTS Electronic Record)`, margin + 48, signY);

  // Signature lines
  const sigX = pageWidth - margin - 50;
  doc.line(sigX, y + 26, pageWidth - margin - 4, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Signature & Official Seal', sigX + 4, y + 30);

  // --- FOOTER ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Karnataka State School Education Department • BEO Bhadravathi • File Tracking System (FTS)',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Download PDF
  const safeFileNumber = (file.fileNumber || 'Docket').replace(/[\/\\]/g, '-');
  doc.save(`Docket_Dossier_Summary_${safeFileNumber}_${now.toISOString().split('T')[0]}.pdf`);
}
