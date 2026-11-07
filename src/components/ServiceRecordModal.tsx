import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  Search,
  UserCheck,
  Coins,
  Building2,
  Sparkles,
  ArrowRight,
  FolderGit2,
  User,
  ExternalLink
} from 'lucide-react';
import { Employee, ServiceSanctionType, MasterDocketFile, ServiceSanctionRecord } from '../types';

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  initialSanctionType?: ServiceSanctionType;
  initialEmployee?: Employee | null;
  onSanctionCompleted: (data: {
    employee: Employee;
    file: MasterDocketFile;
    sanction: ServiceSanctionRecord;
    proceedingsText: string;
  }) => void;
  onViewFile?: (fileId: string) => void;
  onViewEmployee?: (empId: string) => void;
}

const SANCTION_TYPES: { type: ServiceSanctionType; category: 'leave' | 'increment'; description: string; years?: number }[] = [
  {
    type: 'ಗಳಿಕೆ ರಜೆ',
    category: 'leave',
    description: 'ಕೆ.ಸಿ.ಎಸ್.ಆರ್ ನಿಯಮ 112 ರ ಪ್ರಕಾರ ಗಳಿಕೆ ರಜೆ (Earned Leave) ಮಂಜೂರಾತಿ ಕಡತ'
  },
  {
    type: 'ಶಿಶುಪಾಲನ ರಜೆ',
    category: 'leave',
    description: 'ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಗರಿಷ್ಠ 180 ದಿನಗಳ ಶಿಶುಪಾಲನ ರಜೆ (Child Care Leave) ಮಂಜೂರಾತಿ'
  },
  {
    type: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ',
    category: 'increment',
    description: '10 ವರ್ಷಗಳ ತೃಪ್ತಿಕರ ಸೇವೆಗಾಗಿ ಕಾಲಮಿತಿ ಬಡ್ತಿ ವೇತನ ಶ್ರೇಣಿ (Time-Bound Advancement Scale)',
    years: 10
  },
  {
    type: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ',
    category: 'increment',
    description: '15 ವರ್ಷಗಳ ನಿರಂತರ ಸೇವೆಗಾಗಿ ಸ್ವಯಂ ಚಾಲಿತ ಬಡ್ತಿ ವೇತನ ಶ್ರೇಣಿ (Senior / Selection Scale)',
    years: 15
  },
  {
    type: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    category: 'increment',
    description: '20 ವರ್ಷಗಳ ಸೇವೆಗಾಗಿ 1 ಹೆಚ್ಚುವರಿ ವಾರ್ಷಿಕ ವೇತನ ಬಡ್ತಿ (20-Year Additional Increment)',
    years: 20
  },
  {
    type: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    category: 'increment',
    description: '25 ವರ್ಷಗಳ ಸುದೀರ್ಘ ಸೇವೆಗಾಗಿ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ (25-Year Additional Increment)',
    years: 25
  },
  {
    type: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ',
    category: 'increment',
    description: '30 ವರ್ಷಗಳ ಸ್ತುತ್ಯಾರ್ಹ ಸೇವೆಗಾಗಿ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ (30-Year Additional Increment)',
    years: 30
  },
];

// Helper to calculate next basic pay increment
function calculateSuggestedIncrement(currentPay: number): number {
  if (currentPay < 30000) return currentPay + 650;
  if (currentPay < 36000) return currentPay + 850;
  if (currentPay < 40000) return currentPay + 950;
  if (currentPay < 54000) return currentPay + 1100;
  if (currentPay < 63000) return currentPay + 1250;
  if (currentPay < 73000) return currentPay + 1450;
  if (currentPay < 84000) return currentPay + 1650;
  return currentPay + 1900;
}

