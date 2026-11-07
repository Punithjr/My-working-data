import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';

export interface DbOcrExtractedData {
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

export interface DbLetterVersion {
  versionNumber: number;
  updatedAt: string;
  updatedBy: string;
  letterHtml: string;
  letterText: string;
  notes?: string;
}

export interface DbGeneratedLetter {
  id: string; // e.g. gen-let-101
  documentId: string; // e.g. DOC-2026/09/LET-101
  letterNumber: string; // Official Letter / Order Number
  date: string; // YYYY-MM-DD
  letterType: string; // e.g. 'ಸಾಮಾನ್ಯ ಪತ್ರ', 'ಜ್ಞಾಪನಾ ಆದೇಶ', 'ಕಚೇರಿ ಆದೇಶ', etc.
  letterCategory: 'normal' | 'memorandum' | 'office_order' | 'leave' | 'increment' | 'certificate' | 'custom';

  // Linked original uploaded file
  originalFile?: {
    fileName: string;
    fileSize: string;
    fileType: string;
    uploadedAt: string;
    dataUrl?: string; // base64 or preview data
  };

  // OCR raw text & extracted structured fields
  ocrRawText?: string;
  ocrExtracted: DbOcrExtractedData;

  // Prompt / User instructions
  userPrompt: string;

  // Editable Letter Content
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

  // Linked Employee Details
  employeeName?: string;
  kgidNumber?: string;
  designation?: string;
  officeName?: string;
  department?: string;

  // Formatting options
  formatting?: {
    fontFamily: string;
    fontSize: string;
    lineSpacing: string;
    margins: string;
    hasHeader: boolean;
    hasFooter: boolean;
  };

  status: 'Draft' | 'Finalized' | 'Approved' | 'Dispatched';
  createdBy: string;
  createdAt: string;
  lastUpdated: string;

  // Version Control
  currentVersion: number;
  versions: DbLetterVersion[];
}

export interface DbLetterTemplate {
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

// 12 Default Letter Templates in Karnataka Government Format
export const DEFAULT_LETTER_TEMPLATES: DbLetterTemplate[] = [
  {
    id: 'tmpl-normal',
    typeKey: 'normal',
    nameKannada: 'ಸಾಮಾನ್ಯ ಪತ್ರ',
    nameEnglish: 'Normal Letter',
    category: 'General Correspondence',
    description: 'ಇಲಾಖಾ ಅಧಿಕಾರಿಗಳು, ಶಾಲೆಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕರಿಗೆ ಕಳುಹಿಸುವ ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಪತ್ರ',
    defaultSubject: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದಲ್ಲಿ ಶಾಲಾ ಕಾರ್ಯಕ್ರಮಗಳ ಅನುಷ್ಠಾನ ಕುರಿತು.',
    defaultReference: 'ಸಂಬಂಧಪಟ್ಟ ಕಛೇರಿಯ ಪತ್ರ ಸಂಖ್ಯೆ ಹಾಗೂ ದಿನಾಂಕ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಪತ್ರ ಸಂಖ್ಯೆ: BEO/BHD/GEN/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p>ಇವರಿಗೆ,<br/>{{recipient}}</p>
<p>ಮಾನ್ಯರೇ,<br/><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಸರ್ಕಾರದ ನಿರ್ದೇಶನದಂತೆ ಅಗತ್ಯ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಈ ಮೂಲಕ ಸೂಚಿಸಲಾಗಿದೆ.</p>
<p style="text-indent: 3em;">ಈ ಸಂಬಂಧ ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ನಿಗದಿತ ನಮೂನೆಯಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿ ಈ ಕಛೇರಿಗೆ ಮೂರು ದಿನಗಳ ಒಳಗಾಗಿ ಸಲ್ಲಿಸಲು ತಿಳಿಸಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;">ತಮ್ಮ ನಂಬುಗೆಯ,<br/><br/><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಪತ್ರ ಸಂಖ್ಯೆ: BEO/BHD/GEN/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

ಇವರಿಗೆ,
{{recipient}}

ಮಾನ್ಯರೇ,
ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಸರ್ಕಾರದ ನಿರ್ದೇಶನದಂತೆ ಅಗತ್ಯ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಈ ಮೂಲಕ ಸೂಚಿಸಲಾಗಿದೆ.

ಈ ಸಂಬಂಧ ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ನಿಗದಿತ ನಮೂನೆಯಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿ ಈ ಕಛೇರಿಗೆ ಮೂರು ದಿನಗಳ ಒಳಗಾಗಿ ಸಲ್ಲಿಸಲು ತಿಳಿಸಿದೆ.

ತಮ್ಮ ನಂಬುಗೆಯ,

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ರವರಿಗೆ ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.',
      'ಸಂಬಂಧಪಟ್ಟ ಶಾಲೆಗಳ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರಿಗೆ ಸೂಕ್ತ ಕ್ರಮಕ್ಕಾಗಿ.',
      'ಕಛೇರಿ ಕಡತ / ಆದೇಶ ಪುಸ್ತಕ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-memorandum',
    typeKey: 'memorandum',
    nameKannada: 'ಜ್ಞಾಪನಾ ಆದೇಶ',
    nameEnglish: 'Memorandum Order',
    category: 'Service Sanctions',
    description: 'ವೇತನ ಬಡ್ತಿ, ಸೇವಾ ಸೌಲಭ್ಯಗಳು ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆಗಳ ಜ್ಞಾಪನಾ ಆದೇಶ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಸೇವಾ ನಿಯಮಾನುಸಾರ ಸೌಲಭ್ಯ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.',
    defaultReference: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSRs) ಮತ್ತು ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಸೇವಾ ದಾಖಲೆಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಜ್ಞಾಪನ ಸಂಖ್ಯೆ: BEO/BHD/MEMO/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಜ್ಞಾಪನಾ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>{{preamble}}</p>
<p><strong>ಆದೇಶ:</strong><br/>{{orderText}}</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಜ್ಞಾಪನ ಸಂಖ್ಯೆ: BEO/BHD/MEMO/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಜ್ಞಾಪನಾ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
{{preamble}}

ಆದೇಶ:
{{orderText}}

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ ಮಾಹಿತಿ ಮತ್ತು ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಖಜಾನಾಧಿಕಾರಿಗಳು, ತಾಲ್ಲೂಕು ಖಜಾನೆ, ಭದ್ರಾವತಿ ರವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-office-order',
    typeKey: 'office_order',
    nameKannada: 'ಕಚೇರಿ ಆದೇಶ',
    nameEnglish: 'Office Order',
    category: 'Internal Administration',
    description: 'ಕಛೇರಿಯ ಆಂತರಿಕ ಕಾರ್ಯ ಹಂಚಿಕೆ, ಪ್ರಭಾರ ವಹಿಸುವಿಕೆ ಹಾಗೂ ಆಡಳಿತ ನಿರ್ದೇಶನಗಳು',
    defaultSubject: 'ಕಛೇರಿಯ ಆಡಳಿತಾತ್ಮಕ ಕಾರ್ಯ ಹಂಚಿಕೆ ಹಾಗೂ ಕರ್ತವ್ಯ ನಿಯೋಜನೆ ಕುರಿತು.',
    defaultReference: 'ಕಛೇರಿಯ ಸಮಗ್ರ ಕಾರ್ಯಕ್ಷಮತೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಹಿತದೃಷ್ಟಿಯಿಂದ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂಖ್ಯೆ: BEO/BHD/ADMIN/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಕಚೇರಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">ಕಛೇರಿಯ ದೈನಂದಿನ ಆಡಳಿತಾತ್ಮಕ ಕಾರ್ಯಗಳು ಸುಗಮವಾಗಿ ನಡೆಯುವ ಹಿತದೃಷ್ಟಿಯಿಂದ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಪರಿಣಾಮಕಾರಿ ಅನುಷ್ಠಾನಕ್ಕಾಗಿ ಈ ಕೆಳಗಿನಂತೆ ಕಚೇರಿ ಆದೇಶವನ್ನು ಹೊರಡಿಸಲಾಗಿದೆ.</p>
<p style="text-indent: 3em;">{{bodyText}}</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂಖ್ಯೆ: BEO/BHD/ADMIN/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಕಚೇರಿ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಕಛೇರಿಯ ದೈನಂದಿನ ಆಡಳಿತಾತ್ಮಕ ಕಾರ್ಯಗಳು ಸುಗಮವಾಗಿ ನಡೆಯುವ ಹಿತದೃಷ್ಟಿಯಿಂದ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಪರಿಣಾಮಕಾರಿ ಅನುಷ್ಠಾನಕ್ಕಾಗಿ ಈ ಕೆಳಗಿನಂತೆ ಕಚೇರಿ ಆದೇಶವನ್ನು ಹೊರಡಿಸಲಾಗಿದೆ.

{{bodyText}}

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟ ಅಧಿಕಾರಿಗಳು / ಸಿಬ್ಬಂದಿಗಳಿಗೆ ತಕ್ಷಣದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಪಾಲಿಸಲು.',
      'ಕಛೇರಿಯ ಎಲ್ಲಾ ಶಾಖಾ ಮುಖ್ಯಸ್ಥರಿಗೆ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-leave-order',
    typeKey: 'leave_order',
    nameKannada: 'ರಜೆ ಆದೇಶ',
    nameEnglish: 'Leave Order',
    category: 'Leave Sanction',
    description: 'ಸಾಮಾನ್ಯ, ಪರಿವರ್ತಿತ ಅಥವಾ ವೈದ್ಯಕೀಯ ರಜೆ ಮಂಜೂರಾತಿ ಅಧಿಕೃತ ಆದೇಶ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ರಜೆ ಮಂಜೂರಾತಿ ಮಾಡುವ ಕುರಿತು.',
    defaultReference: '1. ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ.<br/>2. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳ (KCSRs) ರಜಾ ನಿಯಮಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂಖ್ಯೆ: BEO/BHD/LEAVE/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">ಉಲ್ಲೇಖ (1) ರ ಅರ್ಜಿಯಲ್ಲಿ ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, ಇವರು ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಿಗಾಗಿ ಕೋರಿರುವ ರಜೆಯನ್ನು ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮಾನುಸಾರ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.</p>
<p style="text-indent: 3em;">ಸದರಿ ರಜಾ ಅವಧಿಯನ್ನು ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ಸೂಕ್ತವಾಗಿ ದಾಖಲಿಸಲು ಸಂಬಂಧಪಟ್ಟ ಕಛೇರಿ/ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂಖ್ಯೆ: BEO/BHD/LEAVE/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಉಲ್ಲೇಖ (1) ರ ಅರ್ಜಿಯಲ್ಲಿ ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, ಇವರು ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಿಗಾಗಿ ಕೋರಿರುವ ರಜೆಯನ್ನು ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮಾನುಸಾರ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.

ಸದರಿ ರಜಾ ಅವಧಿಯನ್ನು ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ಸೂಕ್ತವಾಗಿ ದಾಖಲಿಸಲು ಸಂಬಂಧಪಟ್ಟ ಕಛೇರಿ/ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-earned-leave',
    typeKey: 'earned_leave',
    nameKannada: 'ಗಳಿಕೆ ರಜೆ ಆದೇಶ',
    nameEnglish: 'Earned Leave Order',
    category: 'Leave Sanction',
    description: 'ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮಾವಳಿಗಳಡಿ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಮಾಡುವ ಕುರಿತು.',
    defaultReference: '1. ನೌಕರರ ಗಳಿಕೆ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ.<br/>2. ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/EL/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ತಮ್ಮ ಅರ್ಜಿಯಲ್ಲಿ ಗೃಹ ನಿರ್ಮಾಣ / ವೈದ್ಯಕೀಯ / ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಿಗಾಗಿ ಗಳಿಕೆ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ಅವರ ರಜಾ ಲೆಕ್ಕಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ ಅವರ ಖಾತೆಯಲ್ಲಿ ರಜೆ ಶಿಲ್ಕಿರುವುದು ದೃಢಪಟ್ಟಿದೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ ಗಳಿಕೆ ರಜೆಯನ್ನು ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/EL/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ತಮ್ಮ ಅರ್ಜಿಯಲ್ಲಿ ಗೃಹ ನಿರ್ಮಾಣ / ವೈದ್ಯಕೀಯ / ವೈಯಕ್ತಿಕ ಕಾರಣಗಳಿಗಾಗಿ ಗಳಿಕೆ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ಅವರ ರಜಾ ಲೆಕ್ಕಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ ಅವರ ಖಾತೆಯಲ್ಲಿ ರಜೆ ಶಿಲ್ಕಿರುವುದು ದೃಢಪಟ್ಟಿದೆ.

ಆದೇಶ:
ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}} ಇವರಿಗೆ ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ ಗಳಿಕೆ ರಜೆಯನ್ನು ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ರಜಾ ಲೆಕ್ಕ ದಾಖಲಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-child-care-leave',
    typeKey: 'child_care_leave',
    nameKannada: 'ಶಿಶುಪಾಲನ ರಜೆ ಆದೇಶ',
    nameEnglish: 'Child Care Leave Order',
    category: 'Leave Sanction',
    description: 'ಮಹಿಳಾ ನೌಕರರಿಗೆ ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave) ಮಂಜೂರಾತಿ ಆದೇಶ',
    defaultSubject: 'ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.',
    defaultReference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಸಿಆಸುಇ 18 ಎಸ್‌ಆರ್‌ಆರ್ 2021, ದಿನಾಂಕ: 04-01-2021.<br/>2. ಸಂಬಂಧಪಟ್ಟ ಮಹಿಳಾ ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/CCL/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ತಮ್ಮ ಅಪ್ರಾಪ್ತ ಮಗುವಿನ ಪಾಲನೆ / ವಿದ್ಯಾಭ್ಯಾಸ / ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆಗಾಗಿ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿರುತ್ತಾರೆ. ಸರ್ಕಾರದ ಆದೇಶದನ್ವಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಸರ್ಕಾರದ ಆದೇಶದ ನಿಯಮಾವಳಿಗಳಿಗೆ ಒಳಪಟ್ಟು ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/CCL/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ತಮ್ಮ ಅಪ್ರಾಪ್ತ ಮಗುವಿನ ಪಾಲನೆ / ವಿದ್ಯಾಭ್ಯಾಸ / ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆಗಾಗಿ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿರುತ್ತಾರೆ. ಸರ್ಕಾರದ ಆದೇಶದನ್ವಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.

ಆದೇಶ:
ಸರ್ಕಾರದ ಆದೇಶದ ನಿಯಮಾವಳಿಗಳಿಗೆ ಒಳಪಟ್ಟು ಶ್ರೀಮತಿ {{employeeName}}, {{designation}} ಇವರಿಗೆ ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀಮತಿ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ರಜೆ ನಮೂದಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-increment-order',
    typeKey: 'increment_order',
    nameKannada: 'ವೇತನ ಬಡ್ತಿ ಆದೇಶ',
    nameEnglish: 'Salary Increment Order',
    category: 'Salary Revision',
    description: 'ವಾರ್ಷಿಕ ಸ್ಥಗಿತವಿಲ್ಲದ ಸಾಮಾನ್ಯ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಆದೇಶ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    defaultReference: '1. ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 51 ರ ಅನ್ವಯ.<br/>2. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವೇತನ ಪರಿಷ್ಕರಣೆ) ನಿಯಮಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/INC/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ಒಂದು ವರ್ಷದ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ, ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 51 ರನ್ವಯ ಅವರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಈ ಕೆಳಗಿನಂತೆ ಆದೇಶಿಸಿದೆ.</p>
