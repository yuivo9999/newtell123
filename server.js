import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Optional CORS forward proxy to allow calling AI providers that don't enable browser CORS
app.use('/api/proxy', async (req, res) => {
  const targetPath = req.path.replace(/^\//, '');
  const targetBase = req.query.target || req.headers['x-target-url'] || 'https://api.deepseek.com';
  const targetUrl = `${String(targetBase).replace(/\/+$/, '')}/${targetPath}`;

  try {
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;
    delete forwardHeaders['content-length'];
    delete forwardHeaders['x-target-url'];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    });

    res.status(response.status);
    response.headers.forEach((val, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });

    if (req.headers.accept?.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) return res.end();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await response.text();
      res.send(data);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Proxy request failed: ' + (err.message || String(err)) });
  }
});

// Serve static assets from project root
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
