# OMAA E-Commerce Platform

## 1. Project Overview

OMAA is a service-commerce web application. Customers can browse services based on their city or location, add services to a cart, create bookings, view bookings and invoices, use cashback, wallet and referral features, and submit complaints.

The admin panel is used to manage categories, subcategories, services, brands, banners, cashback advertisements, bookings, warranties, complaints, KYC, GST and website settings.

## 2. Technology Stack

- **Framework:** Next.js 16.3.1 App Router
- **Language:** TypeScript
- **UI:** React 19.2.8, Tailwind CSS 4, Lucide React
- **Runtime:** Node.js
- **Database:** MySQL, accessed using `mysql2/promise`
- **Authentication:** Email OTP and Google sync for customers; email/password and JWT for admin/referral flows
- **Email:** Nodemailer with Gmail SMTP
- **Location:** OpenStreetMap Nominatim search and reverse geocoding
- **Fonts/assets:** Next Font, local assets in `public/`

## 3. Main Application Areas

### Customer-facing routes

| Route | Purpose |
|---|---|
| `/` or `/<city>` | Home page, location-based service discovery, banners and categories |
| `/services/[id]` | Service details and booking/cart entry point |
| `/cart` | Selected services and cart review |
| `/checkout` | Customer details, booking date/time and order confirmation |
| `/login` | Customer login using OTP/Google flow |
| `/my-bookings` | Logged-in customer's booking history |
| `/invoice/[order_id]` | Invoice for a booking/order |
| `/my-amc` | Customer's Annual Maintenance Contract bookings |
| `/wallet` | Wallet balance and transactions |
| `/cashback` | Cashback balance, history and claim action |
| `/refer-earn` | Referral registration, login and referral information |
| `/manage-address` | Customer address management |
| `/product-history` | Previously purchased services/products |
| `/complaint` | Complaint submission |
| `/settings` | Customer settings |
| `/about` | About page |
| `/contact` | Contact and location information |

### Admin routes

All admin pages except login and registration require a valid `admin_token` cookie.

- `/admin` - Dashboard
- `/admin/login` - Admin login
- `/admin/register` - Admin registration
- `/admin/categories` - Categories and their service zones
- `/admin/subcategories` - Subcategory management
- `/admin/services` - Service catalog and pricing
- `/admin/brands` - Brand management
- `/admin/banners` - Homepage banners
- `/admin/cashback-ads` - Cashback ad configuration
- `/admin/booking` - Booking management
- `/admin/booking/new-booking` - New service booking
- `/admin/booking/new-product` - New product booking
- `/admin/booking/visit-booking` - Visit bookings
- `/admin/booking/amc` - AMC bookings
- `/admin/booking/completed-booking` - Completed bookings
- `/admin/booking/reject-booking` - Rejected bookings
- `/admin/complaints` - Complaint status and handling
- `/admin/warranties` - Warranty records
- `/admin/gst-settings` - GST and invoice settings
- `/admin/kyc` - KYC records
- `/admin/registration-records` - Partner/worker registrations
- `/admin/rate-headings` - Rate card headings
- `/admin/rate-cards` - Rate card entries
- `/admin/settings` - Website settings

## 4. User Workflows

### Customer booking flow

1. Customer opens the website and selects/searches a location.
2. Customer browses categories and services.
3. Customer opens a service detail page and adds a service to the cart.
4. Customer reviews the cart and continues to checkout.
5. Customer provides name, mobile number, address, booking date and time slot.
6. Customer selects the available payment method and confirms the booking.
7. The application creates an order/booking record and returns an `order_id`.
8. Customer can track the booking from `/my-bookings` and view the invoice.

### Customer login flow

1. Customer enters an email address.
2. Application generates a six-digit OTP and stores it for five minutes.
3. OTP is sent using SMTP when SMTP credentials are configured.
4. Customer verifies the OTP and receives a JWT-based login cookie.
5. Protected customer APIs use the cookie to identify the user.

### Admin workflow

1. Admin opens `/admin/login`.
2. After successful authentication, the server sets an `admin_token` cookie.
3. Middleware validates the token for all other `/admin/*` routes.
4. Admin configures catalog and site data before accepting bookings.
5. Admin reviews bookings, updates working/payment status, handles complaints and maintains warranty/KYC records.

