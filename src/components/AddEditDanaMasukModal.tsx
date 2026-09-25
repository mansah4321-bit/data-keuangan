import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseNumberInput } from '../utils/formatters';
import { ArrowDownLeft, X, CheckCircle2 } from 'lucide-react';

export const AddEditDanaMasukModal: React.FC = () => {
  const {
    isAddDanaMasukModalOpen,
    setIsAddDanaMasukModalOpen,
    editingDanaMasuk,
    setEditingDanaMasuk,
    addDanaMasuk,
    updateDanaMasuk,
    filter,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(todayStr);
  const [bulan, setBulan] = useState(filter.bulan);
  const [tahun, setTahun] = useState(filter.tahun);
  const [sumber, setSumber] = useState('Pencairan Anggaran RAB (Bendahara Pusat)');
  const [nominalInput, setNominalInput] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [metode, setMetode] = useState<'Transfer Bank' | 'Tunai' | 'Lainnya'>('Transfer Bank');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingDanaMasuk) {
      setTanggal(editingDanaMasuk.tanggal || todayStr);
      setBulan(editingDanaMasuk.bulan || filter.bulan);
      setTahun(editingDanaMasuk.tahun || filter.tahun);
      setSumber(editingDanaMasuk.sumber || '');
      setNominalInput(editingDanaMasuk.nominal ? editingDanaMasuk.nominal.toString() : '');
      setKeterangan(editingDanaMasuk.keterangan || '');
      setMetode(editingDanaMasuk.metode || 'Transfer Bank');
    } else {
      setTanggal(todayStr);
      setBulan(filter.bulan);
      setTahun(filter.tahun);
      setSumber('Pencairan Anggaran RAB (Bendahara Ma’had)');
      setNominalInput('');
      setKeterangan('');
      setMetode('Transfer Bank');
    }
    setErrorMsg('');
  }, [editingDanaMasuk, isAddDanaMasukModalOpen, filter.bulan, filter.tahun, todayStr]);

  if (!isAddDanaMasukModalOpen && !editingDanaMasuk) return null;

  const currentNominal = parseNumberInput(nominalInput);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseNumberInput(e.target.value);
    setNominalInput(num === 0 ? '' : num.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumber.trim()) {
      setErrorMsg('Sumber dana masuk / pencairan wajib diisi.');
      return;
    }
    if (currentNominal <= 0) {
      setErrorMsg('Nominal dana masuk harus lebih besar dari 0.');
      return;
    }

    const [y, m] = tanggal.split('-').map(Number);

    if (editingDanaMasuk) {
      updateDanaMasuk(editingDanaMasuk.id, {
        tanggal,
        bulan: m || bulan,
        tahun: y || tahun,
        sumber: sumber.trim(),
        nominal: currentNominal,
        keterangan: keterangan.trim(),
        metode,
      });
    } else {
      addDanaMasuk({
        tanggal,
        bulan: m || bulan,
        tahun: y || tahun,
        sumber: sumber.trim(),
        nominal: currentNominal,
        keterangan: keterangan.trim(),
        metode,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddDanaMasukModalOpen(false);
    setEditingDanaMasuk(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#150f24] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-violet-100 dark:border-violet-900/60 p-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 flex items-center justify-center border border-violet-200 dark:border-violet-800/60">
              <ArrowDownLeft className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {editingDanaMasuk ? 'Edit Dana Masuk' : 'Catat Uang Masuk / Pencairan'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-violet-300/70">Pencairan Dana Berasal dari RAB / Kas</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Tanggal */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Tanggal Penerimaan *
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Sumber Uang Masuk */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Sumber Dana / Keterangan Pencairan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Pencairan RAB Termin 1, Kas Awal Bulan, Donasi..."
              value={sumber}
              onChange={(e) => setSumber(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Nominal Uang Masuk (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={currentNominal > 0 ? currentNominal.toLocaleString('id-ID') : ''}
                onChange={handleNominalChange}
                className="w-full text-base font-black bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            {currentNominal > 0 && (
              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-black mt-1">
                Terbaca: {formatRupiah(currentNominal)}
              </p>
            )}
          </div>

          {/* Metode */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Metode Penerimaan
            </label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Transfer Bank">Transfer Bank / Rekening</option>
              <option value="Tunai">Tunai / Kas Fisik</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Catatan / No. Bukti Transfer
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center space-x-2 border-t border-slate-100 dark:border-violet-950">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-violet-900/60 text-xs font-semibold text-slate-600 dark:text-violet-300 hover:bg-slate-50 dark:hover:bg-[#1e1533] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingDanaMasuk ? 'Simpan Perubahan' : 'Catat Uang Masuk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
