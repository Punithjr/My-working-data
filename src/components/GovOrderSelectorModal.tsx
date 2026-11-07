import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Filter,
  Copy
} from 'lucide-react';
import { GovOrderRecord, DigitalReferenceBook } from '../types';
import { KARNATAKA_STATUTORY_RULES, STATUTORY_BOOKS_INFO } from '../data/karnatakaStatutoryBooks';

interface GovOrderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (citation: string, fullDetails?: any) => void;
  onSelectSubject?: (subject: string) => void;
  onSelectBody?: (text: string) => void;
}

export const GovOrderSelectorModal: React.FC<GovOrderSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectReference,
  onSelectSubject,
  onSelectBody,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'books'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orders, setOrders] = useState<GovOrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<GovOrderRecord | null>(null);

  // Fetch orders from API
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/gov-orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(err => {
        console.warn('Failed to load orders for selector:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        o.orderNumber.toLowerCase().includes(q) ||
        o.subject.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        (o.keywords || []).some(k => k.toLowerCase().includes(q));
      
      const matchesCat = selectedCategory === 'all' || o.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [orders, searchQuery, selectedCategory]);

  // Filtered rules from statutory books
  const filteredRules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return KARNATAKA_STATUTORY_RULES.slice(0, 30);
    return KARNATAKA_STATUTORY_RULES.filter(r => 
      r.ruleNumber.toLowerCase().includes(q) ||
      r.book.toLowerCase().includes(q) ||
      (r.titleKannada && r.titleKannada.toLowerCase().includes(q)) ||
      (r.titleEnglish && r.titleEnglish.toLowerCase().includes(q)) ||
      (r.citationSnippet && r.citationSnippet.toLowerCase().includes(q)) ||
      (r.tags || []).some(k => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-200">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ಸರ್ಕಾರಿ ಆದೇಶ / ಶಾಸನಬದ್ಧ ನಿಯಮ ಉಲ್ಲೇಖ ಸೇರಿಸಿ
                <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-normal border border-amber-400/30">
                  ಐಚ್ಛಿಕ (Optional)
                </span>
              </h2>
              <p className="text-xs text-amber-100">
                ಪತ್ರಕ್ಕೆ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ, ಸುತ್ತೋಲೆ ಅಥವಾ KCSR/KFC ನಿಯಮಗಳ ಉಲ್ಲೇಖವನ್ನು ಆರಿಸಿ ಸೇರಿಸಿ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="border-b border-stone-200 bg-stone-50 px-6 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex rounded-lg bg-stone-200 p-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-amber-700" />
                ಸರ್ಕಾರಿ ಆದೇಶಗಳು & ಸುತ್ತೋಲೆಗಳು ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'books'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                ಉಲ್ಲೇಖ ಪುಸ್ತಕಗಳು / ನಿಯಮಗಳು ({KARNATAKA_STATUTORY_RULES.length})
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ಆದೇಶ ಸಂಖ್ಯೆ, ನಿಯಮ, ವಿಷಯ ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ..."
                className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'orders' ? (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs text-stone-500">ಸರ್ಕಾರಿ ಆದೇಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  ಯಾವುದೇ ಸರ್ಕಾರಿ ಆದೇಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
                </div>
              ) : (
                filteredOrders.map(order => {
                  const citation = `ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ${order.orderNumber}, ದಿನಾಂಕ: ${order.orderDate}`;
                  const isActive = order.validityStatus === 'Active';

                  return (
                    <div
                      key={order.id}
                      className="group rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-amber-400 hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              ದಿನಾಂಕ: {order.orderDate}
                            </span>
                            <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                              {order.category}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isActive ? '✓ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active)' : '⚠ ತಿದ್ದುಪಡಿಯಾಗಿದೆ'}
                            </span>
                          </div>

                          <h3 className="text-xs font-semibold text-stone-900 leading-snug">
                            {order.subject}
                          </h3>

                          {order.description && (
                            <p className="text-[11px] text-stone-600 line-clamp-2">
                              {order.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              onSelectReference(citation, order);
                              onClose();
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 transition-colors shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            ಉಲ್ಲೇಖಕ್ಕೆ ಸೇರಿಸಿ
                          </button>
                          {onSelectSubject && (
                            <button
                              onClick={() => {
                                onSelectSubject(`${order.subject} - ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ: ${order.orderNumber} ದಿನಾಂಕ: ${order.orderDate} ರನ್ವಯ.`);
                                onClose();
                              }}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] text-stone-700 hover:bg-stone-50 transition-colors"
                            >
                              ವಿಷಯಕ್ಕೆ ಸೇರಿಸಿ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRules.map(rule => {
                return (
                  <div
                    key={rule.id}
                    className="group rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-emerald-400 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {rule.ruleNumber}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-700">
                            {rule.book}
                          </span>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            {rule.category}
                          </span>
                        </div>

                        <h3 className="text-xs font-semibold text-stone-900">
                          {rule.titleKannada || rule.titleEnglish}
                        </h3>

                        <p className="text-[11px] text-stone-600 line-clamp-2">
                          {rule.summaryKannada}
                        </p>

                        <div className="text-[10px] text-stone-400 font-mono">
                          ಅಧಿಕೃತ ಉಲ್ಲೇಖ: {rule.citationSnippet}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onSelectReference(rule.citationSnippet, rule);
                            onClose();
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          ಉಲ್ಲೇಖಕ್ಕೆ ಸೇರಿಸಿ
                        </button>
                        {onSelectBody && rule.orderClauseSnippet && (
                          <button
                            onClick={() => {
                              onSelectBody(rule.orderClauseSnippet);
                              onClose();
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            ಷರತ್ತು ಸೇರಿಸಿ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 flex items-center justify-between text-xs text-stone-600">
          <div>
            💡 <span className="font-medium">ಗಮನಿಸಿ:</span> ಸಾಮಾನ್ಯ ಪತ್ರಗಳಿಗೆ ಸರ್ಕಾರಿ ಆದೇಶ ಅಥವಾ ನಿಯಮ ಉಲ್ಲೇಖ ಐಚ್ಛಿಕವಾಗಿದೆ.
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 font-medium text-stone-700 hover:bg-stone-100 transition-colors"
          >
            ಮುಚ್ಚಿ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