<p style="text-indent: 3em;">ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ: <strong>₹{{oldBasicPay}}</strong> ನಿಂದ ಮುಂದಿನ ಹಂತದ ಮೂಲ ವೇತನ: <strong>₹{{newBasicPay}}</strong> ಕ್ಕೆ ದಿನಾಂಕ: <strong>{{effectiveDate}}</strong> ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/INC/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಆದೇಶ ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ಒಂದು ವರ್ಷದ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ, ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 51 ರನ್ವಯ ಅವರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಈ ಕೆಳಗಿನಂತೆ ಆದೇಶಿಸಿದೆ.

ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ: ₹{{oldBasicPay}} ನಿಂದ ಮುಂದಿನ ಹಂತದ ಮೂಲ ವೇತನ: ₹{{newBasicPay}} ಕ್ಕೆ ದಿನಾಂಕ: {{effectiveDate}} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಖಜಾನಾಧಿಕಾರಿಗಳು, ತಾಲ್ಲೂಕು ಖಜಾನೆ, ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-time-bound-increment',
    typeKey: 'time_bound_increment',
    nameKannada: 'ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಆದೇಶ',
    nameEnglish: 'Time Bound Scale Order',
    category: 'Salary Revision',
    description: '10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ (TBS) ಜ್ಞಾಪನಾ ಆದೇಶ',
    defaultSubject: '10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.',
    defaultReference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018, ದಿನಾಂಕ: 19-04-2018.<br/>2. ನೌಕರರ ಸೇವಾ ದಾಖಲೆಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/TBS/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಜ್ಞಾಪನಾ ಆದೇಶ (10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, ಇವರು ದಿನಾಂಕ: <strong>{{appointmentDate}}</strong> ರಂದು ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಪ್ರವೇಶಿಸಿದ್ದು, ದಿನಾಂಕ: <strong>{{effectiveDate}}</strong> ರ ಹೊತ್ತಿಗೆ 10 ವರ್ಷಗಳ ನಿರಂತರ ಮತ್ತು ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುತ್ತಾರೆ. ಅವರ ವಿರುದ್ಧ ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ 10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಇವರ ಮೂಲ ವೇತನವನ್ನು ಹಳೆಯ ಮೂಲ ವೇತನ: <strong>₹{{oldBasicPay}}</strong> ನಿಂದ ಹೊಸ ಮೂಲ ವೇತನ: <strong>₹{{newBasicPay}}</strong> ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/TBS/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಜ್ಞಾಪನಾ ಆದೇಶ (10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, ಇವರು ದಿನಾಂಕ: {{appointmentDate}} ರಂದು ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಪ್ರವೇಶಿಸಿದ್ದು, ದಿನಾಂಕ: {{effectiveDate}} ರ ಹೊತ್ತಿಗೆ 10 ವರ್ಷಗಳ ನಿರಂತರ ಮತ್ತು ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುತ್ತಾರೆ. ಅವರ ವಿರುದ್ಧ ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲ.

ಆದೇಶ:
ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}} ಇವರಿಗೆ 10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಇವರ ಮೂಲ ವೇತನವನ್ನು ಹಳೆಯ ಮೂಲ ವೇತನ: ₹{{oldBasicPay}} ನಿಂದ ಹೊಸ ಮೂಲ ವೇತನ: ₹{{newBasicPay}} ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ.',
      'ತಾಲ್ಲೂಕು ಖಜಾನಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-auto-advancement-increment',
    typeKey: 'auto_advancement_increment',
    nameKannada: 'ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ ಆದೇಶ',
    nameEnglish: 'Automatic Advancement Scale Order',
    category: 'Salary Revision',
    description: '15 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆ ಪೂರ್ಣಗೊಳಿಸಿದ ನೌಕರರಿಗೆ ಸ್ವಯಂಚಾಲಿತ ಬಡ್ತಿ (AAS) ಜ್ಞಾಪನ',
    defaultSubject: '15 ವರ್ಷಗಳ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಶ್ರೇಣಿ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.',
    defaultReference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018.<br/>2. ನೌಕರರ 15 ವರ್ಷಗಳ ಸೇವಾ ವಿವರಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/AAS/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಜ್ಞಾಪನಾ ಆದೇಶ (15 ವರ್ಷದ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಬಡ್ತಿ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು 15 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವಾವಧಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದು, ಮುಂಬಡ್ತಿ ಹುದ್ದೆ ಲಭ್ಯವಿಲ್ಲದ ಕಾರಣ ಸ್ವಯಂಚಾಲಿತ ಬಡ್ತಿ ಶ್ರೇಣಿಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong> ಇವರಿಗೆ 15 ವರ್ಷಗಳ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಅವರ ಮೂಲ ವೇತನವನ್ನು <strong>₹{{oldBasicPay}}</strong> ನಿಂದ <strong>₹{{newBasicPay}}</strong> ಕ್ಕೆ ದಿನಾಂಕ: <strong>{{effectiveDate}}</strong> ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/AAS/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಜ್ಞಾಪನಾ ಆದೇಶ (15 ವರ್ಷದ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಬಡ್ತಿ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು 15 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವಾವಧಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದು, ಮುಂಬಡ್ತಿ ಹುದ್ದೆ ಲಭ್ಯವಿಲ್ಲದ ಕಾರಣ ಸ್ವಯಂಚಾಲಿತ ಬಡ್ತಿ ಶ್ರೇಣಿಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ.

ಆದೇಶ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}} ಇವರಿಗೆ 15 ವರ್ಷಗಳ ಸ್ವಯಂಚಾಲಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಅವರ ಮೂಲ ವೇತನವನ್ನು ₹{{oldBasicPay}} ನಿಂದ ₹{{newBasicPay}} ಕ್ಕೆ ದಿನಾಂಕ: {{effectiveDate}} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ತಾಲ್ಲೂಕು ಖಜಾನಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-service-certificate',
    typeKey: 'service_certificate',
    nameKannada: 'ಸೇವಾ ದೃಢೀಕರಣ ಪತ್ರ',
    nameEnglish: 'Service Certificate',
    category: 'Certificates',
    description: 'ಸರ್ಕಾರಿ ನೌಕರರ ಅಧಿಕೃತ ಸೇವಾ ದೃಢೀಕರಣ ಪ್ರಮಾಣ ಪತ್ರ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರ ಸೇವಾ ದೃಢೀಕರಣ ಪ್ರಮಾಣ ಪತ್ರ.',
    defaultReference: 'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಕೋರಿಕೆ ಅರ್ಜಿ ಹಾಗೂ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/CERT/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center; margin-top: 20px;"><strong>:: ಸೇವಾ ದೃಢೀಕರಣ ಪ್ರಮಾಣ ಪತ್ರ ::</strong></p>
<p style="text-indent: 3em; margin-top: 20px; line-height: 1.8;">ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID ಸಂಖ್ಯೆ: <strong>{{kgidNumber}}</strong>) ಇವರು ದಿನಾಂಕ: <strong>{{appointmentDate}}</strong> ರಿಂದ ಈ ಕಛೇರಿಯ ವ್ಯಾಪ್ತಿಯ <strong>{{officeName}}</strong> ನಲ್ಲಿ ನಿಯಮಿತ ಸರ್ಕಾರಿ ನೌಕರರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿದ್ದಾರೆಂದು ಈ ಮೂಲಕ ದೃಢೀಕರಿಸಲಾಗಿದೆ.</p>
<p style="text-indent: 3em; line-height: 1.8;">ಇವರ ಸೇವಾವಧಿಯಲ್ಲಿ ಇವರ ನಡತೆ ಮತ್ತು ಕರ್ತವ್ಯ ನಿಷ್ಠೆಯು ಉತ್ತಮವಾಗಿದ್ದು, ಯಾವುದೇ ಶಿಸ್ತು ಕ್ರಮಗಳು ಇರುವುದಿಲ್ಲವೆಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ. ಈ ಪ್ರಮಾಣ ಪತ್ರವನ್ನು ನೌಕರರ ವೈಯಕ್ತಿಕ ಕೋರಿಕೆಯ ಮೇರೆಗೆ ನೀಡಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 50px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/CERT/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಸೇವಾ ದೃಢೀಕರಣ ಪ್ರಮಾಣ ಪತ್ರ ::

ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID ಸಂಖ್ಯೆ: {{kgidNumber}}) ಇವರು ದಿನಾಂಕ: {{appointmentDate}} ರಿಂದ ಈ ಕಛೇರಿಯ ವ್ಯಾಪ್ತಿಯ {{officeName}} ನಲ್ಲಿ ನಿಯಮಿತ ಸರ್ಕಾರಿ ನೌಕರರಾಗಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿದ್ದಾರೆಂದು ಈ ಮೂಲಕ ದೃಢೀಕರಿಸಲಾಗಿದೆ.

ಇವರ ಸೇವಾವಧಿಯಲ್ಲಿ ಇವರ ನಡತೆ ಮತ್ತು ಕರ್ತವ್ಯ ನಿಷ್ಠೆಯು ಉತ್ತಮವಾಗಿದ್ದು, ಯಾವುದೇ ಶಿಸ್ತು ಕ್ರಮಗಳು ಇರುವುದಿಲ್ಲವೆಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ. ಈ ಪ್ರಮಾಣ ಪತ್ರವನ್ನು ನೌಕರರ ವೈಯಕ್ತಿಕ ಕೋರಿಕೆಯ ಮೇರೆಗೆ ನೀಡಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}} ರವರಿಗೆ ನೀಡಲಾಗಿದೆ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-experience-certificate',
    typeKey: 'experience_certificate',
    nameKannada: 'ಅನುಭವ ಪ್ರಮಾಣ ಪತ್ರ',
    nameEnglish: 'Experience Certificate',
    category: 'Certificates',
    description: 'ಬೋಧನಾ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅನುಭವ ದೃಢೀಕರಿಸುವ ಪ್ರಮಾಣ ಪತ್ರ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರ ಅನುಭವ ಪ್ರಮಾಣ ಪತ್ರ.',
    defaultReference: 'ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಕೋರಿಕೆ ಮತ್ತು ಶಾಲಾ ತಪಾಸಣಾ ದಾಖಲೆಗಳು.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/EXP/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center; margin-top: 20px;"><strong>:: ಅನುಭವ ಪ್ರಮಾಣ ಪತ್ರ (EXPERIENCE CERTIFICATE) ::</strong></p>
