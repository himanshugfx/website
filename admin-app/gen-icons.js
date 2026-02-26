// Generate simple solid-color PNG icons for Expo app
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 2;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;
    const ihdr = makeChunk('IHDR', ihdrData);
    const rawData = Buffer.alloc(height * (1 + width * 3));
    for (let y = 0; y < height; y++) {
        const offset = y * (1 + width * 3);
        rawData[offset] = 0;
        for (let x = 0; x < width; x++) {
            const px = offset + 1 + x * 3;
            rawData[px] = r;
            rawData[px + 1] = g;
            rawData[px + 2] = b;
        }
    }
    const compressed = zlib.deflateSync(rawData);
    const idat = makeChunk('IDAT', compressed);
    const iend = makeChunk('IEND', Buffer.alloc(0));
    return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

const assetsDir = path.join(__dirname, 'assets');

const icon = createPNG(1024, 1024, 124, 58, 237);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('Created icon.png:', icon.length, 'bytes');

const adaptiveIcon = createPNG(1024, 1024, 124, 58, 237);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
console.log('Created adaptive-icon.png:', adaptiveIcon.length, 'bytes');

const favicon = createPNG(48, 48, 124, 58, 237);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);
console.log('Created favicon.png:', favicon.length, 'bytes');

console.log('All icons generated successfully!');
