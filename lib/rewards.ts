import pool from "./db";

export interface RewardSummary {
  points: {
    welcome_points: number;
    purchase_points: number;
    redeemed_points: number;
    available_points: number;
    history: any[];
  };
  referral_money: {
    total_earned: number;
    total_withdrawn: number;
    total_used_checkout: number;
    available_balance: number;
    min_withdrawal_limit: number;
    can_withdraw: boolean;
    history: any[];
  };
  referral_network: {
    referral_code: string;
    referral_link: string;
    level1_users: any[];
    level2_users: any[];
    total_network_count: number;
  };
  withdrawals: any[];
}

/**
 * Generates a 6-character referral code with 3 alphabetic letters and 3 numbers.
 * When an email is passed, it generates a 100% DETERMINISTIC and PERMANENT referral code for that email,
 * ensuring 1 email ALWAYS has the exact same fixed referral code forever.
 */
export function generateReferralCode(email?: string): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 letters (excluding confusing O, I)
  const digits = "23456789";                  // 8 digits (excluding confusing 0, 1)

  if (email && typeof email === "string" && email.trim().length > 0) {
    const normalized = email.trim().toLowerCase();
    let hash1 = 2166136261;
    let hash2 = 5381;
    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      hash1 ^= code;
      hash1 = Math.imul(hash1, 16777619);
      hash2 = (Math.imul(hash2, 33) + code) >>> 0;
    }
    hash1 = hash1 >>> 0;
    hash2 = hash2 >>> 0;

    const l1 = letters[hash1 % letters.length];
    const l2 = letters[Math.floor(hash1 / letters.length) % letters.length];
    const l3 = letters[Math.floor(hash1 / (letters.length * letters.length)) % letters.length];

    const d1 = digits[hash2 % digits.length];
    const d2 = digits[Math.floor(hash2 / digits.length) % digits.length];
    const d3 = digits[Math.floor(hash2 / (digits.length * digits.length)) % digits.length];

    // Mixed 6 characters (3 letters + 3 digits)
    return `${l1}${d1}${l2}${d2}${l3}${d3}`;
  }

  let result = "";
  do {
    const chars: string[] = [];
    for (let i = 0; i < 3; i++) {
      chars.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = 0; i < 3; i++) {
      chars.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    result = chars.join("");
  } while (/^[A-Z]{3}[0-9]{3}$/.test(result) || /^[0-9]{3}[A-Z]{3}$/.test(result));

  return result;
}

/**
 * Ensures user receives 100 Welcome Points upon signup
 */
