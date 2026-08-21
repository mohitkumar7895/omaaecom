const mysql = require('mysql2/promise');

async function seed() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'ommaecom' });

  try {
    const [categories] = await pool.query('SELECT id, title FROM categories');
    const [subcategories] = await pool.query('SELECT id, category_id, title FROM subcategories');

    const findIds = (catTitle, subTitle) => {
      const cat = categories.find(c => c.title.toLowerCase().includes(catTitle.toLowerCase()));
      if (!cat) return null;
      // Exact match for subcategory or includes (some subtitles have spaces etc)
      const sub = subcategories.find(s => s.category_id === cat.id && s.title.toLowerCase().includes(subTitle.toLowerCase()));
      if (!sub) return null;
      return { catId: cat.id, subId: sub.id, catName: cat.title };
    };

    const data = [
      // Ac Repair - Service
      { c: 'Ac Repair', s: 'Service', t: 'Foam jet service', p: 499, r: '4.80' },
      { c: 'Ac Repair', s: 'Service', t: 'Premium AC Service', p: 499, r: '4.80' },
      { c: 'Ac Repair', s: 'Service', t: 'Anti Rust AC Service', p: 499, r: '4.50' },
      { c: 'Ac Repair', s: 'Service', t: 'Power issue/check-up', p: 249, r: '4.80' },
      // Ac Repair - Repair
      { c: 'Ac Repair', s: 'Repair', t: 'AC repair', p: 249, r: '4.80' },
      { c: 'Ac Repair', s: 'Repair', t: 'Gas refill & check-up', p: 2700, r: '4.80' },
      { c: 'Ac Repair', s: 'Repair', t: 'Less cooling/ check-up', p: 249, r: '4.50' },
      { c: 'Ac Repair', s: 'Repair', t: 'Water leakage/check-up', p: 249, r: '4.80' },
      { c: 'Ac Repair', s: 'Repair', t: 'Noise/smell', p: 499, r: '4.80' },
      // Ac Repair - Installation/uninstallation
      { c: 'Ac Repair', s: 'Installation', t: 'Window AC', p: 700, r: '4.80' },
      { c: 'Ac Repair', s: 'Installation', t: 'Split AC installation', p: 1499, r: '4.80' },
      { c: 'Ac Repair', s: 'Installation', t: 'Window AC/uninstallation', p: 599, r: '4.80' },
      { c: 'Ac Repair', s: 'Installation', t: 'Split AC uninstallation', p: 650, r: '4.80' },

      // Refrigerator - Single door
      { c: 'Refrigerator', s: 'Single door', t: 'Refrigerator check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Power issue/check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Excess cooling', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'No cooling/check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Noise issue/check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Water leakage/check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Less cooling/check-up', p: 199, r: '4.80' },
      { c: 'Refrigerator', s: 'Single door', t: 'Door issue/check-up', p: 199, r: '4.80' },

      // Washing Machine - Servicing
      { c: 'Washing Machine', s: 'Servicing', t: 'Washing Machine Jet Service', p: 699, r: '4.50' },
      // Washing Machine - Repair
      { c: 'Washing Machine', s: 'Repair', t: 'Automatic top load machine check-up', p: 199, r: '4.80' },
      { c: 'Washing Machine', s: 'Repair', t: 'Automatic front load machine check-up', p: 199, r: '4.50' },
      { c: 'Washing Machine', s: 'Repair', t: 'Semi-automatic machine check-up', p: 199, r: '4.80' },
      // Washing Machine - installation
      { c: 'Washing Machine', s: 'installation', t: 'Full automatic top load', p: 299, r: '4.80' },
      { c: 'Washing Machine', s: 'installation', t: 'Fully automatic front load', p: 399, r: '4.80' },
      { c: 'Washing Machine', s: 'installation', t: 'Semi-automatic', p: 299, r: '4.80' },

      // Microwave - Repair
      { c: 'Microwave', s: 'Repair', t: 'Not heating/check-up', p: 199, r: '4.80' },
      { c: 'Microwave', s: 'Repair', t: 'Not working/check-up', p: 199, r: '4.50' },
      { c: 'Microwave', s: 'Repair', t: 'Buttons issue/check-up', p: 199, r: '4.80' },

      // Water Purifier - Servicing
      { c: 'Water Purifier', s: 'Servicing', t: 'All brands & Non-brands service', p: 299, r: '4.80' },
      // Water Purifier - Repair
      { c: 'Water Purifier', s: 'Repair', t: 'Water Purifier Check-Up', p: 160, r: '4.80' },
      { c: 'Water Purifier', s: 'Repair', t: 'Water Purifier Filter Check-Up', p: 160, r: '4.80' },
      { c: 'Water Purifier', s: 'Repair', t: 'Water Purifier Regular Service', p: 1299, r: '4.50' },
      { c: 'Water Purifier', s: 'Repair', t: 'Water Purifier Full Service', p: 2600, r: '4.80' },
      // Water Purifier - Installation
      { c: 'Water Purifier', s: 'Installation', t: 'Water Purifier Installation', p: 299, r: '4.80' },
      { c: 'Water Purifier', s: 'Installation', t: 'Water Purifier Uninstallation', p: 199, r: '4.80' },

      // RO AMC - Local / Non-branded
      { c: 'RO AMC', s: 'Local', t: 'RO & Refrigerator', p: 4000, r: '4.80' },
      { c: 'RO AMC', s: 'Local', t: 'Aqua Grand', p: 4000, r: '4.50' },
      { c: 'RO AMC', s: 'Local', t: 'Aqua Grand Plus', p: 4000, r: '4.50' },
      { c: 'RO AMC', s: 'Local', t: 'Aquafresh', p: 4000, r: '4.70' },
      { c: 'RO AMC', s: 'Local', t: 'Aqua Ultra', p: 4000, r: '4.90' },
      { c: 'RO AMC', s: 'Local', t: 'All Local Branded', p: 4000, r: '4.90' },
      { c: 'RO AMC', s: 'Local', t: 'AC / Water Purifier / Refrigerator', p: 4000, r: '4.90' },
      // RO AMC - Branded
      { c: 'RO AMC', s: 'Branded', t: 'KENT All Model', p: 4000, r: '4.80' },
      { c: 'RO AMC', s: 'Branded', t: 'Livpure All Model', p: 4000, r: '4.80' },
      { c: 'RO AMC', s: 'Branded', t: 'Havells RO, Model', p: 4000, r: '4.80' },
      { c: 'RO AMC', s: 'Branded', t: 'pureitRo', p: 4000, r: '4.80' },
    ];

    console.log("Emptying services table...");
    await pool.query('TRUNCATE TABLE services');

    console.log("Inserting 49 services...");
    
    let count = 0;
    for (const item of data) {
      const ids = findIds(item.c, item.s);
      
      let img = null;
      // Re-use category images for some thumbnails so it doesn't look empty
      if (ids && ids.catName) {
        if (ids.catName.toLowerCase().includes("ac")) img = '/uploads/categories/1787305945917-Ac.webp';
        if (ids.catName.toLowerCase().includes("refrigerator")) img = '/uploads/categories/1787306320607-refri.webp';
        if (ids.catName.toLowerCase().includes("washing")) img = '/uploads/categories/1787306340796-washiuing.webp';
        if (ids.catName.toLowerCase().includes("microwave")) img = '/uploads/categories/1787306352958-micro.webp';
        if (ids.catName.toLowerCase().includes("water")) img = '/uploads/categories/1787306368357-water.webp';
      }

      if (ids) {
        await pool.query(
          'INSERT INTO services (category_id, subcategory_id, title, selling_price, rating, short_description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [ids.catId, ids.subId, item.t, item.p, item.r, "Professional service | Experienced staff", img]
        );
        count++;
      } else {
        console.log(`Could not map: ${item.c} > ${item.s}`);
      }
    }

    console.log(`Successfully inserted ${count} services!`);
    process.exit(0);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seed();
