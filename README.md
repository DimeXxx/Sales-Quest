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

The repo already includes `railway.json` and `nixpacks.toml`, and a real
Express + JSON-file backend (`server/`) that serves the production build and
the API — Railway just needs a Node process to run, and this repo gives it
one.

**Two extra steps this app needs (do these once):**

1. **Add a persistent Volume** — Settings → Volumes → New Volume, mount path
   `/app/data`. Without this, every redeploy wipes the JSON data file
   (all accounts, sales, stock changes) because each deploy is a fresh
   container.
2. **Set environment variables** — Settings → Variables:
   - `DB_PATH` = `/app/data/salesquest.json` (must match the volume's mount path)
   - `JWT_SECRET` = a long random string (`openssl rand -base64 32`)
   - `NODE_ENV` = `production`

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

The app now has a **real backend** (Express + plain JSON file) — no more localStorage
accounts. Passwords are hashed with bcrypt, sessions are signed JWTs in
httpOnly cookies, and every sale/redeem/admin action is validated server-side
(a manager can't grant themselves coins from devtools anymore).

Two things you must set before a real deploy:

- **`JWT_SECRET`** — a long random string. Without it, sessions are signed
  with an insecure hardcoded dev fallback. Generate one with
  `openssl rand -base64 32` and set it as a Railway environment variable.
- **A persistent volume for the database** — see the Railway section below.
  Without it, every new deploy wipes all accounts/sales/stock data.

Self-registration always creates a `manager` role with `pending` status —
nobody can grant themselves ROP/admin access, and new managers can't use the
app until an existing ROP/admin approves them from the Admin Panel's
"Ожидают подтверждения" (Pending Approvals) section.

## 🗂 Project structure

```
server/                     # Express + JSON-file backend (real, not mocked)
  db.js                      # schema + seed data, JSON file at DB_PATH — no native deps, no compile step
  auth.js                    # bcrypt hashing, JWT sign/verify, middleware
  routes/
    auth.js                   # register, login, logout, me
    app.js                     # quests, sales, rewards, boss fights, leaderboard
    admin.js                   # account approval, inventory CRUD, resets
  index.js                   # wires routes + serves the built frontend
  package.json                # {"type":"commonjs"} — overrides root ESM setting

src/
  types/sales.ts            # domain types + Reward Engine + level system
  auth/AuthContext.tsx        # calls the real /api/auth/* endpoints
  i18n/                      # RU/RO translations + LanguageContext
  lib/
    api.ts                    # fetch wrapper (credentials: include)
    excelImport.ts            # SheetJS-based Excel/CSV parser
    categoryColors.ts          # consistent per-category accent colors
    productImageSearch.ts      # live Wikimedia Commons photo search
  hooks/
    useGameState.ts            # manager-facing data (quests/rewards/leaderboard)
    useAdminState.ts           # admin-facing data + all admin mutations
    useToasts.ts
  components/
    ui/                        # Button, Card, Badge, Progress, Toast, RadialGauge…
    auth/                      # LoginScreen, PendingApprovalScreen
    SalesQuest/                 # ProfileCard, QuestCard, AdminApp, ResetPanel…
  App.tsx                    # loading / login / pending / role-based routing
```

## 🧭 Roadmap (from the original spec)

- **P0 (done):** quest dashboard, sale registration, XP/Coins, leaderboard,
  reward store, admin product creation, Boss Fight, Excel import, auth, i18n
- **P1:** achievement unlock logic tied to real events, level-up polish,
  advanced filtering
- **P2:** real backend + 1C/Bitrix24 integration, analytics, Telegram bot
  notifications, role-based access control
