CREATE DATABASE IF NOT EXISTS college_lost_found;
USE college_lost_found;

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  item_type ENUM('Lost', 'Found') NOT NULL,
  location VARCHAR(150) NOT NULL,
  item_date DATE NULL,
  description TEXT,
  status ENUM('Open', 'Returned') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional sample records
INSERT INTO items (item_name, item_type, location, item_date, description, status)
VALUES
('Blue Notebook', 'Lost', 'Library', '2026-10-27', 'Blue notebook with class notes', 'Open'),
('Black Water Bottle', 'Found', 'Computer Lab', '2026-10-26', 'Black bottle found on a desk', 'Open');