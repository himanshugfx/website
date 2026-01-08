const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map product names to image filenames
const productImageMap = {
    'Herbal Facewash 200ml': '/assets/images/product/Herbal Facewash 200ml.png',
    'Herbal Facewash 100ml': '/assets/images/product/Herbal Facewash 100ml.png',
    'Beaded Facewash 100ml': '/assets/images/product/Beads Facewash 100 ml.png',
    'Beaded Facewash 50ml': '/assets/images/product/Beads Facewash 50 ml.png',
    'Hibiscus Shampoo 200ml': '/assets/images/product/Hibiscuss Shampoo 200ml.png',
    'Hibiscuss Shampoo 100ml': '/assets/images/product/Hibiscus Shampoo 100 ml.png',
    'SPF50 Sunscreen 50ml': '/assets/images/product/Sunscreen SPF50.png',
    'Hair Conditioner 100ml': '/assets/images/product/Hair Conditioner.png',
    'Anose FaceCream 15g': '/assets/images/product/Face Cream.jpg',
};

async function updateProductImages() {
    console.log('Fetching products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products\n`);

    for (const product of products) {
        const imagePath = productImageMap[product.name];

        if (imagePath) {
            console.log(`Updating: ${product.name}`);
            console.log(`  Old thumbImage: ${product.thumbImage?.substring(0, 50)}...`);
            console.log(`  New thumbImage: ${imagePath}`);

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    thumbImage: imagePath,
                    images: JSON.stringify([imagePath]) // Set gallery to same image
                }
            });
            console.log('  ✓ Updated!\n');
        } else {
            console.log(`⚠ No image mapping found for: ${product.name}\n`);
        }
    }

    console.log('✅ All product images updated!');
}

updateProductImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