### Cashback and wallet

- Customers can view cashback balance and history.
- Cashback can be claimed according to the configured claim interval.
- Wallet balance and transaction history are exposed through the wallet APIs.
- Wallet top-up uses the `/api/wallet/add-money` endpoint; production payment verification should be confirmed before enabling real-money use.

## 5. Project Structure

```text
app/                  Next.js pages, layouts, server actions and API routes
app/components/       Shared customer UI components
app/admin/components/ Shared admin UI components
app/actions/          Server actions for admin/content operations
app/api/               Route handlers for authentication and business APIs
lib/db.ts              MySQL connection pool
lib/mailer.ts          SMTP transporter and OTP email helper
models/                Application data/model helpers
context/               React context providers
store/                 Client-side state/store code
public/                Public images and uploads
scripts/               Database setup, seed and migration scripts
database.sql           Base MySQL schema
middleware.ts          Admin route protection
```

## 6. Local Setup

### Prerequisites

- Node.js 20 or newer recommended
- npm
- MySQL 8 or compatible MySQL server
- SMTP account for production OTP delivery

### Installation

```bash
npm install
```

Create a `.env.local` file in the project root. Do not commit this file.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=omaa_db

JWT_SECRET=replace_with_a_long_random_secret

SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_app_password
SMTP_FROM=your_sender_email

EXTERNAL_API_SECRET=replace_with_a_random_api_secret
```

Initialize the database using either the SQL file or the project setup script:

```bash
# Option A: execute database.sql in MySQL
mysql -u root -p omaa_db < database.sql

# Option B: run the application database setup script
node scripts/setup-db.js
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

## 7. Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Creates a production build |
| `npm run start` | Starts the production server after build |
| `npm run lint` | Runs ESLint |
| `node scripts/setup-db.js` | Creates the database and base schema |
| `node scripts/setup-*.js` | Creates or seeds individual feature tables/data |
| `node scripts/migrate-production.js` | Applies production database migrations; review before running |

Run setup/seed scripts only after checking the target database and environment variables. Some scripts are intended for one-time migration or development use.

## 8. API Reference

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Generate and send customer OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP and create customer session |
| `POST` | `/api/auth/google-sync` | Sync Google user and create session |
| `GET` | `/api/auth/me` | Return current customer session/user |
| `POST` | `/api/auth/logout` | Clear customer session |
| `POST` | `/api/admin/login` | Authenticate admin |
| `POST` | `/api/admin/register` | Register admin |
| `POST` | `/api/refer-earn/register` | Register referral member |
| `POST` | `/api/refer-earn/login` | Authenticate referral member |
| `GET` | `/api/refer-earn/me` | Return referral membership data |

### Customer/business APIs

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/search` | Search service/catalog data |
| `GET` | `/api/location/search?q=...` | Search locations using Nominatim |
| `POST` | `/api/location/geocode` | Reverse geocode latitude/longitude |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings` | Fetch booking data |
| `GET` | `/api/bookings/my-bookings` | Fetch logged-in customer's bookings |
| `GET`/`POST` | `/api/bookings/cashback` | Read or update booking cashback state |
| `GET`/`POST` | `/api/cashback` | Read balance/history or claim cashback |
| `GET` | `/api/wallet` | Read wallet balance and transactions |
| `POST` | `/api/wallet/add-money` | Add money to wallet |
| `POST` | `/api/coupons/expire` | Mark a coupon as used/expired using an external API key |

### Admin content APIs

| Method | Endpoint | Purpose |
|---|---|---|
| `GET`/`POST` | `/api/admin/categories` | List/create categories |
| `PUT`/`DELETE` | `/api/admin/categories/[id]` | Update/delete category |
| `GET`/`POST` | `/api/admin/services` | List/create services |
| `PUT`/`DELETE` | `/api/admin/services/[id]` | Update/delete service |
| `GET`/`POST` | `/api/admin/brands` | List/create brands |
| `PUT`/`DELETE` | `/api/admin/brands/[id]` | Update/delete brand |
| `GET`/`POST` | `/api/admin/banners` | List/create banners |
| `PUT`/`DELETE` | `/api/admin/banners/[id]` | Update/delete banner |
| `GET`/`POST` | `/api/admin/cashback-ads` | Read/update cashback ad configuration |
| `GET` | `/api/admin/db-patch` | Database patch/check endpoint; protect or disable in production |

