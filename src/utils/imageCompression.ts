import JSZip from 'jszip';
import { sanitizeFilename } from './formatters';

export interface CompressedImageResult {
  id: string;
  originalFile: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalPreviewUrl: string;

  compressedBlob: Blob | null;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  compressedPreviewUrl: string | null;

  targetBytes: number;
  qualityUsed: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

/**
 * Loads an image File into an HTMLImageElement asynchronously
 */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + String(e)));
    };
    img.src = url;
  });
}

/**
 * Encodes canvas to blob with given format & quality
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob encoding failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Compresses an image to be at or just under targetBytes using binary search on quality & dimension scaling
 */
export async function compressImageToTargetSize(
  file: File,
  targetBytes: number,
  outputMimeType: string = 'image/jpeg'
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  quality: number;
}> {
  const img = await loadImage(file);
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Maximum dimension cap to prevent browser memory crashes on massive mobile phone photos
  const MAX_INITIAL_DIM = 4096;
  if (width > MAX_INITIAL_DIM || height > MAX_INITIAL_DIM) {
    const ratio = Math.min(MAX_INITIAL_DIM / width, MAX_INITIAL_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Could not create canvas 2D context');

  // If the original file is already smaller than targetBytes and matches outputMimeType, we can return it
  if (file.size <= targetBytes && file.type === outputMimeType) {
    return {
      blob: file,
      width,
      height,
      quality: 1.0,
    };
  }

  let currentScale = 1.0;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.8;
  let bestWidth = width;
  let bestHeight = height;

  // Outer loop: downscale dimensions if even low quality cannot meet targetBytes
  const MAX_RESIZE_ATTEMPTS = 6;
  for (let resizeAttempt = 0; resizeAttempt < MAX_RESIZE_ATTEMPTS; resizeAttempt++) {
    const curW = Math.max(32, Math.round(width * currentScale));
    const curH = Math.max(32, Math.round(height * currentScale));

    canvas.width = curW;
    canvas.height = curH;

    // Fill white background for transparent PNG/WebP when converting to JPEG
    if (outputMimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, curW, curH);
    } else {
      ctx.clearRect(0, 0, curW, curH);
    }

    ctx.drawImage(img, 0, 0, curW, curH);

    // Binary search on quality between minQ and maxQ
    let lowQ = 0.05;
    let highQ = 0.95;
    let midQ = 0.75;
    let localBestBlob: Blob | null = null;
    let localBestQuality = midQ;

    // 6 iterations of binary search yields quality resolution of ~1.4%
    const BINARY_SEARCH_STEPS = 6;
    for (let step = 0; step < BINARY_SEARCH_STEPS; step++) {
      midQ = (lowQ + highQ) / 2;
      const testBlob = await canvasToBlob(canvas, outputMimeType, midQ);

      if (testBlob.size <= targetBytes) {
        // Meets target! Try to get higher quality that still fits
        localBestBlob = testBlob;
        localBestQuality = midQ;
        lowQ = midQ; // Push higher
      } else {
        // Exceeds target, need lower quality
        highQ = midQ;
      }
    }

    // Check if we found a valid blob under target
    if (localBestBlob && localBestBlob.size <= targetBytes) {
      bestBlob = localBestBlob;
      bestQuality = localBestQuality;
      bestWidth = curW;
      bestHeight = curH;
      break;
    }

    // If even min quality (0.05) exceeds target size, downscale dimensions and retry
    const minQBlob = await canvasToBlob(canvas, outputMimeType, 0.05);
    if (minQBlob.size <= targetBytes) {
      bestBlob = minQBlob;
      bestQuality = 0.05;
      bestWidth = curW;
      bestHeight = curH;
      break;
    }

    // Otherwise keep track of smallest so far and reduce scale
    if (!bestBlob || minQBlob.size < bestBlob.size) {
      bestBlob = minQBlob;
      bestQuality = 0.05;
      bestWidth = curW;
      bestHeight = curH;
    }

    // Proportional scale down based on excess
    const ratio = Math.sqrt(targetBytes / minQBlob.size);
    currentScale = Math.max(0.2, currentScale * Math.min(0.85, ratio * 0.95));
  }

  if (!bestBlob) {
    // Fallback: minimal canvas encode
    canvas.width = Math.max(32, Math.round(width * 0.5));
    canvas.height = Math.max(32, Math.round(height * 0.5));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    bestBlob = await canvasToBlob(canvas, outputMimeType, 0.5);
    bestWidth = canvas.width;
    bestHeight = canvas.height;
    bestQuality = 0.5;
  }

  return {
    blob: bestBlob,
    width: bestWidth,
    height: bestHeight,
    quality: Math.round(bestQuality * 100) / 100,
  };
}

/**
 * Creates a ZIP archive containing all compressed images
 */
export async function downloadAllAsZip(
  results: CompressedImageResult[],
  zipFilename: string = 'compressed_images.zip'
): Promise<Blob> {
  const zip = new JSZip();

  const nameCounts: Record<string, number> = {};

  for (const item of results) {
    if (!item.compressedBlob) continue;
    let filename = sanitizeFilename(item.originalFile.name, 'jpg');

    // Avoid duplicate file names in ZIP
    if (nameCounts[filename]) {
      const count = nameCounts[filename];
      nameCounts[filename] += 1;
      const lastDot = filename.lastIndexOf('.');
      const base = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
      const ext = lastDot !== -1 ? filename.substring(lastDot) : '.jpg';
      filename = `${base}_${count}${ext}`;
    } else {
      nameCounts[filename] = 1;
    }

    zip.file(filename, item.compressedBlob);
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
