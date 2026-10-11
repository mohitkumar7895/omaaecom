require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

(async () => {
  const p = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });
  const [cats] = await p.query(
    "SELECT id, title, type FROM categories WHERE title LIKE ? OR type LIKE ?",
    ["%AMC%", "%AMC%"]
  );
  console.log("cats", cats);
  const ids = cats.map((c) => c.id);
  if (!ids.length) {
    await p.end();
    return;
  }
  const [svcs] = await p.query(
    "SELECT id, category_id, title, LEFT(image_url, 180) AS img_start, CHAR_LENGTH(image_url) AS img_len FROM services WHERE category_id IN (?)",
    [ids]
  );
  console.log(JSON.stringify(svcs, null, 2));

  const outDir = path.join(__dirname, "..", "public", "amc-products", "_src");
  fs.mkdirSync(outDir, { recursive: true });

  const [full] = await p.query(
    "SELECT id, title, image_url FROM services WHERE category_id IN (?)",
    [ids]
  );

  for (const row of full) {
    const img = row.image_url || "";
    const slug = String(row.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    if (img.startsWith("data:")) {
      const m = img.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) continue;
      const ext = m[1].includes("png") ? "png" : m[1].includes("webp") ? "webp" : "jpg";
      fs.writeFileSync(path.join(outDir, `${row.id}-${slug}.${ext}`), Buffer.from(m[2], "base64"));
      console.log("wrote data", row.id, slug, ext);
    } else if (img.startsWith("http")) {
      console.log("http", row.id, slug, img.slice(0, 120));
    } else {
      console.log("other", row.id, slug, img.slice(0, 120));
    }
  }
  await p.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
