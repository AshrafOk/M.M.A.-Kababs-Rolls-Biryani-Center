import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseBackupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { records, branches, exportDatabaseFile, restoreDatabaseFromFile } = useRestaurant();
  const [restoreText, setRestoreText] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalRecordsCount = Object.keys(records).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreText(content);
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = () => {
    if (!restoreText.trim()) return;
    const result = restoreDatabaseFromFile(restoreText);
    setRestoreStatus(result);
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Database Backup & Crash Recovery</h3>
              <p className="text-xs text-stone-400">Export database file or restore records after a crash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          
          {/* SECTION 1: EXPORT / DOWNLOAD DATABASE FILE */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <h4 className="font-bold text-emerald-950 text-sm">1. Export & Save Database Backup File</h4>
              </div>
              <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
                {totalRecordsCount} Days Stored
              </span>
            </div>

            <p className="text-emerald-800 text-xs leading-relaxed">
              Downloads a complete <strong>.json database file</strong> containing all sales, expenses, poultry, grocery, dairy, and vegetable logs across all 6 Bangalore branches. Keep a copy on Google Drive, WhatsApp, or your phone.
            </p>

            <button
              onClick={exportDatabaseFile}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Database File (.JSON)</span>
            </button>
          </div>

          {/* SECTION 2: RESTORE FROM BACKUP FILE */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-stone-700 shrink-0" />
              <h4 className="font-bold text-stone-900 text-sm">2. Restore Database From Backup File</h4>
            </div>

            <p className="text-stone-600 text-xs">
              If your phone/computer crashed, browser cache was cleared, or you are switching to a new device, select your downloaded backup file to restore everything instantly:
            </p>

            {/* File Upload Selector */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-emerald-600" />
                <span>{selectedFileName ? selectedFileName : 'Select Backup File (.json)'}</span>
              </button>
            </div>

            {/* Paste Backup JSON Text Area */}
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">
                Or paste backup file content here:
              </label>
              <textarea
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Paste JSON content here..."
                className="w-full h-20 p-2.5 font-mono text-[11px] border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Status Alert */}
            {restoreStatus && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 font-semibold ${
                  restoreStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {restoreStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{restoreStatus.message}</span>
              </div>
            )}

            <button
              onClick={handleRestoreSubmit}
              disabled={!restoreText.trim()}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Confirm & Restore All Records</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>M.M.A. Kababs Rolls & Biryani Center</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
