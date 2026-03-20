
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: 'TEST-INV-001',
                customerName: 'Test',
                customerEmail: 'test@example.com',
                invoiceDate: new Date(),
                total: 0,
            }
        });
        console.log('Success:', invoice);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
