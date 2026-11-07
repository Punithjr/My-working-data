export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  if (isNaN(bytes) || bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateSavings(originalBytes: number, newBytes: number): {
  savedBytes: number;
  percentage: number;
  isSmaller: boolean;
} {
  const savedBytes = originalBytes - newBytes;
  if (originalBytes <= 0) return { savedBytes: 0, percentage: 0, isSmaller: false };

  const percentage = Math.round((savedBytes / originalBytes) * 100);
  return {
    savedBytes,
    percentage: Math.max(0, percentage),
    isSmaller: newBytes < originalBytes,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sanitizeFilename(name: string, newExtension?: string): string {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
  if (!newExtension) return name;
  return `${base}.${newExtension.replace(/^\./, '')}`;
}
