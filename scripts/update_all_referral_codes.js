require('dotenv').config();
const mysql = require('mysql2/promise');

function generateReferralCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

async function migrate() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [users] = await c.query('SELECT id, email, referral_code FROM users');
  console.log(`Found ${users.length} users to verify.`);

  const usedCodes = new Set();

  for (const u of users) {
    let newCode;
    do {
      newCode = generateReferralCode();
    } while (usedCodes.has(newCode));
    usedCodes.add(newCode);

    const oldCode = u.referral_code;
    await c.query('UPDATE users SET referral_code = ? WHERE id = ?', [newCode, u.id]);
    
    if (oldCode) {
      await c.query('UPDATE users SET referred_by = ? WHERE referred_by = ?', [newCode, oldCode]);
    }

    console.log(`Updated user ${u.email} (${u.id}): ${oldCode} -> ${newCode}`);
  }

  const [updated] = await c.query('SELECT id, email, referral_code FROM users');
  console.log('All updated users:', updated);

  await c.end();
  console.log('Migration finished successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
