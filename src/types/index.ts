export type BudgetStatus = 'Aman' | 'Mendekati Batas' | 'Melebihi Anggaran';

export interface RABItem {
  id: string;          // e.g. "RAB-2026-09-001"
  bulan: number;       // 1 - 12
  tahun: number;       // e.g. 2026
  kode: string;        // e.g. "KAT-01"
  kategori: string;    // e.g. "Ta'lim & Keilmuan"
  kegiatan: string;    // e.g. "Dauroh Ilmiah Bulanan & Kitab Kuning"
  anggaran: number;    // Nominal budget pagu
  realisasi: number;   // Calculated from expenses
  sisa: number;        // anggaran - realisasi
  status: BudgetStatus;
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DanaMasukItem {
  id: string;          // e.g. "IN-2026-09-001"
  tanggal: string;     // YYYY-MM-DD
  bulan: number;
  tahun: number;
  sumber: string;      // e.g. "Pencairan Anggaran RAB dari Bendahara Pusat", "Kas Awal Bulan", "Infaq Ta'lim"
  nominal: number;     // e.g. 9650000
  rabId?: string;      // Optional specific RAB link
  keterangan?: string; // e.g. "Transfer Termin 1 Operasional Kemahasantrian"
  metode?: 'Transfer Bank' | 'Tunai' | 'Lainnya';
  bukti?: string;
  createdAt?: string;
}

export interface PengeluaranItem {
  id: string;          // e.g. "EXP-2026-09-001"
  tanggal: string;     // YYYY-MM-DD
  rabId: string;       // Foreign key to RAB.id
  kode: string;        // e.g. "KAT-01"
  kategori: string;    // e.g. "Ta'lim & Keilmuan"
  kegiatan: string;    // e.g. "Dauroh Ilmiah Bulanan & Kitab Kuning"
  keterangan: string;  // e.g. "Konsumsi Asatidz & Kitab pegangan"
  nominal: number;     // e.g. 750000
  bukti?: string;      // URL or base64 data image or drive link
  penerima?: string;   // e.g. "Ustadz Ahmad Fauzi"
  metode?: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Lainnya';
  createdAt?: string;
}

export interface KategoriItem {
  kode: string;        // e.g. "KAT-01"
  kategori: string;    // e.g. "Ta'lim & Keilmuan"
  status: 'Aktif' | 'Nonaktif';
  deskripsi?: string;
  iconName?: string;
  subKategori?: string[];
}

export interface AppSettings {
  googleScriptUrl: string;
  sheetId: string;
  institutionName: string;
  subDivision: string;
  address: string;
  bendaharaName: string;
  mudirName: string;
  academicYear: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export type TabType = 'beranda' | 'rab' | 'transaksi' | 'pengeluaran' | 'laporan';

export interface FilterState {
  bulan: number;
  tahun: number;
  kategori: string;
  searchQuery: string;
  statusFilter: string;
}
