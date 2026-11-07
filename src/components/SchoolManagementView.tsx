import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  GraduationCap,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  FileCheck,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  RotateCcw,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Landmark,
  ShieldCheck,
  School as SchoolIcon,
  HelpCircle
} from 'lucide-react';
import { SchoolInstitution, SchoolGrantStatus, SchoolCategoryType, AdminAuthUser } from '../types';

interface SchoolManagementViewProps {
  currentUser?: AdminAuthUser | null;
  onDraftLetterForSchool?: (school: SchoolInstitution, letterTypeKey: string) => void;
  onShowToast?: (msg: string) => void;
}

export const computeSchoolCompliance = (school: SchoolInstitution) => {
  const status = school.recognitionStatus;
  const validUpto = school.recognitionValidUpto || '';

  if (status === 'Expired' || validUpto.includes('2024') || validUpto.includes('2025')) {
    return {
      rating: 'red' as const,
      labelKn: 'ಕೆಂಪು: ಅವಧಿ ಮೀರಿದೆ (Expired / Red Alert)',
      shortKn: 'ಅವಧಿ ಮೀರಿದೆ (Expired)',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      dotBg: 'bg-rose-600',
      descKn: 'ಮಾನ್ಯತೆ ಅವಧಿ ಮುಗಿದಿದೆ ಅಥವಾ ಸುರಕ್ಷತಾ ತಪಾಸಣೆ ಬಾಕಿ ಇದೆ. ತಕ್ಷಣ ಕ್ರಮ ಅಗತ್ಯ.',
    };
  }
  if (status === 'Renewal Due' || validUpto.includes('2026-27') || validUpto.includes('2026')) {
    return {
      rating: 'yellow' as const,
      labelKn: 'ಹಳದಿ: ನವೀಕರಣ ಬಾಕಿ (Renewal Due < 6M)',
      shortKn: 'ನವೀಕರಣ ಬಾಕಿ (Due)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      dotBg: 'bg-amber-500',
      descKn: 'ಮಾನ್ಯತೆ ನವೀಕರಣದ ಕಾಲಮಿತಿ ಹತ್ತಿರವಿದ್ದು, ಆಡಳಿತ ಮಂಡಳಿಯಿಂದ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಕೆ ಬಾಕಿ ಇದೆ.',
    };
  }
  return {
    rating: 'green' as const,
    labelKn: 'ಹಸಿರು: ಸಂಪೂರ್ಣ ಅರ್ಹ (Fully Compliant)',
    shortKn: 'ಸಂಪೂರ್ಣ ಅರ್ಹ (Compliant)',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotBg: 'bg-emerald-500',
    descKn: 'ಮಾನ್ಯತೆ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ತಪಾಸಣಾ ವರದಿಗಳು ನಿಯಮಾನುಸಾರ ಚಾಲ್ತಿಯಲ್ಲಿವೆ (> 1 ವರ್ಷ ಸಿಂಧುತ್ವ).',
  };
};

