import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  X,
  Laptop,
  CheckCircle,
  FileCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../utils/usePWAInstall';

interface MobileAppInstallSectionProps {
  onShowToast?: (msg: string) => void;
}

export const MobileAppInstallSection: React.FC<MobileAppInstallSectionProps> = ({
  onShowToast
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    install,
    openInNewTab,
    checkForUpdates,
    isCheckingUpdate,
    updateStatus,
    lastUpdatedTime
  } = usePWAInstall();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  // Set default guide tab based on OS
  useEffect(() => {
    if (isIOS) setActiveGuideTab('ios');
    else if (isAndroid) setActiveGuideTab('android');
    else setActiveGuideTab('desktop');
  }, [isIOS, isAndroid]);

  // Generate QR Code on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 190,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, []);

  const handleInstallClick = async () => {
    // If browser already prepared the prompt (e.g. running in top level window)
    if (isInstallable) {
      const res = await install();
      if (res === 'accepted') {
        setInstallFeedback('ಅಪ್ಲಿಕೇಶನ್ ಯಶಸ್ವಿಯಾಗಿ ಇನ್‌ಸ್ಟಾಲ್ ಆಗಿದೆ!');
        if (onShowToast) onShowToast('ಅಪ್ಲಿಕೇಶನ್ ಯಶಸ್ವಿಯಾಗಿ ಇನ್‌ಸ್ಟಾಲ್ ಆಗಿದೆ (App Installed Successfully)!');
        return;
      } else if (res === 'dismissed') {
        setInstallFeedback('ಇನ್‌ಸ್ಟಾಲೇಶನ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Installation cancelled).');
        return;
      }
    }

    // If deferredPrompt is not available (common in iframes, iOS Safari, or if prompt not auto-triggered)
    // Always open the interactive visual guide modal with direct actions!
    setShowInstallGuideModal(true);
  };

  const handleUpdateClick = async () => {
    const success = await checkForUpdates();
    if (success && onShowToast) {
      onShowToast('ಅಪ್ಲಿಕೇಶನ್ ಅತ್ಯಂತ ನವೀನ ಆವೃತ್ತಿಗೆ ನವೀಕರಣಗೊಂಡಿದೆ! (App is up to date)');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      if (onShowToast) onShowToast('ಮೊಬೈಲ್ ಆ್ಯಪ್ ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ (URL Copied)!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareApp = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ - ಮೊಬೈಲ್ ಆ್ಯಪ್',
          text: 'BEO ಭದ್ರಾವತಿ ಅಧಿಕೃತ ಇ-ಕಛೇರಿ ಹಾಗೂ ಪತ್ರ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶವನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ಈ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ:',
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate and download a lightweight launcher HTML shortcut file
  const handleDownloadLauncherShortcut = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const shortcutHtml = `<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BEO ಭದ್ರಾವತಿ - ಇ-ಕಛೇರಿ ತಂತ್ರಾಂಶ</title>
  <meta http-equiv="refresh" content="0; url=${url}">
  <style>
    body { font-family: sans-serif; background: #fffbf2; color: #1c1917; text-align: center; padding: 40px 20px; }
    .card { max-width: 420px; margin: 0 auto; background: white; padding: 24px; border-radius: 16px; border: 2px solid #2b2b2b; box-shadow: 4px 4px 0 #2b2b2b; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    p { font-size: 14px; color: #555; }
    a { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #f59e0b; color: #000; font-weight: bold; text-decoration: none; border-radius: 8px; border: 2px solid #000; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಭದ್ರಾವತಿ</h1>
    <p>ಆ್ಯಪ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ... (Opening BEO App...)</p>
    <a href="${url}">ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ (Click to Open)</a>
  </div>
  <script>window.location.href = "${url}";<\/script>
</body>
</html>`;

    const blob = new Blob([shortcutHtml], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'BEO-Bhadravathi-App-Launcher.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    if (onShowToast) {
      onShowToast('ಮೊಬೈಲ್ ಆ್ಯಪ್ ಶಾರ್ಟ್‌ಕಟ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (Launcher Saved)!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 p-6 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_#1c1917] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-950 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              <span>PWA MOBILE & DESKTOP APP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-950 font-kannada tracking-tight">
              ಮೊಬೈಲ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ & ಆವೃತ್ತಿ ನವೀಕರಣ (Mobile App & Update Manager)
            </h2>
            <p className="text-xs sm:text-sm text-stone-900 font-kannada max-w-2xl font-medium leading-relaxed">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಚೇರಿಯ ಇ-ಕಛೇರಿ ಹಾಗೂ ಪತ್ರ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶವನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಫೋನ್, ಟ್ಯಾಬ್ಲೆಟ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಆ್ಯಪ್‌ನಂತೆ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿಕೊಳ್ಳಿ.
            </p>
          </div>

          {/* Installation Status Badge */}
          <div className="bg-stone-950/90 text-white p-4 rounded-xl border border-amber-300/40 shadow-sm shrink-0 flex flex-col justify-center min-w-[210px]">
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">ಸ್ಥಿತಿ (Status)</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-sm font-bold font-kannada">
                {isInstalled ? 'ಇನ್‌ಸ್ಟಾಲ್ ಆಗಿದೆ (Installed)' : 'ಇನ್‌ಸ್ಟಾಲ್‌ಗೆ ಲಭ್ಯವಿದೆ (Ready)'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 font-mono">
              ಆವೃತ್ತಿ: v1.2.0 (Build 2026.10)
            </span>
          </div>
        </div>
      </div>

      {/* If inside iframe (e.g. AI Studio preview), show helpful notice and direct full window button */}
      {isInIframe && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs sm:text-sm font-kannada">
                ⚠️ ಪ್ರಿವ್ಯೂ ವಿಂಡೋ ಸೂಚನೆ (Browser Preview Notice):
              </h4>
              <p className="text-xs text-amber-900 font-kannada leading-relaxed">
                ಪ್ರಿವ್ಯೂ ಫ್ರೇಮ್‌ನಲ್ಲಿರುವ ಕಾರಣ ಬ್ರೌಸರ್ ನೇರ ಇನ್‌ಸ್ಟಾಲ್ ಡೈಲಾಗ್ ಅನ್ನು ನಿರ್ಬಂಧಿಸುತ್ತದೆ. ಮೊಬೈಲ್‌ನಲ್ಲಿ ಆ್ಯಪ್ ಸ್ಥಾಪಿಸಲು ನೇರ ವಿಂಡೋದಲ್ಲಿ ತೆರೆಯಿರಿ ಅಥವಾ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openInNewTab}
            className="px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 cursor-pointer border border-amber-400 shadow-sm font-kannada transition-all"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ (Open Full Window)</span>
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actions & Update Control (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Action 1: Install Button Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-stone-850 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-kannada flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-600" />
                  <span>1. ಮೊಬೈಲ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ (Download / Install App)</span>
                </h3>
                <p className="text-xs text-stone-600 font-kannada mt-0.5">
                  ಗೂಗಲ್ ಪ್ಲೇ-ಸ್ಟೋರ್ ಇಲ್ಲದೆ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿಯೂ ಬಳಸಿ.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  id="btn-install-mobile-app"
                  onClick={handleInstallClick}
                  className="flex-1 py-3.5 px-5 rounded-xl font-black text-sm text-stone-950 bg-amber-400 hover:bg-amber-300 border-2 border-stone-900 shadow-[3px_3px_0px_#1c1917] transition-all flex items-center justify-center gap-2.5 cursor-pointer font-kannada active:scale-98"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>
                    {isInstalled
                      ? '✅ ಮೊಬೈಲ್ ಆ್ಯಪ್ ಈಗಾಗಲೇ ಸ್ಥಾಪಿಸಲಾಗಿದೆ'
                      : '📱 ಮೊಬೈಲ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ (Install App)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInstallGuideModal(true)}
                  className="py-3.5 px-4 rounded-xl font-bold text-xs text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer font-kannada shrink-0"
                  title="ಸಚಿತ್ರ ಇನ್‌ಸ್ಟಾಲ್ ಮಾರ್ಗದರ್ಶಿ ವೀಕ್ಷಿಸಿ"
                >
                  <HelpCircle className="w-4 h-4 text-stone-600" />
                  <span>ಹೇಗೆ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವುದು?</span>
                </button>
              </div>

              {installFeedback && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 font-kannada flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{installFeedback}</span>
                </div>
              )}

              {/* Install Guidance Highlights Box */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 font-kannada">
                    📱 ನಿಮ್ಮ ಮೊಬೈಲ್ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ವಿಧಾನ:
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold">
                    3 ಸರಳ ಹಂತಗಳು
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="font-bold text-stone-900 font-mono text-[11px] text-amber-700">
                      ಹಂತ ೧ (Step 1):
                    </div>
                    <p className="text-[11px] text-stone-700 font-kannada leading-snug">
                      ಬ್ರೌಸರ್ ಮೇಲ್ಭಾಗದ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ ಮೂರು ಚುಕ್ಕೆಗಳು <strong>(⋮ - Menu)</strong> ಒತ್ತಿ.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="font-bold text-stone-900 font-mono text-[11px] text-amber-700">
                      ಹಂತ ೨ (Step 2):
                    </div>
                    <p className="text-[11px] text-stone-700 font-kannada leading-snug">
                      ಮೆನುವಿನಲ್ಲಿ <strong>"Install app"</strong> ಅಥವಾ <strong>"Add to Home screen"</strong> ಆಯ್ಕೆಮಾಡಿ.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="font-bold text-stone-900 font-mono text-[11px] text-amber-700">
                      ಹಂತ ೩ (Step 3):
                    </div>
                    <p className="text-[11px] text-stone-700 font-kannada leading-snug">
                      <strong>"Install"</strong> ಕ್ಲಿಕ್ ಮಾಡಿ. ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ BEO ಆ್ಯಪ್ ಸಿದ್ಧವಾಗುತ್ತದೆ!
                    </p>
                  </div>
                </div>

                {/* Extra Quick Action: Launcher Shortcut File */}
                <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-600 font-kannada">
                    ಇನ್‌ಸ್ಟಾಲ್ ಬಟನ್ ಕಾಣದಿದ್ದಲ್ಲಿ ನೇರ ಶಾರ್ಟ್‌ಕಟ್ ಫೈಲ್ ಬಳಸಿ:
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadLauncherShortcut}
                    className="text-xs text-sky-800 hover:text-sky-950 font-bold underline flex items-center gap-1 cursor-pointer font-kannada"
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-700" />
                    <span>ಮೊಬೈಲ್ ಶಾರ್ಟ್‌ಕಟ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ (Launcher.html)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action 2: Update Check & Refresh Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-stone-850 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-kannada flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  <span>2. ಆ್ಯಪ್ ನವೀಕರಣ ಪರಿಶೀಲನೆ (Check & Apply Updates)</span>
                </h3>
                <p className="text-xs text-stone-600 font-kannada mt-0.5">
                  ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ ಹೊಸ ವೈಶಿಷ್ಟ್ಯಗಳು, ನಿಯಮಾವಳಿಗಳು ಹಾಗೂ ಕ್ಯಾಶ್ ನವೀಕರಿಸಿ.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-900 font-kannada">
                    ಪ್ರಸ್ತುತ ಅಪ್ಲಿಕೇಶನ್ ಆವೃತ್ತಿ: <span className="font-mono text-emerald-700 font-black">v1.2.0</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-kannada mt-0.5">
                    ಕೊನೆಯ ನವೀಕರಣ: <strong className="text-stone-700 font-mono">{lastUpdatedTime}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-check-app-update"
                  disabled={isCheckingUpdate}
                  onClick={handleUpdateClick}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold font-kannada flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  <span>{isCheckingUpdate ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'ಅಪ್ಲಿಕೇಶನ್ ನವೀಕರಿಸಿ (Update Now)'}</span>
                </button>
              </div>

              {updateStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 font-kannada flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{updateStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: QR Code & Mobile Link Scanner (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* QR Code Scanner Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-stone-850 shadow-md text-center space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-900 font-kannada flex items-center justify-center gap-1.5">
                <QrCode className="w-5 h-5 text-amber-600" />
                <span>ಮೊಬೈಲ್‌ನಲ್ಲಿ ತಕ್ಷಣ ತೆರೆಯಲು QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ</span>
              </h3>
              <p className="text-xs text-stone-600 font-kannada">
                ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ Google Lens ನಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ
              </p>
            </div>

            {/* QR Code Display */}
            <div className="p-3 bg-stone-50 border-2 border-stone-800 rounded-2xl inline-block shadow-inner mx-auto">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="BEO Mobile App QR Code"
                  className="w-40 h-40 sm:w-44 sm:h-44 rounded-lg mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-stone-400 font-mono">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Direct Link Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold font-kannada border border-stone-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                <span>{copiedLink ? 'ನಕಲಿಸಲಾಗಿದೆ (Copied)!' : 'ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareApp}
                className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold font-kannada border border-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-700" />
                <span>ಮೊಬೈಲ್‌ಗೆ ಕಳುಹಿಸಿ (Share)</span>
              </button>
            </div>

            {/* Offline & App Highlights */}
            <div className="pt-3 border-t border-stone-100 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-kannada">100% ಸುರಕ್ಷಿತ ಅಧಿಕೃತ ಇಲಾಖಾ ತಂತ್ರಾಂಶ</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-kannada">ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಲಭ್ಯ</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-kannada">ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ HD ಕಡತ ಸ್ಕ್ಯಾನರ್ & PDF ಪರಿವರ್ತಕ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Installation Guide Modal */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 border-stone-200">
              <div>
                <h3 className="font-black text-lg text-stone-900 font-kannada flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <span>ಮೊಬೈಲ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ಸರಳ ವಿಧಾನ</span>
                </h3>
                <p className="text-xs text-stone-500 font-kannada mt-0.5">
                  Play Store ಇಲ್ಲದೆಯೇ ಯಾವುದೇ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಆ್ಯಪ್ ಸ್ಥಾಪಿಸಿ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Open in Full Window */}
            <div className="bg-amber-100/70 border border-amber-300 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-kannada">
                <ExternalLink className="w-4 h-4 text-amber-700" />
                <span>ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆದು ತಕ್ಷಣ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ:</span>
              </div>
              <p className="text-xs text-amber-900 font-kannada leading-tight">
                ಪ್ರಿವ್ಯೂ ಫ್ರೇಮ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಬಟನ್ ಕಾರ್ಯನಿರ್ವಹಿಸದಿದ್ದರೆ, ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಪೂರ್ಣ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ:
              </p>
              <button
                type="button"
                onClick={openInNewTab}
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-amber-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer font-kannada shadow-sm transition"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>🌐 ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ (Open Full Window)</span>
              </button>
            </div>

            {/* Device Tabs */}
            <div className="flex border-b border-stone-200 text-xs font-bold font-kannada">
              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${
                  activeGuideTab === 'android'
                    ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🤖 Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${
                  activeGuideTab === 'ios'
                    ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🍎 iPhone / iPad (Safari)
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('desktop')}
                className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${
                  activeGuideTab === 'desktop'
                    ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                💻 Computer / Laptop
              </button>
            </div>

            {/* Guide Tab Contents */}
            {activeGuideTab === 'android' && (
              <div className="space-y-3 text-xs text-stone-800 font-kannada">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">1</span>
                    <span>ಕ್ರೋಮ್ ಬ್ರೌಸರ್ ತೆರೆಯಿರಿ (Open Chrome):</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಮೇಲ್ಭಾಗದ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ ಮೂರು ಲಂಬ ಚುಕ್ಕೆಗಳನ್ನು <strong>(⋮ - Three Dots Menu)</strong> ಒತ್ತಿ.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">2</span>
                    <span>'Install app' ಆಯ್ಕೆಮಾಡಿ (Select Install):</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಮೆನುವಿನಲ್ಲಿ <strong>&ldquo;Install app&rdquo;</strong> ಅಥವಾ <strong>&ldquo;Add to Home screen (ಮುಖಪುಟಕ್ಕೆ ಸೇರಿಸಿ)&rdquo;</strong> ಎಂಬ ಆಯ್ಕೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">3</span>
                    <span>ಇನ್‌ಸ್ಟಾಲ್ ದೃಢೀಕರಿಸಿ (Confirm Install):</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಪಾಪ್-ಅಪ್‌ನಲ್ಲಿ <strong>&ldquo;Install&rdquo;</strong> ಒತ್ತಿ. ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ BEO ತಂತ್ರಾಂಶದ ಅಧಿಕೃತ ಐಕಾನ್ ನಿಮ್ಮ ಮೊಬೈಲ್ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರ್ಪಡೆಯಾಗುತ್ತದೆ.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'ios' && (
              <div className="space-y-3 text-xs text-stone-800 font-kannada">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">1</span>
                    <span>Safari ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಹಂಚಿಕೆ (Share) ಬಟನ್ ಒತ್ತಿ:</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಪರದೆಯ ಕೆಳಭಾಗದಲ್ಲಿರುವ <strong>Share [↑] (ಹಂಚಿಕೆ)</strong> ಐಕಾನ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">2</span>
                    <span>Add to Home Screen ಆಯ್ಕೆಮಾಡಿ:</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಮೆನುವಿನಲ್ಲಿ ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ <strong>&ldquo;Add to Home Screen&rdquo; (ಮುಖಪುಟಕ್ಕೆ ಸೇರಿಸಿ)</strong> ಆಯ್ಕೆಮಾಡಿ.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-mono font-bold">3</span>
                    <span>Add ಕ್ಲಿಕ್ ಮಾಡಿ:</span>
                  </div>
                  <p className="text-stone-600 pl-8 leading-relaxed">
                    ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ <strong>&ldquo;Add&rdquo;</strong> ಒತ್ತಿ. ನಿಮ್ಮ iPhone ಅಥವಾ iPad ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಅಪ್ಲಿಕೇಶನ್ ಐಕಾನ್ ಸಿದ್ಧವಾಗುತ್ತದೆ.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'desktop' && (
              <div className="space-y-3 text-xs text-stone-800 font-kannada">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-950">
                    <Laptop className="w-4 h-4 text-stone-800" />
                    <span>Chrome / Microsoft Edge ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್:</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    ಬ್ರೌಸರ್‌ನ ವಿಳಾಸ ಪಟ್ಟಿ (Address Bar) ಯ ಬಲಭಾಗದಲ್ಲಿ ಕಾಣಿಸುವ <strong>ಇನ್‌ಸ್ಟಾಲ್ ಐಕಾನ್ [⊕]</strong> ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಮೆನು ➔ <strong>&ldquo;Install BEO Bhadravathi&rdquo;</strong> ಒತ್ತಿ.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold font-kannada flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                <span>{copiedLink ? 'ಕಾಪಿ ಆಗಿದೆ' : 'ಲಿಂಕ್ ಕಾಪಿ'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-kannada cursor-pointer"
              >
                ಮುಚ್ಚಿ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
