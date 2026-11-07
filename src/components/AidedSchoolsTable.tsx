import React, { useState, useMemo, useRef } from 'react';
import { SchoolInstitution, SchoolGrantStatus } from '../types';
import { AIDED_SCHOOLS_BHADRAVATHI } from '../data/csvEmployeesData';
import {
  School,
  Search,
  Printer,
  Download,
  Upload,
  Plus,
  FileText,
  Phone,
  Building,
  Users,
  ShieldCheck,
  Award,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface AidedSchoolsTableProps {
  schools?: SchoolInstitution[];
  onDraftLetterToSchool?: (school: SchoolInstitution) => void;
  showToast?: (msg: string) => void;
}

export const AidedSchoolsTable: React.FC<AidedSchoolsTableProps> = ({
  schools: initialSchools = AIDED_SCHOOLS_BHADRAVATHI,
  onDraftLetterToSchool,
  showToast
}) => {
  const [schoolsList, setSchoolsList] = useState<SchoolInstitution[]>(initialSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [grantTypeFilter, setGrantTypeFilter] = useState<'all' | 'aided' | 'unaided'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<SchoolInstitution | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // File input ref for CSV upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New School Form State
  const [newSchool, setNewSchool] = useState<Partial<SchoolInstitution>>({
    schoolName: '',
    udiseCode: '',
    institutionName: '',
    managementName: '',
    societyRegNumber: '',
    grantStatus: 'Aided',
    grantOrderNumber: '',
    grantOrderDate: '',
    hmName: '',
    hmPhone: '',
    secretaryName: '',
    secretaryPhone: '',
    email: '',
    address: 'ಭದ್ರಾವತಿ',
    locationCluster: 'ಹಳೇನಗರ',
    medium: 'Kannada & English',
    schoolCategory: 'High School (8-10)',
    studentCount: 250,
    aidedTeachersCount: 6,
    unaidedTeachersCount: 2,
    recognitionValidUpto: '2028-29',
    recognitionStatus: 'Valid',
    notes: ''
  });

  const displaySchools = useMemo(() => {
    return schoolsList.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.schoolName.toLowerCase().includes(q) ||
        s.udiseCode.includes(q) ||
        s.hmName.toLowerCase().includes(q) ||
        s.locationCluster.toLowerCase().includes(q) ||
        s.institutionName.toLowerCase().includes(q) ||
        (s.managementName && s.managementName.toLowerCase().includes(q));

      const matchGrant =
        grantTypeFilter === 'all' ||
        (grantTypeFilter === 'aided' && (s.grantStatus === 'Aided' || s.grantStatus === 'Partially Aided')) ||
        (grantTypeFilter === 'unaided' && s.grantStatus === 'Unaided');

      const matchCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'pre_primary' && (s.schoolCategory === 'Pre-Primary' || s.schoolName.includes('ಪೂರ್ವ ಪ್ರಾಥಮಿಕ'))) ||
        (categoryFilter === 'primary' && (s.schoolCategory === 'Primary (1-5)' || s.schoolName.includes('ಪ್ರಾಥಮಿಕ'))) ||
        (categoryFilter === 'higher_primary' && (s.schoolCategory === 'Higher Primary (1-8)' || s.schoolName.includes('ಹಿರಿಯ ಪ್ರಾಥಮಿಕ'))) ||
        (categoryFilter === 'high' && (s.schoolCategory === 'High School (8-10)' || s.schoolName.includes('ಪ್ರೌಢ') || s.schoolName.includes('ಹೈಸ್ಕೂಲ್'))) ||
        (categoryFilter === 'composite' && (s.schoolCategory === 'Composite (1-10)' || s.schoolName.includes('ಸಂಯುಕ್ತ')));

      return matchSearch && matchGrant && matchCategory;
    });
  }, [schoolsList, searchTerm, grantTypeFilter, categoryFilter]);

  // Counts
  const totalAided = useMemo(() => schoolsList.filter(s => s.grantStatus === 'Aided' || s.grantStatus === 'Partially Aided').length, [schoolsList]);
  const totalUnaided = useMemo(() => schoolsList.filter(s => s.grantStatus === 'Unaided').length, [schoolsList]);
  const totalTeachers = useMemo(() => schoolsList.reduce((acc, s) => acc + (s.aidedTeachersCount || 0) + (s.unaidedTeachersCount || 0), 0), [schoolsList]);
  const totalStudents = useMemo(() => schoolsList.reduce((acc, s) => acc + (s.studentCount || 0), 0), [schoolsList]);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'School Name',
      'UDISE Code',
      'Management Name (ಆಡಳಿತ ಮಂಡಳಿ)',
      'Institution/Trust',
      'Society Reg No',
      'Grant Status (ಅನುದಾನ ಸ್ಥಿತಿ)',
      'Category (ಶಾಲಾ ಹಂತ)',
      'HM Name',
      'HM Phone',
      'Cluster',
      'Medium',
      'Aided Teachers',
      'Unaided Teachers',
      'Students',
      'Grant Order No'
    ];

    const rows = displaySchools.map(s => [
      `"${(s.schoolName || '').replace(/"/g, '""')}"`,
      `"${s.udiseCode || ''}"`,
      `"${(s.managementName || s.institutionName || '').replace(/"/g, '""')}"`,
      `"${(s.institutionName || '').replace(/"/g, '""')}"`,
      `"${s.societyRegNumber || ''}"`,
      `"${s.grantStatus || ''}"`,
      `"${s.schoolCategory || ''}"`,
      `"${(s.hmName || '').replace(/"/g, '""')}"`,
      `"${s.hmPhone || ''}"`,
      `"${s.locationCluster || ''}"`,
      `"${s.medium || ''}"`,
      s.aidedTeachersCount || 0,
      s.unaidedTeachersCount || 0,
      s.studentCount || 0,
      `"${s.grantOrderNumber || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhadravathi_schools_list_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('ಶಾಲೆಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿಯನ್ನು CSV ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ');
    }
  };

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const headers = [
      'School Name',
      'UDISE Code',
      'Management Name',
      'Institution Name',
      'Society Reg No',
      'Grant Status (Aided/Unaided)',
      'Category (Pre-Primary/Primary/Higher Primary/High School/Composite)',
      'HM Name',
      'HM Phone',
      'Cluster',
      'Medium',
      'Aided Teachers',
      'Unaided Teachers',
      'Students',
      'Grant Order No'
    ];
    const sampleRow = [
      '"ಜ್ಞಾನೋದಯ ಪೂರ್ವ ಪ್ರಾಥಮಿಕ ಶಾಲೆ"',
      '"29150116099"',
      '"ಜ್ಞಾನೋದಯ ಶಿಕ್ಷಣ ಟ್ರಸ್ಟ್"',
      '"ಜ್ಞಾನೋದಯ ವಿದ್ಯಾ ಸಂಸ್ಥೆ"',
      '"SOC/BHD/99/2010"',
      '"Unaided"',
      '"Pre-Primary"',
      '"ಸುಧಾ ಕೆ."',
      '"9448112233"',
      '"ಹಳೇನಗರ"',
      '"Kannada & English"',
      '0',
      '5',
      '120',
      '"-"'
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), sampleRow.join(',')].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `schools_upload_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Upload Handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          alert('CSV ಕಡತದಲ್ಲಿ ಯಾವುದೇ ದತ್ತಾಂಶವಿಲ್ಲ.');
          return;
        }

        // Parse CSV lines
        const importedSchools: SchoolInstitution[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          // Basic CSV regex to handle commas inside quotes
          const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
          const clean = cols.map(c => c.replace(/^"|"$/g, '').trim());

          if (clean[0] && clean[0].length > 2) {
            const rawGrant = clean[5] || 'Aided';
            const grantStatus: SchoolGrantStatus = 
              rawGrant.toLowerCase().includes('unaided') || rawGrant.toLowerCase().includes('ಅನುದಾನರಹಿತ')
                ? 'Unaided'
                : 'Aided';

            importedSchools.push({
              id: `sch-imp-${Date.now()}-${i}`,
              schoolCode: `BHD-IMP-${i}`,
              schoolName: clean[0],
              udiseCode: clean[1] || `29150116${100 + i}`,
              managementName: clean[2] || clean[3] || 'ಆಡಳಿತ ಮಂಡಳಿ',
              institutionName: clean[3] || clean[2] || 'ಸಂಸ್ಥೆ / ಟ್ರಸ್ಟ್',
              societyRegNumber: clean[4] || `SOC/BHD/IMP/${i}`,
              grantStatus: grantStatus,
              schoolCategory: (clean[6] as any) || 'Primary (1-5)',
              hmName: clean[7] || 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು',
              hmPhone: clean[8] || '9448000000',
              locationCluster: clean[9] || 'ಭದ್ರಾವತಿ',
              medium: (clean[10] === 'Kannada' || clean[10] === 'English' || clean[10] === 'Kannada & English') ? clean[10] : 'Kannada & English',
              aidedTeachersCount: parseInt(clean[11]) || (grantStatus === 'Aided' ? 5 : 0),
              unaidedTeachersCount: parseInt(clean[12]) || (grantStatus === 'Unaided' ? 6 : 0),
              studentCount: parseInt(clean[13]) || 180,
              grantOrderNumber: clean[14] || (grantStatus === 'Aided' ? 'ED 100 SLB' : '-'),
              recognitionValidUpto: '2028-29',
              recognitionStatus: 'Valid',
              address: 'ಭದ್ರಾವತಿ'
            });
          }
        }

        if (importedSchools.length > 0) {
          setSchoolsList(prev => [...importedSchools, ...prev]);
          if (showToast) {
            showToast(`${importedSchools.length} ಶಾಲೆಗಳ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.`);
          } else {
            alert(`${importedSchools.length} ಶಾಲೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.`);
          }
        } else {
          alert('CSV ಯಿಂದ ಯಾವುದೇ ಶಾಲೆಗಳನ್ನು ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮಾದರಿ ನಮೂನೆಯನ್ನು ಬಳಸಿ.');
        }
      } catch (err) {
        console.error('CSV Parsing error:', err);
        alert('CSV ಕಡತವನ್ನು ಓದಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add School Form Submit
  const handleSaveNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.schoolName || !newSchool.udiseCode) {
      alert('ದಯವಿಟ್ಟು ಶಾಲೆಯ ಹೆಸರು ಹಾಗೂ ಯು-ಡೈಸ್ ಕೋಡ್ ನಮೂದಿಸಿ.');
      return;
    }

    const created: SchoolInstitution = {
      id: `sch-manual-${Date.now()}`,
      schoolCode: `BHD-${newSchool.grantStatus === 'Unaided' ? 'UNAID' : 'AID'}-${schoolsList.length + 1}`,
      schoolName: newSchool.schoolName!,
      udiseCode: newSchool.udiseCode!,
      institutionName: newSchool.institutionName || newSchool.managementName || 'ಸಂಸ್ಥೆ',
      managementName: newSchool.managementName || newSchool.institutionName || 'ಆಡಳಿತ ಮಂಡಳಿ',
      societyRegNumber: newSchool.societyRegNumber || 'SOC/BHD/REG/2026',
      grantStatus: (newSchool.grantStatus as SchoolGrantStatus) || 'Aided',
      grantOrderNumber: newSchool.grantOrderNumber || (newSchool.grantStatus === 'Aided' ? 'ED ORDER 2026' : '-'),
      grantOrderDate: newSchool.grantOrderDate || '2026-06-01',
      hmName: newSchool.hmName || 'ಮುಖ್ಯ ಶಿಕ್ಷಕರು',
      hmPhone: newSchool.hmPhone || '9448000000',
      secretaryName: newSchool.secretaryName || 'ಕಾರ್ಯದರ್ಶಿಗಳು',
      secretaryPhone: newSchool.secretaryPhone || '9845000000',
      email: newSchool.email || 'school.bhd@gmail.com',
      address: newSchool.address || 'ಭದ್ರಾವತಿ',
      locationCluster: newSchool.locationCluster || 'ಹಳೇನಗರ',
      medium: newSchool.medium || 'Kannada & English',
      schoolCategory: newSchool.schoolCategory || 'High School (8-10)',
      studentCount: Number(newSchool.studentCount) || 200,
      aidedTeachersCount: Number(newSchool.aidedTeachersCount) || (newSchool.grantStatus === 'Aided' ? 6 : 0),
      unaidedTeachersCount: Number(newSchool.unaidedTeachersCount) || (newSchool.grantStatus === 'Unaided' ? 6 : 0),
      recognitionValidUpto: newSchool.recognitionValidUpto || '2028-29',
      recognitionStatus: 'Valid',
      notes: newSchool.notes || ''
    };

    setSchoolsList(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    if (showToast) {
      showToast(`ಹೊಸ ಶಾಲೆ "${created.schoolName}" ಯಶಸ್ವಿಯಾಗಿ ಸೇರ್ಪಡೆಗೊಂಡಿದೆ.`);
    }
  };

  return (
    <div id="aided-schools-section" className="bg-white border-3 border-black shadow-[6px_6px_0px_#2b2b2b] p-5 my-6 rounded-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-black gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <School className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 border border-black uppercase tracking-wider font-kannada">
                ಆ2 ಸ.ಪ್ರಾ.ಶಿ & ಶಾಲೆಗಳ ಶಾಖೆ
              </span>
              <span className="bg-black text-amber-300 text-xs font-bold px-2 py-0.5 border border-black font-kannada">
                ಅಧಿಕೃತ ಶಾಲೆಗಳ ಪಟ್ಟಿ
              </span>
              <span className="bg-amber-100 text-amber-950 text-xs font-bold px-2 py-0.5 border border-black font-kannada">
                ಅನುದಾನಿತ & ಅನುದಾನರಹಿತ
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1 font-gaegu">
              ಅನುದಾನಿತ ಹಾಗೂ ಅನುದಾನರಹಿತ ಶಾಲೆಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿ (Aided & Unaided Schools Directory)
            </h2>
            <p className="text-xs text-slate-600 font-medium font-kannada">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ವ್ಯಾಪ್ತಿಯ ಪೂರ್ವ ಪ್ರಾಥಮಿಕ, ಪ್ರಾಥಮಿಕ, ಹಿರಿಯ ಪ್ರಾಥಮಿಕ, ಸಂಯುಕ್ತ ಹಾಗೂ ಪ್ರೌಢ ಶಾಲೆಗಳ ಆಡಳಿತ ಮಂಡಳಿ ವಿವರ
            </p>
          </div>
        </div>

        {/* Action Buttons: Add, Upload, Download, Print */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            id="btn-add-new-school"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 font-kannada"
            title="ಹೊಸ ಅನುದಾನಿತ ಅಥವಾ ಅನುದಾನರಹಿತ ಶಾಲೆಯನ್ನು ದಾಖಲಿಸಿ"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ಶಾಲೆ ಸೇರಿಸಿ</span>
          </button>

          <button
            id="btn-upload-schools-csv"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 font-kannada"
            title="CSV ಕಡತದಿಂದ ಶಾಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"
          >
            <Upload className="w-4 h-4" />
            <span>CSV ಅಪ್‌ಲೋಡ್</span>
          </button>

          <button
            id="btn-export-schools-csv"
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 bg-amber-400 hover:bg-amber-500 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 font-kannada"
            title="ಪ್ರಸ್ತುತ ಪಟ್ಟಿಯನ್ನು CSV ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
          >
            <Download className="w-4 h-4" />
            <span>CSV ಡೌನ್‌ಲೋಡ್</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1 px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border-2 border-black text-xs font-bold text-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer transition-all font-kannada"
            title="ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಮಾದರಿ CSV ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-600" />
            <span>ಮಾದರಿ</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 font-kannada"
            title="ಮುದ್ರಿಸಿ"
          >
            <Printer className="w-4 h-4" />
            <span>ಮುದ್ರಿಸಿ</span>
          </button>
        </div>
      </div>

      {/* Grant Type Tabs: All, Aided, Unaided */}
      <div className="flex items-center gap-2 mt-4 pb-2 border-b border-stone-300 overflow-x-auto">
        <button
          type="button"
          onClick={() => setGrantTypeFilter('all')}
          className={`px-4 py-1.5 text-xs font-black border-2 border-black transition-all cursor-pointer font-kannada whitespace-nowrap ${
            grantTypeFilter === 'all'
              ? 'bg-[#2b2b2b] text-white shadow-[2px_2px_0px_#f59e0b]'
              : 'bg-white text-stone-800 hover:bg-amber-50'
          }`}
        >
          ಎಲ್ಲಾ ಶಾಲೆಗಳು ({schoolsList.length})
        </button>

        <button
          type="button"
          onClick={() => setGrantTypeFilter('aided')}
          className={`px-4 py-1.5 text-xs font-black border-2 border-black transition-all cursor-pointer font-kannada whitespace-nowrap ${
            grantTypeFilter === 'aided'
              ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_#000]'
              : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
          }`}
        >
          ವೇತನಾನುದಾನಿತ ಶಾಲೆಗಳು ({totalAided})
        </button>

        <button
          type="button"
          onClick={() => setGrantTypeFilter('unaided')}
          className={`px-4 py-1.5 text-xs font-black border-2 border-black transition-all cursor-pointer font-kannada whitespace-nowrap ${
            grantTypeFilter === 'unaided'
              ? 'bg-indigo-700 text-white shadow-[2px_2px_0px_#000]'
              : 'bg-indigo-50 text-indigo-950 hover:bg-indigo-100'
          }`}
        >
          ಅನುದಾನರಹಿತ ಶಾಲೆಗಳು ({totalUnaided})
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-4">
        {/* Search */}
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="schools-search-input"
            type="text"
            placeholder="ಶಾಲೆಯ ಹೆಸರು, ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು, ಡೈಸ್ ಕೋಡ್, ಮುಖ್ಯಸ್ಥರ ಹೆಸರು ಹುಡುಕಿ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black text-xs font-semibold focus:outline-none focus:bg-amber-50 font-kannada"
          />
        </div>

        {/* Categories Filter with exact 1. Pre-Primary, 2. Primary, etc. */}
        <div className="sm:col-span-5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-600 shrink-0" />
          <select
            id="schools-category-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-2.5 bg-white border-2 border-black text-xs font-bold focus:outline-none font-kannada"
          >
            <option value="all">ಎಲ್ಲಾ ಶಾಲಾ ಹಂತಗಳು (All Levels)</option>
            <option value="pre_primary">1. ಪೂರ್ವ ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Pre-Primary / LKG-UKG)</option>
            <option value="primary">2. ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Primary 1-5)</option>
            <option value="higher_primary">3. ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Higher Primary 1-8)</option>
            <option value="high">4. ಪ್ರೌಢಶಾಲೆ (High School 8-10)</option>
            <option value="composite">5. ಸಂಯುಕ್ತ ಶಾಲೆ (Composite 1-10)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-900 font-kannada">ಒಟ್ಟು ಶಾಲೆಗಳು</p>
            <p className="text-lg font-black text-blue-950">{schoolsList.length}</p>
          </div>
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <div className="bg-emerald-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-900 font-kannada">ಅನುದಾನಿತ ಶಾಲೆಗಳು</p>
            <p className="text-lg font-black text-emerald-950">{totalAided}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="bg-indigo-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-indigo-900 font-kannada">ಅನುದಾನರಹಿತ ಶಾಲೆಗಳು</p>
            <p className="text-lg font-black text-indigo-950">{totalUnaided}</p>
          </div>
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="bg-amber-50 border-2 border-black p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-900 font-kannada">ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು</p>
            <p className="text-lg font-black text-amber-950">
              {totalStudents.toLocaleString('en-IN')}
            </p>
          </div>
          <Award className="w-6 h-6 text-amber-700" />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border-2 border-black">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-black text-center divide-x divide-slate-700 font-kannada">
              <th className="py-2.5 px-2 w-10">ಕ್ರ.ಸಂ</th>
              <th className="py-2.5 px-3 text-left min-w-[220px]">ಶಾಲೆಯ ಹೆಸರು & ಆಡಳಿತ ಮಂಡಳಿ (Management Name)</th>
              <th className="py-2.5 px-2 min-w-[110px]">ಯು-ಡೈಸ್ ಕೋಡ್</th>
              <th className="py-2.5 px-2 min-w-[100px]">ಅನುದಾನ ಸ್ಥಿತಿ</th>
              <th className="py-2.5 px-2 min-w-[130px]">ಶಾಲಾ ಹಂತ / ವರ್ಗ</th>
              <th className="py-2.5 px-3 text-left min-w-[180px]">ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು & ಸಂಪರ್ಕ</th>
              <th className="py-2.5 px-2 min-w-[110px]">ಅನುದಾನ ಆದೇಶ</th>
              <th className="py-2.5 px-2 min-w-[90px]">ಸಿಬ್ಬಂದಿ</th>
              <th className="py-2.5 px-2 min-w-[80px]">ದಾಖಲಾತಿ</th>
              <th className="py-2.5 px-2 min-w-[120px]">ಕ್ರಮಗಳು</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200">
            {displaySchools.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-bold font-kannada">
                  ಯಾವುದೇ ಶಾಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ. ಹುಡುಕಾಟ ಪದ ಅಥವಾ ವರ್ಗ ಪರಿಶೀಲಿಸಿ.
                </td>
              </tr>
            ) : (
              displaySchools.map((sch, idx) => {
                const isUnaided = sch.grantStatus === 'Unaided';

                return (
                  <tr
                    key={sch.id || idx}
                    className="hover:bg-amber-50/70 transition-colors font-medium divide-x divide-slate-200"
                  >
                    <td className="py-2.5 px-2 text-center font-black bg-slate-100">{idx + 1}</td>
                    
                    {/* School Name & Management Name (ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು) */}
                    <td className="py-2.5 px-3">
                      <div className="font-black text-slate-900 text-[13px] font-kannada">
                        {sch.schoolName}
                      </div>
                      
                      {/* Management Name Field Prominently Displayed */}
                      <div className="text-[11px] text-indigo-900 font-bold flex items-center gap-1 mt-1 font-kannada bg-indigo-50/70 px-1.5 py-0.5 rounded border border-indigo-200">
                        <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>ಆಡಳಿತ ಮಂಡಳಿ: <strong>{sch.managementName || sch.institutionName}</strong></span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ನೋಂದಣಿ: {sch.societyRegNumber || 'ಲಭ್ಯವಿಲ್ಲ'}
                      </div>
                    </td>

                    {/* UDISE Code */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900">
                      <span className="bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        {sch.udiseCode}
                      </span>
                    </td>

                    {/* Grant Status */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-black border rounded font-kannada ${
                        isUnaided
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {isUnaided ? 'ಅನುದಾನರಹಿತ' : 'ವೇತನಾನುದಾನಿತ'}
                      </span>
                    </td>

                    {/* Category (Pre-primary, Primary, High School, Composite) */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="font-bold text-slate-800 text-[11px] font-kannada">
                        {sch.schoolCategory}
                      </div>
                      <span className="inline-block bg-slate-100 border border-slate-300 text-[10px] px-1 py-0.2 mt-0.5 rounded font-kannada">
                        ಕ್ಲಸ್ಟರ್: {sch.locationCluster}
                      </span>
                    </td>

                    {/* HM & Contact */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 font-kannada">{sch.hmName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-700 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <a href={`tel:${sch.hmPhone}`} className="hover:underline">{sch.hmPhone}</a>
                      </div>
                      {sch.email && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{sch.email}</div>
                      )}
                    </td>

                    {/* Grant Order */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="font-bold text-slate-800 text-[11px] font-mono">{sch.grantOrderNumber || '-'}</div>
                      {sch.grantOrderDate && (
                        <div className="text-[10px] text-slate-500 font-mono">{sch.grantOrderDate}</div>
                      )}
                      {!isUnaided ? (
                        <span className="inline-block bg-emerald-50 text-emerald-900 font-bold text-[9px] px-1 py-0.2 border border-emerald-200 mt-0.5 font-kannada">
                          ವೇತನಾನುದಾನ
                        </span>
                      ) : (
                        <span className="inline-block bg-stone-100 text-stone-700 text-[9px] px-1 py-0.2 border border-stone-200 mt-0.5 font-kannada">
                          ಖಾಸಗಿ
                        </span>
                      )}
                    </td>

                    {/* Teachers Count */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="font-black text-slate-900 text-sm">
                        {(sch.aidedTeachersCount || 0) + (sch.unaidedTeachersCount || 0)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-kannada">
                        {isUnaided ? `${sch.unaidedTeachersCount || 0} ಅನುದಾನರಹಿತ` : `${sch.aidedTeachersCount || 0} ಅನುದಾನಿತ`}
                      </div>
                    </td>

                    {/* Students Count */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="font-black text-slate-900 text-sm">{sch.studentCount}</div>
                      <div className="text-[10px] text-slate-500 font-kannada">ವಿದ್ಯಾರ್ಥಿಗಳು</div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        {onDraftLetterToSchool && (
                          <button
                            type="button"
                            onClick={() => onDraftLetterToSchool(sch)}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-amber-400 hover:bg-amber-500 border border-black text-[10px] font-black shadow-[1px_1px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all font-kannada"
                            title="ಈ ಶಾಲೆಗೆ ಅಧಿಕೃತ ಸಾಮಾನ್ಯ ಪತ್ರ ಸೃಜಿಸಿ"
                          >
                            <FileText className="w-3 h-3" />
                            <span>ಪತ್ರ ಸೃಜಿಸಿ</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedSchool(sch)}
                          className="w-full px-2 py-1 bg-white hover:bg-slate-100 border border-black text-[10px] font-bold cursor-pointer font-kannada"
                        >
                          ಸಂಪೂರ್ಣ ವಿವರ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New School Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-3 border-black shadow-[10px_10px_0px_#000] max-w-2xl w-full p-6 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900 font-kannada">
                  ಹೊಸ ಶಾಲೆ ಸೇರ್ಪಡೆ (ಅನುದಾನಿತ / ಅನುದಾನರಹಿತ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 bg-red-500 text-white font-black border-2 border-black flex items-center justify-center hover:bg-red-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewSchool} className="mt-4 space-y-4 text-xs font-kannada">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಶಾಲೆಯ ಹೆಸರು (School Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchool.schoolName}
                    onChange={e => setNewSchool({ ...newSchool, schoolName: e.target.value })}
                    placeholder="ಉದಾ: ಆದರ್ಶ ಪೂರ್ವ ಪ್ರಾಥಮಿಕ ಶಾಲೆ"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಯು-ಡೈಸ್ ಕೋಡ್ (UDISE Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchool.udiseCode}
                    onChange={e => setNewSchool({ ...newSchool, udiseCode: e.target.value })}
                    placeholder="ಉದಾ: 29150116025"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-mono font-bold"
                  />
                </div>

                {/* Management Name Field */}
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">
                    ಆಡಳಿತ ಮಂಡಳಿ ಹೆಸರು (Management Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchool.managementName}
                    onChange={e => setNewSchool({ ...newSchool, managementName: e.target.value, institutionName: e.target.value })}
                    placeholder="ಉದಾ: ಶ್ರೀ ಗುರು ಸಿದ್ಧೇಶ್ವರ ವಿದ್ಯಾ ಸಂಸ್ಥೆ ಆಡಳಿತ ಮಂಡಳಿ"
                    className="w-full p-2 border-2 border-black bg-indigo-50/50 focus:bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಸೊಸೈಟಿ ನೋಂದಣಿ ಸಂಖ್ಯೆ (Society Reg No)
                  </label>
                  <input
                    type="text"
                    value={newSchool.societyRegNumber}
                    onChange={e => setNewSchool({ ...newSchool, societyRegNumber: e.target.value })}
                    placeholder="ಉದಾ: SOC/BHD/105/1995"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-mono"
                  />
                </div>

                {/* Grant Status */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಅನುದಾನ ಸ್ಥಿತಿ (Grant Status) *
                  </label>
                  <select
                    value={newSchool.grantStatus}
                    onChange={e => setNewSchool({ ...newSchool, grantStatus: e.target.value as SchoolGrantStatus })}
                    className="w-full p-2 border-2 border-black bg-white text-xs font-bold"
                  >
                    <option value="Aided">ವೇತನಾನುದಾನಿತ (Aided)</option>
                    <option value="Unaided">ಅನುದಾನರಹಿತ (Unaided)</option>
                    <option value="Partially Aided">ಭಾಗಶಃ ಅನುದಾನಿತ (Partially Aided)</option>
                  </select>
                </div>

                {/* Category with 1. Pre-Primary, 2. Primary, etc. */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಶಾಲಾ ಹಂತ / ವರ್ಗ (Category) *
                  </label>
                  <select
                    value={newSchool.schoolCategory}
                    onChange={e => setNewSchool({ ...newSchool, schoolCategory: e.target.value as any })}
                    className="w-full p-2 border-2 border-black bg-white text-xs font-bold"
                  >
                    <option value="Pre-Primary">1. ಪೂರ್ವ ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Pre-Primary / LKG-UKG)</option>
                    <option value="Primary (1-5)">2. ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Primary 1-5)</option>
                    <option value="Higher Primary (1-8)">3. ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ (Higher Primary 1-8)</option>
                    <option value="High School (8-10)">4. ಪ್ರೌಢಶಾಲೆ (High School 8-10)</option>
                    <option value="Composite (1-10)">5. ಸಂಯುಕ್ತ ಶಾಲೆ (Composite 1-10)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು (HM Name)
                  </label>
                  <input
                    type="text"
                    value={newSchool.hmName}
                    onChange={e => setNewSchool({ ...newSchool, hmName: e.target.value })}
                    placeholder="ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಹೆಸರು"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಮುಖ್ಯಸ್ಥರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (HM Phone)
                  </label>
                  <input
                    type="text"
                    value={newSchool.hmPhone}
                    onChange={e => setNewSchool({ ...newSchool, hmPhone: e.target.value })}
                    placeholder="9448012345"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ಕ್ಲಸ್ಟರ್ (Cluster)
                  </label>
                  <input
                    type="text"
                    value={newSchool.locationCluster}
                    onChange={e => setNewSchool({ ...newSchool, locationCluster: e.target.value })}
                    placeholder="ಹಳೇನಗರ / ಹೊಸನಗರ / ಹೊಳೆಹೊನ್ನೂರು"
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">
                    ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಖ್ಯೆ (Students Count)
                  </label>
                  <input
                    type="number"
                    value={newSchool.studentCount}
                    onChange={e => setNewSchool({ ...newSchool, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  ವಿಳಾಸ (Address)
                </label>
                <input
                  type="text"
                  value={newSchool.address}
                  onChange={e => setNewSchool({ ...newSchool, address: e.target.value })}
                  placeholder="ಶಾಲಾ ವಿಳಾಸ, ಭದ್ರಾವತಿ"
                  className="w-full p-2 border-2 border-black bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 border-2 border-black font-bold text-xs cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  ಶಾಲೆಯನ್ನು ಸೇರ್ಪಡೆಗೊಳಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-3 border-black shadow-[10px_10px_0px_#000] max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-slate-900 font-kannada">
                  ಶಾಲೆಯ ಸಮಗ್ರ ವಿವರ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="w-7 h-7 bg-red-500 text-white font-black border-2 border-black flex items-center justify-center hover:bg-red-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs font-kannada">
              <div className="bg-amber-50 p-3 border-2 border-black">
                <p className="font-black text-sm text-slate-900">{selectedSchool.schoolName}</p>
                <p className="text-indigo-900 mt-1 font-bold">
                  ಆಡಳಿತ ಮಂಡಳಿ: {selectedSchool.managementName || selectedSchool.institutionName}
                </p>
                <p className="text-slate-600 mt-0.5 font-medium">{selectedSchool.institutionName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">ವಿಳಾಸ: {selectedSchool.address || 'ಭದ್ರಾವತಿ'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಡೈಸ್ ಕೋಡ್ (UDISE)</span>
                  <span className="font-mono font-black text-slate-800">{selectedSchool.udiseCode}</span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಅನುದಾನ ಸ್ಥಿತಿ</span>
                  <span className="font-bold text-slate-800">
                    {selectedSchool.grantStatus === 'Unaided' ? 'ಅನುದಾನರಹಿತ (Unaided)' : 'ವೇತನಾನುದಾನಿತ (Aided)'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಶಾಲಾ ವರ್ಗ / ಹಂತ</span>
                  <span className="font-bold text-slate-800">{selectedSchool.schoolCategory}</span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಕ್ಲಸ್ಟರ್</span>
                  <span className="font-bold text-slate-800">{selectedSchool.locationCluster}</span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು</span>
                  <span className="font-bold text-slate-800">{selectedSchool.hmName}</span>
                  <span className="font-mono text-slate-600 text-[11px] block">{selectedSchool.hmPhone}</span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಕಾರ್ಯದರ್ಶಿಗಳು</span>
                  <span className="font-bold text-slate-800">{selectedSchool.secretaryName || 'ಲಭ್ಯವಿಲ್ಲ'}</span>
                  <span className="font-mono text-slate-600 text-[11px] block">{selectedSchool.secretaryPhone || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಅನುದಾನ ಮಂಜೂರಾತಿ ಸಂಖ್ಯೆ</span>
                  <span className="font-bold text-emerald-900">{selectedSchool.grantOrderNumber || '-'}</span>
                  {selectedSchool.grantOrderDate && (
                    <span className="text-[10px] text-slate-500 block">ದಿನಾಂಕ: {selectedSchool.grantOrderDate}</span>
                  )}
                </div>
                <div className="bg-slate-50 p-2 border border-black">
                  <span className="text-[10px] text-slate-500 block">ಮಾನ್ಯತೆ ಚಾಲ್ತಿ ಅವಧಿ</span>
                  <span className="font-bold text-purple-900">{selectedSchool.recognitionValidUpto || '2028-29'}</span>
                </div>
              </div>

              {selectedSchool.notes && (
                <div className="bg-blue-50 p-2.5 border border-black text-[11px] text-blue-950">
                  <span className="font-black block">ವಿಶೇಷ ಸೂಚನೆ / ಟಿಪ್ಪಣಿ:</span>
                  {selectedSchool.notes}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-end gap-2">
              {onDraftLetterToSchool && (
                <button
                  type="button"
                  onClick={() => {
                    const sch = selectedSchool;
                    setSelectedSchool(null);
                    onDraftLetterToSchool(sch);
                  }}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-500 border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer font-kannada"
                >
                  ಈ ಶಾಲೆಗೆ ಪತ್ರ ಸಿದ್ಧಪಡಿಸಿ
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 border-2 border-black font-bold text-xs cursor-pointer font-kannada"
              >
                ಮುಚ್ಚಿ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