export const SchoolManagementView: React.FC<SchoolManagementViewProps> = ({
  currentUser,
  onDraftLetterForSchool,
  onShowToast,
}) => {
  const [schools, setSchools] = useState<SchoolInstitution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [grantFilter, setGrantFilter] = useState<string>('all');
  const [recognitionFilter, setRecognitionFilter] = useState<string>('all');
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchool, setEditingSchool] = useState<SchoolInstitution | null>(null);
  const [viewDetailsSchool, setViewDetailsSchool] = useState<SchoolInstitution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const initialFormData: Partial<SchoolInstitution> = {
    schoolName: '',
    schoolCode: '',
    udiseCode: '',
    institutionName: '',
    societyRegNumber: '',
    grantStatus: 'Aided',
    grantOrderNumber: '',
    grantOrderDate: '',
    schoolPhone: '',
    hmName: '',
    hmPhone: '',
    secretaryName: '',
    secretaryPhone: '',
    email: '',
    address: '',
    locationCluster: 'ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್',
    medium: 'Kannada & English',
    schoolCategory: 'High School (8-10)',
    studentCount: 250,
    aidedTeachersCount: 6,
    unaidedTeachersCount: 2,
    recognitionValidUpto: '2026-27',
    recognitionStatus: 'Valid',
    fireSafetyNocValidUpto: '',
    buildingSafetyValidUpto: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    notes: '',
  };

  const [formData, setFormData] = useState<Partial<SchoolInstitution>>(initialFormData);

  // Fetch schools
  const fetchSchools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/schools');
      if (!res.ok) throw new Error('ಶಾಲೆಗಳ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ.');
      const data = await res.json();
      setSchools(data.schools || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'ದೋಷ ಉಂಟಾಗಿದೆ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const showToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else alert(msg);
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingSchool(null);
    setFormData({
      ...initialFormData,
      schoolCode: `BHD-${Math.floor(100 + Math.random() * 900)}`,
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (school: SchoolInstitution) => {
    setEditingSchool(school);
    setFormData({ ...school });
    setIsModalOpen(true);
  };

  // Save school (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName?.trim()) {
      alert('ದಯವಿಟ್ಟು ಶಾಲೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }
    if (!formData.udiseCode?.trim()) {
      alert('ದಯವಿಟ್ಟು ಯುಡೈಸ್ (UDISE) ಕೋಡ್ ನಮೂದಿಸಿ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingSchool;
      const url = isEdit ? `/api/schools/${editingSchool.id}` : '/api/schools';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ');

      if (isEdit) {
        setSchools(prev => prev.map(s => s.id === editingSchool.id ? data.school : s));
        showToast(`ಶಾಲೆಯ ಮಾಹಿತಿ "${data.school.schoolName}" ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.`);
      } else {
        setSchools(prev => [data.school, ...prev]);
        showToast(`ಹೊಸ ಶಾಲೆ "${data.school.schoolName}" ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'ದೋಷ ಸಂಭವಿಸಿದೆ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete school
  const handleDelete = async (id: string, schoolName: string) => {
    if (!window.confirm(`ಖಚಿತವಾಗಿ "${schoolName}" ಶಾಲೆಯ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/schools/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ');

      setSchools(prev => prev.filter(s => s.id !== id));
      showToast(`ಶಾಲೆಯ ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.`);
      if (viewDetailsSchool?.id === id) {
        setViewDetailsSchool(null);
      }
    } catch (err: any) {
      alert(err.message || 'ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ');
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (!window.confirm('ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ಅಧಿಕೃತ ಪೂರ್ವನಿಯೋಜಿತ ಶಾಲೆಗಳ ಪಟ್ಟಿಗೆ ಮರುಹೊಂದಿಸಲು ಬಯಸುವಿರಾ?')) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/schools/reset', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser?.role || 'Admin',
          'x-user-name': currentUser?.displayName || 'Admin',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ಮರುಹೊಂದಿಸಲು ವಿಫಲವಾಗಿದೆ');

      setSchools(data.schools || []);
      showToast('ಶಾಲೆಗಳ ಪಟ್ಟಿಯನ್ನು ಅಧಿಕೃತ ಪೂರ್ವನಿಯೋಜಿತ ಪಟ್ಟಿಗೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
    } catch (err: any) {
      alert(err.message || 'ದೋಷ ಸಂಭವಿಸಿದೆ');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = s.schoolName?.toLowerCase().includes(q);
        const matchUdise = s.udiseCode?.toLowerCase().includes(q);
        const matchInst = s.institutionName?.toLowerCase().includes(q);
        const matchHm = s.hmName?.toLowerCase().includes(q);
        const matchSec = s.secretaryName?.toLowerCase().includes(q);
        const matchPhone = s.schoolPhone?.toLowerCase().includes(q) || s.hmPhone?.includes(q) || s.secretaryPhone?.includes(q);
        if (!matchName && !matchUdise && !matchInst && !matchHm && !matchSec && !matchPhone) {
          return false;
        }
      }

      // Grant Status
      if (grantFilter !== 'all' && s.grantStatus !== grantFilter) {
        return false;
      }

      // Recognition Status
      if (recognitionFilter !== 'all' && s.recognitionStatus !== recognitionFilter) {
        return false;
      }

      // Cluster
      if (clusterFilter !== 'all' && s.locationCluster !== clusterFilter) {
        return false;
      }

      return true;
    });
  }, [schools, searchTerm, grantFilter, recognitionFilter, clusterFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = schools.length;
    const aided = schools.filter(s => s.grantStatus === 'Aided');
    const proposed = schools.filter(s => s.grantStatus === 'Proposed for Grant');
    const unaided = schools.filter(s => s.grantStatus === 'Unaided');
    const renewalDue = schools.filter(s => s.recognitionStatus === 'Renewal Due' || s.recognitionStatus === 'Expired');
    const totalAidedTeachers = aided.reduce((acc, s) => acc + (s.aidedTeachersCount || 0), 0);
    const totalStudents = schools.reduce((acc, s) => acc + (s.studentCount || 0), 0);

    return {
      total,
      aidedCount: aided.length,
      proposedCount: proposed.length,
      unaidedCount: unaided.length,
      renewalDueCount: renewalDue.length,
      totalAidedTeachers,
      totalStudents,
    };
  }, [schools]);

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ಕ್ರಮ ಸಂಖ್ಯೆ',
      'ಶಾಲೆಯ ಹೆಸರು',
      'ಯುಡೈಸ್ ಕೋಡ್ (UDISE)',
      'ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ ಹೆಸರು',
      'ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ',
      'ಅನುದಾನ ಸ್ಥಿತಿ',
      'ಅನುದಾನ ಆದೇಶ ಸಂಖ್ಯೆ',
      'ಶಾಲಾ ಕಚೇರಿ ದೂರವಾಣಿ',
      'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು',
      'HM ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      'ಕಾರ್ಯದರ್ಶಿ / ಅಧ್ಯಕ್ಷರ ಹೆಸರು',
      'ಕಾರ್ಯದರ್ಶಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      'ಇಮೇಲ್',
      'ವಿಳಾಸ',
      'ಕ್ಲಸ್ಟರ್',
      'ಬೋಧನಾ ಮಾಧ್ಯಮ',
      'ಶಾಲೆ ವಿಭಾಗ',
      'ವಿದ್ಯಾರ್ಥಿ ಸಂಖ್ಯೆ',
      'ಅನುದಾನಿತ ಶಿಕ್ಷಕರು',
      'ಅನುದಾನರಹಿತ ಶಿಕ್ಷಕರು',
      'ಮಾನ್ಯತೆ ಅವಧಿ',
      'ಮಾನ್ಯತೆ ಸ್ಥಿತಿ',
    ];

    const rows = filteredSchools.map((s, idx) => [
      idx + 1,
      `"${s.schoolName || ''}"`,
      `"${s.udiseCode || ''}"`,
      `"${s.institutionName || ''}"`,
      `"${s.societyRegNumber || ''}"`,
      `"${s.grantStatus || ''}"`,
      `"${s.grantOrderNumber || ''}"`,
      `"${s.schoolPhone || ''}"`,
      `"${s.hmName || ''}"`,
      `"${s.hmPhone || ''}"`,
      `"${s.secretaryName || ''}"`,
      `"${s.secretaryPhone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.address || ''}"`,
      `"${s.locationCluster || ''}"`,
      `"${s.medium || ''}"`,
      `"${s.schoolCategory || ''}"`,
      s.studentCount || 0,
      s.aidedTeachersCount || 0,
      s.unaidedTeachersCount || 0,
      `"${s.recognitionValidUpto || ''}"`,
      `"${s.recognitionStatus || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bhadravathi_schools_grant_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="school-management-root" className="space-y-6">
      {/* 1. Header Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-sky-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/30">
              <Landmark className="w-3.5 h-3.5" />
              <span>ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ • ಭದ್ರಾವತಿ ವಲಯ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>ಶಾಲೆಗಳ ಪಟ್ಟಿ, ಸಂಸ್ಥೆಗಳ ವಿವರ & ಅನುದಾನ ನಿರ್ವಹಣೆ</span>
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-3xl leading-relaxed">
              ವೇತನಾನುದಾನಿತ ಮತ್ತು ಅನುದಾನಕ್ಕೆ ಪ್ರಸ್ತಾವಿತ ಶಾಲೆಗಳ ಸಮಗ್ರ ವಿವರ, ಆಡಳಿತ ಮಂಡಳಿ / ಟ್ರಸ್ಟ್ ಮಾಹಿತಿ, ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು, ಮಾನ್ಯತೆ ನವೀಕರಣ ಪರಿಶೀಲನೆ ಹಾಗೂ ಅಧಿಕೃತ ಕಚೇರಿ ಆದೇಶ ಮತ್ತು ನೋಡಲ್ ಪತ್ರ ತಯಾರಿಕೆ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-school"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ಹೊಸ ಶಾಲೆ ಸೇರಿಸಿ</span>
            </button>
            <button
              id="btn-print-schools"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors"
              title="ಪಟ್ಟಿಯನ್ನು ಮುದ್ರಿಸಿ"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">ಮುದ್ರಣ</span>
            </button>
            <button
              id="btn-export-schools"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors"
              title="CSV ಡೌನ್‌ಲೋಡ್"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV ರಫ್ತು</span>
            </button>
            <button
              id="btn-reset-schools"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-rose-500/30 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors"
              title="ಪೂರ್ವನಿಯೋಜಿತ ಪಟ್ಟಿಗೆ ಮರುಹೊಂದಿಸಿ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistical KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-500">ಒಟ್ಟು ಶಾಲೆಗಳು</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-stone-900">{stats.total}</span>
            <SchoolIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">ವಲಯ ವ್ಯಾಪ್ತಿ</p>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-800">ವೇತನಾನುದಾನಿತ (Aided)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-950">{stats.aidedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">{stats.totalAidedTeachers} ಶಿಕ್ಷಕರ ಹುದ್ದೆಗಳು</p>
        </div>

        <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-800">ಅನುದಾನಕ್ಕೆ ಪ್ರಸ್ತಾವಿತ</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-950">{stats.proposedCount}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-[10px] text-amber-700 font-medium mt-1">ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ಶಾಲೆಗಳು</p>
        </div>

        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-stone-600">ಅನುದಾನ ರಹಿತ (Unaided)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-stone-900">{stats.unaidedCount}</span>
            <Building2 className="w-4 h-4 text-stone-500" />
          </div>
          <p className="text-[10px] text-stone-500 mt-1">ಖಾಸಗಿ ಆಡಳಿತ ಮಂಡಳಿ</p>
        </div>

        <div className="bg-rose-50/60 rounded-xl p-3.5 border border-rose-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-rose-800">ಮಾನ್ಯತೆ ನವೀಕರಣ ಬಾಕಿ</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-950">{stats.renewalDueCount}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-[10px] text-rose-700 font-medium mt-1">ಆದೇಶ / ಪತ್ರ ನೀಡಬೇಕಿದೆ</p>
        </div>

        <div className="bg-sky-50/60 rounded-xl p-3.5 border border-sky-200/80 shadow-sm">
          <p className="text-[11px] font-semibold text-sky-800">ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-sky-950">{stats.totalStudents}</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-[10px] text-sky-700 font-medium mt-1">ದಾಖಲಾತಿ ಸಂಖ್ಯೆ</p>
        </div>
      </div>

      {/* 3. Filter and Search Controls */}
      <div className="bg-white rounded-xl p-4 border border-stone-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-school-search"
              type="text"
              placeholder="ಶಾಲೆಯ ಹೆಸರು, UDISE, ಸಂಸ್ಥೆ/ಟ್ರಸ್ಟ್, ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು, ಫೋನ್ ಸಂಖ್ಯೆಯಿಂದ ಹುಡುಕಿ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ಕಾರ್ಡ್ಸ್ ನೋಟ
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ಕೋಷ್ಟಕ (Table)
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              ಅನುದಾನ ಸ್ಥಿತಿ (Grant Status):
            </label>
            <select
              id="filter-grant-status"
              value={grantFilter}
              onChange={(e) => setGrantFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">ಎಲ್ಲಾ ಅನುದಾನ ಸ್ಥಿತಿಗಳು ({schools.length})</option>
              <option value="Aided">ವೇತನಾನುದಾನಿತ ಶಾಲೆಗಳು (Aided)</option>
              <option value="Proposed for Grant">ಅನುದಾನಕ್ಕೆ ಪ್ರಸ್ತಾವಿತ ಶಾಲೆಗಳು (Proposed)</option>
              <option value="Unaided">ಅನುದಾನ ರಹಿತ ಶಾಲೆಗಳು (Unaided)</option>
              <option value="Partially Aided">ಭಾಗಶಃ ಅನುದಾನಿತ (Partially Aided)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              ಮಾನ್ಯತೆ ಸ್ಥಿತಿ (Recognition Status):
            </label>
            <select
              id="filter-recognition-status"
              value={recognitionFilter}
              onChange={(e) => setRecognitionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">ಎಲ್ಲಾ ಮಾನ್ಯತೆ ಸ್ಥಿತಿಗಳು</option>
              <option value="Valid">ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Valid)</option>
              <option value="Renewal Due">ನವೀಕರಣ ಬಾಕಿ (Renewal Due)</option>
              <option value="Expired">ಅವಧಿ ಮುಗಿದಿದೆ (Expired)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              ಕ್ಲಸ್ಟರ್ (Cluster):
            </label>
            <select
              id="filter-cluster"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">ಎಲ್ಲಾ ಕ್ಲಸ್ಟರ್‌ಗಳು</option>
              <option value="ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್">ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್</option>
              <option value="ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್">ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್</option>
              <option value="ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್">ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್</option>
              <option value="ಹೊಳೆಹೊನ್ನೂರು ಕ್ಲಸ್ಟರ್">ಹೊಳೆಹೊನ್ನೂರು ಕ್ಲಸ್ಟರ್</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Listing */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-800 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-stone-600">ಶಾಲೆಗಳ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
          <SchoolIcon className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">ಯಾವುದೇ ಶಾಲೆಗಳ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            ಹುಡುಕಾಟದ ಮಾನದಂಡಗಳನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ &quot;ಹೊಸ ಶಾಲೆ ಸೇರಿಸಿ&quot; ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಹೊಸ ಶಾಲೆಯನ್ನು ನಮೂದಿಸಿ.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setGrantFilter('all');
              setRecognitionFilter('all');
              setClusterFilter('all');
            }}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
          >
            ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Visual Compliance Legend Component */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-kannada">
                  ಶಾಲಾ ಮಾನ್ಯತೆ & ತಪಾಸಣಾ ವರದಿಗಳ ಅನುಸರಣಾ ಸೂಚ್ಯಂಕ (Compliance Rating Visual Legend)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 font-medium font-kannada">
                ಮಾನ್ಯತೆ ಪ್ರಮಾಣಪತ್ರಗಳ ನವೀಕರಣ ಮತ್ತು ತಪಾಸಣಾ ವರದಿಗಳ ಸಿಂಧುತ್ವದ ಆಧಾರಿತ ಬಣ್ಣಗಳು
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Green */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0"></span>
                  <span className="text-xs font-bold text-emerald-950 font-kannada">
                    ಹಸಿರು (Green): ಸಂಪೂರ್ಣ ಅರ್ಹ (Compliant)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-kannada">
                  ಮಾನ್ಯತೆ ಪ್ರಮಾಣಪತ್ರ ಹಾಗೂ ಕಟ್ಟಡ/ಅಗ್ನಿಶಾಮಕ ತಪಾಸಣಾ ವರದಿಗಳು ಚಾಲ್ತಿಯಲ್ಲಿವೆ (&gt; 1 ವರ್ಷ ಸಿಂಧುತ್ವ).
                </p>
              </div>

              {/* Yellow */}
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0 animate-pulse"></span>
                  <span className="text-xs font-bold text-amber-950 font-kannada">
                    ಹಳದಿ (Yellow): ನವೀಕರಣ ಬಾಕಿ (Renewal Due)
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-kannada">
                  ಸಿಂಧುತ್ವ ಮುಕ್ತಾಯಕ್ಕೆ 6 ತಿಂಗಳಿಗಿಂತ ಕಡಿಮೆ ಸಮಯವಿದ್ದು, ನವೀಕರಣ ಪ್ರಸ್ತಾವನೆ ಹಾಗೂ ದಾಖಲೆ ಸಲ್ಲಿಕೆ ಬಾಕಿ ಇದೆ.
                </p>
              </div>

              {/* Red */}
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-rose-200 shrink-0 animate-pulse"></span>
                  <span className="text-xs font-bold text-rose-950 font-kannada">
                    ಕೆಂಪು (Red): ಅವಧಿ ಮೀರಿದೆ (Expired / Alert)
                  </span>
                </div>
                <p className="text-[11px] text-rose-900 leading-relaxed font-kannada">
                  ಮಾನ್ಯತೆ ಅವಧಿ ಮುಗಿದಿದೆ ಅಥವಾ ಸುರಕ್ಷತಾ ತಪಾಸಣೆ ಬಾಕಿ ಇದೆ. ತಕ್ಷಣ ಕಾರಣ ಕೇಳಿ ನೊಟೀಸ್ ಅಥವಾ ಸ್ಥಳ ತಪಾಸಣೆ ಅಗತ್ಯ.
                </p>
              </div>
            </div>
          </div>

          {viewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSchools.map((school) => {
                const isAided = school.grantStatus === 'Aided';
                const isProposed = school.grantStatus === 'Proposed for Grant';
                const isDue = school.recognitionStatus === 'Renewal Due' || school.recognitionStatus === 'Expired';
                const compliance = computeSchoolCompliance(school);

                return (
                  <div
                    key={school.id}
                    id={`school-card-${school.id}`}
                    className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Top Section */}
                    <div className="space-y-2.5">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isAided
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isProposed
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}>
                            {school.grantStatus === 'Aided' && 'ವೇತನಾನುದಾನಿತ (Aided)'}
                            {school.grantStatus === 'Proposed for Grant' && 'ಅನುದಾನಕ್ಕೆ ಪ್ರಸ್ತಾವಿತ'}
                            {school.grantStatus === 'Unaided' && 'ಅನುದಾನ ರಹಿತ (Unaided)'}
                            {school.grantStatus === 'Partially Aided' && 'ಭಾಗಶಃ ಅನುದಾನಿತ'}
                          </span>

                          {/* Compliance Rating Indicator Badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${compliance.badgeClass}`}>
                            <span className={`w-2 h-2 rounded-full ${compliance.dotBg}`}></span>
                            <span>{compliance.shortKn}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            isDue
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}>
                            ಮಾನ್ಯತೆ: {school.recognitionValidUpto}
                          </span>
                        </div>

                    <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      UDISE: {school.udiseCode}
                    </span>
                  </div>

                  {/* School Name & Institution */}
                  <div>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {school.schoolName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-stone-800">{school.institutionName || 'ಆಡಳಿತ ಮಂಡಳಿ ಮಾಹಿತಿ ಇಲ್ಲ'}</span>
                    </div>
                    {school.societyRegNumber && (
                      <p className="text-[11px] text-stone-500 pl-5">
                        ನೋಂದಣಿ: {school.societyRegNumber}
                      </p>
                    )}
                  </div>

                  {/* Category, Medium, Cluster */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600 bg-stone-50/80 p-2 rounded-lg border border-stone-100">
                    <span className="px-1.5 py-0.5 bg-white rounded border border-stone-200 font-medium">
                      {school.schoolCategory}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white rounded border border-stone-200 font-medium">
                      ಮಾಧ್ಯಮ: {school.medium}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white rounded border border-stone-200 font-medium">
                      {school.locationCluster}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white rounded border border-stone-200 font-medium text-emerald-800">
                      ವಿದ್ಯಾರ್ಥಿಗಳು: {school.studentCount}
                    </span>
                    {isAided && (
                      <span className="px-1.5 py-0.5 bg-emerald-100/70 text-emerald-900 rounded font-bold">
                        ಅನುದಾನಿತ ಹುದ್ದೆಗಳು: {school.aidedTeachersCount}
                      </span>
                    )}
                  </div>

                  {/* Phone Numbers & Key Contacts (ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು) */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/90 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <span className="font-bold text-[11px] text-stone-800 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                        ದೂರವಾಣಿ & ಸಂಪರ್ಕ ವಿವರ:
                      </span>
                      {school.schoolPhone && (
                        <a
                          href={`tel:${school.schoolPhone}`}
                          className="font-mono text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>ಕಚೇರಿ: {school.schoolPhone}</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {/* Headmaster Contact */}
                      <div className="bg-white p-2 rounded-lg border border-stone-200">
                        <p className="text-[10px] text-stone-500 font-medium">ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು (HM):</p>
                        <p className="font-bold text-stone-900 leading-tight mt-0.5">{school.hmName || '-'}</p>
                        {school.hmPhone ? (
                          <a
                            href={`tel:${school.hmPhone}`}
                            className="inline-flex items-center gap-1 text-emerald-800 font-mono font-semibold text-[11px] mt-1 hover:underline"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{school.hmPhone}</span>
                          </a>
                        ) : (
                          <span className="text-stone-400 text-[10px]">ಮೊಬೈಲ್ ಲಭ್ಯವಿಲ್ಲ</span>
                        )}
                      </div>

                      {/* Secretary / President Contact */}
                      <div className="bg-white p-2 rounded-lg border border-stone-200">
                        <p className="text-[10px] text-stone-500 font-medium">ಕಾರ್ಯದರ್ಶಿ / ಅಧ್ಯಕ್ಷರು:</p>
                        <p className="font-bold text-stone-900 leading-tight mt-0.5">{school.secretaryName || '-'}</p>
                        {school.secretaryPhone ? (
                          <a
                            href={`tel:${school.secretaryPhone}`}
                            className="inline-flex items-center gap-1 text-sky-800 font-mono font-semibold text-[11px] mt-1 hover:underline"
                          >
                            <Phone className="w-3 h-3 text-sky-600" />
                            <span>{school.secretaryPhone}</span>
                          </a>
                        ) : (
                          <span className="text-stone-400 text-[10px]">ಮೊಬೈಲ್ ಲಭ್ಯವಿಲ್ಲ</span>
                        )}
                      </div>
                    </div>

                    {/* Address & Email */}
                    <div className="text-[10.5px] text-stone-600 space-y-0.5 pt-1">
                      {school.email && (
                        <p className="flex items-center gap-1 text-stone-700">
                          <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{school.email}</span>
                        </p>
                      )}
                      <p className="flex items-start gap-1 text-stone-600">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{school.address}</span>
                      </p>
                    </div>

                    {/* Grant Order Details if available */}
                    {school.grantOrderNumber && (
                      <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 text-[10px] text-emerald-950 font-mono">
                        <span className="font-bold">ಅನುದಾನ ಆದೇಶ: </span>
                        {school.grantOrderNumber} ({school.grantOrderDate || '-'})
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Letter drafting fast triggers */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onDraftLetterForSchool && onDraftLetterForSchool(school, 'tmpl-nodal-recognition-letter')}
                      className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                      title="ಮಾನ್ಯತೆ ನವೀಕರಣ ಪರಿಶೀಲನೆ ನೋಡಲ್ ಪತ್ರ ತಯಾರಿಸಿ"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-700" />
                      <span>ನೋಡಲ್ ಪತ್ರ</span>
                    </button>

                    <button
                      onClick={() => onDraftLetterForSchool && onDraftLetterForSchool(school, 'tmpl-school-recognition-order')}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                      title="ಮಾನ್ಯತೆ ನವೀಕರಣ ಕಛೇರಿ ಆದೇಶ ತಯಾರಿಸಿ"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ಕಛೇರಿ ಆದೇಶ</span>
                    </button>

                    {isProposed && (
                      <button
                        onClick={() => onDraftLetterForSchool && onDraftLetterForSchool(school, 'tmpl-grant-proposal')}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                        title="ವೇತನಾನುದಾನ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ ಪತ್ರ"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        <span>ಅನುದಾನ ಪತ್ರ</span>
                      </button>
                    )}
                  </div>

                  {/* Edit / Delete / View */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewDetailsSchool(school)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                      title="ಸಂಪೂರ್ಣ ವಿವರ ವೀಕ್ಷಿಸಿ"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(school)}
                      className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      title="ತಿದ್ದುಪಡಿ ಮಾಡಿ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {currentUser?.role === 'Admin' && (
                      <button
                        onClick={() => handleDelete(school.id, school.schoolName)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="ದಾಖಲೆ ಅಳಿಸಿ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-bold">
                  <th className="p-3 w-10 text-center">ಕ್ರ.ಸಂ</th>
                  <th className="p-3">ಶಾಲೆಯ ಹೆಸರು & ವಿಳಾಸ</th>
                  <th className="p-3">UDISE & ಕೋಡ್</th>
                  <th className="p-3">ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ ವಿವರ</th>
                  <th className="p-3">ಅನುದಾನ ಸ್ಥಿತಿ & ಆದೇಶ</th>
                  <th className="p-3">ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು (HM & ಕಚೇರಿ)</th>
                  <th className="p-3">ಮಾನ್ಯತೆ ಅವಧಿ</th>
                  <th className="p-3 text-center">ಕಾರ್ಯಗಳು</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredSchools.map((school, index) => {
                  const isAided = school.grantStatus === 'Aided';
                  return (
                    <tr key={school.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3 text-center font-semibold text-stone-500">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900">{school.schoolName}</div>
                        <div className="text-[11px] text-stone-500">{school.address}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {school.schoolCategory} • {school.medium}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-stone-800">{school.udiseCode}</div>
                        <div className="text-[10px] text-stone-500">{school.schoolCode}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-stone-900">{school.institutionName}</div>
                        <div className="text-[10px] text-stone-500">{school.societyRegNumber}</div>
                        {school.secretaryName && (
                          <div className="text-[10px] text-sky-800 mt-0.5">
                            ಕಾರ್ಯದರ್ಶಿ: {school.secretaryName} ({school.secretaryPhone || '-'})
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAided
                            ? 'bg-emerald-100 text-emerald-800'
                            : school.grantStatus === 'Proposed for Grant'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}>
                          {school.grantStatus}
                        </span>
                        {school.grantOrderNumber && (
                          <div className="text-[10px] font-mono text-stone-600 mt-0.5">
                            ಸಂ: {school.grantOrderNumber}
                          </div>
                        )}
                        {isAided && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            ಅನುದಾನಿತ ಹುದ್ದೆ: {school.aidedTeachersCount}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {school.schoolPhone && (
                          <div className="font-mono text-stone-800 font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {school.schoolPhone}
                          </div>
                        )}
                        <div className="text-[11px] text-stone-700 mt-0.5">
                          HM: <span className="font-semibold">{school.hmName || '-'}</span>
                        </div>
                        {school.hmPhone && (
                          <div className="font-mono text-emerald-700 text-[10.5px]">
                            ಮೊ: {school.hmPhone}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-800">{school.recognitionValidUpto}</div>
                        {(() => {
                          const comp = computeSchoolCompliance(school);
                          return (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold mt-0.5 border ${comp.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${comp.dotBg}`}></span>
                              <span>{comp.shortKn}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onDraftLetterForSchool && onDraftLetterForSchool(school, 'tmpl-nodal-recognition-letter')}
                            className="p-1 text-sky-700 hover:bg-sky-50 rounded"
                            title="ನೋಡಲ್ ಪತ್ರ"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDraftLetterForSchool && onDraftLetterForSchool(school, 'tmpl-school-recognition-order')}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="ಕಛೇರಿ ಆದೇಶ"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(school)}
                            className="p-1 text-stone-600 hover:bg-stone-100 rounded"
                            title="ತಿದ್ದುಪಡಿ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {currentUser?.role === 'Admin' && (
                            <button
                              onClick={() => handleDelete(school.id, school.schoolName)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              title="ಅಳಿಸಿ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )}

      {/* 5. ADD / EDIT SCHOOL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <SchoolIcon className="w-5 h-5 text-emerald-700" />
                  <span>{editingSchool ? 'ಶಾಲೆಯ ಮಾಹಿತಿ ತಿದ್ದುಪಡಿ' : 'ಹೊಸ ಶಾಲೆ / ಸಂಸ್ಥೆ ನೋಂದಣಿ'}</span>
                </h2>
                <p className="text-xs text-stone-500">
                  ಅನುದಾನ, ಆಡಳಿತ ಮಂಡಳಿ ವಿವರ ಮತ್ತು ಅಧಿಕೃತ ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              {/* SECTION 1: ಶಾಲೆಯ ಮೂಲ ವಿವರ */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>1. ಶಾಲೆಯ ವಿವರ (School Basic Information)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲೆಯ ಹೆಸರು (School Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schoolName || ''}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder="e.g. ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಪ್ರೌಢಶಾಲೆ"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಯುಡೈಸ್ ಕೋಡ್ (UDISE Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.udiseCode || ''}
                      onChange={(e) => setFormData({ ...formData, udiseCode: e.target.value })}
                      placeholder="11 ಅಂಕಿಗಳ UDISE ಕೋಡ್ (e.g. 29160205801)"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲಾ ವರ್ಗ / ಹಂತ (School Category)
                    </label>
                    <select
                      value={formData.schoolCategory || 'High School (8-10)'}
                      onChange={(e) => setFormData({ ...formData, schoolCategory: e.target.value as SchoolCategoryType })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Primary (1-5)">ಪ್ರಾಥಮಿಕ ಶಾಲೆ (1-5)</option>
                      <option value="Higher Primary (1-8)">ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ (1-8)</option>
                      <option value="High School (8-10)">ಪ್ರೌಢಶಾಲೆ (8-10)</option>
                      <option value="Composite (1-10)">ಸಂಯುಕ್ತ ಶಾಲೆ (1-10)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಬೋಧನಾ ಮಾಧ್ಯಮ (Medium)
                    </label>
                    <select
                      value={formData.medium || 'Kannada & English'}
                      onChange={(e) => setFormData({ ...formData, medium: e.target.value as any })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="English">ಇಂಗ್ಲಿಷ್ (English)</option>
                      <option value="Kannada & English">ಕನ್ನಡ & ಇಂಗ್ಲಿಷ್ (Both)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಕ್ಲಸ್ಟರ್ (Cluster)
                    </label>
                    <select
                      value={formData.locationCluster || 'ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್'}
                      onChange={(e) => setFormData({ ...formData, locationCluster: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್">ಹಳೇನಗರ ಕ್ಲಸ್ಟರ್</option>
                      <option value="ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್">ಹೊಸನಗರ ಕ್ಲಸ್ಟರ್</option>
                      <option value="ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್">ಕುದ್ರಿಗೆರೆ ಕ್ಲಸ್ಟರ್</option>
                      <option value="ಹೊಳೆಹೊನ್ನೂರು ಕ್ಲಸ್ಟರ್">ಹೊಳೆಹೊನ್ನೂರು ಕ್ಲಸ್ಟರ್</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲಾ ಕೋಡ್ (School Code)
                    </label>
                    <input
                      type="text"
                      value={formData.schoolCode || ''}
                      onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                      placeholder="e.g. BHD-AID-01"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲೆಯ ಸಂಪೂರ್ಣ ವಿಳಾಸ (School Address)
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="ರಸ್ತೆ, ಗ್ರಾಮ/ಬಡಾವಣೆ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - ಪಿನ್‌ಕೋಡ್"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ಆಡಳಿತ ಮಂಡಳಿ / ಟ್ರಸ್ಟ್ / ಸಂಸ್ಥೆ ವಿವರ */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-700" />
                  <span>2. ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ / ಆಡಳಿತ ಮಂಡಳಿ ವಿವರ (Management & Society Details)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ ಹೆಸರು (Institution Name)
                    </label>
                    <input
                      type="text"
                      value={formData.institutionName || ''}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      placeholder="e.g. ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ವಿದ್ಯಾ ಸಂಸ್ಥೆ (ರಿ)"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ & ದಿನಾಂಕ (Society Reg No & Date)
                    </label>
                    <input
                      type="text"
                      value={formData.societyRegNumber || ''}
                      onChange={(e) => setFormData({ ...formData, societyRegNumber: e.target.value })}
                      placeholder="e.g. SOC/SHM/124/1982-83, ದಿನಾಂಕ: 15-08-1982"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ಅನುದಾನ ಸ್ಥಿತಿ (GRANT DETAILS) */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>3. ಅನುದಾನ ಸ್ಥಿತಿ & ಆದೇಶದ ವಿವರ (Grant Status & Order Details)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅನುದಾನ ಸ್ಥಿತಿ (Grant Status)
                    </label>
                    <select
                      value={formData.grantStatus || 'Aided'}
                      onChange={(e) => setFormData({ ...formData, grantStatus: e.target.value as SchoolGrantStatus })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Aided">ವೇತನಾನುದಾನಿತ (Aided)</option>
                      <option value="Proposed for Grant">ಅನುದಾನಕ್ಕೆ ಪ್ರಸ್ತಾವಿತ (Proposed)</option>
                      <option value="Unaided">ಅನುದಾನ ರಹಿತ (Unaided)</option>
                      <option value="Partially Aided">ಭಾಗಶಃ ಅನುದಾನಿತ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅನುದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ ಸಂಖ್ಯೆ
                    </label>
                    <input
                      type="text"
                      value={formData.grantOrderNumber || ''}
                      onChange={(e) => setFormData({ ...formData, grantOrderNumber: e.target.value })}
                      placeholder="e.g. ಇಡಿ 144 ಎಸ್ಇಡಬ್ಲ್ಯೂ 1994"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅನುದಾನ ಆದೇಶ ದಿನಾಂಕ
                    </label>
                    <input
                      type="date"
                      value={formData.grantOrderDate || ''}
                      onChange={(e) => setFormData({ ...formData, grantOrderDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ಅಧಿಕೃತ ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು & ಸಂಪರ್ಕ ವಿವರ (PHONE NUMBERS) */}
              <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80">
                <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-amber-700" />
                  <span>4. ದೂರವಾಣಿ ಸಂಖ್ಯೆಗಳು & ಸಂಪರ್ಕ ವಿವರ (Contact Numbers & Personnel)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲಾ ಕಚೇರಿ ಲ್ಯಾಂಡ್‌ಲೈನ್ ದೂರವಾಣಿ
                    </label>
                    <input
                      type="text"
                      value={formData.schoolPhone || ''}
                      onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                      placeholder="e.g. 08282-265112"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಶಾಲೆಯ ಅಧಿಕೃತ ಇಮೇಲ್ (Email)
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. school.bhd@karnatakaedu.org"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು (Headmaster Name)
                    </label>
                    <input
                      type="text"
                      value={formData.hmName || ''}
                      onChange={(e) => setFormData({ ...formData, hmName: e.target.value })}
                      placeholder="e.g. ಶ್ರೀಮತಿ ಪುಷ್ಪಲತಾ ಎಂ."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (HM Mobile)
                    </label>
                    <input
                      type="text"
                      value={formData.hmPhone || ''}
                      onChange={(e) => setFormData({ ...formData, hmPhone: e.target.value })}
                      placeholder="10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (e.g. 9845123456)"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಕಾರ್ಯದರ್ಶಿ / ಅಧ್ಯಕ್ಷರ ಹೆಸರು (Secretary/President)
                    </label>
                    <input
                      type="text"
                      value={formData.secretaryName || ''}
                      onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                      placeholder="e.g. ಶ್ರೀ ಕೆ. ರಾಮಚಂದ್ರ"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಕಾರ್ಯದರ್ಶಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Secretary Mobile)
                    </label>
                    <input
                      type="text"
                      value={formData.secretaryPhone || ''}
                      onChange={(e) => setFormData({ ...formData, secretaryPhone: e.target.value })}
                      placeholder="e.g. 9448123456"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: ವಿದ್ಯಾರ್ಥಿ ಮತ್ತು ಶಿಕ್ಷಕರ ಸಂಖ್ಯೆ */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>5. ವಿದ್ಯಾರ್ಥಿ & ಶಿಕ್ಷಕರ ಬಲ (Enrollment & Staff Strength)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ವಿದ್ಯಾರ್ಥಿ ಸಂಖ್ಯೆ (Student Count)
                    </label>
                    <input
                      type="number"
                      value={formData.studentCount || 0}
                      onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅನುದಾನಿತ ಶಿಕ್ಷಕರ ಸಂಖ್ಯೆ (Aided Teachers)
                    </label>
                    <input
                      type="number"
                      value={formData.aidedTeachersCount || 0}
                      onChange={(e) => setFormData({ ...formData, aidedTeachersCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅನುದಾನರಹಿತ ಶಿಕ್ಷಕರ ಸಂಖ್ಯೆ (Unaided Teachers)
                    </label>
                    <input
                      type="number"
                      value={formData.unaidedTeachersCount || 0}
                      onChange={(e) => setFormData({ ...formData, unaidedTeachersCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: ಮಾನ್ಯತೆ & ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರಗಳು */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>6. ಮಾನ್ಯತೆ & ಸುರಕ್ಷತಾ ದಾಖಲೆಗಳು (Recognition & Safety)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಮಾನ್ಯತೆ ಚಾಲ್ತಿ ಅವಧಿ (Valid Upto)
                    </label>
                    <input
                      type="text"
                      value={formData.recognitionValidUpto || '2026-27'}
                      onChange={(e) => setFormData({ ...formData, recognitionValidUpto: e.target.value })}
                      placeholder="e.g. 2026-27"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಮಾನ್ಯತೆ ಸ್ಥಿತಿ (Recognition Status)
                    </label>
                    <select
                      value={formData.recognitionStatus || 'Valid'}
                      onChange={(e) => setFormData({ ...formData, recognitionStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Valid">ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Valid)</option>
                      <option value="Renewal Due">ನವೀಕರಣ ಬಾಕಿ (Renewal Due)</option>
                      <option value="Expired">ಅವಧಿ ಮುಗಿದಿದೆ (Expired)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಅಗ್ನಿಶಾಮಕ NOC ಮಾನ್ಯತೆ ದಿನಾಂಕ
                    </label>
                    <input
                      type="date"
                      value={formData.fireSafetyNocValidUpto || ''}
                      onChange={(e) => setFormData({ ...formData, fireSafetyNocValidUpto: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: ಬ್ಯಾಂಕ್ ಖಾತೆ & ಟಿಪ್ಪಣಿಗಳು */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 border-b border-stone-200 pb-1">
                  7. ಬ್ಯಾಂಕ್ ಖಾತೆ & ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿ (Bank & Remarks)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ವೇತನ ಪಾವತಿ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ (Bank Account No)
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber || ''}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="SB / CA ಖಾತೆ ಸಂಖ್ಯೆ"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ಬ್ಯಾಂಕ್ IFSC ಕೋಡ್
                    </label>
                    <input
                      type="text"
                      value={formData.bankIfscCode || ''}
                      onChange={(e) => setFormData({ ...formData, bankIfscCode: e.target.value })}
                      placeholder="e.g. SBIN0040122"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-medium uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      ವಿಶೇಷ ಷರಾ / ಕಛೇರಿ ಟಿಪ್ಪಣಿ (Official Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="ಅನುದಾನ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನೆ ಅಥವಾ ಮಾನ್ಯತೆ ಪರಿಶೀಲನೆಗೆ ಸಂಬಂಧಿಸಿದ ಟಿಪ್ಪಣಿ..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-semibold"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : editingSchool ? 'ಮಾಹಿತಿ ನವೀಕರಿಸಿ' : 'ಶಾಲೆ ದಾಖಲಿಸಿ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. VIEW DETAILS MODAL */}
      {viewDetailsSchool && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                  {viewDetailsSchool.grantStatus}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{viewDetailsSchool.schoolName}</h3>
                <p className="text-xs text-stone-500">UDISE: {viewDetailsSchool.udiseCode} • ಕೋಡ್: {viewDetailsSchool.schoolCode}</p>
              </div>
              <button
                onClick={() => setViewDetailsSchool(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-500 block">ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್ ಹೆಸರು:</span>
                  <span className="font-bold text-stone-900">{viewDetailsSchool.institutionName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ:</span>
                  <span className="font-medium text-stone-900">{viewDetailsSchool.societyRegNumber || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <div>
                  <span className="text-[10px] text-amber-900 block font-semibold">ಶಾಲಾ ಕಚೇರಿ ದೂರವಾಣಿ:</span>
                  <a href={`tel:${viewDetailsSchool.schoolPhone}`} className="font-bold text-emerald-800 font-mono">
                    {viewDetailsSchool.schoolPhone || '-'}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-amber-900 block font-semibold">HM ಮೊಬೈಲ್ ಸಂಖ್ಯೆ:</span>
                  <a href={`tel:${viewDetailsSchool.hmPhone}`} className="font-bold text-emerald-800 font-mono">
                    {viewDetailsSchool.hmPhone || '-'}
                  </a>
                  <p className="text-[9.5px] text-stone-500">{viewDetailsSchool.hmName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-amber-900 block font-semibold">ಕಾರ್ಯದರ್ಶಿ ಮೊಬೈಲ್:</span>
                  <a href={`tel:${viewDetailsSchool.secretaryPhone}`} className="font-bold text-sky-800 font-mono">
                    {viewDetailsSchool.secretaryPhone || '-'}
                  </a>
                  <p className="text-[9.5px] text-stone-500">{viewDetailsSchool.secretaryName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-500 block">ವಿದ್ಯಾರ್ಥಿಗಳು:</span>
                  <span className="text-base font-bold text-stone-900">{viewDetailsSchool.studentCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">ಅನುದಾನಿತ ಹುದ್ದೆ:</span>
                  <span className="text-base font-bold text-emerald-800">{viewDetailsSchool.aidedTeachersCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">ಅನುದಾನರಹಿತ:</span>
                  <span className="text-base font-bold text-stone-800">{viewDetailsSchool.unaidedTeachersCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">ಮಾನ್ಯತೆ ಚಾಲ್ತಿ:</span>
                  <span className="text-base font-bold text-sky-900">{viewDetailsSchool.recognitionValidUpto}</span>
                </div>
              </div>

              {viewDetailsSchool.grantOrderNumber && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-800 font-bold">ಅನುದಾನ ಮಂಜೂರಾತಿ ಆದೇಶ:</p>
                  <p className="font-mono text-emerald-950 font-bold">{viewDetailsSchool.grantOrderNumber} (ದಿನಾಂಕ: {viewDetailsSchool.grantOrderDate || '-'})</p>
                </div>
              )}

              {viewDetailsSchool.notes && (
                <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
                  <p className="text-[10px] text-stone-500 font-bold">ಟಿಪ್ಪಣಿ / ಷರಾ:</p>
                  <p className="text-stone-800 italic">{viewDetailsSchool.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  const s = viewDetailsSchool;
                  setViewDetailsSchool(null);
                  handleOpenEdit(s);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                ತಿದ್ದುಪಡಿ ಮಾಡಿ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
