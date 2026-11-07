import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Copy,
  Check,
  Award,
  ShieldAlert,
  Coins,
  Scale,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Printer,
  ExternalLink,
  Bookmark,
  Share2,
  Trash2,
  Star,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import {
  StatutoryBookKey,
  StatutoryCategory,
  StatutoryRule,
  STATUTORY_BOOKS_INFO,
  KARNATAKA_STATUTORY_RULES,
  getRulesByBook
} from '../data/karnatakaStatutoryBooks';
import { AppNavTab } from '../types';

const BOOKMARKS_STORAGE_KEY = 'karnataka_statutory_rule_bookmarks';

// Popular quick search suggestion chips for government office staff
const QUICK_SEARCH_CHIPS = [
  { label: 'KCSR 112 (ಗಳಿಕೆ ರಜೆ)', query: '112' },
  { label: 'KCSR 135B (ಶಿಶುಪಾಲನಾ ರಜೆ)', query: '135B' },
  { label: 'KCSR 51 (ವೇತನ ಬಡ್ತಿ)', query: '51' },
  { label: 'KFC 99 (ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ)', query: '99' },
  { label: 'KFC 138 (ಅನುದಾನ & UC)', query: '138' },
  { label: 'CCA 10 (ಅಮಾನತು)', query: '10' },
  { label: 'CCA 11 (ಕಾರಣ ಕೇಳುವ ನೋಟೀಸ್)', query: '11' },
  { label: 'KCSR 287 (ನಿವೃತ್ತಿ ವೇತನ)', query: '287' },
  { label: 'Conduct 13 (ಖಾಸಗಿ ಟ್ಯೂಷನ್ ನಿಷೇಧ)', query: '13' },
  { label: 'ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 39 (ಮಾನ್ಯತೆ)', query: '39' }
];

interface StatutoryBooksViewProps {
  onNavigateToTab?: (tab: AppNavTab, extraState?: any) => void;
  currentUser?: { displayName?: string; role?: string } | null;
}

