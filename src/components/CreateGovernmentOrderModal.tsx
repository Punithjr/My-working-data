import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Check, 
  IndianRupee, 
  Calendar, 
  User, 
  Award, 
  Building2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { OrderFile } from '../types';
import { generateGovernmentOrderPdf } from '../utils/governmentOrderPdfExport';

interface CreateGovernmentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (order: OrderFile) => void;
  onShowToast?: (message: string) => void;
}

export const CreateGovernmentOrderModal: React.FC<CreateGovernmentOrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  onShowToast,
}) => {
  const currentYear = new Date().getFullYear();
  const randomSeq = Math.floor(100 + Math.random() * 900);

  const [orderNumber, setOrderNumber] = useState<string>(`ಇಡಿ/${currentYear}/ಸಆಸಂ-${randomSeq}`);
  const [fileId, setFileId] = useState<string>(`ಕಡತ-ಆ2/ವೇಬ/${randomSeq}/2026`);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [orderType, setOrderType] = useState<string>('15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [kgidNumber, setKgidNumber] = useState<string>('');
  const [section, setSection] = useState<string>('ಆ2 - ಸ.ಪ್ರಾ.ಶಿ');
  const [oldBasicPay, setOldBasicPay] = useState<number>(43100);
  const [newBasicPay, setNewBasicPay] = useState<number>(44300);
  const [preamble, setPreamble] = useState<string>('ಸಂಬಂಧಪಟ್ಟ ಶಿಕ್ಷಕರ/ನೌಕರರ ಸೇವಾ ದಾಖಲೆಗಳು, ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಹಾಗೂ ಸತತ ತೃಪ್ತಿಕರ ಸೇವೆಯನ್ನು ಪರಿಗಣಿಸಿ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರವು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿಯಮಾನುಸಾರ ಆದೇಶಿಸಲು ತೀರ್ಮಾನಿಸಿದೆ.');
  const [orderContent, setOrderContent] = useState<string>('ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಗಳು (ಕೆ.ಸಿ.ಎಸ್.ಆರ್) ಹಾಗೂ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಮೇಲ್ಕಂಡ ನೌಕರರಿಗೆ ನಿಗದಿತ ದಿನಾಂಕದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ವೇತನ ಶ್ರೇಣಿಯನ್ನು ಪರಿಷ್ಕರಿಸಿ ಅಧಿಕೃತವಾಗಿ ಮಂಜೂರಾತಿ ನೀಡಲಾಗಿದೆ.');
  const [signatoryName, setSignatoryName] = useState<string>('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('BEO ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !employeeName.trim()) {
      setError('ದಯವಿಟ್ಟು ಆದೇಶ ಸಂಖ್ಯೆ ಮತ್ತು ನೌಕರರ/ಫಲಾನುಭವಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const generatedHtml = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ</h2>
            <h3 style="margin: 4px 0 0 0; font-size: 15px; color: #334155;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ ಮತ್ತು ಜ್ಞಾಪನಾ ದಾಖಲಾತಿ</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px;">
            <div><strong>ಆದೇಶ ಸಂಖ್ಯೆ:</strong> ${orderNumber}</div>
            <div><strong>ದಿನಾಂಕ:</strong> ${orderDate}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
            <strong>ವಿಷಯ:</strong> ${orderType} - ಶ್ರೀ/ಶ್ರೀಮತಿ ${employeeName} (KGID: ${kgidNumber || 'N/A'}) - ಬಗ್ಗೆ.
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0f172a;">ಪ್ರಸ್ತಾವನೆ:</h4>
            <p style="margin: 0; font-size: 12.5px; color: #334155; text-align: justify;">${preamble}</p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px 0; font-size: 13.5px; color: #92400e;">ಸರ್ಕಾರಿ ಆದೇಶ:</h4>
            <p style="margin: 0; font-size: 12.5px; color: #1e293b; text-align: justify;">${orderContent}</p>
          </div>

          ${oldBasicPay !== newBasicPay ? `
            <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr style="background: #f1f5f9;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">ಹಳೆಯ ಮೂಲ ವೇತನ</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">ಪರಿಷ್ಕೃತ ನೂತನ ಮೂಲ ವೇತನ</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">ಜಾರಿಗೆ ಬಂದ ದಿನಾಂಕ</th>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">₹${oldBasicPay.toLocaleString('en-IN')}/-</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">₹${newBasicPay.toLocaleString('en-IN')}/-</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">${effectiveDate}</td>
                </tr>
              </table>
            </div>
          ` : ''}

          <div style="margin-top: 32px; text-align: right;">
            <p style="margin: 0; font-weight: bold; font-size: 13px;">(${signatoryName})</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #475569;">${signatoryDesignation}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #16a34a; font-weight: bold;">✓ ಡಿಜಿಟಲ್ ಸಹಿ ಮಾಡಲಾಗಿದೆ</p>
          </div>
        </div>
      `;

      const newOrder: OrderFile = {
        id: `ord-${Date.now()}`,
        fileId: fileId.trim(),
        orderNumber: orderNumber.trim(),
        kgidNumber: kgidNumber.trim() || 'N/A',
        employeeName: employeeName.trim(),
        orderType: orderType,
        orderDate: orderDate,
        effectiveDate: effectiveDate,
        oldBasicPay: Number(oldBasicPay) || 0,
        newBasicPay: Number(newBasicPay) || 0,
        createdBy: signatoryName,
        createdDate: new Date().toISOString(),
        generatedDocumentHtml: generatedHtml,
        generatedDocumentText: `${orderNumber} - ${orderType} - ${employeeName}`,
        remarks: `ಶಾಖೆ: ${section}`
      };

      onSaveOrder(newOrder);
      if (onShowToast) {
        onShowToast(`ಸರ್ಕಾರಿ ಆದೇಶ (${orderNumber}) ಯಶಸ್ವಿಯಾಗಿ ಸೃಜಿಸಲಾಗಿದೆ ಮತ್ತು ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!`);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to create government order:', err);
      setError(err.message || 'ಆದೇಶ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl max-w-2xl w-full shadow-[8px_8px_0px_#2b2b2b] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#2b2b2b] bg-[#2b2b2b] text-white rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-kannada flex items-center gap-2">
                <span>ನೂತನ ಸರ್ಕಾರಿ ಆದೇಶ ಸೃಜಿಸಿ</span>
                <span className="text-[11px] font-mono font-normal text-[#f59e0b] px-2 py-0.5 bg-black/40 rounded border border-amber-500/30">
                  ISSUE GOVERNMENT ORDER
                </span>
              </h2>
              <p className="text-[11px] text-stone-300 font-kannada mt-0.5">
                ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶದ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಿ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-lg text-xs flex items-center gap-2 font-kannada">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Number & File Docket No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ (Order Number): *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: ಇಡಿ/2026/ಸಆಸಂ-45"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಸಂಬಂಧಪಟ್ಟ ಕಡತ ಸಂಖ್ಯೆ (File No):
              </label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: ಕಡತ-ಆ2/ವೇಬ/45/2026"
              />
            </div>
          </div>

          {/* Order Type & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಆದೇಶದ ಪ್ರಕಾರ (Order Type): *
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada font-bold"
              >
                <option value="10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ">10 ವರ್ಷದ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ</option>
                <option value="15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ">15 ವರ್ಷದ ಸ್ವಯಂ ಚಾಲಿತ ವೇತನ ಬಡ್ತಿ</option>
                <option value="20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ">20 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
                <option value="25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ">25 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
                <option value="30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ">30 ವರ್ಷದ ಹೆಚ್ಚುವರಿ ವೇತನ ಬಡ್ತಿ</option>
                <option value="ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ">ಗಳಿಕೆ ರಜೆ ಮಂಜೂರಾತಿ</option>
                <option value="ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ">ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ</option>
                <option value="ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ ಅನುದಾನ ಮಂಜೂರಾತಿ">ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ ಅನುದಾನ ಮಂಜೂರಾತಿ</option>
                <option value="ವಿಶೇಷ ಸೇವಾ ನಿಯಮಗಳ ಆದೇಶ">ವಿಶೇಷ ಸೇವಾ ನಿಯಮಗಳ ಆದೇಶ</option>
                <option value="ಇತರ ಸಾಮಾನ್ಯ ಆಡಳಿತ ಆದೇಶ">ಇತರ ಸಾಮಾನ್ಯ ಆಡಳಿತ ಆದೇಶ</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಇಲಾಖಾ ಶಾಖೆ (Section): *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-amber-50 font-bold border-2 border-amber-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
              >
                <option value="ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ">ಆ1 - ಪ್ರೌಢ ಶಿಕ್ಷಣ</option>
                <option value="ಆ2 - ಸ.ಪ್ರಾ.ಶಿ">ಆ2 - ಸ.ಪ್ರಾ.ಶಿ</option>
                <option value="ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ">ಆ3 - ಅನುದಾನಿತ & ಲೆಕ್ಕ</option>
                <option value="ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ">ಆ4 - ಭೌತಿಕ & ಪರೀಕ್ಷೆ</option>
                <option value="ಆಡಳಿತ ಶಾಖೆ">ಆಡಳಿತ ಶಾಖೆ</option>
              </select>
            </div>
          </div>

          {/* Beneficiary Name & KGID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಫಲಾನುಭವಿ / ನೌಕರರ ಹೆಸರು (Beneficiary Name): *
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
                placeholder="ಉದಾ: ಶ್ರೀ ಗುರುಮೂರ್ತಿ ಎಚ್.ಎಸ್, ಸ.ಶಿ"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ (KGID Number):
              </label>
              <input
                type="text"
                value={kgidNumber}
                onChange={(e) => setKgidNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: 1084592"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಆದೇಶ ದಿನಾಂಕ (Order Date):
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಜಾರಿಗೆ ಬಂದ ದಿನಾಂಕ (Effective Date):
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              />
            </div>
          </div>

          {/* Pay Scales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-100 p-3 rounded-lg border border-stone-300">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಹಳೆಯ ಮೂಲ ವೇತನ (Old Basic Pay):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-stone-500 font-bold">₹</span>
                <input
                  type="number"
                  value={oldBasicPay}
                  onChange={(e) => setOldBasicPay(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-stone-300 rounded focus:outline-none focus:border-[#2b2b2b]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-800 block mb-1 font-kannada">
                ನೂತನ ಪರಿಷ್ಕೃತ ಮೂಲ ವೇತನ (New Basic Pay):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-emerald-600 font-bold">₹</span>
                <input
                  type="number"
                  value={newBasicPay}
                  onChange={(e) => setNewBasicPay(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-emerald-700 bg-white border border-emerald-300 rounded focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Preamble & Order Content */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
              ಪ್ರಸ್ತಾವನೆ (Preamble):
            </label>
            <textarea
              rows={2}
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-amber-900 block mb-1 font-kannada">
              ಸರ್ಕಾರಿ ಆದೇಶದ ವಿವರ (Operative Order Text):
            </label>
            <textarea
              rows={3}
              value={orderContent}
              onChange={(e) => setOrderContent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-amber-50/50 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 font-kannada"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border-2 border-stone-300 transition-colors cursor-pointer"
            >
              ರದ್ದುಗೊಳಿಸಿ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-[#f59e0b] hover:bg-amber-400 text-[#2b2b2b] rounded-lg border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] transition-all flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಆದೇಶ ದಾಖಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ (Save Order)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