export async function creditWelcomePoints(connectionOrPool: any, userEmail: string): Promise<boolean> {
  if (!userEmail) return false;
  try {
    const [existing]: any = await connectionOrPool.query(
      "SELECT id FROM reward_points_transactions WHERE user_email = ? AND category = 'welcome' LIMIT 1",
      [userEmail]
    );

    if (existing.length === 0) {
      await connectionOrPool.query(
        `INSERT INTO reward_points_transactions (user_email, points, type, category, description) 
         VALUES (?, 100, 'Credit', 'welcome', 'Welcome Bonus - 100 Signup Points')`,
        [userEmail]
      );
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error crediting welcome points:", err);
    return false;
  }
}

/**
 * Process purchase rewards when a booking status is updated to 'Complete' or 'Completed'
 * Rules:
 * - Order must be 'New Product' or 'AMC' (Category 6, Category 7, or matching type/title)
 * - Product Buyer receives 200 Reward Points
 * - Direct Referrer (Level 1) receives ₹400 Referral Money
 * - Second-Level Referrer (Level 2) receives ₹200 Referral Money
 */
export async function processBookingCompletionRewards(connectionOrPool: any, bookingId: number | string) {
  try {
    const [bookingRows]: any = await connectionOrPool.query(
      "SELECT * FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (!bookingRows || bookingRows.length === 0) {
      return { skipped: true, reason: "Booking not found" };
    }

    const booking = bookingRows[0];
    const orderId = booking.order_id;
    const buyerEmail = booking.user_email || "";
    const buyerName = booking.customer_name || "Valued Customer";

    // 1. Check if eligible for purchase referral reward (RO AMC or New Product)
    const bookingType = (booking.type || "").toLowerCase();
    const categoryName = (booking.category || "").toLowerCase();
    
    let isEligible = false;
    if (
      bookingType === "new product" || 
      bookingType === "amc" || 
      categoryName.includes("new product") || 
      categoryName.includes("ro amc") || 
      categoryName.includes("amc")
    ) {
      isEligible = true;
    } else {
      // Check services JSON items
      try {
        const services = typeof booking.services === "string" ? JSON.parse(booking.services) : booking.services;
        if (Array.isArray(services)) {
          isEligible = services.some((item: any) => {
            const catId = Number(item.category_id);
            const title = (item.title || "").toLowerCase();
            return catId === 6 || catId === 7 || title.includes("amc") || title.includes("new product");
          });
        }
      } catch (e) {}
    }

    if (!isEligible) {
      return { skipped: true, reason: "Booking is not a New Product or RO AMC" };
    }

    // 2. Prevent duplicate distribution for this order
    const [existingBuyerReward]: any = await connectionOrPool.query(
      "SELECT id FROM reward_points_transactions WHERE order_id = ? AND category = 'purchase_reward' LIMIT 1",
      [orderId]
    );

    if (existingBuyerReward && existingBuyerReward.length > 0) {
      return { skipped: true, reason: "Rewards already processed for this order" };
    }

    const results: any = { buyer_reward: null, level1_reward: null, level2_reward: null };

    // 3. Buyer gets 200 Reward Points
    if (buyerEmail) {
      await connectionOrPool.query(
        `INSERT INTO reward_points_transactions (user_email, points, type, category, order_id, description)
         VALUES (?, 200, 'Credit', 'purchase_reward', ?, ?)`,
        [buyerEmail, orderId, `Purchase Reward - 200 Points for ${booking.type || 'Product/AMC'} Order #${orderId}`]
      );
      results.buyer_reward = { email: buyerEmail, points: 200 };
    }

    // 4. Referral Money Distribution:
    // Direct Referrer (Level 1) -> ₹400
    // Second-Level Referrer (Level 2) -> ₹200
    let directReferralCode = booking.referred_by || null;

    // If not found in booking, check user record's referred_by
    if (!directReferralCode && buyerEmail) {
      const [uRows]: any = await connectionOrPool.query(
        "SELECT referred_by FROM users WHERE email = ? LIMIT 1",
        [buyerEmail]
      );
      if (uRows.length > 0 && uRows[0].referred_by) {
        directReferralCode = uRows[0].referred_by;
      }
    }

    if (directReferralCode) {
      // Find Level 1 User
      const [l1Rows]: any = await connectionOrPool.query(
        "SELECT id, email, name, referral_code, referred_by FROM users WHERE referral_code = ? LIMIT 1",
        [directReferralCode]
      );

      if (l1Rows.length > 0) {
        const l1User = l1Rows[0];

        // Ensure Level 1 user is not the buyer themselves
        if (l1User.email && l1User.email.toLowerCase() !== buyerEmail.toLowerCase()) {
          // Check if Level 1 reward already credited for this order
          const [existingL1]: any = await connectionOrPool.query(
            "SELECT id FROM referral_money_transactions WHERE order_id = ? AND user_email = ? AND level = 1 LIMIT 1",
            [orderId, l1User.email]
          );

          if (existingL1.length === 0) {
            await connectionOrPool.query(
              `INSERT INTO referral_money_transactions (user_email, amount, type, category, level, buyer_email, buyer_name, order_id, description)
               VALUES (?, 400.00, 'Credit', 'referral_bonus', 1, ?, ?, ?, ?)`,
              [
                l1User.email,
                buyerEmail,
                buyerName,
                orderId,
                `Direct Referral Money (Level 1) - ₹400 from ${buyerName} for Order #${orderId}`
              ]
            );
            results.level1_reward = { email: l1User.email, amount: 400 };
          }

          // Check if Level 1 user has a referrer (Level 2 User)
          const l2ReferralCode = l1User.referred_by;
          if (l2ReferralCode) {
            const [l2Rows]: any = await connectionOrPool.query(
              "SELECT id, email, name, referral_code FROM users WHERE referral_code = ? LIMIT 1",
              [l2ReferralCode]
            );

            if (l2Rows.length > 0) {
              const l2User = l2Rows[0];
              // Ensure Level 2 user is not the buyer and not Level 1
              if (
                l2User.email &&
                l2User.email.toLowerCase() !== buyerEmail.toLowerCase() &&
                l2User.email.toLowerCase() !== l1User.email.toLowerCase()
              ) {
                const [existingL2]: any = await connectionOrPool.query(
                  "SELECT id FROM referral_money_transactions WHERE order_id = ? AND user_email = ? AND level = 2 LIMIT 1",
                  [orderId, l2User.email]
                );

                if (existingL2.length === 0) {
                  await connectionOrPool.query(
                    `INSERT INTO referral_money_transactions (user_email, amount, type, category, level, buyer_email, buyer_name, order_id, description)
                     VALUES (?, 200.00, 'Credit', 'referral_bonus', 2, ?, ?, ?, ?)`,
                    [
                      l2User.email,
                      buyerEmail,
                      buyerName,
                      orderId,
                      `Second-Level Referral Money (Level 2) - ₹200 from ${buyerName} for Order #${orderId}`
                    ]
                  );
                  results.level2_reward = { email: l2User.email, amount: 200 };
                }
              }
            }
          }
        }
      }
    }

    return { success: true, results };
  } catch (error: any) {
    console.error("Error processing booking completion rewards:", error);
    return { error: error.message };
  }
}

/**
 * Fetch full Reward Points + Referral Money summary for user dashboard
 */
export async function getUserRewardSummary(userEmail: string): Promise<RewardSummary> {
  // 1. Get user details
  const [userRows]: any = await pool.query(
    "SELECT id, email, name, referral_code, referred_by FROM users WHERE email = ? LIMIT 1",
    [userEmail]
  );

  let referralCode = userRows[0]?.referral_code || "";
  if ((!referralCode || referralCode.startsWith("OC") || referralCode.length !== 6) && userEmail) {
    const oldCode = referralCode;
    referralCode = generateReferralCode(userEmail);
    try {
      await pool.query("UPDATE users SET referral_code = ? WHERE email = ?", [referralCode, userEmail]);
      if (oldCode) {
        await pool.query("UPDATE users SET referred_by = ? WHERE referred_by = ?", [referralCode, oldCode]);
      }
    } catch (e) {}
  }

  // Ensure user has welcome points credited
  await creditWelcomePoints(pool, userEmail);

  // 2. Points Transactions
  const [pointsRows]: any = await pool.query(
    "SELECT * FROM reward_points_transactions WHERE user_email = ? ORDER BY created_at DESC",
    [userEmail]
  );

  let welcomePoints = 0;
  let purchasePoints = 0;
  let redeemedPoints = 0;

  for (const row of pointsRows) {
    const pts = Number(row.points || 0);
    if (row.type === 'Credit') {
      if (row.category === 'welcome') welcomePoints += pts;
      else if (row.category === 'purchase_reward') purchasePoints += pts;
      else welcomePoints += pts; // fallback
    } else if (row.type === 'Debit') {
      redeemedPoints += pts;
    }
  }

  const availablePoints = Math.max(0, (welcomePoints + purchasePoints) - redeemedPoints);

  // 3. Referral Money Transactions
  const [moneyRows]: any = await pool.query(
    "SELECT * FROM referral_money_transactions WHERE user_email = ? ORDER BY created_at DESC",
    [userEmail]
  );

  let totalEarnedMoney = 0;
  let totalWithdrawnMoney = 0;
  let totalUsedCheckoutMoney = 0;

  for (const row of moneyRows) {
    const amt = Number(row.amount || 0);
    if (row.type === 'Credit') {
      totalEarnedMoney += amt;
    } else if (row.type === 'Debit') {
      if (row.category === 'withdrawal') totalWithdrawnMoney += amt;
      else if (row.category === 'purchase_deduction') totalUsedCheckoutMoney += amt;
      else totalWithdrawnMoney += amt;
    }
  }

  const availableMoneyBalance = Math.max(0, totalEarnedMoney - (totalWithdrawnMoney + totalUsedCheckoutMoney));

  // 4. Referral Network (Level 1 & Level 2)
  let level1Users: any[] = [];
  let level2Users: any[] = [];

  if (referralCode) {
    // Level 1: users who have referred_by = referralCode
    const [l1Rows]: any = await pool.query(
      `SELECT u.id, u.name, u.email, u.referral_code, u.created_at,
        (SELECT COUNT(*) FROM bookings b WHERE b.user_email = u.email COLLATE utf8mb4_unicode_ci AND (b.working_status = 'Complete' OR b.working_status = 'Completed')) as completed_orders
       FROM users u WHERE u.referred_by = ? ORDER BY u.created_at DESC`,
      [referralCode]
    );
    level1Users = l1Rows || [];

    // Level 2: users referred by level 1 users
    if (level1Users.length > 0) {
      const l1Codes = level1Users.map((u: any) => u.referral_code).filter(Boolean);
      if (l1Codes.length > 0) {
        const placeholders = l1Codes.map(() => '?').join(',');
        const [l2Rows]: any = await pool.query(
          `SELECT u.id, u.name, u.email, u.referral_code, u.referred_by, u.created_at,
            (SELECT COUNT(*) FROM bookings b WHERE b.user_email = u.email COLLATE utf8mb4_unicode_ci AND (b.working_status = 'Complete' OR b.working_status = 'Completed')) as completed_orders
           FROM users u WHERE u.referred_by IN (${placeholders}) ORDER BY u.created_at DESC`,
          l1Codes
        );
        level2Users = l2Rows || [];
      }
    }
  }

  // 5. Withdrawal Requests
  const [withdrawalRows]: any = await pool.query(
    "SELECT * FROM referral_withdrawals WHERE user_email = ? ORDER BY created_at DESC",
    [userEmail]
  );

  return {
    points: {
      welcome_points: welcomePoints,
      purchase_points: purchasePoints,
      redeemed_points: redeemedPoints,
      available_points: availablePoints,
      history: pointsRows || []
    },
    referral_money: {
      total_earned: totalEarnedMoney,
      total_withdrawn: totalWithdrawnMoney,
      total_used_checkout: totalUsedCheckoutMoney,
      available_balance: availableMoneyBalance,
      min_withdrawal_limit: 200,
      can_withdraw: availableMoneyBalance >= 200,
      history: moneyRows || []
    },
    referral_network: {
      referral_code: referralCode,
      referral_link: `https://omaacompany.com/?ref=${referralCode}`,
      level1_users: level1Users,
      level2_users: level2Users,
      total_network_count: level1Users.length + level2Users.length
    },
    withdrawals: withdrawalRows || []
  };
}
