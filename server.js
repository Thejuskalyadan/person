// ════════════════════════════════════════════════════════════════
//  Proposal Notification Backend  ·  Pure Node.js  ·  No npm needed
//  Edit CONFIG below, then: node server.js
// ════════════════════════════════════════════════════════════════

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Load .env file for local development (no npm needed) ───────
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val; // don't override real env vars
  }
})();

// ── CONFIG ─────────────────────────────────────────────────────
const CONFIG = {
  PORT              : process.env.PORT              || 3000,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID  : process.env.TELEGRAM_CHAT_ID   || '',
  ALLOWED_ORIGIN    : process.env.ALLOWED_ORIGIN      || '*',
};
// ───────────────────────────────────────────────────────────────

// ── HELPERS ────────────────────────────────────────────────────

/** Return the current time as a human-readable IST string */
function nowIST() {
  return new Date().toLocaleString('en-IN', {
    timeZone   : 'Asia/Kolkata',
    weekday    : 'long',
    year       : 'numeric',
    month      : 'long',
    day        : 'numeric',
    hour       : '2-digit',
    minute     : '2-digit',
    second     : '2-digit',
    hour12     : true,
  });
}

/** Send a Telegram message using the Bot API */
function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      chat_id   : CONFIG.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      path    : `/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Read the full JSON body from an IncomingMessage */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => (raw += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

/** Set CORS headers on every response */
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin',  CONFIG.ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/** Send a JSON response */
function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type'  : 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

// ── ROUTE HANDLERS ─────────────────────────────────────────────

async function handleHealth(req, res) {
  json(res, 200, { ok: true, time: new Date().toISOString() });
}

async function handleYes(req, res) {
  const body   = await readBody(req);
  const device = body.device || 'Unknown';
  const time   = nowIST();

  // ── Terminal celebratory log ──
  const sep = '═'.repeat(56);
  console.log(`\n\x1b[35m${sep}\x1b[0m`);
  console.log(`\x1b[33m  🎉  SHE SAID YES !!!  🎉\x1b[0m`);
  console.log(`\x1b[35m${sep}\x1b[0m`);
  console.log(`\x1b[36m  Time   :\x1b[0m ${time}`);
  console.log(`\x1b[36m  Device :\x1b[0m ${device}`);
  console.log(`\x1b[35m${sep}\x1b[0m\n`);

  // ── Telegram message ──
  const tgMessage = [
    `<b>💍 SHE SAID YES!!!</b>`,
    ``,
    `🕐 <b>Time:</b> ${time}`,
    `📱 <b>Device:</b> ${device}`,
    ``,
    `<i>"My bounty is as boundless as the sea,`,
    `my love as deep; the more I give to thee,`,
    `the more I have, for both are infinite."</i>`,
    `— Shakespeare, Romeo &amp; Juliet`,
    ``,
    `❤️ Congratulations! This is the moment. ❤️`,
  ].join('\n');

  try {
    await sendTelegram(tgMessage);
    console.log('  ✓  Telegram notification sent.\n');
  } catch (err) {
    console.error('  ✗  Telegram error:', err.message);
  }

  json(res, 200, { ok: true });
}

// ── SERVER ─────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  setCORS(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  try {
    if (url === '/health' && req.method === 'GET') {
      await handleHealth(req, res);
    } else if (url === '/api/yes' && req.method === 'POST') {
      await handleYes(req, res);
    } else {
      json(res, 404, { ok: false, error: 'Not found' });
    }
  } catch (err) {
    console.error('Server error:', err);
    json(res, 500, { ok: false, error: 'Internal server error' });
  }
});

server.listen(CONFIG.PORT, () => {
  console.log(`\x1b[35m╔══════════════════════════════════════════╗\x1b[0m`);
  console.log(`\x1b[35m║  💌  Proposal Notification Server        ║\x1b[0m`);
  console.log(`\x1b[35m╚══════════════════════════════════════════╝\x1b[0m`);
  console.log(`\x1b[32m  Listening on port ${CONFIG.PORT}\x1b[0m`);
  console.log(`\x1b[33m  GET  /health\x1b[0m`);
  console.log(`\x1b[33m  POST /api/yes\x1b[0m`);
  console.log(`\x1b[90m  Telegram → ${CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' ? '⚠ not configured' : '✓ configured'}\x1b[0m\n`);
});
