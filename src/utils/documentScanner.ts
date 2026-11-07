import { jsPDF } from 'jspdf';

export interface Point {
  x: number;
  y: number;
}

export interface DocumentCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export type ScannerFilterType = 'original' | 'grayscale' | 'bw' | 'enhanced';

export interface ScannedPage {
  id: string;
  originalDataUrl: string;
  originalWidth: number;
  originalHeight: number;
  corners: DocumentCorners;
  filter: ScannerFilterType;
  rotation: number; // 0, 90, 180, 270
  processedDataUrl: string;
  thumbnailUrl: string;
}

/**
 * Estimates default document corners with a natural 6% inset from image boundaries
 */
export function getDefaultCorners(width: number, height: number): DocumentCorners {
  const insetX = width * 0.06;
  const insetY = height * 0.06;
  return {
    topLeft: { x: Math.round(insetX), y: Math.round(insetY) },
    topRight: { x: Math.round(width - insetX), y: Math.round(insetY) },
    bottomRight: { x: Math.round(width - insetX), y: Math.round(height - insetY) },
    bottomLeft: { x: Math.round(insetX), y: Math.round(height - insetY) },
  };
}

/**
 * Automated edge detection heuristic to find paper quadrilateral corners
 */
export function autoDetectDocumentCorners(
  canvas: HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number
): DocumentCorners {
  const defaultCorners = getDefaultCorners(imageWidth, imageHeight);

  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return defaultCorners;

    // Use a downsampled canvas for speed
    const sampleW = 200;
    const sampleH = Math.round((imageHeight / imageWidth) * 200);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sampleW;
    tempCanvas.height = sampleH;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return defaultCorners;

    tempCtx.drawImage(canvas, 0, 0, sampleW, sampleH);
    const imgData = tempCtx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    // Compute luminance map
    const luma = new Float32Array(sampleW * sampleH);
    for (let i = 0; i < data.length; i += 4) {
      luma[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Sobel edge detection
    let minX = sampleW, maxX = 0, minY = sampleH, maxY = 0;
    const threshold = 40;

    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = y * sampleW + x;
        const gx =
          -luma[idx - sampleW - 1] + luma[idx - sampleW + 1] +
          -2 * luma[idx - 1] + 2 * luma[idx + 1] +
          -luma[idx + sampleW - 1] + luma[idx + sampleW + 1];
        const gy =
          -luma[idx - sampleW - 1] - 2 * luma[idx - sampleW] - luma[idx - sampleW + 1] +
          luma[idx + sampleW - 1] + 2 * luma[idx + sampleW] + luma[idx + sampleW + 1];

        const mag = Math.sqrt(gx * gx + gy * gy);
        if (mag > threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Verify detected bounding box is reasonably sized (at least 35% of image)
    const detectedW = maxX - minX;
    const detectedH = maxY - minY;
    if (detectedW > sampleW * 0.35 && detectedH > sampleH * 0.35) {
      const scaleX = imageWidth / sampleW;
      const scaleY = imageHeight / sampleH;
      return {
        topLeft: { x: Math.round(minX * scaleX), y: Math.round(minY * scaleY) },
        topRight: { x: Math.round(maxX * scaleX), y: Math.round(minY * scaleY) },
        bottomRight: { x: Math.round(maxX * scaleX), y: Math.round(maxY * scaleY) },
        bottomLeft: { x: Math.round(minX * scaleX), y: Math.round(maxY * scaleY) },
      };
    }
  } catch (err) {
    console.warn('Auto edge detection fallback to default margin', err);
  }

  return defaultCorners;
}

/**
 * Calculates Euclidean distance between two points
 */
function dist(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Warps a quadrilateral region defined by 4 corners into a flattened rectangle on canvas
 * using piecewise affine triangle transformation
 */
export function warpPerspectiveCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  corners: DocumentCorners,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = corners;

  // Compute destination dimensions based on corner distances
  const widthTop = dist(tl, tr);
  const widthBottom = dist(bl, br);
  const destWidth = targetWidth || Math.round(Math.max(widthTop, widthBottom));

  const heightLeft = dist(tl, bl);
  const heightRight = dist(tr, br);
  const destHeight = targetHeight || Math.round(Math.max(heightLeft, heightRight));

  const destCanvas = document.createElement('canvas');
  destCanvas.width = destWidth;
  destCanvas.height = destHeight;
  const ctx = destCanvas.getContext('2d');
  if (!ctx) return destCanvas;

  // Helper to map a source triangle to a destination triangle using 2D canvas affine transform
  function mapTriangle(
    p0: Point, p1: Point, p2: Point, // Source triangle
    d0: Point, d1: Point, d2: Point  // Dest triangle
  ) {
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d0.x, d0.y);
    ctx.lineTo(d1.x, d1.y);
    ctx.lineTo(d2.x, d2.y);
    ctx.closePath();
    ctx.clip();

    // Compute affine transform matrix mapping p -> d
    // [x_d]   [a c e] [x_s]
    // [y_d] = [b d f] [y_s]
    // [ 1 ]   [0 0 1] [ 1 ]
    const x1 = p0.x, y1 = p0.y;
    const x2 = p1.x, y2 = p1.y;
    const x3 = p2.x, y3 = p2.y;

    const u1 = d0.x, v1 = d0.y;
    const u2 = d1.x, v2 = d1.y;
    const u3 = d2.x, v3 = d2.y;

    const denom = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - y2 * x3);
    if (Math.abs(denom) < 1e-5) {
      ctx.restore();
      return;
    }

    const a = (u1 * (y2 - y3) - u2 * (y1 - y3) + u3 * (y1 - y2)) / denom;
    const b = (v1 * (y2 - y3) - v2 * (y1 - y3) + v3 * (y1 - y2)) / denom;
    const c = (u1 * (x3 - x2) - u2 * (x3 - x1) + u3 * (x2 - x1)) / denom;
    const d = (v1 * (x3 - x2) - v2 * (x3 - x1) + v3 * (x2 - x1)) / denom;
    const e = (u1 * (x2 * y3 - x3 * y2) - u2 * (x1 * y3 - x3 * y1) + u3 * (x1 * y2 - x2 * y1)) / denom;
    const f = (v1 * (x2 * y3 - x3 * y2) - v2 * (x1 * y3 - x3 * y1) + v3 * (x1 * y2 - x2 * y1)) / denom;

    ctx.transform(a, b, c, d, e, f);
    ctx.drawImage(sourceImage, 0, 0);
    ctx.restore();
  }

  // Destination rectangle points
  const dTL: Point = { x: 0, y: 0 };
  const dTR: Point = { x: destWidth, y: 0 };
  const dBR: Point = { x: destWidth, y: destHeight };
  const dBL: Point = { x: 0, y: destHeight };

  // Warp Triangle 1: Top-Left half (TL, TR, BL)
  mapTriangle(tl, tr, bl, dTL, dTR, dBL);
  // Warp Triangle 2: Bottom-Right half (TR, BR, BL)
  mapTriangle(tr, br, bl, dTR, dBR, dBL);

  return destCanvas;
}

