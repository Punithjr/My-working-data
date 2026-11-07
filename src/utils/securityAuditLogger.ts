import { formatDateDDMMYYYY } from './formatDate';

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // DD-MM-YYYY HH:mm:ss
  eventType: 'GITHUB_SYNC' | 'GITHUB_SYNC_ERROR' | 'CONFIG_UPDATE' | 'BULK_DELETION' | 'DATA_RESET' | 'AUTH_EVENT' | 'EXPORT_EVENT';
  actionSummary: string;
  details: string;
  authorizedUserId: string;
  authorizedUserName: string;
  targetModule: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO';
}

const STORAGE_KEY = 'karnataka_security_audit_logs';

function formatCurrentDateTime(): string {
  const now = new Date();
  const datePart = formatDateDDMMYYYY(now);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

const INITIAL_AUDIT_LOGS: SecurityAuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-02-15T09:30:00.000Z',
    formattedDate: '15-02-2026 15:00:00',
    eventType: 'CONFIG_UPDATE',
    actionSummary: 'Office Establishment & DDO Configuration Updated',
    details: 'Updated DDO Code 14041ED001 and configured BEO Bhadravathi administrative hierarchy.',
    authorizedUserId: 'ADM-01',
    authorizedUserName: 'ಮಂಜುನಾಥ್ ಬಿ.ಎಸ್. (BEO Officer)',
    targetModule: 'Office Configuration',
    status: 'SUCCESS'
  },
  {
    id: 'audit-002',
    timestamp: '2026-02-18T11:15:20.000Z',
    formattedDate: '18-02-2026 16:45:20',
    eventType: 'GITHUB_SYNC',
    actionSummary: 'Scheduled Cloud Backup to GitHub Repository',
    details: 'Exported 18 files, 42 letters, and 14 employee rosters to repo karnataka-education/beo-bhadravathi-dak-backup.',
    authorizedUserId: 'ADM-01',
    authorizedUserName: 'ಮಂಜುನಾಥ್ ಬಿ.ಎಸ್. (BEO Officer)',
    targetModule: 'GitHub Sync Module',
    status: 'SUCCESS'
  },
  {
    id: 'audit-003',
    timestamp: '2026-02-20T14:20:10.000Z',
    formattedDate: '20-02-2026 19:50:10',
    eventType: 'CONFIG_UPDATE',
    actionSummary: 'KCSR 7th Pay Commission Scale Rules Verified',
    details: 'Verified annual increment rates (3%) and standard pay matrix for Primary School Teachers.',
    authorizedUserId: 'SUP-01',
    authorizedUserName: 'ರಾಘವೇಂದ್ರ ಕೆ. (Superintendent)',
    targetModule: 'Pay Rules Engine',
    status: 'SUCCESS'
  },
  {
    id: 'audit-004',
    timestamp: '2026-02-22T10:05:00.000Z',
    formattedDate: '22-02-2026 15:35:00',
    eventType: 'EXPORT_EVENT',
    actionSummary: 'Comprehensive Dak Register Exported to Excel',
    details: 'Auditor exported complete FY 2026-27 Dak Register for District Public Instruction review.',
    authorizedUserId: 'FDA-01',
    authorizedUserName: 'ಗಿರಿಯಪ್ಪ ಹೆಚ್. (FDA / Inward Clerk)',
    targetModule: 'Dak Registry',
    status: 'SUCCESS'
  }
];

export function getSecurityAuditLogs(): SecurityAuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  } catch (e) {
    console.error('Failed to load security audit logs:', e);
    return INITIAL_AUDIT_LOGS;
  }
}

export function logSecurityEvent(entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp' | 'formattedDate'>): SecurityAuditLogEntry {
  const newEntry: SecurityAuditLogEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    formattedDate: formatCurrentDateTime(),
    ...entry,
  };

  try {
    const current = getSecurityAuditLogs();
    const updated = [newEntry, ...current].slice(0, 500); // keep last 500 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist security audit event:', e);
  }

  return newEntry;
}

export function clearSecurityAuditLogs(authorizedUserId = 'ADM-01', authorizedUserName = 'Administrator'): void {
  try {
    const clearanceEntry: SecurityAuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      formattedDate: formatCurrentDateTime(),
      eventType: 'BULK_DELETION',
      actionSummary: 'Security Audit Log Cleared by Administrator',
      details: 'Historical security audit trail was purged with statutory administrative clearance.',
      authorizedUserId,
      authorizedUserName,
      targetModule: 'Security Audit Subsystem',
      status: 'WARNING'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([clearanceEntry]));
  } catch (e) {
    console.error('Failed to clear audit logs:', e);
  }
}
