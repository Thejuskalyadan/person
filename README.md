# 💍 Proposal Website — Setup Guide

A romantic proposal website with a Node.js notification backend. When she clicks **"Yes, always ♡"**, you get a Telegram message instantly.

---

## Step 1 — Get a Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g. `MyProposalBot`) and a username ending in `bot`
4. BotFather will give you a token like: `7123456789:AAFxxx...`
5. Copy that token — it's your **TELEGRAM_BOT_TOKEN**

---

## Step 2 — Get Your Chat ID

1. Open Telegram and search for **@userinfobot**
2. Send `/start`
3. It will reply with your user ID (a number like `987654321`)
4. That number is your **TELEGRAM_CHAT_ID**

> **Tip:** You can also use a Group chat ID. Add your bot to the group, make it an admin, then use the group's chat ID (negative number starting with `-100`).

---

## Step 3 — Configure the Server

Open `server.js` and fill in the `CONFIG` object at the top:

```js
const CONFIG = {
  PORT              : 3000,
  TELEGRAM_BOT_TOKEN: '7123456789:AAFxxx...',  // ← paste your token
  TELEGRAM_CHAT_ID  : '987654321',              // ← paste your chat ID
  ALLOWED_ORIGIN    : '*',
};
```

Then open `index.html` and find this line near the bottom:

```js
const BACKEND_URL = 'YOUR_BACKEND_URL';
```

Replace it with your server's URL (e.g. `https://your-app.railway.app`).

---

## Step 4 — Run Locally

```bash
node server.js
```

You should see:

```
╔══════════════════════════════════════════╗
║  💌  Proposal Notification Server        ║
╚══════════════════════════════════════════╝
  Listening on port 3000
```

Test it:

```bash
curl http://localhost:3000/health
# → {"ok":true,"time":"..."}

curl -X POST http://localhost:3000/api/yes \
  -H "Content-Type: application/json" \
  -d '{"device":"Desktop"}'
# → {"ok":true}  + Telegram message arrives!
```

---

## Deployment Options

### Option A — Railway (Free tier, easiest)

1. Push your project to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo
4. Under **Variables**, add:
   - `TELEGRAM_BOT_TOKEN` = your token
   - `TELEGRAM_CHAT_ID` = your chat ID
5. Railway auto-detects Node.js and runs `npm start`
6. Copy the generated URL (e.g. `https://your-app.up.railway.app`)
7. Paste it as `BACKEND_URL` in `index.html`

### Option B — Render (Free tier)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Build command: *(leave empty)*
4. Start command: `node server.js`
5. Add Environment Variables same as above
6. Deploy and copy the URL

### Option C — VPS with PM2 (keeps it alive forever)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name proposal-server

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs proposal-server
pm2 status
```

---

## Hosting the Website

- **GitHub Pages** (static, free): Push `index.html` to a repo, enable Pages
- **Netlify Drop**: Drag `index.html` to [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: `npx vercel` in the folder
- **Directly**: Send her the HTML file — it works offline (Three.js loads from CDN)

---

## File Structure

```
chandu/
├── index.html    ← The website (open this in any browser)
├── server.js     ← Node.js notification backend
├── package.json  ← npm scripts (optional)
└── README.md     ← This file
```

---

*Built with love, Shakespeare, and the quiet certainty that some things are worth saying properly.*
