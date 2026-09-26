import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));
const port = 3000;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // File database path
  const dbPath = path.join(__dirname, 'data.json');

  // Helper to read database
  const readDb = () => {
    const fallback = {
      rab: [
        {
          "id": "RAB-2026-09-001",
          "bulan": 9,
          "tahun": 2026,
          "kode": "G101",
          "kategori": "Keasramaan",
          "kegiatan": "Keasramaan",
          "anggaran": 78888,
          "keterangan": "Anggaran awal keasramaan"
        }
      ],
      pengeluaran: [
        {
          "id": "EXP-2026-09-001",
          "tanggal": "2026-09-25",
          "rabId": "RAB-2026-09-001",
          "kode": "G101",
          "kategori": "Keasramaan",
          "kegiatan": "Keasramaan",
          "keterangan": "Pembelian perlengkapan keasramaan",
          "nominal": 78888,
          "bukti": ""
        }
      ],
      danaMasuk: [
        {
          "id": "DM-2026-09-001",
          "tanggal": "2026-09-01",
          "bulan": 9,
          "tahun": 2026,
          "sumber": "Pencairan Tahap 1",
          "nominal": 100000,
          "keterangan": "Dana awal masuk asrama"
        }
      ],
      kategori: [
        {
          "kode": "G101",
          "kategori": "Keasramaan",
          "status": "Aktif",
          "deskripsi": "Kegiatan keasramaan dan kebersihan asrama",
          "subKategori": ["Keasramaan"]
        }
      ],
      settings: {
        "googleScriptUrl": "https://script.google.com/macros/s/AKfycbx2ihJJGgx6zBYknOuQCJdgAsn7WhH4LY9ROH1N0z6Db4sNfgfwyDK16F-knuST_DMY/exec",
        "sheetId": "",
        "institutionName": "MA'HAD ALY AL FURQON MAGELANG",
        "subDivision": "DIVISI KEMAHASANTRIAN",
        "address": "Jl. Srikandi No. 1, Tempuran, Magelang, Jawa Tengah 56161",
        "bendaharaName": "Ust. Muhammad Rizqi, S.Ag.",
        "mudirName": "Ust. Ahmad Zainuri, Lc., M.H.",
        "academicYear": "1447-1448 H / 2026-2027 M",
        "autoSync": false,
        "lastSyncTime": ""
      }
    };

    if (!fs.existsSync(dbPath)) {
      return fallback;
    }
    try {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
      return fallback;
    }
  };

  // Helper to write database
  const writeDb = (data: any) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error writing DB:', err);
      return false;
    }
  };

  // API Endpoints
  app.get('/api/data', (req, res) => {
    res.json(readDb());
  });

  app.post('/api/data', (req, res) => {
    const success = writeDb(req.body);
    res.json({ success });
  });

  app.get('/api/download-gas-html', (req, res) => {
    const filePath = path.resolve(__dirname, 'dist', 'index.html');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-disposition', 'attachment; filename=index.html');
      res.setHeader('Content-type', 'text/html');
      res.sendFile(filePath);
    } else {
      res.status(404).send('File index.html belum terbuat. Silakan jalankan build terlebih dahulu di panel developer.');
    }
  });

  // Vite integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

createServer();
