import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  X,
  Search,
  Check,
  Copy,
  Plus,
  FileText,
  ShieldAlert,
  Coins,
  Scale,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  BookmarkPlus,
  Bookmark,
  Star
} from 'lucide-react';
import {
  StatutoryBookKey,
  StatutoryCategory,
  StatutoryRule,
  STATUTORY_BOOKS_INFO,
  KARNATAKA_STATUTORY_RULES
} from '../data/karnatakaStatutoryBooks';

const BOOKMARKS_STORAGE_KEY = 'karnataka_statutory_rule_bookmarks';

const MODAL_QUICK_CHIPS = [
  { label: 'KCSR 112 (ರಜೆ)', query: '112' },
  { label: 'KCSR 135B (ಶಿಶುಪಾಲನೆ)', query: '135B' },
  { label: 'KCSR 51 (ವೇತನ ಬಡ್ತಿ)', query: '51' },
  { label: 'KFC 99 (ಮಂಜೂರಾತಿ)', query: '99' },
  { label: 'KFC 138 (ಅನುದಾನ)', query: '138' },
  { label: 'CCA 10 (ಅಮಾನತು)', query: '10' },
  { label: 'CCA 11 (ನೋಟಿಸ್)', query: '11' },
  { label: 'Conduct 13 (ಟ್ಯೂಷನ್ ನಿಷೇಧ)', query: '13' }
];

interface StatutoryRuleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertReference?: (citation: string, rule: StatutoryRule) => void;
  onInsertSubject?: (subject: string, rule: StatutoryRule) => void;
  onInsertBody?: (orderClause: string, rule: StatutoryRule) => void;
  targetContextName?: string; // e.g. "ಸಾಮಾನ್ಯ ಪತ್ರ", "ಜ್ಞಾಪನಾ ಆದೇಶ", "ಅಧಿಕೃತ ಪತ್ರ", "ಸುತ್ತೋಲೆ"
}

