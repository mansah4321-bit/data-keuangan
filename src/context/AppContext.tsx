import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import {
  RABItem,
  PengeluaranItem,
  KategoriItem,
  DanaMasukItem,
  AppSettings,
  TabType,
  FilterState,
  BudgetStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_RAB,
  INITIAL_DANA_MASUK,
  INITIAL_PENGELUARAN,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  calculateBudgetStatus,
  generateRABId,
  generateExpenseId,
  generateDanaMasukId,
} from '../utils/formatters';
import {
  fetchFromGoogleSheets,
  pushToGoogleSheets,
} from '../services/googleSheetsService';

interface AppContextType {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Real-time Date & Month Navigation
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  setFilterMonth: (month: number) => void;
  setFilterYear: (year: number) => void;
  setFilterCategory: (category: string) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToCurrentRealtimeMonth: () => void;
  isCurrentRealtimeMonth: boolean;

  // Dark Mode Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsDarkMode: (val: boolean) => void;

  // Data
  rabList: RABItem[];
  pengeluaranList: PengeluaranItem[];
  danaMasukList: DanaMasukItem[];
  kategoriList: KategoriItem[];
  settings: AppSettings;

  // Filtered Data for Active Period (Fresh and reset per month)
  currentMonthRAB: RABItem[];
  currentMonthPengeluaran: PengeluaranItem[];
  currentMonthDanaMasuk: DanaMasukItem[];

  // Cash Flow & Budget Metrics for the selected month
  totalAnggaran: number;      // Total Pagu RAB yang direncanakan bulan ini
  totalDanaMasuk: number;     // Total Uang Masuk / Pencairan dari RAB bulan ini
  totalRealisasi: number;     // Total Pengeluaran Bulanan bulan ini
  danaKasSaatIni: number;     // Saldo Kas Riil Tersedia (Dana Masuk - Realisasi)
  totalSisa: number;          // Sisa Pagu RAB (Total Anggaran - Realisasi)
  persentaseRealisasi: number;
  countAman: number;
  countMendekati: number;
  countOver: number;

  // RAB Operations
  addRAB: (item: Omit<RABItem, 'id' | 'realisasi' | 'sisa' | 'status'>) => RABItem;
  updateRAB: (id: string, item: Partial<RABItem>) => void;
  deleteRAB: (id: string) => void;
  copyRABFromPreviousMonth: () => number; // Returns number of copied items

  // Dana Masuk Operations
  addDanaMasuk: (item: Omit<DanaMasukItem, 'id' | 'createdAt'>) => DanaMasukItem;
  updateDanaMasuk: (id: string, item: Partial<DanaMasukItem>) => void;
  deleteDanaMasuk: (id: string) => void;

  // Pengeluaran Operations
  addPengeluaran: (item: {
    tanggal: string;
    nominal: number;
    kategori?: string;
    rabId?: string;
    keterangan?: string;
    penerima?: string;
    metode?: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Lainnya';
    bukti?: string;
  }) => { success: boolean; item?: PengeluaranItem; error?: string };
  updatePengeluaran: (id: string, item: Partial<PengeluaranItem>) => void;
  deletePengeluaran: (id: string) => void;

  // Kategori Operations
  addKategori: (item: KategoriItem) => void;
  updateKategori: (kode: string, item: Partial<KategoriItem>) => void;
  deleteKategori: (kode: string) => void;
  clearAllKategori: () => void;
  clearAllPengeluaran: () => void;

  // Settings & Sync
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  syncWithGoogleSheets: (forcePush?: boolean) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
  lastSyncStatus: { success: boolean; message: string; timestamp?: string } | null;

