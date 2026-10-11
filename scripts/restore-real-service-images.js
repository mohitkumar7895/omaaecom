require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

const restores = [
  [1, "/uploads/services/1787316110905-foam-jet-ac.webp"],
  [2, "/uploads/services/1787316128946-premium-ac-service.webp"],
  [3, "/uploads/services/1787316140673-anti-rust-ac.webp"],
  [4, "/uploads/services/1787316152672-power-issue-check-up.webp"],
  [5, "/uploads/services/1787316608900-Ac-repair.webp"],
  [6, "/uploads/services/1787316634075-gas-refil.webp"],
  [7, "/uploads/services/1787316664650-less-cooling.webp"],
  [8, "/uploads/services/1787316693104-water-leekage.webp"],
  [9, "/uploads/services/1787316721070-noise-smell.webp"],
  [10, "/uploads/services/1787316837718-window-ac.webp"],
  [11, "/uploads/services/1787316863915-Split-Ac.webp"],
  [12, "/uploads/services/1787316910874-Window-Ac-un.webp"],
  [13, "/uploads/services/1787316983587-Split-ac-un.webp"],
  [14, "/uploads/services/1787319732540-refrigerator.webp"],
  [15, "/uploads/services/1787319758182-power-issue.webp"],
  [16, "/uploads/services/1787319781621-excess-colling.webp"],
  [17, "/uploads/services/1787319811505-no-colling.webp"],
  [18, "/uploads/services/1787319844357-noise-issue.webp"],
  [19, "/uploads/services/1787319877489-water-leakage.webp"],
  [20, "/uploads/services/1787319893830-less.webp"],
  [21, "/uploads/services/1787319906802-door-issue.webp"],
  [32, "/uploads/services/1787321077009-all-brands.webp"],
  [33, "/uploads/services/1787321052764-water-purifier.webp"],
  [34, "/uploads/services/1787321037929-WPFC.webp"],
  [35, "/uploads/services/1787321019675-WPRS.webp"],
  [36, "/uploads/services/1787320999039-WPFS.webp"],
  [37, "/uploads/services/1787320981236-WPI.webp"],
  [38, "/uploads/services/1787320960539-WPU.webp"],
];

(async () => {
  const p = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });
  for (const [id, url] of restores) {
    await p.query("UPDATE services SET image_url = ? WHERE id = ?", [url, id]);
    console.log("restored", id);
  }
  await p.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
