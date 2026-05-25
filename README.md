<div align="center">

# 🍽️ Mess Ledger

### Complete Mess Management System

*Track meals, expenses, bills, and payments - all in one place*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 🌟 Features

### 📊 Core Functionality

<table>
<tr>
<td width="50%">

#### 🍽️ **Meal Tracking**
- Daily breakfast, lunch, dinner count
- Per-member meal history
- Automatic meal rate calculation
- Month-wise summaries

#### 🛒 **Bazar Management**
- Daily grocery expense tracking
- Date-wise entries
- Description support
- Total cost overview

#### ⚡ **Utility Bills**
- Electricity, Gas, Water, Internet
- Dust bill tracking
- Type-wise categorization
- Monthly bill summaries

</td>
<td width="50%">

#### 💰 **Payment Tracking**
- Member deposit records
- Payment history
- Date-wise tracking
- Total collection view

#### 📈 **Smart Reports**
- Auto-calculated monthly dues
- Per-member breakdown
- PDF export functionality
- Visual charts & graphs

#### 👥 **Member Management**
- Role-based access control
- Admin, Moderator, Member roles
- Active/Inactive status
- Profile management

</td>
</tr>
</table>

### � Advanced Features

- **🏢 Multi-Tenancy** - Create or join multiple mess groups
- **🔐 Secure Authentication** - Email/Password + Google OAuth
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🌙 Dark Mode** - Eye-friendly dark theme support
- **📄 PDF Export** - Download monthly reports as PDF
- **💾 Data Isolation** - Each mess has completely separate data
- **🎨 Modern UI** - Beautiful interface with shadcn/ui components
- **⚡ Real-time Updates** - Instant data synchronization

---

## 🎬 Demo

### Screenshots

<div align="center">

