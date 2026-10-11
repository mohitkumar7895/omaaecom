const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const DIR = path.join(__dirname, "..", "public", "uploads", "services");

const JOBS = [
  {
    file: "1787320393944-kent-all.webp",
    colors: ["#d9f3ff", "#7ec8f8", "#3aa0e8"],
  },
  {
    file: "1787320454368-hevells.webp",
    colors: ["#d8f4ef", "#5fb8a8", "#1f7a72"],
  },
  {
    file: "1787320472547-pureit-ro.webp",
    colors: ["#ffe8d6", "#ffb38a", "#f08a5d"],
  },
  {
    file: "1787320425391-livepurwe.webp",
    colors: ["#e8f8ee", "#8ed4a8", "#3fa36a"],
  },
];

function floodClearWhite(data, width, height) {
  const n = width * height;
  const visited = new Uint8Array(n);
  const q = [];
  const isBg = (i) => {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    if (a < 8) return true;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    return min > 232 && max - min < 18;
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
  return data;
}

async function gradientPng(size, colors) {
  const [c1, c2, c3] = colors;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="38%" r="72%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="55%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

(async () => {
  for (const job of JOBS) {
    const src = path.join(DIR, job.file);
    const { data, info } = await sharp(src)
      .ensureAlpha()
      .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });

    floodClearWhite(data, info.width, info.height);

    const cutout = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer();

    const canvas = 1080;
    const bg = await gradientPng(canvas, job.colors);
    const product = await sharp(cutout)
      .resize(Math.round(canvas * 0.86), Math.round(canvas * 0.86), {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
    const meta = await sharp(product).metadata();
    const left = Math.round((canvas - (meta.width || canvas)) / 2);
    const top = Math.round((canvas - (meta.height || canvas)) / 2);

    const tmp = src.replace(/\.webp$/i, ".colored.webp");
    await sharp(bg)
      .composite([{ input: product, left, top }])
      .webp({ quality: 88 })
      .toFile(tmp);
    fs.copyFileSync(tmp, src);
    fs.unlinkSync(tmp);

    console.log("colored", job.file);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
