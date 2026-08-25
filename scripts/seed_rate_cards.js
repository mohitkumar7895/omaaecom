const mysql = require('../node_modules/mysql2/promise');

async function seedRateCards() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ommaecom'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rate_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      heading_id INT NOT NULL,
      part_name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      labour_charges DECIMAL(10,2) NOT NULL,
      labour_note VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const rateCardRows = [
    { cat: 1, head: 1, part: 'Non-Inverter PCB repaired', price: 1500, labour: 199 },
    { cat: 1, head: 1, part: 'Inverter PCB repaired', price: 4500, labour: 199 },
    { cat: 1, head: 1, part: 'LVT (Transformer)', price: 900, labour: 199 },
    { cat: 1, head: 1, part: 'Replace sensor', price: 350, labour: 199 },
    { cat: 1, head: 1, part: 'Contactor replaced', price: 500, labour: 199 },
    { cat: 1, head: 1, part: 'Contactor Daikin/ O-General', price: 1500, labour: 199 },
    { cat: 1, head: 1, part: 'Convert PCB with remote', price: 1500, labour: 199 },
    { cat: 1, head: 1, part: 'Fan Capacitor - 2.5 to 10 mfd', price: 250, labour: 199 },
    { cat: 1, head: 1, part: 'Comp Capacitor - 25 to 60 mfd', price: 400, labour: 199 },
    { cat: 1, head: 1, part: 'Combo Capacitor (Comp+Fan)', price: 500, labour: 199 },
    { cat: 1, head: 1, part: 'Fuse Change in PCB', price: 150, labour: 199 },
    { cat: 1, head: 2, part: 'Gas Charging', price: 2700, labour: 199 },
    { cat: 1, head: 2, part: 'Flair nut replaced', price: 150, labour: 199 },
    { cat: 1, head: 2, part: 'Copper Coil Condensor 1 ton Split', price: 4000, labour: 199 },
    { cat: 1, head: 2, part: 'Copper Coil Condensor 1.5 ton Split', price: 4500, labour: 199 },
    { cat: 1, head: 2, part: 'Copper Coil Condensor 2 ton Split', price: 5300, labour: 199 },
    { cat: 1, head: 2, part: 'Copper Cooling Coil (Split AC)', price: 6500, labour: 199 },
    { cat: 1, head: 2, part: 'Capillary and filter replaced', price: 350, labour: 199 }
  ];

  for (const item of rateCardRows) {
    const [existing] = await conn.query('SELECT id FROM rate_cards WHERE category_id = ? AND part_name = ?', [item.cat, item.part]);
    if (existing.length === 0) {
      await conn.query(
        'INSERT INTO rate_cards (category_id, heading_id, part_name, price, labour_charges, labour_note) VALUES (?, ?, ?, ?, ?, ?)',
        [item.cat, item.head, item.part, item.price, item.labour, null]
      );
    }
  }

  const [count] = await conn.query('SELECT COUNT(*) as total FROM rate_cards');
  console.log('Successfully inserted! Total Rate Cards in DB:', count[0].total);
  await conn.end();
}

seedRateCards().catch(console.error);
