import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { parseNumberInput } from '../utils/formatters';
import {
  X,
  Plus,
  Calendar,
  Check,
  Tag,
  Camera,
  Trash2,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

export const AddEditPengeluaranModal: React.FC = () => {
  const {
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
    isAddDanaMasukModalOpen,
    setIsAddDanaMasukModalOpen,
    editingPengeluaran,
    setEditingPengeluaran,
    editingDanaMasuk,
    setEditingDanaMasuk,
    kategoriList,
    addKategori,
    updateKategori,
    deleteKategori,
    addPengeluaran,
    updatePengeluaran,
    addDanaMasuk,
    updateDanaMasuk,
    filter,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // Transaction type: 'PENGELUARAN' or 'PEMASUKAN'
  const [transactionType, setTransactionType] = useState<'PENGELUARAN' | 'PEMASUKAN'>('PENGELUARAN');

  // Shared / Primary Fields
  const [tanggal, setTanggal] = useState(todayStr);
  const [nominalInput, setNominalInput] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [bukti, setBukti] = useState('');

  // Category Management State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryCode, setEditingCategoryCode] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const isOpen = isAddExpenseModalOpen || isAddDanaMasukModalOpen || !!editingPengeluaran || !!editingDanaMasuk;

  // Active categories list
  const activeCategories = useMemo(() => {
    return kategoriList.filter((k) => k.status === 'Aktif');
  }, [kategoriList]);

  // Nominal parsed
  const parsedNominal = useMemo(() => {
    return parseNumberInput(nominalInput);
  }, [nominalInput]);

  // Initialize form state
  useEffect(() => {
    if (editingDanaMasuk) {
      setTransactionType('PEMASUKAN');
      setTanggal(editingDanaMasuk.tanggal || todayStr);
      setNominalInput(editingDanaMasuk.nominal ? editingDanaMasuk.nominal.toString() : '');
      setSelectedKategori(editingDanaMasuk.sumber || 'Pencairan Anggaran RAB');
      setKeterangan(editingDanaMasuk.keterangan || '');
      setBukti('');
    } else if (editingPengeluaran) {
      setTransactionType('PENGELUARAN');
      setTanggal(editingPengeluaran.tanggal || todayStr);
      setNominalInput(editingPengeluaran.nominal ? editingPengeluaran.nominal.toString() : '');
      setSelectedKategori(editingPengeluaran.kategori || '');
      setKeterangan(editingPengeluaran.keterangan || '');
      setBukti(editingPengeluaran.bukti || '');
    } else if (isAddDanaMasukModalOpen) {
      setTransactionType('PEMASUKAN');
      setTanggal(todayStr);
      setNominalInput('');
      setSelectedKategori(activeCategories[0]?.kategori || 'Pencairan Anggaran RAB');
      setKeterangan('');
      setBukti('');
    } else if (isAddExpenseModalOpen) {
      setTransactionType('PENGELUARAN');
      setTanggal(todayStr);
      setNominalInput('');
      setSelectedKategori(activeCategories[0]?.kategori || '');
      setKeterangan('');
      setBukti('');
    }
    setErrorMsg('');
    setIsAddingCategory(false);
    setEditingCategoryCode(null);
  }, [
    editingPengeluaran,
    editingDanaMasuk,
    isAddExpenseModalOpen,
    isAddDanaMasukModalOpen,
    activeCategories,
    todayStr,
  ]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAddExpenseModalOpen(false);
    setIsAddDanaMasukModalOpen(false);
    setEditingPengeluaran(null);
    setEditingDanaMasuk(null);
    setErrorMsg('');
    setIsAddingCategory(false);
    setEditingCategoryCode(null);
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseNumberInput(e.target.value);
    setNominalInput(num === 0 ? '' : num.toString());
  };

  // Add Category Handler
  const handleSaveNewCategory = () => {
    const trimmed = categoryNameInput.trim();
    if (!trimmed) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }
    const exists = kategoriList.some(
      (k) => k.kategori.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const nextCode = `KAT-${String(Date.now()).slice(-4)}`;
      addKategori({
        kode: nextCode,
        kategori: trimmed,
        status: 'Aktif',
      });
    }
    setSelectedKategori(trimmed);
    setCategoryNameInput('');
    setIsAddingCategory(false);
    setErrorMsg('');
  };

  // Edit Category Handler
  const handleSaveEditCategory = () => {
    const trimmed = categoryNameInput.trim();
    if (!trimmed || !editingCategoryCode) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }
    updateKategori(editingCategoryCode, { kategori: trimmed });
    if (selectedKategori) {
      const currentEditing = activeCategories.find((c) => c.kode === editingCategoryCode);
      if (currentEditing && currentEditing.kategori === selectedKategori) {
        setSelectedKategori(trimmed);
      }
    }
    setCategoryNameInput('');
    setEditingCategoryCode(null);
    setErrorMsg('');
  };

  // Delete Category Handler
  const handleDeleteCategory = (catName: string, catCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteKategori(catCode);
    if (selectedKategori === catName) {
      const remaining = activeCategories.filter((c) => c.kode !== catCode);
      setSelectedKategori(remaining[0]?.kategori || '');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Ukuran file bukti maksimal 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBukti(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tanggal) {
      setErrorMsg('Pilih tanggal transaksi.');
      return;
    }

    if (parsedNominal <= 0) {
      setErrorMsg('Nominal transaksi harus lebih besar dari Rp 0.');
      return;
    }

    const [y, m] = tanggal.split('-').map(Number);
    const monthNum = m || filter.bulan;
    const yearNum = y || filter.tahun;

    if (transactionType === 'PEMASUKAN') {
      const sumber = selectedKategori.trim() || 'Pencairan Anggaran RAB';
      if (editingDanaMasuk) {
        updateDanaMasuk(editingDanaMasuk.id, {
          tanggal,
          bulan: monthNum,
          tahun: yearNum,
          sumber,
          nominal: parsedNominal,
          keterangan: keterangan.trim(),
        });
      } else {
        addDanaMasuk({
          tanggal,
          bulan: monthNum,
          tahun: yearNum,
          sumber,
          nominal: parsedNominal,
          keterangan: keterangan.trim(),
        });
      }
    } else {
      // PENGELUARAN
      if (!selectedKategori.trim()) {
        setErrorMsg('Pilih atau buat kategori pengeluaran terlebih dahulu.');
        return;
      }

      if (editingPengeluaran) {
        updatePengeluaran(editingPengeluaran.id, {
          tanggal,
          nominal: parsedNominal,
          kategori: selectedKategori,
          keterangan: keterangan.trim() || selectedKategori,
          bukti,
        });
      } else {
        addPengeluaran({
          tanggal,
          nominal: parsedNominal,
          kategori: selectedKategori,
          keterangan: keterangan.trim() || selectedKategori,
          bukti,
        });
      }
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#150a26] text-slate-800 dark:text-white rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800/60 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-purple-100 dark:border-purple-900/40 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-violet-50/30 dark:from-[#1b0d33] dark:to-[#170a2c]">
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <span>
              {editingPengeluaran || editingDanaMasuk ? 'Edit Transaksi' : 'Catat Transaksi'}
            </span>
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Toggle Type: PENGELUARAN / PEMASUKAN */}
          {!editingPengeluaran && !editingDanaMasuk && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-purple-50 dark:bg-[#1f103c] rounded-2xl border border-purple-100 dark:border-purple-900/40">
              <button
                type="button"
                onClick={() => setTransactionType('PENGELUARAN')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
                  transactionType === 'PENGELUARAN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('PEMASUKAN')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
                  transactionType === 'PEMASUKAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Pemasukan</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 font-bold text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. Tanggal Transaksi */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-purple-200 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span>Tanggal</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1f103c] border border-purple-100 dark:border-purple-900/50 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* 2. Nominal Transaksi & Kamera Upload Bukti */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-purple-200 flex items-center justify-between">
              <span>Nominal (Rp)</span>
              {parsedNominal > 0 && (
                <span className={`font-black text-xs ${
                  transactionType === 'PEMASUKAN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  Rp {parsedNominal.toLocaleString('id-ID')}
                </span>
              )}
            </label>
            
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Masukkan nominal"
                value={nominalInput}
                onChange={handleNominalChange}
                className="flex-1 bg-slate-50 dark:bg-[#1f103c] border border-purple-100 dark:border-purple-900/50 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 placeholder-slate-400"
              />

              {transactionType === 'PENGELUARAN' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition flex-shrink-0 relative ${
                      bukti
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#1f103c] text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900/50 hover:border-violet-400'
                    }`}
                    title={bukti ? 'Bukti nota terunggah (Klik untuk ubah)' : 'Ambil / Upload Foto Nota'}
                  >
                    <Camera className="w-5 h-5" />
                    {bukti && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#150a26]" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Preview Nota Ringkas Jika Ada Foto */}
            {transactionType === 'PENGELUARAN' && bukti && (
              <div className="flex items-center justify-between bg-violet-50/70 dark:bg-violet-950/40 p-2 rounded-xl border border-violet-200/60 dark:border-violet-900/40 mt-1">
                <div className="flex items-center space-x-2">
                  <img src={bukti} alt="Preview Bukti" className="w-8 h-8 object-cover rounded-lg border border-purple-200 dark:border-purple-800" />
                  <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">Foto nota terlampir</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBukti('')}
                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition text-[10px] font-bold"
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>

          {/* 3. Kategori Transaksi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-purple-200 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-500" />
                <span>Kategori Transaksi</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(true);
                  setEditingCategoryCode(null);
                  setCategoryNameInput('');
                }}
                className="text-[11px] text-violet-600 dark:text-violet-400 font-extrabold flex items-center space-x-1 hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            {/* Input Tambah/Edit Kategori Baru */}
            {(isAddingCategory || editingCategoryCode) && (
              <div className="p-2.5 bg-violet-50/60 dark:bg-[#20113f] border border-violet-200 dark:border-violet-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 block">
                  {editingCategoryCode ? 'Edit Nama Kategori' : 'Buat Kategori Baru'}
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nama Kategori..."
                    value={categoryNameInput}
                    onChange={(e) => setCategoryNameInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#150a26] border border-purple-200 dark:border-purple-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={editingCategoryCode ? handleSaveEditCategory : handleSaveNewCategory}
                    className="bg-violet-600 text-white font-bold px-3 py-1 rounded-lg text-xs hover:bg-violet-700"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setEditingCategoryCode(null);
                    }}
                    className="bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-white font-bold px-2 py-1 rounded-lg text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Grid Pill Kategori (Sama Antara Pemasukan & Pengeluaran) */}
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-[#1a0f35] rounded-xl border border-purple-100 dark:border-purple-900/40">
              {activeCategories.map((cat) => {
                const isSelected = selectedKategori === cat.kategori;
                return (
                  <div
                    key={cat.kode}
                    onClick={() => setSelectedKategori(cat.kategori)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer border text-[11px] font-bold transition ${
                      isSelected
                        ? transactionType === 'PEMASUKAN'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-white dark:bg-[#150a26] text-slate-700 dark:text-purple-200 border-slate-200 dark:border-purple-800/60 hover:border-violet-400'
                    }`}
                  >
                    <span className="truncate flex-1 pr-1">{cat.kategori}</span>
                    <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategoryCode(cat.kode);
                          setCategoryNameInput(cat.kategori);
                        }}
                        className="p-1 text-slate-400 hover:text-white bg-black/10 rounded"
                        title="Edit Kategori"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCategory(cat.kategori, cat.kode, e)}
                        className="p-1 text-rose-400 hover:text-rose-200 bg-black/10 rounded"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Keterangan Rincian */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-purple-200">
              Keterangan Transaksi
            </label>
            <input
              type="text"
              placeholder={transactionType === 'PEMASUKAN' ? 'Keterangan pemasukan' : 'Keterangan pengeluaran'}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1f103c] border border-purple-100 dark:border-purple-900/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 placeholder-slate-400"
            />
          </div>



          {/* Tombol Simpan */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 ${
                transactionType === 'PEMASUKAN'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/25'
                  : 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-violet-600/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {editingPengeluaran || editingDanaMasuk
                  ? 'Simpan Perubahan'
                  : transactionType === 'PEMASUKAN'
                  ? 'Simpan Pemasukan'
                  : 'Simpan Pengeluaran'}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
