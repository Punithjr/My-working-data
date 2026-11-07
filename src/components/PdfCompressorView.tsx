import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Gauge,
  X,
  ArrowLeft
} from 'lucide-react';
import { 
  compressPdfDocument, 
  PdfCompressionProfile, 
  PdfCompressionResult 
} from '../utils/pdfCompression';
import { formatBytes, calculateSavings, downloadBlob, sanitizeFilename } from '../utils/formatters';

export interface PdfCompressorViewProps {
  onBackToHome?: () => void;
}

export const PdfCompressorView: React.FC<PdfCompressorViewProps> = ({ onBackToHome }) => {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<PdfCompressionProfile>('medium');
  const [targetKb, setTargetKb] = useState<number>(200);

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [result, setResult] = useState<PdfCompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChosen = (selectedFile: File) => {
    setError(null);
    setResult(null);

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf).');
      return;
    }

    if (selectedFile.size > 80 * 1024 * 1024) {
      setError('PDF is larger than 80MB. In-browser canvas rendering may require high device memory.');
    }

    setFile(selectedFile);
  };

  const handleStartCompression = async () => {
    if (!file) return;

    setError(null);
    setIsCompressing(true);
    setProgressPercent(5);
    setProgressMsg('Initializing PDF document...');

    try {
      const res = await compressPdfDocument(
        file,
        {
          profile,
          targetKb: profile === 'target' ? targetKb : undefined,
        },
        (current, total, message) => {
          const pct = Math.round((current / total) * 100);
          setProgressPercent(pct);
          setProgressMsg(message);
        }
      );

      setResult(res);
      setProgressPercent(100);
      setProgressMsg('Compression completed successfully!');
    } catch (err: any) {
      console.error('PDF compression failed', err);
      setError(err?.message || 'Failed to compress PDF. The document may be password-protected or corrupted.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const downloadName = sanitizeFilename(file.name, 'pdf');
    const lastDot = downloadName.lastIndexOf('.');
    const base = lastDot !== -1 ? downloadName.substring(0, lastDot) : downloadName;
    downloadBlob(result.blob, `${base}_compressed.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgressPercent(0);
    setProgressMsg('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-kannada">
                  ಪಿಡಿಎಫ್ ಫೈಲ್ ಕಂಪ್ರೆಸರ್ (Office PDF Compressor)
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded border border-purple-300 dark:border-purple-800 font-mono">
                  &lt; 200 KB PORTAL LIMIT
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-400 font-kannada">
                ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ಗಳಿಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು PDF ಫೈಲ್‌ಗಳ ಗಾತ್ರವನ್ನು 100% ಸುರಕ್ಷಿತವಾಗಿ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಕುಗ್ಗಿಸಿ (Client-side Compression).
              </p>
            </div>
          </div>
        </div>

        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-stone-300 dark:border-slate-700 font-kannada self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ</span>
          </button>
        )}
      </div>

      {/* Main Upload / Control Card */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-slate-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChosen(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose a PDF file to compress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Drag & drop or tap to select PDF document
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span>🔒 100% In-Browser • Files Never Leave Your Device</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* Selected File Info Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Original Size: {formatBytes(file.size)}
                </div>
              </div>
            </div>

            {!isCompressing && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Choose different PDF"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Compression Level Selector */}
          {!result && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Choose Compression Level</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => setProfile('low')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                    profile === 'low'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Low</div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">High Quality</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Light compression, best for graphics and text sharpness.</div>
                </button>

                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => setProfile('medium')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                    profile === 'medium'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Medium</div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Recommended</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Balanced reduction for resumes, forms, and general sharing.</div>
                </button>

                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => setProfile('high')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                    profile === 'high'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">High</div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Max Savings</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Aggressive reduction for strict email and upload limits.</div>
                </button>

                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => setProfile('target')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                    profile === 'target'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Target Size</div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Exact KB Limit</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Target under 100KB, 200KB, or custom limit.</div>
                </button>
              </div>

              {/* Target Size Presets & Custom Input */}
              {profile === 'target' && (
                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3">
                  <div className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Select Target Size Limit:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Under 100 KB', val: 100 },
                      { label: 'Under 200 KB', val: 200 },
                      { label: 'Under 500 KB', val: 500 },
                      { label: 'Under 1 MB', val: 1024 },
                    ].map((t) => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setTargetKb(t.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                          targetKb === t.val
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs text-slate-500">Custom:</span>
                      <input
                        type="number"
                        min="20"
                        max="10000"
                        value={targetKb}
                        onChange={(e) => setTargetKb(Math.max(20, parseInt(e.target.value) || 200))}
                        className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-mono text-slate-500">KB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStartCompression}
                disabled={isCompressing}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                {isCompressing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compressing PDF in Browser...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compress PDF Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {isCompressing && (
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{progressMsg}</span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-300 dark:border-purple-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>PDF Successfully Compressed!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Original Size</span>
                  <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-200">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border-2 border-purple-500 dark:border-purple-600">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 block font-bold">Compressed Size</span>
                  <span className="text-lg font-black font-mono text-purple-700 dark:text-purple-300">
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-bold">Reduction</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {calculateSavings(result.originalSize, result.compressedSize).percentage}% Saved
                  </span>
                </div>
              </div>

              {/* First Page Preview & Download Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  {result.firstPagePreviewUrl && (
                    <img
                      src={result.firstPagePreviewUrl}
                      alt="First Page Preview"
                      className="w-12 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm"
                    />
                  )}
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'} Compressed
                    </span>
                    <span>Ready for instant download</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Compress Another
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
