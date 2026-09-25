import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES } from '../utils/formatters';
import { Calendar, Clock, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface PeriodSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeriodSelectorModal: React.FC<PeriodSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    filter,
    setFilterMonth,
    setFilterYear,
    goToCurrentRealtimeMonth,
  } = useApp();

  if (!isOpen) return null;

  const activeYear = filter.tahun || new Date().getFullYear();
  // Generate 5 quick year pills around activeYear
  const yearPills = [activeYear - 2, activeYear - 1, activeYear, activeYear + 1, activeYear + 2];

  // Year options for dropdown (2020 to 2050 or expanded range)
  const currentRealYear = new Date().getFullYear();
  const dropdownYears = Array.from({ length: 41 }, (_, i) => currentRealYear - 10 + i);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#140b2b] rounded-3xl w-full max-w-sm p-4 sm:p-5 shadow-2xl border border-purple-100 dark:border-purple-900/60 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 flex items-center justify-center border border-violet-200 dark:border-violet-800">
              <Calendar className="w-4 h-4 text-violet-700 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                Pilih Periode Pembukuan
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-purple-300">Bisa digunakan jangka panjang selamanya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-violet-50 dark:hover:bg-purple-900/40 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Year Selector with Infinite Prev/Next & Custom Direct Select/Input */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-purple-300 uppercase tracking-wider">
              Pilih Tahun Pembukuan
            </label>
            <div className="flex items-center space-x-1.5">
              {/* Direct Year TextInput */}
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={4}
                value={activeYear || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  if (!isNaN(val)) {
                    setFilterYear(val);
                  } else {
                    setFilterYear(0);
                  }
                }}
                className="w-14 text-center text-xs font-extrabold bg-slate-50 dark:bg-[#1a1038] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-purple-800 rounded-lg px-1 py-0.5 focus:outline-none"
                placeholder="Ketik"
              />
              {/* Direct Year Dropdown Select */}
              <select
                value={activeYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value, 10))}
                className="text-[11px] font-extrabold bg-purple-50 dark:bg-[#1a1038] text-violet-800 dark:text-violet-300 border border-purple-200 dark:border-purple-800 rounded-lg px-1.5 py-0.5 focus:outline-none"
              >
                {dropdownYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Year Navigator Bar with Prev/Next buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilterYear(activeYear - 1)}
              title="Tahun Sebelumnya"
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#1a1038] hover:bg-violet-100 dark:hover:bg-purple-900/60 text-slate-600 dark:text-purple-200 border border-slate-200/80 dark:border-purple-900/50 transition flex-shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="grid grid-cols-5 gap-1 flex-1">
              {yearPills.map((y) => (
                <button
                  key={y}
                  onClick={() => setFilterYear(y)}
                  className={`py-1.5 rounded-xl text-[11px] font-extrabold transition-all text-center ${
                    filter.tahun === y
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm shadow-violet-600/30'
                      : 'bg-slate-50 dark:bg-[#1a1038] text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-purple-900/40 border border-slate-200/80 dark:border-purple-900/50'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilterYear(activeYear + 1)}
              title="Tahun Berikutnya"
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#1a1038] hover:bg-violet-100 dark:hover:bg-purple-900/60 text-slate-600 dark:text-purple-200 border border-slate-200/80 dark:border-purple-900/50 transition flex-shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Month Grid */}
        <div className="mt-3.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-purple-300 uppercase tracking-wider block mb-1.5 px-0.5">
            Pilih Bulan Pembukuan
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_NAMES.map((name, idx) => {
              const m = idx + 1;
              const isSelected = filter.bulan === m;
              const isCurrent =
                m === new Date().getMonth() + 1 && filter.tahun === new Date().getFullYear();

              return (
                <button
                  key={name}
                  onClick={() => {
                    setFilterMonth(m);
                    onClose();
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all relative flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-violet-600/30 font-bold border border-violet-400/40'
                      : 'bg-slate-50 dark:bg-[#1a1038] text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-purple-900/40 border border-slate-200/80 dark:border-purple-900/50'
                  }`}
                >
                  <span>{name}</span>
                  {isSelected && <Check className="w-3 h-3 text-violet-200 inline" />}
                  {isCurrent && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute top-1.5 right-1.5 shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions at Bottom */}
        <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/40 flex justify-between items-center">
          <button
            onClick={() => {
              goToCurrentRealtimeMonth();
              onClose();
            }}
            className="text-xs text-violet-700 dark:text-violet-300 font-bold hover:text-violet-900 dark:hover:text-white flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl hover:bg-violet-50 dark:hover:bg-purple-900/40 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bulan Ini (Realtime)</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 dark:bg-purple-900/80 dark:hover:bg-purple-800 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
