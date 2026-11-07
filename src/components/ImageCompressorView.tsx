import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Sliders, 
  Archive, 
  FileImage, 
  Sparkles,
  ArrowRight,
  X,
  ArrowLeft
} from 'lucide-react';
import { 
  compressImageToTargetSize, 
  downloadAllAsZip, 
  CompressedImageResult 
} from '../utils/imageCompression';
import { formatBytes, calculateSavings, downloadBlob, sanitizeFilename } from '../utils/formatters';

export interface ImageCompressorViewProps {
  onBackToHome?: () => void;
}

export const ImageCompressorView: React.FC<ImageCompressorViewProps> = ({ onBackToHome }) => {
  // Preset target sizes in KB
  const [targetPreset, setTargetPreset] = useState<'20' | '50' | '100' | 'custom'>('50');
  const [customKb, setCustomKb] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [items, setItems] = useState<CompressedImageResult[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewModalItem, setPreviewModalItem] = useState<CompressedImageResult | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed target bytes based on active preset or custom
  const getTargetBytes = useCallback((): number => {
    if (targetPreset === '20') return 20 * 1024;
    if (targetPreset === '50') return 50 * 1024;
    if (targetPreset === '100') return 100 * 1024;
    return Math.max(5, customKb || 50) * 1024;
  }, [targetPreset, customKb]);

  // Handle file additions
  const handleFilesAdded = async (fileList: FileList | File[]) => {
    setGeneralError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setGeneralError(`Skipped "${file.name}": only JPG, PNG, and WebP images are supported.`);
        continue;
      }
      // Max file size warning: > 50MB
      if (file.size > 50 * 1024 * 1024) {
        setGeneralError(`"${file.name}" is over 50MB. Processing may take longer in browser memory.`);
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create queue items
    const newItems: CompressedImageResult[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: file,
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      originalPreviewUrl: URL.createObjectURL(file),
      compressedBlob: null,
      compressedSize: 0,
      compressedWidth: 0,
      compressedHeight: 0,
      compressedPreviewUrl: null,
      targetBytes: getTargetBytes(),
      qualityUsed: 0.8,
      status: 'pending',
    }));

    setItems((prev) => [...newItems, ...prev]);

    // Automatically trigger compression
    await processQueue(newItems, getTargetBytes());
  };

  // Process items
  const processQueue = async (itemsToProcess: CompressedImageResult[], targetBytes: number) => {
    setIsProcessing(true);

    for (const item of itemsToProcess) {
      // Mark as processing
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', targetBytes } : it))
      );

      try {
        const result = await compressImageToTargetSize(item.originalFile, targetBytes, 'image/jpeg');
        const compressedUrl = URL.createObjectURL(result.blob);

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'success',
                  compressedBlob: result.blob,
                  compressedSize: result.blob.size,
                  compressedWidth: result.width,
                  compressedHeight: result.height,
                  qualityUsed: result.quality,
                  compressedPreviewUrl: compressedUrl,
                  errorMessage: undefined,
                }
              : it
          )
        );
      } catch (err: any) {
        console.error('Compression failed for', item.originalFile.name, err);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'error',
                  errorMessage: err?.message || 'Failed to compress image',
                }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  // Re-compress all with new target size
  const handleRecompressAll = async (newTargetBytes: number) => {
    if (items.length === 0) return;
    await processQueue(items, newTargetBytes);
  };

  // Drag and drop handlers
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
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Download single image
  const handleDownloadSingle = (item: CompressedImageResult) => {
    if (!item.compressedBlob) return;
    const downloadName = sanitizeFilename(item.originalFile.name, 'jpg');
    downloadBlob(item.compressedBlob, downloadName);
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    const successItems = items.filter((it) => it.status === 'success' && it.compressedBlob);
    if (successItems.length === 0) return;

    try {
      const zipBlob = await downloadAllAsZip(successItems, 'compressed_images.zip');
      downloadBlob(zipBlob, 'compressed_images.zip');
    } catch (err) {
      console.error('Failed to generate ZIP archive', err);
      setGeneralError('Failed to create ZIP archive: ' + String(err));
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.originalPreviewUrl) URL.revokeObjectURL(item.originalPreviewUrl);
        if (item.compressedPreviewUrl) URL.revokeObjectURL(item.compressedPreviewUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((it) => {
      if (it.originalPreviewUrl) URL.revokeObjectURL(it.originalPreviewUrl);
      if (it.compressedPreviewUrl) URL.revokeObjectURL(it.compressedPreviewUrl);
    });
    setItems([]);
  };

  const successCount = items.filter((it) => it.status === 'success').length;
  const currentTargetKb = getTargetBytes() / 1024;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <FileImage className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-kannada">
                  ಇಮೇಜ್ & ಫೋಟೋ ಕಂಪ್ರೆಸರ್ (Image & Signature Compressor)
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded border border-blue-300 dark:border-blue-800 font-mono">
                  20KB / 50KB / 100KB TARGET
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-400 font-kannada">
                HRMS, KPSC, ಸೇವಾ ಸಿಂಧು ಹಾಗೂ e-Office ಪೋರ್ಟಲ್‌ಗಳಿಗೆ ಅಗತ್ಯವಿರುವ ಪಾಸ್‌ಪೋರ್ಟ್ ಭಾವಚಿತ್ರ ಮತ್ತು ಸಹಿಯ ನಿಖರವಾದ ಫೈಲ್ ಗಾತ್ರಕ್ಕೆ (20KB-100KB) ಕಂಪ್ರೆಸ್ ಮಾಡಿ.
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

      {/* Target Size Selector Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Target File Size Limit</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each compressed image will be optimized to be at or just under this limit.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => handleRecompressAll(getTargetBytes())}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Re-apply to All</span>
            </button>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setTargetPreset('20');
              handleRecompressAll(20 * 1024);
            }}
            className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
              targetPreset === '20'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-base sm:text-lg font-black font-mono">20 KB</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Government ID / Passport</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetPreset('50');
              handleRecompressAll(50 * 1024);
            }}
            className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
              targetPreset === '50'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-base sm:text-lg font-black font-mono">50 KB</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Application Forms & Portals</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetPreset('100');
              handleRecompressAll(100 * 1024);
            }}
            className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
              targetPreset === '100'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-base sm:text-lg font-black font-mono">100 KB</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Web Uploads & Resumes</div>
          </button>

          <div
            onClick={() => setTargetPreset('custom')}
            className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-center ${
              targetPreset === 'custom'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-bold mb-1">Custom Target KB</div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="5000"
                value={customKb}
                onChange={(e) => {
                  setTargetPreset('custom');
                  const val = Math.max(5, parseInt(e.target.value) || 50);
                  setCustomKb(val);
                }}
                onBlur={() => {
                  if (targetPreset === 'custom') {
                    handleRecompressAll(customKb * 1024);
                  }
                }}
                className="w-full px-2 py-1 text-sm font-bold font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
              />
              <span className="text-xs font-bold text-slate-500 font-mono">KB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesAdded(e.target.files);
              e.target.value = ''; // Reset input so same file can be chosen again
            }
          }}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Tap to choose images or drag & drop here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports multiple JPG, JPEG, and PNG files • Target: ≤ {currentTargetKb} KB
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span>🔒 100% In-Browser • Files Never Leave Your Device</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {generalError && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span className="flex-1">{generalError}</span>
          <button onClick={() => setGeneralError(null)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Results & Batch Queue */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Queue Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Queue ({items.length} {items.length === 1 ? 'image' : 'images'})
              </span>
              {successCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {successCount} Compressed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {successCount > 1 && (
                <button
                  onClick={handleDownloadZip}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP</span>
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item) => {
              const savings = calculateSavings(item.originalSize, item.compressedSize);
              const isUnderTarget = item.compressedSize <= item.targetBytes;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 gap-3 transition"
                >
                  {/* Thumbnail & File Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      {item.compressedPreviewUrl || item.originalPreviewUrl ? (
                        <img
                          src={item.compressedPreviewUrl || item.originalPreviewUrl}
                          alt={item.originalFile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileImage className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.originalFile.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Original: {formatBytes(item.originalSize)}</span>
                        {item.compressedWidth > 0 && (
                          <span>• {item.compressedWidth} × {item.compressedHeight}px</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Comparison & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {item.status === 'processing' && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compressing...</span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{item.errorMessage || 'Error'}</span>
                      </div>
                    )}

                    {item.status === 'success' && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                            <span>{formatBytes(item.compressedSize)}</span>
                            {isUnderTarget && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                                Target Met
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                            ↓ {savings.percentage}% saved
                          </div>
                        </div>

                        {/* Preview Compare Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewModalItem(item)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="View Before / After Comparison"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Single Image */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    )}

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Before/After Preview Modal */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Before vs After Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{previewModalItem.originalFile.name}</p>
              </div>
              <button
                onClick={() => setPreviewModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Original</span>
                  <span className="font-mono text-slate-500">{formatBytes(previewModalItem.originalSize)}</span>
                </div>
                <div className="h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewModalItem.originalPreviewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Compressed Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Compressed</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBytes(previewModalItem.compressedSize)} (Quality ~{Math.round(previewModalItem.qualityUsed * 100)}%)
                  </span>
                </div>
                <div className="h-64 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  {previewModalItem.compressedPreviewUrl && (
                    <img
                      src={previewModalItem.compressedPreviewUrl}
                      alt="Compressed"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadSingle(previewModalItem);
                  setPreviewModalItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download JPG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
