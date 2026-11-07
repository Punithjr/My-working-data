import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Users,
  Baby,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Printer,
  Sparkles,
  Edit3,
  CalendarCheck2,
  X,
  Building,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Employee, LeaveRequestRecord, LeaveCategory } from '../types';

interface LeaveCalendarViewProps {
  employees: Employee[];
  currentUser?: any;
  onUpdateEmployee?: (updated: Employee) => void;
  onOpenOrderForEmployee?: (kgid: string) => void;
  onDraftLetterForEmployee?: (emp: Employee) => void;
  showToast: (msg: string) => void;
}

// Initial seed leave records for Bhadravathi Taluk
const INITIAL_LEAVE_RECORDS: LeaveRequestRecord[] = [
  {
    id: 'ccl-2026-001',
    employeeName: 'ಸುಧಾ ಎಂ.',
    kgidNumber: '1045821',
    designation: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು (ಪ್ರೌಢಶಾಲೆ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಕಾಗದನಗರ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-01-05',
    endDate: '2026-02-03',
    daysCount: 30,
    status: 'Completed',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/08/2025-26',
    orderDate: '2026-01-02',
    reason: 'ಮಗುವಿನ 10ನೇ ತರಗತಿ ಪರೀಕ್ಷಾ ತಯಾರಿ & ಆರೋಗ್ಯ ಪಾಲನೆ',
    quotaBefore: 180,
    quotaConsumed: 30,
    quotaRemaining: 150,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ಅನುಷ್ಕಾ (ವಯಸ್ಸು 15 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    notes: 'KCSR ನಿಯಮ 135B ಅನ್ವಯ 30 ದಿನಗಳ ರಜೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.',
    createdAt: '2026-01-02'
  },
  {
    id: 'ccl-2026-002',
    employeeName: 'ಸುಧಾ ಎಂ.',
    kgidNumber: '1045821',
    designation: 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು (ಪ್ರೌಢಶಾಲೆ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಕಾಗದನಗರ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-03-10',
    endDate: '2026-03-24',
    daysCount: 15,
    status: 'Sanctioned',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/22/2025-26',
    orderDate: '2026-03-05',
    reason: 'ಮಗುವಿನ ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಅವಧಿ ಪಾಲನೆ',
    quotaBefore: 150,
    quotaConsumed: 45,
    quotaRemaining: 135,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ಅನುಷ್ಕಾ (ವಯಸ್ಸು 15 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    notes: 'ದ್ವಿತೀಯ ಹಂತದ 15 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ.',
    createdAt: '2026-03-05'
  },
  {
    id: 'ccl-2026-003',
    employeeName: 'ಕವಿತಾ ಆರ್.',
    kgidNumber: '1067432',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (ಗಣಿತ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಅಂತರಗಂಗೆ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-02-15',
    endDate: '2026-03-16',
    daysCount: 30,
    status: 'Completed',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/15/2025-26',
    orderDate: '2026-02-12',
    reason: 'ಚಿಕ್ಕ ಮಗುವಿನ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಪಾಲನೆ',
    quotaBefore: 180,
    quotaConsumed: 30,
    quotaRemaining: 150,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ತನ್ಮಯ್ (ವಯಸ್ಸು 3 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdAt: '2026-02-12'
  },
  {
    id: 'ccl-2026-004',
    employeeName: 'ಕವಿತಾ ಆರ್.',
    kgidNumber: '1067432',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (ಗಣಿತ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಅಂತರಗಂಗೆ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-05-02',
    endDate: '2026-05-31',
    daysCount: 30,
    status: 'Pending Approval',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/ಪ್ರಸ್ತಾವನೆ/2026-27',
    orderDate: '2026-04-20',
    reason: 'ಶಾಲೆ ಬೇಸಿಗೆ ರಜೆಯ ನಂತರದ ಪೂರ್ವಭಾವಿ ಆರೈಕೆ',
    quotaBefore: 150,
    quotaConsumed: 60,
    quotaRemaining: 120,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ತನ್ಮಯ್ (ವಯಸ್ಸು 3 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdAt: '2026-04-20'
  },
  {
    id: 'mat-2026-005',
    employeeName: 'ಶೈಲಜಾ ಬಿ.',
    kgidNumber: '1089201',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (ವಿಜ್ಞಾನ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಹಳೇನಗರ',
    leaveType: 'ಹೆರಿಗೆ ರಜೆ (Maternity Leave)',
    startDate: '2026-01-01',
    endDate: '2026-06-29',
    daysCount: 180,
    status: 'Sanctioned',
    orderNumber: 'ಸಂ: ಆ2/ಹೆರಿಗೆ ರಜೆ/01/2026-27',
    orderDate: '2025-12-28',
    reason: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ನೌಕರರ ನಿಯಮಾವಳಿ ಪ್ರಕಾರ 180 ದಿನಗಳ ಹೆರಿಗೆ ರಜೆ ಮಂಜೂರಾತಿ',
    quotaBefore: 180,
    quotaConsumed: 180,
    quotaRemaining: 0,
    childDetails: 'ಮೊದಲ ಹೆರಿಗೆ ಮಗು',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdAt: '2025-12-28'
  },
  {
    id: 'ccl-2026-006',
    employeeName: 'ಪ್ರೇಮಾ ಕುಮಾರಿ',
    kgidNumber: '1054329',
    designation: 'ಸಹ ಶಿಕ್ಷಕರು (ಕನ್ನಡ)',
    gender: 'Female',
    placeOfWork: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಜನ್ನಾಪುರ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-04-01',
    endDate: '2026-04-15',
    daysCount: 15,
    status: 'Sanctioned',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/34/2025-26',
    orderDate: '2026-03-25',
    reason: 'ಮಗುವಿನ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ',
    quotaBefore: 180,
    quotaConsumed: 15,
    quotaRemaining: 165,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ಆರಾಧ್ಯ (ವಯಸ್ಸು 5 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdAt: '2026-03-25'
  },
  {
    id: 'ccl-2026-007',
    employeeName: 'ರೂಪಾ ಎಚ್.',
    kgidNumber: '1098712',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA)',
    gender: 'Female',
    placeOfWork: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    leaveType: 'ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    daysCount: 30,
    status: 'Pending Approval',
    orderNumber: 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/ಪ್ರಸ್ತಾವನೆ/41/2026-27',
    orderDate: '2026-05-15',
    reason: 'ಮಗುವಿನ ಶಾಲಾ ಪ್ರವೇಶ & ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ',
    quotaBefore: 180,
    quotaConsumed: 30,
    quotaRemaining: 150,
    childDetails: 'ಮಗುವಿನ ಹೆಸರು: ಸಮರ್ಥ್ (ವಯಸ್ಸು 6 ವರ್ಷ)',
    sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
    createdAt: '2026-05-15'
  }
];

const KANNADA_MONTHS = [
  'ಜನವರಿ (January)',
  'ಫೆಬ್ರವರಿ (February)',
  'ಮಾರ್ಚ್ (March)',
  'ಏಪ್ರಿಲ್ (April)',
  'ಮೇ (May)',
  'ಜೂನ್ (June)',
  'ಜುಲೈ (July)',
  'ಆಗಸ್ಟ್ (August)',
  'ಸೆಪ್ಟೆಂಬರ್ (September)',
  'ಅಕ್ಟೋಬರ್ (October)',
  'ನವೆಂಬರ್ (November)',
  'ಡಿಸೆಂಬರ್ (December)'
];

const KANNADA_WEEKDAYS = [
  { short: 'ಭಾನು', full: 'ಭಾನುವಾರ (Sun)' },
  { short: 'ಸೋಮ', full: 'ಸೋಮವಾರ (Mon)' },
  { short: 'ಮಂಗಳ', full: 'ಮಂಗಳವಾರ (Tue)' },
  { short: 'ಬುಧ', full: 'ಬುಧವಾರ (Wed)' },
  { short: 'ಗುರು', full: 'ಗುರುವಾರ (Thu)' },
  { short: 'ಶುಕ್ರ', full: 'ಶುಕ್ರವಾರ (Fri)' },
  { short: 'ಶನಿ', full: 'ಶನಿವಾರ (Sat)' }
];

export const LeaveCalendarView: React.FC<LeaveCalendarViewProps> = ({
  employees,
  currentUser,
  onUpdateEmployee,
  onOpenOrderForEmployee,
  onDraftLetterForEmployee,
  showToast
}) => {
  // Dynamically resolve DDO Officer from employees list isDdo flag
  const ddoEmp = employees?.find(e => e.isDdo === true) || 
                 employees?.find(e => e.designation?.toLowerCase().includes('ddo')) || 
                 employees?.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
  const ddoOfficerName = ddoEmp?.fullName || 'ಹೆಚ್. ರವಿಕುಮಾರ್';
  const ddoOfficerDesig = ddoEmp?.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ';
  // Current month & year state (Default to March 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(2); // 0-indexed: 2 = March

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'calendar' | 'quotaTable'>('calendar');

  // Leave records list
  const [leaveRecords, setLeaveRecords] = useState<LeaveRequestRecord[]>(INITIAL_LEAVE_RECORDS);

  // Modal states
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] = useState<LeaveRequestRecord | null>(null);
  const [selectedEmployeeForQuotaEdit, setSelectedEmployeeForQuotaEdit] = useState<Employee | null>(null);
  const [customQuotaInput, setCustomQuotaInput] = useState<number>(180);

  // New leave form state
  const [formEmployeeKgid, setFormEmployeeKgid] = useState('');
  const [formLeaveType, setFormLeaveType] = useState<LeaveCategory>('ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formChildDetails, setFormChildDetails] = useState('');
  const [formOrderNumber, setFormOrderNumber] = useState('');

  // Identify female employees (or employees with childCareLeaveQuota)
  const femaleEmployees = useMemo(() => {
    return employees.filter(e => {
      const g = (e.gender || '').toLowerCase();
      return g.includes('female') || g.includes('ಮಹಿಳೆ') || e.fullName.includes('ಶ್ರೀಮತಿ') || e.childCareLeaveQuota !== undefined;
    });
  }, [employees]);

  // Compute stats
  const stats = useMemo(() => {
    const totalFemale = femaleEmployees.length || 24;
    const totalRecords = leaveRecords.length;
    
    // Total Child Care Leave days consumed
    const cclRecords = leaveRecords.filter(r => r.leaveType.includes('Child Care') || r.leaveType.includes('ಶಿಶುಪಾಲನ'));
    const totalCclDaysConsumed = cclRecords.reduce((sum, r) => sum + r.daysCount, 0);

    // Active in this month
    const curMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
    const activeThisMonth = leaveRecords.filter(r => {
      return (r.startDate <= `${curMonthStr}-31` && r.endDate >= `${curMonthStr}-01`);
    });

    const maternityCount = leaveRecords.filter(r => r.leaveType.includes('Maternity') || r.leaveType.includes('ಹೆರಿಗೆ')).length;

    return {
      totalFemale,
      totalRecords,
      totalCclDaysConsumed,
      activeThisMonthCount: activeThisMonth.length,
      maternityCount
    };
  }, [femaleEmployees, leaveRecords, currentYear, currentMonthIndex]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(2026); // Anchor to 2026 system year
    setCurrentMonthIndex(2); // March 2026
  };

  // Days in current month grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun
    const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonthIndex, 0).getDate();

    const days: Array<{
      dateNumber: number;
      fullDateString: string;
      isCurrentMonth: boolean;
      events: LeaveRequestRecord[];
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const m = currentMonthIndex === 0 ? 12 : currentMonthIndex;
      const y = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
      const fullDateString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateNumber: d,
        fullDateString,
        isCurrentMonth: false,
        events: []
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const fullDateString = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Find leaves covering this day
      const dayEvents = leaveRecords.filter(r => {
        if (selectedLeaveType !== 'all' && !r.leaveType.includes(selectedLeaveType)) return false;
        if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = r.employeeName.toLowerCase().includes(q) || r.kgidNumber.includes(q);
          if (!match) return false;
        }
        return fullDateString >= r.startDate && fullDateString <= r.endDate;
      });

      days.push({
        dateNumber: d,
        fullDateString,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    // Next month padding to fill complete weeks (multiple of 7)
    const remainingSlots = 7 - (days.length % 7);
    if (remainingSlots < 7) {
      for (let i = 1; i <= remainingSlots; i++) {
        const m = currentMonthIndex === 11 ? 1 : currentMonthIndex + 2;
        const y = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
        const fullDateString = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
          dateNumber: i,
          fullDateString,
          isCurrentMonth: false,
          events: []
        });
      }
    }

    return days;
  }, [currentYear, currentMonthIndex, leaveRecords, selectedLeaveType, selectedStatus, searchQuery]);

  // Calculate days difference between 2 dates
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  // Handle Sanction Leave Submit
  const handleSanctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeKgid) {
      showToast('ದಯವಿಟ್ಟು ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.');
      return;
    }
    if (!formStartDate || !formEndDate) {
      showToast('ದಯವಿಟ್ಟು ರಜೆ ಪ್ರಾರಂಭ ಮತ್ತು ಮುಕ್ತಾಯ ದಿನಾಂಕ ನಮೂದಿಸಿ.');
      return;
    }

    const diff = calculateDays(formStartDate, formEndDate);
    if (diff <= 0) {
      showToast('ದೋಷ: ರಜೆ ಮುಕ್ತಾಯ ದಿನಾಂಕವು ಪ್ರಾರಂಭ ದಿನಾಂಕಕ್ಕಿಂತ ಮುಂದಿರಬೇಕು.');
      return;
    }

    const emp = employees.find(e => e.kgidNumber === formEmployeeKgid);
    const empName = emp ? emp.fullName : 'ನೌಕರರು';
    const quota = emp?.childCareLeaveQuota ?? 180;
    const consumedSoFar = emp?.childCareLeaveAvailed ?? 0;
    const newConsumed = consumedSoFar + (formLeaveType.includes('Child Care') ? diff : 0);
    const remaining = Math.max(0, quota - newConsumed);

    const newRecord: LeaveRequestRecord = {
      id: `leave-${Date.now()}`,
      employeeId: emp?.id,
      employeeName: empName,
      kgidNumber: formEmployeeKgid,
      designation: emp?.designation || 'ಶಿಕ್ಷಕರು',
      gender: emp?.gender || 'Female',
      placeOfWork: emp?.placeOfWork || emp?.officeLocation || 'ಭದ್ರಾವತಿ',
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      daysCount: diff,
      status: 'Sanctioned',
      orderNumber: formOrderNumber.trim() || `ಸಂ: ಆ2/ಶಿ.ರಜೆ/${Math.floor(10 + Math.random() * 80)}/2026-27`,
      orderDate: new Date().toISOString().split('T')[0],
      reason: formReason.trim() || 'ಮಗುವಿನ ಪಾಲನೆ ಹಾಗೂ ಆರೈಕೆ ನಿಮಿತ್ತ ರಜೆ',
      quotaBefore: quota - consumedSoFar,
      quotaConsumed: diff,
      quotaRemaining: remaining,
      childDetails: formChildDetails.trim() || 'ಅರ್ಜಿಯಲ್ಲಿ ನಮೂದಿಸಿದ ಮಗು',
      sanctioningAuthority: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeaveRecords(prev => [newRecord, ...prev]);

    // Update employee object quota
    if (emp && onUpdateEmployee) {
      const updatedEmp: Employee = {
        ...emp,
        childCareLeaveQuota: quota,
        childCareLeaveAvailed: newConsumed,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      onUpdateEmployee(updatedEmp);
    }

    showToast(`ಶ್ರೀ/ಶ್ರೀಮತಿ ${empName} ರವರಿಗೆ ${diff} ದಿನಗಳ ರಜೆ ಯಶಸ್ವಿಯಾಗಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ!`);
    setIsSanctionModalOpen(false);

    // Reset form
    setFormEmployeeKgid('');
    setFormStartDate('');
    setFormEndDate('');
    setFormReason('');
    setFormChildDetails('');
    setFormOrderNumber('');
  };

  // Handle Edit Quota Submit
  const handleSaveCustomQuota = () => {
    if (!selectedEmployeeForQuotaEdit) return;
    if (customQuotaInput < 0) {
      showToast('ಕೋಟಾ ದಿನಗಳು ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು.');
      return;
    }

    if (onUpdateEmployee) {
      const updated: Employee = {
        ...selectedEmployeeForQuotaEdit,
        childCareLeaveQuota: customQuotaInput,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      onUpdateEmployee(updated);
    }

    showToast(`ಶ್ರೀ/ಶ್ರೀಮತಿ ${selectedEmployeeForQuotaEdit.fullName} ರವರ ಶಿಶುಪಾಲನ ರಜೆ ಕೋಟಾವನ್ನು ${customQuotaInput} ದಿನಗಳಿಗೆ ನವೀಕರಿಸಲಾಗಿದೆ.`);
    setSelectedEmployeeForQuotaEdit(null);
  };

  // Download Formatted Monthly Leave Report (CSV) for official records
  const handleDownloadReport = () => {
    // Current month boundaries
    const monthStart = new Date(currentYear, currentMonthIndex, 1);
    const monthEnd = new Date(currentYear, currentMonthIndex + 1, 0);
    const monthStartStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-01`;
    const monthEndStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

    // Filter records that intersect or are active in current month visualization
    const activeInMonth = leaveRecords.filter(r => {
      return (r.startDate <= monthEndStr && r.endDate >= monthStartStr);
    });

    // Target records: active in month if any, otherwise all records for comprehensive audit
    const recordsToExport = activeInMonth.length > 0 ? activeInMonth : leaveRecords;

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headerLines = [
      escapeCsv('ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ'),
      escapeCsv('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301'),
      escapeCsv(`ಅಧಿಕೃತ ಮಾಸಿಕ ರಜೆ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಕೋಟಾ ವರದಿ (Official Monthly Leave & Quota Visualization Report)`),
      escapeCsv(`ವರದಿ ತಿಂಗಳು & ವರ್ಷ: ${KANNADA_MONTHS[currentMonthIndex]} ${currentYear} | ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ: ${ddoOfficerName}, ${ddoOfficerDesig}, ಭದ್ರಾವತಿ`),
      escapeCsv(`ವರದಿ ಸೃಜಿಸಿದ ದಿನಾಂಕ & ಸಮಯ: ${new Date().toLocaleString('en-IN')} | ಅಧಿಕೃತ ಕಡತ ದಾಖಲೆ`),
      '' // blank row
    ];

    const columnHeaders = [
      'ಕ್ರಮ ಸಂಖ್ಯೆ (Sl No)',
      'ನೌಕರರ ಹೆಸರು (Employee Name)',
      'ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID No)',
      'ಹುದ್ದೆ (Designation)',
      'ಕರ್ತವ್ಯ ಶಾಲೆ / ಕಛೇರಿ (School / Workplace)',
      'ಲಿಂಗ (Gender)',
      'ರಜೆ ಪ್ರಕಾರ (Leave Type)',
      'ರಜೆ ಪ್ರಾರಂಭ ದಿನಾಂಕ (From Date)',
      'ರಜೆ ಮುಕ್ತಾಯ ದಿನಾಂಕ (To Date)',
      'ಒಟ್ಟು ರಜಾ ದಿನಗಳು (Total Leave Days)',
      'ಪ್ರಸ್ತುತ ತಿಂಗಳಲ್ಲಿ ಬರುವ ದಿನಗಳು (Days Active In Month)',
      'ಮಂಜೂರಾತಿ ಸ್ಥಿತಿ (Status)',
      'ಸಕ್ಷಮ ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂಖ್ಯೆ (Sanction Order No)',
      'ಆದೇಶ ದಿನಾಂಕ (Order Date)',
      'ರಜೆಯ ಉದ್ದೇಶ / ಕಾರಣ (Reason / Purpose)',
      'ಮಗುವಿನ ವಿವರ / ವಯಸ್ಸು (Child Details / Age)',
      'ರಜೆ ಮುನ್ನ ಶಿಲ್ಕು (Quota Before)',
      'ಮಂಜೂರಾದ ರಜೆ (Days Consumed)',
      'ಉಳಿದ ರಜೆ ಶಿಲ್ಕು / 180 ದಿನಗಳು (Remaining Balance)',
      'ಸಕ್ಷಮ ಮಂಜೂರಾತಿ ಪ್ರಾಧಿಕಾರ (Sanctioning Authority)'
    ];

    let totalDaysInMonth = 0;
    let totalOverallDays = 0;

    const rows = recordsToExport.map((r, i) => {
      // Calculate days falling precisely in this month
      const rStart = new Date(Math.max(new Date(r.startDate).getTime(), monthStart.getTime()));
      const rEnd = new Date(Math.min(new Date(r.endDate).getTime(), monthEnd.getTime()));
      let daysInMonth = 0;
      if (rStart <= rEnd) {
        daysInMonth = Math.round((rEnd.getTime() - rStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      totalDaysInMonth += daysInMonth;
      totalOverallDays += r.daysCount;

      return [
        i + 1,
        escapeCsv(r.employeeName),
        r.kgidNumber,
        escapeCsv(r.designation),
        escapeCsv(r.placeOfWork || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ'),
        escapeCsv(r.gender || 'Female'),
        escapeCsv(r.leaveType),
        r.startDate,
        r.endDate,
        r.daysCount,
        daysInMonth,
        escapeCsv(r.status === 'Sanctioned' ? 'ಮಂಜೂರಾಗಿದೆ (Sanctioned)' : r.status === 'Pending Approval' ? 'ಅನುಮೋದನೆ ಬಾಕಿ (Pending)' : 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ (Completed)'),
        escapeCsv(r.orderNumber || 'ಸಂ: ಆ2/ಶಿ.ರಜೆ/2026-27'),
        r.orderDate || r.createdAt || '-',
        escapeCsv(r.reason),
        escapeCsv(r.childDetails || 'ಮಗುವಿನ ಆರೈಕೆ'),
        r.quotaBefore ?? 180,
        r.quotaConsumed ?? r.daysCount,
        r.quotaRemaining ?? Math.max(0, 180 - (r.quotaConsumed || 0)),
        escapeCsv(`${ddoOfficerName}, ${ddoOfficerDesig}, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು`)
      ].join(',');
    });

    // Summary certification rows
    const summaryRows = [
      '',
      [escapeCsv('ಒಟ್ಟು ದಾಖಲೆಗಳ ಸಂಖ್ಯೆ:'), recordsToExport.length].join(','),
      [escapeCsv('ಪ್ರಸ್ತುತ ತಿಂಗಳಲ್ಲಿ ಒಟ್ಟು ರಜಾ ದಿನಗಳು:'), totalDaysInMonth].join(','),
      [escapeCsv('ಒಟ್ಟು ರಜಾ ದಿನಗಳ ಮೊತ್ತ:'), totalOverallDays].join(','),
      '',
      escapeCsv('ಪ್ರಮಾಣೀಕರಣ: ಈ ಮೇಲ್ಕಂಡ ಮಾಸಿಕ ರಜೆ ಹಾಗೂ ಶಿಶುಪಾಲನ/ಹೆರಿಗೆ ರಜೆ ವಿವರಗಳನ್ನು ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಕಡತಗಳ ಅನ್ವಯ ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.'),
      escapeCsv(`ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಸಹಿ: (${ddoOfficerName}), ${ddoOfficerDesig}, ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು.`)
    ];

    const csvBody = [
      ...headerLines,
      columnHeaders.join(','),
      ...rows,
      ...summaryRows
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvBody;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bhadravathi_BEO_Monthly_Leave_Report_${currentYear}_${currentMonthIndex + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`ಮಾಸಿಕ ರಜೆ ವರದಿ (Download Report) ಅಧಿಕೃತ CSV ಕಡತವಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (${recordsToExport.length} ನೌಕರರ ದಾಖಲೆಗಳು).`);
  };

  // Export CSV (Quick Data dump)
  const handleExportCsv = () => {
    handleDownloadReport();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-white border-3 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] flex items-center justify-center shrink-0">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded font-mono-code">
                  KCSR LEAVE RULE 135B & MATERNITY
                </span>
                <span className="text-xs font-bold text-stone-500 font-kannada">ಮಾಸಿಕ ರಜೆ ಕೋಟಾ ನಿರ್ವಹಣೆ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2b2b2b] font-kannada tracking-tight mt-0.5">
                ರಜೆ ಕ್ಯಾಲೆಂಡರ್ & ಕೋಟಾ ನಿರ್ವಹಣೆ (Leave Calendar & Quota)
              </h1>
              <p className="text-xs text-stone-600 font-kannada mt-1 max-w-2xl">
                ಮಹಿಳಾ ನೌಕರರ <strong>ಶಿಶುಪಾಲನ ರಜೆ (ಒಟ್ಟು 180 ದಿನಗಳು)</strong>, <strong>ಹೆರಿಗೆ ರಜೆ (180 ದಿನಗಳು)</strong> ಹಾಗೂ ಗಳಿಕೆ ರಜೆಗಳ ಮಾಸಿಕ ಕ್ಯಾಲೆಂಡರ್, ಮುಂಬರುವ ರಜೆಗಳ ಪೂರ್ವನಿಯೋಜನೆ ಮತ್ತು ಉಳಿದ ಕೋಟಾ ಲೆಕ್ಕಾಚಾರ.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-add-leave-sanction"
              onClick={() => setIsSanctionModalOpen(true)}
              className="px-4 py-2 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-lg text-xs font-black border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] transition-all flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Plus className="w-4 h-4" />
              <span>+ ಹೊಸ ರಜೆ ಮಂಜೂರಾತಿ (Sanction Leave)</span>
            </button>

            <button
              id="btn-download-monthly-report"
              onClick={handleDownloadReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] hover:shadow-[3px_3px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer transition-all font-kannada"
              title="ಪ್ರಸ್ತುತ ಮಾಸಿಕ ರಜೆ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಕೋಟಾ ವರದಿಯನ್ನು CSV ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download Monthly Official Leave Report CSV)"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>Download Report (ವರದಿ ಡೌನ್‌ಲೋಡ್)</span>
            </button>

            <button
              id="btn-print-leave-report"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#2b2b2b] hover:bg-stone-800 text-white rounded-lg text-xs font-bold border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-1.5 cursor-pointer transition-all font-kannada"
            >
              <Printer className="w-4 h-4" />
              <span>ಮುದ್ರಿಸಿ</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-rose-50/80 border-2 border-[#2b2b2b] rounded-lg p-3 shadow-[2px_2px_0px_#2b2b2b]">
            <span className="text-[11px] font-bold text-rose-900 font-kannada block">ಒಟ್ಟು ಮಹಿಳಾ ನೌಕರರು</span>
            <div className="text-2xl font-black text-rose-950 font-mono-code mt-0.5">
              {stats.totalFemale}
            </div>
            <span className="text-[10px] text-rose-700 font-kannada">ಶಿಶುಪಾಲನ ರಜೆಗೆ ಅರ್ಹರು</span>
          </div>

          <div className="bg-amber-50/80 border-2 border-[#2b2b2b] rounded-lg p-3 shadow-[2px_2px_0px_#2b2b2b]">
            <span className="text-[11px] font-bold text-amber-900 font-kannada block">ಬಳಸಿದ ಶಿಶುಪಾಲನ ರಜೆ</span>
            <div className="text-2xl font-black text-amber-950 font-mono-code mt-0.5">
              {stats.totalCclDaysConsumed} <span className="text-xs font-normal font-kannada">ದಿನಗಳು</span>
            </div>
            <span className="text-[10px] text-amber-700 font-kannada">ಒಟ್ಟು 180 ದಿನಗಳ ಕೋಟಾದಿಂದ</span>
          </div>

          <div className="bg-emerald-50/80 border-2 border-[#2b2b2b] rounded-lg p-3 shadow-[2px_2px_0px_#2b2b2b]">
            <span className="text-[11px] font-bold text-emerald-900 font-kannada block">ಪ್ರಸ್ತುತ ಮಾಹೆಯಲ್ಲಿ ರಜೆ</span>
            <div className="text-2xl font-black text-emerald-950 font-mono-code mt-0.5">
              {stats.activeThisMonthCount} <span className="text-xs font-normal font-kannada">ಸಿಬ್ಬಂದಿ</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-kannada">{KANNADA_MONTHS[currentMonthIndex].split(' ')[0]} ಮಾಹೆಯ ಚಾಲ್ತಿ ರಜೆ</span>
          </div>

          <div className="bg-purple-50/80 border-2 border-[#2b2b2b] rounded-lg p-3 shadow-[2px_2px_0px_#2b2b2b]">
            <span className="text-[11px] font-bold text-purple-900 font-kannada block">ಹೆರಿಗೆ ರಜೆ (Maternity)</span>
            <div className="text-2xl font-black text-purple-950 font-mono-code mt-0.5">
              {stats.maternityCount} <span className="text-xs font-normal font-kannada">ಪ್ರಕರಣಗಳು</span>
            </div>
            <span className="text-[10px] text-purple-700 font-kannada">180 ದಿನಗಳ ಸಂಪೂರ್ಣ ರಜೆ</span>
          </div>
        </div>
      </div>

      {/* Main View Toggle & Filters */}
      <div className="bg-white border-3 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border-2 border-[#2b2b2b]">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded text-xs font-black transition-all cursor-pointer font-kannada flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-[#2b2b2b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>ಕ್ಯಾಲೆಂಡರ್ ಗ್ರಿಡ್ (Calendar View)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quotaTable')}
            className={`px-3.5 py-1.5 rounded text-xs font-black transition-all cursor-pointer font-kannada flex items-center gap-1.5 ${
              activeTab === 'quotaTable'
                ? 'bg-[#2b2b2b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>ಮಹಿಳಾ ನೌಕರರ ಕೋಟಾ ಕೋಷ್ಟಕ (180 Days Quota Roster)</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ನೌಕರರ ಹೆಸರು / KGID ಹುಡುಕಿ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] bg-amber-50/40 text-[#2b2b2b] focus:outline-none focus:ring-2 focus:ring-rose-500 font-kannada font-medium"
            />
          </div>

          {/* Leave Type Filter */}
          <select
            value={selectedLeaveType}
            onChange={e => setSelectedLeaveType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] font-bold font-kannada cursor-pointer"
          >
            <option value="all">ಎಲ್ಲಾ ರಜೆ ಪ್ರಕಾರಗಳು</option>
            <option value="Child Care">ಶಿಶುಪಾಲನ ರಜೆ (CCL)</option>
            <option value="Maternity">ಹೆರಿಗೆ ರಜೆ (Maternity)</option>
            <option value="Earned">ಗಳಿಕೆ ರಜೆ (Earned)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] font-bold font-kannada cursor-pointer"
          >
            <option value="all">ಎಲ್ಲಾ ಸ್ಥಿತಿ</option>
            <option value="Sanctioned">ಮಂಜೂರಾದವು (Sanctioned)</option>
            <option value="Pending Approval">ಅನುಮೋದನೆ ಬಾಕಿ (Pending)</option>
            <option value="Completed">ಮುಕ್ತಾಯಗೊಂಡವು (Completed)</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {activeTab === 'calendar' && (
        <div className="bg-white border-3 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] rounded-xl overflow-hidden">
          {/* Calendar Header Navigation */}
          <div className="p-4 bg-[#fffbf2] border-b-3 border-[#2b2b2b] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-lg bg-white hover:bg-stone-100 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer"
                title="ಹಿಂದಿನ ತಿಂಗಳು"
              >
                <ChevronLeft className="w-4 h-4 text-[#2b2b2b]" />
              </button>

              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-black text-[#2b2b2b] font-kannada flex items-center gap-2">
                  <span>{KANNADA_MONTHS[currentMonthIndex]}</span>
                  <span className="font-mono-code text-rose-600 font-bold">{currentYear}</span>
                </h2>
                <span className="text-[11px] text-stone-600 font-kannada">
                  ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯ • ರಜೆ ಕ್ಯಾಲೆಂಡರ್
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-white hover:bg-stone-100 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer"
                title="ಮುಂದಿನ ತಿಂಗಳು"
              >
                <ChevronRight className="w-4 h-4 text-[#2b2b2b]" />
              </button>
            </div>

            {/* Quick Month Picker & Today button */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonthIndex}
                onChange={e => setCurrentMonthIndex(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] font-kannada cursor-pointer shadow-[2px_2px_0px_#2b2b2b]"
              >
                {KANNADA_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={e => setCurrentYear(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] font-mono-code cursor-pointer shadow-[2px_2px_0px_#2b2b2b]"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>

              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-3 py-1.5 text-xs font-bold text-[#2b2b2b] bg-amber-200 hover:bg-amber-300 rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer font-kannada"
              >
                ಇಂದಿಗೆ (Today)
              </button>

              <button
                type="button"
                id="btn-download-calendar-report"
                onClick={handleDownloadReport}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer font-kannada flex items-center gap-1.5"
                title="ಈ ಮಾಸಿಕ ಕ್ಯಾಲೆಂಡರ್ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download Report CSV)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Calendar Weekday Names */}
          <div className="grid grid-cols-7 border-b-2 border-[#2b2b2b] bg-stone-100 text-center text-xs font-black text-[#2b2b2b] divide-x-2 divide-[#2b2b2b]">
            {KANNADA_WEEKDAYS.map((wd, i) => (
              <div key={i} className={`py-2 px-1 font-kannada ${i === 0 ? 'bg-rose-100/60 text-rose-900' : ''}`}>
                <span className="hidden sm:inline">{wd.full}</span>
                <span className="sm:hidden">{wd.short}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x-2 divide-y-2 divide-[#2b2b2b]/30 bg-stone-200/40">
            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const isSunday = (idx % 7) === 0;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[125px] p-1.5 flex flex-col justify-between transition-colors ${
                    !cell.isCurrentMonth
                      ? 'bg-stone-100/50 text-stone-400'
                      : isSunday
                      ? 'bg-rose-50/40'
                      : 'bg-white hover:bg-amber-50/30'
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono-code font-black px-1.5 py-0.5 rounded ${
                        cell.isCurrentMonth
                          ? isSunday
                            ? 'bg-rose-200 text-rose-950 font-bold'
                            : 'bg-stone-100 text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.dateNumber}
                    </span>

                    {hasEvents && (
                      <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-1 rounded-full">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Leave Event Pills */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] scrollbar-none">
                    {cell.events.map((ev, evIdx) => {
                      const isCcl = ev.leaveType.includes('Child Care') || ev.leaveType.includes('ಶಿಶುಪಾಲನ');
                      const isMaternity = ev.leaveType.includes('Maternity') || ev.leaveType.includes('ಹೆರಿಗೆ');

                      return (
                        <div
                          key={evIdx}
                          onClick={() => setSelectedRecordForView(ev)}
                          className={`text-[10px] font-bold p-1 rounded border leading-tight cursor-pointer transition-transform hover:scale-[1.02] ${
                            isCcl
                              ? 'bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100'
                              : isMaternity
                              ? 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100'
                              : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                          }`}
                          title={`${ev.employeeName} - ${ev.leaveType} (${ev.startDate} to ${ev.endDate})`}
                        >
                          <div className="flex items-center gap-1 truncate font-kannada">
                            {isCcl ? (
                              <Baby className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                            ) : (
                              <HeartHandshake className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                            )}
                            <span className="truncate">{ev.employeeName}</span>
                          </div>
                          <div className="text-[9px] text-stone-600 font-mono-code truncate">
                            {ev.daysCount} ದಿನ ({ev.status === 'Sanctioned' ? 'ಮಂಜೂರು' : 'ಬಾಕಿ'})
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty cell spacer */}
                  <div className="text-[9px] text-stone-400 font-mono text-right">
                    {cell.isCurrentMonth && !hasEvents && (
                      <span className="opacity-0 group-hover:opacity-100">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend Footer */}
          <div className="p-3 bg-[#fffbf2] border-t-2 border-[#2b2b2b] flex flex-wrap items-center justify-between gap-3 text-xs font-kannada">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-[#2b2b2b]">ಸೂಚ್ಯಂಕ (Legend):</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-200 border border-rose-400 inline-block" />
                <span className="font-medium text-rose-950">ಶಿಶುಪಾಲನ ರಜೆ (CCL - ಗರಿಷ್ಠ 180 ದಿನಗಳು)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-200 border border-purple-400 inline-block" />
                <span className="font-medium text-purple-950">ಹೆರಿಗೆ ರಜೆ (Maternity - 180 ದಿನಗಳು)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400 inline-block" />
                <span className="font-medium text-emerald-950">ಗಳಿಕೆ ರಜೆ (Earned Leave)</span>
              </div>
            </div>

            <span className="text-[11px] text-stone-600 font-mono-code font-bold">
              KCSR Rule 135B Compliant
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: 180 DAYS QUOTA MANAGEMENT TABLE (ಮಹಿಳಾ ನೌಕರರ ಕೋಟಾ ಕೋಷ್ಟಕ) */}
      {activeTab === 'quotaTable' && (
        <div className="bg-white border-3 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] rounded-xl overflow-hidden space-y-0">
          <div className="p-4 bg-[#fffbf2] border-b-3 border-[#2b2b2b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#2b2b2b] font-kannada">
                ಮಹಿಳಾ ನೌಕರರ ಶಿಶುಪಾಲನ ರಜೆ ಕೋಟಾ ನಿರ್ವಹಣೆ (180 Days Child Care Leave Quota)
              </h2>
              <p className="text-xs text-stone-600 font-kannada mt-0.5">
                ಸರ್ಕಾರದ ಆದೇಶಾನುಸಾರ ಮಹಿಳಾ ನೌಕರರಿಗೆ ಒಟ್ಟು 180 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜೆ ಲಭ್ಯವಿದ್ದು, ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಕೋಟಾವನ್ನು ನವೀಕರಿಸಬಹುದು.
              </p>
            </div>
            <button
              onClick={() => setIsSanctionModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-lg text-xs font-black border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] cursor-pointer font-kannada"
            >
              + ಹೊಸ ರಜೆ ಮಂಜೂರಾತಿ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-kannada">
              <thead>
                <tr className="bg-stone-100 border-b-2 border-[#2b2b2b] text-[#2b2b2b] font-black text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">ಕ್ರ.ಸಂ</th>
                  <th className="py-3 px-3">ನೌಕರರ ವಿವರ & ಹುದ್ದೆ</th>
                  <th className="py-3 px-3">ಕೆ.ಜಿ.ಐ.ಡಿ</th>
                  <th className="py-3 px-3">ಶಾಲೆ / ಕರ್ತವ್ಯ ಸ್ಥಳ</th>
                  <th className="py-3 px-3 text-center">ಒಟ್ಟು ಕೋಟಾ</th>
                  <th className="py-3 px-3 text-center">ಬಳಸಿದ ದಿನಗಳು</th>
                  <th className="py-3 px-3 text-center">ಉಳಿದ ದಿನಗಳು</th>
                  <th className="py-3 px-3 min-w-[140px]">ಕೋಟಾ ಪ್ರಗತಿ (Quota Meter)</th>
                  <th className="py-3 px-3 text-center min-w-[160px]">ಕ್ರಮಗಳು (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-stone-200">
                {femaleEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-500 font-bold">
                      ಯಾವುದೇ ಮಹಿಳಾ ನೌಕರರ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                    </td>
                  </tr>
                ) : (
                  femaleEmployees.map((emp, idx) => {
                    const totalQuota = emp.childCareLeaveQuota ?? 180;
                    
                    // Count consumed days from actual leave records
                    const empRecords = leaveRecords.filter(r => r.kgidNumber === emp.kgidNumber && (r.leaveType.includes('Child Care') || r.leaveType.includes('ಶಿಶುಪಾಲನ')));
                    const daysFromRecords = empRecords.reduce((sum, r) => sum + r.daysCount, 0);
                    const consumedDays = emp.childCareLeaveAvailed ?? daysFromRecords;
                    const remainingDays = Math.max(0, totalQuota - consumedDays);
                    const pct = Math.min(100, Math.round((consumedDays / totalQuota) * 100));

                    return (
                      <tr key={emp.id || idx} className="hover:bg-amber-50/50 transition-colors font-medium">
                        <td className="py-3 px-3 text-center font-bold bg-stone-50">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900 text-sm">{emp.fullName}</div>
                          <div className="text-[11px] text-stone-600">{emp.designation}</div>
                        </td>
                        <td className="py-3 px-3 font-mono-code font-bold text-sky-900">
                          {emp.kgidNumber || '-'}
                        </td>
                        <td className="py-3 px-3 text-stone-700">
                          {emp.placeOfWork || emp.officeLocation || 'ಭದ್ರಾವತಿ'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono-code font-black text-rose-950 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                            {totalQuota} ದಿನ
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono-code font-bold text-amber-800">
                          {consumedDays} ದಿನ
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono-code font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                            {remainingDays} ದಿನ
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden border border-stone-300">
                            <div
                              className={`h-full transition-all ${
                                pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono-code mt-0.5 block text-right">
                            {pct}% ಬಳಸಲಾಗಿದೆ ({consumedDays}/{totalQuota})
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployeeForQuotaEdit(emp);
                                setCustomQuotaInput(totalQuota);
                              }}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-[#2b2b2b] rounded text-[11px] font-bold shadow-[1px_1px_0px_#2b2b2b] transition-all cursor-pointer"
                              title="ಶಿಶುಪಾಲನ ರಜೆ ಕೋಟಾ ದಿನಗಳನ್ನು ಬದಲಿಸಿ"
                            >
                              <Edit3 className="w-3 h-3 text-stone-700 inline mr-1" />
                              <span>ಕೋಟಾ ಬದಲಿಸಿ</span>
                            </button>

                            {onDraftLetterForEmployee && (
                              <button
                                type="button"
                                onClick={() => onDraftLetterForEmployee(emp)}
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 rounded text-[11px] font-bold transition-all cursor-pointer"
                                title="ಈ ನೌಕರರಿಗೆ ಪತ್ರ ಸೃಜಿಸಿ"
                              >
                                <FileText className="w-3 h-3 inline mr-1" />
                                <span>ಪತ್ರ</span>
                              </button>
                            )}

                            {onOpenOrderForEmployee && (
                              <button
                                type="button"
                                onClick={() => onOpenOrderForEmployee(emp.kgidNumber || '')}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 rounded text-[11px] font-bold transition-all cursor-pointer"
                                title="ಈ ನೌಕರರಿಗೆ ರಜೆ ಆದೇಶ ಹೊರಡಿಸಿ"
                              >
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                <span>ಆದೇಶ</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SANCTION NEW LEAVE (+ ಹೊಸ ರಜೆ ಅರ್ಜಿ / ಮಂಜೂರಾತಿ) */}
      {isSanctionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-3 border-[#2b2b2b] shadow-[10px_10px_0px_#2b2b2b] rounded-xl max-w-xl w-full p-6 space-y-4 font-kannada my-8">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#2b2b2b]">
                    ಹೊಸ ರಜೆ ಮಂಜೂರಾತಿ (Sanction Leave)
                  </h3>
                  <p className="text-xs text-stone-500">
                    ಶಿಶುಪಾಲನ ರಜೆ (180 ದಿನಗಳು) / ಹೆರಿಗೆ ರಜೆ ಅಧಿಕೃತ ಮಂಜೂರಾತಿ ನಮೂನೆ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSanctionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSanctionSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-stone-900 mb-1">
                  ನೌಕರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (Select Employee) *
                </label>
                <select
                  value={formEmployeeKgid}
                  onChange={e => setFormEmployeeKgid(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-amber-50/30 text-stone-900 font-bold"
                >
                  <option value="">-- ನೌಕರರನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಹೆಸರು / ಕೆಜಿಐಡಿ) --</option>
                  {employees.map((e, idx) => (
                    <option key={idx} value={e.kgidNumber}>
                      {e.fullName} ({e.designation}) - KGID: {e.kgidNumber || '-'} [{e.gender || 'Female'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block font-bold text-stone-900 mb-1">
                  ರಜೆ ಪ್ರಕಾರ (Leave Type) *
                </label>
                <select
                  value={formLeaveType}
                  onChange={e => setFormLeaveType(e.target.value as LeaveCategory)}
                  required
                  className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900 font-bold"
                >
                  <option value="ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave)">ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave - ಗರಿಷ್ಠ 180 ದಿನಗಳು)</option>
                  <option value="ಹೆರಿಗೆ ರಜೆ (Maternity Leave)">ಹೆರಿಗೆ ರಜೆ (Maternity Leave - 180 ದಿನಗಳು)</option>
                  <option value="ಗಳಿಕೆ ರಜೆ (Earned Leave)">ಗಳಿಕೆ ರಜೆ (Earned Leave)</option>
                  <option value="ಪರಿವರ್ತಿತ ರಜೆ (Commuted Leave)">ಪರಿವರ್ತಿತ / ವೈದ್ಯಕೀಯ ರಜೆ (Commuted Leave)</option>
                  <option value="ಸಾಂದರ್ಭಿಕ ರಜೆ (Casual Leave)">ಸಾಂದರ್ಭಿಕ ರಜೆ (Casual Leave)</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 mb-1">
                    ರಜೆ ಪ್ರಾರಂಭ ದಿನಾಂಕ (Start Date) *
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900 font-bold font-mono-code"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-900 mb-1">
                    ರಜೆ ಮುಕ್ತಾಯ ದಿನಾಂಕ (End Date) *
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900 font-bold font-mono-code"
                  />
                </div>
              </div>

              {/* Days count preview */}
              {formStartDate && formEndDate && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 font-bold flex items-center justify-between">
                  <span>ಒಟ್ಟು ರಜೆ ದಿನಗಳು (Total Days):</span>
                  <span className="font-mono-code text-sm text-rose-900 font-black">
                    {calculateDays(formStartDate, formEndDate)} ದಿನಗಳು
                  </span>
                </div>
              )}

              {/* Child Details for CCL */}
              {formLeaveType.includes('Child Care') && (
                <div>
                  <label className="block font-bold text-stone-900 mb-1">
                    ಮಗುವಿನ ವಿವರ (Child Name & Age) *
                  </label>
                  <input
                    type="text"
                    placeholder="ಉದಾ: ಮಗುವಿನ ಹೆಸರು: ಅನುಷ್ಕಾ (ವಯಸ್ಸು 12 ವರ್ಷ, ಜನನ ದಿನಾಂಕ: 15-08-2014)"
                    value={formChildDetails}
                    onChange={e => setFormChildDetails(e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    * ನಿಯಮಾನುಸಾರ ಮಗುವಿನ ವಯಸ್ಸು 18 ವರ್ಷದೊಳಗಿರಬೇಕು.
                  </span>
                </div>
              )}

              {/* Order Number & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-900 mb-1">
                    ಆದೇಶ ಸಂಖ್ಯೆ (Sanction Order No.)
                  </label>
                  <input
                    type="text"
                    placeholder="ಸಂ: ಆ2/ಶಿ.ರಜೆ/2026-27"
                    value={formOrderNumber}
                    onChange={e => setFormOrderNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900 font-mono-code font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-900 mb-1">
                    ರಜೆ ಕಾರಣ (Reason / Purpose)
                  </label>
                  <input
                    type="text"
                    placeholder="ಉದಾ: ಮಗುವಿನ ಪರೀಕ್ಷಾ ಆರೈಕೆ / ಚಿಕಿತ್ಸೆ"
                    value={formReason}
                    onChange={e => setFormReason(e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-[#2b2b2b] bg-white text-stone-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSanctionModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-lg text-xs font-black border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] cursor-pointer"
                >
                  ರಜೆ ಮಂಜೂರು ಮಾಡಿ (Sanction Leave)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOM QUOTA MODAL (ಕೋಟಾ ದಿನಗಳ ಬದಲಾವಣೆ - 180 Days) */}
      {selectedEmployeeForQuotaEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2b2b2b] shadow-[10px_10px_0px_#2b2b2b] rounded-xl max-w-md w-full p-6 space-y-4 font-kannada">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#2b2b2b]">
                  ಶಿಶುಪಾಲನ ರಜೆ ಒಟ್ಟು ಕೋಟಾ ಬದಲಾವಣೆ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForQuotaEdit(null)}
                className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
                <div className="font-bold text-stone-900 text-sm">
                  {selectedEmployeeForQuotaEdit.fullName}
                </div>
                <div className="text-stone-600">
                  {selectedEmployeeForQuotaEdit.designation} • KGID: {selectedEmployeeForQuotaEdit.kgidNumber}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-900 mb-1">
                  ಒಟ್ಟು ಅನುಮತಿಸಲಾದ ಕೋಟಾ ದಿನಗಳು (Total Allowed Days) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={customQuotaInput}
                  onChange={e => setCustomQuotaInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border-2 border-[#2b2b2b] bg-white font-mono-code text-base font-black text-rose-900"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  * ಸರ್ಕಾರದ ನಿಯಮಾನುಸಾರ ಮಾನದಂಡದ ಮಿತಿ 180 ದಿನಗಳು (Default 180 days). ವಿಶೇಷ ಪ್ರಕರಣಗಳಲ್ಲಿ ವಿನಾಯಿತಿ ನೀಡಬಹುದು.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmployeeForQuotaEdit(null)}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] cursor-pointer"
              >
                ರದ್ದುಮಾಡಿ
              </button>

              <button
                type="button"
                onClick={handleSaveCustomQuota}
                className="px-4 py-1.5 bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] rounded-lg text-xs font-black border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] cursor-pointer"
              >
                ಕೋಟಾ ಉಳಿಸಿ (Save Quota)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW LEAVE RECORD DETAILS */}
      {selectedRecordForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2b2b2b] shadow-[10px_10px_0px_#2b2b2b] rounded-xl max-w-lg w-full p-6 space-y-4 font-kannada">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-rose-100 text-rose-700">
                  <CalendarCheck2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#2b2b2b]">
                    ರಜೆ ಮಂಜೂರಾತಿ ವಿವರ (Leave Details)
                  </h3>
                  <span className="text-[11px] font-mono-code text-stone-500">
                    {selectedRecordForView.orderNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForView(null)}
                className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-300">
                <div className="font-bold text-stone-900 text-sm">{selectedRecordForView.employeeName}</div>
                <div className="text-stone-600 font-medium">
                  {selectedRecordForView.designation} • KGID: {selectedRecordForView.kgidNumber}
                </div>
                <div className="text-stone-500 text-[11px] mt-0.5">
                  ಸ್ಥಳ: {selectedRecordForView.placeOfWork || 'ಭದ್ರಾವತಿ'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-800">
                <div className="p-2 bg-stone-50 rounded border">
                  <span className="text-stone-500 block text-[10px]">ರಜೆ ಪ್ರಕಾರ:</span>
                  <span className="font-bold text-rose-900">{selectedRecordForView.leaveType}</span>
                </div>
                <div className="p-2 bg-stone-50 rounded border">
                  <span className="text-stone-500 block text-[10px]">ರಜೆ ಅವಧಿ:</span>
                  <span className="font-bold font-mono-code">{selectedRecordForView.daysCount} ದಿನಗಳು</span>
                </div>
                <div className="p-2 bg-stone-50 rounded border">
                  <span className="text-stone-500 block text-[10px]">ಪ್ರಾರಂಭ ದಿನಾಂಕ:</span>
                  <span className="font-bold font-mono-code">{selectedRecordForView.startDate}</span>
                </div>
                <div className="p-2 bg-stone-50 rounded border">
                  <span className="text-stone-500 block text-[10px]">ಮುಕ್ತಾಯ ದಿನಾಂಕ:</span>
                  <span className="font-bold font-mono-code">{selectedRecordForView.endDate}</span>
                </div>
              </div>

              {selectedRecordForView.childDetails && (
                <div className="p-2.5 bg-rose-50/60 rounded border border-rose-200">
                  <span className="text-rose-900 font-bold block text-[11px]">ಮಗುವಿನ ವಿವರ:</span>
                  <span className="text-stone-800">{selectedRecordForView.childDetails}</span>
                </div>
              )}

              <div className="p-2.5 bg-stone-50 rounded border">
                <span className="text-stone-500 block text-[10px]">ರಜೆಯ ಉದ್ದೇಶ / ಕಾರಣ:</span>
                <span className="text-stone-800 font-medium">{selectedRecordForView.reason}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded border border-amber-200 font-mono-code">
                <span className="font-bold text-stone-700 text-[11px] font-kannada">ಉಳಿದ ಕೋಟಾ:</span>
                <span className="font-black text-rose-900 text-sm">
                  {selectedRecordForView.quotaRemaining} ದಿನಗಳು ಬಾಕಿ
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-between gap-2">
              {onDraftLetterForEmployee && (
                <button
                  type="button"
                  onClick={() => {
                    const emp = employees.find(e => e.kgidNumber === selectedRecordForView.kgidNumber);
                    if (emp) onDraftLetterForEmployee(emp);
                    setSelectedRecordForView(null);
                  }}
                  className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold border border-amber-300 cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ಪತ್ರ ತಯಾರಿಸಿ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedRecordForView(null)}
                className="px-4 py-1.5 bg-[#2b2b2b] hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer ml-auto"
              >
                ಮುಚ್ಚಿ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
