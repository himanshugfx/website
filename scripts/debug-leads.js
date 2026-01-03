
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const leads = await prisma.lead.findMany({
        include: {
            stage: true
        }
    });
    console.log('LEADS_DUMP_START');
    console.log(JSON.stringify(leads, null, 2));
    console.log('LEADS_DUMP_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