/**
 * Applies document filters to a canvas
 */
export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filter: ScannerFilterType
): HTMLCanvasElement {
  if (filter === 'original') return canvas;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  if (filter === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = g;
      data[i + 1] = g;
      data[i + 2] = g;
    }
  } else if (filter === 'bw') {
    // High-clarity binarization: adaptive thresholding turns paper white & ink dark black
    // 1. Calculate average luminance
    let totalLuma = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avgLuma = totalLuma / (data.length / 4);
    const threshold = Math.min(190, Math.max(105, avgLuma * 0.94));

    for (let i = 0; i < data.length; i += 4) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = g < threshold ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (filter === 'enhanced') {
    // Document enhancement: boost contrast, brighten whites, sharpen darks
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Stretch contrast
      r = Math.min(255, Math.max(0, (r - 35) * 1.35));
      g = Math.min(255, Math.max(0, (g - 35) * 1.35));
      b = Math.min(255, Math.max(0, (b - 35) * 1.35));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Rotates a canvas by given degrees (90, 180, 270)
 */
export function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  rotation: number
): HTMLCanvasElement {
  const normRot = ((rotation % 360) + 360) % 360;
  if (normRot === 0) return sourceCanvas;

  const out = document.createElement('canvas');
  const ctx = out.getContext('2d');
  if (!ctx) return sourceCanvas;

  if (normRot === 90 || normRot === 270) {
    out.width = sourceCanvas.height;
    out.height = sourceCanvas.width;
  } else {
    out.width = sourceCanvas.width;
    out.height = sourceCanvas.height;
  }

  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((normRot * Math.PI) / 180);
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);

  return out;
}

/**
 * Compiles an array of processed scanned pages into a single PDF document
 */
export async function exportScannedPagesToPdf(
  pages: ScannedPage[],
  targetMaxKb?: number
): Promise<Blob> {
  if (pages.length === 0) throw new Error('No scanned pages to export');

  // Estimate per-page budget if targetMaxKb is set
  let jpegQuality = 0.85;
  if (targetMaxKb && targetMaxKb > 0) {
    const budgetPerPage = (targetMaxKb * 1024) / pages.length;
    if (budgetPerPage < 40 * 1024) {
      jpegQuality = 0.45;
    } else if (budgetPerPage < 100 * 1024) {
      jpegQuality = 0.65;
    } else {
      jpegQuality = 0.8;
    }
  }

  let pdf: jsPDF | null = null;

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = p.processedDataUrl;
    });

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    // Standard A4 dimensions in points: 595.28 x 841.89
    const isLandscape = imgW > imgH;
    const orientation = isLandscape ? 'landscape' : 'portrait';

    // Scale to fit on A4
    const a4W = isLandscape ? 841.89 : 595.28;
    const a4H = isLandscape ? 595.28 : 841.89;

    if (!pdf) {
      pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: 'a4',
      });
    } else {
      pdf.addPage('a4', orientation);
    }

    // Convert image to JPEG data url at desired quality
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgW;
    tempCanvas.height = imgH;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(img, 0, 0);
      const pageDataUrl = tempCanvas.toDataURL('image/jpeg', jpegQuality);
      pdf.addImage(pageDataUrl, 'JPEG', 0, 0, a4W, a4H, undefined, 'FAST');
    }
  }

  if (!pdf) throw new Error('Failed to generate scanned PDF');
  return pdf.output('blob');
}
