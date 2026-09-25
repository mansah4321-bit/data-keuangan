import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('dist/index.html', 'utf8');
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

const cssContent = styleMatch ? styleMatch[1] : '';
const jsContent = scriptMatch ? scriptMatch[1] : '';

if (!fs.existsSync('gas-deploy')) fs.mkdirSync('gas-deploy');

fs.writeFileSync('gas-deploy/Stylesheet.html', `<style>\n${cssContent}\n</style>`);
fs.writeFileSync('gas-deploy/JavaScript.html', `<script>\n${jsContent}\n</script>`);

const indexContent = `<!DOCTYPE html>
<html lang="id">
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SI Keuangan Kemahasantrian</title>
    <?!= include('Stylesheet'); ?>
  </head>
  <body>
    <div id="root"></div>
    <?!= include('JavaScript'); ?>
  </body>
</html>`;

fs.writeFileSync('gas-deploy/Index.html', indexContent);

const codeGs = `/**
 * =========================================================================
 * SI KEUANGAN KEMAHASANTRIAN - MA'HAD ALY AL FURQON MAGELANG
 * Google Apps Script Web App & Google Sheets Database API
 * =========================================================================
 */

const SHEET_NAMES = {
  RAB: 'RAB',
  PENGELUARAN: 'PENGELUARAN',
  DANA_MASUK: 'DANA_MASUK',
  KATEGORI: 'KATEGORI',
  PENGATURAN: 'PENGATURAN'
};

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
  if (action === 'ping') {
    return responseJSON({ status: 'success', message: 'API SI Keuangan Kemahasantrian Aktif' });
  }
  if (action === 'getAll') {
    return handleGetAllData();
  }

  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle("SI Keuangan Kemahasantrian")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doPost(e) {
  try {
    const postBody = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = postBody.action || 'syncAll';
    
    if (action === 'syncAll' && postBody.data) {
      const { rab, pengeluaran, danaMasuk } = postBody.data;
      
      if (Array.isArray(rab)) {
        let sheetRab = ss.getSheetByName(SHEET_NAMES.RAB) || ss.insertSheet(SHEET_NAMES.RAB);
        sheetRab.clear();
        sheetRab.getRange('A1:J1').setValues([[
          'ID', 'Bulan', 'Tahun', 'Kode', 'Kategori', 'Kegiatan', 'Anggaran', 'Realisasi', 'Sisa', 'Status'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (rab.length > 0) {
          const rows = rab.map(item => [
            item.id, item.bulan, item.tahun, item.kode, item.kategori,
            item.kegiatan, item.anggaran, item.realisasi, item.sisa, item.status
          ]);
          sheetRab.getRange(2, 1, rows.length, 10).setValues(rows);
        }
      }
      
      if (Array.isArray(pengeluaran)) {
        let sheetPengeluaran = ss.getSheetByName(SHEET_NAMES.PENGELUARAN) || ss.insertSheet(SHEET_NAMES.PENGELUARAN);
        sheetPengeluaran.clear();
        sheetPengeluaran.getRange('A1:I1').setValues([[
          'ID', 'Tanggal', 'RAB ID', 'Kode', 'Kategori', 'Kegiatan', 'Keterangan', 'Nominal', 'Bukti'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (pengeluaran.length > 0) {
          const rows = pengeluaran.map(item => [
            item.id, item.tanggal, item.rabId, item.kode, item.kategori,
            item.kegiatan, item.keterangan, item.nominal, item.bukti || ''
          ]);
          sheetPengeluaran.getRange(2, 1, rows.length, 9).setValues(rows);
        }
      }

      if (Array.isArray(danaMasuk)) {
        let sheetDanaMasuk = ss.getSheetByName(SHEET_NAMES.DANA_MASUK) || ss.insertSheet(SHEET_NAMES.DANA_MASUK);
        sheetDanaMasuk.clear();
        sheetDanaMasuk.getRange('A1:G1').setValues([[
          'ID', 'Tanggal', 'Bulan', 'Tahun', 'Sumber', 'Nominal', 'Keterangan'
        ]]).setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
        
        if (danaMasuk.length > 0) {
          const rows = danaMasuk.map(item => [
            item.id, item.tanggal, item.bulan, item.tahun, item.sumber,
            item.nominal, item.keterangan || ''
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

function handleGetAllData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const sheetRab = ss.getSheetByName(SHEET_NAMES.RAB);
    const rabData = [];
    if (sheetRab && sheetRab.getLastRow() > 1) {
      const rows = sheetRab.getRange(2, 1, sheetRab.getLastRow() - 1, 10).getValues();
      rows.forEach(r => {
        if (r[0]) {
          rabData.push({
            id: String(r[0]), bulan: Number(r[1]) || 1, tahun: Number(r[2]) || new Date().getFullYear(),
            kode: String(r[3]), kategori: String(r[4]), kegiatan: String(r[5]),
            anggaran: Number(r[6]) || 0, realisasi: Number(r[7]) || 0, sisa: Number(r[8]) || 0, status: String(r[9]) || 'Aman'
          });
        }
      });
    }
    
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
            id: String(r[0]), tanggal: String(tgl), rabId: String(r[2]), kode: String(r[3]),
            kategori: String(r[4]), kegiatan: String(r[5]), keterangan: String(r[6]),
            nominal: Number(r[7]) || 0, bukti: String(r[8] || '')
          });
        }
      });
    }

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
            id: String(r[0]), tanggal: String(tgl), bulan: Number(r[2]) || 1,
            tahun: Number(r[3]) || new Date().getFullYear(), sumber: String(r[4]),
            nominal: Number(r[5]) || 0, keterangan: String(r[6] || '')
          });
        }
      });
    }
    
    return responseJSON({
      status: 'success',
      data: { rab: rabData, pengeluaran: pengeluaranData, danaMasuk: danaMasukData }
    });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const setupSheet = (name, headers) => {
    let sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clear();
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#064e3b').setFontColor('#ffffff');
  };

  setupSheet(SHEET_NAMES.RAB, ['ID', 'Bulan', 'Tahun', 'Kode', 'Kategori', 'Kegiatan', 'Anggaran', 'Realisasi', 'Sisa', 'Status']);
  setupSheet(SHEET_NAMES.PENGELUARAN, ['ID', 'Tanggal', 'RAB ID', 'Kode', 'Kategori', 'Kegiatan', 'Keterangan', 'Nominal', 'Bukti']);
  setupSheet(SHEET_NAMES.DANA_MASUK, ['ID', 'Tanggal', 'Bulan', 'Tahun', 'Sumber', 'Nominal', 'Keterangan']);
  setupSheet(SHEET_NAMES.KATEGORI, ['Kode', 'Kategori', 'Status']);
  setupSheet(SHEET_NAMES.PENGATURAN, ['Parameter', 'Nilai']);
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

fs.writeFileSync('gas-deploy/Code.gs', codeGs);

console.log('All GAS deployment files generated successfully!');
