# Vaktim Web

Static site for vaktim.app (landing, davet, verify-email).

## Deploy (Vercel)

**Önemli:** 404 almamak için Vercel proje ayarlarında:

1. **Settings** → **General**
2. **Build Command:** `npm run build` yazın (zorunlu)
3. **Output Directory:** boş bırakın
4. **Framework Preset:** Other

Build, static dosyaları `.vercel/output/static` içine kopyalar ve `/davet`, `/davet/CODE` için rewrite kurallarını yazar. Build çalışmazsa `/davet` 404 döner.

Deploy sonrası: https://vaktim.app/davet/XXXXX çalışmalı.
