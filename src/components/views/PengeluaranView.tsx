import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PengeluaranItem, DanaMasukItem } from '../../types';
import {
  formatRupiah,
  formatDateIndo,
} from '../../utils/formatters';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Calendar,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const PengeluaranView: React.FC = () => {
  const {
    currentMonthPengeluaran,
    currentMonthDanaMasuk,
    kategoriList,
    deletePengeluaran,
    deleteDanaMasuk,
    setEditingPengeluaran,
    setEditingDanaMasuk,
    setIsAddExpenseModalOpen,
    setSelectedProofUrl,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN'>('SEMUA');
  const [selectedDetailExpense, setSelectedDetailExpense] = useState<PengeluaranItem | null>(null);
  const [selectedDetailIncome, setSelectedDetailIncome] = useState<DanaMasukItem | null>(null);

  const handleDeleteExpense = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deletePengeluaran(id);
    if (selectedDetailExpense?.id === id) {
      setSelectedDetailExpense(null);
    }
  };

  const handleDeleteIncome = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteDanaMasuk(id);
    if (selectedDetailIncome?.id === id) {
      setSelectedDetailIncome(null);
    }
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (transactionTypeFilter === 'PEMASUKAN') return [];
    return currentMonthPengeluaran.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.penerima && item.penerima.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'SEMUA' || item.kategori === selectedCategory || item.kode === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [currentMonthPengeluaran, searchQuery, selectedCategory, transactionTypeFilter]);

  // Filtered income
  const filteredIncome = useMemo(() => {
    if (transactionTypeFilter === 'PENGELUARAN') return [];
    return currentMonthDanaMasuk.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.sumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === 'SEMUA' || item.sumber === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [currentMonthDanaMasuk, searchQuery, selectedCategory, transactionTypeFilter]);

  const totalFilteredExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  }, [filteredExpenses]);

  const totalFilteredIncome = useMemo(() => {
    return filteredIncome.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  }, [filteredIncome]);

  // Combined and sorted transactions list for unified view
  const combinedTransactions = useMemo(() => {
    const expensesWithtype = filteredExpenses.map((exp) => ({
      ...exp,
      type: 'pengeluaran' as const,
      sortDate: exp.tanggal,
    }));
    const incomeWithType = filteredIncome.map((inc) => ({
      ...inc,
      type: 'pemasukan' as const,
      sortDate: inc.tanggal,
      kegiatan: inc.sumber,
    }));

    const combined = [...expensesWithtype, ...incomeWithType];
    return combined.sort((a, b) => (b.sortDate > a.sortDate ? 1 : -1));
  }, [filteredExpenses, filteredIncome]);

  return (
    <div className="space-y-4 pb-24 pt-1">
      
      {/* 1. HEADER RINGKAS & BERSIH (MUTASI KEUANGAN + TUGAS TAMBAH) */}
      <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-3 sm:p-4 shadow-xs border border-purple-100 dark:border-purple-900/40 space-y-2.5 transition-colors">
        
        {/* Baris Total & Tombol Single (+) Catat Transaksi */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-purple-50 dark:border-purple-900/30">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1">
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-purple-300 uppercase tracking-wider block">
                Total Pemasukan
              </span>
              <span className="text-xs sm:text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                +{formatRupiah(totalFilteredIncome)}
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-purple-300 uppercase tracking-wider block">
                Total Pengeluaran
              </span>
              <span className="text-xs sm:text-sm md:text-base font-black text-rose-600 dark:text-rose-400 tracking-tight">
                -{formatRupiah(totalFilteredExpense)}
              </span>
            </div>
          </div>

          {/* Single Icon (+) Catat Transaksi di samping total */}
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="group relative inline-flex items-center justify-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-purple-600/30 hover:shadow-lg hover:shadow-purple-600/40 border border-white/20 active:scale-95 transition-all duration-200 flex-shrink-0"
            title="Catat Transaksi"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-white/20 dark:bg-white/15 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition duration-200">
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3]" />
            </div>
            <span className="text-[11px] sm:text-xs tracking-tight font-black">Catat</span>
          </button>
        </div>

        {/* Search Input Bersih */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari transaksi, keterangan, sumber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] sm:text-xs font-semibold bg-purple-50/40 dark:bg-[#1f1240] border border-purple-100 dark:border-purple-900/50 rounded-xl pl-8 pr-7 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tipe Transaksi (Semua / Pemasukan / Pengeluaran) */}
        <div className="flex space-x-1">
          {(['SEMUA', 'PEMASUKAN', 'PENGELUARAN'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTransactionTypeFilter(type)}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold text-center transition ${
                transactionTypeFilter === type
                  ? 'bg-purple-950 dark:bg-violet-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-900/40'
              }`}
            >
              {type === 'SEMUA' ? 'Semua' : type === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>

        {/* Filter Kategori Singkat */}
        {kategoriList.length > 0 && (
          <div className="flex space-x-1 overflow-x-auto pb-0.5 text-xs no-scrollbar pt-1 border-t border-purple-50 dark:border-purple-900/30">
            <button
              onClick={() => setSelectedCategory('SEMUA')}
              className={`px-2.5 py-0.5 rounded-md whitespace-nowrap text-[9.5px] sm:text-[10px] font-bold border transition ${
                selectedCategory === 'SEMUA'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-900/50'
              }`}
            >
              Semua Kategori
            </button>
            {kategoriList.map((cat) => {
              const isSelected = selectedCategory === cat.kategori || selectedCategory === cat.kode;
              return (
                <button
                  key={cat.kode}
                  onClick={() => setSelectedCategory(cat.kategori)}
                  className={`px-2.5 py-0.5 rounded-md whitespace-nowrap text-[9.5px] sm:text-[10px] font-bold transition border ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-white dark:bg-[#1a1038] text-slate-700 dark:text-purple-200 border-slate-200 dark:border-purple-900/50'
                  }`}
                >
                  {cat.kategori}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. DAFTAR TRANSAKSI (PENGELUARAN & PEMASUKAN) */}
      {combinedTransactions.length === 0 ? (
        <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-6 sm:p-8 text-center border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-2 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 flex items-center justify-center mx-auto border border-violet-100 dark:border-violet-800">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              Belum ada data transaksi
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-purple-300 mt-0.5 max-w-xs mx-auto">
              Klik tombol (+) di atas untuk mencatat pemasukan atau pengeluaran dana.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {combinedTransactions.map((item) => {
            const isIncome = item.type === 'pemasukan';
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isIncome) {
                    setSelectedDetailIncome(item as DanaMasukItem);
                  } else {
                    setSelectedDetailExpense(item as PengeluaranItem);
                  }
                }}
                className="bg-white dark:bg-[#140b2b] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-2xs border border-purple-100 dark:border-purple-900/40 hover:border-violet-300 dark:hover:border-violet-700 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-1.5">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[8.5px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200'
                      }`}>
                        {isIncome ? 'Pemasukan' : item.kategori}
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-purple-300">
                        {formatDateIndo(item.tanggal)}
                      </span>
                    </div>
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {isIncome ? (item as DanaMasukItem).sumber : (item as PengeluaranItem).keterangan}
                    </h4>
                    {isIncome && (item as DanaMasukItem).keterangan && (
                      <p className="text-[9.5px] text-slate-400 dark:text-purple-300 truncate">
                        {(item as DanaMasukItem).keterangan}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                  <span className={`text-[11px] sm:text-xs md:text-sm font-extrabold ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isIncome ? '+' : '-'}{formatRupiah(item.nominal)}
                  </span>

                  {/* Tombol Hapus Langsung di Baris Transaksi */}
                  <button
                    onClick={(e) => {
                      if (isIncome) {
                        handleDeleteIncome(item.id, e);
                      } else {
                        handleDeleteExpense(item.id, e);
                      }
                    }}
                    className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-rose-600 dark:text-purple-300 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MODAL DETAIL PENGELUARAN */}
      {selectedDetailExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#150f24] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-violet-100 dark:border-violet-900/60">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-violet-950">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detail Pengeluaran</h3>
              <button onClick={() => setSelectedDetailExpense(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-violet-950 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-violet-950">
                <span className="text-lg font-black text-rose-600">-{formatRupiah(selectedDetailExpense.nominal)}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedDetailExpense.keterangan}</p>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatDateIndo(selectedDetailExpense.tanggal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Kategori:</span>
                <span className="font-semibold text-violet-600 dark:text-violet-400">{selectedDetailExpense.kategori}</span>
              </div>
              {selectedDetailExpense.bukti && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Bukti Nota:</span>
                  <img
                    src={selectedDetailExpense.bukti}
                    alt="Bukti"
                    onClick={() => setSelectedProofUrl(selectedDetailExpense.bukti || null)}
                    className="w-full h-32 object-cover rounded-xl cursor-pointer border border-purple-200 dark:border-purple-800"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setEditingPengeluaran(selectedDetailExpense);
                    setSelectedDetailExpense(null);
                  }}
                  className="py-2 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteExpense(selectedDetailExpense.id)}
                  className="py-2 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DETAIL PEMASUKAN */}
      {selectedDetailIncome && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#150f24] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-violet-100 dark:border-violet-900/60">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-violet-950">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detail Pemasukan</h3>
              <button onClick={() => setSelectedDetailIncome(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-violet-950 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-100 dark:border-violet-950">
                <span className="text-lg font-black text-emerald-600">+{formatRupiah(selectedDetailIncome.nominal)}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedDetailIncome.sumber}</p>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatDateIndo(selectedDetailIncome.tanggal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Keterangan:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedDetailIncome.keterangan || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setEditingDanaMasuk(selectedDetailIncome);
                    setSelectedDetailIncome(null);
                  }}
                  className="py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteIncome(selectedDetailIncome.id)}
                  className="py-2 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
