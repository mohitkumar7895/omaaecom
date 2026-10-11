require("dotenv").config({ quiet: true });
const sharp = require("sharp");
const path = require("path");
const mysql = require("mysql2/promise");

const ASSETS = "C:\\Users\\Mohit Kumar\\.cursor\\projects\\b-Delhi-Pro-omaaecom\\assets";
const OUT = path.join(__dirname, "..", "public", "uploads", "services");

const JOBS = [
  [1, "svc-ac-foam-jet.jpg", "svc-ac-foam-jet.webp"],
  [2, "svc-ac-premium.jpg", "svc-ac-premium.webp"],
  [3, "svc-ac-antirust.jpg", "svc-ac-antirust.webp"],
  [4, "svc-ac-power.jpg", "svc-ac-power.webp"],
  [5, "svc-ac-repair.jpg", "svc-ac-repair.webp"],
  [6, "svc-ac-gas.jpg", "svc-ac-gas.webp"],
  [7, "svc-ac-lesscool.jpg", "svc-ac-lesscool.webp"],
  [8, "svc-ac-leak.jpg", "svc-ac-leak.webp"],
  [9, "svc-ac-noise.jpg", "svc-ac-noise.webp"],
  [10, "svc-ac-window.jpg", "svc-ac-window.webp"],
  [11, "svc-ac-split-install.jpg", "svc-ac-split-install.webp"],
  [12, "svc-ac-window-un.jpg", "svc-ac-window-un.webp"],
  [13, "svc-ac-split-un.jpg", "svc-ac-split-un.webp"],
  [14, "svc-fridge-checkup.jpg", "svc-fridge-checkup.webp"],
  [15, "svc-fridge-power.jpg", "svc-fridge-power.webp"],
  [16, "svc-fridge-excess.jpg", "svc-fridge-excess.webp"],
  [17, "svc-fridge-nocool.jpg", "svc-fridge-nocool.webp"],
  [18, "svc-fridge-noise.jpg", "svc-fridge-noise.webp"],
  [19, "svc-fridge-leak.jpg", "svc-fridge-leak.webp"],
  [20, "svc-fridge-less.jpg", "svc-fridge-less.webp"],
  [21, "svc-fridge-door.jpg", "svc-fridge-door.webp"],
  [29, "svc-micro1.jpg", "svc-micro1.webp"],
  [31, "svc-micro1.jpg", "svc-micro1.webp"],
  [30, "svc-micro2.jpg", "svc-micro2.webp"],
  [32, "svc-wp-allbrands.jpg", "svc-wp-allbrands.webp"],
  [33, "svc-wp-checkup.jpg", "svc-wp-checkup.webp"],
  [34, "svc-wp-filter.jpg", "svc-wp-filter.webp"],
  [35, "svc-wp-regular.jpg", "svc-wp-regular.webp"],
  [36, "svc-wp-full.jpg", "svc-wp-full.webp"],
  [37, "svc-wp-install.jpg", "svc-wp-install.webp"],
  [38, "svc-wp-uninstall.jpg", "svc-wp-uninstall.webp"],
];

(async () => {
  const written = new Set();
  for (const [, srcName, destName] of JOBS) {
    if (written.has(destName)) continue;
    const src = path.join(ASSETS, srcName);
    const dest = path.join(OUT, destName);
    await sharp(src).resize(1080, 1080, { fit: "cover" }).webp({ quality: 86 }).toFile(dest);
    written.add(destName);
    console.log("webp", destName);
  }

  const p = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });
  for (const [id, , destName] of JOBS) {
    const url = `/uploads/services/${destName}`;
    await p.query("UPDATE services SET image_url = ? WHERE id = ?", [url, id]);
    console.log("db", id, url);
  }
  await p.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
