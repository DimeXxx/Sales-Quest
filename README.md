# Sales Quest — Turn Stock Into Sales

Gamified sales-quest MVP for QGroup Technologies. Managers sell company-focused
/ overstock SKUs, earn XP and Coins, compete on a leaderboard, and redeem
Coins in a Reward Store. Built as a real production-shaped MVP: React + Vite
+ TypeScript + Tailwind v4, with a repository abstraction layer ready for a
future backend (1C / Bitrix24 / Power BI / Telegram bot).

## ✨ Features

- 🎮 **Quests** — focus-product cards with priority, XP/Coins reward, stock
  clearance gauge, Boss Fight team challenges
- 🏆 **Arena** — live leaderboard, achievements, Reward Store
- ⚙️ **Admin (ROP)** — create focus products manually, bulk-import from
  Excel/CSV (RU/EN headers), toggle Boss Fights
- 🔐 **Login / Register** — each manager has their own account (demo-grade
  client-side auth — see [Security notes](#-security-notes))
- 🌍 **RU / RO** language switcher
- 📊 **Reward Engine** — deterministic XP/Coin calculation from stock age,
  margin and priority (`src/types/sales.ts`)

## 🚀 Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Other useful scripts:

```bash
npm run build       # type-check + production build → dist/
npm run lint         # oxlint
npm run start        # serve the built dist/ with Express (what Railway runs)
npm run preview      # Vite's own preview server for dist/
```

Demo login: any account listed under "Демо-аккаунты" on the login screen,
password `demo123` for all of them.

## 📦 Push to GitHub

```bash
# from inside the sales-quest folder
git init                                   # skip if already a repo
git add .
git commit -m "Initial commit: Sales Quest MVP"

# create an empty repo on GitHub first (github.com/new), then:
git remote add origin https://github.com/<your-username>/sales-quest.git
git branch -M main
git push -u origin main
```

If you use SSH instead of HTTPS, use
`git@github.com:<your-username>/sales-quest.git` as the remote URL.

## 🚂 Deploy to Railway

The repo already includes `railway.json` and `nixpacks.toml`, and a small
Express server (`server.js`) that serves the production build — Railway just
needs a Node process to run, and this repo gives it one.

**Option A — from the Railway dashboard (recommended):**

1. Push the repo to GitHub (see above).
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from
   GitHub repo** → select `sales-quest`.
3. Railway auto-detects Node via Nixpacks and reads `railway.json`:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
4. Railway assigns a `PORT` env var automatically — `server.js` already reads
   `process.env.PORT`, so no extra config is needed.
5. Once deployed, click **Generate Domain** to get a public `*.up.railway.app`
   URL you can share with your managers.

**Option B — from the CLI:**

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🔐 Security notes

This MVP uses **client-side, demo-grade authentication** (accounts and
plaintext passwords are stored in the browser's `localStorage`). This is
fine for an internal pilot with your own team, but **must not** be exposed
publicly as-is. Before a wider release you'll want:

- A real backend with hashed passwords (bcrypt/argon2) and sessions or JWT
- HTTPS-only cookies instead of localStorage for session tokens
- Server-side validation of every sale/redeem/admin action (right now all
  game logic runs in the browser and can be tampered with via devtools)
- Real data source instead of `MockSalesRepository`
  (`src/services/salesRepository.ts` already defines the interface a REST
  API / 1C / Bitrix24 integration should implement)

## 🗂 Project structure

```
src/
  types/sales.ts            # domain types + Reward Engine + level system
  data/mockData.ts          # demo products, managers, rewards, boss fights
  services/salesRepository.ts  # repository abstraction (swap Mock → real API)
  auth/                     # demo auth (accounts store + AuthContext)
  i18n/                     # RU/RO translations + LanguageContext
  lib/
    excelImport.ts          # SheetJS-based Excel/CSV parser
    categoryColors.ts        # consistent per-category accent colors
  hooks/
    useGameState.ts          # all game logic (sales, rewards, admin actions)
    useToasts.ts
  components/
    ui/                      # Button, Card, Badge, Progress, Toast, RadialGauge…
    auth/LoginScreen.tsx
    SalesQuest/               # ProfileCard, QuestCard, Leaderboard, AdminPanel…
  App.tsx
server.js                   # production static server (used by Railway)
```

## 🧭 Roadmap (from the original spec)

- **P0 (done):** quest dashboard, sale registration, XP/Coins, leaderboard,
  reward store, admin product creation, Boss Fight, Excel import, auth, i18n
- **P1:** achievement unlock logic tied to real events, level-up polish,
  advanced filtering
- **P2:** real backend + 1C/Bitrix24 integration, analytics, Telegram bot
  notifications, role-based access control
