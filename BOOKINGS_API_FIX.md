# Bookings API 500 Error - Fix Guide

## Problem
`GET /api/bookings/my-bookings` returns 500 error on Vercel.

## Root Cause
Your **production database** is missing required columns and tables:
- Missing `user_email` column in `bookings` table
- Missing `coupon_code` column in `bookings` table  
- Missing `coupons` table entirely

## Solution

### Step 1: Get Your Vercel Database Credentials
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click on your **MySQL** database
5. Go to **Connection Details** tab
6. Copy the credentials

### Step 2: Update Your `.env` File
Add/update these variables with your production database credentials:

```env
DB_HOST=your-vercel-db-host.sql.vercel.sh
DB_USER=default
DB_PASSWORD=your_actual_password
DB_NAME=vercel_db
DB_PORT=3306
```

### Step 3: Run the Migration Script
```bash
# Install dependencies if needed
npm install mysql2/promise

# Run migration on production database
node scripts/migrate-production.js
```

You should see:
```
✅ Connected to database
✅ user_email column added
✅ coupon_code column added
✅ coupons table created
✅ mobile column added to users
✅ Migration completed successfully!
```

### Step 4: Verify the Fix
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Go to your app's `/my-bookings` page
3. Check the Network tab in DevTools - the API should now return 200 instead of 500

## Fallback (Already Applied)
✅ Updated API endpoint to handle missing columns gracefully:
- If new schema (with user_email) fails → tries legacy schema (mobile only)
- Returns empty array if no bookings found instead of crashing
- Better error logging for debugging

## Still Having Issues?

### Check 1: Verify Environment Variables
```bash
# Check that .env has correct credentials
cat .env | grep DB_
```

### Check 2: Test Database Connection
```bash
node scripts/test_db2.js
```

### Check 3: Check API Logs
- Go to Vercel Dashboard > Your Project > Deployments
- Click on latest deployment
- Go to **Logs** tab
- Look for "my-bookings error" messages

### Check 4: Verify Token
If you see "Unauthorized" error:
1. Make sure you're logged in
2. Check that `omaa_auth_token` cookie exists
3. Verify JWT_SECRET environment variable is set

## Quick Checklist
- [ ] Database credentials added to `.env`
- [ ] Migration script ran successfully
- [ ] Browser cache cleared
- [ ] Logged in to the app
- [ ] Token cookie exists in DevTools > Application > Cookies
- [ ] API returns 200 in Network tab

## Commands Reference

```bash
# Run migration on production database
node scripts/migrate-production.js

# Run migration on local database  
node scripts/fix-bookings-schema.js

# Test database connection
node scripts/test_db2.js

# Check database tables
node fix_db.js
```

## Files Modified
- ✅ `app/api/bookings/my-bookings/route.ts` - Added fallback error handling
- ✅ `scripts/migrate-production.js` - New production migration script
- ✅ `scripts/fix-bookings-schema.js` - Local/dev migration script

---

**For Vercel MySQL Documentation:** https://vercel.com/docs/storage/vercel-postgres
