import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
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
                    create: product.variation.map((v: any) => ({
                        color: v.color,
                        colorCode: v.colorCode,
                        colorImage: v.colorImage,
                        image: v.image,
                    })),
                },
            },
        })
    }

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
