import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { MasterDocketFile, EducationLetter, DocumentAttachment, FileMovementRecord } from '../src/types';

export const BEO_EOFFICE_ROOT = path.resolve(process.cwd(), 'BEO_EOFFICE');
export const BEO_FILES_DIR = path.join(BEO_EOFFICE_ROOT, 'Files');
export const SQLITE_DB_PATH = path.resolve(process.cwd(), 'data', 'beo_eoffice.sqlite');

export interface SQLiteFileRecord {
  file_id: string;
  file_number: string;
  file_code: string;
  subject: string;
  section: string;
  section_code?: string;
  section_name?: string;
  file_category?: string;
  initiated_date: string;
  status: string;
  current_custodian: string;
  priority: string;
  due_date?: string;
  notes?: string;
  is_rti_file: number;
  rti_details?: string;
  closed_at?: string;
  closed_by?: string;
  closure_reason?: string;
  closure_compliance_notes?: string;
  created_at: string;
  updated_at: string;
}

export class BeoEOfficeSQLiteManager {
  private db: Database.Database;

  constructor() {
    const dataDir = path.dirname(SQLITE_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(BEO_FILES_DIR)) {
      fs.mkdirSync(BEO_FILES_DIR, { recursive: true });
    }

    this.db = new Database(SQLITE_DB_PATH);
    // Enforce foreign keys and WAL journal mode
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');

    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        file_id TEXT PRIMARY KEY,
        file_number TEXT UNIQUE NOT NULL,
        file_code TEXT UNIQUE NOT NULL,
        subject TEXT NOT NULL,
        section TEXT NOT NULL,
        section_code TEXT,
        section_name TEXT,
        file_category TEXT,
        initiated_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active / Open',
        current_custodian TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'Routine',
        due_date TEXT,
        notes TEXT,
        is_rti_file INTEGER DEFAULT 0,
        rti_details TEXT,
        closed_at TEXT,
        closed_by TEXT,
        closure_reason TEXT,
        closure_compliance_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS letters (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE RESTRICT,
        file_number TEXT NOT NULL,
        file_letter_number TEXT,
        reference_number TEXT NOT NULL,
        direction TEXT NOT NULL,
        subject TEXT NOT NULL,
        category TEXT NOT NULL,
        sender_name TEXT,
        sender_dept TEXT,
        sender_designation TEXT,
        recipient_name TEXT,
        recipient_dept TEXT,
        recipient_designation TEXT,
        date_issued TEXT NOT NULL,
        due_date TEXT,
        priority TEXT DEFAULT 'Routine',
        status TEXT DEFAULT 'Pending Action',
        assigned_officer TEXT,
        section TEXT,
        confidentiality TEXT DEFAULT 'Public / Open',
        body_text TEXT,
        action_notes TEXT,
        attachments TEXT,
        endorsements TEXT,
        tags TEXT,
        financial_amount REAL,
        inward_number TEXT,
        outward_number TEXT,
        dispatch_mode TEXT,
        tracking_number TEXT,
        postal_stamp_amount REAL,
        remarks TEXT,
        file_path TEXT,
        created_at TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inward_documents (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE CASCADE,
        reference_number TEXT,
        inward_number TEXT,
        sender_name TEXT,
        sender_dept TEXT,
        received_date TEXT,
        subject TEXT NOT NULL,
        status TEXT DEFAULT 'Pending Action',
        due_date TEXT,
        file_path TEXT,
        data_json TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE CASCADE,
        order_number TEXT NOT NULL,
        order_type TEXT,
        employee_name TEXT,
        kgid_number TEXT,
        effective_date TEXT,
        subject TEXT,
        order_text TEXT,
        file_path TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE CASCADE,
        report_title TEXT NOT NULL,
        report_type TEXT,
        generated_by TEXT,
        generated_at TEXT,
        content TEXT,
        file_path TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_size TEXT,
        file_type TEXT,
        page_count INTEGER,
        uploaded_at TEXT,
        description TEXT,
        data_url TEXT,
        file_path TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS file_movement_history (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL REFERENCES files(file_id) ON DELETE CASCADE,
        from_officer TEXT NOT NULL,
        to_officer TEXT NOT NULL,
        sent_date TEXT NOT NULL,
        remarks TEXT,
        status_after_move TEXT,
        initiating_officer TEXT,
        transfer_timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS letter_versions (
        id TEXT PRIMARY KEY,
        letter_id TEXT NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        subject TEXT,
        body_html TEXT,
        body_text TEXT,
        notes TEXT
      );
    `);

    // Safe column migrations for caseworker letter generation & print tracking
    const letterColumns = [
      "ALTER TABLE letters ADD COLUMN caseworker_name TEXT",
      "ALTER TABLE letters ADD COLUMN caseworker_designation TEXT",
      "ALTER TABLE letters ADD COLUMN prepared_date TEXT",
      "ALTER TABLE letters ADD COLUMN print_status TEXT DEFAULT 'Pending Print'",
      "ALTER TABLE letters ADD COLUMN is_printed INTEGER DEFAULT 0",
      "ALTER TABLE letters ADD COLUMN printed_at TEXT",
      "ALTER TABLE letters ADD COLUMN print_count INTEGER DEFAULT 0",
      "ALTER TABLE letters ADD COLUMN show_caseworker_signature INTEGER DEFAULT 0"
    ];
    for (const sql of letterColumns) {
      try {
        this.db.exec(sql);
      } catch {
        // column already exists
      }
    }
  }

  /**
   * Generates or retrieves the canonical file folder:
   * BEO_EOFFICE/Files/FILE-0001/
   *   ├── File_Details/
   *   ├── Inward/
   *   ├── Letters/
   *   ├── Orders/
   *   ├── Reports/
   *   └── Attachments/
   */
  public ensureFileFolderStructure(fileCode: string): {
    root: string;
    detailsDir: string;
    inwardDir: string;
    lettersDir: string;
    ordersDir: string;
    reportsDir: string;
    attachmentsDir: string;
  } {
    const root = path.join(BEO_FILES_DIR, fileCode);
    const detailsDir = path.join(root, 'File_Details');
    const inwardDir = path.join(root, 'Inward');
    const lettersDir = path.join(root, 'Letters');
    const ordersDir = path.join(root, 'Orders');
    const reportsDir = path.join(root, 'Reports');
    const attachmentsDir = path.join(root, 'Attachments');

    const dirs = [root, detailsDir, inwardDir, lettersDir, ordersDir, reportsDir, attachmentsDir];
    for (const d of dirs) {
      if (!fs.existsSync(d)) {
        fs.mkdirSync(d, { recursive: true });
      }
    }

    return { root, detailsDir, inwardDir, lettersDir, ordersDir, reportsDir, attachmentsDir };
  }

  /**
   * Helper to format next file code: e.g. FILE-0001, FILE-0002...
   */
  public getNextFileCode(): string {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number };
    const nextNum = (row?.count || 0) + 1;
    return `FILE-${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Syncs file metadata to its File_Details/ folder
   */
  public syncFileDetailsToDisk(file: MasterDocketFile, fileCode: string) {
    try {
      const dirs = this.ensureFileFolderStructure(fileCode);
      const metaPath = path.join(dirs.detailsDir, 'metadata.json');
      const summaryPath = path.join(dirs.detailsDir, 'file_summary.txt');

      fs.writeFileSync(metaPath, JSON.stringify(file, null, 2), 'utf-8');

      const textSummary = [
        `============================================================`,
        `ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ`,
        `ಇ-ಕಛೇರಿ ಅಧಿಕೃತ ಕಡತ ವಿವರಣೆ (E-Office Master Docket Dossier)`,
        `============================================================`,
        `ಕಡತ ಕೋಡ್ (File Code): ${fileCode}`,
        `ಕಡತ ಸಂಖ್ಯೆ (File Number): ${file.fileNumber}`,
        `ವಿಷಯ (Subject): ${file.subject}`,
        `ವಿಭಾಗ (Section): ${file.section} [${file.sectionCode || 'ಆ2'} - ${file.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ'}]`,
        `ವರ್ಗೀಕರಣ (Category): ${file.fileCategory || 'ಸಾಮಾನ್ಯ ಕಡತ'}`,
        `ಪ್ರಾರಂಭ ದಿನಾಂಕ (Initiated Date): ${file.initiatedDate}`,
        `ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ (Status): ${file.status}`,
        `ಪ್ರಸ್ತುತ ಅಧಿಕಾರಿ (Current Custodian): ${file.currentCustodian}`,
        `ಆದ್ಯತೆ (Priority): ${file.priority}`,
        `ನಿಗದಿತ ದಿನಾಂಕ (Due Date): ${file.dueDate || '30 ದಿನಗಳು'}`,
        `ಟಿಪ್ಪಣಿ (Notes): ${file.notes || 'ಯಾವುದೂ ಇಲ್ಲ'}`,
        `ಕೊನೆಯ ಅಪ್ಡೇಟ್: ${new Date().toISOString()}`,
        `============================================================`
      ].join('\n');

      fs.writeFileSync(summaryPath, textSummary, 'utf-8');
    } catch (err) {
      console.warn('Failed to sync file details to disk:', err);
    }
  }

  /**
   * Automatically stores letter in its corresponding file folder
   */
  public storeLetterInFileFolder(letter: EducationLetter, fileCode: string): string {
    const dirs = this.ensureFileFolderStructure(fileCode);
    const safeRef = (letter.referenceNumber || letter.id).replace(/[/\\?%*:|"<>]/g, '_');
    const jsonPath = path.join(dirs.lettersDir, `${letter.id}.json`);
    const htmlPath = path.join(dirs.lettersDir, `${letter.id}_${safeRef}.html`);
    const txtPath = path.join(dirs.lettersDir, `${letter.id}.txt`);

    // Save JSON
    fs.writeFileSync(jsonPath, JSON.stringify(letter, null, 2), 'utf-8');

    // Save printable HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="utf-8">
  <title>${letter.referenceNumber} - ${letter.subject}</title>
  <style>
    body { font-family: 'Noto Sans Kannada', Arial, sans-serif; padding: 30px; line-height: 1.6; color: #1c1917; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
    .header h2 { margin: 0 0 4px 0; font-size: 18px; }
    .header h3 { margin: 0; font-size: 15px; color: #444; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    .meta-table td { padding: 6px 8px; vertical-align: top; }
    .content-box { border: 1px solid #ccc; padding: 20px; background: #fafafa; border-radius: 6px; min-height: 250px; font-size: 14px; white-space: pre-wrap; }
    .footer { margin-top: 40px; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h2>ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ</h2>
    <h3>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</h3>
    <p style="font-size: 12px; margin: 4px 0 0 0;">ಕಡತ ಕೋಡ್: ${fileCode} | ಕಡತ ಸಂ: ${letter.fileNumber}</p>
  </div>

  <table class="meta-table">
    <tr>
      <td style="width: 50%;"><strong>ಪತ್ರ ಸಂ:</strong> ${letter.referenceNumber}</td>
      <td style="text-align: right;"><strong>ದಿನಾಂಕ:</strong> ${letter.dateReceivedOrIssued}</td>
    </tr>
    <tr>
      <td><strong>ಇವರಿಂದ:</strong> ${letter.senderName} (${letter.senderDesignation})<br>${letter.senderDepartment}</td>
      <td style="text-align: right;"><strong>ಇವರಿಗೆ:</strong> ${letter.recipientName} (${letter.recipientDesignation})<br>${letter.recipientDepartment}</td>
    </tr>
  </table>

  <p><strong>ವಿಷಯ:</strong> ${letter.subject}</p>
  <div class="content-box">
${letter.bodyText || 'ಯಾವುದೇ ವಿವರಣೆ ನಮೂದಿಸಿಲ್ಲ.'}
  </div>

  <div class="signature-block" style="text-align: right; margin-top: 45px;">
    <p style="margin-bottom: 35px; font-weight: 500;">ತಮ್ಮ ನಂಬುಗೆಯ,</p>
    <!-- Generous physical signature blank space -->
    <div style="height: 50px;"></div>
    ${(letter as any).showCaseworkerSignature && (letter as any).caseworkerName ? `
      <p style="margin: 0; font-weight: bold; font-size: 13px;">(${ (letter as any).caseworkerName })</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">${ (letter as any).caseworkerDesignation || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Caseworker)' }</p>
    ` : ''}
  </div>

  <div class="caseworker-footer" style="margin-top: 35px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
    <span>ವಿಷಯ ನಿರ್ವಾಹಕರು (Caseworker): ${(letter as any).caseworkerName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು'}</span>
    <span>ದಿನಾಂಕ: ${(letter as any).preparedDate || letter.dateReceivedOrIssued}</span>
    <span>ಮುದ್ರಣ ಸ್ಥಿತಿ: ${(letter as any).printStatus || ((letter as any).isPrinted ? 'Printed' : 'Pending Print')}</span>
  </div>
</body>
</html>`;
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

    // Save simple text
    const textContent = `ಪತ್ರ ಸಂಖ್ಯೆ: ${letter.referenceNumber}\nಕಡತ: ${letter.fileNumber} (${fileCode})\nದಿನಾಂಕ: ${letter.dateReceivedOrIssued}\nವಿಷಯ: ${letter.subject}\n\n${letter.bodyText || ''}\n\nತಮ್ಮ ನಂಬುಗೆಯ,\n\n[ಸಹಿಗಾಗಿ ಖಾಲಿ ಜಾಗ]\n\nತಯಾರಿಸಿದ Caseworker: ${(letter as any).caseworkerName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು'}\nಮುದ್ರಣ ಸ್ಥಿತಿ: ${(letter as any).printStatus || 'Pending Print'}`;
    fs.writeFileSync(txtPath, textContent, 'utf-8');

    return jsonPath;
  }

  /**
   * Stores inward dak in file folder
   */
  public storeInwardInFileFolder(inward: any, fileCode: string): string {
    const dirs = this.ensureFileFolderStructure(fileCode);
    const jsonPath = path.join(dirs.inwardDir, `${inward.id || Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(inward, null, 2), 'utf-8');
    return jsonPath;
  }

  /**
   * Stores order in file folder
   */
  public storeOrderInFileFolder(order: any, fileCode: string): string {
    const dirs = this.ensureFileFolderStructure(fileCode);
    const jsonPath = path.join(dirs.ordersDir, `${order.id || Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(order, null, 2), 'utf-8');
    return jsonPath;
  }

  /**
   * Stores report in file folder
   */
  public storeReportInFileFolder(report: any, fileCode: string): string {
    const dirs = this.ensureFileFolderStructure(fileCode);
    const jsonPath = path.join(dirs.reportsDir, `${report.id || Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    return jsonPath;
  }

  /**
   * Stores attachment in file folder
   */
  public storeAttachmentInFileFolder(att: DocumentAttachment, fileCode: string): string {
    const dirs = this.ensureFileFolderStructure(fileCode);
    const safeName = att.fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const filePath = path.join(dirs.attachmentsDir, `${att.id}_${safeName}`);

    if (att.dataUrl && att.dataUrl.includes('base64,')) {
      const parts = att.dataUrl.split('base64,');
      const buf = Buffer.from(parts[1], 'base64');
      fs.writeFileSync(filePath, buf);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(att, null, 2), 'utf-8');
    }
    return filePath;
  }

  // ==================== DATABASE TRANSACTIONS & OPERATIONS ====================

  /**
   * Migrates existing files, letters, and attachments safely into SQLite with full transactions.
   */
  public migrateExistingRecords(existingDockets: MasterDocketFile[], existingLetters: EducationLetter[]) {
    const insertFileTx = this.db.transaction((dockets: MasterDocketFile[], lettersList: EducationLetter[]) => {
      const fileCodeMap = new Map<string, string>(); // fileId or fileNumber -> fileCode
      
      // 0. Pre-seed fileCodeMap from existing files already in database
      const existingDbFiles = this.db.prepare('SELECT file_id, file_number, file_code FROM files').all() as any[];
      let maxCodeNum = 0;
      for (const ef of existingDbFiles) {
        fileCodeMap.set(ef.file_id, ef.file_code);
        fileCodeMap.set(ef.file_number, ef.file_code);
        const match = String(ef.file_code).match(/FILE-(\d+)/i);
        if (match) {
          maxCodeNum = Math.max(maxCodeNum, parseInt(match[1], 10));
        }
      }
      let index = maxCodeNum + 1;

      // 1. Insert or Update Files without deleting parent rows (preserves Foreign Key integrity)
      const fileStmt = this.db.prepare(`
        INSERT INTO files (
          file_id, file_number, file_code, subject, section, section_code, section_name,
          file_category, initiated_date, status, current_custodian, priority, due_date,
          notes, is_rti_file, rti_details, closed_at, closed_by, closure_reason,
          closure_compliance_notes, created_at, updated_at
        ) VALUES (
          @file_id, @file_number, @file_code, @subject, @section, @section_code, @section_name,
          @file_category, @initiated_date, @status, @current_custodian, @priority, @due_date,
          @notes, @is_rti_file, @rti_details, @closed_at, @closed_by, @closure_reason,
          @closure_compliance_notes, @created_at, @updated_at
        )
        ON CONFLICT(file_id) DO UPDATE SET
          file_number = excluded.file_number,
          subject = excluded.subject,
          section = excluded.section,
          section_code = excluded.section_code,
          section_name = excluded.section_name,
          file_category = excluded.file_category,
          initiated_date = excluded.initiated_date,
          status = excluded.status,
          current_custodian = excluded.current_custodian,
          priority = excluded.priority,
          due_date = excluded.due_date,
          notes = excluded.notes,
          is_rti_file = excluded.is_rti_file,
          rti_details = excluded.rti_details,
          updated_at = excluded.updated_at
      `);

      for (const d of dockets) {
        let fileCode = fileCodeMap.get(d.id) || fileCodeMap.get(d.fileNumber);
        if (!fileCode) {
          fileCode = `FILE-${String(index++).padStart(4, '0')}`;
          fileCodeMap.set(d.id, fileCode);
          fileCodeMap.set(d.fileNumber, fileCode);
        }

        fileStmt.run({
          file_id: d.id,
          file_number: d.fileNumber,
          file_code: fileCode,
          subject: d.subject || 'ವಿಷಯ ನಮೂದಿಸಿಲ್ಲ',
          section: d.section || 'Administration & Services',
          section_code: d.sectionCode || 'ಆ2',
          section_name: d.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ',
          file_category: d.fileCategory || 'ಸಾಮಾನ್ಯ ಕಡತ',
          initiated_date: d.initiatedDate || new Date().toISOString().split('T')[0],
          status: d.status || 'Active / Open',
          current_custodian: d.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
          priority: d.priority || 'Routine',
          due_date: d.dueDate || null,
          notes: d.notes || null,
          is_rti_file: d.isRtiFile ? 1 : 0,
          rti_details: d.rtiDetails ? JSON.stringify(d.rtiDetails) : null,
          closed_at: d.status?.includes('Closed') || d.status?.includes('Disposed') ? new Date().toISOString() : null,
          closed_by: null,
          closure_reason: null,
          closure_compliance_notes: null,
          created_at: d.initiatedDate || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Initialize folder & sync
        this.syncFileDetailsToDisk(d, fileCode);

        // Store movement history without conflict errors
        const movStmt = this.db.prepare(`
          INSERT INTO file_movement_history (
            id, file_id, from_officer, to_officer, sent_date, remarks, status_after_move,
            initiating_officer, transfer_timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `);

        const movements = d.movementHistory || d.movementTrail || [];
        for (const m of movements) {
          movStmt.run(
            m.id || `mov-${Date.now()}-${Math.random()}`,
            d.id,
            m.fromOfficer || 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು',
            m.toOfficer || d.currentCustodian,
            m.sentDate || new Date().toISOString().split('T')[0],
            m.remarks || '',
            m.statusAfterMove || d.status,
            m.initiatingOfficer || null,
            m.transferTimestamp || null
          );
        }

        // Store attachments without conflict errors
        if (Array.isArray(d.attachments)) {
          const attStmt = this.db.prepare(`
            INSERT INTO attachments (
              id, file_id, file_name, file_size, file_type, page_count,
              uploaded_at, description, data_url, file_path, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING
          `);
          for (const a of d.attachments) {
            const diskPath = this.storeAttachmentInFileFolder(a, fileCode);
            attStmt.run(
              a.id,
              d.id,
              a.fileName,
              a.fileSize || '1.0 MB',
              a.fileType || 'application/pdf',
              a.pageCount || 1,
              a.uploadedAt || new Date().toISOString().split('T')[0],
              a.description || '',
              a.dataUrl || null,
              diskPath,
              new Date().toISOString()
            );
          }
        }
      }

      // 2. Insert Letters, ensuring no orphan letters and no foreign key violations!
      const letterStmt = this.db.prepare(`
        INSERT INTO letters (
          id, file_id, file_number, file_letter_number, reference_number, direction,
          subject, category, sender_name, sender_dept, sender_designation,
          recipient_name, recipient_dept, recipient_designation, date_issued, due_date,
          priority, status, assigned_officer, section, confidentiality, body_text,
          action_notes, attachments, endorsements, tags, financial_amount,
          inward_number, outward_number, dispatch_mode, tracking_number,
          postal_stamp_amount, remarks, file_path, created_at, last_updated
        ) VALUES (
          @id, @file_id, @file_number, @file_letter_number, @reference_number, @direction,
          @subject, @category, @sender_name, @sender_dept, @sender_designation,
          @recipient_name, @recipient_dept, @recipient_designation, @date_issued, @due_date,
          @priority, @status, @assigned_officer, @section, @confidentiality, @body_text,
          @action_notes, @attachments, @endorsements, @tags, @financial_amount,
          @inward_number, @outward_number, @dispatch_mode, @tracking_number,
          @postal_stamp_amount, @remarks, @file_path, @created_at, @last_updated
        )
        ON CONFLICT(id) DO UPDATE SET
          subject = excluded.subject,
          category = excluded.category,
          body_text = excluded.body_text,
          status = excluded.status,
          assigned_officer = excluded.assigned_officer,
          last_updated = excluded.last_updated
      `);

      for (const l of lettersList) {
        // Resolve parent file
        let matchedDocket = dockets.find(d => d.fileNumber === l.fileNumber || d.linkedLetterIds?.includes(l.id));
        let parentFileId = matchedDocket?.id;
        let parentFileCode = parentFileId ? fileCodeMap.get(parentFileId) : null;

        if (!parentFileId) {
          const dbMatch = existingDbFiles.find(ef => ef.file_number === l.fileNumber || ef.file_id === l.fileNumber);
          if (dbMatch) {
            parentFileId = dbMatch.file_id;
            parentFileCode = dbMatch.file_code;
          }
        }

        // If parent file does not exist anywhere, create a dedicated docket so letter is never orphaned
        if (!parentFileId) {
          parentFileId = `file-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          parentFileCode = `FILE-${String(index++).padStart(4, '0')}`;
          fileCodeMap.set(parentFileId, parentFileCode);
          fileCodeMap.set(l.fileNumber, parentFileCode);

          const autoDocket: MasterDocketFile = {
            id: parentFileId,
            fileNumber: l.fileNumber || `FILE-AUTO/${l.id}`,
            subject: `ಕಡತ: ${l.subject}`,
            section: (l.section as any) || 'Administration & Services',
            sectionCode: l.sectionCode || 'ಆ2',
            sectionName: l.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ',
            fileCategory: 'ಸಾಮಾನ್ಯ ಕಡತ (General File)',
            initiatedDate: l.dateReceivedOrIssued || new Date().toISOString().split('T')[0],
            status: 'Active / Open',
            currentCustodian: l.assignedOfficer || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
            priority: l.priority || 'Routine',
            linkedLetterIds: [l.id],
            lettersCount: 1,
            movementHistory: []
          };

          fileStmt.run({
            file_id: autoDocket.id,
            file_number: autoDocket.fileNumber,
            file_code: parentFileCode,
            subject: autoDocket.subject,
            section: autoDocket.section,
            section_code: autoDocket.sectionCode,
            section_name: autoDocket.sectionName,
            file_category: autoDocket.fileCategory,
            initiated_date: autoDocket.initiatedDate,
            status: autoDocket.status,
            current_custodian: autoDocket.currentCustodian,
            priority: autoDocket.priority,
            due_date: null,
            notes: 'ಸ್ವಯಂ ಜೋಡಿತ ಕಡತ (Auto-preserved parent file)',
            is_rti_file: 0,
            rti_details: null,
            closed_at: null,
            closed_by: null,
            closure_reason: null,
            closure_compliance_notes: null,
            created_at: autoDocket.initiatedDate,
            updated_at: new Date().toISOString()
          });

          this.syncFileDetailsToDisk(autoDocket, parentFileCode);
        }

        // Store letter in its physical folder
        const diskPath = this.storeLetterInFileFolder(l, parentFileCode!);

        letterStmt.run({
          id: l.id,
          file_id: parentFileId,
          file_number: l.fileNumber,
          file_letter_number: l.fileLetterNumber || null,
          reference_number: l.referenceNumber,
          direction: l.direction || 'inward',
          subject: l.subject,
          category: l.category || 'General Official Notice',
          sender_name: l.senderName || null,
          sender_dept: l.senderDepartment || null,
          sender_designation: l.senderDesignation || null,
          recipient_name: l.recipientName || null,
          recipient_dept: l.recipientDepartment || null,
          recipient_designation: l.recipientDesignation || null,
          date_issued: l.dateReceivedOrIssued || new Date().toISOString().split('T')[0],
          due_date: l.dueDate || null,
          priority: l.priority || 'Routine',
          status: l.status || 'Pending Action',
          assigned_officer: l.assignedOfficer || null,
          section: l.section || null,
          confidentiality: l.confidentiality || 'Public / Open',
          body_text: l.bodyText || '',
          action_notes: l.actionNotes ? JSON.stringify(l.actionNotes) : null,
          attachments: l.attachments ? JSON.stringify(l.attachments) : null,
          endorsements: l.endorsements ? JSON.stringify(l.endorsements) : null,
          tags: l.tags ? JSON.stringify(l.tags) : null,
          financial_amount: l.financialAmount || null,
          inward_number: l.inwardNumber || null,
          outward_number: l.outwardNumber || null,
          dispatch_mode: l.dispatchMode || null,
          tracking_number: l.trackingNumber || null,
          postal_stamp_amount: l.postalStampAmount || null,
          remarks: l.remarks || null,
          file_path: diskPath,
          created_at: l.dateReceivedOrIssued || new Date().toISOString(),
          last_updated: l.lastUpdated || new Date().toISOString()
        });

        // If inward, also record in inward_documents without conflict errors
        if (l.direction === 'inward') {
          const inStmt = this.db.prepare(`
            INSERT INTO inward_documents (
              id, file_id, reference_number, inward_number, sender_name, sender_dept,
              received_date, subject, status, due_date, file_path, data_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING
          `);
          const inDisk = this.storeInwardInFileFolder(l, parentFileCode!);
          inStmt.run(
            `inw-${l.id}`,
            parentFileId,
            l.referenceNumber,
            l.inwardNumber || null,
            l.senderName,
            l.senderDepartment,
            l.dateReceivedOrIssued,
            l.subject,
            l.status,
            l.dueDate || null,
            inDisk,
            JSON.stringify(l),
            new Date().toISOString()
          );
        }
      }
    });

    try {
      insertFileTx(existingDockets, existingLetters);
      console.log(`[SQLite Migration] Successfully migrated ${existingDockets.length} files and ${existingLetters.length} letters with full foreign key constraints and NT storage.`);
    } catch (err) {
      console.error('[SQLite Migration Error]', err);
    }
  }

  /**
   * Retrieves all files with linked letters and relations
   */
  public getAllFiles(): MasterDocketFile[] {
    const rows = this.db.prepare('SELECT * FROM files ORDER BY created_at DESC').all() as SQLiteFileRecord[];

    return rows.map(r => {
      // Get linked letters
      const lettersRows = this.db.prepare('SELECT * FROM letters WHERE file_id = ?').all(r.file_id) as any[];
      // Get movement history
      const movRows = this.db.prepare('SELECT * FROM file_movement_history WHERE file_id = ? ORDER BY sent_date ASC').all(r.file_id) as any[];
      // Get attachments
      const attRows = this.db.prepare('SELECT * FROM attachments WHERE file_id = ?').all(r.file_id) as any[];

      const movements: FileMovementRecord[] = movRows.map(m => ({
        id: m.id,
        fromOfficer: m.from_officer,
        toOfficer: m.to_officer,
        sentDate: m.sent_date,
        remarks: m.remarks,
        statusAfterMove: m.status_after_move,
        initiatingOfficer: m.initiating_officer,
        transferTimestamp: m.transfer_timestamp
      }));

      const attachments: DocumentAttachment[] = attRows.map(a => ({
        id: a.id,
        fileName: a.file_name,
        fileSize: a.file_size,
        fileType: a.file_type,
        pageCount: a.page_count,
        uploadedAt: a.uploaded_at,
        description: a.description,
        dataUrl: a.data_url
      }));

      let rtiDetails = undefined;
      if (r.rti_details) {
        try {
          rtiDetails = JSON.parse(r.rti_details);
        } catch {}
      }

      return {
        id: r.file_id,
        fileNumber: r.file_number,
        subject: r.subject,
        section: r.section as any,
        sectionCode: r.section_code,
        sectionName: r.section_name,
        fileCategory: r.file_category,
        initiatedDate: r.initiated_date,
        status: r.status,
        currentCustodian: r.current_custodian,
        priority: r.priority as any,
        dueDate: r.due_date,
        notes: r.notes,
        isRtiFile: Boolean(r.is_rti_file),
        rtiDetails,
        linkedLetterIds: lettersRows.map(l => l.id),
        lettersCount: lettersRows.length,
        movementHistory: movements,
        attachments,
        fileCode: r.file_code
      } as any;
    });
  }

  /**
   * Retrieves single file by ID or Number
   */
  public getFileById(fileIdOrNumber: string): (MasterDocketFile & { fileCode: string }) | null {
    const row = this.db.prepare('SELECT * FROM files WHERE file_id = ? OR file_number = ?').get(fileIdOrNumber, fileIdOrNumber) as SQLiteFileRecord | undefined;
    if (!row) return null;

    const lettersRows = this.db.prepare('SELECT * FROM letters WHERE file_id = ?').all(row.file_id) as any[];
    const movRows = this.db.prepare('SELECT * FROM file_movement_history WHERE file_id = ? ORDER BY sent_date ASC').all(row.file_id) as any[];
    const attRows = this.db.prepare('SELECT * FROM attachments WHERE file_id = ?').all(row.file_id) as any[];

    return {
      id: row.file_id,
      fileNumber: row.file_number,
      fileCode: row.file_code,
      subject: row.subject,
      section: row.section as any,
      sectionCode: row.section_code,
      sectionName: row.section_name,
      fileCategory: row.file_category,
      initiatedDate: row.initiated_date,
      status: row.status,
      currentCustodian: row.current_custodian,
      priority: row.priority as any,
      dueDate: row.due_date,
      notes: row.notes,
      isRtiFile: Boolean(row.is_rti_file),
      rtiDetails: row.rti_details ? JSON.parse(row.rti_details) : undefined,
      linkedLetterIds: lettersRows.map(l => l.id),
      lettersCount: lettersRows.length,
      movementHistory: movRows.map(m => ({
        id: m.id,
        fromOfficer: m.from_officer,
        toOfficer: m.to_officer,
        sentDate: m.sent_date,
        remarks: m.remarks,
        statusAfterMove: m.status_after_move,
        initiatingOfficer: m.initiating_officer,
        transferTimestamp: m.transfer_timestamp
      })),
      attachments: attRows.map(a => ({
        id: a.id,
        fileName: a.file_name,
        fileSize: a.file_size,
        fileType: a.file_type,
        pageCount: a.page_count,
        uploadedAt: a.uploaded_at,
        description: a.description,
        dataUrl: a.data_url
      }))
    };
  }

  /**
   * Retrieves all letters from SQLite
   */
  public getAllLetters(): EducationLetter[] {
    const rows = this.db.prepare('SELECT * FROM letters ORDER BY date_issued DESC, created_at DESC').all() as any[];

    return rows.map(r => ({
      id: r.id,
      fileNumber: r.file_number,
      fileLetterNumber: r.file_letter_number,
      referenceNumber: r.reference_number,
      direction: r.direction,
      subject: r.subject,
      category: r.category,
      senderName: r.sender_name,
      senderDepartment: r.sender_dept,
      senderDesignation: r.sender_designation,
      recipientName: r.recipient_name,
      recipientDepartment: r.recipient_dept,
      recipientDesignation: r.recipient_designation,
      dateReceivedOrIssued: r.date_issued,
      dueDate: r.due_date,
      priority: r.priority,
      status: r.status,
      assignedOfficer: r.assigned_officer,
      section: r.section,
      confidentiality: r.confidentiality,
      bodyText: r.body_text,
      actionNotes: r.action_notes ? JSON.parse(r.action_notes) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      endorsements: r.endorsements ? JSON.parse(r.endorsements) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      financialAmount: r.financial_amount,
      inwardNumber: r.inward_number,
      outwardNumber: r.outward_number,
      dispatchMode: r.dispatch_mode,
      trackingNumber: r.tracking_number,
      postalStampAmount: r.postal_stamp_amount,
      remarks: r.remarks,
      lastUpdated: r.last_updated,
      caseworkerName: r.caseworker_name,
      caseworkerDesignation: r.caseworker_designation,
      preparedDate: r.prepared_date,
      printStatus: r.print_status || (r.is_printed ? 'Printed' : 'Pending Print'),
      isPrinted: Boolean(r.is_printed),
      printedAt: r.printed_at,
      printCount: r.print_count || 0,
      showCaseworkerSignature: Boolean(r.show_caseworker_signature)
    }));
  }

  /**
   * Retrieves single letter by ID
   */
  public getLetterById(letterId: string): EducationLetter | null {
    const r = this.db.prepare('SELECT * FROM letters WHERE id = ?').get(letterId) as any;
    if (!r) return null;
    return {
      id: r.id,
      fileNumber: r.file_number,
      fileLetterNumber: r.file_letter_number,
      referenceNumber: r.reference_number,
      direction: r.direction,
      subject: r.subject,
      category: r.category,
      senderName: r.sender_name,
      senderDepartment: r.sender_dept,
      senderDesignation: r.sender_designation,
      recipientName: r.recipient_name,
      recipientDepartment: r.recipient_dept,
      recipientDesignation: r.recipient_designation,
      dateReceivedOrIssued: r.date_issued,
      dueDate: r.due_date,
      priority: r.priority,
      status: r.status,
      assignedOfficer: r.assigned_officer,
      section: r.section,
      confidentiality: r.confidentiality,
      bodyText: r.body_text,
      actionNotes: r.action_notes ? JSON.parse(r.action_notes) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      endorsements: r.endorsements ? JSON.parse(r.endorsements) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      financialAmount: r.financial_amount,
      inwardNumber: r.inward_number,
      outwardNumber: r.outward_number,
      dispatchMode: r.dispatch_mode,
      trackingNumber: r.tracking_number,
      postalStampAmount: r.postal_stamp_amount,
      remarks: r.remarks,
      lastUpdated: r.last_updated,
      caseworkerName: r.caseworker_name,
      caseworkerDesignation: r.caseworker_designation,
      preparedDate: r.prepared_date,
      printStatus: r.print_status || (r.is_printed ? 'Printed' : 'Pending Print'),
      isPrinted: Boolean(r.is_printed),
      printedAt: r.printed_at,
      printCount: r.print_count || 0,
      showCaseworkerSignature: Boolean(r.show_caseworker_signature)
    };
  }

  /**
   * Retrieves all letters for a specific file
   */
  public getLettersByFileId(fileIdOrNumber: string): EducationLetter[] {
    const file = this.getFileById(fileIdOrNumber);
    const idToUse = file ? file.id : fileIdOrNumber;
    const rows = this.db.prepare('SELECT * FROM letters WHERE file_id = ? OR file_number = ? ORDER BY date_issued ASC').all(idToUse, fileIdOrNumber) as any[];
    return rows.map(r => ({
      id: r.id,
      fileNumber: r.file_number,
      fileLetterNumber: r.file_letter_number,
      referenceNumber: r.reference_number,
      direction: r.direction,
      subject: r.subject,
      category: r.category,
      senderName: r.sender_name,
      senderDepartment: r.sender_dept,
      senderDesignation: r.sender_designation,
      recipientName: r.recipient_name,
      recipientDepartment: r.recipient_dept,
      recipientDesignation: r.recipient_designation,
      dateReceivedOrIssued: r.date_issued,
      dueDate: r.due_date,
      priority: r.priority,
      status: r.status,
      assignedOfficer: r.assigned_officer,
      section: r.section,
      confidentiality: r.confidentiality,
      bodyText: r.body_text,
      actionNotes: r.action_notes ? JSON.parse(r.action_notes) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      endorsements: r.endorsements ? JSON.parse(r.endorsements) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      financialAmount: r.financial_amount,
      inwardNumber: r.inward_number,
      outwardNumber: r.outward_number,
      dispatchMode: r.dispatch_mode,
      trackingNumber: r.tracking_number,
      postalStampAmount: r.postal_stamp_amount,
      remarks: r.remarks,
      lastUpdated: r.last_updated,
      caseworkerName: r.caseworker_name,
      caseworkerDesignation: r.caseworker_designation,
      preparedDate: r.prepared_date,
      printStatus: r.print_status || (r.is_printed ? 'Printed' : 'Pending Print'),
      isPrinted: Boolean(r.is_printed),
      printedAt: r.printed_at,
      printCount: r.print_count || 0,
      showCaseworkerSignature: Boolean(r.show_caseworker_signature)
    }));
  }

  /**
   * Versioning support for letters
   */
  public getLetterVersions(letterId: string): any[] {
    return this.db.prepare('SELECT * FROM letter_versions WHERE letter_id = ? ORDER BY version_number DESC').all(letterId) as any[];
  }

  public saveLetterVersion(letterId: string, versionData: {
    versionNumber?: number;
    updatedBy: string;
    subject?: string;
    bodyHtml?: string;
    bodyText?: string;
    notes?: string;
  }): any {
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM letter_versions WHERE letter_id = ?').get(letterId) as { count: number };
    const nextVer = versionData.versionNumber || (countRow?.count || 0) + 1;
    const id = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO letter_versions (
        id, letter_id, version_number, updated_at, updated_by, subject, body_html, body_text, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      letterId,
      nextVer,
      nowIso,
      versionData.updatedBy || 'ಕಚೇರಿ ಅಧಿಕಾರಿ',
      versionData.subject || '',
      versionData.bodyHtml || '',
      versionData.bodyText || '',
      versionData.notes || `ಆವೃತ್ತಿ ${nextVer}`
    );

    return {
      id,
      letterId,
      versionNumber: nextVer,
      updatedAt: nowIso,
      updatedBy: versionData.updatedBy,
      subject: versionData.subject,
      bodyHtml: versionData.bodyHtml,
      bodyText: versionData.bodyText,
      notes: versionData.notes
    };
  }

  public restoreLetterVersion(letterId: string, versionNumber: number, restoredBy: string): { success: boolean; version?: any; error?: string } {
    const ver = this.db.prepare('SELECT * FROM letter_versions WHERE letter_id = ? AND version_number = ?').get(letterId, versionNumber) as any;
    if (!ver) {
      return { success: false, error: `ಆವೃತ್ತಿ ಸಂಖ್ಯೆ ${versionNumber} ಕಂಡುಬಂದಿಲ್ಲ.` };
    }

    if (ver.body_text || ver.subject) {
      this.db.prepare(`
        UPDATE letters SET
          subject = COALESCE(?, subject),
          body_text = COALESCE(?, body_text),
          last_updated = ?
        WHERE id = ?
      `).run(ver.subject || null, ver.body_text || null, new Date().toISOString(), letterId);
    }

    // Record that we restored
    this.saveLetterVersion(letterId, {
      updatedBy: restoredBy,
      subject: ver.subject,
      bodyHtml: ver.body_html,
      bodyText: ver.body_text,
      notes: `ಆವೃತ್ತಿ ${versionNumber} ರಿಂದ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ`
    });

    return { success: true, version: ver };
  }

  /**
   * Creates a new Master File in SQLite & initializes NT Storage folders
   */
  public createFile(fileData: Partial<MasterDocketFile>): MasterDocketFile & { fileCode: string } {
    const fileId = fileData.id || `file-${Date.now()}`;
    const fileCode = this.getNextFileCode();
    const initiatedDate = fileData.initiatedDate || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO files (
        file_id, file_number, file_code, subject, section, section_code, section_name,
        file_category, initiated_date, status, current_custodian, priority, due_date,
        notes, is_rti_file, rti_details, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      fileId,
      fileData.fileNumber || `ಕಡತ-${Date.now()}`,
      fileCode,
      fileData.subject || 'ವಿಷಯ ನಮೂದಿಸಿಲ್ಲ',
      fileData.section || 'Administration & Services',
      fileData.sectionCode || 'ಆ2',
      fileData.sectionName || 'ಸ.ಪ್ರಾ.ಶಿ',
      fileData.fileCategory || 'ಸಾಮಾನ್ಯ ಕಡತ',
      initiatedDate,
      fileData.status || 'Active / Open',
      fileData.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
      fileData.priority || 'Routine',
      fileData.dueDate || null,
      fileData.notes || null,
      fileData.isRtiFile ? 1 : 0,
      fileData.rtiDetails ? JSON.stringify(fileData.rtiDetails) : null,
      nowIso,
      nowIso
    );

    const initialMovement: FileMovementRecord = {
      id: `mov-init-${Date.now()}`,
      fromOfficer: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
      toOfficer: fileData.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
      sentDate: initiatedDate,
      remarks: `ಕಡತ ಸಂಖ್ಯೆ: ${fileData.fileNumber} ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ (${fileCode}).`,
      statusAfterMove: fileData.status || 'Active / Open'
    };

    this.db.prepare(`
      INSERT INTO file_movement_history (
        id, file_id, from_officer, to_officer, sent_date, remarks, status_after_move
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      initialMovement.id,
      fileId,
      initialMovement.fromOfficer,
      initialMovement.toOfficer,
      initialMovement.sentDate,
      initialMovement.remarks,
      initialMovement.statusAfterMove
    );

    const created = this.getFileById(fileId)!;
    this.syncFileDetailsToDisk(created, fileCode);
    return created;
  }

  /**
   * Creates a letter inside a file. Enforces Foreign Key constraint & prevents orphan letters.
   */
  public createLetterInFile(letterData: Partial<EducationLetter>): {
    success: boolean;
    letter?: EducationLetter;
    fileCode?: string;
    filePath?: string;
    error?: string;
  } {
    // 1. Resolve target file
    const fileNum = letterData.fileNumber ? String(letterData.fileNumber).trim() : '';
    if (!fileNum) {
      return { success: false, error: 'ಪ್ರತಿಯೊಂದು ಪತ್ರವು ಕಡ್ಡಾಯವಾಗಿ ಅಧಿಕೃತ ಕಡತಕ್ಕೆ ಸೇರಿರಬೇಕು (File is required. Orphan letters are prevented).' };
    }

    const file = this.getFileById(fileNum);
    if (!file) {
      return { success: false, error: `ಕಡತ ಸಂಖ್ಯೆ "${fileNum}" ಕಂಡುಬಂದಿಲ್ಲ. ಮೊದಲು ಕಡತವನ್ನು ತೆರೆಯಿರಿ (Please open/create the File first).` };
    }

    const newId = letterData.id || `let-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Get count of existing letters for this file
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM letters WHERE file_id = ?').get(file.id) as { count: number };
    const nextSeq = (countRow?.count || 0) + 1;
    const fileLetterNumber = letterData.fileLetterNumber || `${file.fileNumber}-${nextSeq}`;

    const newLetter: EducationLetter = {
      id: newId,
      referenceNumber: letterData.referenceNumber || `ಇಡಿ/ಬಿಇಒ/ಭದ್ರಾ/${file.sectionCode || 'ಆ2'}/ಕಡತ-${file.fileNumber}/${fileLetterNumber}/2026-27`,
      fileNumber: file.fileNumber,
      fileLetterNumber,
      direction: letterData.direction || 'inward',
      subject: letterData.subject || file.subject,
      category: letterData.category || 'General Official Notice',
      senderName: letterData.senderName || 'Departmental Sender',
      senderDepartment: letterData.senderDepartment || 'Education Directorate',
      senderDesignation: letterData.senderDesignation || 'Officer',
      recipientName: letterData.recipientName || 'Concerned Authority',
      recipientDepartment: letterData.recipientDepartment || 'Department of Education',
      recipientDesignation: letterData.recipientDesignation || 'Recipient',
      dateReceivedOrIssued: letterData.dateReceivedOrIssued || now,
      dueDate: letterData.dueDate || file.dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: letterData.priority || file.priority || 'Routine',
      status: letterData.status || (letterData.direction === 'inward' ? 'Pending Action' : 'Approved & Signed'),
      assignedOfficer: letterData.assignedOfficer || file.currentCustodian,
      section: (letterData.section || file.section) as any,
      confidentiality: letterData.confidentiality || 'Public / Open',
      financialAmount: letterData.financialAmount ? Number(letterData.financialAmount) : undefined,
      bodyText: letterData.bodyText || '',
      actionNotes: letterData.actionNotes || [],
      attachments: letterData.attachments || [],
      endorsements: letterData.endorsements || [],
      tags: letterData.tags || ['Official', 'E-Office'],
      inwardNumber: letterData.inwardNumber,
      outwardNumber: letterData.outwardNumber,
      dispatchMode: letterData.dispatchMode,
      trackingNumber: letterData.trackingNumber,
      postalStampAmount: letterData.postalStampAmount,
      remarks: letterData.remarks,
      lastUpdated: nowIso,
      caseworkerName: letterData.caseworkerName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Caseworker)',
      caseworkerDesignation: letterData.caseworkerDesignation || 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)',
      preparedDate: letterData.preparedDate || now,
      printStatus: letterData.printStatus || (letterData.isPrinted ? 'Printed' : 'Pending Print'),
      isPrinted: Boolean(letterData.isPrinted),
      printedAt: letterData.printedAt || null,
      printCount: letterData.printCount || 0,
      showCaseworkerSignature: Boolean(letterData.showCaseworkerSignature)
    };

    // Store in NT folder
    const diskPath = this.storeLetterInFileFolder(newLetter, file.fileCode);

    // Insert into SQLite table with Foreign Key
    const stmt = this.db.prepare(`
      INSERT INTO letters (
        id, file_id, file_number, file_letter_number, reference_number, direction,
        subject, category, sender_name, sender_dept, sender_designation,
        recipient_name, recipient_dept, recipient_designation, date_issued, due_date,
        priority, status, assigned_officer, section, confidentiality, body_text,
        action_notes, attachments, endorsements, tags, financial_amount,
        inward_number, outward_number, dispatch_mode, tracking_number,
        postal_stamp_amount, remarks, file_path, created_at, last_updated,
        caseworker_name, caseworker_designation, prepared_date, print_status,
        is_printed, printed_at, print_count, show_caseworker_signature
      ) VALUES (
        @id, @file_id, @file_number, @file_letter_number, @reference_number, @direction,
        @subject, @category, @sender_name, @sender_dept, @sender_designation,
        @recipient_name, @recipient_dept, @recipient_designation, @date_issued, @due_date,
        @priority, @status, @assigned_officer, @section, @confidentiality, @body_text,
        @action_notes, @attachments, @endorsements, @tags, @financial_amount,
        @inward_number, @outward_number, @dispatch_mode, @tracking_number,
        @postal_stamp_amount, @remarks, @file_path, @created_at, @last_updated,
        @caseworker_name, @caseworker_designation, @prepared_date, @print_status,
        @is_printed, @printed_at, @print_count, @show_caseworker_signature
      )
    `);

    stmt.run({
      id: newLetter.id,
      file_id: file.id,
      file_number: newLetter.fileNumber,
      file_letter_number: newLetter.fileLetterNumber,
      reference_number: newLetter.referenceNumber,
      direction: newLetter.direction,
      subject: newLetter.subject,
      category: newLetter.category,
      sender_name: newLetter.senderName || null,
      sender_dept: newLetter.senderDepartment || null,
      sender_designation: newLetter.senderDesignation || null,
      recipient_name: newLetter.recipientName || null,
      recipient_dept: newLetter.recipientDepartment || null,
      recipient_designation: newLetter.recipientDesignation || null,
      date_issued: newLetter.dateReceivedOrIssued,
      due_date: newLetter.dueDate || null,
      priority: newLetter.priority,
      status: newLetter.status,
      assigned_officer: newLetter.assignedOfficer || null,
      section: newLetter.section || null,
      confidentiality: newLetter.confidentiality,
      body_text: newLetter.bodyText,
      action_notes: JSON.stringify(newLetter.actionNotes),
      attachments: JSON.stringify(newLetter.attachments),
      endorsements: JSON.stringify(newLetter.endorsements),
      tags: JSON.stringify(newLetter.tags),
      financial_amount: newLetter.financialAmount || null,
      inward_number: newLetter.inwardNumber || null,
      outward_number: newLetter.outwardNumber || null,
      dispatch_mode: newLetter.dispatchMode || null,
      tracking_number: newLetter.trackingNumber || null,
      postal_stamp_amount: newLetter.postalStampAmount || null,
      remarks: newLetter.remarks || null,
      file_path: diskPath,
      created_at: nowIso,
      last_updated: nowIso,
      caseworker_name: newLetter.caseworkerName || null,
      caseworker_designation: newLetter.caseworkDesignation || newLetter.caseworkerDesignation || null,
      prepared_date: newLetter.preparedDate || now,
      print_status: newLetter.printStatus || 'Pending Print',
      is_printed: newLetter.isPrinted ? 1 : 0,
      printed_at: newLetter.printedAt || null,
      print_count: newLetter.printCount || 0,
      show_caseworker_signature: newLetter.showCaseworkerSignature ? 1 : 0
    });

    // Update parent file's updated_at
    this.db.prepare('UPDATE files SET updated_at = ? WHERE file_id = ?').run(nowIso, file.id);

    return {
      success: true,
      letter: newLetter,
      fileCode: file.fileCode,
      filePath: diskPath
    };
  }

  /**
   * Updates an existing letter
   */
  public updateLetter(letterId: string, updates: Partial<EducationLetter>): EducationLetter | null {
    const existing = this.db.prepare('SELECT * FROM letters WHERE id = ?').get(letterId) as any;
    if (!existing) return null;

    const file = this.getFileById(existing.file_id);
    const fileCode = file?.fileCode || 'FILE-0001';

    const merged: EducationLetter = {
      id: existing.id,
      fileNumber: updates.fileNumber || existing.file_number,
      fileLetterNumber: updates.fileLetterNumber || existing.file_letter_number,
      referenceNumber: updates.referenceNumber || existing.reference_number,
      direction: (updates.direction || existing.direction) as any,
      subject: updates.subject || existing.subject,
      category: (updates.category || existing.category) as any,
      senderName: updates.senderName || existing.sender_name,
      senderDepartment: updates.senderDepartment || existing.sender_dept,
      senderDesignation: updates.senderDesignation || existing.sender_designation,
      recipientName: updates.recipientName || existing.recipient_name,
      recipientDepartment: updates.recipientDepartment || existing.recipient_dept,
      recipientDesignation: updates.recipientDesignation || existing.recipient_designation,
      dateReceivedOrIssued: updates.dateReceivedOrIssued || existing.date_issued,
      dueDate: updates.dueDate || existing.due_date,
      priority: (updates.priority || existing.priority) as any,
      status: (updates.status || existing.status) as any,
      assignedOfficer: updates.assignedOfficer || existing.assigned_officer,
      section: (updates.section || existing.section) as any,
      confidentiality: (updates.confidentiality || existing.confidentiality) as any,
      bodyText: updates.bodyText !== undefined ? updates.bodyText : existing.body_text,
      actionNotes: updates.actionNotes || (existing.action_notes ? JSON.parse(existing.action_notes) : []),
      attachments: updates.attachments || (existing.attachments ? JSON.parse(existing.attachments) : []),
      endorsements: updates.endorsements || (existing.endorsements ? JSON.parse(existing.endorsements) : []),
      tags: updates.tags || (existing.tags ? JSON.parse(existing.tags) : []),
      financialAmount: updates.financialAmount !== undefined ? updates.financialAmount : existing.financial_amount,
      inwardNumber: updates.inwardNumber || existing.inward_number,
      outwardNumber: updates.outwardNumber || existing.outward_number,
      dispatchMode: (updates.dispatchMode || existing.dispatch_mode) as any,
      trackingNumber: updates.trackingNumber || existing.tracking_number,
      postalStampAmount: updates.postalStampAmount !== undefined ? updates.postalStampAmount : existing.postal_stamp_amount,
      remarks: updates.remarks || existing.remarks,
      lastUpdated: new Date().toISOString(),
      caseworkerName: updates.caseworkerName || existing.caseworker_name,
      caseworkerDesignation: updates.caseworkerDesignation || existing.caseworker_designation,
      preparedDate: updates.preparedDate || existing.prepared_date,
      printStatus: updates.printStatus || existing.print_status || (existing.is_printed ? 'Printed' : 'Pending Print'),
      isPrinted: updates.isPrinted !== undefined ? updates.isPrinted : Boolean(existing.is_printed),
      printedAt: updates.printedAt !== undefined ? updates.printedAt : existing.printed_at,
      printCount: updates.printCount !== undefined ? updates.printCount : (existing.print_count || 0),
      showCaseworkerSignature: updates.showCaseworkerSignature !== undefined ? updates.showCaseworkerSignature : Boolean(existing.show_caseworker_signature)
    };

    // Update physical files
    const diskPath = this.storeLetterInFileFolder(merged, fileCode);

    this.db.prepare(`
      UPDATE letters SET
        reference_number = @reference_number,
        subject = @subject,
        direction = @direction,
        category = @category,
        sender_name = @sender_name,
        sender_dept = @sender_dept,
        recipient_name = @recipient_name,
        recipient_dept = @recipient_dept,
        date_issued = @date_issued,
        due_date = @due_date,
        priority = @priority,
        status = @status,
        body_text = @body_text,
        action_notes = @action_notes,
        attachments = @attachments,
        file_path = @file_path,
        last_updated = @last_updated,
        caseworker_name = @caseworker_name,
        caseworker_designation = @caseworker_designation,
        prepared_date = @prepared_date,
        print_status = @print_status,
        is_printed = @is_printed,
        printed_at = @printed_at,
        print_count = @print_count,
        show_caseworker_signature = @show_caseworker_signature
      WHERE id = @id
    `).run({
      id: merged.id,
      reference_number: merged.referenceNumber,
      subject: merged.subject,
      direction: merged.direction,
      category: merged.category,
      sender_name: merged.senderName || null,
      sender_dept: merged.senderDepartment || null,
      recipient_name: merged.recipientName || null,
      recipient_dept: merged.recipientDepartment || null,
      date_issued: merged.dateReceivedOrIssued,
      due_date: merged.dueDate || null,
      priority: merged.priority,
      status: merged.status,
      body_text: merged.bodyText,
      action_notes: JSON.stringify(merged.actionNotes),
      attachments: JSON.stringify(merged.attachments),
      file_path: diskPath,
      last_updated: merged.lastUpdated,
      caseworker_name: merged.caseworkerName || null,
      caseworker_designation: merged.caseworkerDesignation || null,
      prepared_date: merged.preparedDate || null,
      print_status: merged.printStatus || 'Pending Print',
      is_printed: merged.isPrinted ? 1 : 0,
      printed_at: merged.printedAt || null,
      print_count: merged.printCount || 0,
      show_caseworker_signature: merged.showCaseworkerSignature ? 1 : 0
    });

    return merged;
  }

  /**
   * Marks a letter as printed and records audit timestamp
   */
  public markLetterPrinted(letterId: string, printedBy: string = 'Caseworker'): { success: boolean; letter?: EducationLetter; error?: string } {
    const existing = this.getLetterById(letterId);
    if (!existing) {
      return { success: false, error: 'ಪತ್ರ ಕಂಡುಬಂದಿಲ್ಲ (Letter not found).' };
    }

    const nowIso = new Date().toISOString();
    const newCount = (existing.printCount || 0) + 1;

    this.db.prepare(`
      UPDATE letters SET
        print_status = 'Printed',
        is_printed = 1,
        printed_at = ?,
        print_count = ?,
        last_updated = ?
      WHERE id = ?
    `).run(nowIso, newCount, nowIso, letterId);

    existing.printStatus = 'Printed';
    existing.isPrinted = true;
    existing.printedAt = nowIso;
    existing.printCount = newCount;
    existing.lastUpdated = nowIso;

    const file = this.getFileById(existing.fileNumber);
    if (file) {
      this.storeLetterInFileFolder(existing, file.fileCode);
    }

    return { success: true, letter: existing };
  }

  /**
   * Pre-closure inspection checklist as per Requirement 9:
   * "Before closing a File:
   *  Display all associated letters.
   *  Display pending correspondence.
   *  Display pending inward documents.
   *  Display deadline status.
   *  Allow closure only according to configured office rules."
   */
  public getFileClosureChecklist(fileId: string) {
    const file = this.getFileById(fileId);
    if (!file) return null;

    const letters = this.db.prepare('SELECT * FROM letters WHERE file_id = ?').all(file.id) as any[];
    const inwardDocs = this.db.prepare('SELECT * FROM inward_documents WHERE file_id = ?').all(file.id) as any[];

    const pendingLetters = letters.filter(l => 
      !['Approved & Signed', 'Dispatched', 'Closed & Archived'].includes(l.status)
    );

    const pendingInward = inwardDocs.filter(d => 
      !['Disposed', 'Replied', 'Closed'].includes(d.status)
    );

    const now = Date.now();
    let isOverdue = false;
    let daysRemaining = 30;

    if (file.dueDate) {
      const dueTime = new Date(file.dueDate).getTime();
      if (!isNaN(dueTime)) {
        isOverdue = now > dueTime;
        daysRemaining = Math.ceil((dueTime - now) / (24 * 3600 * 1000));
      }
    }

    const configuredRules = [
      { id: 'rule-inward', title: 'ಆವಕ ಪತ್ರಗಳ ಪರಿಶೀಲನೆ (Inward Dak Clearance)', desc: 'ಕಡತದ ಎಲ್ಲಾ ಆವಕ ಪತ್ರಗಳಿಗೆ ಉತ್ತರ ಅಥವಾ ಅಧಿಕೃತ ಕ್ರಮ ದಾಖಲಾಗಿರಬೇಕು.', satisfied: pendingInward.length === 0 },
      { id: 'rule-letters', title: 'ಪತ್ರಗಳ ವಿಲೇವಾರಿ ಸ್ಥಿತಿ (Letter Sanction Status)', desc: 'ಕಡತದ ಅಡಿಯಲ್ಲಿ ಸೃಜಿಸಲಾದ ಎಲ್ಲಾ ಪತ್ರಗಳು ಅನುಮೋದನೆ ಅಥವಾ ರವಾನೆ ಸ್ಥಿತಿ ತಲುಪಿರಬೇಕು.', satisfied: pendingLetters.length === 0 },
      { id: 'rule-noting', title: 'ಅಂತಿಮ ವಿಲೇವಾರಿ ಟಿಪ್ಪಣಿ (Final Closure Noting)', desc: 'ಕಡತ ಮುಕ್ತಾಯಕ್ಕೆ ಕಾರಣ ಮತ್ತು ಸಕ್ಷಮ ಅಧಿಕಾರಿಯ ಅನುಮೋದನೆ ದಾಖಲಿಸಬೇಕು.', satisfied: true },
      { id: 'rule-records', title: 'ದಾಖಲೆಗಳ ಶಾಶ್ವತ ಸಂಗ್ರಹ (Permanent Storage Retention)', desc: 'ಮುಕ್ತಾಯಗೊಂಡ ಕಡತ ಮತ್ತು ಎಲ್ಲಾ ದಾಖಲೆಗಳು NT Storage ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ಸಂಗ್ರಹವಾಗಿರುತ್ತವೆ.', satisfied: true }
    ];

    const canCloseDirectly = pendingInward.length === 0 && pendingLetters.length === 0;

    return {
      file,
      fileCode: file.fileCode,
      totalLetters: letters.length,
      lettersList: letters.map(l => ({
        id: l.id,
        referenceNumber: l.reference_number,
        subject: l.subject,
        status: l.status,
        date: l.date_issued
      })),
      pendingLettersCount: pendingLetters.length,
      pendingLetters: pendingLetters.map(l => ({
        id: l.id,
        referenceNumber: l.reference_number,
        subject: l.subject,
        status: l.status
      })),
      pendingInwardCount: pendingInward.length,
      pendingInward: pendingInward.map(d => ({
        id: d.id,
        inwardNumber: d.inward_number,
        subject: d.subject,
        status: d.status
      })),
      deadlineStatus: {
        isOverdue,
        daysRemaining,
        dueDate: file.dueDate || 'ನಿಯಮಿತ ಅವಧಿ (30 ದಿನಗಳು)',
        label: isOverdue ? `${Math.abs(daysRemaining)} ದಿನಗಳ ಗಡುವು ಮೀರಿದೆ (Overdue)` : `${daysRemaining} ದಿನಗಳು ಬಾಕಿ ಇವೆ (On Track)`
      },
      configuredRules,
      canCloseDirectly,
      requiresSupervisorOverride: !canCloseDirectly
    };
  }

  /**
   * Finalizes file closure, updates status to 'Disposed / Closed',
   * logs movement and generates the closure dossier report.
   */
  public closeFile(
    fileId: string, 
    params: {
      closedBy: string;
      closureReason: string;
      complianceNotes?: string;
      overridePending?: boolean;
    }
  ): { success: boolean; file?: MasterDocketFile; message: string; reportPath?: string } {
    const file = this.getFileById(fileId);
    if (!file) {
      return { success: false, message: 'ಕಡತ ಕಂಡುಬಂದಿಲ್ಲ (File not found)' };
    }

    const checklist = this.getFileClosureChecklist(fileId);
    if (!checklist?.canCloseDirectly && !params.overridePending) {
      return {
        success: false,
        message: `ಕಡತದಲ್ಲಿ ${checklist?.pendingLettersCount} ಬಾಕಿ ಪತ್ರಗಳು ಮತ್ತು ${checklist?.pendingInwardCount} ಬಾಕಿ ಆವಕ ದಾಖಲೆಗಳಿವೆ. ದಯವಿಟ್ಟು ಸೂಪರ್‌ವೈಸರ್ ಅನುಮೋದನೆಯೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ.`
      };
    }

    const nowIso = new Date().toISOString();
    const closeDate = nowIso.split('T')[0];

    // 1. Update file status in SQLite
    this.db.prepare(`
      UPDATE files SET
        status = 'Disposed / Closed',
        closed_at = ?,
        closed_by = ?,
        closure_reason = ?,
        closure_compliance_notes = ?,
        updated_at = ?
      WHERE file_id = ?
    `).run(
      nowIso,
      params.closedBy || 'Administrator',
      params.closureReason || 'ಕಛೇರಿ ನಿಯಮಾನುಸಾರ ವಿಲೇವಾರಿ ಮುಕ್ತಾಯ',
      params.complianceNotes || 'ಎಲ್ಲಾ ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
      nowIso,
      file.id
    );

    // 2. Add closure movement record
    const closureMov: FileMovementRecord = {
      id: `mov-close-${Date.now()}`,
      fromOfficer: file.currentCustodian,
      toOfficer: 'ಕಡತಗಳ ದಾಖಲೆ ಕೋಣೆ (Archived Records Cell)',
      sentDate: closeDate,
      remarks: `[ಕಡತ ವಿಲೇವಾರಿ/ಮುಕ್ತಾಯ]: ${params.closureReason}. ಮುಕ್ತಾಯಗೊಳಿಸಿದವರು: ${params.closedBy}.`,
      statusAfterMove: 'Disposed / Closed'
    };

    this.db.prepare(`
      INSERT INTO file_movement_history (
        id, file_id, from_officer, to_officer, sent_date, remarks, status_after_move
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      closureMov.id,
      file.id,
      closureMov.fromOfficer,
      closureMov.toOfficer,
      closureMov.sentDate,
      closureMov.remarks,
      closureMov.statusAfterMove
    );

    // 3. Generate Closure Report & store in Reports/
    const dirs = this.ensureFileFolderStructure(file.fileCode);
    const closureReport = {
      fileId: file.id,
      fileNumber: file.fileNumber,
      fileCode: file.fileCode,
      subject: file.subject,
      closedAt: nowIso,
      closedBy: params.closedBy,
      closureReason: params.closureReason,
      complianceNotes: params.complianceNotes,
      totalLettersProcessed: checklist?.totalLetters || 0,
      archiveLocation: `BEO_EOFFICE/Files/${file.fileCode}/`
    };

    const reportPath = path.join(dirs.reportsDir, 'file_closure_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(closureReport, null, 2), 'utf-8');

    // Update metadata on disk
    const updatedFile = this.getFileById(fileId)!;
    this.syncFileDetailsToDisk(updatedFile, file.fileCode);

    return {
      success: true,
      file: updatedFile,
      message: `ಕಡತ ಸಂಖ್ಯೆ: ${file.fileNumber} (${file.fileCode}) ಯಶಸ್ವಿಯಾಗಿ ವಿಲೇವಾರಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.`,
      reportPath
    };
  }

  /**
   * Returns inspection tree of physical NT STORAGE
   */
  public getStorageInspectionTree(): any {
    const result: any[] = [];
    if (!fs.existsSync(BEO_FILES_DIR)) return result;

    const fileFolders = fs.readdirSync(BEO_FILES_DIR).sort();
    for (const folder of fileFolders) {
      const folderPath = path.join(BEO_FILES_DIR, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const subDirs = ['File_Details', 'Inward', 'Letters', 'Orders', 'Reports', 'Attachments'];
        const subDirStats: Record<string, number> = {};

        for (const sub of subDirs) {
          const subPath = path.join(folderPath, sub);
          if (fs.existsSync(subPath)) {
            const files = fs.readdirSync(subPath);
            subDirStats[sub] = files.length;
          } else {
            subDirStats[sub] = 0;
          }
        }

        result.push({
          folder,
          path: folderPath,
          subDirs: subDirStats
        });
      }
    }
    return result;
  }
}

// Global Singleton Instance
export const beoStorage = new BeoEOfficeSQLiteManager();