export const ServiceRecordModal: React.FC<ServiceRecordModalProps> = ({
  isOpen,
  onClose,
  employees,
  initialSanctionType,
  initialEmployee,
  onSanctionCompleted,
  onViewFile,
  onViewEmployee,
}) => {
  // Step 1: Selection of Type
  const [selectedType, setSelectedType] = useState<ServiceSanctionType>(
    initialSanctionType || '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ'
  );

  // Step 2: KGID Input & Search
  const [kgidInput, setKgidInput] = useState('');
  const [isSearchingKgid, setIsSearchingKgid] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Step 3: Employee Info
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [isNewEmployeeEntry, setIsNewEmployeeEntry] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [schoolOrOffice, setSchoolOrOffice] = useState('');
  const [previousBasicPay, setPreviousBasicPay] = useState<number>(37900);
  const [revisedBasicPay, setRevisedBasicPay] = useState<number>(39800);
  const [payScale, setPayScale] = useState('37900-70850');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNumber, setOrderNumber] = useState('');

  // Leave specific fields
  const [leaveFrom, setLeaveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [leaveTo, setLeaveTo] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [totalDays, setTotalDays] = useState<number>(15);
  const [leaveReason, setLeaveReason] = useState('ವೈಯಕ್ತಿಕ / ಅನಾರೋಗ್ಯ ಕಾರಣದಿಂದ');
  const [remarks, setRemarks] = useState('');

  // Submission State & Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    employee: Employee;
    file: MasterDocketFile;
    sanction: ServiceSanctionRecord;
    proceedingsText: string;
  } | null>(null);

  const isIncrementType = selectedType.includes('ವೇತನ ಬಡ್ತಿ');

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setSubmissionResult(null);
      setSearchError(null);

      if (initialSanctionType) {
        setSelectedType(initialSanctionType);
      }

      if (initialEmployee) {
        populateWithEmployee(initialEmployee);
      } else {
        // Pick first Bhadravathi sample if available
        const defaultSample = employees.find(e => e.kgidNumber === '108294') || employees[0];
        if (defaultSample && defaultSample.kgidNumber) {
          setKgidInput(defaultSample.kgidNumber);
          populateWithEmployee(defaultSample);
        } else {
          setKgidInput('');
          setMatchedEmployee(null);
          setIsNewEmployeeEntry(false);
          setPreviousBasicPay(37900);
          setRevisedBasicPay(calculateSuggestedIncrement(37900));
        }
      }
    }
  }, [isOpen, initialSanctionType, initialEmployee]);

  // Recalculate days when leave dates change
  useEffect(() => {
    if (!isIncrementType && leaveFrom && leaveTo) {
      const from = new Date(leaveFrom).getTime();
      const to = new Date(leaveTo).getTime();
      if (!isNaN(from) && !isNaN(to) && to >= from) {
        const diffDays = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      }
    }
  }, [leaveFrom, leaveTo, isIncrementType]);

  // Adjust suggested increment when previous pay changes
  useEffect(() => {
    if (isIncrementType && previousBasicPay) {
      setRevisedBasicPay(calculateSuggestedIncrement(previousBasicPay));
    }
  }, [previousBasicPay, isIncrementType, selectedType]);

  const populateWithEmployee = (emp: Employee) => {
    setMatchedEmployee(emp);
    setIsNewEmployeeEntry(false);
    setSearchError(null);
    setKgidInput(emp.kgidNumber || '');
    setFullName(emp.fullName);
    setDesignation(emp.designation);
    setSchoolOrOffice(emp.officeLocation);
    const pay = emp.basicPay || 37900;
    setPreviousBasicPay(pay);
    setRevisedBasicPay(calculateSuggestedIncrement(pay));
    if (emp.payScale) setPayScale(emp.payScale);
  };

  // KGID lookup action
  const handleLookupKgid = async (overrideKgid?: string) => {
    const targetKgid = (overrideKgid || kgidInput).trim();
    if (!targetKgid) {
      setSearchError('ದಯವಿಟ್ಟು ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.');
      return;
    }

    setIsSearchingKgid(true);
    setSearchError(null);

    try {
      // 1. Check local list first
      const localEmp = employees.find(
        e =>
          (e.kgidNumber && e.kgidNumber.toLowerCase() === targetKgid.toLowerCase()) ||
          (e.kgidNumber && e.kgidNumber.replace(/[^0-9]/g, '') === targetKgid.replace(/[^0-9]/g, '')) ||
          (e.employeeCode && e.employeeCode.toLowerCase().includes(targetKgid.toLowerCase()))
      );

      if (localEmp) {
        populateWithEmployee(localEmp);
        setIsSearchingKgid(false);
        return;
      }

      // 2. Fetch from backend
      const res = await fetch(`/api/employees/lookup-kgid/${encodeURIComponent(targetKgid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.employee) {
          populateWithEmployee(data.employee);
          return;
        }
      }

      // If not found in records, prompt to register new employee with this KGID
      setMatchedEmployee(null);
      setIsNewEmployeeEntry(true);
      setSearchError(`KGID ${targetKgid} ದಾಖಲೆಯಲ್ಲಿಲ್ಲ. ಕೆಳಗೆ ನೌಕರರ ಹೊಸ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಸೇವ್ ಮಾಡಬಹುದು.`);
      setFullName('');
      setDesignation('ಸಹ ಶಿಕ್ಷಕರು');
      setSchoolOrOffice('ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಭದ್ರಾವತಿ');
      setPreviousBasicPay(37900);
      setRevisedBasicPay(calculateSuggestedIncrement(37900));
    } catch (err) {
      console.error(err);
      setSearchError('ಕೆಜಿಐಡಿ ಹುಡುಕಾಟದಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.');
    } finally {
      setIsSearchingKgid(false);
    }
  };

  // Final Submit Handler
  const handleSubmitSanction = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanKgid = kgidInput.trim();
    if (!cleanKgid) {
      setSearchError('ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯವಾಗಿದೆ.');
      return;
    }
    if (!fullName.trim()) {
      alert('ದಯವಿಟ್ಟು ನೌಕರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsSubmitting(true);
    setSearchError(null);

    try {
      const payload = {
        sanctionType: selectedType,
        kgidNumber: cleanKgid,
        employeeId: matchedEmployee?.id,
        employeeCode: matchedEmployee?.employeeCode,
        fullName: fullName.trim(),
        designation: designation.trim(),
        schoolOrOffice: schoolOrOffice.trim(),
        previousBasicPay: Number(previousBasicPay),
        revisedBasicPay: Number(revisedBasicPay),
        payScale: payScale.trim(),
        effectiveDate,
        orderNumber: orderNumber.trim() || undefined,
        leaveFrom: !isIncrementType ? leaveFrom : undefined,
        leaveTo: !isIncrementType ? leaveTo : undefined,
        totalDays: !isIncrementType ? totalDays : undefined,
        leaveReason: !isIncrementType ? leaveReason : undefined,
        remarks: remarks.trim() || undefined,
      };

      const res = await fetch('/api/service-sanctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ಕಡತ ಮತ್ತು ನೌಕರರ ವಿವರ ಸೇವ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ.');
      }

      setSubmissionResult(data);
      onSanctionCompleted({
        employee: data.employee,
        file: data.file,
        sanction: data.sanction,
        proceedingsText: data.proceedingsText,
      });
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'ಸೇವಾ ಮಂಜೂರಾತಿ ಸಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="service-record-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="service-record-modal-content"
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {isIncrementType ? <TrendingUp className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ಸೇವಾ ಕಡತ & ವೇತನ ಪರಿಷ್ಕರಣೆ
                </span>
                <span className="text-xs text-stone-400">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                ರಜೆ ಹಾಗೂ ವೇತನ ಬಡ್ತಿ ಮಂಜೂರಾತಿ ಪ್ರಕ್ರಿಯೆ (Service Sanctions Filing)
              </h2>
            </div>
          </div>
          <button
            id="close-service-record-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submissionResult ? (
            /* SUCCESS STATE: Official Proceedings & Summary */
            <div id="service-record-success-view" className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-emerald-900">
                      {submissionResult.sanction.sanctionType} ಯಶಸ್ವಿಯಾಗಿ ಕಡತದಲ್ಲಿ ಹಾಗೂ ನೌಕರರ ಮಾಹಿತಿಯಲ್ಲಿ ಸೇವ್ ಆಗಿದೆ!
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      ಕಡತ ಸಂಖ್ಯೆ: <span className="font-mono font-bold">{submissionResult.file.fileNumber}</span> | 
                      ಆದೇಶ ಸಂಖ್ಯೆ: <span className="font-mono font-bold">{submissionResult.sanction.orderNumber}</span>
                    </p>
                    {isIncrementType && (
                      <div className="mt-3 inline-flex items-center gap-3 px-3.5 py-1.5 bg-emerald-100/90 text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-300/80">
                        <span>ಮೂಲ ವೇತನ ಬದಲಾವಣೆ:</span>
                        <span className="line-through text-stone-500">₹{submissionResult.sanction.previousBasicPay?.toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-sm font-bold text-emerald-900">₹{submissionResult.sanction.revisedBasicPay?.toLocaleString('en-IN')}/-</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee & Docket Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>ನೌಕರರ ಮಾಹಿತಿ (Employee Roster)</span>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      ನವೀಕರಿಸಲಾಗಿದೆ
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <p><span className="font-semibold text-stone-800">ಹೆಸರು:</span> {submissionResult.employee.fullName}</p>
                    <p><span className="font-semibold text-stone-800">ಹುದ್ದೆ:</span> {submissionResult.employee.designation}</p>
                    <p><span className="font-semibold text-stone-800">ಕೆಜಿಐಡಿ (KGID):</span> <span className="font-mono font-bold text-amber-700">{submissionResult.employee.kgidNumber}</span></p>
                    <p><span className="font-semibold text-stone-800">ಕಾರ್ಯಸ್ಥಳ:</span> {submissionResult.employee.officeLocation}</p>
                    <p><span className="font-semibold text-stone-800">ನೂತನ ಮೂಲ ವೇತನ:</span> <span className="font-bold text-emerald-700 text-sm">₹{submissionResult.employee.basicPay?.toLocaleString('en-IN')}/-</span></p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                      <FolderGit2 className="w-4 h-4 text-blue-600" />
                      <span>ಕಡತ ದಾಖಲೆ (Files Tracking Docket)</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                      ಕಡತ ಸೃಜನೆ
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <p><span className="font-semibold text-stone-800">ಕಡತ ಸಂಖ್ಯೆ:</span> <span className="font-mono font-semibold text-blue-700">{submissionResult.file.fileNumber}</span></p>
                    <p className="line-clamp-2"><span className="font-semibold text-stone-800">ವಿಷಯ:</span> {submissionResult.file.subject}</p>
                    <p><span className="font-semibold text-stone-800">ವಿಭಾಗ:</span> {submissionResult.file.section}</p>
                    <p><span className="font-semibold text-stone-800">ಹಾಲಿ ಸುಪರ್ದು:</span> {submissionResult.file.currentCustodian}</p>
                    <p><span className="font-semibold text-stone-800">ದಿನಾಂಕ:</span> {submissionResult.file.initiatedDate}</p>
                  </div>
                </div>
              </div>

              {/* Official Proceedings Text Viewer */}
              <div className="bg-white rounded-xl border border-stone-300 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>ಅಧಿಕೃತ ನಡಾವಳಿಗಳ ಆದೇಶ ಪ್ರತಿ (Official Proceedings Order)</span>
                  </div>
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>${submissionResult.sanction.sanctionType} - ${submissionResult.employee.fullName}</title>
                              <style>
                                body { font-family: monospace, sans-serif; white-space: pre-wrap; padding: 30px; font-size: 13px; line-height: 1.6; }
                              </style>
                            </head>
                            <body>${submissionResult.proceedingsText}</body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors border border-stone-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>ಮುದ್ರಿಸಿ (Print Order)</span>
                  </button>
                </div>
                <pre className="text-xs text-stone-800 font-mono whitespace-pre-wrap bg-stone-50 p-4 rounded-lg border border-stone-200 leading-relaxed max-h-72 overflow-y-auto">
                  {submissionResult.proceedingsText}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setMatchedEmployee(null);
                    setKgidInput('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  + ಇನ್ನೊಂದು ಕಡತ ಸೃಜಿಸಿ (Create Another)
                </button>
                <div className="flex items-center gap-2">
                  {onViewFile && (
                    <button
                      onClick={() => {
                        onClose();
                        onViewFile(submissionResult.file.id);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>ಕಡತಗಳ ವಿಭಾಗದಲ್ಲಿ ನೋಡಿ (View in FTS)</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-xs"
                  >
                    ಮುಕ್ತಾಯ (Done)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEPPED FORM: Selection -> KGID -> Info -> Save */
            <form onSubmit={handleSubmitSanction} className="space-y-6">
              {/* STEP 1: Select Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span>ಸೇವಾ ಮಂಜೂರಾತಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Leave / Increment Type):</span>
                  </label>
                  <span className="text-xs text-stone-500">7 ಅಧಿಕೃತ ಸೇವಾ ಪ್ರಕಾರಗಳು</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {SANCTION_TYPES.map((item) => {
                    const isSelected = selectedType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSelectedType(item.type)}
                        className={`p-3 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs">{item.type}</span>
                          {item.category === 'increment' ? (
                            <span className="text-[10px] bg-amber-200/80 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                              ವೇತನ ಬಡ್ತಿ
                            </span>
                          ) : (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                              ರಜೆ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                          {item.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: KGID Number Input */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span>ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Enter KGID Number):</span>
                  </label>
                  <span className="text-xs text-stone-500">
                    ಕರ್ನಾಟಕ ಸರ್ಕಾರ ವಿಮಾ ಇಲಾಖೆ (KGID) ಗುರುತಿನ ಸಂಖ್ಯೆ
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      id="kgid-number-input"
                      type="text"
                      value={kgidInput}
                      onChange={(e) => setKgidInput(e.target.value)}
                      placeholder="ಉದಾ: 108294 ಅಥವಾ 240918 ಅಥವಾ 319802"
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-medium rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <button
                    id="submit-kgid-search-btn"
                    type="button"
                    onClick={() => handleLookupKgid()}
                    disabled={isSearchingKgid || !kgidInput.trim()}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    {isSearchingKgid ? (
                      <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Submit (ಮಾಹಿತಿ ಪಡೆಯಿರಿ)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick KGID sample pickers for easy testing */}
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-stone-500 text-[11px] font-medium">ತ್ವರಿತ ಕೆಜಿಐಡಿ (Quick Sample KGIDs):</span>
                  {[
                    { kgid: '108294', name: 'ಮಂಜುನಾಥ್ ಬಿ.ಎಸ್. (GHS ಹೊಸಮನೆ)' },
                    { kgid: '240918', name: 'ಗೀತಾ ಎಂ. (GMHPS ಹಳೇನಗರ)' },
                    { kgid: '319802', name: 'ರಮೇಶ್ ನಾಯಕ್ (GJC ಭದ್ರಾವತಿ)' },
                    { kgid: '450123', name: 'ಸವಿತಾ ಕೆ. (BEO Office FDA)' },
                  ].map((item) => (
                    <button
                      key={item.kgid}
                      type="button"
                      onClick={() => {
                        setKgidInput(item.kgid);
                        handleLookupKgid(item.kgid);
                      }}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span className="font-bold text-amber-700">{item.kgid}</span>
                      <span className="text-stone-500 text-[10px]">({item.name.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>

                {searchError && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>

              {/* STEP 3: Employee Information Display ("submet ಮಾಡಿದ ನಂತರ emp ಮಾಹಿತಿ ಬರಬೇಕು") */}
              {(matchedEmployee || isNewEmployeeEntry || fullName) && (
                <div id="employee-details-section" className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        ನೌಕರರ ವಿವರಗಳು (Employee Information):
                      </h3>
                    </div>
                    {matchedEmployee && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ದೃಢೀಕೃತ ಕೆಜಿಐಡಿ ದಾಖಲೆ</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        ನೌಕರರ ಪೂರ್ಣ ಹೆಸರು (Full Name) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="ಶ್ರೀ/ಶ್ರೀಮತಿ ಹೆಸರು"
                        required
                        className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        ಹುದ್ದೆ (Designation) *
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="ಉದಾ: ಹಿರಿಯ ಸಹ ಶಿಕ್ಷಕರು"
                        required
                        className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        ಶಾಲೆ / ಕಛೇರಿ (School / Office) *
                      </label>
                      <input
                        type="text"
                        value={schoolOrOffice}
                        onChange={(e) => setSchoolOrOffice(e.target.value)}
                        placeholder="ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ಭದ್ರಾವತಿ"
                        required
                        className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50/50"
                      />
                    </div>
                  </div>

                  {/* Increment / Basic Pay Section: "ನಂತರ ಮೂಲ ವೇತನ ಬದಲಾವಣೆಯಾಗಬೇಕು" */}
                  {isIncrementType ? (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 mt-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-700" />
                          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                            ಮೂಲ ವೇತನ ಪರಿಷ್ಕರಣೆ (Basic Pay Revision Details):
                          </h4>
                        </div>
                        <span className="text-[11px] text-amber-800 font-medium">
                          {selectedType} ಅಡಿಯಲ್ಲಿ ಹೊಸ ವೇತನ ನಿಗದಿ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ಹಿಂದಿನ ಮೂಲ ವೇತನ (Previous Basic Pay) ₹ *
                          </label>
                          <input
                            type="number"
                            value={previousBasicPay}
                            onChange={(e) => setPreviousBasicPay(Number(e.target.value))}
                            required
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                            ಪರಿಷ್ಕೃತ ನೂತನ ಮೂಲ ವೇತನ (Revised Basic Pay) ₹ *
                          </label>
                          <input
                            type="number"
                            value={revisedBasicPay}
                            onChange={(e) => setRevisedBasicPay(Number(e.target.value))}
                            required
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border-2 border-emerald-500 text-emerald-900 bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          />
                          <p className="text-[10px] text-emerald-700 mt-1">
                            * ಸಬ್ಮಿಟ್ ಮಾಡಿದ ನಂತರ ಈ ಮೊತ್ತಕ್ಕೆ ನೌಕರರ ಮೂಲ ವೇತನ ಬದಲಾವಣೆಯಾಗುತ್ತದೆ.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ವೇತನ ಶ್ರೇಣಿ (Pay Scale)
                          </label>
                          <input
                            type="text"
                            value={payScale}
                            onChange={(e) => setPayScale(e.target.value)}
                            placeholder="37900-70850"
                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ (Effective Date)
                          </label>
                          <input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ಆದೇಶ / ಕಡತ ಸಂಖ್ಯೆ (Order No. - ಐಚ್ಛಿಕ)
                          </label>
                          <input
                            type="text"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೃಜನೆಯಾಗುತ್ತದೆ (Auto-generated if blank)"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Leave Specific Fields */
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 mt-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-700" />
                          <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                            ರಜೆ ಮಂಜೂರಾತಿ ವಿವರಗಳು (Leave Sanction Details):
                          </h4>
                        </div>
                        <span className="text-[11px] text-blue-800 font-medium">
                          ಒಟ್ಟು {totalDays} ದಿನಗಳ ರಜೆ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ರಜೆ ಪ್ರಾರಂಭ ದಿನಾಂಕ (Leave From) *
                          </label>
                          <input
                            type="date"
                            value={leaveFrom}
                            onChange={(e) => setLeaveFrom(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ರಜೆ ಅಂತ್ಯ ದಿನಾಂಕ (Leave To) *
                          </label>
                          <input
                            type="date"
                            value={leaveTo}
                            onChange={(e) => setLeaveTo(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            ಒಟ್ಟು ದಿನಗಳು (Total Days)
                          </label>
                          <input
                            type="number"
                            value={totalDays}
                            onChange={(e) => setTotalDays(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          ರಜಾ ಕಾರಣ (Reason for Leave)
                        </label>
                        <input
                          type="text"
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          placeholder="ವೈಯಕ್ತಿಕ / ಅನಾರೋಗ್ಯ / ಶಿಶುಪಾಲನ ಕಾರಣಕ್ಕಾಗಿ"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      ಷರಾ / ಟಿಪ್ಪಣಿ (Remarks / Case Note)
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲಿಸಿ KCSR ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ಅನುಮೋದಿಸಲಾಗಿದೆ..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons: "submet ಮಾಡಿದ ನಂತರ file ನಲ್ಲಿ save ಆಗಬೇಕು ಮತ್ತು emp data ನಲ್ಲಿ save ಆಗಬೇಕು ನಂತರ ಮೂಲ ವೇತನ ಬದಲಾವಣೆಯಾಗಬೇಕು" */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-600">
                  <span className="font-bold text-stone-800">ಸ್ವಯಂಚಾಲಿತ ಕ್ರಮಗಳು (Actions on Submit):</span>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 text-[11px] text-stone-500">
                    <li>FTS ಕಡತಗಳ ಪಟ್ಟಿಯಲ್ಲಿ ಹೊಸ ಕಡತ (Docket File) ಸೃಜನೆಯಾಗುತ್ತದೆ.</li>
                    <li>ನೌಕರರ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ (Emp Data) ಸೇವಾ ದಾಖಲೆ ಉಳಿಸಲಾಗುತ್ತದೆ.</li>
                    <li>
                      {isIncrementType ? (
                        <span className="font-semibold text-emerald-700">
                          ನೌಕರರ ಮೂಲ ವೇತನವನ್ನು ₹{revisedBasicPay.toLocaleString('en-IN')} ಗೆ ಪರಿಷ್ಕರಿಸಲಾಗುತ್ತದೆ.
                        </span>
                      ) : (
                        <span>ರಜಾ ಮಂಜೂರಾತಿ ಆದೇಶವನ್ನು ಸೇವಾ ಪುಸ್ತಕಕ್ಕೆ ಲಿಂಕ್ ಮಾಡಲಾಗುತ್ತದೆ.</span>
                      )}
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors"
                  >
                    ರದ್ದುಮಾಡಿ (Cancel)
                  </button>

                  <button
                    id="final-submit-sanction-btn"
                    type="submit"
                    disabled={isSubmitting || !kgidInput.trim() || !fullName.trim()}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>ಸೇವ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Submit (ಕಡತ & ನೌಕರರ ಡೇಟಾದಲ್ಲಿ ಉಳಿಸಿ)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