<p style="text-indent: 3em; margin-top: 20px; line-height: 1.8;">ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ದಿನಾಂಕ: <strong>{{appointmentDate}}</strong> ರಿಂದ ಇಂದಿನವರೆಗೆ ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದಲ್ಲಿ ಶ್ಲಾಘನೀಯ ಬೋಧನಾ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅನುಭವವನ್ನು ಹೊಂದಿರುತ್ತಾರೆಂದು ಈ ಮೂಲಕ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.</p>
<p style="text-indent: 3em; line-height: 1.8;">ಇವರು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಅವಧಿಯಲ್ಲಿ ಶಾಲಾ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿಗೆ ಸಕ್ರಿಯವಾಗಿ ಕೊಡುಗೆ ನೀಡಿರುತ್ತಾರೆ.</p>
<p style="text-align: right; margin-top: 50px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/EXP/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಅನುಭವ ಪ್ರಮಾಣ ಪತ್ರ (EXPERIENCE CERTIFICATE) ::

ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ದಿನಾಂಕ: {{appointmentDate}} ರಿಂದ ಇಂದಿನವರೆಗೆ ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದಲ್ಲಿ ಶ್ಲಾಘನೀಯ ಬೋಧನಾ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅನುಭವವನ್ನು ಹೊಂದಿರುತ್ತಾರೆಂದು ಈ ಮೂಲಕ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.

ಇವರು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಅವಧಿಯಲ್ಲಿ ಶಾಲಾ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿಗೆ ಸಕ್ರಿಯವಾಗಿ ಕೊಡುಗೆ ನೀಡಿರುತ್ತಾರೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}} ರವರಿಗೆ ನೀಡಲಾಗಿದೆ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-custom',
    typeKey: 'custom',
    nameKannada: 'Custom Letter',
    nameEnglish: 'Custom Government Letter',
    category: 'Custom Correspondence',
    description: 'ಯಾವುದೇ ವಿಶೇಷ ಉದ್ದೇಶಕ್ಕಾಗಿ ಅಗತ್ಯಕ್ಕನುಗುಣವಾಗಿ ಸಿದ್ಧಪಡಿಸುವ ಕಸ್ಟಮ್ ಪತ್ರ',
    defaultSubject: 'ವಿಶೇಷ ಆಡಳಿತಾತ್ಮಕ ವಿಷಯ ಕುರಿತು.',
    defaultReference: 'ಸಂಬಂಧಪಟ್ಟ ನಿರ್ದೇಶನಗಳು ಹಾಗೂ ಕಛೇರಿ ಕಡತ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/CUST/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">{{bodyText}}</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/CUST/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

