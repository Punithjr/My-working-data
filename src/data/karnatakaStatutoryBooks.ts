// Karnataka Government Statutory Rule Books Data Compendium
// Covering:
// 1. KCSR - Karnataka Civil Services Rules, 1958 (ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958)
// 2. KFC - Karnataka Financial Code, 1958 (ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958)
// 3. KCS (CCA) - Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957 (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಅಪೀಲು ನಿಯಮಗಳು, 1957)
// 4. KCS (Conduct) Rules, 1966 (ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ ನಡತೆ ನಿಯಮಾವಳಿಗಳು, 1966)
// 5. KSMOP - Karnataka State Manual of Office Procedure (ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನ ಕೈಪಿಡಿ)
// 6. KTC - Karnataka Treasury Code (ಕರ್ನಾಟಕ ಖಜಾನೆ ಸಂಹಿತೆ)
// 7. Karnataka Education Act 1983 & RTE 2009 (ಶಿಕ್ಷಣ ಕಾಯ್ದೆ & ಉಚಿತ ಶಿಕ್ಷಣ ಹಕ್ಕು)

export type StatutoryBookKey = 'KCSR' | 'KFC' | 'CCA' | 'CONDUCT' | 'KSMOP' | 'KTC' | 'EDU_ACT';

export type StatutoryCategory = 
  | 'leave' 
  | 'pay_increment' 
  | 'pension' 
  | 'discipline' 
  | 'finance_grant' 
  | 'conduct' 
  | 'office_procedure' 
  | 'education';

export interface StatutoryRule {
  id: string;
  book: StatutoryBookKey;
  bookNameKannada: string;
  bookNameEnglish: string;
  ruleNumber: string; // e.g. "ನಿಯಮ 112" or "ಅನುಚ್ಛೇದ 99"
  chapterOrPart?: string;
  titleKannada: string;
  titleEnglish: string;
  category: StatutoryCategory;
  summaryKannada: string;
  legalTextKannada?: string;
  citationSnippet: string; // Ready for Reference (ಉಲ್ಲೇಖ)
  orderClauseSnippet: string; // Ready for Preamble / Order Body (ಪ್ರಸ್ತಾವನೆ / ಆದೇಶ)
  subjectSnippet: string; // Ready for Subject (ವಿಷಯ)
  popularForLetterType: ('general' | 'memorandum' | 'circular' | 'pension' | 'discipline' | 'financial')[];
  tags: string[];
}

export interface StatutoryBookInfo {
  key: StatutoryBookKey;
  titleKannada: string;
  titleEnglish: string;
  shortDescKannada: string;
  promulgatedYear: string;
  authorityKannada: string;
  badgeColor: string;
  iconName: string;
  ruleCount: number;
}

export const STATUTORY_BOOKS_INFO: Record<StatutoryBookKey, StatutoryBookInfo> = {
  KCSR: {
    key: 'KCSR',
    titleKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958 (KCSR)',
    titleEnglish: 'Karnataka Civil Services Rules, 1958',
    shortDescKannada: 'ಸರ್ಕಾರಿ ನೌಕರರ ನೇಮಕಾತಿ, ವೇತನ, ವೇತನ ಬಡ್ತಿ, ರಜೆಗಳು, ನಿವೃತ್ತಿ, ಪಿಂಚಣಿ ಮತ್ತು ಪ್ರಯಾಣ ಭತ್ಯೆ ನಿಯಮಗಳು.',
    promulgatedYear: '1958',
    authorityKannada: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣಾ ಇಲಾಖೆ (DPAR) & ಹಣಕಾಸು ಇಲಾಖೆ',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconName: 'BookOpen',
    ruleCount: 16
  },
  KFC: {
    key: 'KFC',
    titleKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958 (KFC)',
    titleEnglish: 'Karnataka Financial Code, 1958',
    shortDescKannada: 'ಸರ್ಕಾರಿ ಕಚೇರಿಗಳ ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ, ಅನುದಾನ ಹಂಚಿಕೆ, ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚಗಳು, ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ಬಿಲ್ ಪಾವತಿ ನಿಯಮಗಳು.',
    promulgatedYear: '1958',
    authorityKannada: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಹಣಕಾಸು ಇಲಾಖೆ (Finance Department)',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconName: 'Coins',
    ruleCount: 8
  },
  CCA: {
    key: 'CCA',
    titleKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಅಪೀಲು) ನಿಯಮಗಳು, 1957 (CCA)',
    titleEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    shortDescKannada: 'ನೌಕರರ ಮೇಲಿನ ಶಿಸ್ತು ಕ್ರಮ, ಅಮಾನತು, ಇಲಾಖಾ ವಿಚಾರಣೆ, ಸಣ್ಣ ಮತ್ತು ದೊಡ್ಡ ದಂಡನೆಗಳು ಹಾಗೂ ಮೇಲ್ಮನವಿ ಪ್ರಕ್ರಿಯೆಗಳು.',
    promulgatedYear: '1957',
    authorityKannada: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣಾ ಇಲಾಖೆ (DPAR)',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    iconName: 'ShieldAlert',
    ruleCount: 9
  },
  CONDUCT: {
    key: 'CONDUCT',
    titleKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಾವಳಿಗಳು, 1966',
    titleEnglish: 'KCS (Conduct) Rules, 1966',
    shortDescKannada: 'ಸರ್ಕಾರಿ ನೌಕರರ ನಡವಳಿಕೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ, ಖಾಸಗಿ ವ್ಯವಹಾರ ನಿಷೇಧ, ಉಡುಗೊರೆ ಸ್ವೀಕಾರ ಮತ್ತು ಆಸ್ತಿ ಘೋಷಣೆ ನಿಯಮಗಳು.',
    promulgatedYear: '1966',
    authorityKannada: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣಾ ಇಲಾಖೆ (DPAR)',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    iconName: 'CheckCircle',
    ruleCount: 6
  },
  KSMOP: {
    key: 'KSMOP',
    titleKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನ ಕೈಪಿಡಿ (KSMOP)',
    titleEnglish: 'Karnataka State Manual of Office Procedure',
    shortDescKannada: 'ಕಡತ ನಿರ್ವಹಣೆ, ಟಿಪ್ಪಣಿ ಬರೆಯುವುದು, ಪತ್ರ ವ್ಯವಹಾರ ಶೈಲಿ, ಆವಕ-ಜಾವಕ ರಿಜಿಸ್ಟರ್ ಮತ್ತು ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ.',
    promulgatedYear: '1998 / 2012',
    authorityKannada: 'ಆಡಳಿತ ಸುಧಾರಣಾ ನಿರ್ದೇಶನಾಲಯ (DIR)',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    iconName: 'FileText',
    ruleCount: 5
  },
  KTC: {
    key: 'KTC',
    titleKannada: 'ಕರ್ನಾಟಕ ಖಜಾನೆ ಸಂಹಿತೆ (KTC)',
    titleEnglish: 'Karnataka Treasury Code',
    shortDescKannada: 'ಡಿಡಿಓ ವೇತನ ಬಿಲ್ ಸಲ್ಲಿಕೆ, ಖಜಾನೆ-2 (K2), ಟೋಕನ್ ಸೃಜನೆ ಮತ್ತು ಸರ್ಕಾರಿ ಹಣ ರವಾನೆ ನಿಯಮಗಳು.',
    promulgatedYear: '1958',
    authorityKannada: 'ಖಜಾನೆ ಇಲಾಖೆ (Treasuries Department)',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    iconName: 'Building',
    ruleCount: 4
  },
  EDU_ACT: {
    key: 'EDU_ACT',
    titleKannada: 'ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ಮತ್ತು RTE ನಿಯಮಗಳು 2009',
    titleEnglish: 'Karnataka Education Act 1983 & RTE Rules',
    shortDescKannada: 'ಶಾಲೆಗಳ ನೋಂದಣಿ, ಮಾನ್ಯತೆ ನವೀಕರಣ, ಅನುದಾನ ನಿಯಮಗಳು, ಮಕ್ಕಳ ಉಚಿತ ಶಿಕ್ಷಣ ಹಕ್ಕು ಮತ್ತು ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಅಧಿಕಾರ.',
    promulgatedYear: '1983 / 2009',
    authorityKannada: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ (School Education)',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    iconName: 'GraduationCap',
    ruleCount: 5
  }
};

