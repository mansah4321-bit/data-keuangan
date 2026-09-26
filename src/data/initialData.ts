import { RABItem, PengeluaranItem, KategoriItem, DanaMasukItem, AppSettings } from '../types';

export const INITIAL_CATEGORIES: KategoriItem[] = [
  {
    kode: 'G101',
    kategori: 'Keasramaan',
    status: 'Aktif',
    deskripsi: 'Kegiatan keasramaan dan kebersihan asrama',
    subKategori: [
      'Kerja Bakti Pa',
      'Apresiasi Santri Teladan Pa',
      'Apresiasi Keaktifan Bhs Arab Pa',
      'Bersih Bersih Musholla Warga',
      'Kesehatan Putra',
      'Sabun cuci piring Pa',
      'Porstek & HCL Pa',
    ],
  },
  {
    kode: 'G102',
    kategori: 'Bimbingan Konseling',
    status: 'Aktif',
    deskripsi: 'Bimbingan dan konseling santri',
    subKategori: ['Bimkos'],
  },
  {
    kode: 'G104',
    kategori: 'Ekstrakurikuler',
    status: 'Aktif',
    deskripsi: 'Kegiatan ekstrakurikuler santri',
    subKategori: ['TPA', 'Futsal'],
  },
  {
    kode: 'G105',
    kategori: 'Takmir',
    status: 'Aktif',
    deskripsi: 'Operasional takmir dan masjid',
    subKategori: [
      'Khotib',
      'Tisu Masjid',
      'Air minum (asatidzah dan khotib)',
      'Lakban masjid',
    ],
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwmRhpUB21ZrE5WIfMmARXJrfhmWRZoifU-0QL3roW81uGiqblhmXN9It6eJnZokw4g/exec',
  sheetId: '',
  institutionName: "MA'HAD ALY AL FURQON MAGELANG",
  subDivision: 'DIVISI KEMAHASANTRIAN',
  address: 'Jl. Srikandi No. 1, Tempuran, Magelang, Jawa Tengah 56161',
  bendaharaName: 'Ust. Muhammad Rizqi, S.Ag.',
  mudirName: 'Ust. Ahmad Zainuri, Lc., M.H.',
  academicYear: '1447-1448 H / 2026-2027 M',
  autoSync: false,
  lastSyncTime: '',
};

export const INITIAL_RAB: RABItem[] = [];

export const INITIAL_DANA_MASUK: DanaMasukItem[] = [];

export const INITIAL_PENGELUARAN: PengeluaranItem[] = [];
