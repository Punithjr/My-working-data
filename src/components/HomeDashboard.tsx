import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  FolderGit2, 
  FileText, 
  Users, 
  Award, 
  Clock, 
  Send, 
  Inbox, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  School, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  BookOpen, 
  FileCheck2, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  Plus, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { CreateOtherFileModal } from './CreateOtherFileModal';
import { 
  OfficeSection, 
  Employee, 
  MasterDocketFile, 
  EducationLetter, 
  AdminAuthUser, 
  AppNavTab,
  SchoolInstitution
} from '../types';

export const DEFAULT_OFFICE_SECTIONS: OfficeSection[] = [
  {
    id: 'sec-all',
    code: 'all',
    name: 'ಎಲ್ಲಾ ಶಾಖೆಗಳು (All Sections)',
    description: 'ಕಛೇರಿಯ ಎಲ್ಲಾ ಶಾಖೆಗಳ ಸಮಗ್ರ ಕಡತಗಳು, ಪತ್ರ ವ್ಯವಹಾರ ಹಾಗೂ ಮಾಹಿತಿ ಹಕ್ಕು ಪ್ರಕರಣಗಳು',
    isDefault: false
  },
  {
    id: 'sec-a1',
    code: 'ಆ1',
    name: 'ಪ್ರೌಢ ಶಿಕ್ಷಣ (High School)',
    description: 'ಪ್ರೌಢ ಶಿಕ್ಷಣ ವಿಭಾಗ, ಮುಖ್ಯ ಶಿಕ್ಷಕರು, ಸಹ ಶಿಕ್ಷಕರ ಆಡಳಿತ, ವೇತನ & ಸೇವಾ ವಿಷಯಗಳು',
    isDefault: false
  },
  {
    id: 'sec-a2',
    code: 'ಆ2',
    name: 'ಸ.ಪ್ರಾ.ಶಿ (ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ)',
    description: 'ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ವಿಭಾಗ - ಶಿಕ್ಷಕರ ವೇತನ, ಸೇವಾ ವಿಷಯಗಳು, ರಜೆ ಹಾಗೂ ನಿವೃತ್ತಿ ವೇತನ ನಿರ್ವಹಣೆ',
    isDefault: true
  },
  {
    id: 'sec-a3',
    code: 'ಆ3',
    name: 'ಅನುದಾನಿತ ಶಾಲೆಗಳು & ಲೆಕ್ಕಪತ್ರ',
    description: 'ಖಾಸಗಿ ಅನುದಾನಿತ ಶಾಲೆಗಳ ವೇತನ ಅನುದಾನ, ಬೋಧಕ/ಬೋಧಕೇತರ ಸಿಬ್ಬಂದಿ ಹಾಗೂ ಲೆಕ್ಕ ಪರಿಶೋಧನೆ',
    isDefault: false
  },
  {
    id: 'sec-a4',
    code: 'ಆ4',
    name: 'ಭೌತಿಕ ಸೌಲಭ್ಯಗಳು & ಪರೀಕ್ಷೆ',
    description: 'ಶಾಲಾ ಮೂಲಭೂತ ಸೌಲಭ್ಯಗಳು, ಸಿಆರ್‌ಸಿ, ಬಿಸಿಯೂಟ ಯೋಜನೆ & ಸಾರ್ವಜನಿಕ ಪರೀಕ್ಷೆಗಳು',
    isDefault: false
  },
  {
    id: 'sec-admin',
    code: 'ಆಡಳಿತ ಶಾಖೆ',
    name: 'ಕಛೇರಿ ಸಾಮಾನ್ಯ ಆಡಳಿತ & ಸಿಬ್ಬಂದಿ',
    description: 'ಕಛೇರಿ ಆಡಳಿತ ಶಾಖೆ, ಒಳ-ಆಡಳಿತ, ಸಿಬ್ಬಂದಿ ನಿಯಂತ್ರಣ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳು',
    isDefault: false
  }
];

