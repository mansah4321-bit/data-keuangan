import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  SlidersHorizontal,
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
  Tag,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    resetToDefaultData,
    getExportJsonString,
    importBackupJson,
    kategoriList,
    addKategori,
    updateKategori,
    deleteKategori,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [institutionName, setInstitutionName] = useState(settings.institutionName);
  const [subDivision, setSubDivision] = useState(settings.subDivision);
  const [address, setAddress] = useState(settings.address);
  const [bendaharaName, setBendaharaName] = useState(settings.bendaharaName);
  const [mudirName, setMudirName] = useState(settings.mudirName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [googleScriptUrl, setGoogleScriptUrl] = useState(settings.googleScriptUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [editingCatCode, setEditingCatCode] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      institutionName: institutionName.trim(),
      subDivision: subDivision.trim(),
      address: address.trim(),
      bendaharaName: bendaharaName.trim(),
      mudirName: mudirName.trim(),
      academicYear: academicYear.trim(),
      googleScriptUrl: googleScriptUrl.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 800);
  };

  const handleDownloadBackup = () => {
    const json = getExportJsonString();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-si-keuangan-kemahasantrian-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const ok = importBackupJson(reader.result);
          if (ok) {
            alert('Data backup berhasil dipulihkan!');
            setIsSettingsModalOpen(false);
          } else {
            alert('Format file backup JSON tidak valid.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (confirm('Yakin ingin mereset data aplikasi ke data awal standar Ma’had? Data perubahan lokal akan terhapus.')) {
      resetToDefaultData();
      setIsSettingsModalOpen(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const code = newCatCode.trim() || `KAT-${String(Date.now()).slice(-4)}`;
    addKategori({
      kode: code,
      kategori: trimmed,
      status: 'Aktif',
    });
    setNewCatName('');
    setNewCatCode('');
  };

  const handleStartEditCategory = (kode: string, name: string) => {
    setEditingCatCode(kode);
    setEditingCatName(name);
  };

  const handleSaveCategoryEdit = () => {
    if (editingCatCode && editingCatName.trim()) {
      updateKategori(editingCatCode, { kategori: editingCatName.trim() });
      setEditingCatCode(null);
      setEditingCatName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#150f24] rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-violet-100 dark:border-violet-900/60 p-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300 flex items-center justify-center border border-violet-200 dark:border-violet-800/60">
              <SlidersHorizontal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Pengaturan Aplikasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-violet-300/70">Identitas Ma'had & Cadangan Data</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-violet-950/50 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-3 p-2.5 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-950 dark:text-violet-200 text-xs rounded-xl font-medium flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          {/* Identitas Instansi */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Nama Instansi / Ma'had
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Nama Divisi
            </label>
            <input
              type="text"
              value={subDivision}
              onChange={(e) => setSubDivision(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Alamat Lengkap
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
                Nama Bendahara
              </label>
              <input
                type="text"
                value={bendaharaName}
                onChange={(e) => setBendaharaName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
                Nama Mudir / Pimpinan
              </label>
              <input
                type="text"
                value={mudirName}
                onChange={(e) => setMudirName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-violet-300 uppercase tracking-wider block mb-1">
              Tahun Ajaran / Akademik
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Kelola Data Kategori Anggaran */}
          <div className="pt-2 border-t border-slate-100 dark:border-violet-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-violet-300 uppercase tracking-wider block">
                Kelola Kategori Anggaran ({kategoriList.length})
              </span>
            </div>

            {/* Input Tambah Kategori */}
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Kode (contoh: KAT-01)"
                value={newCatCode}
                onChange={(e) => setNewCatCode(e.target.value)}
                className="w-28 text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                placeholder="Nama Kategori..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 text-xs bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Daftar Kategori Aktif */}
            {kategoriList.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 pr-0.5">
                {kategoriList.map((cat) => (
                  <div
                    key={cat.kode}
                    className="p-2 bg-slate-50 dark:bg-[#1a1038] rounded-xl text-xs flex items-center justify-between border border-slate-200/60 dark:border-purple-900/40"
                  >
                    {editingCatCode === cat.kode ? (
                      <div className="flex items-center space-x-1.5 flex-1 pr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 text-xs bg-white dark:bg-[#1f1240] border border-violet-400 rounded-lg px-2 py-1 text-slate-800 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCategoryEdit}
                          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950 px-1.5 py-0.5 rounded">
                          {cat.kode}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat.kategori}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {editingCatCode !== cat.kode && (
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(cat.kode, cat.kategori)}
                          className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-300"
                          title="Edit Nama Kategori"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteKategori(cat.kode)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integration Google Sheets */}
          <div className="pt-2 border-t border-slate-100 dark:border-violet-950 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-violet-300 uppercase tracking-wider block">
              Database Google Sheets (Apps Script URL)
            </span>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={googleScriptUrl}
              onChange={(e) => setGoogleScriptUrl(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 dark:bg-[#1e1533] border border-slate-200 dark:border-violet-900/60 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Backup & Restore Tools */}
          <div className="pt-2 border-t border-slate-100 dark:border-violet-950 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-violet-300 uppercase tracking-wider block">
              Cadangan & Pemulihan Data (Offline JSON)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="py-2 px-3 bg-slate-50 dark:bg-[#1e1533] hover:bg-violet-50 dark:hover:bg-violet-950/80 text-slate-700 dark:text-violet-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-violet-900/50 flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-slate-50 dark:bg-[#1e1533] hover:bg-slate-100 dark:hover:bg-violet-950/50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-violet-900/50 flex items-center justify-center space-x-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore JSON</span>
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="w-full py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-center space-x-1.5 transition mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data ke Standar Awal</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center space-x-2 border-t border-slate-100 dark:border-violet-950">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-violet-900/60 text-xs font-semibold text-slate-600 dark:text-violet-300 hover:bg-slate-50 dark:hover:bg-[#1e1533] transition"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
