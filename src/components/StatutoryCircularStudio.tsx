import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Award,
  Users,
  Send,
  RotateCcw,
  BookOpen,
  Scale
} from 'lucide-react';
import { AdminAuthUser, MasterDocketFile, Employee, EducationLetter } from '../types';
import { StatutoryRuleSelectorModal } from './StatutoryRuleSelectorModal';
import { KARNATAKA_STATUTORY_RULES, StatutoryRule } from '../data/karnatakaStatutoryBooks';

interface StatutoryCircularStudioProps {
  currentUser: AdminAuthUser | null;
  files: MasterDocketFile[];
  employees?: Employee[];
  onSaveToRegistry?: (letter: Partial<EducationLetter>) => Promise<boolean | void>;
  onClose?: () => void;
  showToast?: (msg: string) => void;
}

interface CircularTemplate {
  id: string;
  title: string;
  category: string;
  statutoryAct: string;
  subject: string;
  reference: string;
  preamble: string;
  directives: string;
  complianceDue: string;
  penalNotice: string;
  copiesTo: string;
}

const STATUTORY_TEMPLATES: CircularTemplate[] = [
  {
    id: 'kcsr_increment',
    title: 'ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮತ್ತು ಸೇವಾ ದಾಖಲಾತಿ ಪರಿಶೀಲನೆ',
    category: 'ವೇತನ ಮತ್ತು ಸೇವಾ ವಿಷಯಗಳು',
    statutoryAct: 'KCSR ನಿಯಮಾವಳಿಗಳು, 1958 (ನಿಯಮ 53 ಮತ್ತು ಪ್ರಪತ್ರ 28)',
    subject: '2026 ನೇ ಸಾಲಿನ ಅರ್ಹ ನೌಕರರ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (Annual Increment) ಮಂಜೂರಾತಿ ಹಾಗೂ ಸೇವಾ ಪುಸ್ತಿಕೆ ದೃಢೀಕರಣ ಕುರಿತು ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ.',
    reference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 24 ಸೇನಿ2026, ದಿನಾಂಕ: 15-01-2026.\n2. ಆಯುಕ್ತರು, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಬೆಂಗಳೂರು ರವರ ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ: ಇಡಿ/ಆಡಳಿತ/2026 ದಿನಾಂಕ: 20-02-2026.',
    preamble: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯ ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಮತ್ತು ಅನುದಾನಿತ ಪ್ರೌಢ / ಪ್ರಾಥಮಿಕ ಶಾಲೆಗಳಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಬೋಧಕ ಮತ್ತು ಬೋಧಕೇತರ ಸಿಬ್ಬಂದಿಗಳಿಗೆ ನಿಯಮಾನುಸಾರ ಜನವರಿ ಮತ್ತು ಜುಲೈ ಮಾಹೆಯಲ್ಲಿ ಮಂಜೂರು ಮಾಡಬೇಕಾದ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿಗಳನ್ನು ನಿಗದಿತ ಅವಧಿಯೊಳಗೆ ಪ್ರಪತ್ರ-28 ರೊಂದಿಗೆ ಸಲ್ಲಿಸಬೇಕಾಗಿರುತ್ತದೆ.',
    directives: '1. ಎಲ್ಲಾ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರು ತಮ್ಮ ಸಂಸ್ಥೆಯ ನೌಕರರ ಸೇವಾ ಪುಸ್ತಿಕೆಗಳನ್ನು (Service Books) ಪರಿಶೀಲಿಸಿ, ವೇತನ ಬಡ್ತಿ ಪ್ರಸ್ತಾವನೆಗಳನ್ನು ನಿಗದಿತ ಪ್ರಪತ್ರ-28 ರಲ್ಲಿ ತಯಾರಿಸಿ ಕಚೇರಿಗೆ ಸಲ್ಲಿಸತಕ್ಕದ್ದು.\n2. ವೇತನ ಶ್ರೇಣಿಯ ಗರಿಷ್ಠ ಮಿತಿಯನ್ನು ಮೀರದಂತೆ ಹಾಗೂ ನಿಗದಿತ ಪರೀಕ್ಷಾ ಉತ್ತೀರ್ಣತೆ / ವಿನಾಯಿತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಕ್ರಮವಹಿಸುವುದು.\n3. ಯಾವುದೇ ಲೋಪದೋಷಗಳಿಲ್ಲದೆ ವೇತನ ಪರಿಷ್ಕರಣೆ ವಿವರಗಳನ್ನು ಎಚ್‌ಆರ್‌ಎಂಎಸ್ (HRMS) ತಂತ್ರಾಂಶದಲ್ಲಿ ನಮೂದಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿರುತ್ತದೆ.',
    complianceDue: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    penalNotice: 'ತಪ್ಪಿದಲ್ಲಿ ಆಗುವ ವಿಳಂಬಕ್ಕೆ ಸಂಬಂಧಪಟ್ಟ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರೇ ನೇರ ಹೊಣೆಗಾರರಾಗಿದ್ದು, KCSR (CCA) ನಿಯಮ 1957 ರ ಅಡಿಯಲ್ಲಿ ಕ್ರಮ ಜರುಗಿಸಲಾಗುವುದು.',
    copiesTo: '1. ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ರವರ ಮಾಹಿತಿಗಾಗಿ.\n2. ಭದ್ರಾವತಿ ತಾಲೂಕಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ / ಅನುದಾನಿತ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರುಗಳಿಗೆ.\n3. ಕಚೇರಿಯ ಆದೇಶಗಳ ಕಡತ ಮತ್ತು ನೌಕರರ ಶಾಖೆಗೆ.',
  },
  {
    id: 'leave_rules',
    title: 'ರಜೆ ನಿಯಮಾವಳಿಗಳು & ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು ದೃಢೀಕರಣ',
    category: 'ಸೇವಾ ನಿಯಮಗಳು',
    statutoryAct: 'KCSR ನಿಯಮಾವಳಿ 112 ಮತ್ತು 113 (ರಜೆ ಮಂಜೂರಾತಿ ನಿಯಮಗಳು)',
    subject: 'ನೌಕರರ ಗಳಿಕೆ ರಜೆ (Earned Leave) ಶಿಲ್ಕು ನವೀಕರಣ ಹಾಗೂ ಶಿಶುಪಾಲನ ರಜೆ (CCL) ನಿಯಮಗಳ ಕಟ್ಟುನಿಟ್ಟಿನ ಪಾಲನೆ ಕುರಿತು.',
    reference: '1. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ (ರಜೆ) ನಿಯಮಾವಳಿಗಳು, 2021 ರ ತಿದ್ದುಪಡಿ ನಿಯಮ.\n2. ಸರ್ಕಾರದ ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ: ಸಿಆಸುಇ 34 ಸೇವಿ2024 ದಿನಾಂಕ: 12-04-2025.',
    preamble: 'ನೌಕರರ ಸೇವಾ ಪುಸ್ತಿಕೆಯಲ್ಲಿ ಗಳಿಕೆ ರಜೆ ಲೆಕ್ಕಾಚಾರವನ್ನು ಪ್ರತಿ ವರ್ಷದ ಜನವರಿ 1 ಮತ್ತು ಜುಲೈ 1 ರಂದು ಪರಿಶೀಲಿಸಿ ಶಿಲ್ಕು ನಮೂದಿಸುವುದು ಶಾಸನಬದ್ಧ ಕರ್ತವ್ಯವಾಗಿರುತ್ತದೆ. ಹಲವು ಸಂಸ್ಥೆಗಳಲ್ಲಿ ರಜೆ ನವೀಕರಣ ಬಾಕಿಯಿರುವುದು ಕಂಡುಬಂದಿರುವುದರಿಂದ ಈ ಕೆಳಗಿನ ನಿರ್ದೇಶನಗಳನ್ನು ನೀಡಲಾಗಿದೆ.',
    directives: '1. ನೌಕರರ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು ಗರಿಷ್ಠ 300 ದಿನಗಳನ್ನು ಮೀರದಂತೆ ನವೀಕರಿಸುವುದು.\n2. ಮಹಿಳಾ ನೌಕರರ ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave) ಪ್ರಸ್ತಾವನೆಯನ್ನು ಸರ್ಕಾರದ ನಿಗದಿತ ಚೆಕ್‌ಲಿಸ್ಟ್ ಹಾಗೂ ಪೂರಕ ದಾಖಲೆಗಳೊಂದಿಗೆ ಮಾತ್ರ ಸಲ್ಲಿಸುವುದು.\n3. ಪೂರ್ವಾನುಮತಿ ಇಲ್ಲದೆ ಯಾವುದೇ ನೌಕರರು ದೀರ್ಘಾವಧಿ ಗೈರುಹಾಜರಾಗದಂತೆ ಎಚ್ಚರಿಕೆ ವಹಿಸತಕ್ಕದ್ದು.',
    complianceDue: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    penalNotice: 'ಅನಧಿಕೃತ ಗೈರುಹಾಜರಿಯನ್ನು ಅನರ್ಹ ಸೇವೆ ಎಂದು ಪರಿಗಣಿಸಲಾಗುವುದು.',
    copiesTo: '1. ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಿವಮೊಗ್ಗ.\n2. ವಲಯದ ಎಲ್ಲಾ ಪ್ರಾಥಮಿಕ / ಪ್ರೌಢಶಾಲಾ ಮುಖ್ಯಶಿಕ್ಷಕರುಗಳಿಗೆ.\n3. ಕಚೇರಿ ಪ್ರಕಟಣಾ ಫಲಕ / ಕಡತಕ್ಕೆ.',
  },
  {
    id: 'rte_admission',
    title: 'ವಿದ್ಯಾರ್ಥಿ ದಾಖಲಾತಿ & ಉಚಿತ ಪಠ್ಯಪುಸ್ತಕ ಸಮವಸ್ತ್ರ ವಿತರಣೆ',
    category: 'ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಯೋಜನೆಗಳು',
    statutoryAct: 'ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆ (RTE) 2009, ಕಲಂ 12',
    subject: '2026-27 ನೇ ಶೈಕ್ಷಣಿಕ ಸಾಲಿನಲ್ಲಿ ಶಾಲೆಯಿಂದ ಹೊರಗುಳಿದ ಮಕ್ಕಳನ್ನು ಮುಖ್ಯವಾಹಿನಿಗೆ ತರುವುದು ಹಾಗೂ ಉಚಿತ ಪಠ್ಯಪುಸ್ತಕ/ಸಮವಸ್ತ್ರ ವಿತರಣೆ ಕುರಿತು ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ.',
    reference: '1. ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆ (RTE) ನಿಯಮಗಳು 2012.\n2. ಸಮಗ್ರ ಶಿಕ್ಷಣ ಕರ್ನಾಟಕ (SSK) ನಿರ್ದೇಶಕರ ಜ್ಞಾಪನ ಸಂಖ್ಯೆ: ಇಡಿ/ಸಶಿ/2026 ದಿನಾಂಕ: 10-05-2026.',
    preamble: '6 ರಿಂದ 14 ವರ್ಷದೊಳಗಿನ ಯಾವುದೇ ಮಗುವೂ ಶಿಕ್ಷಣದಿಂದ ವಂಚಿತವಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಸರ್ಕಾರದಿಂದ ಒದಗಿಸಲಾಗುವ ಉಚಿತ ಸೌಲಭ್ಯಗಳನ್ನು ಪಾರದರ್ಶಕವಾಗಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತಲುಪಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿರುತ್ತದೆ.',
    directives: '1. ಶಾಲಾ ದಾಖಲಾತಿ ಆಂದೋಲನವನ್ನು ಆಯೋಜಿಸಿ, ಎಲ್ಲಾ ಅರ್ಹ ಮಕ್ಕಳನ್ನು ದಾಖಲಿಸಿಕೊಳ್ಳುವುದು.\n2. ಸ್ವೀಕೃತವಾದ ಪಠ್ಯಪುಸ್ತಕ ಮತ್ತು ಸಮವಸ್ತ್ರಗಳನ್ನು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿತರಿಸಿ, ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಇಂದೀಕರಿಸುವುದು.\n3. ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಯೂಟ ಯೋಜನೆ ಮತ್ತು ಕ್ಷೀರಭಾಗ್ಯ ಯೋಜನೆಯ ಆಹಾರ ಗುಣಮಟ್ಟವನ್ನು ದೈನಂದಿನ ತಪಾಸಣೆ ನಡೆಸುವುದು.',
    complianceDue: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    penalNotice: 'ವಿತರಣೆಯಲ್ಲಿ ಯಾವುದೇ ಲೋಪ ಕಂಡುಬಂದಲ್ಲಿ ಆರ್ಥಿಕ ದುರುಪಯೋಗವೆಂದು ಪರಿಗಣಿಸಿ ಕಾನೂನು ಕ್ರಮ ಜರುಗಿಸಲಾಗುವುದು.',
    copiesTo: '1. ಜಿಲ್ಲಾ ಪಂಚಾಯಿತಿ ಮುಖ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ ಅಧಿಕಾರಿಗಳು, ಶಿವಮೊಗ್ಗ.\n2. ಕ್ಷೇತ್ರ ಸಮನ್ವಯಾಧಿಕಾರಿಗಳು, ಬಿಆರ್‌ಸಿ ಭದ್ರಾವತಿ.\n3. ಎಲ್ಲಾ ಸಿಆರ್‌ಪಿಗಳು ಮತ್ತು ಮುಖ್ಯ ಶಿಕ್ಷಕರುಗಳಿಗೆ.',
  },
  {
    id: 'infra_safety',
    title: 'ಶಾಲಾ ಕಟ್ಟಡ ಸುರಕ್ಷತೆ, ಪಂಚಾಯತ್ ಇಂಜಿನಿಯರಿಂಗ್ & ಅನುದಾನ ಬಳಕೆ',
    category: 'ಕಟ್ಟಡ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ',
    statutoryAct: 'ಕರ್ನಾಟಕ ಸಾರ್ವಜನಿಕ ಸಂಗ್ರಹಣೆಗಳಲ್ಲಿ ಪಾರದರ್ಶಕತೆ (KTPR) ಕಾಯ್ದೆ ಮತ್ತು ಶಾಲಾ ಸುರಕ್ಷತಾ ನಿಯಮಾವಳಿ',
    subject: 'ಮಳೆಗಾಲದ ಮುನ್ನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಶಾಲಾ ಕೊಠಡಿಗಳ ಸುರಕ್ಷತಾ ತಪಾಸಣೆ ಹಾಗೂ ದುರಸ್ತಿ ಅನುದಾನ ಬಳಕೆ ಕುರಿತು.',
    reference: '1. ಸರ್ಕಾರದ ಆದೇಶ ಸಂಖ್ಯೆ: ಲೋಇ 42 ಕಾಗು2025 ದಿನಾಂಕ: 01-02-2026.\n2. SDMC ಸಬಲೀಕರಣ ಮತ್ತು ಶಾಲಾ ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು.',
    preamble: 'ಮಕ್ಕಳ ಸುರಕ್ಷತೆಯು ಪ್ರಮುಖವಾಗಿದ್ದು, ಶಿಥಿಲಾವಸ್ಥೆಯಲ್ಲಿರುವ ಕೊಠಡಿಗಳನ್ನು ತಕ್ಷಣವೇ ಗುರುತಿಸಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಪ್ರವೇಶವನ್ನು ನಿಷೇಧಿಸುವುದು ಹಾಗೂ ಪಂಚಾಯತ್ ಇಂಜಿನಿಯರಿಂಗ್ ಇಲಾಖೆಯ ನೆರವಿನಿಂದ ದುರಸ್ತಿ ಕೈಗೊಳ್ಳಲು ಸೂಚಿಸಲಾಗಿದೆ.',
    directives: '1. ಪ್ರತಿ ಶಾಲೆಯ SDMC ಸಭೆ ಕರೆದು, ಕಟ್ಟಡ ಸುರಕ್ಷತಾ ಪರಿಶೀಲನಾ ವರದಿ ಸಿದ್ಧಪಡಿಸುವುದು.\n2. ಶಾಲಾ ನಿರ್ವಹಣಾ ಅನುದಾನವನ್ನು (School Maintenance Grant) KTPR ನಿಯಮಗಳ ಪ್ರಕಾರ ಪಾರದರ್ಶಕವಾಗಿ ಖರ್ಚು ಮಾಡಿ ಲೆಕ್ಕಪತ್ರ ಒದಗಿಸುವುದು.\n3. ಕುಡಿಯುವ ನೀರು, ಶೌಚಾಲಯ ಸ್ವಚ್ಛತೆ ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕದ ಸುರಕ್ಷತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುವುದು.',
    complianceDue: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    penalNotice: 'ಅಸುರಕ್ಷಿತ ಕೊಠಡಿಗಳಲ್ಲಿ ತರಗತಿ ನಡೆಸಿ ಅಹಿತಕರ ಘಟನೆ ಸಂಭವಿಸಿದಲ್ಲಿ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರನ್ನೇ ಕ್ರಿಮಿನಲ್ ಹೊಣೆಗಾರರನ್ನಾಗಿ ಮಾಡಲಾಗುವುದು.',
    copiesTo: '1. ಕಾರ್ಯನಿರ್ವಾಹಕ ಇಂಜಿನಿಯರ್, ಪಂಚಾಯತ್ ರಾಜ್ ಇಂಜಿನಿಯರಿಂಗ್, ಭದ್ರಾವತಿ.\n2. ತಾಲೂಕು ಪಂಚಾಯಿತಿ ಕಾರ್ಯನಿರ್ವಾಹಕ ಅಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ.\n3. ಎಲ್ಲಾ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರು ಹಾಗೂ SDMC ಅಧ್ಯಕ್ಷರುಗಳಿಗೆ.',
  }
];

