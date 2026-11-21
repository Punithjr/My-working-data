import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  FolderGit2, 
  BarChart3, 
  Users, 
  School, 
  Megaphone, 
  BookOpen, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Award, 
  Inbox, 
  Camera, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  X,
  FileCheck2,
  FolderArchive
} from 'lucide-react';
import { AppNavTab, DakRegisterSummary, MasterDocketFile } from '../types';

interface GovtSidebarProps {
  activeTab: AppNavTab;
  onNavigate: (tab: AppNavTab, extra?: any) => void;
  summary: DakRegisterSummary | null;
  files: MasterDocketFile[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  lang?: 'kn' | 'en';
}

export const GovtSidebar: React.FC<GovtSidebarProps> = ({
  activeTab,
  onNavigate,
  summary,
  files,
  isMobileOpen,
  onCloseMobile,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  lang = 'kn',
}) => {
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Calculate overdue counts from real database data
  const overdueCount = React.useMemo(() => {
    if (summary?.overdueCount !== undefined) return summary.overdueCount;
    const now = new Date();
    return files.filter(f => f.dueDate && new Date(f.dueDate) < now && f.status !== 'disposed' && f.status !== 'Disposed / Closed').length;
  }, [summary, files]);

  const pendingCount = React.useMemo(() => {
    return files.filter(f => f.status !== 'disposed' && f.status !== 'Disposed / Closed').length;
  }, [files]);

  interface NavItem {
    id: string;
    num: number;
    labelKn: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    isActive: boolean;
    badge?: number | string | null;
    badgeColor?: string;
    isAction?: boolean;
  }

  // Exact 12 modules requested by the user
  const primaryNavItems: NavItem[] = [
    {
      id: 'home',
      num: 1,
      labelKn: 'ಮುಖ್ಯಪುಟ',
      labelEn: 'Dashboard',
      icon: Building2,
      onClick: () => onNavigate('home'),
      isActive: activeTab === 'home',
    },
    {
      id: 'generalLetter',
      num: 2,
      labelKn: 'ಪತ್ರ ತಯಾರಿ',
      labelEn: 'Letter Creation',
      icon: FileText,
      onClick: () => onNavigate('generalLetter'),
      isActive: activeTab === 'generalLetter' || activeTab === 'drafter' || activeTab === 'officialLetter',
    },
    {
      id: 'files',
      num: 3,
      labelKn: 'ಕಡತ ನಿರ್ವಹಣೆ',
      labelEn: 'File Management',
      icon: FolderGit2,
      onClick: () => onNavigate('files'),
      isActive: activeTab === 'files' || activeTab === 'fileDashboard',
      badge: overdueCount > 0 ? `${overdueCount}` : (pendingCount > 0 ? `${pendingCount}` : null),
      badgeColor: overdueCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-900/60 text-sky-200 border border-sky-400/30',
    },
    {
      id: 'reports',
      num: 4,
      labelKn: 'ವರದಿಗಳು',
      labelEn: 'Reports',
      icon: BarChart3,
      onClick: () => onNavigate('reports'),
      isActive: activeTab === 'reports',
    },
    {
      id: 'employees',
      num: 5,
      labelKn: 'ನೌಕರರ ವಿವರ',
      labelEn: 'Employee Details',
      icon: Users,
      onClick: () => onNavigate('employees'),
      isActive: activeTab === 'employees',
    },
    {
      id: 'schools',
      num: 6,
      labelKn: 'ಶಾಲೆಗಳ ವಿವರ',
      labelEn: 'School Details',
      icon: School,
      onClick: () => onNavigate('schools'),
      isActive: activeTab === 'schools',
    },
    {
      id: 'circularStudio',
      num: 7,
      labelKn: 'ಸುತ್ತೋಲೆ',
      labelEn: 'Circulars',
      icon: Megaphone,
      onClick: () => onNavigate('circularStudio'),
      isActive: activeTab === 'circularStudio',
    },
    {
      id: 'govOrders',
      num: 8,
      labelKn: 'ಸರ್ಕಾರಿ ಆದೇಶಗಳು',
      labelEn: 'Government Orders',
      icon: BookOpen,
      onClick: () => onNavigate('govOrders'),
      isActive: activeTab === 'govOrders',
    },
    {
      id: 'statutoryBooks',
      num: 9,
      labelKn: 'ಪುಸ್ತಕಗಳು',
      labelEn: 'Books',
      icon: BookOpen,
      onClick: () => onNavigate('statutoryBooks'),
      isActive: activeTab === 'statutoryBooks',
    },
    {
      id: 'rti',
      num: 10,
      labelKn: 'ಮಾಹಿತಿ ಹಕ್ಕು',
      labelEn: 'RTI',
      icon: ShieldAlert,
      onClick: () => onNavigate('rti'),
      isActive: activeTab === 'rti',
    },
    {
      id: 'settings',
      num: 11,
      labelKn: 'ಸೆಟ್ಟಿಂಗ್ಗಳು',
      labelEn: 'Settings',
      icon: Settings,
      onClick: () => onNavigate('settings'),
      isActive: activeTab === 'settings',
    },
    {
      id: 'logout',
      num: 12,
      labelKn: 'ಲಾಗ್ ಔಟ್',
      labelEn: 'Logout',
      icon: LogOut,
      onClick: () => {
        if (onLogout) onLogout();
      },
      isActive: false,
      isAction: true,
    },
  ];

  // Secondary Tools (Preserving all existing workflows)
  const secondaryTools = [
    {
      id: 'memorandum',
      labelKn: 'ಜ್ಞಾಪನಾ ಆದೇಶ (GPF & ರಜೆ)',
      labelEn: 'Memorandum & Orders',
      icon: Award,
      onClick: () => onNavigate('memorandum'),
      isActive: activeTab === 'memorandum' || activeTab === 'orderFiles',
    },
    {
      id: 'pension',
      labelKn: 'ಪಿಂಚಣಿ ಪ್ರಸ್ತಾವನೆ (19 ದಾಖಲೆ)',
      labelEn: 'Pension Proposal',
      icon: FileCheck2,
      onClick: () => onNavigate('pension'),
      isActive: activeTab === 'pension',
    },
    {
      id: 'registry',
      labelKn: 'ಆವಕ / ಜಾವಕ e-Dak',
      labelEn: 'Inward / Outward Dak',
      icon: Inbox,
      onClick: () => onNavigate('registry'),
      isActive: activeTab === 'registry',
      badge: summary?.totalInward ?? null,
    },
    {
      id: 'pdfScanner',
      labelKn: 'PDF ಸ್ಕ್ಯಾನರ್ & ಟೂಲ್ಸ್',
      labelEn: 'PDF Scanner & Tools',
      icon: Camera,
      onClick: () => onNavigate('pdfScanner'),
      isActive: activeTab === 'pdfScanner' || activeTab === 'pdfMerger' || activeTab === 'pdfCompressor' || activeTab === 'jpgConverter',
    },
    {
      id: 'mobileApp',
      labelKn: 'ಮೊಬೈಲ್ ಆ್ಯಪ್ (PWA)',
      labelEn: 'Mobile App',
      icon: Smartphone,
      onClick: () => onNavigate('mobileApp'),
      isActive: activeTab === 'mobileApp',
      badge: 'App',
    },
  ];

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isLogout = item.isAction;

    return (
      <button
        key={item.id}
        type="button"
        id={`sidebar-item-${item.id}`}
        onClick={() => {
          item.onClick();
          onCloseMobile();
        }}
        title={`${item.num}. ${item.labelKn} (${item.labelEn})`}
        className={`w-full flex items-center transition-all cursor-pointer rounded-xl group relative ${
          isCollapsed ? 'justify-center p-2.5 my-1' : 'justify-between px-3 py-2 my-0.5'
        } ${
          item.isActive
            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50 font-bold'
            : isLogout
            ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-200'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
      >
        <div className={`flex items-center gap-2.5 truncate ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0 flex items-center justify-center">
            <Icon
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                item.isActive 
                  ? 'text-white' 
                  : isLogout 
                  ? 'text-rose-400' 
                  : 'text-sky-300 group-hover:text-amber-300'
              }`}
            />
            {/* Dot badge on collapsed mode */}
            {isCollapsed && item.badge && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#081730]"></span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col text-left truncate leading-tight">
              <span className="text-xs font-semibold font-kannada truncate tracking-wide">
                <span className="text-slate-400 font-mono text-[11px] mr-1">{item.num}.</span>
                {item.labelKn}
              </span>
              <span className="text-[10px] text-slate-400 font-sans truncate">
                {item.labelEn}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && item.badge !== undefined && item.badge !== null && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md shrink-0 ${
              item.badgeColor || 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* Collapsed Hover Tooltip */}
        {isCollapsed && (
          <div className="fixed left-[76px] hidden group-hover:flex items-center z-50 bg-[#0d2240] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-sky-400/30 whitespace-nowrap font-kannada pointer-events-none">
            <span className="font-mono text-amber-300 mr-1.5">{item.num}.</span>
            <span>{item.labelKn}</span>
            <span className="text-stone-400 ml-1.5 font-sans text-[11px]">({item.labelEn})</span>
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#081730] text-slate-200 select-none border-r border-[#1a3359]">
      {/* Top Header Section */}
      <div className={`p-3.5 border-b border-[#1a3359] bg-[#0c2242] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#081730] font-black flex items-center justify-center text-xs shadow-sm shrink-0">
              BEO
            </div>
            <div className="truncate text-left leading-tight">
              <span className="block font-bold text-white font-kannada text-xs truncate">
                ಭದ್ರಾವತಿ ಇ-ಕಛೇರಿ
              </span>
              <span className="block text-[10px] text-amber-300/80 font-mono font-medium truncate">
                ARYA-PUNITH PORTAL
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#081730] font-black flex items-center justify-center text-xs shadow-sm">
            BEO
          </div>
        )}

        {/* Collapse Toggle for Desktop */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
              isCollapsed ? 'mt-2' : ''
            }`}
            title={isCollapsed ? 'ವಿಸ್ತರಿಸಿ (Expand Sidebar)' : 'ಕುಗ್ಗಿಸಿ (Collapse Sidebar)'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Close Button on Mobile Drawer */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main 12 Modules Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-sky-900 scrollbar-track-transparent">
        {/* Section Title */}
        {!isCollapsed && (
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">
            ಮುಖ್ಯ ವಿಭಾಗಗಳು (Main Modules)
          </div>
        )}

        {/* 12 Primary Items */}
        {primaryNavItems.map(item => renderNavButton(item))}

        {/* Separator */}
        <div className="my-2 border-t border-[#1a3359]/80" />

        {/* Additional Office Tools Accordion */}
        {!isCollapsed ? (
          <div>
            <button
              type="button"
              onClick={() => setIsToolsExpanded(!isToolsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-200 text-[11px] font-bold font-kannada rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <span>ಹೆಚ್ಚುವರಿ ಪರಿಕರಗಳು (Tools)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isToolsExpanded && (
              <div className="mt-1 pl-1 space-y-0.5 animate-in fade-in duration-150">
                {secondaryTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        tool.onClick();
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-kannada text-left cursor-pointer transition-colors ${
                        tool.isActive
                          ? 'bg-sky-900/60 text-sky-200 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-amber-300/80" />
                        <span className="truncate text-[11px]">{tool.labelKn}</span>
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Icons for secondary tools in collapsed mode */
          <div className="pt-1 space-y-1 border-t border-[#1a3359]/60">
            {secondaryTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    tool.onClick();
                    onCloseMobile();
                  }}
                  title={tool.labelKn}
                  className={`w-full flex items-center justify-center p-2 rounded-xl cursor-pointer group transition-colors ${
                    tool.isActive
                      ? 'bg-sky-900 text-sky-200'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-300/80 group-hover:scale-110 transition-transform" />
                  <div className="fixed left-[76px] hidden group-hover:flex items-center z-50 bg-[#0d2240] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-sky-400/30 whitespace-nowrap font-kannada pointer-events-none">
                    <span>{tool.labelKn}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Slogan Section */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-[#1a3359] bg-[#061224] text-center">
          <p className="text-amber-300 text-[11px] font-kannada font-bold tracking-wide">
            "ಸೇವೆ ನಮ್ಮ ಧ್ಯೇಯ"
          </p>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">
            BEO Bhadravathi • ARYA-PUNITH
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-[#1a3359] bg-[#061224] flex justify-center text-amber-400 text-xs font-bold font-kannada" title="ಸೇವೆ ನಮ್ಮ ಧ್ಯೇಯ">
          ★
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Left Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 sticky top-[72px] h-[calc(100vh-72px)] z-30 no-print transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
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
        className={`fixed top-0 bottom-0 left-0 w-[270px] z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
