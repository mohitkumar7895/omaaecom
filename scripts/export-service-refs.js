const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "public", "uploads", "services");
const OUT = path.join(DIR, "_ref");
fs.mkdirSync(OUT, { recursive: true });

const FILES = [
  "1787316110905-foam-jet-ac.webp",
  "1787316128946-premium-ac-service.webp",
  "1787316140673-anti-rust-ac.webp",
  "1787316152672-power-issue-check-up.webp",
  "1787316608900-Ac-repair.webp",
  "1787316634075-gas-refil.webp",
  "1787316664650-less-cooling.webp",
  "1787316693104-water-leekage.webp",
  "1787316721070-noise-smell.webp",
  "1787316837718-window-ac.webp",
  "1787316863915-Split-Ac.webp",
  "1787316910874-Window-Ac-un.webp",
  "1787316983587-Split-ac-un.webp",
  "1787319732540-refrigerator.webp",
  "1787319758182-power-issue.webp",
  "1787319781621-excess-colling.webp",
  "1787319811505-no-colling.webp",
  "1787319844357-noise-issue.webp",
  "1787319877489-water-leakage.webp",
  "1787319893830-less.webp",
  "1787319906802-door-issue.webp",
  "1787315029625-micro1.webp",
  "1787315048129-micro2.webp",
  "1787321077009-all-brands.webp",
  "1787321052764-water-purifier.webp",
  "1787321037929-WPFC.webp",
  "1787321019675-WPRS.webp",
  "1787320999039-WPFS.webp",
  "1787320981236-WPI.webp",
  "1787320960539-WPU.webp",
];

(async () => {
  for (const file of FILES) {
    const src = path.join(DIR, file);
    const dest = path.join(OUT, file.replace(/\.webp$/i, ".png"));
    await sharp(src).resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).png().toFile(dest);
    console.log("ref", path.basename(dest));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
