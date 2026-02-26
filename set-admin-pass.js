const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const emails = ['anosebeauty@gmail.com', 'himanshu@anosebeauty.com', 'himanshu.gfx@gmail.com'];
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    for (const email of emails) {
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    role: 'admin',
                    password: hashedPassword,
                }
            });
            console.log(`Created admin user: ${email}`);
        } else {
            user = await prisma.user.update({
                where: { email },
                data: {
                    role: 'admin',
                    password: hashedPassword,
                }
            });
            console.log(`Updated admin user: ${email}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
