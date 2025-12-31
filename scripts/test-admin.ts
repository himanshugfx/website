import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function testAdminLogin() {
    try {
        console.log('Testing admin user...\n');

        const user = await prisma.user.findUnique({
            where: { email: 'admin@anose.com' }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('✅ User found:');
        console.log('  Email:', user.email);
        console.log('  Name:', user.name);
        console.log('  Role:', user.role);
        console.log('  Has password:', user.password ? 'Yes' : 'No');

        if (user.password) {
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('  Password match:', isMatch ? '✅ YES' : '❌ NO');

            if (!isMatch) {
                console.log('\n⚠️  Password does not match! Recreating admin user...');

                const hashedPassword = await bcrypt.hash('admin123', 10);
                await prisma.user.update({
                    where: { email: 'admin@anose.com' },
                    data: { password: hashedPassword }
                });

                console.log('✅ Password updated successfully!');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminLogin();
