import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sliders, 
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';

export interface PrintPreviewMeta {
  letterNumber?: string;
  fileNumber?: string;
  date?: string;
  subject?: string;
  recipient?: string;
  department?: string;
  classification?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  endorsements?: string[];
}

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  documentHtml?: string;
  documentNode?: React.ReactNode;
  elementId?: string; // ID of DOM element to pull content from
  meta?: PrintPreviewMeta;
  onDirectPrint?: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  documentTitle = 'ಅಧಿಕೃತ ಪತ್ರ / ಆದೇಶ ಪೂರ್ವವೀಕ್ಷಣೆ (A4 Print Preview)',
  documentHtml,
  documentNode,
  elementId,
  meta,
  onDirectPrint
}) => {
  // Viewport Zoom & Scaling
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%
  const [fitMode, setFitMode] = useState<'fit-width' | 'fit-page' | 'custom'>('fit-width');
  
  // Overlay Toggles
  const [showMarginsGuide, setShowMarginsGuide] = useState<boolean>(true);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [watermark, setWatermark] = useState<'none' | 'draft' | 'confidential' | 'sample'>('none');
  const [paperStyle, setPaperStyle] = useState<'official-letterhead' | 'plain-stationery'>('official-letterhead');
  
  // Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);

  // Content extraction from elementId if provided
  const [extractedHtml, setExtractedHtml] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Auto extract content if elementId is provided
  useEffect(() => {
    if (isOpen && elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        setExtractedHtml(el.innerHTML);
      }
    }
  }, [isOpen, elementId]);

  // Keyboard navigation: Escape to close, Ctrl+P to print
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleTriggerPrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calculate dynamic Fit Scale on mount / resize
  useEffect(() => {
    if (!isOpen) return;

    const calculateFit = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 80; // 40px padding on each side
      const containerHeight = containerRef.current.clientHeight - 80;
      
      // Standard A4 at 96 DPI: 794px width x 1123px height
      const a4Width = 794;
      const a4Height = 1123;

      if (fitMode === 'fit-width') {
        const scale = Math.min(1.2, Math.max(0.45, containerWidth / a4Width));
        setZoomLevel(Number(scale.toFixed(2)));
      } else if (fitMode === 'fit-page') {
        const scaleW = containerWidth / a4Width;
        const scaleH = containerHeight / a4Height;
        const scale = Math.min(1.1, Math.max(0.4, Math.min(scaleW, scaleH)));
        setZoomLevel(Number(scale.toFixed(2)));
      }
    };

    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, [isOpen, fitMode]);

  // Calculate page count estimate based on content height
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    const timeout = setTimeout(() => {
      if (sheetRef.current) {
        const height = sheetRef.current.scrollHeight;
        // Standard single A4 printable page body is approx 1050-1123px
        const estimatedPages = Math.max(1, Math.ceil(height / 1123));
        setPageCount(estimatedPages);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [isOpen, documentHtml, extractedHtml, documentNode, paperStyle]);

  if (!isOpen) return null;

  // Zoom handlers
  const handleZoomIn = () => {
    setFitMode('custom');
    setZoomLevel(prev => Math.min(1.6, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoomLevel(prev => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    setFitMode('custom');
    setZoomLevel(1.0);
  };

  // Print Trigger Handler
  const handleTriggerPrint = () => {
    // Add print active class to document body to isolate the A4 preview sheet
    document.body.classList.add('print-preview-modal-active');
    
    if (onDirectPrint) {
      onDirectPrint();
    } else {
      window.print();
    }

    // Clean up class after print dialog is closed
    setTimeout(() => {
      document.body.classList.remove('print-preview-modal-active');
    }, 1000);
  };

  // Copy plain text content
  const handleCopyContent = () => {
    if (sheetRef.current) {
      const text = sheetRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Watermark text mapping
  const watermarkText = {
    none: null,
    draft: 'ಕರಡು ಪ್ರತಿ • DRAFT',
    confidential: 'ಗೌಪ್ಯ • CONFIDENTIAL',
    sample: 'ಕಛೇರಿ ಪ್ರತಿ • OFFICE COPY'
  }[watermark];

  return (
    <div 
      id="a4-print-preview-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-stone-950/85 backdrop-blur-md transition-opacity duration-200 select-none animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="A4 Print Preview Modal"
    >
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR: Document Meta & Primary Actions                            */}
      {/* ========================================================================= */}
      <div className="no-print bg-[#202020] border-b-2 border-stone-800 text-stone-100 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md shrink-0">
        {/* Left: Document Title & A4 Specification Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate font-kannada">
                {documentTitle}
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950 uppercase shrink-0">
                A4 PORTRAIT (210 × 297 mm)
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate hidden md:block">
              ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಕಛೇರಿ ಪತ್ರ ಮುದ್ರಣ ಪೂರ್ವವೀಕ್ಷಣೆ • ಪ್ರಮಾಣಿತ 12pt ಅಳತೆ
            </p>
          </div>
        </div>

        {/* Center/Right: Print Action & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-modal-print-now"
            onClick={handleTriggerPrint}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-all shadow-[2px_2px_0px_#000000] border-2 border-amber-300 flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 font-kannada"
            title="ಬ್ರೌಸರ್ ಮುದ್ರಣ ಡೈಲಾಗ್ ತೆರೆಯಿರಿ (Ctrl + P)"
          >
            <Printer className="w-4 h-4 text-stone-950" />
            <span className="font-extrabold">🖨️ ಈಗಲೇ ಮುದ್ರಿಸಿ (Print Now)</span>
          </button>

          <button
            id="btn-modal-copy-content"
            onClick={handleCopyContent}
            className="hidden sm:flex px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-all border border-stone-700 items-center gap-1.5 cursor-pointer"
            title="ಪಠ್ಯ ನಕಲಿಸಿ (Copy Text)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-300" />}
            <span>{copied ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'ನಕಲಿಸಿ'}</span>
          </button>

          <button
            id="btn-modal-close-preview"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-rose-900/60 rounded-lg transition-all border border-stone-700 cursor-pointer ml-1"
            title="ಮುಚ್ಚಿ (Esc)"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECONDARY CONTROLS RIBBON: Zoom, Margins, Watermark & Letterhead Mode    */}
      {/* ========================================================================= */}
      <div className="no-print bg-[#181818] border-b border-stone-800 text-stone-300 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-stone-900 px-2 py-1 rounded-md border border-stone-800">
          <span className="text-[11px] text-stone-400 font-mono-code mr-1">ZOOM:</span>
          
          <button
            onClick={handleZoomOut}
            className="p-1 hover:text-white hover:bg-stone-800 rounded transition-colors text-stone-400 cursor-pointer"
            title="Zoom Out (-10%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="text-[11px] font-mono-code font-bold px-1.5 py-0.5 rounded hover:bg-stone-800 hover:text-amber-400 transition-colors text-stone-200 min-w-[48px] text-center cursor-pointer"
            title="Reset to 100% Actual A4 Scale"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1 hover:text-white hover:bg-stone-800 rounded transition-colors text-stone-400 cursor-pointer"
            title="Zoom In (+10%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3 bg-stone-700 mx-1" />

          {/* Quick Fit Buttons */}
          <button
            onClick={() => setFitMode('fit-width')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              fitMode === 'fit-width' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="Fit Width"
          >
            Fit Width
          </button>

          <button
            onClick={() => setFitMode('fit-page')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              fitMode === 'fit-page' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="Fit Full Page"
          >
            Fit Page
          </button>

          <button
            onClick={handleResetZoom}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              zoomLevel === 1.0 && fitMode === 'custom' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="Actual 1:1 Scale (100%)"
          >
            100%
          </button>
        </div>

        {/* Visual Inspection Overlays (Margins Guide, Crop Marks, Watermark) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Margins Guide Toggle */}
          <button
            onClick={() => setShowMarginsGuide(!showMarginsGuide)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showMarginsGuide 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
            title="ಮುದ್ರಣ ಮಾರ್ಜಿನ್‌ ಗೆರೆಗಳು (20mm Official Safety Margin Guide)"
          >
            {showMarginsGuide ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3 text-stone-500" />}
            <span>ಮಾರ್ಜಿನ್ ಗೆರೆಗಳು (20mm)</span>
          </button>

          {/* Corner Crop Marks Toggle */}
          <button
            onClick={() => setShowCropMarks(!showCropMarks)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showCropMarks 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
            title="ಕ್ರಾಪ್ ಮಾರ್ಕ್ಸ್ (A4 Cutting & Proof Corner Registration Marks)"
          >
            <Maximize2 className="w-3 h-3 text-amber-400" />
            <span>ಕ್ರಾಪ್ ಮಾರ್ಕ್ಸ್</span>
          </button>

          {/* Letterhead Mode Toggle */}
          <div className="flex items-center bg-stone-900 rounded-md border border-stone-800 p-0.5 text-[11px]">
            <button
              onClick={() => setPaperStyle('official-letterhead')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                paperStyle === 'official-letterhead' ? 'bg-stone-800 text-amber-300 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="ಸರ್ಕಾರಿ ಹೆಡರ್ ಸಹಿತ ಮುದ್ರಣ (Official Govt Letterhead)"
            >
              ಲೆಟರ್‌ಹೆಡ್ ಸಹಿತ
            </button>
            <button
              onClick={() => setPaperStyle('plain-stationery')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                paperStyle === 'plain-stationery' ? 'bg-stone-800 text-amber-300 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="ಪ್ರಿ-ಪ್ರಿಂಟೆಡ್ ಕಚೇರಿ ಹಾಳೆಯಲ್ಲಿ ಮುದ್ರಣಕ್ಕಾಗಿ (50mm Header Gap for Pre-printed Stationery)"
            >
              ಪ್ರಿ-ಪ್ರಿಂಟೆಡ್ ಸಾದಾ ಹಾಳೆ
            </button>
          </div>

          {/* Watermark Selector */}
          <div className="flex items-center gap-1 bg-stone-900 px-2 py-1 rounded-md border border-stone-800 text-[11px]">
            <span className="text-stone-400">ವಾಟರ್‌ಮಾರ್ಕ್:</span>
            <select
              value={watermark}
              onChange={(e) => setWatermark(e.target.value as any)}
              className="bg-transparent text-amber-300 font-semibold outline-none cursor-pointer text-[11px]"
            >
              <option value="none" className="bg-stone-900 text-stone-300">ಯಾವುದೂ ಇಲ್ಲ (None)</option>
              <option value="draft" className="bg-stone-900 text-stone-300">ಕರಡು (DRAFT)</option>
              <option value="confidential" className="bg-stone-900 text-stone-300">ಗೌಪ್ಯ (CONFIDENTIAL)</option>
              <option value="sample" className="bg-stone-900 text-stone-300">ಕಛೇರಿ ಪ್ರತಿ (OFFICE COPY)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN PREVIEW VIEWPORT: The A4 Virtual Paper Stage                       */}
      {/* ========================================================================= */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#121212] p-6 sm:p-10 flex flex-col items-center justify-start relative scrollbar-thin scrollbar-thumb-stone-700"
      >
        {/* Scaling Wrapper */}
        <div 
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)'
          }}
          className="my-4"
        >
          {/* ===================================================================== */}
          {/* THE PHYSICAL A4 PAPER SHEET CONTAINER (ISO 216: 210mm x 297mm)        */}
          {/* Standard 96 DPI pixel equivalent: 794px width x 1123px height          */}
          {/* ===================================================================== */}
          <div
            id="a4-print-preview-modal-sheet"
            ref={sheetRef}
            className="relative bg-white text-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-stone-300/80 rounded-sm font-sans select-text text-left"
            style={{
              width: '794px',
              minHeight: '1123px',
              padding: paperStyle === 'plain-stationery' ? '55mm 20mm 20mm 25mm' : '20mm 20mm 20mm 25mm', // Left 25mm for office file binding margin
              boxSizing: 'border-box',
              fontSize: '12pt',
              lineHeight: '1.5'
            }}
          >
            {/* ---------------- CROP MARKS OVERLAY (L-SHAPED CORNERS) ---------------- */}
            {showCropMarks && (
              <div className="no-print pointer-events-none absolute inset-0 text-stone-400 overflow-visible">
                {/* Top-Left */}
                <div className="absolute -top-3.5 -left-3.5 w-6 h-6 border-t-2 border-l-2 border-stone-500 opacity-60" />
                {/* Top-Right */}
                <div className="absolute -top-3.5 -right-3.5 w-6 h-6 border-t-2 border-r-2 border-stone-500 opacity-60" />
                {/* Bottom-Left */}
                <div className="absolute -bottom-3.5 -left-3.5 w-6 h-6 border-b-2 border-l-2 border-stone-500 opacity-60" />
                {/* Bottom-Right */}
                <div className="absolute -bottom-3.5 -right-3.5 w-6 h-6 border-b-2 border-r-2 border-stone-500 opacity-60" />
                
                {/* A4 Indicator Tag on Top Edge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono-code font-bold uppercase tracking-wider text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                  A4: 210mm × 297mm
                </div>
              </div>
            )}

            {/* ---------------- MARGIN GUIDES OVERLAY (20mm / 25mm SAFETY ZONE) -------- */}
            {showMarginsGuide && (
              <div 
                className="no-print pointer-events-none absolute inset-0 border border-dashed border-sky-400/40 rounded-sm"
                style={{
                  top: paperStyle === 'plain-stationery' ? '55mm' : '20mm',
                  bottom: '20mm',
                  left: '25mm', // 25mm standard filing margin
                  right: '20mm'
                }}
              >
                {/* Margin Labels */}
                <span className="absolute -top-4 left-0 text-[9px] font-mono text-sky-600 bg-sky-50 px-1 rounded border border-sky-200">
                  {paperStyle === 'plain-stationery' ? 'Top: 55mm (Stationery Clearance)' : 'Top: 20mm'}
                </span>
                <span className="absolute top-1/2 -left-6 -translate-y-1/2 -rotate-90 text-[9px] font-mono text-sky-600 bg-sky-50 px-1 rounded border border-sky-200">
                  Binding: 25mm
                </span>
                <span className="absolute -bottom-4 right-0 text-[9px] font-mono text-sky-600 bg-sky-50 px-1 rounded border border-sky-200">
                  Bottom: 20mm
                </span>
              </div>
            )}

            {/* ---------------- WATERMARK OVERLAY --------------------------------- */}
            {watermarkText && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
                <span 
                  className="text-stone-300/35 font-extrabold text-5xl sm:text-6xl uppercase tracking-widest -rotate-45 select-none font-kannada"
                  style={{ textShadow: '0 0 1px rgba(0,0,0,0.05)' }}
                >
                  {watermarkText}
                </span>
              </div>
            )}

            {/* ---------------- PRE-PRINTED STATIONERY NOTICE (IF ACTIVE) ---------- */}
            {paperStyle === 'plain-stationery' && (
              <div className="no-print mb-4 p-2 bg-amber-50/80 border border-amber-300/80 rounded text-[11px] text-amber-900 flex items-center justify-between font-kannada">
                <span>⚠️ ಪ್ರಿ-ಪ್ರಿಂಟೆಡ್ ಲೆಟರ್‌ಹೆಡ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ (ಮೇಲ್ಭಾಗದಲ್ಲಿ 55 ಮಿ.ಮೀ ಕಚೇರಿ ಹೆಡರ್ ಸ್ಥಳಾವಕಾಶ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ).</span>
                <span className="font-mono-code font-bold">TOP: 55mm</span>
              </div>
            )}

            {/* ---------------- ACTUAL DOCUMENT CONTENT --------------------------- */}
            <div className="relative z-10 print:m-0 print:p-0">
              {documentNode ? (
                documentNode
              ) : documentHtml ? (
                <div 
                  className="prose prose-stone max-w-none text-stone-900 leading-relaxed font-sans"
                  style={{ fontSize: '12pt', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: documentHtml }} 
                />
              ) : extractedHtml ? (
                <div 
                  className="prose prose-stone max-w-none text-stone-900 leading-relaxed font-sans"
                  style={{ fontSize: '12pt', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: extractedHtml }} 
                />
              ) : (
                <div className="p-8 text-center text-stone-500 font-kannada">
                  ಪೂರ್ವವೀಕ್ಷಣೆಗೆ ಯಾವುದೇ ದಾಖಲೆ ಲಭ್ಯವಿಲ್ಲ.
                </div>
              )}
            </div>

            {/* ---------------- A4 FOOTER / PAGE INDICATOR ------------------------ */}
            <div className="mt-8 pt-4 border-t border-stone-200 text-stone-500 text-[10px] flex items-center justify-between font-mono-code print:border-none">
              <span>ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ</span>
              <span>ಪುಟ 1 / {pageCount} • A4 (ISO 216)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM STATUS BAR: Quick Specs & Guidance                              */}
      {/* ========================================================================= */}
      <div className="no-print bg-[#1a1a1a] border-t border-stone-800 text-stone-400 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            ಮುದ್ರಣ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ <strong className="text-stone-200">Paper Size: A4</strong>, <strong className="text-stone-200">Margins: Default / None</strong> ಮತ್ತು <strong className="text-stone-200">Scale: 100%</strong> ಆಯ್ಕೆಮಾಡಿ.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-code text-stone-400">
          <span>ಅಂದಾಜು ಪುಟಗಳು: <strong className="text-amber-300 font-bold">{pageCount} ಪುಟ</strong></span>
          <span>•</span>
          <button
            onClick={handleTriggerPrint}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            ಮುದ್ರಣ ಸಂವಾದ (Print Dialog) ತೆರೆಯಿರಿ
          </button>
        </div>
      </div>
    </div>
  );
};
