# Deployment Guide

This guide covers multiple deployment options for the Anose Beauty e-commerce website.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Database Migration](#database-migration)
- [Post-Deployment Steps](#post-deployment-steps)

## Prerequisites

1. **PostgreSQL Database**: The application uses PostgreSQL in production. Choose one:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com) (Free tier available)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)
   - [PlanetScale](https://planetscale.com)

2. **Node.js 20+** installed locally (for development)

3. **Git** repository set up

## Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production domain (e.g., `https://yourdomain.com`)

### Optional Variables

- `PHONEPE_MERCHANT_ID`: PhonePe merchant ID (if using PhonePe payments)
- `PHONEPE_SALT_KEY`: PhonePe salt key
- `PHONEPE_SALT_INDEX`: PhonePe salt index (default: "1")
- `PHONEPE_ENV`: "PROD" for production, leave unset for sandbox

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - For `NEXTAUTH_URL`, use your Vercel deployment URL

4. **Set up Database**
   - In Vercel dashboard, go to Storage → Create Database
   - Choose "Postgres"
   - Copy the connection string to `DATABASE_URL`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

6. **Run Database Migrations**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Link to your project
   vercel link
   
   # Run migrations
   npx prisma migrate deploy
   ```

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add all other variables

# Deploy to production
vercel --prod
```

## Docker Deployment

### Build Docker Image

```bash
npm run docker:build
```

Or manually:
```bash
docker build -t anose-website .
```

### Run Docker Container

```bash
npm run docker:run
```

Or manually:
```bash
docker run -p 3000:3000 --env-file .env anose-website
```

### Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: anose_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## Self-Hosted Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Clone and Setup

```bash
# Clone repository
git clone <your-repo-url>
cd website

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE anose_db;
CREATE USER anose_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE anose_db TO anose_user;
\q

# Update DATABASE_URL in .env
# DATABASE_URL="postgresql://anose_user:your_password@localhost:5432/anose_db"
```

### 4. Build and Deploy

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "anose-website" -- start
pm2 save
pm2 startup
```

### 5. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/anose`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/anose /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Database Migration

### From SQLite to PostgreSQL

If you have existing data in SQLite:

1. **Export SQLite data**:
   ```bash
   sqlite3 prisma/dev.db .dump > dump.sql
   ```

2. **Create PostgreSQL database** and run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. **Import data** (manual process required - SQLite and PostgreSQL have different syntax)

### Fresh Deployment

For a fresh deployment:

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

## Post-Deployment Steps

### 1. Create Admin User

```bash
npm run tsx scripts/create-admin.ts
```

Or manually via API/script after deployment.

### 2. Verify Deployment

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin dashboard accessible
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout process works (if payment configured)
- [ ] File uploads work (if cloud storage configured)

### 3. File Uploads

The application currently uses local file storage (`public/uploads`). For production:

**Option A: Vercel Blob Storage**
```typescript
import { put } from '@vercel/blob';
const blob = await put(filename, file, { access: 'public' });
```

**Option B: AWS S3**
- Install `@aws-sdk/client-s3`
- Configure S3 bucket
- Update upload endpoints

**Option C: Cloudinary**
- Install `cloudinary`
- Configure Cloudinary account
- Update image handling

### 4. Monitoring

- Set up error tracking (Sentry, LogRocket)
- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up analytics (Google Analytics, Vercel Analytics)

### 5. Backup Strategy

- **Database**: Set up automated PostgreSQL backups
- **Files**: Backup uploaded files to cloud storage
- **Environment**: Store `.env` securely (use secrets management)

## Troubleshooting

### Build Fails

- Check Node.js version (requires 20+)
- Verify all environment variables are set
- Check Prisma client generation: `npx prisma generate`

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check database is accessible from deployment environment
- Verify SSL mode for production databases

### NextAuth Issues

- Ensure `NEXTAUTH_SECRET` is set and consistent
- Verify `NEXTAUTH_URL` matches your domain
- Check callback URLs in NextAuth configuration

### File Upload Issues

- Local storage won't work on Vercel (ephemeral filesystem)
- Migrate to cloud storage (see File Uploads section)

## Support

For issues or questions:
- Check application logs
- Review Vercel deployment logs
- Check database connection
- Verify environment variables

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Docker Documentation](https://docs.docker.com/)

