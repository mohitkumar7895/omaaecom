const mysql = require('mysql2/promise');

async function setup() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'ommaecom'
  });

  try {
    console.log("Dropping old services table...");
    await pool.query('DROP TABLE IF EXISTS services');
    
    console.log("Creating services table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        subcategory_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        original_price DECIMAL(10, 2) DEFAULT NULL,
        selling_price DECIMAL(10, 2) NOT NULL,
        rating VARCHAR(10) DEFAULT '0.0',
        warranty_days INT DEFAULT 180,
        warranty_description TEXT,
        short_description TEXT,
        long_description TEXT,
        image_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
      )
    `);

    // Fetch existing categories and subcategories
    const [categories] = await pool.query('SELECT id, title FROM categories');
    const [subcategories] = await pool.query('SELECT id, category_id, title FROM subcategories');

    if (categories.length === 0 || subcategories.length === 0) {
      console.log("Need categories and subcategories to proceed.");
      process.exit(1);
    }

    const findCatSub = (catTitle, subTitle) => {
      const cat = categories.find(c => c.title.toLowerCase().includes(catTitle.toLowerCase()));
      if (!cat) return null;
      const sub = subcategories.find(s => s.category_id === cat.id && s.title.toLowerCase().includes(subTitle.toLowerCase()));
      if (!sub) return null;
      return { catId: cat.id, subId: sub.id };
    };

    const dummyServices = [
      { catTitle: 'Ac Repair', subTitle: 'Service', title: 'Foam jet service', sp: 499, rating: '4.80' },
      { catTitle: 'Ac Repair', subTitle: 'Service', title: 'Premium AC Service', sp: 499, rating: '4.80' },
      { catTitle: 'Ac Repair', subTitle: 'Service', title: 'Anti Rust AC Service', sp: 499, rating: '4.50' },
      { catTitle: 'Ac Repair', subTitle: 'Service', title: 'Power issue/check-up', sp: 249, rating: '4.80' },
      { catTitle: 'Ac Repair', subTitle: 'Repair', title: 'AC repair', sp: 249, rating: '4.80' },
      { catTitle: 'Refrigerator', subTitle: 'Single door', title: 'Refrigerator check-up', sp: 199, rating: '4.80' },
      { catTitle: 'Washing Machine', subTitle: 'Servicing', title: 'Washing Machine Jet Service', sp: 699, rating: '4.50' },
      { catTitle: 'Washing Machine', subTitle: 'Repair', title: 'Automatic top load machine check-up', sp: 199, rating: '4.80' },
    ];

    console.log("Inserting dummy services...");
    
    for (const item of dummyServices) {
      const ids = findCatSub(item.catTitle, item.subTitle);
      if (ids) {
        await pool.query(
          'INSERT INTO services (category_id, subcategory_id, title, selling_price, rating, short_description) VALUES (?, ?, ?, ?, ?, ?)',
          [ids.catId, ids.subId, item.title, item.sp, item.rating, "Professional service | Experienced staff | Quality guaranteed"]
        );
      }
    }

    console.log("Services setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up services:", error);
    process.exit(1);
  }
}

setup();
