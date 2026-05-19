# MessLedger

A full-stack mess expense tracking app built with Next.js 14, Prisma, and Tailwind CSS.

## Features

- **Meal Count** — Daily breakfast/lunch/dinner tracking per member
- **Bazar Cost** — Monthly grocery expense entries
- **Utility** — Electricity, gas, water, internet bills
- **Payments** — Record member deposits
- **Report** — Auto-calculated monthly dues with charts
- **Members** — Admin manages members with role-based access

## Calculation Logic

```
meal_rate       = total_bazar_cost / total_meals
member_meal_cost = member_meals × meal_rate
utility_share   = total_utility / active_members
member_total    = member_meal_cost + utility_share
due             = member_total - amount_paid
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (dev) via Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and set NEXTAUTH_SECRET to a random string:
# openssl rand -base64 32
```

### 3. Set up database

```bash
npm run db:push      # create SQLite DB from schema
npm run db:seed      # seed with admin + sample members
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default credentials (after seed)

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@messledger.com     | admin123   |
| Member| rahim@messledger.com     | member123  |
| Member| karim@messledger.com     | member123  |
| Member| jamal@messledger.com     | member123  |

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `DATABASE_URL` — use a PostgreSQL URL (e.g. Neon, Supabase)
   - `NEXTAUTH_SECRET` — random secret
   - `NEXTAUTH_URL` — your Vercel URL
4. Change `prisma/schema.prisma` provider from `sqlite` to `postgresql`
5. Run `npm run db:migrate` locally against the production DB

## Project Structure

```
src/
├── app/
│   ├── (protected)/        # Auth-gated pages
│   │   ├── dashboard/
│   │   ├── meals/
│   │   ├── bazar/
│   │   ├── utility/
│   │   ├── payments/
│   │   ├── report/
│   │   └── members/
│   ├── api/                # API routes
│   │   ├── auth/
│   │   ├── members/
│   │   ├── meals/
│   │   ├── bazar/
│   │   ├── utility/
│   │   ├── payments/
│   │   └── report/
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Sidebar, MonthPicker
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── calculations.ts     # Core mess calculation engine
│   └── utils.ts
└── types/
    └── next-auth.d.ts
```
