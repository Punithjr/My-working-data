import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  Flame,
  FolderGit2,
  FileText,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Send,
  Building2,
  Sparkles,
  User,
  BadgeAlert,
  Tag
} from 'lucide-react';
import {
  MasterDocketFile,
  EducationLetter,
  OfficeSection,
  AppNavTab,
  LetterPriority
} from '../types';

export interface PendingTasksOverviewCardProps {
  files: MasterDocketFile[];
  letters: EducationLetter[];
  sections?: OfficeSection[];
  onNavigate: (tab: AppNavTab, extra?: any) => void;
  onOpenLetter?: (letter: EducationLetter) => void;
  onOpenDocket?: (file: MasterDocketFile) => void;
}

export interface AggregatedPendingTask {
  id: string;
  uniqueKey: string;
  type: 'docket' | 'letter';
  title: string;
  referenceNumber: string;
  sectionCode: string;
  sectionName: string;
  priority: LetterPriority;
  status: string;
  dueDate?: string;
  daysRemaining: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  isImmediatePriority: boolean;
  urgencyLevel: 'immediate' | 'urgent' | 'due-soon' | 'routine';
  urgencyScore: number;
  custodianOrAssignee: string;
  category?: string;
  inwardOrOutward?: 'inward' | 'outward';
  docketItem?: MasterDocketFile;
  letterItem?: EducationLetter;
}

