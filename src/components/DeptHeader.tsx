import React from 'react';
import { 
  Building2, 
  FileText, 
  FolderGit2, 
  BarChart3, 
  Sparkles, 
  Plus, 
  FolderPlus,
  Inbox, 
  Send, 
  AlertTriangle,
  FileSpreadsheet,
  RotateCcw,
  Users,
  LogOut,
  ShieldCheck,
  UserCheck,
  Award,
  FileCheck2,
  TrendingUp,
  Search,
  Settings,
  Archive,
  Layers,
  School,
  Calendar,
  Camera,
  Minimize2,
  RefreshCw,
  Sliders,
  BookOpen,
  Smartphone
} from 'lucide-react';
import { DakRegisterSummary, AdminAuthUser, AppNavTab } from '../types';
export type { AppNavTab };

interface DeptHeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  summary: DakRegisterSummary | null;
  onNewLetter: () => void;
  onNewFile: () => void;
  onOpenCreateOtherFile?: () => void;
  onOpenNewRtiFile?: () => void;
  onOpenServiceSanctions?: () => void;
  onOpenMasterAudit?: () => void;
  onResetDemo: () => void;
  employeesCount?: number;
  currentUser?: AdminAuthUser | null;
  onLogout?: () => void;
  onOpenUserManagement?: () => void;
  onOpenAiChat?: () => void;
  userSlotsCount?: number;
  onSwitchRole?: (role: AdminAuthUser['role']) => void;
}

