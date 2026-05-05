# anose_website — Fix Bundle

Generated from Vercel debug session. Apply these to fix all 4 issues found.

---

## Files in this bundle

| File | Fixes |
|------|-------|
| `lib/prisma.ts` | PrismaClient singleton — prevents new DB connections on every cold start |
| `prisma.config.ts` | Replaces deprecated `package.json#prisma` config key (required before Prisma 7) |
| `proxy.ts` | Replaces deprecated `middleware.ts` for Next.js 16+ |
| `apply-fixes.sh` | One-shot script to apply everything automatically |

---

## Option A — Automated (recommended)

```bash
# From your repo root:
mkdir fixes
cp -r /path/to/this-bundle/* fixes/
bash fixes/apply-fixes.sh
```

---

## Option B — Manual steps

### 1. Prisma singleton (`lib/prisma.ts`)

Copy `lib/prisma.ts` into your repo at `lib/prisma.ts`.

Then update all files that create their own PrismaClient:
```ts
// ❌ Before (in each API route)
const prisma = new PrismaClient()
console.log('Instantiating new PrismaClient')

// ✅ After
import prisma from '@/lib/prisma'
```

---

### 2. Prisma config (`prisma.config.ts`)

Copy `prisma.config.ts` to your repo root.

Then remove the `"prisma"` key from `package.json`:
```json
// ❌ Remove this block from package.json:
"prisma": {
  "schema": "prisma/schema.prisma"
}
```

---

### 3. Middleware → Proxy rename

```bash
# In your repo root (or src/ if using src dir):
mv middleware.ts proxy.ts   # or middleware.js → proxy.js
```

Review `proxy.ts` — the template covers common NextAuth admin/account
protection. Make sure it matches whatever your old `middleware.ts` was doing.

---

### 4. npm audit fix

```bash
npm audit fix
# If vulnerabilities remain:
npm audit fix --force   # ⚠️ may have breaking changes — review diff carefully
```

---

## After applying all fixes

```bash
npm run build          # verify it compiles
git add -A
git commit -m "fix: prisma singleton, proxy rename, prisma config, audit fix"
git push               # Vercel auto-deploys
```
