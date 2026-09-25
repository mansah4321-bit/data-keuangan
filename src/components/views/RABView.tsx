import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RABItem } from '../../types';
import {
  formatRupiah,
  getStatusColor,
  formatDateIndo,
  MONTH_NAMES,
} from '../../utils/formatters';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles,
} from 'lucide-react';

export const RABView: React.FC = () => {
  const {
    filter,
    currentMonthRAB,
    kategoriList,
    deleteRAB,
    setEditingRAB,
    setIsAddRABModalOpen,
    setEditingPengeluaran,
    copyRABFromPreviousMonth,
    pengeluaranList,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');
  const [expandedRabId, setExpandedRabId] = useState<string | null>(null);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  // Filtered list
  const filteredRAB = useMemo(() => {
    return currentMonthRAB.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'SEMUA' || item.kategori === selectedCategory || item.kode === selectedCategory;

      const matchStatus =
        selectedStatus === 'SEMUA' || item.status === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [currentMonthRAB, searchQuery, selectedCategory, selectedStatus]);

  const handleDelete = (rab: RABItem, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRAB(rab.id);
  };

  const handleCopyPrevMonth = () => {
    const count = copyRABFromPreviousMonth();
    if (count > 0) {
      setCopySuccessMsg(`Berhasil menduplikasi ${count} pos RAB dari bulan sebelumnya!`);
      setTimeout(() => setCopySuccessMsg(''), 3000);
    } else {
      alert('Tidak ditemukan data pos RAB pada bulan sebelumnya.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRabId(expandedRabId === id ? null : id);
  };

  return (
    <div className="space-y-3 pb-24 pt-1">
      {/* Search & Category Filter Bar */}
      <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-3 sm:p-3.5 shadow-xs border border-purple-100 dark:border-purple-900/40 space-y-2 transition-colors">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kegiatan, kode, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] sm:text-xs font-medium bg-purple-50/40 dark:bg-[#1f1240] border border-purple-100 dark:border-purple-900/50 rounded-xl pl-8 pr-7 py-1.5 sm:py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
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

        {/* Filter Pills (Category) */}
        <div className="flex space-x-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('SEMUA')}
            className={`px-2.5 py-0.5 rounded-full whitespace-nowrap text-[9.5px] sm:text-[10px] font-bold border transition ${
              selectedCategory === 'SEMUA'
                ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-violet-600 shadow-xs shadow-violet-500/25'
                : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-900/50 hover:bg-violet-50 dark:hover:bg-purple-900/40'
            }`}
          >
            Semua Kategori
          </button>
          {kategoriList.map((cat) => (
            <button
              key={cat.kode}
              onClick={() => setSelectedCategory(cat.kategori)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap text-[9.5px] sm:text-[10px] font-bold border transition ${
                selectedCategory === cat.kategori
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-violet-600 shadow-xs shadow-violet-500/25'
                  : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-900/50 hover:bg-violet-50 dark:hover:bg-purple-900/40'
              }`}
            >
              {cat.kategori}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex space-x-1 pt-1 border-t border-purple-50 dark:border-purple-900/30">
          {(['SEMUA', 'Aman', 'Mendekati Batas', 'Melebihi Anggaran'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`flex-1 py-1 px-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold text-center transition ${
                selectedStatus === st
                  ? 'bg-purple-950 dark:bg-violet-700 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-[#1a1038] text-slate-500 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-900/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {copySuccessMsg && (
        <div className="p-2 bg-violet-50 dark:bg-purple-950/60 border border-violet-200 dark:border-violet-700 text-violet-900 dark:text-violet-200 text-[11px] sm:text-xs rounded-xl font-medium flex items-center space-x-1.5 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
          <span>{copySuccessMsg}</span>
        </div>
      )}

      {/* Floating Add RAB Bar & Duplicate Option */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] sm:text-xs font-bold text-violet-950 dark:text-purple-200 uppercase tracking-wider">
          RAB {MONTH_NAMES[filter.bulan - 1]} ({filteredRAB.length})
        </span>
        <div className="flex items-center space-x-1.5">
          {currentMonthRAB.length === 0 && (
            <button
              onClick={handleCopyPrevMonth}
              className="bg-violet-50 dark:bg-[#1a1038] hover:bg-violet-100 text-violet-800 dark:text-purple-200 text-[10.5px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-violet-200 dark:border-purple-900/50 flex items-center space-x-1 transition active:scale-95"
            >
              <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Salin Bulan Lalu</span>
            </button>
          )}
          <button
            onClick={() => setIsAddRABModalOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-[10.5px] sm:text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xs shadow-violet-600/20 flex items-center space-x-1 sm:space-x-1.5 transition active:scale-95"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Tambah Pos RAB</span>
          </button>
        </div>
      </div>

      {/* RAB Cards List */}
      {filteredRAB.length === 0 ? (
        <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-6 sm:p-8 text-center border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-2.5 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 flex items-center justify-center mx-auto border border-violet-100 dark:border-violet-800">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
              Belum ada Pos RAB untuk {MONTH_NAMES[filter.bulan - 1]} {filter.tahun}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-purple-300 mt-0.5 max-w-xs mx-auto">
              Setiap bulan memiliki perencanaan anggaran mandiri yang dimulai segar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1.5">
            <button
              onClick={handleCopyPrevMonth}
              className="w-full sm:w-auto bg-slate-50 dark:bg-[#1a1038] hover:bg-violet-50 text-slate-700 dark:text-purple-200 text-[11px] sm:text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-900/50 flex items-center justify-center space-x-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Salin dari Bulan Lalu</span>
            </button>
            <button
              onClick={() => setIsAddRABModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-[11px] sm:text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pos RAB Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRAB.map((rab) => {
            const colors = getStatusColor(rab.status);
            const percentage =
              rab.anggaran > 0 ? Math.round((rab.realisasi / rab.anggaran) * 100) : 0;
            const isExpanded = expandedRabId === rab.id;
            const relatedExpenses = pengeluaranList.filter((exp) => exp.rabId === rab.id);

            return (
              <div
                key={rab.id}
                className="bg-white dark:bg-[#140b2b] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs border border-purple-100 dark:border-purple-900/40 transition duration-200 hover:border-violet-300 dark:hover:border-violet-700"
              >
                {/* Header Card: Kode, Kategori & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/80 px-1.5 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                      {rab.kode}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-purple-300 truncate max-w-[150px] sm:max-w-[200px]">
                      {rab.kategori}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.bg}`}
                  >
                    {rab.status} ({percentage}%)
                  </span>
                </div>

                {/* Kegiatan Title */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {rab.kegiatan}
                </h3>

                {rab.keterangan && (
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-purple-300 mt-0.5 leading-relaxed">
                    {rab.keterangan}
                  </p>
                )}

                {/* Anggaran vs Realisasi Progress Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-purple-900/40">
                  <div className="flex justify-between items-center text-[10.5px] sm:text-xs mb-1">
                    <span className="text-slate-400 dark:text-purple-300 text-[10px] sm:text-[11px]">Realisasi Pengeluaran</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold">{formatRupiah(rab.realisasi)}</span>{' '}
                      <span className="text-slate-400 dark:text-purple-300 font-normal">/ {formatRupiah(rab.anggaran)}</span>
                    </span>
                  </div>

                  <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-[#1f1240] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  {/* Sisa Anggaran */}
                  <div className="mt-2 flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-500 dark:text-purple-300 font-medium">Sisa Anggaran:</span>
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        rab.sisa < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-violet-800 dark:text-violet-300'
                      }`}
                    >
                      {formatRupiah(rab.sisa)}
                    </span>
                  </div>
                </div>

                {/* Action Row & Expand Details */}
                <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-between text-[11px] sm:text-xs">
                  <button
                    onClick={() => toggleExpand(rab.id)}
                    className="text-violet-700 dark:text-violet-300 font-bold hover:underline flex items-center space-x-1 text-[10px] sm:text-[11px]"
                  >
                    <span>{relatedExpenses.length} Transaksi</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </button>

                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <button
                      onClick={() => setEditingRAB(rab)}
                      className="p-1 sm:p-1.5 rounded-lg bg-violet-50 dark:bg-[#1f1240] hover:bg-violet-100 text-violet-700 dark:text-violet-300 transition"
                      title="Edit Pos RAB"
                    >
                      <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(rab, e)}
                      className="p-1 sm:p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition"
                      title="Hapus Pos RAB"
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details: List of linked expenses */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-purple-900/40 space-y-1.5 animate-in fade-in">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-purple-300 uppercase tracking-wider mb-1">
                      Rincian Pengeluaran Terkait
                    </div>

                    {relatedExpenses.length === 0 ? (
                      <p className="text-[10px] text-slate-400 dark:text-purple-300 italic py-0.5">
                        Belum ada transaksi pengeluaran yang dicatat untuk pos ini.
                      </p>
                    ) : (
                      relatedExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          onClick={() => setEditingPengeluaran(exp)}
                          className="p-2 bg-slate-50 dark:bg-[#1a1038] rounded-lg sm:rounded-xl text-[11px] sm:text-xs flex justify-between items-center cursor-pointer hover:bg-violet-50/50 dark:hover:bg-purple-900/40 transition border border-slate-100 dark:border-purple-900/50"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                              {exp.keterangan}
                            </div>
                            <div className="text-[9.5px] text-slate-400 dark:text-purple-300 mt-0.5">
                              {formatDateIndo(exp.tanggal)} {exp.penerima ? `• ${exp.penerima}` : ''}
                            </div>
                          </div>
                          <span className="font-extrabold text-rose-600 dark:text-rose-400 ml-2">
                            -{formatRupiah(exp.nominal)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
