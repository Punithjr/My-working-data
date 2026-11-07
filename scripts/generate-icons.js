import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG generator using Node's built-in zlib
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // CRC calculation
    let crc = 0xFFFFFFFF;
    const chunkData = buf.subarray(4, 8 + len);
    for (let i = 0; i < chunkData.length; i++) {
      let byte = chunkData[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xEDB88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    buf.writeInt32BE(~crc, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + width * 3 bytes per scanline
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  // Draw a rounded-corner blue tile with white document symbol
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Distance from center
      const dx = Math.abs(x - centerX);
      const dy = Math.abs(y - centerY);
      const maxD = Math.max(dx, dy);

      // Background color #2563eb
      let pr = 37, pg = 99, pb = 235;

      // Inner white card
      if (x >= width * 0.28 && x <= width * 0.72 && y >= height * 0.22 && y <= height * 0.78) {
        // Document fold corner
        if (x > width * 0.58 && y < height * 0.38) {
          pr = 147; pg = 197; pb = 253; // light blue fold
        } else {
          pr = 255; pg = 255; pb = 255; // white document
        }
      }

      // Compression arrow in center
      if (x >= width * 0.42 && x <= width * 0.58 && y >= height * 0.45 && y <= height * 0.65) {
        pr = 37; pg = 99; pb = 235; // blue arrow
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512));
console.log('PWA PNG icons generated successfully in /public');
