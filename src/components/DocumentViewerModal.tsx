import React from 'react';
import { DocumentAttachment } from '../types';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, ZoomIn } from 'lucide-react';

interface DocumentViewerModalProps {
  attachment: DocumentAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  attachment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !attachment) return null;

  const isPdf = 
    attachment.fileType === 'application/pdf' || 
    attachment.fileName.toLowerCase().endsWith('.pdf') ||
    attachment.dataUrl?.startsWith('data:application/pdf');

  const isImage = 
    attachment.fileType.startsWith('image/') || 
    attachment.fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/) ||
    attachment.dataUrl?.startsWith('data:image/');

  const handleDownload = () => {
    if (attachment.dataUrl) {
      const a = document.createElement('a');
      a.href = attachment.dataUrl;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create text blob fallback if no dataUrl
      const blob = new Blob([`ದಾಖಲೆ: ${attachment.fileName}\nಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ\nದಾಖಲೆ ವಿವರ: ${attachment.description || ''}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName.replace(/\.pdf$/i, '.txt');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              isPdf ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold truncate text-stone-100">
                {attachment.fileName}
              </h3>
              <p className="text-[11px] text-stone-400">
                {isPdf ? 'ಪಿಡಿಎಫ್ ದಾಖಲೆ (PDF Document)' : 'ಜೆಪಿಜಿ / ಚಿತ್ರ ದಾಖಲೆ (JPG Image)'} • {attachment.fileSize} • {attachment.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="ದಾಖಲೆಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download Document)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ಡೌನ್‌ಲೋಡ್ (Download)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="ಮುಚ್ಚಿ (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-4 bg-stone-100/70 flex items-center justify-center min-h-[350px]">
          {isImage && attachment.dataUrl ? (
            <div className="max-w-full max-h-[70vh] flex flex-col items-center justify-center">
              <img
                src={attachment.dataUrl}
                alt={attachment.fileName}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md border border-stone-200 bg-white"
              />
              <span className="text-[11px] text-stone-500 mt-2 font-sans">
                ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಜೆಪಿಜಿ/ಚಿತ್ರದ ನೈಜ ವೀಕ್ಷಣೆ (Authentic uploaded image preview)
              </span>
            </div>
          ) : isPdf && attachment.dataUrl ? (
            <div className="w-full h-[70vh] flex flex-col bg-white rounded-xl shadow-inner border border-stone-200 overflow-hidden">
              <iframe
                src={attachment.dataUrl}
                title={attachment.fileName}
                className="w-full flex-1 border-0"
              />
            </div>
          ) : (
            /* Fallback formatted preview */
            <div className="max-w-md text-center p-8 bg-white rounded-xl border border-stone-200 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
                {isPdf ? <FileText className="w-8 h-8 text-rose-600" /> : <ImageIcon className="w-8 h-8 text-emerald-600" />}
              </div>
              <h4 className="text-sm font-bold text-stone-900">{attachment.fileName}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {attachment.description || 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ - ಅಧಿಕೃತ ದಾಖಲೆ ಪ್ರತಿ.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>ಪ್ರತಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download File)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ • ಅಧಿಕೃತ ದಾಖಲೆಗಳ ಕೋಶ</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md font-medium text-xs"
          >
            ಮುಚ್ಚಿ (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
