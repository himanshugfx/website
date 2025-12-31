import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function createAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@anose.com' },
        });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@anose.com');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@anose.com',
                password: hashedPassword,
                role: 'admin',
            },
        });
        

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@anose.com');
        console.log('Password: admin123');
        console.log('\nℹ️  Please change the password after first login');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
