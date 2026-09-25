import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, formatRupiah, parseNumberInput } from '../utils/formatters';
import { Layers, X, Plus, Pencil, Trash2, Calendar, Tag } from 'lucide-react';

export const AddEditRABModal: React.FC = () => {
  const {
    isAddRABModalOpen,
    setIsAddRABModalOpen,
    editingRAB,
    setEditingRAB,
    kategoriList,
    addKategori,
    updateKategori,
    deleteKategori,
    addRAB,
    updateRAB,
    filter,
  } = useApp();

  // Realtime date state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(todayStr);

  const [bulan, setBulan] = useState(filter.bulan);
  const [tahun, setTahun] = useState(filter.tahun);
  const [kode, setKode] = useState('');
  const [kategori, setKategori] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [volumeInput, setVolumeInput] = useState('1');
  const [hargaInput, setHargaInput] = useState('');
  const [anggaranInput, setAnggaranInput] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Category management inside modal
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Sub-category management inside modal
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');

  // Find selected category object
  const activeCatObj = kategoriList.find(
    (k) => k.kategori.toLowerCase() === kategori.toLowerCase() || k.kode === kode
  ) || kategoriList[0];

  // Populate when editing or opening
  useEffect(() => {
    if (editingRAB) {
      setBulan(editingRAB.bulan);
      setTahun(editingRAB.tahun);
      const defaultDay = editingRAB.createdAt ? editingRAB.createdAt.slice(0, 10) : '';
      if (defaultDay && defaultDay.length === 10) {
        setTanggal(defaultDay);
      } else {
        const mStr = String(editingRAB.bulan).padStart(2, '0');
        setTanggal(`${editingRAB.tahun}-${mStr}-01`);
      }
      setKode(editingRAB.kode);
      setKategori(editingRAB.kategori);
      setKegiatan(editingRAB.kegiatan);
      setVolumeInput('1');
      setHargaInput(editingRAB.anggaran.toString());
      setAnggaranInput(editingRAB.anggaran.toString());
      setKeterangan(editingRAB.keterangan || '');
    } else {
      const now = new Date();
      const currentRealtimeDate = now.toISOString().slice(0, 10);
      setTanggal(currentRealtimeDate);
      setBulan(filter.bulan || now.getMonth() + 1);
      setTahun(filter.tahun || now.getFullYear());
      const defaultCat = kategoriList[0];
      if (defaultCat) {
        setKode(defaultCat.kode);
        setKategori(defaultCat.kategori);
      } else {
        setKode('G101');
        setKategori('Keasramaan');
      }
      setKegiatan('');
      setVolumeInput('1');
      setHargaInput('');
      setAnggaranInput('');
      setKeterangan('');
    }
    setErrorMsg('');
    setIsAddingCategory(false);
    setNewCategoryInput('');
    setIsAddingSubCategory(false);
    setNewSubCategoryInput('');
  }, [editingRAB, isAddRABModalOpen, filter.bulan, filter.tahun, kategoriList]);

  if (!isAddRABModalOpen && !editingRAB) return null;

  const handleDateChange = (val: string) => {
    setTanggal(val);
    if (val) {
      const parts = val.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(y) && !isNaN(m)) {
          setTahun(y);
          setBulan(m);
        }
      }
    }
  };

  const handleKategoriChange = (catName: string) => {
    setKategori(catName);
    const found = kategoriList.find((k) => k.kategori === catName);
    if (found) {
      setKode(found.kode);
    }
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setErrorMsg('Nama kategori baru tidak boleh kosong.');
      return;
    }
    const exists = kategoriList.some((k) => k.kategori.toLowerCase() === trimmed.toLowerCase());
    const generatedCode = `KAT-${String(Date.now()).slice(-4)}`;
    if (!exists) {
      addKategori({
        kode: generatedCode,
        kategori: trimmed,
        status: 'Aktif',
        subKategori: [],
      });
    }
    setKategori(trimmed);
    setKode(generatedCode);
    setNewCategoryInput('');
    setIsAddingCategory(false);
    setErrorMsg('');
  };

  const handleAddSubCategory = () => {
    const trimmed = newSubCategoryInput.trim();
    if (!trimmed) return;
    if (!activeCatObj) return;

    const currentSubs = activeCatObj.subKategori || [];
    if (!currentSubs.includes(trimmed)) {
      const updatedSubs = [...currentSubs, trimmed];
      updateKategori(activeCatObj.kode, { subKategori: updatedSubs });
    }
    setKegiatan(trimmed);
    setNewSubCategoryInput('');
    setIsAddingSubCategory(false);
  };

  const handleDeleteSubCategory = (subName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCatObj) return;

    const currentSubs = activeCatObj.subKategori || [];
    const updatedSubs = currentSubs.filter((s) => s !== subName);
    updateKategori(activeCatObj.kode, { subKategori: updatedSubs });
    if (kegiatan === subName) {
      setKegiatan('');
    }
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseNumberInput(raw);
    setHargaInput(num === 0 ? '' : num.toString());
    const vol = parseFloat(volumeInput) || 1;
    const total = Math.round(vol * num);
    setAnggaranInput(total === 0 ? '' : total.toString());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setVolumeInput(raw);
    const vol = parseFloat(raw) || 0;
    const harga = parseNumberInput(hargaInput);
    const total = Math.round(vol * harga);
    setAnggaranInput(total === 0 ? '' : total.toString());
  };

  const handleAnggaranDirectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseNumberInput(e.target.value);
    setAnggaranInput(num === 0 ? '' : num.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAnggaran = parseNumberInput(anggaranInput);

    if (!kategori.trim()) {
      setErrorMsg('Kategori anggaran wajib diisi / dipilih.');
      return;
    }
    if (!kegiatan.trim()) {
      setErrorMsg('Sub Kategori / Nama kegiatan wajib diisi.');
      return;
    }
    if (numAnggaran <= 0) {
      setErrorMsg('Nominal anggaran harus lebih besar dari 0.');
      return;
    }

    // Auto add category if it doesn't exist
    const catFound = kategoriList.find((k) => k.kategori.toLowerCase() === kategori.trim().toLowerCase());
    const finalCode = catFound ? catFound.kode : (kode || `KAT-${String(Date.now()).slice(-4)}`);
    if (!catFound) {
      addKategori({
        kode: finalCode,
        kategori: kategori.trim(),
        status: 'Aktif',
        subKategori: [kegiatan.trim()],
      });
    } else {
      const currentSubs = catFound.subKategori || [];
      if (!currentSubs.includes(kegiatan.trim())) {
        updateKategori(catFound.kode, { subKategori: [...currentSubs, kegiatan.trim()] });
      }
    }

    if (editingRAB) {
      updateRAB(editingRAB.id, {
        bulan,
        tahun,
        kode: finalCode,
        kategori: kategori.trim(),
        kegiatan: kegiatan.trim(),
        anggaran: numAnggaran,
        keterangan: keterangan.trim(),
      });
    } else {
      addRAB({
        bulan,
        tahun,
        kode: finalCode,
        kategori: kategori.trim(),
        kegiatan: kegiatan.trim(),
        anggaran: numAnggaran,
        keterangan: keterangan.trim(),
        createdAt: `${tanggal}T08:00:00Z`,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddRABModalOpen(false);
    setEditingRAB(null);
  };

  const currentAnggaranNum = parseNumberInput(anggaranInput);
  const activeSubCategories = activeCatObj?.subKategori || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#150f24] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-violet-100 dark:border-violet-900/60 p-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 flex items-center justify-center border border-violet-200 dark:border-violet-800/60">
              <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {editingRAB ? 'Edit Pos RAB' : 'Tambah Pos RAB Baru'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-violet-300/70">Rencana Anggaran Biaya Kemahasantrian</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-violet-950/50 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          {/* Tanggal Real-Time & Periode */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block">
              Tanggal Pengajuan (Real-Time) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-violet-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-purple-300 px-1 pt-0.5">
              <span>Terdeteksi Periode:</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">
                {MONTH_NAMES[bulan - 1]} {tahun}
              </span>
            </div>
          </div>

          {/* Kategori Pengajuan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block">
                Kategori Pengajuan <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center space-x-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingCategory ? 'Pilih Dari Daftar' : 'Kategori Baru'}</span>
              </button>
            </div>

            {isAddingCategory ? (
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  placeholder="Ketik nama kategori baru..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 dark:bg-[#1e1533] border border-violet-300 dark:border-violet-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNewCategory}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Tambah
                </button>
              </div>
            ) : (
              <select
                value={kategori}
                onChange={(e) => handleKategoriChange(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {kategoriList.length === 0 && <option value="">-- Belum ada kategori (Ketik baru) --</option>}
                {kategoriList.map((c) => (
                  <option key={c.kode} value={c.kategori}>
                    [{c.kode}] {c.kategori}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sub Kategori / Nama Kegiatan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block">
                Sub Kategori / Nama Kegiatan <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingSubCategory(!isAddingSubCategory)}
                className="text-[11px] text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center space-x-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{isAddingSubCategory ? 'Batal' : 'Sub Kategori'}</span>
              </button>
            </div>

            {/* Input Tambah Sub Kategori Baru jika toggled */}
            {isAddingSubCategory && (
              <div className="flex space-x-1.5 p-2 bg-violet-50/70 dark:bg-[#1f1240] rounded-xl border border-violet-200 dark:border-violet-800/80">
                <input
                  type="text"
                  placeholder={`Tambah sub kategori ke "${kategori}"...`}
                  value={newSubCategoryInput}
                  onChange={(e) => setNewSubCategoryInput(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-[#150f24] border border-purple-200 dark:border-purple-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubCategory}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                >
                  Simpan
                </button>
              </div>
            )}

            {/* Chip pilihan Sub Kategori yang tersedia */}
            {activeSubCategories.length > 0 && (
              <div className="space-y-1 pt-0.5">
                <span className="text-[10px] text-slate-400 dark:text-purple-300 block font-medium">
                  Pilih Sub Kategori preset (klik untuk gunakan):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 dark:bg-[#1e1533] rounded-xl border border-slate-200 dark:border-violet-900/50">
                  {activeSubCategories.map((sub) => {
                    const isSelected = kegiatan.toLowerCase() === sub.toLowerCase();
                    return (
                      <div
                        key={sub}
                        onClick={() => setKegiatan(sub)}
                        className={`group cursor-pointer inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                            : 'bg-white dark:bg-[#150f24] text-slate-700 dark:text-purple-200 border-slate-200 dark:border-purple-800 hover:border-violet-400'
                        }`}
                      >
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSubCategory(sub, e)}
                          title="Hapus Sub Kategori ini"
                          className="p-0.5 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Manual / Edit Text Sub Kategori */}
            <input
              type="text"
              placeholder="Nama kegiatan / sub kategori..."
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Volume & Harga Satuan (Kalkulator Opsional) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
                Volume / Qty
              </label>
              <input
                type="text"
                placeholder="1"
                value={volumeInput}
                onChange={handleVolumeChange}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="text"
                placeholder="0"
                value={hargaInput ? parseInt(hargaInput, 10).toLocaleString('id-ID') : ''}
                onChange={handleHargaChange}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Nominal Anggaran (Total) - Manual Direct Edit Enabled */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="text"
                placeholder="Masukkan nominal"
                value={anggaranInput ? parseInt(anggaranInput, 10).toLocaleString('id-ID') : ''}
                onChange={handleAnggaranDirectChange}
                className="w-full text-xs font-bold bg-white dark:bg-[#1f1240] border border-purple-200 dark:border-violet-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            {currentAnggaranNum > 0 && (
              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-bold block mt-1">
                Total Anggaran Terpasang: {formatRupiah(currentAnggaranNum)}
              </span>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Keterangan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-violet-950">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-[#1e1533] hover:bg-slate-200 dark:hover:bg-violet-950/80 text-slate-700 dark:text-slate-300 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl shadow-xs transition active:scale-95"
            >
              {editingRAB ? 'Simpan Perubahan' : 'Tambah Pos RAB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
