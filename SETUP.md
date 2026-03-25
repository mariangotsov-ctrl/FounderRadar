# Founder Radar — Setup Instructions

## Prerequisites

- Node.js 18.17+ or 20+
- PostgreSQL 14+ (local, [Neon](https://neon.tech), or [Supabase](https://supabase.com))
- npm / pnpm / yarn

---

## 1. Clone and install dependencies

```bash
git clone <repo-url>
cd FounderRadar
npm install
```

---

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/founderradar"
AUTH_SECRET="<run: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
SEED_ADMIN_PASSWORD="Admin123!"
```

> **Tip:** Generate `AUTH_SECRET` with:
> ```bash
> openssl rand -base64 32
> ```

---

## 3. Set up the database

```bash
# Push schema to the database (creates all tables)
npm run db:push

# Generate the Prisma client
npm run db:generate
```

---

## 4. Seed with demo data

```bash
npm run db:seed
```

This creates:
- **Admin account:** `admin@founderradar.dev` / `Admin123!`
- **Demo account:** `demo@founderradar.dev` / `Demo1234!`
- **10 categories** (AI Agents, LLMOps, DevTools, etc.)
- **20 tags**
- **12 realistic AI startups** with full descriptions
- **45+ signals** with calculated trending scores
- **Competitor relations**
- **Demo watchlist** for the demo user

---

## 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to DB (no migration file) |
| `npm run db:migrate` | Create and run a migration |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:reset` | ⚠️ Drop all data and re-migrate |

---

## App Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/dashboard` | Auth | Main overview |
| `/startups` | Auth | Browse & filter all startups |
| `/startups/[slug]` | Auth | Startup detail with signals |
| `/categories` | Auth | All categories |
| `/categories/[slug]` | Auth | Category detail |
| `/signals` | Auth | Global signal feed |
| `/watchlist` | Auth | Your saved startups |
| `/settings` | Auth | Account settings |
| `/admin` | Admin only | Admin overview |
| `/admin/startups` | Admin only | Create / edit / delete startups |
| `/admin/categories` | Admin only | Manage categories |
| `/admin/tags` | Admin only | Manage tags |
| `/admin/signals` | Admin only | Add signals |
| `/admin/competitors` | Admin only | Define competitor relations |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Neon or Supabase for serverless-compatible Postgres)
   - `AUTH_SECRET`
   - `AUTH_URL` (your production URL)
4. Deploy
5. After deploy, run seed via Prisma CLI against production DB

---

## Production Database (Neon — recommended)

```bash
# Install Neon CLI
npm install -g neonctl

# Create a project
neonctl projects create --name founder-radar

# Get connection string
neonctl connection-string
```

Paste the connection string into `DATABASE_URL`.

---

## Notes

- Admin access is set via `role: "ADMIN"` in the database. Use Prisma Studio (`npm run db:studio`) to promote users.
- The trending score is automatically recalculated every time a signal is created via the admin panel.
- All forms have client-side Zod validation and server-side Zod validation.
- Protected routes are enforced both in `middleware.ts` and inside each API route handler.
