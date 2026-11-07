import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Calendar,
  Building,
  Tag,
  Shield,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  FolderPlus,
  X,
  ChevronRight,
  BookMarked,
  Info,
  Check,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { 
  GovOrderRecord, 
  DigitalReferenceBook, 
  MasterDocketFile,
  GovOrderCategory,
  GovValidityStatus 
} from '../types';
import { KARNATAKA_STATUTORY_RULES, STATUTORY_BOOKS_INFO } from '../data/karnatakaStatutoryBooks';

interface GovOrdersLibraryViewProps {
  currentUser?: { displayName: string; role: string } | null;
  files?: MasterDocketFile[];
  onOpenLetterWithRef?: (citation: string) => void;
}

export const GovOrdersLibraryView: React.FC<GovOrdersLibraryViewProps> = ({
  currentUser,
  files = [],
  onOpenLetterWithRef,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'books' | 'sources'>('orders');
  const [orders, setOrders] = useState<GovOrderRecord[]>([]);
  const [books, setBooks] = useState<DigitalReferenceBook[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState<string>('all');
  const [selectedValidity, setSelectedValidity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Active Selections
  const [selectedOrder, setSelectedOrder] = useState<GovOrderRecord | null>(null);
  const [selectedBook, setSelectedBook] = useState<DigitalReferenceBook | null>(null);
  const [selectedRuleChapter, setSelectedRuleChapter] = useState<any | null>(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAttachToFileModalOpen, setIsAttachToFileModalOpen] = useState(false);
  const [targetFileId, setTargetFileId] = useState<string>(files[0]?.id || '');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New GO form state
  const [newOrderForm, setNewOrderForm] = useState({
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ',
    section: 'ಆ2',
    subject: '',
    category: 'ಶಿಕ್ಷಣ ಇಲಾಖೆ' as GovOrderCategory,
    orderType: 'ಸರ್ಕಾರಿ ಆದೇಶ',
    validityStatus: 'Active' as GovValidityStatus,
    keywords: '',
    description: '',
    sourceUrl: '',
    remarks: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, booksRes, sourcesRes] = await Promise.all([
        fetch('/api/gov-orders').then(r => r.json()),
        fetch('/api/reference-books').then(r => r.json()),
        fetch('/api/official-sources').then(r => r.json()),
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
      }
      if (booksRes.success && Array.isArray(booksRes.books)) {
        setBooks(booksRes.books);
      }
      if (sourcesRes.success && Array.isArray(sourcesRes.sources)) {
        setSources(sourcesRes.sources);
      }
    } catch (err: any) {
      console.warn('Failed to load library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 8 Canonical Submodules
  const SUBMODULES = [
    { id: 'all', title: 'ಎಲ್ಲಾ ಆದೇಶಗಳು (All Orders)', count: orders.length },
    { id: 'ಶಿಕ್ಷಣ ಇಲಾಖೆ', title: '1. ಶಾಲಾ ಶಿಕ್ಷಣ & ಸಾಕ್ಷರತಾ ಇಲಾಖೆ', count: orders.filter(o => o.category === 'ಶಿಕ್ಷಣ ಇಲಾಖೆ').length },
    { id: 'ನೌಕರರ ಸೇವಾ ನಿಯಮ', title: '2. ನೌಕರರ ಸೇವಾ ನಿಯಮಗಳು & ವರ್ಗಾವಣೆ', count: orders.filter(o => o.category === 'ನೌಕರರ ಸೇವಾ ನಿಯಮ' || o.category === 'ಜೇಷ್ಠತೆ').length },
    { id: 'ರಜೆ ನಿಯಮಗಳು', title: '3. ರಜೆ ನಿಯಮಗಳು (EL/HPL/CCL)', count: orders.filter(o => o.category === 'ರಜೆ ನಿಯಮಗಳು').length },
    { id: 'ವೇತನ ನಿಯಮಗಳು', title: '4. ವೇತನ & 7ನೇ ವೇತನ ಆಯೋಗ (Pay)', count: orders.filter(o => o.category === 'ವೇತನ ನಿಯಮಗಳು' || o.category === 'HRMS').length },
    { id: 'ಪಿಂಚಣಿ', title: '5. ಪಿಂಚಣಿ & ನಿವೃತ್ತಿ ಸೌಲಭ್ಯ (Pension)', count: orders.filter(o => o.category === 'ಪಿಂಚಣಿ').length },
    { id: 'ಶಿಸ್ತು ಕ್ರಮ', title: '6. ಶಿಸ್ತು ಕ್ರಮ & ಇಲಾಖಾ ವಿಚಾರಣೆ (CCA)', count: orders.filter(o => o.category === 'ಶಿಸ್ತು ಕ್ರಮ').length },
    { id: 'ಹಣಕಾಸು', title: '7. ಹಣಕಾಸು & ಖಜಾನೆ ನಿಯಮಗಳು (KFC/KTC)', count: orders.filter(o => o.category === 'ಹಣಕಾಸು' || o.category === 'ಖಜಾನೆ').length },
    { id: 'RTI', title: '8. ಮಾಹಿತಿ ಹಕ್ಕು & ಶಾಲಾ ಆಡಳಿತ (RTI/RTE)', count: orders.filter(o => o.category === 'RTI' || o.category === 'ಶಾಲಾ ಆಡಳಿತ').length },
  ];

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.subject.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        (o.keywords || []).some(k => k.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q));

      const matchesSubmodule = selectedSubmodule === 'all' || 
        o.category === selectedSubmodule ||
        (selectedSubmodule === 'ನೌಕರರ ಸೇವಾ ನಿಯಮ' && o.category === 'ಜೇಷ್ಠತೆ') ||
        (selectedSubmodule === 'ವೇತನ ನಿಯಮಗಳು' && o.category === 'HRMS') ||
        (selectedSubmodule === 'ಹಣಕಾಸು' && o.category === 'ಖಜಾನೆ') ||
        (selectedSubmodule === 'RTI' && o.category === 'ಶಾಲಾ ಆಡಳಿತ');

      const matchesValidity = selectedValidity === 'all' || o.validityStatus === selectedValidity;

      return matchesSearch && matchesSubmodule && matchesValidity;
    });
  }, [orders, searchQuery, selectedSubmodule, selectedValidity]);

  // Handle Save New Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.orderNumber || !newOrderForm.subject) {
      alert('ದಯವಿಟ್ಟು ಆದೇಶ ಸಂಖ್ಯೆ ಮತ್ತು ವಿಷಯವನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    try {
      const payload = {
        ...newOrderForm,
        keywords: newOrderForm.keywords ? newOrderForm.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const res = await fetch('/api/gov-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast('ಸರ್ಕಾರಿ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ!');
        setIsAddOrderModalOpen(false);
        fetchData();
        setNewOrderForm({
          orderNumber: '',
          orderDate: new Date().toISOString().split('T')[0],
          department: 'ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ',
          section: 'ಆ2',
          subject: '',
          category: 'ಶಿಕ್ಷಣ ಇಲಾಖೆ',
          orderType: 'ಸರ್ಕಾರಿ ಆದೇಶ',
          validityStatus: 'Active',
          keywords: '',
          description: '',
          sourceUrl: '',
          remarks: '',
        });
      } else {
        alert(data.error || 'ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ.');
      }
    } catch (err: any) {
      alert('ದೋಷ: ' + err.message);
    }
  };

  // Handle Attach to File
  const handleAttachToFile = async () => {
    if (!targetFileId || !selectedOrder) return;
    try {
      const res = await fetch(`/api/files/${targetFileId}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceType: 'gov_order',
          referenceId: selectedOrder.id,
          title: selectedOrder.subject,
          citation: `ಸರ್ಕಾರಿ ಆದೇಶ ಸಂ: ${selectedOrder.orderNumber}, ದಿನಾಂಕ: ${selectedOrder.orderDate}`,
          subject: selectedOrder.subject,
          ruleOrOrderNumber: selectedOrder.orderNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('ಸರ್ಕಾರಿ ಆದೇಶವನ್ನು ಕಡತಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ!');
        setIsAttachToFileModalOpen(false);
      } else {
        alert(data.error || 'ಲಗತ್ತಿಸಲು ವಿಫಲವಾಗಿದೆ.');
      }
    } catch (err: any) {
      alert('ದೋಷ: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm text-white shadow-xl animate-fade-in border border-stone-700">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-900 via-amber-800 to-amber-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-200 border border-white/10">
              <Shield className="h-3.5 w-3.5" />
              ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಗ್ರಂಥಾಲಯ & ಉಲ್ಲೇಖ ಪುಸ್ತಕಗಳು
            </h1>
            <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
              ಸರ್ಕಾರಿ ಆದೇಶಗಳು, ಸುತ್ತೋಲೆಗಳು, KCSR, KFC, CCA ಹಾಗೂ ಶಾಸನಬದ್ಧ ಸೇವಾ ನಿಯಮಾವಳಿಗಳ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಗ್ರಂಥಾಲಯ. ಕಡತ ಹಾಗೂ ಪತ್ರಗಳಿಗೆ ತಕ್ಷಣ ಉಲ್ಲೇಖ ಲಗತ್ತಿಸಿ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddOrderModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              + ಹೊಸ ಸರ್ಕಾರಿ ಆದೇಶ ಸೇರಿಸಿ
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/20"
              title="ಮರುಲೋಡ್ ಮಾಡಿ"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              ಅಪ್‌ಡೇಟ್
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-6 pt-3 rounded-t-xl shadow-xs">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'orders'
                ? 'border-amber-700 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="h-4 w-4 text-amber-700" />
            ಸರ್ಕಾರಿ ಆದೇಶಗಳು & ಸುತ್ತೋಲೆಗಳು
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'books'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="h-4 w-4 text-emerald-700" />
            ಕಛೇರಿ ಉಲ್ಲೇಖ ಪುಸ್ತಕಗಳು & ನಿಯಮಗಳು
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              14 ಪುಸ್ತಕಗಳು
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'sources'
                ? 'border-sky-700 text-sky-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ExternalLink className="h-4 w-4 text-sky-700" />
            ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮೂಲಗಳು & ಪೋರ್ಟಲ್‌ಗಳು
            <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
              {sources.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Submodule Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-700" />
                ವಿಭಾಗವಾರು ಆದೇಶಗಳು (Submodules)
              </h3>
              <div className="space-y-1">
                {SUBMODULES.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmodule(sub.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      selectedSubmodule === sub.id
                        ? 'bg-amber-100/70 text-amber-950 font-bold shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="truncate">{sub.title}</span>
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedSubmodule === sub.id ? 'bg-amber-700 text-white font-bold' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {sub.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Validity Filter */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-700" />
                ಆದೇಶದ ಸ್ಥಿತಿ (Validity Status)
              </h3>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All)' },
                  { id: 'Active', label: '✓ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active)' },
                  { id: 'Superseded', label: '⚠ ತಿದ್ದುಪಡಿಯಾಗಿದೆ (Superseded)' },
                  { id: 'Amended', label: '📝 ಭಾಗಶಃ ಬದಲಾಗಿದೆ (Amended)' },
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedValidity(v.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors ${
                      selectedValidity === v.id
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List & Search */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ಆದೇಶ ಸಂಖ್ಯೆ, ವಿಷಯ, ಕೀವರ್ಡ್ ಅಥವಾ ವರ್ಷ ನಮೂದಿಸಿ ಹುಡುಕಿ..."
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 py-2 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-stone-500 font-medium whitespace-nowrap">
                ಒಟ್ಟು ಆದೇಶಗಳು: <span className="font-bold text-amber-900">{filteredOrders.length}</span>
              </div>
            </div>

            {/* Orders Cards */}
            <div className="space-y-3">
              {loading ? (
                <div className="py-16 text-center text-xs text-stone-500">ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
                  <FileText className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                  <p className="text-xs font-semibold text-stone-600">ಯಾವುದೇ ಸರ್ಕಾರಿ ಆದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
                  <p className="text-[11px] text-stone-400 mt-1">ಹುಡುಕಾಟದ ಪದಗಳನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ ಹೊಸ ಆದೇಶವನ್ನು ಸೇರಿಸಿ.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isActive = order.validityStatus === 'Active';
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-md space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-950 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-stone-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-stone-400" />
                              {order.orderDate}
                            </span>
                            <span className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-medium">
                              {order.category}
                            </span>
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {isActive ? '✓ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active)' : '⚠ ತಿದ್ದುಪಡಿಯಾಗಿದೆ (Superseded)'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-stone-900 leading-snug pt-1">
                            {order.subject}
                          </h3>

                          {order.description && (
                            <p className="text-xs text-stone-600 leading-relaxed pt-1">
                              {order.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsAttachToFileModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 transition-colors shadow-xs"
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                            ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ
                          </button>
                          {onOpenLetterWithRef && (
                            <button
                              onClick={() => {
                                onOpenLetterWithRef(`ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ${order.orderNumber}, ದಿನಾಂಕ: ${order.orderDate}`);
                              }}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                            >
                              <FileCheck2 className="h-3.5 w-3.5 text-amber-700" />
                              ಪತ್ರ ತಯಾರಿಸಿ
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Additional Metadata / Keywords */}
                      <div className="flex flex-wrap items-center justify-between border-t border-stone-100 pt-3 text-[11px] text-stone-500 gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-stone-600">ಇಲಾಖೆ:</span> {order.department} ({order.section || 'ಸಾಮಾನ್ಯ'})
                          {order.keywords && order.keywords.length > 0 && (
                            <>
                              <span className="text-stone-300">|</span>
                              <div className="flex flex-wrap gap-1">
                                {order.keywords.slice(0, 3).map((kw, i) => (
                                  <span key={i} className="bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded text-[10px]">
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="font-mono text-[10px] text-emerald-700 font-medium">
                          ✓ ಅಧಿಕೃತ ಪರಿಶೀಲಿತ ದಾಖಲೆ
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reference Books Tab */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(STATUTORY_BOOKS_INFO).map(b => (
              <div
                key={b.key}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-200">
                      {b.key}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {b.promulgatedYear}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 leading-snug">
                    {b.titleKannada}
                  </h3>
                  <div className="text-xs font-medium text-stone-500 italic">
                    {b.titleEnglish}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {b.shortDescKannada}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <div className="text-[11px] text-stone-500 mb-2">
                    <span className="font-semibold text-stone-700">ಪ್ರಾಧಿಕಾರ:</span> {b.authorityKannada}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                      {b.ruleCount} ನಿಯಮಗಳು
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      ಡಿಜಿಟಲ್ ಲಭ್ಯ ✓
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statutory Rules Table & Citations */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  ಪ್ರಮುಖ ಶಾಸನಬದ್ಧ ನಿಯಮಗಳ ತ್ವರಿತ ಉಲ್ಲೇಖ ಸೂಚಿ
                </h3>
                <p className="text-xs text-stone-500">
                  KCSR, KFC, CCA, ಶಿಕ್ಷಣ ಕಾಯ್ದೆ ಹಾಗೂ ಪಿಂಚಣಿ ನಿಯಮಗಳ ಸ್ಪಷ್ಟ ಉಲ್ಲೇಖ ಕೋಡ್‌ಗಳು
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg">
                ಲಭ್ಯವಿರುವ ನಿಯಮಗಳು: {KARNATAKA_STATUTORY_RULES.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KARNATAKA_STATUTORY_RULES.map(rule => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-2 hover:bg-white hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                      {rule.ruleNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600">
                      {rule.book}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900">
                    {rule.titleKannada || rule.titleEnglish}
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {rule.summaryKannada}
                  </p>

                  <div className="border-t border-stone-200/60 pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-stone-500 font-mono">
                      ಉಲ್ಲೇಖ: {rule.citationSnippet}
                    </span>
                    {onOpenLetterWithRef && (
                      <button
                        onClick={() => onOpenLetterWithRef(rule.citationSnippet)}
                        className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        ಉಲ್ಲೇಖ ಬಳಸಿ →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official Sources Tab */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map(src => (
            <div
              key={src.id}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">
                  {src.sourceNameKannada}
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ ಅಧಿಕೃತ
                </span>
              </div>
              <p className="text-xs text-stone-600">
                {src.description}
              </p>
              <div className="text-[11px] text-stone-500">
                ಪ್ರಾಧಿಕಾರ: <span className="font-semibold">{src.authority}</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                <span className="font-mono text-[11px] text-sky-800 truncate max-w-xs">
                  {src.sourceUrl}
                </span>
                <span className="text-[10px] text-stone-400">
                  ಪರಿಶೀಲಿಸಲಾಗಿದೆ: {src.lastCheckedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Government Order */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-amber-900 px-6 py-4 text-white">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-300" />
                ಹೊಸ ಸರ್ಕಾರಿ ಆದೇಶ ಸೇರಿಸಿ (Add Government Order)
              </h3>
              <button
                onClick={() => setIsAddOrderModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2024"
                    value={newOrderForm.orderNumber}
                    onChange={e => setNewOrderForm({ ...newOrderForm, orderNumber: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ಆದೇಶ ದಿನಾಂಕ *
                  </label>
                  <input
                    type="date"
                    required
                    value={newOrderForm.orderDate}
                    onChange={e => setNewOrderForm({ ...newOrderForm, orderDate: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  ಆದೇಶದ ವಿಷಯ (Subject) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ಸರ್ಕಾರಿ ಆದೇಶದ ಅಧಿಕೃತ ವಿಷಯವನ್ನು ನಮೂದಿಸಿ..."
                  value={newOrderForm.subject}
                  onChange={e => setNewOrderForm({ ...newOrderForm, subject: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ವಿಭಾಗ (Category) *
                  </label>
                  <select
                    value={newOrderForm.category}
                    onChange={e => setNewOrderForm({ ...newOrderForm, category: e.target.value as any })}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                  >
                    <option value="ಶಿಕ್ಷಣ ಇಲಾಖೆ">ಶಿಕ್ಷಣ ಇಲಾಖೆ</option>
                    <option value="ನೌಕರರ ಸೇವಾ ನಿಯಮ">ನೌಕರರ ಸೇವಾ ನಿಯಮ</option>
                    <option value="ರಜೆ ನಿಯಮಗಳು">ರಜೆ ನಿಯಮಗಳು</option>
                    <option value="ವೇತನ ನಿಯಮಗಳು">ವೇತನ ನಿಯಮಗಳು</option>
                    <option value="ಪಿಂಚಣಿ">ಪಿಂಚಣಿ</option>
                    <option value="ಶಿಸ್ತು ಕ್ರಮ">ಶಿಸ್ತು ಕ್ರಮ</option>
                    <option value="ಹಣಕಾಸು">ಹಣಕಾಸು</option>
                    <option value="ಖಜಾನೆ">ಖಜಾನೆ</option>
                    <option value="RTI">RTI</option>
                    <option value="ಶಾಲಾ ಆಡಳಿತ">ಶಾಲಾ ಆಡಳಿತ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ಆದೇಶದ ಪ್ರಕಾರ
                  </label>
                  <select
                    value={newOrderForm.orderType}
                    onChange={e => setNewOrderForm({ ...newOrderForm, orderType: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                  >
                    <option value="ಸರ್ಕಾರಿ ಆದೇಶ">ಸರ್ಕಾರಿ ಆದೇಶ (GO)</option>
                    <option value="ಸರ್ಕಾರಿ ಸುತ್ತೋಲೆ">ಸರ್ಕಾರಿ ಸುತ್ತೋಲೆ (Circular)</option>
                    <option value="ಅಧಿಸೂಚನೆ">ಅಧಿಸೂಚನೆ (Notification)</option>
                    <option value="ಜ್ಞಾಪನ ಪತ್ರ">ಜ್ಞಾಪನ ಪತ್ರ (OM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    ಸ್ಥಿತಿ (Validity)
                  </label>
                  <select
                    value={newOrderForm.validityStatus}
                    onChange={e => setNewOrderForm({ ...newOrderForm, validityStatus: e.target.value as any })}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                  >
                    <option value="Active">ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active)</option>
                    <option value="Superseded">ತಿದ್ದುಪಡಿಯಾಗಿದೆ (Superseded)</option>
                    <option value="Amended">ಭಾಗಶಃ ಬದಲಾಗಿದೆ (Amended)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  ವಿವರಣೆ / ಪ್ರಮುಖ ಅಂಶಗಳು
                </label>
                <textarea
                  rows={2}
                  placeholder="ಆದೇಶದ ಮುಖ್ಯಾಂಶಗಳು ಅಥವಾ ಷರತ್ತುಗಳು..."
                  value={newOrderForm.description}
                  onChange={e => setNewOrderForm({ ...newOrderForm, description: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  ಕೀವರ್ಡ್‌ಗಳು (Keywords - ಅಲ್ಪವಿರಾಮದಿಂದ ಪ್ರತ್ಯೇಕಿಸಿ)
                </label>
                <input
                  type="text"
                  placeholder="ವೇತನ ಬಡ್ತಿ, 15 ವರ್ಷ, ಹೆಚ್ಚುವರಿ ಬಡ್ತಿ"
                  value={newOrderForm.keywords}
                  onChange={e => setNewOrderForm({ ...newOrderForm, keywords: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                />
              </div>

              <div className="border-t border-stone-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-700 px-5 py-2 text-xs font-bold text-white hover:bg-amber-800"
                >
                  ಉಳಿಸಿ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attach Order to Active File */}
      {isAttachToFileModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-amber-700" />
              ಕಡತಕ್ಕೆ ಸರ್ಕಾರಿ ಆದೇಶ ಲಗತ್ತಿಸಿ
            </h3>

            <div className="rounded-lg bg-stone-50 p-3 text-xs border border-stone-200 space-y-1">
              <div className="font-mono font-bold text-amber-900">
                {selectedOrder.orderNumber}
              </div>
              <div className="text-stone-700 font-medium">
                {selectedOrder.subject}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                ಲಗತ್ತಿಸಬೇಕಾದ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select File Docket) *
              </label>
              <select
                value={targetFileId}
                onChange={e => setTargetFileId(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-2 text-xs font-medium"
              >
                {files.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fileCode || f.fileNumber} - {f.subject.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsAttachToFileModalOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleAttachToFile}
                className="rounded-lg bg-amber-700 px-5 py-2 text-xs font-bold text-white hover:bg-amber-800"
              >
                ಲಗತ್ತಿಸಿ (Attach)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
