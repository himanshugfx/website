import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function createSagarAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node scripts/create-sagar-admin.ts');
        process.exit(1);
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            console.log(`User ${email} already exists! Updating role to admin...`);
            await prisma.user.update({
                where: { email },
                data: { role: 'admin' }
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                name: email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'admin',
            },
        });

        console.log('Admin user created successfully!');
        console.log(`Email: ${admin.email}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSagarAdmin();
