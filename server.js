const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Disable x-powered-by header (security)
app.disable('x-powered-by');

// Serve only specific files instead of the whole project directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Block private/local IPs from being proxied (SSRF protection)
function isPrivateHost(hostname) {
  if (!hostname) return true;
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '::') return true;
  // IPv4 private ranges
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const o = m.slice(1).map(Number);
    if (o[0] === 10) return true;
    if (o[0] === 127) return true;
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
    if (o[0] === 192 && o[1] === 168) return true;
    if (o[0] === 169 && o[1] === 254) return true;
    if (o[0] === 0) return true;
  }
  // IPv6 link-local / loopback
  if (h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
  return false;
}

// Simple per-IP rate limiter (in-memory, resets on restart)
const rateBucket = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = rateBucket.get(ip);
  if (!bucket || now - bucket.start > 60000) {
    bucket = { start: now, count: 0 };
    rateBucket.set(ip, bucket);
  }
  bucket.count++;
  if (bucket.count > 200) {
    return res.status(429).send('Too many requests. Wait a minute and retry.');
  }
  next();
}

// Cap proxied response body size (10 MB)
const MAX_BODY = 10 * 1024 * 1024;

function fetchUrl(targetUrl, callback) {
  let parsed;
  try { parsed = new URL(targetUrl); } catch (e) { return callback(e); }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return callback(new Error('Only http(s) URLs are allowed'));
  }
  if (isPrivateHost(parsed.hostname)) {
    return callback(new Error('Cannot proxy private/local addresses'));
  }
  const client = parsed.protocol === 'https:' ? https : http;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port,
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'identity'
    },
    timeout: 15000
  };

  const proxyReq = client.request(options, (proxyRes) => {
    const { statusCode, headers } = proxyRes;
    callback(null, { statusCode, headers, stream: proxyRes });
  });

  proxyReq.on('error', (err) => {
    callback(err);
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    callback(new Error('Request timed out'));
  });

  proxyReq.end();
}

app.get('/proxy', rateLimit, (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('<html><body style="background:#0a0a1a;color:#e0e0f0;font-family:system-ui;padding:40px"><h1>400</h1><p>Missing URL parameter</p></body></html>');
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('<html><body style="background:#0a0a1a;color:#e0e0f0;font-family:system-ui;padding:40px"><h1>400</h1><p>Invalid URL</p></body></html>');
  }

  fetchUrl(targetUrl, (err, result) => {
    if (err) {
      return res.status(502).send(`<html><body style="background:#0a0a1a;color:#e0e0f0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;margin:0"><h1 style="color:#ff5f57">502</h1><p>Failed to load: ${targetUrl.replace(/[<>&]/g, '')}</p><p style="color:#666;font-size:13px">${(err.message || '').replace(/[<>&]/g, '')}</p><p style="color:#555;font-size:11px">Try a different site or check the URL</p></body></html>`);
    }

    const { statusCode, headers, stream } = result;

    if ([301, 302, 303, 307, 308].includes(statusCode)) {
      const loc = headers.location;
      if (loc) {
        try {
          const redirectUrl = new URL(loc, targetUrl);
          return res.redirect(`/proxy?url=${encodeURIComponent(redirectUrl.href)}`);
        } catch (e) {
          // fall through to serve body
        }
      }
    }

    const contentType = headers['content-type'] || '';

    // Strip frame-blocking & dangerous headers
    const safeHeaders = {};
    Object.keys(headers).forEach((key) => {
      const lk = key.toLowerCase();
      if (lk === 'x-frame-options') return;
      if (lk === 'content-security-policy' || lk === 'content-security-policy-report-only') {
        const cleaned = headers[key]
          .replace(/frame-ancestors\s+[^;]+;?/gi, '')
          .replace(/frame-src\s+[^;]+;?/gi, 'frame-src *;');
        if (cleaned.trim()) safeHeaders[key] = cleaned;
        return;
      }
      if (['set-cookie', 'content-encoding', 'transfer-encoding', 'content-length', 'strict-transport-security'].includes(lk)) return;
      safeHeaders[key] = headers[key];
    });
    safeHeaders['x-content-type-options'] = 'nosniff';
    safeHeaders['referrer-policy'] = 'no-referrer';

    if (contentType.includes('text/html')) {
      let body = '';
      let bytes = 0;
      let aborted = false;
      stream.on('data', (chunk) => {
        if (aborted) return;
        bytes += chunk.length;
        if (bytes > MAX_BODY) {
          aborted = true;
          stream.destroy();
          return;
        }
        body += chunk.toString();
      });
      stream.on('end', () => {
        if (aborted) return res.status(413).send('Response too large');
        let html = body;

        // Inject <base> tag
        const baseUrl = new URL(targetUrl);
        const baseTag = `<base href="${baseUrl.origin}/">`;
        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/<head[^>]*>/i, `$&${baseTag}`);
        } else if (/<html[^>]*>/i.test(html)) {
          html = html.replace(/<html[^>]*>/i, `$&<head>${baseTag}</head>`);
        } else {
          html = baseTag + html;
        }

        // Inject proxy-aware navigation script
        const proxyScript = `<script>
(function(){
  if(window.__sp) return; window.__sp=1;
  var base=document.querySelector('base'),bh=base?base.href:'';
  document.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a||!a.href)return;
    if(a.href.startsWith('javascript:')||a.href.startsWith('#')||a.getAttribute('download')!=null)return;
    try{var u=new URL(a.href,bh);if(u.origin!==location.origin||a.target==='_blank'||a.target==='_top'){e.preventDefault();window.parent.postMessage({type:'nav',url:u.href},'*')}}catch(ex){}
  },true);
  document.addEventListener('submit',function(e){
    var f=e.target;if(!f.action||f.method==='post')return;
    try{var u=new URL(f.action,bh);if(u.origin!==location.origin){e.preventDefault();window.parent.postMessage({type:'nav',url:u.href+'?'+new URLSearchParams(new FormData(f)).toString()},'*')}}catch(ex){}
  },true);
  ['pushState','replaceState'].forEach(function(m){var o=history[m];history[m]=function(){var r=o.apply(this,arguments);window.parent.postMessage({type:'nav',url:location.href},'*');return r}});
  var d=Object.getOwnPropertyDescriptor(Location.prototype,'href');
  if(d&&d.set){var oSet=d.set;Object.defineProperty(Location.prototype,'href',{set:function(v){oSet.call(this,v);window.parent.postMessage({type:'nav',url:v},'*')},configurable:true})}
})();
<\/script>`;

        if (/<\/body>/i.test(html)) {
          html = html.replace(/<\/body>/i, `${proxyScript}</body>`);
        } else {
          html += proxyScript;
        }

        res.status(statusCode).set(safeHeaders).send(html);
      });
      stream.on('error', () => { if (!aborted) res.status(502).end(); });
    } else if (contentType.includes('text/css')) {
      let body = '';
      let bytes = 0;
      let aborted = false;
      stream.on('data', (chunk) => {
        if (aborted) return;
        bytes += chunk.length;
        if (bytes > MAX_BODY) { aborted = true; stream.destroy(); return }
        body += chunk.toString();
      });
      stream.on('end', () => {
        if (aborted) return res.status(413).end();
        let css = body;
        css = css.replace(/url\(\s*["']?(?!https?:\/\/|data:)([^)"']+)["']?\s*\)/g, (match, assetUrl) => {
          try {
            const abs = new URL(assetUrl, targetUrl);
            return `url("/proxy-asset?url=${encodeURIComponent(abs.href)}")`;
          } catch (e) { return match; }
        });
        res.set('Content-Type', 'text/css');
        res.send(css);
      });
      stream.on('error', () => { if (!aborted) res.status(502).end(); });
    } else {
      // Stream binary content directly (with cap)
      res.status(statusCode).set(safeHeaders);
      let bytes = 0;
      stream.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > MAX_BODY) {
          stream.destroy();
          res.end();
        }
      });
      stream.pipe(res);
    }
  });
});

