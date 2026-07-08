import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const REFERENCE_DIR = join(
  process.env.HOME ?? '~',
  'Desktop/diagram-architecture-review'
);
const PORT = 8081;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : (req.url ?? '/index.html');
  const filePath = join(REFERENCE_DIR, url);
  const ext = extname(filePath);

  void readFile(filePath).then(
    (content) => {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
      res.end(content);
    },
    () => {
      res.writeHead(404);
      res.end('Not found');
    }
  );
});

// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Reference server: http://localhost:${PORT}`));
