require('dotenv').config();
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const cors = require('cors');
const messageRoutes = require('./routes/messages');

let isWhatsAppReady = false;
let currentQR = null;

// ── WhatsApp Client ──────────────────────────────────────────────────────────
// Use system Chromium on Linux servers (Render/Docker), fallback to default on Windows
const puppeteerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--single-process',       // needed on low-memory servers
  ],
};

// On Linux (Render/Docker), Chromium is at /usr/bin/chromium
if (process.platform === 'linux') {
  puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'ganesh-bot' }),
  webVersion: '2.2412.54',
  webVersionCache: {
    type: 'none',
  },
  puppeteer: puppeteerConfig,
});

client.on('qr', (qr) => {
  currentQR = qr;
  console.log('\n================================================');
  console.log('  SCAN THIS QR CODE WITH WHATSAPP ON YOUR PHONE');
  console.log('================================================\n');
  qrcode.generate(qr, { small: true });
  console.log('\n================================================\n');
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp Authenticated!');
});

client.on('ready', () => {
  isWhatsAppReady = true;
  currentQR = null;
  console.log('\n✅ WhatsApp Ready — Bot is connected!');
  console.log('👉 Open in browser: http://localhost:3001/api/send-bulk-message\n');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Auth Failed:', msg);
  isWhatsAppReady = false;
});

client.on('disconnected', (reason) => {
  console.warn('⚠️  WhatsApp Disconnected:', reason);
  isWhatsAppReady = false;
});

console.log('⏳ Starting WhatsApp... QR code will appear in 20-30 seconds...\n');
client.initialize();

// ── Express Server ───────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  req.whatsappClient = client;
  req.isWhatsAppReady = isWhatsAppReady; // live value — updated by client events above
  next();
});

app.use('/api', messageRoutes);

// Status check
app.get('/status', (_req, res) => {
  const ready = isWhatsAppReady && !!client.info;
  res.json({
    whatsapp: ready ? 'ready ✅' : 'not ready ⏳',
  });
});

// QR code endpoint — returns base64 image for UI
app.get('/qr', async (_req, res) => {
  if (isWhatsAppReady) {
    return res.json({ ready: true, qr: null });
  }
  if (currentQR) {
    try {
      const qrImage = await QRCode.toDataURL(currentQR);
      return res.json({ ready: false, qr: qrImage });
    } catch {
      return res.json({ ready: false, qr: null, message: 'Error generating QR image' });
    }
  }
  return res.json({ ready: false, qr: null, message: 'QR not generated yet, please wait 30 seconds...' });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Check status: http://localhost:${PORT}/status\n`);
});
