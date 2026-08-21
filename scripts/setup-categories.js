import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ommaecom',
  port: parseInt(process.env.DB_PORT || '3306'),
});

async function run() {
  try {
    console.log("Altering categories table...");
    
    // Add columns if they don't exist
    const addCol = async (col, def) => {
      try {
        await pool.query(`ALTER TABLE categories ADD COLUMN ${col} ${def}`);
      } catch(e) {
        if(e.code !== 'ER_DUP_FIELDNAME') throw e;
      }
    };

    await addCol('image_url', 'VARCHAR(255) DEFAULT NULL');
    await addCol('type', "VARCHAR(50) DEFAULT 'Service'");
    await addCol('labour_charges', 'INT DEFAULT 0');
    await addCol('zones', 'INT DEFAULT 1');

    console.log("Inserting dummy categories...");
    const dummyData = [
      ['Ac Repair & Services', '/ac.png', 'Service', 199, 1],
      ['Refrigerator Repair', '/fridge.png', 'Service', 199, 1],
      ['Washing Machine', '/washing.png', 'Service', 199, 1],
      ['Microwave Repair', '/microwave.png', 'Service', 199, 1],
      ['Water Purifier Repair', '/water.png', 'Service', 199, 1],
      ['New Products', '/newprod.png', 'Product', 299, 1],
      ['RO AMC', '/roamc.png', 'Amc', 199, 1],
    ];

    const insertQuery = `
      INSERT INTO categories (title, image_url, type, labour_charges, zones)
      VALUES ?
    `;
    
    // We cannot TRUNCATE because of foreign keys, so we'll just delete all rows.
    await pool.query("DELETE FROM services"); // delete children first to avoid constraint fail
    await pool.query("DELETE FROM categories");
    await pool.query(insertQuery, [dummyData]);

    console.log("Categories table setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up DB:", error);
    process.exit(1);
  }
}

run();
