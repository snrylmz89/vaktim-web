/**
 * Vaktim Web - Font Self-Hosting Script
 * Google Fonts yerine local font kullanımı için fontları indirir.
 * Kullanım: node download-fonts.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = {
  // Plus Jakarta Sans (variable font - tüm weightler için aynı dosyalar)
  'plus-jakarta-sans-latin.woff2':        'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  'plus-jakarta-sans-latin-ext.woff2':    'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko40yyygA.woff2',
  'plus-jakarta-sans-vietnamese.woff2':   'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko50yyygA.woff2',
  'plus-jakarta-sans-cyrillic-ext.woff2': 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko70yyygA.woff2',
  // Amiri 400
  'amiri-400-arabic.woff2':               'https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHpUrtLMA7w.woff2',
  'amiri-400-latin-ext.woff2':            'https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHpUgtLMA7w.woff2',
  'amiri-400-latin.woff2':                'https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHpUutLM.woff2',
  // Amiri 700
  'amiri-700-arabic.woff2':               'https://fonts.gstatic.com/s/amiri/v30/J7acnpd8CGxBHp2VkaY6zp5yGw.woff2',
  'amiri-700-latin-ext.woff2':            'https://fonts.gstatic.com/s/amiri/v30/J7acnpd8CGxBHp2VkaYxzp5yGw.woff2',
  'amiri-700-latin.woff2':                'https://fonts.gstatic.com/s/amiri/v30/J7acnpd8CGxBHp2VkaY_zp4.woff2',
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const fontsDir = path.join(__dirname, 'fonts');
  if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

  for (const [filename, url] of Object.entries(fonts)) {
    const dest = path.join(fontsDir, filename);
    process.stdout.write(`İndiriliyor: ${filename} ... `);
    await downloadFile(url, dest);
    const size = fs.statSync(dest).size;
    console.log(`✓ (${(size / 1024).toFixed(1)} KB)`);
  }

  console.log('\nTüm fontlar başarıyla indirildi → /fonts/ klasörü');
}

main().catch(err => {
  console.error('Hata:', err.message);
  process.exit(1);
});