export const StatutoryCircularStudio: React.FC<StatutoryCircularStudioProps> = ({
  currentUser,
  files,
  employees = [],
  onSaveToRegistry,
  onClose,
  showToast,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(STATUTORY_TEMPLATES[0].id);

  // Form State
  const initialTemp = STATUTORY_TEMPLATES[0];
  const [circularNumber, setCircularNumber] = useState(`ಇಡಿ/ಕ್ಷೇಶಿ/ಭದ್ರಾವತಿ/ಶಾಸನಬದ್ಧ-ಸುತ್ತೋಲೆ/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [circularDate, setCircularDate] = useState(new Date().toISOString().split('T')[0]);
  const [statutoryAct, setStatutoryAct] = useState(initialTemp.statutoryAct);
  const [subject, setSubject] = useState(initialTemp.subject);
  const [reference, setReference] = useState(initialTemp.reference);
  const [preamble, setPreamble] = useState(initialTemp.preamble);
  const [directives, setDirectives] = useState(initialTemp.directives);
  const [complianceDue, setComplianceDue] = useState(initialTemp.complianceDue);
  const [penalNotice, setPenalNotice] = useState(initialTemp.penalNotice);
  const [copiesTo, setCopiesTo] = useState(initialTemp.copiesTo);
  const [selectedFileDocket, setSelectedFileDocket] = useState<string>(files[0]?.fileNumber || 'ED/BEO/BDVT/GEN/2026/01');
  const [isSaving, setIsSaving] = useState(false);

  // Switch template
  const handleSelectTemplate = (tempId: string) => {
    setSelectedTemplateId(tempId);
    const t = STATUTORY_TEMPLATES.find((x) => x.id === tempId);
    if (!t) return;
    setStatutoryAct(t.statutoryAct);
    setSubject(t.subject);
    setReference(t.reference);
    setPreamble(t.preamble);
    setDirectives(t.directives);
    setComplianceDue(t.complianceDue);
    setPenalNotice(t.penalNotice);
    setCopiesTo(t.copiesTo);
  };

  // KCSR / KFC / CCA Statutory Rule Selector Modal State
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);

  const handleInsertStatutoryRuleRef = (citation: string, rule: StatutoryRule) => {
    setReference(prev => {
      const base = prev ? prev.trim() : '';
      const lines = base ? base.split('\n') : [];
      return base ? `${base}\n${lines.length + 1}. ${citation}` : `1. ${citation}`;
    });
    setStatutoryAct(`${rule.book} ${rule.ruleNumber} (${rule.titleKannada})`);
  };

  const handleInsertStatutoryRuleSubject = (subj: string) => {
    setSubject(subj);
  };

  const handleInsertStatutoryRuleBody = (clause: string) => {
    setPreamble(prev => (prev ? `${prev}\n\n${clause}` : clause));
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Save to Letter Registry
  const handleSaveCircular = async () => {
    if (!subject.trim()) {
      alert('ದಯವಿಟ್ಟು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<EducationLetter> = {
        referenceNumber: circularNumber,
        fileNumber: selectedFileDocket,
        subject: subject,
        dateReceivedOrIssued: circularDate,
        direction: 'outward',
        category: 'Circular & Directive',
        section: 'Administration & Services',
        senderName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
        recipientName: 'ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ಎಲ್ಲಾ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಮತ್ತು ಸಿಬ್ಬಂದಿ',
        priority: 'Urgent',
        status: 'Dispatched',
        dueDate: complianceDue,
        bodyText: `ಶಾಸನಬದ್ಧ ಕಾಯ್ದೆ / ನಿಯಮಾವಳಿ: ${statutoryAct}\n\nಉಲ್ಲೇಖ:\n${reference}\n\nಪ್ರಸ್ತಾವನೆ:\n${preamble}\n\nಶಾಸನಬದ್ಧ ನಿರ್ದೇಶನಗಳು:\n${directives}\n\nಶಿಸ್ತು ಕ್ರಮದ ಎಚ್ಚರಿಕೆ:\n${penalNotice}\n\nಪ್ರತಿ ರವಾನೆ:\n${copiesTo}`,
        remarks: `ಸ್ವಯಂಚಾಲಿತ ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ - ${statutoryAct}`,
      };

      if (onSaveToRegistry) {
        await onSaveToRegistry(payload);
      } else {
        await fetch('/api/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (showToast) {
        showToast('ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಿ ಕಡತಕ್ಕೆ ನೋಂದಾಯಿಸಲಾಗಿದೆ!');
      } else {
        alert('ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಿ ಕಡತಕ್ಕೆ ನೋಂದಾಯಿಸಲಾಗಿದೆ!');
      }
    } catch (err: any) {
      alert('ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Banner */}
      <div className="bg-white border-2 border-[#2b2b2b] rounded-xl p-5 shadow-[4px_4px_0px_#2b2b2b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2b2b2b] text-[#f59e0b] flex items-center justify-center shrink-0 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#f59e0b]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-kannada">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ ವ್ಯವಸ್ಥೆ
                </span>
                <span className="text-xs text-stone-500 font-mono-code">Statutory Circular Studio</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-1 font-kannada">
                ಸ್ವಯಂಚಾಲಿತ ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ ತಯಾರಿಕೆ (Automated Statutory Circular Generation)
              </h1>
              <p className="text-xs text-stone-600 mt-0.5 font-kannada">
                KCSR, ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 1983 ಹಾಗೂ RTE ಅನ್ವಯ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸುತ್ತೋಲೆಗಳನ್ನು ಸೃಜಿಸಿ ಮಾಸ್ಟರ್ ಡಾಕೆಟ್‌ಗೆ ಜೋಡಿಸಿ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold text-[#2b2b2b] bg-white hover:bg-stone-100 border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>ಮುದ್ರಣ (Print)</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCircular}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-[#2b2b2b] bg-[#f59e0b] hover:bg-[#e08e0b] border-2 border-[#2b2b2b] rounded-lg shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#2b2b2b]" />
              <span>{isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಡತದಲ್ಲಿ ನೋಂದಾಯಿಸಿ (Save to Docket)'}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg cursor-pointer"
              >
                ಹಿಂದಕ್ಕೆ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Statutory Templates Selection */}
      <div className="bg-[#fffbf2] border-2 border-[#2b2b2b] rounded-xl p-4 shadow-[3px_3px_0px_#2b2b2b]">
        <label className="block text-xs font-bold text-[#2b2b2b] uppercase tracking-wider mb-2 font-kannada">
          1. ನಿಗದಿತ ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ (Select Statutory Circular Template)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STATUTORY_TEMPLATES.map((temp) => {
            const isSelected = selectedTemplateId === temp.id;
            return (
              <button
                key={temp.id}
                type="button"
                onClick={() => handleSelectTemplate(temp.id)}
                className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2b2b2b] text-[#fffbf2] border-[#2b2b2b] shadow-[3px_3px_0px_#f59e0b]'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-stone-500'
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono-code ${
                    isSelected ? 'bg-[#f59e0b] text-[#2b2b2b]' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {temp.category}
                </span>
                <h4 className="font-bold text-xs mt-1 font-kannada line-clamp-2">{temp.title}</h4>
                <p
                  className={`text-[10px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-amber-200' : 'text-stone-500'
                  }`}
                >
                  {temp.statutoryAct}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Editor (Left) & Official Letterhead Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Editable Details (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border-2 border-[#2b2b2b] rounded-xl p-5 shadow-[3px_3px_0px_#2b2b2b] space-y-3.5">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider pb-2 border-b border-stone-200 font-kannada">
              2. ಸುತ್ತೋಲೆಯ ಶಾಸನಬದ್ಧ ವಿವರಗಳು (Statutory Attributes)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                  ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ (Circular Number)
                </label>
                <input
                  type="text"
                  value={circularNumber}
                  onChange={(e) => setCircularNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                  ದಿನಾಂಕ (Issue Date)
                </label>
                <input
                  type="date"
                  value={circularDate}
                  onChange={(e) => setCircularDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಸಂಬಂಧಪಟ್ಟ ಮಾಸ್ಟರ್ ಡಾಕೆಟ್ ಕಡತ (Master Docket Link)
              </label>
              <select
                value={selectedFileDocket}
                onChange={(e) => setSelectedFileDocket(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
              >
                {files.map((f) => (
                  <option key={f.id} value={f.fileNumber}>
                    {f.fileNumber} - {f.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಕಾಯ್ದೆ / ಅಧಿಕೃತ ನಿಯಮಾವಳಿ (Statutory Act / Citation)
              </label>
              <input
                type="text"
                value={statutoryAct}
                onChange={(e) => setStatutoryAct(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ವಿಷಯ (Subject) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b] font-kannada"
              />
            </div>

            <div>
              {/* KCSR / KFC / CCA Quick Rule Chips for Circulars */}
              <div className="mb-2 p-2 bg-[#fffbf2] border-2 border-amber-300 rounded-lg space-y-1.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-950 font-kannada">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>KCSR, KFC & CCA ಶಾಸನಬದ್ಧ ನಿಯಮಾವಳಿಗಳ ಉಲ್ಲೇಖ:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStatutoryModalOpen(true)}
                    className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] border border-[#2b2b2b] flex items-center gap-1 cursor-pointer font-kannada shadow-2xs"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>📚 ನಿಯಮ ಪುಸ್ತಕ ತೆರೆಯಿರಿ...</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-51');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 cursor-pointer font-kannada"
                  >
                    + KCSR 51 (ವೇತನ ಬಡ್ತಿ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-112');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer font-kannada"
                  >
                    + KCSR 112 (ಗಳಿಕೆ ರಜೆ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'conduct-rule-13');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 cursor-pointer font-kannada"
                  >
                    + Conduct 13 (ಟ್ಯೂಷನ್ ನಿಷೇಧ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kfc-article-138');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 cursor-pointer font-kannada"
                  >
                    + KFC 138 (ಅನುದಾನ UC)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'cca-rule-11');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 cursor-pointer font-kannada"
                  >
                    + CCA 11 (ಕಾರಣ ಕೇಳುವ ನೋಟಿಸ್)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'edu-act-sec-39');
                      if (r) handleInsertStatutoryRuleRef(r.citationSnippet, r);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 cursor-pointer font-kannada"
                  >
                    + ಶಿಕ್ಷಣ ಕಾಯ್ದೆ 39 (ಮಾನ್ಯತೆ)
                  </button>
                </div>
              </div>

              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಉಲ್ಲೇಖಗಳು (References)
              </label>
              <textarea
                rows={2}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono text-[11px] border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಪ್ರಸ್ತಾವನೆ (Preamble / Legal Context)
              </label>
              <textarea
                rows={3}
                value={preamble}
                onChange={(e) => setPreamble(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b] font-kannada leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಶಾಸನಬದ್ಧ ನಿರ್ದೇಶನಗಳು (Directives / Mandates)
              </label>
              <textarea
                rows={4}
                value={directives}
                onChange={(e) => setDirectives(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b] font-kannada leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                  ಅನುಷ್ಠಾನದ ಅಂತಿಮ ಗಡುವು (Compliance Due Date)
                </label>
                <input
                  type="date"
                  value={complianceDue}
                  onChange={(e) => setComplianceDue(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1 font-kannada">
                  ನಿಯಮ ಉಲ್ಲಂಘನಾ ಎಚ್ಚರಿಕೆ (Penal Notice)
                </label>
                <input
                  type="text"
                  value={penalNotice}
                  onChange={(e) => setPenalNotice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-rose-300 bg-rose-50/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-kannada"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-kannada">
                ಪ್ರತಿ ರವಾನೆ ಪಟ್ಟಿ (Copies Endorsed To)
              </label>
              <textarea
                rows={2}
                value={copiesTo}
                onChange={(e) => setCopiesTo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono text-[11px] border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2b2b2b]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Official Government Circular Document (6 cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-white border-2 border-[#2b2b2b] rounded-xl shadow-[4px_4px_0px_#2b2b2b] overflow-hidden">
            <div className="p-3 bg-stone-100 border-b border-stone-300 flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1.5 font-kannada">
                <FileText className="w-4 h-4 text-sky-800" />
                ಅಧಿಕೃತ ಸರ್ಕಾರದ ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ ಪೂರ್ವವೀಕ್ಷಣೆ (Live Preview)
              </span>
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                e-Office Ready
              </span>
            </div>

            {/* Official Letterhead Sheet */}
            <div className="p-8 sm:p-10 space-y-6 text-stone-900 bg-white min-h-[680px] font-kannada leading-relaxed text-xs sm:text-sm">
              {/* Karnataka Govt Emblem & Header */}
              <div className="text-center border-b-2 border-stone-800 pb-4 space-y-1">
                <div className="text-xs font-bold tracking-widest text-stone-700 uppercase">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರ (GOVERNMENT OF KARNATAKA)
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-950">
                  ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
                </h2>
                <h3 className="text-xs sm:text-sm font-semibold text-stone-800">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ
                </h3>
                <p className="text-[11px] text-stone-600 font-mono-code">
                  ದೂರವಾಣಿ: 08282-267452 • ಇ-ಮೇಲ್: beo.bhadravathi@karnataka.gov.in
                </p>
              </div>

              {/* Number and Date Row */}
              <div className="flex justify-between items-center text-xs font-semibold pt-1 border-b border-stone-200 pb-2">
                <div>
                  ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ: <strong className="font-mono text-stone-950">{circularNumber}</strong>
                </div>
                <div>
                  ದಿನಾಂಕ: <strong>{circularDate}</strong>
                </div>
              </div>

              {/* Circular Title */}
              <div className="text-center py-1">
                <span className="inline-block px-4 py-1 bg-stone-100 border-2 border-stone-800 rounded font-bold text-sm tracking-wide uppercase">
                  ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ (STATUTORY CIRCULAR)
                </span>
                <p className="text-[10px] text-stone-500 mt-1 font-mono-code font-bold">
                  [{statutoryAct}]
                </p>
              </div>

              {/* Subject & Reference */}
              <div className="space-y-3 bg-stone-50 p-4 rounded border border-stone-200 text-xs">
                <div>
                  <strong className="block text-stone-900">ವಿಷಯ:</strong>
                  <p className="font-semibold text-stone-800 mt-0.5 leading-normal">{subject}</p>
                </div>
                <div>
                  <strong className="block text-stone-900">ಉಲ್ಲೇಖ:</strong>
                  <pre className="font-sans whitespace-pre-wrap text-stone-700 text-[11px] mt-0.5 font-medium">
                    {reference}
                  </pre>
                </div>
              </div>

              {/* Preamble */}
              <div className="space-y-1.5">
                <strong className="text-xs font-bold text-stone-900 underline">ಪ್ರಸ್ತಾವನೆ:</strong>
                <p className="text-stone-800 text-justify text-xs leading-relaxed indent-8">
                  {preamble}
                </p>
              </div>

              {/* Mandates */}
              <div className="space-y-2">
                <strong className="text-xs font-bold text-stone-900 underline">
                  ಶಾಸನಬದ್ಧ ನಿರ್ದೇಶನಗಳು / ಸುತ್ತೋಲೆಯ ಮುಖ್ಯಾಂಶಗಳು:
                </strong>
                <div className="text-stone-800 text-xs leading-relaxed whitespace-pre-line pl-2">
                  {directives}
                </div>
              </div>

              {/* Due Date & Penal notice */}
              <div className="p-3 bg-amber-50/60 border border-amber-300 rounded text-xs space-y-1">
                <p>
                  <strong>ಅನುಷ್ಠಾನದ ಅಂತಿಮ ಗಡುವು:</strong> {complianceDue} ರೊಳಗಾಗಿ ಪಾಲನಾ ವರದಿ ಸಲ್ಲಿಸುವುದು.
                </p>
                <p className="text-rose-900 font-semibold text-[11px]">
                  <strong>ಎಚ್ಚರಿಕೆ:</strong> {penalNotice}
                </p>
              </div>

              {/* Signatory */}
              <div className="pt-8 flex justify-end">
                <div className="text-center space-y-1">
                  <div className="w-24 h-10 border-b border-dashed border-stone-400 mx-auto flex items-center justify-center text-[10px] text-stone-400 italic">
                    [ಡಿಜಿಟಲ್ ಸಹಿ / e-Sign]
                  </div>
                  <div className="font-bold text-xs text-stone-950">
                    (ಬಿ. ಕೆ. ನಾರಾಯಣಪ್ಪ)
                  </div>
                  <div className="text-[11px] text-stone-700 font-semibold">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು
                  </div>
                  <div className="text-[10px] text-stone-500">
                    ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಭದ್ರಾವತಿ
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="pt-4 border-t border-stone-300 text-[11px] text-stone-600 space-y-1">
                <strong>ಪ್ರತಿ ರವಾನೆ:</strong>
                <pre className="font-sans whitespace-pre-wrap text-[10px] text-stone-600">
                  {copiesTo}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KCSR, KFC, CCA STATUTORY RULE SELECTOR MODAL */}
      <StatutoryRuleSelectorModal
        isOpen={isStatutoryModalOpen}
        onClose={() => setIsStatutoryModalOpen(false)}
        onInsertReference={handleInsertStatutoryRuleRef}
        onInsertSubject={handleInsertStatutoryRuleSubject}
        onInsertBody={handleInsertStatutoryRuleBody}
        targetContextName="ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆ"
      />
    </div>
  );
};