export interface HomeDashboardProps {
  currentUser?: AdminAuthUser | null;
  userSlotsCount?: number;
  onOpenUserManagement?: () => void;
  onOpenUserModal?: () => void;
  employees: Employee[];
  files: MasterDocketFile[];
  letters: EducationLetter[];
  sections: OfficeSection[];
  activeSection: OfficeSection | null;
  onSelectSection: (section: OfficeSection) => void;
  onAddSection: (sec: { code: string; name: string; description?: string }) => Promise<void>;
  onNavigate: (tab: AppNavTab, extra?: any) => void;
  onCreateFile?: (fileData: Partial<MasterDocketFile>) => Promise<void>;
  onOpenPrapathra28WithMonth?: (month: 'January' | 'July') => void;
  onRefreshEmployees?: () => Promise<void>;
  onRefreshFiles?: () => Promise<void>;
  onRefreshLetters?: () => Promise<void>;
  onOpenEmployeeInfo?: () => void;
  onOpenPrapathra28?: (month: 'January' | 'July') => void;
  onOpenLetter?: (letter: EducationLetter) => void;
  onOpenDocket?: (file: MasterDocketFile) => void;
  onOpenGeneralLetterStudio?: () => void;
  onOpenMemorandumStudio?: () => void;
  onOpenSchools?: () => void;
  showToast?: (msg: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  employees,
  files,
  letters,
  sections,
  activeSection,
  onSelectSection,
  onNavigate,
  onCreateFile,
  onOpenLetter,
  onOpenDocket,
  onOpenSchools,
  showToast,
}) => {
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>(activeSection?.code || 'all');
  const [isCreateOtherFileOpen, setIsCreateOtherFileOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolInstitution[]>([]);
  const [activityTab, setActivityTab] = useState<'letters' | 'files'>('letters');

  // Sync active section from props
  useEffect(() => {
    if (activeSection?.code) {
      setSelectedSectionCode(activeSection.code);
    }
  }, [activeSection]);

  // Fetch real school statistics from database
  useEffect(() => {
    let isMounted = true;
    async function loadSchools() {
      try {
        const res = await fetch('/api/schools');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.schools) {
            setSchools(data.schools);
          }
        }
      } catch (err) {
        console.warn('Could not fetch schools for dashboard:', err);
      }
    }
    loadSchools();
    return () => { isMounted = false; };
  }, []);

  // Section Matching helper for dockets, letters & RTI cases
  const isMatchSection = (secCode: string, targetCode: string, name?: string, sec?: string, cat?: string, subj?: string) => {
    if (targetCode === 'all' || targetCode === 'ಎಲ್ಲಾ') return true;
    const c = (secCode || '').trim();
    const n = (name || '').trim();
    const s = (sec || '').trim();
    const ct = (cat || '').trim();
    const sb = (subj || '').trim();

    if (targetCode === 'ಆ1') {
      return c === 'ಆ1' || n.includes('ಪ್ರೌಢ') || s.includes('Academic') || ct.includes('High School') || sb.includes('ಪ್ರೌಢ');
    }
    if (targetCode === 'ಆ2') {
      return c === 'ಆ2' || n.includes('ಸ.ಪ್ರಾ.ಶಿ') || n.includes('ಪ್ರಾಥಮಿಕ') || s.includes('Administration & Services') || ct.includes('Primary') || sb.includes('ಪ್ರಾಥಮಿಕ') || sb.includes('ವೇತನ ಬಡ್ತಿ') || ct.includes('Pension');
    }
    if (targetCode === 'ಆ3') {
      return c === 'ಆ3' || n.includes('ಅನುದಾನಿತ') || n.includes('ಲೆಕ್ಕ') || s.includes('Accounts & Grants') || ct.includes('Grant') || ct.includes('Accounts') || sb.includes('ಅನುದಾನ');
    }
    if (targetCode === 'ಆ4') {
      return c === 'ಆ4' || n.includes('ಭೌತಿಕ') || n.includes('ಪರೀಕ್ಷೆ') || s.includes('Examination') || s.includes('Inspection') || ct.includes('Examination') || ct.includes('Inspection') || sb.includes('ಪರೀಕ್ಷೆ') || sb.includes('ಸಿಆರ್‌ಸಿ');
    }
    if (targetCode === 'ಆಡಳಿತ ಶಾಖೆ' || targetCode === 'ಆಡಳಿತ') {
      return c === 'ಆಡಳಿತ ಶಾಖೆ' || c === 'ಆಡಳಿತ' || n.includes('ಆಡಳಿತ') || s.includes('Legal') || s.includes('Administration') || ct.includes('General') || sb.includes('ಆಡಳಿತ');
    }
    return c === targetCode || n.includes(targetCode);
  };

  // Filtered dockets based on selected section
  const sectionFilteredFiles = useMemo(() => {
    if (selectedSectionCode === 'all') return files;
    return files.filter(f => isMatchSection(f.sectionCode || '', selectedSectionCode, f.sectionName, f.section, f.fileCategory, f.subject));
  }, [files, selectedSectionCode]);

  // Filtered letters based on selected section
  const sectionFilteredLetters = useMemo(() => {
    if (selectedSectionCode === 'all') return letters;
    return letters.filter(l => isMatchSection((l as any).sectionCode || '', selectedSectionCode, (l as any).sectionName, l.section, l.category, l.subject));
  }, [letters, selectedSectionCode]);

  // Real Database Statistics (NO fabricated numbers)
  const now = new Date();

  // 1. Files Statistics
  const totalFilesCount = sectionFilteredFiles.length;
  const pendingFiles = sectionFilteredFiles.filter(f => f.status !== 'disposed' && f.status !== 'Disposed / Closed');
  const pendingFilesCount = pendingFiles.length;
  const completedFiles = sectionFilteredFiles.filter(f => f.status === 'disposed' || f.status === 'Disposed / Closed');
  const completedFilesCount = completedFiles.length;

  // 2. Letters Statistics
  const totalLettersCount = sectionFilteredLetters.length;
  const inwardLettersCount = sectionFilteredLetters.filter(l => (l.direction || '').toLowerCase() === 'inward').length;
  const outwardLettersCount = sectionFilteredLetters.filter(l => (l.direction || '').toLowerCase() === 'outward').length;

  // 3. SLA & Deadline Statistics
  const overdueFiles = pendingFiles.filter(f => {
    if (!f.dueDate) return false;
    const due = new Date(f.dueDate).getTime();
    return !isNaN(due) && due < now.getTime();
  });

  const dueSoonFiles = pendingFiles.filter(f => {
    if (!f.dueDate) return false;
    const due = new Date(f.dueDate).getTime();
    if (isNaN(due) || due < now.getTime()) return false;
    const diffHours = (due - now.getTime()) / (1000 * 3600);
    return diffHours <= 48;
  });

  const onTimeFilesCount = Math.max(0, pendingFilesCount - overdueFiles.length - dueSoonFiles.length);
  const slaComplianceRate = pendingFilesCount > 0 ? Math.round(((pendingFilesCount - overdueFiles.length) / pendingFilesCount) * 100) : null;

  // 4. Employee Statistics
  const totalEmployeesCount = employees.length;
  const teachingStaffCount = employees.filter(e => {
    const d = (e.designation || '').toLowerCase();
    return d.includes('teacher') || d.includes('ಶಿಕ್ಷಕ') || d.includes('head') || d.includes('ಮುಖ್ಯ') || d.includes('lecturer');
  }).length;
  const nonTeachingStaffCount = Math.max(0, totalEmployeesCount - teachingStaffCount);
  const kgidVerifiedCount = employees.filter(e => e.kgidNumber && String(e.kgidNumber).trim().length > 0).length;

  // 5. School Statistics
  const totalSchoolsCount = schools.length;
  const govtSchoolsCount = schools.filter(s => {
    const g = (s.grantStatus || '').toLowerCase();
    const n = (s.schoolName || '').toLowerCase();
    return g.includes('govt') || g.includes('government') || n.includes('ಸರ್ಕಾರಿ');
  }).length;
  const aidedSchoolsCount = schools.filter(s => {
    const g = (s.grantStatus || '').toLowerCase();
    const n = (s.schoolName || '').toLowerCase();
    return g.includes('aided') || n.includes('ಅನುದಾನಿತ');
  }).length;

  // Date formatting in Kannada
  const currentDateStr = now.toLocaleDateString('kn-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. WELCOME BANNER – Modern Enterprise Karnataka Govt Identity */}
      <div className="bg-gradient-to-r from-[#06152d] via-[#0d274d] to-[#153a6b] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#1b3e70] text-white relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-400 text-[#06152d] shadow-xs">
                ARYA-PUNITH
              </span>
              <span className="text-xs text-sky-200/90 font-medium font-kannada">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-amber-300 font-mono font-medium">
                {currentDateStr}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-kannada tracking-tight leading-tight text-white drop-shadow-xs">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ, ಭದ್ರಾವತಿ
            </h1>

            <p className="text-xs sm:text-sm text-slate-200/95 font-kannada leading-relaxed">
              ಸ್ವಾಗತ <span className="font-bold text-amber-300">{currentUser?.displayName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)'}</span>. ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕಿನ ಅಧಿಕೃತ ಪತ್ರ ರಚನೆ, ಕಡತಗಳ ನಿರ್ವಹಣೆ, ಜ್ಞಾಪನಾ ಆದೇಶಗಳು ಹಾಗೂ ವರದಿಗಳ ಇ-ಆಡಳಿತ ಪೋರ್ಟಲ್.
            </p>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              id="banner-create-letter-btn"
              onClick={() => onNavigate('generalLetter')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-kannada text-xs shadow-md shadow-blue-900/40 border border-blue-400/40 transition-all hover:scale-102 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>ಹೊಸ ಪತ್ರ ರಚಿಸಿ</span>
            </button>

            <button
              type="button"
              id="banner-create-file-btn"
              onClick={() => setIsCreateOtherFileOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-stone-100 font-bold font-kannada text-xs shadow-sm border border-slate-600/60 transition-all hover:scale-102 cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-amber-400" />
              <span>ಹೊಸ ಕಡತ</span>
            </button>

            <button
              type="button"
              id="banner-inward-dak-btn"
              onClick={() => onNavigate('registry')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-stone-100 font-bold font-kannada text-xs shadow-sm border border-slate-600/60 transition-all hover:scale-102 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-sky-400" />
              <span>ಆವಕ / ಜಾವಕ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION FILTER SWITCHER – Clean Segmented Control */}
      <div className="bg-white rounded-xl p-2.5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700 font-kannada shrink-0">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>ಶಾಖಾವಾರು ವಿವರಣೆ:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {sections.map(sec => {
            const isSelected = selectedSectionCode === sec.code;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSelectedSectionCode(sec.code);
                  onSelectSection(sec);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-kannada transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caseworker action centre: counts are derived only from current docket records. */}
      <section aria-label="ತುರ್ತು ಕೆಲಸಗಳು" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-kannada">ಇಂದಿನ ಕೆಲಸಗಳು · Caseworker Workspace</h2>
            <p className="text-xs text-slate-600 font-kannada">ಆಯ್ದ ವಿಭಾಗದ ನಿಜವಾದ ಕಡತಗಳ ಆಧಾರದ ಮೇಲೆ — ಅನುಮೋದನೆ ಹಂತವಿಲ್ಲ</p>
          </div>
          <button type="button" onClick={() => onNavigate('reports')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">ವರದಿಗಳು ತೆರೆಯಿರಿ</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onClick={() => onNavigate('files', { status: 'overdue' })} className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-left hover:border-rose-400">
            <span className="block text-sm font-semibold text-rose-900">ಗಡುವು ಮೀರಿದ ಕಡತಗಳು</span>
            <span className="block mt-2 text-3xl font-bold tabular-nums text-rose-800">{overdueFiles.length}</span>
            <span className="block text-xs text-rose-700">ಕಡತಗಳನ್ನು ಪರಿಶೀಲಿಸಿ</span>
          </button>
          <button type="button" onClick={() => onNavigate('files')} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left hover:border-amber-400">
            <span className="block text-sm font-semibold text-amber-900">48 ಗಂಟೆಯೊಳಗೆ ಗಡುವು</span>
            <span className="block mt-2 text-3xl font-bold tabular-nums text-amber-800">{dueSoonFiles.length}</span>
            <span className="block text-xs text-amber-700">ಬಾಕಿ ಕಡತಗಳನ್ನು ತೆರೆಯಿರಿ</span>
          </button>
          <button type="button" onClick={() => onNavigate('generalLetter')} className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-left hover:border-sky-400">
            <span className="block text-sm font-semibold text-sky-900">ಪತ್ರ ತಯಾರಿ</span>
            <span className="block mt-2 text-xl font-bold text-sky-800">ಹೊಸ ಪತ್ರ +</span>
            <span className="block text-xs text-sky-700">ಕಡತದಲ್ಲಿ ಪತ್ರ ರಚಿಸಿ</span>
          </button>
        </div>
      </section>

      {/* 3. REAL DATABASE STATISTICS GRID – Clean Enterprise Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Files */}
        <div 
          onClick={() => onNavigate('files')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 font-kannada">ಒಟ್ಟು ಕಡತಗಳು (Total Files)</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalFilesCount}
            </span>
            <span className="text-xs text-slate-500 font-kannada">ಕಡತಗಳು</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-kannada">
            <span>ಚಾಲ್ತಿ: <strong className="text-blue-700 font-mono font-bold">{pendingFilesCount}</strong></span>
            <span>ವಿಲೇವಾರಿ: <strong className="text-emerald-700 font-mono font-bold">{completedFilesCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Letters */}
        <div 
          onClick={() => onNavigate('registry')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 font-kannada">ಒಟ್ಟು ಪತ್ರಗಳು (Total Letters)</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalLettersCount}
            </span>
            <span className="text-xs text-slate-500 font-kannada">ಪತ್ರಗಳು</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-kannada">
            <span>ಆವಕ (In): <strong className="text-sky-700 font-mono font-bold">{inwardLettersCount}</strong></span>
            <span>ಜಾವಕ (Out): <strong className="text-purple-700 font-mono font-bold">{outwardLettersCount}</strong></span>
          </div>
        </div>

        {/* Card 3: Pending & Completed Files */}
        <div 
          onClick={() => onNavigate('files')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 font-kannada">ವಿಲೇವಾರಿ ಪ್ರಗತಿ (File Progress)</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {completedFilesCount}
            </span>
            <span className="text-xs text-slate-500 font-kannada">/ {totalFilesCount} ಮುಕ್ತಾಯ</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-kannada">
            <span>ಬಾಕಿ: <strong className="text-amber-700 font-mono font-bold">{pendingFilesCount}</strong></span>
            <span>ಪೂರ್ಣ: <strong className="text-emerald-700 font-mono font-bold">{totalFilesCount > 0 ? Math.round((completedFilesCount / totalFilesCount) * 100) : 100}%</strong></span>
          </div>
        </div>

        {/* Card 4: SLA Status */}
        <div 
          onClick={() => onNavigate('files', { status: 'overdue' })}
          className={`bg-white rounded-xl p-5 shadow-xs border transition-all cursor-pointer group ${
            overdueFiles.length > 0 ? 'border-rose-300 hover:border-rose-500' : 'border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 font-kannada">SLA ಗಡುವು ಸ್ಥಿತಿ (SLA Status)</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
              overdueFiles.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
              overdueFiles.length > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {overdueFiles.length}
            </span>
            <span className="text-xs text-slate-500 font-kannada">ಗಡುವು ಮೀರಿದವು</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-kannada">
            <span>48 ಗಂಟೆಯೊಳಗೆ: <strong className="text-amber-600 font-mono font-bold">{dueSoonFiles.length}</strong></span>
            <span>ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ: <strong className="text-emerald-700 font-mono font-bold">{slaComplianceRate === null ? '—' : `${slaComplianceRate}%`}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY STATS: EMPLOYEES & SCHOOLS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employee Statistics Card */}
        <div 
          onClick={() => onNavigate('employees')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-kannada">ನೌಕರರ ಅಂಕಿ-ಅಂಶ (Employee Master)</h3>
                <p className="text-[11px] text-slate-500 font-sans">Department Human Resources & Roster</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-slate-900 tabular-nums">{totalEmployeesCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಒಟ್ಟು ನೌಕರರು</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-blue-700 tabular-nums">{teachingStaffCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಬೋಧಕ ಸಿಬ್ಬಂದಿ</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-indigo-700 tabular-nums">{nonTeachingStaffCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಬೋಧಕೇತರ ಸಿಬ್ಬಂದಿ</span>
            </div>
          </div>
        </div>

        {/* School Statistics Card */}
        <div 
          onClick={() => onNavigate('schools')}
          className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-kannada">ಶಾಲೆಗಳ ಅಂಕಿ-ಅಂಶ (Schools Statistics)</h3>
                <p className="text-[11px] text-slate-500 font-sans">Bhadravathi Taluk Educational Institutions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-slate-900 tabular-nums">{totalSchoolsCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಒಟ್ಟು ಶಾಲೆಗಳು</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-emerald-700 tabular-nums">{govtSchoolsCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಸರ್ಕಾರಿ ಶಾಲೆಗಳು</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="block text-xl font-bold font-mono text-amber-700 tabular-nums">{aidedSchoolsCount}</span>
              <span className="block text-[11px] font-kannada text-slate-600 mt-0.5">ಅನುದಾನಿತ ಶಾಲೆಗಳು</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT NOTIFICATIONS & SLA OVERDUE ALERTS */}
      {(overdueFiles.length > 0 || dueSoonFiles.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-bold text-amber-950 font-kannada">
                ಗಮನಿಸಿ: ತುರ್ತು ವಿಲೇವಾರಿ ಅಗತ್ಯವಿರುವ ಕಡತಗಳ ವಿವರಣೆ (Action Required)
              </h4>
              <p className="text-xs text-amber-900/90 font-kannada">
                {overdueFiles.length > 0 && (
                  <span>
                    <strong className="text-rose-700 font-bold">{overdueFiles.length}</strong> ಕಡತಗಳ ಗಡುವು ಮೀರಿದೆ. 
                  </span>
                )}
                {dueSoonFiles.length > 0 && (
                  <span>
                    {' '}<strong className="text-amber-700 font-bold">{dueSoonFiles.length}</strong> ಕಡತಗಳ ಗಡುವು ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಮುಕ್ತಾಯವಾಗಲಿದೆ.
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('files', { status: 'overdue' })}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline font-kannada cursor-pointer"
                >
                  ಗಡುವು ಮೀರಿದ ಕಡತಗಳ ವೀಕ್ಷಣೆ →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. QUICK ACCESS MODULES GRID – Core Functionalities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-kannada">ತ್ವರಿತ ಪ್ರವೇಶ ವಿಭಾಗಗಳು (Quick Access Modules)</h2>
            <p className="text-xs text-slate-500 font-sans">Direct access to primary administrative and letter preparation tools</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Module 1: Letter Creation */}
          <div
            onClick={() => onNavigate('generalLetter')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              1. ಪತ್ರ ತಯಾರಿ
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              ಅಧಿಕೃತ ಪತ್ರಗಳು, ನೋಟಿಸ್, ಆದೇಶ ಹಾಗೂ ಡಾಕೆಟ್ ಲಿಂಕ್
            </p>
          </div>

          {/* Module 2: File Management */}
          <div
            onClick={() => onNavigate('files')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              2. ಕಡತ ನಿರ್ವಹಣೆ
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              ಮಾಸ್ಟರ್ ಕಡತಗಳು, ಟಿಪ್ಪಣಿ ಹಾಳೆ & PDF ಲಗತ್ತು
            </p>
          </div>

          {/* Module 3: Office Orders & GPF */}
          <div
            onClick={() => onNavigate('memorandum')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              3. ಕಛೇರಿ ಆದೇಶ & GPF
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              GPF ಮುಂಗಡ, ಭಾಗಶಃ ಹಿಂಪಡೆಯುವಿಕೆ & ಬಡ್ತಿ ಜ್ಞಾಪನಗಳು
            </p>
          </div>

          {/* Module 4: Pension Proposal */}
          <div
            onClick={() => onNavigate('pension')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              4. ಪಿಂಚಣಿ ಪ್ರಸ್ತಾವನೆ
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              19 ಕಡ್ಡಾಯ ಪರಿಶೀಲನಾ ದಾಖಲೆಗಳ ಡಾಸಿಯರ್ & ಪತ್ರಗಳು
            </p>
          </div>

          {/* Module 5: Reports & Statistics */}
          <div
            onClick={() => onNavigate('reports')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              5. ವರದಿಗಳು (Reports)
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              ದೈನಂದಿನ, ಮಾಸಿಕ & SLA ಕಡತ ವರದಿಗಳ ಮುದ್ರಣ/Excel
            </p>
          </div>

          {/* Module 6: RTI Management */}
          <div
            onClick={() => onNavigate('rti')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              6. ಮಾಹಿತಿ ಹಕ್ಕು (RTI)
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              RTI ಪ್ರಕರಣಗಳು, 30 ದಿನಗಳ ಗಡುವು & ಉತ್ತರ ಪತ್ರಗಳು
            </p>
          </div>

          {/* Module 7: Circulars Studio */}
          <div
            onClick={() => onNavigate('circularStudio')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              7. ಸುತ್ತೋಲೆ ತಯಾರಿ
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              ತಾಲ್ಲೂಕು ಮಟ್ಟದ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಅಧಿಕೃತ ಸುತ್ತೋಲೆ
            </p>
          </div>

          {/* Module 8: Statutory Books */}
          <div
            onClick={() => onNavigate('statutoryBooks')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-kannada group-hover:text-blue-600 transition-colors">
              8. ನಿಯಮ ಪುಸ್ತಕಗಳು
            </h3>
            <p className="text-[11px] text-slate-500 font-kannada mt-1 line-clamp-2">
              KCSR, KFC, CCA & ಶಿಕ್ಷಣ ಕಾಯ್ದೆ ಡಿಜಿಟಲ್ ಲೈಬ್ರರಿ
            </p>
          </div>
        </div>
      </div>

      {/* 7. RECENT ACTIVITIES & TRACKING SECTION */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-kannada">ಇತ್ತೀಚಿನ ಕಡತ ಹಾಗೂ ಪತ್ರ ವ್ಯವಹಾರ (Recent Activities)</h3>
            <p className="text-xs text-slate-500 font-sans">Live registry updates from office database</p>
          </div>

          {/* Tabs: Letters vs Files */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActivityTab('letters')}
              className={`px-3 py-1 text-xs font-semibold font-kannada rounded-md transition-colors cursor-pointer ${
                activityTab === 'letters' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ಪತ್ರಗಳು ({totalLettersCount})
            </button>
            <button
              type="button"
              onClick={() => setActivityTab('files')}
              className={`px-3 py-1 text-xs font-semibold font-kannada rounded-md transition-colors cursor-pointer ${
                activityTab === 'files' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ಕಡತಗಳು ({totalFilesCount})
            </button>
          </div>
        </div>

        {/* Tab 1: Recent Letters */}
        {activityTab === 'letters' && (
          <div className="space-y-2">
            {sectionFilteredLetters.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-kannada">
                ಯಾವುದೇ ಪತ್ರಗಳು ದಾಖಲಾಗಿಲ್ಲ. "ಹೊಸ ಪತ್ರ ರಚಿಸಿ" ಬಟನ್ ಬಳಸಿ ಮೊದಲ ಪತ್ರವನ್ನು ದಾಖಲಿಸಿ.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sectionFilteredLetters.slice(0, 6).map(letter => (
                  <div
                    key={letter.id}
                    onClick={() => onOpenLetter ? onOpenLetter(letter) : onNavigate('registry')}
                    className="py-2.5 px-2 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        (letter.direction || '').toLowerCase() === 'inward' 
                          ? 'bg-sky-50 text-sky-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {(letter.direction || '').toLowerCase() === 'inward' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{letter.letterNumber}</span>
                          <span className="text-[11px] text-slate-500">·</span>
                          <span className="text-[11px] text-slate-500 font-sans">{letter.dateReceivedOrIssued || letter.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-kannada font-medium truncate max-w-md sm:max-w-xl group-hover:text-blue-600 transition-colors">
                          {letter.subject}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium hidden sm:inline-block">
                        {letter.status || 'Active'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recent Files */}
        {activityTab === 'files' && (
          <div className="space-y-2">
            {sectionFilteredFiles.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-kannada">
                ಯಾವುದೇ ಕಡತಗಳು ದಾಖಲಾಗಿಲ್ಲ.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sectionFilteredFiles.slice(0, 6).map(file => (
                  <div
                    key={file.id}
                    onClick={() => onOpenDocket ? onOpenDocket(file) : onNavigate('files', { fileId: file.id })}
                    className="py-2.5 px-2 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                        <FolderGit2 className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{file.fileNumber}</span>
                          <span className="text-[11px] text-slate-500">·</span>
                          <span className="text-[11px] text-slate-500 font-kannada">{file.sectionName || file.sectionCode || 'ಆ2'}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-kannada font-medium truncate max-w-md sm:max-w-xl group-hover:text-blue-600 transition-colors">
                          {file.subject}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {file.dueDate && (
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                          ಗಡುವು: {file.dueDate}
                        </span>
                      )}
                      <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full font-medium ${
                        file.status === 'disposed' || file.status === 'Disposed / Closed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {file.status || 'In Progress'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE FILE MODAL (Preserved working modal) */}
      <CreateOtherFileModal
        isOpen={isCreateOtherFileOpen}
        onClose={() => setIsCreateOtherFileOpen(false)}
        onCreateFile={async (data) => {
          if (onCreateFile) await onCreateFile(data);
          setIsCreateOtherFileOpen(false);
          if (showToast) showToast('ಹೊಸ ಕಡತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಲಾಗಿದೆ.');
        }}
        sections={sections}
        onShowToast={showToast}
      />
    </div>
  );
};
