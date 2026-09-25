import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  Receipt,
  Layers,
  X,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    settings,
  } = useApp();

  if (!isOpen) return null;

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: <LayoutDashboard className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />,
    },
    {
      id: 'transaksi',
      label: 'Transaksi',
      icon: <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />,
    },
    {
      id: 'rab',
      label: 'RAB',
      icon: <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />,
    },
  ];

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex select-none animate-in fade-in duration-200">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. PANEL NAVIGASI UTAMA */}
      <div className="relative w-2/5 min-w-[200px] max-w-[260px] sm:w-1/3 sm:min-w-[220px] h-full bg-gradient-to-b from-[#220738] via-[#380e58] to-[#18052e] text-white shadow-2xl z-10 flex flex-col border-r border-purple-500/30 animate-in slide-in-from-left duration-200">
        
        {/* HEADER NAVIGASI */}
        <div className="p-2.5 sm:p-3.5 border-b border-purple-400/25 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-800 border border-purple-300/40 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <h2 className="text-[10.5px] sm:text-xs font-black tracking-tight text-white uppercase truncate">
                KEUANGAN
              </h2>
              <p className="text-[8px] sm:text-[9.5px] text-purple-200 font-bold uppercase tracking-tight truncate">
                KEMAHASANTRIAN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Navigasi"
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-purple-900/60 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DAFTAR MENU NAVIGASI: BERANDA, TRANSAKSI, RAB */}
        <nav className="flex-1 p-2 sm:p-2.5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex flex-row items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 border outline-none ${
                  isActive
                    ? 'bg-white/20 text-white font-extrabold border-white/30 backdrop-blur-xs shadow-xs'
                    : 'border-transparent text-purple-200 hover:text-white hover:bg-white/10 font-bold'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive ? 'bg-white/25 text-white shadow-xs' : 'bg-purple-950/60 text-purple-300'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
