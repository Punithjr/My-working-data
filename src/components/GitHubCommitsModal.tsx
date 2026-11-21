import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitCommit, 
  GitBranch, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  FolderGit2, 
  Calendar, 
  User, 
  Search, 
  FileCode, 
  Code2, 
  Check, 
  Copy, 
  Database,
  ArrowUpRight
} from 'lucide-react';

export interface GitHubCommitItem {
  sha: string;
  shortSha: string;
  message: string;
  summary: string;
  description?: string;
  author: string;
  committer?: string;
  date: string;
  dateFormatted: string;
  verified: boolean;
  verifiedReason?: string;
  htmlUrl: string;
}

interface GitHubCommitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSyncSettings?: () => void;
}

export const GitHubCommitsModal: React.FC<GitHubCommitsModalProps> = ({
  isOpen,
  onClose,
  onOpenSyncSettings,
}) => {
  const [commits, setCommits] = useState<GitHubCommitItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const fetchCommits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/github/commits?owner=Punithjr&repo=ARYA-PUNITH');
      if (res.ok) {
        const data = await res.json();
        if (data.commits && Array.isArray(data.commits)) {
          setCommits(data.commits);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCommits();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  // Filter commits
  const filteredCommits = commits.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.message.toLowerCase().includes(q) ||
      c.shortSha.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q) ||
      c.dateFormatted.toLowerCase().includes(q)
    );
  });

  // Group commits by date
  const groupedCommits: { [dateStr: string]: GitHubCommitItem[] } = {};
  filteredCommits.forEach(c => {
    const key = c.dateFormatted || 'Recent Commits';
    if (!groupedCommits[key]) {
      groupedCommits[key] = [];
    }
    groupedCommits[key].push(c);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0b192e] text-white px-5 py-4 border-b border-sky-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center font-mono shadow-md">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-kannada">
                  GitHub ಕಮಿಟ್ಸ್ & ಆವೃತ್ತಿ ಇತಿಹಾಸ (Commits Stream)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  LIVE REPO
                </span>
              </div>
              <p className="text-xs text-sky-200 font-mono flex items-center gap-2 mt-0.5">
                <span>Punithjr / ARYA-PUNITH</span>
                <span className="text-stone-400">•</span>
                <span className="text-amber-300 flex items-center gap-1 font-sans">
                  <GitBranch className="w-3 h-3" /> main
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Punithjr/ARYA-PUNITH"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold border border-white/15 transition-colors"
            >
              <span>GitHub ನಲ್ಲಿ ನೋಡಿ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="ಮುಚ್ಚಿ (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ಕಮಿಟ್ ಸಂದೇಶ ಅಥವಾ SHA ಹುಡುಕಿ (Search commits)..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-900 focus:outline-hidden font-kannada"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCommits}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-800' : ''}`} />
              <span>ರಿಫ್ರೆಶ್ (Refresh)</span>
            </button>

            {onOpenSyncSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSyncSettings();
                }}
                className="px-3 py-1.5 bg-sky-900 hover:bg-sky-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-kannada"
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span>ಬ್ಯಾಕಪ್ & ಸಿಂಕ್ ಸೆಟ್ಟಿಂಗ್ಸ್</span>
              </button>
            )}
          </div>
        </div>

        {/* Commits Timeline Feed */}
        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-stone-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-900 mx-auto" />
              <p className="font-semibold text-stone-700">GitHub ನಿಂದ ಕಮಿಟ್ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...</p>
            </div>
          ) : Object.keys(groupedCommits).length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-xl">
              ಯಾವುದೇ ಕಮಿಟ್ ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟ ಪದವನ್ನು ಬದಲಿಸಿ ನೋಡಿ.
            </div>
          ) : (
            Object.entries(groupedCommits).map(([groupDate, groupList]) => (
              <div key={groupDate} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-800"></div>
                  <h3 className="text-xs font-bold text-stone-800 font-mono tracking-wide flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>Commits on {groupDate}</span>
                  </h3>
                  <div className="flex-1 border-t border-stone-200"></div>
                  <span className="text-[11px] text-stone-400 font-mono">{groupList.length} commits</span>
                </div>

                {/* Commit Cards List */}
                <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden bg-white shadow-2xs">
                  {groupList.map(commit => (
                    <div 
                      key={commit.sha}
                      className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
                    >
                      {/* Left: Commit Summary & Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <GitCommit className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                          <div>
                            <a
                              href={commit.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-stone-900 hover:text-sky-800 text-sm leading-snug transition-colors hover:underline"
                            >
                              {commit.summary}
                            </a>

                            {commit.description && (
                              <pre className="mt-1 text-[11px] text-stone-600 font-mono whitespace-pre-wrap bg-stone-50 p-2 rounded-lg border border-stone-200">
                                {commit.description}
                              </pre>
                            )}
                          </div>
                        </div>

                        {/* Author & Verification Meta */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500 pl-6">
                          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                            <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-[9px]">
                              P
                            </span>
                            <span>{commit.author}</span>
                            <span className="text-stone-400">
                              {commit.verified ? 'authored' : 'committed'} on {commit.dateFormatted}
                            </span>
                          </div>

                          {/* Verification Badge */}
                          {commit.verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-700" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                              <span>Unverified</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Commit Hash & Links */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-1 md:pt-0">
                        <button
                          onClick={() => handleCopySha(commit.sha)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded font-mono text-[11px] font-bold text-stone-700 border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                          title="SHA ಕಾಪಿ ಮಾಡಿ"
                        >
                          {copiedSha === commit.sha ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-400" />
                              <span>{commit.shortSha}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={commit.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="GitHub Commit ಪುಟ ತೆರೆಯಿರಿ"
                        >
                          <span>Diff ನೋಡಿ</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Quick Repository Files Shortcut Strip */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 font-kannada flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-sky-800" />
              <span>ರೆಪೊಸಿಟರಿಯ ಪ್ರಮುಖ ಡೇಟಾ ಫೈಲ್‌ಗಳ ನೇರ ಲಿಂಕ್‌ಗಳು (Quick File Links):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <a
                href="https://github.com/Punithjr/ARYA-PUNITH/blob/main/data/employees_store.json"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-800 block text-[11px]">Employees Store</span>
                  <span className="text-[10px] text-stone-500 font-mono">data/employees_store.json</span>
                </div>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              <a
                href="https://github.com/Punithjr/ARYA-PUNITH/blob/main/data/gov_memorandum_db.json"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-800 block text-[11px]">Memorandum DB</span>
                  <span className="text-[10px] text-stone-500 font-mono">data/gov_memorandum_db.json</span>
                </div>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              <a
                href="https://github.com/Punithjr/ARYA-PUNITH/blob/main/SECURITY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-800 block text-[11px]">Security Policy</span>
                  <span className="text-[10px] text-stone-500 font-mono">SECURITY.md</span>
                </div>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              <a
                href="https://github.com/Punithjr/ARYA-PUNITH/blob/main/.github/workflows/webpack.yml"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-800 block text-[11px]">GitHub Actions</span>
                  <span className="text-[10px] text-stone-500 font-mono">workflows/webpack.yml</span>
                </div>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-5 py-3 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px]">https://github.com/Punithjr/ARYA-PUNITH</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            ಮುಚ್ಚಿ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