export const StatutoryRuleSelectorModal: React.FC<StatutoryRuleSelectorModalProps> = ({
  isOpen,
  onClose,
  onInsertReference,
  onInsertSubject,
  onInsertBody,
  targetContextName = 'ಪತ್ರ'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<StatutoryBookKey | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<StatutoryCategory | 'ALL'>('ALL');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Bookmarks state synced with localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['kcsr-112', 'kfc-99', 'cca-10'];
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (saved) setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  const toggleBookmark = (ruleId: string, ruleName: string) => {
    setBookmarkedIds(prev => {
      const exists = prev.includes(ruleId);
      const next = exists ? prev.filter(id => id !== ruleId) : [...prev, ruleId];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showFeedback(exists ? `ಬುಕ್‌ಮಾರ್ಕ್‌ನಿಂದ ತೆಗೆಯಲಾಗಿದೆ` : `🔖 "${ruleName}" ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ!`);
      return next;
    });
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const filteredRules = useMemo(() => {
    let list = KARNATAKA_STATUTORY_RULES;

    if (onlyBookmarks) {
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
  }, [searchQuery, selectedBook, selectedCategory, onlyBookmarks, bookmarkedIds]);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showFeedback(`${label} ನಕಲಿಸಲಾಗಿದೆ (Copied)!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertReference = (rule: StatutoryRule) => {
    if (onInsertReference) {
      onInsertReference(rule.citationSnippet, rule);
      showFeedback(`ಉಲ್ಲೇಖಕ್ಕೆ "${rule.ruleNumber}" ಸೇರಿಸಲಾಗಿದೆ!`);
    } else {
      handleCopy(rule.citationSnippet, rule.id, 'ಉಲ್ಲೇಖ');
    }
  };

  const handleInsertSubject = (rule: StatutoryRule) => {
    if (onInsertSubject) {
      onInsertSubject(rule.subjectSnippet, rule);
      showFeedback(`ವಿಷಯಕ್ಕೆ "${rule.ruleNumber}" ಅಳವಡಿಸಲಾಗಿದೆ!`);
    } else {
      handleCopy(rule.subjectSnippet, rule.id, 'ವಿಷಯ');
    }
  };

  const handleInsertBody = (rule: StatutoryRule) => {
    if (onInsertBody) {
      onInsertBody(rule.orderClauseSnippet, rule);
      showFeedback(`ಆದೇಶದ ವಿವರಕ್ಕೆ "${rule.ruleNumber}" ಸೇರಿಸಲಾಗಿದೆ!`);
    } else {
      handleCopy(rule.orderClauseSnippet, rule.id, 'ಆದೇಶ ವಾಕ್ಯ');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-2xl shadow-[8px_8px_0px_#2b2b2b] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#2b2b2b] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#2b2b2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-bold shadow-[2px_2px_0px_#fff]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-kannada">
                  KCSR, KFC, CCA & ಇತರೆ ಶಾಸನಬದ್ಧ ನಿಯಮ ಪುಸ್ತಕಗಳು
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f59e0b] text-[#2b2b2b]">
                  RULE SELECTOR
                </span>
              </div>
              <p className="text-xs text-stone-300 font-kannada">
                {targetContextName} ತಯಾರಿಸಲು ನಿಯಮ ಆರಿಸಿ, ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಉಲ್ಲೇಖ, ವಿಷಯ ಅಥವಾ ಆದೇಶಕ್ಕೆ ಸೇರಿಸಿ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 transition cursor-pointer"
            title="ಮುಚ್ಚಿ (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Toast Notification */}
        {feedbackMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold font-kannada flex items-center justify-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="bg-[#fefce8] p-4 border-b-2 border-[#2b2b2b] flex flex-col gap-3">
          {/* Search Input & Quick Chips */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ನಿಯಮ ಸಂಖ್ಯೆ (112, 51, 99, 10, 138, 287) ಅಥವಾ ಕೀವರ್ಡ್ (ಗಳಿಕೆ ರಜೆ, ವೇತನ ಬಡ್ತಿ, ಅಮಾನತು, ಅನುದಾನ, ಪಿಂಚಣಿ) ಹುಡುಕಿ..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border-2 border-[#2b2b2b] rounded-xl shadow-[3px_3px_0px_#2b2b2b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] font-kannada text-[#2b2b2b] placeholder-stone-400 font-bold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Chips in Modal */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-stone-600 font-kannada flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> ತ್ವರಿತ ಶೋಧ:
              </span>
              {MODAL_QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(searchQuery === chip.query ? '' : chip.query)}
                  className={`text-[11px] px-2 py-0.5 rounded font-kannada font-bold border transition cursor-pointer ${
                    searchQuery === chip.query
                      ? 'bg-amber-500 text-stone-950 border-stone-900'
                      : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Book Filter Chips & Bookmarks Tab */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold font-kannada">
            <span className="text-[11px] text-stone-600 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#f59e0b]" /> ಫಿಲ್ಟರ್:
            </span>

            {/* My Bookmarks Toggle Button */}
            <button
              type="button"
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`px-3 py-1 rounded-lg border-2 border-[#2b2b2b] flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyBookmarks
                  ? 'bg-amber-500 text-stone-950 font-black shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-stone-950 text-stone-950' : 'text-amber-800'}`} />
              <span>ನನ್ನ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-400 font-mono">
                {bookmarkedIds.length}
              </span>
            </button>

            <button
              onClick={() => { setSelectedBook('ALL'); setOnlyBookmarks(false); }}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'ALL' && !onlyBookmarks
                  ? 'bg-[#2b2b2b] text-[#f59e0b] shadow-[2px_2px_0px_#f59e0b]'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              ಎಲ್ಲಾ ನಿಯಮಗಳು ({KARNATAKA_STATUTORY_RULES.length})
            </button>
            <button
              onClick={() => setSelectedBook('KCSR')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'KCSR'
                  ? 'bg-amber-600 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              📖 KCSR 1958
            </button>
            <button
              onClick={() => setSelectedBook('KFC')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'KFC'
                  ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              💰 KFC 1958
            </button>
            <button
              onClick={() => setSelectedBook('CCA')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'CCA'
                  ? 'bg-rose-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
              }`}
            >
              ⚖️ CCA 1957
            </button>
            <button
              onClick={() => setSelectedBook('CONDUCT')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'CONDUCT'
                  ? 'bg-purple-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
            >
              📜 ನಡತೆ 1966
            </button>
            <button
              onClick={() => setSelectedBook('KSMOP')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'KSMOP'
                  ? 'bg-blue-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              }`}
            >
              📁 KSMOP
            </button>
            <button
              onClick={() => setSelectedBook('KTC')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'KTC'
                  ? 'bg-teal-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
              }`}
            >
              🏦 KTC
            </button>
            <button
              onClick={() => setSelectedBook('EDU_ACT')}
              className={`px-2.5 py-1 rounded-lg border-2 border-[#2b2b2b] transition-all cursor-pointer ${
                selectedBook === 'EDU_ACT'
                  ? 'bg-indigo-700 text-white shadow-[2px_2px_0px_#2b2b2b]'
                  : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
              }`}
            >
              🎓 ಶಿಕ್ಷಣ ಕಾಯ್ದೆ
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold font-kannada">
            <span className="text-[11px] text-stone-600 mr-1">ವಿಭಾಗ:</span>
            {[
              { id: 'ALL', label: 'ಎಲ್ಲಾ' },
              { id: 'leave', label: '🏖️ ರಜೆಗಳು (EL/HPL/CCL/Maternity)' },
              { id: 'pay_increment', label: '📈 ವೇತನ ಬಡ್ತಿ (Increment / ಪ್ರಪತ್ರ-28)' },
              { id: 'finance_grant', label: '💵 ಆರ್ಥಿಕ & ಅನುದಾನ (KFC Sanction/UC)' },
              { id: 'discipline', label: '⚠️ ಶಿಸ್ತು & ಅಮಾನತು (CCA Inquiry)' },
              { id: 'pension', label: '🎖️ ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ (Retirement/DCRG)' },
              { id: 'conduct', label: '🛡️ ನಡತೆ & ಆಸ್ತಿ (Conduct/Tuition)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#f59e0b] text-[#2b2b2b] font-bold shadow-xs'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Cards List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fdfbf7]">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-stone-300">
              <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <p className="text-stone-700 font-bold font-kannada">ಯಾವುದೇ ನಿಯಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
              <p className="text-stone-500 text-xs font-kannada mt-1">
                {onlyBookmarks ? 'ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್‌ನಲ್ಲಿ ನಿಯಮಗಳಿಲ್ಲ. "ಎಲ್ಲಾ ನಿಯಮಗಳು" ಕ್ಲಿಕ್ ಮಾಡಿ 🔖 ಐಕಾನ್ ಒತ್ತಿ ಸೇವ್ ಮಾಡಿ.' : 'ಬೇರೆ ಕೀವರ್ಡ್ ಅಥವಾ ನಿಯಮ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ ಹುಡುಕಿ.'}
              </p>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const bookMeta = STATUTORY_BOOKS_INFO[rule.book];
              const isBookmarked = bookmarkedIds.includes(rule.id);

              return (
                <div
                  key={rule.id}
                  className={`bg-white border-2 rounded-xl p-4 transition-all ${
                    isBookmarked
                      ? 'border-amber-400 shadow-[4px_4px_0px_#f59e0b]'
                      : 'border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] hover:shadow-[5px_5px_0px_#2b2b2b]'
                  }`}
                >
                  {/* Top Card Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono border ${bookMeta?.badgeColor || 'bg-stone-100 text-stone-800'}`}>
                        {rule.book}: {rule.ruleNumber}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#2b2b2b] font-kannada">
                        {rule.titleKannada}
                      </h3>
                      <span className="text-[11px] text-stone-500 font-sans hidden md:inline-block">
                        ({rule.titleEnglish})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-mono">
                        {rule.chapterOrPart || rule.bookNameEnglish}
                      </span>

                      {/* Bookmark Icon in Modal Card */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(rule.id, `${rule.book} ${rule.ruleNumber}`)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-400 text-stone-950 border-stone-900'
                            : 'bg-stone-100 text-stone-500 hover:bg-amber-100 hover:text-stone-900 border-stone-300'
                        }`}
                        title={isBookmarked ? 'ಬುಕ್‌ಮಾರ್ಕ್‌ನಿಂದ ತೆಗೆಯಿರಿ' : 'ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-stone-950' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Summary / Legal Details */}
                  <p className="text-xs sm:text-[13px] text-stone-700 font-kannada leading-relaxed mb-3">
                    {rule.summaryKannada}
                  </p>

                  {/* Snippets Preview Box */}
                  <div className="bg-[#fffbf2] border border-amber-300 rounded-lg p-2.5 mb-3 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-amber-900 font-kannada text-[11px] block">
                        📌 ಉಲ್ಲೇಖದ ವಾಕ್ಯ (Standard Reference Snippet):
                      </span>
                      <span className="text-stone-800 font-kannada italic text-xs">
                        "{rule.citationSnippet}"
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 font-kannada text-[11px] block">
                        📜 ಆದೇಶ / ಪ್ರಸ್ತಾವನೆಯ ವಾಕ್ಯ (Order Clause Snippet):
                      </span>
                      <span className="text-stone-700 font-kannada italic text-xs">
                        "{rule.orderClauseSnippet}"
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons to Insert into Letter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <div className="flex flex-wrap items-center gap-1">
                      {rule.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-kannada">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Copy snippet button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(rule.citationSnippet, rule.id, 'ಉಲ್ಲೇಖ')}
                        className="px-2.5 py-1.5 rounded-lg border border-[#2b2b2b] text-[11px] font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-1 cursor-pointer font-kannada"
                        title="ಉಲ್ಲೇಖ ಪಠ್ಯ ನಕಲಿಸಿ"
                      >
                        {copiedId === rule.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-stone-600" />
                        )}
                        <span>ನಕಲಿಸಿ</span>
                      </button>

                      {/* Set as Subject Button */}
                      {onInsertSubject && (
                        <button
                          type="button"
                          onClick={() => handleInsertSubject(rule)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#2b2b2b] bg-amber-50 hover:bg-amber-100 text-[11px] font-bold text-amber-950 flex items-center gap-1 cursor-pointer font-kannada shadow-xs"
                          title="ಪತ್ರದ ವಿಷಯಕ್ಕೆ ಈ ನಿಯಮ ನಮೂದಿಸಿ"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>ವಿಷಯಕ್ಕೆ ಸೇರಿಸಿ</span>
                        </button>
                      )}

                      {/* Add to Reference Button */}
                      <button
                        type="button"
                        onClick={() => handleInsertReference(rule)}
                        className="px-3 py-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#f59e0b] hover:bg-[#e08e0b] text-[11px] font-bold text-[#2b2b2b] flex items-center gap-1.5 cursor-pointer font-kannada shadow-[2px_2px_0px_#2b2b2b]"
                        title="ಈ ಪತ್ರದ ಉಲ್ಲೇಖಕ್ಕೆ (Reference) ನಿಯಮ ಸೇರಿಸಿ"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-[#2b2b2b]" />
                        <span>ಉಲ್ಲೇಖಕ್ಕೆ ಸೇರಿಸಿ (+ Reference)</span>
                      </button>

                      {/* Add to Order / Body Button */}
                      {onInsertBody && (
                        <button
                          type="button"
                          onClick={() => handleInsertBody(rule)}
                          className="px-3 py-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#2b2b2b] hover:bg-stone-800 text-[11px] font-bold text-white flex items-center gap-1.5 cursor-pointer font-kannada shadow-[2px_2px_0px_#10b981]"
                          title="ಆದೇಶ / ಪ್ರಸ್ತಾವನೆಗೆ ನಿಯಮದ ಷರತ್ತು ಸೇರಿಸಿ"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ಆದೇಶಕ್ಕೆ ಸೇರಿಸಿ</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#2b2b2b] text-stone-300 px-5 py-3 border-t-2 border-[#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-kannada">
            <span className="text-[#f59e0b] font-bold">ಫಲಿತಾಂಶ:</span>
            <span>{filteredRules.length} ನಿಯಮಗಳು ಲಭ್ಯವಿದೆ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-bold cursor-pointer font-kannada"
            >
              ಮುಚ್ಚಿ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
