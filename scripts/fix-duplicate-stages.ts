import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== Checking Funnel Stages ===\n');

    // Get all stages
    const stages = await prisma.funnelStage.findMany({
        include: {
            _count: { select: { leads: true } }
        },
        orderBy: { order: 'asc' }
    });

    console.log('All stages in database:');
    stages.forEach(stage => {
        console.log(`  - ${stage.name} (order: ${stage.order}, id: ${stage.id}, leads: ${stage._count.leads})`);
    });

    // Check for duplicates by name
    const stageCounts: Record<string, number> = {};
    stages.forEach(stage => {
        stageCounts[stage.name] = (stageCounts[stage.name] || 0) + 1;
    });

    const duplicates = Object.entries(stageCounts).filter(([, count]) => count > 1);

    if (duplicates.length > 0) {
        console.log('\n⚠️  DUPLICATES FOUND:');
        duplicates.forEach(([name, count]) => {
            console.log(`  - "${name}" appears ${count} times`);
        });

        console.log('\n🔧 Cleaning up duplicates...');

        for (const [name] of duplicates) {
            const duplicateStages = stages.filter(s => s.name === name);

            // Keep the first one (lowest order), delete the rest
            const [keep, ...remove] = duplicateStages.sort((a, b) => a.order - b.order);
            console.log(`  Keeping "${name}" with id: ${keep.id}`);

            for (const stage of remove) {
                // Move leads from duplicate to the kept stage
                const leadsToMove = await prisma.lead.count({ where: { stageId: stage.id } });
                if (leadsToMove > 0) {
                    console.log(`  Moving ${leadsToMove} leads from duplicate to kept stage...`);
                    await prisma.lead.updateMany({
                        where: { stageId: stage.id },
                        data: { stageId: keep.id }
                    });
                }

                // Delete the duplicate stage
                console.log(`  Deleting duplicate stage id: ${stage.id}`);
                await prisma.funnelStage.delete({ where: { id: stage.id } });
            }
        }

        console.log('\n✅ Cleanup complete!');

        // Show updated stages
        const updatedStages = await prisma.funnelStage.findMany({
            include: { _count: { select: { leads: true } } },
            orderBy: { order: 'asc' }
        });

        console.log('\nUpdated stages:');
        updatedStages.forEach(stage => {
            console.log(`  - ${stage.name} (order: ${stage.order}, leads: ${stage._count.leads})`);
        });
    } else {
        console.log('\n✅ No duplicates found - all stages are unique!');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