export const PendingTasksOverviewCard: React.FC<PendingTasksOverviewCardProps> = ({
  files,
  letters,
  sections = [],
  onNavigate,
  onOpenLetter,
  onOpenDocket
}) => {
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'docket' | 'letter'>('all');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<'all' | 'immediate' | 'urgent' | 'due-soon'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Aggregation of all pending letters and dockets from every section
  const aggregatedTasks: AggregatedPendingTask[] = useMemo(() => {
    const list: AggregatedPendingTask[] = [];

    // 1. Process Master Docket Files
    files.forEach((file) => {
      // Exclude disposed / closed / withdrawn files
      const normalizedStatus = (file.status || '').toLowerCase();
      if (normalizedStatus.includes('disposed') || normalizedStatus.includes('closed') || normalizedStatus.includes('withdrawn')) {
        return;
      }

      let daysRemaining: number | null = null;
      let isOverdue = false;
      let isDueSoon = false;

      if (file.dueDate) {
        const due = new Date(file.dueDate);
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0);
          const diffMs = due.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) {
            isOverdue = true;
          } else if (daysRemaining <= 3) {
            isDueSoon = true;
          }
        }
      }

      const isImmediatePriority = file.priority === 'Immediate';
      const isUrgentPriority = file.priority === 'Urgent';

      // Urgency score calculation
      let urgencyScore = 0;
      let urgencyLevel: 'immediate' | 'urgent' | 'due-soon' | 'routine' = 'routine';

      if (isOverdue) {
        urgencyScore = 1000 + Math.abs(daysRemaining || 0) * 10;
        urgencyLevel = 'immediate';
      } else if (isImmediatePriority) {
        urgencyScore = 800;
        urgencyLevel = 'immediate';
      } else if (daysRemaining === 0) {
        urgencyScore = 750;
        urgencyLevel = 'immediate';
      } else if (daysRemaining !== null && daysRemaining <= 1) {
        urgencyScore = 650;
        urgencyLevel = 'urgent';
      } else if (isUrgentPriority) {
        urgencyScore = 600;
        urgencyLevel = 'urgent';
      } else if (isDueSoon) {
        urgencyScore = 400;
        urgencyLevel = 'due-soon';
      } else {
        urgencyScore = 150;
      }

      // Filter in only tasks that have urgency or pending SLA or active action needed
      // (Overdue, Due Soon, Immediate, Urgent, or Under Scrutiny/Review/Active)
      list.push({
        id: file.id,
        uniqueKey: `docket-${file.id}`,
        type: 'docket',
        title: file.subject || 'ವಿಷಯ ನಮೂದಿಸಿಲ್ಲ (No Subject)',
        referenceNumber: `ಕಡತ ಸಂಖ್ಯೆ: ${file.fileNumber}`,
        sectionCode: file.sectionCode || 'ಆ2',
        sectionName: file.sectionName || (file.section as string) || 'ಸ.ಪ್ರಾ.ಶಿ',
        priority: file.priority || 'Routine',
        status: file.status || 'Active / Open',
        dueDate: file.dueDate,
        daysRemaining,
        isOverdue,
        isDueSoon,
        isImmediatePriority,
        urgencyLevel,
        urgencyScore,
        custodianOrAssignee: file.currentCustodian || 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು',
        category: typeof file.fileCategory === 'string' ? file.fileCategory : undefined,
        docketItem: file
      });
    });

    // 2. Process Education Letters
    letters.forEach((letter) => {
      // Exclude completed, dispatched, or closed letters
      if (letter.status === 'Closed & Archived' || letter.status === 'Dispatched') {
        return;
      }

      let daysRemaining: number | null = null;
      let isOverdue = false;
      let isDueSoon = false;

      if (letter.dueDate) {
        const due = new Date(letter.dueDate);
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0);
          const diffMs = due.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) {
            isOverdue = true;
          } else if (daysRemaining <= 3) {
            isDueSoon = true;
          }
        }
      }

      const isImmediatePriority = letter.priority === 'Immediate';
      const isUrgentPriority = letter.priority === 'Urgent';

      let urgencyScore = 0;
      let urgencyLevel: 'immediate' | 'urgent' | 'due-soon' | 'routine' = 'routine';

      if (isOverdue) {
        urgencyScore = 1000 + Math.abs(daysRemaining || 0) * 10;
        urgencyLevel = 'immediate';
      } else if (isImmediatePriority) {
        urgencyScore = 800;
        urgencyLevel = 'immediate';
      } else if (daysRemaining === 0) {
        urgencyScore = 750;
        urgencyLevel = 'immediate';
      } else if (daysRemaining !== null && daysRemaining <= 1) {
        urgencyScore = 650;
        urgencyLevel = 'urgent';
      } else if (isUrgentPriority) {
        urgencyScore = 600;
        urgencyLevel = 'urgent';
      } else if (isDueSoon) {
        urgencyScore = 400;
        urgencyLevel = 'due-soon';
      } else {
        urgencyScore = 120;
      }

      list.push({
        id: letter.id,
        uniqueKey: `letter-${letter.id}`,
        type: 'letter',
        title: letter.subject || 'ವಿಷಯ ನಮೂದಿಸಿಲ್ಲ (No Subject)',
        referenceNumber: letter.referenceNumber || letter.fileLetterNumber || letter.inwardNumber || `ಪತ್ರ: ${letter.id}`,
        sectionCode: letter.sectionCode || 'ಆ2',
        sectionName: letter.sectionName || (letter.section as string) || 'ಸ.ಪ್ರಾ.ಶಿ',
        priority: letter.priority || 'Routine',
        status: letter.status || 'Pending Action',
        dueDate: letter.dueDate,
        daysRemaining,
        isOverdue,
        isDueSoon,
        isImmediatePriority,
        urgencyLevel,
        urgencyScore,
        custodianOrAssignee: letter.assignedOfficer || letter.recipientName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು',
        category: letter.category,
        inwardOrOutward: letter.direction,
        letterItem: letter
      });
    });

    // Sort: items needing Immediate Attention always at the top, then by urgency score descending
    return list.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [files, letters, today]);

  // Aggregate KPI summary counts
  const stats = useMemo(() => {
    const immediateCount = aggregatedTasks.filter((t) => t.urgencyLevel === 'immediate').length;
    const urgentCount = aggregatedTasks.filter((t) => t.urgencyLevel === 'urgent').length;
    const dueSoonCount = aggregatedTasks.filter((t) => t.urgencyLevel === 'due-soon').length;
    const docketsCount = aggregatedTasks.filter((t) => t.type === 'docket').length;
    const lettersCount = aggregatedTasks.filter((t) => t.type === 'letter').length;
    const totalCount = aggregatedTasks.length;

    // Distinct sections from the aggregated tasks
    const sectionSet = new Set<string>();
    aggregatedTasks.forEach((t) => {
      if (t.sectionCode) sectionSet.add(t.sectionCode);
    });

    return {
      immediateCount,
      urgentCount,
      dueSoonCount,
      docketsCount,
      lettersCount,
      totalCount,
      sections: Array.from(sectionSet)
    };
  }, [aggregatedTasks]);

  // Filtered tasks based on section, type, urgency level, and search text
  const filteredTasks = useMemo(() => {
    return aggregatedTasks.filter((task) => {
      // 1. Section filter
      if (selectedSectionFilter !== 'all' && task.sectionCode !== selectedSectionFilter) {
        return false;
      }

      // 2. Type filter
      if (selectedTypeFilter !== 'all' && task.type !== selectedTypeFilter) {
        return false;
      }

      // 3. Urgency filter
      if (selectedUrgencyFilter !== 'all' && task.urgencyLevel !== selectedUrgencyFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesRef = task.referenceNumber.toLowerCase().includes(q);
        const matchesSec = task.sectionCode.toLowerCase().includes(q) || task.sectionName.toLowerCase().includes(q);
        const matchesAssignee = task.custodianOrAssignee.toLowerCase().includes(q);
        if (!matchesTitle && !matchesRef && !matchesSec && !matchesAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [aggregatedTasks, selectedSectionFilter, selectedTypeFilter, selectedUrgencyFilter, searchQuery]);

  return (
    <div
      id="pending-tasks-overview-card"
      className="bg-white rounded-2xl border-2 border-stone-850 shadow-md overflow-hidden font-sans transition-all"
    >
      {/* 1. Header Bar with Warning Indicators */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 border-b-2 border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-sm shrink-0">
            <Flame className="w-5 h-5 text-stone-950 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-650 bg-rose-600 text-white shadow-2xs">
                SLA & PRIORITY MONITOR
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-stone-800/80 px-2 py-0.5 rounded border border-amber-400/30">
                ಎಲ್ಲಾ ಶಾಖೆಗಳ ಸಮಗ್ರ ಪಟ್ಟಿ (All Sections Aggregated)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-amber-100 tracking-tight font-kannada mt-0.5">
              ಬಾಕಿ ಇರುವ ತುರ್ತು ಕಾರ್ಯಗಳ ಅವಲೋಕನ (Pending Tasks & Urgent Actions)
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-300 font-kannada">
              ಆ1, ಆ2, ಆ3, ಆ4 ಹಾಗೂ ಆಡಳಿತ ಶಾಖೆಯ ಗಡುವು ಮೀರಿದ, ಶೀಘ್ರ ವಿಲೇವಾರಿ ಮಾಡಬೇಕಾದ ಕಡತಗಳು ಮತ್ತು ಪತ್ರಗಳು
            </p>
          </div>
        </div>

        {/* Top Quick Actions & Global Jump */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('fileDashboard')}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold font-kannada border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>ಕಡತಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('registry')}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold font-kannada border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-stone-300" />
            <span>ತಪಾಲ ರಿಜಿಸ್ಟರ್</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Metric Pills & Filter Badges */}
      <div className="p-4 sm:p-5 bg-stone-50/60 border-b border-stone-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Tile 1: Immediate Attention */}
          <button
            type="button"
            onClick={() => {
              setSelectedUrgencyFilter(selectedUrgencyFilter === 'immediate' ? 'all' : 'immediate');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedUrgencyFilter === 'immediate'
                ? 'bg-rose-100/90 border-rose-500 shadow-sm ring-2 ring-rose-400'
                : 'bg-white border-stone-200 hover:border-rose-300 hover:bg-rose-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900 font-kannada">ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-rose-700 font-mono">{stats.immediateCount}</span>
              <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Immediate</span>
            </div>
          </button>

          {/* Tile 2: Urgent Priority */}
          <button
            type="button"
            onClick={() => {
              setSelectedUrgencyFilter(selectedUrgencyFilter === 'urgent' ? 'all' : 'urgent');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedUrgencyFilter === 'urgent'
                ? 'bg-amber-100/90 border-amber-500 shadow-sm ring-2 ring-amber-400'
                : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 font-kannada">ಅತ್ಯಂತ ತುರ್ತು</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-700 font-mono">{stats.urgentCount}</span>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Urgent</span>
            </div>
          </button>

          {/* Tile 3: Due Soon */}
          <button
            type="button"
            onClick={() => {
              setSelectedUrgencyFilter(selectedUrgencyFilter === 'due-soon' ? 'all' : 'due-soon');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedUrgencyFilter === 'due-soon'
                ? 'bg-blue-100/90 border-blue-500 shadow-sm ring-2 ring-blue-400'
                : 'bg-white border-stone-200 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 font-kannada">ಶೀಘ್ರ ಗಡುವು (&le;3d)</span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-blue-700 font-mono">{stats.dueSoonCount}</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Due Soon</span>
            </div>
          </button>

          {/* Tile 4: Dockets Total */}
          <button
            type="button"
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'docket' ? 'all' : 'docket');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedTypeFilter === 'docket'
                ? 'bg-stone-200 border-stone-700 shadow-sm ring-2 ring-stone-500'
                : 'bg-white border-stone-200 hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-700 font-kannada">ಬಾಕಿ ಕಡತಗಳು</span>
              <FolderGit2 className="w-3.5 h-3.5 text-stone-600" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-stone-800 font-mono">{stats.docketsCount}</span>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Dockets</span>
            </div>
          </button>

          {/* Tile 5: Letters Total */}
          <button
            type="button"
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'letter' ? 'all' : 'letter');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1 ${
              selectedTypeFilter === 'letter'
                ? 'bg-purple-100/90 border-purple-500 shadow-sm ring-2 ring-purple-400'
                : 'bg-white border-stone-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 font-kannada">ಬಾಕಿ ಪತ್ರಗಳು</span>
              <FileText className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black text-purple-800 font-mono">{stats.lettersCount}</span>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Letters</span>
            </div>
          </button>
        </div>

        {/* 3. Section Filter Tabs & Real-time Search Toolbar */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-600 font-kannada mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <span>ಶಾಖೆ:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedSectionFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-kannada ${
                selectedSectionFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              ಎಲ್ಲಾ ಶಾಖೆಗಳು ({aggregatedTasks.length})
            </button>

            {/* Standard Karnataka Education Sections */}
            {[
              { code: 'ಆ1', label: 'ಆ1 (ಅನುದಾನ & ಲೆಕ್ಕ)' },
              { code: 'ಆ2', label: 'ಆ2 (ಸ.ಪ್ರಾ.ಶಿ)' },
              { code: 'ಆ3', label: 'ಆ3 (ಪ್ರೌಢ ಶಿಕ್ಷಣ)' },
              { code: 'ಆ4', label: 'ಆ4 (RTI & ಪಿಂಚಣಿ)' },
              { code: 'ಆಡಳಿತ', label: 'ಆಡಳಿತ ಶಾಖೆ' }
            ].map((sec) => {
              const secCount = aggregatedTasks.filter((t) => t.sectionCode === sec.code).length;
              return (
                <button
                  key={sec.code}
                  type="button"
                  onClick={() => setSelectedSectionFilter(sec.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-kannada flex items-center gap-1 ${
                    selectedSectionFilter === sec.code
                      ? 'bg-amber-500 text-stone-950 border border-amber-600 shadow-2xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{sec.label}</span>
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-stone-100 text-stone-700">
                    {secCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ವಿಷಯ, ಕಡತ ಸಂ, ಪತ್ರ ಅಥವಾ ಅಧಿಕಾರಿ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-kannada"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Aggregated Tasks List View */}
      <div className="p-4 sm:p-5 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-stone-50 border border-dashed border-stone-300 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 font-kannada">
              ಯಾವುದೇ ತುರ್ತು ಅಥವಾ ಬಾಕಿ ಕಾರ್ಯಗಳಿಲ್ಲ! (No Urgent Pending Tasks)
            </h4>
            <p className="text-xs text-stone-500 font-kannada max-w-md mx-auto">
              ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಎಲ್ಲಾ ಕಡತಗಳು ಹಾಗೂ ಪತ್ರಗಳು ನಿಗದಿತ ಸಮಯಕ್ಕೆ ವಿಲೇವಾರಿಯಾಗಿವೆ ಅಥವಾ ಕ್ರಮವಹಿಸಲಾಗಿದೆ.
            </p>
            {(selectedSectionFilter !== 'all' || selectedUrgencyFilter !== 'all' || selectedTypeFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionFilter('all');
                  setSelectedTypeFilter('all');
                  setSelectedUrgencyFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 bg-stone-900 text-amber-300 rounded-lg text-xs font-bold font-kannada cursor-pointer hover:bg-stone-800"
              >
                ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ (Reset Filters)
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500 font-kannada px-1">
              <span>
                ತೋರಿಸಲಾಗುತ್ತಿರುವ ತುರ್ತು ಕಾರ್ಯಗಳು: <strong>{filteredTasks.length}</strong> (ಒಟ್ಟು: {aggregatedTasks.length})
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                Sorted by SLA Urgency
              </span>
            </div>

            {filteredTasks.map((task, index) => {
              const isExpanded = expandedTaskId === task.uniqueKey;
              const isImmediate = task.urgencyLevel === 'immediate';
              const isUrgent = task.urgencyLevel === 'urgent';

              return (
                <div
                  key={task.uniqueKey}
                  className={`rounded-xl border-2 transition-all overflow-hidden ${
                    isImmediate
                      ? 'border-rose-400 bg-rose-50/40 hover:border-rose-500 shadow-2xs'
                      : isUrgent
                      ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left Details Block */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Badges & Section Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Type Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono uppercase ${
                            task.type === 'docket'
                              ? 'bg-stone-800 text-amber-300'
                              : 'bg-purple-800 text-purple-100'
                          }`}
                        >
                          {task.type === 'docket' ? (
                            <>
                              <FolderGit2 className="w-3 h-3 text-amber-300" />
                              <span>DOCKET</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 text-purple-200" />
                              <span>LETTER ({task.inwardOrOutward || 'DAK'})</span>
                            </>
                          )}
                        </span>

                        {/* Immediate Attention Flag */}
                        {isImmediate && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            <span>🚨 ತಕ್ಷಣದ ಗಮನ (IMMEDIATE)</span>
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Immediate'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : task.priority === 'Urgent'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {task.priority === 'Immediate'
                            ? 'ತುರ್ತು (Immediate)'
                            : task.priority === 'Urgent'
                            ? 'ಶೀಘ್ರ (Urgent)'
                            : 'ಸಾಮಾನ್ಯ (Routine)'}
                        </span>

                        {/* Section Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-sky-700" />
                          <span>ಶಾಖೆ: {task.sectionCode} ({task.sectionName})</span>
                        </span>

                        {/* Status Tag */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {task.status}
                        </span>
                      </div>

                      {/* Title & Subject */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-kannada leading-snug line-clamp-2 hover:line-clamp-none">
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-600">
                          <span className="font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                            {task.referenceNumber}
                          </span>
                          <span className="text-stone-400">•</span>
                          <span className="flex items-center gap-1 text-stone-600">
                            <User className="w-3 h-3 text-stone-400" />
                            <span>ನಿರ್ವಾಹಕರು: {task.custodianOrAssignee}</span>
                          </span>
                          {task.category && (
                            <>
                              <span className="text-stone-400">•</span>
                              <span className="text-stone-500 truncate max-w-xs">{task.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right SLA Timeline & Action Buttons Block */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                      {/* SLA Due Badge */}
                      <div className="text-left md:text-right">
                        {task.isOverdue ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            <span>ಗಡುವು ಮೀರಿದೆ: {Math.abs(task.daysRemaining || 0)} ದಿನಗಳು ವಿಳಂಬ</span>
                          </div>
                        ) : task.daysRemaining === 0 ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>ಇಂದೇ ಅಂತಿಮ ದಿನಾಂಕ (Due Today)</span>
                          </div>
                        ) : task.isDueSoon ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{task.daysRemaining} ದಿನಗಳು ಬಾಕಿ</span>
                          </div>
                        ) : task.dueDate ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>ಗಡುವು: {task.dueDate}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-mono">No SLA date</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {task.type === 'docket' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenDocket && task.docketItem) {
                                  onOpenDocket(task.docketItem);
                                } else {
                                  onNavigate('files', { fileId: task.id });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold font-kannada cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="ಕಡತ ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ"
                            >
                              <span>ಕಡತ ಪರಿಶೀಲಿಸಿ</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onNavigate('generalLetter', {
                                  prefillFileNumber: task.docketItem?.fileNumber || task.id,
                                  prefillSectionCode: task.sectionCode,
                                  prefillSectionName: task.sectionName,
                                  prefillSubject: `ಕಡತ ಸಂಖ್ಯೆ: ${task.docketItem?.fileNumber || ''} - ${task.title}`
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold font-kannada border border-stone-300 cursor-pointer flex items-center gap-1"
                              title="ಈ ಕಡತಕ್ಕೆ ಪತ್ರ / ಟಿಪ್ಪಣಿ ಸೃಜಿಸಿ"
                            >
                              <Send className="w-3 h-3 text-stone-500" />
                              <span>ಪತ್ರ ಸೃಜಿಸಿ</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenLetter && task.letterItem) {
                                  onOpenLetter(task.letterItem);
                                } else {
                                  onNavigate('registry');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold font-kannada cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="ಪತ್ರ ವಿವರ ವೀಕ್ಷಿಸಿ"
                            >
                              <span>ಪತ್ರ ವೀಕ್ಷಿಸಿ</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onNavigate('drafter', {
                                  prefillLetter: task.letterItem
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-bold font-kannada border border-amber-500 cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="ಉತ್ತರ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ"
                            >
                              <Sparkles className="w-3 h-3 text-stone-900" />
                              <span>ಉತ್ತರ ಕರಡು</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer Summary Bar */}
      <div className="bg-stone-50 p-3.5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600 font-kannada">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಾ ಶಾಖೆಗಳ (Sections ಆ1/ಆ2/ಆ3/ಆ4) ಕಡತ ಹಾಗೂ ತಪಾಲ SLA ಪರಿಶೀಲಿಸಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="text-amber-800 hover:text-amber-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ಸಂಪೂರ್ಣ ವರದಿ & ಆಡಿಟ್ ವೀಕ್ಷಿಸಿ (Audit Reports)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
