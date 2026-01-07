/**
 * Script to download product images from external URLs and save locally
 * Run with: node scripts/download-product-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Product images directory
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'products');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Product image mappings - slug to image info
const products = [
    {
        slug: 'beaded-facewash-50ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/19/image_1024/Beaded%20Facewash%2050ml?unique=d972c73',
        filename: 'beaded-facewash-50ml.jpg'
    },
    {
        slug: 'beaded-facewash-100ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/6/image_1024/Beaded%20Facewash%20100ml?unique=51fa503',
        filename: 'beaded-facewash-100ml.jpg'
    },
    {
        slug: 'spf50-sunscreen-50ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/7/image_1024/SPF50%20Sunscreen%2050ml?unique=1afd8ac',
        filename: 'spf50-sunscreen-50ml.jpg'
    },
    {
        slug: 'anose-face-cream-15g',
        url: 'https://www.anosebeauty.com/web/image/product.product/8/image_1024/Anose%20FaceCream%2015g?unique=bbb0925',
        filename: 'anose-face-cream-15g.jpg'
    },
    {
        slug: 'kajal-set-of-2',
        url: 'https://www.anosebeauty.com/web/image/product.product/20/image_1024/Kajal%20%28Smudge%20%26%20Water%20Proof%29%20%20Set%20of%202?unique=9a09f82',
        filename: 'kajal-set-of-2.jpg'
    },
    {
        slug: 'hibiscus-shampoo-100ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/9/image_1024/Hibiscuss%20Shampoo%20100ml?unique=429cf0a',
        filename: 'hibiscus-shampoo-100ml.jpg'
    },
    {
        slug: 'hibiscus-shampoo-200ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/10/image_1024/Hibiscus%20Shampoo%20200ml?unique=f349bf6',
        filename: 'hibiscus-shampoo-200ml.jpg'
    },
    {
        slug: 'hair-conditioner-100ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/11/image_1024/Hair%20Conditioner%20100ml?unique=3cef000',
        filename: 'hair-conditioner-100ml.jpg'
    },
    {
        slug: 'herbal-facewash-100ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/12/image_1024/Herbal%20Facewash%20100ml?unique=1ea24d6',
        filename: 'herbal-facewash-100ml.jpg'
    },
    {
        slug: 'herbal-facewash-200ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/13/image_1024/Herbal%20Facewash%20200ml?unique=42701bf',
        filename: 'herbal-facewash-200ml.jpg'
    },
    {
        slug: 'makeup-brush-set-of-13',
        url: 'https://www.anosebeauty.com/web/image/product.product/18/image_1024/Makeup%20Brush%20%28Set%20of%2013%29?unique=66553d9',
        filename: 'makeup-brush-set-of-13.jpg'
    },
    {
        slug: 'plastic-dropper-3ml',
        url: 'https://www.anosebeauty.com/web/image/product.product/14/image_1024/Plastic%20Dropper%203ml?unique=66553d9',
        filename: 'plastic-dropper-3ml.jpg'
    }
];

// Download function with redirects
function downloadImage(url, filepath, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) {
            reject(new Error('Too many redirects'));
            return;
        }

        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = response.headers.location;
                console.log(`  Redirecting to: ${redirectUrl}`);
                downloadImage(redirectUrl, filepath, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(filepath);
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        });

        request.on('error', reject);
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timed out'));
        });
    });
}

// Generate SQL/Prisma update statements
function generateUpdateStatements() {
    console.log('\n=== Prisma Update Statements ===\n');

    products.forEach(product => {
        const localPath = `/assets/images/products/${product.filename}`;
        const imagesJson = JSON.stringify([localPath]);

        console.log(`// Update ${product.slug}`);
        console.log(`await prisma.product.updateMany({`);
        console.log(`  where: { slug: '${product.slug}' },`);
        console.log(`  data: {`);
        console.log(`    thumbImage: '${localPath}',`);
        console.log(`    images: '${imagesJson}'`);
        console.log(`  }`);
        console.log(`});\n`);
    });
}

// Main function
async function main() {
    console.log('Downloading product images...\n');
    console.log(`Saving to: ${IMAGES_DIR}\n`);

    for (const product of products) {
        const filepath = path.join(IMAGES_DIR, product.filename);

        console.log(`Downloading: ${product.slug}`);
        console.log(`  From: ${product.url}`);
        console.log(`  To: ${filepath}`);

        try {
            await downloadImage(product.url, filepath);
            console.log(`  ✓ Success\n`);
        } catch (error) {
            console.log(`  ✗ Error: ${error.message}\n`);
        }
    }

    generateUpdateStatements();

    console.log('\n=== Done! ===');
    console.log('Next steps:');
    console.log('1. Check downloaded images in public/assets/images/products/');
    console.log('2. Run the Prisma update statements to update the database');
}

main();
