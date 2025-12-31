# Anose Beauty E-commerce Website

A modern e-commerce platform built with Next.js, featuring product management, shopping cart, wishlist, order processing, and admin dashboard.

## Tech Stack

- **Framework**: Next.js 16.1.1
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Payment**: PhonePe Integration
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (for production)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with the following variables:
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy Options

1. **Vercel** (Recommended): See [DEPLOYMENT.md](./DEPLOYMENT.md#vercel-deployment)
2. **Docker**: See [DEPLOYMENT.md](./DEPLOYMENT.md#docker-deployment)
3. **Self-Hosted**: See [DEPLOYMENT.md](./DEPLOYMENT.md#self-hosted-deployment)

## Project Structure

```
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── context/      # React context providers
│   ├── lib/          # Utility functions and configurations
│   └── types/        # TypeScript type definitions
└── scripts/          # Utility scripts
```

## Features

- 🛍️ Product catalog with categories and filters
- 🛒 Shopping cart functionality
- ❤️ Wishlist management
- 👤 User authentication and accounts
- 💳 Payment processing (PhonePe)
- 📦 Order management
- 🎫 Promo code system
- 👨‍💼 Admin dashboard
- 📱 Responsive design

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
