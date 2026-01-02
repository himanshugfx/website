import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMigration() {
    try {
        console.log('Testing database migration...\n');

        // Try to query an order with the new fields
        const testOrder = await prisma.order.findFirst({
            select: {
                id: true,
                cancelRequest: true,
                returnRequest: true,
                cancelReason: true,
                returnReason: true,
            },
        });

        if (testOrder !== null) {
            console.log('✅ Migration successful! New fields are accessible:');
            console.log('   - cancelRequest:', testOrder.cancelRequest ?? 'null');
            console.log('   - returnRequest:', testOrder.returnRequest ?? 'null');
            console.log('   - cancelReason:', testOrder.cancelReason ?? 'null');
            console.log('   - returnReason:', testOrder.returnReason ?? 'null');
            console.log('\n✅ All new fields are present in the database schema!');
        } else {
            // Even if no orders exist, we can test by trying to create a query
            // that includes the new fields - if they don't exist, this will error
            const schemaTest = await prisma.$queryRaw`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE LOWER(table_name) = 'order' 
                AND column_name IN ('cancelRequest', 'returnRequest', 'cancelReason', 'returnReason')
                ORDER BY column_name
            `;
            
            const columns = (schemaTest as any[]).map((row: any) => row.column_name);
            
            if (columns.length === 4) {
                console.log('✅ Migration successful! All 4 new columns found in database:');
                columns.forEach(col => console.log(`   - ${col}`));
            } else {
                console.log('❌ Migration incomplete. Found columns:', columns);
                console.log('   Expected: cancelRequest, returnRequest, cancelReason, returnReason');
                process.exit(1);
            }
        }

        await prisma.$disconnect();
        console.log('\n✅ Migration test passed!');
    } catch (error: any) {
        console.error('❌ Migration test failed:', error.message);
        
        if (error.message.includes('Environment variable not found: DATABASE_URL')) {
            console.error('\n⚠️  DATABASE_URL environment variable is not set!');
            console.error('\n📝 To fix this, create a .env file in the root directory with:');
            console.error('\n   For PostgreSQL:');
            console.error('   DATABASE_URL="postgresql://user:password@host:port/database"');
            console.error('\n   For SQLite (local development):');
            console.error('   DATABASE_URL="file:./prisma/dev.db"');
            console.error('\n   Also add:');
            console.error('   NEXTAUTH_SECRET="your-secret-key"');
            console.error('   NEXTAUTH_URL="http://localhost:3000"');
            console.error('\n   See ENV_SETUP.md for more details.');
        } else if (error.message.includes('Unknown column') || (error.message.includes('column') && error.message.includes('does not exist'))) {
            console.error('\n⚠️  The new fields are not in the database yet.');
            console.error('   Please run: npx prisma migrate deploy');
            console.error('   Or manually execute the SQL in: prisma/migrations/20260102122407_add_cancel_return_fields/migration.sql');
        }
        
        await prisma.$disconnect();
        process.exit(1);
    }
}

testMigration();

