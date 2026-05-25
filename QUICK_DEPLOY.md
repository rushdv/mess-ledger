# ⚡ Quick Deploy Guide - 5 Minutes

## 🎯 Fastest Way: Vercel + Vercel Postgres

### 1️⃣ Deploy to Vercel (2 min)
```bash
# Visit vercel.com and login with GitHub
# Click "Add New Project"
# Import: rushdv/mess-ledger
# Add environment variables:

NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=run-openssl-rand-base64-32

# Click Deploy (will fail - that's okay!)
```

### 2️⃣ Add Database (1 min)
```bash
# In Vercel dashboard:
# Storage → Create Database → Postgres
# Name: mess-ledger-db
# Click Create

# Vercel auto-adds: POSTGRES_PRISMA_URL

# Go to Settings → Environment Variables
# Add:
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

### 3️⃣ Redeploy (1 min)
```bash
# Deployments → ... → Redeploy
# Wait for build to complete
```

### 4️⃣ Setup Database (1 min)
```bash
# Install Vercel CLI
npm i -g vercel

# Login and setup
vercel login
vercel link

# Pull env and migrate
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### 5️⃣ Done! 🎉
```bash
# Visit your app URL
# Login: admin@mess.com / admin123
# Change password immediately!
```

---

## 🔑 Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## 📱 Alternative: Supabase (Free)

### 1️⃣ Create Supabase DB
- Go to supabase.com
- New Project → mess-ledger
- Save password!

### 2️⃣ Get Connection String
- Settings → Database → Connection string (URI)
- Copy and replace [YOUR-PASSWORD]

### 3️⃣ Deploy to Vercel
```bash
DATABASE_URL=postgresql://postgres.xxx:password@...supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret
```

### 4️⃣ Migrate
```bash
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

---

## 🐛 Common Issues

**Build fails?**
→ Check DATABASE_URL is set

**Can't login?**
→ Run: `npx prisma db seed`

**Table not found?**
→ Run: `npx prisma migrate deploy`

---

## 📚 Detailed Guides
- Full guide: `VERCEL_SETUP.md`
- All options: `DEPLOYMENT.md`
