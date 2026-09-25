import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  formatRupiahShort,
  MONTH_NAMES,
} from '../../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Wallet,
} from 'lucide-react';

export const BerandaView: React.FC = () => {
  const {
    filter,
    setFilter,
    totalDanaMasuk,
    totalRealisasi,
    danaKasSaatIni,
    lastSyncStatus,
    syncWithGoogleSheets,
    isSyncing,
    setIsPeriodModalOpen,
    setIsGoogleSheetsModalOpen,
    settings,
  } = useApp();

  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    if (datePickerRef.current) {
      try {
        datePickerRef.current.showPicker();
      } catch (err) {
        datePickerRef.current.click();
      }
    }
  };

  // Check if viewing current realtime month
  const now = new Date();
  const safeBulan = Number(filter?.bulan) || (now.getMonth() + 1);
  const safeTahun = Number(filter?.tahun) || now.getFullYear();
  const isCurrentMonth = safeBulan === now.getMonth() + 1 && safeTahun === now.getFullYear();

  // Quick Prev / Next month handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilter((prev) => {
      if (prev.bulan === 1) {
        return { ...prev, bulan: 12, tahun: prev.tahun - 1 };
      }
      return { ...prev, bulan: prev.bulan - 1 };
    });
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilter((prev) => {
      if (prev.bulan === 12) {
        return { ...prev, bulan: 1, tahun: prev.tahun + 1 };
      }
      return { ...prev, bulan: prev.bulan + 1 };
    });
  };

  return (
    <div className="space-y-3.5 pb-16 pt-1 max-w-4xl mx-auto">
      {/* TAB SALDO KAS UKURAN LEBIH KECIL DENGAN FONT MENYESUAIKAN */}
      <div className="bg-gradient-to-br from-[#240b36] via-[#481878] to-[#1a0730] dark:from-[#1b0629] dark:via-[#300c52] dark:to-[#0f041b] rounded-2xl p-3.5 sm:p-4 text-white shadow-md relative overflow-hidden border border-purple-400/30 transition-all duration-200">
        {/* Subtle geometric islamic decorative background */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-15 pointer-events-none text-purple-300">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50 0, 100 50, 50 100, 0 50" />
            <polygon points="50 15, 85 50, 50 85, 15 50" />
          </svg>
        </div>

        {/* Top Header Label */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          {/* Label Saldo */}
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 rounded-md bg-purple-950/70 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Wallet className="w-3 h-3" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-200 uppercase tracking-wider">
              Saldo Kas
            </span>
          </div>

          {/* TANGGALAN KECIL DI POJOK KANAN BAR SALDO KAS - GAYA BULAT ELEGAN SENSASI TRANSAKSI */}
          <div className="inline-flex items-center bg-purple-950/60 dark:bg-purple-950/80 rounded-xl p-1 border border-purple-400/30 text-[10px] sm:text-[11px] shadow-md gap-1">
            {/* Prev Button */}
            <button
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="p-1 sm:p-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-100 transition active:scale-90"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Main Interactive Date Label - Langsung Masuk Ke Kalender Native */}
            <div
              onClick={handleOpenPicker}
              className="relative flex items-center bg-purple-900/70 hover:bg-purple-800 text-white rounded-lg px-2 py-1 active:scale-95 transition cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-purple-300 mr-1.5 pointer-events-none" />
              <span className="tracking-tight whitespace-nowrap text-[10px] sm:text-[11px] font-extrabold mr-1 pointer-events-none">
                {MONTH_NAMES[safeBulan - 1] || 'Bulan'} {safeTahun}
              </span>
              {isCurrentMonth && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse pointer-events-none" title="Periode Berjalan (Realtime)" />
              )}
              {/* Invisible Native Date Input to trigger native calendar instantly */}
              <input
                ref={datePickerRef}
                type="date"
                value={`${safeTahun}-${String(safeBulan).padStart(2, '0')}-01`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [y, m] = val.split('-').map(Number);
                    setFilter((prev) => ({ ...prev, bulan: m, ...prev, tahun: y }));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                title="Klik untuk langsung buka Kalender"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="p-1 sm:p-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-100 transition active:scale-90"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

        {/* Dana Saat Ini Tersedia */}
        <div className="mt-2.5 relative z-10">
          <div className="text-[9.5px] sm:text-[10px] text-purple-200/80 font-bold tracking-wider uppercase">
            DANA SAAT INI TERSEDIA
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-0.5 ${
              danaKasSaatIni < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {formatRupiah(danaKasSaatIni)}
          </div>
        </div>

        {/* Mini Summary Bar */}
        <div className="mt-3 pt-2.5 border-t border-purple-400/25 grid grid-cols-2 gap-2 text-xs relative z-10">
          {/* Dana Masuk */}
          <div className="bg-purple-950/60 dark:bg-purple-950/80 p-2 sm:p-2.5 rounded-xl border border-purple-400/30 hover:border-purple-300/50 transition">
            <div className="flex items-center space-x-1 text-purple-200 text-[9.5px] font-bold uppercase tracking-wider">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dana Masuk</span>
            </div>
            <div className="font-bold text-white text-xs sm:text-sm mt-0.5">
              +{formatRupiahShort(totalDanaMasuk)}
            </div>
          </div>

          {/* Pengeluaran Bulanan */}
          <div className="bg-purple-950/60 dark:bg-purple-950/80 p-2 sm:p-2.5 rounded-xl border border-rose-400/30 hover:border-rose-400/50 transition">
            <div className="flex items-center space-x-1 text-rose-300 text-[9.5px] font-bold uppercase tracking-wider">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Pengeluaran</span>
            </div>
            <div className="font-bold text-rose-200 text-xs sm:text-sm mt-0.5">
              -{formatRupiahShort(totalRealisasi)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

