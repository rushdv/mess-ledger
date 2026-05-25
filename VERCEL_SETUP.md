# 🚀 Vercel Deployment - Step by Step

## Prerequisites
- GitHub account with your code pushed
- Vercel account (sign up at vercel.com)

---

## 🎯 Method 1: Vercel Postgres (Easiest - Recommended)

### Step 1: Initial Deployment
1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your repository: **rushdv/mess-ledger**
5. Keep default settings:
   - Framework Preset: **Next.js**
   - Root Directory: **./** (default)
   - Build Command: **npm run build** (will be updated later)
6. **DON'T click Deploy yet!** First add environment variables

### Step 2: Add Initial Environment Variables
Before deploying, add these in the **Environment Variables** section:

```bash
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-secret-here
```

**Generate NEXTAUTH_SECRET:**
Open terminal and run:
```bash
openssl rand -base64 32
```
Copy the output and paste as `NEXTAUTH_SECRET` value.

**Note:** `NEXTAUTH_URL` will be updated after you get your actual Vercel URL.

### Step 3: Deploy (First Time)
1. Click **"Deploy"**
2. Wait for deployment (it will likely fail - that's expected!)
3. Note your deployment URL (e.g., `mess-ledger-xyz.vercel.app`)

### Step 4: Add Vercel Postgres Database
1. In your Vercel project dashboard, click **"Storage"** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Database name: `mess-ledger-db`
5. Region: Choose closest to your users
6. Click **"Create"**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← This is what we need
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 5: Update Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   ```bash
   DATABASE_URL=${POSTGRES_PRISMA_URL}
   ```
   (Yes, use the exact text `${POSTGRES_PRISMA_URL}` - Vercel will resolve it)

3. Update `NEXTAUTH_URL` with your actual deployment URL:
   ```bash
   NEXTAUTH_URL=https://mess-ledger-xyz.vercel.app
   ```

### Step 6: Update Prisma Schema for Production
The schema is already set to PostgreSQL. Just verify in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 7: Redeploy
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 8: Run Database Migrations
You have two options:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed initial data (creates admin user)
npx prisma db seed
```

**Option B: Using Vercel Dashboard**
1. Go to **Settings** → **General**
2. Update **Build Command** to:
   ```bash
   npx prisma generate && npx prisma migrate deploy && next build
   ```
3. Save and redeploy

### Step 9: Verify Deployment
1. Visit your deployment URL
2. You should see the login page
3. Login with default credentials:
   - Email: `admin@mess.com`
   - Password: `admin123`
4. Change the password immediately!

---

## 🎯 Method 2: Vercel + Supabase (Free Tier)

### Step 1: Create Supabase Database
1. Go to **https://supabase.com**
2. Sign up/Login
3. Click **"New Project"**
4. Fill in:
   - **Name:** mess-ledger
   - **Database Password:** (create a strong password and SAVE IT!)
   - **Region:** Choose closest to your users
5. Click **"Create new project"**
6. Wait ~2 minutes for database to be ready

### Step 2: Get Database Connection Strings
1. In Supabase dashboard → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Deploy to Vercel
1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Add environment variables:

```bash
DATABASE_URL=postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret
```

5. Click **"Deploy"**

### Step 4: Run Migrations
After deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
**Solution:**
- Check `DATABASE_URL` is correct
- For Vercel Postgres: Use `${POSTGRES_PRISMA_URL}`
- For Supabase: Verify password is correct in connection string

### Error: "Prisma Client not generated"
**Solution:**
Update build command to:
```bash
npx prisma generate && next build
```

### Error: "Table does not exist"
**Solution:**
Run migrations:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Can't login after deployment
**Solution:**
1. Check `NEXTAUTH_URL` matches your deployment URL
2. Verify `NEXTAUTH_SECRET` is set
3. Run seed script to create admin user:
   ```bash
   npx prisma db seed
   ```

### Build succeeds but app crashes
**Solution:**
Check Vercel logs:
1. Go to **Deployments** tab
2. Click on the deployment
3. Click **"Functions"** tab
4. Check error logs

---

## 📋 Post-Deployment Checklist

- [ ] Database connected successfully
- [ ] Migrations applied (`npx prisma migrate deploy`)
- [ ] Seed data loaded (`npx prisma db seed`)
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard loads correctly
- [ ] Can add meal counts
- [ ] Can add bazar costs (admin)
- [ ] Can add payments (admin)
- [ ] Report page shows data
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database password is strong
- [ ] `.env` file is in `.gitignore`
- [ ] No secrets committed to GitHub

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎉 Success!

Your mess ledger app is now live! Share the URL with your mess members and start tracking expenses! 🍽️
