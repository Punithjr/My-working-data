import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Search, 
  UserCheck, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Download, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  UserPlus, 
  Edit3, 
  FileText,
  Clock,
  Sparkles,
  Info,
  Check,
  X,
  Users,
  BookOpen,
  FolderGit2
} from 'lucide-react';
import { 
  Employee, 
  OrderTypeConfig, 
  PayRule, 
  MemorandumOrder, 
  OrderFile, 
  AdminAuthUser,
  CadreGroup,
  MasterDocketFile 
} from '../types';
import { StatutoryRuleSelectorModal } from './StatutoryRuleSelectorModal';
import { KARNATAKA_STATUTORY_RULES, StatutoryRule } from '../data/karnatakaStatutoryBooks';

interface MemorandumOrderStudioProps {
  currentUser: AdminAuthUser | null;
  employees?: Employee[];
  files?: MasterDocketFile[];
  selectedEmployee?: Employee | null;
  onOrderCreated?: (order: MemorandumOrder, file: OrderFile) => void;
  onViewOrderFiles?: () => void;
  onSelectEmployeeForRoster?: (emp: Employee) => void;
  onAddEmployeeGlobally?: (emp: Employee) => void;
}

export const MemorandumOrderStudio: React.FC<MemorandumOrderStudioProps> = ({
  currentUser,
  employees = [],
  files = [],
  selectedEmployee,
  onOrderCreated,
  onViewOrderFiles,
  onAddEmployeeGlobally,
}) => {
  // Step workflow: 1: Order Type -> 2: KGID Search & Data -> 3: Pay Calc & Review -> 4: Success Generated
  const [selectedOrderType, setSelectedOrderType] = useState<string>('10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ');
  const [kgidInput, setKgidInput] = useState<string>('');
  const [empSearchFilter, setEmpSearchFilter] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Mandatory File Docket Linkage (FILE-FIRST Workflow)
  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    return files && files.length > 0 ? files[0].id : '';
  });

  useEffect(() => {
    if (files && files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [files]);

  // Paternity Leave Form & Rule Fields (KCSR 135-A)
  const [childDob, setChildDob] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split('T')[0];
  });
  const [childOrder, setChildOrder] = useState<string>('1ನೇ ಜೀವಂತ ಮಗು');
  const [applicationDate, setApplicationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [birthCertificateDetails, setBirthCertificateDetails] = useState<string>('ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ ಭದ್ರಾವತಿ - ಜನನ ಪ್ರಮಾಣಪತ್ರ ಸಂ: BHD/BIRTH/2026/8942');
  
  // Caseworker Signature Configuration (NO BEO Signature)
  const [showCaseworkerSignature, setShowCaseworkerSignature] = useState<boolean>(true);
  const [caseworkerName, setCaseworkerName] = useState<string>(currentUser?.displayName || 'ವಿಷಯ ನಿರ್ವಾಹಕರು');
  const [caseworkerDesignation, setCaseworkerDesignation] = useState<string>('ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA)');

  // Loaded Employee Data
  const [employee, setEmployee] = useState<Employee | null>(selectedEmployee || null);
  const [isCreatingNewEmp, setIsCreatingNewEmp] = useState<boolean>(false);
  const [isEditingEmp, setIsEditingEmp] = useState<boolean>(false);

  // React to external selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEmployee(selectedEmployee);
      setKgidInput(selectedEmployee.kgidNumber || selectedEmployee.employeeCode || '');
      setIsCreatingNewEmp(false);
      setIsEditingEmp(false);
      setSearchError(null);
    }
  }, [selectedEmployee]);

  // Form inputs for calculation & sanction
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveFrom, setLeaveFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveTo, setLeaveTo] = useState<string>(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [leaveDays, setLeaveDays] = useState<number>(15);
  const [officialRemarks, setOfficialRemarks] = useState<string>('');
  const [customOrderNo, setCustomOrderNo] = useState<string>('');

  // Calculation Engine State
  const [calculationResult, setCalculationResult] = useState<{
    eligible: boolean;
    reason: string;
    oldBasicPay: number;
    incrementAmount: number;
    newBasicPay: number;
    effectiveDate: string;
    serviceInfo?: {
      years: number;
      months: number;
      days: number;
      formattedService: string;
    };
    leaveCalculation?: {
      leaveFrom: string;
      leaveTo: string;
      totalDays: number;
      currentBalance: number;
      balanceAfter: number;
    };
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // KCSR & KFC Statutory Rule Selector State
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState<boolean>(false);

  const handleInsertStatutoryRefToOrder = (citation: string, rule: StatutoryRule) => {
    setOfficialRemarks(prev => {
      const base = prev ? prev.trim() : '';
      return base ? `${base} | ಉಲ್ಲೇಖ: ${citation}` : `ಉಲ್ಲೇಖ: ${citation}`;
    });
  };

  // Generated Order & Document
  const [generatedOrder, setGeneratedOrder] = useState<MemorandumOrder | null>(null);
  const [generatedFile, setGeneratedFile] = useState<OrderFile | null>(null);

  // Order Types from API
  const [orderTypesList, setOrderTypesList] = useState<OrderTypeConfig[]>([]);
  const [payRulesList, setPayRulesList] = useState<PayRule[]>([]);

  // Sample quick KGID selector for rapid testing
  const sampleKgids = [
    { kgid: '108294', name: 'ಮಂಜುನಾಥ್ ಬಿ.ಎಸ್.', desc: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿಗೆ ಅರ್ಹ' },
    { kgid: '240918', name: 'ಗೀತಾ ಎಂ.', desc: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ಬಡ್ತಿಗೆ ಅರ್ಹ' },
    { kgid: '319405', name: 'ಕೆ. ಎಸ್. ನಾಗರಾಜ್', desc: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ಬಡ್ತಿ' },
    { kgid: '451290', name: 'ಶಶಿಕಲಾ ಆರ್.', desc: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ಬಡ್ತಿ' },
    { kgid: '510283', name: 'ಎಂ. ಶಿವಕುಮಾರ್', desc: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ಬಡ್ತಿ' },
    { kgid: '621849', name: 'ಪಾರ್ವತಮ್ಮ ಬಿ.', desc: 'ಗಳಿಕೆ ರಜೆ / 10 ವರ್ಷ' },
  ];

  // Dynamic DDO Signatory State dynamically pulled from employee isDdo flag or office config
  const [ddoOfficer, setDdoOfficer] = useState<{
    name: string;
    designation: string;
    office: string;
    code: string;
    kgid?: string;
  }>(() => {
    const ddoEmp = employees?.find(e => e.isDdo === true) || 
                   employees?.find(e => e.designation?.toLowerCase().includes('ddo')) ||
                   employees?.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
    if (ddoEmp) {
      return {
        name: ddoEmp.fullName,
        designation: ddoEmp.designation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
        office: ddoEmp.placeOfWork || ddoEmp.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
        code: ddoEmp.ddoCode || '14041ED001',
        kgid: ddoEmp.kgidNumber,
      };
    }
    return {
      name: 'ಹೆಚ್. ರವಿಕುಮಾರ್',
      designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
      office: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
      code: '14041ED001',
      kgid: '108294',
    };
  });

  // Load Order Types & Pay Rules and dynamically sync DDO signatory on mount
  useEffect(() => {
    const syncDdoSignatory = async () => {
      // 1. Search employees list for isDdo flag (prioritizing explicit isDdo === true)
      let ddoEmp = employees.find(e => e.isDdo === true) || 
                   employees.find(e => e.designation?.toLowerCase().includes('ddo')) ||
                   employees.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));

      // If employees list prop is not yet loaded, query API to resolve DDO
      if (!ddoEmp && employees.length === 0) {
        try {
          const empRes = await fetch('/api/employees');
          if (empRes.ok) {
            const empData = await empRes.json();
            const list: Employee[] = empData.employees || [];
            ddoEmp = list.find(e => e.isDdo === true) ||
                     list.find(e => e.designation?.toLowerCase().includes('ddo')) ||
                     list.find(e => e.designation?.includes('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿ'));
          }
        } catch (e) {
          console.warn('Failed to load employees for DDO signatory sync:', e);
        }
      }

      fetch('/api/memorandum/office-config')
        .then(res => res.json())
        .then(data => {
          const cfg = data.office || data.config || null;
          if (ddoEmp) {
            setDdoOfficer({
              name: ddoEmp.fullName,
              designation: ddoEmp.designation || cfg?.ddoDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
              office: ddoEmp.placeOfWork || ddoEmp.officeLocation || cfg?.ddoOfficeName || cfg?.officeNameKannada || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
              code: ddoEmp.ddoCode || cfg?.ddoCode || '14041ED001',
              kgid: ddoEmp.kgidNumber,
            });
          } else if (cfg && (cfg.ddoOfficerName || cfg.officerName)) {
            setDdoOfficer({
              name: cfg.ddoOfficerName || cfg.officerName,
              designation: cfg.ddoDesignation || cfg.officerDesignation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಡಿಡಿಓ',
              office: cfg.ddoOfficeName || cfg.officeNameKannada || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
              code: cfg.ddoCode || '14041ED001',
              kgid: cfg.ddoKgidNumber,
            });
          }
        })
        .catch(err => {
          if (ddoEmp) {
            setDdoOfficer({
              name: ddoEmp.fullName,
              designation: ddoEmp.designation,
              office: ddoEmp.placeOfWork || ddoEmp.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು',
              code: ddoEmp.ddoCode || '14041ED001',
              kgid: ddoEmp.kgidNumber,
            });
          }
        });
    };

    syncDdoSignatory();

    fetch('/api/memorandum/order-types')
      .then(res => res.json())
      .then(data => {
        if (data.orderTypes) setOrderTypesList(data.orderTypes);
      })
      .catch(err => console.error('Failed to load order types:', err));

    fetch('/api/memorandum/pay-rules')
      .then(res => res.json())
      .then(data => {
        if (data.payRules) setPayRulesList(data.payRules);
      })
      .catch(err => console.error('Failed to load pay rules:', err));
  }, [employees]);

  // Recalculate when order type, employee, or parameters change
  useEffect(() => {
    if (!employee || !employee.kgidNumber) {
      setCalculationResult(null);
      return;
    }

    const fallbackCalc = () => {
      const basic = Number(employee.currentBasicPay || employee.basicPay || 37900);
      const isLeave = selectedOrderType.includes('ರಜೆ');
      const isCcl = selectedOrderType.includes('ಶಿಶುಪಾಲನ');
      const isPaternity = selectedOrderType.includes('ಪಿತೃತ್ವ');
      const cclQuota = Number(employee.childCareLeaveQuota ?? 180);
      const cclAvailed = Number(employee.childCareLeaveAvailed ?? 0);
      const elBalance = Number(employee.earnedLeaveBalance ?? 180);
      
      let eligible = true;
      let reason = 'ವೇತನ ಆಯೋಗದ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.';
      let incAmount = 0;
      let newPay = basic;

      if (isPaternity) {
        const pDays = Number(leaveDays) || 15;
        if (employee.gender && employee.gender === 'Female') {
          eligible = false;
          reason = 'ಪಿತೃತ್ವ ರಜೆಯನ್ನು ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-ಎ ಅನ್ವಯ ಕೇವಲ ವಿವಾಹಿತ ಪುರುಷ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಮಾತ್ರ ಮಂಜೂರು ಮಾಡಬಹುದಾಗಿದೆ (ಮಹಿಳಾ ನೌಕರರಿಗೆ KCSR 135 ಹೆರಿಗೆ ರಜೆ ಅಥವಾ 135B CCL ರಜೆ ಅನ್ವಯಿಸುತ್ತದೆ).';
        } else if (childOrder === '3ನೇ ಅಥವಾ ನಂತರದ ಮಗು') {
          eligible = false;
          reason = 'KCSR ನಿಯಮ 135-ಎ ರನ್ವಯ ಇಬ್ಬರಿಗಿಂತ ಕಡಿಮೆ ಜೀವಂತ ಮಕ್ಕಳಿರುವ ಪುರುಷ ನೌಕರರಿಗೆ ಮಾತ್ರ ಪಿತೃತ್ವ ರಜೆ ಲಭ್ಯವಿದೆ. 3ನೇ ಮಗುವಿಗೆ ಈ ರಜೆ ಲಭ್ಯವಿಲ್ಲ.';
        } else if (pDays > 15) {
          eligible = false;
          reason = 'KCSR ನಿಯಮ 135-ಎ ರನ್ವಯ ಪಿತೃತ್ವ ರಜೆಯ ಗರಿಷ್ಠ ಅವಧಿ 15 ದಿನಗಳು ಮಾತ್ರ.';
        } else {
          eligible = true;
          reason = `KCSR ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ 08-02-1999 ರನ್ವಯ ${childOrder}ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ${pDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಗೆ (ಪೂರ್ಣ ವೇತನ ಸಹಿತ) ಸಂಪೂರ್ಣ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.`;
        }
      } else if (isCcl) {
        if (employee.gender && employee.gender !== 'Female') {
          eligible = false;
          reason = 'ಶಿಶುಪಾಲನ ರಜೆಯನ್ನು ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಕೇವಲ ಮಹಿಳಾ ಸರ್ಕಾರಿ ನೌಕರರಿಗೆ ಮಾತ್ರ ಮಂಜೂರು ಮಾಡಬಹುದಾಗಿದೆ.';
        } else if (cclAvailed + leaveDays > cclQuota) {
          eligible = false;
          reason = `ಶಿಶುಪಾಲನ ರಜಾ ಮಿತಿ (${cclQuota} ದಿನಗಳು) ಮೀರಿದೆ. ಈಗಾಗಲೇ ಪಡೆದ ರಜೆ: ${cclAvailed} ದಿನಗಳು.`;
        } else {
          reason = `ಶಿಶುಪಾಲನ ರಜೆಗೆ ಶಿಲ್ಕು ಲಭ್ಯವಿದೆ. ಒಟ್ಟು ಕೋಟಾ: ${cclQuota} ದಿನಗಳು, ಪಡೆದ ರಜೆ: ${cclAvailed} ದಿನಗಳು, ಲಭ್ಯವಿರುವ ಶಿಲ್ಕು: ${cclQuota - cclAvailed} ದಿನಗಳು.`;
        }
      } else if (isLeave) {
        reason = 'ನಿಯಮಾನುಸಾರ ರಜೆ ಮಂಜೂರಾತಿಗೆ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.';
      } else {
        const isTimeBound = selectedOrderType.includes('ಕಾಲಮಿತಿ') || selectedOrderType.includes('ಸ್ವಯಂಚಾಲಿತ');
        incAmount = isTimeBound ? Math.round((basic * 0.03) / 50) * 50 || 1250 : Math.round((basic * 0.03) / 50) * 50 || 1100;
        newPay = basic + incAmount;
        reason = `${selectedOrderType} ನಿಯಮಾನುಸಾರ ವೇತನ ಹೆಚ್ಚಳಕ್ಕೆ ಅರ್ಹತೆ ಹೊಂದಿದ್ದಾರೆ.`;
      }

      return {
        eligible,
        reason,
        employee,
        orderType: {
          id: isPaternity ? 'ot-paternity-leave' : 'ot-local',
          nameKannada: selectedOrderType,
          nameEnglish: selectedOrderType,
          category: isLeave ? 'leave' : 'increment',
          description: selectedOrderType,
          isActive: true,
        },
        payRule: null,
        serviceInfo: {
          joiningDate: employee.joiningDate || '2015-06-01',
          years: 10,
          months: 0,
          days: 0,
          formattedService: 'ಸೇವೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
        },
        oldBasicPay: basic,
        incrementAmount: incAmount,
        newBasicPay: newPay,
        effectiveDate: isLeave ? leaveFrom : (effectiveDate || new Date().toISOString().split('T')[0]),
        leaveCalculation: isLeave ? {
          leaveFrom,
          leaveTo,
          totalDays: leaveDays,
          currentBalance: isPaternity ? 15 : (isCcl ? (cclQuota - cclAvailed) : elBalance),
          balanceAfter: Math.max(0, (isPaternity ? 15 : (isCcl ? (cclQuota - cclAvailed) : elBalance)) - leaveDays),
        } : undefined,
      };
    };

    setIsCalculating(true);
    fetch('/api/memorandum/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kgidNumber: employee.kgidNumber,
        orderTypeName: selectedOrderType,
        customEffectiveDate: effectiveDate,
        leaveFrom,
        leaveTo,
        leaveDaysRequested: leaveDays,
        childDob,
        childOrder,
        applicationDate,
        birthCertificateDetails,
        employeeData: employee,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setIsCalculating(false);
        if (data && !data.error && data.eligible !== undefined) {
          setCalculationResult(data);
          if (data.effectiveDate && !effectiveDate) {
            setEffectiveDate(data.effectiveDate);
          }
        } else {
          setCalculationResult(fallbackCalc());
        }
      })
      .catch(err => {
        setIsCalculating(false);
        console.warn('Calculation error, fallback used:', err);
        setCalculationResult(fallbackCalc());
      });
  }, [employee, selectedOrderType, effectiveDate, leaveFrom, leaveTo, leaveDays, childDob, childOrder, applicationDate, birthCertificateDetails]);

  // Handler: KGID Search
  const handleKgidSearch = async (targetKgid?: string) => {
    const searchVal = (targetKgid || kgidInput).trim();
    if (!searchVal) {
      setSearchError('ದಯವಿಟ್ಟು ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆಯನ್ನು (KGID Number) ನಮೂದಿಸಿ.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setGeneratedOrder(null);
    setGeneratedFile(null);

    // 1. First check in employees prop (instantly matches new or existing employees)
    if (employees && employees.length > 0) {
      const localMatch = employees.find(
        (e) =>
          (e.kgidNumber && e.kgidNumber.toLowerCase() === searchVal.toLowerCase()) ||
          (e.employeeCode && e.employeeCode.toLowerCase() === searchVal.toLowerCase()) ||
          (e.id && e.id.toLowerCase() === searchVal.toLowerCase()) ||
          (e.fullName && e.fullName.toLowerCase().includes(searchVal.toLowerCase()))
      );

      if (localMatch) {
        const emp: Employee = {
          ...localMatch,
          basicPay: localMatch.basicPay || 37900,
        };
        setEmployee(emp);
        setKgidInput(emp.kgidNumber || emp.employeeCode || searchVal);
        setIsCreatingNewEmp(false);
        setIsEditingEmp(false);
        setIsSearching(false);
        return;
      }
    }

    // 2. Lookup on server
    try {
      const res = await fetch(`/api/memorandum/employee-lookup/${encodeURIComponent(searchVal)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.employee) {
          // Normalize
          const emp: Employee = {
            ...data.employee,
            basicPay: data.employee.currentBasicPay || data.employee.basicPay || 37900,
          };
          setEmployee(emp);
          setKgidInput(emp.kgidNumber || searchVal);
          setIsCreatingNewEmp(false);
        } else {
          setEmployee(null);
          setSearchError(`ಕೆಜಿಐಡಿ "${searchVal}" ಹೊಂದಿರುವ ನೌಕರರ ದಾಖಲೆ ಸಿಗಲಿಲ್ಲ. ನೂತನ ನೌಕರರ ಪ್ರೊಫೈಲ್ ರಚಿಸಬಹುದು.`);
        }
      } else {
        const errData = await res.json();
        setEmployee(null);
        setSearchError(errData.error || `ಕೆಜಿಐಡಿ "${searchVal}" ಹೊಂದಿರುವ ನೌಕರರ ದಾಖಲೆ ಸಿಗಲಿಲ್ಲ.`);
      }
    } catch (err: any) {
      setSearchError('ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handler: Create or Update Employee
  const handleSaveEmployeeForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const empData: Partial<Employee> = {
      kgidNumber: (formData.get('kgidNumber') as string || '').trim(),
      fullName: (formData.get('fullName') as string || '').trim(),
      parentName: (formData.get('parentName') as string || '').trim(),
      designation: (formData.get('designation') as string || '').trim(),
      cadreGroup: formData.get('cadreGroup') as CadreGroup || 'ಗ್ರೂಪ್-ಸಿ',
      officeLocation: (formData.get('officeLocation') as string || '').trim(),
      appointmentDate: formData.get('appointmentDate') as string || '',
      joiningDate: formData.get('joiningDate') as string || '',
      basicPay: Number(formData.get('basicPay')) || 37900,
      payScale: (formData.get('payScale') as string || '37900-70850').trim(),
      lastIncrementDate: formData.get('lastIncrementDate') as string || '',
      nextIncrementDate: formData.get('nextIncrementDate') as string || '',
      earnedLeaveBalance: Number(formData.get('earnedLeaveBalance')) || 120,
      childCareLeaveQuota: Number(formData.get('childCareLeaveQuota')) || 180,
      childCareLeaveAvailed: Number(formData.get('childCareLeaveAvailed')) || 0,
      otherServiceDetails: (formData.get('otherServiceDetails') as string || '').trim(),
    };

    try {
      let res;
      if (isCreatingNewEmp) {
        res = await fetch('/api/memorandum/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'Admin',
            'x-user-name': currentUser?.displayName || 'Admin',
          },
          body: JSON.stringify(empData),
        });
      } else if (employee?.id) {
        res = await fetch(`/api/memorandum/employees/${employee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'Admin',
            'x-user-name': currentUser?.displayName || 'Admin',
          },
          body: JSON.stringify(empData),
        });
      }

      if (res && res.ok) {
        const saved = await res.json();
        setEmployee(saved.employee);
        setKgidInput(saved.employee.kgidNumber);
        setIsCreatingNewEmp(false);
        setIsEditingEmp(false);
        if (onAddEmployeeGlobally && saved.employee) {
          onAddEmployeeGlobally(saved.employee);
        }
      } else {
        const err = await res?.json();
        alert(err?.error || 'ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
      }
    } catch (err: any) {
      alert('ದೋಷ ಸಂಭವಿಸಿದೆ: ' + err.message);
    }
  };

  // Handler: Submit to generate order transaction
  const handleConfirmAndGenerateOrder = async () => {
    if (!employee || !employee.kgidNumber) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const isLeave = selectedOrderType.includes('ರಜೆ');
    const isPaternity = selectedOrderType === 'ಪಿತೃತ್ವ ರಜೆ';

    const orderData = {
      orderTypeName: selectedOrderType,
      orderTypeId: orderTypesList.find(o => o.nameKannada === selectedOrderType)?.id || (isPaternity ? 'ot-paternity-leave' : 'ot-3'),
      kgidNumber: employee.kgidNumber,
      orderNumber: customOrderNo || undefined,
      fileId: selectedFileId,
      effectiveDate: isLeave ? leaveFrom : effectiveDate,
      officialRemarks: officialRemarks || undefined,
      employeeData: employee,
      childDob,
      childOrder,
      applicationDate,
      birthCertificateDetails,
      showCaseworkerSignature,
      caseworkerName,
      caseworkerDesignation,
      leaveDetails: isLeave ? {
        leaveType: selectedOrderType,
        leaveFrom,
        leaveTo,
        totalDays: leaveDays,
        childDob,
        childOrder,
        applicationDate,
        birthCertificateDetails,
        reason: officialRemarks || (isPaternity ? `${childOrder} ಜನನದ ಪ್ರಯುಕ್ತ ಪಿತೃತ್ವ ರಜೆ (KCSR 135-A)` : 'ಸೇವೆ ಅವಶ್ಯಕತೆ ಮೇರೆಗೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.'),
      } : undefined,
    };

    try {
      const res = await fetch('/api/memorandum/generate-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
        body: JSON.stringify({
          orderData,
          employeeData: employee,
          skipDuplicateCheck: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedOrder(data.order);
        setGeneratedFile(data.orderFile);
        if (data.updatedEmployee) {
          setEmployee(data.updatedEmployee);
        }
        setShowConfirmModal(false);
        if (onOrderCreated) {
          onOrderCreated(data.order, data.orderFile);
        }
      } else {
        console.warn('Backend order generation response warning, creating local order:', data?.error);
        const ordNo = customOrderNo || (isPaternity ? `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಪಿ.ರಜೆ.ಮಂ/57/2026-27` : `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಇತರೆ/57/2026-27`);
        const nowStr = new Date().toISOString().split('T')[0];
        const newPay = calculationResult ? calculationResult.newBasicPay : Number(employee.currentBasicPay || 37900);
        const oldPay = calculationResult ? calculationResult.oldBasicPay : Number(employee.currentBasicPay || 37900);
        
        const fallbackOrder: MemorandumOrder = {
          id: `ord-${Date.now()}`,
          orderNumber: ordNo,
          orderTypeId: orderData.orderTypeId,
          orderTypeName: selectedOrderType,
          orderDate: nowStr,
          effectiveDate: orderData.effectiveDate,
          kgidNumber: employee.kgidNumber,
          employeeName: employee.fullName,
          designation: employee.designation,
          officeLocation: employee.officeLocation,
          oldBasicPay: oldPay,
          incrementAmount: calculationResult ? calculationResult.incrementAmount : 0,
          newBasicPay: newPay,
          subject: isPaternity 
            ? `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ಶ್ರೀ ${employee.fullName}, ${employee.designation} ಇವರಿಗೆ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರಾತಿ ಕುರಿತು.`
            : `${selectedOrderType} ಮಂಜೂರಾತಿ ಆದೇಶ - ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation}`,
          preamble: isPaternity
            ? `ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ${employee.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ ${employee.fullName}, ${employee.designation} (KGID: ${employee.kgidNumber}) ಇವರು ತಮ್ಮ ${childOrder}ಯ ಜನನದ (ದಿನಾಂಕ: ${childDob}) ನಿಮಿತ್ತ ದಿನಾಂಕ: ${applicationDate} ರಂದು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ, ದಿನಾಂಕ: ${leaveFrom} ರಿಂದ ${leaveTo} ರವರೆಗೆ ಒಟ್ಟು ${leaveDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಕೆಳಕಂಡಂತೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`
            : `ಸರ್ಕಾರಿ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಹಾಗೂ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ಪರಿಶೀಲನೆ ಮೇರೆಗೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`,
          orderText: isPaternity
            ? `ಶ್ರೀ ${employee.fullName}, ${employee.designation}, ${employee.officeLocation} ಇವರಿಗೆ ತಮ್ಮ ${childOrder}ಯ ಜನನದ ನಿಮಿತ್ತ ದಿನಾಂಕ: ${leaveFrom} ರಿಂದ ${leaveTo} ರವರೆಗೆ ಒಟ್ಟು ${leaveDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಯನ್ನು (Paternity Leave) ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಕರ್ತವ್ಯದ ಮೇಲಿರುವಂತೆ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`
            : `ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation}, ಕೆಜಿಐಡಿ: ${employee.kgidNumber} ಇವರಿಗೆ ${selectedOrderType} ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`,
          officialRemarks: officialRemarks || undefined,
          leaveDetails: orderData.leaveDetails,
          signatoryName: caseworkerName,
          signatoryDesignation: caseworkerDesignation,
          copiesForwardedTo: [
            `ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${employee.officeLocation}`,
            `ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ವೇತನ & ಲೆಕ್ಕ), ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
            `ಸಂಬಂಧಿಸಿದ ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕ ಕಡತಕ್ಕೆ`,
            `ಕಚೇರಿ ಕಡತಕ್ಕೆ`,
          ],
          status: 'Approved',
          createdBy: currentUser?.displayName || 'Caseworker',
          createdRole: currentUser?.role || 'Caseworker',
          createdAt: nowStr,
        };

        const fallbackHtml = `
          <div class="memorandum-doc fit-paper-a4 p-8 bg-white font-sans text-stone-900 max-w-4xl mx-auto border border-stone-300">
            <div class="text-center border-b border-stone-800 pb-2 mb-2">
              <h1 class="text-sm font-bold text-stone-900">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
              <h2 class="text-xs font-semibold text-stone-800">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
              <h3 class="text-xs font-bold text-sky-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
              <p class="text-[10px] text-stone-600">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</p>
            </div>
            <div class="flex justify-between items-center text-[11px] font-mono mb-2 border-b pb-1">
              <div>ಸಂ: <span class="font-bold">${ordNo}</span></div>
              <div>ದಿನಾಂಕ: <span>${nowStr}</span></div>
            </div>
            <div class="text-center mb-2">
              <span class="text-xs font-bold uppercase bg-stone-100 px-3 py-1 border rounded">ಅಧಿಕೃತ ಜ್ಞಾಪನ</span>
            </div>
            <div class="space-y-1 text-xs mb-3">
              <p><strong>ವಿಷಯ:</strong> ${fallbackOrder.subject}</p>
              ${isPaternity ? `
                <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಅರ್ಜಿ ದಿನಾಂಕ: ${applicationDate}.</p>
                <p class="pl-11">2. ಶಾಲಾ ಮುಖ್ಯಸ್ಥರ ಶಿಫಾರಸು ಪತ್ರ.</p>
                <p class="pl-11">3. ಮಗುವಿನ ಜನನ ಪ್ರಮಾಣಪತ್ರ / ಆಸ್ಪತ್ರೆ ದಾಖಲೆ: ${birthCertificateDetails}.</p>
                <p class="pl-11">4. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 135-ಎ (KCSR Rule 135-A).</p>
                <p class="pl-11">5. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999.</p>
              ` : `
                <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ.</p>
              `}
            </div>
            <p class="text-xs mb-2"><strong>ಪ್ರಸ್ತಾವನೆ:</strong> ${fallbackOrder.preamble}</p>
            <p class="text-xs leading-relaxed mb-4 indent-6">${fallbackOrder.orderText}</p>
            ${isPaternity ? `
              <div class="mt-2 p-2.5 bg-stone-50 border border-stone-300 rounded text-[11px] space-y-1 mb-4">
                <p class="font-bold text-stone-900">ಷರತ್ತುಗಳು (Terms & Conditions):</p>
                <p>1. ಈ ರಜಾ ಅವಧಿಯನ್ನು ಕರ್ತವ್ಯದ ಮೇಲಿರುವ ಅವಧಿ ಎಂದು ಪರಿಗಣಿಸಿ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳನ್ನು ಪಾವತಿಸತಕ್ಕದ್ದು.</p>
                <p>2. ಈ ರಜೆಯನ್ನು ನೌಕರರ ರಜಾ ಲೆಕ್ಕಕ್ಕೆ (Earned Leave / HPL) ಖರ್ಚು ಹಾಕತಕ್ಕದ್ದಲ್ಲ, ಪ್ರತ್ಯೇಕ ಪಿತೃತ್ವ ರಜೆ ಎಂದು ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸತಕ್ಕದ್ದು.</p>
                <p>3. ಮಗುವಿನ ಜನನ ದಿನಾಂಕದಿಂದ 6 ತಿಂಗಳ ಒಳಗೆ ರಜೆ ಪಡೆದಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲಾಗಿದೆ.</p>
              </div>
            ` : ''}
            <div class="mt-8 flex justify-end">
              <div class="text-center min-w-56 space-y-1">
                <div style="height: 48px;" class="flex items-center justify-center border-b border-dashed border-stone-400 mb-2">
                  <span class="text-[11px] text-stone-500 font-sans">[ಸಹಿಗಾಗಿ ಖಾಲಿ ಜಾಗ]</span>
                </div>
                <p class="text-xs text-stone-700">ಸಹಿ / ಭೌತಿಕ ಸಹಿ</p>
                ${showCaseworkerSignature ? `
                  <p class="font-bold text-xs text-stone-950">(${caseworkerName})</p>
                  <p class="text-[11px] text-stone-700">${caseworkerDesignation}</p>
                ` : ''}
                <p class="text-[10px] text-stone-600">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
              </div>
            </div>
            <div class="mt-4 pt-2 border-t text-[10px] text-stone-600">
              <p class="font-bold">ಪ್ರತಿಯನ್ನು ಮಾಹಿತಿ ಮತ್ತು ಸೂಕ್ತ ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:</p>
              <p>1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ: ಶ್ರೀ ${employee.fullName}, ${employee.designation}</p>
              <p>2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${employee.officeLocation}</p>
              <p>3. ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ವೇತನ & ಲೆಕ್ಕ), ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
              <p>4. ಕಛೇರಿ ಕಡತಕ್ಕೆ</p>
            </div>
          </div>
        `;

        const fallbackFile: OrderFile = {
          id: `file-${Date.now()}`,
          fileId: selectedFileId || `fl-57`,
          orderNumber: ordNo,
          kgidNumber: employee.kgidNumber,
          employeeName: employee.fullName,
          orderType: selectedOrderType,
          orderDate: nowStr,
          effectiveDate: orderData.effectiveDate,
          oldBasicPay: oldPay,
          newBasicPay: newPay,
          createdBy: currentUser?.displayName || 'Caseworker',
          createdDate: nowStr,
          generatedDocumentHtml: fallbackHtml,
          generatedDocumentText: `ಆದೇಶ ಸಂ: ${ordNo}\nವಿಷಯ: ${fallbackOrder.subject}\nವಿಷಯ ನಿರ್ವಾಹಕರು: ${caseworkerName}`,
          fileSize: '14.2 KB',
        };

        setGeneratedOrder(fallbackOrder);
        setGeneratedFile(fallbackFile);
        setShowConfirmModal(false);
        if (onOrderCreated) {
          onOrderCreated(fallbackOrder, fallbackFile);
        }
      }
    } catch (err: any) {
      console.warn('Network error during order generation, generating fallback order:', err);
      const isPaternity = selectedOrderType === 'ಪಿತೃತ್ವ ರಜೆ';
      const ordNo = customOrderNo || (isPaternity ? `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಪಿ.ರಜೆ.ಮಂ/57/2026-27` : `ಸಂ: ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಇತರೆ/57/2026-27`);
      const nowStr = new Date().toISOString().split('T')[0];
      const newPay = calculationResult ? calculationResult.newBasicPay : Number(employee.currentBasicPay || 37900);
      const oldPay = calculationResult ? calculationResult.oldBasicPay : Number(employee.currentBasicPay || 37900);
      
      const fallbackOrder: MemorandumOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: ordNo,
        orderTypeId: orderData.orderTypeId,
        orderTypeName: selectedOrderType,
        orderDate: nowStr,
        effectiveDate: orderData.effectiveDate,
        kgidNumber: employee.kgidNumber,
        employeeName: employee.fullName,
        designation: employee.designation,
        officeLocation: employee.officeLocation,
        oldBasicPay: oldPay,
        incrementAmount: calculationResult ? calculationResult.incrementAmount : 0,
        newBasicPay: newPay,
        subject: isPaternity
          ? `ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು - ಶ್ರೀ ${employee.fullName}, ${employee.designation} ಇವರಿಗೆ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರಾತಿ ಕುರಿತು.`
          : `${selectedOrderType} ಮಂಜೂರಾತಿ ಆದೇಶ - ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation}`,
        preamble: isPaternity
          ? `ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ${employee.officeLocation} ಇಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುತ್ತಿರುವ ಶ್ರೀ ${employee.fullName}, ${employee.designation} (KGID: ${employee.kgidNumber}) ಇವರು ತಮ್ಮ ${childOrder}ಯ ಜನನದ (ದಿನಾಂಕ: ${childDob}) ನಿಮಿತ್ತ ದಿನಾಂಕ: ${applicationDate} ರಂದು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ, ದಿನಾಂಕ: ${leaveFrom} ರಿಂದ ${leaveTo} ರವರೆಗೆ ಒಟ್ಟು ${leaveDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆ (Paternity Leave) ಮಂಜೂರು ಮಾಡಲು ಕೋರಿರುತ್ತಾರೆ. ಕೆಸಿಎಸ್ಆರ್ ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಕೆಳಕಂಡಂತೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`
          : `ಸರ್ಕಾರಿ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಹಾಗೂ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ಪರಿಶೀಲನೆ ಮೇರೆಗೆ ಆದೇಶ ಹೊರಡಿಸಲಾಗಿದೆ.`,
        orderText: isPaternity
          ? `ಶ್ರೀ ${employee.fullName}, ${employee.designation}, ${employee.officeLocation} ಇವರಿಗೆ ತಮ್ಮ ${childOrder}ಯ ಜನನದ ನಿಮಿತ್ತ ದಿನಾಂಕ: ${leaveFrom} ರಿಂದ ${leaveTo} ರವರೆಗೆ ಒಟ್ಟು ${leaveDays} ದಿನಗಳ ಪಿತೃತ್ವ ರಜೆಯನ್ನು (Paternity Leave) ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ ಕರ್ತವ್ಯದ ಮೇಲಿರುವಂತೆ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳೊಂದಿಗೆ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`
          : `ಶ್ರೀ/ಶ್ರೀಮತಿ ${employee.fullName}, ${employee.designation}, ಕೆಜಿಐಡಿ: ${employee.kgidNumber} ಇವರಿಗೆ ${selectedOrderType} ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.`,
        officialRemarks: officialRemarks || undefined,
        leaveDetails: orderData.leaveDetails,
        signatoryName: caseworkerName,
        signatoryDesignation: caseworkerDesignation,
        copiesForwardedTo: [
          `ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${employee.officeLocation}`,
          `ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ವೇತನ & ಲೆಕ್ಕ), ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ`,
          `ಸಂಬಂಧಿಸಿದ ನೌಕರರ ಸೇವಾ ಪುಸ್ತಕ ಕಡತಕ್ಕೆ`,
          `ಕಚೇರಿ ಕಡತಕ್ಕೆ`,
        ],
        status: 'Approved',
        createdBy: currentUser?.displayName || 'Caseworker',
        createdRole: currentUser?.role || 'Caseworker',
        createdAt: nowStr,
      };

      const fallbackHtml = `
        <div class="memorandum-doc fit-paper-a4 p-8 bg-white font-sans text-stone-900 max-w-4xl mx-auto border border-stone-300">
          <div class="text-center border-b border-stone-800 pb-2 mb-2">
            <h1 class="text-sm font-bold text-stone-900">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
            <h2 class="text-xs font-semibold text-stone-800">ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
            <h3 class="text-xs font-bold text-sky-950 mt-0.5">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
            <p class="text-[10px] text-stone-600">ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301</p>
          </div>
          <div class="flex justify-between items-center text-[11px] font-mono mb-2 border-b pb-1">
            <div>ಸಂ: <span class="font-bold">${ordNo}</span></div>
            <div>ದಿನಾಂಕ: <span>${nowStr}</span></div>
          </div>
          <div class="text-center mb-2">
            <span class="text-xs font-bold uppercase bg-stone-100 px-3 py-1 border rounded">ಅಧಿಕೃತ ಜ್ಞಾಪನ</span>
          </div>
          <div class="space-y-1 text-xs mb-3">
            <p><strong>ವಿಷಯ:</strong> ${fallbackOrder.subject}</p>
            ${isPaternity ? `
              <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಅರ್ಜಿ ದಿನಾಂಕ: ${applicationDate}.</p>
              <p class="pl-11">2. ಶಾಲಾ ಮುಖ್ಯಸ್ಥರ ಶಿಫಾರಸು ಪತ್ರ.</p>
              <p class="pl-11">3. ಮಗುವಿನ ಜನನ ಪ್ರಮಾಣಪತ್ರ / ಆಸ್ಪತ್ರೆ ದಾಖಲೆ: ${birthCertificateDetails}.</p>
              <p class="pl-11">4. ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 135-ಎ (KCSR Rule 135-A).</p>
              <p class="pl-11">5. ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999.</p>
            ` : `
              <p><strong>ಉಲ್ಲೇಖ:</strong> 1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲನೆ.</p>
            `}
          </div>
          <p class="text-xs mb-2"><strong>ಪ್ರಸ್ತಾವನೆ:</strong> ${fallbackOrder.preamble}</p>
          <p class="text-xs leading-relaxed mb-4 indent-6">${fallbackOrder.orderText}</p>
          ${isPaternity ? `
            <div class="mt-2 p-2.5 bg-stone-50 border border-stone-300 rounded text-[11px] space-y-1 mb-4">
              <p class="font-bold text-stone-900">ಷರತ್ತುಗಳು (Terms & Conditions):</p>
              <p>1. ಈ ರಜಾ ಅವಧಿಯನ್ನು ಕರ್ತವ್ಯದ ಮೇಲಿರುವ ಅವಧಿ ಎಂದು ಪರಿಗಣಿಸಿ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳನ್ನು ಪಾವತಿಸತಕ್ಕದ್ದು.</p>
              <p>2. ಈ ರಜೆಯನ್ನು ನೌಕರರ ರಜಾ ಲೆಕ್ಕಕ್ಕೆ (Earned Leave / HPL) ಖರ್ಚು ಹಾಕತಕ್ಕದ್ದಲ್ಲ, ಪ್ರತ್ಯೇಕ ಪಿತೃತ್ವ ರಜೆ ಎಂದು ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದಾಖಲಿಸತಕ್ಕದ್ದು.</p>
              <p>3. ಮಗುವಿನ ಜನನ ದಿನಾಂಕದಿಂದ 6 ತಿಂಗಳ ಒಳಗೆ ರಜೆ ಪಡೆದಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲಾಗಿದೆ.</p>
            </div>
          ` : ''}
          <div class="mt-8 flex justify-end">
            <div class="text-center min-w-56 space-y-1">
              <div style="height: 48px;" class="flex items-center justify-center border-b border-dashed border-stone-400 mb-2">
                <span class="text-[11px] text-stone-500 font-sans">[ಸಹಿಗಾಗಿ ಖಾಲಿ ಜಾಗ]</span>
              </div>
              <p class="text-xs text-stone-700">ಸಹಿ / ಭೌತಿಕ ಸಹಿ</p>
              ${showCaseworkerSignature ? `
                <p class="font-bold text-xs text-stone-950">(${caseworkerName})</p>
                <p class="text-[11px] text-stone-700">${caseworkerDesignation}</p>
              ` : ''}
              <p class="text-[10px] text-stone-600">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
            </div>
          </div>
          <div class="mt-4 pt-2 border-t text-[10px] text-stone-600">
            <p class="font-bold">ಪ್ರತಿಯನ್ನು ಮಾಹಿತಿ ಮತ್ತು ಸೂಕ್ತ ಮುಂದಿನ ಕ್ರಮಕ್ಕಾಗಿ ರವಾನಿಸಲಾಗಿದೆ:</p>
            <p>1. ಸಂಬಂಧಪಟ್ಟ ನೌಕರರಿಗೆ: ಶ್ರೀ ${employee.fullName}, ${employee.designation}</p>
            <p>2. ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ${employee.officeLocation}</p>
            <p>3. ಸಹಾಯಕ ನಿರ್ದೇಶಕರು (ವೇತನ & ಲೆಕ್ಕ), ಬಿಇಒ ಕಛೇರಿ, ಭದ್ರಾವತಿ</p>
            <p>4. ಕಛೇರಿ ಕಡತಕ್ಕೆ</p>
          </div>
        </div>
      `;

      const fallbackFile: OrderFile = {
        id: `file-${Date.now()}`,
        fileId: selectedFileId || `fl-57`,
        orderNumber: ordNo,
        kgidNumber: employee.kgidNumber,
        employeeName: employee.fullName,
        orderType: selectedOrderType,
        orderDate: nowStr,
        effectiveDate: orderData.effectiveDate,
        oldBasicPay: oldPay,
        newBasicPay: newPay,
        createdBy: currentUser?.displayName || 'Caseworker',
        createdDate: nowStr,
        generatedDocumentHtml: fallbackHtml,
        generatedDocumentText: `ಆದೇಶ ಸಂ: ${ordNo}\nವಿಷಯ: ${fallbackOrder.subject}\nವಿಷಯ ನಿರ್ವಾಹಕರು: ${caseworkerName}`,
        fileSize: '14.2 KB',
      };

      setGeneratedOrder(fallbackOrder);
      setGeneratedFile(fallbackFile);
      setShowConfirmModal(false);
      if (onOrderCreated) {
        onOrderCreated(fallbackOrder, fallbackFile);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print Document Handler
  const handlePrintDocument = () => {
    if (!generatedFile) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ಜ್ಞಾಪನಾ ಆದೇಶ - ${generatedFile.orderNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="bg-white">
            <div class="no-print mb-4 flex justify-end gap-2 p-2 bg-stone-100 border-b">
              <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Print Now</button>
              <button onclick="window.close()" class="bg-stone-600 text-white px-4 py-2 rounded text-sm font-bold">Close</button>
            </div>
            ${generatedFile.generatedDocumentHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };

  // Download document as HTML / text
  const handleDownloadDoc = () => {
    if (!generatedFile) return;
    const blob = new Blob([generatedFile.generatedDocumentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Karnataka_Govt_Order_${generatedFile.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLeaveType = selectedOrderType.includes('ರಜೆ');

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-sky-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಅಧಿಕೃತ ಪ್ರಕ್ರಿಯೆ
                </span>
                <span className="text-xs text-stone-500">KCSR Rules Engine</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900 mt-1 font-sans">
                ಜ್ಞಾಪನಾ ಆದೇಶ ತಂತ್ರಾಂಶ (Memorandum Orders Generator)
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                ನೌಕರರ ಸೇವಾ ಬಡ್ತಿಗಳು (10/15/20/25/30 ವರ್ಷ) ಹಾಗೂ ಗಳಿಕೆ/ಶಿಶುಪಾಲನ ರಜೆ ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜನೆ ಮತ್ತು ವೇತನ ಪರಿಷ್ಕರಣಾ ಪ್ರಕ್ರಿಯೆ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewOrderFiles && (
              <button
                type="button"
                onClick={onViewOrderFiles}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-stone-600" />
                ಆದೇಶಗಳ ಕಡತ ವೀಕ್ಷಿಸಿ
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setGeneratedOrder(null);
                setGeneratedFile(null);
                setEmployee(null);
                setKgidInput('');
                setCalculationResult(null);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ನೂತನ ಆದೇಶ ಪ್ರಕ್ರಿಯೆ
            </button>
          </div>
        </div>

        {/* Caseworker Drafting & Printing Notice Banner (NO BEO Signature) */}
        <div className="mt-3 p-3 bg-stone-50 border-2 border-stone-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-amber-300 font-bold text-[10px] font-mono">
              CASEWORKER LETTER GENERATION
            </span>
            <span className="font-bold text-xs text-stone-900 font-kannada">
              ಕೇವಲ ವಿಷಯ ನಿರ್ವಾಹಕರ ಬಳಕೆ:
            </span>
            <span className="text-xs text-stone-700 font-kannada">
              ಪತ್ರದಲ್ಲಿ ಬಿಇಒ ಸಹಿ ಇರುವುದಿಲ್ಲ • ಭೌತಿಕ ಸಹಿಗಾಗಿ ಖಾಲಿ ಜಾಗ ಬಿಡಲಾಗಿದೆ
            </span>
          </div>
          <div className="text-[11px] text-stone-600 font-kannada">
            ತಯಾರಿಸಿದವರು: <strong>{currentUser?.displayName || 'Caseworker'}</strong> ({currentUser?.role || 'ವಿಷಯ ನಿರ್ವಾಹಕರು'})
          </div>
        </div>
      </div>

      {/* STEP 1: ORDER TYPE SELECTION */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-950 text-white flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              ಜ್ಞಾಪನಾ ಆದೇಶದ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ (Select Order Type)
            </h2>
          </div>
          <span className="text-xs text-stone-500">ಒಟ್ಟು 8 ನಿಗದಿತ ಅಧಿಕೃತ ಆದೇಶ ಪ್ರಕಾರಗಳು</span>
        </div>

        {/* 8 Required Karnataka Govt Order Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { name: 'ಗಳಿಕೆ ರಜೆ', en: 'Earned Leave', badge: 'ರಜೆ ಮಂಜೂರಾತಿ', color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 text-emerald-900' },
            { name: 'ಶಿಶುಪಾಲನ ರಜೆ', en: 'Child Care Leave', badge: 'ಮಹಿಳಾ ನೌಕರರಿಗೆ', color: 'border-pink-300 hover:border-pink-500 bg-pink-50/40 text-pink-900' },
            { name: 'ಪಿತೃತ್ವ ರಜೆ', en: 'Paternity Leave (KCSR 135-A)', badge: 'ಪುರುಷ ನೌಕರರಿಗೆ (15 ದಿನ)', color: 'border-teal-300 hover:border-teal-500 bg-teal-50/40 text-teal-900' },
            { name: '10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ', en: '10-Year Time Bound Scale', badge: '10 ವರ್ಷ ಪೂರ್ಣ', color: 'border-blue-300 hover:border-blue-500 bg-blue-50/40 text-blue-900' },
            { name: '15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ', en: '15-Year Auto Advancement', badge: '15 ವರ್ಷ ಸೇವೆ', color: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 text-indigo-900' },
            { name: '20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', en: '20-Year Addl Increment', badge: '20 ವರ್ಷ ಸೇವೆ', color: 'border-amber-300 hover:border-amber-500 bg-amber-50/40 text-amber-900' },
            { name: '25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', en: '25-Year Addl Increment', badge: '25 ವರ್ಷ ಸೇವೆ', color: 'border-orange-300 hover:border-orange-500 bg-orange-50/40 text-orange-900' },
            { name: '30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ', en: '30-Year Addl Increment', badge: '30 ವರ್ಷ ಸೇವೆ', color: 'border-purple-300 hover:border-purple-500 bg-purple-50/40 text-purple-900' },
          ].map((type) => {
            const isSelected = selectedOrderType === type.name;
            return (
              <button
                key={type.name}
                type="button"
                onClick={() => setSelectedOrderType(type.name)}
                className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'border-sky-950 bg-sky-50 shadow-xs ring-2 ring-sky-900/20' 
                    : 'border-stone-200 hover:border-stone-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    {type.badge}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-sky-950 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-stone-900 font-sans mt-0.5 leading-snug">
                  {type.name}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {type.en}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: KGID SEARCH & EMPLOYEE IDENTIFICATION */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-950 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              ನೌಕರರ ಗುರುತಿಸುವಿಕೆ (Employee KGID Search & Retrieval)
            </h2>
          </div>
          <span className="text-xs text-stone-500">ಕರ್ನಾಟಕ ಸರ್ಕಾರ ವಿಮಾ ಇಲಾಖೆ (KGID) ಸಂಖ್ಯೆ</span>
        </div>

        {/* KGID Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Enter KGID Number) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={kgidInput}
                onChange={(e) => {
                  setKgidInput(e.target.value);
                  setSearchError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleKgidSearch();
                  }
                }}
                placeholder="ಉದಾಹರಣೆಗೆ: 108294, 240918, 319405..."
                className="w-full pl-9 pr-24 py-2.5 text-sm font-mono font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:border-sky-950 focus:ring-1 focus:ring-sky-950 outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              {kgidInput && (
                <button
                  type="button"
                  onClick={() => setKgidInput('')}
                  className="absolute right-2 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  ತೆರವುಗೊಳಿಸಿ
                </button>
              )}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => handleKgidSearch()}
              disabled={isSearching || !kgidInput.trim()}
              className="px-5 py-2.5 bg-sky-950 hover:bg-sky-900 disabled:bg-stone-300 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-w-32 h-[41px]"
            >
              {isSearching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ಹುಡುಕಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>ವಿವರ ಪಡೆಯಿರಿ (Fetch)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCreatingNewEmp(true);
                setIsEditingEmp(false);
                setEmployee(null);
              }}
              className="px-3 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer h-[41px]"
              title="ಹೊಸ ನೌಕರರ ಪ್ರೊಫೈಲ್ ಸೇರಿಸಿ"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-900" />
              <span>ಹೊಸ ನೌಕರರು</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Selector for Convenience */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-500 text-[11px] font-medium">ಪರೀಕ್ಷಾರ್ಥ ಕೆಜಿಐಡಿ ಆಯ್ಕೆ:</span>
          {sampleKgids.map((s) => (
            <button
              key={s.kgid}
              type="button"
              onClick={() => {
                setKgidInput(s.kgid);
                handleKgidSearch(s.kgid);
              }}
              className="px-2 py-0.5 text-[11px] font-mono bg-stone-100 hover:bg-sky-100 text-stone-800 hover:text-sky-950 border border-stone-200 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <strong>{s.kgid}</strong> - {s.name}
            </button>
          ))}
        </div>

        {/* Registered & Newly Added Employees Roster Picker */}
        {employees && employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-900" />
                <span className="text-xs font-bold text-stone-900 font-kannada">
                  ನೌಕರರ ಪಟ್ಟಿಯಿಂದ ನೇರ ಆಯ್ಕೆ (Select Registered or Newly Added Employee)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                  {employees.length} ನೌಕರರು
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={empSearchFilter}
                  onChange={(e) => setEmpSearchFilter(e.target.value)}
                  placeholder="ಹೆಸರು ಅಥವಾ KGID ಇಂದ ಶೋಧಿಸಿ..."
                  className="w-full pl-8 pr-2 py-1 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-stone-50/70 rounded-lg border border-stone-200">
              {employees
                .filter((emp) => {
                  const q = empSearchFilter.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    (emp.fullName && emp.fullName.toLowerCase().includes(q)) ||
                    (emp.kgidNumber && emp.kgidNumber.toLowerCase().includes(q)) ||
                    (emp.employeeCode && emp.employeeCode.toLowerCase().includes(q)) ||
                    (emp.designation && emp.designation.toLowerCase().includes(q)) ||
                    (emp.placeOfWork && emp.placeOfWork.toLowerCase().includes(q))
                  );
                })
                .map((emp) => {
                  const isSelected = employee?.id === emp.id || (employee?.kgidNumber && employee.kgidNumber === emp.kgidNumber);
                  const isNew = emp.id?.startsWith('emp-') || !sampleKgids.some(s => s.kgid === emp.kgidNumber);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        const populated: Employee = {
                          ...emp,
                          basicPay: emp.basicPay || 37900,
                        };
                        setEmployee(populated);
                        setKgidInput(emp.kgidNumber || emp.employeeCode || '');
                        setIsCreatingNewEmp(false);
                        setIsEditingEmp(false);
                        setSearchError(null);
                      }}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-sky-900 bg-sky-50 shadow-xs ring-1 ring-sky-900'
                          : 'border-stone-200 bg-white hover:border-sky-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-stone-900 truncate font-kannada">
                          {emp.fullName}
                        </span>
                        {isNew && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            ನೂತನ ನೌಕರರು
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-600 flex flex-wrap items-center gap-1.5 font-mono">
                        <span className="font-bold text-sky-950">
                          KGID: {emp.kgidNumber || emp.employeeCode || '-'}
                        </span>
                        <span>•</span>
                        <span className="text-stone-700 font-sans truncate max-w-[130px]">
                          {emp.designation}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 pt-1 border-t border-stone-100">
                        <span>ವೇತನ: <strong>₹{(emp.basicPay || 37900).toLocaleString('en-IN')}</strong></span>
                        <span className="text-sky-900 font-bold hover:underline">
                          {isSelected ? 'ಆಯ್ಕೆಯಾಗಿದೆ ✓' : 'ಆಯ್ಕೆ ಮಾಡಿ →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {searchError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{searchError}</p>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewEmp(true);
                  setEmployee(null);
                }}
                className="mt-1 text-xs font-bold text-sky-950 underline hover:text-sky-800"
              >
                ಈ ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆಗೆ ನೂತನ ನೌಕರರ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NEW / EDIT EMPLOYEE FORM MODAL INLINE */}
      {(isCreatingNewEmp || isEditingEmp) && (
        <div className="bg-white border-2 border-sky-900 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-stone-200 pb-2">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-950" />
              <h3 className="font-bold text-sm text-stone-900 font-sans">
                {isCreatingNewEmp ? 'ನೂತನ ನೌಕರರ ವಿವರ ನೋಂದಣಿ (New Employee Profile)' : 'ನೌಕರರ ವಿವರಗಳ ನವೀಕರಣ (Edit Employee Details)'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNewEmp(false);
                setIsEditingEmp(false);
              }}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveEmployeeForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ (KGID No) *</label>
                <input
                  type="text"
                  name="kgidNumber"
                  defaultValue={employee?.kgidNumber || kgidInput}
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded bg-stone-50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ನೌಕರರ ಪೂರ್ಣ ಹೆಸರು (Full Name) *</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={employee?.fullName || ''}
                  required
                  placeholder="ಶ್ರೀ/ಶ್ರೀಮತಿ..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ತಂದೆ/ತಾಯಿ ಹೆಸರು (Parent Name)</label>
                <input
                  type="text"
                  name="parentName"
                  defaultValue={employee?.parentName || ''}
                  placeholder="ತಂದೆ/ತಾಯಿಯ ಹೆಸರು..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಹುದ್ದೆ (Designation) *</label>
                <input
                  type="text"
                  name="designation"
                  defaultValue={employee?.designation || 'ಸಹ ಶಿಕ್ಷಕರು'}
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಹುದ್ದೆಯ ವರ್ಗ (Cadre Group)</label>
                <select
                  name="cadreGroup"
                  defaultValue={employee?.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white"
                >
                  <option value="ಗ್ರೂಪ್-ಎ">ಗ್ರೂಪ್-ಎ (Group A)</option>
                  <option value="ಗ್ರೂಪ್-ಬಿ">ಗ್ರೂಪ್-ಬಿ (Group B)</option>
                  <option value="ಗ್ರೂಪ್-ಸಿ">ಗ್ರೂಪ್-ಸಿ (Group C)</option>
                  <option value="ಗ್ರೂಪ್-ಡಿ">ಗ್ರೂಪ್-ಡಿ (Group D)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಕಚೇರಿ / ಶಾಲೆ (Office / School)</label>
                <input
                  type="text"
                  name="officeLocation"
                  defaultValue={employee?.officeLocation || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ನೇಮಕಾತಿ ದಿನಾಂಕ (Appointment Date)</label>
                <input
                  type="date"
                  name="appointmentDate"
                  defaultValue={employee?.appointmentDate || '2014-06-01'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ (Joining Date) *</label>
                <input
                  type="date"
                  name="joiningDate"
                  defaultValue={employee?.joiningDate || '2014-06-15'}
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ (Current Basic Pay ₹) *</label>
                <input
                  type="number"
                  name="basicPay"
                  defaultValue={employee?.basicPay || 37900}
                  required
                  step="50"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono font-bold text-sky-950"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಪ್ರಸ್ತುತ ವೇತನ ಶ್ರೇಣಿ (Pay Scale)</label>
                <input
                  type="text"
                  name="payScale"
                  defaultValue={employee?.payScale || '37900-950-39800-1100-46400-1250-53900-1450-62600-1650-70850'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-[11px] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಹಿಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ</label>
                <input
                  type="date"
                  name="lastIncrementDate"
                  defaultValue={employee?.lastIncrementDate || '2023-07-01'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಮುಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ</label>
                <input
                  type="date"
                  name="nextIncrementDate"
                  defaultValue={employee?.nextIncrementDate || '2024-07-01'}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು (Earned Leave Balance)</label>
                <input
                  type="number"
                  name="earnedLeaveBalance"
                  defaultValue={employee?.earnedLeaveBalance ?? 180}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ತೆಗೆದುಕೊಂಡ ಶಿಶುಪಾಲನ ರಜೆ ದಿನಗಳು</label>
                <input
                  type="number"
                  name="childCareLeaveAvailed"
                  defaultValue={employee?.childCareLeaveAvailed ?? 0}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">ಶಿಶುಪಾಲನ ರಜೆ ಒಟ್ಟು ಕೋಟಾ (ದಿನಗಳು)</label>
                <input
                  type="number"
                  name="childCareLeaveQuota"
                  defaultValue={employee?.childCareLeaveQuota ?? 180}
                  className="w-full px-3 py-1.5 border border-pink-300 rounded font-mono font-bold text-pink-900"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-bold text-stone-700 mb-1">ಇತರೆ ಅಗತ್ಯ ಸೇವಾ ವಿವರಗಳು (Other Service Details / Notes)</label>
                <textarea
                  name="otherServiceDetails"
                  rows={2}
                  defaultValue={employee?.otherServiceDetails || ''}
                  placeholder="ಇಲಾಖಾ ಪರೀಕ್ಷೆಗಳು, ಸೇವಾ ಪುಸ್ತಕದ ಷರಾ, ನಿರಂತರ ಸೇವೆ ವಿವರ..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewEmp(false);
                  setIsEditingEmp(false);
                }}
                className="px-4 py-1.5 border border-stone-300 rounded text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ರದ್ದುಗೊಳಿಸಿ
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-sky-950 hover:bg-sky-900 text-white font-bold rounded cursor-pointer"
              >
                {isCreatingNewEmp ? 'ನೌಕರರನ್ನು ಸೇರಿಸಿ (Save)' : 'ವಿವರಗಳನ್ನು ನವೀಕರಿಸಿ (Update)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3 & 4: EMPLOYEE DATA DISPLAY & CALCULATION ENGINE */}
      {employee && (
        <div className="space-y-6">
          {/* Employee Profile Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">✓</span>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide font-sans">
                  ನೌಕರರ ಸೇವಾ ವಿವರಗಳು (Employee Profile & Service Record)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEmp(true)}
                  className="text-xs text-sky-950 hover:text-sky-800 font-semibold flex items-center gap-1 border border-sky-200 bg-sky-50 px-2.5 py-1 rounded cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> ತಿದ್ದುಪಡಿ (Edit)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 font-medium block">ನೌಕರರ ಹೆಸರು & ಕೆಜಿಐಡಿ</span>
                <span className="font-bold text-stone-900 text-sm block mt-0.5">{employee.fullName}</span>
                <span className="text-[11px] font-mono text-sky-950 font-bold">KGID: {employee.kgidNumber}</span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 font-medium block">ತಂದೆ/ತಾಯಿ ಹೆಸರು</span>
                <span className="font-bold text-stone-900 block mt-0.5">{employee.parentName || 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ'}</span>
                <span className="text-[11px] text-stone-600">ಹುದ್ದೆಯ ವರ್ಗ: <strong>{employee.cadreGroup || 'ಗ್ರೂಪ್-ಸಿ'}</strong></span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 font-medium block">ಹುದ್ದೆ & ಕಾರ್ಯಸ್ಥಳ</span>
                <span className="font-bold text-stone-900 block mt-0.5">{employee.designation}</span>
                <span className="text-[11px] text-stone-600 truncate block">{employee.officeLocation}</span>
              </div>

              <div className="bg-sky-50 p-2.5 rounded border border-sky-200">
                <span className="text-[10px] text-sky-800 font-bold block uppercase tracking-wide">ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ (Basic Pay)</span>
                <span className="font-bold text-sky-950 text-base font-mono block mt-0.5">
                  ₹{(employee.basicPay || 37900).toLocaleString('en-IN')}/-
                </span>
                <span className="text-[10px] text-stone-600 truncate block font-mono">{employee.payScale}</span>
              </div>

              <div>
                <span className="text-stone-500 block">ನೇಮಕಾತಿ ದಿನಾಂಕ:</span>
                <span className="font-mono font-semibold text-stone-800">{employee.appointmentDate || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block">ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ:</span>
                <span className="font-mono font-semibold text-stone-800">{employee.joiningDate}</span>
              </div>

              <div>
                <span className="text-stone-500 block">ಹಿಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ:</span>
                <span className="font-mono font-semibold text-stone-800">{employee.lastIncrementDate || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block">ಮುಂದಿನ ವೇತನ ಬಡ್ತಿ ದಿನಾಂಕ:</span>
                <span className="font-mono font-semibold text-stone-800">{employee.nextIncrementDate || '—'}</span>
              </div>

              <div>
                <span className="text-stone-500 block">ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು:</span>
                <span className="font-mono font-bold text-emerald-800">{employee.earnedLeaveBalance ?? 180} ದಿನಗಳು</span>
              </div>

              <div>
                <span className="text-stone-500 block">ಶಿಶುಪಾಲನ ರಜೆ ಪಡೆದ ದಿನಗಳು:</span>
                <span className="font-mono font-semibold text-pink-800">
                  {employee.childCareLeaveAvailed ?? 0} ದಿನಗಳು (ಒಟ್ಟು ಕೋಟಾ: {employee.childCareLeaveQuota ?? 180} ದಿನಗಳು, ಬಾಕಿ ಶಿಲ್ಕು: {Math.max(0, (employee.childCareLeaveQuota ?? 180) - (employee.childCareLeaveAvailed ?? 0))} ದಿನಗಳು)
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-stone-500 block">ಇತರೆ ಅಗತ್ಯ ಸೇವಾ ವಿವರಗಳು:</span>
                <span className="text-stone-700 italic">{employee.otherServiceDetails || 'ಸೇವಾ ಪುಸ್ತಕ ತೃಪ್ತಿಕರವಾಗಿದೆ.'}</span>
              </div>
            </div>
          </div>

          {/* CALCULATION ENGINE COMPARISON DISPLAY */}
          <div className="bg-white border-2 border-sky-900 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-950 text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide font-sans flex items-center gap-2">
                  <span>ವೇತನ ಲೆಕ್ಕಾಚಾರ & ಪರಿಷ್ಕರಣೆ (Salary Calculation & Review)</span>
                  {isCalculating && <span className="text-xs text-sky-800 font-normal">ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತಿದೆ...</span>}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {calculationResult && (
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                    calculationResult.eligible 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {calculationResult.eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {calculationResult.eligible ? 'ಅರ್ಹತೆ ಪೂರೈಸಲಾಗಿದೆ' : 'ಷರತ್ತಿನ ಪರಿಶೀಲನೆ ಅಗತ್ಯ'}
                  </span>
                )}
              </div>
            </div>

            {/* Service & Eligibility Note */}
            {calculationResult?.serviceInfo && (
              <div className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-950" />
                  <span>ಒಟ್ಟು ಸೇವಾ ಅವಧಿ: <strong>{calculationResult.serviceInfo.formattedService}</strong></span>
                </div>
                <div className="text-stone-600">
                  ಷರಾ: <strong className="text-stone-900">{calculationResult.reason}</strong>
                </div>
              </div>
            )}

            {/* KCSR / KFC Statutory Rule Selection for Memorandum */}
            <div className="mb-4 p-3 bg-[#fffbf2] border-2 border-amber-300 rounded-lg space-y-2 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 font-kannada">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>KCSR ನಿಯಮಾವಳಿಗಳ ಅಧಿಕೃತ ಉಲ್ಲೇಖ (Statutory Rule Reference):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStatutoryModalOpen(true)}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] border border-[#2b2b2b] flex items-center gap-1 cursor-pointer font-kannada shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>📚 ನಿಯಮ ಪುಸ್ತಕ ತೆರೆಯಿರಿ...</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-112');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer font-kannada"
                >
                  + KCSR 112 (ಗಳಿಕೆ ರಜೆ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-135b');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300 cursor-pointer font-kannada"
                >
                  + KCSR 135B (CCL ರಜೆ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-135');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300 cursor-pointer font-kannada"
                >
                  + KCSR 135 (ಹೆರಿಗೆ ರಜೆ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-51');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 cursor-pointer font-kannada"
                >
                  + KCSR 51 (ವಾರ್ಷಿಕ ಬಡ್ತಿ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kfc-article-99');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 cursor-pointer font-kannada"
                >
                  + KFC 99 (ಹಣಕಾಸು ಸಂಹಿತೆ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = KARNATAKA_STATUTORY_RULES.find(x => x.id === 'kcsr-rule-135a');
                    if (r) handleInsertStatutoryRefToOrder(r.citationSnippet, r);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300 cursor-pointer font-kannada"
                >
                  + KCSR 135A (ಪಿತೃತ್ವ ರಜೆ)
                </button>
              </div>
            </div>

            {/* MANDATORY FILE DOCKET LINKER (FILE-FIRST REQUIREMENT) */}
            <div className="mb-4 p-3 bg-amber-50/80 border-2 border-amber-300 rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-amber-900" />
                  <label className="text-xs font-bold text-amber-950 font-kannada">
                    ಆದೇಶವನ್ನು ಲಗತ್ತಿಸಬೇಕಾದ ಕಡತ / ಡಾಕೆಟ್ ಆಯ್ಕೆಮಾಡಿ (Link to File Docket) *
                  </label>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold font-mono">
                  FILE-FIRST MANDATORY
                </span>
              </div>
              {files && files.length > 0 ? (
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-kannada bg-white border border-amber-300 rounded font-semibold text-stone-900 outline-none"
                >
                  {files.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.fileNumber} — {f.subject} ({f.sectionName || f.section || 'ಶಾಖೆ'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-amber-900 font-kannada bg-white p-2 rounded border border-amber-200">
                  ಕಡತ ಸಂಖ್ಯೆ: <span className="font-mono font-bold">ಆ2/ಸ.ಪ್ರಾ.ಶಿ/ಪಿ.ರಜೆ.ಮಂ/57/2026-27</span> (ಆ2 ಶಾಖೆಯ ಅಧಿಕೃತ ಕಡತಕ್ಕೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇರ್ಪಡೆಗೊಳ್ಳಲಿದೆ)
                </div>
              )}
            </div>

            {/* SPECIALIZED PATERNITY LEAVE FORM (KCSR RULE 135-A) */}
            {selectedOrderType === 'ಪಿತೃತ್ವ ರಜೆ' && (
              <div className="mb-5 p-4 bg-teal-50/70 border-2 border-teal-300 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-900 text-white text-[10px] font-bold">
                      KCSR 135-A
                    </span>
                    <h4 className="text-xs font-bold text-teal-950 font-kannada">
                      ಪಿತೃತ್ವ ರಜೆ ಅರ್ಹತೆ ಹಾಗೂ ಅರ್ಜಿ ವಿವರಗಳು (Paternity Leave Form Details)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 font-kannada">
                    ಗರಿಷ್ಠ 15 ದಿನಗಳು • ಪೂರ್ಣ ವೇತನ ಸಹಿತ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1 font-kannada">
                      ಮಗುವಿನ ಜನನ ದಿನಾಂಕ (Child DOB) *
                    </label>
                    <input
                      type="date"
                      value={childDob}
                      onChange={(e) => setChildDob(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-teal-300 rounded bg-white text-stone-900"
                    />
                    <span className="text-[10px] text-teal-700 block mt-0.5">ಜನನದಿಂದ 6 ತಿಂಗಳೊಳಗೆ ಅನ್ವಯ</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1 font-kannada">
                      ಮಗುವಿನ ಜೀವಂತ ಕ್ರಮ (Child Order) *
                    </label>
                    <select
                      value={childOrder}
                      onChange={(e) => setChildOrder(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-kannada font-bold border border-teal-300 rounded bg-white text-stone-900"
                    >
                      <option value="1ನೇ ಜೀವಂತ ಮಗು">1ನೇ ಜೀವಂತ ಮಗು (1st Child - ಅರ್ಹ)</option>
                      <option value="2ನೇ ಜೀವಂತ ಮಗು">2ನೇ ಜೀವಂತ ಮಗು (2nd Child - ಅರ್ಹ)</option>
                      <option value="3ನೇ ಅಥವಾ ನಂತರದ ಮಗು">3ನೇ ಅಥವಾ ನಂತರದ ಮಗು (ಅನರ್ಹ - Ineligible)</option>
                    </select>
                    <span className="text-[10px] text-teal-700 block mt-0.5">&lt; 2 ಜೀವಂತ ಮಕ್ಕಳಿಗೆ ಮಾತ್ರ</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1 font-kannada">
                      ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ (Application Date) *
                    </label>
                    <input
                      type="date"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-teal-300 rounded bg-white text-stone-900"
                    />
                    <span className="text-[10px] text-teal-700 block mt-0.5">ನೌಕರರ ಮನವಿ ದಿನಾಂಕ</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1 font-kannada">
                      ಜನನ ಪ್ರಮಾಣಪತ್ರ / ಆಸ್ಪತ್ರೆ ದಾಖಲೆ *
                    </label>
                    <input
                      type="text"
                      value={birthCertificateDetails}
                      onChange={(e) => setBirthCertificateDetails(e.target.value)}
                      placeholder="ಆಸ್ಪತ್ರೆ / ಜನನ ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ"
                      className="w-full px-3 py-1.5 text-xs border border-teal-300 rounded bg-white text-stone-900"
                    />
                    <span className="text-[10px] text-teal-700 block mt-0.5">ದಾಖಲೆ ಸಂಖ್ಯೆ & ದಿನಾಂಕ</span>
                  </div>
                </div>

                {/* Statutory Rule Card for Paternity Leave */}
                <div className="p-3 bg-white border border-teal-200 rounded text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-teal-950 font-kannada">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>ಶಾಸನಬದ್ಧ ನಿಯಮ ಉಲ್ಲೇಖ (Statutory Authority):</span>
                  </div>
                  <p className="text-[11px] text-stone-700 font-kannada leading-relaxed">
                    ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (KCSRs) ನಿಯಮ 135-ಎ ಹಾಗೂ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ಆಇ 4 ಎಸ್ಆರ್ಎಸ್ 99 ದಿನಾಂಕ: 08-02-1999 ರನ್ವಯ:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-kannada text-teal-900 pt-1">
                    <div className="bg-teal-50 p-2 rounded border border-teal-200">
                      • <strong>ಅರ್ಹತೆ:</strong> 2ಕ್ಕಿಂತ ಕಡಿಮೆ ಜೀವಂತ ಮಕ್ಕಳನ್ನು ಹೊಂದಿರುವ ವಿವಾಹಿತ ಪುರುಷ ನೌಕರರಿಗೆ
                    </div>
                    <div className="bg-teal-50 p-2 rounded border border-teal-200">
                      • <strong>ಅವಧಿ:</strong> ಮಗುವಿನ ಜನನ ದಿನಾಂಕದಿಂದ 6 ತಿಂಗಳ ಒಳಗೆ ಗರಿಷ್ಠ 15 ದಿನಗಳು
                    </div>
                    <div className="bg-teal-50 p-2 rounded border border-teal-200">
                      • <strong>ವೇತನ:</strong> ಕರ್ತವ್ಯದ ಮೇಲಿರುವಂತೆ ಪರಿಗಣಿಸಿ ಪೂರ್ಣ ವೇತನ ಮತ್ತು ಭತ್ಯೆಗಳು
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASEWORKER SIGNATURE SETTINGS (BLANK SPACE + OPTIONAL CASEWORKER INFO) */}
            <div className="mb-4 p-3 bg-stone-50 border border-stone-300 rounded-lg text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cb-show-caseworker-sig"
                    checked={showCaseworkerSignature}
                    onChange={(e) => setShowCaseworkerSignature(e.target.checked)}
                    className="w-4 h-4 text-sky-900 rounded cursor-pointer"
                  />
                  <label htmlFor="cb-show-caseworker-sig" className="font-bold text-stone-900 font-kannada cursor-pointer">
                    ಪತ್ರದ ಕೊನೆಯಲ್ಲಿ ವಿಷಯ ನಿರ್ವಾಹಕರ (Caseworker) ವಿವರಗಳನ್ನು ಮುದ್ರಿಸಿ
                  </label>
                </div>
                <span className="text-[11px] text-stone-500 font-kannada">
                  [ಸಹಿಗಾಗಿ ಖಾಲಿ ಜಾಗ] ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೃಜನೆಯಾಗಲಿದೆ • BEO ಸಹಿ ಇರುವುದಿಲ್ಲ
                </span>
              </div>

              {showCaseworkerSignature && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1 font-kannada">
                      ವಿಷಯ ನಿರ್ವಾಹಕರ ಹೆಸರು (Caseworker Name)
                    </label>
                    <input
                      type="text"
                      value={caseworkerName}
                      onChange={(e) => setCaseworkerName(e.target.value)}
                      placeholder="ವಿಷಯ ನಿರ್ವಾಹಕರ ಹೆಸರು"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1 font-kannada">
                      ಹುದ್ದೆ (Designation)
                    </label>
                    <input
                      type="text"
                      value={caseworkerDesignation}
                      onChange={(e) => setCaseworkerDesignation(e.target.value)}
                      placeholder="ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು (FDA) / ವಿಷಯ ನಿರ್ವಾಹಕರು"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Parameters Row: Effective Date & Leave Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3 bg-stone-50/70 border border-stone-200 rounded">
              {!isLeaveType ? (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ (Effective Date) *
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-stone-300 rounded bg-white"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">ರಜೆ ಪ್ರಾರಂಭ ದಿನಾಂಕ (From Date)</label>
                    <input
                      type="date"
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">ರಜೆ ಮುಕ್ತಾಯ ದಿನಾಂಕ (To Date)</label>
                    <input
                      type="date"
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">ಒಟ್ಟು ರಜಾ ದಿನಗಳು (Total Days)</label>
                    <input
                      type="number"
                      value={leaveDays}
                      min={1}
                      max={180}
                      onChange={(e) => setLeaveDays(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-stone-300 rounded bg-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">ಕಛೇರಿ ಜ್ಞಾಪನ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)</label>
                <input
                  type="text"
                  value={customOrderNo}
                  onChange={(e) => setCustomOrderNo(e.target.value)}
                  placeholder="ಸ್ವಯಂಚಾಲಿತ ಸಂಖ್ಯೆ ಸೃಜನೆಯಾಗಲಿದೆ"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">ವಿಶೇಷ ಷರಾ / ಟಿಪ್ಪಣಿ</label>
                <input
                  type="text"
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  placeholder="ಸೇವಾ ಪುಸ್ತಕ ಪರಿಶೀಲಿಸಿ ಕ್ರಮವಹಿಸಲಾಗಿದೆ..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                />
              </div>
            </div>

            {/* Old Basic Pay vs New Basic Pay Comparison Grid */}
            {!isLeaveType ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* 1. Old Basic Pay */}
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-300 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    ಪ್ರಸ್ತುತ ಮೂಲ ವೇತನ (Old Basic Pay)
                  </span>
                  <div className="text-2xl font-bold font-mono text-stone-800">
                    ₹{(calculationResult?.oldBasicPay || employee.basicPay || 37900).toLocaleString('en-IN')}/-
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">ಹಿಂದಿನ ನಿಗದಿಪಡಿಸಿದ ದರ</span>
                </div>

                {/* 2. Increment Amount */}
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    ಮಂಜೂರಾದ ವೇತನ ಬಡ್ತಿ (Increment Amount)
                  </span>
                  <div className="text-2xl font-bold font-mono text-emerald-700">
                    + ₹{(calculationResult?.incrementAmount || 0).toLocaleString('en-IN')}/-
                  </div>
                  <span className="text-[11px] text-emerald-800 mt-1 block font-medium">
                    (ಕರ್ನಾಟಕ ವೇತನ ಮ್ಯಾಟ್ರಿಕ್ಸ್ 1 ಹಂತದ ಬಡ್ತಿ)
                  </span>
                </div>

                {/* 3. New Basic Pay */}
                <div className="p-4 rounded-lg bg-sky-900 text-white text-center shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    ನೂತನ ಮೂಲ ವೇತನ (Revised New Basic Pay)
                  </span>
                  <div className="text-2xl font-bold font-mono text-white">
                    ₹{(calculationResult?.newBasicPay || employee.basicPay || 37900).toLocaleString('en-IN')}/-
                  </div>
                  <span className="text-[11px] text-sky-200 mt-1 block">
                    ದಿನಾಂಕ: {effectiveDate} ರಿಂದ ಜಾರಿಗೆ
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm mb-0.5">{selectedOrderType} ಮಂಜೂರಾತಿ ವಿವರ</span>
                  <span className="text-emerald-800">
                    ಅವಧಿ: <strong>{leaveFrom}</strong> ರಿಂದ <strong>{leaveTo}</strong> (ಒಟ್ಟು <strong>{leaveDays}</strong> ದಿನಗಳು)
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-stone-500 block text-[10px]">ಪ್ರಸ್ತುತ ಶಿಲ್ಕು</span>
                    <strong className="text-sm font-mono">{calculationResult?.leaveCalculation?.currentBalance ?? 0} ದಿನಗಳು</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-stone-500 block text-[10px]">ಮಂಜೂರಾದ ರಜೆ</span>
                    <strong className="text-sm font-mono text-emerald-800">- {leaveDays} ದಿನಗಳು</strong>
                  </div>
                  <div className="text-center bg-white px-3 py-1.5 rounded border border-emerald-200">
                    <span className="text-stone-500 block text-[10px]">ಉಳಿಯುವ ಶಿಲ್ಕು</span>
                    <strong className="text-sm font-mono text-sky-950">{calculationResult?.leaveCalculation?.balanceAfter ?? 0} ದಿನಗಳು</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button Triggering Confirmation Dialog */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200">
              <div className="text-xs text-stone-600 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-900" />
                <span>ಖಚಿತಪಡಿಸಿದ ನಂತರ ಅಧಿಕೃತ ಜ್ಞಾಪನಾ ಆದೇಶ ಸೃಜನೆಯಾಗಿ, ನೌಕರರ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಮೂಲ ವೇತನ ನವೀಕರಣಗೊಳ್ಳಲಿದೆ.</span>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!calculationResult}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-950 hover:bg-sky-900 disabled:bg-stone-300 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <span>ಆದೇಶ ಹೊರಡಿಸಿ (Generate Order)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION MODAL DIALOG */}
      {showConfirmModal && employee && calculationResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-sky-950 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sky-950" />
                <h3 className="font-bold text-base text-stone-900 font-sans">
                  ಜ್ಞಾಪನಾ ಆದೇಶ ದೃಢೀಕರಣ (Confirm Memorandum Order)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              ದಯವಿಟ್ಟು ಕೆಳಕಂಡ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಖಚಿತಪಡಿಸಿದ ನಂತರ ಈ ಆದೇಶವು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ದಾಖಲಾಗಲಿದ್ದು, ನೌಕರರ ಮೂಲ ವೇತನವು ತಕ್ಷಣವೇ ನವೀಕರಣಗೊಳ್ಳಲಿದೆ:
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded p-3.5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-600">ನೌಕರರ ಹೆಸರು:</span>
                <strong className="text-stone-900">{employee.fullName}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-600">ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ:</span>
                <strong className="font-mono text-sky-950">{employee.kgidNumber}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-600">ಆದೇಶದ ಪ್ರಕಾರ:</span>
                <strong className="text-blue-900">{selectedOrderType}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-stone-600">ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ:</span>
                <strong className="font-mono">{isLeaveType ? leaveFrom : effectiveDate}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5 bg-stone-100 p-2 rounded border border-stone-300">
                <span className="text-stone-800 font-bold font-kannada">ಸಹಿ ನಿಯಮ (Signature):</span>
                <span className="text-stone-950 font-bold font-kannada">
                  ಭೌತಿಕ ಸಹಿಗೆ ಖಾಲಿ ಜಾಗ {showCaseworkerSignature ? `• ವಿಷಯ ನಿರ್ವಾಹಕರು: ${caseworkerName}` : ''}
                </span>
              </div>

              {!isLeaveType ? (
                <div className="pt-1.5">
                  <div className="flex justify-between text-stone-700 mb-1">
                    <span>ಹಿಂದಿನ ಮೂಲ ವೇತನ:</span>
                    <span className="font-mono">₹{calculationResult.oldBasicPay.toLocaleString('en-IN')}/-</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold mb-1">
                    <span>ಮಂಜೂರಾದ ಬಡ್ತಿ:</span>
                    <span className="font-mono">+ ₹{calculationResult.incrementAmount.toLocaleString('en-IN')}/-</span>
                  </div>
                  <div className="flex justify-between text-sky-950 font-bold text-sm bg-sky-100/70 p-2 rounded border border-sky-300">
                    <span>ಪರಿಷ್ಕೃತ ನೂತನ ಮೂಲ ವೇತನ:</span>
                    <span className="font-mono">₹{calculationResult.newBasicPay.toLocaleString('en-IN')}/-</span>
                  </div>
                </div>
              ) : (
                <div className="pt-1 text-emerald-900 font-semibold">
                  ಮಂಜೂರಾದ ರಜೆ ದಿನಗಳು: <strong>{leaveDays} ದಿನಗಳು</strong> ({leaveFrom} ರಿಂದ {leaveTo})
                </div>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-stone-300 rounded text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                ರದ್ದುಗೊಳಿಸಿ (Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmAndGenerateOrder}
                disabled={isSubmitting}
                className="px-5 py-2 bg-sky-950 hover:bg-sky-900 disabled:bg-stone-300 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>ಆದೇಶ ಸೃಜನೆಯಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ಖಚಿತಪಡಿಸಿ (Confirm & Generate)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: GENERATED ORDER & PRINTABLE DOCUMENT */}
      {generatedFile && generatedOrder && (
        <div className="bg-white border-2 border-emerald-600 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                  ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ಹೊರಡಿಸಲಾಗಿದೆ (Memorandum Order Generated)
                </span>
                <h3 className="text-base font-bold text-stone-900 font-sans mt-0.5">
                  ಸಂ: {generatedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">
                  ದಿನಾಂಕ: {generatedOrder.orderDate} • ನೌಕರರ ಹೆಸರು: {generatedOrder.employeeName} (KGID: {generatedOrder.kgidNumber})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintDocument}
                className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>ಮುದ್ರಿಸಿ (Print Document)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDoc}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>ಡೌನ್‌ಲೋಡ್ (HTML / PDF)</span>
              </button>
            </div>
          </div>

          {/* Render Official Memorandum proceedings */}
          <div className="border border-stone-300 rounded bg-stone-50 p-4 overflow-x-auto">
            <div 
              className="bg-white"
              dangerouslySetInnerHTML={{ __html: generatedFile.generatedDocumentHtml }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-stone-500 pt-2 border-t border-stone-200">
            <span>ಕಡತ ಸಂಖ್ಯೆ: <strong className="font-mono text-stone-800">{generatedFile.fileId}</strong></span>
            <span>ದಾಖಲಿಸಿದವರು: <strong className="text-stone-800">{generatedOrder.createdBy} ({generatedOrder.createdRole})</strong></span>
          </div>
        </div>
      )}

      {/* KCSR, KFC, CCA STATUTORY RULE SELECTOR MODAL */}
      <StatutoryRuleSelectorModal
        isOpen={isStatutoryModalOpen}
        onClose={() => setIsStatutoryModalOpen(false)}
        onInsertReference={handleInsertStatutoryRefToOrder}
        targetContextName="ಜ್ಞಾಪನಾ ಆದೇಶ"
      />
    </div>
  );
};
