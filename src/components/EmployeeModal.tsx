import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  FileText, 
  Check, 
  Sparkles,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Employee, DepartmentSection, EmploymentType, EmployeeStatus, EmployeeRole } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>, isEdit: boolean) => Promise<void>;
  initialEmployee?: Employee | null;
}

const SECTIONS: DepartmentSection[] = [
  'Academic Wing',
  'Administration & Services',
  'Accounts & Grants',
  'Examination Board',
  'Inspection & Quality',
  'Legal & Grievances',
];

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'Permanent',
  'Contractual',
  'Deputation',
  'Probation',
];

const STATUSES: EmployeeStatus[] = [
  'Active',
  'On Leave',
  'Transferred',
  'Deputation',
  'Retired',
];

const ROLES: EmployeeRole[] = [
  'Director / HOD',
  'District Officer',
  'Section Officer',
  'Superintendent',
  'Clerk / Assistant',
  'Inspector / Evaluator',
  'Faculty / Principal',
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee,
}) => {
  const isEdit = Boolean(initialEmployee);

  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [section, setSection] = useState<DepartmentSection>('Academic Wing');
  const [officeLocation, setOfficeLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Permanent');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [role, setRole] = useState<EmployeeRole>('Section Officer');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [dob, setDob] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [notes, setNotes] = useState('');

  // Karnataka Service & Pay Fields
  const [kgidNumber, setKgidNumber] = useState('');
  const [basicPay, setBasicPay] = useState<number | ''>(37900);
  const [payScale, setPayScale] = useState('37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850');
  const [incrementMonth, setIncrementMonth] = useState<'January' | 'July'>('January');
  const [placeOfWork, setPlaceOfWork] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [childCareLeaveQuota, setChildCareLeaveQuota] = useState<number>(180);

  // Leave Balances & DDO Designation
  const [earnedLeaveBalance, setEarnedLeaveBalance] = useState<number>(30); // ಗಳಿಕೆ ರಜೆ (EL)
  const [halfPayLeaveBalance, setHalfPayLeaveBalance] = useState<number>(20); // ಅರ್ಧ ವೇತನ ರಜೆ (HPL)
  const [casualLeaveBalance, setCasualLeaveBalance] = useState<number>(15); // ಸಾಂದರ್ಭಿಕ ರಜೆ (CL)
  const [isDdo, setIsDdo] = useState<boolean>(false); // ಕಛೇರಿಯ ಡಿಡಿಓ ಅಧಿಕಾರಿ

  // Additional Information (ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ)
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [casteCategory, setCasteCategory] = useState('ಸಾಮಾನ್ಯ (GM)');
  const [satsId, setSatsId] = useState('');
  const [serviceBookVolume, setServiceBookVolume] = useState('ಸಂಪುಟ-1');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Dynamic Custom Additional Fields (ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ)
  const [customFields, setCustomFields] = useState<Array<{ id: string; key: string; value: string }>>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmployee) {
      setEmployeeCode(initialEmployee.employeeCode);
      setFullName(initialEmployee.fullName);
      setDesignation(initialEmployee.designation);
      setSection(initialEmployee.section);
      setOfficeLocation(initialEmployee.officeLocation);
      setEmail(initialEmployee.email);
      setPhone(initialEmployee.phone);
      setEmploymentType(initialEmployee.employmentType);
      setStatus(initialEmployee.status);
      setRole(initialEmployee.role);
      setJoiningDate(initialEmployee.joiningDate || new Date().toISOString().split('T')[0]);
      setDob(initialEmployee.dob || '');
      setAppointmentDate(initialEmployee.appointmentDate || '');
      setQualifications(initialEmployee.qualifications || '');
      setNotes(initialEmployee.notes || '');

      setKgidNumber(initialEmployee.kgidNumber || '');
      setBasicPay(initialEmployee.basicPay !== undefined ? initialEmployee.basicPay : 37900);
      setPayScale(initialEmployee.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850');
      setIncrementMonth(initialEmployee.incrementMonth === 'July' ? 'July' : 'January');
      setPlaceOfWork(initialEmployee.placeOfWork || initialEmployee.officeLocation || '');
      setGender((initialEmployee.gender as any) || 'Female');
      setChildCareLeaveQuota(initialEmployee.childCareLeaveQuota !== undefined ? initialEmployee.childCareLeaveQuota : 180);

      // Leave Balances & DDO
      setEarnedLeaveBalance(initialEmployee.earnedLeaveBalance !== undefined ? initialEmployee.earnedLeaveBalance : 30);
      setHalfPayLeaveBalance(initialEmployee.halfPayLeaveBalance !== undefined ? initialEmployee.halfPayLeaveBalance : 20);
      setCasualLeaveBalance(initialEmployee.casualLeaveBalance !== undefined ? initialEmployee.casualLeaveBalance : 15);
      setIsDdo(Boolean(initialEmployee.isDdo || initialEmployee.designation?.toLowerCase().includes('ddo') || initialEmployee.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ')));

      // Additional info
      setBankAccountNo(initialEmployee.bankAccountNo || '');
      setBankIfsc(initialEmployee.bankIfsc || '');
      setPanNumber(initialEmployee.panNumber || '');
      setAadhaarNumber(initialEmployee.aadhaarNumber || '');
      setCasteCategory(initialEmployee.casteCategory || 'ಸಾಮಾನ್ಯ (GM)');
      setSatsId(initialEmployee.satsId || '');
      setServiceBookVolume(initialEmployee.serviceBookVolume || 'ಸಂಪುಟ-1');
      setEmergencyContact(initialEmployee.emergencyContact || '');

      // Additional custom fields
      if (initialEmployee.additionalFields && Array.isArray(initialEmployee.additionalFields)) {
        setCustomFields(initialEmployee.additionalFields);
      } else {
        setCustomFields([]);
      }
    } else {
      // New employee default
      const randomCode = `EDN-EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      setEmployeeCode(randomCode);
      setFullName('');
      setDesignation('');
      setSection('Academic Wing');
      setOfficeLocation('BEO Office, Bhadravathi');
      setEmail('');
      setPhone('');
      setEmploymentType('Permanent');
      setStatus('Active');
      setRole('Faculty / Principal');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setDob('');
      setAppointmentDate('');
      setQualifications('B.Ed. / D.Ed.');
      setNotes('');

      setKgidNumber('');
      setBasicPay(37900);
      setPayScale('37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850');
      setIncrementMonth('January');
      setPlaceOfWork('');
      setGender('Female');
      setChildCareLeaveQuota(180);

      setEarnedLeaveBalance(30);
      setHalfPayLeaveBalance(20);
      setCasualLeaveBalance(15);
      setIsDdo(false);

      setBankAccountNo('');
      setBankIfsc('');
      setPanNumber('');
      setAadhaarNumber('');
      setCasteCategory('ಸಾಮಾನ್ಯ (GM)');
      setSatsId('');
      setServiceBookVolume('ಸಂಪುಟ-1');
      setEmergencyContact('');
      setCustomFields([]);
    }
    setError(null);
  }, [initialEmployee, isOpen]);

  const handleAddCustomField = (defaultKey: string = '') => {
    setCustomFields(prev => [...prev, { id: 'field_' + Date.now() + Math.floor(Math.random() * 1000), key: defaultKey, value: '' }]);
  };

  const handleUpdateCustomField = (id: string, field: 'key' | 'value', text: string) => {
    setCustomFields(prev => prev.map(item => item.id === id ? { ...item, [field]: text } : item));
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(item => item.id !== id));
  };

  // Calculated Age based on Date of Birth
  const calculatedAge = React.useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return years >= 0 ? years : null;
  }, [dob]);

  // Projected Karnataka 60 Years Superannuation Retirement Date (KCSR 95)
  const retirementDate = React.useMemo(() => {
    if (!dob) return '';
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return '';
    const retYear = birth.getFullYear() + 60;
    const retMonth = birth.getMonth();
    const lastDayOfMonth = new Date(retYear, retMonth + 1, 0).getDate();
    const mm = String(retMonth + 1).padStart(2, '0');
    const dd = String(lastDayOfMonth).padStart(2, '0');
    return `${retYear}-${mm}-${dd}`;
  }, [dob]);

  // Years of Service Served
  const yearsServed = React.useMemo(() => {
    if (!joiningDate) return null;
    const join = new Date(joiningDate);
    if (isNaN(join.getTime())) return null;
    const now = new Date();
    let yrs = now.getFullYear() - join.getFullYear();
    const m = now.getMonth() - join.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < join.getDate())) {
      yrs--;
    }
    return yrs >= 0 ? yrs : 0;
  }, [joiningDate]);

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    const randomCode = `EDN-EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    setEmployeeCode(randomCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide the employee full name.');
      return;
    }
    if (!designation.trim()) {
      setError('Please provide the official designation / post.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(
        {
          employeeCode: employeeCode.trim(),
          fullName: fullName.trim(),
          designation: designation.trim(),
          section,
          officeLocation: officeLocation.trim(),
          email: email.trim(),
          phone: phone.trim(),
          employmentType,
          status,
          role,
          joiningDate,
          dob: dob ? dob.trim() : undefined,
          age: calculatedAge !== null ? calculatedAge : undefined,
          appointmentDate: appointmentDate ? appointmentDate.trim() : undefined,
          qualifications: qualifications.trim(),
          notes: notes.trim(),
          kgidNumber: kgidNumber.trim(),
          basicPay: basicPay !== '' ? Number(basicPay) : undefined,
          payScale: payScale.trim(),
          incrementMonth,
          placeOfWork: placeOfWork.trim() || officeLocation.trim(),
          gender,
          childCareLeaveQuota: Number(childCareLeaveQuota) || 180,
          earnedLeaveBalance: Number(earnedLeaveBalance) || 0,
          halfPayLeaveBalance: Number(halfPayLeaveBalance) || 0,
          casualLeaveBalance: Number(casualLeaveBalance) || 0,
          isDdo,
          bankAccountNo: bankAccountNo.trim(),
          bankIfsc: bankIfsc.trim(),
          panNumber: panNumber.trim(),
          aadhaarNumber: aadhaarNumber.trim(),
          casteCategory: casteCategory.trim(),
          satsId: satsId.trim(),
          serviceBookVolume: serviceBookVolume.trim(),
          emergencyContact: emergencyContact.trim(),
          additionalFields: customFields.filter(f => f.key.trim() && f.value.trim()),
        },
        isEdit
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save employee data.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="employee-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                {isEdit ? 'Update Employee Record' : 'Add New Department Official'}
              </h2>
              <p className="text-[11px] text-stone-400">
                {isEdit 
                  ? `Modifying establishment credentials for ${initialEmployee?.fullName}` 
                  : 'Register a civil service officer, teacher, or administrative staff'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Employee Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Employee ID / Code *
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Code
                  </button>
                )}
              </div>
              <input
                id="input-emp-code"
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="e.g. EDN-EMP-1045"
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Cadre Status *
              </label>
              <select
                id="select-emp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Full Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name (with Honorific) *
              </label>
              <input
                id="input-emp-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Alistair Vance / Sarah Jenkins"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Designation / Title *
              </label>
              <input
                id="input-emp-designation"
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Director of School Education / Section Officer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Office Posting Location & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Office / School Posting Location (ಸ್ಥಳ)
              </label>
              <input
                id="input-emp-location"
                type="text"
                value={officeLocation}
                onChange={(e) => {
                  setOfficeLocation(e.target.value);
                  if (!placeOfWork) setPlaceOfWork(e.target.value);
                }}
                placeholder="ಉದಾ: ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ಹೊಸಮನೆ, ಭದ್ರಾವತಿ"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Employment Engagement Type
              </label>
              <select
                id="select-emp-type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CRITICAL SERVICE & BIRTH DATES (ಜನ್ಮ ದಿನಾಂಕ & ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ) */}
          <div className="p-3.5 bg-sky-50/80 rounded-xl border-2 border-sky-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-sky-200 pb-2">
              <span className="text-xs font-bold text-sky-950 font-kannada flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-700" />
                <span>ಪ್ರಮುಖ ದಿನಾಂಕಗಳು: ಜನ್ಮ ದಿನಾಂಕ (DOB) ಮತ್ತು ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (DOJ)</span>
              </span>
              <span className="text-[10px] text-sky-800 font-mono font-bold uppercase">
                SERVICE & RETIREMENT DATES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 1: Date of Birth */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-emp-dob" className="block text-xs font-bold text-stone-800 font-kannada">
                    ಜನ್ಮ ದಿನಾಂಕ (Date of Birth - DOB) *
                  </label>
                  {calculatedAge !== null && (
                    <span className="px-1.5 py-0.2 rounded bg-sky-200 text-sky-950 font-bold font-mono text-[10px]">
                      ವಯಸ್ಸು: {calculatedAge} ವರ್ಷ
                    </span>
                  )}
                </div>
                <input
                  id="input-emp-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sky-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-600 shadow-xs"
                />
                {retirementDate ? (
                  <p className="text-[10px] text-stone-600 mt-1 font-kannada">
                    60 ವರ್ಷಗಳ ನಿವೃತ್ತಿ ದಿನಾಂಕ (KCSR 95): <strong className="font-mono text-sky-900">{retirementDate}</strong>
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-500 mt-1 font-kannada">
                    ವಯಸ್ಸು ಮತ್ತು ನಿವೃತ್ತಿ ದಿನಾಂಕವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.
                  </p>
                )}
              </div>

              {/* Field 2: Date of Joining */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-emp-joining" className="block text-xs font-bold text-stone-800 font-kannada">
                    ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (Date of Joining - DOJ) *
                  </label>
                  {yearsServed !== null && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-bold font-mono text-[10px]">
                      {yearsServed} ವರ್ಷಗಳ ಸೇವೆ
                    </span>
                  )}
                </div>
                <input
                  id="input-emp-joining"
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sky-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-600 shadow-xs"
                />
                <p className="text-[10px] text-stone-600 mt-1 font-kannada">
                  ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಕರ್ತವ್ಯ ವರದಿ ಮಾಡಿಕೊಂಡ ದಿನಾಂಕ (ವೇತನ ಬಡ್ತಿ & ಪಿಂಚಣಿಗೆ ಪರಿಗಣನೆ).
                </p>
              </div>
            </div>
          </div>

          {/* Row 4b: Karnataka Pay Commission & Increment Details */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>ವೇತನ ಶ್ರೇಣಿ ಮತ್ತು ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ವಿವರ (Pay & Increment Details)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಕೆ.ಜಿ.ಐ.ಡಿ ಸಂಖ್ಯೆ (KGID No.)
                </label>
                <input
                  id="input-emp-kgid"
                  type="text"
                  value={kgidNumber}
                  onChange={(e) => setKgidNumber(e.target.value)}
                  placeholder="ಉದಾ: 108294"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ (Basic Pay ₹)
                </label>
                <input
                  id="input-emp-basic-pay"
                  type="number"
                  value={basicPay}
                  onChange={(e) => setBasicPay(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="37900"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ ಮಾಹೆ (Increment Month) *
                </label>
                <select
                  id="select-emp-increment-month"
                  value={incrementMonth}
                  onChange={(e) => setIncrementMonth(e.target.value as 'January' | 'July')}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold text-amber-950"
                >
                  <option value="January">ಜನವರಿ (January 1st)</option>
                  <option value="July">ಜುಲೈ (July 1st)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                ಕರ್ನಾಟಕ ರಾಜ್ಯ ವೇತನ ಶ್ರೇಣಿ (Pay Scale)
              </label>
              <input
                id="input-emp-pay-scale"
                type="text"
                value={payScale}
                onChange={(e) => setPayScale(e.target.value)}
                placeholder="37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850"
                className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono text-[11px]"
              />
            </div>

            {/* Child Care Leave (ಶಿಶುಪಾಲನ ರಜೆ) & Gender Controls */}
            <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಲಿಂಗ (Gender) *
                </label>
                <select
                  id="select-emp-gender"
                  value={gender}
                  onChange={(e) => {
                    const g = e.target.value as 'Female' | 'Male' | 'Other';
                    setGender(g);
                    if (g === 'Female') {
                      if (!childCareLeaveQuota || childCareLeaveQuota === 0) {
                        setChildCareLeaveQuota(180);
                      }
                    } else {
                      setChildCareLeaveQuota(0);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                >
                  <option value="Female">ಮಹಿಳಾ (Female)</option>
                  <option value="Male">ಪುರುಷ (Male)</option>
                  <option value="Other">ಇತರೆ (Other)</option>
                </select>
              </div>

              {gender === 'Female' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span>ಶಿಶುಪಾಲನ ರಜೆ ಒಟ್ಟು ಕೋಟಾ (ದಿನಗಳು) *</span>
                    <span className="text-[10px] text-pink-700 font-bold bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">ಮಹಿಳಾ ಕೋಟಾ: 180 ದಿನಗಳು</span>
                  </label>
                  <input
                    id="input-emp-childcare-quota"
                    type="number"
                    min={0}
                    max={730}
                    value={childCareLeaveQuota}
                    onChange={(e) => setChildCareLeaveQuota(Number(e.target.value))}
                    placeholder="180"
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/40 font-mono font-bold text-pink-900"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                  <div className="p-2 bg-stone-100 rounded-lg border border-stone-200 text-[11px] text-stone-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                    <span>ಶಿಶುಪಾಲನ ರಜೆ: <strong>ಕೇವಲ ಮಹಿಳಾ ನೌಕರರಿಗೆ ಮಾತ್ರ ಅನ್ವಯ (Female Only)</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* LEAVE BALANCES (ಗಳಿಕೆ ರಜೆ EL & ಅರ್ಧ ವೇತನ ರಜೆ HPL ಶಿಲ್ಕು) */}
            <div className="pt-3 border-t border-amber-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-900 font-kannada flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  ನೌಕರರ ರಜೆಗಳ ಶಿಲ್ಕು (Leave Balances):
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  KCSR Rule 118A
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-amber-300">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು (EL - Days) *
                  </label>
                  <input
                    id="input-emp-el-balance"
                    type="number"
                    min={0}
                    max={300}
                    value={earnedLeaveBalance}
                    onChange={(e) => setEarnedLeaveBalance(Number(e.target.value))}
                    placeholder="30"
                    className="w-full px-2.5 py-1.5 text-xs bg-amber-50/50 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-stone-900"
                  />
                  <span className="text-[10px] text-stone-500">ಗರಿಷ್ಠ 300 ದಿನಗಳು</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-300">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    ಅರ್ಧ ವೇತನ ರಜೆ (HPL - Days) *
                  </label>
                  <input
                    id="input-emp-hpl-balance"
                    type="number"
                    min={0}
                    max={400}
                    value={halfPayLeaveBalance}
                    onChange={(e) => setHalfPayLeaveBalance(Number(e.target.value))}
                    placeholder="20"
                    className="w-full px-2.5 py-1.5 text-xs bg-amber-50/50 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-stone-900"
                  />
                  <span className="text-[10px] text-stone-500">ವಾರ್ಷಿಕ 20 ದಿನಗಳು</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-amber-300">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    ಸಾಂದರ್ಭಿಕ ರಜೆ (CL - Days)
                  </label>
                  <input
                    id="input-emp-cl-balance"
                    type="number"
                    min={0}
                    max={15}
                    value={casualLeaveBalance}
                    onChange={(e) => setCasualLeaveBalance(Number(e.target.value))}
                    placeholder="15"
                    className="w-full px-2.5 py-1.5 text-xs bg-amber-50/50 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-stone-900"
                  />
                  <span className="text-[10px] text-stone-500">ವಾರ್ಷಿಕ 15 ದಿನಗಳು</span>
                </div>
              </div>
            </div>

            {/* DDO (ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿ) CHECKBOX */}
            <div className="pt-2 border-t border-amber-200/80">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sky-50 border border-sky-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDdo}
                  onChange={(e) => setIsDdo(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-sky-950 font-kannada">
                    ಈ ನೌಕರರು ಕಛೇರಿಯ ಆಹರಣ ಮತ್ತು ವಿತರಣಾ ಅಧಿಕಾರಿಯಾಗಿದ್ದಾರೆ (DDO / BEO)
                  </span>
                  <p className="text-[10px] text-sky-800">
                    ಇದನ್ನು ಗುರುತು ಮಾಡಿದರೆ ಇವರ ವಿವರಗಳು ಸೆಟ್ಟಿಂಗ್ಸ್‌ನ ಡಿಡಿಓ ವಿಭಾಗಕ್ಕೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತವೆ.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ADDITIONAL INFORMATION (ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ - ಬ್ಯಾಂಕ್, ಪ್ಯಾನ್, ಆಧಾರ್, ಜಾತಿ, ಸ್ಯಾಟ್ಸ್) */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-300 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-bold text-stone-900 font-kannada flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                ನೌಕರರ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ (Additional Official Information):
              </span>
              <span className="text-[10px] text-stone-500">ಆಡಳಿತ & ವೇತನಕ್ಕೆ ಅಗತ್ಯ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ (Account No.)
                </label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="ಉದಾ: 64019284712"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಬ್ಯಾಂಕ್ IFSC ಕೋಡ್
                </label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="SBIN0040129"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಪ್ಯಾನ್ ಕಾರ್ಡ್ (PAN Number)
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಆಧಾರ್ ಸಂಖ್ಯೆ (Aadhaar Number)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="12 ಅಂಕಿಗಳ ಸಂಖ್ಯೆ"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಜಾತಿ / ಪ್ರವರ್ಗ (Category)
                </label>
                <select
                  value={casteCategory}
                  onChange={(e) => setCasteCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300"
                >
                  <option value="ಸಾಮಾನ್ಯ (GM)">ಸಾಮಾನ್ಯ (GM)</option>
                  <option value="ಪ್ರವರ್ಗ-1 (Cat-1)">ಪ್ರವರ್ಗ-1 (Cat-1)</option>
                  <option value="2ಎ (2A)">2ಎ (2A)</option>
                  <option value="2ಬಿ (2B)">2ಬಿ (2B)</option>
                  <option value="3ಎ (3A)">3ಎ (3A)</option>
                  <option value="3ಬಿ (3B)">3ಬಿ (3B)</option>
                  <option value="ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)">ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)</option>
                  <option value="ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)">ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಸ್ಯಾಟ್ಸ್ ಐಡಿ (SATS Teacher ID)
                </label>
                <input
                  type="text"
                  value={satsId}
                  onChange={(e) => setSatsId(e.target.value)}
                  placeholder="ಉದಾ: TCH-291501"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ಸೇವಾ ಪುಸ್ತಕ ಸಂಪುಟ ಸಂಖ್ಯೆ
                </label>
                <input
                  type="text"
                  value={serviceBookVolume}
                  onChange={(e) => setServiceBookVolume(e.target.value)}
                  placeholder="ಸಂಪುಟ-1"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆ (Emergency Phone)
                </label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                  className="w-full px-2.5 py-1.5 text-xs bg-white rounded border border-stone-300"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC ADDITIONAL CUSTOM FIELDS (ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಲು ಅವಕಾಶ) */}
          <div className="p-4 bg-amber-50/70 rounded-xl border-2 border-amber-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
              <div>
                <span className="text-xs font-bold text-amber-950 font-kannada flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಿ (Custom Additional Information):
                </span>
                <p className="text-[10px] text-amber-800">
                  ನೌಕರರಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ವಿವರಗಳನ್ನು (ನಾಮಿನಿ, ಪಿಂಚಣಿ ಯೋಜನೆ, ಭತ್ಯೆ, ಇತ್ಯಾದಿ) ಇಲ್ಲಿ ಸೇರಿಸಬಹುದು ಮತ್ತು ಇವು ಇತರ ಕಡತಗಳಲ್ಲಿ ಪ್ರದರ್ಶಿತವಾಗುತ್ತವೆ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddCustomField('')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer font-kannada self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ವಿವರ ಸೇರಿಸಿ</span>
              </button>
            </div>

            {/* Quick pre-set shortcut chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-stone-500 font-bold font-kannada">ತ್ವರಿತ ಶೀರ್ಷಿಕೆಗಳು:</span>
              {[
                'ನಾಮಿನಿ ಹೆಸರು (Nominee)',
                'ಪಿ.ಎಫ್. / PRAN ಸಂಖ್ಯೆ',
                'ವಿಶೇಷ ಕರ್ತವ್ಯ / ಹೊಣೆಗಾರಿಕೆ',
                'ರಕ್ತದ ಗುಂಪು (Blood Group)',
                'ಹಿಂದಿನ ಶಾಲೆ / ಕಚೇರಿ',
                'ಮನೆ ವಿಳಾಸ'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAddCustomField(chip)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-stone-700 border border-amber-300 text-[10px] font-medium font-kannada cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Custom fields list */}
            {customFields.length > 0 ? (
              <div className="space-y-2 pt-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleUpdateCustomField(field.id, 'key', e.target.value)}
                      placeholder="ಮಾಹಿತಿಯ ಶೀರ್ಷಿಕೆ (ಉದಾ: ನಾಮಿನಿ ಹೆಸರು)"
                      className="w-1/3 px-2 py-1 text-xs border border-stone-300 rounded font-semibold text-stone-900 bg-amber-50/30"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                      placeholder="ವಿವರ / ಮಾಹಿತಿ (ಉದಾ: ಶ್ರೀಮತಿ ರೇಖಾ - ಪತ್ನಿ)"
                      className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded font-medium text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                      title="ತೆಗೆದುಹಾಕಿ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 italic py-1 font-kannada">
                ಇನ್ನೂ ಯಾವುದೇ ಕಸ್ಟಮ್ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಸೇರಿಸಲಾಗಿಲ್ಲ. ಮೇಲೆ ನೀಡಿರುವ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಸೇರಿಸಬಹುದು.
              </p>
            )}
          </div>

          {/* Row 5: Email, Phone & Appointment Order Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Email (ಇಮೇಲ್)
              </label>
              <input
                id="input-emp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gov.education.org"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number (ದೂರವಾಣಿ)
              </label>
              <input
                id="input-emp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94480 00000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ಮೂಲ ನೇಮಕಾತಿ ಆದೇಶ ದಿನಾಂಕ (Appointment Date)
              </label>
              <input
                id="input-emp-appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Row 6: Qualifications */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Educational & Professional Qualifications
            </label>
            <input
              id="input-emp-qualifications"
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g. Ph.D. Educational Administration, M.Ed., LL.M."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Row 7: Administrative Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Service Notes & Dossier Remarks
            </label>
            <textarea
              id="textarea-emp-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Authorized assignments, special delegations, or remarks..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-employee"
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEdit ? 'Update Employee Record' : 'Save Employee Data'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
