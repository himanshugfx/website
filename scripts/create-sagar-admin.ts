import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function createSagarAdmin() {
    try {
        const email = 'sagar@anosebeauty.com';
        const password = 'Anose@4184';

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log(`User ${email} already exists! Updating role to admin...`);
            await prisma.user.update({
                where: { email },
                data: { role: 'admin' }
            });
            return;
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                name: 'Sagar',
                email: email,
                password: hashedPassword,
                role: 'admin',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSagarAdmin();
