# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code is Ready
- [x] Build completes successfully (`npm run build`)
- [x] Database schema updated to PostgreSQL
- [x] Database migrations completed
- [x] Database seeded with products
- [x] All environment variables documented

### 2. Known Issues to Address

#### ⚠️ File Uploads (Important)
The application currently uses local file storage (`public/uploads`) which **won't work on Vercel** because Vercel has an ephemeral filesystem.

**Current Status:** File uploads will fail on Vercel.

**Solutions:**
1. **Vercel Blob Storage** (Recommended for Vercel)
2. **Cloudinary** (Easy to set up)
3. **AWS S3** (More complex but scalable)

**Temporary Workaround:** You can deploy without fixing this, but admin product image uploads won't work. Existing products with external URLs will still work.

## 🚀 Deployment Steps

### Step 1: Push to GitHub/GitLab/Bitbucket

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

#### Required Variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_9XxdVGgnqf1C@ep-tiny-moon-a1ni1wwr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=4e140455e7f1a9eb15a57c6b1312324a
NEXTAUTH_URL=https://your-project.vercel.app
```

#### Optional Variables (if using PhonePe):
```
PHONEPE_MERCHANT_ID=M22ZMR0ZA87ZB
PHONEPE_SALT_KEY=7c139f5c-fce2-4c37-93d7-886ebc66668a
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=PROD
```

**Important:** 
- Update `NEXTAUTH_URL` after first deployment to match your actual Vercel URL
- Never commit `.env` file to Git (it's already in `.gitignore`)

### Step 4: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (or leave empty)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://your-project.vercel.app`)

### Step 6: Run Database Migrations

After first deployment, run migrations:

```bash
# Option 1: Using Vercel CLI
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy

# Option 2: Using Vercel's built-in terminal (if available)
# Or run locally with production DATABASE_URL
```

### Step 7: Update NEXTAUTH_URL

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual deployment URL
3. Redeploy (or it will update on next deployment)

### Step 8: Create Admin User

After deployment, create an admin user:

```bash
# Option 1: Run locally with production DATABASE_URL
# Update .env with production DATABASE_URL temporarily
npm run tsx scripts/create-admin.ts

# Option 2: Add a temporary API endpoint to create admin
# (More secure for production)
```

## 🔧 Post-Deployment

### Verify Everything Works

- [ ] Homepage loads
- [ ] Products display correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin dashboard accessible (after creating admin)
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Payment integration works (if configured)

### Fix File Uploads (Recommended)

**Option A: Vercel Blob Storage**

1. Install: `npm install @vercel/blob`
2. Update `src/app/api/admin/upload/route.ts`:

```typescript
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const blob = await put(file.name, file, {
            access: 'public',
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
```

3. Add `BLOB_READ_WRITE_TOKEN` to Vercel environment variables
4. Get token from: Vercel Dashboard → Storage → Blob → Create

**Option B: Cloudinary**

1. Install: `npm install cloudinary`
2. Set up Cloudinary account
3. Update upload route to use Cloudinary SDK
4. Add `CLOUDINARY_URL` to environment variables

## 📝 Notes

- **Database:** Your Neon PostgreSQL database is already set up and working
- **Build:** Build completes successfully ✅
- **File Uploads:** Need to be migrated to cloud storage for production
- **Domain:** You can add a custom domain in Vercel settings
- **SSL:** Automatically handled by Vercel

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible from Vercel
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check if Neon database allows connections from Vercel IPs
- Ensure database is not paused (Neon free tier pauses after inactivity)

### NextAuth Not Working
- Verify `NEXTAUTH_URL` matches your deployment URL exactly
- Check `NEXTAUTH_SECRET` is set
- Ensure callback URLs are correct

### File Uploads Fail
- Expected until you migrate to cloud storage
- See "Fix File Uploads" section above

## ✅ You're Ready!

Your project is ready to deploy to Vercel. The main thing to address after deployment is the file upload functionality, but the rest should work perfectly!

