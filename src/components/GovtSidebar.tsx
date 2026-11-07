import React from 'react';
import { 
  Building2, 
  Inbox, 
  FolderGit2, 
  Send, 
  Users, 
  School, 
  FileText, 
  Award, 
  Megaphone, 
  ShieldAlert, 
  BookOpen, 
  BarChart3, 
  Clock, 
  Camera, 
  Database, 
  Settings,
  AlertTriangle,
  X,
  Smartphone
} from 'lucide-react';
import { AppNavTab, DakRegisterSummary, MasterDocketFile } from '../types';

interface GovtSidebarProps {
  activeTab: AppNavTab;
  onNavigate: (tab: AppNavTab, extra?: any) => void;
  summary: DakRegisterSummary | null;
  files: MasterDocketFile[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const GovtSidebar: React.FC<GovtSidebarProps> = ({
  activeTab,
  onNavigate,
  summary,
  files,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Calculate overdue counts
  const overdueCount = React.useMemo(() => {
    if (summary?.overdueCount !== undefined) return summary.overdueCount;
    const now = new Date();
    return files.filter(f => f.dueDate && new Date(f.dueDate) < now && f.status !== 'disposed').length;
  }, [summary, files]);

  const pendingCount = React.useMemo(() => {
    return files.filter(f => f.status !== 'disposed').length;
  }, [files]);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    isActive: boolean;
    badge?: number | string | null;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'ಮುಖಪುಟ',
      icon: Building2,
      onClick: () => onNavigate('home'),
      isActive: activeTab === 'home',
    },
    {
      id: 'inward',
      label: 'ಒಳಪತ್ರ',
      icon: Inbox,
      onClick: () => onNavigate('registry', { filter: 'inward' }),
      isActive: activeTab === 'registry',
      badge: summary?.totalInward ?? null,
      badgeColor: 'bg-sky-500/30 text-sky-300 border-sky-400/40',
    },
    {
      id: 'files',
      label: 'ಕಡತಗಳು',
      icon: FolderGit2,
      onClick: () => onNavigate('files'),
      isActive: activeTab === 'files' || activeTab === 'fileDashboard',
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'outward',
      label: 'ಹೊರಪತ್ರ',
      icon: Send,
      onClick: () => onNavigate('registry', { filter: 'outward' }),
      isActive: false,
      badge: summary?.totalOutward ?? null,
      badgeColor: 'bg-purple-500/30 text-purple-300 border-purple-400/40',
    },
    {
      id: 'employees',
      label: 'ನೌಕರರ ವಿವರ',
      icon: Users,
      onClick: () => onNavigate('employees'),
      isActive: activeTab === 'employees',
    },
    {
      id: 'schools',
      label: 'ಶಾಲೆಗಳ ವಿವರ',
      icon: School,
      onClick: () => onNavigate('schools'),
      isActive: activeTab === 'schools',
    },
    {
      id: 'generalLetter',
      label: 'ಸಾಮಾನ್ಯ ಪತ್ರಗಳು',
      icon: FileText,
      onClick: () => onNavigate('generalLetter'),
      isActive: activeTab === 'generalLetter' || activeTab === 'drafter',
    },
    {
      id: 'memorandum',
      label: 'ಜ್ಞಾಪನಾ ಆದೇಶ',
      icon: Award,
      onClick: () => onNavigate('memorandum'),
      isActive: activeTab === 'memorandum' || activeTab === 'orderFiles',
    },
    {
      id: 'circularStudio',
      label: 'ಸುತ್ತೋಲೆ',
      icon: Megaphone,
      onClick: () => onNavigate('circularStudio'),
      isActive: activeTab === 'circularStudio',
    },
    {
      id: 'rti',
      label: 'ಮಾಹಿತಿ ಹಕ್ಕು (RTI)',
      icon: ShieldAlert,
      onClick: () => onNavigate('rti'),
      isActive: activeTab === 'rti',
    },
    {
      id: 'govOrders',
      label: 'ಸರ್ಕಾರಿ ಆದೇಶಗಳು',
      icon: BookOpen,
      onClick: () => onNavigate('govOrders'),
      isActive: activeTab === 'govOrders',
    },
    {
      id: 'statutoryBooks',
      label: 'ನಿಯಮ ಪುಸ್ತಕಗಳು',
      icon: BookOpen,
      onClick: () => onNavigate('statutoryBooks'),
      isActive: activeTab === 'statutoryBooks',
    },
    {
      id: 'reports',
      label: 'ವರದಿಗಳು',
      icon: BarChart3,
      onClick: () => onNavigate('reports'),
      isActive: activeTab === 'reports',
    },
    {
      id: 'pending',
      label: 'ಗಡುವು / Pending',
      icon: Clock,
      onClick: () => onNavigate('files', { status: 'overdue' }),
      isActive: false,
      badge: overdueCount > 0 ? overdueCount : (pendingCount > 0 ? pendingCount : null),
      badgeColor: overdueCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500/30 text-amber-300',
    },
    {
      id: 'pdfScanner',
      label: 'ಮುದ್ರಣ / PDF',
      icon: Camera,
      onClick: () => onNavigate('pdfScanner'),
      isActive: activeTab === 'pdfScanner' || activeTab === 'pdfMerger' || activeTab === 'pdfCompressor' || activeTab === 'jpgConverter',
    },
    {
      id: 'backup',
      label: 'ಬ್ಯಾಕಪ್ / ರಿಸ್ಟೋರ್',
      icon: Database,
      onClick: () => onNavigate('settings', { tab: 'backup' }),
      isActive: false,
    },
    {
      id: 'mobileApp',
      label: '📱 ಮೊಬೈಲ್ ಆ್ಯಪ್',
      icon: Smartphone,
      onClick: () => onNavigate('mobileApp'),
      isActive: activeTab === 'mobileApp',
      badge: 'Install',
      badgeColor: 'bg-amber-400 text-stone-950 font-black',
    },
    {
      id: 'settings',
      label: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
      icon: Settings,
      onClick: () => onNavigate('settings'),
      isActive: activeTab === 'settings',
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#081528] text-slate-200 select-none border-r border-[#1e3456]">
      {/* Top Sidebar Header (Mobile Only) */}
      <div className="md:hidden flex items-center justify-between p-3.5 border-b border-[#1e3456] bg-[#0c1e38]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-bold flex items-center justify-center text-xs">
            BEO
          </div>
          <span className="font-bold text-white font-kannada text-xs">
            ಭದ್ರಾವತಿ ಇ-ಆಫೀಸ್
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-sky-900 scrollbar-track-transparent">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                item.onClick();
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-kannada transition-all cursor-pointer group text-left ${
                item.isActive
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
                  : 'text-slate-300 hover:bg-[#122646] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    item.isActive ? 'text-white' : 'text-sky-300 group-hover:text-amber-300'
                  }`}
                />
                <span className="truncate tracking-wide">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full border shrink-0 ${
                    item.badgeColor || 'bg-blue-900/60 text-blue-200 border-blue-500/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Slogan Section */}
      <div className="p-3.5 border-t border-[#1e3456] bg-[#06101e]/80 text-center">
        <p className="text-amber-300 text-xs italic font-kannada font-semibold tracking-wide drop-shadow-xs">
          "ಸೇವೆ ನಮ್ಮ ಧ್ಯೇಯ..."
        </p>
        {/* Curved decorative underline */}
        <div className="flex justify-center mt-1">
          <svg width="80" height="8" viewBox="0 0 80 8" fill="none">
            <path
              d="M2 3C25 7 55 7 78 3"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-[10px] text-slate-400 font-sans mt-1">
          BEO Bhadravathi e-Office v1.1
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:block w-[220px] lg:w-[230px] shrink-0 sticky top-[72px] h-[calc(100vh-72px)] z-30 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[260px] z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
