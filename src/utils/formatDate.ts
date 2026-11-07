/**
 * Official Date Formatting Utility for Karnataka Government Communications
 * Standard Official Format: DD-MM-YYYY (ದಿನ-ತಿಂಗಳು-ವರ್ಷ)
 * Always displays Day first, then Month, then Year in English digits (0-9).
 */

export function formatDateDDMMYYYY(dateInput?: string | Date | number | null): string {
  if (!dateInput) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof dateInput === 'string') {
    // If already in DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyyMatch = dateInput.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0');
      const month = ddmmyyyyMatch[2].padStart(2, '0');
      const year = ddmmyyyyMatch[3];
      return `${day}-${month}-${year}`;
    }

    // If in YYYY-MM-DD format
    const yyyymmddMatch = dateInput.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (yyyymmddMatch) {
      const year = yyyymmddMatch[1];
      const month = yyyymmddMatch[2].padStart(2, '0');
      const day = yyyymmddMatch[3].padStart(2, '0');
      return `${day}-${month}-${year}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getCurrentDateDDMMYYYY(): string {
  return formatDateDDMMYYYY(new Date());
}
