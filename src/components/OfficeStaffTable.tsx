import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Download,
  Filter,
  Briefcase,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Employee } from '../types';
import { CSV_STAFF_MEMBERS } from '../data/csvEmployeesData';
import { YearsOfServiceBadge } from './EmployeeRosterView';

export const SEED_OFFICE_STAFF: Employee[] = [
  {
    id: 'emp-bhd-beo-narayanappa',
    employeeCode: 'BHD-BEO-001',
    kgidNumber: '100101',
    basicPay: 93250,
    payScale: '74400-1900-82000-2100-90400-2400-97600-2700-108400',
    fullName: 'ಸುರೇಶ್ ಕೆ.ಸಿ. (Suresh K.C.)',
    designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು (BEO) & ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ',
    email: 'beo.bhadravathi@karnataka.gov.in',
    phone: '+91 94489 91201',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Director / HOD',
    joiningDate: '2004-08-10',
    incrementMonth: 'July',
    qualifications: 'M.A., M.Ed., KES (ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಸೇವೆ)',
    notes: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (PIO). ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ತಾಲೂಕಿನ ಮುಖ್ಯಸ್ಥರು.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-supt-manjunath',
    employeeCode: 'BHD-OFF-002',
    kgidNumber: '184920',
    basicPay: 52650,
    payScale: '43100-1100-46400-1250-53900-1450-62600-1650-70850',
    fullName: 'ಹೆಚ್.ಎಸ್. ಮಂಜುನಾಥ (H.S. Manjunatha)',
    designation: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Office Superintendent)',
    section: 'Accounts & Grants',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'manjunath.hs@karnataka.gov.in',
    phone: '+91 94481 44520',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Superintendent',
    joiningDate: '2009-11-14',
    incrementMonth: 'January',
    qualifications: 'B.Com, SAS (Part-I & II)',
    notes: 'ಕಛೇರಿ ಆಡಳಿತ, ಸಿಬ್ಬಂದಿ ಹಾಗೂ ಲೆಕ್ಕಪತ್ರ ಶಾಖೆಯ ಒಟ್ಟಾರೆ ಮೇಲ್ವಿಚಾರಣೆ.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-ramesh',
    employeeCode: 'BHD-OFF-003',
    kgidNumber: '219402',
    basicPay: 43500,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    fullName: 'ರಮೇಶ್ ಕೆ. ಎನ್. (Ramesh K.N.)',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA) - ಆ2 ಸ.ಪ್ರಾ.ಶಿ',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'ramesh.kn@karnataka.gov.in',
    phone: '+91 94480 23145',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Clerk / Assistant',
    joiningDate: '2012-05-18',
    incrementMonth: 'July',
    qualifications: 'B.Com, PGDCA',
    notes: 'ಆ2 ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಶಾಖೆಯ ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker - Primary Education). ಗಳಿಕೆ ರಜೆ, ಬಡ್ತಿ, ಜ್ಞಾಪನಾ ಕಡತಗಳ ನಿರ್ವಹಣೆ.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-suresh',
    employeeCode: 'BHD-OFF-004',
    kgidNumber: '241850',
    basicPay: 42100,
    payScale: '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850',
    fullName: 'ಕೆ.ವಿ. ಸುರೇಶ್ ಕುಮಾರ್ (K.V. Suresh Kumar)',
    designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA) - ಆ3 ಪ್ರೌ.ಶಿ & ಅನುದಾನ',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'suresh.kv@karnataka.gov.in',
    phone: '+91 98450 78210',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Clerk / Assistant',
    joiningDate: '2014-02-20',
    incrementMonth: 'January',
    qualifications: 'B.A., B.Ed.',
    notes: 'ಪ್ರೌಢ ಶಿಕ್ಷಣ ಹಾಗೂ ಖಾಸಗಿ ಅನುದಾನಿತ ಶಾಲೆಗಳ ವೇತನ ಅನುದಾನ ವಿಭಾಗದ ವಿಷಯ ನಿರ್ವಾಹಕರು.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-sowmya',
    employeeCode: 'BHD-OFF-005',
    kgidNumber: '312094',
    basicPay: 31400,
    payScale: '27650-650-29600-750-32600-850-36000-950-39800-1100-46400-1250-52650',
    fullName: 'ಸೌಮ್ಯ ಬಿ.ಆರ್. (Sowmya B.R.)',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA) - ಮಾ.ಹ & ಸಿಬ್ಬಂದಿ',
    section: 'Legal & Grievances',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'sowmya.br@karnataka.gov.in',
    phone: '+91 99002 54128',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Clerk / Assistant',
    joiningDate: '2018-09-03',
    incrementMonth: 'July',
    qualifications: 'B.Sc, D.Ed.',
    notes: 'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ (RTI) ಅರ್ಜಿ ನಿರ್ವಹಣೆ & ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕ (Service Register) ಕಡತಗಳು.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-pradeep',
    employeeCode: 'BHD-OFF-006',
    kgidNumber: '335712',
    basicPay: 29600,
    payScale: '27650-650-29600-750-32600-850-36000-950-39800-1100-46400-1250-52650',
    fullName: 'ಪ್ರದೀಪ್ ಕುಮಾರ್ ಎನ್. (Pradeep Kumar N.)',
    designation: 'ದ್ವಿತೀಯ ದರ್ಜೆ ಸಹಾಯಕರು (SDA) - ಆವಕ/ಜಾವಕ & ಇ-ಆಫೀಸ್',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'pradeep.kumar@karnataka.gov.in',
    phone: '+91 97410 88231',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Clerk / Assistant',
    joiningDate: '2020-01-15',
    incrementMonth: 'January',
    qualifications: 'B.C.A.',
    notes: 'ದೈನಂದಿನ ಆವಕ-ಜಾವಕ ರಿಜಿಸ್ಟರ್, ಇ-ಕಡತಗಳ ರವಾನೆ & ಪತ್ರಗಳ ವಿತರಣೆ.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-brc-manjunath',
    employeeCode: 'BHD-OFF-007',
    kgidNumber: '198741',
    basicPay: 56900,
    payScale: '43100-1100-46400-1250-53900-1450-62600-1650-70850',
    fullName: 'ಮಂಜುನಾಥ್ ಜಿ. (Manjunath G.)',
    designation: 'ಕ್ಷೇತ್ರ ಸಮನ್ವಯಾಧಿಕಾರಿಗಳು (BRC Coordinator)',
    section: 'Academic Wing',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ (BRC ವಿಭಾಗ), ಭದ್ರಾವತಿ',
    email: 'brc.bhadravathi@karnataka.gov.in',
    phone: '+91 94483 11290',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Inspector / Evaluator',
    joiningDate: '2008-06-20',
    incrementMonth: 'July',
    qualifications: 'M.Sc., M.Ed.',
    notes: 'ಸಮಗ್ರ ಶಿಕ್ಷಣ ಕರ್ನಾಟಕ, ಶಿಕ್ಷಕರ ತರಬೇತಿ ಹಾಗೂ ಶಾಲಾ ಶೈಕ್ಷಣಿಕ ಗುಣಮಟ್ಟ ಮೇಲ್ವಿಚಾರಣೆ.',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'emp-bhd-staff-peon-mallesh',
    employeeCode: 'BHD-OFF-008',
    kgidNumber: '401298',
    basicPay: 21400,
    payScale: '19950-450-21300-500-23300-550-25500-600-27900',
    fullName: 'ಮಲ್ಲೇಶ್ ಎಂ. (Mallesh M.)',
    designation: 'ದಳಾಯತ್ / ಕಛೇರಿ ಸಹಾಯಕರು (Office Attender / Peon)',
    section: 'Administration & Services',
    officeLocation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ',
    email: 'bhadravathi.beo@karnataka.gov.in',
    phone: '+91 96112 34509',
    employmentType: 'Permanent',
    status: 'Active',
    role: 'Clerk / Assistant',
    joiningDate: '2016-04-01',
    incrementMonth: 'January',
    qualifications: 'S.S.L.C.',
    notes: 'ಕಛೇರಿ ಕಡತಗಳ ವರ್ಗಾವಣೆ, ಅಂಚೆ ರವಾನೆ ಹಾಗೂ ಕಛೇರಿ ಸಹಾಯಕ ಕರ್ತವ್ಯಗಳು.',
    lastUpdated: '2026-08-01',
  }
];

