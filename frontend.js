const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5500;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

function getMime(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveFile(filePath, res, notFoundMsg) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(notFoundMsg || '404 Not Found');
      } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500 Internal Server Error');
      }
      return;
    }
    res.writeHead(200, {'Content-Type': getMime(filePath)});
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  if (url.startsWith('/api/') || url === '/api') {
    res.writeHead(404);
    res.end();
    return;
  }

  if (url === '/' || url === '') {
    url = '/views/index.html';
  } else if (!url.includes('.') && !url.startsWith('/views/')) {
    url = '/views' + url + '.html';
  }

  const filePath = path.join(ROOT, url);

  if (!fs.existsSync(filePath)) {
    if (url.endsWith('.html') && !url.startsWith('/views/')) {
      const altPath = path.join(ROOT, 'views', path.basename(url));
      if (fs.existsSync(altPath)) {
        return serveFile(altPath, res, `404 Not Found: ${url}`);
      }
    }
    return serveFile(filePath, res, `404 Not Found: ${url}`);
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
  console.log(`Serving from: ${ROOT}`);
});