export const DeptHeader: React.FC<DeptHeaderProps> = ({
  activeTab,
  setActiveTab,
  summary,
  onNewLetter,
  onNewFile,
  onOpenCreateOtherFile,
  onOpenNewRtiFile,
  onOpenServiceSanctions,
  onOpenMasterAudit,
  onResetDemo,
  employeesCount = 0,
  currentUser,
  onLogout,
  onOpenUserManagement,
  onOpenAiChat,
  userSlotsCount = 5,
  onSwitchRole,
}) => {
  return (
    <header className="bg-[#fffbf2] border-b-[2.5px] border-[#2b2b2b] sticky top-0 z-30 shadow-[0_4px_0_rgba(43,43,43,0.06)]">
      {/* Top Directorate Banner in Inky style */}
      <div className="bg-[#2b2b2b] text-[#fffbf2] px-4 sm:px-6 py-2 border-b-2 border-[#2b2b2b] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="font-bold tracking-normal text-[#f59e0b] font-kannada text-xs">
              ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
            </span>
            <span className="text-stone-500">•</span>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-white hover:text-amber-300 font-bold font-kannada cursor-pointer transition-colors"
              title="ಮುಖಪುಟಕ್ಕೆ ತೆರಳಿ"
            >
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono-code text-stone-200">
            <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded border border-stone-700">
              <Inbox className="w-3 h-3 text-sky-400" />
              <span>INWARD: <strong>{summary?.totalInward ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded border border-stone-700">
              <Send className="w-3 h-3 text-emerald-400" />
              <span>DISPATCHED: <strong>{summary?.totalOutward ?? 0}</strong></span>
            </div>
            {(summary?.overdueCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                <AlertTriangle className="w-3 h-3" />
                <span>{summary?.overdueCount} OVERDUE</span>
              </div>
            )}
            <button
              onClick={onResetDemo}
              className="text-[10px] text-emerald-300 hover:text-white underline ml-1 flex items-center gap-1 cursor-pointer font-sans"
              title="ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಕಡತಗಳ ಡೇಟಾ ಸಿಂಕ್ (Sync Official Data)"
            >
              <RotateCcw className="w-2.5 h-2.5" /> ಡೇಟಾ ಸಿಂಕ್
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[10px] text-amber-950 font-bold bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded border border-amber-500 ml-1 flex items-center gap-1 cursor-pointer font-kannada transition-colors shadow-2xs"
              title="ಮೊಬೈಲ್ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ / ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ & ನವೀಕರಣ (Install Mobile App)"
            >
              <Smartphone className="w-2.5 h-2.5 text-stone-900" /> 📱 ಮೊಬೈಲ್ ಆ್ಯಪ್
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding: Only 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ', click navigates to Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer transition-transform active:scale-95 focus:outline-none shrink-0"
            title="ಮುಖಪುಟಕ್ಕೆ ತೆರಳಿ (Home)"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2b2b2b] text-[#f59e0b] flex items-center justify-center font-bold border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#f59e0b] group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-black text-[#2b2b2b] tracking-tight leading-tight font-kannada group-hover:text-amber-800 transition-colors">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ
              </h1>
            </div>
          </button>

          {/* Action Buttons & Admin Profile */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-make-letter"
              onClick={() => setActiveTab('generalLetter')}
              className="px-3.5 py-1.5 text-xs font-bold text-[#2b2b2b] bg-[#f59e0b] hover:bg-[#e08e0b] rounded-lg transition-all inline-flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ಸಾಮಾನ್ಯ ಪತ್ರ ತಯಾರಿಸಿ (ನೌಕರರ ಸಾಮಾನ್ಯ ಪತ್ರ ಮತ್ತು ಇತರೆ ಸಾಮಾನ್ಯ ಪತ್ರ)"
            >
              <FileText className="w-3.5 h-3.5 text-[#2b2b2b]" />
              <span>📄 ಸಾಮಾನ್ಯ ಪತ್ರ ತಯಾರಿಸಿ</span>
            </button>

            <button
              id="btn-quick-new-memo"
              onClick={() => setActiveTab('memorandum')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2b2b2b] hover:bg-[#1f1f1f] rounded-lg transition-all inline-flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#10b981] hover:shadow-[4px_4px_0px_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ನೂತನ ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜಿಸಿ"
            >
              <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>+ ಜ್ಞಾಪನಾ ಆದೇಶ</span>
            </button>

            <button
              id="btn-quick-statutory-books"
              onClick={() => setActiveTab('statutoryBooks')}
              className="hidden lg:inline-flex px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="KCSR, KFC, CCA ನಿಯಮ ಪುಸ್ತಕಗಳು (Statutory Rule Books)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
              <span>📚 KCSR/KFC/CCA ಪುಸ್ತಕ</span>
            </button>

            {onOpenCreateOtherFile && (
              <button
                id="btn-quick-new-other-file"
                onClick={onOpenCreateOtherFile}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-amber-100 hover:bg-amber-200 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
                title="ಇತರ ಕಡತ ಸೃಜನೆ (Create Other File)"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-800" />
                <span>+ ಇತರ ಕಡತ</span>
              </button>
            )}

            {onOpenNewRtiFile && (
              <button
                id="btn-quick-new-rti"
                onClick={onOpenNewRtiFile}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-[#fffbf2] rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
                title="ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸೃಜಿಸಿ (PDF/JPG ಅಪ್‌ಲೋಡ್)"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#2b2b2b]" />
                <span>+ RTI ಕಡತ</span>
              </button>
            )}

            <button
              id="btn-quick-circular"
              onClick={() => setActiveTab('circularStudio')}
              className="hidden md:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#818cf8] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ ರಚನೆ (KCSR, RTE, KSMOP)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>+ ಸುತ್ತೋಲೆ</span>
            </button>

            <button
              id="btn-quick-pdf-scanner"
              onClick={() => setActiveTab('pdfScanner')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#10b981] hover:shadow-[4px_4px_0px_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ಕಾಗದ ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್ (Office PDF Document Scanner & Compressor)"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>📸 PDF ಸ್ಕ್ಯಾನರ್</span>
            </button>

            <button
              id="btn-quick-pdf-compressor"
              onClick={() => setActiveTab('pdfCompressor')}
              className="hidden md:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#c084fc] hover:shadow-[4px_4px_0px_#c084fc] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="PDF ಗಾತ್ರ ಕಡಿತ (<200KB / <500KB) (PDF Compressor)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-purple-300" />
              <span>📉 PDF ಕಂಪ್ರೆಸ್</span>
            </button>

            <button
              id="btn-quick-pdf-merger"
              onClick={() => setActiveTab('pdfMerger')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-teal-900 hover:bg-teal-800 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2dd4bf] hover:shadow-[4px_4px_0px_#2dd4bf] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ಹಲವು PDF ಹಾಗೂ ಚಿತ್ರಗಳನ್ನು ಒಂದೇ ಕಡತಕ್ಕೆ ವಿಲೀನಗೊಳಿಸಿ (PDF Merger & Consolidation)"
            >
              <Layers className="w-3.5 h-3.5 text-teal-300" />
              <span>📑 PDF ವಿಲೀನ</span>
            </button>

            <button
              id="btn-quick-jpg-converter"
              onClick={() => setActiveTab('jpgConverter')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-300 hover:bg-amber-200 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="PDF ನಿಂದ JPG, JPG ನಿಂದ PDF & ಚಿತ್ರಗಳನ್ನು JPG ಗೆ ಪರಿವರ್ತಿಸಿ (PDF & JPG Converter)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-950" />
              <span>🔄 PDF & ಜೆಪಿ ಕನ್ವರ್ಟ್</span>
            </button>

            <button
              id="btn-quick-image-compressor"
              onClick={() => setActiveTab('imageCompressor')}
              className="hidden xl:inline-flex px-3 py-1.5 text-xs font-bold text-rose-950 bg-rose-200 hover:bg-rose-300 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="ಚಿತ್ರಗಳನ್ನು 20KB, 50KB, 100KB ಗೆ ಕಂಪ್ರೆಸ್ ಮಾಡಿ (JPG Compressor to Target Size)"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-900" />
              <span>⚡ ಜೆಪಿಸಿ ಕಂಪ್ರೆಸ್</span>
            </button>

            <button
              id="btn-quick-master-audit"
              onClick={() => onOpenMasterAudit ? onOpenMasterAudit() : setActiveTab('masterAudit')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
              title="e-Office ಕಡತ ಲೆಕ್ಕಪರಿಶೋಧನೆ (Master Docket Auditing)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
              <span>🔍 ಕಡತ ಆಡಿಟ್</span>
            </button>

            {/* AI Assistant Button (Gemini 3.8 Flash) */}
            {onOpenAiChat && (
              <button
                id="btn-quick-ai-assistant"
                onClick={onOpenAiChat}
                className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 rounded-lg transition-all inline-flex items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#c084fc] hover:shadow-[4px_4px_0px_#c084fc] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
                title="KCSR & RTI AI ಸಹಾಯಕ (Gemini 3.8 Flash)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>🤖 AI ಸಹಾಯಕ</span>
              </button>
            )}

            {/* 5 Users Management & Registration Button */}
            {onOpenUserManagement && (
              <button
                id="btn-quick-manage-users"
                onClick={onOpenUserManagement}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-sky-100 hover:bg-sky-200 rounded-lg transition-all items-center gap-1.5 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer font-kannada"
                title="ಕಛೇರಿ 5 ಅಧಿಕೃತ ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ ಮತ್ತು ನೋಂದಣಿ (5 Users Limit)"
              >
                <Users className="w-3.5 h-3.5 text-sky-700" />
                <span>👥 ಬಳಕೆದಾರರು</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2b2b2b] text-[#f59e0b] font-mono-code font-bold">
                  {userSlotsCount}/2
                </span>
              </button>
            )}

            {/* Active User Profile & Logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l-2 border-[#2b2b2b]">
              <div 
                onClick={onOpenUserManagement}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-[#2b2b2b] rounded-lg text-xs shadow-[2px_2px_0px_#2b2b2b] cursor-pointer hover:bg-amber-50/60"
                title="ಪ್ರಸ್ತುತ ಲಾಗಿನ್ ಆಗಿರುವ ನೌಕರರು (ಕ್ಲಿಕ್ ಮಾಡಿ ಬಳಕೆದಾರರನ್ನು ಬದಲಿಸಿ)"
              >
                <div className="w-5 h-5 rounded-full bg-[#2b2b2b] text-[#f59e0b] font-bold flex items-center justify-center text-[10px] font-mono-code shrink-0">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
                </div>
                <div className="leading-tight text-left max-w-[130px] sm:max-w-[160px] truncate">
                  <span className="font-bold text-[#2b2b2b] block text-[11px] truncate font-kannada">
                    {currentUser?.displayName || currentUser?.username || 'admin'}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                    {currentUser?.hasAllRoles && (
                      <span className="text-[9px] bg-amber-400 text-stone-950 font-bold px-1 rounded border border-amber-600" title="ಈ ಬಳಕೆದಾರರಿಗೆ ಎಲ್ಲಾ ಪಾತ್ರಗಳು ಮ್ಯಾಪ್ ಆಗಿವೆ">
                        🌟 All
                      </span>
                    )}
                    {onSwitchRole ? (
                      <select
                        value={currentUser?.role || 'Case Worker'}
                        onChange={(e) => onSwitchRole(e.target.value as AdminAuthUser['role'])}
                        className="text-[9px] bg-amber-100 hover:bg-amber-200 text-stone-900 border border-stone-700 rounded px-1 py-0.2 font-bold font-mono cursor-pointer"
                        title="ಪಾತ್ರ ಬದಲಿಸಿ (Switch Role - ಎಲ್ಲಾ Role ಬಳಸಿ)"
                      >
                        <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು)</option>
                        <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                        <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                        <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು)</option>
                        <option value="FDA / Nodal">FDA / Nodal (ನೋಡಲ್ ಅಧಿಕಾರಿ)</option>
                        <option value="Data Entry Operator">Data Entry Operator</option>
                      </select>
                    ) : (
                      <span className="text-[9px] text-stone-500 block uppercase font-mono-code font-bold truncate">
                        {currentUser?.role || 'SYSTEM ADMIN'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  id="btn-admin-logout"
                  onClick={onLogout}
                  className="p-1.5 text-[#2b2b2b] hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg transition-all border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] cursor-pointer"
                  title="ನಿರ್ಗಮಿಸಿ (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PRIMARY GOVERNMENT NAVIGATION BAR: THE 7 CORE KANNADA MODULES + LETTER MAKER */}
        <div className="flex items-center justify-between overflow-x-auto py-2 border-t-2 border-[#2b2b2b] gap-1.5 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {/* 0. ಮುಖಪುಟ (Home Dashboard) */}
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'home'
                  ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>🏠 ಮುಖಪುಟ (Home)</span>
            </button>

            {/* ಕಡತಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (File Dashboard & Movement Tracking) */}
            <button
              id="nav-tab-file-dashboard"
              onClick={() => setActiveTab('fileDashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'fileDashboard'
                  ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-amber-50 text-[#2b2b2b] hover:bg-amber-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಪಿಂಚಣಿ, ಬಡ್ತಿ, ಶಿಸ್ತು ಕ್ರಮ ಹಾಗೂ ಕಡತಗಳ ಚಲನವಲನ ಟೈಮ್‌ಲೈನ್"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>📁 ಕಡತಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
            </button>

            {/* ಮಾನವ ಸಂಪನ್ಮೂಲ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ (HRMS 2.0 / Human Resource Management System) */}
            <button
              id="nav-tab-hrms"
              onClick={() => setActiveTab('hrms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'hrms'
                  ? 'bg-[#047857] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಮಾನವ ಸಂಪನ್ಮೂಲ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ (HRMS 2.0 - Khajane-2, Service Book, Transfers, LPC, APAR & Pay Bill)"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>👥 HRMS (ಮಾನವ ಸಂಪನ್ಮೂಲ)</span>
            </button>

            {/* 1. ಸಾಮಾನ್ಯ ಪತ್ರ ತಯಾರಿಸಿ */}
            <button
              id="nav-tab-make-general-letter"
              onClick={() => setActiveTab('generalLetter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'generalLetter'
                  ? 'bg-[#f59e0b] text-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100/70 text-[#2b2b2b] hover:bg-amber-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#2b2b2b]" />
              <span>1. ಸಾಮಾನ್ಯ ಪತ್ರ</span>
            </button>

            {/* 2. ಜ್ಞಾಪನಾ ಆದೇಶ */}
            <button
              id="nav-tab-memorandum"
              onClick={() => setActiveTab('memorandum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'memorandum'
                  ? 'bg-[#2b2b2b] text-[#fffbf2] shadow-[3px_3px_0px_#10b981] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#10b981]" />
              <span>2. ಜ್ಞಾಪನಾ ಆದೇಶ</span>
            </button>

            {/* 3. ಪ್ರಪತ್ರ-28 [ವೇತನ ಬಡ್ತಿ] */}
            <button
              id="nav-tab-prapathra28"
              onClick={() => setActiveTab('prapathra28')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'prapathra28'
                  ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>3. ಪ್ರಪತ್ರ-28 [ವೇತನ ಬಡ್ತಿ]</span>
            </button>

            {/* 4. ನೌಕರರ ಮಾಹಿತಿ */}
            <button
              id="nav-tab-employees"
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'employees'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#10b981] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#10b981]" />
              <span>4. ನೌಕರರ ಮಾಹಿತಿ</span>
              {employeesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#f59e0b] text-[#2b2b2b] font-mono-code font-bold">
                  {employeesCount}
                </span>
              )}
            </button>

            {/* ರಜೆ ಕ್ಯಾಲೆಂಡರ್ (Leave Calendar) */}
            <button
              id="nav-tab-leave-calendar"
              onClick={() => setActiveTab('leaveCalendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'leaveCalendar'
                  ? 'bg-[#e11d48] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-rose-50 text-rose-950 hover:bg-rose-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಮಹಿಳಾ ನೌಕರರ ಶಿಶುಪಾಲನ ರಜೆ (180 ದಿನಗಳು) & ಹೆರಿಗೆ ರಜೆ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಕೋಟಾ ನಿರ್ವಹಣೆ"
            >
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>📅 ರಜೆ ಕ್ಯಾಲೆಂಡರ್</span>
            </button>

            {/* ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ ನಿರ್ವಹಣೆ (Pension & Retirement Management) */}
            <button
              id="nav-tab-pension"
              onClick={() => setActiveTab('pension')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'pension'
                  ? 'bg-[#d97706] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100 text-stone-900 hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರ, ನಮೂನೆ-7, ಆದೇಶಗಳು & ಕಡತ ನಿರ್ವಹಣೆ (Pension & KCSR Calculation)"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>🎖️ ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ</span>
            </button>

            {/* 5. ಆದೇಶಗಳ ಕಡತ */}
            <button
              id="nav-tab-order-files"
              onClick={() => setActiveTab('orderFiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'orderFiles'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>5. ಆದೇಶಗಳ ಕಡತ</span>
            </button>

            {/* 6. ವೇತನ ಬದಲಾವಣೆ */}
            <button
              id="nav-tab-salary-changes"
              onClick={() => setActiveTab('salaryChanges')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'salaryChanges'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#10b981] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
              <span>6. ವೇತನ ಬದಲಾವಣೆ</span>
            </button>

            {/* 7. ವರದಿಗಳು */}
            <button
              id="nav-tab-reports"
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'reports'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#38bdf8] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>7. ವರದಿಗಳು</span>
            </button>

            {/* 6. Search */}
            <button
              id="nav-tab-search"
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'search'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#a855f7] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-purple-500" />
              <span>6. ಹುಡುಕಾಟ</span>
            </button>

            {/* 7. Settings */}
            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'settings'
                  ? 'bg-[#2b2b2b] text-white shadow-[3px_3px_0px_#e5e7eb] -translate-y-0.5'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-stone-500" />
              <span>7. ಸೆಟ್ಟಿಂಗ್ಸ್</span>
            </button>

            {/* 8. ಶಾಲೆಗಳು & ಅನುದಾನ */}
            <button
              id="nav-tab-schools"
              onClick={() => setActiveTab('schools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'schools'
                  ? 'bg-[#10b981] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-emerald-50 text-[#2b2b2b] hover:bg-emerald-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
            >
              <School className="w-3.5 h-3.5 text-emerald-800" />
              <span>8. ಶಾಲೆಗಳು</span>
            </button>

            {/* 9. ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆಗಳು (Statutory Circulars) */}
            <button
              id="nav-tab-circulars"
              onClick={() => setActiveTab('circularStudio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'circularStudio'
                  ? 'bg-indigo-900 text-white shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-indigo-50 text-indigo-950 hover:bg-indigo-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಸ್ವಯಂಚಾಲಿತ ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆಗಳ ರಚನೆ (KCSR, RTE, KSMOP)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>9. ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ</span>
            </button>

            {/* 10. ನಿಯಮ ಪುಸ್ತಕಗಳು (KCSR, KFC, CCA Books) */}
            <button
              id="nav-tab-statutory-books"
              onClick={() => setActiveTab('statutoryBooks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'statutoryBooks'
                  ? 'bg-[#d97706] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100 text-amber-950 hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR), ಹಣಕಾಸು ಸಂಹಿತೆ (KFC), CCA & ನಡತೆ ನಿಯಮಗಳು"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>📚 ನಿಯಮ ಪುಸ್ತಕಗಳು (KCSR/KFC/CCA)</span>
            </button>

            {/* 10. ಕಡತ ಆಡಿಟ್ (Master Docket Auditing) */}
            <button
              id="nav-tab-docket-audit"
              onClick={() => onOpenMasterAudit ? onOpenMasterAudit() : setActiveTab('masterAudit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'masterAudit'
                  ? 'bg-amber-800 text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100/80 text-amber-950 hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="e-Office ಕಡತಗಳ ಪೂರ್ಣ ಲೆಕ್ಕಪರಿಶೋಧನೆ ಹಾಗೂ KSMOP ವಿಂಗಡಣೆ"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              <span>10. ಕಡತ ಆಡಿಟ್</span>
            </button>

            {/* 11. ಮಾಹಿತಿ ಹಕ್ಕು ಪತ್ರ ವ್ಯವಹಾರಗಳು & ನಿರ್ವಹಣೆ (RTI Management & Correspondence) */}
            <button
              id="nav-tab-rti-management"
              onClick={() => setActiveTab('rti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'rti'
                  ? 'bg-[#f59e0b] text-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100 text-[#2b2b2b] hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005: ಅರ್ಜಿ ನೋಂದಣಿ, 30-ದಿನಗಳ SLA ಗಡುವು, ವರ್ಗಾವಣೆ 6(3), ಉತ್ತರ ಪತ್ರಗಳು & ಮೇಲ್ಮನವಿಗಳು"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#2b2b2b]" />
              <span>11. ಮಾಹಿತಿ ಹಕ್ಕು (RTI)</span>
            </button>

            {/* 12. PDF ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್ (PDF Document Scanner) */}
            <button
              id="nav-tab-pdf-scanner"
              onClick={() => setActiveTab('pdfScanner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'pdfScanner'
                  ? 'bg-[#10b981] text-white shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಕಛೇರಿ ಕಾಗದ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಮೂಲೆ ಸರಿಪಡಿಸಿ, PDF ಸೃಜಿಸಿ (Office Document Scanner)"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>12. PDF ಸ್ಕ್ಯಾನರ್</span>
            </button>

            {/* 13. PDF ಕಂಪ್ರೆಸ್ (PDF Compressor) */}
            <button
              id="nav-tab-pdf-compressor"
              onClick={() => setActiveTab('pdfCompressor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'pdfCompressor'
                  ? 'bg-purple-900 text-white shadow-[3px_3px_0px_#c084fc] -translate-y-0.5'
                  : 'bg-purple-50 text-purple-950 hover:bg-purple-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="PDF ಫೈಲ್ ಗಾತ್ರ ಕುಗ್ಗಿಸಿ (<200KB / <500KB) (PDF Compressor)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-purple-600" />
              <span>13. PDF ಕಂಪ್ರೆಸ್</span>
            </button>

            {/* 14. PDF ವಿಲೀನ (PDF Merger) */}
            <button
              id="nav-tab-pdf-merger"
              onClick={() => setActiveTab('pdfMerger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'pdfMerger'
                  ? 'bg-teal-900 text-white shadow-[3px_3px_0px_#2dd4bf] -translate-y-0.5'
                  : 'bg-teal-50 text-teal-950 hover:bg-teal-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಹಲವಾರು PDF ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ಒಂದೇ ಕಡತಕ್ಕೆ ವಿಲೀನಗೊಳಿಸಿ (PDF Merger)"
            >
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>14. PDF ವಿಲೀನ</span>
            </button>

            {/* 15. JPEG ➔ JPG & PDF ಕನ್ವರ್ಟರ್ (PDF & JPG Converter) */}
            <button
              id="nav-tab-jpg-converter"
              onClick={() => setActiveTab('jpgConverter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'jpgConverter'
                  ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[3px_3px_0px_#f59e0b] -translate-y-0.5'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="PDF ನಿಂದ JPG, JPG ನಿಂದ PDF & ಚಿತ್ರಗಳನ್ನು JPG ಗೆ ಪರಿವರ್ತಿಸಿ (PDF & JPG Converter)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>15. PDF & ಜೆಪಿ ಕನ್ವರ್ಟ್</span>
            </button>

            {/* 16. ಇಮೇಜ್ ಕಂಪ್ರೆಸರ್ (Image Compressor 20KB/50KB/100KB) */}
            <button
              id="nav-tab-image-compressor"
              onClick={() => setActiveTab('imageCompressor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'imageCompressor'
                  ? 'bg-blue-900 text-white shadow-[3px_3px_0px_#38bdf8] -translate-y-0.5'
                  : 'bg-blue-50 text-blue-950 hover:bg-blue-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಭಾವಚಿತ್ರ & ಸಹಿ ಫೈಲ್ ಗಾತ್ರ ಕುಗ್ಗಿಸಿ (20KB / 50KB / 100KB) (Photo & Signature Compressor)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>16. ಜೆಪಿಸಿ ಕಂಪ್ರೆಸ್</span>
            </button>

            {/* 17. ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ (User Management) */}
            <button
              id="nav-tab-user-management"
              onClick={() => setActiveTab('userManagement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'userManagement'
                  ? 'bg-sky-900 text-white shadow-[3px_3px_0px_#38bdf8] -translate-y-0.5'
                  : 'bg-sky-50 text-sky-950 hover:bg-sky-100 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಅಧಿಕೃತ ಕಛೇರಿ ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ, ಹೊಸ ಬಳಕೆದಾರರ ಸೃಜನೆ (Creator) & ತಿದ್ದುಪಡಿ (Modifier)"
            >
              <Users className="w-3.5 h-3.5 text-sky-700" />
              <span>17. ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2b2b2b] text-[#f59e0b] font-mono-code font-bold">
                {userSlotsCount}
              </span>
            </button>

            {/* 18. ಮೊಬೈಲ್ ಆ್ಯಪ್ (Mobile App & Update Center) */}
            <button
              id="nav-tab-mobile-app-main"
              onClick={() => setActiveTab('mobileApp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'mobileApp'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-[3px_3px_0px_#2b2b2b] -translate-y-0.5'
                  : 'bg-amber-100 text-amber-950 hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಮೊಬೈಲ್ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ / ಇನ್‌ಸ್ಟಾಲ್ & ಆವೃತ್ತಿ ನವೀಕರಣ (Install Mobile App)"
            >
              <Smartphone className="w-3.5 h-3.5 text-stone-950" />
              <span>📱 18. ಮೊಬೈಲ್ ಆ್ಯಪ್</span>
            </button>
          </div>

          {/* Secondary Hub for Correspondence & RTI */}
          <div className="flex items-center gap-2 pl-2 border-l-2 border-[#2b2b2b] shrink-0">
            <button
              id="nav-tab-letters-registry"
              onClick={() => setActiveTab('registry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'registry' || activeTab === 'files' || activeTab === 'drafter'
                  ? 'bg-[#2b2b2b] text-[#fffbf2] shadow-[2.5px_2.5px_0px_#f59e0b]'
                  : 'bg-white text-[#2b2b2b] hover:bg-[#fffbf2] shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಪತ್ರ ವ್ಯವಹಾರಗಳು & e-Dak"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>ಪತ್ರಗಳು ({summary?.totalLetters ?? 0})</span>
            </button>

            <button
              id="nav-tab-rti"
              onClick={() => setActiveTab('rti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#2b2b2b] ${
                activeTab === 'rti'
                  ? 'bg-[#f59e0b] text-[#2b2b2b] shadow-[2.5px_2.5px_0px_#2b2b2b]'
                  : 'bg-amber-100 text-[#2b2b2b] hover:bg-amber-200 shadow-[2px_2px_0px_#2b2b2b]'
              }`}
              title="ಮಾಹಿತಿ ಹಕ್ಕು ಪತ್ರ ವ್ಯವಹಾರಗಳು & ನಿರ್ವಹಣೆ (RTI Act 2005)"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#2b2b2b]" />
              <span>⚖️ RTI ಪತ್ರ ವ್ಯವಹಾರ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
