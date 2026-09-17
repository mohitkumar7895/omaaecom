const mysql = require('mysql2/promise');

async function setup() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'ommaecom'
  });

  try {
    // Drop existing table if needed (optional)
    await pool.query('DROP TABLE IF EXISTS subcategories');
    
    console.log("Creating subcategories table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Fetch existing categories to map dummy data to their IDs
    const [categories] = await pool.query('SELECT id, title FROM categories');
    console.log("Found categories:", categories.length);

    if (categories.length === 0) {
      console.log("No categories found. Run setup-categories.js first.");
      process.exit(1);
    }

    const dummySubcategories = [
      { catTitle: 'Ac Repair', subTitle: 'Service' },
      { catTitle: 'Ac Repair', subTitle: 'Repair' },
      { catTitle: 'Ac Repair', subTitle: 'Installation/uninstallation' },
      { catTitle: 'Refrigerator', subTitle: 'Single door/double door /side-by-side door' },
      { catTitle: 'Washing Machine', subTitle: 'Servicing' },
      { catTitle: 'Washing Machine', subTitle: 'Repair' },
      { catTitle: 'Washing Machine', subTitle: 'installation/ unstation' },
      { catTitle: 'Microwave', subTitle: 'Repair' },
      { catTitle: 'Water Purifier', subTitle: 'Servicing' },
      { catTitle: 'Water Purifier', subTitle: 'Repair' },
      { catTitle: 'Water Purifier', subTitle: 'Installation/uninstallation' },
    ];

    console.log("Inserting dummy subcategories...");
    
    for (const item of dummySubcategories) {
      // Find matching category ID (partial match)
      const cat = categories.find(c => c.title.toLowerCase().includes(item.catTitle.toLowerCase()));
      if (cat) {
        // Find existing category image_url to copy as a fallback if needed? 
        // No, user wants a separate upload. We will leave image_url as null or empty string, or copy the category image.
        // Looking at the user's screenshot, the subcategory rows show an image (e.g. AC unit, washing machine).
        // I will use some dummy images.
        let image = '';
        if (cat.title.toLowerCase().includes("ac")) image = '/uploads/categories/1787305945917-Ac.webp'; // Re-use the AC image they uploaded
        if (cat.title.toLowerCase().includes("refrigerator")) image = '/uploads/categories/1787306320607-refri.webp';
        if (cat.title.toLowerCase().includes("washing")) image = '/uploads/categories/1787306340796-washiuing.webp';
        if (cat.title.toLowerCase().includes("microwave")) image = '/uploads/categories/1787306352958-micro.webp';
        if (cat.title.toLowerCase().includes("water")) image = '/uploads/categories/1787306368357-water.webp';
        
        await pool.query(
          'INSERT INTO subcategories (category_id, title, image_url) VALUES (?, ?, ?)',
          [cat.id, item.subTitle, image]
        );
      }
    }

    console.log("Subcategories setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up subcategories:", error);
    process.exit(1);
  }
}

setup();