interface OfficeStaffTableProps {
  employees?: Employee[];
  onDraftLetterForStaff?: (staff: Employee) => void;
  showTitleHeader?: boolean;
  limitCount?: number;
  onViewAllEmployees?: () => void;
}

export const OfficeStaffTable: React.FC<OfficeStaffTableProps> = ({
  employees = [],
  onDraftLetterForStaff,
  showTitleHeader = true,
  limitCount,
  onViewAllEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCadre, setSelectedCadre] = useState<'all' | 'officers' | 'fda_sda' | 'brc' | 'other'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Consolidated staff list strictly prioritizing B.K. Narayanappa and CSV staff roster
  const staffList = useMemo(() => {
    const map = new Map<string, Employee>();
    SEED_OFFICE_STAFF.forEach(s => map.set(s.kgidNumber, s));
    CSV_STAFF_MEMBERS.forEach(s => {
      if (!map.has(s.kgidNumber)) {
        map.set(s.kgidNumber, s);
      }
    });

    employees.forEach(e => {
      if (!map.has(e.kgidNumber)) {
        map.set(e.kgidNumber, e);
      }
    });

    return Array.from(map.values());
  }, [employees]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.kgidNumber.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCadre === 'officers') {
        return s.designation.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು') || s.designation.includes('BEO') || s.role === 'Director / HOD';
      }
      if (selectedCadre === 'fda_sda') {
        return s.designation.includes('FDA') || s.designation.includes('SDA') || s.designation.includes('ಸಹಾಯಕರು');
      }
      if (selectedCadre === 'brc') {
        return s.designation.includes('BRC') || s.designation.includes('ಸಮನ್ವಯಾಧಿಕಾರಿ');
      }
      if (selectedCadre === 'other') {
        return s.designation.includes('ಅಧೀಕ್ಷಕರು') || s.designation.includes('ದಳಾಯತ್');
      }

      return true;
    });
  }, [staffList, searchTerm, selectedCadre]);

  const visibleStaff = useMemo(() => {
    if (limitCount && !showAll) {
      return filteredStaff.slice(0, limitCount);
    }
    return filteredStaff;
  }, [filteredStaff, limitCount, showAll]);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      {showTitleHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="label-ink">OFFICIAL ROSTER</span>
              <h3 className="text-xl font-black text-[#2b2b2b] font-kannada flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ವಿವರಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿ (Office Staff Members Directory)
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-kannada mt-1">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ • ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ: <strong className="text-stone-900">ಶ್ರೀ ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ (BEO)</strong> ಹಾಗೂ ಶಾಖಾವಾರು ಸಿಬ್ಬಂದಿ, ಪದನಾಮ ಮತ್ತು ಸಂಪರ್ಕ ಮಾಹಿತಿ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-lg text-xs font-bold border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#f59e0b] hover:shadow-[4px_4px_0px_#f59e0b] transition-all flex items-center gap-2 cursor-pointer font-kannada"
              title="ಕಛೇರಿ ಸಿಬ್ಬಂದಿ ವಿವರಗಳ ಮುದ್ರಣಾವೃತ್ತಿ (Print Table)"
            >
              <Printer className="w-4 h-4" />
              <span>ಸಿಬ್ಬಂದಿ ಪಟ್ಟಿ ಮುದ್ರಿಸಿ (Print Official Table)</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ಹೆಸರು, KGID, ಹುದ್ದೆ, ಮೊಬೈಲ್ ಮೂಲಕ ಹುಡುಕಿ (Search Staff)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 font-medium placeholder:text-stone-400"
          />
        </div>

        <div className="sm:col-span-6 flex flex-wrap items-center gap-1.5 justify-end">
          <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-stone-500" /> ವೃಂದ:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCadre('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedCadre === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            ಎಲ್ಲಾ ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCadre('officers')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedCadre === 'officers'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            ಅಧಿಕಾರಿಗಳು / BEO
          </button>
          <button
            type="button"
            onClick={() => setSelectedCadre('fda_sda')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedCadre === 'fda_sda'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            FDA / SDA
          </button>
          <button
            type="button"
            onClick={() => setSelectedCadre('brc')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              selectedCadre === 'brc'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            BRC ವಿಭಾಗ
          </button>
        </div>
      </div>

      {/* Main Staff Table View */}
      <div className="overflow-x-auto rounded-xl border-2 border-stone-300 shadow-xs bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 border-b-2 border-stone-300 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-12 text-center">ಕ್ರ.ಸಂ</th>
              <th className="py-3 px-4 min-w-[220px]">ನೌಕರರ ಹೆಸರು & ಕೆ.ಜಿ.ಐ.ಡಿ</th>
              <th className="py-3 px-4 min-w-[200px]">ಹುದ್ದೆ / ಪದನಾಮ (Designation)</th>
              <th className="py-3 px-4 min-w-[160px]">ಶಾಖೆ / ನಿಯೋಜಿತ ಕಾರ್ಯ</th>
              <th className="py-3 px-4 min-w-[170px]">ಸಂಪರ್ಕ ವಿವರ (Phone & Email)</th>
              <th className="py-3 px-3 min-w-[120px]">ವೇತನ ಶ್ರೇಣಿ</th>
              <th className="py-3 px-3 text-center w-28">ಕ್ರಮ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {visibleStaff.map((staff, idx) => {
              const isBEO = staff.kgidNumber === '100101' || staff.fullName.includes('ನಾರಯಣಪ್ಪ');

              return (
                <tr 
                  key={staff.id || staff.kgidNumber}
                  className={`hover:bg-stone-50/80 transition-colors ${
                    isBEO ? 'bg-amber-50/60 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center font-mono font-bold text-stone-700">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isBEO ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-xs' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {isBEO ? 'BEO' : staff.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-stone-950 font-kannada">
                            {staff.fullName}
                          </span>
                          {isBEO && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-400">
                              ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ / ಮುಖ್ಯಸ್ಥರು
                            </span>
                          )}
                          {staff.joiningDate && (
                            <YearsOfServiceBadge joiningDate={staff.joiningDate} size="sm" showKannada={true} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                          <span className="font-mono font-semibold text-stone-700">KGID: {staff.kgidNumber}</span>
                          <span>•</span>
                          <span>{staff.qualifications || 'KES'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block font-kannada">
                      {staff.designation}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {staff.role === 'Director / HOD' ? 'ಗ್ರೂಪ್-ಎ ಅಧಿಕಾರಿ' : staff.employmentType || 'ಕಾಯಂ ನೌಕರರು'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                      {staff.section || 'ಆಡಳಿತ'}
                    </span>
                    {staff.notes && (
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-1" title={staff.notes}>
                        {staff.notes}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a href={`tel:${staff.phone}`} className="hover:underline font-mono">
                        {staff.phone || '08282-268241'}
                      </a>
                    </div>
                    {staff.email && (
                      <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <a href={`mailto:${staff.email}`} className="hover:underline truncate max-w-[150px]" title={staff.email}>
                          {staff.email}
                        </a>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-bold text-stone-800 block">
                      ₹{staff.basicPay ? staff.basicPay.toLocaleString('en-IN') : '52,650'}
                    </span>
                    <span className="text-[9px] text-stone-500 font-mono">
                      {staff.incrementMonth === 'July' ? 'ಜುಲೈ ಬಡ್ತಿ' : 'ಜನವರಿ ಬಡ್ತಿ'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {onDraftLetterForStaff && (
                      <button
                        type="button"
                        onClick={() => onDraftLetterForStaff(staff)}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded text-[11px] font-bold border border-amber-300 transition-colors cursor-pointer"
                        title="ಈ ಸಿಬ್ಬಂದಿಗೆ ಅಧಿಕೃತ ಪತ್ರ / ಜ್ಞಾಪನಾ ಸೃಜಿಸಿ"
                      >
                        ಪತ್ರ ಸೃಜಿಸಿ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Limit Count & See All Footnote */}
      {limitCount && filteredStaff.length > limitCount && (
        <div className="pt-3 px-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-[#2b2b2b] bg-[#fffbf2] p-3 rounded-xl shadow-[3px_3px_0px_#2b2b2b]">
          <span className="text-xs text-stone-800 font-kannada font-medium">
            ಒಟ್ಟು <strong className="text-stone-950 font-bold">{filteredStaff.length}</strong> ನೌಕರರಲ್ಲಿ <strong>{visibleStaff.length}</strong> ನೌಕರರ ವಿವರಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-toggle-show-all-staff"
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-bold text-sky-800 hover:text-sky-950 underline flex items-center gap-1 cursor-pointer font-kannada"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>ಕಡಿಮೆಗೊಳಿಸಿ (Show top 5)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>ಇಲ್ಲಿಯೇ ಎಲ್ಲಾ {filteredStaff.length} ನೌಕರರನ್ನು ವೀಕ್ಷಿಸಿ</span>
                </>
              )}
            </button>
            {onViewAllEmployees && (
              <button
                type="button"
                id="btn-see-all-employees-link"
                onClick={onViewAllEmployees}
                className="px-3.5 py-1.5 bg-[#2b2b2b] hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer font-kannada"
              >
                <span>ಎಲ್ಲಾ ನೌಕರರನ್ನು ವೀಕ್ಷಿಸಿ (See all)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Printable Sheet View for Printing Modal / Window */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border-2 border-stone-400 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-300 print:hidden">
              <span className="font-bold text-stone-900 text-sm">
                ಮುದ್ರಣ ಪೂರ್ವವೀಕ್ಷಣೆ (Official Staff Roster Print Preview)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-stone-900 text-amber-400 rounded-lg text-xs font-bold hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> ಮುದ್ರಿಸಿ (Print)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-200 cursor-pointer"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-staff-roster" className="p-4 sm:p-6 space-y-4 text-stone-950 font-sans">
              {/* Karnataka Government Letterhead */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-stone-800">
                <p className="text-xs font-bold tracking-widest uppercase text-stone-900">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
                <p className="text-base font-extrabold text-stone-950 font-kannada">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</p>
                <h2 className="text-lg font-black text-stone-950 font-kannada">
                  ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯ
                </h2>
                <p className="text-xs text-stone-700 font-kannada">
                  ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301 • ದೂರವಾಣಿ: 08282-268241
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-400 rounded text-xs font-bold font-kannada">
                    ಕಛೇರಿಯ ಅಧಿಕಾರಿ ಹಾಗೂ ಸಿಬ್ಬಂದಿ ವರ್ಗದವರ ಅಧಿಕೃತ ವಿವರಣಾ ಪಟ್ಟಿ (Staff Directory & Contact Roster)
                  </span>
                </div>
              </div>

              {/* Meta information */}
              <div className="flex justify-between text-xs font-bold text-stone-800 pt-1">
                <span>ಕಛೇರಿ ಕೋಡ್: BHD-BEO-EDN</span>
                <span>ದಿನಾಂಕ: {new Date().toLocaleDateString('kn-IN')}</span>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse border border-stone-400 text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-400 font-bold text-stone-900">
                    <th className="p-2 border border-stone-400 text-center w-10">ಕ್ರ.ಸಂ</th>
                    <th className="p-2 border border-stone-400">ಹೆಸರು & ಕೆ.ಜಿ.ಐ.ಡಿ</th>
                    <th className="p-2 border border-stone-400">ಹುದ್ದೆ / ಪದನಾಮ</th>
                    <th className="p-2 border border-stone-400">ಶಾಖೆ / ನಿಯೋಜನೆ</th>
                    <th className="p-2 border border-stone-400">ದೂರವಾಣಿ ಸಂಖ್ಯೆ</th>
                    <th className="p-2 border border-stone-400">ಅಧಿಕೃತ ಇ-ಮೇಲ್</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff, idx) => (
                    <tr key={staff.id || staff.kgidNumber} className="border-b border-stone-300">
                      <td className="p-2 border border-stone-400 text-center font-mono font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-2 border border-stone-400 font-semibold">
                        <div>{staff.fullName}</div>
                        <div className="text-[10px] text-stone-600 font-mono">KGID: {staff.kgidNumber}</div>
                      </td>
                      <td className="p-2 border border-stone-400">
                        {staff.designation}
                      </td>
                      <td className="p-2 border border-stone-400">
                        {staff.section || 'ಆಡಳಿತ'}
                      </td>
                      <td className="p-2 border border-stone-400 font-mono font-semibold">
                        {staff.phone || '08282-268241'}
                      </td>
                      <td className="p-2 border border-stone-400 text-[11px]">
                        {staff.email || 'beo.bhadravathi@karnataka.gov.in'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Authorized Signatory Block */}
              <div className="pt-8 flex justify-end">
                <div className="text-center space-y-1 text-xs">
                  <div className="h-10"></div>
                  <p className="font-extrabold text-stone-950 font-kannada">
                    (ಬಿ.ಕೆ. ನಾರಯಣಪ್ಪ)
                  </p>
                  <p className="font-bold text-stone-900 font-kannada">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ
                  </p>
                  <p className="text-stone-700 font-kannada">
                    ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
