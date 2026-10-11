const sharp = require("sharp");
const path = require("path");

const WALL =
  "C:\\Users\\Mohit Kumar\\.cursor\\projects\\b-Delhi-Pro-omaaecom\\assets\\kitchen-wall-plate.jpg";
const DIR = path.join(__dirname, "..", "public", "uploads", "services");

function floodClearStudio(data, width, height) {
  const visited = new Uint8Array(width * height);
  const q = [];
  const isBg = (i) => {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a < 10) return true;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    return avg > 168 && max - min < 42;
  };
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i] || !isBg(i)) return;
    visited[i] = 1;
    q.push(i);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (q.length) {
    const i = q.pop();
    data[i * 4 + 3] = 0;
    const x = i % width;
    const y = (i - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

async function cutout(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize(900, 900, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  floodClearStudio(data, info.width, info.height);
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function placeOnWall(productBuf, destName) {
  const canvas = 1080;
  const wall = await sharp(WALL).resize(canvas, canvas, { fit: "cover" }).png().toBuffer();
  const product = await sharp(productBuf)
    .resize(Math.round(canvas * 0.62), Math.round(canvas * 0.5), { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(product).metadata();
  const left = Math.round((canvas - (meta.width || 0)) / 2);
  const top = Math.round(canvas * 0.42 - (meta.height || 0) / 2);
  await sharp(wall)
    .composite([{ input: product, left, top }])
    .webp({ quality: 88 })
    .toFile(path.join(DIR, destName));
  console.log("wrote", destName);
}

(async () => {
  const m1 = await cutout(path.join(DIR, "1787315029625-micro1.webp"));
  const m2 = await cutout(path.join(DIR, "1787315048129-micro2.webp"));
  await placeOnWall(m1, "svc-micro1-wall.webp");
  await placeOnWall(m2, "svc-micro2-wall.webp");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
