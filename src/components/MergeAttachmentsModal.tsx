import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  CheckSquare, 
  Square, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  UploadCloud
} from 'lucide-react';
import { DocumentAttachment, MasterDocketFile } from '../types';
import { mergeDocketAttachments, MergeResult } from '../utils/pdfMerger';

interface MergeAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: MasterDocketFile;
  onSaveMergedAttachment?: (mergedAttachment: DocumentAttachment) => Promise<void>;
  onViewDocument?: (attachment: DocumentAttachment) => void;
}

export const MergeAttachmentsModal: React.FC<MergeAttachmentsModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  onSaveMergedAttachment,
  onViewDocument,
}) => {
  const allDocs: DocumentAttachment[] = [
    ...(activeFile.rtiDetails?.uploadedDocs || []),
    ...(activeFile.attachments || [])
  ].filter((v, i, a) => a.findIndex(t => (t.id && t.id === v.id) || t.fileName === v.fileName) === i);

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    allDocs.map((d, i) => d.id || `doc-${i}`)
  );
  const [docOrder, setDocOrder] = useState<DocumentAttachment[]>(allDocs);
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [autoAttachToDocket, setAutoAttachToDocket] = useState<boolean>(true);
  const [outputFileName, setOutputFileName] = useState<string>(
    `Consolidated_${activeFile.fileNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  );

  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSavedToDocket, setHasSavedToDocket] = useState<boolean>(false);
  const [isUploadingInModal, setIsUploadingInModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUploadAdditionalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingInModal(true);
    setErrorMessage(null);
    try {
      const newAttachments: DocumentAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const newAtt: DocumentAttachment = {
              id: `att-modal-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
              fileName: file.name,
              fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
              uploadedAt: new Date().toISOString().split('T')[0],
              description: isPdf ? 'ಹೊಸದಾಗಿ ಸೇರಿಸಿದ ದಾಖಲೆ ಪ್ರತಿ (PDF)' : 'ಹೊಸದಾಗಿ ಸೇರಿಸಿದ ಚಿತ್ರ ಪ್ರತಿ (JPG/PNG)',
              dataUrl,
            };
            newAttachments.push(newAtt);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      setDocOrder(prev => [...prev, ...newAttachments]);
      setSelectedDocIds(prev => [...prev, ...newAttachments.map(a => a.id!)]);
    } catch (err: any) {
      console.error('Failed to read uploaded files:', err);
      setErrorMessage('ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsUploadingInModal(false);
      e.target.value = '';
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedDocIds(docOrder.map((d, i) => d.id || `doc-${i}`));
  };

  const deselectAll = () => {
    setSelectedDocIds([]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...docOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setDocOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === docOrder.length - 1) return;
    const newOrder = [...docOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setDocOrder(newOrder);
  };

  const handleStartMerge = async () => {
    setErrorMessage(null);
    const chosenAttachments = docOrder.filter((d, i) => selectedDocIds.includes(d.id || `doc-${i}`));
    if (chosenAttachments.length === 0) {
      setErrorMessage('ವಿಲೀನಗೊಳಿಸಲು ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.');
      return;
    }

    setIsMerging(true);
    try {
      const result = await mergeDocketAttachments(chosenAttachments, {
        docketFileNumber: activeFile.fileNumber,
        docketSubject: activeFile.subject,
        includeCoverPage,
        outputFileName: outputFileName.trim() || undefined,
      });

      setMergeResult(result);

      if (autoAttachToDocket && onSaveMergedAttachment) {
        const mergedAttachment: DocumentAttachment = {
          id: `att-merged-${Date.now()}`,
          fileName: result.fileName,
          fileSize: result.fileSize,
          fileType: 'application/pdf',
          pageCount: result.pageCount,
          uploadedAt: new Date().toISOString().split('T')[0],
          description: `ಸಂಯೋಜಿತ ಕಡತ ದಾಖಲೆ ಪ್ರತಿ (Consolidated ${chosenAttachments.length} Documents - ${result.pageCount} Pages)`,
          dataUrl: result.dataUrl,
        };

        await onSaveMergedAttachment(mergedAttachment);
        setHasSavedToDocket(true);
      }
    } catch (err: any) {
      console.error('Merge error:', err);
      setErrorMessage(err.message || 'ದಾಖಲೆಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergeResult) return;
    const link = document.createElement('a');
    link.href = mergeResult.dataUrl;
    link.download = mergeResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (!mergeResult || !onViewDocument) return;
    const att: DocumentAttachment = {
      id: `preview-${Date.now()}`,
      fileName: mergeResult.fileName,
      fileSize: mergeResult.fileSize,
      fileType: 'application/pdf',
      pageCount: mergeResult.pageCount,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: 'ಸಂಯೋಜಿತ ಕಡತ ದಾಖಲೆ ಪ್ರತಿ (Consolidated PDF Archive)',
      dataUrl: mergeResult.dataUrl,
    };
    onViewDocument(att);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                ಕಡತದ ದಾಖಲೆಗಳ ವಿಲೀನಕರಣ (Merge Docket Attachments)
              </h3>
              <p className="text-[11px] text-stone-300">
                ಕಡತ ಸಂಖ್ಯೆ: <span className="font-mono text-amber-300 font-bold">{activeFile.fileNumber}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Message / Result Banner */}
          {mergeResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">
                      ಯಶಸ್ವಿಯಾಗಿ ವಿಲೀನಗೊಳಿಸಲಾಗಿದೆ! (PDF Consolidated Successfully)
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                      {mergeResult.fileName} • {mergeResult.fileSize} • ಒಟ್ಟು {mergeResult.pageCount} ಪುಟಗಳು
                    </p>
                    {hasSavedToDocket && (
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5" /> ಈ ಕಡತದ ದಾಖಲೆಗಳ ಪಟ್ಟಿಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇವ್ ಮಾಡಲಾಗಿದೆ.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="px-3 py-1.5 bg-white text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ವೀಕ್ಷಿಸಿ (Preview)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ಡೌನ್‌ಲೋಡ್</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Document Selection Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  ವಿಲೀನಗೊಳಿಸಲು ದಾಖಲೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ({selectedDocIds.length} / {docOrder.length})
                </span>
                <p className="text-[11px] text-stone-500">
                  ದಾಖಲೆಗಳ ಕ್ರಮವನ್ನು ಬದಲಾಯಿಸಲು ಮೇಲಿನ/ಕೆಳಗಿನ ಬಾಣದ ಗುರುತುಗಳನ್ನು ಬಳಸಿ.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <label className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
                  <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                  <span>{isUploadingInModal ? 'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'ದಾಖಲೆ ಸೇರಿಸಿ (Add File)'}</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleUploadAdditionalFiles}
                    disabled={isUploadingInModal}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sky-900 hover:underline font-semibold cursor-pointer ml-1"
                >
                  ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-stone-600 hover:underline cursor-pointer"
                >
                  ರದ್ದುಗೊಳಿಸಿ
                </button>
              </div>
            </div>

            {docOrder.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-2">
                <UploadCloud className="w-8 h-8 mx-auto text-stone-300" />
                <p>ಈ ಕಡತದಲ್ಲಿ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.</p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                  <span>ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload PDF/JPG)</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleUploadAdditionalFiles}
                    disabled={isUploadingInModal}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {docOrder.map((doc, idx) => {
                  const docId = doc.id || `doc-${idx}`;
                  const isSelected = selectedDocIds.includes(docId);
                  const isPdf = doc.fileType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={docId}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-amber-50/60 border-amber-300 shadow-2xs' 
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleSelectDoc(docId)}
                          className="text-amber-700 hover:text-amber-900 cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-700" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </button>

                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                          isPdf ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0">
                          <span className="text-xs font-bold text-stone-900 block truncate" title={doc.fileName}>
                            {idx + 1}. {doc.fileName}
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            {doc.fileSize} • {doc.uploadedAt || 'ಕಡತ ದಾಖಲೆ'}
                          </span>
                        </div>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                          title="ಮೇಲೆ ಸರಿಸಿ (Move Up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === docOrder.length - 1}
                          onClick={() => moveDown(idx)}
                          className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                          title="ಕೆಳಗೆ ಸರಿಸಿ (Move Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Options & Output Configuration */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
            <h5 className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
              ವಿಲೀನಕರಣ ಆಯ್ಕೆಗಳು (Consolidation Options)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCoverPage}
                  onChange={(e) => setIncludeCoverPage(e.target.checked)}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-stone-700">ಕಡತ ಸಾರಾಂಶ ಮುಖಪುಟ ಸೇರಿಸಿ (Official Cover Index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAttachToDocket}
                  onChange={(e) => setAutoAttachToDocket(e.target.checked)}
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-stone-700">ಕಡತಕ್ಕೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲಗತ್ತಿಸಿ (Auto-attach to Docket)</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                ವಿಲೀನಗೊಳಿಸಿದ ಕಡತದ ಹೆಸರು (Output PDF File Name):
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="w-full px-3 py-1.5 font-mono text-xs border border-stone-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            ಮುಚ್ಚಿ (Close)
          </button>

          <button
            type="button"
            onClick={handleStartMerge}
            disabled={isMerging || selectedDocIds.length === 0}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ದಾಖಲೆಗಳು ವಿಲೀನಗೊಳ್ಳುತ್ತಿವೆ...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>ದಾಖಲೆಗಳನ್ನು ವಿಲೀನಗೊಳಿಸಿ (Merge to Single PDF)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
