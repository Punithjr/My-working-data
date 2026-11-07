import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  FileText,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { Employee, DepartmentSection } from '../types';
import { saveBatchEmployeesToFirestore } from '../lib/firebase';

interface EmployeeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (summary: { importedCount: number; updatedCount: number; skippedCount: number }) => void;
}

interface ParsedRow {
  rowNumber: number;
  employeeCode: string;
  kgidNumber?: string;
  basicPay?: number;
  fullName: string;
  designation: string;
  section: string;
  officeLocation: string;
  email: string;
  phone: string;
  employmentType: string;
  status: string;
  role: string;
  joiningDate: string;
  qualifications: string;
  notes: string;
  isValid: boolean;
  errorMessage?: string;
}

export const EmployeeUploadModal: React.FC<EmployeeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'file' | 'paste'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileTypeDetected, setFileTypeDetected] = useState<'excel' | 'csv' | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process rows from 2D array (used by both Excel and CSV)
  const processRowMatrix = (matrix: any[][]) => {
    setUploadError(null);
    if (!matrix || matrix.length < 2) {
      setUploadError('Spreadsheet must contain a header row and at least one employee data row.');
      setParsedRows([]);
      return;
    }

    // Clean header names (supports Kannada and English aliases without stripping Kannada characters)
    const headerRow = matrix[0].map(h => String(h || '').toLowerCase().trim());

    const getIndex = (keys: string[]) => {
      return headerRow.findIndex(h => keys.some(k => h.includes(k.toLowerCase())));
    };

    let codeIdx = getIndex(['code', 'empid', 'id', 'employeeid', 'number', 'ಸಂಖ್ಯೆ', 'ಕೋಡ್']);
    let kgidIdx = getIndex(['kgid', 'kgidnumber', 'kgidno', 'insurance', 'ಕೆಜಿಐಡಿ', 'ವಿಮೆ', 'ಕೆ.ಜಿ.ಐ.ಡಿ']);
    let nameIdx = getIndex(['name', 'fullname', 'officer', 'staff', 'employee', 'ಹೆಸರು', 'ನೌಕರ', 'ಅಧಿಕಾರಿ', 'ಶಿಕ್ಷಕ', 'ಸಿಬ್ಬಂದಿ']);
    let desigIdx = getIndex(['desig', 'title', 'post', 'position', 'role', 'ಹುದ್ದೆ', 'ಪದನಾಮ']);
    let secIdx = getIndex(['sec', 'dept', 'wing', 'department', 'branch', 'ಶಾಖೆ', 'ವಿಭಾಗ']);
    let locIdx = getIndex(['loc', 'office', 'posting', 'school', 'station', 'place', 'ಸ್ಥಳ', 'ಕಚೇರಿ', 'ಶಾಲೆ']);
    let emailIdx = getIndex(['email', 'mail', 'ಇಮೇಲ್']);
    let phoneIdx = getIndex(['phone', 'contact', 'mobile', 'cell', 'tel', 'ದೂರವಾಣಿ', 'ಮೊಬೈಲ್']);
    let basicPayIdx = getIndex(['basic', 'basicpay', 'salary', 'pay', 'moola', 'vethana', 'ವೇತನ', 'ಮೂಲ ವೇತನ', 'ಸಂಬಳ']);
    let typeIdx = getIndex(['type', 'employ', 'cadre', 'ವರ್ಗ']);
    let statusIdx = getIndex(['status', 'state', 'ಸ್ಥಿತಿ']);
    let roleIdx = getIndex(['role', 'level', 'category', 'ಪಾತ್ರ']);
    let dateIdx = getIndex(['date', 'join', 'doj', 'ದಿನಾಂಕ', 'ಸೇರಿದ']);
    let qualIdx = getIndex(['qual', 'degree', 'edu', 'education', 'ವಿದ್ಯಾರ್ಹತೆ', 'ಪದವಿ']);
    let notesIdx = getIndex(['note', 'remark', 'comment', 'ಷರಾ', 'ವಿವರ']);

    // Intelligent positional fallback if headers were ambiguous
    if (nameIdx === -1 && matrix[0].length >= 2) {
      nameIdx = matrix[0].length > 1 ? 1 : 0;
    }
    if (desigIdx === -1 && matrix[0].length >= 3) {
      desigIdx = 2;
    }

    const rows: ParsedRow[] = [];

    for (let i = 1; i < matrix.length; i++) {
      const parts = matrix[i];
      if (!parts || parts.length === 0) continue;
      // Skip empty row
      if (parts.every(cell => !cell || String(cell).trim() === '')) continue;

      const codeRaw = codeIdx >= 0 && parts[codeIdx] ? String(parts[codeIdx]).trim() : '';
      const code = codeRaw || `EDN-EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const kgidRaw = kgidIdx >= 0 && parts[kgidIdx] ? String(parts[kgidIdx]).trim() : '';
      const name = nameIdx >= 0 && parts[nameIdx] ? String(parts[nameIdx]).trim() : '';
      const desig = desigIdx >= 0 && parts[desigIdx] ? String(parts[desigIdx]).trim() : '';
      const sec = secIdx >= 0 && parts[secIdx] ? String(parts[secIdx]).trim() : 'Academic Wing';
      const loc = locIdx >= 0 && parts[locIdx] ? String(parts[locIdx]).trim() : 'Education Directorate';
      const email = emailIdx >= 0 && parts[emailIdx] ? String(parts[emailIdx]).trim() : '';
      const phone = phoneIdx >= 0 && parts[phoneIdx] ? String(parts[phoneIdx]).trim() : '';
      
      const rawPay = basicPayIdx >= 0 && parts[basicPayIdx] ? String(parts[basicPayIdx]).replace(/[^0-9.]/g, '') : '';
      const basicPay = rawPay ? Number(rawPay) : 37900;

      const type = typeIdx >= 0 && parts[typeIdx] ? String(parts[typeIdx]).trim() : 'Permanent';
      const status = statusIdx >= 0 && parts[statusIdx] ? String(parts[statusIdx]).trim() : 'Active';
      const role = roleIdx >= 0 && parts[roleIdx] ? String(parts[roleIdx]).trim() : 'Section Officer';
      
      let joinDate = dateIdx >= 0 && parts[dateIdx] ? String(parts[dateIdx]).trim() : '';
      if (!joinDate || joinDate.length < 4) {
        joinDate = new Date().toISOString().split('T')[0];
      }

      const qual = qualIdx >= 0 && parts[qualIdx] ? String(parts[qualIdx]).trim() : '';
      const notes = notesIdx >= 0 && parts[notesIdx] ? String(parts[notesIdx]).trim() : '';

      const isValid = Boolean(name && desig);
      const errorMessage = !name 
        ? 'Missing Full Name' 
        : !desig 
        ? 'Missing Designation' 
        : undefined;

      rows.push({
        rowNumber: i + 1,
        employeeCode: code,
        kgidNumber: kgidRaw || undefined,
        basicPay,
        fullName: name,
        designation: desig,
        section: sec,
        officeLocation: loc,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gov.education.org`,
        phone: phone || '+91 94480 00000',
        employmentType: type,
        status: status,
        role: role,
        joiningDate: joinDate,
        qualifications: qual,
        notes: notes,
        isValid,
        errorMessage,
      });
    }

    if (rows.length === 0) {
      setUploadError('No valid data rows detected in the spreadsheet.');
    }

    setParsedRows(rows);
  };

  // Process File (handles Excel .xlsx, .xls and CSV)
  const processUploadedFile = (file: File) => {
    setUploadError(null);
    setFileName(file.name);

    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || 
                    file.name.toLowerCase().endsWith('.xls') ||
                    file.type.includes('spreadsheet') || 
                    file.type.includes('excel');

    if (isExcel) {
      setFileTypeDetected('excel');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          setSheetNames(workbook.SheetNames);
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          setSelectedSheet(workbook.SheetNames[0]);
          const matrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          processRowMatrix(matrix);
        } catch (err: any) {
          console.error('Excel parse error:', err);
          setUploadError(`Failed to read Excel file: ${err?.message || 'Invalid format'}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV or plain text
      setFileTypeDetected('csv');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const matrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          processRowMatrix(matrix);
        } catch {
          // Fallback manual CSV split
          const lines = (e.target?.result as string).split(/\r?\n/).filter(l => l.trim().length > 0);
          const matrix = lines.map(l => l.split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1')));
          processRowMatrix(matrix);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Pasted Text parsing
  const handleParsePastedText = () => {
    if (!rawText.trim()) {
      setUploadError('Please paste CSV or tab-separated employee data first.');
      return;
    }
    try {
      const workbook = XLSX.read(rawText, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const matrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      processRowMatrix(matrix);
    } catch {
      const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
      const matrix = lines.map(l => l.split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1')));
      processRowMatrix(matrix);
    }
  };

  // Preload Sample Rich Employee Data
  const handlePreloadSampleData = () => {
    setUploadError(null);
    setFileName('Sample_Karnataka_Education_Cadre.xlsx');
    setFileTypeDetected('excel');

    const sampleMatrix = [
      ['Employee Code', 'KGID Number', 'Full Name', 'Designation', 'Department Section', 'Office Location', 'Basic Pay', 'Email', 'Phone', 'Employment Type', 'Status', 'Role', 'Joining Date', 'Qualifications', 'Notes'],
      ['EDN-BHD-001', '124589', 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ (B.K. Narayanappa)', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 74200, 'beo.bhadravathi@karnataka.gov.in', '+91 94489 91201', 'Permanent', 'Active', 'Director / HOD', '2004-08-10', 'M.A., M.Ed., KES', 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO), ಭದ್ರಾವತಿ.'],
      ['EDN-BHD-002', '184920', 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ (H.S. Manjunatha)', 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Office Superintendent)', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 52650, 'manjunath.hs@karnataka.gov.in', '+91 94481 44520', 'Permanent', 'Active', 'Superintendent', '2009-11-14', 'B.Com, SAS', 'ಕಛೇರಿ ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ ಮೇಲ್ವಿಚಾರಣೆ.'],
      ['EDN-BHD-003', '219402', 'ರಮೇಶ್ ಕೆ. ಎನ್. (Ramesh K.N.)', 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA) - ಆ2 ಸ.ಪ್ರಾ.ಶಿ', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 43500, 'ramesh.kn@karnataka.gov.in', '+91 94482 66781', 'Permanent', 'Active', 'Staff / Clerk', '2012-05-18', 'B.A., B.Ed.', 'ಆ2 ಸ.ಪ್ರಾ.ಶಿ ಶಾಖೆ - ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಕರ ವೇತನ ಬಡ್ತಿ & ರಜೆ.'],
      ['EDN-BHD-004', '335712', 'ಪ್ರದೀಪ್ ಕುಮಾರ್ ಎನ್. (Pradeep Kumar N.)', 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA)', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 29600, 'pradeep.kumar@karnataka.gov.in', '+91 97410 88231', 'Permanent', 'Active', 'Clerk / Assistant', '2020-01-15', 'B.C.A.', 'ಆವಕ-ಜಾವಕ ರಿಜಿಸ್ಟರ್ & ಇ-ಕಡತಗಳ ರವಾನೆ.'],
    ];

    processRowMatrix(sampleMatrix);
  };

  // Download Genuine Excel Spreadsheet Template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new();

    const templateData = [
      ['Employee Code', 'KGID Number', 'Full Name', 'Designation', 'Department Section', 'Office Location', 'Basic Pay', 'Email', 'Phone', 'Employment Type', 'Status', 'Role', 'Joining Date', 'Qualifications', 'Notes'],
      ['EDN-BHD-001', '124589', 'ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO)', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 74200, 'beo.bhadravathi@karnataka.gov.in', '+91 94489 91201', 'Permanent', 'Active', 'Director / HOD', '2004-08-10', 'M.A., M.Ed., KES', 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ, ಭದ್ರಾವತಿ.'],
      ['EDN-BHD-002', '184920', 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ', 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 52650, 'manjunath.hs@karnataka.gov.in', '+91 94481 44520', 'Permanent', 'Active', 'Superintendent', '2009-11-14', 'B.Com, SAS', 'ಕಛೇರಿ ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ ಶಾಖೆ.'],
      ['EDN-BHD-003', '219402', 'ರಮೇಶ್ ಕೆ. ಎನ್.', 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)', 'Administration & Services', 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ', 43500, 'ramesh.kn@karnataka.gov.in', '+91 94482 66781', 'Permanent', 'Active', 'Staff / Clerk', '2012-05-18', 'B.A., B.Ed.', 'ಆ2 ಸ.ಪ್ರಾ.ಶಿ ಶಾಖೆ.'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set Column Widths for clean Excel layout
    ws['!cols'] = [
      { wch: 16 }, // Code
      { wch: 16 }, // KGID
      { wch: 28 }, // Name
      { wch: 32 }, // Designation
      { wch: 26 }, // Section
      { wch: 34 }, // Location
      { wch: 14 }, // Basic Pay
      { wch: 30 }, // Email
      { wch: 20 }, // Phone
      { wch: 18 }, // Type
      { wch: 14 }, // Status
      { wch: 22 }, // Role
      { wch: 16 }, // Joining Date
      { wch: 32 }, // Qualifications
      { wch: 40 }, // Notes
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Bhadravathi_Staff_Roster');
    XLSX.writeFile(wb, 'BEO_Bhadravathi_Staff_Roster_Template.xlsx');
  };

  // Download CSV template
  const handleDownloadCSVTemplate = () => {
    const csvContent = `Employee Code,KGID Number,Full Name,Designation,Department Section,Office Location,Basic Pay,Email,Phone,Employment Type,Status,Role,Joining Date,Qualifications,Notes
EDN-BHD-101,KGID-884210,ಡಾ. ಮಂಜುನಾಥ್ ಕೆ. ಎಸ್.,ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು,Administration & Services,ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ,68400,beo.bhadravathi@karnataka.gov.in,+91 94481 22331,Permanent,Active,Director / HOD,2015-06-01,"M.A., M.Ed.",BEO Bhadravathi
EDN-BHD-102,KGID-763190,ಶ್ರೀಮತಿ ಸುಧಾ ಎಂ.,ಹಿರಿಯ ಸಹಾಯಕ ನಿರ್ದೇಶಕರು,Academic Wing,ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ,52650,sudha.m@karnataka.gov.in,+91 94482 33442,Permanent,Active,Section Officer,2017-08-10,"M.Sc., B.Ed.",Academic branch
EDN-BHD-105,KGID-543219,ಶ್ರೀ ಪ್ರಕಾಶ್ ಸಿ. ಜಿ.,ಸಹ ಶಿಕ್ಷಕರು,Academic Wing,ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ಭದ್ರಾವತಿ,43100,prakash.cg@karnataka.gov.in,+91 94485 66775,Permanent,Active,Faculty / Principal,2014-07-01,"B.Sc., B.Ed.",High school teacher`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'beo_bhadravathi_emp_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Commit batch upload
  const handleUploadCommit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setUploadError('No valid employee records found to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const payload = validRows.map(r => ({
        employeeCode: r.employeeCode,
        kgidNumber: r.kgidNumber,
        basicPay: r.basicPay,
        fullName: r.fullName,
        designation: r.designation,
        section: r.section,
        officeLocation: r.officeLocation,
        email: r.email,
        phone: r.phone,
        employmentType: r.employmentType,
        status: r.status,
        role: r.role,
        joiningDate: r.joiningDate,
        qualifications: r.qualifications,
        notes: r.notes,
      }));

      const res = await fetch('/api/employees/batch-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeesList: payload,
          overwriteExisting,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload employees');
      }

      // Persist to Firestore Cloud as permanent backup
      try {
        await saveBatchEmployeesToFirestore(payload);
      } catch (fbErr) {
        console.warn('Firestore backup note:', fbErr);
      }

      // Persist to localStorage client cache
      try {
        const cached = localStorage.getItem('edu_persistent_employees');
        const existingList: any[] = cached ? JSON.parse(cached) : [];
        const mergedMap = new Map<string, any>();
        existingList.forEach(e => mergedMap.set(e.kgidNumber || e.employeeCode || e.id, e));
        payload.forEach(e => mergedMap.set(e.kgidNumber || e.employeeCode || e.id, e));
        localStorage.setItem('edu_persistent_employees', JSON.stringify(Array.from(mergedMap.values())));
      } catch (lsErr) {
        console.warn('localStorage cache note:', lsErr);
      }

      onUploadSuccess({
        importedCount: data.importedCount,
        updatedCount: data.updatedCount,
        skippedCount: data.skippedCount,
      });
      onClose();
    } catch (err: any) {
      setUploadError(err?.message || 'Error executing employee batch upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="employee-upload-modal"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  ಎಕ್ಸೆಲ್ ಶೀಟ್ ಅಪ್ಲೋಡ್ • Batch Upload Staff Roster (Excel & CSV)
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800">
                  .XLSX SUPPORTED
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Upload department employees, teachers, and officers using Microsoft Excel (.xlsx, .xls) or CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Action Bar with Download Excel Template & Preload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl">
            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Standardized Civil Service Excel / CSV Format</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Columns: Employee Code, Full Name, Designation, Section, Office Location, Email, Phone, Status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePreloadSampleData}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                title="Preload authentic sample employee records for instant preview"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Preload Sample Data (ಪರೀಕ್ಷಾರ್ಥ ಡೇಟಾ)</span>
              </button>

              <button
                id="btn-download-excel-template"
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                title="Download Microsoft Excel .xlsx template with column formatting"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download Excel Template (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSVTemplate}
                className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors"
                title="Download plain CSV template"
              >
                <span>.CSV</span>
              </button>
            </div>
          </div>

          {/* Mode Selector: File Drop or Paste Text */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('file')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeMode === 'file' 
                    ? 'bg-stone-900 text-white' 
                    : 'text-stone-600 hover:text-stone-900 bg-stone-100'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Excel / CSV File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeMode === 'paste' 
                    ? 'bg-stone-900 text-white' 
                    : 'text-stone-600 hover:text-stone-900 bg-stone-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Spreadsheet Text</span>
              </button>
            </div>

            {fileTypeDetected && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>{fileTypeDetected === 'excel' ? 'Excel Sheet (.xlsx / .xls)' : 'CSV Data'}</span>
              </span>
            )}
          </div>

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* MODE 1: FILE DROPZONE */}
          {activeMode === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                id="emp-dropzone"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-stone-50/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-xs font-bold text-stone-900">
                  {fileName ? `ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ (Selected): ${fileName}` : 'ಎಕ್ಸೆಲ್ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ (Click or Drag & Drop Excel Sheet)'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  ಬೆಂಬಲಿತ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು (Supported): <strong>.xlsx, .xls (Microsoft Excel)</strong>, .csv, .tsv
                </p>
                {sheetNames.length > 1 && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-2">
                    Worksheets: {sheetNames.join(', ')} (Loaded: {selectedSheet})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: PASTE TEXT */}
          {activeMode === 'paste' && (
            <div className="space-y-2">
              <textarea
                id="textarea-csv-paste"
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste CSV or Tab-delimited rows here, e.g.:
Employee Code	Full Name	Designation	Department Section	Email
EDN-EMP-501	Dr. Catherine Miller	Joint Director	Academic Wing	catherine.m@gov.education.org"
                className="w-full font-mono text-xs p-3 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Parse Pasted Content</span>
              </button>
            </div>
          )}

          {/* PARSED PREVIEW TABLE */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">
                    ದಾಖಲೆಗಳ ಮುನ್ನೋಟ (Preview Records): {parsedRows.length} Rows
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {validCount} Valid & Ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      {invalidCount} Needs Correction
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded-xs border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ಈಗಾಗಲೇ ಇರುವ ಕೋಡ್ ಹೊಂದಾಣಿಕೆಯಾದರೆ ಅಪ್ಡೇಟ್ ಮಾಡಿ (Overwrite if Code matches)</span>
                </label>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">ಸ್ಥಿತಿ (Status)</th>
                      <th className="py-2 px-3">ಕೋಡ್ (Emp Code)</th>
                      <th className="py-2 px-3">ಕೆಜಿಐಡಿ (KGID)</th>
                      <th className="py-2 px-3">ಪೂರ್ಣ ಹೆಸರು (Full Name)</th>
                      <th className="py-2 px-3">ಹುದ್ದೆ (Designation)</th>
                      <th className="py-2 px-3">ಮೂಲ ವೇತನ (Basic Pay)</th>
                      <th className="py-2 px-3">ಶಾಖೆ (Section)</th>
                      <th className="py-2 px-3">ಕಚೇರಿ (Office)</th>
                      <th className="py-2 px-3">ಸಂಪರ್ಕ (Email / Phone)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {parsedRows.map((row) => (
                      <tr 
                        key={row.rowNumber}
                        className={row.isValid ? 'hover:bg-stone-50' : 'bg-rose-50/60'}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{row.errorMessage}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium text-stone-800">
                          {row.employeeCode}
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-700 font-semibold">
                          {row.kgidNumber || <span className="text-stone-400 italic">--</span>}
                        </td>
                        <td className="py-2 px-3 font-semibold text-stone-900">
                          {row.fullName || <span className="text-stone-400 italic">Empty</span>}
                        </td>
                        <td className="py-2 px-3 text-stone-600">
                          {row.designation || <span className="text-stone-400 italic">Empty</span>}
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-stone-900">
                          ₹{(row.basicPay || 37900).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-stone-600">
                          {row.section}
                        </td>
                        <td className="py-2 px-3 text-stone-500 text-[11px] truncate max-w-[150px]">
                          {row.officeLocation}
                        </td>
                        <td className="py-2 px-3 text-stone-500 text-[11px]">
                          {row.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500">
              {parsedRows.length > 0 ? `${validCount} ಸಿಬ್ಬಂದಿ ದಾಖಲೆಗಳು ಅಪ್ಲೋಡ್ ಮಾಡಲು ಸಿದ್ಧವಾಗಿವೆ` : 'ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ (No file selected)'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                ರದ್ದುಗೊಳಿಸಿ (Cancel)
              </button>
              <button
                id="btn-confirm-emp-upload"
                type="button"
                disabled={validCount === 0 || isUploading}
                onClick={handleUploadCommit}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isUploading ? (
                  <span>ಅಪ್ಲೋಡ್ ಆಗುತ್ತಿದೆ (Importing Records)...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>ಅಪ್ಲೋಡ್ ಮಾಡಿ (Upload & Import {validCount} Employees)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
