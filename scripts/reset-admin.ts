import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function resetAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';

    if (!email || !password) {
        console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node scripts/reset-admin.ts');
        process.exit(1);
    }

    console.log('Resetting admin credentials...');
    console.log('Email:', email);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                name,
            },
            create: {
                email,
                password: hashedPassword,
                role: 'admin',
                name,
            },
        });

        console.log('Admin credentials updated successfully!');
        console.log('User ID:', user.id);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
    } catch (error) {
        console.error('Error resetting admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
