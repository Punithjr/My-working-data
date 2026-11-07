import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentAttachment } from '../types';

export interface MergeOptions {
  docketFileNumber?: string;
  docketSubject?: string;
  includeCoverPage?: boolean;
  outputFileName?: string;
}

export interface MergeResult {
  pdfBytes: Uint8Array;
  dataUrl: string;
  pageCount: number;
  fileName: string;
  fileSize: string;
}

/**
 * Helper to convert base64 dataUrl or binary string to Uint8Array
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(',');
  const base64Str = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper to convert Uint8Array to base64 dataUrl
 */
function uint8ArrayToDataUrl(bytes: Uint8Array, mimeType: string = 'application/pdf'): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

/**
 * Merges multiple DocumentAttachments (PDFs and Images) into a single consolidated PDF document.
 */
export async function mergeDocketAttachments(
  attachments: DocumentAttachment[],
  options: MergeOptions = {}
): Promise<MergeResult> {
  if (!attachments || attachments.length === 0) {
    throw new Error('ವಿಲೀನಗೊಳಿಸಲು ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select at least one attachment to merge).');
  }

  const mergedPdf = await PDFDocument.create();
  const helveticaFont = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  const fileNumber = options.docketFileNumber || 'BEO-DOCKET-ATTACHMENTS';
  const subject = options.docketSubject || 'Master Docket File Records Archive';
  const todayDate = new Date().toISOString().split('T')[0];

  // 1. Optionally Add an Official Archival Summary Cover Page (A4: 595.28 x 841.89 pt)
  if (options.includeCoverPage !== false) {
    const coverPage = mergedPdf.addPage([595.28, 841.89]);
    const { width, height } = coverPage.getSize();

    // Decorative header border
    coverPage.drawRectangle({
      x: 36,
      y: height - 40,
      width: width - 72,
      height: 4,
      color: rgb(0.08, 0.2, 0.4), // dark navy
    });

    // Department Header (English standard transliteration for PDF-lib default fonts + Kannada transliteration)
    coverPage.drawText('GOVERNMENT OF KARNATAKA', {
      x: 36,
      y: height - 70,
      size: 14,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    coverPage.drawText('DEPARTMENT OF SCHOOL EDUCATION & LITERACY', {
      x: 36,
      y: height - 88,
      size: 11,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    coverPage.drawText('OFFICE OF THE BLOCK EDUCATION OFFICER, BHADRAVATHI', {
      x: 36,
      y: height - 104,
      size: 10,
      font: helveticaBold,
      color: rgb(0.05, 0.25, 0.5),
    });
    coverPage.drawText('B.H. Road, Old Town, Bhadravathi, Shivamogga Dist - 577301', {
      x: 36,
      y: height - 118,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Divider Line
    coverPage.drawLine({
      start: { x: 36, y: height - 130 },
      end: { x: width - 36, y: height - 130 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Archival Document Badge
    coverPage.drawRectangle({
      x: 36,
      y: height - 175,
      width: width - 72,
      height: 34,
      color: rgb(0.95, 0.97, 1.0),
      borderColor: rgb(0.7, 0.8, 0.95),
      borderWidth: 1,
    });
    coverPage.drawText('CONSOLIDATED MASTER DOCKET ARCHIVE (CONSOLIDATED PDF)', {
      x: 48,
      y: height - 158,
      size: 11,
      font: helveticaBold,
      color: rgb(0.08, 0.2, 0.4),
    });
    coverPage.drawText(`Archived on: ${todayDate} | Total Attachments: ${attachments.length}`, {
      x: 48,
      y: height - 170,
      size: 8.5,
      font: helveticaFont,
      color: rgb(0.35, 0.35, 0.35),
    });

    // Docket Info Box
    coverPage.drawText('Docket Details:', {
      x: 36,
      y: height - 200,
      size: 11,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    });
    coverPage.drawText(`File Number: ${fileNumber}`, {
      x: 36,
      y: height - 216,
      size: 10,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    const cleanSubject = subject.length > 80 ? subject.substring(0, 77) + '...' : subject;
    coverPage.drawText(`Subject: ${cleanSubject}`, {
      x: 36,
      y: height - 232,
      size: 9.5,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Table of Enclosed Attachments Header
    coverPage.drawText('Enclosed Document Schedule / Index:', {
      x: 36,
      y: height - 265,
      size: 10,
      font: helveticaBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Table header background
    coverPage.drawRectangle({
      x: 36,
      y: height - 290,
      width: width - 72,
      height: 20,
      color: rgb(0.9, 0.92, 0.95),
    });
    coverPage.drawText('Sl', { x: 44, y: height - 282, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText('Document Name', { x: 75, y: height - 282, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText('Type / Size', { x: 340, y: height - 282, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText('Upload Date', { x: 460, y: height - 282, size: 9, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });

    let curY = height - 310;
    attachments.forEach((att, idx) => {
      if (curY > 100) {
        coverPage.drawText(`${idx + 1}.`, { x: 44, y: curY, size: 8.5, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
        const nameText = att.fileName.length > 45 ? att.fileName.substring(0, 42) + '...' : att.fileName;
        coverPage.drawText(nameText, { x: 75, y: curY, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
        const typeInfo = `${att.fileType.includes('pdf') ? 'PDF Document' : 'Scanned Image'} (${att.fileSize})`;
        coverPage.drawText(typeInfo, { x: 340, y: curY, size: 8, font: helveticaFont, color: rgb(0.35, 0.35, 0.35) });
        coverPage.drawText(att.uploadedAt || todayDate, { x: 460, y: curY, size: 8, font: helveticaFont, color: rgb(0.35, 0.35, 0.35) });

        // Line divider between rows
        coverPage.drawLine({
          start: { x: 36, y: curY - 5 },
          end: { x: width - 36, y: curY - 5 },
          thickness: 0.5,
          color: rgb(0.9, 0.9, 0.9),
        });
        curY -= 20;
      }
    });

    // Footer on cover page
    coverPage.drawText('Official Digital Archive - Block Education Office, Bhadravathi', {
      x: 36,
      y: 40,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // 2. Process each attachment and append to merged document
  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];

    if (att.dataUrl && (att.fileType.includes('pdf') || att.fileName.toLowerCase().endsWith('.pdf') || att.dataUrl.startsWith('data:application/pdf'))) {
      try {
        const pdfBytes = dataUrlToUint8Array(att.dataUrl);
        const srcPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const indices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, indices);
        copiedPages.forEach((p) => mergedPdf.addPage(p));
      } catch (pdfErr) {
        console.warn(`Could not parse raw PDF for ${att.fileName}, creating descriptive page:`, pdfErr);
        // Fallback: create a placeholder page
        createDescriptivePage(mergedPdf, att, i + 1, helveticaBold, helveticaFont);
      }
    } else if (att.dataUrl && (att.fileType.includes('image') || att.fileName.match(/\.(jpg|jpeg|png)$/i) || att.dataUrl.startsWith('data:image/'))) {
      try {
        const imgBytes = dataUrlToUint8Array(att.dataUrl);
        let embeddedImg;
        if (att.dataUrl.includes('image/png') || att.fileName.toLowerCase().endsWith('.png')) {
          embeddedImg = await mergedPdf.embedPng(imgBytes);
        } else {
          // Default to JPEG
          embeddedImg = await mergedPdf.embedJpg(imgBytes);
        }

        // Standard A4 page
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const page = mergedPdf.addPage([pageWidth, pageHeight]);

        // Draw document header banner on top
        page.drawText(`Attachment #${i + 1}: ${att.fileName}`, {
          x: 36,
          y: pageHeight - 30,
          size: 8.5,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Fit image within margins (36pt margin each side, 40pt top, 36pt bottom)
        const maxWidth = pageWidth - 72;
        const maxHeight = pageHeight - 76;
        const imgDims = embeddedImg.scale(1);
        const scaleFactor = Math.min(maxWidth / imgDims.width, maxHeight / imgDims.height, 1);
        const renderWidth = imgDims.width * scaleFactor;
        const renderHeight = imgDims.height * scaleFactor;

        const xPos = 36 + (maxWidth - renderWidth) / 2;
        const yPos = 36 + (maxHeight - renderHeight) / 2;

        page.drawImage(embeddedImg, {
          x: xPos,
          y: yPos,
          width: renderWidth,
          height: renderHeight,
        });
      } catch (imgErr) {
        console.warn(`Could not embed image for ${att.fileName}:`, imgErr);
        createDescriptivePage(mergedPdf, att, i + 1, helveticaBold, helveticaFont);
      }
    } else {
      // Descriptive page for items without binary dataUrl or other formats
      createDescriptivePage(mergedPdf, att, i + 1, helveticaBold, helveticaFont);
    }
  }

  // 3. Save finalized PDF
  const mergedBytes = await mergedPdf.save();
  const finalDataUrl = uint8ArrayToDataUrl(mergedBytes, 'application/pdf');
  const sizeKb = (mergedBytes.byteLength / 1024).toFixed(0);
  const sizeMb = (mergedBytes.byteLength / (1024 * 1024)).toFixed(1);
  const fileSize = mergedBytes.byteLength > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

  const safeFileNumber = (options.docketFileNumber || 'DOCKET').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = options.outputFileName || `Consolidated_Docket_${safeFileNumber}_${todayDate}.pdf`;

  return {
    pdfBytes: mergedBytes,
    dataUrl: finalDataUrl,
    pageCount: mergedPdf.getPageCount(),
    fileName,
    fileSize,
  };
}

/**
 * Creates a clear, professional descriptive page for an attachment that is referenced in the docket
 */
function createDescriptivePage(
  pdfDoc: PDFDocument,
  att: DocumentAttachment,
  index: number,
  boldFont: any,
  regularFont: any
) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Header band
  page.drawRectangle({
    x: 36,
    y: height - 60,
    width: width - 72,
    height: 3,
    color: rgb(0.1, 0.3, 0.6),
  });

  page.drawText(`ENCLOSED ATTACHMENT RECORD #${index}`, {
    x: 36,
    y: height - 90,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawRectangle({
    x: 36,
    y: height - 240,
    width: width - 72,
    height: 130,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  page.drawText(`File Name: ${att.fileName}`, {
    x: 50,
    y: height - 130,
    size: 11,
    font: boldFont,
    color: rgb(0.15, 0.15, 0.15),
  });

  page.drawText(`Document Type: ${att.fileType || 'Government Verification Record'}`, {
    x: 50,
    y: height - 152,
    size: 9.5,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`File Size: ${att.fileSize}`, {
    x: 50,
    y: height - 172,
    size: 9.5,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`Date of Receipt / Upload: ${att.uploadedAt || new Date().toISOString().split('T')[0]}`, {
    x: 50,
    y: height - 192,
    size: 9.5,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  if (att.description) {
    page.drawText(`Official Description: ${att.description.substring(0, 75)}`, {
      x: 50,
      y: height - 212,
      size: 9,
      font: regularFont,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  page.drawText('This attachment is part of the certified departmental master docket files repository.', {
    x: 36,
    y: 60,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });
}
