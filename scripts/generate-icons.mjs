import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { deflateSync, crc32 } from 'zlib';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

function drawIcon(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const bg = [26, 20, 16, 255];
  const gold = [196, 154, 108, 255];
  const blue = [122, 154, 184, 255];

  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer ring
  const ringR = w * 0.38;
  const ringW = w * 0.04;
  if (Math.abs(dist - ringR) < ringW) return gold;

  // Two overlapping circles inside the ring
  const c1x = cx - w * 0.1, c1y = cy - h * 0.05;
  const c2x = cx + w * 0.1, c2y = cy + h * 0.05;
  const r1 = w * 0.16, r2 = w * 0.16;

  const d1 = Math.sqrt((x - c1x) ** 2 + (y - c1y) ** 2);
  const d2 = Math.sqrt((x - c2x) ** 2 + (y - c2y) ** 2);

  if (d1 < r1 && d2 < r2) {
    // Overlap region
    const blend = Math.min(1, (d1 / r1 + d2 / r2) / 2);
    return [
      Math.round(gold[0] * (1 - blend) + blue[0] * blend),
      Math.round(gold[1] * (1 - blend) + blue[1] * blend),
      Math.round(gold[2] * (1 - blend) + blue[2] * blend),
      255,
    ];
  }
  if (d1 < r1) return gold;
  if (d2 < r2) return blue;

  return bg;
}

function makePNG(w, h, drawPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const ihdrChunk = chunk('IHDR', ihdr);

  const rowSize = 1 + w * 4;
  const raw = Buffer.alloc(h * rowSize);
  for (let y = 0; y < h; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = drawPixel(x, y, w, h);
      const off = y * rowSize + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }

  const compressed = deflateSync(raw);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeB, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal >>> 0);
  return Buffer.concat([len, typeB, data, crcBuf]);
}

const sizes = [192, 512];
for (const size of sizes) {
  const png = makePNG(size, size, drawIcon);
  writeFileSync(resolve(OUT, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${png.length} bytes)`);
}
