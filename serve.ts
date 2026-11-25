// Dapur Kilat — tiny static server for the game/ folder.
// Node 22, standard library only. Serves game/ at the root, refuses any
// path that would climb out of it, and stays quiet except for startup.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

const gameRoot = resolve(process.cwd(), 'game');

function safePath(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const joined = resolve(gameRoot, '.' + decoded);
  if (joined !== gameRoot && !joined.startsWith(gameRoot + '/')) return null;
  return joined;
}

const port = Number(process.argv.find((a) => a === '--port') ? process.argv[process.argv.indexOf('--port') + 1] : 8080) || 8080;

const server = createServer((req, res) => {
  const raw = req.url || '/';
  let path = safePath(raw === '/' ? '/index.html' : raw);
  if (!path) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('forbidden\n');
    return;
  }
  try {
    if (existsSync(path) && statSync(path).isDirectory()) {
      path = join(path, 'index.html');
    }
    const body = readFileSync(path);
    res.writeHead(200, {
      'content-type': MIME[extname(path).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found\n');
  }
});

server.listen(port, () => {
  console.log('Dapur Kilat serving game/ at http://localhost:' + port);
});