| Dashboard | Meals Tracking |
|-----------|----------------|
| ![Dashboard](https://via.placeholder.com/400x250?text=Dashboard) | ![Meals](https://via.placeholder.com/400x250?text=Meals+Tracking) |

| Report View | Mobile View |
|-------------|-------------|
| ![Report](https://via.placeholder.com/400x250?text=Monthly+Report) | ![Mobile](https://via.placeholder.com/400x250?text=Mobile+Responsive) |

</div>

### Live Demo

🔗 **[Try Live Demo](https://mess-ledger.vercel.app)** *(Coming Soon)*

**Demo Credentials:**
- Email: `admin@messledger.com`
- Password: `admin123`
- Mess Code: `DEMO2024`

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rushdv/mess-ledger.git
cd mess-ledger

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your NEXTAUTH_SECRET:
# openssl rand -base64 32

# 4. Set up database
npm run db:push      # Create database schema
npm run db:seed      # Seed with demo data

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

### Default Login Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@messledger.com | admin123 |
| Member | rahim@messledger.com | member123 |
| Member | karim@messledger.com | member123 |

**Demo Mess Code:** `DEMO2024`

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Recharts](https://recharts.org/)** - Chart library for data visualization
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon set

### Backend
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication solution
- **[SQLite](https://www.sqlite.org/)** - Development database
- **[PostgreSQL](https://www.postgresql.org/)** - Production database

### Tools & Libraries
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[date-fns](https://date-fns.org/)** - Date utility library
- **[Zod](https://zod.dev/)** - Schema validation

---

## 📁 Project Structure

```
mess-ledger/
├── src/
│   ├── app/
│   │   ├── (protected)/          # Protected routes (requires auth)
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── meals/            # Meal tracking
│   │   │   ├── bazar/            # Grocery expenses
│   │   │   ├── utility/          # Utility bills
│   │   │   ├── payments/         # Payment records
│   │   │   ├── individual-cost/  # Personal expenses
│   │   │   ├── shared-cost/      # Shared expenses
│   │   │   ├── report/           # Monthly reports
│   │   │   ├── members/          # Member management
│   │   │   ├── help/             # User guide
│   │   │   └── more/             # Settings & more
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication
│   │   │   ├── mess/             # Mess management
│   │   │   └── [features]/       # Feature APIs
│   │   ├── login/                # Login page
│   │   ├── select-mess/          # Mess selection
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # UI components (shadcn)
│   │   ├── layout/               # Layout components
│   │   └── [feature]/            # Feature components
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   ├── auth.ts               # Auth configuration
│   │   ├── mess-context.ts       # Multi-tenancy helper
│   │   ├── calculations.ts       # Calculation engine
│   │   ├── pdf-export.ts         # PDF generation
│   │   └── utils.ts              # Utility functions
│   ├── hooks/                    # Custom React hooks
│   └── types/                    # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── public/                       # Static assets
└── [config files]                # Configuration files
```

---

## � How It Works

### Calculation Logic

```typescript
// Monthly calculation formula
meal_rate = total_bazar_cost / total_meals
utility_per_head = total_utility / active_members

// Per member calculation
member_meal_cost = member_meals × meal_rate
member_utility = utility_per_head
member_individual = sum(individual_costs)
member_shared = sum(shared_costs) / shared_members

member_total = member_meal_cost + member_utility + member_individual + member_shared
member_due = member_total - member_paid
```

### Multi-Tenancy Architecture

- **Mess-based isolation** - Each mess is a separate tenant
- **Row-level security** - All queries filtered by `messId`
- **Unique invite codes** - Share codes to invite members
- **Role-based access** - Admin, Moderator, Member roles
- **Easy switching** - Users can be in multiple messes

---

## 🔐 User Roles & Permissions

| Feature | Admin | Moderator | Member |
|---------|:-----:|:---------:|:------:|
| View Data | ✅ | ✅ | ✅ |
| Add Meals | ✅ | ✅ | ❌ |
| Add Bazar | ✅ | ✅ | ❌ |
| Add Utility | ✅ | ✅ | ❌ |
| Add Payments | ✅ | ✅ | ❌ |
| Add Costs | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ✅ |
| Manage Members | ✅ | ❌ | ❌ |
| Change Roles | ✅ | ❌ | ❌ |
| Delete Entries | ✅ | ✅ | ❌ |

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rushdv/mess-ledger)

1. Click the button above or push to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```env
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app
   GOOGLE_CLIENT_ID=optional
   GOOGLE_CLIENT_SECRET=optional
   ```
4. Update `prisma/schema.prisma` provider to `postgresql`
5. Deploy!

### Other Platforms

- **Railway** - [Guide](./docs/RAILWAY_DEPLOY.md)
- **Render** - [Guide](./docs/RENDER_DEPLOY.md)
- **DigitalOcean** - [Guide](./docs/DO_DEPLOY.md)

---

## 📚 Documentation

- 📖 **[User Guide](./USER_GUIDE.md)** - Complete user manual in Bangla
- 🚀 **[Quick Start](#-quick-start)** - Get started in 5 minutes
- 🛠️ **[Tech Stack](#-tech-stack)** - Technologies used
- 🔐 **[Permissions](#-user-roles--permissions)** - Role-based access
- 🚢 **[Deployment](#-deployment)** - Deploy to production

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🔨 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an issue on GitHub:

- 🐛 [Report a Bug](https://github.com/rushdv/mess-ledger/issues/new?labels=bug)
- ✨ [Request a Feature](https://github.com/rushdv/mess-ledger/issues/new?labels=enhancement)

---

## � License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shihab Shahriar Rashu**

- GitHub: [@rushdv](https://github.com/rushdv)
- Email: shihab.zn4@gmail.com
- Website: [yourwebsite.com](https://shihabshahriarrashu.vercel.app/)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Vercel](https://vercel.com/) - Deployment platform
- All contributors who helped make this project better!

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=rushdv/mess-ledger&type=Date)](https://star-history.com/#rushdv/mess-ledger&Date)

---

<div align="center">

**Made with ❤️ for mess management**

[⬆ Back to Top](#-mess-ledger)

</div>
