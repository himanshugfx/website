const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const emails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const password = process.env.ADMIN_PASSWORD;

    if (emails.length === 0 || !password) {
        console.error('Usage: ADMIN_EMAILS=a@b.com,c@d.com ADMIN_PASSWORD=... node set-admin-pass.js');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
