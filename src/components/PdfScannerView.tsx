import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Download, 
  Check, 
  Sliders, 
  RefreshCw, 
  Sparkles, 
  Maximize2,
  Crop,
  Layers,
  SwitchCamera,
  Flashlight,
  Eye,
  X,
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import { 
  ScannedPage, 
  DocumentCorners, 
  ScannerFilterType, 
  getDefaultCorners, 
  autoDetectDocumentCorners, 
  warpPerspectiveCanvas, 
  applyFilterToCanvas, 
  rotateCanvas, 
  exportScannedPagesToPdf, 
  Point 
} from '../utils/documentScanner';
import { formatBytes, downloadBlob } from '../utils/formatters';
import { MasterDocketFile, DocumentAttachment } from '../types';
import { generateSampleKarnatakaGovtDocument } from '../utils/sampleDocument';
import { convertPdfToJpgPages } from '../utils/jpgConversion';

export interface PdfScannerViewProps {
  files?: MasterDocketFile[];
  onAttachToDocket?: (fileId: string, attachment: DocumentAttachment) => Promise<void>;
  onBackToHome?: () => void;
  showToast?: (msg: string) => void;
}

export const PdfScannerView: React.FC<PdfScannerViewProps> = ({
  files = [],
  onAttachToDocket,
  onBackToHome,
  showToast,
}) => {
  // Modes: 'gallery' (multi-page overview) | 'camera' (live capture) | 'crop' (perspective corner adjust)
  const [activeMode, setActiveMode] = useState<'gallery' | 'camera' | 'crop'>('gallery');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Attach to Docket modal state
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedDocketId, setSelectedDocketId] = useState<string>(files[0]?.id || '');
  const [docketSearchTerm, setDocketSearchTerm] = useState<string>('');
  const [attachmentTitle, setAttachmentTitle] = useState<string>('');
  const [attachmentDescription, setAttachmentDescription] = useState<string>('ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಕಾಗದ ದಾಖಲೆ / ಪ್ರತಿ (Scanned Document Attachment)');
  const [isAttaching, setIsAttaching] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Crop / Perspective warp canvas state
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const [editingCorners, setEditingCorners] = useState<DocumentCorners | null>(null);
  const [activeCorner, setActiveCorner] = useState<keyof DocumentCorners | null>(null);
  const [cropSourceImage, setCropSourceImage] = useState<HTMLImageElement | null>(null);

  // PDF Export options
  const [compressOption, setCompressOption] = useState<'none' | '200' | '500' | '1000' | 'custom'>('none');
  const [customMaxKb, setCustomMaxKb] = useState<number>(500);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedPdfBlob, setExportedPdfBlob] = useState<Blob | null>(null);

  // PDF Upload & Extraction State
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Start / Stop camera stream
  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'ಕ್ಯಾಮರಾ ಲೈವ್ ಸ್ಟ್ರೀಮ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ ಅಥವಾ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಸಾಧನದ ಸ್ಥಳೀಯ ಕ್ಯಾಮೆರಾ ಬಳಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.'
      );
      return;
    }

    try {
      let stream: MediaStream | null = null;
      let lastErr: any = null;

      // Stage 1: Try with ideal resolution & facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err1) {
        lastErr = err1;
      }

      // Stage 2: Fallback to basic facingMode without resolution constraint
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
            audio: false,
          });
        } catch (err2) {
          lastErr = err2;
        }
      }

      // Stage 3: Fallback to standard generic video (e.g. desktop webcam, virtual camera)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3) {
          lastErr = err3;
        }
      }

      if (!stream) {
        throw lastErr || new Error('Camera stream could not be started');
      }

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn('Video playback notice:', e));
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or permission denied:', err?.message || err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.name === 'SecurityError' ||
        String(err?.message || '').toLowerCase().includes('denied') ||
        String(err?.message || '').toLowerCase().includes('permission');

      setCameraError(
        isDenied
          ? 'ಕ್ಯಾಮರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ (Camera permission was denied). ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನ ಅಡ್ರೆಸ್ ಬಾರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಅನುಮತಿ ನೀಡಿ, ಅಥವಾ ನೇರವಾಗಿ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಸಾಧನದ ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ.'
          : 'ಸಾಧನದ ಕ್ಯಾಮೆರಾ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಟನ್ ಬಳಸಿ ನೇರ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const toggleTorch = async () => {
    if (!cameraStream) return;
    const track = cameraStream.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch toggle not supported', err);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture snapshot from video
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    stopCamera();
    initiateCropForImage(dataUrl, canvas.width, canvas.height);
  };

  // Process uploaded image or PDF file
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
      e.target.value = '';
    }
  };

  // Backwards compatibility alias
  const handleUploadPhoto = handleUploadFile;

  const processSelectedFile = async (file: File) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      await handleProcessPdfUpload(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          initiateCropForImage(dataUrl, img.naturalWidth, img.naturalHeight);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract all pages from uploaded PDF and load into scanner gallery
  const handleProcessPdfUpload = async (file: File) => {
    setIsPdfLoading(true);
    setPdfProgress({ current: 1, total: 1 });
    try {
      const convertedPages = await convertPdfToJpgPages(file, 0.92, 1.5, (current, total) => {
        setPdfProgress({ current, total });
      });

      if (!convertedPages || convertedPages.length === 0) {
        throw new Error('PDF ನಲ್ಲಿ ಯಾವುದೇ ಪುಟಗಳು ಲಭ್ಯವಿಲ್ಲ.');
      }

      const newScannedPages: ScannedPage[] = [];

      for (const item of convertedPages) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.blob);
        });

        const corners = getDefaultCorners(item.width, item.height);
        newScannedPages.push({
          id: Math.random().toString(36).substring(2, 9),
          originalDataUrl: dataUrl,
          originalWidth: item.width,
          originalHeight: item.height,
          corners: corners,
          filter: 'original',
          rotation: 0,
          processedDataUrl: dataUrl,
          thumbnailUrl: item.previewUrl || dataUrl,
        });
      }

      setPages((prev) => [...prev, ...newScannedPages]);
      setActivePageIndex((prev) => prev);
      setActiveMode('gallery');
      showToast?.(`PDF ಕಡತದಿಂದ ${newScannedPages.length} ಪುಟಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!`);
    } catch (err: any) {
      console.error('Failed to load PDF into scanner', err);
      showToast?.(`PDF ಅಪ್‌ಲೋಡ್ ದೋಷ: ${err.message || 'ಕಡತ ಓದಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ'}`);
    } finally {
      setIsPdfLoading(false);
      setPdfProgress(null);
    }
  };

  // Start perspective crop tool with the image
  const initiateCropForImage = (dataUrl: string, width: number, height: number) => {
    const img = new Image();
    img.onload = () => {
      setCropSourceImage(img);

      // Auto detect corners
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) tCtx.drawImage(img, 0, 0);

      const corners = autoDetectDocumentCorners(tempCanvas, width, height);
      setEditingCorners(corners);
      setActiveMode('crop');
    };
    img.src = dataUrl;
  };

  // Generate and load authentic Karnataka Govt sample document for instant scanning & test
  const handleLoadSampleDocument = async () => {
    try {
      const sampleDataUrl = await generateSampleKarnatakaGovtDocument();
      if (sampleDataUrl) {
        stopCamera();
        setCameraError(null);
        initiateCropForImage(sampleDataUrl, 1240, 1754);
        if (showToast) {
          showToast('ಅಧಿಕೃತ ಮಾದರಿ ಕಛೇರಿ ಪತ್ರ ಲೋಡ್ ಆಗಿದೆ! ಕ್ರಾಪ್, ಫಿಲ್ಟರ್ ಮತ್ತು PDF ಸೃಜನೆ ಪರೀಕ್ಷಿಸಿ.');
        }
      }
    } catch (err) {
      console.error('Failed to generate sample document:', err);
    }
  };

  // Render crop canvas with handles
  useEffect(() => {
    if (activeMode !== 'crop' || !cropCanvasRef.current || !cropSourceImage || !editingCorners) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Display scaled to container width
    const containerW = canvas.parentElement?.clientWidth || 600;
    const scale = containerW / cropSourceImage.naturalWidth;
    const displayW = containerW;
    const displayH = Math.round(cropSourceImage.naturalHeight * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    // Draw source image
    ctx.drawImage(cropSourceImage, 0, 0, displayW, displayH);

    // Transform corners to display coordinates
    const scalePoint = (p: Point): Point => ({
      x: Math.round(p.x * scale),
      y: Math.round(p.y * scale),
    });

    const c = {
      topLeft: scalePoint(editingCorners.topLeft),
      topRight: scalePoint(editingCorners.topRight),
      bottomRight: scalePoint(editingCorners.bottomRight),
      bottomLeft: scalePoint(editingCorners.bottomLeft),
    };

    // Draw shaded overlay outside the document
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, displayW, displayH);

    // Cutout polygon
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c.topLeft.x, c.topLeft.y);
    ctx.lineTo(c.topRight.x, c.topRight.y);
    ctx.lineTo(c.bottomRight.x, c.bottomRight.y);
    ctx.lineTo(c.bottomLeft.x, c.bottomLeft.y);
    ctx.closePath();
    ctx.clip();

    // Redraw clear image inside polygon
    ctx.drawImage(cropSourceImage, 0, 0, displayW, displayH);
    ctx.restore();

    // Draw neon boundary strokes
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(c.topLeft.x, c.topLeft.y);
    ctx.lineTo(c.topRight.x, c.topRight.y);
    ctx.lineTo(c.bottomRight.x, c.bottomRight.y);
    ctx.lineTo(c.bottomLeft.x, c.bottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Draw grid crosshairs inside document
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal center
    ctx.moveTo((c.topLeft.x + c.bottomLeft.x) / 2, (c.topLeft.y + c.bottomLeft.y) / 2);
    ctx.lineTo((c.topRight.x + c.bottomRight.x) / 2, (c.topRight.y + c.bottomRight.y) / 2);
    // Vertical center
    ctx.moveTo((c.topLeft.x + c.topRight.x) / 2, (c.topLeft.y + c.topRight.y) / 2);
    ctx.lineTo((c.bottomLeft.x + c.bottomRight.x) / 2, (c.bottomLeft.y + c.bottomRight.y) / 2);
    ctx.stroke();

    // Draw handles on 4 corners
    const drawCornerHandle = (p: Point, label: string) => {
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mini magnifying center point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCornerHandle(c.topLeft, 'TL');
    drawCornerHandle(c.topRight, 'TR');
    drawCornerHandle(c.bottomRight, 'BR');
    drawCornerHandle(c.bottomLeft, 'BL');
  }, [activeMode, cropSourceImage, editingCorners]);

  // Touch & Drag corner handle adjustment
  const handleCropCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!cropCanvasRef.current || !cropSourceImage || !editingCorners) return;

    const canvas = cropCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = cropSourceImage.naturalWidth / canvas.clientWidth;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const clickX = (clientX - rect.left) * scale;
    const clickY = (clientY - rect.top) * scale;

    const threshold = 40 * scale; // Touch target radius
    const corners: (keyof DocumentCorners)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

    for (const cornerKey of corners) {
      const p = editingCorners[cornerKey];
      const distance = Math.hypot(p.x - clickX, p.y - clickY);
      if (distance <= threshold) {
        setActiveCorner(cornerKey);
        break;
      }
    }
  };

  const handleCropCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!activeCorner || !cropCanvasRef.current || !cropSourceImage || !editingCorners) return;

    const canvas = cropCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = cropSourceImage.naturalWidth / canvas.clientWidth;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const newX = Math.max(0, Math.min(cropSourceImage.naturalWidth, Math.round((clientX - rect.left) * scale)));
    const newY = Math.max(0, Math.min(cropSourceImage.naturalHeight, Math.round((clientY - rect.top) * scale)));

    setEditingCorners((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [activeCorner]: { x: newX, y: newY },
      };
    });
  };

  const handleCropCanvasMouseUp = () => {
    setActiveCorner(null);
  };

  // Finalize crop & add page to document
  const handleApplyCrop = () => {
    if (!cropSourceImage || !editingCorners) return;

    // Warp perspective into flat document
    const warpedCanvas = warpPerspectiveCanvas(cropSourceImage, editingCorners);

    // Apply default 'bw' filter (Black & White scanner filter is the gold standard for scanned documents)
    const filteredCanvas = applyFilterToCanvas(warpedCanvas, 'bw');

    const processedDataUrl = filteredCanvas.toDataURL('image/jpeg', 0.9);

    // Generate small thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 120;
    thumbCanvas.height = Math.round((filteredCanvas.height / filteredCanvas.width) * 120);
    const thumbCtx = thumbCanvas.getContext('2d');
    if (thumbCtx) thumbCtx.drawImage(filteredCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    const newPage: ScannedPage = {
      id: Math.random().toString(36).substring(2, 9),
      originalDataUrl: cropSourceImage.src,
      originalWidth: cropSourceImage.naturalWidth,
      originalHeight: cropSourceImage.naturalHeight,
      corners: editingCorners,
      filter: 'bw',
      rotation: 0,
      processedDataUrl,
      thumbnailUrl: thumbUrl,
    };

    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setActiveMode('gallery');
    setCropSourceImage(null);
    setEditingCorners(null);
  };

  // Re-process active page when filter or rotation changes
  const updateActivePageProcessing = (page: ScannedPage, newFilter?: ScannerFilterType, newRotation?: number) => {
    const filter = newFilter !== undefined ? newFilter : page.filter;
    const rotation = newRotation !== undefined ? newRotation : page.rotation;

    const img = new Image();
    img.onload = () => {
      // 1. Warp perspective
      const warped = warpPerspectiveCanvas(img, page.corners);
      // 2. Rotate
      const rotated = rotateCanvas(warped, rotation);
      // 3. Apply filter
      const filtered = applyFilterToCanvas(rotated, filter);

      const processedDataUrl = filtered.toDataURL('image/jpeg', 0.9);

      setPages((prev) =>
        prev.map((p) =>
          p.id === page.id
            ? {
                ...p,
                filter,
                rotation,
                processedDataUrl,
              }
            : p
        )
      );
    };
    img.src = page.originalDataUrl;
  };

  // Page reordering
  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setActivePageIndex(targetIndex);
  };

  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    if (activePageIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
  };

  // Export to PDF
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    setExportedPdfBlob(null);

    let targetKb: number | undefined = undefined;
    if (compressOption === '200') targetKb = 200;
    else if (compressOption === '500') targetKb = 500;
    else if (compressOption === '1000') targetKb = 1000;
    else if (compressOption === 'custom') targetKb = customMaxKb;

    try {
      const blob = await exportScannedPagesToPdf(pages, targetKb);
      setExportedPdfBlob(blob);
      downloadBlob(blob, `scanned_document_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Open modal to attach scanned PDF to a master docket file
  const handleOpenAttachModal = async () => {
    if (pages.length === 0) return;
    if (!exportedPdfBlob) {
      setIsExporting(true);
      try {
        let targetKb: number | undefined = undefined;
        if (compressOption === '200') targetKb = 200;
        else if (compressOption === '500') targetKb = 500;
        else if (compressOption === '1000') targetKb = 1000;
        else if (compressOption === 'custom') targetKb = customMaxKb;
        const blob = await exportScannedPagesToPdf(pages, targetKb);
        setExportedPdfBlob(blob);
      } catch (err) {
        console.error('Failed to generate PDF before attach:', err);
      } finally {
        setIsExporting(false);
      }
    }
    if (!selectedDocketId && files.length > 0) {
      setSelectedDocketId(files[0].id);
    }
    if (!attachmentTitle) {
      setAttachmentTitle(`ಸ್ಕ್ಯಾನ್_ದಾಖಲೆ_${new Date().toISOString().slice(0, 10)}`);
    }
    setIsAttachModalOpen(true);
  };

  // Confirm attach to selected docket
  const handleConfirmAttachDocket = async () => {
    if (!selectedDocketId || !onAttachToDocket) return;
    setIsAttaching(true);
    try {
      let blob = exportedPdfBlob;
      if (!blob) {
        let targetKb: number | undefined = undefined;
        if (compressOption === '200') targetKb = 200;
        else if (compressOption === '500') targetKb = 500;
        else if (compressOption === '1000') targetKb = 1000;
        else if (compressOption === 'custom') targetKb = customMaxKb;
        blob = await exportScannedPagesToPdf(pages, targetKb);
        setExportedPdfBlob(blob);
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const newAtt: DocumentAttachment = {
            id: `att-scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            fileName: (attachmentTitle.trim() || `Scanned_Doc_${Date.now()}`) + '.pdf',
            fileSize: formatBytes(blob!.size),
            fileType: 'application/pdf',
            pageCount: pages.length,
            uploadedAt: new Date().toISOString().split('T')[0],
            dataUrl: dataUrl,
            description: attachmentDescription,
          };
          await onAttachToDocket(selectedDocketId, newAtt);
          setIsAttachModalOpen(false);
          showToast?.('ದಾಖಲೆಯನ್ನು ಕಡತಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ!');
        } catch (e) {
          console.error('Error attaching doc to docket:', e);
        } finally {
          setIsAttaching(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to confirm attach docket:', err);
      setIsAttaching(false);
    }
  };

  const activePage = pages[activePageIndex];

  // Filtered docket files for attachment modal
  const filteredDocketFiles = files.filter(f => {
    if (!docketSearchTerm.trim()) return true;
    const term = docketSearchTerm.toLowerCase();
    return f.fileNumber.toLowerCase().includes(term) || f.subject.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-stone-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-kannada">
                  ಕಛೇರಿ PDF ದಾಖಲೆ ಸ್ಕ್ಯಾನರ್ (Office PDF Document Scanner)
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800 font-mono">
                  HD CAMERA SCAN
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-400 font-kannada">
                ಭೌತಿಕ ಅರ್ಜಿ ಮತ್ತು ಕಾಗದ ಪತ್ರಗಳನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ, ಮೂಲೆ ಸರಿಪಡಿಸಿ (Perspective Crop), ಝೆರಾಕ್ಸ್ ಫಿಲ್ಟರ್ ಹಾಕಿ ಮತ್ತು ಕಂಪ್ರೆಸ್ಡ್ PDF ಸೃಜಿಸಿ ಅಥವಾ ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-stone-300 dark:border-slate-700 font-kannada"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CAMERA LIVE VIEWFINDER                                            */}
      {/* ========================================================================= */}
      {activeMode === 'camera' && (
        <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveMode('gallery')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ಪುಟಗಳಿಗೆ ಮರಳಿ (Back to Pages)</span>
            </button>
            {!cameraError && (
              <div className="flex items-center gap-2">
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      torchOn ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-white'
                    }`}
                    title="Toggle Flash / Torch"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Switch Camera (Front/Rear)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {cameraError ? (
            /* Permission Denied / Error Fallback UI with Comprehensive Instant Actions */
            <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-7 text-center space-y-5 max-w-xl mx-auto border border-amber-500/50 my-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 font-mono">
                  CAMERA PERMISSION & RESOLUTION
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white font-kannada">
                  ಕ್ಯಾಮರಾ ಅನುಮತಿ ನಿರ್ವಹಣೆ & ತ್ವರಿತ ಪರಿಹಾರ (Camera Permission Denied)
                </h3>
                <p className="text-xs text-slate-300 font-kannada max-w-md mx-auto leading-relaxed">
                  {cameraError}
                </p>
              </div>

              {/* Instant Alternative Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* Option 1: Native Camera Snap (No permission needed) */}
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex flex-col justify-between shadow-md transition-all cursor-pointer border border-emerald-400/40 group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs font-kannada flex items-center gap-1.5 text-white">
                      <Camera className="w-4 h-4 text-emerald-200" />
                      1. ಸಾಧನದ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold">
                      NO PERMISSION NEEDED
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-kannada leading-tight">
                    ಬ್ರೌಸರ್ ಅನುಮತಿ ಅಗತ್ಯವಿಲ್ಲದೆ ಮೊಬೈಲ್/ಟ್ಯಾಬ್ಲೆಟ್‌ನ ಸ್ಥಳೀಯ ಕ್ಯಾಮೆರಾದಿಂದ ನೇರ ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ.
                  </p>
                </button>

                {/* Option 2: Load Sample Govt Document for Instant Testing */}
                <button
                  type="button"
                  onClick={handleLoadSampleDocument}
                  className="p-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex flex-col justify-between shadow-md transition-all cursor-pointer border border-amber-300 group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs font-kannada flex items-center gap-1.5 text-slate-950">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      2. ಮಾದರಿ ಕಛೇರಿ ಪತ್ರ ಬಳಸಿ
                    </span>
                    <span className="text-[10px] bg-slate-950 text-amber-300 font-mono px-1.5 py-0.5 rounded font-bold">
                      INSTANT SAMPLE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-900 font-kannada leading-tight">
                    ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಕಛೇರಿ ಆದೇಶ ಪ್ರತಿಯನ್ನು ತಕ್ಷಣವೇ ಲೋಡ್ ಮಾಡಿ ಕ್ರಾಪ್ & ಫಿಲ್ಟರ್ ಪರೀಕ್ಷಿಸಿ.
                  </p>
                </button>
              </div>

              {/* Option 3: Upload PDF or Image File */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-purple-400 font-kannada shadow-xs"
                >
                  <FileText className="w-4 h-4 text-purple-200" />
                  <span>3. PDF ಕಡತ ಅಪ್‌ಲೋಡ್ (Upload PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700 font-kannada"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>ಫೋಟೋ / ಇಮೇಜ್ ಅಪ್‌ಲೋಡ್</span>
                </button>
              </div>

              {/* Browser Permission Step-by-Step Guide Box */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 text-left space-y-1.5">
                <p className="font-bold text-amber-300 flex items-center gap-1">
                  <span>💡 ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲೈವ್ ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ಹೇಗೆ ನೀಡುವುದು? (How to Allow):</span>
                </p>
                <div className="space-y-1 text-slate-300 pl-1 font-kannada">
                  <p>• <strong>Chrome / Edge / Brave:</strong> ಬ್ರೌಸರ್‌ನ ಅಡ್ರೆಸ್ ಬಾರ್‌ನಲ್ಲಿರುವ <strong>ಲಾಕ್ (🔒) ಅಥವಾ ಸೈಟ್ ಸೆಟ್ಟಿಂಗ್ಸ್</strong> ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ➔ <strong>Camera: Allow</strong> ನೀಡಿ ➔ ರಿಫ್ರೆಶ್ ಮಾಡಿ.</p>
                  <p>• <strong>Safari (iPhone / Mac):</strong> ಅಡ್ರೆಸ್ ಬಾರ್‌ನಲ್ಲಿ <strong>"aA"</strong> ಕ್ಲಿಕ್ ಮಾಡಿ ➔ <strong>Website Settings ➔ Camera: Allow</strong> ಆಯ್ಕೆಮಾಡಿ.</p>
                  <p>• <strong>Android Mobile:</strong> ಬ್ರೌಸರ್ ಮೆನು (⋮) ➔ Settings ➔ Site Settings ➔ Camera ➔ Allowed ಗೆ ಬದಲಾಯಿಸಿ.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry Live Stream)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('gallery')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer font-kannada"
                >
                  <span>← ಪುಟಗಳಿಗೆ ಮರಳಿ (Back to Gallery)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Video Viewfinder Container */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[65vh] mx-auto flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Document Guide Frame Overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  </div>
                  <span className="text-center text-xs text-white/80 font-medium drop-shadow-md font-kannada">
                    ಕಾಗದ ಪತ್ರವನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ಇರಿಸಿ (Align document edges inside frame)
                  </span>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>
              </div>

              {/* Shutter Button */}
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleCaptureSnapshot}
                  className="w-18 h-18 rounded-full border-4 border-white bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Take Photo"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CROP & PERSPECTIVE WARP ADJUSTMENT                                */}
      {/* ========================================================================= */}
      {activeMode === 'crop' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Crop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Adjust Document Corners</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag the 4 corner circles to match the edges of your paper document.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (cropSourceImage) {
                    setEditingCorners(getDefaultCorners(cropSourceImage.naturalWidth, cropSourceImage.naturalHeight));
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Reset Corners
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Flatten Page</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center p-1 select-none touch-none">
            <canvas
              ref={cropCanvasRef}
              onMouseDown={handleCropCanvasMouseDown}
              onMouseMove={handleCropCanvasMouseMove}
              onMouseUp={handleCropCanvasMouseUp}
              onTouchStart={handleCropCanvasMouseDown}
              onTouchMove={handleCropCanvasMouseMove}
              onTouchEnd={handleCropCanvasMouseUp}
              className="max-h-[68vh] w-auto object-contain cursor-crosshair"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Tip: Touch or click and drag any blue corner handle to straighten tilted photos.</span>
            <button
              onClick={() => setActiveMode('gallery')}
              className="text-rose-600 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: MULTI-PAGE GALLERY & PDF EXPORT                                   */}
      {/* ========================================================================= */}
      {activeMode === 'gallery' && (
        <div className="space-y-6">
          {/* Top Actions: Capture New Page (Camera) or Upload Document Photos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Document Pages ({pages.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture multiple pages, reorder them, apply B&W photocopy filters, and export to PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => pdfFileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white flex items-center gap-2 shadow-sm transition cursor-pointer font-kannada border border-purple-500"
                title="PDF ಕಡತವನ್ನು ಸ್ಕ್ಯಾನರ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload PDF Document)"
              >
                <FileText className="w-4 h-4 text-purple-200" />
                <span>📄 PDF ಅಪ್‌ಲೋಡ್</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('camera')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-sm transition cursor-pointer font-kannada"
                title="ಲೈವ್ ವೀಡಿಯೋ ವ್ಯೂಫೈಂಡರ್ ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನ್"
              >
                <Camera className="w-4 h-4" />
                <span>Camera Scan</span>
              </button>

              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-2 shadow-sm transition cursor-pointer font-kannada"
                title="ಸಾಧನದ ಸ್ಥಳೀಯ ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ (Does not require browser webcam permissions)"
              >
                <Camera className="w-4 h-4 text-emerald-200" />
                <span>ಕ್ಯಾಮರಾ ಫೋಟೋ (Quick Snap)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition cursor-pointer font-kannada"
                title="ಫೋಟೋ ಅಥವಾ PDF ಫೈಲ್ ಅಪ್‌ಲೋಡ್"
              >
                <Upload className="w-4 h-4 text-amber-500" />
                <span>ಫೈಲ್ ಅಪ್‌ಲೋಡ್ (Upload)</span>
              </button>

              <input
                ref={pdfFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleUploadFile}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleUploadFile}
                className="hidden"
              />
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUploadFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Empty State */}
          {pages.length === 0 && (
            <div className="p-10 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-xs">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 font-kannada">
                  ಯಾವುದೇ ದಾಖಲೆ ಪುಟಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿಲ್ಲ (No pages scanned yet)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-kannada">
                  ಕಛೇರಿ ಕಾಗದ ಪತ್ರಗಳು, ಅರ್ಜಿಗಳು ಅಥವಾ ಆದೇಶ ಪ್ರತಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಕೆಳಗಿನ ಯಾವುದೇ ವಿಧಾನವನ್ನು ಆರಿಸಿ:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white flex items-center gap-2 shadow-sm transition cursor-pointer font-kannada border border-purple-500"
                >
                  <FileText className="w-4 h-4 text-purple-200" />
                  <span>📄 PDF ಕಡತ ಅಪ್‌ಲೋಡ್ (Upload PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('camera')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-xs transition cursor-pointer font-kannada"
                >
                  <Camera className="w-4 h-4" />
                  <span>ಲೈವ್ ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನ್ (Live Viewfinder)</span>
                </button>

                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-2 shadow-xs transition cursor-pointer font-kannada"
                >
                  <Camera className="w-4 h-4 text-emerald-200" />
                  <span>ಸಾಧನದ ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ (Device Snap)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition cursor-pointer font-kannada"
                >
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ (Upload File)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleDocument}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-2 transition cursor-pointer font-kannada"
                  title="ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಮಾದರಿ ಕಛೇರಿ ಪತ್ರವನ್ನು ತಕ್ಷಣವೇ ಸ್ಕ್ಯಾನರ್‌ಗೆ ಲೋಡ್ ಮಾಡಿ"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>ಮಾದರಿ ಕಛೇರಿ ಪತ್ರ ಲೋಡ್ ಮಾಡಿ (Sample Doc)</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Page Editor Preview */}
          {activePage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left / Center: Large Page Viewer (8 Columns) */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Page {activePageIndex + 1} of {pages.length}
                  </span>

                  {/* Page Manipulations: Rotate, Move, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={activePageIndex === 0}
                      onClick={() => handleMovePage(activePageIndex, 'left')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move page earlier"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={activePageIndex === pages.length - 1}
                      onClick={() => handleMovePage(activePageIndex, 'right')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move page later"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActivePageProcessing(activePage, undefined, (activePage.rotation + 90) % 360)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePage(activePageIndex)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Document Filter Effect:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bw', label: 'B & W Scanner', desc: 'Clean white background' },
                      { id: 'enhanced', label: 'Enhanced', desc: 'Sharpened contrast' },
                      { id: 'grayscale', label: 'Grayscale', desc: 'Clean shades of grey' },
                      { id: 'original', label: 'Original', desc: 'True color photo' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateActivePageProcessing(activePage, f.id as ScannerFilterType)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                          activePage.filter === f.id
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{f.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Processed Page Preview */}
                <div className="h-[480px] rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={activePage.processedDataUrl}
                    alt={`Scanned Page ${activePageIndex + 1}`}
                    className="max-h-full max-w-full object-contain shadow-lg rounded"
                  />
                </div>

                {/* Bottom Thumbnail Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {pages.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => setActivePageIndex(i)}
                      className={`relative w-16 h-22 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activePageIndex === i
                          ? 'border-blue-600 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.thumbnailUrl} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/75 text-white px-1 rounded">
                        {i + 1}
                      </span>
                    </div>
                  ))}

                  <button
                    onClick={() => setActiveMode('camera')}
                    className="w-16 h-22 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-500 flex flex-col items-center justify-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Add</span>
                  </button>
                </div>
              </div>

              {/* Right Sidebar: PDF Export Settings (4 Columns) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 h-fit">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>PDF Export Settings</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compile all {pages.length} pages into a single print-ready PDF file.
                  </p>
                </div>

                {/* Optional "Compress to under X KB" */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Compress PDF to Target Size:</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Optional</span>
                  </label>

                  <div className="space-y-1.5 text-xs">
                    {[
                      { id: 'none', label: 'Full Resolution (No Compression)' },
                      { id: '1000', label: 'Under 1 MB' },
                      { id: '500', label: 'Under 500 KB' },
                      { id: '200', label: 'Under 200 KB (Portal Limit)' },
                      { id: 'custom', label: 'Custom Target Size' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${
                          compressOption === opt.id
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="compressOption"
                          checked={compressOption === opt.id}
                          onChange={() => setCompressOption(opt.id as any)}
                          className="text-blue-600"
                        />
                        <span className="font-medium text-xs">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {compressOption === 'custom' && (
                    <div className="flex items-center gap-2 pt-1 pl-2">
                      <span className="text-xs text-slate-500">Max size:</span>
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        value={customMaxKb}
                        onChange={(e) => setCustomMaxKb(parseInt(e.target.value) || 500)}
                        className="w-24 px-2 py-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-mono text-slate-500">KB</span>
                    </div>
                  )}
                </div>

                {/* Export & Download Button */}
                <button
                  type="button"
                  disabled={isExporting || pages.length === 0}
                  onClick={handleExportPdf}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Scanned PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Scanned PDF ({pages.length} Pages)</span>
                    </>
                  )}
                </button>

                {/* Option to Attach directly to Master Docket File */}
                {onAttachToDocket && files.length > 0 && (
                  <button
                    type="button"
                    disabled={isExporting || pages.length === 0}
                    onClick={handleOpenAttachModal}
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition disabled:opacity-50 cursor-pointer font-kannada"
                    title="ಈ ಸ್ಕ್ಯಾನ್ ದಾಖಲೆಯನ್ನು ಇ-ಕಛೇರಿ ಕಡತಕ್ಕೆ ನೇರವಾಗಿ ಲಗತ್ತಿಸಿ"
                  >
                    <FolderGit2 className="w-4 h-4 text-emerald-300" />
                    <span>📁 ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Attach to Docket)</span>
                  </button>
                )}

                {exportedPdfBlob && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 text-center font-medium">
                    PDF ಸಿದ್ಧವಾಗಿದೆ! ಗಾತ್ರ: <strong>{formatBytes(exportedPdfBlob.size)}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attach to Docket File Modal Dialog */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-stone-300 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white font-kannada">
                    ಕಡತಕ್ಕೆ ಸ್ಕ್ಯಾನ್ ದಾಖಲೆ ಲಗತ್ತಿಸಿ (Attach Scanned PDF)
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {pages.length} ಪುಟಗಳ ಕಂಪ್ರೆಸ್ಡ್ PDF ದಾಖಲೆ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Select Docket File */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 dark:text-stone-200 font-kannada">
                  ಕಛೇರಿ ಕಡತ ಆಯ್ಕೆಮಾಡಿ (Select Master Docket):
                </label>
                <input
                  type="text"
                  placeholder="ಕಡತ ಸಂಖ್ಯೆ ಅಥವಾ ವಿಷಯ ಹುಡುಕಿ..."
                  value={docketSearchTerm}
                  onChange={(e) => setDocketSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-sans text-xs mb-1"
                />
                <select
                  value={selectedDocketId}
                  onChange={(e) => setSelectedDocketId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {filteredDocketFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      [{file.fileNumber}] {file.subject} ({file.section})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Title */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 dark:text-stone-200 font-kannada">
                  ದಾಖಲೆಯ ಶೀರ್ಷಿಕೆ (Document Title):
                </label>
                <input
                  type="text"
                  value={attachmentTitle}
                  onChange={(e) => setAttachmentTitle(e.target.value)}
                  placeholder="ದಾಖಲೆಯ ಹೆಸರು (ಉದಾ: ಮೂಲ ಅರ್ಜಿ ಪ್ರತಿ)"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 dark:text-stone-200 font-kannada">
                  ವಿವರಣೆ / ವರ್ಗ (Category & Remarks):
                </label>
                <input
                  type="text"
                  value={attachmentDescription}
                  onChange={(e) => setAttachmentDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="button"
                disabled={isAttaching || !selectedDocketId}
                onClick={handleConfirmAttachDocket}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition disabled:opacity-50 cursor-pointer font-kannada"
              >
                {isAttaching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ಲಗತ್ತಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ಖಚಿತಪಡಿಸಿ & ಲಗತ್ತಿಸಿ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Processing Progress Modal */}
      {isPdfLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border-2 border-purple-500 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 mx-auto flex items-center justify-center">
              <RefreshCw className="w-7 h-7 animate-spin text-purple-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-white font-kannada">
                PDF ಪುಟಗಳನ್ನು ಸ್ಕ್ಯಾನರ್‌ಗೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ...
              </h3>
              <p className="text-xs text-stone-600 dark:text-slate-400 font-kannada">
                {pdfProgress ? `ಪುಟ ${pdfProgress.current} / ${pdfProgress.total} ಸಿದ್ಧವಾಗುತ್ತಿದೆ` : 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...'}
              </p>
            </div>
            {pdfProgress && (
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
