# Remote.com – Google Ads Intelligence Dashboard

Competitor ad monitoring tool for the keyword "remote" and related terms.
Shows live bidders, estimated CPCs, ad copy, and trademark savings scenarios.

## Deploy to Vercel (recommended, free)

1. Go to [vercel.com](https://vercel.com) → sign up / log in
2. Click **"Add New Project"**
3. Click **"Upload"** (or drag this folder in)
4. Vercel auto-detects Vite → click **Deploy**
5. Your live URL will be something like `remote-ads-intel.vercel.app`
6. Share that URL with your team — it works for anyone, no login needed

## Deploy to Netlify (alternative, also free)

1. Go to [netlify.com](https://netlify.com) → sign up / log in
2. Drag the **`dist/`** folder (pre-built) onto the Netlify deploy zone
3. Done — instant live URL

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy that folder anywhere.

## Features

- **Advertisers tab** — all bidders ranked by CPC with bid-strength bars
- **Ad Copy tab** — competitor headlines and descriptions  
- **Keyword Map tab** — CPC ranges across 6 related keywords
- **™ Trademark toggle** — models CPC reduction if competitors are blocked
- **Budget input** — adjust monthly spend, savings math recalculates live
- **⚡ Live Fetch** — Claude AI + web search for real-time advertiser intelligence

## Notes

- CPC data is estimated from industry benchmarks (not live Google data)
- Live Fetch uses the Anthropic API (already embedded — no key needed in this build)
- Trademark savings modeled at 14–31% auction pressure reduction per keyword
