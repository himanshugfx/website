import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DIR = path.join(process.cwd(), 'src');

const skipFiles = ['fav.png', 'apple-icon.png', 'icon.png'];

async function processDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            
            if (['.png', '.jpg', '.jpeg'].includes(ext) && !skipFiles.includes(entry.name)) {
                const webpPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + '.webp';
                try {
                    console.log(`Converting ${fullPath} to webp...`);
                    await sharp(fullPath).webp({ quality: 80 }).toFile(webpPath);
                    await fs.unlink(fullPath); // delete old file
                } catch (e) {
                    console.error(`Error converting ${entry.name}:`, e);
                }
            }
        }
    }
}

async function updateReferences(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await updateReferences(fullPath);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.ts', '.tsx', '.css', '.json'].includes(ext) || entry.name === 'next.config.ts') {
                try {
                    let content = await fs.readFile(fullPath, 'utf8');
                    let modified = false;

                    // A bit rudimentary but works for standard paths ending in .png / .jpg
                    // Exclude fav.png
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
                        console.log(`Updated references in ${fullPath}`);
                    }
                } catch (e) {
                    console.error(`Error reading/writing ${fullPath}:`, e);
                }
            }
        }
    }
}

async function main() {
    console.log("Starting image conversion...");
    await processDirectory(PUBLIC_DIR);
    console.log("Image conversion complete.");
    
    console.log("Updating source references...");
    await updateReferences(SRC_DIR);
    console.log("Source references updated.");
}

main().catch(console.error);