Most API errors are returned as JSON in the form `{ "error": "..." }`. Successful mutations generally return `{ "success": true }` or a message and created record ID.

## 9. Database Entities

The base schema in `database.sql` contains these principal tables:

- `admins` - Admin accounts
- `users` - Customer accounts
- `otps` - Temporary customer OTP records
- `categories` - Main service categories and zone settings
- `subcategories` - Category children
- `services` - Service catalog, prices, warranty and descriptions
- `brands` - Brands associated with categories
- `banners` - Homepage banner content
- `bookings` - Customer orders/bookings, schedule and statuses
- `warranties` - Issued service warranties
- `complaints` - Customer complaints and resolution status
- `gst_settings` - GST and invoice display configuration
- `kyc_records` - KYC and bank details
- `registration_records` - Partner/worker registration records
- `rate_headings` - Rate card heading data

Important relationships:

- A category has many subcategories and services.
- A service belongs to a category and subcategory.
- A booking stores selected services as serialized text and links the customer through authenticated request data.
- Category/subcategory deletion uses cascading foreign keys where defined.

## 10. Security and Configuration Notes

- Use a strong, unique `JWT_SECRET` in every deployed environment.
- Never use the fallback JWT secrets shown in source defaults for production.
- Use an SMTP app password rather than a personal email password.
- Keep `.env.local` and production secrets outside source control.
- Restrict access to admin registration after the first admin is created.
- Validate and authorize every admin mutation endpoint server-side.
- The coupon expiry endpoint requires `EXTERNAL_API_SECRET`; rotate it if exposed.
- Review `/api/admin/db-patch` before production use because database patch endpoints can change schema.
- Do not expose PAN, Aadhaar, bank account or IFSC data in logs or client responses.
- Configure HTTPS in production so authentication cookies cannot be intercepted.
- Confirm payment-provider verification and webhook handling before treating a booking as paid.

## 11. Production Deployment Checklist

- [ ] Set production `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME`.
- [ ] Run and verify database migrations on a backup/staging database first.
- [ ] Set a strong `JWT_SECRET` and `EXTERNAL_API_SECRET`.
- [ ] Configure SMTP and verify OTP delivery.
- [ ] Upload/verify required assets under `public/uploads` or the configured storage.
- [ ] Create the first admin account and restrict further registration.
- [ ] Configure categories, subcategories, services, prices, zones and banners.
- [ ] Configure GST and invoice settings.
- [ ] Test customer login, booking creation, invoice, wallet/cashback and complaint flows.
- [ ] Test admin booking status updates and warranty creation.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Enable HTTPS and review database/user access permissions.

## 12. Troubleshooting

### Database connection errors

Verify all `DB_*` variables, confirm the MySQL server is running, check that the database exists, and confirm the configured user has permission to access it. Restart the Next.js server after changing environment variables.

### OTP is not received

Check `SMTP_EMAIL`, `SMTP_PASSWORD` and `SMTP_FROM`. Gmail commonly requires an app password. In development, when SMTP is not configured, the generated OTP is logged by the server for testing.

### Admin page redirects to login

The `admin_token` cookie is missing, expired or invalid. Log in again and confirm that `JWT_SECRET` is consistent between admin login and middleware.

### Services or categories are empty

Confirm the relevant tables exist and contain records. Run the appropriate setup/seed script and check the server logs for MySQL errors.

### Location search fails

The location endpoints depend on the external OpenStreetMap Nominatim service. Check internet access, request parameters and service rate limits.

### Production build fails

Run `npm run lint` first, then `npm run build`. Resolve TypeScript/ESLint errors and verify that production environment variables are available during server execution.

## 13. Ownership and Maintenance

For a new feature, update the relevant page under `app/`, its API route under `app/api/`, database migration/setup script under `scripts/`, and this document. Test both customer and admin authorization paths whenever a booking, wallet, payment, KYC or personal-data flow changes.
