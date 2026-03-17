import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const CSS_DIR = path.join(process.cwd(), 'public', 'assets', 'css');
const skipFiles = ['fav.png'];

async function updateReferences(directory) {
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                await updateReferences(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.css') {
                    let content = await fs.readFile(fullPath, 'utf8');
                    let modified = false;

                    const regex = /([a-zA-Z0-9_\-\/\\]+)\.(png|jpg|jpeg)/gi;
                    const newContent = content.replace(regex, (match, base, extension) => {
                        const filename = base.split('/').pop().split('\\').pop() + '.' + extension;
                        if (skipFiles.includes(filename.toLowerCase())) {
                            return match; // keep as is
                        }
                        modified = true;
                        return `${base}.webp`;
                    });

                    if (modified) {
                        await fs.writeFile(fullPath, newContent, 'utf8');
                        console.log(`Updated CSS references in ${fullPath}`);
                    }
                }
            }
        }
    } catch (e) {
        if (e.code !== 'ENOENT') {
            console.error(`Error processing CSS directory:`, e);
        }
    }
}

async function updateDatabase() {
    const prisma = new PrismaClient();
    try {
        console.log("Fetching products to update image references in DB...");
        const products = await prisma.product.findMany();
        let updatedCount = 0;
        
        for (const product of products) {
            let changed = false;
            let newThumb = product.thumbImage;
            let newImages = product.images;

            const regex = /\.(png|jpg|jpeg)/gi;
            
            if (newThumb && regex.test(newThumb)) {
                newThumb = newThumb.replace(regex, '.webp');
                changed = true;
            }

            if (newImages && Array.isArray(newImages)) {
                const tempImages = newImages.map(img => {
                    if (typeof img === 'string' && /\.(png|jpg|jpeg)/i.test(img)) {
                        return img.replace(/\.(png|jpg|jpeg)/gi, '.webp');
                    }
                    return img;
                });
                
                // Compare to see if changed
                if (JSON.stringify(tempImages) !== JSON.stringify(newImages)) {
                    newImages = tempImages;
                    changed = true;
                }
            }

            if (changed) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        thumbImage: newThumb,
                        images: newImages
                    }
                });
                updatedCount++;
            }
        }
        
        console.log(`Updated ${updatedCount} products in the database.`);
    } catch (e) {
        console.error("Database update error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    console.log("Updating CSS file references...");
    await updateReferences(CSS_DIR);
    console.log("Updating Database references...");
    await updateDatabase();
    console.log("Done.");
}

main().catch(console.error);