export const StatutoryBooksView: React.FC<StatutoryBooksViewProps> = ({
  onNavigateToTab,
  currentUser
}) => {
  // Top-level View Tab: 'all' (All Books) | 'bookmarks' (My Bookmarks)
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'bookmarks'>('all');
  
  // Filtering states
  const [selectedBook, setSelectedBook] = useState<StatutoryBookKey | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<StatutoryCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI interaction states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Bookmarks state with localStorage persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading bookmarks from storage', e);
    }
    // Default starter bookmarks for civil service staff
    return ['kcsr-112', 'kfc-99', 'cca-10'];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  }, [bookmarkedIds]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const toggleBookmark = (ruleId: string, ruleName: string) => {
    setBookmarkedIds(prev => {
      const exists = prev.includes(ruleId);
      if (exists) {
        showToast(`🔖 "${ruleName}" ನಿಯಮವನ್ನು ಬುಕ್‌ಮಾರ್ಕ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`);
        return prev.filter(id => id !== ruleId);
      } else {
        showToast(`⭐ "${ruleName}" ನಿಯಮವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ!`);
        return [...prev, ruleId];
      }
    });
  };

  const handleClearAllBookmarks = () => {
    if (window.confirm('ಖಚಿತವಾಗಿ ಎಲ್ಲಾ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಲು ಬಯಸುವಿರಾ? (Clear all bookmarks?)')) {
      setBookmarkedIds([]);
      showToast('ಎಲ್ಲಾ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.');
    }
  };

  const handleAddDefaultBookmarks = () => {
    setBookmarkedIds(['kcsr-112', 'kcsr-51', 'kfc-99', 'cca-10', 'conduct-13']);
    showToast('ಪ್ರಮುಖ 5 ಶಾಸನಬದ್ಧ ನಿಯಮಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!');
  };

  // Filter rules based on view tab, book, category, and keyword search
  const filteredRules = useMemo(() => {
    let list = KARNATAKA_STATUTORY_RULES;

    // Filter by bookmarks if in 'bookmarks' tab
    if (activeViewTab === 'bookmarks') {
      list = list.filter(r => bookmarkedIds.includes(r.id));
    }

    if (selectedBook !== 'ALL') {
      list = list.filter(r => r.book === selectedBook);
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(r => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.ruleNumber.toLowerCase().includes(q) ||
        r.titleKannada.toLowerCase().includes(q) ||
        r.titleEnglish.toLowerCase().includes(q) ||
        r.summaryKannada.toLowerCase().includes(q) ||
        r.citationSnippet.toLowerCase().includes(q) ||
        r.orderClauseSnippet.toLowerCase().includes(q) ||
        r.book.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeViewTab, bookmarkedIds, selectedBook, selectedCategory, searchQuery]);

  // Bookmarked rules count
  const totalBookmarkedCount = bookmarkedIds.length;

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`${label} ನಕಲಿಸಲಾಗಿದೆ (Copied)!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDraftLetterFromRule = (rule: StatutoryRule) => {
    if (onNavigateToTab) {
      if (rule.category === 'pension') {
        onNavigateToTab('pension', { citedRule: rule });
      } else if (rule.category === 'pay_increment') {
        onNavigateToTab('memorandum', { citedRule: rule });
      } else {
        onNavigateToTab('generalLetter', { citedRule: rule });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-amber-300 border-2 border-amber-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-kannada text-xs font-bold animate-bounce">
          <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Directorate Banner */}
      <div className="bg-gradient-to-r from-[#2b2b2b] via-[#3a3a3a] to-[#2b2b2b] text-white p-6 sm:p-8 rounded-2xl border-[2.5px] border-[#2b2b2b] shadow-[6px_6px_0px_#f59e0b] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b] text-[#2b2b2b] text-xs font-bold font-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ಕರ್ನಾಟಕ ಶಾಸನಬದ್ಧ ನಿಯಮಾವಳಿಗಳ ಭಂಡಾರ (Statutory Rule Books)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-kannada tracking-tight text-[#fffbf2]">
              KCSR, KFC, KCS (CCA) & ನಡತೆ ನಿಯಮಾವಳಿಗಳ ಡಿಜಿಟಲ್ ಗ್ರಂಥಾಲಯ
            </h1>
            <p className="text-sm text-stone-300 max-w-3xl font-kannada leading-relaxed">
              ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR 1958), ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ (KFC 1958), ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು ನಿಯಮಗಳು (CCA 1957) ಹಾಗೂ ನಡತೆ ನಿಯಮಗಳು. ಪ್ರತಿಯೊಂದು ನಿಯಮದೊಂದಿಗೆ ಪತ್ರ ತಯಾರಿಕೆಗೆ ಅಧಿಕೃತ ಉಲ್ಲೇಖ (Reference) ಮತ್ತು ಆದೇಶ ವಾಕ್ಯಗಳು (Order Clauses) ಲಭ್ಯ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer font-kannada"
            >
              <Printer className="w-4 h-4 text-stone-300" />
              <span>ನಿಯಮಾವಳಿ ಮುದ್ರಿಸಿ</span>
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('generalLetter')}
              className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer font-kannada shadow-[3px_3px_0px_#fff]"
            >
              <FileText className="w-4 h-4" />
              <span>ಸಾಮಾನ್ಯ ಪತ್ರಕ್ಕೆ ತೆರಳಿ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔖 MAIN VIEW TABS: [All Rules] vs [My Bookmarks] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-stone-850 shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer font-kannada ${
              activeViewTab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>ಎಲ್ಲಾ ನಿಯಮಗಳು (All Rules)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-750 text-stone-200 font-mono">
              {KARNATAKA_STATUTORY_RULES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('bookmarks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer font-kannada ${
              activeViewTab === 'bookmarks'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-2 ring-amber-600'
                : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeViewTab === 'bookmarks' ? 'fill-stone-950 text-stone-950' : 'text-amber-700'}`} />
            <span>ನನ್ನ ಮೆಚ್ಚಿನ ನಿಯಮಗಳು (My Bookmarks)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeViewTab === 'bookmarks'
                ? 'bg-stone-950 text-amber-400'
                : 'bg-amber-200 text-amber-900'
            }`}>
              {totalBookmarkedCount}
            </span>
          </button>
        </div>

        {/* Quick info or Bookmark tools */}
        {activeViewTab === 'bookmarks' && (
          <div className="flex items-center gap-2 self-end sm:self-auto px-2">
            {totalBookmarkedCount > 0 ? (
              <button
                type="button"
                onClick={handleClearAllBookmarks}
                className="text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5 font-kannada font-bold cursor-pointer transition-colors"
                title="ಎಲ್ಲಾ ಬುಕ್‌ಮಾರ್ಕ್ ತೆಗೆದುಹಾಕಿ"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ಎಲ್ಲಾ ಬುಕ್‌ಮಾರ್ಕ್ ತೆರವುಗೊಳಿಸಿ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddDefaultBookmarks}
                className="text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 font-kannada font-bold cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>ಪ್ರಮುಖ 5 ನಿಯಮಗಳನ್ನು ಸೇರಿಸಿ</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Book Statistics & Quick Overview Grid (Active when in 'all' view) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {(Object.keys(STATUTORY_BOOKS_INFO) as StatutoryBookKey[]).map((key) => {
          const info = STATUTORY_BOOKS_INFO[key];
          const isSelected = selectedBook === key;
          const bookmarkedInThisBook = KARNATAKA_STATUTORY_RULES.filter(
            r => r.book === key && bookmarkedIds.includes(r.id)
          ).length;

          return (
            <button
              key={key}
              onClick={() => setSelectedBook(isSelected ? 'ALL' : key)}
              className={`p-3.5 rounded-xl border-2 border-[#2b2b2b] text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#2b2b2b] text-white shadow-[4px_4px_0px_#f59e0b] -translate-y-1'
                  : 'bg-white text-stone-800 hover:bg-[#fffbf2] shadow-[3px_3px_0px_#2b2b2b]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#f59e0b] text-[#2b2b2b]' : 'bg-stone-100 text-stone-700'}`}>
                    {key}
                  </span>
                  <div className="flex items-center gap-1">
                    {bookmarkedInThisBook > 0 && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center" title={`${bookmarkedInThisBook} ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ`}>
                        ★{bookmarkedInThisBook}
                      </span>
                    )}
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#f59e0b]' : 'text-stone-500'}`}>
                      {info.ruleCount}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-xs font-kannada line-clamp-1">
                  {key === 'KCSR' && 'KCSR 1958'}
                  {key === 'KFC' && 'KFC ಹಣಕಾಸು'}
                  {key === 'CCA' && 'CCA ಶಿಸ್ತು ಕ್ರಮ'}
                  {key === 'CONDUCT' && 'ನಡತೆ ನಿಯಮ'}
                  {key === 'KSMOP' && 'ಕಚೇರಿ ಕೈಪಿಡಿ'}
                  {key === 'KTC' && 'ಖಜಾನೆ ಸಂಹಿತೆ'}
                  {key === 'EDU_ACT' && 'ಶಿಕ್ಷಣ ಕಾಯ್ದೆ'}
                </div>
              </div>
              <span className="text-[10px] text-stone-400 mt-2 font-mono">
                ವರ್ಷ: {info.promulgatedYear}
              </span>
            </button>
          );
        })}
      </div>

      {/* 🔍 PROMINENT SEARCH AND FILTERS SECTION */}
      <div className="bg-[#fffbf2] border-2 border-[#2b2b2b] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#2b2b2b] space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none flex items-center gap-1.5">
            <Search className="w-5 h-5 text-amber-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ನಿಯಮ ಸಂಖ್ಯೆ (112, 51, 95, 99, 10, 138, 287) ಅಥವಾ ಕೀವರ್ಡ್ (ಗಳಿಕೆ ರಜೆ, ವೇತನ ಬಡ್ತಿ, ಅಮಾನತು, ಅನುದಾನ, ಪಿಂಚಣಿ, DCRG, ಶಿಶುಪಾಲನ ರಜೆ) ಹುಡುಕಿ..."
            className="w-full pl-11 pr-24 py-3.5 bg-white border-2 border-stone-900 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-kannada text-stone-900 text-sm font-bold placeholder:text-stone-400 placeholder:font-normal"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-kannada transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>ತೆರವು</span>
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-stone-100 border border-stone-200 text-[10px] text-stone-500 font-mono">
              <span>CTRL + F</span>
            </div>
          )}
        </div>

        {/* ⚡ Quick Search Keyword Chips for Fast Navigation */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-600 font-kannada">
            <span className="font-bold flex items-center gap-1 text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ತ್ವರಿತ ಕೀವರ್ಡ್ ಶೋಧನೆ (Quick Keyword Filters):</span>
            </span>
            <span className="text-[11px] text-stone-500">ಕ್ಲಿಕ್ ಮಾಡಿ ಶೋಧಿಸಿ</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_SEARCH_CHIPS.map((chip, idx) => {
              const isActive = searchQuery === chip.query;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(isActive ? '' : chip.query)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold font-kannada transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-stone-900 shadow-xs ring-1 ring-amber-600 font-black'
                      : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-300 hover:border-amber-400'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/80">
          <span className="text-xs font-bold text-stone-700 font-kannada mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#f59e0b]" /> ವರ್ಗೀಕರಣ:
          </span>
          {[
            { id: 'ALL', label: 'ಎಲ್ಲಾ ವರ್ಗಗಳು' },
            { id: 'leave', label: '🏖️ ರಜೆಗಳು (EL, HPL, CCL, Maternity)' },
            { id: 'pay_increment', label: '📈 ವೇತನ ಬಡ್ತಿ (Increment & Scales)' },
            { id: 'finance_grant', label: '💰 ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ & ಅನುದಾನ (KFC)' },
            { id: 'discipline', label: '⚖️ ಶಿಸ್ತು & ಅಮಾನತು (KCS CCA 1957)' },
            { id: 'pension', label: '🎖️ ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ (Pension, DCRG, CVP)' },
            { id: 'conduct', label: '🛡️ ನಡತೆ & ಆಸ್ತಿ ನಿಯಮಗಳು (Conduct 1966)' },
            { id: 'office_procedure', label: '📁 ಕಚೇರಿ & ಖಜಾನೆ (KSMOP & KTC)' },
            { id: 'education', label: '🎓 ಶಿಕ್ಷಣ ಕಾಯ್ದೆ & RTE' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-kannada transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#2b2b2b] text-[#f59e0b] border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Rules Compendium List */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-100 p-3 rounded-xl border border-stone-200">
          <div className="text-xs sm:text-sm font-bold text-stone-800 font-kannada flex items-center gap-2 flex-wrap">
            <span>
              {activeViewTab === 'bookmarks' ? '🔖 ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಲಾದ ನಿಯಮಗಳು:' : 'ತೋರಿಸಲಾಗುತ್ತಿರುವ ನಿಯಮಗಳು:'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 font-mono font-black text-xs sm:text-sm">
              {filteredRules.length}
            </span>
            {selectedBook !== 'ALL' && (
              <span className="text-stone-600 font-normal">
                ({STATUTORY_BOOKS_INFO[selectedBook].titleEnglish})
              </span>
            )}
            {searchQuery && (
              <span className="text-xs font-normal text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                ಕೀವರ್ಡ್: "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(selectedBook !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBook('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-700 hover:text-blue-900 hover:underline font-bold font-kannada cursor-pointer"
              >
                ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ (Reset Filters)
              </button>
            )}
          </div>
        </div>

        {/* EMPTY STATE FOR BOOKMARKS TAB */}
        {activeViewTab === 'bookmarks' && filteredRules.length === 0 && (
          <div className="bg-white border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Bookmark className="w-7 h-7 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-stone-900 font-kannada">
                {searchQuery ? 'ಯಾವುದೇ ಬುಕ್‌ಮಾರ್ಕ್ ಈ ಕೀವರ್ಡ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ' : 'ಯಾವುದೇ ನಿಯಮವನ್ನು ಇನ್ನೂ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿಲ್ಲ'}
              </h3>
              <p className="text-xs text-stone-600 font-kannada max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `"${searchQuery}" ಶೋಧನೆಗೆ ಸಂಬಂಧಿಸಿದ ನಿಯಮಗಳು ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್‌ನಲ್ಲಿ ಇಲ್ಲ.`
                  : 'ಕಛೇರಿಯ ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಪುನರಾವರ್ತಿತವಾಗಿ ಉಲ್ಲೇಖಿಸುವ ನಿಯಮಗಳನ್ನು (ಉದಾಹರಣೆಗೆ KCSR ರಜೆ ನಿಯಮಗಳು, KFC ಮಂಜೂರಾತಿ, CCA ಶಿಸ್ತು ಕ್ರಮಗಳು) ಸುಲಭ ಪ್ರವೇಶಕ್ಕಾಗಿ ಕಾರ್ಡ್‌ನ ಮೇಲಿರುವ 🔖 ಐಕಾನ್ ಒತ್ತಿ ಸೇವ್ ಮಾಡಿಕೊಳ್ಳಿ.'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAddDefaultBookmarks}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs font-kannada border-2 border-stone-900 shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>ಪ್ರಮುಖ 5 ನಿಯಮಗಳನ್ನು ಈಗಲೇ ಸೇರಿಸಿ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('all')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs font-kannada border border-stone-300 cursor-pointer"
              >
                ಎಲ್ಲಾ ನಿಯಮಗಳ ಪಟ್ಟಿ ನೋಡಿ
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE FOR ALL RULES SEARCH */}
        {activeViewTab === 'all' && filteredRules.length === 0 && (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 font-kannada">
              ಯಾವುದೇ ನಿಯಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ
            </h3>
            <p className="text-xs text-stone-500 font-kannada">
              "{searchQuery}" ಕೀವರ್ಡ್‌ಗೆ ಸಂಬಂಧಿಸಿದ ನಿಯಮಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕಾಗುಣಿತ ಅಥವಾ ನಿಯಮ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedBook('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-xs px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg font-kannada cursor-pointer"
            >
              ಎಲ್ಲಾ ನಿಯಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ
            </button>
          </div>
        )}

        {/* Rule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const bookMeta = STATUTORY_BOOKS_INFO[rule.book];
            const isBookmarked = bookmarkedIds.includes(rule.id);

            return (
              <div
                key={rule.id}
                className={`bg-white border-2 rounded-2xl p-5 transition-all flex flex-col justify-between ${
                  isBookmarked
                    ? 'border-amber-400 shadow-[5px_5px_0px_#f59e0b] ring-1 ring-amber-400/50'
                    : 'border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] hover:shadow-[6px_6px_0px_#2b2b2b]'
                }`}
              >
                <div>
                  {/* Card Header & Bookmark Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${bookMeta?.badgeColor}`}>
                          {rule.book}: {rule.ruleNumber}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {rule.chapterOrPart}
                        </span>
                        {isBookmarked && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-kannada flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>ಉಳಿಸಲಾಗಿದೆ</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-[#2b2b2b] font-kannada leading-tight">
                        {rule.titleKannada}
                      </h3>
                      <div className="text-xs text-stone-500 font-sans mt-0.5">
                        {rule.titleEnglish}
                      </div>
                    </div>

                    {/* Bookmark Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(rule.id, `${rule.book} ${rule.ruleNumber} - ${rule.titleKannada}`)}
                      className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
                        isBookmarked
                          ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 border-stone-900 shadow-xs'
                          : 'bg-stone-50 hover:bg-amber-100 text-stone-500 hover:text-stone-900 border-stone-300'
                      }`}
                      title={isBookmarked ? 'ಬುಕ್‌ಮಾರ್ಕ್‌ನಿಂದ ತೆಗೆದುಹಾಕಿ' : 'ನನ್ನ ಮೆಚ್ಚಿನ ನಿಯಮಗಳಿಗೆ ಉಳಿಸಿ'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-stone-950 text-stone-950' : 'text-stone-600'}`} />
                    </button>
                  </div>

                  {/* Summary */}
                  <p className="text-xs sm:text-[13px] text-stone-700 font-kannada leading-relaxed my-3 bg-[#fdfbf7] p-3 rounded-xl border border-stone-200">
                    {rule.summaryKannada}
                  </p>

                  {/* Pre-formatted Citations for Letters */}
                  <div className="space-y-2 mb-4">
                    <div className="bg-[#fffbf2] p-2.5 rounded-lg border border-amber-200 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 font-kannada mb-1">
                        <span>📌 ಉಲ್ಲೇಖದ ನಮೂನೆ (Reference Snippet):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(rule.citationSnippet, `${rule.id}-ref`, 'ಉಲ್ಲೇಖ')}
                          className="text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-kannada"
                          title="ನಕಲಿಸಿ"
                        >
                          {copiedId === `${rule.id}-ref` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === `${rule.id}-ref` ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'ನಕಲಿಸಿ'}</span>
                        </button>
                      </div>
                      <p className="text-stone-800 font-kannada text-xs italic">
                        "{rule.citationSnippet}"
                      </p>
                    </div>

                    <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 font-kannada mb-1">
                        <span>📜 ಆದೇಶ / ಪ್ರಸ್ತಾವನೆಯ ವಾಕ್ಯ (Order Clause):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(rule.orderClauseSnippet, `${rule.id}-order`, 'ಆದೇಶ ವಾಕ್ಯ')}
                          className="text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-kannada"
                          title="ನಕಲಿಸಿ"
                        >
                          {copiedId === `${rule.id}-order` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === `${rule.id}-order` ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'ನಕಲಿಸಿ'}</span>
                        </button>
                      </div>
                      <p className="text-stone-700 font-kannada text-xs italic">
                        "{rule.orderClauseSnippet}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {rule.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-kannada">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="no-print px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border-2 border-stone-700 flex items-center gap-1.5 transition cursor-pointer font-kannada"
                      title="ನಿಯಮ ಮುದ್ರಿಸಿ (Print Official A4 Rule)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>ಪ್ರಿಂಟ್</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDraftLetterFromRule(rule)}
                      className="px-3.5 py-1.5 bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] text-xs font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] hover:shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-1.5 transition cursor-pointer font-kannada"
                      title="ಈ ನಿಯಮದ ಉಲ್ಲೇಖದೊಂದಿಗೆ ಹೊಸ ಪತ್ರ ತಯಾರಿಸಿ"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ಈ ನಿಯಮದಿಂದ ಪತ್ರ ತಯಾರಿಸಿ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