{{bodyText}}

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಸಂಬಂಧಪಟ್ಟವರಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-01',
  },
  {
    id: 'tmpl-stagnation-increment',
    typeKey: 'stagnation_increment',
    nameKannada: 'ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿ ಆದೇಶ',
    nameEnglish: 'Stagnation Increment Order',
    category: 'Salary Revision',
    description: 'ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿ ತಲುಪಿ 2 ವರ್ಷ ಸೇವೆ ಸಲ್ಲಿಸಿದ ನೌಕರರಿಗೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ / ಭರ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    defaultSubject: 'ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯಲ್ಲಿದ್ದು 2 ವರ್ಷ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.',
    defaultReference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 16 ಎಸ್ಆರ್ಪಿ 2018, ದಿನಾಂಕ: 07-03-2018.<br/>2. ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 51A ಹಾಗೂ ವೇತನ ಆಯೋಗ ನಿಯಮಾವಳಿಗಳು.<br/>3. ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕ ಹಾಗೂ ಪ್ರಸ್ತಾವನೆ ದಿನಾಂಕ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/STAG-INC/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ (ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿ / ಬಡ್ತಿ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ತಮ್ಮ ಹಾಲಿ ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯಾದ ₹<strong>{{oldBasicPay}}</strong>/- ನ್ನು ತಲುಪಿದ್ದು, ಸದರಿ ಗರಿಷ್ಠ ಹಂತದಲ್ಲಿ ನಿರಂತರವಾಗಿ 2 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿರುತ್ತಾರೆ. ಸರ್ಕಾರದ ಆದೇಶ ಹಾಗೂ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಇವರಿಗೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಅರ್ಹರಿರುತ್ತಾರೆಂದು ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಮೇಲ್ಕಂಡ ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ ನಿಯಮಾನುಸಾರ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು (Stagnation Increment) ಮಂಜೂರು ಮಾಡಿ, ಇವರ ಮೂಲ ವೇತನವನ್ನು ₹<strong>{{oldBasicPay}}</strong>/- ನಿಂದ ₹<strong>{{newBasicPay}}</strong>/- ಕ್ಕೆ ದಿನಾಂಕ: <strong>{{effectiveDate}}</strong> ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/STAG-INC/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ (ಸ್ಥಗಿತ ವೇತನ ಭರ್ತಿ / ಬಡ್ತಿ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ತಮ್ಮ ಹಾಲಿ ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯಾದ ₹{{oldBasicPay}}/- ನ್ನು ತಲುಪಿದ್ದು, ಸದರಿ ಗರಿಷ್ಠ ಹಂತದಲ್ಲಿ ನಿರಂತರವಾಗಿ 2 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿರುತ್ತಾರೆ. ಸರ್ಕಾರದ ಆದೇಶ ಹಾಗೂ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಇವರಿಗೆ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಅರ್ಹರಿರುತ್ತಾರೆಂದು ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.

ಆದೇಶ:
ಮೇಲ್ಕಂಡ ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}} ಇವರಿಗೆ ನಿಯಮಾನುಸಾರ ಸ್ಥಗಿತ ವೇತನ ಬಡ್ತಿಯನ್ನು (Stagnation Increment) ಮಂಜೂರು ಮಾಡಿ, ಇವರ ಮೂಲ ವೇತನವನ್ನು ₹{{oldBasicPay}}/- ನಿಂದ ₹{{newBasicPay}}/- ಕ್ಕೆ ದಿನಾಂಕ: {{effectiveDate}} ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ನಿಗದಿಪಡಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ.',
      'ತಾಲ್ಲೂಕು ಖಜಾನಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-16',
  },
  {
    id: 'tmpl-earned-leave-encashment',
    typeKey: 'earned_leave_encashment',
    nameKannada: 'ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ ಆದೇಶ',
    nameEnglish: 'Earned Leave Encashment Order',
    category: 'Leave Sanction',
    description: 'ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರನ್ವಯ 15 ಅಥವಾ 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ (ನಗದೀಕರಣ) ಮತ್ತು ಭತ್ಯೆ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    defaultSubject: 'ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ (ನಗದೀಕರಣ) ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    defaultReference: '1. ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮಾವಳಿ 118 ಹಾಗೂ ತಿದ್ದುಪಡಿ ನಿಯಮಗಳು.<br/>2. ನೌಕರರ ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ ಕೋರಿಕೆ ಅರ್ಜಿ ದಿನಾಂಕ.<br/>3. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ರಜಾ ಲೆಕ್ಕಪತ್ರ ಶಿಲ್ಕು ಪರಿಶೀಲನಾ ವರದಿ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/EL-ENCASH/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಅಧಿಕೃತ ಜ್ಞಾಪನ (ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ / ನಗದೀಕರಣ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ತಮ್ಮ ಖಾತೆಯಲ್ಲಿರುವ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕಿನಲ್ಲಿ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರ ಅನ್ವಯ 15 ದಿನಗಳ / 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ನಗರೀಕರಣಗೊಳಿಸಲು (Encashment / Surrender) ಕೋರಿರುತ್ತಾರೆ. ಇವರ ರಜಾ ಲೆಕ್ಕಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ ನಿಯಮಾನುಸಾರ ಕನಿಷ್ಠ ರಜೆ ಶಿಲ್ಕು ಖಾತೆಯಲ್ಲಿದ್ದು ರಜೆ ನಗರೀಕರಣಕ್ಕೆ ಅರ್ಹತೆ ಹೊಂದಿರುತ್ತಾರೆಂದು ದೃಢೀಕರಿಸಲಾಗಿದೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವಂತೆ, ಶ್ರೀ/ಶ್ರೀಮತಿ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರನ್ವಯ ಒಟ್ಟು ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ನಗರೀಕರಣಗೊಳಿಸಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಸದರಿ ನಗರೀಕರಣಗೊಂಡ ರಜಾ ದಿನಗಳಿಗೆ ತತ್ಸಮಾನವಾದ ವೇತನ ಮತ್ತು ತುಟ್ಟಿಭತ್ಯೆಯನ್ನು ನೌಕರರಿಗೆ ಬಿಡುಗಡೆ ಮಾಡಲು ಹಾಗೂ ಅವರ ರಜಾ ಲೆಕ್ಕ ಪುಸ್ತಕದಲ್ಲಿ ದಿನಗಳನ್ನು ಕಡಿತಗೊಳಿಸಿ ದಾಖಲಿಸಲು ಆದೇಶಿಸಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/EL-ENCASH/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಅಧಿಕೃತ ಜ್ಞಾಪನ (ಗಳಿಕೆ ರಜೆ ನಗರೀಕರಣ / ನಗದೀಕರಣ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ತಮ್ಮ ಖಾತೆಯಲ್ಲಿರುವ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕಿನಲ್ಲಿ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರ ಅನ್ವಯ 15 ದಿನಗಳ / 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ನಗರೀಕರಣಗೊಳಿಸಲು (Encashment / Surrender) ಕೋರಿರುತ್ತಾರೆ. ಇವರ ರಜಾ ಲೆಕ್ಕಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ ನಿಯಮಾನುಸಾರ ಕನಿಷ್ಠ ರಜೆ ಶಿಲ್ಕು ಖಾತೆಯಲ್ಲಿದ್ದು ರಜೆ ನಗರೀಕರಣಕ್ಕೆ ಅರ್ಹತೆ ಹೊಂದಿರುತ್ತಾರೆಂದು ದೃಢೀಕರಿಸಲಾಗಿದೆ.

ಆದೇಶ:
ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವಂತೆ, ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, {{designation}} ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 118 ರನ್ವಯ ಒಟ್ಟು ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ನಗರೀಕರಣಗೊಳಿಸಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಸದರಿ ನಗರೀಕರಣಗೊಂಡ ರಜಾ ದಿನಗಳಿಗೆ ತತ್ಸಮಾನವಾದ ವೇತನ ಮತ್ತು ತುಟ್ಟಿಭತ್ಯೆಯನ್ನು ನೌಕರರಿಗೆ ಬಿಡುಗಡೆ ಮಾಡಲು ಹಾಗೂ ಅವರ ರಜಾ ಲೆಕ್ಕ ಪುಸ್ತಕದಲ್ಲಿ ದಿನಗಳನ್ನು ಕಡಿತಗೊಳಿಸಿ ದಾಖಲಿಸಲು ಆದೇಶಿಸಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ/ಶ್ರೀಮತಿ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ರಜೆ ನಗರೀಕರಣ ದಾಖಲಿಸಲು.',
      'ಸಹಾಯಕ ಲೆಕ್ಕಾಧಿಕಾರಿಗಳು / ವೇತನ ಶಾಖೆಗೆ ಬಿಲ್ ಸಿದ್ಧಪಡಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-16',
  },
  {
    id: 'tmpl-paternity-leave',
    typeKey: 'paternity_leave',
    nameKannada: 'ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ',
    nameEnglish: 'Paternity Leave Order',
    category: 'Leave Sanction',
    description: 'ವಿವಾಹಿತ ಪುರುಷ ನೌಕರರಿಗೆ ಮಗುವಿನ ಜನನದ ಸಂದರ್ಭದಲ್ಲಿ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-A ಅನ್ವಯ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ',
    defaultSubject: 'ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    defaultReference: '1. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 05 ಎಸ್ಆರ್ಎಸ್ 2012, ದಿನಾಂಕ: 14-06-2012.<br/>2. ಕೆಸಿಎಸ್ಆರ್ ರಜಾ ನಿಯಮ 135-A.<br/>3. ನೌಕರರ ಅರ್ಜಿ ಹಾಗೂ ಆಸ್ಪತ್ರೆ / ಜನನ ಪ್ರಮಾಣ ಪತ್ರ ದಾಖಲೆ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/PAT-LEAVE/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಅಧಿಕೃತ ಜ್ಞಾಪನ (ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong>, (KGID: <strong>{{kgidNumber}}</strong>) ಇವರು ತಮ್ಮ ಪತ್ನಿಯ ಪ್ರಸವ ಸಂದರ್ಭದಲ್ಲಿ ನವಜಾತ ಶಿಶುವಿನ ಪಾಲನೆಗಾಗಿ ಪಿತೃತ್ವ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿ ಆಸ್ಪತ್ರೆಯ ವೈದ್ಯಕೀಯ / ಜನನ ಪ್ರಮಾಣ ಪತ್ರದೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ. ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ, ಸದರಿ ನೌಕರರಿಗೆ ಇಬ್ಬರಿಗಿಂತ ಕಡಿಮೆ ಜೀವಂತ ಮಕ್ಕಳಿದ್ದು, ನಿಯಮಾವಳಿಗಳಂತೆ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆಂದು ಕಂಡುಬಂದಿದೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಮೇಲ್ಕಂಡ ಪ್ರಸ್ತಾವನೆಯ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ <strong>{{employeeName}}</strong>, <strong>{{designation}}</strong> ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-A ಹಾಗೂ ಸರ್ಕಾರದ ಆದೇಶದನ್ವಯ ದಿನಾಂಕ: <strong>{{effectiveDate}}</strong> ರಿಂದ ಒಟ್ಟು <strong>15 ದಿನಗಳ</strong> ಪಿತೃತ್ವ ರಜೆಯನ್ನು (Paternity Leave) ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/PAT-LEAVE/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಅಧಿಕೃತ ಜ್ಞಾಪನ (ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ {{employeeName}}, {{designation}}, (KGID: {{kgidNumber}}) ಇವರು ತಮ್ಮ ಪತ್ನಿಯ ಪ್ರಸವ ಸಂದರ್ಭದಲ್ಲಿ ನವಜಾತ ಶಿಶುವಿನ ಪಾಲನೆಗಾಗಿ ಪಿತೃತ್ವ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡುವಂತೆ ಕೋರಿ ಆಸ್ಪತ್ರೆಯ ವೈದ್ಯಕೀಯ / ಜನನ ಪ್ರಮಾಣ ಪತ್ರದೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ. ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ, ಸದರಿ ನೌಕರರಿಗೆ ಇಬ್ಬರಿಗಿಂತ ಕಡಿಮೆ ಜೀವಂತ ಮಕ್ಕಳಿದ್ದು, ನಿಯಮಾವಳಿಗಳಂತೆ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆಂದು ಕಂಡುಬಂದಿದೆ.

ಆದೇಶ:
ಮೇಲ್ಕಂಡ ಪ್ರಸ್ತಾವನೆಯ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ {{employeeName}}, {{designation}} ಇವರಿಗೆ ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-A ಹಾಗೂ ಸರ್ಕಾರದ ಆದೇಶದನ್ವಯ ದಿನಾಂಕ: {{effectiveDate}} ರಿಂದ ಒಟ್ಟು 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಯನ್ನು (Paternity Leave) ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಶ್ರೀ {{employeeName}}, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು / ಕಛೇರಿ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ರಜೆ ದಾಖಲಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-16',
  },
  {
    id: 'tmpl-nodal-recognition-letter',
    typeKey: 'nodal_recognition_letter',
    nameKannada: 'ಮಾನ್ಯತೆ ನವೀಕರಣ ನೋಡಲ್ ಪತ್ರ',
    nameEnglish: 'School Recognition Nodal Inspection Letter',
    category: 'School Recognition',
    description: 'ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ ಸಂಬಂಧ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳ ಸ್ಥಳ ಪರಿಶೀಲನೆ ಹಾಗೂ ಶಿಫಾರಸ್ಸು ಪತ್ರ',
    defaultSubject: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ಶಾಲೆಗಳಿಗೆ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ನೀಡುವ ಸಂಬಂಧ - ನೋಡಲ್ ಅಧಿಕಾರಿಗಳ ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿ ಮತ್ತು ಶಿಫಾರಸ್ಸು ಪತ್ರ.',
    defaultReference: '1. ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಕಲಂ 36 ಮತ್ತು 39 ಹಾಗೂ ನಿಯಮಾವಳಿಗಳು 1995.<br/>2. ಶಾಲಾ ಆಡಳಿತ ಮಂಡಳಿಯ ಮಾನ್ಯತೆ ನವೀಕರಣ ಪ್ರಸ್ತಾವನೆ ಅರ್ಜಿ.<br/>3. ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿಯ ಆದೇಶ ಸಂಖ್ಯೆ / ನಿಯೋಜನೆ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಪತ್ರ ಸಂಖ್ಯೆ: BEO/BHD/NODAL-RECOG/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p>ಇವರಿಗೆ,<br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</strong><br/>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ವಲಯ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ.</p>
<p>ಮಾನ್ಯರೇ,<br/><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p style="text-indent: 3em;">ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ <strong>{{officeName}}</strong> (ಯು-ಡೈಸ್ ಕೋಡ್: <strong>{{kgidNumber}}</strong>) ಶಾಲೆಯ ಆಡಳಿತ ಮಂಡಳಿಯು ಸಲ್ಲಿಸಿರುವ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ಪ್ರಸ್ತಾವನೆಯನ್ವಯ ನಾನು ದಿನಾಂಕದಂದು ಸದರಿ ಶಾಲೆಗೆ ಭೇಟಿ ನೀಡಿ ಸ್ಥಳ ತಪಾಸಣೆ ಕೈಗೊಂಡಿರುತ್ತೇನೆ.</p>
<p><strong>ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿ ಮುಖ್ಯಾಂಶಗಳು:</strong></p>
<ol style="margin-left: 20px; line-height: 1.6;">
  <li><strong>ಆಡಳಿತ ಮಂಡಳಿ ವಿವರ:</strong> ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ನೋಂದಣಿ ಚಾಲ್ತಿಯಲ್ಲಿದ್ದು, ಆಡಳಿತ ಮಂಡಳಿ ಕಾರ್ಯಕಾರಿ ಸಮಿತಿ ಅಧಿಕೃತಗೊಂಡಿರುತ್ತದೆ.</li>
  <li><strong>ಕಟ್ಟಡ ಮತ್ತು ಕೊಠಡಿಗಳು:</strong> ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಖ್ಯೆಗೆ ಅನುಗುಣವಾಗಿ ಗಾಳಿ-ಬೆಳಕಿನ ಸುಸಜ್ಜಿತ ತರಗತಿ ಕೊಠಡಿಗಳು, ಗ್ರಂಥಾಲಯ, ವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ ಹಾಗೂ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಕೊಠಡಿ ಲಭ್ಯವಿದೆ.</li>
  <li><strong>ಸುರಕ್ಷತಾ ಪ್ರಮಾಣ ಪತ್ರಗಳು:</strong> ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆಯ (PWD) ಕಟ್ಟಡ ಸ್ಥಿರತಾ ಪ್ರಮಾಣ ಪತ್ರ ಹಾಗೂ ಅಗ್ನಿಶಾಮಕ ಇಲಾಖೆಯ ಸುರಕ್ಷತಾ ನಿರಾಕ್ಷೇಪಣಾ ಪ್ರಮಾಣ ಪತ್ರ (Fire Safety NOC) ಚಾಲ್ತಿಯಲ್ಲಿದೆ.</li>
  <li><strong>ಶೌಚಾಲಯ ಮತ್ತು ಕುಡಿಯುವ ನೀರು:</strong> ಬಾಲಕ ಮತ್ತು ಬಾಲಕಿಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಶೌಚಾಲಯ ವ್ಯವಸ್ಥೆ ಹಾಗೂ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಸೌಲಭ್ಯ ಕಲ್ಪಿಸಲಾಗಿದೆ.</li>
  <li><strong>ಬೋಧಕ ಸಿಬ್ಬಂದಿ:</strong> ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಅರ್ಹತೆ (TET/B.Ed/D.El.Ed) ಹೊಂದಿರುವ ಶಿಕ್ಷಕರು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿದ್ದು, ವಿದ್ಯಾರ್ಥಿಗಳ ಹಾಜರಾತಿ ಉತ್ತಮವಾಗಿದೆ.</li>
  <li><strong>RTE ಕಾಯ್ದೆ ಪಾಲನೆ:</strong> ಶಾಲೆಯಲ್ಲಿ ಮಕ್ಕಳ ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆಯನ್ವಯ 25% ಮೀಸಲಾತಿ ಪ್ರವೇಶ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಲಾಗುತ್ತಿದೆ.</li>
</ol>
<p style="text-indent: 3em; margin-top: 10px;"><strong>ನೋಡಲ್ ಅಧಿಕಾರಿಯ ಶಿಫಾರಸ್ಸು:</strong><br/>ಮೇಲ್ಕಂಡ ಶಾಲೆಯು ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ ಮತ್ತು ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಎಲ್ಲಾ ಮೂಲಭೂತ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ, ಸದರಿ ಶಾಲೆಗೆ ನಿಗದಿತ ಅವಧಿಗೆ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ಮಂಜೂರು ಮಾಡಲು ಈ ಮೂಲಕ ಶಿಫಾರಸ್ಸು ಮಾಡಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;">ತಮ್ಮ ನಂಬುಗೆಯ,<br/><br/><strong>(ನೋಡಲ್ ಅಧಿಕಾರಿ / ಕ್ಷೇತ್ರ ಸಮನ್ವಯಾಧಿಕಾರಿ)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಪತ್ರ ಸಂಖ್ಯೆ: BEO/BHD/NODAL-RECOG/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

ಇವರಿಗೆ,
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ವಲಯ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ.

ಮಾನ್ಯರೇ,
ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ {{officeName}} (ಯು-ಡೈಸ್ ಕೋಡ್: {{kgidNumber}}) ಶಾಲೆಯ ಆಡಳಿತ ಮಂಡಳಿಯು ಸಲ್ಲಿಸಿರುವ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ಪ್ರಸ್ತಾವನೆಯನ್ವಯ ನಾನು ದಿನಾಂಕದಂದು ಸದರಿ ಶಾಲೆಗೆ ಭೇಟಿ ನೀಡಿ ಸ್ಥಳ ತಪಾಸಣೆ ಕೈಗೊಂಡಿರುತ್ತೇನೆ.

ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿ ಮುಖ್ಯಾಂಶಗಳು:
1. ಆಡಳಿತ ಮಂಡಳಿ ವಿವರ: ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ನೋಂದಣಿ ಚಾಲ್ತಿಯಲ್ಲಿದ್ದು, ಆಡಳಿತ ಮಂಡಳಿ ಕಾರ್ಯಕಾರಿ ಸಮಿತಿ ಅಧಿಕೃತಗೊಂಡಿರುತ್ತದೆ.
2. ಕಟ್ಟಡ ಮತ್ತು ಕೊಠಡಿಗಳು: ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಖ್ಯೆಗೆ ಅನುಗುಣವಾಗಿ ಗಾಳಿ-ಬೆಳಕಿನ ಸುಸಜ್ಜಿತ ತರಗತಿ ಕೊಠಡಿಗಳು, ಗ್ರಂಥಾಲಯ, ವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ ಹಾಗೂ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಕೊಠಡಿ ಲಭ್ಯವಿದೆ.
3. ಸುರಕ್ಷತಾ ಪ್ರಮಾಣ ಪತ್ರಗಳು: ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆಯ (PWD) ಕಟ್ಟಡ ಸ್ಥಿರತಾ ಪ್ರಮಾಣ ಪತ್ರ ಹಾಗೂ ಅಗ್ನಿಶಾಮಕ ಇಲಾಖೆಯ ಸುರಕ್ಷತಾ ನಿರಾಕ್ಷೇಪಣಾ ಪ್ರಮಾಣ ಪತ್ರ (Fire Safety NOC) ಚಾಲ್ತಿಯಲ್ಲಿದೆ.
4. ಶೌಚಾಲಯ ಮತ್ತು ಕುಡಿಯುವ ನೀರು: ಬಾಲಕ ಮತ್ತು ಬಾಲಕಿಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಶೌಚಾಲಯ ವ್ಯವಸ್ಥೆ ಹಾಗೂ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಸೌಲಭ್ಯ ಕಲ್ಪಿಸಲಾಗಿದೆ.
5. ಬೋಧಕ ಸಿಬ್ಬಂದಿ: ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಅರ್ಹತೆ (TET/B.Ed/D.El.Ed) ಹೊಂದಿರುವ ಶಿಕ್ಷಕರು ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿದ್ದು, ವಿದ್ಯಾರ್ಥಿಗಳ ಹಾಜರಾತಿ ಉತ್ತಮವಾಗಿದೆ.
6. RTE ಕಾಯ್ದೆ ಪಾಲನೆ: ಶಾಲೆಯಲ್ಲಿ ಮಕ್ಕಳ ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆಯನ್ವಯ 25% ಮೀಸಲಾತಿ ಪ್ರವೇಶ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಲಾಗುತ್ತಿದೆ.

ನೋಡಲ್ ಅಧಿಕಾರಿಯ ಶಿಫಾರಸ್ಸು:
ಮೇಲ್ಕಂಡ ಶಾಲೆಯು ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ ಮತ್ತು ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಎಲ್ಲಾ ಮೂಲಭೂತ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ, ಸದರಿ ಶಾಲೆಗೆ ನಿಗದಿತ ಅವಧಿಗೆ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ಮಂಜೂರು ಮಾಡಲು ಈ ಮೂಲಕ ಶಿಫಾರಸ್ಸು ಮಾಡಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

ತಮ್ಮ ನಂಬುಗೆಯ,

(ನೋಡಲ್ ಅಧಿಕಾರಿ / ಕ್ಷೇತ್ರ ಸಮನ್ವಯಾಧಿಕಾರಿ)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ ರವರಿಗೆ ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.',
      'ಸಂಬಂಧಪಟ್ಟ ಶಾಲಾ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಹಾಗೂ ಆಡಳಿತ ಮಂಡಳಿಗೆ ಮಾಹಿತಿಗಾಗಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-16',
  },
  {
    id: 'tmpl-school-recognition-order',
    typeKey: 'school_recognition_order',
    nameKannada: 'ಮಾನ್ಯತೆ ನವೀಕರಣ ಕಛೇರಿ ಆದೇಶ ಪತ್ರ',
    nameEnglish: 'School Recognition Office Order',
    category: 'Office Orders',
    description: 'ಅನುದಾನಿತ / ಅನುದಾನ ರಹಿತ ಶಾಲೆಗಳ ಮಾನ್ಯತೆ ನವೀಕರಣ (RR) ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕೃತ ಕಚೇರಿ ಆದೇಶ',
    defaultSubject: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ಶಾಲೆಗಳಿಗೆ ಮಾನ್ಯತೆ ನವೀಕರಣ (Renewal of Recognition) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ ಅಧಿಕೃತ ಕಚೇರಿ ಆದೇಶ.',
    defaultReference: '1. ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ಮತ್ತು ನಿಯಮಾವಳಿಗಳು 1995.<br/>2. ಸಂಬಂಧಪಟ್ಟ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ಆಡಳಿತ ಮಂಡಳಿ ಸಲ್ಲಿಸಿದ ಅರ್ಜಿ ದಿನಾಂಕ.<br/>3. ನೋಡಲ್ ಅಧಿಕಾರಿಗಳ ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿ ಮತ್ತು ಶಿಫಾರಸ್ಸು ದಿನಾಂಕ.',
    templateHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂಖ್ಯೆ: BEO/BHD/RECOG-ORDER/2026/{{letterNumber}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: {{date}}</p>
<p style="text-align: center;"><strong>:: ಅಧಿಕೃತ ಕಚೇರಿ ಆದೇಶ (ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ) ::</strong></p>
<p><strong>ವಿಷಯ:</strong> {{subject}}<br/><strong>ಉಲ್ಲೇಖ:</strong> {{reference}}</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ <strong>{{officeName}}</strong>, ಶಾಲೆಯ ಆಡಳಿತ ಮಂಡಳಿಯು 1 ರಿಂದ 10 ನೇ ತರಗತಿಗಳ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣಕ್ಕಾಗಿ (Renewal of Recognition) ನಿಯಮಾನುಸಾರ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ. ಸದರಿ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ಉಲ್ಲೇಖ (3) ರ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳ ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ, ಶಾಲೆಯು ಮೂಲಸೌಕರ್ಯ, ಕಟ್ಟಡ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಿಬ್ಬಂದಿ ಅರ್ಹತೆಗಳ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಿರುವುದು ದೃಢಪಟ್ಟಿರುತ್ತದೆ.</p>
<p><strong>:: ಆದೇಶ ::</strong></p>
<p style="text-indent: 3em;">ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಹಾಗೂ ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಕಲಂ 36 ಮತ್ತು 39 ರನ್ವಯ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರವನ್ನು ಚಲಾಯಿಸಿ, <strong>{{officeName}}</strong> ಶಾಲೆಗೆ ಕೆಳಕಂಡ ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಶಾಲಾ ಮಾನ್ಯತೆಯನ್ನು ನವೀಕರಿಸಿ (Renewal of Recognition) ಈ ಮೂಲಕ ಆದೇಶಿಸಿದೆ.</p>
<ul style="margin-left: 20px; line-height: 1.5;">
  <li>1. ಶಾಲೆಯಲ್ಲಿ ಇಲಾಖಾ ನಿಗದಿಪಡಿಸಿದ ಪಠ್ಯಕ್ರಮ ಹಾಗೂ ಬೋಧನಾ ಮಾಧ್ಯಮದ ನಿಯಮಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸತಕ್ಕದ್ದು.</li>
  <li>2. ಅಗ್ನಿ ಸುರಕ್ಷತಾ ಪ್ರಮಾಣ ಪತ್ರ (Fire Safety NOC) ಮತ್ತು ಕಟ್ಟಡ ಸ್ಥಿರತಾ ಪ್ರಮಾಣ ಪತ್ರಗಳನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ನವೀಕರಿಸತಕ್ಕದ್ದು.</li>
  <li>3. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಇಲಾಖಾ ಅನುಮತಿಯಿಲ್ಲದೆ ಅನಧಿಕೃತ ತರಗತಿ ಅಥವಾ ವಿಭಾಗಗಳನ್ನು ತೆರೆಯತಕ್ಕದ್ದಲ್ಲ.</li>
  <li>4. RTE ಕಾಯ್ದೆಯನ್ವಯ 25% ಮೀಸಲಾತಿಯಡಿ ದಾಖಲಾದ ಮಕ್ಕಳಿಗೆ ಉಚಿತ ಶಿಕ್ಷಣವನ್ನು ಸಮರ್ಪಕವಾಗಿ ನೀಡತಕ್ಕದ್ದು.</li>
</ul>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    templateText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂಖ್ಯೆ: BEO/BHD/RECOG-ORDER/2026/{{letterNumber}}                                ದಿನಾಂಕ: {{date}}

:: ಅಧಿಕೃತ ಕಚೇರಿ ಆದೇಶ (ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ) ::

ವಿಷಯ: {{subject}}
ಉಲ್ಲೇಖ: {{reference}}

ಪ್ರಸ್ತಾವನೆ:
ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ {{officeName}}, ಶಾಲೆಯ ಆಡಳಿತ ಮಂಡಳಿಯು 1 ರಿಂದ 10 ನೇ ತರಗತಿಗಳ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣಕ್ಕಾಗಿ (Renewal of Recognition) ನಿಯಮಾನುಸಾರ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಿರುತ್ತಾರೆ. ಸದರಿ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ಉಲ್ಲೇಖ (3) ರ ನೋಡಲ್ ಅಧಿಕಾರಿಗಳ ಸ್ಥಳ ಪರಿಶೀಲನಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿ, ಶಾಲೆಯು ಮೂಲಸೌಕರ್ಯ, ಕಟ್ಟಡ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಿಬ್ಬಂದಿ ಅರ್ಹತೆಗಳ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಿರುವುದು ದೃಢಪಟ್ಟಿರುತ್ತದೆ.

:: ಆದೇಶ ::

ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಹಾಗೂ ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಕಲಂ 36 ಮತ್ತು 39 ರನ್ವಯ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರವನ್ನು ಚಲಾಯಿಸಿ, {{officeName}} ಶಾಲೆಗೆ ಕೆಳಕಂಡ ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಶಾಲಾ ಮಾನ್ಯತೆಯನ್ನು ನವೀಕರಿಸಿ (Renewal of Recognition) ಈ ಮೂಲಕ ಆದೇಶಿಸಿದೆ.

1. ಶಾಲೆಯಲ್ಲಿ ಇಲಾಖಾ ನಿಗದಿಪಡಿಸಿದ ಪಠ್ಯಕ್ರಮ ಹಾಗೂ ಬೋಧನಾ ಮಾಧ್ಯಮದ ನಿಯಮಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪಾಲಿಸತಕ್ಕದ್ದು.
2. ಅಗ್ನಿ ಸುರಕ್ಷತಾ ಪ್ರಮಾಣ ಪತ್ರ (Fire Safety NOC) ಮತ್ತು ಕಟ್ಟಡ ಸ್ಥಿರತಾ ಪ್ರಮಾಣ ಪತ್ರಗಳನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ನವೀಕರಿಸತಕ್ಕದ್ದು.
3. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಇಲಾಖಾ ಅನುಮತಿಯಿಲ್ಲದೆ ಅನಧಿಕೃತ ತರಗತಿ ಅಥವಾ ವಿಭಾಗಗಳನ್ನು ತೆರೆಯತಕ್ಕದ್ದಲ್ಲ.
4. RTE ಕಾಯ್ದೆಯನ್ವಯ 25% ಮೀಸಲಾತಿಯಡಿ ದಾಖಲಾದ ಮಕ್ಕಳಿಗೆ ಉಚಿತ ಶಿಕ್ಷಣವನ್ನು ಸಮರ್ಪಕವಾಗಿ ನೀಡತಕ್ಕದ್ದು.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: {{date}}

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    defaultEndorsements: [
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಹಾಗೂ ಅಧ್ಯಕ್ಷರು / ಕಾರ್ಯದರ್ಶಿಗಳು, ಸಂಬಂಧಪಟ್ಟ ಶಾಲೆಗೆ.',
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ ರವರಿಗೆ ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.',
      'ತಾಲ್ಲೂಕು ಯೋಜನಾ ಸಮನ್ವಯಾಧಿಕಾರಿಗಳು (BPC), ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    updatedAt: '2026-09-16',
  },
];

// Seed Generated Letters linking original docs, OCR, versions, and exports
export const DEFAULT_GENERATED_LETTERS: DbGeneratedLetter[] = [
  {
    id: 'gen-let-101',
    documentId: 'DOC-2026/09/LET-101',
    letterNumber: 'BEO/BHD/MEMO/2026/TBS-101',
    date: '2026-09-02',
    letterType: 'ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಆದೇಶ',
    letterCategory: 'increment',
    originalFile: {
      fileName: 'service_proposal_manjunath.pdf',
      fileSize: '412 KB',
      fileType: 'application/pdf',
      uploadedAt: '2026-09-02T10:15:00',
    },
    ocrRawText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು.
ಪ್ರಸ್ತಾವನೆ: 10 ವರ್ಷಗಳ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಕೋರಿಕೆ.
ನೌಕರರ ಹೆಸರು: ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್ (H. Manjunath)
ಹುದ್ದೆ: ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು (Senior Assistant Teacher)
ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ: 284102
ಕಚೇರಿ: ಸರ್ಕಾರಿ ಪದವಿ ಪೂರ್ವ ಕಾಲೇಜು (ಪ್ರೌಢಶಾಲಾ ವಿಭಾಗ), ಹಳೇನಗರ, ಭದ್ರಾವತಿ
ನೇಮಕಾತಿ ದಿನಾಂಕ: 2012-06-15
ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ: 43,100/- ವೇತನ ಶ್ರೇಣಿ: 37900-70850
ಯಾವುದೇ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲ. ತೃಪ್ತಿಕರ ಸೇವೆ ಪರಿಗಣಿಸಿ ಮುಂದಿನ ಹಂತದ ವೇತನ ಬಡ್ತಿ ನೀಡಲು ಶಿಫಾರಸ್ಸು.`,
    ocrExtracted: {
      letterNumber: 'PR-2026/BHD/TBS-402',
      date: '2026-09-01',
      employeeName: 'ಹೆಚ್. ಮಂಜುನಾಥ್ (H. Manjunath)',
      kgidNumber: '284102',
      designation: 'ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು (Senior Assistant Teacher)',
      officeName: 'ಸರ್ಕಾರಿ ಪದವಿ ಪೂರ್ವ ಕಾಲೇಜು (ಪ್ರೌಢಶಾಲಾ ವಿಭಾಗ), ಹಳೇನಗರ, ಭದ್ರಾವತಿ',
      department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
      subject: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ',
      reference: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018',
      serviceDetails: 'ನೇಮಕಾತಿ: 2012-06-15, ನಿರಂತರ ಸೇವೆ: 14 ವರ್ಷಗಳು',
      leaveDetails: 'ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು: 180 ದಿನಗಳು',
      salaryDetails: 'ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ: ₹43,100, ಮುಂದಿನ ಹಂತ: ₹44,200',
      otherInfo: 'ಇಲಾಖಾ ಪರೀಕ್ಷೆ ಉತ್ತೀರ್ಣರಾಗಿದ್ದಾರೆ.',
    },
    userPrompt: 'ಈ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ 10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಜ್ಞಾಪನಾ ಆದೇಶ ತಯಾರಿಸಿ ಮತ್ತು ನೌಕರರ ಮೂಲ ವೇತನ ₹43,100 ರಿಂದ ₹44,200 ಕ್ಕೆ ಪರಿಷ್ಕರಿಸಿ.',
    subject: '10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಜ್ಞಾಪನ.',
    reference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018, ದಿನಾಂಕ: 19-04-2018.<br/>2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ಸರ್ಕಾರಿ ಪ.ಪೂ. ಕಾಲೇಜು (ಪ್ರೌಢಶಾಲಾ ವಿಭಾಗ), ಹಳೇನಗರ ರವರ ಪ್ರಸ್ತಾವನೆ ದಿನಾಂಕ: 01-09-2026.',
    preamble: 'ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು, (KGID: 284102) ಇವರು ದಿನಾಂಕ: 15-06-2012 ರಂದು ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಪ್ರವೇಶಿಸಿದ್ದು, 10 ವರ್ಷಗಳ ನಿರಂತರ ಹಾಗೂ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿರುತ್ತಾರೆ. ಇವರ ವಿರುದ್ಧ ಯಾವುದೇ ಇಲಾಖಾ ತನಿಖೆ ಬಾಕಿ ಇರುವುದಿಲ್ಲ.',
    bodyHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/MEMO/2026/TBS-101 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: 2026-09-02</p>
<p style="text-align: center;"><strong>:: ಜ್ಞಾಪನಾ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> 10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಕುರಿತು.<br/>
<strong>ಉಲ್ಲೇಖ:</strong> 1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018, ದಿನಾಂಕ: 19-04-2018.<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. ಪ್ರಸ್ತಾವನೆ ದಿನಾಂಕ: 01-09-2026.</p>
<p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು, (KGID: 284102) ಇವರು ದಿನಾಂಕ: 15-06-2012 ರಂದು ಸೇವೆಗೆ ಸೇರಿದು, ದಿನಾಂಕ: 15-06-2022 ರ ಹೊತ್ತಿಗೆ 10 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು ಇವರಿಗೆ 10 ವರ್ಷಗಳ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಇವರ ಮೂಲ ವೇತನವನ್ನು ಹಳೆಯ ಮೂಲ ವೇತನ ₹43,100/- ನಿಂದ ಹೊಸ ಮೂಲ ವೇತನ ₹44,200/- ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    bodyText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/MEMO/2026/TBS-101                                ದಿನಾಂಕ: 2026-09-02

:: ಜ್ಞಾಪನಾ ಆದೇಶ ::

ವಿಷಯ: 10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಕುರಿತು.
ಉಲ್ಲೇಖ: 1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಎಫ್‌ಡಿ 08 ಎಸ್‌ಆರ್‌ಪಿ 2018, ದಿನಾಂಕ: 19-04-2018.
        2. ಪ್ರಸ್ತಾವನೆ ದಿನಾಂಕ: 01-09-2026.

ಪ್ರಸ್ತಾವನೆ:
ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು, (KGID: 284102) ಇವರು ದಿನಾಂಕ: 15-06-2012 ರಂದು ಸೇವೆಗೆ ಸೇರಿದು, ದಿನಾಂಕ: 15-06-2022 ರ ಹೊತ್ತಿಗೆ 10 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆಯನ್ನು ಪೂರೈಸಿರುವುದರಿಂದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಗೆ ಅರ್ಹರಾಗಿರುತ್ತಾರೆ.

ಆದೇಶ:
ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ, ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು ಇವರಿಗೆ 10 ವರ್ಷಗಳ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ಇವರ ಮೂಲ ವೇತನವನ್ನು ಹಳೆಯ ಮೂಲ ವೇತನ ₹43,100/- ನಿಂದ ಹೊಸ ಮೂಲ ವೇತನ ₹44,200/- ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: 2026-09-02

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    endorsements: [
      'ಶ್ರೀ ಹೆಚ್. ಮಂಜುನಾಥ್, ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು ರವರಿಗೆ.',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ಸ.ಪ.ಪೂ ಕಾಲೇಜು, ಹಳೇನಗರ ರವರಿಗೆ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸಲು.',
      'ಖಜಾನಾಧಿಕಾರಿಗಳು, ತಾಲ್ಲೂಕು ಖಜಾನೆ, ಭದ್ರಾವತಿ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    signatory: {
      name: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    },
    employeeName: 'ಹೆಚ್. ಮಂಜುನಾಥ್ (H. Manjunath)',
    kgidNumber: '284102',
    designation: 'ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು',
    officeName: 'ಸರ್ಕಾರಿ ಪದವಿ ಪೂರ್ವ ಕಾಲೇಜು, ಹಳೇನಗರ',
    department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
    status: 'Approved',
    createdBy: 'admin',
    createdAt: '2026-09-02T11:00:00',
    lastUpdated: '2026-09-02T11:30:00',
    currentVersion: 2,
    versions: [
      {
        versionNumber: 1,
        updatedAt: '2026-09-02T11:00:00',
        updatedBy: 'admin',
        letterHtml: `<p>ಆರಂಭಿಕ ಕರಡು ಜ್ಞಾಪನ ಪತ್ರ</p>`,
        letterText: `ಆರಂಭಿಕ ಕರಡು ಜ್ಞಾಪನ ಪತ್ರ`,
        notes: 'ಮೊದಲ ಕರಡು ರಚನೆ',
      },
      {
        versionNumber: 2,
        updatedAt: '2026-09-02T11:30:00',
        updatedBy: 'admin',
        letterHtml: `<p>ಪರಿಷ್ಕೃತ ಮತ್ತು ಅನುಮೋದಿತ ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ</p>`,
        letterText: `ಪರಿಷ್ಕೃತ ಮತ್ತು ಅನುಮೋದಿತ ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ`,
        notes: 'ವೇತನ ಶ್ರೇಣಿ ಮತ್ತು ಖಜಾನೆ ಪ್ರತಿ ರವಾನೆ ಸೇರಿಸಲಾಗಿದೆ.',
      }
    ],
  },
  {
    id: 'gen-let-102',
    documentId: 'DOC-2026/09/LET-102',
    letterNumber: 'BEO/BHD/EL/2026/EL-042',
    date: '2026-09-04',
    letterType: 'ಗಳಿಕೆ ರಜೆ ಆದೇಶ',
    letterCategory: 'leave',
    originalFile: {
      fileName: 'geetha_earned_leave_application.jpg',
      fileSize: '680 KB',
      fileType: 'image/jpeg',
      uploadedAt: '2026-09-04T09:30:00',
    },
    ocrRawText: `ಗಳಿಕೆ ರಜಾ ಅರ್ಜಿ
ಇವರಿಗೆ: ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ.
ಅರ್ಜಿದಾರರು: ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ. (Geetha M.)
ಹುದ್ದೆ: ಕನ್ನಡ ಸಹ ಶಿಕ್ಷಕಿ
ಕೆಜಿಐಡಿ: 195483
ಶಾಲೆ: ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ
ವಿಷಯ: 20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಕೋರಿಕೆ.
ಕಾರಣ: ವೈಯಕ್ತಿಕ ಹಾಗೂ ಗೃಹ ನಿರ್ಮಾಣ ಕಾರ್ಯಗಳಿಗಾಗಿ.
ಅವಧಿ: 2026-09-10 ರಿಂದ 2026-09-29 ರವರೆಗೆ.
ರಜೆ ಶಿಲ್ಕು: 142 ದಿನಗಳು.`,
    ocrExtracted: {
      letterNumber: 'APP/2026/EL-89',
      date: '2026-09-03',
      employeeName: 'ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ. (Geetha M.)',
      kgidNumber: '195483',
      designation: 'ಕನ್ನಡ ಸಹ ಶಿಕ್ಷಕಿ',
      officeName: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ',
      department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
      subject: '20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಕೋರಿಕೆ',
      reference: 'ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ: 03-09-2026',
      serviceDetails: 'ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ: 2008-11-20',
      leaveDetails: '2026-09-10 ರಿಂದ 2026-09-29 ರವರೆಗೆ ಒಟ್ಟು 20 ದಿನಗಳು. ಶಿಲ್ಕು: 142 ದಿನಗಳು.',
      salaryDetails: 'ಮೂಲ ವೇತನ: ₹44,200',
      otherInfo: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರಿಂದ ಶಿಫಾರಸ್ಸು ಮಾಡಲಾಗಿದೆ.',
    },
    userPrompt: 'ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ 20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶವನ್ನು ಅಧಿಕೃತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ.',
    subject: 'ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ ಇವರಿಗೆ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    reference: '1. ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ: 03-09-2026.<br/>2. ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ.',
    preamble: 'ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಕನ್ನಡ ಸಹ ಶಿಕ್ಷಕಿ (KGID: 195483) ಇವರು ದಿನಾಂಕ: 10-09-2026 ರಿಂದ 29-09-2026 ರವರೆಗೆ ಒಟ್ಟು 20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ರಜಾ ಲೆಕ್ಕ ಪರಿಶೀಲಿಸಲಾಗಿ ರಜೆ ಶಿಲ್ಕಿರುವುದು ದೃಢಪಟ್ಟಿದೆ.',
    bodyHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/EL/2026/EL-042 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: 2026-09-04</p>
<p style="text-align: center;"><strong>:: ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::</strong></p>
<p><strong>ವಿಷಯ:</strong> ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ ಇವರಿಗೆ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.<br/>
<strong>ಉಲ್ಲೇಖ:</strong> 1. ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ: 03-09-2026.<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ.</p>
<p><strong>ಆದೇಶ:</strong><br/>ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ (KGID: 195483) ಇವರಿಗೆ ದಿನಾಂಕ: 10-09-2026 ರಿಂದ 29-09-2026 ರವರೆಗೆ ಒಟ್ಟು 20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ರಜೆಯ ನಂತರ ಅವರು ಅದೇ ಹುದ್ದೆಯಲ್ಲಿ ಕರ್ತವ್ಯಕ್ಕೆ ಮರುಹಾಜರಾಗಲು ಸೂಚಿಸಲಾಗಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;"><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    bodyText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/EL/2026/EL-042                                ದಿನಾಂಕ: 2026-09-04

:: ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ ::

ವಿಷಯ: ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ ಇವರಿಗೆ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.
ಉಲ್ಲೇಖ: 1. ನೌಕರರ ರಜಾ ಅರ್ಜಿ ದಿನಾಂಕ: 03-09-2026.
        2. ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮ 112 ರ ಅನ್ವಯ.

ಆದೇಶ:
ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ (KGID: 195483) ಇವರಿಗೆ ದಿನಾಂಕ: 10-09-2026 ರಿಂದ 29-09-2026 ರವರೆಗೆ ಒಟ್ಟು 20 ದಿನಗಳ ಗಳಿಕೆ ರಜೆಯನ್ನು ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ. ರಜೆಯ ನಂತರ ಅವರು ಅದೇ ಹುದ್ದೆಯಲ್ಲಿ ಕರ್ತವ್ಯಕ್ಕೆ ಮರುಹಾಜರಾಗಲು ಸೂಚಿಸಲಾಗಿದೆ.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: 2026-09-04

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    endorsements: [
      'ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ., ಸಹ ಶಿಕ್ಷಕಿ ರವರಿಗೆ.',
      'ಮುಖ್ಯ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ. ಶಾಲೆ, ಹಳೇನಗರ ರವರಿಗೆ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ರಜಾ ಲೆಕ್ಕ ದಾಖಲಿಸಲು.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    signatory: {
      name: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    },
    employeeName: 'ಶ್ರೀಮತಿ ಗೀತಾ ಎಂ. (Geetha M.)',
    kgidNumber: '195483',
    designation: 'ಕನ್ನಡ ಸಹ ಶಿಕ್ಷಕಿ',
    officeName: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ',
    department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
    status: 'Approved',
    createdBy: 'admin',
    createdAt: '2026-09-04T10:00:00',
    lastUpdated: '2026-09-04T10:15:00',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        updatedAt: '2026-09-04T10:00:00',
        updatedBy: 'admin',
        letterHtml: `<p>ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಅಧಿಕೃತ ಆದೇಶ</p>`,
        letterText: `ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಅಧಿಕೃತ ಆದೇಶ`,
        notes: 'ಮೂಲ ಕರಡು ಅನುಮೋದಿಸಲಾಗಿದೆ',
      }
    ],
  },
  {
    id: 'gen-let-103',
    documentId: 'DOC-2026/09/LET-103',
    letterNumber: 'BEO/BHD/GEN/2026/SCH-204',
    date: '2026-09-07',
    letterType: 'ಸಾಮಾನ್ಯ ಪತ್ರ',
    letterCategory: 'normal',
    originalFile: {
      fileName: 'circular_science_fair.png',
      fileSize: '320 KB',
      fileType: 'image/png',
      uploadedAt: '2026-09-07T14:10:00',
    },
    ocrRawText: `ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆಗಳಿಗೆ ಸುತ್ತೋಲೆ
ವಿಷಯ: ತಾಲ್ಲೂಕು ಮಟ್ಟದ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ 2026 ಆಯೋಜನೆ.
ದಿನಾಂಕ: 2026-09-25
ಸ್ಥಳ: ಭದ್ರಾವತಿ`,
    ocrExtracted: {
      letterNumber: 'CIR-BHD/2026/88',
      date: '2026-09-07',
      subject: 'ತಾಲ್ಲೂಕು ಮಟ್ಟದ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ ಆಯೋಜನೆ',
      officeName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
      department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
    },
    userPrompt: 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ಎಲ್ಲಾ ಪ್ರೌಢಶಾಲೆಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನಕ್ಕೆ ಸಿದ್ಧಪಡಿಸುವಂತೆ ಅಧಿಕೃತ ಸಾಮಾನ್ಯ ಪತ್ರ ಸಿದ್ಧಪಡಿಸಿ.',
    subject: 'ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಮಕ್ಕಳ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ-2026 ರಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಕ್ರಿಯ ಭಾಗವಹಿಸುವಿಕೆ ಕುರಿತು.',
    reference: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಬೆಂಗಳೂರು ರವರ ನಿರ್ದೇಶನ ದಿನಾಂಕ: 01-09-2026.',
    recipient: 'ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ / ಅನುದಾನಿತ / ಅನುದಾನರಹಿತ ಪ್ರೌಢಶಾಲೆಗಳ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರುಗಳಿಗೆ.',
    bodyHtml: `<p style="text-align: center;"><strong>ಕರ್ನಾಟಕ ಸರ್ಕಾರ</strong><br/><strong>ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</strong><br/><strong>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</strong><br/><strong>ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</strong></p>
<p>ಸಂ: BEO/BHD/GEN/2026/SCH-204 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ದಿನಾಂಕ: 2026-09-07</p>
<p>ಇವರಿಗೆ,<br/>ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ, ಅನುದಾನಿತ ಹಾಗೂ ಅನುದಾನರಹಿತ ಪ್ರೌಢಶಾಲೆಗಳ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರುಗಳಿಗೆ.</p>
<p>ಮಾನ್ಯರೇ,<br/><strong>ವಿಷಯ:</strong> ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಮಕ್ಕಳ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ-2026 ರಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಕ್ರಿಯ ಭಾಗವಹಿಸುವಿಕೆ ಕುರಿತು.<br/>
<strong>ಉಲ್ಲೇಖ:</strong> ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಬೆಂಗಳೂರು ರವರ ನಿರ್ದೇಶನ ದಿನಾಂಕ: 01-09-2026.</p>
<p style="text-indent: 3em;">ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, 2026-27 ನೇ ಸಾಲಿನ ತಾಲ್ಲೂಕು ಮಟ್ಟದ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನವನ್ನು ದಿನಾಂಕ: 25-09-2026 ರಂದು ಭದ್ರಾವತಿಯಲ್ಲಿ ಆಯೋಜಿಸಲಾಗಿದೆ. ತಮ್ಮ ಶಾಲೆಯಿಂದ ಕನಿಷ್ಠ 3 ವಿಜ್ಞಾನ ಮಾದರಿಗಳನ್ನು ವಿದ್ಯಾರ್ಥಿಗಳ ಮೂಲಕ ಸಿದ್ಧಪಡಿಸಿ ಭಾಗವಹಿಸಲು ಅಗತ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸೂಚಿಸಿದೆ.</p>
<p style="text-align: right; margin-top: 40px;">ತಮ್ಮ ನಂಬುಗೆಯ,<br/><br/><strong>(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</strong><br/>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>`,
    bodyText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: BEO/BHD/GEN/2026/SCH-204                                ದಿನಾಂಕ: 2026-09-07

ಇವರಿಗೆ,
ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ, ಅನುದಾನಿತ ಹಾಗೂ ಅನುದಾನರಹಿತ ಪ್ರೌಢಶಾಲೆಗಳ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರುಗಳಿಗೆ.

ಮಾನ್ಯರೇ,
ವಿಷಯ: ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಮಕ್ಕಳ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ-2026 ರಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಕ್ರಿಯ ಭಾಗವಹಿಸುವಿಕೆ ಕುರಿತು.
ಉಲ್ಲೇಖ: ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಬೆಂಗಳೂರು ರವರ ನಿರ್ದೇಶನ ದಿನಾಂಕ: 01-09-2026.

ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, 2026-27 ನೇ ಸಾಲಿನ ತಾಲ್ಲೂಕು ಮಟ್ಟದ ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನವನ್ನು ದಿನಾಂಕ: 25-09-2026 ರಂದು ಭದ್ರಾವತಿಯಲ್ಲಿ ಆಯೋಜಿಸಲಾಗಿದೆ. ತಮ್ಮ ಶಾಲೆಯಿಂದ ಕನಿಷ್ಠ 3 ವಿಜ್ಞಾನ ಮಾದರಿಗಳನ್ನು ವಿದ್ಯಾರ್ಥಿಗಳ ಮೂಲಕ ಸಿದ್ಧಪಡಿಸಿ ಭಾಗವಹಿಸಲು ಅಗತ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸೂಚಿಸಿದೆ.

ತಮ್ಮ ನಂಬುಗೆಯ,

(ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
    endorsements: [
      'ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ರವರಿಗೆ ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.',
      'ತಾಲ್ಲೂಕು ನೋಡಲ್ ಅಧಿಕಾರಿಗಳು (ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ ಸಮಿತಿ) ರವರಿಗೆ.',
      'ಕಛೇರಿ ಕಡತ.'
    ],
    signatory: {
      name: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    },
    status: 'Finalized',
    createdBy: 'admin',
    createdAt: '2026-09-07T14:30:00',
    lastUpdated: '2026-09-07T14:30:00',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        updatedAt: '2026-09-07T14:30:00',
        updatedBy: 'admin',
        letterHtml: `<p>ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ ಸುತ್ತೋಲೆ ಪತ್ರ</p>`,
        letterText: `ವಿಜ್ಞಾನ ವಸ್ತುಪ್ರದರ್ಶನ ಸುತ್ತೋಲೆ ಪತ್ರ`,
        notes: 'ಆರಂಭಿಕ ಪ್ರಕಟಣೆ',
      }
    ],
  },
  {
    id: 'gen-let-104',
    documentId: 'DOC-2026/08/LET-104',
    letterNumber: 'ಸಿ2/ರಜೆ/ಅರ್ಜಿ-51-01/2026-27',
    date: '2026-08-07',
    letterType: 'ಶಿಶುಪಾಲನಾ ರಜೆ ಆದೇಶ',
    letterCategory: 'leave',
    ocrExtracted: {
      letterNumber: 'ಸಿ2/ರಜೆ/ಅರ್ಜಿ-51-01/2026-27',
      date: '2026-08-07',
      employeeName: 'ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ.',
      designation: 'ಸಹ ಶಿಕ್ಷಕರು',
      officeName: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ',
      department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
      subject: 'ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಶಿಶುಪಾಲನಾ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.',
      reference: '1. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4(ಇ) ಸೇನಿಸೇ 2021, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: 21.06.2024.\n2. ನೌಕರರ ಮನವಿ ಅರ್ಜಿ ದಿನಾಂಕ: 30-05-2026.',
      leaveDetails: '30-05-2026 ರಿಂದ 28-06-2026 (30 ದಿನಗಳು)',
    },
    userPrompt: 'ಶಿಶುಪಾಲನಾ ರಜೆ (Child Care Leave) ಮಂಜೂರಾತಿ ಆದೇಶ ಪತ್ರ (ಹಿಂಬರಹ/ಪ್ರತಿ ರವಾನೆ ಇಲ್ಲದೆ)',
    subject: 'ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಶಿಶುಪಾಲನಾ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.',
    reference: '1. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4(ಇ) ಸೇನಿಸೇ 2021, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: 21.06.2024.<br/>2. ನೌಕರರ ಮನವಿ ಅರ್ಜಿ ದಿನಾಂಕ: 30-05-2026.',
    preamble: 'ಮೇಲಿನ ವಿಷಯ ಮತ್ತು ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ರಾಜ್ಯ ಸರ್ಕಾರಿ ಮಹಿಳಾ ನೌಕರರಿಗೆ 18 ವರ್ಷದೊಳಗಿನ ಮಕ್ಕಳ ಪಾಲನೆಗಾಗಿ ಒಟ್ಟು ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ಗರಿಷ್ಠ 180 ದಿನಗಳ ಶಿಶುಪಾಲನಾ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಆದೇಶ ನೀಡಲಾಗಿದೆ. ಉಲ್ಲೇಖ (2)ರ ಪತ್ರದಲ್ಲಿ ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ರವರು ತಮ್ಮ 13 ವರ್ಷ 9 ತಿಂಗಳ ಮಗಳ ಆರೈಕೆಗಾಗಿ ರಜೆ ಮಂಜೂರು ಮಾಡಲು ಕೋರಿದ್ದಾರೆ. ಈ ಮನವಿಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಸರ್ಕಾರಿ ಆದೇಶದ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು ಕೆಳಗಿನಂತೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.',
    bodyHtml: `<div style="text-align: center; margin-bottom: 16px;">
  <p style="font-size: 16px; font-weight: bold; margin: 0; color: #1e3a8a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
  <p style="font-size: 14px; font-weight: bold; margin: 2px 0;">ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ</p>
  <p style="font-size: 13px; font-weight: 600; margin: 0;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ವಲಯ</p>
</div>

<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 14px; font-size: 13px; font-weight: 600;">
  <span>ಸಂ: ಸಿ2/ರಜೆ/ಅರ್ಜಿ-51-01/2026-27</span>
  <span>ದಿನಾಂಕ: 07-08-2026</span>
</div>

<div style="text-align: center; margin: 12px 0;">
  <span style="font-size: 14px; font-weight: bold; border-bottom: 1.5px solid #000; padding-bottom: 2px;">:: ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ / ನಡವಳಿಗಳು ::</span>
</div>

<div style="margin-bottom: 12px; font-size: 13px; line-height: 1.6;">
  <p style="margin: 4px 0;"><strong>ವಿಷಯ:</strong> ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಶಿಶುಪಾಲನಾ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.</p>
  <p style="margin: 4px 0;"><strong>ಉಲ್ಲೇಖ:</strong><br/>
  &nbsp;&nbsp;1. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4(ಇ) ಸೇನಿಸೇ 2021, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: 21.06.2024.<br/>
  &nbsp;&nbsp;2. ನೌಕರರ ಮನವಿ ಅರ್ಜಿ ದಿನಾಂಕ: 30-05-2026.</p>
</div>

<div style="margin-bottom: 14px; font-size: 13px; line-height: 1.7; text-align: justify;">
  <p><strong>ಪ್ರಸ್ತಾವನೆ:</strong><br/>
  ಮೇಲಿನ ವಿಷಯ ಮತ್ತು ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ರಾಜ್ಯ ಸರ್ಕಾರಿ ಮಹಿಳಾ ನೌಕರರಿಗೆ 18 ವರ್ಷದೊಳಗಿನ ಮಕ್ಕಳ ಪಾಲನೆಗಾಗಿ ಒಟ್ಟು ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ಗರಿಷ್ಠ 180 ದಿನಗಳ ಶಿಶುಪಾಲನಾ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಆದೇಶ ನೀಡಲಾಗಿದೆ. ಉಲ್ಲೇಖ (2)ರ ಪತ್ರದಲ್ಲಿ ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ರವರು ತಮ್ಮ 13 ವರ್ಷ 9 ತಿಂಗಳ ಮಗಳ ಆರೈಕೆಗಾಗಿ ರಜೆ ಮಂಜೂರು ಮಾಡಲು ಕೋರಿದ್ದಾರೆ. ಈ ಮನವಿಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಸರ್ಕಾರಿ ಆದೇಶದ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು ಕೆಳಗಿನಂತೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.</p>
</div>

<div style="margin-bottom: 14px; font-size: 13px; line-height: 1.7;">
  <p><strong>:: ಆದೇಶ ::</strong><br/>
  ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶದ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು, ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಕೆಳಗಿನ ಕೋಷ್ಟಕದಲ್ಲಿ ತಿಳಿಸಿರುವಂತೆ ಶಿಶುಪಾಲನಾ ರಜೆಯನ್ನು (Child Care Leave) ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.</p>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px; text-align: center;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #334155;">ಕ್ರ.ಸಂ.</th>
      <th style="padding: 8px; border: 1px solid #334155;">ಶಿಕ್ಷಕರ ಹೆಸರು ಹಾಗೂ ಶಾಲೆಯ ಹೆಸರು</th>
      <th style="padding: 8px; border: 1px solid #334155;">ಒಟ್ಟು ಅರ್ಹ ಶಿಶುಪಾಲನಾ ರಜೆ</th>
      <th style="padding: 8px; border: 1px solid #334155;">ಮಂಜೂರು ಮಾಡಿದ ರಜಾ ಅವಧಿ</th>
      <th style="padding: 8px; border: 1px solid #334155;">ಮಂಜೂರು ಮಾಡಿದ ದಿನಗಳು</th>
      <th style="padding: 8px; border: 1px solid #334155;">ಉಳಿಕೆ ರಜೆ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #334155;">1</td>
      <td style="padding: 8px; border: 1px solid #334155; text-align: left; font-weight: 600;">ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ</td>
      <td style="padding: 8px; border: 1px solid #334155;">180 ದಿನಗಳು</td>
      <td style="padding: 8px; border: 1px solid #334155;">30-05-2026 ರಿಂದ 28-06-2026</td>
      <td style="padding: 8px; border: 1px solid #334155; font-weight: bold;">30 ದಿನಗಳು</td>
      <td style="padding: 8px; border: 1px solid #334155; font-weight: bold;">150 ದಿನಗಳು</td>
    </tr>
  </tbody>
</table>

<div style="margin-top: 14px; font-size: 12px; line-height: 1.6;">
  <p style="font-weight: bold; margin-bottom: 4px;">ಷರತ್ತುಗಳು:</p>
  <p style="margin: 2px 0;">1. ರಜಾ ಅವಧಿಯಲ್ಲಿ ನೌಕರರು ನಿಯಮಾನುಸಾರ ರಜಾ ವೇತನ ಪಡೆಯಲು ಅರ್ಹರಿರುತ್ತಾರೆ.</p>
  <p style="margin: 2px 0;">2. ಸದರಿ ರಜೆಯ ನಮೂದನ್ನು ನೌಕರರ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ (Service Register) ಪ್ರತ್ಯೇಕವಾಗಿ ದಾಖಲಿಸತಕ್ಕದ್ದು.</p>
  <p style="margin: 2px 0;">3. ರಜಾ ಅವಧಿಯು ಮುಕ್ತಾಯವಾದ ನಂತರ ದಿನಾಂಕ: 29-06-2026 ರ ಪೂರ್ವಾಹ್ನ ಕರ್ತವ್ಯಕ್ಕೆ ಹಾಜರಾಗಿ ಕರ್ತವ್ಯ ವರದಿ ಸಲ್ಲಿಸತಕ್ಕದ್ದು.</p>
</div>

<div style="margin-top: 40px; text-align: right; font-size: 13px;">
  <p style="margin: 0; font-weight: bold;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು</p>
  <p style="margin: 2px 0;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ವಲಯ.</p>
</div>`,
    bodyText: `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಸಂ: ಸಿ2/ರಜೆ/ಅರ್ಜಿ-51-01/2026-27                                ದಿನಾಂಕ: 07-08-2026

:: ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ / ನಡವಳಿಗಳು ::

ವಿಷಯ: ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಶಿಶುಪಾಲನಾ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.
ಉಲ್ಲೇಖ: 
  1. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4(ಇ) ಸೇನಿಸೇ 2021, ಬೆಂಗಳೂರು, ದಿನಾಂಕ: 21.06.2024.
  2. ನೌಕರರ ಮನವಿ ಅರ್ಜಿ ದಿನಾಂಕ: 30-05-2026.

ಪ್ರಸ್ತಾವನೆ:
ಮೇಲಿನ ವಿಷಯ ಮತ್ತು ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ರಾಜ್ಯ ಸರ್ಕಾರಿ ಮಹಿಳಾ ನೌಕರರಿಗೆ 18 ವರ್ಷದೊಳಗಿನ ಮಕ್ಕಳ ಪಾಲನೆಗಾಗಿ ಒಟ್ಟು ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ಗರಿಷ್ಠ 180 ದಿನಗಳ ಶಿಶುಪಾಲನಾ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲು ಆದೇಶ ನೀಡಲಾಗಿದೆ. ಉಲ್ಲೇಖ (2)ರ ಪತ್ರದಲ್ಲಿ ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ರವರು ತಮ್ಮ 13 ವರ್ಷ 9 ತಿಂಗಳ ಮಗಳ ಆರೈಕೆಗಾಗಿ ರಜೆ ಮಂಜೂರು ಮಾಡಲು ಕೋರಿದ್ದಾರೆ. ಈ ಮನವಿಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಸರ್ಕಾರಿ ಆದೇಶದ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು ಕೆಳಗಿನಂತೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.

:: ಆದೇಶ ::
ಪ್ರಸ್ತಾವನೆಯಲ್ಲಿ ವಿವರಿಸಿರುವ ಅಂಶಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶದ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು, ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ ಇವರಿಗೆ ಕೆಳಗಿನ ಕೋಷ್ಟಕದಲ್ಲಿ ತಿಳಿಸಿರುವಂತೆ ಶಿಶುಪಾಲನಾ ರಜೆಯನ್ನು (Child Care Leave) ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.

--------------------------------------------------------------------------------------------------------------------------------------
ಕ್ರ.ಸಂ. | ಶಿಕ್ಷಕರ ಹೆಸರು ಹಾಗೂ ಶಾಲೆಯ ಹೆಸರು                      | ಒಟ್ಟು ಅರ್ಹ ರಜೆ | ಮಂಜೂರು ಮಾಡಿದ ರಜಾ ಅವಧಿ       | ದಿನಗಳು | ಉಳಿಕೆ ರಜೆ
--------------------------------------------------------------------------------------------------------------------------------------
  1    | ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ., ಸಹ ಶಿಕ್ಷಕರು, ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ | 180 ದಿನಗಳು     | 30-05-2026 ರಿಂದ 28-06-2026 | 30 ದಿನ | 150 ದಿನಗಳು
--------------------------------------------------------------------------------------------------------------------------------------

ಷರತ್ತುಗಳು:
1. ರಜಾ ಅವಧಿಯಲ್ಲಿ ನೌಕರರು ನಿಯಮಾನುಸಾರ ರಜಾ ವೇತನ ಪಡೆಯಲು ಅರ್ಹರಿರುತ್ತಾರೆ.
2. ಸದರಿ ರಜೆಯ ನಮೂದನ್ನು ನೌಕರರ ಮೂಲ ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ (Service Register) ಪ್ರತ್ಯೇಕವಾಗಿ ದಾಖಲಿಸತಕ್ಕದ್ದು.
3. ರಜಾ ಅವಧಿಯು ಮುಕ್ತಾಯವಾದ ನಂತರ ದಿನಾಂಕ: 29-06-2026 ರ ಪೂರ್ವಾಹ್ನ ಕರ್ತವ್ಯಕ್ಕೆ ಹಾಜರಾಗಿ ಕರ್ತವ್ಯ ವರದಿ ಸಲ್ಲಿಸತಕ್ಕದ್ದು.

ಸ್ಥಳ: ಭದ್ರಾವತಿ
ದಿನಾಂಕ: 07-08-2026

ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ವಲಯ.`,
    endorsements: [], // Strictly no endorsements as instructed
    signatory: {
      name: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ವಲಯ',
    },
    employeeName: 'ಶ್ರೀಮತಿ ಶಿಲ್ಪಾ ಟಿ.',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು',
    officeName: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಬೆಳ್ಳಿಗೆರೆ',
    department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ',
    status: 'Finalized',
    createdBy: 'admin',
    createdAt: '2026-08-07T10:00:00',
    lastUpdated: '2026-08-07T10:00:00',
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        updatedAt: '2026-08-07T10:00:00',
        updatedBy: 'admin',
        letterHtml: `<p>ಶಿಶುಪಾಲನಾ ರಜೆ (Child Care Leave) ಅಧಿಕೃತ ಮಂಜೂರಾತಿ ಆದೇಶ ಪತ್ರ</p>`,
        letterText: `ಶಿಶುಪಾಲನಾ ರಜೆ (Child Care Leave) ಅಧಿಕೃತ ಮಂಜೂರಾತಿ ಆದೇಶ ಪತ್ರ`,
        notes: 'ಆದೇಶ ಪತ್ರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ (ಹಿಂಬರಹ ರಹಿತ)',
      }
    ],
  },
];

// Word DOCX Generator
export async function generateOfficeLetterDocx(letter: DbGeneratedLetter): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];

  // Top Karnataka Government Mandatory Header (Center Aligned, Bold, Kannada Only, No English)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ',
          bold: true,
          size: 26, // 13pt
          color: '0F172A',
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ',
          bold: true,
          size: 22, // 11pt
          color: '1E293B',
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
          bold: true,
          size: 22, // 11pt
          color: '1E293B',
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301',
          bold: true,
          size: 20, // 10pt
          color: '334155',
        }),
      ],
      spacing: { after: 240 },
    })
  );

  // Letter No & Date Header Line Table
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `ಸಂ: ${letter.letterNumber}`,
          bold: true,
          size: 20,
        }),
        new TextRun({
          text: `\t\t\t\tದಿನಾಂಕ: ${letter.date}`,
          bold: true,
          size: 20,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // If Recipient exists (Normal Letter)
  if (letter.recipient && letter.recipient.trim()) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ಇವರಿಗೆ,\n', bold: true, size: 20 }),
          new TextRun({ text: letter.recipient, size: 20 }),
        ],
        spacing: { after: 180 },
      })
    );
  }

  // Letter Type Title
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `:: ${letter.letterType.toUpperCase()} ::`,
          bold: true,
          size: 24, // 12pt
          color: '0F172A',
          underline: {},
        }),
      ],
      spacing: { before: 100, after: 200 },
    })
  );

  // Subject
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'ವಿಷಯ: ', bold: true, size: 22 }),
        new TextRun({ text: letter.subject, bold: true, size: 20 }),
      ],
      spacing: { after: 140 },
    })
  );

  // Reference
  if (letter.reference) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ಉಲ್ಲೇಖ: ', bold: true, size: 20 }),
          new TextRun({ text: letter.reference.replace(/<[^>]+>/g, ' '), size: 20 }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Preamble (if any)
  if (letter.preamble) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ಪ್ರಸ್ತಾವನೆ:\n', bold: true, size: 20 }),
          new TextRun({ text: letter.preamble, size: 20 }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Body text split by paragraphs
  const rawBody = letter.bodyText
    ? letter.bodyText
    : letter.bodyHtml.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n');

  // Sanitize out any legacy mentions of Ravindranath or English letterhead
  const cleanBody = rawBody
    .replace(/ಶ್ರೀ\s*ಎಸ್\.\s*ಕೆ\.\s*ರವೀಂದ್ರನಾಥ್[,\s]*ಕೆ\.ಇ\.ಎಸ್\./gi, 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು')
    .replace(/ಎಸ್\.\s*ಕೆ\.\s*ರವೀಂದ್ರನಾಥ್/gi, 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು');

  const bodyLines = cleanBody.split('\n').filter(l => l.trim().length > 0);
  for (const line of bodyLines) {
    const trimmed = line.trim();
    // skip duplicates of header/subject already added
    if (
      trimmed.includes('ಕರ್ನಾಟಕ ಸರ್ಕಾರ') ||
      trimmed.includes('ಶಾಲಾ ಶಿಕ್ಷಣ') ||
      trimmed.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ') ||
      trimmed.includes('ಬಿ.ಹೆಚ್. ರಸ್ತೆ') ||
      trimmed.includes('ಹಳೇನಗರ') ||
      trimmed.includes('GOVERNMENT OF KARNATAKA') ||
      trimmed.includes('DEPARTMENT OF SCHOOL EDUCATION') ||
      trimmed.includes('BLOCK EDUCATION OFFICER') ||
      trimmed.startsWith('ವಿಷಯ:') ||
      trimmed.startsWith('ಪತ್ರ ಸಂಖ್ಯೆ:') ||
      trimmed.startsWith('ಸಂಖ್ಯೆ:') ||
      trimmed.startsWith('ಸಂ:')
    ) {
      continue;
    }
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed, size: 20 })],
        spacing: { after: 140 },
        indent: { firstLine: 400 },
      })
    );
  }

  // Physical Signature Block (Right Aligned - Blank for physical signature)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'ತಮ್ಮ ನಂಬುಗೆಯ,\n\n\n\n', size: 20 }),
        new TextRun({ text: (letter as any).showCaseworkerSignature && (letter as any).caseworkerName ? `(${(letter as any).caseworkerName})\n` : '\n', bold: true, size: 20 }),
        new TextRun({ text: (letter as any).showCaseworkerSignature && (letter as any).caseworkerDesignation ? `${(letter as any).caseworkerDesignation}\n` : '', size: 18 }),
      ],
      spacing: { before: 300, after: 240 },
    })
  );

  // Endorsements (Copies Forwarded)
  if (letter.endorsements && letter.endorsements.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ಪ್ರತಿಯನ್ನು ಮಾಹಿತಿ ಮತ್ತು ಮುಂದಿನ ಸೂಕ್ತ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:\n',
            bold: true,
            size: 20,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    letter.endorsements.forEach((end, idx) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. ${end}`,
              size: 19,
            }),
          ],
          indent: { left: 300 },
          spacing: { after: 80 },
        })
      );
    });
  }

  // Document metadata footer
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `\n[ದಾಖಲೆ ಐಡಿ: ${letter.documentId} | ಆವೃತ್ತಿ: v${letter.currentVersion} | ದಿನಾಂಕ: ${letter.date}]`,
          size: 16,
          color: '94A3B8',
          italics: true,
        }),
      ],
      spacing: { before: 200 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
