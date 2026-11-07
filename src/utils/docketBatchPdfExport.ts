import { jsPDF } from 'jspdf';
import { MasterDocketFile } from '../types';
import { computeDocketSla } from '../components/FilesDocketsView';
import { formatDateDDMMYYYY } from './formatDate';

/**
 * Generates and downloads a single, combined, table-indexed PDF report
 * containing selected docket cards with full dossier details and TOC.
 */
export const exportBatchDocketsIndexedPdf = (
  selectedFiles: MasterDocketFile[],
  options?: { filterLabel?: string; officerName?: string }
) => {
  if (!selectedFiles || selectedFiles.length === 0) return;

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
  const reportDateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // --- COVER & TABLE-INDEX PAGE ---
  // Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GOVERNMENT OF KARNATAKA • DEPARTMENT OF SCHOOL EDUCATION', pageWidth / 2, 9, { align: 'center' });

  doc.setFontSize(13);
  doc.text('OFFICE OF THE BLOCK EDUCATION OFFICER (BEO), BHADRAVATHI', pageWidth / 2, 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Department Master File Tracking System (FTS) • Consolidated Docket Batch Dossier', pageWidth / 2, 23, { align: 'center' });

  // Sub-header metadata card
  let y = 34;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Batch Report Generated: ${reportDateStr}`, margin + 4, y + 6);
  doc.text(`Total Selected Dockets: ${selectedFiles.length}`, margin + 4, y + 11.5);

  const overdueCount = selectedFiles.filter(f => computeDocketSla(f).isOverdue).length;
  const activeCount = selectedFiles.filter(f => f.status !== 'Disposed / Closed').length;
  doc.setFont('helvetica', 'normal');
  doc.text(`Active Cases: ${activeCount}  |  Overdue Cases: ${overdueCount}`, pageWidth - margin - 4, y + 6, { align: 'right' });
  doc.text(`Scope: ${options?.filterLabel || 'Custom Admin Selection'}`, pageWidth - margin - 4, y + 11.5, { align: 'right' });

  y += 22;

  // Title: TABLE INDEX OF DOCKETS
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. DOCKET BATCH TABLE INDEX / SUMMARY', margin, y);
  y += 4;

  // Table Headers
  const colX = {
    sl: margin,
    fileNo: margin + 9,
    subject: margin + 44,
    officer: margin + 104,
    priority: margin + 142,
    sla: margin + 160,
  };

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SL', colX.sl + 2, y + 4.8);
  doc.text('FILE NUMBER', colX.fileNo, y + 4.8);
  doc.text('SUBJECT', colX.subject, y + 4.8);
  doc.text('OFFICER / WING', colX.officer, y + 4.8);
  doc.text('PRIORITY', colX.priority, y + 4.8);
  doc.text('SLA STATUS', colX.sla, y + 4.8);

  y += 7;

  // Render Table Index Rows
  selectedFiles.forEach((file, idx) => {
    const sla = computeDocketSla(file);
    const rowHeight = 9;

    // Check page overflow for TOC
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      // Re-print mini header
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('SL', colX.sl + 2, y + 4.8);
      doc.text('FILE NUMBER', colX.fileNo, y + 4.8);
      doc.text('SUBJECT (Contd.)', colX.subject, y + 4.8);
      doc.text('OFFICER / WING', colX.officer, y + 4.8);
      doc.text('PRIORITY', colX.priority, y + 4.8);
      doc.text('SLA STATUS', colX.sla, y + 4.8);
      y += 7;
    }

    // Row alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    // SL
    doc.text(String(idx + 1), colX.sl + 2, y + 5.5);

    // File No
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const cleanFileNo = (file.fileNumber || 'N/A').substring(0, 18);
    doc.text(cleanFileNo, colX.fileNo, y + 5.5);

    // Subject
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const cleanSubject = (file.subject || '-').replace(/[\r\n]+/g, ' ').substring(0, 36) + (file.subject?.length > 36 ? '...' : '');
    doc.text(cleanSubject, colX.subject, y + 5.5);

    // Officer
    const officerText = (file.currentCustodian || file.section || 'BEO Staff').substring(0, 22);
    doc.text(officerText, colX.officer, y + 5.5);

    // Priority
    const isUrgent = file.priority === 'Urgent' || file.priority === 'Immediate';
    if (isUrgent) {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(file.priority || 'Normal', colX.priority, y + 5.5);

    // SLA Status
    if (sla.isOverdue) {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.text(`OVERDUE (${Math.abs(sla.daysRemaining)}d)`, colX.sla, y + 5.5);
    } else if (file.status === 'Disposed / Closed') {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'normal');
      doc.text('Disposed', colX.sla, y + 5.5);
    } else {
      doc.setTextColor(4, 120, 87);
      doc.setFont('helvetica', 'normal');
      doc.text(`On Track (${sla.daysRemaining}d left)`, colX.sla, y + 5.5);
    }

    y += rowHeight;
  });

  // --- SECTION 2: COMPREHENSIVE DOCKET DOSSIERS ---
  selectedFiles.forEach((file, index) => {
    doc.addPage();
    const sla = computeDocketSla(file);
    let cardY = 16;

    // Card Header Bar
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, cardY, contentWidth, 14, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`DOCKET DOSSIER #${index + 1}: ${file.fileNumber}`, margin + 4, cardY + 6.5);

    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text(`Category: ${file.fileCategory || file.section}  |  Priority: ${file.priority}`, margin + 4, cardY + 11);

    doc.setTextColor(255, 255, 255);
    doc.text(`Status: ${file.status}`, pageWidth - margin - 4, cardY + 8.5, { align: 'right' });

    cardY += 18;

    // Subject Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, cardY, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('SUBJECT / MATTER DESCRIPTION:', margin + 4, cardY + 5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const splitSubject = doc.splitTextToSize(file.subject || 'No subject registered.', contentWidth - 8);
    doc.text(splitSubject, margin + 4, cardY + 10);

    cardY += 22;

    // Key Parameters Grid (2 columns)
    const colW = (contentWidth - 4) / 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, cardY, colW, 36, 1.5, 1.5, 'FD');
    doc.roundedRect(margin + colW + 4, cardY, colW, 36, 1.5, 1.5, 'FD');

    // Left Column Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('ADMINISTRATIVE DETAILS', margin + 4, cardY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Department Section: ${file.section || 'General'}`, margin + 4, cardY + 12);
    doc.text(`Current Custodian / Officer: ${file.currentCustodian || 'Unassigned'}`, margin + 4, cardY + 17);
    doc.text(`Initiated Date: ${file.initiatedDate ? formatDateDDMMYYYY(file.initiatedDate) : 'N/A'}`, margin + 4, cardY + 22);
    doc.text(`Applicant / School Name: ${file.rtiDetails?.applicantName || (file as any).schoolName || 'Direct Departmental File'}`, margin + 4, cardY + 27);
    doc.text(`File Security Level: Official Government Record`, margin + 4, cardY + 32);

    // Right Column Info - SLA Details
    const rightX = margin + colW + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('SLA TIMELINE & MONITORING', rightX, cardY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Prescribed Due Date: ${file.dueDate ? formatDateDDMMYYYY(file.dueDate) : '14 Days Standard SLA'}`, rightX, cardY + 12);

    if (sla.isOverdue) {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.text(`SLA Compliance: OVERDUE by ${Math.abs(sla.daysRemaining)} calendar days`, rightX, cardY + 17);
    } else {
      doc.setTextColor(4, 120, 87);
      doc.setFont('helvetica', 'bold');
      doc.text(`SLA Compliance: ON TRACK (${sla.daysRemaining} days remaining)`, rightX, cardY + 17);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`SLA Progress Bar: ${Math.round(sla.progressPercent)}% elapsed of designated cycle`, rightX, cardY + 22);
    doc.text(`Total Movement Steps Recorded: ${file.movementHistory?.length || 0}`, rightX, cardY + 27);
    doc.text(`Attachments & Enclosures: ${file.attachments?.length || 0} document(s)`, rightX, cardY + 32);

    cardY += 40;

    // Movement History Log
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL CUSTODY MOVEMENT TRAIL (CHRONOLOGICAL):', margin, cardY);
    cardY += 3.5;

    // History Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cardY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('#', margin + 2, cardY + 4.2);
    doc.text('DATE / TIME', margin + 8, cardY + 4.2);
    doc.text('FROM OFFICER', margin + 34, cardY + 4.2);
    doc.text('TO OFFICER', margin + 74, cardY + 4.2);
    doc.text('REMARKS / ACTION DIRECTIVE', margin + 114, cardY + 4.2);
    cardY += 6;

    if (!file.movementHistory || file.movementHistory.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No movement transactions recorded yet. File is currently with initiating officer.', margin + 4, cardY + 6);
      cardY += 10;
    } else {
      file.movementHistory.forEach((mov, mIdx) => {
        if (cardY + 8 > pageHeight - 30) {
          doc.addPage();
          cardY = 16;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);

        doc.text(String(mIdx + 1), margin + 2, cardY + 4.5);
        doc.text((mov.sentDate || '-').substring(0, 16), margin + 8, cardY + 4.5);
        doc.text((mov.fromOfficer || '-').substring(0, 22), margin + 34, cardY + 4.5);
        doc.text((mov.toOfficer || '-').substring(0, 22), margin + 74, cardY + 4.5);
        const rem = (mov.remarks || 'Forwarded').substring(0, 42);
        doc.text(rem, margin + 114, cardY + 4.5);

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, cardY + 6.5, margin + contentWidth, cardY + 6.5);
        cardY += 6.5;
      });
    }

    // Attachments section if space allows
    if (cardY + 25 < pageHeight - 25 && file.attachments && file.attachments.length > 0) {
      cardY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`ATTACHED ANNEXURES & SCAN DOSSIERS (${file.attachments.length}):`, margin, cardY);
      cardY += 4;

      file.attachments.slice(0, 4).forEach((att, aIdx) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(`• [${att.fileType || 'PDF'}] ${att.fileName} - Uploaded on ${att.uploadedAt ? formatDateDDMMYYYY(att.uploadedAt) : 'Registered'}`, margin + 4, cardY);
        cardY += 4;
      });
    }

    // Bottom Authorization Seal
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 22, margin + contentWidth, pageHeight - 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an official administrative dossier generated from the Bhadravathi BEO File Tracking System (FTS).', margin, pageHeight - 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('BLOCK EDUCATION OFFICER / CUSTODIAL SUPERINTENDENT', pageWidth - margin, pageHeight - 16, { align: 'right' });
    doc.text('Office of the BEO, Bhadravathi Range', pageWidth - margin, pageHeight - 12, { align: 'right' });
  });

  // Set page numbering on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  const filename = `Bhadravathi_BEO_Docket_Batch_Report_${now.toISOString().split('T')[0]}_${now.getTime().toString().slice(-4)}.pdf`;
  doc.save(filename);
};

/**
 * Generates and downloads a clean, single-page printable PDF summary
 * containing a count and list of all currently displayed/filtered dockets,
 * including total SLA status summary breakdown.
 */
export const printOrExportBatchSummaryPdf = (
  displayedFiles: MasterDocketFile[],
  filterContext?: { category?: string; priority?: string; section?: string; status?: string; search?: string }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const reportDateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('DEPARTMENT OF SCHOOL EDUCATION • GOVERNMENT OF KARNATAKA', pageWidth / 2, 7, { align: 'center' });

  doc.setFontSize(11.5);
  doc.text('OFFICE OF THE BLOCK EDUCATION OFFICER (BEO), BHADRAVATHI', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Master File Tracking System (FTS) • Single-Page Daily Batch SLA Audit Summary', pageWidth / 2, 20, { align: 'center' });

  let y = 28;

  // 2. Summary KPI Metrics Box (Single-row card breakdown)
  const totalCount = displayedFiles.length;
  const overdueCount = displayedFiles.filter(f => computeDocketSla(f).isOverdue).length;
  const nearExpiryCount = displayedFiles.filter(f => computeDocketSla(f).statusText === 'Near Expiry').length;
  const onTrackCount = displayedFiles.filter(f => computeDocketSla(f).statusText === 'On Track' || computeDocketSla(f).statusText === 'Routine').length;
  const closedCount = displayedFiles.filter(f => f.status === 'Disposed / Closed').length;

  const kpiW = (contentWidth - 8) / 5;

  const kpis = [
    { label: 'TOTAL IN VIEW', count: totalCount, bg: [241, 245, 249], border: [203, 213, 225], text: [15, 23, 42] },
    { label: 'OVERDUE SLA', count: overdueCount, bg: [254, 242, 242], border: [252, 165, 165], text: [185, 28, 28] },
    { label: 'NEAR EXPIRY (<48h)', count: nearExpiryCount, bg: [254, 243, 199], border: [252, 211, 77], text: [180, 83, 9] },
    { label: 'ON TRACK SLA', count: onTrackCount, bg: [236, 253, 245], border: [110, 231, 183], text: [4, 120, 87] },
    { label: 'DISPOSED / CLOSED', count: closedCount, bg: [248, 250, 252], border: [226, 232, 240], text: [71, 85, 105] },
  ];

  kpis.forEach((kpi, idx) => {
    const kX = margin + idx * (kpiW + 2);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.roundedRect(kX, y, kpiW, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
    doc.text(kpi.label, kX + kpiW / 2, y + 4.5, { align: 'center' });

    doc.setFontSize(11);
    doc.text(String(kpi.count), kX + kpiW / 2, y + 11.5, { align: 'center' });
  });

  y += 18;

  // Filter Sub-label & Generation Time
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated: ${reportDateStr}  |  Filtered List: ${totalCount} Dockets  |  Section: ${filterContext?.section || 'All'}  |  Status: ${filterContext?.status || 'All'}`, margin, y);
  y += 3;

  // 3. Compact Single-Page Table Header
  const colX = {
    sl: margin,
    fileNo: margin + 7,
    section: margin + 38,
    subject: margin + 64,
    officer: margin + 116,
    due: margin + 144,
    status: margin + 166,
  };

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SL', colX.sl + 1, y + 4);
  doc.text('FILE NUMBER', colX.fileNo, y + 4);
  doc.text('SECTION', colX.section, y + 4);
  doc.text('SUBJECT', colX.subject, y + 4);
  doc.text('CUSTODIAN OFFICER', colX.officer, y + 4);
  doc.text('SLA STATUS & DUE', colX.due, y + 4);
  doc.text('STATUS', colX.status, y + 4);

  y += 6;

  // Render Table rows with dynamic density to fit on single page
  // Available height for rows:
  const maxY = pageHeight - 26; // leave room for signature block
  const remainingHeight = maxY - y;
  const countToDisplay = Math.min(displayedFiles.length, 34); // high density single-page max
  const rowHeight = countToDisplay > 0 ? Math.min(6.5, Math.max(4.8, remainingHeight / countToDisplay)) : 6;

  const filesToRender = displayedFiles.slice(0, countToDisplay);

  filesToRender.forEach((file, idx) => {
    const sla = computeDocketSla(file);

    // Alternate shading
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);

    // SL
    doc.text(String(idx + 1), colX.sl + 1, y + rowHeight * 0.7);

    // File No
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text((file.fileNumber || 'N/A').substring(0, 16), colX.fileNo, y + rowHeight * 0.7);

    // Section
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text((file.section || 'General').substring(0, 14), colX.section, y + rowHeight * 0.7);

    // Subject
    const cleanSub = (file.subject || '-').replace(/[\r\n]+/g, ' ').substring(0, 32);
    doc.text(cleanSub, colX.subject, y + rowHeight * 0.7);

    // Custodian Officer
    doc.text((file.currentCustodian || 'Staff').substring(0, 16), colX.officer, y + rowHeight * 0.7);

    // SLA Status
    if (sla.isOverdue) {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.text(`OVERDUE (${Math.abs(sla.daysRemaining)}d)`, colX.due, y + rowHeight * 0.7);
    } else if (file.status === 'Disposed / Closed') {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'normal');
      doc.text('Closed', colX.due, y + rowHeight * 0.7);
    } else {
      doc.setTextColor(4, 120, 87);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sla.daysRemaining}d left`, colX.due, y + rowHeight * 0.7);
    }

    // Status
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    const st = (file.status || 'Active').replace(' / Closed', '').substring(0, 12);
    doc.text(st, colX.status, y + rowHeight * 0.7);

    y += rowHeight;
  });

  if (displayedFiles.length > countToDisplay) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`... and ${displayedFiles.length - countToDisplay} additional dockets (truncated to preserve clean single-page layout). Use Batch Dossier Export for complete multi-page dossier.`, margin, y + 3.5);
  }

  // 4. Single-Page Footer & Signature Line
  const footY = pageHeight - 16;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footY - 2, margin + contentWidth, footY - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Certified Official FTS Summary Sheet • Department of School Education, BEO Bhadravathi', margin, footY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION SUPERINTENDENT', pageWidth - margin - 50, footY + 4);
  doc.text('BLOCK EDUCATION OFFICER', pageWidth - margin, footY + 4, { align: 'right' });

  const filename = `Bhadravathi_FTS_Batch_Summary_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
