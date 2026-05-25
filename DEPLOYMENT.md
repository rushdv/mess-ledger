# 🚀 Deployment Guide

## Option 1: Vercel + Vercel Postgres (Recommended - Easiest)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository: `rushdv/mess-ledger`
4. Click **"Deploy"** (first deployment will fail - that's okay!)

### Step 2: Add Vercel Postgres Database
1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → Select **"Postgres"**
3. Name it: `mess-ledger-db`
4. Click **"Create"**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Step 3: Configure Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**, add:

```bash
# Database (automatically added by Vercel Postgres)
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"

# NextAuth (add these manually)
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Run Database Migration
In Vercel dashboard → **Settings** → **Functions**, add build command:
```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel env pull .env.production
npx prisma migrate deploy
vercel --prod
```

### Step 5: Seed Initial Data (Optional)
After deployment, run seed script via Vercel CLI:
```bash
vercel env pull .env.production
npx prisma db seed
```

---

## Option 2: Vercel + Supabase (Free Tier Available)

### Step 1: Create Supabase Database
1. Go to [supabase.com](https://supabase.com) and create account
2. Click **"New Project"**
3. Fill in:
   - **Name:** mess-ledger
   - **Database Password:** (save this!)
   - **Region:** Choose closest to your users
4. Wait for database to be ready (~2 minutes)

### Step 2: Get Connection Strings
1. In Supabase dashboard → **Settings** → **Database**
2. Copy **Connection string** → **URI** (for `DATABASE_URL`)
3. Copy **Connection string** → **Direct connection** (for `DIRECT_URL`)
4. Replace `[YOUR-PASSWORD]` with your database password

Example:
```bash
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.compute.supabase.com:5432/postgres"
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Import your GitHub repository
3. Add environment variables:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres.xxx:password@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@...compute.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-generated-secret"
```

4. Click **"Deploy"**

### Step 4: Run Migrations
After first deployment, run migrations:
```bash
npm i -g vercel
vercel env pull .env.production
npx prisma migrate deploy
vercel --prod
```

---

## Option 3: Other Platforms

### Railway
1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Render
1. Create account at [render.com](https://render.com)
2. Create PostgreSQL database
3. Create web service from GitHub
4. Set environment variables
5. Deploy

---

## 🔧 Local Development with PostgreSQL

If you want to test PostgreSQL locally:

### Using Docker:
```bash
# Start PostgreSQL
docker run --name mess-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mess_ledger"
DIRECT_URL="postgresql://postgres:password@localhost:5432/mess_ledger"

# Run migrations
npx prisma migrate dev
npx prisma db seed
```

---

## 📝 Post-Deployment Checklist

- [ ] Database connected successfully
- [ ] Migrations applied
- [ ] Seed data loaded (optional)
- [ ] Can login with admin account
- [ ] All pages loading correctly
- [ ] Dark mode working
- [ ] Mobile responsive
- [ ] Environment variables set correctly

---

## 🐛 Troubleshooting

### Build fails with "Can't reach database server"
- Check `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure database is accessible from Vercel

### "Prisma Client not generated"
- Add to build command: `npx prisma generate && npm run build`

### "Invalid `prisma.xxx.findMany()` invocation"
- Run migrations: `npx prisma migrate deploy`
- Regenerate client: `npx prisma generate`

### Can't login after deployment
- Check `NEXTAUTH_URL` matches your deployment URL
- Verify `NEXTAUTH_SECRET` is set
- Check if seed data was loaded

---

## 📞 Support

For issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
