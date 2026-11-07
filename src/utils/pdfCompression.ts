import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use unpkg CDN matching installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export type PdfCompressionProfile = 'low' | 'medium' | 'high' | 'target';

export interface PdfCompressionOptions {
  profile: PdfCompressionProfile;
  targetKb?: number; // Target size in KB if profile === 'target'
}

export interface PdfCompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  firstPagePreviewUrl: string;
}

/**
 * Compresses a PDF file by rendering each page to canvas, recompressing as JPEG, and rebuilding the PDF document
 */
export async function compressPdfDocument(
  file: File,
  options: PdfCompressionOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<PdfCompressionResult> {
  const originalSize = file.size;

  onProgress?.(0, 100, 'Loading and inspecting PDF document...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;

  const pageCount = pdfDoc.numPages;
  if (pageCount === 0) {
    throw new Error('The selected PDF has no pages.');
  }

  // Determine compression parameters
  let scale = 1.2;
  let jpegQuality = 0.65;

  if (options.profile === 'low') {
    // Low compression = highest visual quality
    scale = 1.5;
    jpegQuality = 0.85;
  } else if (options.profile === 'medium') {
    // Medium compression = balanced
    scale = 1.15;
    jpegQuality = 0.65;
  } else if (options.profile === 'high') {
    // High compression = maximum size reduction
    scale = 0.85;
    jpegQuality = 0.45;
  } else if (options.profile === 'target' && options.targetKb) {
    const targetBytes = options.targetKb * 1024;
    // Calculate per-page byte budget
    const perPageBudget = targetBytes / pageCount;

    if (perPageBudget < 25 * 1024) {
      // Very strict budget (under 25KB per page)
      scale = 0.75;
      jpegQuality = 0.35;
    } else if (perPageBudget < 60 * 1024) {
      // Under 60KB per page
      scale = 0.9;
      jpegQuality = 0.5;
    } else if (perPageBudget < 150 * 1024) {
      // Under 150KB per page
      scale = 1.1;
      jpegQuality = 0.65;
    } else {
      scale = 1.35;
      jpegQuality = 0.75;
    }
  }

  // Create jsPDF document instance
  let pdfOutput: jsPDF | null = null;
  let firstPagePreviewUrl = '';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Failed to create canvas rendering context');

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    onProgress?.(
      pageNum,
      pageCount,
      `Rendering & compressing page ${pageNum} of ${pageCount}...`
    );

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    };
    await page.render(renderContext as any).promise;

    // Convert canvas to JPEG data URL
    const imgDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);

    // Capture first page preview
    if (pageNum === 1) {
      firstPagePreviewUrl = imgDataUrl;
    }

    // PDF page dimensions in points (pt) - 72 pt per inch
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const pdfPageWidth = unscaledViewport.width;
    const pdfPageHeight = unscaledViewport.height;
    const orientation = pdfPageWidth > pdfPageHeight ? 'landscape' : 'portrait';

    if (!pdfOutput) {
      pdfOutput = new jsPDF({
        orientation,
        unit: 'pt',
        format: [pdfPageWidth, pdfPageHeight],
      });
      pdfOutput.addImage(imgDataUrl, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight);
    } else {
      pdfOutput.addPage([pdfPageWidth, pdfPageHeight], orientation);
      pdfOutput.addImage(imgDataUrl, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight);
    }
  }

  onProgress?.(pageCount, pageCount, 'Finalizing compressed PDF...');

  if (!pdfOutput) {
    throw new Error('Failed to generate PDF output');
  }

  const outputBlob = pdfOutput.output('blob');

  return {
    blob: outputBlob,
    originalSize,
    compressedSize: outputBlob.size,
    pageCount,
    firstPagePreviewUrl,
  };
}
