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

## PhonePe Payment (Optional)

```env
PHONEPE_MERCHANT_ID="your_merchant_id"
PHONEPE_SALT_KEY="your_salt_key"
PHONEPE_SALT_INDEX="1"
PHONEPE_ENV="PROD"
```

## Delhivery Shipping Integration

Get your API credentials from the Delhivery dashboard at https://track.delhivery.com

```env
# Delhivery API Configuration
DELHIVERY_API_URL="https://track.delhivery.com"
DELHIVERY_API_TOKEN="your_delhivery_api_token_here"
DELHIVERY_CLIENT_NAME="your_pickup_location_name"

# Seller/Return Address (used for return shipments)
DELHIVERY_SELLER_NAME="Anose Beauty"
DELHIVERY_SELLER_ADDRESS="Your Business Address Here"
DELHIVERY_SELLER_CITY="Delhi"
DELHIVERY_SELLER_STATE="Delhi"
DELHIVERY_SELLER_PINCODE="110001"
DELHIVERY_SELLER_PHONE="9999999999"
```

### Getting Delhivery API Token
1. Log in to your Delhivery dashboard
2. Navigate to Settings → API Settings
3. Generate or copy your API Token
4. Your Client Name is typically your registered pickup location name

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

## Complete .env Template

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# PHONEPE PAYMENT (Optional)
# ===========================================
PHONEPE_MERCHANT_ID="your_merchant_id"
PHONEPE_SALT_KEY="your_salt_key"
PHONEPE_SALT_INDEX="1"
PHONEPE_ENV="PROD"

# ===========================================
# DELHIVERY SHIPPING INTEGRATION
# ===========================================
DELHIVERY_API_URL="https://track.delhivery.com"
DELHIVERY_API_TOKEN="2fd97a364d57ec8e4b990029f840a3989ee54df3"
DELHIVERY_CLIENT_NAME="Aerosys Aviation"
DELHIVERY_SELLER_NAME="Anose Beauty"
DELHIVERY_SELLER_ADDRESS="1st Floor, B-103, Sector 6"
DELHIVERY_SELLER_CITY="Noida"
DELHIVERY_SELLER_STATE="Uttar Pradesh"
DELHIVERY_SELLER_PINCODE="201301"
DELHIVERY_SELLER_PHONE="9110134408"
```

## Notes

- Never commit `.env` file to version control
- Use different secrets for development and production
- Keep `NEXTAUTH_SECRET` secure and consistent across deployments
- Store Delhivery API Token securely - it grants access to your shipping account
