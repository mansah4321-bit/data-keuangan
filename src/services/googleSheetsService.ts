import { RABItem, PengeluaranItem, KategoriItem, DanaMasukItem, AppSettings } from '../types';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * SI KEUANGAN KEMAHASANTRIAN - MA'HAD ALY AL FURQON MAGELANG
 * Google Apps Script API Backend
 * =========================================================================
 * 
 * PETUNJUK INSTALASI:
 * 1. Buat Google Spreadsheet baru di Google Drive.
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu PASTE kode di bawah ini.
 * 4. Klik "Save" (Simpan), lalu jalankan fungsi "setupInitialSheets()" sekali untuk membuat struktur sheet.
 * 5. Klik tombol biru "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
 * 6. Pilih type: "Web app" (Aplikasi Web).
 * 7. Konfigurasi:
 *    - Description: SI Keuangan API
 *    - Execute as: "Me" (Email akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING!
 * 8. Klik "Deploy", izinkan otorisasi akun jika diminta.
 * 9. Salin "Web app URL" (akhiran /exec) dan tempelkan ke aplikasi SI KEUANGAN KEMAHASANTRIAN di menu Pengaturan.
 */

const SHEET_NAMES = {
  RAB: 'RAB',
  PENGELUARAN: 'PENGELUARAN',
  DANA_MASUK: 'DANA_MASUK',
  KATEGORI: 'KATEGORI',
  PENGATURAN: 'PENGATURAN'
};

function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet RAB
  let sheetRab = ss.getSheetByName(SHEET_NAMES.RAB);
  if (!sheetRab) {
    sheetRab = ss.insertSheet(SHEET_NAMES.RAB);
  }
  sheetRab.clear();
  sheetRab.getRange('A1:J1').setValues([[
    'ID', 'Bulan', 'Tahun', 'Kode', 'Kategori', 'Kegiatan', 'Anggaran', 'Realisasi', 'Sisa', 'Status'
  ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
  
  // 2. Setup Sheet PENGELUARAN
  let sheetPengeluaran = ss.getSheetByName(SHEET_NAMES.PENGELUARAN);
  if (!sheetPengeluaran) {
    sheetPengeluaran = ss.insertSheet(SHEET_NAMES.PENGELUARAN);
  }
  sheetPengeluaran.clear();
  sheetPengeluaran.getRange('A1:I1').setValues([[
    'ID', 'Tanggal', 'RAB ID', 'Kode', 'Kategori', 'Kegiatan', 'Keterangan', 'Nominal', 'Bukti'
  ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');

  // 3. Setup Sheet DANA_MASUK
  let sheetDanaMasuk = ss.getSheetByName(SHEET_NAMES.DANA_MASUK);
  if (!sheetDanaMasuk) {
    sheetDanaMasuk = ss.insertSheet(SHEET_NAMES.DANA_MASUK);
  }
  sheetDanaMasuk.clear();
  sheetDanaMasuk.getRange('A1:G1').setValues([[
    'ID', 'Tanggal', 'Bulan', 'Tahun', 'Sumber', 'Nominal', 'Keterangan'
  ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
  
  // 4. Setup Sheet KATEGORI
  let sheetKategori = ss.getSheetByName(SHEET_NAMES.KATEGORI);
  if (!sheetKategori) {
    sheetKategori = ss.insertSheet(SHEET_NAMES.KATEGORI);
  }
  sheetKategori.clear();
  sheetKategori.getRange('A1:C1').setValues([[
    'Kode', 'Kategori', 'Status'
  ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
  
  // 5. Setup Sheet PENGATURAN
  let sheetPengaturan = ss.getSheetByName(SHEET_NAMES.PENGATURAN);
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet(SHEET_NAMES.PENGATURAN);
  }
  sheetPengaturan.clear();
  sheetPengaturan.getRange('A1:B1').setValues([[
    'Parameter', 'Nilai'
  ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
  
  // Default Kategori
  const initialKategori = [
    ['KAT-01', "Ta'lim & Keilmuan", 'Aktif'],
    ['KAT-02', 'Asrama & Kebersihan', 'Aktif'],
    ['KAT-03', 'Kesehatan & Logistik Mahasantri', 'Aktif'],
    ['KAT-04', 'Kedisiplinan & Bahasa', 'Aktif'],
    ['KAT-05', 'Ekstrakurikuler & Olahraga', 'Aktif'],
    ['KAT-06', 'Kegiatan Khusus & Rihlah', 'Aktif']
  ];
  sheetKategori.getRange(2, 1, initialKategori.length, 3).setValues(initialKategori);
  
  // Default Pengaturan
  const initialSettings = [
    ['INSTITUSI', "MA'HAD ALY AL FURQON MAGELANG"],
    ['DIVISI', 'DIVISI KEMAHASANTRIAN'],
    ['BENDAHARA', 'Ust. Muhammad Rizqi, S.Ag.'],
    ['MUDIR', 'Ust. Ahmad Zainuri, Lc., M.H.']
  ];
  sheetPengaturan.getRange(2, 1, initialSettings.length, 2).setValues(initialSettings);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'ping') {
      return responseJSON({ status: 'success', message: 'API SI Keuangan Kemahasantrian Aktif' });
    }
    
    // Read RAB
    const sheetRab = ss.getSheetByName(SHEET_NAMES.RAB);
    const rabData = [];
    if (sheetRab && sheetRab.getLastRow() > 1) {
      const rows = sheetRab.getRange(2, 1, sheetRab.getLastRow() - 1, 10).getValues();
      rows.forEach(r => {
        if (r[0]) {
          rabData.push({
            id: String(r[0]),
            bulan: Number(r[1]) || 1,
            tahun: Number(r[2]) || new Date().getFullYear(),
            kode: String(r[3]),
            kategori: String(r[4]),
            kegiatan: String(r[5]),
            anggaran: Number(r[6]) || 0,
            realisasi: Number(r[7]) || 0,
            sisa: Number(r[8]) || 0,
            status: String(r[9]) || 'Aman'
          });
        }
      });
    }
    
    // Read Pengeluaran
    const sheetPengeluaran = ss.getSheetByName(SHEET_NAMES.PENGELUARAN);
    const pengeluaranData = [];
    if (sheetPengeluaran && sheetPengeluaran.getLastRow() > 1) {
      const rows = sheetPengeluaran.getRange(2, 1, sheetPengeluaran.getLastRow() - 1, 9).getValues();
      rows.forEach(r => {
        if (r[0]) {
          let tgl = r[1];
          if (tgl instanceof Date) {
            tgl = Utilities.formatDate(tgl, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
          pengeluaranData.push({
            id: String(r[0]),
            tanggal: String(tgl),
            rabId: String(r[2]),
            kode: String(r[3]),
            kategori: String(r[4]),
            kegiatan: String(r[5]),
            keterangan: String(r[6]),
            nominal: Number(r[7]) || 0,
            bukti: String(r[8] || '')
          });
        }
      });
    }

    // Read Dana Masuk
    const sheetDanaMasuk = ss.getSheetByName(SHEET_NAMES.DANA_MASUK);
    const danaMasukData = [];
    if (sheetDanaMasuk && sheetDanaMasuk.getLastRow() > 1) {
      const rows = sheetDanaMasuk.getRange(2, 1, sheetDanaMasuk.getLastRow() - 1, 7).getValues();
      rows.forEach(r => {
        if (r[0]) {
          let tgl = r[1];
          if (tgl instanceof Date) {
            tgl = Utilities.formatDate(tgl, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          }
          danaMasukData.push({
            id: String(r[0]),
            tanggal: String(tgl),
            bulan: Number(r[2]) || 1,
            tahun: Number(r[3]) || new Date().getFullYear(),
            sumber: String(r[4]),
            nominal: Number(r[5]) || 0,
            keterangan: String(r[6] || '')
          });
        }
      });
    }
    
    // Read Kategori
    const sheetKategori = ss.getSheetByName(SHEET_NAMES.KATEGORI);
    const kategoriData = [];
    if (sheetKategori && sheetKategori.getLastRow() > 1) {
      const rows = sheetKategori.getRange(2, 1, sheetKategori.getLastRow() - 1, 3).getValues();
      rows.forEach(r => {
        if (r[0]) {
          kategoriData.push({
            kode: String(r[0]),
            kategori: String(r[1]),
            status: String(r[2])
          });
        }
      });
    }
    
    return responseJSON({
      status: 'success',
      data: {
        rab: rabData,
        pengeluaran: pengeluaranData,
        danaMasuk: danaMasukData,
        kategori: kategoriData
      }
    });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const postBody = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postBody.action || 'syncAll';
    
    if (action === 'syncAll' && postBody.data) {
      const { rab, pengeluaran, danaMasuk, kategori } = postBody.data;
      
      // Update RAB Sheet
      if (Array.isArray(rab)) {
        let sheetRab = ss.getSheetByName(SHEET_NAMES.RAB);
        if (!sheetRab) sheetRab = ss.insertSheet(SHEET_NAMES.RAB);
        sheetRab.clear();
        sheetRab.getRange('A1:J1').setValues([[
          'ID', 'Bulan', 'Tahun', 'Kode', 'Kategori', 'Kegiatan', 'Anggaran', 'Realisasi', 'Sisa', 'Status'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (rab.length > 0) {
          const rows = rab.map(item => [
            item.id,
            item.bulan,
            item.tahun,
            item.kode,
            item.kategori,
            item.kegiatan,
            item.anggaran,
            item.realisasi,
            item.sisa,
            item.status
          ]);
          sheetRab.getRange(2, 1, rows.length, 10).setValues(rows);
        }
      }
      
      // Update Pengeluaran Sheet
      if (Array.isArray(pengeluaran)) {
        let sheetPengeluaran = ss.getSheetByName(SHEET_NAMES.PENGELUARAN);
        if (!sheetPengeluaran) sheetPengeluaran = ss.insertSheet(SHEET_NAMES.PENGELUARAN);
        sheetPengeluaran.clear();
        sheetPengeluaran.getRange('A1:I1').setValues([[
          'ID', 'Tanggal', 'RAB ID', 'Kode', 'Kategori', 'Kegiatan', 'Keterangan', 'Nominal', 'Bukti'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (pengeluaran.length > 0) {
          const rows = pengeluaran.map(item => [
            item.id,
            item.tanggal,
            item.rabId,
            item.kode,
            item.kategori,
            item.kegiatan,
            item.keterangan,
            item.nominal,
            item.bukti || ''
          ]);
          sheetPengeluaran.getRange(2, 1, rows.length, 9).setValues(rows);
        }
      }

      // Update Dana Masuk Sheet
      if (Array.isArray(danaMasuk)) {
        let sheetDanaMasuk = ss.getSheetByName(SHEET_NAMES.DANA_MASUK);
        if (!sheetDanaMasuk) sheetDanaMasuk = ss.insertSheet(SHEET_NAMES.DANA_MASUK);
        sheetDanaMasuk.clear();
        sheetDanaMasuk.getRange('A1:G1').setValues([[
          'ID', 'Tanggal', 'Bulan', 'Tahun', 'Sumber', 'Nominal', 'Keterangan'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (danaMasuk.length > 0) {
          const rows = danaMasuk.map(item => [
            item.id,
            item.tanggal,
            item.bulan,
            item.tahun,
            item.sumber,
            item.nominal,
            item.keterangan || ''
          ]);
          sheetDanaMasuk.getRange(2, 1, rows.length, 7).setValues(rows);
        }
      }
      
      return responseJSON({ status: 'success', message: 'Sinkronisasi berhasil' });
    }
    
    return responseJSON({ status: 'error', message: 'Aksi tidak dikenali' });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    rab?: RABItem[];
    pengeluaran?: PengeluaranItem[];
    danaMasuk?: DanaMasukItem[];
    kategori?: KategoriItem[];
  };
}

export const testGoogleScriptConnection = async (url: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !url.startsWith('https://script.google.com')) {
    return { success: false, message: 'URL harus diawali dengan https://script.google.com/macros/s/...' };
  }
  try {
    const pingUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
    const response = await fetch(pingUrl, {
      method: 'GET',
    });
    
    // Check if redirected to Google Login page
    if (response.url && response.url.includes('accounts.google.com')) {
      return {
        success: false,
        message: 'Akses Ditolak (Diubah ke Halaman Login). Silakan buka Apps Script > Manage Deployments > Ubah "Who has access" menjadi "Anyone" (Siapa saja).'
      };
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: 'Akses dibatasi atau Format bukan JSON. Pastikan akses di-set "Anyone" (Siapa saja) pada Deploy Web App.'
      };
    }

    if (result && result.status === 'success') {
      return { success: true, message: 'Koneksi ke Google Apps Script berhasil!' };
    }
    return { success: false, message: result.message || 'Koneksi gagal direpon oleh Google Apps Script.' };
  } catch (e: any) {
    console.warn('GAS Ping failed:', e);
    return {
      success: false,
      message: 'Koneksi gagal. Pastikan URL benar dan akses Web App diatur ke "Anyone" (Siapa saja).'
    };
  }
};


export const fetchFromGoogleSheets = async (url: string): Promise<SyncResult> => {
  if (!url) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }
  try {
    const getUrl = url.includes('?') ? `${url}&action=getAll` : `${url}?action=getAll`;
    const response = await fetch(getUrl, {
      method: 'GET',
    });
    
    if (response.url && response.url.includes('accounts.google.com')) {
      return {
        success: false,
        message: 'Akses Ditolak (Diubah ke Halaman Login). Silakan buka Apps Script > Manage Deployments > Ubah "Who has access" menjadi "Anyone" (Siapa saja).'
      };
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: 'Respons bukan format JSON. Pastikan akses di-set "Anyone" (Siapa saja) pada Deploy Web App Google Apps Script.'
      };
    }

    if (result.status === 'success' && result.data) {
      return {
        success: true,
        message: 'Berhasil mengunduh data dari Google Sheets.',
        data: result.data,
      };
    }
    return {
      success: false,
      message: result.message || 'Gagal mengambil data dari Google Sheets.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Koneksi gagal: ${err.message || 'Pastikan deploy web app diset Anyone (Siapa saja).'}`
    };
  }
};

export const pushToGoogleSheets = async (
  url: string,
  rab: RABItem[],
  pengeluaran: PengeluaranItem[],
  kategori: KategoriItem[],
  danaMasuk: DanaMasukItem[] = []
): Promise<SyncResult> => {
  if (!url) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }
  try {
    const payload = {
      action: 'syncAll',
      data: {
        rab,
        pengeluaran,
        danaMasuk,
        kategori,
      },
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.url && response.url.includes('accounts.google.com')) {
      return {
        success: false,
        message: 'Akses Ditolak (Diubah ke Halaman Login). Silakan buka Apps Script > Manage Deployments > Ubah "Who has access" menjadi "Anyone" (Siapa saja).'
      };
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return {
        success: false,
        message: 'Respons bukan format JSON. Pastikan akses di-set "Anyone" (Siapa saja) pada Deploy Web App Google Apps Script.'
      };
    }

    if (result.status === 'success') {
      return {
        success: true,
        message: 'Data berhasil disinkronkan ke Google Sheets.',
      };
    }
    return {
      success: false,
      message: result.message || 'Gagal mengirim data ke Google Sheets.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheets: ${err.message || 'Cek URL dan izin akses Web App.'}`
    };
  }
};
