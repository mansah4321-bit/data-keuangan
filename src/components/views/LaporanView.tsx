import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  formatRupiahShort,
  MONTH_NAMES,
  formatDateIndo,
  getStatusColor,
} from '../../utils/formatters';
import {
  Printer,
  Download,
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const {
    filter,
    kategoriList,
    currentMonthRAB,
    settings,
  } = useApp();

  const [selectedKategori, setSelectedKategori] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');
  const [reportMode, setReportMode] = useState<'ringkas' | 'resmi'>('ringkas');

  // Filtered items
  const filteredRAB = useMemo(() => {
    return currentMonthRAB.filter((item) => {
      const matchCat =
        selectedKategori === 'SEMUA' || item.kategori === selectedKategori || item.kode === selectedKategori;
      const matchStatus =
        selectedStatus === 'SEMUA' || item.status === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [currentMonthRAB, selectedKategori, selectedStatus]);

  const filteredAnggaran = useMemo(() => {
    return filteredRAB.reduce((sum, r) => sum + r.anggaran, 0);
  }, [filteredRAB]);

  const filteredRealisasi = useMemo(() => {
    return filteredRAB.reduce((sum, r) => sum + r.realisasi, 0);
  }, [filteredRAB]);

  const filteredSisa = useMemo(() => {
    return filteredAnggaran - filteredRealisasi;
  }, [filteredAnggaran, filteredRealisasi]);

  const filteredPersen = useMemo(() => {
    return filteredAnggaran > 0 ? Math.round((filteredRealisasi / filteredAnggaran) * 100) : 0;
  }, [filteredAnggaran, filteredRealisasi]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Bulan', 'Tahun', 'Kode', 'Kategori', 'Kegiatan', 'Anggaran', 'Realisasi', 'Sisa', 'Status'];
    const rows = filteredRAB.map((r) => [
      r.id,
      r.bulan,
      r.tahun,
      `"${r.kode}"`,
      `"${r.kategori}"`,
      `"${r.kegiatan.replace(/"/g, '""')}"`,
      r.anggaran,
      r.realisasi,
      r.sisa,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan-RAB-${MONTH_NAMES[filter.bulan - 1]}-${filter.tahun}-Kemahasantrian.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24 pt-1">
      {/* Top Controls & Print / CSV Action */}
      <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-3.5 shadow-xs border border-purple-100 dark:border-purple-900/40 space-y-3 print:hidden transition-colors">
        {/* View Mode Switcher */}
        <div className="flex bg-slate-100 dark:bg-[#1f1240] p-1 rounded-xl">
          <button
            onClick={() => setReportMode('ringkas')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              reportMode === 'ringkas'
                ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-xs shadow-violet-600/30'
                : 'text-slate-500 dark:text-purple-300 hover:text-violet-700'
            }`}
          >
            Tampilan Ringkas
          </button>
          <button
            onClick={() => setReportMode('resmi')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              reportMode === 'resmi'
                ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-xs shadow-violet-600/30'
                : 'text-slate-500 dark:text-purple-300 hover:text-violet-700'
            }`}
          >
            Format Kop Resmi (Cetak / PDF)
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedKategori('SEMUA')}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold border transition ${
              selectedKategori === 'SEMUA'
                ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-violet-600 shadow-xs shadow-violet-500/25'
                : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-900/50 hover:bg-violet-50 dark:hover:bg-purple-900/40'
            }`}
          >
            Semua Kategori
          </button>
          {kategoriList.map((cat) => (
            <button
              key={cat.kode}
              onClick={() => setSelectedKategori(cat.kategori)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold border transition ${
                selectedKategori === cat.kategori
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-violet-600 shadow-xs shadow-violet-500/25'
                  : 'bg-slate-50 dark:bg-[#1a1038] text-slate-600 dark:text-purple-200 border-slate-200 dark:border-purple-900/50 hover:bg-violet-50 dark:hover:bg-purple-900/40'
              }`}
            >
              {cat.kategori}
            </button>
          ))}
        </div>

        {/* Action Buttons: Print / PDF and CSV */}
        <div className="flex space-x-2 pt-1 border-t border-purple-100 dark:border-purple-900/30">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/25 flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 py-2 px-3 bg-slate-100 dark:bg-[#1f1240] hover:bg-slate-200 dark:hover:bg-[#2c1a59] text-slate-700 dark:text-purple-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900/50 flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-violet-600 dark:text-purple-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* REPORT CONTENT */}
      {reportMode === 'ringkas' ? (
        <div className="space-y-3.5">
          {/* Summary Metric Header */}
          <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/40 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/40">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Rekapitulasi: {MONTH_NAMES[filter.bulan - 1]} {filter.tahun}
              </span>
              <span className="text-xs font-black text-violet-700 dark:text-violet-300">
                {filteredPersen}% Terserap
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              {/* Anggaran */}
              <div className="p-2.5 bg-purple-50/50 dark:bg-[#1f1240] rounded-xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">Anggaran</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                  {formatRupiahShort(filteredAnggaran)}
                </span>
              </div>

              {/* Realisasi */}
              <div className="p-2.5 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">Realisasi</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-300 mt-0.5 block">
                  {formatRupiahShort(filteredRealisasi)}
                </span>
              </div>

              {/* Sisa Saldo */}
              <div className="p-2.5 bg-violet-50/70 dark:bg-violet-950/40 rounded-xl border border-violet-200/60 dark:border-violet-900/40">
                <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase block">Sisa Saldo</span>
                <span
                  className={`text-xs font-black mt-0.5 block ${
                    filteredSisa < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-violet-800 dark:text-violet-300'
                  }`}
                >
                  {formatRupiahShort(filteredSisa)}
                </span>
              </div>
            </div>
          </div>

          {/* List of Report Items */}
          <div className="space-y-2.5">
            {filteredRAB.map((item, idx) => {
              const colors = getStatusColor(item.status);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#140b2b] rounded-2xl p-3.5 shadow-sm border border-purple-100 dark:border-purple-900/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="pr-2">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <span className="text-[10px] font-extrabold text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/80 px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800">
                          {item.kode}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-purple-300 font-medium">
                          {item.kategori}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {item.kegiatan}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colors.bg}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-purple-900/30 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-purple-300 block">Pagu</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatRupiah(item.anggaran)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-purple-300 block">Realisasi</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatRupiah(item.realisasi)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-purple-300 block">Sisa</span>
                      <span
                        className={`font-black ${item.sisa < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-violet-800 dark:text-violet-300'}`}
                      >
                        {formatRupiah(item.sisa)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* OFFICIAL REPORT VIEW / PRINT KOP SURAT */
        <div className="bg-white dark:bg-[#140b2b] rounded-2xl p-6 shadow-sm border border-purple-100 dark:border-purple-900/40 text-slate-900 dark:text-slate-100 print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
          {/* Kop Surat Resmi */}
          <div className="text-center pb-4 border-b-2 border-purple-950 dark:border-purple-700 print:border-black">
            <div className="text-sm font-black uppercase tracking-widest text-purple-950 dark:text-purple-200 print:text-black">
              {settings.institutionName}
            </div>
            <div className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white mt-0.5 print:text-black">
              {settings.subDivision}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-purple-300 mt-1 print:text-black">
              {settings.address}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-purple-300 italic mt-0.5 print:text-black">
              Tahun Ajaran: {settings.academicYear}
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center my-4">
            <h2 className="text-sm font-bold uppercase tracking-wider underline">
              LAPORAN REALISASI RENCANA ANGGARAN BIAYA (RAB)
            </h2>
            <p className="text-xs text-slate-600 dark:text-purple-300 mt-1 print:text-black">
              Periode: {MONTH_NAMES[filter.bulan - 1]} {filter.tahun}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-purple-900/60 print:border-black">
              <thead>
                <tr className="bg-purple-50/60 dark:bg-[#1f1240] text-slate-800 dark:text-slate-200 text-[11px] print:bg-slate-100 print:text-black">
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-center w-8 print:border-black">No</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 print:border-black">Kode & Kategori</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 print:border-black">Kegiatan / Pos Anggaran</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right print:border-black">Anggaran</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right print:border-black">Realisasi</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right print:border-black">Sisa</th>
                  <th className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-center print:border-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRAB.map((item, idx) => (
                  <tr key={item.id} className="border border-slate-300 dark:border-purple-900/60 text-[11px] print:border-black">
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-center print:border-black">{idx + 1}</td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 font-semibold text-slate-700 dark:text-slate-300 print:text-black print:border-black">
                      [{item.kode}] {item.kategori}
                    </td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 print:border-black">{item.kegiatan}</td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right font-medium print:border-black">
                      {formatRupiah(item.anggaran)}
                    </td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right font-medium text-rose-600 dark:text-rose-400 print:text-black print:border-black">
                      {formatRupiah(item.realisasi)}
                    </td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-right font-bold text-slate-800 dark:text-slate-200 print:text-black print:border-black">
                      {formatRupiah(item.sisa)}
                    </td>
                    <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-1.5 text-center font-semibold print:border-black">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-purple-100/60 dark:bg-[#1f1240] font-bold text-slate-900 dark:text-white text-xs print:bg-slate-100 print:text-black">
                  <td colSpan={3} className="border border-slate-300 dark:border-purple-900/60 px-2 py-2 text-center uppercase print:border-black">
                    TOTAL KESELURUHAN
                  </td>
                  <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-2 text-right print:border-black">
                    {formatRupiah(filteredAnggaran)}
                  </td>
                  <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-2 text-right text-rose-700 dark:text-rose-400 print:text-black print:border-black">
                    {formatRupiah(filteredRealisasi)}
                  </td>
                  <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-2 text-right print:border-black">
                    {formatRupiah(filteredSisa)}
                  </td>
                  <td className="border border-slate-300 dark:border-purple-900/60 px-2 py-2 text-center text-violet-700 dark:text-violet-300 print:text-black print:border-black">
                    {filteredPersen}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures Section */}
          <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-600 dark:text-purple-300 print:text-black">Mengetahui,</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 print:text-black">Mudir Kemahasantrian</p>
              <div className="h-16 flex items-end justify-center">
                <span className="border-b border-slate-800 dark:border-purple-300 font-bold px-4 text-slate-900 dark:text-slate-100 print:text-black">
                  {settings.mudirName}
                </span>
              </div>
            </div>

            <div>
              <p className="text-slate-600 dark:text-purple-300 print:text-black">Magelang, {formatDateIndo(new Date().toISOString().split('T')[0])}</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 print:text-black">Bendahara Kemahasantrian</p>
              <div className="h-16 flex items-end justify-center">
                <span className="border-b border-slate-800 dark:border-purple-300 font-bold px-4 text-slate-900 dark:text-slate-100 print:text-black">
                  {settings.bendaharaName}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
