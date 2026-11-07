import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  UploadCloud, 
  SwitchCamera, 
  FileText, 
  AlertCircle, 
  Sparkles,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import { MasterDocketFile, DocumentAttachment } from '../types';
import { generateSampleKarnatakaGovtDocument } from '../utils/sampleDocument';

interface CaptureDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDocketFile: MasterDocketFile | null;
  onAttachDocument: (fileId: string, attachment: DocumentAttachment) => Promise<void>;
  suggestedDocTitle?: string;
  defaultCategory?: string;
  showToast?: (msg: string) => void;
}

export const CaptureDocumentModal: React.FC<CaptureDocumentModalProps> = ({
  isOpen,
  onClose,
  targetDocketFile,
  onAttachDocument,
  suggestedDocTitle,
  defaultCategory,
  showToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeFileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('ಮೂಲ ಅರ್ಜಿ / ದಾಖಲೆ ಪ್ರತಿ (Original Paper Document)');
  const [isAttaching, setIsAttaching] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Stop current active media stream
  const stopCurrentStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // Start device camera
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null);
    try {
      // Check available video devices
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }

      // Try environment facing mode first for scanning paper documents
      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback to basic video constraint if environment is unavailable
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(e => console.warn('Video play interrupted:', e));
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'ಕ್ಯಾಮರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ ಅಥವಾ ಕೆಳಗಿನ ನೇರ ಕ್ಯಾಮರಾ ಬಟನ್ ಬಳಸಿ.'
          : 'ಸಾಧನದ ಕ್ಯಾಮೆರಾ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ನೇರ ಕ್ಯಾಮರಾ ಫೋಟೋ ಬಟನ್ ಬಳಸಿ.'
      );
    }
  }, []);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedImageDataUrl(null);
      const today = new Date().toISOString().split('T')[0];
      const defaultName = suggestedDocTitle 
        ? `${suggestedDocTitle}_${today}.jpg`
        : `ದಾಖಲೆ_ಪ್ರತಿ_${targetDocketFile?.fileNumber || 'ಕಡತ'}_${today}.jpg`;
      setDocumentName(defaultName);
      if (defaultCategory) {
        setDocumentDescription(defaultCategory);
      } else {
        setDocumentDescription('ಮೂಲ ಅರ್ಜಿ / ದಾಖಲೆ ಪ್ರತಿ (Original Paper Document)');
      }

      startCamera(facingMode);
    } else {
      stopCurrentStream();
      setCapturedImageDataUrl(null);
    }

    return () => {
      stopCurrentStream();
    };
  }, [isOpen, facingMode, suggestedDocTitle, defaultCategory, targetDocketFile?.fileNumber]);

  // Handle Switch Camera (Front/Rear)
  const handleToggleFacingMode = () => {
    stopCurrentStream();
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture Photo from Live Video Canvas
  const handleLoadSample = async () => {
    try {
      const sample = await generateSampleKarnatakaGovtDocument();
      if (sample) {
        setCapturedImageDataUrl(sample);
        setCameraError(null);
        stopCurrentStream();
        if (showToast) {
          showToast('ಮಾದರಿ ಅಧಿಕೃತ ಕಛೇರಿ ಪತ್ರ ಲೋಡ್ ಆಗಿದೆ!');
        }
      }
    } catch (e) {
      console.error('Failed to load sample document in modal', e);
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Export high-quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImageDataUrl(dataUrl);

    // Stop live stream while reviewing captured photo
    stopCurrentStream();
  };

  // Handle Native Device Camera File Capture (Fallback or direct mobile capture)
  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImageDataUrl(dataUrl);
      if (!documentName || documentName.includes('ದಾಖಲೆ_ಪ್ರತಿ')) {
        setDocumentName(file.name || `ಕ್ಯಾಮರಾ_ಫೋಟೋ_${new Date().toISOString().split('T')[0]}.jpg`);
      }
      stopCurrentStream();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedImageDataUrl(null);
    startCamera(facingMode);
  };

  // Attach Document to Target Docket File
  const handleConfirmAttach = async () => {
    if (!targetDocketFile || !capturedImageDataUrl) return;

    setIsAttaching(true);
    try {
      // Calculate approximate size from base64
      const approxBytes = Math.round((capturedImageDataUrl.length * 3) / 4);
      const sizeStr = approxBytes < 1024 * 1024 
        ? `${Math.round(approxBytes / 1024)} KB` 
        : `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`;

      const finalFileName = documentName.trim().endsWith('.jpg') || documentName.trim().endsWith('.jpeg') || documentName.trim().endsWith('.png')
        ? documentName.trim()
        : `${documentName.trim() || 'Document_Capture'}.jpg`;

      const newAttachment: DocumentAttachment = {
        id: `att-cam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fileName: finalFileName,
        fileSize: sizeStr,
        fileType: 'image/jpeg',
        uploadedAt: new Date().toISOString().split('T')[0],
        description: documentDescription.trim() || 'ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಸೆರೆಹಿಡಿದ ಕಾಗದ ದಾಖಲೆ ಪ್ರತಿ',
        dataUrl: capturedImageDataUrl,
      };

      await onAttachDocument(targetDocketFile.id, newAttachment);

      if (showToast) {
        showToast(`ದಾಖಲೆ "${finalFileName}" ಕಡತಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಲಗತ್ತಿಸಲಾಗಿದೆ!`);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to attach captured document:', err);
      if (showToast) {
        showToast(err.message || 'ದಾಖಲೆ ಲಗತ್ತಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ');
      }
    } finally {
      setIsAttaching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-stone-800">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between gap-3 border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-amber-300 font-sans tracking-tight truncate">
                ಕಾಗದ ದಾಖಲೆ ಸೆರೆಹಿಡಿ (Capture Document via Camera)
              </h3>
              <p className="text-[11px] text-stone-300 truncate font-kannada">
                ಕಡತ: <strong className="text-white font-mono">{targetDocketFile?.fileNumber || '—'}</strong> • {targetDocketFile?.subject || 'ಸಾಮಾನ್ಯ ಕಡತ'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="ಮುಚ್ಚಿ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[75vh] space-y-4">
          
          {/* CAMERA VIEWFINDER OR PREVIEW */}
          {!capturedImageDataUrl ? (
            <div className="relative bg-stone-950 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-stone-800 shadow-inner">
              
              {/* Live Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Document Scanner Guide Overlay */}
              <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-5 h-5 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1" />
                  <span className="text-[10px] font-bold text-amber-300 bg-stone-950/80 px-2 py-0.5 rounded border border-amber-400/50 uppercase tracking-wider font-mono">
                    Document Frame
                  </span>
                  <div className="w-5 h-5 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1" />
                </div>

                <div className="text-center">
                  <span className="inline-block text-[11px] font-bold text-white bg-stone-900/85 px-3 py-1 rounded-full border border-stone-700 shadow-sm font-kannada">
                    ಕಾಗದ ಪತ್ರವನ್ನು ಚೌಕಟ್ಟಿನೊಳಗೆ ಇರಿಸಿ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-5 h-5 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1" />
                  <div className="w-5 h-5 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1" />
                </div>
              </div>

              {/* Camera Switch Button */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full border border-stone-700 transition-all cursor-pointer shadow-md"
                  title="ಕ್ಯಾಮರಾ ಬದಲಾಯಿಸಿ (ಮುಂಭಾಗ / ಹಿಂಭಾಗ)"
                >
                  <SwitchCamera className="w-4 h-4 text-amber-300" />
                </button>
              )}

              {/* Camera Permission / Error Fallback Notice */}
              {cameraError && (
                <div className="absolute inset-0 bg-stone-900/95 p-5 flex flex-col items-center justify-center text-center text-white space-y-3 z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white font-kannada">
                      ಕ್ಯಾಮರಾ ಅನುಮತಿ ನಿರ್ವಹಣೆ (Camera Access Notice)
                    </h4>
                    <p className="text-xs text-stone-300 max-w-sm font-kannada leading-relaxed">
                      {cameraError}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => nativeFileInputRef.current?.click()}
                      className="w-full sm:w-auto flex-1 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md font-kannada"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>1. ಸಾಧನದ ಕ್ಯಾಮೆರಾ (No Permission)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="w-full sm:w-auto flex-1 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md font-kannada"
                    >
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>2. ಮಾದರಿ ದಾಖಲೆ ಲೋಡ್</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PHOTO PREVIEW STATE */
            <div className="space-y-4">
              <div className="relative bg-stone-950 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-stone-800">
                <img
                  src={capturedImageDataUrl}
                  alt="Captured Document"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-stone-900/80 rounded-md text-[10px] font-bold text-amber-300 border border-amber-400/40">
                  ✓ ಸೆರೆಹಿಡಿದ ದಾಖಲೆ ಪ್ರತಿ (Photo Captured)
                </div>
              </div>

              {/* Document Meta Form */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-300 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1 font-kannada">
                    ದಾಖಲೆಯ ಹೆಸರು (File Name):
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="ಉದಾ: ಅರ್ಜಿ_ಪ್ರತಿ_2026.jpg"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1 font-kannada">
                    ದಾಖಲೆಯ ಪ್ರಕಾರ / ವಿವರಣೆ (Document Description):
                  </label>
                  <select
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-kannada text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="ಮೂಲ ಅರ್ಜಿ / ದಾಖಲೆ ಪ್ರತಿ (Original Paper Document)">ಮೂಲ ಅರ್ಜಿ / ದಾಖಲೆ ಪ್ರತಿ (Original Application)</option>
                    <option value="ಅಂಚೆ ರಶೀದಿ / ರವಾನೆ ಪ್ರತಿ (Postal / RL Dispatch Receipt)">ಅಂಚೆ ರಶೀದಿ / ರವಾನೆ ಪ್ರತಿ (Postal Receipt)</option>
                    <option value="ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ / ಚಲನ್ ಪ್ರತಿ (Fee Stamp / Challan)">ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ / ಚಲನ್ ಪ್ರತಿ (Fee Receipt)</option>
                    <option value="ಸರ್ಕಾರಿ ಆದೇಶ / ಸುತ್ತೋಲೆ ಪ್ರತಿ (Official GO / Circular Copy)">ಸರ್ಕಾರಿ ಆದೇಶ / ಸುತ್ತೋಲೆ ಪ್ರತಿ (Official Order Copy)</option>
                    <option value="ಕಛೇರಿ ಟಿಪ್ಪಣಿ / ಪರಿಶೀಲನಾ ಹಾಳೆ (Office Note / Scrutiny Sheet)">ಕಛೇರಿ ಟಿಪ್ಪಣಿ / ಪರಿಶೀಲನಾ ಹಾಳೆ (Office Note)</option>
                    <option value="ಸೇವಾ ಪುಸ್ತಕ ದಾಖಲಾತಿ ಪ್ರತಿ (Service Book Scan)">ಸೇವಾ ಪುಸ್ತಕ ದಾಖಲಾತಿ ಪ್ರತಿ (Service Book Scan)</option>
                    <option value="ಇತರೆ ಪೂರಕ ದಾಖಲೆ ಪ್ರತಿ (Supplementary Document)">ಇತರೆ ಪೂರಕ ದಾಖಲೆ ಪ್ರತಿ (Other Document)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas and Native Camera Capture Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={nativeFileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleNativeFileCapture}
            className="hidden"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-100 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Native Camera trigger & retake options */}
          <div className="flex items-center gap-2">
            {!capturedImageDataUrl ? (
              <button
                type="button"
                onClick={() => nativeFileInputRef.current?.click()}
                className="px-3 py-2 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ಸಾಧನದ ಸ್ಥಳೀಯ ಕ್ಯಾಮರಾ ತೆರೆಯಿರಿ"
              >
                <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                <span className="font-kannada">ಕ್ಯಾಮೆರಾ / ಫೈಲ್ ಆಯ್ಕೆ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                disabled={isAttaching}
                className="px-3 py-2 bg-white hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                <span className="font-kannada">ಮರು ಫೋಟೋ ತೆಗೆಯಿರಿ</span>
              </button>
            )}
          </div>

          {/* Right: Shutter snap button OR Confirm attach button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isAttaching}
              className="px-3.5 py-2 text-stone-700 hover:text-stone-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              ರದ್ದು (Cancel)
            </button>

            {!capturedImageDataUrl ? (
              <button
                id="btn-shutter-snap"
                type="button"
                onClick={handleSnapPhoto}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#2b2b2b] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ (Snap Photo)</span>
              </button>
            ) : (
              <button
                id="btn-confirm-attach-captured-doc"
                type="button"
                onClick={handleConfirmAttach}
                disabled={isAttaching}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border-2 border-emerald-900 shadow-[2px_2px_0px_#065f46] flex items-center gap-2 transition-all cursor-pointer"
              >
                {isAttaching ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>ಲಗತ್ತಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ಕಡತಕ್ಕೆ ಲಗತ್ತಿಸಿ (Attach to Docket)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
