import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ommaecom',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 5,
});

export async function runDatabaseMigrations() {
  try {
    console.log("Checking and executing database migrations...");

    // 1. Create site_policies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_policies (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        last_updated VARCHAR(100),
        contact_email VARCHAR(255),
        sections JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed Privacy Policy default
    const privacySections = [
      {
        heading: "1. Information We Collect",
        bullets: [
          "Personal Information: Name, phone number, email address",
          "Service Details: Address, service location, appliance information",
          "Booking Information: Service date, time preferences"
        ]
      },
      {
        heading: "2. How We Use Your Information",
        bullets: [
          "Booking and scheduling services",
          "Customer support and service-related communication",
          "Processing payments and managing transactions"
        ]
      },
      {
        heading: "3. Information Sharing",
        bullets: [
          "We do not sell your personal information to third parties",
          "We may share information only as required to deliver our services"
        ]
      },
      {
        heading: "4. Data Security",
        bullets: [
          "Customer data is stored securely using industry-standard security measures",
          "Access to personal information is restricted to authorized personnel only"
        ]
      },
      {
        heading: "5. Contact Us",
        content: "For privacy-related concerns, contact us at: support@omaacompany.com",
        bullets: []
      }
    ];

    await pool.query(`
      INSERT INTO site_policies (id, title, subtitle, last_updated, contact_email, sections)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        last_updated = VALUES(last_updated),
        contact_email = VALUES(contact_email)
    `, [
      'privacy-policy',
      'Privacy Policy',
      'How we collect, use, and protect your information',
      'January 2026',
      'support@omaacompany.com',
      JSON.stringify(privacySections)
    ]);

    // Seed Terms & Conditions default
    const termsSections = [
      {
        heading: "1. Service Agreement",
        bullets: [
          "OMAA Company provides home appliance repair and maintenance services through trained service professionals",
          "Service availability depends on location and technician availability"
        ]
      },
      {
        heading: "2. Customer Responsibilities",
        bullets: [
          "Customers must provide accurate details while booking a service",
          "Ensure a safe and suitable working environment at the service location"
        ]
      },
      {
        heading: "3. Pricing and Payments",
        bullets: [
          "Service charges, inspection fees, and spare part costs will be informed before service execution",
          "Any additional work will be carried out only after customer approval"
        ]
      },
      {
        heading: "4. Limitations of Liability",
        bullets: [
          "OMAA Company is not responsible for issues caused by misuse, power fluctuations, or improper installation by third parties"
        ]
      },
      {
        heading: "5. Warranty Terms",
        bullets: [
          "Warranty, if provided, is limited only to the service performed or parts replaced"
        ]
      },
      {
        heading: "6. Policy Updates",
        bullets: [
          "OMAA Company reserves the right to update services, prices, or policies at any time"
        ]
      }
    ];

    await pool.query(`
      INSERT INTO site_policies (id, title, subtitle, last_updated, contact_email, sections)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        last_updated = VALUES(last_updated),
        contact_email = VALUES(contact_email)
    `, [
      'terms-and-conditions',
      'Terms & Conditions',
      "By using OMAA Company's website or services, you agree to the following terms and conditions.",
      'January 2026',
      'support@omaacompany.com',
      JSON.stringify(termsSections)
    ]);

    // 2. Create service_zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city_names VARCHAR(255) DEFAULT '',
        coordinates JSON NOT NULL,
        category_ids JSON NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Ensure status column in registration_records
    try {
      await pool.query(`
        ALTER TABLE registration_records 
        ADD COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
      `);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.warn("Notice on registration_records alter:", e.message);
      }
    }

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

if (process.argv[1]?.endsWith('setup-enhancements.js')) {
  runDatabaseMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}
