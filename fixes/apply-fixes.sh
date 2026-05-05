#!/bin/bash
# ============================================================
# apply-fixes.sh — Run this from the ROOT of your website repo
# Usage: bash apply-fixes.sh
# ============================================================

set -e

echo "🔧 Applying anose_website fixes..."

# ── 1. Prisma singleton ──────────────────────────────────────
echo ""
echo "📦 [1/4] Installing Prisma singleton..."
mkdir -p lib
cp fixes/lib/prisma.ts lib/prisma.ts
echo "  ✓ lib/prisma.ts created"

# ── 2. prisma.config.ts ──────────────────────────────────────
echo ""
echo "📦 [2/4] Adding prisma.config.ts..."
cp fixes/prisma.config.ts prisma.config.ts
echo "  ✓ prisma.config.ts created"

# Remove the deprecated prisma key from package.json
echo "  → Removing deprecated 'prisma' key from package.json..."
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  delete pkg.prisma;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('  ✓ package.json cleaned');
"

# ── 3. Rename middleware → proxy ─────────────────────────────
echo ""
echo "📦 [3/4] Renaming middleware.ts → proxy.ts..."

MIDDLEWARE_FILES=("middleware.ts" "middleware.js" "src/middleware.ts" "src/middleware.js")
FOUND=false

for f in "${MIDDLEWARE_FILES[@]}"; do
  if [ -f "$f" ]; then
    DIR=$(dirname "$f")
    cp "fixes/proxy.ts" "$DIR/proxy.ts"
    git rm "$f" 2>/dev/null || rm "$f"
    echo "  ✓ $f removed, $DIR/proxy.ts added"
    echo ""
    echo "  ⚠️  IMPORTANT: proxy.ts was pre-filled with a common auth pattern."
    echo "     Please review $DIR/proxy.ts and make sure the logic matches"
    echo "     what your old middleware.ts was doing before committing."
    FOUND=true
    break
  fi
done

if [ "$FOUND" = false ]; then
  cp fixes/proxy.ts proxy.ts
  echo "  ℹ️  No middleware.ts found. Created a template proxy.ts at root."
  echo "     Review and adjust the logic, then delete if not needed."
fi

# ── 4. npm audit fix ─────────────────────────────────────────
echo ""
echo "📦 [4/4] Running npm audit fix..."
npm audit fix
echo "  ✓ npm audit fix completed (check output above for any remaining issues)"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "✅ All fixes applied!"
echo ""
echo "Next steps:"
echo "  1. Review proxy.ts — make sure auth logic matches your old middleware.ts"
echo "  2. Search your codebase for 'from.*prisma' or 'require.*prisma' imports"
echo "     and update them to: import prisma from '@/lib/prisma'"
echo "  3. Run: npm run build  — to verify everything compiles"
echo "  4. git add -A && git commit -m 'fix: prisma singleton, proxy rename, audit fix'"
echo "  5. git push  — Vercel will auto-deploy"
