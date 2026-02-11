#!/usr/bin/env node
/**
 * Vercel Build Output API: copy static files to .vercel/output/static
 * and write config with davet rewrites. Fixes 404 on /davet and /davet/CODE.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const outDir = path.join(root, '.vercel', 'output');
const staticDir = path.join(outDir, 'static');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Ensure output dirs
fs.mkdirSync(staticDir, { recursive: true });

// Copy root HTML
for (const name of ['index.html', 'verify-email.html']) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(staticDir, name));
}

// Copy davet folder
const davetSrc = path.join(root, 'davet');
if (fs.existsSync(davetSrc)) {
  const davetDest = path.join(staticDir, 'davet');
  fs.mkdirSync(davetDest, { recursive: true });
  fs.copyFileSync(
    path.join(davetSrc, 'index.html'),
    path.join(davetDest, 'index.html')
  );
}

// Copy .well-known
const wellKnownSrc = path.join(root, '.well-known');
if (fs.existsSync(wellKnownSrc)) {
  copyRecursive(wellKnownSrc, path.join(staticDir, '.well-known'));
}

// config.json: rewrites + .well-known content-type
const config = {
  version: 3,
  routes: [
    { src: '/davet', dest: '/davet/index.html' },
    { src: '/davet/', dest: '/davet/index.html' },
    { src: '/davet/(.*)', dest: '/davet/index.html' }
  ],
  overrides: {
    '.well-known/apple-app-site-association': { contentType: 'application/json' },
    '.well-known/assetlinks.json': { contentType: 'application/json' }
  }
};

fs.writeFileSync(
  path.join(outDir, 'config.json'),
  JSON.stringify(config, null, 2)
);

console.log('Build done: .vercel/output/static + config.json');
