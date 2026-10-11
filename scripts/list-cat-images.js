require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

(async () => {
  const p = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });
  const [cats] = await p.query("SELECT id, title, type FROM categories WHERE status = 'Active'");
  console.log("CATS");
  for (const c of cats) console.log(c.id, c.title, c.type);
  const [svcs] = await p.query(
    "SELECT s.id, s.category_id, c.title AS cat, s.title, s.image_url FROM services s JOIN categories c ON c.id = s.category_id ORDER BY s.category_id, s.id"
  );
  for (const s of svcs) {
    console.log([s.id, s.category_id, s.cat, s.title, s.image_url].join("\t"));
  }
  await p.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
