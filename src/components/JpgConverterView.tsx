import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Archive, 
  Sparkles,
  Sliders,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Globe,
  FileImage,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  ArrowUp,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { 
  convertImageToJpg, 
  downloadConvertedAsZip, 
  ConvertedJpgItem,
  convertPdfToJpgPages,
  downloadPdfPagesAsZip,
  convertJpgsToPdf,
  ConvertedPdfPageItem
} from '../utils/jpgConversion';
import { formatBytes, downloadBlob, sanitizeFilename } from '../utils/formatters';

export interface JpgConverterViewProps {
  onBackToHome?: () => void;
  initialMode?: 'imageToJpg' | 'pdfToJpg' | 'jpgToPdf';
}

type ConverterMode = 'imageToJpg' | 'pdfToJpg' | 'jpgToPdf';
type TargetSizeOption = 'none' | '20kb' | '50kb' | '100kb' | 'custom';
type Lang = 'kn' | 'en';

interface JpgToPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
}

export const JpgConverterView: React.FC<JpgConverterViewProps> = ({ 
  onBackToHome,
  initialMode = 'imageToJpg' 
}) => {
  const [mode, setMode] = useState<ConverterMode>(initialMode);
  const [lang, setLang] = useState<Lang>('kn');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Mode 1: Image to JPG & Target Size
  const [quality, setQuality] = useState<number>(0.92);
  const [targetSizeOpt, setTargetSizeOpt] = useState<TargetSizeOption>('none');
  const [customKb, setCustomKb] = useState<number>(50);
  const [imageItems, setImageItems] = useState<ConvertedJpgItem[]>([]);
  const [isImageProcessing, setIsImageProcessing] = useState<boolean>(false);
  const [isImageDragging, setIsImageDragging] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Mode 2: PDF to JPG
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<ConvertedPdfPageItem[]>([]);
  const [isPdfConverting, setIsPdfConverting] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPdfDragging, setIsPdfDragging] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Mode 3: JPG to PDF
  const [jpgToPdfList, setJpgToPdfList] = useState<JpgToPdfItem[]>([]);
  const [pdfDocTitle, setPdfDocTitle] = useState<string>('ಸರ್ಕಾರಿ ದಾಖಲೆಗಳು - BEO Bhadravathi');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | null>(null);
  const [generatedPdfSize, setGeneratedPdfSize] = useState<number>(0);
  const [isJpgToPdfDragging, setIsJpgToPdfDragging] = useState<boolean>(false);
  const [jpgToPdfError, setJpgToPdfError] = useState<string | null>(null);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const jpgToPdfInputRef = useRef<HTMLInputElement>(null);

  const getEffectiveTargetKb = (): number | undefined => {
    if (targetSizeOpt === '20kb') return 20;
    if (targetSizeOpt === '50kb') return 50;
    if (targetSizeOpt === '100kb') return 100;
    if (targetSizeOpt === 'custom') return customKb > 0 ? customKb : 50;
    return undefined;
  };

  // ================= MODE 1: IMAGE TO JPG HANDLERS =================
  const handleImageFilesAdded = async (fileList: FileList | File[]) => {
    setImageError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        setImageError(
          lang === 'kn'
            ? `ಅನರ್ಹ ಫೈಲ್ "${file.name}": ಕೇವಲ ಚಿತ್ರ ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಬೆಂಬಲಿಸಲಾಗುತ್ತದೆ (.jpeg, .jpg, .png, .webp).`
            : `Skipped "${file.name}": Only image files (.jpeg, .jpg, .png, .webp) are supported.`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const targetKb = getEffectiveTargetKb();

    const newItems: ConvertedJpgItem[] = validFiles.map((file) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'IMG';
      return {
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalFormat: ext,
        originalSize: file.size,
        originalPreviewUrl: URL.createObjectURL(file),
        convertedBlob: null,
        convertedSize: 0,
        convertedPreviewUrl: null,
        width: 0,
        height: 0,
        status: 'pending',
        targetSizeKb: targetKb,
      };
    });

    setImageItems((prev) => [...newItems, ...prev]);
    await processImageConversion(newItems, quality, targetKb);
  };

  const processImageConversion = async (itemsToConvert: ConvertedJpgItem[], q: number, targetKb?: number) => {
    setIsImageProcessing(true);

    for (const item of itemsToConvert) {
      setImageItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'converting' } : it))
      );

      try {
        const { blob, width, height } = await convertImageToJpg(item.originalFile, q, targetKb);
        const previewUrl = URL.createObjectURL(blob);

        setImageItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'success',
                  convertedBlob: blob,
                  convertedSize: blob.size,
                  convertedPreviewUrl: previewUrl,
                  width,
                  height,
                  errorMessage: undefined,
                  targetSizeKb: targetKb,
                }
              : it
          )
        );
      } catch (err: any) {
        console.error('Conversion failed for', item.originalFile.name, err);
        setImageItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'error',
                  errorMessage: err?.message || 'Failed to convert to JPG',
                }
              : it
          )
        );
      }
    }

    setIsImageProcessing(false);
  };

  const handleReconvertAllImages = async () => {
    if (imageItems.length === 0) return;
    const targetKb = getEffectiveTargetKb();
    await processImageConversion(imageItems, quality, targetKb);
  };

  const handleDownloadSingleImage = (item: ConvertedJpgItem) => {
    if (!item.convertedBlob) return;
    const downloadName = sanitizeFilename(item.originalFile.name, 'jpg');
    downloadBlob(item.convertedBlob, downloadName);
  };

  const handleDownloadImageZip = async () => {
    const successItems = imageItems.filter((it) => it.status === 'success' && it.convertedBlob);
    if (successItems.length === 0) return;

    try {
      const zipBlob = await downloadConvertedAsZip(successItems, 'converted_jpg_images.zip');
      downloadBlob(zipBlob, 'converted_jpg_images.zip');
    } catch (err) {
      console.error('Failed to create ZIP', err);
      setImageError('Failed to create ZIP: ' + String(err));
    }
  };

  const handleRemoveImageItem = (id: string) => {
    setImageItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) {
        if (item.originalPreviewUrl) URL.revokeObjectURL(item.originalPreviewUrl);
        if (item.convertedPreviewUrl) URL.revokeObjectURL(item.convertedPreviewUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAllImages = () => {
    imageItems.forEach((it) => {
      if (it.originalPreviewUrl) URL.revokeObjectURL(it.originalPreviewUrl);
      if (it.convertedPreviewUrl) URL.revokeObjectURL(it.convertedPreviewUrl);
    });
    setImageItems([]);
  };

  // ================= MODE 2: PDF TO JPG HANDLERS =================
  const handlePdfFileChosen = async (file: File) => {
    setPdfError(null);
    setPdfPages([]);
    setPdfProgress(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ PDF ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ (.pdf).' : 'Please select a valid PDF file (.pdf).');
      return;
    }

    setPdfFile(file);
    setIsPdfConverting(true);

    try {
      const pages = await convertPdfToJpgPages(file, quality, 1.5, (current, total) => {
        setPdfProgress({ current, total });
      });
      setPdfPages(pages);
    } catch (err: any) {
      console.error('PDF to JPG conversion failed:', err);
      setPdfError(err?.message || (lang === 'kn' ? 'PDF ಪುಟಗಳನ್ನು JPG ಗೆ ಪರಿವರ್ತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' : 'Failed to extract JPG pages from PDF.'));
    } finally {
      setIsPdfConverting(false);
      setPdfProgress(null);
    }
  };

  const handleDownloadSinglePdfPage = (page: ConvertedPdfPageItem) => {
    if (!pdfFile) return;
    const cleanBase = sanitizeFilename(pdfFile.name.replace(/\.pdf$/i, ''), 'jpg').replace(/\.jpg$/i, '');
    const filename = `${cleanBase}_page_${String(page.pageNumber).padStart(2, '0')}.jpg`;
    downloadBlob(page.blob, filename);
  };

  const handleDownloadAllPdfPagesZip = async () => {
    if (!pdfFile || pdfPages.length === 0) return;
    try {
      const zipBlob = await downloadPdfPagesAsZip(pdfPages, pdfFile.name);
      const zipName = `${sanitizeFilename(pdfFile.name.replace(/\.pdf$/i, ''), 'zip').replace(/\.zip$/i, '')}_jpg_pages.zip`;
      downloadBlob(zipBlob, zipName);
    } catch (err: any) {
      setPdfError('ZIP download failed: ' + String(err));
    }
  };

  // ================= MODE 3: JPG TO PDF HANDLERS =================
  const handleJpgFilesForPdfAdded = (fileList: FileList | File[]) => {
    setJpgToPdfError(null);
    setGeneratedPdfBlobUrl(null);
    const newItems: JpgToPdfItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!f.type.startsWith('image/')) {
        continue;
      }
      newItems.push({
        id: `jpg-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        size: f.size,
        previewUrl: URL.createObjectURL(f),
      });
    }

    if (newItems.length === 0) {
      setJpgToPdfError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ JPG ಅಥವಾ PNG ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select valid JPG or PNG images.');
      return;
    }

    setJpgToPdfList((prev) => [...prev, ...newItems]);
  };

  const handleMoveJpgUp = (index: number) => {
    if (index === 0) return;
    setJpgToPdfList((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveJpgDown = (index: number) => {
    if (index === jpgToPdfList.length - 1) return;
    setJpgToPdfList((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleRemoveJpgFromPdf = (id: string) => {
    setJpgToPdfList((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleGeneratePdf = async () => {
    if (jpgToPdfList.length === 0) {
      setJpgToPdfError(lang === 'kn' ? 'PDF ಸೃಜಿಸಲು ಕನಿಷ್ಠ ಒಂದು JPG ಚಿತ್ರವನ್ನು ಸೇರಿಸಿ.' : 'Please add at least one JPG image.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setJpgToPdfError(null);

      const blob = await convertJpgsToPdf(
        jpgToPdfList.map((item) => ({ name: item.name, file: item.file })),
        pdfDocTitle
      );

      const url = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(url);
      setGeneratedPdfSize(blob.size);

      // Auto-trigger download
      const filename = sanitizeFilename(pdfDocTitle || 'official_document', 'pdf');
      downloadBlob(blob, filename);
    } catch (err: any) {
      console.error('Failed to generate PDF from JPGs:', err);
      setJpgToPdfError(err?.message || (lang === 'kn' ? 'PDF ಸೃಜಿಸಲು ವಿಫಲವಾಗಿದೆ.' : 'Failed to generate PDF.'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const successImageCount = imageItems.filter((it) => it.status === 'success').length;

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-stone-50 text-stone-900'} p-3 sm:p-6`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Control Bar: Language, Dark Mode, Back Home */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'kn' ? 'en' : 'kn'))}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 flex items-center gap-1.5 cursor-pointer transition-all hover:bg-amber-100"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'kn' ? 'English ಗೆ ಬದಲಿಸಿ' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode((d) => !d)}
              className="p-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              100% PRIVATE • CLIENT-SIDE
            </span>

            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'kn' ? 'ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ' : 'Back to Home'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/10 border-2 border-amber-300 dark:border-amber-800/80 rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಸರ್ಕಾರಿ ಕಛೇರಿಯ ಪ್ರಮುಖ ಪರಿಕರ' : 'OFFICIAL DOCUMENT CONVERTER SUITE'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white font-kannada">
            {lang === 'kn' ? 'ಪಿಡಿಎಫ್ ಮತ್ತು ಜೆಪಿ ಕನ್ವರ್ಟ್ & ಜೆಪಿಸಿ ಕಂಪ್ರೆಸ್ ಸೂಟ್' : 'PDF & JPG Converter & JPC Compressor Suite'}
          </h1>
          
          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-kannada">
            {lang === 'kn'
              ? 'ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳಿಗೆ (e-Office, KIMS, HRMS, Shikshana) ಸೂಕ್ತವಾಗುವಂತೆ PDF ನಿಂದ JPG, JPG ನಿಂದ PDF, JPEG ➔ JPG ಕನ್ವರ್ಟರ್ ಮತ್ತು ನಿಖರ ಗಾತ್ರದ (20KB, 50KB, 100KB) ಇಮೇಜ್ ಕಂಪ್ರೆಸರ್.'
              : 'Official client-side converter: PDF to JPG, JPG to PDF, JPEG to JPG, and precise target size image compression (20KB, 50KB, 100KB) for e-Office and government portals.'}
          </p>

          {/* 3 Core Conversion Modes Tab Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMode('imageToJpg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-2 ${
                mode === 'imageToJpg'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md font-black'
                  : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-300 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>1. ಚಿತ್ರಗಳು ➔ JPG & ಕಂಪ್ರೆಸ್</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pdfToJpg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-2 ${
                mode === 'pdfToJpg'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md font-black'
                  : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-300 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. PDF ➔ JPG ಕನ್ವರ್ಟರ್</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('jpgToPdf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-2 ${
                mode === 'jpgToPdf'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md font-black'
                  : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-300 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. JPG ➔ PDF ಕನ್ವರ್ಟರ್</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODE 1: IMAGE TO JPG & JPC COMPRESS                           */}
        {/* ============================================================== */}
        {mode === 'imageToJpg' && (
          <div className="space-y-6">
            {/* Controls Card: Quality Slider & Compress to Target Size */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* 1. Quality Slider */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-stone-800 dark:text-slate-200 font-kannada">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'kn' ? 'JPG ಗುಣಮಟ್ಟ (Quality)' : 'JPG Export Quality'}</span>
                    </label>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.60"
                    max="1.00"
                    step="0.02"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 dark:text-slate-400 font-mono">
                    <span>60% (Compact)</span>
                    <span>92% (Default)</span>
                    <span>100% (High Res)</span>
                  </div>
                </div>

                {/* 2. Compress to Target Size (ಜೆಪಿಸಿ ಕಂಪ್ರೆಸ್) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-stone-800 dark:text-slate-200 font-kannada">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'kn' ? 'ಜೆಪಿಸಿ ಕಂಪ್ರೆಸ್ ಗಾತ್ರ (Target KB)' : 'Compress to Target Size'}</span>
                    </label>
                    {targetSizeOpt !== 'none' && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                        ≤ {getEffectiveTargetKb()} KB
                      </span>
                    )}
                  </div>

                  {/* Target Size Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['none', '20kb', '50kb', '100kb', 'custom'] as TargetSizeOption[]).map((opt) => {
                      const isSelected = targetSizeOpt === opt;
                      const label = opt === 'none' ? (lang === 'kn' ? 'ಮೂಲ ಗಾತ್ರ' : 'Original') : opt.toUpperCase();
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTargetSizeOpt(opt)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs font-black'
                              : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom KB Input */}
                  {targetSizeOpt === 'custom' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-medium text-stone-600 dark:text-slate-400 font-kannada">ಕಸ್ಟಮ್ KB:</span>
                      <input
                        type="number"
                        min="10"
                        max="5000"
                        step="5"
                        value={customKb}
                        onChange={(e) => setCustomKb(Math.max(10, parseInt(e.target.value) || 50))}
                        className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-lg"
                      />
                      <span className="text-xs font-mono text-stone-500">KB</span>
                    </div>
                  )}
                </div>
              </div>

              {imageItems.length > 0 && (
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={handleReconvertAllImages}
                    disabled={isImageProcessing}
                    className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold text-xs rounded-xl hover:bg-stone-800 dark:hover:bg-slate-100 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-xs font-kannada"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isImageProcessing ? 'animate-spin' : ''}`} />
                    <span>{lang === 'kn' ? 'ಮರು ಅನ್ವಯಿಸಿ' : 'Re-apply Settings'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Zone for Images */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsImageDragging(true); }}
              onDragLeave={() => setIsImageDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsImageDragging(false);
                if (e.dataTransfer.files?.length > 0) handleImageFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => imageFileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isImageDragging
                  ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                  : 'border-stone-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <input
                ref={imageFileInputRef}
                type="file"
                multiple
                accept="image/*,.jpeg,.jpg,.png,.webp,.bmp"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleImageFilesAdded(e.target.files);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-kannada">
                    {lang === 'kn' ? 'ಚಿತ್ರಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Drag & Drop Images or Tap to Select'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-kannada">
                    {lang === 'kn'
                      ? 'ಬೆಂಬಲಿತ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು: .jpeg, .jpg, .png, .webp, .bmp • ಒಂದೇ ಅಥವಾ ಅನೇಕ ಚಿತ್ರಗಳು'
                      : 'Supports: .jpeg, .jpg, .png, .webp, .bmp • Single or batch files'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>100% In-Browser • Files Never Leave Your Device</span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {imageError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1 font-kannada">{imageError}</span>
                <button onClick={() => setImageError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Converted Images Queue */}
            {imageItems.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-white font-kannada">
                      {lang === 'kn' ? 'ಪರಿವರ್ತಿತ ಚಿತ್ರಗಳು' : 'Converted Images'} ({imageItems.length})
                    </span>
                    {successImageCount > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                        {successImageCount} .jpg
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {successImageCount > 1 && (
                      <button
                        type="button"
                        onClick={handleDownloadImageZip}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-sm transition cursor-pointer font-kannada"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{lang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ZIP ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' : 'Download All as ZIP'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearAllImages}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition cursor-pointer font-kannada"
                    >
                      {lang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {imageItems.map((item) => {
                    const isSuccess = item.status === 'success';
                    const isConverting = item.status === 'converting';
                    const isError = item.status === 'error';

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-850/50 hover:border-amber-300 dark:hover:border-amber-700 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-800 shrink-0 border border-stone-300 dark:border-slate-700">
                            <img
                              src={item.convertedPreviewUrl || item.originalPreviewUrl}
                              alt={item.originalFile.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
                              {item.originalFile.name}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-slate-400 font-mono">
                              <span>ಮೂಲ: {formatBytes(item.originalSize)} ({item.originalFormat})</span>
                              {isSuccess && (
                                <>
                                  <span>➔</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    ಹೊಸ: {formatBytes(item.convertedSize)} (.JPG)
                                  </span>
                                  <span>• {item.width}x{item.height}px</span>
                                </>
                              )}
                            </div>

                            {isError && (
                              <span className="text-xs text-rose-600 font-medium">
                                {item.errorMessage || 'Conversion failed'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          {isConverting && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 font-bold font-mono">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Converting...</span>
                            </div>
                          )}

                          {isSuccess && (
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleImage(item)}
                              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer font-kannada"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ಡೌನ್‌ಲೋಡ್ .jpg</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImageItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                            title="Remove"
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
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: PDF TO JPG CONVERTER                                   */}
        {/* ============================================================== */}
        {mode === 'pdfToJpg' && (
          <div className="space-y-6">
            {/* PDF Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsPdfDragging(true); }}
              onDragLeave={() => setIsPdfDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsPdfDragging(false);
                if (e.dataTransfer.files?.[0]) handlePdfFileChosen(e.dataTransfer.files[0]);
              }}
              onClick={() => pdfFileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isPdfDragging
                  ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                  : 'border-stone-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <input
                ref={pdfFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePdfFileChosen(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-kannada">
                    {lang === 'kn' ? 'PDF ಕಡತವನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Drag & Drop PDF File Here'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-kannada">
                    {lang === 'kn'
                      ? 'PDF ನ ಪ್ರತಿಯೊಂದು ಪುಟವನ್ನು ಅಧಿಕ ಸ್ಪಷ್ಟತೆಯ .jpg ಚಿತ್ರವಾಗಿ ಹೊರತೆಗೆಯಲಾಗುತ್ತದೆ'
                      : 'Extracts every page of your PDF into high-resolution standalone .jpg files'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>100% In-Browser • Instant Canvas Rendering</span>
                </div>
              </div>
            </div>

            {/* Progress / Loading indicator */}
            {isPdfConverting && (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200 font-kannada">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span>PDF ಪುಟಗಳನ್ನು JPG ಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </span>
                  {pdfProgress && (
                    <span className="font-mono">
                      ಪುಟ {pdfProgress.current} / {pdfProgress.total}
                    </span>
                  )}
                </div>
                {pdfProgress && (
                  <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${(pdfProgress.current / pdfProgress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Alert */}
            {pdfError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1 font-kannada">{pdfError}</span>
                <button onClick={() => setPdfError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Extracted PDF Pages Result Grid */}
            {pdfPages.length > 0 && pdfFile && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white font-kannada flex items-center gap-2">
                      <span>{pdfFile.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                        {pdfPages.length} ಪುಟಗಳು (Pages)
                      </span>
                    </h4>
                    <p className="text-xs text-stone-500">ಮೂಲ ಗಾತ್ರ: {formatBytes(pdfFile.size)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadAllPdfPagesZip}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-sm transition cursor-pointer font-kannada"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>ಎಲ್ಲಾ ಪುಟಗಳ ZIP ಡೌನ್‌ಲೋಡ್</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setPdfFile(null); setPdfPages([]); }}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition cursor-pointer font-kannada"
                    >
                      ಹೊಸ PDF
                    </button>
                  </div>
                </div>

                {/* Grid of Pages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pdfPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="p-3 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-850/50 hover:border-amber-400 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-slate-200 text-xs font-bold font-kannada">
                            ಪುಟ {page.pageNumber}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            {formatBytes(page.size)}
                          </span>
                        </div>

                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-stone-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
                          <img
                            src={page.previewUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="text-[10px] text-stone-500 font-mono text-center">
                          {page.width} x {page.height} px • JPEG
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePdfPage(page)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer font-kannada shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ಪುಟ {page.pageNumber} ಡೌನ್‌ಲೋಡ್</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: JPG TO PDF CONVERTER                                   */}
        {/* ============================================================== */}
        {mode === 'jpgToPdf' && (
          <div className="space-y-6">
            {/* Title & Document Setup */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-slate-200 mb-1.5 font-kannada">
                  ಕಡತ / ದಾಖಲೆಯ ಶೀರ್ಷಿಕೆ (Official PDF Document Title)
                </label>
                <input
                  type="text"
                  value={pdfDocTitle}
                  onChange={(e) => setPdfDocTitle(e.target.value)}
                  placeholder="ಉದಾ: ಶಿಕ್ಷಕರ ಸೇವಾ ದಾಖಲೆಗಳು / ಅನುದಾನ ಕಡತ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-stone-900 dark:text-white"
                />
              </div>
            </div>

            {/* Dropzone for JPGs */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsJpgToPdfDragging(true); }}
              onDragLeave={() => setIsJpgToPdfDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsJpgToPdfDragging(false);
                if (e.dataTransfer.files?.length > 0) handleJpgFilesForPdfAdded(e.dataTransfer.files);
              }}
              onClick={() => jpgToPdfInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isJpgToPdfDragging
                  ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
                  : 'border-stone-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <input
                ref={jpgToPdfInputRef}
                type="file"
                multiple
                accept="image/*,.jpeg,.jpg,.png"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleJpgFilesForPdfAdded(e.target.files);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-kannada">
                    {lang === 'kn' ? 'JPG/PNG ಚಿತ್ರಗಳನ್ನು ಇಲ್ಲಿ ಸೇರಿಸಿ' : 'Drag & Drop JPG/PNG Images Here'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 font-kannada">
                    {lang === 'kn'
                      ? 'ಬಹು ಚಿತ್ರಗಳನ್ನು ಒಂದೇ A4 ಪ್ರಮಾಣದ ಅಧಿಕೃತ PDF ಕಡತವಾಗಿ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ'
                      : 'Combines multiple photos/documents into a single standard A4 PDF'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>100% In-Browser • A4 Scaled</span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {jpgToPdfError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1 font-kannada">{jpgToPdfError}</span>
                <button onClick={() => setJpgToPdfError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Images List for PDF */}
            {jpgToPdfList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-stone-900 dark:text-white font-kannada">
                    ಆಯ್ಕೆಯಾದ ಚಿತ್ರಗಳು ({jpgToPdfList.length} Images)
                  </span>

                  <button
                    type="button"
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-2 shadow-sm transition cursor-pointer font-kannada disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                    <span>{isGeneratingPdf ? 'PDF ಸೃಜಿಸಲಾಗುತ್ತಿದೆ...' : '📄 PDF ಸೃಜಿಸಿ & ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {jpgToPdfList.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-850"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-bold text-xs text-stone-500 font-mono">
                          #{index + 1}
                        </span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {formatBytes(item.size)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveJpgUp(index)}
                          disabled={index === 0}
                          className="p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveJpgDown(index)}
                          disabled={index === jpgToPdfList.length - 1}
                          className="p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveJpgFromPdf(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-center text-xs text-stone-700 dark:text-slate-300 font-medium font-kannada">
          🔒 ನಿಮ್ಮ ಕಡತಗಳು ಹಾಗೂ ಚಿತ್ರಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತವೆ. ಯಾವುದೇ ಸರ್ವರ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ. 100% ಸುರಕ್ಷಿತ & ಖಾಸಗಿ.
        </div>

      </div>
    </div>
  );
};
