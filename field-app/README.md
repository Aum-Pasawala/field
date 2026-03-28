# Field — Intelligence
### Sports · News · Markets — all in one place.

---

## 🚀 Deploy in 5 Steps (No coding required)

### Step 1 — Get your free API keys

**NewsAPI** (for world news headlines):
1. Go to https://newsapi.org
2. Click "Get API Key" — sign up free
3. Copy your API key

**Anthropic** (for AI bullet points):
1. Go to https://console.anthropic.com
2. Sign up and go to "API Keys"
3. Click "Create Key" and copy it

---

### Step 2 — Add your API keys

Open the file called `.env.local` in this folder.
Replace the placeholder text with your real keys:

```
ANTHROPIC_API_KEY=paste_your_anthropic_key_here
NEWS_API_KEY=paste_your_newsapi_key_here
```

Save the file.

---

### Step 3 — Deploy to Vercel

1. Go to https://vercel.com and sign up free
2. Click **"Add New Project"**
3. Click **"Import Git Repository"** — or drag this entire folder into Vercel
4. Under **"Environment Variables"**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `NEWS_API_KEY` = your NewsAPI key
5. Click **Deploy**

That's it. Vercel gives you a live URL like `field-app.vercel.app`.

---

## What's included

- **Sports tab** — Live scores from ESPN (NBA, NFL, MLB, NHL, Soccer, College). No API key needed, ESPN's data is public.
- **News tab** — Real headlines from Reuters, AP, BBC, Bloomberg via NewsAPI. Auto-categorized into Geopolitics, Economy, Politics, Tech & AI.
- **Markets tab** — Live stock prices, BTC, oil, gold via Yahoo Finance. No API key needed.
- **AI Bullets** — Every headline gets 4 instant analysis points powered by Claude.

---

## Updating your app

Any time you want to change something, just tell Field (Claude) what you want updated, and paste the new code into the right file. Redeploy on Vercel with one click.

---

## File structure

```
field-app/
├── src/app/
│   ├── page.js              ← Main app (everything you see)
│   ├── layout.js            ← App wrapper
│   └── api/
│       ├── news/route.js    ← World news from NewsAPI
│       ├── sports/route.js  ← Scores + news from ESPN
│       ├── markets/route.js ← Market data from Yahoo Finance
│       └── analyze/route.js ← AI bullet points via Anthropic
├── .env.local               ← Your API keys (never share this file)
├── package.json
└── next.config.js
```
