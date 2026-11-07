import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { loadImage } from './imageCompression';
import { sanitizeFilename } from './formatters';

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ConvertedJpgItem {
  id: string;
  originalFile: File;
  originalFormat: string;
  originalSize: number;
  originalPreviewUrl: string;

  convertedBlob: Blob | null;
  convertedSize: number;
  convertedPreviewUrl: string | null;
  width: number;
  height: number;
  status: 'pending' | 'converting' | 'success' | 'error';
  errorMessage?: string;
  targetSizeKb?: number;
}

export interface ConvertedPdfPageItem {
  pageNumber: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Converts any image (JPEG, PNG, WebP, GIF, BMP) to standardized .jpg format.
 * - For JPEG with same quality & no target size, preserves image directly.
 * - For PNG / WebP, paints a solid white background first so transparency does not turn black.
 * - Supports quality slider (0.60 to 1.00, default 0.92).
 * - Optional target size compression (e.g. 20 KB, 50 KB, 100 KB, or custom KB) with iterative refinement.
 */
export async function convertImageToJpg(
  file: File,
  quality: number = 0.92,
  targetSizeKb?: number
): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
  
  // If targetSizeKb is requested, perform iterative canvas compression
  if (targetSizeKb && targetSizeKb > 0) {
    return await compressImageToTargetKb(file, targetSizeKb);
  }

  // If it's already a JPEG and default quality is selected without adjustments, we can convert directly
  const img = await loadImage(file);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context for JPG conversion');

  // Fill pure white background behind transparent images (PNG, WebP, etc.)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width, height });
        } else {
          reject(new Error('Failed to convert canvas to JPG format'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Compresses an image to fit under target KB using iterative quality and dimension scaling
 */
async function compressImageToTargetKb(
  file: File,
  targetSizeKb: number
): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  const targetBytes = targetSizeKb * 1024;
  const img = await loadImage(file);
  
  let currentWidth = img.naturalWidth || img.width;
  let currentHeight = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to initialize canvas');

  let bestBlob: Blob | null = null;
  let minQuality = 0.15;
  let maxQuality = 0.95;
  let attempts = 0;

  // Binary search for optimal JPEG quality at current scale
  while (attempts < 6) {
    attempts++;
    const testQuality = (minQuality + maxQuality) / 2;

    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    const blob: Blob | null = await new Promise((res) => {
      canvas.toBlob((b) => res(b), 'image/jpeg', testQuality);
    });

    if (!blob) break;

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      // Try slightly higher quality
      minQuality = testQuality;
    } else {
      maxQuality = testQuality;
    }

    // If difference is small enough, stop
    if (Math.abs(blob.size - targetBytes) < 2048) {
      bestBlob = blob;
      break;
    }
  }

  // If still too large, downscale image dimensions progressively
  while (bestBlob && bestBlob.size > targetBytes && currentWidth > 320 && currentHeight > 320) {
    currentWidth = Math.round(currentWidth * 0.85);
    currentHeight = Math.round(currentHeight * 0.85);

    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    const blob: Blob | null = await new Promise((res) => {
      canvas.toBlob((b) => res(b), 'image/jpeg', 0.65);
    });

    if (blob) {
      bestBlob = blob;
    }
  }

  if (!bestBlob) {
    // Fallback: simple conversion
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
    bestBlob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob((b) => b ? res(b) : rej(new Error('Canvas conversion failed')), 'image/jpeg', 0.80);
    });
  }

  return {
    blob: bestBlob,
    width: currentWidth,
    height: currentHeight,
  };
}

/**
 * Creates a ZIP of converted JPG files
 */
export async function downloadConvertedAsZip(
  items: ConvertedJpgItem[],
  zipFilename: string = 'converted_jpg_files.zip'
): Promise<Blob> {
  const zip = new JSZip();
  const nameCounts: Record<string, number> = {};

  for (const item of items) {
    if (!item.convertedBlob) continue;
    let filename = sanitizeFilename(item.originalFile.name, 'jpg');

    if (nameCounts[filename]) {
      const count = nameCounts[filename];
      nameCounts[filename] += 1;
      const lastDot = filename.lastIndexOf('.');
      const base = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
      filename = `${base}_${count}.jpg`;
    } else {
      nameCounts[filename] = 1;
    }

    zip.file(filename, item.convertedBlob);
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Converts a PDF document into high-resolution JPG images (one per page).
 */
export async function convertPdfToJpgPages(
  file: File,
  quality: number = 0.92,
  scale: number = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertedPdfPageItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (numPages === 0) {
    throw new Error('PDF document contains no pages.');
  }

  const pages: ConvertedPdfPageItem[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`Failed to render page ${i} to JPG`))),
        'image/jpeg',
        quality
      );
    });

    pages.push({
      pageNumber: i,
      blob,
      previewUrl: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
    });
  }

  return pages;
}

/**
 * Downloads all extracted PDF pages as a single ZIP of JPG files.
 */
export async function downloadPdfPagesAsZip(
  pages: ConvertedPdfPageItem[],
  baseFilename: string = 'document_pages'
): Promise<Blob> {
  const zip = new JSZip();
  const cleanBase = sanitizeFilename(baseFilename.replace(/\.pdf$/i, ''), 'jpg').replace(/\.jpg$/i, '');

  for (const p of pages) {
    const filename = `${cleanBase}_page_${String(p.pageNumber).padStart(2, '0')}.jpg`;
    zip.file(filename, p.blob);
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Compiles multiple JPG/PNG images into a single clean PDF document.
 */
export async function convertJpgsToPdf(
  images: { name: string; file: File | Blob }[],
  title?: string
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('No images provided for PDF conversion.');
  }

  const pdfDoc = await PDFDocument.create();
  if (title) {
    pdfDoc.setTitle(title);
  }

  for (const imgItem of images) {
    const buffer = await imgItem.file.arrayBuffer();
    let embeddedImg;

    try {
      embeddedImg = await pdfDoc.embedJpg(buffer);
    } catch {
      try {
        embeddedImg = await pdfDoc.embedPng(buffer);
      } catch (e) {
        // If format is not raw JPG/PNG, convert via canvas to JPEG
        const blobUrl = URL.createObjectURL(imgItem.file);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = blobUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
          if (jpgBlob) {
            const jpgBuffer = await jpgBlob.arrayBuffer();
            embeddedImg = await pdfDoc.embedJpg(jpgBuffer);
          }
        }
        URL.revokeObjectURL(blobUrl);
      }
    }

    if (!embeddedImg) continue;

    const { width: imgW, height: imgH } = embeddedImg;
    // Standard A4: 595.28 x 841.89
    const a4W = 595.28;
    const a4H = 841.89;
    const margin = 20;
    const availW = a4W - margin * 2;
    const availH = a4H - margin * 2;

    const scale = Math.min(availW / imgW, availH / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const posX = margin + (availW - drawW) / 2;
    const posY = margin + (availH - drawH) / 2;

    const page = pdfDoc.addPage([a4W, a4H]);
    page.drawImage(embeddedImg, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