  // UI Modals
  isPeriodModalOpen: boolean;
  setIsPeriodModalOpen: (open: boolean) => void;
  isGoogleSheetsModalOpen: boolean;
  setIsGoogleSheetsModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean) => void;
  isAddRABModalOpen: boolean;
  setIsAddRABModalOpen: (open: boolean) => void;
  isAddDanaMasukModalOpen: boolean;
  setIsAddDanaMasukModalOpen: (open: boolean) => void;
  editingRAB: RABItem | null;
  setEditingRAB: (rab: RABItem | null) => void;
  editingPengeluaran: PengeluaranItem | null;
  setEditingPengeluaran: (exp: PengeluaranItem | null) => void;
  editingDanaMasuk: DanaMasukItem | null;
  setEditingDanaMasuk: (dm: DanaMasukItem | null) => void;
  selectedProofUrl: string | null;
  setSelectedProofUrl: (url: string | null) => void;

  // Reset & Backup
  resetToDefaultData: () => void;
  importBackupJson: (jsonData: string) => boolean;
  getExportJsonString: () => string;
}

const STORAGE_KEYS = {
  RAB: 'si_keuangan_rab_v1',
  PENGELUARAN: 'si_keuangan_pengeluaran_v1',
  DANA_MASUK: 'si_keuangan_dana_masuk_v1',
  KATEGORI: 'si_keuangan_kategori_v1',
  SETTINGS: 'si_keuangan_settings_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always initialize with real-time current date
  const now = new Date();
  const realtimeMonth = now.getMonth() + 1;
  const realtimeYear = now.getFullYear();

  const [activeTab, setActiveTab] = useState<TabType>('beranda');

  // Dark Mode State with localStorage persistence (defaults to false for pure white light theme)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('si_keuangan_theme_v1');
      if (saved !== null) return saved === 'dark';
      return false; // Default to clean, pure white daytime mode
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('si_keuangan_theme_v1', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('si_keuangan_theme_v1', 'light');
      }
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Filter state for active month & year
  const [filter, setFilter] = useState<FilterState>({
    bulan: realtimeMonth,
    tahun: realtimeYear,
    kategori: 'SEMUA',
    searchQuery: '',
    statusFilter: 'SEMUA',
  });

  const isCurrentRealtimeMonth = useMemo(() => {
    return filter.bulan === realtimeMonth && filter.tahun === realtimeYear;
  }, [filter.bulan, filter.tahun, realtimeMonth, realtimeYear]);

  // Modal controls
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddRABModalOpen, setIsAddRABModalOpen] = useState(false);
  const [isAddDanaMasukModalOpen, setIsAddDanaMasukModalOpen] = useState(false);
  const [editingRAB, setEditingRAB] = useState<RABItem | null>(null);
  const [editingPengeluaran, setEditingPengeluaran] = useState<PengeluaranItem | null>(null);
  const [editingDanaMasuk, setEditingDanaMasuk] = useState<DanaMasukItem | null>(null);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);

  // Raw data state with strict type and array guards
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.KATEGORI);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...INITIAL_SETTINGS, ...parsed };
          if (merged.institutionName && /furq/i.test(merged.institutionName)) {
            merged.institutionName = "MA'HAD ALY AL FURQON MAGELANG";
            try {
              localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            } catch {}
          }
          return merged;
        }
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [danaMasukList, setDanaMasukList] = useState<DanaMasukItem[]>(() => {
    try {
      if (!localStorage.getItem('APP_CLEAN_RESET_V1')) return [];
      const cached = localStorage.getItem(STORAGE_KEYS.DANA_MASUK);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [pengeluaranList, setPengeluaranList] = useState<PengeluaranItem[]>(() => {
    try {
      if (!localStorage.getItem('APP_CLEAN_RESET_V1')) return [];
      const cached = localStorage.getItem(STORAGE_KEYS.PENGELUARAN);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [rawRabList, setRawRabList] = useState<Omit<RABItem, 'realisasi' | 'sisa' | 'status'>[]>(() => {
    try {
      if (!localStorage.getItem('APP_CLEAN_RESET_V1')) return [];
      const cached = localStorage.getItem(STORAGE_KEYS.RAB);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.map(({ id, bulan, tahun, kode, kategori, kegiatan, anggaran, keterangan, createdAt }) => ({
            id, bulan: Number(bulan) || 1, tahun: Number(tahun) || new Date().getFullYear(), kode: kode || '', kategori: kategori || '', kegiatan: kegiatan || '', anggaran: Number(anggaran) || 0, keterangan: keterangan || '', createdAt: createdAt || ''
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Centralized Server-side and LocalStorage Synchronization
  const isInitialServerSync = useRef(true);

  // 1. Load initial data from Google Sheets on startup
  useEffect(() => {
    const loadFromServer = async () => {
      const activeUrl = settings.googleScriptUrl || INITIAL_SETTINGS.googleScriptUrl;
      let loadedFromGoogle = false;

      if (activeUrl) {
        try {
          const res = await fetchFromGoogleSheets(activeUrl);
          if (res.success && res.data) {
            if (Array.isArray(res.data.rab)) {
              setRawRabList(res.data.rab);
            }
            if (Array.isArray(res.data.pengeluaran)) {
              setPengeluaranList(res.data.pengeluaran);
            }
            if (Array.isArray(res.data.danaMasuk)) {
              setDanaMasukList(res.data.danaMasuk);
            }
            if (Array.isArray(res.data.kategori) && res.data.kategori.length > 0) {
              setKategoriList(res.data.kategori);
            }
            loadedFromGoogle = true;
            console.log('Successfully loaded initial database from Google Sheets on startup.');
          } else {
            console.warn('Failed to load initial data from Google Sheets, using LocalStorage fallback. Error:', res.message);
          }
        } catch (err) {
          console.warn('Failed to connect to Google Sheets on startup:', err);
        }
      }

      isInitialServerSync.current = false;
    };
    loadFromServer();
  }, []);

  // Calculate Realisasi, Sisa, and Status automatically for each RAB item
  const rabList = useMemo<RABItem[]>(() => {
    const safeRab = Array.isArray(rawRabList) ? rawRabList : [];
    const safeExpenses = Array.isArray(pengeluaranList) ? pengeluaranList : [];

    return safeRab.map((rab) => {
      const relatedExpenses = safeExpenses.filter((exp) => exp && exp.rabId === rab.id);
      const realisasi = relatedExpenses.reduce((sum, item) => sum + (Number(item?.nominal) || 0), 0);
      const sisa = (Number(rab.anggaran) || 0) - realisasi;
      const status: BudgetStatus = calculateBudgetStatus(Number(rab.anggaran) || 0, realisasi);

      return {
        ...rab,
        anggaran: Number(rab.anggaran) || 0,
        realisasi,
        sisa,
        status,
      };
    });
  }, [rawRabList, pengeluaranList]);

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RAB, JSON.stringify(rabList));
    } catch (e) {
      console.warn('Failed to save RAB to local storage', e);
    }
  }, [rabList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DANA_MASUK, JSON.stringify(danaMasukList));
    } catch (e) {
      console.warn('Failed to save Dana Masuk to local storage', e);
    }
  }, [danaMasukList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(pengeluaranList));
    } catch (e) {
      console.warn('Failed to save Pengeluaran to local storage', e);
    }
  }, [pengeluaranList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(kategoriList));
    } catch (e) {
      console.warn('Failed to save Kategori to local storage', e);
    }
  }, [kategoriList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save Settings to local storage', e);
    }
  }, [settings]);

  // Scoped Monthly Data (Every month has its clean, reset dataset)
  const currentMonthRAB = useMemo(() => {
    if (!Array.isArray(rabList)) return [];
    return rabList.filter(
      (item) => item && Number(item.bulan) === Number(filter.bulan) && Number(item.tahun) === Number(filter.tahun)
    );
  }, [rabList, filter.bulan, filter.tahun]);

  const currentMonthDanaMasuk = useMemo(() => {
    if (!Array.isArray(danaMasukList)) return [];
    return danaMasukList.filter((item) => {
      if (!item) return false;
      if (item.bulan && item.tahun) {
        return Number(item.bulan) === Number(filter.bulan) && Number(item.tahun) === Number(filter.tahun);
      }
      if (item.tanggal) {
        const parts = String(item.tanggal).split('-');
        if (parts.length >= 2) {
          const y = Number(parts[0]);
          const m = Number(parts[1]);
          return m === Number(filter.bulan) && y === Number(filter.tahun);
        }
      }
      return false;
    });
  }, [danaMasukList, filter.bulan, filter.tahun]);

  const currentMonthPengeluaran = useMemo(() => {
    if (!Array.isArray(pengeluaranList)) return [];
    return pengeluaranList.filter((item) => {
      if (!item || !item.tanggal) return false;
      const parts = String(item.tanggal).split('-');
      if (parts.length >= 2) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        return m === Number(filter.bulan) && y === Number(filter.tahun);
      }
      return false;
    });
  }, [pengeluaranList, filter.bulan, filter.tahun]);

  // Summary Metrics for the Active Month
  const totalAnggaran = useMemo(() => {
    return currentMonthRAB.reduce((sum, item) => sum + (Number(item.anggaran) || 0), 0);
  }, [currentMonthRAB]);

  // Total Dana Masuk
  const totalDanaMasuk = useMemo(() => {
    const recordedInflow = currentMonthDanaMasuk.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    // If no explicit recorded inflow exists, use current month's RAB total as incoming allocation
    return recordedInflow > 0 ? recordedInflow : totalAnggaran;
  }, [currentMonthDanaMasuk, totalAnggaran]);

  const totalRealisasi = useMemo(() => {
    return currentMonthPengeluaran.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
  }, [currentMonthPengeluaran]);

  // Dana Kas Saat Ini = Akumulasi Sisa Kas Bulan-Bulan Sebelumnya + (Dana Masuk Bulan Ini - Pengeluaran Bulan Ini)
  const danaKasSaatIni = useMemo(() => {
    let cumulativeCash = 0;

    let minYear = Number(filter.tahun) || new Date().getFullYear();
    const checkYear = (itemDate?: string, itemYear?: number) => {
      if (itemYear) minYear = Math.min(minYear, Number(itemYear));
      if (itemDate) {
        const parts = String(itemDate).split('-');
        if (parts.length >= 1) {
          const y = Number(parts[0]);
          if (y && !isNaN(y)) minYear = Math.min(minYear, y);
        }
      }
    };

    (danaMasukList || []).forEach((item) => checkYear(item.tanggal, item.tahun));
    (pengeluaranList || []).forEach((item) => checkYear(item.tanggal));
    (rawRabList || []).forEach((item) => checkYear(item.createdAt, item.tahun));

    const targetYear = Number(filter.tahun) || new Date().getFullYear();
    const targetMonth = Number(filter.bulan) || 1;

    for (let y = minYear; y <= targetYear; y++) {
      const maxM = (y === targetYear) ? targetMonth : 12;
      for (let m = 1; m <= maxM; m++) {
        // Compute Inflow for month m, year y
        const monthDanaMasuk = (danaMasukList || []).filter((item) => {
          if (!item) return false;
          if (item.bulan && item.tahun) {
            return Number(item.bulan) === m && Number(item.tahun) === y;
          }
          if (item.tanggal) {
            const parts = String(item.tanggal).split('-');
            return parts.length >= 2 && Number(parts[0]) === y && Number(parts[1]) === m;
          }
          return false;
        });
        const recordedInflow = monthDanaMasuk.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);

        const monthRAB = (rawRabList || []).filter((item) => {
          if (!item) return false;
          return Number(item.bulan) === m && Number(item.tahun) === y;
        });
        const monthTotalAnggaran = monthRAB.reduce((sum, item) => sum + (Number(item.anggaran) || 0), 0);

        const inflow = recordedInflow > 0 ? recordedInflow : monthTotalAnggaran;

        // Compute Outflow for month m, year y
        const monthPengeluaran = (pengeluaranList || []).filter((item) => {
          if (!item || !item.tanggal) return false;
          const parts = String(item.tanggal).split('-');
          return parts.length >= 2 && Number(parts[0]) === y && Number(parts[1]) === m;
        });
        const outflow = monthPengeluaran.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);

        cumulativeCash += (inflow - outflow);
      }
    }

    return cumulativeCash;
  }, [danaMasukList, pengeluaranList, rawRabList, filter.bulan, filter.tahun]);

  // Sisa Anggaran Pagu
  const totalSisa = useMemo(() => {
    return totalAnggaran - totalRealisasi;
  }, [totalAnggaran, totalRealisasi]);

  const persentaseRealisasi = useMemo(() => {
    if (totalAnggaran <= 0) return 0;
    return Math.round((totalRealisasi / totalAnggaran) * 100);
  }, [totalAnggaran, totalRealisasi]);

  const countAman = useMemo(() => {
    return currentMonthRAB.filter((r) => r.status === 'Aman').length;
  }, [currentMonthRAB]);

  const countMendekati = useMemo(() => {
    return currentMonthRAB.filter((r) => r.status === 'Mendekati Batas').length;
  }, [currentMonthRAB]);

  const countOver = useMemo(() => {
    return currentMonthRAB.filter((r) => r.status === 'Melebihi Anggaran').length;
  }, [currentMonthRAB]);

  // Date Navigation Handlers
  const setFilterMonth = (month: number) => {
    setFilter((prev) => ({ ...prev, bulan: month }));
  };

  const setFilterYear = (year: number) => {
    setFilter((prev) => ({ ...prev, tahun: year }));
  };

  const setFilterCategory = (category: string) => {
    setFilter((prev) => ({ ...prev, kategori: category }));
  };

  const goToNextMonth = () => {
    setFilter((prev) => {
      if (prev.bulan === 12) {
        return { ...prev, bulan: 1, tahun: prev.tahun + 1 };
      }
      return { ...prev, bulan: prev.bulan + 1 };
    });
  };

  const goToPrevMonth = () => {
    setFilter((prev) => {
      if (prev.bulan === 1) {
        return { ...prev, bulan: 12, tahun: prev.tahun - 1 };
      }
      return { ...prev, bulan: prev.bulan - 1 };
    });
  };

  const goToCurrentRealtimeMonth = () => {
    const today = new Date();
    setFilter((prev) => ({
      ...prev,
      bulan: today.getMonth() + 1,
      tahun: today.getFullYear(),
    }));
  };

  // Duplicate RAB from Previous Month
  const copyRABFromPreviousMonth = (): number => {
    const prevMonth = filter.bulan === 1 ? 12 : filter.bulan - 1;
    const prevYear = filter.bulan === 1 ? filter.tahun - 1 : filter.tahun;

    const prevRabs = rawRabList.filter((r) => r.bulan === prevMonth && r.tahun === prevYear);
    if (prevRabs.length === 0) return 0;

    const newItems = prevRabs.map((r, idx) => ({
      ...r,
      id: generateRABId(filter.bulan, filter.tahun, rawRabList.length + idx),
      bulan: filter.bulan,
      tahun: filter.tahun,
      createdAt: new Date().toISOString().split('T')[0],
    }));

    setRawRabList((prev) => [...newItems, ...prev]);
    return newItems.length;
  };

  // Operations: RAB
  const addRAB = (item: Omit<RABItem, 'id' | 'realisasi' | 'sisa' | 'status'>): RABItem => {
    const newId = generateRABId(item.bulan, item.tahun, rawRabList.length);
    const newItem: RABItem = {
      ...item,
      id: newId,
      realisasi: 0,
      sisa: item.anggaran,
      status: 'Aman',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRawRabList((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateRAB = (id: string, updated: Partial<RABItem>) => {
    setRawRabList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    if (updated.kategori || updated.kegiatan || updated.kode) {
      setPengeluaranList((prev) =>
        prev.map((exp) => {
          if (exp.rabId === id) {
            return {
              ...exp,
              kode: updated.kode || exp.kode,
              kategori: updated.kategori || exp.kategori,
              kegiatan: updated.kegiatan || exp.kegiatan,
            };
          }
          return exp;
        })
      );
    }
  };

  const deleteRAB = (id: string) => {
    if (!id) return;
    setRawRabList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.RAB, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setPengeluaranList((prev) => {
      const updated = prev.filter((item) => item.rabId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Operations: Dana Masuk / Pencairan
  const addDanaMasuk = (item: Omit<DanaMasukItem, 'id' | 'createdAt'>): DanaMasukItem => {
    const newId = generateDanaMasukId(item.bulan, item.tahun, danaMasukList.length);
    const newItem: DanaMasukItem = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setDanaMasukList((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateDanaMasuk = (id: string, updated: Partial<DanaMasukItem>) => {
    setDanaMasukList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteDanaMasuk = (id: string) => {
    if (!id) return;
    setDanaMasukList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.DANA_MASUK, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Operations: Pengeluaran
  const addPengeluaran = (item: {
    tanggal: string;
    nominal: number;
    kategori?: string;
    rabId?: string;
    keterangan?: string;
    penerima?: string;
    metode?: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Lainnya';
    bukti?: string;
  }) => {
    const [y, m] = item.tanggal.split('-').map(Number);
    const targetBulan = m || filter.bulan;
    const targetTahun = y || filter.tahun;

    let parentRAB = item.rabId ? rawRabList.find((r) => r.id === item.rabId) : undefined;
    if (!parentRAB && item.kategori) {
      parentRAB = rawRabList.find(
        (r) => r.bulan === targetBulan && r.tahun === targetTahun && r.kategori.toLowerCase() === item.kategori!.toLowerCase()
      );
    }

    let effectiveRabId = parentRAB ? parentRAB.id : (item.rabId || '');
    let effectiveKategori = item.kategori || (parentRAB ? parentRAB.kategori : 'Umum');
    let effectiveKegiatan = parentRAB ? parentRAB.kegiatan : (item.keterangan || effectiveKategori);
    let effectiveKode = parentRAB ? parentRAB.kode : 'KAT-99';

    if (!parentRAB) {
      const catMatch = kategoriList.find((k) => k.kategori.toLowerCase() === effectiveKategori.toLowerCase());
      if (catMatch) effectiveKode = catMatch.kode;
      const newRabId = `RAB-${targetTahun}-${String(targetBulan).padStart(2, '0')}-${String(rawRabList.length + 1).padStart(3, '0')}`;
      const autoRAB: RABItem = {
        id: newRabId,
        bulan: targetBulan,
        tahun: targetTahun,
        kode: effectiveKode,
        kategori: effectiveKategori,
        kegiatan: effectiveKegiatan,
        anggaran: item.nominal,
        realisasi: 0,
        sisa: item.nominal,
        status: 'Aman',
        createdAt: new Date().toISOString(),
      };
      setRawRabList((prev) => [...prev, autoRAB]);
      effectiveRabId = newRabId;
    }

    const newId = generateExpenseId(targetBulan, targetTahun, pengeluaranList.length);

    const newExpense: PengeluaranItem = {
      id: newId,
      tanggal: item.tanggal,
      nominal: item.nominal,
      rabId: effectiveRabId,
      kode: effectiveKode,
      kategori: effectiveKategori,
      kegiatan: effectiveKegiatan,
      keterangan: item.keterangan || effectiveKategori,
      penerima: item.penerima || '',
      metode: item.metode || 'Tunai',
      bukti: item.bukti || '',
      createdAt: new Date().toISOString(),
    };

    setPengeluaranList((prev) => [newExpense, ...prev]);
    return { success: true, item: newExpense };
  };

  const updatePengeluaran = (id: string, updated: Partial<PengeluaranItem>) => {
    setPengeluaranList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updated };
          if (updated.rabId && updated.rabId !== item.rabId) {
            const newParent = rawRabList.find((r) => r.id === updated.rabId);
            if (newParent) {
              merged.kode = newParent.kode;
              merged.kategori = newParent.kategori;
              merged.kegiatan = newParent.kegiatan;
            }
          } else if (updated.kategori && updated.kategori !== item.kategori) {
            merged.kategori = updated.kategori;
            if (!updated.keterangan && item.keterangan === item.kategori) {
              merged.keterangan = updated.kategori;
            }
          }
          return merged;
        }
        return item;
      })
    );
  };

  const deletePengeluaran = (id: string) => {
    if (!id) return;
    setPengeluaranList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Operations: Kategori
  const addKategori = (item: KategoriItem) => {
    setKategoriList((prev) => {
      const updated = [...prev, item];
      try {
        localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateKategori = (kode: string, updated: Partial<KategoriItem>) => {
    let oldName = '';
    setKategoriList((prev) => {
      const updatedList = prev.map((item) => {
        if (item.kode === kode) {
          oldName = item.kategori;
          return { ...item, ...updated };
        }
        return item;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    if (updated.kategori && oldName) {
      setPengeluaranList((prev) => {
        const updatedExp = prev.map((exp) =>
          exp.kode === kode || exp.kategori.toLowerCase() === oldName.toLowerCase()
            ? { ...exp, kategori: updated.kategori! }
            : exp
        );
        try {
          localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify(updatedExp));
        } catch {}
        return updatedExp;
      });
    }
  };

  const deleteKategori = (identifier: string) => {
    if (!identifier) return;
    setKategoriList((prev) => {
      const updated = prev.filter(
        (item) =>
          item.kode !== identifier &&
          item.kode?.toLowerCase() !== identifier?.toLowerCase() &&
          item.kategori !== identifier &&
          item.kategori?.toLowerCase() !== identifier?.toLowerCase()
      );
      try {
        localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllPengeluaran = () => {
    setPengeluaranList([]);
    try {
      localStorage.setItem(STORAGE_KEYS.PENGELUARAN, JSON.stringify([]));
    } catch {}
  };

  const clearAllKategori = () => {
    setKategoriList([]);
    try {
      localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify([]));
    } catch {}
  };

  // Auto-sync effect: Automatically push local changes to Google Sheets in real-time
  useEffect(() => {
    if (isInitialServerSync.current) return;
    if (!settings.googleScriptUrl) return;

    const timer = setTimeout(() => {
      pushToGoogleSheets(
        settings.googleScriptUrl,
        rabList,
        pengeluaranList,
        kategoriList,
        danaMasukList
      ).then((res) => {
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastSyncStatus({ success: res.success, message: res.message, timestamp });
        if (res.success) {
          setSettings((prev) => ({ ...prev, lastSyncTime: timestamp }));
        }
      }).catch((e) => {
        console.warn('Auto-push to Google Sheets failed:', e);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [rawRabList, pengeluaranList, danaMasukList, kategoriList, settings.googleScriptUrl]);

  // Operations: Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Google Sheets Sync
  const syncWithGoogleSheets = async (forcePush = true): Promise<{ success: boolean; message: string }> => {
    if (!settings.googleScriptUrl) {
      const msg = 'URL Google Apps Script belum dikonfigurasi di Pengaturan.';
      setLastSyncStatus({ success: false, message: msg });
      return { success: false, message: msg };
    }

    setIsSyncing(true);
    try {
      if (forcePush) {
        const res = await pushToGoogleSheets(
          settings.googleScriptUrl,
          rabList,
          pengeluaranList,
          kategoriList,
          danaMasukList
        );
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastSyncStatus({ success: res.success, message: res.message, timestamp });
        if (res.success) {
          setSettings((prev) => ({ ...prev, lastSyncTime: timestamp }));
        }
        setIsSyncing(false);
        return res;
      } else {
        const res = await fetchFromGoogleSheets(settings.googleScriptUrl);
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        if (res.success && res.data) {
          if (res.data.rab && res.data.rab.length > 0) {
            setRawRabList(res.data.rab);
          }
          if (res.data.pengeluaran && res.data.pengeluaran.length > 0) {
            setPengeluaranList(res.data.pengeluaran);
          }
          if (res.data.danaMasuk && res.data.danaMasuk.length > 0) {
            setDanaMasukList(res.data.danaMasuk);
          }
          if (res.data.kategori && res.data.kategori.length > 0) {
            setKategoriList(res.data.kategori);
          }
          setLastSyncStatus({ success: true, message: 'Data berhasil diunduh dari Google Sheets!', timestamp });
          setSettings((prev) => ({ ...prev, lastSyncTime: timestamp }));
          setIsSyncing(false);
          return { success: true, message: 'Data berhasil diperbarui dari Google Sheets!' };
        } else {
          const pushRes = await pushToGoogleSheets(
            settings.googleScriptUrl,
            rabList,
            pengeluaranList,
            kategoriList,
            danaMasukList
          );
          setLastSyncStatus({ success: pushRes.success, message: pushRes.message, timestamp });
          if (pushRes.success) {
            setSettings((prev) => ({ ...prev, lastSyncTime: timestamp }));
          }
          setIsSyncing(false);
          return pushRes;
        }
      }
    } catch (err: any) {
      const msg = `Gagal sinkron: ${err.message || 'Periksa koneksi internet dan Apps Script URL'}`;
      setLastSyncStatus({ success: false, message: msg });
      setIsSyncing(false);
      return { success: false, message: msg };
    }
  };

  const resetToDefaultData = () => {
    setRawRabList(INITIAL_RAB);
    setPengeluaranList(INITIAL_PENGELUARAN);
    setDanaMasukList(INITIAL_DANA_MASUK);
    setKategoriList(INITIAL_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.RAB);
    localStorage.removeItem(STORAGE_KEYS.PENGELUARAN);
    localStorage.removeItem(STORAGE_KEYS.DANA_MASUK);
    localStorage.removeItem(STORAGE_KEYS.KATEGORI);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const getExportJsonString = () => {
    return JSON.stringify(
      {
        rab: rabList,
        pengeluaran: pengeluaranList,
        danaMasuk: danaMasukList,
        kategori: kategoriList,
        settings,
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.rab && Array.isArray(data.rab)) setRawRabList(data.rab);
      if (data.pengeluaran && Array.isArray(data.pengeluaran)) setPengeluaranList(data.pengeluaran);
      if (data.danaMasuk && Array.isArray(data.danaMasuk)) setDanaMasukList(data.danaMasuk);
      if (data.kategori && Array.isArray(data.kategori)) setKategoriList(data.kategori);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        filter,
        setFilter,
        setFilterMonth,
        setFilterYear,
        setFilterCategory,
        goToNextMonth,
        goToPrevMonth,
        goToCurrentRealtimeMonth,
        isCurrentRealtimeMonth,
        isDarkMode,
        toggleDarkMode,
        setIsDarkMode,
        rabList,
        pengeluaranList,
        danaMasukList,
        kategoriList,
        settings,
        currentMonthRAB,
        currentMonthPengeluaran,
        currentMonthDanaMasuk,
        totalAnggaran,
        totalDanaMasuk,
        totalRealisasi,
        danaKasSaatIni,
        totalSisa,
        persentaseRealisasi,
        countAman,
        countMendekati,
        countOver,
        addRAB,
        updateRAB,
        deleteRAB,
        copyRABFromPreviousMonth,
        addDanaMasuk,
        updateDanaMasuk,
        deleteDanaMasuk,
        addPengeluaran,
        updatePengeluaran,
        deletePengeluaran,
        addKategori,
        updateKategori,
        deleteKategori,
        updateSettings,
        syncWithGoogleSheets,
        isSyncing,
        lastSyncStatus,
        isPeriodModalOpen,
        setIsPeriodModalOpen,
        isGoogleSheetsModalOpen,
        setIsGoogleSheetsModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        isAddRABModalOpen,
        setIsAddRABModalOpen,
        isAddDanaMasukModalOpen,
        setIsAddDanaMasukModalOpen,
        editingRAB,
        setEditingRAB,
        editingPengeluaran,
        setEditingPengeluaran,
        editingDanaMasuk,
        setEditingDanaMasuk,
        selectedProofUrl,
        setSelectedProofUrl,
        resetToDefaultData,
        importBackupJson,
        getExportJsonString,
        clearAllKategori,
        clearAllPengeluaran,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
