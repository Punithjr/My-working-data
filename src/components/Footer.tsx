import React from 'react';
import { ShieldCheck, Lock, Wifi, WifiOff, Heart } from 'lucide-react';
import { ToolTab } from './SEOHead';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface FooterProps {
  onSelectTab: (tab: ToolTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const isOnline = useOnlineStatus();

  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Privacy Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Lock className="w-4 h-4" />
            <span>100% Client-Side Privacy:</span>
          </div>
          <span>Your files never leave your device. All compression, conversions, and scanning happen right in your browser memory.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Privacy Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                File<span className="text-blue-600 dark:text-blue-400">Tools</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                PWA Ready
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A free, mobile-first suite of daily file utilities built with modern Web APIs (Canvas, Web Workers, PDF.js, jsPDF). No registrations, no file size upload limits, and no server telemetry.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Data Collection</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-500 font-semibold">Offline PWA Active</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tools Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('compress-image')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  Image Compressor (20KB, 50KB, 100KB)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('convert-jpg')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  JPEG to JPG Converter (Batch)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('compress-pdf')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  PDF Compressor (Target KB / Profiles)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('scan-pdf')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  PDF Document Scanner (Camera / Crop)
                </button>
              </li>
            </ul>
          </div>

          {/* Technology & Privacy Specs */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Security Guarantee
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Runs 100% on your device CPU</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>No backend storage or database</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Works offline without Wi-Fi / cell</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Unlimited free batch conversions</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} FileTools. All rights reserved. Free and open client-side utilities.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with privacy & speed in mind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