// Asset proxy for resources within proxied pages
app.get('/proxy-asset', rateLimit, (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).end();

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  fetchUrl(targetUrl, (err, result) => {
    if (err) return res.status(502).end();

    const { statusCode, headers, stream } = result;
    const contentType = headers['content-type'] || '';

    const safeHeaders = {};
    Object.keys(headers).forEach((key) => {
      const lk = key.toLowerCase();
      if (['set-cookie', 'transfer-encoding', 'content-encoding', 'x-frame-options', 'strict-transport-security', 'content-security-policy'].includes(lk)) return;
      safeHeaders[key] = headers[key];
    });
    safeHeaders['x-content-type-options'] = 'nosniff';

    if (contentType.includes('text/css') || contentType.includes('javascript') || contentType.includes('text/html')) {
      let body = '';
      let bytes = 0;
      let aborted = false;
      stream.on('data', (chunk) => {
        if (aborted) return;
        bytes += chunk.length;
        if (bytes > MAX_BODY) { aborted = true; stream.destroy(); return }
        body += chunk.toString();
      });
      stream.on('end', () => {
        if (aborted) return res.status(413).end();
        let text = body;
        if (contentType.includes('text/css')) {
          text = text.replace(/url\(\s*["']?(?!https?:\/\/|data:)([^)"']+)["']?\s*\)/g, (match, assetUrl) => {
            try {
              const abs = new URL(assetUrl, targetUrl);
              return `url("/proxy-asset?url=${encodeURIComponent(abs.href)}")`;
            } catch (e) { return match; }
          });
        }
        res.set(safeHeaders).send(text);
      });
      stream.on('error', () => { if (!aborted) res.status(502).end(); });
    } else {
      res.status(statusCode).set(safeHeaders);
      let bytes = 0;
      stream.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > MAX_BODY) { stream.destroy(); res.end(); }
      });
      stream.pipe(res);
    }
  });
});

// Process error handlers to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

app.listen(PORT, () => {
  console.log(`Serenity X running at http://localhost:${PORT}`);
  console.log('Browser proxy enabled - external sites load through /proxy');
  console.log('Security: private addresses blocked, rate-limited to 200 req/min/IP, 10 MB body cap');
});
