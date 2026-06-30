#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const { scrapeReviews } = require('./src/scraper');
const { analyzeSentiment } = require('./src/analyzer');

const program = new Command();

program
  .name('sentilokal')
  .description('CLI untuk menganalisis sentimen dari ulasan produk')
  .version('1.0.0');

program
  .command('analyze <url>')
  .description('Menganalisis sentimen dari URL yang diberikan')
  .action((url) => {
    console.log(chalk.cyan('Menganalisis...'));
    console.log(chalk.gray(`URL: ${url}`));

    scrapeReviews(url)
      .then((reviews) => {
        const result = analyzeSentiment(reviews);

        console.log(chalk.yellow(`Jumlah review: ${reviews.length}`));
        console.log(chalk.cyan(`Rata-rata rating: ${result.averageRating}`));
        console.log(chalk.green(`Sentimen - Positif: ${result.sentiment.positive}% | Netral: ${result.sentiment.neutral}% | Negatif: ${result.sentiment.negative}%`));
        console.log(chalk.magenta(`Kata kunci: ${result.keywords.join(', ') || '-'}`));

        const reportPath = path.join(__dirname, 'report.html');
        const reportHtml = `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentiment Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 24px;
        background: #0f172a;
        color: #e2e8f0;
      }
      .card {
        background: #111827;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      }
      h1, h2 {
        margin-top: 0;
        color: #f8fafc;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        text-align: left;
        padding: 10px;
        border-bottom: 1px solid #334155;
      }
      .tag {
        display: inline-block;
        padding: 6px 10px;
        margin: 4px;
        background: #1d4ed8;
        border-radius: 999px;
        color: white;
      }
      canvas {
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Sentiment Analysis Report</h1>
      <p>URL: ${url}</p>
      <p>Total review: ${reviews.length}</p>
      <p>Rata-rata rating: ${result.averageRating}</p>
    </div>

    <div class="card">
      <h2>Ringkasan Sentimen</h2>
      <table>
        <thead>
          <tr>
            <th>Sentimen</th>
            <th>Persentase</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Positif</td><td>${result.sentiment.positive}%</td></tr>
          <tr><td>Netral</td><td>${result.sentiment.neutral}%</td></tr>
          <tr><td>Negatif</td><td>${result.sentiment.negative}%</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Chart Sentimen</h2>
      <canvas id="sentimentChart"></canvas>
    </div>

    <div class="card">
      <h2>Kata Kunci</h2>
      <div>${(result.keywords || []).map((keyword) => `<span class="tag">${keyword}</span>`).join('')}</div>
    </div>

    <script>
      const ctx = document.getElementById('sentimentChart');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Positif', 'Netral', 'Negatif'],
          datasets: [{
            label: 'Persentase',
            data: [${result.sentiment.positive}, ${result.sentiment.neutral}, ${result.sentiment.negative}],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } }
        }
      });
    </script>
  </body>
</html>`;
        fs.writeFileSync(reportPath, reportHtml, 'utf8');
        console.log(chalk.green(`✅ Laporan disimpan: ${path.basename(reportPath)}`));

        const sample = reviews.slice(0, 3);

        if (sample.length > 0) {
          console.log(chalk.green('Contoh review:'));
          sample.forEach((review, index) => {
            console.log(chalk.white(`${index + 1}. ${review.user || 'Anonim'}: ${review.text || '-'} [rating: ${review.rating || 0}]`));
          });
        } else {
          console.log(chalk.gray('Tidak ada review yang ditemukan.'));
        }
      })
      .catch((error) => {
        console.error(chalk.red('Gagal menganalisis:'), error.message);
      });
  });

program.parseAsync(process.argv);
