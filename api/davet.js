/**
 * Serverless handler for /davet and /davet/CODE.
 * vercel.json rewrites send these to /api/davet. We return the HTML;
 * the browser URL stays /davet/CODE so client-side JS reads the code from pathname.
 */

const fs = require('fs');
const path = require('path');

let htmlCache = null;

function getHtml() {
  if (htmlCache) return htmlCache;
  try {
    const p = path.join(process.cwd(), 'davet', 'index.html');
    htmlCache = fs.readFileSync(p, 'utf8');
  } catch (e) {
    htmlCache = '<!DOCTYPE html><html><body><h1>Davet</h1><p>Sayfa yüklenemedi.</p></body></html>';
  }
  return htmlCache;
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(getHtml());
};
