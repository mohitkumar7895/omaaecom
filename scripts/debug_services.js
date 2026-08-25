const mysql = require('../node_modules/mysql2/promise');

async function debugServices() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ommaecom'
  });

  const [services] = await conn.query('SELECT id, category_id, title FROM services');
  console.log('--- ALL SERVICES (count:', services.length, ') ---');
  console.log(services);

  const [categories] = await conn.query('SELECT * FROM categories');
  console.log('--- ALL CATEGORIES ---');
  console.log(categories);

  const [rateCards] = await conn.query('SELECT id, category_id, heading_id, part_name, price FROM rate_cards');
  console.log('--- ALL RATE CARDS (count:', rateCards.length, ') ---');
  console.log(rateCards);

  await conn.end();
}

debugServices().catch(console.error);
