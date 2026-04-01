const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Order' AND column_name = 'transactionId'`;
    console.log(JSON.stringify(res, null, 2));

    const migrations = await prisma.$queryRaw`SELECT * FROM _prisma_migrations`;
    console.log("Migrations:", JSON.stringify(migrations, null, 2));
  } catch(e) { console.error(e.message); }
  finally { await prisma.$disconnect(); }
}
check();
