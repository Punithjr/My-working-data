import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Building2, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  IndianRupee, 
  BookOpen, 
  Calendar, 
  Lock,
  Edit2,
  Users,
  Trash2,
  Sparkles,
  Database,
  FolderGit2,
  Smartphone
} from 'lucide-react';
import { PayRule, OfficeConfig, AdminAuthUser, Employee, EducationLetter, MasterDocketFile, PensionCaseRecord } from '../types';
import { OfficeStaffTable } from './OfficeStaffTable';
import { UserManagementView } from './UserManagementView';
import { GitHubSyncPanel } from './GitHubSyncPanel';
import { MobileAppInstallSection } from './MobileAppInstallSection';
import { logSecurityEvent } from '../utils/securityAuditLogger';

interface AdminSettingsPanelProps {
  currentUser: AdminAuthUser | null;
  onRefreshData?: () => void;
  onClearSampleData?: () => Promise<void>;
  onLoadFreshData?: () => Promise<void>;
  letters?: EducationLetter[];
  files?: MasterDocketFile[];
  pensionCases?: PensionCaseRecord[];
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({
  currentUser,
  onRefreshData,
  onClearSampleData,
  onLoadFreshData,
  letters = [],
  files = [],
  pensionCases = [],
}) => {
  const [payRules, setPayRules] = useState<PayRule[]>([]);
  const [officeConfig, setOfficeConfig] = useState<OfficeConfig | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [showFreshConfirmModal, setShowFreshConfirmModal] = useState<boolean>(false);

  // Active settings tab: 'rules' | 'office' | 'users' | 'githubSync' | 'mobileApp'
  const [activeTab, setActiveTab] = useState<'rules' | 'office' | 'users' | 'githubSync' | 'mobileApp'>('rules');

  // DDO (ಆಹರಣ ಮತ್ತು ವಿತರಣಾಧಿಕಾರಿ) Dedicated Form State
  const [ddoOfficerName, setDdoOfficerName] = useState('');
  const [ddoDesignation, setDdoDesignation] = useState('');
  const [ddoCode, setDdoCode] = useState('14041ED001');
  const [ddoKgidNumber, setDdoKgidNumber] = useState('');
  const [ddoMobile, setDdoMobile] = useState('');
  const [ddoEmail, setDdoEmail] = useState('');
  const [ddoOfficeName, setDdoOfficeName] = useState('');
  const [selectedDdoEmpId, setSelectedDdoEmpId] = useState('');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, officeRes, empRes] = await Promise.all([
        fetch('/api/memorandum/pay-rules'),
        fetch('/api/memorandum/office-config'),
        fetch('/api/employees'),
      ]);

