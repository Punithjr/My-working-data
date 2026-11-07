import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Footer,
  PageNumber,
  PageOrientation
} from 'docx';
import * as XLSX from 'xlsx';
import { EducationLetter, MasterDocketFile } from '../src/types';

export const CENTRALIZED_BEO_HEADER = {
  state: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
  department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ',
  office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
  location: 'ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ.',
};

export interface LetterPrintSettings {
  paperSize?: 'A4' | 'A3' | 'Legal' | 'Letter' | 'Custom';
  orientation?: 'portrait' | 'landscape';
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  fontFamily?: string;
  fontSizePt?: number;
  lineSpacing?: number;
  paragraphSpacingPt?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  showBorder?: boolean;
  pageNumbering?: boolean;
  headerText?: string;
  footerText?: string;
  signaturePosition?: 'left' | 'center' | 'right';
  copies?: number;
  dateAlignment?: 'left' | 'right';
}

export const DEFAULT_PRINT_SETTINGS: LetterPrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginTopMm: 20,
  marginBottomMm: 20,
  marginLeftMm: 25,
  marginRightMm: 20,
  fontFamily: 'Noto Sans Kannada',
  fontSizePt: 12,
  lineSpacing: 1.35,
  paragraphSpacingPt: 8,
  showHeader: true,
  showFooter: true,
  showBorder: false,
  pageNumbering: true,
  signaturePosition: 'right',
  copies: 1,
  dateAlignment: 'right',
};

// Helper to convert mm to docx twips (1 mm = ~56.7 twips)
const mmToTwips = (mm: number) => Math.round(mm * 56.6929);

/**
 * Generates a genuine Microsoft Word DOCX buffer for an EducationLetter.
 * Fully compatible with Microsoft Word, LibreOffice, and Google Docs.
 */
