 Setup Guide

A romantic proposal website with a Node.js notification backend. When she clicks **"Yes, always ♡"**, you get a Telegram message instantly.

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

```



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
