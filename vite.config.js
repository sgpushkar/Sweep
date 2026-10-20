import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'serve-apk-with-mime',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Normalize URL query or hash
          const cleanUrl = req.url ? req.url.split('?')[0].split('#')[0] : '';
          if (cleanUrl.endsWith('.apk') || cleanUrl.includes('/releases/WhatsAppMediaCleaner.apk')) {
            const apkPath = path.resolve(__dirname, 'public/releases/WhatsAppMediaCleaner.apk');
            if (fs.existsSync(apkPath)) {
              const stat = fs.statSync(apkPath);
              const total = stat.size;

              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="WhatsAppMediaCleaner.apk"');
              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Cache-Control', 'public, max-age=3600');

              const range = req.headers.range;
              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const partialStart = parts[0];
                const partialEnd = parts[1];
                const start = parseInt(partialStart, 10);
                const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
                const chunksize = end - start + 1;

                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${total}`,
                  'Content-Length': chunksize,
                });
                fs.createReadStream(apkPath, { start, end }).pipe(res);
                return;
              }

              res.writeHead(200, {
                'Content-Length': total,
              });
              fs.createReadStream(apkPath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  build: {
    target: 'es2019',
  },
});
