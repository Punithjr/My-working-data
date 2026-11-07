import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  FolderGit2, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  UploadCloud, 
  ShieldCheck, 
  ExternalLink, 
  FileCode, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff,
  Server,
  Database,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { EducationLetter, MasterDocketFile, Employee, PensionCaseRecord, AdminAuthUser } from '../types';
import { logSecurityEvent } from '../utils/securityAuditLogger';
import { formatDateDDMMYYYY } from '../utils/formatDate';

interface GitHubSyncConfig {
  pat: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  pathPrefix: string;
}

interface GitHubSyncPanelProps {
  currentUser?: AdminAuthUser | null;
  letters?: EducationLetter[];
  files?: MasterDocketFile[];
  employees?: Employee[];
  pensionCases?: PensionCaseRecord[];
  onSyncComplete?: () => void;
}

const STORAGE_KEY = 'karnataka_github_sync_config';

export const GitHubSyncPanel: React.FC<GitHubSyncPanelProps> = ({
  currentUser,
  letters = [],
  files = [],
  employees = [],
  pensionCases = [],
  onSyncComplete,
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      pat: '',
      repoOwner: '',
      repoName: '',
      branch: 'main',
      pathPrefix: 'e-office-backups/2026-27'
    };
  });

  const [showPat, setShowPat] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; repoInfo?: any } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string; logs: string[]; commitUrls: string[] }>({
    logs: [],
    commitUrls: []
  });
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(() => {
    return localStorage.getItem('karnataka_last_github_sync') || null;
  });

  // Save config on change
  const handleSaveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    logSecurityEvent({
      eventType: 'CONFIG_UPDATE',
      actionSummary: 'GitHub Repository Configuration Saved',
      details: `Repository configured: ${config.repoOwner}/${config.repoName} (Branch: ${config.branch})`,
      authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
      authorizedUserName: currentUser?.displayName || 'Administrator',
      targetModule: 'GitHub Sync Module',
      status: 'SUCCESS'
    });
    setTestResult({ success: true, message: 'ಸಂರಚನೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ (Configuration saved successfully)' });
    setTimeout(() => setTestResult(null), 3000);
  };

  // Test connection to GitHub API
  const handleTestConnection = async () => {
    if (!config.pat.trim()) {
      setTestResult({ success: false, message: 'ದಯವಿಟ್ಟು GitHub Personal Access Token (PAT) ನಮೂದಿಸಿ' });
      return;
    }
    if (!config.repoOwner.trim() || !config.repoName.trim()) {
      setTestResult({ success: false, message: 'ದಯವಿಟ್ಟು Repository Owner ಮತ್ತು Repository Name ನಮೂದಿಸಿ' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.github.com/repos/${config.repoOwner.trim()}/${config.repoName.trim()}`, {
        headers: {
          'Authorization': `Bearer ${config.pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub HTTP Status ${res.status}`);
      }

      const repo = await res.json();
      setTestResult({
        success: true,
        message: `ಯಶಸ್ವಿಯಾಗಿ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ (Connected to ${repo.full_name})! Visibility: ${repo.private ? 'Private 🔒' : 'Public 🌐'}, Permissions: Push: ${repo.permissions?.push ? 'Yes' : 'No'}`,
        repoInfo: repo
      });

      logSecurityEvent({
        eventType: 'GITHUB_SYNC',
        actionSummary: 'GitHub Connection Verified',
        details: `Connection verified to repository ${repo.full_name} with write permissions.`,
        authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
        authorizedUserName: currentUser?.displayName || 'Administrator',
        targetModule: 'GitHub Sync Module',
        status: 'SUCCESS'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ: ${err.message}. ದಯವಿಟ್ಟು PAT Token ಮತ್ತು Repository ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`
      });

      logSecurityEvent({
        eventType: 'GITHUB_SYNC_ERROR',
        actionSummary: 'GitHub Connection Test Failed',
        details: `Failed to connect to ${config.repoOwner}/${config.repoName}: ${err.message}`,
        authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
        authorizedUserName: currentUser?.displayName || 'Administrator',
        targetModule: 'GitHub Sync Module',
        status: 'FAILED'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Helper to commit a file to GitHub via Contents API
  const pushFileToGitHub = async (filePath: string, fileContent: object, commitMessage: string) => {
    const owner = config.repoOwner.trim();
    const repo = config.repoName.trim();
    const branch = config.branch.trim() || 'main';
    const jsonString = JSON.stringify(fileContent, null, 2);
    // Base64 encoding compatible with UTF-8 Kannada characters
    const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 1. Check if file already exists to get its SHA
    let existingSha: string | undefined = undefined;
    try {
      const checkRes = await fetch(`${url}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${config.pat.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        existingSha = checkData.sha;
      }
    } catch (e) {
      // ignore
    }

    // 2. Put file
    const bodyPayload: any = {
      message: commitMessage,
      content: base64Content,
      branch: branch
    };
    if (existingSha) {
      bodyPayload.sha = existingSha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || `Failed to commit ${filePath}`);
    }

    const data = await putRes.json();
    return data.commit?.html_url || `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
  };

  // Backup & Export Registry to GitHub
  const handlePerformGitHubSync = async () => {
    if (!config.pat.trim() || !config.repoOwner.trim() || !config.repoName.trim()) {
      alert('ದಯವಿಟ್ಟು GitHub PAT Token, Repository Owner ಮತ್ತು Name ನಮೂದಿಸಿ.');
      return;
    }

    setIsSyncing(true);
    const logs: string[] = [];
    const commitUrls: string[] = [];
    const logAdd = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setSyncStatus({ logs: [...logs], commitUrls: [...commitUrls] });
    };

    logAdd(`ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭ: GitHub ರೆಪೊಸಿಟರಿ ${config.repoOwner}/${config.repoName} ಗೆ ಬ್ಯಾಕಪ್ ರವಾನಿಸಲಾಗುತ್ತಿದೆ...`);

    const dateStr = formatDateDDMMYYYY(new Date());
    const isoTimestamp = new Date().toISOString();
    const cleanPrefix = config.pathPrefix.replace(/^\/+|\/+$/g, '') || 'e-office-backups';

    try {
      // 1. Letters Registry
      logAdd(`1/5: ${letters.length} ಪತ್ರಗಳ (Dak Letters Registry) JSON ರಫ್ತು ಮಾಡಲಾಗುತ್ತಿದೆ...`);
      const lettersPayload = {
        metadata: {
          system: 'Karnataka Government e-Office EFMS Bhadravathi',
          exportType: 'DAK_LETTERS_REGISTRY',
          exportedAt: isoTimestamp,
          formattedDate: dateStr,
          totalRecords: letters.length,
          exportedBy: currentUser?.displayName || 'Administrator',
          authorizingUserId: currentUser?.id || currentUser?.username || 'ADM-01'
        },
        records: letters
      };
      const lettersUrl = await pushFileToGitHub(
        `${cleanPrefix}/letters_registry.json`,
        lettersPayload,
        `Update Letters Registry (${letters.length} records) [${dateStr}]`
      );
      commitUrls.push(lettersUrl);
      logAdd(`✓ Letters Registry ಯಶಸ್ವಿಯಾಗಿ ಕಮಿಟ್ ಆಗಿದೆ: ${lettersUrl}`);

      // 2. Master Docket Files
      logAdd(`2/5: ${files.length} ಕಡತಗಳ (Master Docket Files) JSON ರಫ್ತು ಮಾಡಲಾಗುತ್ತಿದೆ...`);
      const filesPayload = {
        metadata: {
          system: 'Karnataka Government e-Office EFMS Bhadravathi',
          exportType: 'MASTER_DOCKET_FILES',
          exportedAt: isoTimestamp,
          formattedDate: dateStr,
          totalRecords: files.length,
          exportedBy: currentUser?.displayName || 'Administrator'
        },
        records: files
      };
      const filesUrl = await pushFileToGitHub(
        `${cleanPrefix}/master_docket_files.json`,
        filesPayload,
        `Update Master Docket Files (${files.length} dockets) [${dateStr}]`
      );
      commitUrls.push(filesUrl);
      logAdd(`✓ Master Docket Files ಯಶಸ್ವಿಯಾಗಿ ಕಮಿಟ್ ಆಗಿದೆ: ${filesUrl}`);

      // 3. Employee Roster
      logAdd(`3/5: ${employees.length} ನೌಕರರ (Employee Roster) JSON ರಫ್ತು ಮಾಡಲಾಗುತ್ತಿದೆ...`);
      const empPayload = {
        metadata: {
          system: 'Karnataka Government e-Office EFMS Bhadravathi',
          exportType: 'EMPLOYEE_ROSTER',
          exportedAt: isoTimestamp,
          formattedDate: dateStr,
          totalRecords: employees.length,
          exportedBy: currentUser?.displayName || 'Administrator'
        },
        records: employees
      };
      const empUrl = await pushFileToGitHub(
        `${cleanPrefix}/employee_roster.json`,
        empPayload,
        `Update Employee Roster (${employees.length} staff) [${dateStr}]`
      );
      commitUrls.push(empUrl);
      logAdd(`✓ Employee Roster ಯಶಸ್ವಿಯಾಗಿ ಕಮಿಟ್ ಆಗಿದೆ: ${empUrl}`);

      // 4. Pension Cases
      if (pensionCases.length > 0) {
        logAdd(`4/5: ${pensionCases.length} ಪಿಂಚಣಿ ಪ್ರಕರಣಗಳ (Pension Cases) JSON ರಫ್ತು ಮಾಡಲಾಗುತ್ತಿದೆ...`);
        const pensionPayload = {
          metadata: {
            system: 'Karnataka Government e-Office EFMS Bhadravathi',
            exportType: 'PENSION_CASES',
            exportedAt: isoTimestamp,
            formattedDate: dateStr,
            totalRecords: pensionCases.length,
            exportedBy: currentUser?.displayName || 'Administrator'
          },
          records: pensionCases
        };
        const pensionUrl = await pushFileToGitHub(
          `${cleanPrefix}/pension_cases.json`,
          pensionPayload,
          `Update Pension Cases (${pensionCases.length} cases) [${dateStr}]`
        );
        commitUrls.push(pensionUrl);
        logAdd(`✓ Pension Cases ಯಶಸ್ವಿಯಾಗಿ ಕಮಿಟ್ ಆಗಿದೆ: ${pensionUrl}`);
      }

      // 5. Consolidated Snapshot
      logAdd(`5/5: ಸಮಗ್ರ ಬ್ಯಾಕಪ್ (Full e-Office Master Snapshot) ಸೃಜಿಸಲಾಗುತ್ತಿದೆ...`);
      const fullSnapshot = {
        meta: {
          system: 'Karnataka State School Education Department e-Office',
          office: 'BEO Bhadravathi',
          generatedDate: dateStr,
          timestamp: isoTimestamp,
          authorizedBy: currentUser?.displayName || 'Administrator',
          authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01'
        },
        lettersCount: letters.length,
        filesCount: files.length,
        employeesCount: employees.length,
        pensionCasesCount: pensionCases.length,
        letters,
        files,
        employees,
        pensionCases
      };
      const snapshotUrl = await pushFileToGitHub(
        `${cleanPrefix}/latest_eoffice_full_backup.json`,
        fullSnapshot,
        `Full e-Office Snapshot Backup - ${dateStr} by ${currentUser?.displayName || 'Admin'}`
      );
      commitUrls.push(snapshotUrl);
      logAdd(`✓ Full Snapshot Backup ಯಶಸ್ವಿಯಾಗಿ ಕಮಿಟ್ ಆಗಿದೆ: ${snapshotUrl}`);

      const nowFormatted = formatDateDDMMYYYY(new Date()) + ' ' + new Date().toLocaleTimeString();
      localStorage.setItem('karnataka_last_github_sync', nowFormatted);
      setLastSyncDate(nowFormatted);

      // Record in Security Audit Log
      logSecurityEvent({
        eventType: 'GITHUB_SYNC',
        actionSummary: 'Automated GitHub Cloud Backup Completed',
        details: `Successfully backed up ${letters.length} letters, ${files.length} dockets, ${employees.length} employees to ${config.repoOwner}/${config.repoName} on branch ${config.branch}.`,
        authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
        authorizedUserName: currentUser?.displayName || 'Administrator',
        targetModule: 'GitHub Sync Module',
        status: 'SUCCESS'
      });

      setSyncStatus({
        success: true,
        message: `ಎಲ್ಲಾ ಡೇಟಾಬೇಸ್ ವಿವರಗಳು GitHub ಗೆ ಯಶಸ್ವಿಯಾಗಿ ರವಾನೆಯಾಗಿದೆ (${letters.length} ಪತ್ರಗಳು, ${files.length} ಕಡತಗಳು, ${employees.length} ನೌಕರರು)!`,
        logs,
        commitUrls
      });

      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      logAdd(`❌ ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ: ${err.message}`);
      setSyncStatus({
        success: false,
        message: `GitHub Sync ವಿಫಲವಾಗಿದೆ: ${err.message}`,
        logs,
        commitUrls
      });

      logSecurityEvent({
        eventType: 'GITHUB_SYNC_ERROR',
        actionSummary: 'GitHub Backup Sync Failed',
        details: `Error exporting to GitHub repo ${config.repoOwner}/${config.repoName}: ${err.message}`,
        authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
        authorizedUserName: currentUser?.displayName || 'Administrator',
        targetModule: 'GitHub Sync Module',
        status: 'FAILED'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Download Offline Unified JSON Backup
  const handleDownloadOfflineJson = () => {
    const dateStr = formatDateDDMMYYYY(new Date());
    const fullBackup = {
      system: 'Karnataka Government e-Office EFMS Bhadravathi',
      exportedAt: new Date().toISOString(),
      formattedDate: dateStr,
      exportedBy: currentUser?.displayName || 'Administrator',
      authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
      stats: {
        totalLetters: letters.length,
        totalFiles: files.length,
        totalEmployees: employees.length,
        totalPensionCases: pensionCases.length
      },
      data: {
        letters,
        files,
        employees,
        pensionCases
      }
    };

    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Karnataka_Education_eOffice_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logSecurityEvent({
      eventType: 'EXPORT_EVENT',
      actionSummary: 'Offline Registry JSON Archive Downloaded',
      details: `Full offline backup downloaded with ${letters.length} letters, ${files.length} docket files, ${employees.length} employees.`,
      authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
      authorizedUserName: currentUser?.displayName || 'Administrator',
      targetModule: 'Registry Backup',
      status: 'SUCCESS'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-sky-950 text-white rounded-xl p-5 shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <FolderGit2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                  GitHub Sync & Disaster Recovery
                </span>
                <span className="text-xs text-stone-300">Firestore & Local Registry Cloud Backup</span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
                <span>ಗಿಟ್‌ಹಬ್ ಬ್ಯಾಕಪ್ & ಸಿಂಕ್ರೊನೈಸೇಶನ್ ಮಾಡ್ಯೂಲ್</span>
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                ಕಡತಗಳು (Master Docket Files), ಪತ್ರಗಳು (Inward/Outward Dak), ಮತ್ತು ಸಿಬ್ಬಂದಿ ರೋಸ್ಟರ್‌ಗಳನ್ನು ನೇರವಾಗಿ ಮೀಸಲಾದ GitHub Repository ಗೆ JSON ರೂಪದಲ್ಲಿ ರಫ್ತು ಮಾಡಿ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadOfflineJson}
              className="px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Download full JSON registry backup offline"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>Offline JSON ಡೌನ್‌ಲೋಡ್</span>
            </button>
          </div>
        </div>

        {lastSyncDate && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ಕೊನೆಯ ಯಶಸ್ವಿ ಸಿಂಕ್ (Last Synced): <strong>{lastSyncDate}</strong></span>
          </div>
        )}
      </div>

      {/* Main Configuration Form & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: GitHub Config */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-800" />
              <h3 className="font-bold text-sm text-stone-900">
                GitHub Repository & Token ವಿವರಗಳು (Configuration)
              </h3>
            </div>
            <span className="text-[11px] text-stone-500 font-mono">REST API v3 Contents</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* PAT Token */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700">
                  GitHub Personal Access Token (PAT) *
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold underline"
                >
                  <span>ಹೊಸ Token ಪಡೆಯಿರಿ (repo scope)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPat ? 'text' : 'password'}
                  value={config.pat}
                  onChange={e => setConfig({ ...config, pat: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx 또는 github_pat_xxxx"
                  className="w-full pl-3 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-sky-900 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPat(!showPat)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title={showPat ? 'ಟೋಕನ್ ಮರೆಮಾಡಿ' : 'ಟೋಕನ್ ತೋರಿಸಿ'}
                >
                  {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                🔒 ಟೋಕನ್ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹವಾಗುತ್ತದೆ. ಯಾವುದೇ ಬಾಹ್ಯ ಸರ್ವರ್‌ಗೆ ಹಂಚಲಾಗುವುದಿಲ್ಲ.
              </p>
            </div>

            {/* Owner & Repo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ರೆಪೊಸಿಟರಿ ಮಾಲೀಕರು / Org (Owner / User) *
                </label>
                <input
                  type="text"
                  value={config.repoOwner}
                  onChange={e => setConfig({ ...config, repoOwner: e.target.value })}
                  placeholder="ಉದಾ: karnataka-education ಅಥವಾ ನಿಮ್ಮ username"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ರೆಪೊಸಿಟರಿ ಹೆಸರು (Repository Name) *
                </label>
                <input
                  type="text"
                  value={config.repoName}
                  onChange={e => setConfig({ ...config, repoName: e.target.value })}
                  placeholder="ಉದಾ: beo-bhadravathi-dak-backup"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Branch & Path */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಶಾಖೆ (Git Branch)
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={config.branch}
                    onChange={e => setConfig({ ...config, branch: e.target.value })}
                    placeholder="main"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಫೋಲ್ಡರ್ ಮಾರ್ಗ (Directory Path Prefix)
                </label>
                <input
                  type="text"
                  value={config.pathPrefix}
                  onChange={e => setConfig({ ...config, pathPrefix: e.target.value })}
                  placeholder="e-office-backups/2026-27"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-sky-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Test result message */}
            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-[11px] leading-relaxed">
                  {testResult.message}
                </div>
              </div>
            )}

            {/* Action buttons row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'ಸಂಪರ್ಕ ಪರೀಕ್ಷಿಸಿ (Test Connection)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  ಸಂರಚನೆ ಉಳಿಸಿ (Save)
                </button>
              </div>

              <button
                type="button"
                onClick={handlePerformGitHubSync}
                disabled={isSyncing}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-900 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 font-kannada"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'ಬ್ಯಾಕಪ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'GitHub ಗೆ ರಫ್ತು & ಸಿಂಕ್ ಮಾಡಿ (Sync Now)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Info: Live Snapshot & Target Files */}
        <div className="lg:col-span-5 space-y-4">
          {/* Snapshot payload card */}
          <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-600" />
              <span>ಸಿಂಕ್ ಆಗುವ ಪ್ರಸ್ತುತ ಡೇಟಾ (Registry Items to Export)</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Letters / Dak</span>
                <span className="text-xl font-bold text-sky-950">{letters.length}</span>
                <span className="text-[10px] text-stone-500 block">inward & outward</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Master Files</span>
                <span className="text-xl font-bold text-sky-950">{files.length}</span>
                <span className="text-[10px] text-stone-500 block">dockets & movement</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Employees</span>
                <span className="text-xl font-bold text-sky-950">{employees.length}</span>
                <span className="text-[10px] text-stone-500 block">cadres & salaries</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Pension Cases</span>
                <span className="text-xl font-bold text-sky-950">{pensionCases.length}</span>
                <span className="text-[10px] text-stone-500 block">calculations & orders</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-700" />
                <span><code>letters_registry.json</code></span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-700" />
                <span><code>master_docket_files.json</code></span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-700" />
                <span><code>employee_roster.json</code></span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-700" />
                <span><code>latest_eoffice_full_backup.json</code></span>
              </div>
            </div>
          </div>

          {/* Sync Progress / Status Card */}
          {syncStatus.logs.length > 0 && (
            <div className="bg-stone-900 text-stone-100 rounded-xl p-4 shadow-sm border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>GitHub Sync Live Console</span>
                </span>
                {syncStatus.success !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    syncStatus.success ? 'bg-emerald-900/80 text-emerald-300' : 'bg-rose-900/80 text-rose-300'
                  }`}>
                    {syncStatus.success ? 'COMPLETED' : 'FAILED'}
                  </span>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] font-mono text-stone-300 bg-black/40 p-2.5 rounded-lg border border-stone-800">
                {syncStatus.logs.map((l, i) => (
                  <div key={i} className="leading-snug">{l}</div>
                ))}
              </div>

              {syncStatus.commitUrls.length > 0 && (
                <div className="pt-2 border-t border-stone-800 space-y-1 text-[11px]">
                  <span className="text-stone-400 block font-semibold">GitHub Commits Generated:</span>
                  {syncStatus.commitUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 truncate underline"
                    >
                      <span>Commit {i + 1}: {url.split('/').slice(-2).join('/')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
