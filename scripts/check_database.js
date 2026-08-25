const mysql = require('../node_modules/mysql2/promise');

async function checkDatabase() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ommaecom'
  });

  const [tables] = await conn.query('SHOW TABLES');
  console.log('=== ALL ACTIVE DATABASE TABLES & RECORDS ===');
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    const [count] = await conn.query('SELECT COUNT(*) as count FROM ' + tableName);
    console.log(`- ${tableName.padEnd(25)} : ${count[0].count} records`);
  }
  await conn.end();
}

checkDatabase().catch(console.error);
