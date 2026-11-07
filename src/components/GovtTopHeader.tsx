import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Settings, 
  Power, 
  Wifi, 
  WifiOff, 
  Clock, 
  User, 
  ChevronDown, 
  Sparkles,
  FileText,
  FolderGit2,
  Users,
  ShieldCheck,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { AdminAuthUser, AppNavTab, MasterDocketFile, EducationLetter, Employee } from '../types';

interface GovtTopHeaderProps {
  currentUser?: AdminAuthUser | null;
  onLogout?: () => void;
  onOpenSettings: () => void;
  onOpenUserModal?: () => void;
  onOpenAiChat?: () => void;
  onNavigate: (tab: AppNavTab, extra?: any) => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  files: MasterDocketFile[];
  letters: EducationLetter[];
  employees: Employee[];
}

export const GovtTopHeader: React.FC<GovtTopHeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenUserModal,
  onOpenAiChat,
  onNavigate,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  files,
  letters,
  employees,
}) => {
  // Live network status
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Current real-time clock
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [lang, setLang] = useState<'kn' | 'en'>('kn');

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDateString(now.toLocaleDateString('kn-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);

    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global search matching
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedFiles = files.filter(f => 
      f.fileNumber?.toLowerCase().includes(q) || 
      f.subject?.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedLetters = letters.filter(l => 
      l.letterNumber?.toLowerCase().includes(q) || 
      l.subject?.toLowerCase().includes(q) ||
      l.senderOrRecipient?.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedEmployees = employees.filter(e => 
      e.name?.toLowerCase().includes(q) || 
      e.kgidNumber?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q)
    ).slice(0, 3);

    return { files: matchedFiles, letters: matchedLetters, employees: matchedEmployees };
  }, [searchQuery, files, letters, employees]);

  const hasResults = searchResults && (
    searchResults.files.length > 0 || 
    searchResults.letters.length > 0 || 
    searchResults.employees.length > 0
  );

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-gradient-to-r from-[#071326] via-[#0d2240] to-[#152e54] border-b border-[#21436e]/70 shadow-md text-white select-none no-print">
      {/* Background Vidhana Soudha Faded Silhouette */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08] overflow-hidden mix-blend-screen"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-amber-200 fill-current">
          {/* Stylized Dome and Pillars of Vidhana Soudha */}
          <path d="M0,120 L0,90 L200,90 L200,60 L230,60 L230,40 L260,40 L260,30 L290,30 L290,15 L300,5 L310,15 L310,30 L340,30 L340,40 L370,40 L370,60 L400,60 L400,90 L600,90 L600,40 L650,40 L650,20 L665,2 L680,20 L680,40 L730,40 L730,90 L950,90 L950,60 L980,60 L980,40 L1010,40 L1010,30 L1040,30 L1040,15 L1050,5 L1060,15 L1060,30 L1090,30 L1090,40 L1120,40 L1120,60 L1150,60 L1150,90 L1200,90 L1200,120 Z" />
        </svg>
      </div>

      <div className="relative h-full max-w-full mx-auto px-3 sm:px-5 flex items-center justify-between gap-3">
        {/* Left: Hamburger (mobile), Karnataka Emblem & Office Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Karnataka State Government Official Emblem */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="ಮುಖಪುಟಕ್ಕೆ ತೆರಳಿ (Home)"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#0a1b33] flex items-center justify-center p-1 border border-amber-300/40">
                {/* Karnataka Gandaberunda / Ashoka Emblem SVG representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300 text-amber-400 drop-shadow">
                  {/* Outer circle */}
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  {/* Two Headed Eagle Gandaberunda / Karnataka State Seal */}
                  <path d="M50 16 L53 23 L60 23 L54 28 L57 35 L50 31 L43 35 L46 28 L40 23 L47 23 Z" fill="#fbbf24" />
                  <path d="M50 35 C38 35 30 46 30 58 C30 70 38 78 50 82 C62 78 70 70 70 58 C70 46 62 35 50 35 Z" fill="#b45309" stroke="#fef08a" strokeWidth="1.5" />
                  <circle cx="50" cy="56" r="14" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2" />
                  {/* Ashoka Chakra spokes */}
                  <line x1="50" y1="44" x2="50" y2="68" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="38" y1="56" x2="62" y2="56" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="41" y1="47" x2="59" y2="65" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="41" y1="65" x2="59" y2="47" stroke="#fbbf24" strokeWidth="1.5" />
                  {/* Wings */}
                  <path d="M22 45 C15 52 14 65 24 73 C26 68 28 62 33 58 Z" fill="#fbbf24" />
                  <path d="M78 45 C85 52 86 65 76 73 C74 68 72 62 67 58 Z" fill="#fbbf24" />
                </svg>
              </div>
            </div>

            {/* Thin vertical divider */}
            <div className="w-[1.5px] h-9 bg-white/25 hidden sm:block"></div>

            {/* Office Title in Bold White Kannada */}
            <div className="flex flex-col text-left">
              <h1 className="font-extrabold text-white text-sm sm:text-base md:text-lg tracking-tight font-kannada leading-tight drop-shadow-xs group-hover:text-amber-200 transition-colors">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ, ಭದ್ರಾವತಿ
              </h1>
              <p className="text-[11px] text-amber-300/90 font-kannada font-medium tracking-wide hidden sm:block leading-tight">
                ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ • ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ | ಇ-ಕಛೇರಿ ತಂತ್ರಾಂಶ
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div ref={searchBoxRef} className="relative flex-1 max-w-xs md:max-w-md hidden lg:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="ಕಡತ, ಪತ್ರ, ಸುತ್ತೋಲೆ, ನೌಕರರ ಹುಡುಕಾಟ..."
              className="w-full bg-[#0a1b33]/85 text-white placeholder-stone-400 text-xs pl-9 pr-3 py-2 rounded-xl border border-sky-400/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 font-kannada transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && hasResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d2240] border border-sky-500/30 rounded-xl shadow-2xl overflow-hidden z-50 text-xs">
              {searchResults.files.length > 0 && (
                <div className="p-2 border-b border-white/10">
                  <div className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5">ಕಡತಗಳು (Files)</div>
                  {searchResults.files.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onNavigate('files', { fileId: f.id });
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-stone-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono text-amber-200 font-bold">{f.fileNumber}</span>
                      <span className="truncate max-w-[200px] text-stone-300 font-kannada">{f.subject}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.letters.length > 0 && (
                <div className="p-2 border-b border-white/10">
                  <div className="text-[10px] uppercase font-bold text-sky-400 px-2 py-0.5">ಪತ್ರಗಳು (Letters)</div>
                  {searchResults.letters.map(l => (
                    <button
                      key={l.id}
                      onClick={() => {
                        onNavigate('registry');
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-stone-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono text-sky-200 font-bold">{l.letterNumber}</span>
                      <span className="truncate max-w-[200px] text-stone-300 font-kannada">{l.subject}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.employees.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5">ನೌಕರರು (Employees)</div>
                  {searchResults.employees.map(e => (
                    <button
                      key={e.id}
                      onClick={() => {
                        onNavigate('employees');
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-stone-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-bold text-emerald-200 font-kannada">{e.name}</span>
                      <span className="text-stone-300 font-mono text-[11px]">{e.kgidNumber || e.designation}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Language Toggle, Online Status, Clock, User Dropdown, Settings, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Online / Offline status */}
          <div 
            className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-colors ${
              isOnline 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60' 
                : 'bg-rose-950/60 text-rose-300 border-rose-600/60'
            }`}
            title={isOnline ? 'ಆನ್‌ಲೈನ್ ಸಂಪರ್ಕ ಸಕ್ರಿಯವಾಗಿದೆ' : 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ (PWA Offline)'}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Real-time Clock */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-stone-300 text-xs font-mono bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeString}</span>
          </div>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(prev => prev === 'kn' ? 'en' : 'kn')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold border border-white/15 cursor-pointer transition-colors"
            title="ಭಾಷೆ ಬದಲಿಸಿ / Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'kn' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* AI Assistant Quick Pill */}
          {onOpenAiChat && (
            <button
              type="button"
              onClick={onOpenAiChat}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold border border-purple-400/40 cursor-pointer shadow-xs transition-all hover:scale-105"
              title="KCSR & RTI AI ಸಹಾಯಕ (Gemini 3.8 Flash)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-kannada">AI ಸಹಾಯಕ</span>
            </button>
          )}

          {/* User Dropdown */}
          <div ref={userDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-[#071326] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'ಕೇ'}
              </div>
              <div className="text-left hidden sm:block leading-tight">
                <span className="block font-kannada text-xs font-bold max-w-[120px] truncate">
                  {currentUser?.displayName || 'ಕೇಸ್‌ವರ್ಕರ್ ಲಾಗಿನ್'}
                </span>
                <span className="block text-[10px] text-amber-300 font-mono">
                  {currentUser?.role || 'Case Worker'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0a1b33] border border-sky-400/30 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white font-kannada">
                    {currentUser?.displayName || 'ಕೇಸ್‌ವರ್ಕರ್ ಲಾಗಿನ್'}
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {currentUser?.username || 'caseworker@beo'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    {currentUser?.role || 'Case Worker'}
                  </span>
                </div>

                <div className="py-1">
                  {onOpenUserModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenUserModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-kannada text-stone-200 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-sky-400" />
                      <span>ಬಳಕೆದಾರರ ವಿವರ & ಖಾತೆ</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-kannada text-stone-200 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>ಸೆಟ್ಟಿಂಗ್ಸ್ & ಬ್ಯಾಕಪ್</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Button with Gear Icon */}
          <button
            type="button"
            id="btn-header-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
            title="ಸೆಟ್ಟಿಂಗ್ಸ್ & ಬ್ಯಾಕಪ್"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span className="hidden xl:inline text-xs font-bold font-kannada">ಸೆಟ್ಟಿಂಗ್ಸ್</span>
          </button>

          {/* Red Logout Button with Power Icon */}
          {onLogout && (
            <button
              type="button"
              id="btn-header-logout"
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-md border border-red-400/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              title="ಲಾಗ್ ಔಟ್ (Logout)"
            >
              <Power className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span className="hidden sm:inline font-kannada">ಲಾಗ್ ಔಟ್</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
