/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BerandaView } from './components/views/BerandaView';
import { RABView } from './components/views/RABView';
import { PengeluaranView } from './components/views/PengeluaranView';
import { LaporanView } from './components/views/LaporanView';
import { AddEditRABModal } from './components/AddEditRABModal';
import { AddEditPengeluaranModal } from './components/AddEditPengeluaranModal';
import { AddEditDanaMasukModal } from './components/AddEditDanaMasukModal';
import { ProofViewerModal } from './components/ProofViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { PeriodSelectorModal } from './components/PeriodSelectorModal';
import { Smartphone, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isPeriodModalOpen, setIsPeriodModalOpen } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090410] text-slate-800 dark:text-slate-100 flex flex-col w-full transition-colors duration-200">
      {/* 1. Header Kotak Memanjang: Ikon Garis Tiga di Pojok + Teks "DATA KEUANGAN DIVISI KEMAHASANTRIAN" */}
      <Header onToggleNavigation={() => setIsNavOpen((prev) => !prev)} />

      {/* 2. PWA Install Banner */}
      {showInstallBanner && (
        <div className="w-full bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900 text-white px-4 py-2.5 flex items-center justify-between text-xs z-20 border-b border-violet-700/50 animate-in slide-in-from-top shadow-xs">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-violet-300 flex-shrink-0" />
              <span className="font-medium">Pasang SI Keuangan di Layar Utama HP</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-white hover:bg-violet-50 text-violet-950 font-bold px-3 py-1 rounded-md text-xs shadow-xs transition"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-violet-300 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Panel Navigasi Kotak (Drawer yang terbuka saat ikon garis tiga diklik) */}
      <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* 4. Konten Utama Full-Width Bersih & Lega */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-12">
        {activeTab === 'beranda' && <BerandaView />}
        {activeTab === 'rab' && <RABView />}
        {(activeTab === 'transaksi' || activeTab === 'pengeluaran') && <PengeluaranView />}
        {activeTab === 'laporan' && <LaporanView />}
      </main>

      {/* Global Modals */}
      <AddEditRABModal />
      <AddEditPengeluaranModal />
      <AddEditDanaMasukModal />
      <ProofViewerModal />
      <SettingsModal />
      <PeriodSelectorModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
