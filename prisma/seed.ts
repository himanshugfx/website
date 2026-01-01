import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Seed Products
    try {
        const productsData = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'public/assets/data/Product.json'), 'utf-8')
        )

        for (const product of productsData) {
            await prisma.product.upsert({
                where: { slug: product.slug },
                update: {},
                create: {
                    category: product.category,
                    type: product.type,
                    name: product.name,
                    gender: product.gender,
                    new: product.new,
                    sale: product.sale,
                    rate: product.rate,
                    price: product.price,
                    originPrice: product.originPrice,
                    brand: product.brand,
                    sold: product.sold,
                    quantity: product.quantity,
                    quantityPurchase: product.quantityPurchase,
                    sizes: JSON.stringify(product.sizes),
                    description: product.description,
                    slug: product.slug,
                    images: JSON.stringify(product.images),
                    thumbImage: JSON.stringify(product.thumbImage),
                    variations: {
                        create: product.variation.map((v: { color: string; colorCode: string; colorImage: string; image: string }) => ({
                            color: v.color,
                            colorCode: v.colorCode,
                            colorImage: v.colorImage,
                            image: v.image,
                        })),
                    },
                },
            })
        }
    } catch (error) {
        console.log("Product seed skipped or failed (file might not exist):", error);
    }

    // Seed Admin User
    const adminEmail = "admin@anose.com";
    const adminPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: adminPassword,
            role: "admin",
        },
        create: {
            name: "Admin User",
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        },
    });

    console.log(`Admin user created/verified: ${admin.email}`);
    console.log('Seed completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
