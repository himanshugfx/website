import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function createAdminUser() {
    const email = process.env.ADMIN_EMAIL || 'admin@anose.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node scripts/create-admin.ts');
        process.exit(1);
    }

    try {
        const existingAdmin = await prisma.user.findUnique({ where: { email } });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', email);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin',
            },
        });

        console.log('Admin user created successfully!');
        console.log('Email:', admin.email);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
