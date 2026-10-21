import React from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  WifiOff, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="MMA Kababs Logo" 
                className="w-12 h-12 rounded-2xl bg-black border border-amber-500/40 object-contain p-0.5 shadow-md" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-white">Android Mobile App</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-950">
                    PWA &amp; APK
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  M.M.A. Kababs Rolls &amp; Biryani Center
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-900 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>This app is already installed on your device in standalone mode!</span>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="App Icon"
                  className="w-12 h-12 rounded-xl shadow-md border border-stone-300"
                />
                <div>
                  <div className="font-black text-sm text-stone-900">MMA Kababs</div>
                  <div className="text-[11px] text-stone-500">Standalone Android App • Full Screen</div>
                </div>
              </div>

              {isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Ready to Add
                </span>
              )}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Home Screen Icon</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Launches directly with its own app icon just like any native Play Store app.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>No Browser Bar</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Runs full screen without browser URL bars or tabs for maximum workspace.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <WifiOff className="w-4 h-4 text-emerald-600" />
                <span>Offline Support</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Stores your daily entries locally even if restaurant internet disconnects.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Role Protected</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                Branch managers stay logged into their branch; Admin has chain control.
              </p>
            </div>
          </div>

          {/* How to Install on Android in 2 Steps */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>How to Install on Any Android Phone (Chrome):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-amber-900 leading-relaxed font-medium">
              <li>
                Open this app URL in <strong>Google Chrome</strong> on your Android mobile.
              </li>
              <li>
                Tap the <strong>three dots (⋮)</strong> menu at the top right of Chrome.
              </li>
              <li>
                Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
              </li>
              <li>
                Tap <strong>&ldquo;Install&rdquo;</strong> in the confirmation popup. The MMA Kababs app will now appear on your phone&apos;s app drawer &amp; home screen!
              </li>
            </ol>
          </div>

          {/* Standalone APK packaging info */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-2">
            <div className="font-bold text-stone-900 text-xs">
              📦 Need a Standalone APK file for Google Play Store?
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Because this app is built with a complete Web App Manifest and Service Worker, you can generate a signed <code>.apk</code> or <code>.aab</code> package in 2 minutes using <strong>PWABuilder</strong> (pwabuilder.com) or Google&apos;s <strong>Bubblewrap CLI</strong> (Trusted Web Activity).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">
            M.M.A. Android PWA Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
