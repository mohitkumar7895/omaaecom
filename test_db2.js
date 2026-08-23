require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '193.203.184.149',
      user: 'u830887968_omma_ecom',
      password: 'jEaAyse88eF!@D_40',
      database: 'u830887968_ommaecom',
      port: 3306
    });

    const [rows] = await connection.query('DESCRIBE bookings');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

main();
