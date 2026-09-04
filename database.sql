-- Run this script in your MySQL Database (e.g., omaa_db)

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  type VARCHAR(50) DEFAULT 'Service',
  labour_charges INT DEFAULT 0,
  zones INT DEFAULT 1,
  zones_location VARCHAR(255) DEFAULT 'Noida, Delhi',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

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
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner1_url VARCHAR(255) DEFAULT NULL,
  banner2_url VARCHAR(255) DEFAULT NULL,
  banner3_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255) DEFAULT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warranties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_id INT DEFAULT NULL,
  order_id VARCHAR(50) NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE DEFAULT NULL,
  days_valid INT NOT NULL,
  status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  order_id VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  type VARCHAR(50) DEFAULT 'Normal Service',
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  address TEXT DEFAULT NULL,
  category VARCHAR(255) NOT NULL,
  services TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  total INT DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'cashfree',
  payment_status ENUM('Completed', 'Pending') DEFAULT 'Pending',
  working_status ENUM('Completed', 'Reject', 'Pendi') DEFAULT 'Pendi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_email VARCHAR(255) DEFAULT NULL,
  amc_coupon_code VARCHAR(100) DEFAULT NULL,
  referred_by VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS gst_settings (
  id INT PRIMARY KEY,
  gst_rate INT DEFAULT 18,
  online_gst_enabled BOOLEAN DEFAULT false,
  cash_gst_enabled BOOLEAN DEFAULT false,
  gst_number VARCHAR(100) DEFAULT '',
  show_gst_on_invoice BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  pan_card VARCHAR(50) NOT NULL,
  aadhar_card VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  branch VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  ifsc_code VARCHAR(50) NOT NULL,
  cheque_image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  work_company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  experience VARCHAR(50) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_headings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otps_email_created_at (email, created_at)
);

CREATE TABLE IF NOT EXISTS site_policies (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  last_updated VARCHAR(100),
  contact_email VARCHAR(255),
  sections JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_names VARCHAR(255) DEFAULT '',
  coordinates JSON NOT NULL,
  category_ids JSON NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
