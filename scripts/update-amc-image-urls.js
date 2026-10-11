require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

const updates = [
  [46, "/uploads/services/amc-kent-color.webp"],
  [47, "/uploads/services/amc-livpure-color.webp"],
  [48, "/uploads/services/amc-havells-color.webp"],
  [49, "/uploads/services/amc-pureit-color.webp"],
];

(async () => {
  const p = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });
  for (const [id, url] of updates) {
    await p.query("UPDATE services SET image_url = ? WHERE id = ?", [url, id]);
    console.log("updated", id, url);
  }
  await p.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
