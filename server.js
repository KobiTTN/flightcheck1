const http = require('http');
const https = require('https');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const PORT = process.env.PORT || 3000;

if (!RAPIDAPI_KEY) {
  console.error('❌ RAPIDAPI_KEY не задано! Створи .env файл або задай змінну середовища.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Роздаємо index.html на /
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(data);
    });
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/flight') {
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  const iata = url.searchParams.get('iata')?.toUpperCase().replace(/\s+/g, '');
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!iata) {
    res.writeHead(400); res.end(JSON.stringify({ error: 'Missing iata param' })); return;
  }

  const path = `/flights/number/${iata}/${date}`;
  console.log(`→ Запит: GET ${path}`);

  const options = {
    hostname: 'aerodatabox.p.rapidapi.com',
    path: path,
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      console.log(`← HTTP ${apiRes.statusCode}: ${data.slice(0, 120)}`);

      if (apiRes.statusCode === 404 || data === '') {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Рейс не знайдено' }));
        return;
      }

      try {
        const json = JSON.parse(data);
        res.writeHead(200);
        res.end(JSON.stringify(json));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Parse error', raw: data.slice(0, 300) }));
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('Помилка:', e.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  });

  apiReq.end();
});

server.listen(PORT, () => {
  console.log(`✓ FlightCheck запущено: http://localhost:${PORT}`);
});
