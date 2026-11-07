import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  Download, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  X,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatBytes, sanitizeFilename } from '../utils/formatters';

export interface PdfMergerViewProps {
  onBackToHome?: () => void;
}

interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  previewUrl?: string;
}

export const PdfMergerView: React.FC<PdfMergerViewProps> = ({ onBackToHome }) => {
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [coverTitle, setCoverTitle] = useState<string>('ಸರ್ಕಾರಿ ದಾಖಲೆಗಳ ಸಮಗ್ರ ಕಡತ (Consolidated Dossier)');
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);
  const [mergedFileSize, setMergedFileSize] = useState<string>('');
  const [mergedPageCount, setMergedPageCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setMergedBlobUrl(null);
    const newItems: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      const isImg = f.type.startsWith('image/');

      if (!isPdf && !isImg) {
        continue;
      }

      let pageCount: number | undefined = undefined;
      let previewUrl: string | undefined = undefined;

      if (isPdf) {
        try {
          const buffer = await f.arrayBuffer();
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          pageCount = doc.getPageCount();
        } catch (e) {
          pageCount = 1;
        }
      } else if (isImg) {
        pageCount = 1;
        previewUrl = URL.createObjectURL(f);
      }

      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: isPdf ? 'PDF' : 'IMAGE',
        pageCount,
        previewUrl
      });
    }

    if (newItems.length === 0) {
      setErrorMessage('ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ PDF ಅಥವಾ JPG/PNG ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.');
      return;
    }

    setFileList(prev => [...prev, ...newItems]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFileList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === fileList.length - 1) return;
    setFileList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setFileList(prev => prev.filter(item => item.id !== id));
  };

  const handleMergeFiles = async () => {
    if (fileList.length < 1) {
      setErrorMessage('ವಿಲೀನಗೊಳಿಸಲು ಕನಿಷ್ಠ ಒಂದು ಕಡತವನ್ನು ಸೇರಿಸಿ.');
      return;
    }

    try {
      setIsMerging(true);
      setErrorMessage(null);

      const mergedDoc = await PDFDocument.create();
      const helvetica = await mergedDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await mergedDoc.embedFont(StandardFonts.HelveticaBold);

      // Optional Cover Page
      if (includeCoverPage) {
        const cover = mergedDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = cover.getSize();

        // Top decorative bar
        cover.drawRectangle({
          x: 36,
          y: height - 30,
          width: width - 72,
          height: 6,
          color: rgb(0.08, 0.2, 0.4),
        });

        // Header Title
        cover.drawText('GOVERNMENT OF KARNATAKA', {
          x: 36,
          y: height - 65,
          size: 13,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.1),
        });

        cover.drawText('DEPARTMENT OF SCHOOL EDUCATION • BEO BHADRAVATHI', {
          x: 36,
          y: height - 82,
          size: 10,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        });

        cover.drawLine({
          start: { x: 36, y: height - 95 },
          end: { x: width - 36, y: height - 95 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        cover.drawText('CONSOLIDATED OFFICIAL DOCUMENT DOSSIER', {
          x: 36,
          y: height - 125,
          size: 14,
          font: helveticaBold,
          color: rgb(0.08, 0.35, 0.65),
        });

        const safeTitle = coverTitle.replace(/[^\x00-\x7F]/g, '') || 'Official Department Record';
        cover.drawText(`Title / Subject: ${safeTitle}`, {
          x: 36,
          y: height - 145,
          size: 10,
          font: helvetica,
          color: rgb(0.3, 0.3, 0.3),
        });

        const todayStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        cover.drawText(`Merged Date: ${todayStr} | Total Combined Files: ${fileList.length}`, {
          x: 36,
          y: height - 162,
          size: 9,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });

        // Table of contents header
        cover.drawRectangle({
          x: 36,
          y: height - 195,
          width: width - 72,
          height: 18,
          color: rgb(0.94, 0.96, 0.98),
        });

        cover.drawText('INDEX OF ENCLOSED DOCUMENTS', {
          x: 44,
          y: height - 183,
          size: 9,
          font: helveticaBold,
          color: rgb(0.1, 0.2, 0.3),
        });

        let tocY = height - 215;
        fileList.slice(0, 15).forEach((item, idx) => {
          cover.drawText(`${idx + 1}. [${item.type}] ${item.name.substring(0, 50)} (${formatBytes(item.size)})`, {
            x: 44,
            y: tocY,
            size: 8.5,
            font: helvetica,
            color: rgb(0.2, 0.2, 0.2),
          });
          tocY -= 16;
        });
      }

      // Merge Each File
      for (const item of fileList) {
        const buffer = await item.file.arrayBuffer();

        if (item.type === 'PDF') {
          const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const copiedPages = await mergedDoc.copyPages(srcPdf, srcPdf.getPageIndices());
          copiedPages.forEach(p => mergedDoc.addPage(p));
        } else {
          // Image: embed into an A4 page
          let embeddedImage;
          if (item.file.type === 'image/png') {
            embeddedImage = await mergedDoc.embedPng(buffer);
          } else {
            embeddedImage = await mergedDoc.embedJpg(buffer);
          }

          const page = mergedDoc.addPage([595.28, 841.89]);
          const { width, height } = page.getSize();
          const margin = 36;
          const maxW = width - margin * 2;
          const maxH = height - margin * 2;

          const scale = Math.min(maxW / embeddedImage.width, maxH / embeddedImage.height, 1);
          const drawW = embeddedImage.width * scale;
          const drawH = embeddedImage.height * scale;

          page.drawImage(embeddedImage, {
            x: (width - drawW) / 2,
            y: (height - drawH) / 2,
            width: drawW,
            height: drawH,
          });
        }
      }

      const mergedBytes = await mergedDoc.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedBlobUrl(url);
      setMergedFileSize(formatBytes(mergedBytes.byteLength));
      setMergedPageCount(mergedDoc.getPageCount());
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`ವಿಲೀನ ಪ್ರಕ್ರಿಯೆ ವಿಫಲವಾಗಿದೆ: ${err?.message || 'ದೋಷ'}`);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold tracking-wider uppercase font-mono">
                100% PRIVATE • CLIENT-SIDE PDF MERGER
              </span>
              <span className="text-xs text-stone-400 font-kannada">ಕಡತಗಳ ವಿಲೀನ ತಂತ್ರಾಂಶ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight font-kannada flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>PDF ದಾಖಲೆಗಳ ವಿಲೀನ (Consolidated PDF Merger)</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-kannada max-w-3xl leading-relaxed">
              ಅನೇಕ PDF ಕಡತಗಳು ಹಾಗೂ JPG/PNG ಚಿತ್ರ ದಾಖಲೆಗಳನ್ನು ಒಂದೇ ಅಧಿಕೃತ ಏಕೀಕೃತ PDF ಕಡತಕ್ಕೆ ವಿಲೀನಗೊಳಿಸಿ. ಪುಟಗಳ ಕ್ರಮವನ್ನು ಸುಲಭವಾಗಿ ಬದಲಾಯಿಸಿ ಮತ್ತು ಮುಖಪುಟ (Cover Page) ರಚಿಸಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.
            </p>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-colors border border-stone-700 flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto font-kannada"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Upload & File Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Dropzone & Order List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-stone-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesAdded(e.target.files);
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-stone-900 font-kannada">
              PDF ಅಥವಾ ಚಿತ್ರ ದಾಖಲೆಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ
            </h3>
            <p className="text-xs text-stone-500 font-kannada mt-1">
              ಬೆಂಬಲಿತ ಮಾದರಿಗಳು: .pdf, .jpg, .jpeg, .png, .webp • ಅನೇಕ ಕಡತಗಳನ್ನು ಒಟ್ಟಿಗೆ ಆಯ್ಕೆಮಾಡಬಹುದು
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Enclosed Documents List */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 font-kannada flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>ವಿಲೀನಗೊಳಿಸಬೇಕಾದ ದಾಖಲೆಗಳ ಪಟ್ಟಿ ({fileList.length})</span>
              </h3>
              {fileList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFileList([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold font-kannada cursor-pointer"
                >
                  ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ
                </button>
              )}
            </div>

            {fileList.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 font-kannada">
                ಯಾವುದೇ ಕಡತಗಳನ್ನು ಇನ್ನೂ ಸೇರಿಸಿಲ್ಲ. ಮೇಲಿನ ಬಾಕ್ಸ್ ಮೂಲಕ ಕಡತಗಳನ್ನು ಸೇರಿಸಿ.
              </div>
            ) : (
              <div className="space-y-2">
                {fileList.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-700 font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        {item.type === 'PDF' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-stone-900 truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {formatBytes(item.size)} • {item.type} {item.pageCount ? `(${item.pageCount} ಪುಟಗಳು)` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 disabled:opacity-30 cursor-pointer"
                        title="ಮೇಲಕ್ಕೆ ಸರಿಸಿ"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === fileList.length - 1}
                        className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 disabled:opacity-30 cursor-pointer"
                        title="ಕೆಳಕ್ಕೆ ಸರಿಸಿ"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="ತೆಗೆದುಹಾಕಿ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings, Action & Result (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 font-kannada flex items-center gap-2 border-b border-stone-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ವಿಲೀನ ಆಯ್ಕೆಗಳು (Merge Options)</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCoverPage}
                  onChange={(e) => setIncludeCoverPage(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 font-kannada block">
                    ಅಧಿಕೃತ ಮುಖಪುಟ (Cover Page) ಸೇರಿಸಿ
                  </span>
                  <span className="text-[11px] text-stone-500 font-kannada block">
                    ಇಲಾಖಾ ಹೆಡರ್ ಹಾಗೂ ಒಳಗೊಂಡಿರುವ ಎಲ್ಲಾ ಕಡತಗಳ ಸೂಚ್ಯಂಕ (Index) ಇರುವ ಮುಖಪುಟ ಸೃಜಿಸುತ್ತದೆ.
                  </span>
                </div>
              </label>

              {includeCoverPage && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-stone-700 font-kannada block">
                    ಮುಖಪುಟದ ಶೀರ್ಷಿಕೆ / ವಿಷಯ:
                  </label>
                  <input
                    type="text"
                    value={coverTitle}
                    onChange={(e) => setCoverTitle(e.target.value)}
                    placeholder="ವಿಷಯ ನಮೂದಿಸಿ..."
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleMergeFiles}
              disabled={isMerging || fileList.length === 0}
              className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-kannada"
            >
              {isMerging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>PDF ಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>ಒಂದೇ PDF ಗೆ ವಿಲೀನಗೊಳಿಸಿ (Merge Now)</span>
                </>
              )}
            </button>
          </div>

          {/* Merge Result Banner */}
          {mergedBlobUrl && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5 text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm font-kannada">PDF ಯಶಸ್ವಿಯಾಗಿ ವಿಲೀನಗೊಂಡಿದೆ!</h4>
                  <p className="text-xs text-emerald-800 font-mono">
                    ಒಟ್ಟು ಪುಟಗಳು: {mergedPageCount} • ಗಾತ್ರ: {mergedFileSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={mergedBlobUrl}
                  download={`Merged_Dossier_${new Date().toISOString().split('T')[0]}.pdf`}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-kannada"
                >
                  <Download className="w-4 h-4" />
                  <span>ವಿಲೀನಗೊಂಡ PDF ಡೌನ್‌ಲೋಡ್</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
