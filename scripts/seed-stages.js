
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Funnel Stages...');

    const count = await prisma.funnelStage.count();

    if (count === 0) {
        console.log('No stages found. Seeding default stages...');

        const stages = [
            { name: 'New Lead', order: 1, color: '#3B82F6' },       // Blue
            { name: 'Contacted', order: 2, color: '#F59E0B' },      // Amber
            { name: 'Qualified', order: 3, color: '#8B5CF6' },      // Purple
            { name: 'Proposal', order: 4, color: '#EC4899' },       // Pink
            { name: 'Negotiation', order: 5, color: '#F97316' },    // Orange
            { name: 'Won', order: 6, color: '#10B981' },            // Emerald
            { name: 'Lost', order: 7, color: '#EF4444' },           // Red
        ];

        for (const stage of stages) {
            await prisma.funnelStage.create({
                data: stage
            });
            console.log(`Created stage: ${stage.name}`);
        }
        console.log('Seeding completed.');
    } else {
        console.log(`Found ${count} stages. Skipping seed.`);
    }

    const leads = await prisma.lead.findMany();
    console.log(`Current Lead Count: ${leads.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