      if (rulesRes.ok) {
        const d = await rulesRes.json();
        setPayRules(d.payRules || []);
      }
      if (officeRes.ok) {
        const d = await officeRes.json();
        const cfg = d.office || d.config || null;
        setOfficeConfig(cfg);
        if (cfg) {
          if (cfg.ddoOfficerName) setDdoOfficerName(cfg.ddoOfficerName);
          if (cfg.ddoDesignation) setDdoDesignation(cfg.ddoDesignation);
          if (cfg.ddoCode) setDdoCode(cfg.ddoCode);
          if (cfg.ddoKgidNumber) setDdoKgidNumber(cfg.ddoKgidNumber);
          if (cfg.ddoMobile) setDdoMobile(cfg.ddoMobile);
          if (cfg.ddoEmail) setDdoEmail(cfg.ddoEmail);
          if (cfg.ddoOfficeName) setDdoOfficeName(cfg.ddoOfficeName);
        }
      }
      if (empRes.ok) {
        const d = await empRes.json();
        const empList: Employee[] = d.employees || [];
        setEmployees(empList);
        // Prioritize employee with isDdo explicitly set to true
        const ddoEmp = empList.find((e: Employee) => e.isDdo === true) || 
                       empList.find((e: Employee) => e.designation?.toLowerCase().includes('ddo')) || 
                       empList.find((e: Employee) => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
        if (ddoEmp) {
          setSelectedDdoEmpId(ddoEmp.id);
          // Dynamically pull DDO officer info from isDdo employee flag
          setDdoOfficerName(ddoEmp.fullName);
          setDdoDesignation(ddoEmp.designation);
          setDdoKgidNumber(ddoEmp.kgidNumber || '');
          setDdoMobile(ddoEmp.phone || '');
          setDdoEmail(ddoEmp.email || '');
          setDdoCode(ddoEmp.ddoCode || '14041ED001');
          setDdoOfficeName(ddoEmp.placeOfWork || ddoEmp.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ');
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDdoFromStaff = (empId: string) => {
    setSelectedDdoEmpId(empId);
    if (!empId) return;
    const emp = employees.find(e => e.id === empId || e.kgidNumber === empId);
    if (emp) {
      setDdoOfficerName(emp.fullName);
      setDdoDesignation(emp.designation);
      setDdoKgidNumber(emp.kgidNumber || '');
      setDdoMobile(emp.phone || '');
      setDdoEmail(emp.email || '');
      setDdoCode(emp.ddoCode || '14041ED001');
      setDdoOfficeName(emp.placeOfWork || emp.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ');
      showMsg(`ನೌಕರರ ಪಟ್ಟಿಯಿಂದ "${emp.fullName}" ರವರ ಡಿಡಿಓ ವಿವರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.`);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update Pay Rule Handler
  const handleUpdateRule = async (rule: PayRule) => {
    try {
      const res = await fetch(`/api/memorandum/pay-rules/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
        body: JSON.stringify(rule),
      });

      if (res.ok) {
        showMsg(`"${rule.orderTypeName}" ನಿಯಮವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`);
        loadSettings();
      } else {
        const d = await res.json();
        showMsg(d.error || 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ', 'error');
      }
    } catch (err: any) {
      showMsg('ದೋಷ: ' + err.message, 'error');
    }
  };

  // Update Office Config Handler
  const handleSaveOfficeConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const updated: OfficeConfig = {
      officeNameKannada: formData.get('officeNameKannada') as string,
      officeNameEnglish: formData.get('officeNameEnglish') as string,
      officerDesignationKannada: formData.get('officerDesignationKannada') as string,
      officerName: formData.get('officerName') as string,
      departmentKannada: formData.get('departmentKannada') as string,
      officeAddress: formData.get('officeAddress') as string,
      district: formData.get('district') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      orderPrefix: formData.get('orderPrefix') as string,
      kcsrEdition: formData.get('kcsrEdition') as string,
      ddoOfficerName: (formData.get('ddoOfficerName') as string) || ddoOfficerName,
      ddoDesignation: (formData.get('ddoDesignation') as string) || ddoDesignation,
      ddoCode: (formData.get('ddoCode') as string) || ddoCode,
      ddoKgidNumber: (formData.get('ddoKgidNumber') as string) || ddoKgidNumber,
      ddoMobile: (formData.get('ddoMobile') as string) || ddoMobile,
      ddoEmail: (formData.get('ddoEmail') as string) || ddoEmail,
      ddoOfficeName: (formData.get('ddoOfficeName') as string) || ddoOfficeName,
      ddoEmployeeId: selectedDdoEmpId,
    };

    try {
      const res = await fetch('/api/memorandum/office-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-name': currentUser.displayName,
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setOfficeConfig(updated);
        // If an employee was selected as DDO, update their isDdo in employees and clear previous DDOs
        if (selectedDdoEmpId) {
          employees.forEach(emp => {
            if (emp.id === selectedDdoEmpId) {
              const updatedEmp = { ...emp, isDdo: true, ddoCode: updated.ddoCode };
              fetch(`/api/employees/${emp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEmp),
              }).catch(err => console.warn('DDO employee sync note:', err));
            } else if (emp.isDdo) {
              const updatedEmp = { ...emp, isDdo: false };
              fetch(`/api/employees/${emp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEmp),
              }).catch(err => console.warn('DDO employee unmark note:', err));
            }
          });
        }
        showMsg('ಕಛೇರಿ ಹಾಗೂ ಡಿಡಿಓ (DDO) ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.');
        if (onRefreshData) onRefreshData();
      } else {
        const d = await res.json();
        showMsg(d.error || 'ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ', 'error');
      }
    } catch (err: any) {
      showMsg('ದೋಷ: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Backup Download Handler
  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/memorandum/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Karnataka_Govt_Memorandum_DB_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMsg('ಡೇಟಾಬೇಸ್ ಬ್ಯಾಕಪ್ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.');
      }
    } catch (err: any) {
      showMsg('ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ: ' + err.message, 'error');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!confirm('ಎಚ್ಚರಿಕೆ: ಎಲ್ಲಾ ಡೇಟಾಬೇಸ್ ವಿವರಗಳು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಡೇಟಾಬೇಸ್‌ಗೆ ಮರುಹೊಂದಾಣಿಕೆಯಾಗಲಿದೆ. ಮುಂದುವರಿಯಬೇಕೆ?')) {
      return;
    }

    try {
      const res = await fetch('/api/memorandum/reset-defaults', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
      });

      if (res.ok) {
        showMsg('ಡೇಟಾಬೇಸ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
        loadSettings();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      showMsg('ರಿಸೆಟ್ ವಿಫಲವಾಗಿದೆ: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                  ಆಡಳಿತ ನಿಯಂತ್ರಣ • Admin Panel
                </span>
                <span className="text-xs text-stone-500">KCSR Pay Rules & Office Configuration</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-1 font-sans">
                ಸೆಟ್ಟಿಂಗ್ಸ್ & ವೇತನ ನಿಯಮಗಳು (Settings & Configurable Pay Rules)
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ವೇತನ ಬಡ್ತಿ ನಿಯಮಗಳು (10/15/20/25/30 ವರ್ಷ), ರಜೆ ನಿಯಮಗಳು ಹಾಗೂ ಕಛೇರಿ ಲೆಟರ್‌ಹೆಡ್ ಸೆಟ್ಟಿಂಗ್ಸ್.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-admin-mobile-app-banner"
              onClick={() => setActiveTab('mobileApp')}
              className="px-3 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="ಮೊಬೈಲ್ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ / ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ & ಆವೃತ್ತಿ ನವೀಕರಣ"
            >
              <Smartphone className="w-4 h-4 text-stone-900" />
              <span>📱 ಮೊಬೈಲ್ ಆ್ಯಪ್ & ಇನ್‌ಸ್ಟಾಲ್</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>ಡೇಟಾಬೇಸ್ ಬ್ಯಾಕಪ್</span>
            </button>
            <button
              type="button"
              id="btn-admin-clear-sample-data"
              onClick={() => setShowClearConfirmModal(true)}
              className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ಮಾದರಿ (Sample/Mock) ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಿಮೂವ್ ಮಾಡಿ"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>ಮಾದರಿ ಡೇಟಾ ರಿಮೂವ್ ಮಾಡಿ</span>
            </button>
            <button
              type="button"
              id="btn-admin-load-fresh-data"
              onClick={() => setShowFreshConfirmModal(true)}
              className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ಹೊಸ ಅಧಿಕೃತ 2026-27 ಕಡತಗಳು ಹಾಗೂ ಪತ್ರಗಳನ್ನು ಒದಗಿಸಿ"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ಹೊಸ ಅಧಿಕೃತ ಡೇಟಾ ನೀಡಿ</span>
            </button>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Administrator' || currentUser?.role === 'Case Worker') && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ಅಧಿಕೃತ ಇಲಾಖಾ ಡೇಟಾಗೆ ಮರುಹೊಂದಿಸಿ"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ಡೇಟಾ ರಿಸೆಟ್</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-4 pt-2 rounded-t-lg">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ವೇತನ ಬಡ್ತಿ ನಿಯಮಗಳು (Pay Rules Engine)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('office')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'office'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>ಕಛೇರಿ & ಅಧಿಕಾರಿ ವಿವರಗಳು (Office Config)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users' as any)}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4 text-sky-700" />
          <span>ಅಧಿಕೃತ ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ (User Management)</span>
        </button>

        <button
          type="button"
          id="btn-tab-github-sync"
          onClick={() => setActiveTab('githubSync')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'githubSync'
              ? 'border-sky-950 text-sky-950'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-amber-600" />
          <span>GitHub ಸಿಂಕ್ & ಬ್ಯಾಕಪ್ (GitHub Sync)</span>
        </button>

        <button
          type="button"
          id="btn-tab-mobile-app"
          onClick={() => setActiveTab('mobileApp')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mobileApp'
              ? 'border-amber-600 text-stone-950 bg-amber-50/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-amber-600" />
          <span>📱 ಮೊಬೈಲ್ ಆ್ಯಪ್ & ಇನ್‌ಸ್ಟಾಲ್ (Mobile App & Update)</span>
        </button>
      </div>

      {/* TAB 1: PAY RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-stone-200 rounded-b-lg p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 font-sans">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ ನೌಕರರ ವೇತನ ಬಡ್ತಿ ನಿಯಮಗಳ ಸಂರಚನೆ (Configurable Pay & Increment Rules)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ಆಡಳಿತಾಧಿಕಾರಿಗಳು ಇಲ್ಲಿ ಅರ್ಹತಾ ವರ್ಷಗಳು, ಬಡ್ತಿ ಹಂತದ ಮೌಲ್ಯ, ಜಾರಿಗೆ ತರುವ ನಿಯಮಗಳು ಹಾಗೂ ಸರಕಾರಿ ಆದೇಶದ ಉಲ್ಲೇಖಗಳನ್ನು ಬದಲಾಯಿಸಬಹುದು.
              </p>
            </div>
            <span className="text-xs text-stone-500 font-mono">ಒಟ್ಟು ನಿಯಮಗಳು: {payRules.length}</span>
          </div>

          <div className="space-y-4">
            {payRules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-lg border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-sky-950 text-white rounded text-xs font-bold font-mono">
                      {rule.ruleCode}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 font-sans">
                      {rule.orderTypeName}
                    </h4>
                  </div>
                  <span className="text-xs text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                    ಸರಕಾರಿ ಆದೇಶ: <strong className="font-mono text-stone-800">{rule.applicableGovtOrder}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-500 text-[11px] mb-1">ಅರ್ಹತಾ ಸೇವಾ ಅವಧಿ (ವರ್ಷಗಳು)</label>
                    <input
                      type="number"
                      defaultValue={rule.qualifyingYears}
                      onChange={(e) => {
                        rule.qualifyingYears = Number(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-500 text-[11px] mb-1">ಬಡ್ತಿಯ ವಿಧಾನ (Increment Type)</label>
                    <select
                      defaultValue={rule.incrementType}
                      onChange={(e) => {
                        rule.incrementType = e.target.value as any;
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white"
                    >
                      <option value="matrix_stage">ಕರ್ನಾಟಕ ವೇತನ ಮ್ಯಾಟ್ರಿಕ್ಸ್ ಹಂತ (Matrix Stage)</option>
                      <option value="fixed_amount">ನಿಗದಿತ ಮೊತ್ತ (Fixed Amount)</option>
                      <option value="percentage">ಶೇಕಡಾವಾರು (Percentage)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-500 text-[11px] mb-1">ಬಡ್ತಿ ಮೌಲ್ಯ / ಹಂತಗಳ ಸಂಖ್ಯೆ</label>
                    <input
                      type="number"
                      defaultValue={rule.incrementValue}
                      onChange={(e) => {
                        rule.incrementValue = Number(e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-500 text-[11px] mb-1">ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ ನಿಯಮ</label>
                    <select
                      defaultValue={rule.effectiveDateRule}
                      onChange={(e) => {
                        rule.effectiveDateRule = e.target.value as any;
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white"
                    >
                      <option value="milestone_date">ಅರ್ಹತೆ ಪೂರ್ಣಗೊಂಡ ದಿನಾಂಕದಿಂದ</option>
                      <option value="first_of_next_month">ಮುಂದಿನ ತಿಂಗಳ 1 ನೇ ತಾರೀಖಿನಿಂದ</option>
                      <option value="order_date">ಆದೇಶದ ದಿನಾಂಕದಿಂದ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-500 text-[11px] mb-1">ಕೆಸಿಎಸ್‌ಆರ್ ನಿಯಮದ ಉಲ್ಲೇಖ (KCSR Reference)</label>
                    <input
                      type="text"
                      defaultValue={rule.kcsrReference}
                      onChange={(e) => {
                        rule.kcsrReference = e.target.value;
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => handleUpdateRule(rule)}
                      className="px-4 py-1.5 bg-sky-950 hover:bg-sky-900 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>ನಿಯಮವನ್ನು ಉಳಿಸಿ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OFFICE CONFIG */}
      {activeTab === 'office' && officeConfig && (
        <div className="space-y-6">
          <form onSubmit={handleSaveOfficeConfig} className="bg-white border border-stone-200 rounded-b-lg p-6 shadow-2xs space-y-4 text-xs">
          {/* SECTION A: DDO (ಹಣ ಸೆಳೆಯುವ ಮತ್ತು ವಿತರಣಾಧಿಕಾರಿ) DETAILS & EMPLOYEE SYNC */}
          <div className="p-4 bg-amber-50/80 border-2 border-[#2b2b2b] rounded-xl space-y-3 shadow-[2px_2px_0px_#2b2b2b]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#2b2b2b] text-[#f59e0b] font-bold font-mono text-[10px]">
                    DDO SETUP
                  </span>
                  <h4 className="font-bold text-sm text-[#2b2b2b] font-kannada">
                    ಕಛೇರಿಯ ಡಿಡಿಓ ವಿವರಗಳು (Drawing & Disbursing Officer - ಡಿಡಿಓ)
                  </h4>
                </div>
                <p className="text-[11px] text-stone-600 mt-0.5 font-kannada">
                  ನೌಕರರ ಪಟ್ಟಿಯಲ್ಲಿ 'isDdo' ಗುರುತಿಸಲಾದ ಅಧಿಕಾರಿಯ ವಿವರಗಳು ತಾನಾಗಿಯೇ ಇಲ್ಲಿ ಲಭ್ಯವಾಗಲಿದ್ದು, ಎಲ್ಲಾ ಜ್ಞಾಪನಾ ಆದೇಶಗಳು, ಸಾಮಾನ್ಯ ಪತ್ರಗಳು ಹಾಗೂ ಪ್ರಪತ್ರ-28 ನಮೂನೆಗಳ ಅಧಿಕೃತ ಸಹಿ ಬ್ಲಾಕ್‌ಗೆ (Signatory Block) ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅನ್ವಯವಾಗುತ್ತವೆ.
                </p>
              </div>

              {ddoOfficerName && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-400 rounded-lg text-[11px] font-bold font-kannada flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ಸಕ್ರಿಯ ಡಿಡಿಓ: {ddoOfficerName}</span>
                  </span>
                  <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-300 font-mono">
                    ಪದನಾಮ: {ddoDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Picker from Staff Roster */}
            <div>
              <label className="block font-bold text-stone-800 text-[11px] mb-1 font-kannada">
                ನೌಕರರ ಪಟ್ಟಿಯಿಂದ ಡಿಡಿಓ ಆಯ್ಕೆ ಮಾಡಿ (Select DDO from Employees):
              </label>
              <select
                id="select-ddo-employee"
                value={selectedDdoEmpId}
                onChange={(e) => handleSelectDdoFromStaff(e.target.value)}
                className="w-full sm:w-2/3 px-3 py-1.5 border-2 border-[#2b2b2b] rounded-lg bg-white font-medium text-xs shadow-xs cursor-pointer font-kannada"
              >
                <option value="">-- ನೌಕರರ ಪಟ್ಟಿಯಿಂದ ನೇರವಾಗಿ ಡಿಡಿಓ ಆಯ್ಕೆ ಮಾಡಿ --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} - {emp.designation} (KGID: {emp.kgidNumber || '-'}) {emp.isDdo ? '⭐ [ಹಾಲಿ ಡಿಡಿಓ]' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿದಾಗ ಅವರ ಹೆಸರು, ಪದನಾಮ, ಕೆಜಿಐಡಿ ಮತ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳು ತಾನಾಗಿಯೇ ಕೆಳಗಿನ ಕಾಲಮ್‌ಗಳಿಗೆ ಭರ್ತಿಯಾಗುತ್ತವೆ.
              </span>
            </div>

            {/* DDO Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಅಧಿಕಾರಿಗಳ ಹೆಸರು *
                </label>
                <input
                  type="text"
                  name="ddoOfficerName"
                  value={ddoOfficerName}
                  onChange={(e) => setDdoOfficerName(e.target.value)}
                  placeholder="ಹೆಚ್. ರವಿಕುಮಾರ್ (ಡಿಡಿಓ ಅಧಿಕಾರಿ)"
                  required
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಪದನಾಮ / ಹುದ್ದೆ *
                </label>
                <input
                  type="text"
                  name="ddoDesignation"
                  value={ddoDesignation}
                  onChange={(e) => setDdoDesignation(e.target.value)}
                  placeholder="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ"
                  required
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಕಛೇರಿ ಡಿಡಿಓ ಕೋಡ್ (DDO Code)
                </label>
                <input
                  type="text"
                  name="ddoCode"
                  value={ddoCode}
                  onChange={(e) => setDdoCode(e.target.value)}
                  placeholder="14041ED001"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ
                </label>
                <input
                  type="text"
                  name="ddoKgidNumber"
                  value={ddoKgidNumber}
                  onChange={(e) => setDdoKgidNumber(e.target.value)}
                  placeholder="100101"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
                </label>
                <input
                  type="text"
                  name="ddoMobile"
                  value={ddoMobile}
                  onChange={(e) => setDdoMobile(e.target.value)}
                  placeholder="9448991201"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಅಧಿಕೃತ ಇಮೇಲ್
                </label>
                <input
                  type="email"
                  name="ddoEmail"
                  value={ddoEmail}
                  onChange={(e) => setDdoEmail(e.target.value)}
                  placeholder="beo.bhadravathi@karnataka.gov.in"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">
                  ಡಿಡಿಓ ಕಚೇರಿ ಹೆಸರು & ವಿಳಾಸ
                </label>
                <input
                  type="text"
                  name="ddoOfficeName"
                  value={ddoOfficeName}
                  onChange={(e) => setDdoOfficeName(e.target.value)}
                  placeholder="ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-stone-200 pb-3 pt-2">
            <h3 className="font-bold text-sm text-stone-900 font-sans">
              ಕಛೇರಿ ಹಾಗೂ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಸಾಮಾನ್ಯ ವಿವರಗಳು (Office & General Setup)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              ಈ ವಿವರಗಳು ಸೃಜಿಸಲಾಗುವ ಎಲ್ಲಾ ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶಗಳ ಹೆಡರ್, ಸೀಲ್ ಹಾಗೂ ಸಹಿ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶಿತವಾಗಲಿವೆ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">ಕಛೇರಿಯ ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ) *</label>
              <input
                type="text"
                name="officeNameKannada"
                defaultValue={officeConfig.officeNameKannada}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Office Name (English)</label>
              <input
                type="text"
                name="officeNameEnglish"
                defaultValue={officeConfig.officeNameEnglish}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಇಲಾಖೆಯ ಹೆಸರು (Department)</label>
              <input
                type="text"
                name="departmentKannada"
                defaultValue={officeConfig.departmentKannada}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಸಕ್ಷಮ ಅಧಿಕಾರಿಯ ಹುದ್ದೆ *</label>
              <input
                type="text"
                name="officerDesignationKannada"
                defaultValue={officeConfig.officerDesignationKannada}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಅಧಿಕಾರಿಯ ಹೆಸರು (Officer Name)</label>
              <input
                type="text"
                name="officerName"
                defaultValue={officeConfig.officerName}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಜಿಲ್ಲೆ (District)</label>
              <input
                type="text"
                name="district"
                defaultValue={officeConfig.district}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಆದೇಶ ಸಂಖ್ಯೆಯ ಪೂರ್ವಪ್ರತ್ಯಯ (Prefix)</label>
              <input
                type="text"
                name="orderPrefix"
                defaultValue={officeConfig.orderPrefix}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಸಂಪರ್ಕ ಇಮೇಲ್ (Official Email)</label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={officeConfig.contactEmail}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">ಸಂಪರ್ಕ ದೂರವಾಣಿ (Phone)</label>
              <input
                type="text"
                name="contactPhone"
                defaultValue={officeConfig.contactPhone}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-bold text-stone-700 mb-1">ಕಛೇರಿಯ ಪೂರ್ಣ ವಿಳಾಸ (Office Address)</label>
              <input
                type="text"
                name="officeAddress"
                defaultValue={officeConfig.officeAddress}
                className="w-full px-3 py-2 border border-stone-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-200">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಛೇರಿ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಿ'}</span>
            </button>
          </div>
        </form>

        {/* DETAILED PRINTABLE OFFICE STAFF ROSTER TABLE */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 font-sans">
                ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ವಿವರಗಳ ಪಟ್ಟಿ (Office Staff Roster & Printable Table)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ: <strong className="text-stone-900">ಶ್ರೀ ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ (BEO)</strong> ಹಾಗೂ ಕಛೇರಿಯ ಎಲ್ಲಾ ಸಿಬ್ಬಂದಿ ವಿವರ, ಪದನಾಮ, ಶಾಖೆ ಮತ್ತು ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/employees/seed', { method: 'POST' });
                  if (res.ok) {
                    showMsg('ಸಿಬ್ಬಂದಿ ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ (Data Reseeded).');
                    loadSettings();
                    if (onRefreshData) onRefreshData();
                  }
                } catch (e: any) {
                  showMsg('ಮರುಹೊಂದಿಸುವಾಗ ದೋಷ: ' + e.message, 'error');
                }
              }}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded border border-stone-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ಡೇಟಾ ಮರುಹೊಂದಿಸಿ (Reseed Staff)</span>
            </button>
          </div>

          <OfficeStaffTable employees={employees} showTitleHeader={false} />
        </div>
      </div>
      )}

      {/* TAB 3: USER MANAGEMENT & CREATOR */}
      {activeTab === 'users' && (
        <div className="bg-white border border-stone-200 rounded-b-lg p-6 shadow-2xs">
          <UserManagementView
            currentUser={currentUser}
            onSelectUser={() => {
              if (onRefreshData) onRefreshData();
            }}
            showToast={(msg) => showMsg(msg)}
            employees={employees}
          />
        </div>
      )}

      {/* TAB 4: GITHUB SYNC & DISASTER RECOVERY */}
      {activeTab === 'githubSync' && (
        <div className="bg-white border border-stone-200 rounded-b-lg p-6 shadow-2xs">
          <GitHubSyncPanel
            currentUser={currentUser}
            letters={letters}
            files={files}
            employees={employees}
            pensionCases={pensionCases}
            onSyncComplete={onRefreshData}
          />
        </div>
      )}

      {/* TAB 5: MOBILE APP DOWNLOAD, INSTALL & UPDATE MANAGER */}
      {activeTab === 'mobileApp' && (
        <div className="bg-stone-50/70 border border-stone-200 rounded-b-lg p-6 shadow-2xs">
          <MobileAppInstallSection onShowToast={(msg) => showMsg(msg, 'success')} />
        </div>
      )}

      {/* Confirmation Modal: Clear Sample Data */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-stone-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 font-kannada">
                ಮಾದರಿ ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಿಮೂವ್ ಮಾಡುವುದೇ?
              </h3>
              <p className="text-xs text-stone-600 font-kannada leading-relaxed">
                ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ ಎಲ್ಲಾ ಮಾದರಿ (Mock / Test) ಕಡತಗಳು ಹಾಗೂ ಪತ್ರಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗುತ್ತದೆ. ನಂತರ ನೀವು ಕಛೇರಿಯ ಅಧಿಕೃತ ತಾಜಾ ಕಡತಗಳನ್ನು ನೇರವಾಗಿ ನಮೂದಿಸಬಹುದು.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-900 font-kannada">
              <strong>ಗಮನಿಸಿ:</strong> ಈ ಕ್ರಿಯೆಯು ಕಛೇರಿಯ ಖಾಲಿ ಸ್ಲೇಟ್ ನೀಡುತ್ತದೆ. ಅಗತ್ಯವಿದ್ದರೆ ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ &ldquo;ಹೊಸ ಅಧಿಕೃತ ಡೇಟಾ ನೀಡಿ&rdquo; ಬಟನ್ ಮೂಲಕ 2026-27 ರ ಅಧಿಕೃತ ಕಡತಗಳನ್ನು ಪುನಃ ಪಡೆಯಬಹುದು.
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 cursor-pointer font-kannada"
              >
                ರದ್ದುಗೊಳಿಸಿ (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowClearConfirmModal(false);
                  logSecurityEvent({
                    eventType: 'BULK_DELETION',
                    actionSummary: 'Sample/Test Registry Data Purged',
                    details: 'Administrator purged mock letters and files for fresh official data entry.',
                    authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
                    authorizedUserName: currentUser?.displayName || 'Administrator',
                    targetModule: 'Data Management',
                    status: 'WARNING'
                  });
                  if (onClearSampleData) {
                    await onClearSampleData();
                  } else {
                    const res = await fetch('/api/data/clear-sample', { method: 'POST' });
                    if (res.ok) {
                      showMsg('ಮಾದರಿ ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಿಮೂವ್ ಮಾಡಲಾಗಿದೆ.');
                      if (onRefreshData) onRefreshData();
                    }
                  }
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow cursor-pointer font-kannada"
              >
                ಹೌದು, ರಿಮೂವ್ ಮಾಡಿ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Load Fresh 2026-27 Data */}
      {showFreshConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-stone-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 font-kannada">
                ಹೊಸ ಅಧಿಕೃತ 2026-27 ಡೇಟಾವನ್ನು ಒದಗಿಸುವುದೇ?
              </h3>
              <p className="text-xs text-stone-600 font-kannada leading-relaxed">
                ಆ2 (ಸ.ಪ್ರಾ.ಶಿ) ಶಾಖೆಗೆ ಸಂಬಂಧಿಸಿದ ಅಧಿಕೃತ 2026-27 ನೇ ಸಾಲಿನ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (ಕಡತ 45), ರಜೆ ಮಂಜೂರಾತಿ (ಕಡತ 46) ಮತ್ತು ಮಾಹಿತಿ ಹಕ್ಕು (ಕಡತ 47) ಕಡತಗಳು ಹಾಗೂ ಸಂಬಂಧಿಸಿದ ಪತ್ರಗಳನ್ನು ಹೊಸದಾಗಿ ಸ್ಥಾಪಿಸಲಾಗುತ್ತದೆ.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFreshConfirmModal(false)}
                className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 cursor-pointer font-kannada"
              >
                ರದ್ದುಗೊಳಿಸಿ (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowFreshConfirmModal(false);
                  logSecurityEvent({
                    eventType: 'DATA_RESET',
                    actionSummary: 'Fresh 2026-27 Official Registry Data Seeded',
                    details: 'Loaded standard statutory 2026-27 files, employee rosters, and official circulars.',
                    authorizedUserId: currentUser?.id || currentUser?.username || 'ADM-01',
                    authorizedUserName: currentUser?.displayName || 'Administrator',
                    targetModule: 'Data Management',
                    status: 'SUCCESS'
                  });
                  if (onLoadFreshData) {
                    await onLoadFreshData();
                  } else {
                    const res = await fetch('/api/data/fresh-init', { method: 'POST' });
                    if (res.ok) {
                      showMsg('ಹೊಸ ಅಧಿಕೃತ 2026-27 ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಒದಗಿಸಲಾಗಿದೆ.');
                      if (onRefreshData) onRefreshData();
                    }
                  }
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow cursor-pointer font-kannada"
              >
                ಹೌದು, ಹೊಸ ಡೇಟಾ ಸ್ಥಾಪಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
