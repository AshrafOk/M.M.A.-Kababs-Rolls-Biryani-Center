import React, { useState, useMemo } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  WifiOff, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Share2,
  RefreshCw,
  Zap,
  Globe,
  PlusSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type MobileTab = 'push_updates' | 'android' | 'apple' | 'stores';

export const AndroidInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  // Detect platform to set the most relevant default tab
  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  const isAndroid = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /android/i.test(navigator.userAgent);
  }, []);

  const [activeTab, setActiveTab] = useState<MobileTab>(() => {
    if (isIOS) return 'apple';
    if (isAndroid) return 'android';
    return 'push_updates';
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="MMA Kababs Logo" 
                className="w-12 h-12 rounded-2xl bg-black border-2 border-amber-500/50 object-contain p-0.5 shadow-md shrink-0" 
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-lg text-white">Android &amp; Apple Mobile Apps</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-950">
                    Live OTA Sync
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  M.M.A. Kababs Rolls &amp; Biryani Center • Bangalore 6 Branches
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

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1.5 mt-5 bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('push_updates')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeTab === 'push_updates'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] sm:text-xs">Push Changes</span>
            </button>

            <button
              onClick={() => setActiveTab('android')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeTab === 'android'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Android</span>
              {isAndroid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab('apple')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeTab === 'apple'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Apple iOS</span>
              {isIOS && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                activeTab === 'stores'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">App Stores</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700 flex-1">

          {/* TAB 1: HOW PUSHING CHANGES / OTA UPDATES WORK */}
          {activeTab === 'push_updates' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                    <Zap className="w-4 h-4" />
                  </span>
                  <h4 className="font-black text-sm text-emerald-950">
                    Can You Push Changes to Android and Apple Apps?
                  </h4>
                </div>
                <p className="text-emerald-900 text-xs leading-relaxed font-medium">
                  <strong>YES! 100% Instantly!</strong> Because this application is engineered as a modern Progressive Web App (PWA) with built-in Service Worker cache versioning, every change you push to the code is automatically deployed Over-The-Air (OTA) to all Android and Apple (iOS) devices without requiring manual store updates!
                </p>
              </div>

              {/* 3 Pillars of Instant Pushing */}
              <div className="space-y-2.5">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Zero App Store Review Delays
                    </h5>
                    <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                      Traditional Apple App Store or Google Play Store releases take 2 to 7 days for review. With our PWA architecture, your code changes (like new sales graphs, updated branch menus, or security fixes) go live immediately across all Bangalore phones!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Automatic Background Cache Update (autoUpdate)
                    </h5>
                    <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                      The service worker configured in <code>vite.config.ts</code> runs in the background. As soon as a branch manager or owner opens the app, it checks for a fresh version, replaces old cache files, and renders the updated features instantly.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs">
                      Offline Resilient Data Persistence
                    </h5>
                    <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                      Even after code changes are pushed, all local data entries, custom branch records, and passwords stay safely preserved in your phone&apos;s isolated storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action to test */}
              <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs text-stone-600">
                <span>Want to see how to install on mobile?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('android')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Android Guide &rarr;
                  </button>
                  <button
                    onClick={() => setActiveTab('apple')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Apple Guide &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID INSTALL GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* Status Banner */}
              {isInstalled ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>MMA Kababs is already running in standalone app mode on your device!</span>
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
                      <span>Install on Phone</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      PWA Manifest Ready
                    </span>
                  )}
                </div>
              )}

              {/* Android Chrome Instructions */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>How to Install on Android in 3 Easy Steps (Google Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-amber-900 leading-relaxed font-medium">
                  <li>
                    Open this app link in <strong>Google Chrome</strong> on your Android phone.
                  </li>
                  <li>
                    Tap the <strong>three dots (⋮)</strong> menu in Chrome&apos;s top-right corner.
                  </li>
                  <li>
                    Tap <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>).
                  </li>
                  <li>
                    Confirm <strong>&ldquo;Install&rdquo;</strong>. The MMA Kababs icon will now appear in your app drawer and home screen with fullscreen speed!
                  </li>
                </ol>
              </div>

              {/* Android Features */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Real App Icon</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Launches directly like any Play Store app with official MMA logo.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                    <WifiOff className="w-4 h-4 text-emerald-600" />
                    <span>Works Offline</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Enter sales &amp; expenses even when restaurant Wi-Fi drops.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLE iOS (IPHONE / IPAD) INSTALL GUIDE */}
          {activeTab === 'apple' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="Apple Touch Icon"
                  className="w-12 h-12 rounded-2xl shadow-md border border-stone-300"
                />
                <div>
                  <div className="font-black text-sm text-stone-900">Apple iOS App (iPhone &amp; iPad)</div>
                  <div className="text-[11px] text-stone-500">Native Apple Touch Icon &bull; Full-Screen Standalone</div>
                </div>
              </div>

              {/* Apple iOS Safari Instructions */}
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-sky-700" />
                  <span>How to Install on iPhone / iPad (Safari):</span>
                </div>
                
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-sky-900 leading-relaxed font-medium">
                  <li>
                    Open this app link in <strong>Safari</strong> on your iPhone or iPad.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> button at the bottom of the screen (the square icon with an arrow pointing upward <Share2 className="w-3.5 h-3.5 inline text-sky-700" />).
                  </li>
                  <li>
                    Scroll down through the share options and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-sky-700" />).
                  </li>
                  <li>
                    Tap <strong>&ldquo;Add&rdquo;</strong> at the top-right corner.
                  </li>
                </ol>

                <div className="p-2.5 bg-white/80 rounded-xl border border-sky-200 text-[11px] text-sky-900">
                  🎉 <strong>Done!</strong> The MMA Kababs icon will now sit on your iPhone home screen. When you tap it, it launches without Safari address bars and behaves like a native iOS application!
                </div>
              </div>

              {/* Apple iOS Highlights */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>No Safari URL Bar</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Runs in immersive standalone mode, giving full display space for tables &amp; charts.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                    <RefreshCw className="w-4 h-4 text-sky-600" />
                    <span>Automatic OTA Push</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Every time you deploy code updates, your iPhone app automatically syncs on launch!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISHING TO GOOGLE PLAY & APPLE APP STORE */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Packaging for Google Play Store &amp; Apple App Store</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  If you need a signed <strong>.apk / .aab</strong> file for Google Play or an <strong>Xcode / IPA project</strong> for the Apple App Store, this app is 100% compliant and ready:
                </p>
              </div>

              {/* Method 1: PWABuilder (Instant, zero code) */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-stone-900 text-xs">
                    Method 1: PWABuilder (Fastest - 2 minutes)
                  </h5>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Go to <strong>pwabuilder.com</strong>, enter your deployed app URL, and click <strong>&ldquo;Package for Stores&rdquo;</strong>. PWABuilder will automatically generate:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600 pl-1 font-mono">
                  <li>Android: Signed APK / AAB package (Google Play ready)</li>
                  <li>Apple: Xcode iOS package (App Store / TestFlight ready)</li>
                </ul>
              </div>

              {/* Method 2: Capacitor (Native Plugins) */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-stone-900 text-xs">
                  Method 2: Capacitor Framework
                </h5>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  You can also wrap this Vite project with Capacitor:
                </p>
                <div className="p-2.5 bg-stone-900 text-stone-200 rounded-xl font-mono text-[10px] space-y-1">
                  <div>npm install @capacitor/core @capacitor/cli</div>
                  <div>npx cap init &quot;MMA Kababs&quot; &quot;com.mmakababs.app&quot;</div>
                  <div>npm install @capacitor/android @capacitor/ios</div>
                  <div>npx cap add android &amp;&amp; npx cap add ios</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                💡 <strong>Key Advantage:</strong> Even when distributed via Google Play or Apple App Store, the underlying web content updates over the air, so your daily sales and graph upgrades don&apos;t require repeated app store re-submissions!
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>M.M.A. Mobile PWA &bull; Android &amp; Apple iOS Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

// Also export alias
export const MobileInstallModal = AndroidInstallModal;
