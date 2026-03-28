# Field — Intelligence

Sports. News. Markets. All in one place — with AI-powered analysis on every headline.

## Features

- **Sports** — Live scores, box scores, top performers, and transactions across NBA, NFL, MLB, NHL, Soccer, and College Basketball (via ESPN)
- **News** — Filtered world news across Geopolitics, Economy, Politics, and Tech (via NewsAPI)
- **Markets** — Live tickers for S&P 500, NASDAQ, DOW, BTC, ETH, Oil, Gold, 10Y Yield, EUR/USD, and USD Index (via Yahoo Finance)
- **AI Analysis** — Click "Analyze" on any headline for instant AI-generated summaries, letter grades on trades/signings, impact analysis, and historical context (via Claude)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/field-app.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **"New Project"**
2. Import your GitHub repository
3. Framework Preset will auto-detect **Next.js**
4. Add Environment Variables before deploying:

| Variable | Required | Source |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI analysis | [console.anthropic.com](https://console.anthropic.com) |
| `NEWS_API_KEY` | For live news | [newsapi.org](https://newsapi.org) |

5. Click **Deploy**

### 3. Done

The app works without API keys (falls back to demo data), but add them for live data.

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Claude Haiku 4.5** (AI analysis)
- **ESPN API** (sports data)
- **Yahoo Finance API** (market data)
- **NewsAPI** (world news)
