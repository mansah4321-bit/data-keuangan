import { BudgetStatus } from '../types';

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const formatRupiah = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRupiahShort = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)} Rb`;
  }
  return `${sign}${abs}`;
};

export const parseNumberInput = (value: string): number => {
  const clean = value.replace(/[^0-9-]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${MONTH_NAMES[month]?.slice(0, 3) || ''} ${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]?.slice(0, 3)} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const calculateBudgetStatus = (anggaran: number, realisasi: number): BudgetStatus => {
  if (anggaran <= 0) return realisasi > 0 ? 'Melebihi Anggaran' : 'Aman';
  const percentage = (realisasi / anggaran) * 100;
  if (percentage > 100) return 'Melebihi Anggaran';
  if (percentage >= 80) return 'Mendekati Batas';
  return 'Aman';
};

export const getStatusColor = (status: BudgetStatus) => {
  switch (status) {
    case 'Aman':
      return {
        bg: 'bg-violet-100 text-violet-900 border-violet-200 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-800',
        badge: 'bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold shadow-xs',
        dot: 'bg-violet-600 dark:bg-violet-400',
        bar: 'bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600',
        text: 'text-violet-800 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800',
        lightBg: 'bg-violet-50 dark:bg-violet-950/40',
      };
    case 'Mendekati Batas':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700',
        badge: 'bg-amber-500 text-white font-bold',
        dot: 'bg-amber-500',
        bar: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        text: 'text-amber-800 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
        lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      };
    case 'Melebihi Anggaran':
      return {
        bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700',
        badge: 'bg-rose-600 text-white font-bold',
        dot: 'bg-rose-500',
        bar: 'bg-gradient-to-r from-rose-600 to-red-600',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-700',
        lightBg: 'bg-rose-50 dark:bg-rose-950/40',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
        badge: 'bg-slate-700 text-white',
        dot: 'bg-slate-500',
        bar: 'bg-slate-500',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        lightBg: 'bg-slate-50 dark:bg-slate-900',
      };
  }
};

export const generateRABId = (bulan: number, tahun: number, existingCount: number = 0): string => {
  const m = String(bulan).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(3, '0');
  return `RAB-${tahun}-${m}-${seq}`;
};

export const generateExpenseId = (bulan: number, tahun: number, existingCount: number = 0): string => {
  const m = String(bulan).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(3, '0');
  return `EXP-${tahun}-${m}-${seq}`;
};

export const generateDanaMasukId = (bulan: number, tahun: number, existingCount: number = 0): string => {
  const m = String(bulan).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(3, '0');
  return `IN-${tahun}-${m}-${seq}`;
};