export const KARNATAKA_STATUTORY_RULES: StatutoryRule[] = [
  // ==========================================
  // KCSR RULES (ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು)
  // ==========================================
  {
    id: 'kcsr-rule-112',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 112',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ರಜೆ ನಿಯಮಗಳು',
    titleKannada: 'ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ (Earned Leave - EL)',
    titleEnglish: 'Earned Leave Sanction Rules',
    category: 'leave',
    summaryKannada: 'ಸರ್ಕಾರಿ ನೌಕರರು ಗಳಿಸಿದ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರ. ರಜಾ ಕಾಲದ ಇಲಾಖೆಗಳ ನೌಕರರಿಗೆ (ಶಿಕ್ಷಕರು) ವರ್ಷಕ್ಕೆ 10 ದಿನಗಳು ಮತ್ತು ರಜಾರಹಿತ ಇಲಾಖಾ ನೌಕರರಿಗೆ ವರ್ಷಕ್ಕೆ 30 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ಜಮೆಯಾಗುತ್ತದೆ. ಗರಿಷ್ಠ 300 ದಿನಗಳವರೆಗೆ ಗಳಿಕೆ ರಜೆ ಸಂಚಿತಗೊಳ್ಳಲು ಅವಕಾಶವಿದೆ.',
    legalTextKannada: 'KCSR ನಿಯಮ 112 ರ ಪ್ರಕಾರ, ಸರ್ಕಾರಿ ನೌಕರನು ಅರ್ಹತೆ ಪಡೆದ ಗಳಿಕೆ ರಜೆಯನ್ನು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು ಮಂಜೂರು ಮಾಡಬಹುದು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 112ರ ಪ್ರಕಾರ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ ಕುರಿತು.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 112 ರನ್ವಯ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರವನ್ನು ಚಲಾಯಿಸಿ, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ ನಿಗದಿತ ಅವಧಿಯ ಗಳಿಕೆ ರಜೆಯನ್ನು (EL) ಈ ಕೆಳಗಿನ ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ 1958 ರ ನಿಯಮ 112 ರನ್ವಯ ಗಳಿಕೆ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಗಳಿಕೆ ರಜೆ', 'EL', 'KCSR 112', 'Leave', 'ರಜೆ ಮಂಜೂರಾತಿ', 'ಸೇವೆ']
  },
  {
    id: 'kcsr-rule-114',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 114',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ರಜೆ ನಿಯಮಗಳು',
    titleKannada: 'ಅರ್ಧ ವೇತನ ರಜೆ (Half Pay Leave - HPL)',
    titleEnglish: 'Half Pay Leave Rules',
    category: 'leave',
    summaryKannada: 'ಪ್ರತಿ ಪೂರ್ಣಗೊಂಡ ವರ್ಷದ ಸೇವೆಗೆ 20 ದಿನಗಳಂತೆ ಅರ್ಧ ವೇತನ ರಜೆ ಜಮೆಯಾಗುತ್ತದೆ. ಇದನ್ನು ಖಾಸಗಿ ವ್ಯವಹಾರ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರದ ಆಧಾರದ ಮೇಲೆ ಮಂಜೂರು ಮಾಡಬಹುದು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 114ರ ಪ್ರಕಾರ ಅರ್ಧ ವೇತನ ರಜೆ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 114 ರ ಮೇರೆಗೆ, ಅರ್ಧ ವೇತನ ರಜೆಯನ್ನು (HPL) ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಪರಿಶೀಲಿಸಿ ಮಂಜೂರು ಮಾಡಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 114 ರನ್ವಯ ಅರ್ಧ ವೇತನ ರಜೆ (HPL) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['HPL', 'ಅರ್ಧ ವೇತನ ರಜೆ', 'KCSR 114', 'Leave']
  },
  {
    id: 'kcsr-rule-118',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 118',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ರಜೆ ನಿಯಮಗಳು',
    titleKannada: 'ಪರಿವರ್ತಿತ ರಜೆ (Commuted Leave on Medical Ground)',
    titleEnglish: 'Commuted Leave on Medical Certificate',
    category: 'leave',
    summaryKannada: 'ನೌಕರರ ಶಿಲ್ಕಿನಲ್ಲಿರುವ ಅರ್ಧ ವೇತನ ರಜೆಯನ್ನು ವೈದ್ಯಕೀಯ ಮಂಡಳಿ/ಸರ್ಕಾರಿ ವೈದ್ಯಾಧಿಕಾರಿಗಳ ಪ್ರಮಾಣಪತ್ರದ ಮೇರೆಗೆ ದುಪ್ಪಟ್ಟು ಕಡಿತಗೊಳಿಸಿ ಪೂರ್ಣ ವೇತನ ಸಹಿತ ಪರಿವರ್ತಿತ ರಜೆಯಾಗಿ ಮಂಜೂರು ಮಾಡುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 118ರ ಪ್ರಕಾರ ವೈದ್ಯಕೀಯ ಆಧಾರದ ಮೇಲಿನ ಪರಿವರ್ತಿತ ರಜೆ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 118ರ ಅನ್ವಯ ಸಕ್ಷಮ ವೈದ್ಯಾಧಿಕಾರಿಗಳ ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರದ ಆಧಾರದಲ್ಲಿ ಅರ್ಧ ವೇತನ ರಜಾ ಲೆಕ್ಕದಿಂದ ದುಪ್ಪಟ್ಟು ಕಡಿತಗೊಳಿಸಿ ಪರಿವರ್ತಿತ ರಜೆ ಎಂದು ಪರಿಗಣಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 118 ರ ಮೇರೆಗೆ ಪರಿವರ್ತಿತ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಪರಿವರ್ತಿತ ರಜೆ', 'ವೈದ್ಯಕೀಯ ರಜೆ', 'Commuted Leave', 'KCSR 118']
  },
  {
    id: 'kcsr-rule-118a',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 118(ಎ)',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ರಜೆ ನಗದೀಕರಣ',
    titleKannada: 'ನಿವೃತ್ತಿ ಕಾಲದ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ (Encashment of Earned Leave at Retirement)',
    titleEnglish: 'Encashment of Earned Leave at Retirement (Max 300 days)',
    category: 'pension',
    summaryKannada: 'ವಯೋನಿವೃತ್ತಿ, ಸ್ವಯಂ ನಿವೃತ್ತಿ ಅಥವಾ ಸೇವೆಯಲ್ಲಿದ್ದಾಗ ಮರಣ ಹೊಂದಿದ ಸಂದರ್ಭದಲ್ಲಿ ಗರಿಷ್ಠ 300 ದಿನಗಳವರೆಗೆ ಗಳಿಕೆ ರಜೆಯ ನಗದೀಕರಣ ಸೌಲಭ್ಯವನ್ನು ಮಂಜೂರು ಮಾಡುವ ನಿಯಮ. ಸೂತ್ರ: (ಮೂಲ ವೇತನ + ತುಟ್ಟಿಭತ್ಯೆ) / 30 x ರಜೆ ದಿನಗಳು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 118(ಎ) ಹಾಗೂ ತದನಂತರದ ತಿದ್ದುಪಡಿ ಆದೇಶಗಳನ್ವಯ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 118(ಎ) ರನ್ವಯ, ನಿವೃತ್ತ ನೌಕರರ ಖಾತೆಯಲ್ಲಿರುವ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕನ್ನು (ಗರಿಷ್ಠ 300 ದಿನಗಳು) ನಗದೀಕರಿಸಲು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಅನುಮೋದನೆ ನೀಡಿ ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 118(ಎ) ರನ್ವಯ ನಿವೃತ್ತಿ ಕಾಲದ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ ಮಂಜೂರಾತಿ ಬಗ್ಗೆ.',
    popularForLetterType: ['memorandum', 'pension'],
    tags: ['ರಜೆ ನಗದೀಕರಣ', 'Leave Encashment', 'KCSR 118A', '300 ದಿನಗಳು', 'ಪಿಂಚಣಿ']
  },
  {
    id: 'kcsr-rule-135',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 135',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ವಿಶೇಷ ರಜೆಗಳು',
    titleKannada: 'ಹೆರಿಗೆ ರಜೆ (Maternity Leave - 180 Days)',
    titleEnglish: 'Maternity Leave Rules for Female Government Servants',
    category: 'leave',
    summaryKannada: 'ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಗರಿಷ್ಠ ಎರಡು ಜೀವಂತ ಮಕ್ಕಳವರೆಗೆ ತಲಾ 180 ದಿನಗಳ ಪೂರ್ಣ ವೇತನ ಸಹಿತ ಹೆರಿಗೆ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 135 ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಎಫ್‌ಡಿ 04 ಎಸ್‌ಆರ್‌ಎಸ್ 2012 ರಂತೆ ಹೆರಿಗೆ ರಜೆ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 135 ರನ್ವಯ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರದ ಮೇರೆಗೆ ಮಹಿಳಾ ನೌಕರರಿಗೆ 180 ದಿನಗಳ ಪೂರ್ಣ ವೇತನ ಸಹಿತ ಹೆರಿಗೆ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 135 ರ ಪ್ರಕಾರ 180 ದಿನಗಳ ಹೆರಿಗೆ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಹೆರಿಗೆ ರಜೆ', 'Maternity Leave', 'KCSR 135', '180 ದಿನಗಳು']
  },
  {
    id: 'kcsr-rule-135a',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 135(ಎ)',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ವಿಶೇಷ ರಜೆಗಳು',
    titleKannada: 'ಪಿತೃತ್ವ ರಜೆ (Paternity Leave - 15 Days)',
    titleEnglish: 'Paternity Leave for Male Government Servants',
    category: 'leave',
    summaryKannada: 'ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಪತ್ನಿಯ ಹೆರಿಗೆಯ ಸಮಯದಲ್ಲಿ ಗರಿಷ್ಠ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ (ಮಗುವಿನ ಜನನದ ದಿನಾಂಕದಿಂದ 6 ತಿಂಗಳ ಒಳಗೆ ಬಳಸಿಕೊಳ್ಳತಕ್ಕದ್ದು).',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 135(ಎ) ರನ್ವಯ ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 135(ಎ) ರನ್ವಯ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಈ ಮೂಲಕ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 135(ಎ) ರನ್ವಯ 15 ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಪಿತೃತ್ವ ರಜೆ', 'Paternity Leave', 'KCSR 135A', '15 ದಿನಗಳು']
  },
  {
    id: 'kcsr-rule-135b',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 135(ಬಿ)',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ವಿಶೇಷ ರಜೆಗಳು',
    titleKannada: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave - CCL - 180 Days)',
    titleEnglish: 'Child Care Leave for Female Employees & Single Male Parents',
    category: 'leave',
    summaryKannada: 'ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ತಮ್ಮ ಇಬ್ಬರು ಹಿರಿಯ ಜೀವಂತ ಮಕ್ಕಳ ಪಾಲನೆ, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಪರೀಕ್ಷಾ ತಯಾರಿಗಾಗಿ ಇಡೀ ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ಗರಿಷ್ಠ 180 ದಿನಗಳವರೆಗೆ ಮಂಜೂರು ಮಾಡುವ ರಜೆ. ಒಂದು ಕ್ಯಾಲೆಂಡರ್ ವರ್ಷದಲ್ಲಿ ಗರಿಷ್ಠ 3 ಬಾರಿ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಬಹುದು (ಕನಿಷ್ಠ 15 ದಿನಗಳು).',
    citationSnippet: 'ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಸಿಆಸುಇ 16 ಸೇನಿಸೇ 2021, ದಿನಾಂಕ: 21-02-2022 ಮತ್ತು KCSR ನಿಯಮ 135(ಬಿ) ರನ್ವಯ ಶಿಶುಪಾಲನ ರಜೆ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 135(ಬಿ) ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶದನ್ವಯ ಅರ್ಹತಾ ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು (CCL) ಈ ಕೆಳಗಿನಂತೆ ಮಂಜೂರು ಮಾಡಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 135(ಬಿ) ರನ್ವಯ ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಶಿಶುಪಾಲನ ರಜೆ', 'CCL', 'Child Care Leave', 'KCSR 135B', '180 ದಿನಗಳು']
  },
  {
    id: 'kcsr-rule-51',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 51',
    chapterOrPart: 'ಅಧ್ಯಾಯ IV - ವೇತನ ಮತ್ತು ವೇತನ ಬಡ್ತಿ',
    titleKannada: 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ (Annual Increment - ಪ್ರಪತ್ರ-28)',
    titleEnglish: 'Sanction of Annual Increment in Time Scale of Pay',
    category: 'pay_increment',
    summaryKannada: 'ಸರ್ಕಾರಿ ನೌಕರನು ವೇತನ ಶ್ರೇಣಿಯಲ್ಲಿ ಒಂದು ವರ್ಷದ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದಾಗ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಪ್ರಪತ್ರ-28 ರಲ್ಲಿ ಮಂಜೂರು ಮಾಡುವ ಮೂಲಭೂತ ನಿಯಮ. ಶಿಸ್ತು ಕ್ರಮದಲ್ಲಿ ಬಡ್ತಿ ತಡೆಹಿಡಿಯದಿದ್ದರೆ ಇದು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅರ್ಹವಾಗುತ್ತದೆ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958ರ ನಿಯಮ 51ರ ಪ್ರಕಾರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958 ರ ನಿಯಮ 51 ರನ್ವಯ, ಸಂಬಂಧಪಟ್ಟ ನೌಕರರು ತೃಪ್ತಿಕರ ಸೇವೆ ಸಲ್ಲಿಸಿರುವುದರಿಂದ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಮಂಜೂರು ಮಾಡಿ ಅವರ ಮುಂದಿನ ವೇತನವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ 1958 ರ ನಿಯಮ 51 ರ ಅನ್ವಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['memorandum', 'general'],
    tags: ['ವೇತನ ಬಡ್ತಿ', 'Increment', 'ಪ್ರಪತ್ರ-28', 'KCSR 51', 'ವೇತನ ನಿಗದಿ']
  },
  {
    id: 'kcsr-rule-53',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 53',
    chapterOrPart: 'ಅಧ್ಯಾಯ IV - ವೇತನ ಬಡ್ತಿ ತಡೆಹಿಡಿಯುವಿಕೆ',
    titleKannada: 'ವೇತನ ಬಡ್ತಿ ತಡೆಹಿಡಿಯುವಿಕೆ (Withholding of Increment)',
    titleEnglish: 'Withholding of Increment on Disciplinary Grounds',
    category: 'discipline',
    summaryKannada: 'ಅತೃಪ್ತಿಕರ ನಡತೆ ಅಥವಾ ಇಲಾಖಾ ದೋಷಾರೋಪಣೆಯ ಕಾರಣಕ್ಕಾಗಿ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ನಿರ್ದಿಷ್ಟ ಅವಧಿಗೆ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ಸಂಚಿತ ಪರಿಣಾಮದೊಂದಿಗೆ ಅಥವಾ ಸಂಚಿತ ಪರಿಣಾಮವಿಲ್ಲದೆ (with or without cumulative effect) ತಡೆಹಿಡಿಯುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 53 ಮತ್ತು KCS (CCA) ನಿಯಮ 8 ರನ್ವಯ ವೇತನ ಬಡ್ತಿ ತಡೆಹಿಡಿಯುವ ಆದೇಶ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 53 ರ ಅನ್ವಯ ಸಕ್ಷಮ ಶಿಸ್ತು ಪ್ರಾಧಿಕಾರವು ಆರೋಪಿತ ನೌಕರನ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಯನ್ನು ನಿರ್ದಿಷ್ಟ ಅವಧಿಗೆ ತಡೆಹಿಡಿಯಲು ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 53 ರನ್ವಯ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ತಡೆಹಿಡಿಯುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['memorandum', 'discipline'],
    tags: ['ವೇತನ ಬಡ್ತಿ ತಡೆ', 'Withholding increment', 'KCSR 53', 'ಶಿಸ್ತು ಕ್ರಮ']
  },
  {
    id: 'kcsr-rule-95',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 95',
    chapterOrPart: 'ಅಧ್ಯಾಯ V - ವಯೋನಿವೃತ್ತಿ',
    titleKannada: 'ವಯೋನಿವೃತ್ತಿ ನಿಯಮ (Superannuation Retirement - 60 Years)',
    titleEnglish: 'Compulsory Retirement on Attaining Age of Superannuation',
    category: 'pension',
    summaryKannada: 'ಪ್ರತಿಯೊಬ್ಬ ರಾಜ್ಯ ಸರ್ಕಾರಿ ನೌಕರನು 60 ವರ್ಷ ವಯಸ್ಸನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ತಿಂಗಳ ಕೊನೆಯ ದಿನದ ಅಪರಾಹ್ನ ಸೇವೆಯಿಂದ ನಿವೃತ್ತನಾಗತಕ್ಕದ್ದು (ತಿಂಗಳ ಮೊದಲ ದಿನ ಜನಿಸಿದವರು ಹಿಂದಿನ ತಿಂಗಳ ಕೊನೆಯ ದಿನ ನಿವೃತ್ತರಾಗುತ್ತಾರೆ).',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 95 ರನ್ವಯ ವಯೋನಿವೃತ್ತಿ ಹೊಂದುತ್ತಿರುವ ಕುರಿತು.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 95 ರ ಅನ್ವಯ, 60 ವರ್ಷ ಪೂರೈಸಿದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸದರಿ ನೌಕರರನ್ನು ನಿಗದಿತ ದಿನಾಂಕದ ಅಪರಾಹ್ನದಿಂದ ಸೇವೆಯಿಂದ ಗೌರವಪೂರ್ವಕವಾಗಿ ಬಿಡುಗಡೆಗೊಳಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 95 ರನ್ವಯ 60 ವರ್ಷ ವಯೋನಿವೃತ್ತಿ ಹೊಂದುತ್ತಿರುವ ಕುರಿತು ಕಚೇರಿ ಆದೇಶ.',
    popularForLetterType: ['memorandum', 'pension'],
    tags: ['ವಯೋನಿವೃತ್ತಿ', 'Superannuation', 'KCSR 95', '60 ವರ್ಷ', 'ನಿವೃತ್ತಿ']
  },
  {
    id: 'kcsr-rule-207',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 207 & 210',
    chapterOrPart: 'ಅಧ್ಯಾಯ XVI - ಪಿಂಚಣಿ ಅರ್ಹತಾ ಸೇವೆ',
    titleKannada: 'ಪಿಂಚಣಿ ಅರ್ಹತಾ ಸೇವಾ ಲೆಕ್ಕಾಚಾರ (Qualifying Service for Pension)',
    titleEnglish: 'Qualifying Service & Verification Rules for Pension',
    category: 'pension',
    summaryKannada: 'ಪಿಂಚಣಿ ಪಡೆಯಲು ಕನಿಷ್ಠ 10 ವರ್ಷಗಳ (20 ಅರ್ಧ ವರ್ಷಗಳು) ಅರ್ಹತಾ ಸೇವೆ ಮತ್ತು ಪೂರ್ಣ ಪಿಂಚಣಿ ಪಡೆಯಲು 30 ವರ್ಷಗಳ (60 ಅರ್ಧ ವರ್ಷಗಳು) ಅರ್ಹತಾ ಸೇವೆ ಇರಬೇಕು. ಅನರ್ಹತಾ ಅವಧಿಗಳಾದ ಅಸಾಧಾರಣ ರಜೆ (EOL without MC), ಅಮಾನತು, ಡೀಸ್-ನಾನ್ ಕಳೆಯತಕ್ಕದ್ದು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 207 ಮತ್ತು 210 ರ ಪ್ರಕಾರ ಪಿಂಚಣಿ ಅರ್ಹತಾ ಸೇವೆ ದೃಢೀಕರಣ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 207 ಮತ್ತು 210 ರನ್ವಯ ಸೇವಾ ಪುಸ್ತಕದ ದಾಖಲೆಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೋಧಿಸಿ ನಿವ್ವಳ ಅರ್ಹತಾ ಸೇವೆಯನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 207 ರನ್ವಯ ನಿವೃತ್ತಿ ವೇತನಕ್ಕಾಗಿ ನಿವ್ವಳ ಅರ್ಹತಾ ಸೇವೆ ದೃಢೀಕರಿಸುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['pension', 'memorandum'],
    tags: ['ಅರ್ಹತಾ ಸೇವೆ', 'Qualifying Service', 'KCSR 207', 'ಪಿಂಚಣಿ', 'ಸೇವಾ ಪರಿಶೀಲನೆ']
  },
  {
    id: 'kcsr-rule-287',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 287',
    chapterOrPart: 'ಅಧ್ಯಾಯ XVII - ಪಿಂಚಣಿ ಲೆಕ್ಕಾಚಾರ',
    titleKannada: 'ಮಾಸಿಕ ನಿವೃತ್ತಿ ವೇತನ ಲೆಕ್ಕಾಚಾರ (Monthly Pension Calculation - 50% Basic)',
    titleEnglish: 'Amount of Pension Calculation Formula',
    category: 'pension',
    summaryKannada: 'ನೌಕರನು ಕೊನೆಯದಾಗಿ ಪಡೆದ ಮೂಲ ವೇತನದ 50% ರಷ್ಟನ್ನು ಪೂರ್ಣ ಮಾಸಿಕ ಪಿಂಚಣಿಯಾಗಿ ನಿಗದಿಪಡಿಸುವ ನಿಯಮ. 30 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ಸೇವೆ ಇದ್ದರೆ ಅನುಪಾತದ ಮೇಲೆ (Pro-rata: Basic x 50% x QS / 60) ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 287 ರನ್ವಯ ಮಾಸಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 287 ರ ಮೇರೆಗೆ, ನಿವೃತ್ತ ನೌಕರರಿಗೆ ಮಾಸಿಕ ಮೂಲ ಪಿಂಚಣಿಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಮಂಜೂರು ಮಾಡಿ ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಗೆ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 287 ರನ್ವಯ ಮಾಸಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಕುರಿತು.',
    popularForLetterType: ['pension', 'memorandum'],
    tags: ['ಮಾಸಿಕ ಪಿಂಚಣಿ', 'Monthly Pension', 'KCSR 287', '50% ವೇತನ', 'PPO']
  },
  {
    id: 'kcsr-rule-292b',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 292(ಬಿ)',
    chapterOrPart: 'ಅಧ್ಯಾಯ XVII - ನಿವೃತ್ತಿ ಉಪದಾನ',
    titleKannada: 'ನಿವೃತ್ತಿ ಉಪದಾನ ಮಂಜೂರಾತಿ (Retirement Gratuity / DCRG - Max ₹20 Lakhs)',
    titleEnglish: 'Death-cum-Retirement Gratuity (DCRG) Calculation Rules',
    category: 'pension',
    summaryKannada: 'ಕನಿಷ್ಠ 5 ವರ್ಷಗಳ ಸೇವೆ ಪೂರೈಸಿದ ನೌಕರರಿಗೆ ಪ್ರತಿ ಪೂರ್ಣಗೊಂಡ 6 ತಿಂಗಳ ಸೇವೆಗೆ 1/4 ತಿಂಗಳ ಉಪಲಬ್ಧಗಳಂತೆ ಗರಿಷ್ಠ 16.5 ತಿಂಗಳು ಅಥವಾ ಗರಿಷ್ಠ ₹20,00,000/- (ರೂಪಾಯಿ ಇಪ್ಪತ್ತು ಲಕ್ಷ) ಮಿತಿಗೊಳಪಟ್ಟು ಉಪದಾನ ಮಂಜೂರು ಮಾಡುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 292(ಬಿ) ರನ್ವಯ ಮರಣ-ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG) ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 292(ಬಿ) ರ ಅನ್ವಯ ಲೆಕ್ಕಹಾಕಲಾದ ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG) ಮೊತ್ತವನ್ನು ನಿಯಮಾನುಸಾರ ಮಂಜೂರು ಮಾಡಲು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 292(ಬಿ) ರನ್ವಯ ನಿವೃತ್ತಿ ಉಪದಾನ (DCRG) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['pension', 'memorandum'],
    tags: ['DCRG', 'ಉಪದಾನ', 'Gratuity', 'KCSR 292B', '20 ಲಕ್ಷ']
  },
  {
    id: 'kcsr-rule-376',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 376 (ಅನುಬಂಧ-1)',
    chapterOrPart: 'ಅಧ್ಯಾಯ XIX - ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ',
    titleKannada: 'ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ ಮಂಜೂರಾತಿ (Commutation of Pension - CVP)',
    titleEnglish: 'Commutation of Pension Rules (Up to 40% or 1/3rd Lump sum)',
    category: 'pension',
    summaryKannada: 'ನಿವೃತ್ತ ನೌಕರನು ತನ್ನ ಮೂಲ ಪಿಂಚಣಿಯಲ್ಲಿ ಗರಿಷ್ಠ 1/3 ಭಾಗ ಅಥವಾ 40% ರಷ್ಟನ್ನು ನಗದಾಗಿ ಏಕಗಂಟಿನಲ್ಲಿ ಪರಿವರ್ತಿಸಿ ಪಡೆಯುವ ನಿಯಮ. ಸೂತ್ರ: ಪರಿವರ್ತಿತ ಭಾಗ x 12 x ಪರಿವರ್ತನಾ ಗುಣಕ. 15 ವರ್ಷಗಳ ನಂತರ ಪೂರ್ಣ ಪಿಂಚಣಿ ಪುನಃಸ್ಥಾಪನೆಯಾಗುತ್ತದೆ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958 ರ ನಿಯಮ 376 ಮತ್ತು ಅನುಬಂಧ-1 ರನ್ವಯ ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 376 ರನ್ವಯ, ನಿವೃತ್ತ ನೌಕರರ ಕೋರಿಕೆಯಂತೆ ಅವರ ಮಾಸಿಕ ಪಿಂಚಣಿಯ ಪರಿವರ್ತಿತ ಮೊತ್ತವನ್ನು ಏಕಗಂಟಿನಲ್ಲಿ ಪಾವತಿಸಲು ಅನುಮೋದಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 376 ರನ್ವಯ ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ (CVP) ಮಂಜೂರಾತಿ ಬಗ್ಗೆ.',
    popularForLetterType: ['pension', 'memorandum'],
    tags: ['ಪಿಂಚಣಿ ಪರಿವರ್ತನೆ', 'Commutation', 'CVP', 'KCSR 376', 'ಏಕಗಂಟು ಮೊತ್ತ']
  },
  {
    id: 'kcsr-rule-341',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 341',
    chapterOrPart: 'ಅಧ್ಯಾಯ XVIII - ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ',
    titleKannada: 'ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನ (Provisional / Anticipatory Pension)',
    titleEnglish: 'Anticipatory / Provisional Pension Sanction',
    category: 'pension',
    summaryKannada: 'ಮಹಾಲೆಕ್ಕಪಾಲರ ಕಚೇರಿಯಿಂದ ಅಧಿಕೃತ PPO ಬಿಡುಗಡೆ ಆಗುವುದು ವಿಳಂಬವಾದಾಗ ಅಥವಾ ಇಲಾಖಾ ವಿಚಾರಣೆ ಬಾಕಿ ಇರುವಾಗ, ಕಚೇರಿ ಮುಖ್ಯಸ್ಥರೇ ಗರಿಷ್ಠ 100% ತಾತ್ಕಾಲಿಕ ಪಿಂಚಣಿ ಮತ್ತು ಗರಿಷ್ಠ 80% ತಾತ್ಕಾಲಿಕ ಉಪದಾನವನ್ನು ಮಂಜೂರು ಮಾಡುವ ತುರ್ತು ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR) 1958 ರ ನಿಯಮ 341 ರನ್ವಯ ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 341 ರನ್ವಯ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರ ಚಲಾಯಿಸಿ, ಅಂತಿಮ PPO ಆದೇಶ ಬರುವವರೆಗೆ ನೌಕರರಿಗೆ ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಪಾವತಿಸಲು ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 341 ರನ್ವಯ ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ (Provisional Pension) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['pension', 'memorandum'],
    tags: ['ತಾತ್ಕಾಲಿಕ ಪಿಂಚಣಿ', 'Provisional Pension', 'KCSR 341', 'ವಿಳಂಬ ತಡೆ']
  },
  {
    id: 'kcsr-rule-76',
    book: 'KCSR',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು, 1958',
    bookNameEnglish: 'Karnataka Civil Services Rules, 1958',
    ruleNumber: 'ನಿಯಮ 76 - 89',
    chapterOrPart: 'ಅಧ್ಯಾಯ VI - ಸೇರಲು ಕಾಲಾವಕಾಶ (Joining Time)',
    titleKannada: 'ವರ್ಗಾವಣೆ ಸೇರ್ಪಡೆ ಕಾಲಾವಕಾಶ (Joining Time Rules on Transfer)',
    titleEnglish: 'Joining Time & Travel Allowance Rules',
    category: 'office_procedure',
    summaryKannada: 'ಸಾರ್ವಜನಿಕ ಹಿತದೃಷ್ಟಿಯಿಂದ ಒಂದು ಕೇಂದ್ರದಿಂದ ಮತ್ತೊಂದು ಕೇಂದ್ರಕ್ಕೆ ವರ್ಗಾವಣೆಯಾದ ನೌಕರರಿಗೆ ಪ್ರಯಾಣ ಹಾಗೂ ಸ್ಥಳಾಂತರಕ್ಕಾಗಿ 8 ರಿಂದ 10 ದಿನಗಳವರೆಗೆ ಸೇರ್ಪಡೆ ಕಾಲಾವಕಾಶ (Joining Time) ಮತ್ತು ವರ್ಗಾವಣೆ ಪ್ರಯಾಣ ಭತ್ಯೆ (Transfer TA) ಒದಗಿಸುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು 1958 ರ ನಿಯಮ 76 ರಿಂದ 89 ರನ್ವಯ ವರ್ಗಾವಣೆ ಸೇರ್ಪಡೆ ಕಾಲಾವಕಾಶ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 76 ರನ್ವಯ, ನೂತನ ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿ ವರದಿ ಮಾಡಿಕೊಳ್ಳಲು ಅನುಮತಿಸಿ ಅರ್ಹ ಸೇರ್ಪಡೆ ಕಾಲಾವಕಾಶವನ್ನು ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 76 ರನ್ವಯ ವರ್ಗಾವಣೆ ಸೇರ್ಪಡೆ ಕಾಲಾವಕಾಶ (Joining Time) ಮಂಜೂರು ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ವರ್ಗಾವಣೆ', 'Joining Time', 'KCSR 76', 'ಸ್ಥಳ ನಿಯುಕ್ತಿ', 'ಪ್ರಯಾಣ ಭತ್ಯೆ']
  },

  // ==========================================
  // KFC RULES (ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958)
  // ==========================================
  {
    id: 'kfc-article-99',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 99',
    chapterOrPart: 'ಅಧ್ಯಾಯ VII - ವೆಚ್ಚ ಮಂಜೂರಾತಿ ಅಧಿಕಾರ',
    titleKannada: 'ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ ಸಾಮಾನ್ಯ ಷರತ್ತುಗಳು (General Principles of Financial Sanction)',
    titleEnglish: 'General Principles Governing Financial Sanction',
    category: 'finance_grant',
    summaryKannada: 'ಸರ್ಕಾರಿ ಹಣವನ್ನು ವ್ಯಯಿಸುವಾಗ ಪ್ರತಿಯೊಬ್ಬ ಅಧಿಕಾರಿಯು ತನ್ನ ಸ್ವಂತ ಹಣವನ್ನು ಖರ್ಚು ಮಾಡುವಾಗ ವಹಿಸುವಷ್ಟೇ ಜಾಗರೂಕತೆ ಮತ್ತು ಮಿತವ್ಯಯವನ್ನು ಪಾಲಿಸಬೇಕು. ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಅಧಿಕೃತ ಮಂಜೂರಾತಿಯಿಲ್ಲದೆ ಯಾವುದೇ ವೆಚ್ಚ ಭರಿಸುವಂತಿಲ್ಲ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ (KFC) 1958 ರ ಅನುಚ್ಛೇದ 99 ರ ಪ್ರಕಾರ ಆರ್ಥಿಕ ಮಂಜೂರಾತಿಯ ಸಾಮಾನ್ಯ ನಿಯಮಗಳು.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ 1958 ರ ಅನುಚ್ಛೇದ 99 ರಲ್ಲಿ ನಿಗದಿಪಡಿಸಲಾದ ಹಣಕಾಸಿನ ಮಿತವ್ಯಯ ತತ್ವಗಳು ಮತ್ತು ಸಕ್ಷಮ ಮಂಜೂರಾತಿಯನ್ನು ಪರಿಗಣಿಸಿ ಈ ಕೆಳಗಿನ ವೆಚ್ಚಕ್ಕೆ ಅನುಮೋದನೆ ನೀಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 99 ರನ್ವಯ ಕಚೇರಿ ವೆಚ್ಚಗಳಿಗೆ ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ ನೀಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'financial', 'memorandum'],
    tags: ['ಆರ್ಥಿಕ ಮಂಜೂರಾತಿ', 'KFC 99', 'ಮಿತವ್ಯಯ', 'Finance', 'ವೆಚ್ಚ ಅನುಮೋದನೆ']
  },
  {
    id: 'kfc-article-101',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 101 & 103',
    chapterOrPart: 'ಅಧ್ಯಾಯ VIII - ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚಗಳು',
    titleKannada: 'ಕಚೇರಿ ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚಗಳು (Contingent Expenditure & Powers of DDO)',
    titleEnglish: 'Sanction of Contingent Expenditure & DDO Powers',
    category: 'finance_grant',
    summaryKannada: 'ಕಚೇರಿಯ ದಿನನಿತ್ಯದ ಚಾಲನೆಗೆ ಅಗತ್ಯವಾದ ಲೇಖನ ಸಾಮಗ್ರಿ, ವಿದ್ಯುತ್, ದೂರವಾಣಿ, ದುರಸ್ತಿ ಮತ್ತು ಅಂಚೆ ವೆಚ್ಚಗಳನ್ನು (Contingencies) ಆಯವ್ಯಯ ಹಂಚಿಕೆಗೆ ಅನುಗುಣವಾಗಿ ಮಂಜೂರು ಮಾಡಲು ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿಗೆ (DDO) ಇರುವ ಅಧಿಕಾರ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ (KFC) 1958 ರ ಅನುಚ್ಛೇದ 101 ಮತ್ತು 103 ರನ್ವಯ ಕಚೇರಿ ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚ ಮಂಜೂರಾತಿ.',
    orderClauseSnippet: 'ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 101 ರನ್ವಯ ಲಭ್ಯವಿರುವ ಅನುದಾನ ಶೀರ್ಷಿಕೆಯಡಿ ಕಚೇರಿ ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚಗಳಿಗೆ ಅನುಮೋದನೆ ನೀಡಿ ಬಿಲ್ ಪಾವತಿಗೆ ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 101 ರ ಅನ್ವಯ ಕಚೇರಿ ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚಗಳ (Contingencies) ಬಿಲ್ ಮಂಜೂರಾತಿ ಕುರಿತು.',
    popularForLetterType: ['general', 'financial'],
    tags: ['ಪ್ರಾಸಂಗಿಕ ವೆಚ್ಚ', 'Contingency', 'KFC 101', 'DDO', 'ಬಿಲ್ ಪಾವತಿ']
  },
  {
    id: 'kfc-article-138',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 138 & 142',
    chapterOrPart: 'ಅಧ್ಯಾಯ IX - ಅನುದಾನ ಮಂಜೂರಾತಿ (Grant-in-Aid)',
    titleKannada: 'ವೇತನಾನುದಾನ ಮತ್ತು ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರ (Grant-in-Aid & Utilization Certificates)',
    titleEnglish: 'Grant-in-Aid Conditions & Submission of UC',
    category: 'finance_grant',
    summaryKannada: 'ಖಾಸಗಿ ಅನುದಾನಿತ ಶಾಲೆಗಳು/ಸಂಸ್ಥೆಗಳಿಗೆ ಸರ್ಕಾರದಿಂದ ವೇತನಾನುದಾನ ಅಥವಾ ನಿರ್ವಹಣಾ ಅನುದಾನ ಬಿಡುಗಡೆ ಮಾಡುವಾಗ ವಿಧಿಸಬೇಕಾದ ಷರತ್ತುಗಳು ಹಾಗೂ ನಿಗದಿತ ನಮೂನೆಯಲ್ಲಿ ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರವನ್ನು (UC) ಕಡ್ಡಾಯವಾಗಿ ಪಡೆಯುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ 1958 ರ ಅನುಚ್ಛೇದ 138 ಹಾಗೂ 142 ರನ್ವಯ ಅನುದಾನ ಮಂಜೂರಾತಿ ಮತ್ತು ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರ.',
    orderClauseSnippet: 'ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 138 ರ ಷರತ್ತುಗಳನ್ವಯ, ಮಂಜೂರಾದ ಅನುದಾನಕ್ಕೆ ಲೆಕ್ಕಪರಿಶೋಧಿತ ವರದಿ ಹಾಗೂ ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರವನ್ನು (UC) ಕಡ್ಡಾಯವಾಗಿ ಸಲ್ಲಿಸುವ ಷರತ್ತಿಗೆ ಒಳಪಟ್ಟು ಅನುದಾನ ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 138 ರನ್ವಯ ಶಾಲಾ ವೇತನಾನುದಾನ ಬಿಡುಗಡೆ ಮತ್ತು ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರ (UC) ಕೋರುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'circular', 'financial'],
    tags: ['ವೇತನಾನುದಾನ', 'Grant-in-Aid', 'KFC 138', 'ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರ', 'UC', 'ಶಾಲೆಗಳು']
  },
  {
    id: 'kfc-article-209',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 209',
    chapterOrPart: 'ಅಧ್ಯಾಯ XIII - ಆಯವ್ಯಯ ಹಂಚಿಕೆ',
    titleKannada: 'ಆಯವ್ಯಯ ಹಂಚಿಕೆ ಮತ್ತು ಮರುಹಂಚಿಕೆ (Budget Control & Appropriations)',
    titleEnglish: 'Budget Allotment & Re-appropriation Rules',
    category: 'finance_grant',
    summaryKannada: 'ಯಾವುದೇ ಉಪ-ಶೀರ್ಷಿಕೆಯಡಿ ಮಂಜೂರಾದ ಅನುದಾನಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ವೆಚ್ಚವನ್ನು ಭರಿಸುವುದನ್ನು ನಿಷೇಧಿಸುವ ಮತ್ತು ಹೆಚ್ಚುವರಿ ಅನುದಾನಕ್ಕಾಗಿ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಮರುಹಂಚಿಕೆ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ (KFC) 1958 ರ ಅನುಚ್ಛೇದ 209 ರನ್ವಯ ಆಯವ್ಯಯ ಹಂಚಿಕೆ ನಿಯಂತ್ರಣ ನಿಯಮಗಳು.',
    orderClauseSnippet: 'ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 209 ರನ್ವಯ ಆಯವ್ಯಯ ಮಿತಿಯೊಳಗಿನ ಅನುದಾನವನ್ನು ಖಾತರಿಪಡಿಸಿಕೊಂಡು ಕ್ರಮ ಕೈಗೊಳ್ಳಲು ಸೂಚಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 209 ರನ್ವಯ ಬಜೆಟ್ ಅನುದಾನ ಹಂಚಿಕೆ ಮಿತಿಯೊಳಗೆ ವೆಚ್ಚ ಭರಿಸುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['circular', 'financial'],
    tags: ['ಬಜೆಟ್', 'Budget', 'KFC 209', 'ಅನುದಾನ ಹಂಚಿಕೆ', 'ಮರುಹಂಚಿಕೆ']
  },
  {
    id: 'kfc-article-214',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 214',
    chapterOrPart: 'ಅಧ್ಯಾಯ XIV - ತಾತ್ಕಾಲಿಕ ಮುಂಗಡಗಳು',
    titleKannada: 'ತಾತ್ಕಾಲಿಕ ಮುಂಗಡ ಪಾವತಿ ಮತ್ತು ಹೊಂದಾಣಿಕೆ (Temporary Advances & Settlement)',
    titleEnglish: 'Sanction and Adjustment of Temporary Advances',
    category: 'finance_grant',
    summaryKannada: 'ತುರ್ತು ಕಾಮಗಾರಿ, ಪರೀಕ್ಷಾ ಕಾರ್ಯ ಅಥವಾ ಕ್ರೀಡಾಕೂಟಕ್ಕಾಗಿ ಪಡೆದ ತಾತ್ಕಾಲಿಕ ಮುಂಗಡವನ್ನು 30 ದಿನಗಳ ಒಳಗಾಗಿ ಅಂತಿಮ ವಿವರವಾದ ಬಿಲ್ಲುಗಳು ಮತ್ತು ರಶೀದಿಗಳೊಂದಿಗೆ ಕಡ್ಡಾಯವಾಗಿ ಹೊಂದಾಣಿಕೆ (Adjustment Bill) ಮಾಡಬೇಕೆಂಬ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ 1958 ರ ಅನುಚ್ಛೇದ 214 ರನ್ವಯ ತಾತ್ಕಾಲಿಕ ಮುಂಗಡ ಹೊಂದಾಣಿಕೆ ನಿಯಮ.',
    orderClauseSnippet: 'ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 214 ರ ನಿಯಮಾವಳಿಯಂತೆ ಪಡೆದ ಮುಂಗಡ ಮೊತ್ತವನ್ನು ನಿಗದಿತ ಕಾಲಮಿತಿಯೊಳಗೆ ಖಜಾನೆಗೆ ಹೊಂದಾಣಿಕೆ ಬಿಲ್ಲು ಸಲ್ಲಿಸಿ ಸಮರ್ಥಿಸಿಕೊಳ್ಳತಕ್ಕದ್ದು.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 214 ರ ಪ್ರಕಾರ ತಾತ್ಕಾಲಿಕ ಮುಂಗಡ ಮೊತ್ತವನ್ನು 30 ದಿನಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಮಾಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'financial'],
    tags: ['ಮುಂಗಡ', 'Advance', 'KFC 214', 'ಹೊಂದಾಣಿಕೆ', 'ಪರೀಕ್ಷಾ ವೆಚ್ಚ']
  },
  {
    id: 'kfc-article-278',
    book: 'KFC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ, 1958',
    bookNameEnglish: 'Karnataka Financial Code, 1958',
    ruleNumber: 'ಅನುಚ್ಛೇದ 278',
    chapterOrPart: 'ಅಧ್ಯಾಯ XVII - ಲೆಕ್ಕ ಪರಿಶೋಧನಾ ಆಕ್ಷೇಪಣೆಗಳು',
    titleKannada: 'ಲೆಕ್ಕ ಪರಿಶೋಧನಾ ಆಕ್ಷೇಪಣೆಗಳ ಪರಿಹಾರ (Audit Objections Compliance)',
    titleEnglish: 'Prompt Disposal of Audit Objections & Recoveries',
    category: 'finance_grant',
    summaryKannada: 'ಮಹಾಲೆಕ್ಕಪಾಲರು (AG) ಅಥವಾ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಲೆಕ್ಕಪರಿಶೋಧಕರು ಎತ್ತಿದ ಆಕ್ಷೇಪಣೆಗಳಿಗೆ ಕಚೇರಿ ಮುಖ್ಯಸ್ಥರು 30 ದಿನಗಳ ಒಳಗೆ ಸಮಂಜಸ ಉತ್ತರ ನೀಡಿ ಆಕ್ಷೇಪಣೆಯನ್ನು ಕೈಬಿಡಿಸಬೇಕೆಂಬ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಹಣಕಾಸು ಸಂಹಿತೆ 1958 ರ ಅನುಚ್ಛೇದ 278 ರನ್ವಯ ಆಡಿಟ್ ಆಕ್ಷೇಪಣೆಗಳ ತುರ್ತು ಪರಿಹಾರ.',
    orderClauseSnippet: 'ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 278 ರ ಆದೇಶದಂತೆ, ಬಾಕಿ ಇರುವ ಆಡಿಟ್ ಕಂಡಿಕೆಗಳಿಗೆ ಸೂಕ್ತ ಸಮರ್ಥನಾ ದಾಖಲೆಗಳೊಂದಿಗೆ ತಕ್ಷಣ ಉತ್ತರ ರವಾನಿಸಲು ಸೂಚಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಎಫ್.ಸಿ ಅನುಚ್ಛೇದ 278 ರನ್ವಯ ಮಹಾಲೆಕ್ಕಪಾಲರ ಆಡಿಟ್ ಆಕ್ಷೇಪಣೆಗಳ ತುರ್ತು ಪರಿಹಾರಕ್ಕೆ ಮಾಹಿತಿ ಕೋರಿಕೆ.',
    popularForLetterType: ['general', 'circular'],
    tags: ['ಆಡಿಟ್', 'Audit', 'KFC 278', 'ಆಕ್ಷೇಪಣೆ ಪರಿಹಾರ', 'AG Audit']
  },

  // ==============================================================
  // KCS (CCA) RULES - ಶಿಸ್ತು, ಅಮಾನತು ಮತ್ತು ಅಪೀಲು ನಿಯಮಗಳು 1957
  // ==============================================================
  {
    id: 'cca-rule-8',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 8',
    chapterOrPart: 'ಭಾಗ III - ದಂಡನೆಗಳು (Penalties)',
    titleKannada: 'ದಂಡನೆಗಳ ವಿವರ (Minor and Major Penalties)',
    titleEnglish: 'Classification of Minor Penalties and Major Penalties',
    category: 'discipline',
    summaryKannada: 'ಸರ್ಕಾರಿ ನೌಕರರ ದುರ್ನಡತೆಗಾಗಿ ವಿಧಿಸಬಹುದಾದ ಸಣ್ಣ ದಂಡನೆಗಳು (ಖಂಡನೆ, ವೇತನ ಬಡ್ತಿ ತಡೆ, ವಸೂಲಾತಿ) ಮತ್ತು ದೊಡ್ಡ ದಂಡನೆಗಳು (ಕೆಳ ಶ್ರೇಣಿಗೆ ಇಳಿಸುವುದು, ಕಡ್ಡಾಯ ನಿವೃತ್ತಿ, ಸೇವೆಯಿಂದ ತೆಗೆದುಹಾಕುವುದು ಮತ್ತು ವಜಾಗೊಳಿಸುವುದು) ಕುರಿತ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಅಪೀಲು) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 8 ರನ್ವಯ ದಂಡನೆ ವಿಧಿಸುವ ಕುರಿತು.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಾವಳಿ 1957 ರ ನಿಯಮ 8 ರನ್ವಯ ಸಕ್ಷಮ ಶಿಸ್ತು ಪ್ರಾಧಿಕಾರವು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ದಂಡನೆಯನ್ನು ವಿಧಿಸಿ ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 8 ರ ಪ್ರಕಾರ ದಂಡನೆ ವಿಧಿಸುವ ಕುರಿತಂತೆ ಆದೇಶ.',
    popularForLetterType: ['discipline', 'memorandum'],
    tags: ['ದಂಡನೆ', 'Penalties', 'CCA 8', 'ಶಿಸ್ತು ಕ್ರಮ', 'ದೋಷಾರೋಪಣೆ']
  },
  {
    id: 'cca-rule-10',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 10',
    chapterOrPart: 'ಭಾಗ III - ಅಮಾನತು (Suspension)',
    titleKannada: 'ಸೇವೆಯಿಂದ ಅಮಾನತು ಆದೇಶ (Suspension Order & Subsistence Allowance)',
    titleEnglish: 'Order of Suspension & Subsistence Allowance',
    category: 'discipline',
    summaryKannada: 'ನೌಕರನ ವಿರುದ್ಧ ಗಂಭೀರ ದುರ್ನಡತೆ ಅಥವಾ ಕ್ರಿಮಿನಲ್ ಪ್ರಕರಣದ ತನಿಖೆ ಬಾಕಿ ಇರುವಾಗ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಸೇವೆಯಿಂದ ಅಮಾನತುಗೊಳಿಸುವ ಮತ್ತು ಅಮಾನತು ಅವಧಿಯಲ್ಲಿ ನಿಯಮಾನುಸಾರ ಜೀವನಾಧಾರ ಭತ್ಯೆ (Subsistence Allowance - 50% / 75%) ಮಂಜೂರು ಮಾಡುವ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಅಪೀಲು) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 10(1) ರನ್ವಯ ಅಮಾನತು ಆದೇಶ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 10(1) ರ ಅಡಿಯಲ್ಲಿ ಪ್ರದತ್ತವಾದ ಅಧಿಕಾರವನ್ನು ಚಲಾಯಿಸಿ, ಸದರಿ ನೌಕರರನ್ನು ಇಲಾಖಾ ವಿಚಾರಣೆಯನ್ನು ಕಾಯ್ದಿರಿಸಿ ತಕ್ಷಣದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಸೇವೆಯಿಂದ ಅಮಾನತ್ತಿನಲ್ಲಿಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 10(1) ರ ಪ್ರಕಾರ ಸೇವೆಯಿಂದ ಅಮಾನತ್ತಿನಲ್ಲಿಡುವ ಕುರಿತು ಕಛೇರಿ ಆದೇಶ.',
    popularForLetterType: ['discipline', 'memorandum', 'general'],
    tags: ['ಅಮಾನತು', 'Suspension', 'CCA 10', 'ಜೀವನಾಧಾರ ಭತ್ಯೆ', 'ಶಿಸ್ತು']
  },
  {
    id: 'cca-rule-10a',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 10(ಎ)',
    chapterOrPart: 'ಭಾಗ III - ಅಮಾನತು ಪರಾಮರ್ಶೆ',
    titleKannada: 'ಅಮಾನತು ಅವಧಿಯ ತ್ರೈಮಾಸಿಕ ಪರಾಮರ್ಶೆ (Review of Suspension Orders)',
    titleEnglish: 'Periodic Review of Suspension Orders (Within 90 Days)',
    category: 'discipline',
    summaryKannada: 'ಅಮಾನತಿನಲ್ಲಿರುವ ನೌಕರನ ಅಮಾನತು ಆದೇಶವನ್ನು 90 ದಿನಗಳು ಮುಗಿಯುವ ಮುನ್ನ ಶಿಸ್ತು ಸಮಿತಿಯು ಪರಾಮರ್ಶಿಸಿ, ಅಮಾನತು ವಿಸ್ತರಿಸಬೇಕೆ ಅಥವಾ ಮರುನೇಮಕ ಮಾಡಿಕೊಳ್ಳಬೇಕೆ ಎಂದು ತೀರ್ಮಾನಿಸುವ ಕಡ್ಡಾಯ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 10(ಎ) ರನ್ವಯ ಅಮಾನತು ಆದೇಶದ ಪರಾಮರ್ಶೆ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 10(ಎ) ರನ್ವಯ ರಚಿತವಾದ ಪರಾಮರ್ಶನಾ ಸಮಿತಿಯ ಶಿಫಾರಸಿನಂತೆ ಅಮಾನತು ಆದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 10(ಎ) ರನ್ವಯ ಅಮಾನತು ಆದೇಶವನ್ನು ಪರಾಮರ್ಶಿಸುವ ಕುರಿತು.',
    popularForLetterType: ['discipline', 'memorandum'],
    tags: ['ಅಮಾನತು ಪರಾಮರ್ಶೆ', 'CCA 10A', '90 ದಿನಗಳ ಪರಿಶೀಲನೆ']
  },
  {
    id: 'cca-rule-11',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 11',
    chapterOrPart: 'ಭಾಗ IV - ಸಣ್ಣ ದಂಡನೆ ವಿಧಾನ',
    titleKannada: 'ಸಣ್ಣ ದಂಡನೆಗಳನ್ನು ವಿಧಿಸುವ ವಿಧಾನ - ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್ (Procedure for Minor Penalties)',
    titleEnglish: 'Procedure for Imposing Minor Penalties & Show Cause Notice',
    category: 'discipline',
    summaryKannada: 'ಸಣ್ಣ ದಂಡನೆ ವಿಧಿಸುವ ಮುನ್ನ ನೌಕರನಿಗೆ ಲಿಖಿತವಾಗಿ ದೋಷಾರೋಪಣೆಯನ್ನು ತಿಳಿಸಿ, ಲಿಖಿತ ಸಮಜಾಯಿಷಿ ನೀಡಲು ಕನಿಷ್ಠ 15 ದಿನಗಳ ಕಾಲಾವಕಾಶ ನೀಡಿ, ಆತನ ಉತ್ತರವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಂತಿಮ ಆದೇಶ ಹೊರಡಿಸುವ ವಿಧಾನ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಅಪೀಲು) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 11 ರ ಪ್ರಕಾರ ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 11 ರನ್ವಯ ನೌಕರನಿಗೆ ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್ ಜಾರಿಗೊಳಿಸಿ, ಅವರು ಸಲ್ಲಿಸಿದ ಲಿಖಿತ ಉತ್ತರವನ್ನು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ಈ ಕೆಳಗಿನಂತೆ ತೀರ್ಮಾನಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 11 ರನ್ವಯ ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್ (Show Cause Notice) ಜಾರಿಗೊಳಿಸುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'discipline'],
    tags: ['ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್', 'Show Cause Notice', 'CCA 11', 'ಸಣ್ಣ ದಂಡನೆ', 'ವಿವರಣೆ']
  },
  {
    id: 'cca-rule-12',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 12',
    chapterOrPart: 'ಭಾಗ IV - ದೊಡ್ಡ ದಂಡನೆ ಮತ್ತು ಇಲಾಖಾ ವಿಚಾರಣೆ',
    titleKannada: 'ದೊಡ್ಡ ದಂಡನೆಗಳಿಗೆ ಇಲಾಖಾ ವಿಚಾರಣೆ - ದೋಷಾರೋಪಣಾ ಪಟ್ಟಿ (Procedure for Major Penalties)',
    titleEnglish: 'Charge Sheet & Departmental Inquiry for Major Penalties',
    category: 'discipline',
    summaryKannada: 'ದೊಡ್ಡ ದಂಡನೆ ವಿಧಿಸುವ ಮುನ್ನ ನಿರ್ದಿಷ್ಟ ಆರೋಪ ಪಟ್ಟಿ (Article of Charges), ಸಾಕ್ಷ್ಯಾಧಾರಗಳ ಪಟ್ಟಿ ಹಾಗೂ ದಾಖಲೆಗಳ ಪಟ್ಟಿಯನ್ನು ಜಾರಿಗೊಳಿಸಿ, ಸ್ವತಂತ್ರ ವಿಚಾರಣಾಧಿಕಾರಿ (Inquiry Officer) ಮತ್ತು ಮಂಡನಾಧಿಕಾರಿಯನ್ನು (Presenting Officer) ನೇಮಿಸಿ ನಿಯಮಾನುಸಾರ ವಿಚಾರಣೆ ನಡೆಸುವ ವಿಧಾನ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 12 ರನ್ವಯ ದೋಷಾರೋಪಣಾ ಪಟ್ಟಿ ಹಾಗೂ ಇಲಾಖಾ ವಿಚಾರಣೆ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 12 ರ ಅಡಿಯಲ್ಲಿ ಆರೋಪಿತ ನೌಕರನಿಗೆ ದೋಷಾರೋಪಣಾ ಪಟ್ಟಿಯನ್ನು ಜಾರಿಗೊಳಿಸಿ, ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ವಿಚಾರಣಾಧಿಕಾರಿಗಳನ್ನು ನೇಮಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 12 ರ ಅನ್ವಯ ದೋಷಾರೋಪಣಾ ಪಟ್ಟಿ ಜಾರಿ ಹಾಗೂ ಇಲಾಖಾ ವಿಚಾರಣೆ ನಡೆಸುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['discipline', 'memorandum'],
    tags: ['ದೋಷಾರೋಪಣಾ ಪಟ್ಟಿ', 'Charge Sheet', 'CCA 12', 'ಇಲಾಖಾ ವಿಚಾರಣೆ', 'ದೊಡ್ಡ ದಂಡನೆ']
  },
  {
    id: 'cca-rule-18',
    book: 'CCA',
    bookNameKannada: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ & ಅಪೀಲು) ನಿಯಮಗಳು, 1957',
    bookNameEnglish: 'KCS (Classification, Control and Appeal) Rules, 1957',
    ruleNumber: 'ನಿಯಮ 18 & 19',
    chapterOrPart: 'ಭಾಗ V - ಮೇಲ್ಮನವಿಗಳು (Appeals)',
    titleKannada: 'ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಕೆ ಮತ್ತು ಕಾಲಮಿತಿ (Appeals against Disciplinary Orders)',
    titleEnglish: 'Filing of Appeals against Orders of Disciplinary Authority',
    category: 'discipline',
    summaryKannada: 'ಶಿಸ್ತು ಪ್ರಾಧಿಕಾರ ವಿಧಿಸಿದ ದಂಡನೆ ಅಥವಾ ಅಮಾನತು ಆದೇಶದ ವಿರುದ್ಧ ಬಾಧಿತ ನೌಕರನು 45 ದಿನಗಳ ಒಳಗಾಗಿ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರಕ್ಕೆ (Appellate Authority) ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸುವ ಸಾಂವಿಧಾನಿಕ ಹಕ್ಕು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ಸಿ.ಸಿ.ಎ) ನಿಯಮಗಳು 1957 ರ ನಿಯಮ 18 ಮತ್ತು 19 ರನ್ವಯ ಮೇಲ್ಮನವಿ ಪ್ರಕ್ರಿಯೆ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 18 ರ ಅಡಿಯಲ್ಲಿ ಸಲ್ಲಿಸಲಾದ ಮೇಲ್ಮನವಿಯನ್ನು ಸಕ್ಷಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರವು ಪರಿಶೀಲಿಸಿ ಆದೇಶ ಹೊರಡಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ಸಿ.ಸಿ.ಎ) ನಿಯಮ 18 ರನ್ವಯ ಶಿಸ್ತು ಆದೇಶದ ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ ಅರ್ಜಿ ರವಾನೆ ಕುರಿತು.',
    popularForLetterType: ['general', 'discipline'],
    tags: ['ಮೇಲ್ಮನವಿ', 'Appeal', 'CCA 18', 'ಶಿಸ್ತು ಆದೇಶ', '45 ದಿನಗಳು']
  },

  // ==============================================================
  // CONDUCT RULES - ನಾಗರಿಕ ಸೇವಾ ನಡತೆ ನಿಯಮಾವಳಿಗಳು, 1966
  // ==============================================================
  {
    id: 'conduct-rule-3',
    book: 'CONDUCT',
    bookNameKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಗಳು, 1966',
    bookNameEnglish: 'KCS (Conduct) Rules, 1966',
    ruleNumber: 'ನಿಯಮ 3',
    chapterOrPart: 'ಸಾಮಾನ್ಯ ನಿಯಮಗಳು',
    titleKannada: 'ಸಾಮಾನ್ಯ ಕರ್ತವ್ಯನಿಷ್ಠೆ ಮತ್ತು ನಡವಳಿಕೆ (General Devotion to Duty & Integrity)',
    titleEnglish: 'Absolute Integrity and Devotion to Duty',
    category: 'conduct',
    summaryKannada: 'ಪ್ರತಿಯೊಬ್ಬ ಸರ್ಕಾರಿ ನೌಕರನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸಂಪೂರ್ಣ ಪ್ರಾಮಾಣಿಕತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳತಕ್ಕದ್ದು, ಕರ್ತವ್ಯನಿಷ್ಠೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸತಕ್ಕದ್ದು ಮತ್ತು ಸರ್ಕಾರಿ ನೌಕರನಿಗೆ ಶೋಭೆಯಲ್ಲದ ಯಾವುದೇ ಕೃತ್ಯವನ್ನು ಎಸಗಬಾರದು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಾವಳಿಗಳು 1966 ರ ನಿಯಮ 3 ರ ಉಲ್ಲಂಘನೆ ಕುರಿತು.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮಗಳು 1966 ರ ನಿಯಮ 3 ರಲ್ಲಿ ವಿಧಿಸಲಾದ ಸಾಮಾನ್ಯ ಕರ್ತವ್ಯನಿಷ್ಠೆಯನ್ನು ಉಲ್ಲಂಘಿಸಿರುವುದು ಮೇಲ್ನೋಟಕ್ಕೆ ಕಂಡುಬಂದಿರುವುದರಿಂದ ಎಚ್ಚರಿಕೆ/ಕ್ರಮ ಜರುಗಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮಾವಳಿ 1966 ರ ನಿಯಮ 3 ರ ಉಲ್ಲಂಘನೆಯ ಬಗ್ಗೆ ವಿವರಣೆ ಕೋರಿಕೆ.',
    popularForLetterType: ['general', 'discipline'],
    tags: ['ನಡತೆ ನಿಯಮ', 'Conduct', 'Integrity', 'KCS Conduct 3', 'ಕರ್ತವ್ಯಲೋಪ']
  },
  {
    id: 'conduct-rule-13',
    book: 'CONDUCT',
    bookNameKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಗಳು, 1966',
    bookNameEnglish: 'KCS (Conduct) Rules, 1966',
    ruleNumber: 'ನಿಯಮ 13',
    chapterOrPart: 'ಖಾಸಗಿ ವ್ಯಾಪಾರ ಅಥವಾ ನೌಕರಿ ನಿಷೇಧ',
    titleKannada: 'ಖಾಸಗಿ ವೃತ್ತಿ/ವ್ಯಾಪಾರ ನಿಷೇಧ ಮತ್ತು ಟ್ಯೂಷನ್ ನಿಷೇಧ (Private Trade or Employment)',
    titleEnglish: 'Prohibition of Private Trade, Employment & Private Tuition',
    category: 'conduct',
    summaryKannada: 'ಸರ್ಕಾರದ ಪೂರ್ವಾನುಮತಿಯಿಲ್ಲದೆ ಯಾವುದೇ ಸರ್ಕಾರಿ ನೌಕರನು ಪ್ರತ್ಯಕ್ಷವಾಗಿ ಅಥವಾ ಪರೋಕ್ಷವಾಗಿ ಯಾವುದೇ ವ್ಯಾಪಾರ, ವಾಣಿಜ್ಯ ಅಥವಾ ಖಾಸಗಿ ನೌಕರಿಯಲ್ಲಿ ತೊಡಗಬಾರದು. ನಿರ್ದಿಷ್ಟವಾಗಿ ಶಿಕ್ಷಕರು ಖಾಸಗಿ ಟ್ಯೂಷನ್ ಅಥವಾ ಕೋಚಿಂಗ್ ತರಗತಿಗಳನ್ನು ನಡೆಸುವುದು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಾವಳಿಗಳು 1966 ರ ನಿಯಮ 13 ರನ್ವಯ ಖಾಸಗಿ ವೃತ್ತಿ/ಟ್ಯೂಷನ್ ನಿಷೇಧ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮಾವಳಿ 1966 ರ ನಿಯಮ 13 ರ ಸ್ಪಷ್ಟ ಉಲ್ಲಂಘನೆಯಾಗಿರುವುದರಿಂದ ತಕ್ಷಣದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಅಂತಹ ಚಟುವಟಿಕೆಗಳನ್ನು ನಿಲ್ಲಿಸಲು ಕಟ್ಟುನಿಟ್ಟಿನ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮ 13 ರನ್ವಯ ಖಾಸಗಿ ಟ್ಯೂಷನ್/ವ್ಯಾಪಾರದಲ್ಲಿ ತೊಡಗದಂತೆ ಕಟ್ಟುನಿಟ್ಟಿನ ಸುತ್ತೋಲೆ.',
    popularForLetterType: ['circular', 'general', 'discipline'],
    tags: ['ಟ್ಯೂಷನ್ ನಿಷೇಧ', 'ಖಾಸಗಿ ವ್ಯಾಪಾರ', 'Conduct 13', 'Private Trade', 'ಸುತ್ತೋಲೆ']
  },
  {
    id: 'conduct-rule-23',
    book: 'CONDUCT',
    bookNameKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಗಳು, 1966',
    bookNameEnglish: 'KCS (Conduct) Rules, 1966',
    ruleNumber: 'ನಿಯಮ 23',
    chapterOrPart: 'ಸ್ಥಿರಾಸ್ತಿ ಮತ್ತು ಚರಾಸ್ತಿ ಘೋಷಣೆ',
    titleKannada: 'ಸ್ಥಿರಾಸ್ತಿ-ಚರಾಸ್ತಿ ಖರೀದಿ ಪೂರ್ವಾನುಮತಿ & ವಾರ್ಷಿಕ ಘೋಷಣೆ (Movable/Immovable Property Returns)',
    titleEnglish: 'Intimation & Prior Permission for Property Transactions',
    category: 'conduct',
    summaryKannada: 'ಸರ್ಕಾರಿ ನೌಕರನು ನಿವೇಶನ, ಮನೆ, ಜಮೀನು ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಮೌಲ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಬೆಲೆಬಾಳುವ ಚರಾಸ್ತಿಯನ್ನು ಕೊಳ್ಳುವಾಗ ಅಥವಾ ಮಾರಾಟ ಮಾಡುವಾಗ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಪೂರ್ವಾನುಮತಿ ಕೋರಬೇಕು ಮತ್ತು ಪ್ರತಿ ವರ್ಷ ವಾರ್ಷಿಕ ಆಸ್ತಿ ಘೋಷಣೆಯನ್ನು (Annual Property Returns - APR) ಕಡ್ಡಾಯವಾಗಿ ಸಲ್ಲಿಸಬೇಕು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ (ನಡತೆ) ನಿಯಮಗಳು 1966 ರ ನಿಯಮ 23 ರನ್ವಯ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಪೂರ್ವಾನುಮತಿ.',
    orderClauseSnippet: 'ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮಗಳು 1966 ರ ನಿಯಮ 23 ರ ಅಡಿಯಲ್ಲಿ ಸಲ್ಲಿಕೆಯಾದ ಪ್ರಸ್ತಾವನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಷರತ್ತುಗಳಿಗೊಳಪಟ್ಟು ನಿವೇಶನ/ಮನೆ ಖರೀದಿಗೆ ಪೂರ್ವಾನುಮತಿ ನೀಡಿ ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಸಿ.ಎಸ್ (ನಡತೆ) ನಿಯಮಾವಳಿ 1966 ರ ನಿಯಮ 23 ರ ಪ್ರಕಾರ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿಗೆ ಪೂರ್ವಾನುಮತಿ ನೀಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'memorandum'],
    tags: ['ಆಸ್ತಿ ಖರೀದಿ', 'ಪೂರ್ವಾನುಮತಿ', 'Property Return', 'Conduct 23', 'APR']
  },

  // ==============================================================
  // KSMOP & KTC RULES - ಕಛೇರಿ ಕೈಪಿಡಿ & ಖಜಾನೆ ಸಂಹಿತೆ
  // ==============================================================
  {
    id: 'ksmop-docket-note',
    book: 'KSMOP',
    bookNameKannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನ ಕೈಪಿಡಿ (KSMOP)',
    bookNameEnglish: 'Karnataka State Manual of Office Procedure',
    ruleNumber: 'ಪ್ಯಾರಾ 45 - 55',
    chapterOrPart: 'ಕಡತ ನಿರ್ವಹಣೆ ಮತ್ತು ಟಿಪ್ಪಣಿ ರಚನೆ',
    titleKannada: 'ಕಡತದ ಟಿಪ್ಪಣಿ ಮತ್ತು ಪ್ರಸ್ತಾವನೆ ಶೈಲಿ (Docket Note Sheet & References Hierarchy)',
    titleEnglish: 'Docket File Note Sheets, Preambles & Hierarchy of References',
    category: 'office_procedure',
    summaryKannada: 'ಸರ್ಕಾರಿ ಕಡತದಲ್ಲಿ ಟಿಪ್ಪಣಿ ಬರೆಯುವಾಗ ಮೊದಲು ವಿಷಯ, ಹಿಂದಿನ ಸರ್ಕಾರದ ಆದೇಶಗಳ ಉಲ್ಲೇಖ, ವಸ್ತುಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಆದೇಶಕ್ಕಾಗಿ ಸ್ಪಷ್ಟ ಶಿಫಾರಸನ್ನು ಒಳಗೊಂಡಿರಬೇಕು.',
    citationSnippet: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನ ಕೈಪಿಡಿ (KSMOP) ಪ್ಯಾರಾ 45 ರನ್ವಯ ಕಡತ ಟಿಪ್ಪಣಿ ಮತ್ತು ಉಲ್ಲೇಖಗಳ ಕ್ರಮಬದ್ಧತೆ.',
    orderClauseSnippet: 'ಕೆ.ಎಸ್.ಎಂ.ಒ.ಪಿ (KSMOP) ನಿಯಮಾವಳಿಯಂತೆ ಕಡತದ ಟಿಪ್ಪಣಿ ಹಾಳೆಯಲ್ಲಿ ಸಕ್ಷಮ ಅಧಿಕಾರಿಗಳ ಅನುಮೋದನೆ ಪಡೆದು ಈ ಆದೇಶವನ್ನು ಹೊರಡಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕಛೇರಿ ಕಾರ್ಯವಿಧಾನ ಕೈಪಿಡಿ (KSMOP) ನಿಯಮಾನುಸಾರ ಕಡತ ನಿರ್ವಹಣೆ ಕುರಿತು.',
    popularForLetterType: ['general', 'circular'],
    tags: ['KSMOP', 'ಟಿಪ್ಪಣಿ ಹಾಳೆ', 'Note Sheet', 'ಕಡತ ನಿಯಮ', 'ಉಲ್ಲೇಖ']
  },
  {
    id: 'ktc-rule-140',
    book: 'KTC',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಖಜಾನೆ ಸಂಹಿತೆ (KTC)',
    bookNameEnglish: 'Karnataka Treasury Code',
    ruleNumber: 'ನಿಯಮ 140 - 150',
    chapterOrPart: 'ಡಿಡಿಓ ವೇತನ ಬಿಲ್ ಮತ್ತು ಖಜಾನೆ-2 (K2)',
    titleKannada: 'ಡಿಡಿಓ ಬಿಲ್ ಸಲ್ಲಿಕೆ ಮತ್ತು ಖಜಾನೆ ತಪಾಸಣೆ (DDO Pay Bill & K2 Token Submission)',
    titleEnglish: 'Submission of Bills to Treasury through HRMS/K2',
    category: 'office_procedure',
    summaryKannada: 'ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿಯು (DDO) ವೇತನ ಮತ್ತು ಇತರೆ ಭತ್ಯೆಗಳ ಬಿಲ್ಲುಗಳನ್ನು HRMS-2 ಮತ್ತು Khajane-2 ಮೂಲಕ ಸಿದ್ಧಪಡಿಸಿ, ನಿಗದಿತ ದಿನಾಂಕದೊಳಗೆ ಖಜಾನೆಗೆ ಟೋಕನ್ ಸೃಜಿಸಿ ಸಲ್ಲಿಸಬೇಕೆಂಬ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಖಜಾನೆ ಸಂಹಿತೆ (KTC) ನಿಯಮ 140 ಮತ್ತು ಹಣಕಾಸು ಇಲಾಖೆಯ ಖಜಾನೆ-2 ನಿರ್ದೇಶನಗಳ ಪ್ರಕಾರ.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ಖಜಾನೆ ಸಂಹಿತೆ ನಿಯಮಾವಳಿಯಂತೆ HRMS ತಂತ್ರಾಂಶದಲ್ಲಿ ಅನುಮೋದಿತ ವೇತನ ಪಟ್ಟಿಯನ್ನು ಖಜಾನೆ ಪಾಸ್‌ಗಾಗಿ ರವಾನಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕೆ.ಟಿ.ಸಿ ನಿಯಮ 140 ರನ್ವಯ ಖಜಾನೆ-2 ಮುಖಾಂತರ ಬಿಲ್ ಪಾಸ್ ಮಾಡಿಕೊಡುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['general', 'financial'],
    tags: ['KTC', 'ಖಜಾನೆ-2', 'HRMS', 'DDO', 'ವೇತನ ಬಿಲ್']
  },

  // ==============================================================
  // EDUCATION ACT & RTE - ಶಿಕ್ಷಣ ಕಾಯ್ದೆ & RTE ನಿಯಮಗಳು
  // ==============================================================
  {
    id: 'edu-act-sec-39',
    book: 'EDU_ACT',
    bookNameKannada: 'ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ, 1983',
    bookNameEnglish: 'Karnataka Education Act, 1983',
    ruleNumber: 'ಪ್ರಕರಣ 39',
    chapterOrPart: 'ಶಾಲೆಗಳ ನೋಂದಣಿ ಮತ್ತು ಮಾನ್ಯತೆ',
    titleKannada: 'ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ (School Recognition Renewal & Safety)',
    titleEnglish: 'Recognition of Educational Institutions & Safety Compliance',
    category: 'education',
    summaryKannada: 'ಖಾಸಗಿ ಮತ್ತು ಅನುದಾನಿತ ಶಾಲೆಗಳು ಕಾಲಕಾಲಕ್ಕೆ ನಿಗದಿತ ಮೂಲಸೌಕರ್ಯ, ಅಗ್ನಿಶಾಮಕ ಸುರಕ್ಷತೆ (Fire NOC) ಮತ್ತು ಕಟ್ಟಡ ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಒದಗಿಸಿ ಮಾನ್ಯತೆಯನ್ನು ನವೀಕರಿಸಿಕೊಳ್ಳಬೇಕೆಂಬ ಶಾಸನಬದ್ಧ ನಿಯಮ.',
    citationSnippet: 'ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಪ್ರಕರಣ 39 ರ ಪ್ರಕಾರ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಣ ನಿಯಮಗಳು.',
    orderClauseSnippet: 'ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಪ್ರಕರಣ 39 ರನ್ವಯ ಪರಿಶೀಲನಾ ವರದಿಯನ್ನು ಆಧರಿಸಿ ಶಾಲೆಯ ಮಾನ್ಯತೆಯನ್ನು ನವೀಕರಿಸಿ ಆದೇಶಿಸಲಾಗಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ರ ಪ್ರಕರಣ 39 ರನ್ವಯ ಶಾಲಾ ಮಾನ್ಯತೆ ನವೀಕರಿಸುವ ಬಗ್ಗೆ.',
    popularForLetterType: ['circular', 'general'],
    tags: ['ಮಾನ್ಯತೆ ನವೀಕರಣ', 'Education Act', 'RTE', 'Fire NOC', 'ಶಾಲೆ']
  },
  {
    id: 'rte-act-sec-12',
    book: 'EDU_ACT',
    bookNameKannada: 'ಮಕ್ಕಳ ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆ, 2009 (RTE)',
    bookNameEnglish: 'Right to Education Act, 2009 (RTE)',
    ruleNumber: 'ಕಲಂ 12(1)(ಸಿ)',
    chapterOrPart: '25% ಉಚಿತ ಪ್ರವೇಶಾತಿ ನಿಯಮಗಳು',
    titleKannada: 'ಆರ್ಥಿಕ ದುರ್ಬಲ ವರ್ಗದ ಮಕ್ಕಳಿಗೆ 25% ಉಚಿತ ಪ್ರವೇಶ (25% RTE Free Admission)',
    titleEnglish: '25% Free Admission for Disadvantaged & Weaker Sections',
    category: 'education',
    summaryKannada: 'ಅನುದಾನರಹಿತ ಖಾಸಗಿ ಶಾಲೆಗಳಲ್ಲಿ ಒಂದನೇ ತರಗತಿ ಅಥವಾ ಎಲ್.ಕೆ.ಜಿ ಮಟ್ಟದಲ್ಲಿ ಆರ್ಥಿಕವಾಗಿ ಹಿಂದುಳಿದ ಹಾಗೂ ವಂಚಿತ ಸಮುದಾಯಗಳ ಮಕ್ಕಳಿಗೆ ಕನಿಷ್ಠ 25% ಸ್ಥಾನಗಳನ್ನು ಉಚಿತವಾಗಿ ಮೀಸಲಿಟ್ಟು ಪ್ರವೇಶ ನೀಡುವ ಕಡ್ಡಾಯ ನಿಯಮ.',
    citationSnippet: 'ಮಕ್ಕಳ ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆ 2009 ರ ಕಲಂ 12(1)(ಸಿ) ರ ಪ್ರಕಾರ 25% ಉಚಿತ ಪ್ರವೇಶ.',
    orderClauseSnippet: 'ಆರ್‌ಟಿಇ ಕಾಯ್ದೆ 2009 ರ ಕಲಂ 12(1)(ಸಿ) ರನ್ವಯ ಅರ್ಹ ಮಕ್ಕಳ ದಾಖಲಾತಿ ಪಟ್ಟಿಯನ್ನು ನಿಯಮಾನುಸಾರ ಅಂಗೀಕರಿಸಿ ಆದೇಶಿಸಿದೆ.',
    subjectSnippet: 'ವಿಷಯ: ಆರ್‌ಟಿಇ ಕಾಯ್ದೆ 2009 ರ ಕಲಂ 12(1)(ಸಿ) ರನ್ವಯ 25% ಉಚಿತ ಸೀಟುಗಳ ಪ್ರವೇಶಾತಿ ವರದಿ ಸಲ್ಲಿಕೆ ಬಗ್ಗೆ.',
    popularForLetterType: ['circular', 'general'],
    tags: ['RTE', 'ಕಲಂ 12(1)(c)', '25% ಸೀಟುಗಳು', 'ಉಚಿತ ಶಿಕ್ಷಣ', 'ಶಾಲೆ']
  }
];

// Helper to filter rules by book key
export function getRulesByBook(book: StatutoryBookKey): StatutoryRule[] {
  return KARNATAKA_STATUTORY_RULES.filter(r => r.book === book);
}

// Helper to filter rules by category
export function getRulesByCategory(cat: StatutoryCategory): StatutoryRule[] {
  return KARNATAKA_STATUTORY_RULES.filter(r => r.category === cat);
}

// Helper to search rules by keyword (Kannada or English)
export function searchStatutoryRules(query: string): StatutoryRule[] {
  if (!query || !query.trim()) return KARNATAKA_STATUTORY_RULES;
  const q = query.toLowerCase().trim();
  return KARNATAKA_STATUTORY_RULES.filter(r => 
    r.ruleNumber.toLowerCase().includes(q) ||
    r.titleKannada.toLowerCase().includes(q) ||
    r.titleEnglish.toLowerCase().includes(q) ||
    r.summaryKannada.toLowerCase().includes(q) ||
    r.citationSnippet.toLowerCase().includes(q) ||
    r.book.toLowerCase().includes(q) ||
    r.tags.some(t => t.toLowerCase().includes(q))
  );
}
