import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  Award, 
  Calendar, 
  User, 
  Building2, 
  FileCheck2, 
  Paperclip,
  Sparkles,
  Eye
} from 'lucide-react';
import { OrderFile } from '../types';

interface UploadGovernmentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (order: OrderFile) => void;
  onShowToast?: (message: string) => void;
}

export const UploadGovernmentOrderModal: React.FC<UploadGovernmentOrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();

  const [orderNumber, setOrderNumber] = useState<string>('');
  const [fileId, setFileId] = useState<string>(`ಕಡತ-ಆ2/ಸಆಸಂ/${currentYear}/${Math.floor(100 + Math.random() * 900)}`);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [issuingAuthority, setIssuingAuthority] = useState<string>('ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ');
  const [section, setSection] = useState<string>('ಆ2 - ಸ.ಪ್ರಾ.ಶಿ');
  const [orderType, setOrderType] = useState<string>('ವೇತನ ಪರಿಷ್ಕರಣೆ ಮತ್ತು ಸೇವಾ ಸೌಲಭ್ಯ ಆದೇಶ');
  const [subject, setSubject] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [kgidNumber, setKgidNumber] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('ದಯವಿಟ್ಟು ಅಧಿಕೃತ PDF ಅಥವಾ ಇಮೇಜ್ ಸ್ಕ್ಯಾನ್ ಪ್ರತಿಯನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (.pdf, .jpg, .png).');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('ಕಡತದ ಗಾತ್ರವು 25MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು.');
      return;
    }

    setError(null);
    setUploadedFile(file);
    setFileName(file.name);
    setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    // Auto-detect or pre-populate order title from filename if empty
    if (!subject.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setSubject(`ಸರ್ಕಾರಿ ಆದೇಶ: ${cleanName}`);
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      setFileDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: fileInputRef.current } as any);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('ದಯವಿಟ್ಟು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (Order Number is required).');
      return;
    }
    if (!subject.trim()) {
      setError('ದಯವಿಟ್ಟು ಆದೇಶದ ಮುಖ್ಯ ವಿಷಯ/ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileDataUrl.includes('application/pdf');

      const generatedHtml = `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase;">ಅಧಿಕೃತ ಅಪ್‌ಲೋಡ್ ಆದ ಸರ್ಕಾರಿ ಆದೇಶ • OFFICIAL GOVERNMENT ORDER</div>
            <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">${issuingAuthority}</h2>
            <h3 style="margin: 4px 0 0 0; font-size: 14px; color: #334155;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ</h3>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div><strong>ಆದೇಶ ಸಂಖ್ಯೆ:</strong> <span style="color: #0369a1; font-weight: bold;">${orderNumber}</span></div>
            <div><strong>ದಿನಾಂಕ:</strong> ${orderDate}</div>
            <div><strong>ಜಾರಿಗೆ ಬಂದ ದಿನಾಂಕ:</strong> ${effectiveDate}</div>
          </div>

          <div style="margin-bottom: 16px; background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px;">
            <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #92400e;">ವಿಷಯ:</h4>
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1e293b;">${subject}</p>
          </div>

          ${employeeName ? `
            <div style="margin-bottom: 16px; font-size: 13px;">
              <strong>ಅನ್ವಯವಾಗುವ ಫಲಾನುಭವಿ/ಸಿಬ್ಬಂದಿ:</strong> ${employeeName} ${kgidNumber ? `(KGID: ${kgidNumber})` : ''}
            </div>
          ` : ''}

          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0f172a;">ಆದೇಶದ ಮುಖ್ಯಾಂಶಗಳು & ಸಾರಾಂಶ:</h4>
            <p style="margin: 0; font-size: 12.5px; color: #334155; text-align: justify;">${summary || 'ಈ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶದನ್ವಯ ಇಲಾಖಾ ಕಾರ್ಯವ್ಯಾಪ್ತಿಯಲ್ಲಿ ನಿಯಮಾನುಸಾರ ಅಗತ್ಯ ಕ್ರಮ ಜರುಗಿಸಲು ಆದೇಶಿಸಲಾಗಿದೆ.'}</p>
          </div>

          ${fileName ? `
            <div style="margin-top: 20px; padding: 12px; background: #f1f5f9; border: 1px solid #94a3b8; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-size: 12px; font-weight: bold; color: #0f172a; display: block;">📄 ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಅಧಿಕೃತ ಕಡತ ಪ್ರತಿ:</span>
                <span style="font-size: 11px; color: #475569;">${fileName} (${fileSizeStr})</span>
              </div>
              ${fileDataUrl ? `
                <a href="${fileDataUrl}" download="${fileName}" style="background: #0369a1; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">
                  ಮೂಲ ಕಡತ ಡೌನ್‌ಲೋಡ್
                </a>
              ` : ''}
            </div>
          ` : ''}

          <div style="margin-top: 32px; text-align: right; border-top: 1px solid #cbd5e1; padding-top: 12px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;">ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರದ ಆದೇಶದಂತೆ</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #16a34a; font-weight: bold;">✓ ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಭಂಡಾರದಲ್ಲಿ ಅಧಿಕೃತವಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ</p>
          </div>
        </div>
      `;

      const newOrder: OrderFile = {
        id: `uploaded-go-${Date.now()}`,
        fileId: fileId.trim(),
        orderNumber: orderNumber.trim(),
        kgidNumber: kgidNumber.trim() || 'N/A',
        employeeName: employeeName.trim() || 'ತಾಲ್ಲೂಕಿನ ಸಂಬಂಧಪಟ್ಟ ಸಿಬ್ಬಂದಿ/ಶಾಲೆಗಳು',
        orderType: orderType,
        orderDate: orderDate,
        effectiveDate: effectiveDate,
        oldBasicPay: 0,
        newBasicPay: 0,
        createdBy: issuingAuthority,
        createdDate: new Date().toISOString(),
        generatedDocumentHtml: generatedHtml,
        generatedDocumentText: `${orderNumber} - ${subject} - ${orderType}`,
        remarks: `ಶಾಖೆ: ${section} | ಅಪ್‌ಲೋಡ್ ಆದ ಕಡತ: ${fileName || 'ಅಧಿಕೃತ ಆದೇಶ'}`
      };

      onSaveOrder(newOrder);
      if (onShowToast) {
        onShowToast(`ಸರ್ಕಾರಿ ಆದೇಶ (${orderNumber}) ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ ಮತ್ತು ಭಂಡಾರದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!`);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to upload government order:', err);
      setError(err.message || 'ಆದೇಶ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#fffbf2] border-[2.5px] border-[#2b2b2b] rounded-xl max-w-2xl w-full shadow-[8px_8px_0px_#2b2b2b] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#2b2b2b] bg-[#2b2b2b] text-white rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-[#2b2b2b] flex items-center justify-center font-black">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-kannada flex items-center gap-2">
                <span>ಸರ್ಕಾರಿ ಆದೇಶ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
                <span className="text-[10px] font-mono font-bold text-[#f59e0b] px-2 py-0.5 bg-black/40 rounded border border-amber-500/30">
                  GOVERNMENT ORDERS ONLY
                </span>
              </h2>
              <p className="text-[11px] text-stone-300 font-kannada mt-0.5">
                ಕೇವಲ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶಗಳು ಮತ್ತು ಜ್ಞಾಪನೆಗಳನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಪತ್ರಗಳಲ್ಲಿ ಉಲ್ಲೇಖಿಸಲು ಬಳಸಿ.
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

          {/* Dedicated File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
              uploadedFile 
                ? 'border-emerald-500 bg-emerald-50/50' 
                : 'border-stone-400 bg-stone-50 hover:bg-amber-50/50 hover:border-amber-500'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block truncate max-w-xs sm:max-w-md">
                      {fileName}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> PDF ಕಡತ ಯಶಸ್ವಿಯಾಗಿ ಆಯ್ಕೆಯಾಗಿದೆ ({fileSizeStr})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setFileDataUrl('');
                    setFileName('');
                  }}
                  className="p-1 text-stone-400 hover:text-rose-600"
                  title="ತೆಗೆದುಹಾಕಿ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-stone-900 font-kannada">
                  ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶ PDF / ಸ್ಕ್ಯಾನ್ ಪ್ರತಿಯನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಹಾಕಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ
                </div>
                <div className="text-[11px] text-stone-500">
                  ಬೆಂಬಲಿತ ಮಾದರಿಗಳು: .PDF, .JPG, .PNG (ಗರಿಷ್ಠ 25MB)
                </div>
              </div>
            )}
          </div>

          {/* Order Number & File Docket No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಸರ್ಕಾರಿ ಆದೇಶ ಸಂಖ್ಯೆ (Government Order No): *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: ಇಡಿ 143 ಎಸ್‌ಎಲ್‌ಬಿ 2026"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಕಡತ ಸಂಖ್ಯೆ (Linked File No):
              </label>
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
                placeholder="ಉದಾ: ಕಡತ-ಆ2/ಸಆಸಂ/2026/102"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
              ಸರ್ಕಾರಿ ಆದೇಶದ ವಿಷಯ (Subject / Title of Order): *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs font-kannada bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b]"
              placeholder="ಉದಾ: ರಾಜ್ಯ 7ನೇ ವೇತನ ಆಯೋಗದ ಶಿಫಾರಸುಗಳ ಜಾರಿ ಹಾಗೂ ಕಾಲಮಿತಿ ವೇತನ ಬಡ್ತಿ ನಿಯಮಾವಳಿ..."
            />
          </div>

          {/* Section & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಇಲಾಖಾ ಶಾಖೆ (Office Section): *
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

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಆದೇಶ ಪ್ರಕಾರ (Order Type): *
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada font-bold"
              >
                <option value="ವೇತನ ಪರಿಷ್ಕರಣೆ ಮತ್ತು ಸೇವಾ ಸೌಲಭ್ಯ ಆದೇಶ">ವೇತನ ಪರಿಷ್ಕರಣೆ ಮತ್ತು ಸೇವಾ ಸೌಲಭ್ಯ ಆದೇಶ</option>
                <option value="ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ & ಮಂಜೂರಾತಿ ಆದೇಶ">ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ & ಮಂಜೂರಾತಿ ಆದೇಶ</option>
                <option value="10/15/20/25/30 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿ">10/15/20/25/30 ವರ್ಷದ ಕಾಲಮಿತಿ ಬಡ್ತಿ</option>
                <option value="ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ">ಶಿಶುಪಾಲನ ರಜೆ ಮಂಜೂರಾತಿ ಆದೇಶ</option>
                <option value="ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ & ಅನುದಾನ ಮಂಜೂರಾತಿ">ಶಾಲಾ ಮೂಲಸೌಕರ್ಯ & ಅನುದಾನ ಮಂಜೂರಾತಿ</option>
                <option value="ವರ್ಗಾವಣೆ ಮಾರ್ಗಸೂಚಿಗಳು & ಸೇವಾ ನಿಯಮಗಳು">ವರ್ಗಾವಣೆ ಮಾರ್ಗಸೂಚಿಗಳು & ಸೇವಾ ನಿಯಮಗಳು</option>
                <option value="ಶಾಸನಬದ್ಧ ಇಲಾಖಾ ಸುತ್ತೋಲೆ ಆದೇಶ">ಶಾಸನಬದ್ಧ ಇಲಾಖಾ ಸುತ್ತೋಲೆ ಆದೇಶ</option>
              </select>
            </div>
          </div>

          {/* Dates & Issuing Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಹೊರಡಿಸಿದ ಪ್ರಾಧಿಕಾರ (Authority):
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
                placeholder="ಉದಾ: ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ / ಬಿಇಒ"
              />
            </div>
          </div>

          {/* Beneficiary & KGID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಫಲಾನುಭವಿ / ಅನ್ವಯವಾಗುವ ಸಿಬ್ಬಂದಿ:
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
                placeholder="ಉದಾ: ಎಲ್ಲಾ ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢಶಾಲಾ ಶಿಕ್ಷಕರು ಅಥವಾ ಶ್ರೀ ರಮೇಶ್ ಸ.ಶಿ"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
                ಕೆಜಿಐಡಿ ಸಂಖ್ಯೆ (KGID No - ಐಚ್ಛಿಕ):
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

          {/* Summary / Preamble */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1 font-kannada">
              ಆದೇಶದ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ / ಸಾರಾಂಶ (Order Summary / Preamble):
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ಈ ಸರ್ಕಾರಿ ಆದೇಶದ ಮುಖ್ಯ ನಿಯಮಗಳು, ಷರತ್ತುಗಳು ಹಾಗೂ ಜಾರಿಗೊಳಿಸುವ ಸೂಚನೆಗಳನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಿ..."
              className="w-full px-3 py-2 text-xs bg-white border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#2b2b2b] font-kannada"
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
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-2 border-emerald-800 shadow-[3px_3px_0px_#064e3b] transition-all flex items-center gap-1.5 cursor-pointer font-kannada"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'ಸರ್ಕಾರಿ ಆದೇಶ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Save GO)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
