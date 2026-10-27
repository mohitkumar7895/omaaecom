require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedZones() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM service_zones');
    if (existing[0].cnt > 0) {
      console.log(`service_zones already has ${existing[0].cnt} zones.`);
      return;
    }

    const [cats] = await conn.query("SELECT id FROM categories WHERE status = 'Active'");
    const catIds = cats.map(c => c.id);

    const defaultZones = [
      {
        name: "Noida & Greater Noida West (Gaur City)",
        city_names: "Noida, Greater Noida West",
        coordinates: JSON.stringify({
          type: "circle",
          center: { lat: 28.5355, lng: 77.391 },
          radiusKm: 30,
          points: []
        }),
        category_ids: JSON.stringify(catIds),
        status: "Active"
      },
      {
        name: "Delhi NCR Central & South",
        city_names: "Delhi, South Delhi, East Delhi",
        coordinates: JSON.stringify({
          type: "circle",
          center: { lat: 28.6139, lng: 77.209 },
          radiusKm: 25,
          points: []
        }),
        category_ids: JSON.stringify(catIds),
        status: "Active"
      },
      {
        name: "Ghaziabad & Indirapuram",
        city_names: "Ghaziabad, Indirapuram, Vaishali",
        coordinates: JSON.stringify({
          type: "circle",
          center: { lat: 28.6692, lng: 77.4538 },
          radiusKm: 20,
          points: []
        }),
        category_ids: JSON.stringify(catIds),
        status: "Active"
      },
      {
        name: "Greater Noida & Pari Chowk",
        city_names: "Greater Noida, Knowledge Park",
        coordinates: JSON.stringify({
          type: "circle",
          center: { lat: 28.4744, lng: 77.504 },
          radiusKm: 25,
          points: []
        }),
        category_ids: JSON.stringify(catIds),
        status: "Active"
      },
      {
        name: "Gurugram / Gurgaon",
        city_names: "Gurugram, DLF Phase 1-5, Sohna Road",
        coordinates: JSON.stringify({
          type: "circle",
          center: { lat: 28.4595, lng: 77.0266 },
          radiusKm: 25,
          points: []
        }),
        category_ids: JSON.stringify(catIds),
        status: "Active"
      }
    ];

    for (const z of defaultZones) {
      await conn.query(
        "INSERT INTO service_zones (name, city_names, coordinates, category_ids, status) VALUES (?, ?, ?, ?, ?)",
        [z.name, z.city_names, z.coordinates, z.category_ids, z.status]
      );
      console.log(`Inserted zone: ${z.name}`);
    }

    console.log("Seeded 5 default service zones successfully!");
  } finally {
    await conn.end();
  }
}

seedZones().catch(console.error);
