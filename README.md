# sentilokal

> Built with vibe coding — analisis sentimen produk lokal dalam 1 command.

[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://www.npmjs.com/package/sentilokal)

Project documentation generated automatically.

## Fitur

- Scrape review dari Tokopedia/Shopee/Bukalapak
- Klasifikasi sentimen otomatis (Positif/Netral/Negatif)
- Deteksi kata kunci dari review
- Dashboard HTML interaktif dengan Chart.js
- Fallback data sampel kalau scraping gagal

## Instalasi

```bash
npm install
cp .env.example .env
```

Isi API key kalau mau mode AI.

## Cara Menjalankan

```bash
node index.js analyze <url_produk>
```

## Struktur File

```text
.
├── .env.example
├── .gitignore
├── data
│   └── sample.json
├── index.js
├── package-lock.json
├── package.json
├── report.html
└── src
    ├── analyzer.js
    └── scraper.js
```

## Teknologi

- Commander.js
- Chalk
- dotenv
- OpenAI
- Axios

## Lisensi

Distribusi proyek ini menggunakan lisensi ISC.
