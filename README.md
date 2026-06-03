<div align="center">

# 🍽️ Mess Ledger

### Complete Mess Management System

*Track meals, expenses, bills, and payments — all in one place*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.x-8B5CF6?style=for-the-badge)](https://better-auth.com/)

[Features](#-features) • [Screenshots](#-screenshots) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Deployment](#-deployment)

🔗 **[Live Demo](https://messledger-pi.vercel.app)**

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

#### 🍽️ Meal Tracking
- Daily breakfast, lunch & dinner counts
- Per-member history with monthly overview
- Automatic meal rate calculation

#### 🛒 Bazar Management
- Daily grocery expense entries
- Date-wise records with descriptions
- Total cost overview

#### ⚡ Utility Bills
- Electricity, gas, water, internet & more
- Monthly bill summaries per category

#### 💰 Payment Tracking
- Member deposit records
- Payment history with date-wise view

</td>
<td width="50%">

#### 📈 Smart Reports
- Auto-calculated monthly dues per member
- Mess balance (surplus / deficit)
- PDF & Excel export
- Visual charts & graphs

#### 👥 Member Management
- Admin, Moderator, Member roles
- Default meal settings per member
- Auto meal generation from defaults

#### 🏢 Multi-Mess Support
- Create or join multiple mess groups
- Unique invite codes
- Easy switching between messes

</td>
</tr>
</table>

**More:** Individual costs · Shared costs · Payment requests · Expense requests · Notice board · Dark mode · 5 color themes · PWA support · Fully responsive

---

## 📸 Screenshots

<div align="center">

| Dashboard (Desktop) | Monthly Report (Desktop) |
|---|---|
| ![Dashboard Desktop](./public/dashboard-desktop.png) | ![Report Desktop](./public/report-desktop.png) |

| Dashboard (Mobile) | Meals Entry (Mobile) |
|---|---|
| ![Dashboard Mobile](./public/dashboard-mobile.png) | ![Meals Mobile](./public/meals-mobile.png) |

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rushdv/mess-ledger.git
cd mess-ledger

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values — see Environment Variables section below

# 4. Push database schema
npm run db:push

# 5. (Optional) Seed with demo data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# Better Auth
BETTER_AUTH_SECRET="your-secret"        # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000" # Your app URL

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Auth | [Better Auth](https://better-auth.com/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Database | PostgreSQL ([Neon](https://neon.tech/)) |
| Charts | [Recharts](https://recharts.org/) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) |
| PWA | [Serwist](https://serwist.pages.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
mess-ledger/
├── src/
│   ├── app/
│   │   ├── (protected)/       # Auth-protected routes
│   │   │   ├── dashboard/
│   │   │   ├── meals/
│   │   │   ├── bazar/
│   │   │   ├── utility/
│   │   │   ├── payments/
│   │   │   ├── individual-cost/
│   │   │   ├── shared-cost/
│   │   │   ├── report/
│   │   │   ├── members/
│   │   │   ├── requests/
│   │   │   └── more/
│   │   ├── (admin)/           # Super admin panel
│   │   ├── api/               # API routes
│   │   ├── login/
│   │   ├── register/
│   │   └── select-mess/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # Layout components
│   └── lib/
│       ├── auth.ts            # Better Auth config
│       ├── auth-client.ts     # Client-side auth
│       ├── session.ts         # Server-side session helper
│       ├── mess-context.ts    # Multi-tenancy helper
│       ├── calculations.ts    # Calculation engine
│       └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## 🔐 Roles & Permissions

| Feature | Admin | Moderator | Member |
|---|:---:|:---:|:---:|
| View data & reports | ✅ | ✅ | ✅ |
| Export PDF / Excel | ✅ | ✅ | ✅ |
| Add meals | ✅ | ✅ | ✅ |
| Add bazar / utility / payments | ✅ | ✅ | ❌ |
| Add individual / shared costs | ✅ | ✅ | ❌ |
| Approve requests | ✅ | ✅ | ❌ |
| Manage members | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |

---

## ⚙️ How It Works

### Cost Calculation

```
meal_rate        = total_bazar_cost / total_meals
utility_per_head = total_utility / active_members

member_total = (member_meals × meal_rate)
             + utility_per_head
             + individual_costs
             + shared_costs / shared_member_count

member_due = member_total − member_paid
```

### Multi-Tenancy

Every mess is a fully isolated tenant. All data (meals, costs, payments) is scoped to a `messId`. Users can create multiple messes or join existing ones via invite code, and switch between them at any time.

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rushdv/mess-ledger)

1. Push to GitHub and import in Vercel
2. Add all environment variables in Vercel → Settings → Environment Variables
3. Add Google OAuth redirect URI in Google Cloud Console:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Deploy

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

---

## 📖 User Guide

See **[USER_GUIDE.md](./USER_GUIDE.md)** for the complete user manual.

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Shihab Shahriar Rashu**

- GitHub: [@rushdv](https://github.com/rushdv)
- Email: shihab.zn4@gmail.com
- Website: [shihabshahriarrashu.vercel.app](https://shihabshahriarrashu.vercel.app/)

---

<div align="center">

Made with ❤️ for mess management

[⬆ Back to Top](#-mess-ledger)

</div>
