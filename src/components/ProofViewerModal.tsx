import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Download } from 'lucide-react';

export const ProofViewerModal: React.FC = () => {
  const { selectedProofUrl, setSelectedProofUrl } = useApp();

  if (!selectedProofUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setSelectedProofUrl(null)}
    >
      <div
        className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300">Bukti Nota / Kwitansi Transaksi</span>
          <div className="flex items-center space-x-2">
            <a
              href={selectedProofUrl}
              download="bukti-transaksi.jpg"
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Unduh file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-2 flex items-center justify-center bg-black max-h-[75vh] overflow-auto">
          <img
            src={selectedProofUrl}
            alt="Bukti Kwitansi"
            className="max-h-[70vh] w-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
