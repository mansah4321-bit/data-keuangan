import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onToggleNavigation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleNavigation }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    settings,
    isSyncing,
    syncWithGoogleSheets,
  } = useApp();

  const handleSyncClick = async () => {
    if (isSyncing) return;
    const res = await syncWithGoogleSheets(true);
    if (res.success) {
      alert('✅ Sinkronisasi Berhasil!\nData Anda sekarang sinkron dengan Google Sheets.');
    } else {
      alert(`❌ Sinkronisasi Gagal!\n${res.message}\n\nTips: Pastikan URL Apps Script benar, dan izin Web App diset ke "Anyone" (Siapa saja) saat melakukan deployment.`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#220738] via-[#3a0d5c] to-[#18052e] text-white border-b border-purple-700/50 px-2 sm:px-6 shadow-lg transition-colors duration-200 rounded-none">
      <div className="w-full flex items-center justify-between min-h-[62px] sm:min-h-[76px] py-2 sm:py-3 gap-2 sm:gap-4">
        {/* LEFT ZONE: IKON GARIS TIGA + EMBLEM BESAR + TULISAN HEADER LEBIH BESAR & JELAS */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0 flex-1">
          {/* Ikon Garis Tiga (Hamburger Menu) */}
          <button
            onClick={onToggleNavigation}
            aria-label="Buka Menu Navigasi"
            title="Buka Navigasi"
            className="p-1.5 sm:p-2.5 rounded-xl border border-purple-400/50 bg-purple-950/70 hover:bg-purple-900 text-purple-100 transition active:scale-95 flex items-center justify-center flex-shrink-0 shadow-xs"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200" />
          </button>

          {/* Logo / Emblem Kotak */}
          <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-900 border border-purple-300/50 flex items-center justify-center text-white shadow-md shadow-purple-950/40 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>

          {/* TEKS HEADER */}
          <div className="min-w-0 flex-1">
            <h1 className="text-[10px] min-[360px]:text-[11px] sm:text-base md:text-lg lg:text-xl font-black tracking-tight text-white uppercase leading-tight sm:leading-snug">
              DATA KEUANGAN DIVISI KEMAHASANTRIAN
            </h1>
            <div className="flex flex-wrap items-center gap-x-1 text-[8px] min-[360px]:text-[9px] sm:text-[11px] md:text-xs text-purple-200/90 font-medium mt-0.5">
              <span className="text-[8px] min-[360px]:text-[9px] sm:text-[11px] md:text-xs tracking-tight whitespace-normal break-words">
                {settings.institutionName || "MA'HAD ALY AL FURQON MAGELANG"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: ACTIONS (DIRECT SYNC ICON BUTTON & THEME TOGGLE) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          <button
            onClick={handleSyncClick}
            title={isSyncing ? 'Sedang Menyinkronkan...' : settings.googleScriptUrl ? 'Klik untuk Sinkronisasi Langsung ke Google Sheets' : 'Atur URL Google Script di Pengaturan'}
            aria-label="Sinkronisasi Otomatis Google Sheets"
            className="p-1.5 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95 flex items-center justify-center relative"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-300' : 'text-white/80'}`} />
            <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : settings.googleScriptUrl ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          {/* Dark/Light Mode Toggle Switch */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Toggle Dark Mode"
            className="p-1.5 sm:p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-400/40 transition active:scale-95 flex items-center justify-center shadow-xs"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-purple-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


