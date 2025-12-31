# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

## Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Optional Variables (for PhonePe Payment)

```env
PHONEPE_MERCHANT_ID="your_merchant_id"
PHONEPE_SALT_KEY="your_salt_key"
PHONEPE_SALT_INDEX="1"
PHONEPE_ENV="PROD"
```

## Generating NEXTAUTH_SECRET

Generate a secure secret key:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Development vs Production

### Development
- Use SQLite: `DATABASE_URL="file:./dev.db"`
- Use localhost: `NEXTAUTH_URL="http://localhost:3000"`

### Production
- Use PostgreSQL: `DATABASE_URL="postgresql://..."` (with SSL)
- Use your domain: `NEXTAUTH_URL="https://yourdomain.com"`

## Notes

- Never commit `.env` file to version control
- Use different secrets for development and production
- Keep `NEXTAUTH_SECRET` secure and consistent across deployments