export async function generateLetterDocxBuffer(
  letter: Partial<EducationLetter>,
  settings: LetterPrintSettings = DEFAULT_PRINT_SETTINGS
): Promise<Buffer> {
  const mergedSettings = { ...DEFAULT_PRINT_SETTINGS, ...settings };
  const paragraphs: Paragraph[] = [];

  const fontSizeHalfPt = Math.round((mergedSettings.fontSizePt || 12) * 2);
  const titleSizeHalfPt = Math.round(((mergedSettings.fontSizePt || 12) + 2) * 2);
  const headerFont = mergedSettings.fontFamily || 'Noto Sans Kannada';

  // 1. Centralized BEO Bhadravathi Header (Kannada Only)
  if (mergedSettings.showHeader !== false) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: CENTRALIZED_BEO_HEADER.state,
            bold: true,
            font: headerFont,
            size: titleSizeHalfPt,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: CENTRALIZED_BEO_HEADER.department,
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: CENTRALIZED_BEO_HEADER.office,
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt + 2,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: CENTRALIZED_BEO_HEADER.location,
            font: headerFont,
            size: fontSizeHalfPt - 2,
            italics: true,
          }),
        ],
      })
    );
  }

  // 2. Letter Number and Date Line
  const refNum = letter.referenceNumber || `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಇತರೆ/${letter.fileNumber || '57'}/2026-27`;
  const dateStr = letter.dateReceivedOrIssued || new Date().toISOString().split('T')[0];

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: { before: 100, after: 180 },
      children: [
        new TextRun({
          text: `ಸಂಖ್ಯೆ: ${refNum}`,
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
        new TextRun({
          text: `\t\tದಿನಾಂಕ: ${dateStr}`,
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
      ],
    })
  );

  // 3. Recipient (ಇವರಿಗೆ / ರಿಗೆ:)
  if (letter.recipientName || letter.recipientDepartment || letter.recipientDesignation) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: 'ರಿಗೆ:',
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt,
          }),
        ],
      }),
      new Paragraph({
        indent: { left: 400 },
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: letter.recipientName || 'ಸಂಬಂಧಪಟ್ಟ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಅಧಿಕಾರಿಗಳು',
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt,
          }),
        ],
      })
    );

    if (letter.recipientDesignation) {
      paragraphs.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: letter.recipientDesignation,
              font: headerFont,
              size: fontSizeHalfPt,
            }),
          ],
        })
      );
    }

    if (letter.recipientDepartment) {
      paragraphs.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: letter.recipientDepartment,
              font: headerFont,
              size: fontSizeHalfPt,
            }),
          ],
        })
      );
    }
  }

  // 4. Salutation
  paragraphs.push(
    new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: 'ಮಾನ್ಯರೆ,',
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
      ],
    })
  );

  // 5. Subject (ವಿಷಯ)
  paragraphs.push(
    new Paragraph({
      spacing: { before: 60, after: 100 },
      children: [
        new TextRun({
          text: 'ವಿಷಯ: ',
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
        new TextRun({
          text: letter.subject || 'ಕಚೇರಿ ಪತ್ರ ವ್ಯವಹಾರ ಕುರಿತು.',
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
      ],
    })
  );

  // 6. Reference (ಉಲ್ಲೇಖ)
  const referenceText = (letter as any).reference || (letter as any).referenceNumberString;
  if (referenceText) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: 'ಉಲ್ಲೇಖ: ',
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt,
          }),
          new TextRun({
            text: referenceText.replace(/<[^>]+>/g, ' '),
            font: headerFont,
            size: fontSizeHalfPt,
          }),
        ],
      })
    );
  }

  // 7. Body text (paragraphs)
  const rawBody = letter.bodyText || 'ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಮುಂದಿನ ಕ್ರಮ ಜರುಗಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.';
  const cleanBody = rawBody
    .replace(/<[^>]+>/g, '\n')
    .replace(/\r/g, '');

  const bodyLines = cleanBody.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of bodyLines) {
    paragraphs.push(
      new Paragraph({
        indent: { firstLine: 400 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120, line: Math.round((mergedSettings.lineSpacing || 1.35) * 240) },
        children: [
          new TextRun({
            text: line,
            font: headerFont,
            size: fontSizeHalfPt,
          }),
        ],
      })
    );
  }

  // 8. Physical Signature Area (Clean blank space for physical signature)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400, after: 60 },
      children: [
        new TextRun({
          text: 'ತಮ್ಮ ನಂಬುಗೆಯ,',
          font: headerFont,
          size: fontSizeHalfPt,
        }),
      ],
    }),
    // Generous blank spacing for physical signature
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 360, after: 40 },
      children: [
        new TextRun({
          text: letter.showCaseworkerSignature && letter.caseworkerName ? `(${letter.caseworkerName})` : '',
          bold: true,
          font: headerFont,
          size: fontSizeHalfPt,
        }),
      ],
    }),
    ...(letter.showCaseworkerSignature && letter.caseworkerDesignation ? [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: letter.caseworkerDesignation,
            font: headerFont,
            size: fontSizeHalfPt - 2,
          }),
        ],
      }),
    ] : [])
  );

  // 9. Endorsements / Copies (ಪ್ರತಿ ರವಾನೆ)
  if (letter.endorsements && letter.endorsements.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'ಪ್ರತಿಯನ್ನು ಮಾಹಿತಿ ಮತ್ತು ಮುಂದಿನ ಸೂಕ್ತ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:',
            bold: true,
            font: headerFont,
            size: fontSizeHalfPt - 2,
          }),
        ],
      })
    );

    letter.endorsements.forEach((end, idx) => {
      paragraphs.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${idx + 1}. ${end}`,
              font: headerFont,
              size: fontSizeHalfPt - 2,
            }),
          ],
        })
      );
    });
  }

  // 10. Construct genuine DOCX document
  const orientation = mergedSettings.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation,
            },
            margin: {
              top: mmToTwips(mergedSettings.marginTopMm || 20),
              bottom: mmToTwips(mergedSettings.marginBottomMm || 20),
              left: mmToTwips(mergedSettings.marginLeftMm || 25),
              right: mmToTwips(mergedSettings.marginRightMm || 20),
            },
          },
        },
        footers: mergedSettings.pageNumbering !== false ? {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ಪುಟ ಸಂಖ್ಯೆ: ',
                    font: headerFont,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: headerFont,
                    size: 16,
                  }),
                  new TextRun({
                    text: ' / ',
                    font: headerFont,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: headerFont,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
        } : undefined,
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Generates genuine formatted XLSX Excel Workbook for File-wise Letter Register.
 * Columns: Sl. No., File Number, File Name, Letter Number, Letter Date, Letter Type, Subject, Recipient, Employee Name, KGID, School Name, Created Date, Modified Date, Current Status, Print Status
 */
export function generateFileLettersExcelBuffer(
  file: MasterDocketFile,
  lettersList: EducationLetter[],
  options: { includeBodyText?: boolean } = {}
): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    'ಕ್ರಮ ಸಂಖ್ಯೆ (Sl. No.)',
    'ಕಡತ ಸಂಖ್ಯೆ (File Number)',
    'ಕಡತದ ವಿಷಯ (File Subject)',
    'ಪತ್ರ ಸಂಖ್ಯೆ (Letter Number)',
    'ಪತ್ರದ ದಿನಾಂಕ (Letter Date)',
    'ಪತ್ರದ ಪ್ರಕಾರ (Letter Type / Category)',
    'ಪತ್ರದ ವಿಷಯ (Subject)',
    'ಸ್ವೀಕೃತದಾರರು (Recipient)',
    'ನೌಕರರ ಹೆಸರು (Employee Name)',
    'ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID)',
    'ಶಾಲೆಯ ಹೆಸರು (School / Office)',
    'ವಿಭಾಗ (Section)',
    'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (Status)',
    'ಮುದ್ರಣ ಸ್ಥಿತಿ (Print Status)',
    'ಸೃಷ್ಟಿಸಿದ ದಿನಾಂಕ (Created Date)',
  ];

  if (options.includeBodyText) {
    headers.push('ಪತ್ರದ ಪೂರ್ಣ ಪಠ್ಯ (Full Letter Body Text)');
  }

  const rows = lettersList.map((letObj, idx) => {
    const rowData: any[] = [
      idx + 1,
      file.fileNumber,
      file.subject,
      letObj.referenceNumber,
      letObj.dateReceivedOrIssued,
      letObj.category || 'ಸಾಮಾನ್ಯ ಪತ್ರ',
      letObj.subject,
      letObj.recipientName || letObj.recipientDepartment || '-',
      (letObj as any).employeeName || '-',
      (letObj as any).kgidNumber || '-',
      letObj.recipientDepartment || (letObj as any).officeName || 'ಭದ್ರಾವತಿ',
      letObj.section || file.section,
      letObj.status || 'Active',
      letObj.status === 'Dispatched' ? 'Printed & Dispatched' : 'Pending Print',
      letObj.lastUpdated || letObj.dateReceivedOrIssued,
    ];

    if (options.includeBodyText) {
      rowData.push(letObj.bodyText || '');
    }

    return rowData;
  });

  const wsData = [
    // Header title block
    [`ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ - ಕಡತ ಪತ್ರಗಳ ನೋಂದಣಿ ವಹಿ (File Letters Register)`],
    [`ಕಡತ: ${file.fileNumber} (${file.fileCode || 'FILE'}) | ವಿಷಯ: ${file.subject} | ದಿನಾಂಕ: ${new Date().toISOString().split('T')[0]}`],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  const colWidths = [
    { wch: 8 },  // Sl No
    { wch: 18 }, // File Number
    { wch: 30 }, // File Subject
    { wch: 28 }, // Letter Number
    { wch: 14 }, // Date
    { wch: 22 }, // Category
    { wch: 40 }, // Subject
    { wch: 32 }, // Recipient
    { wch: 24 }, // Employee
    { wch: 14 }, // KGID
    { wch: 35 }, // School
    { wch: 20 }, // Section
    { wch: 16 }, // Status
    { wch: 18 }, // Print Status
    { wch: 16 }, // Created
  ];

  if (options.includeBodyText) {
    colWidths.push({ wch: 60 });
  }

  ws['!cols'] = colWidths;

  // Merge title banner across columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Letters_Register');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
