-- ====================================================================
-- Vinayaka Restaurant (Rooftop & Lounge) Aiven MySQL Schema & Seed Data
-- Database: Aiven for MySQL (Runs in defaultdb or any active db)
-- ====================================================================

-- 1. Table: users (Staff & Admin authentication)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: dining_tables (QR-enabled restaurant tables)
CREATE TABLE IF NOT EXISTS `dining_tables` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_number` VARCHAR(50) NOT NULL UNIQUE,
  `section` VARCHAR(60) NOT NULL,
  `seating_capacity` INT NOT NULL DEFAULT 4,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `qr_code_identifier` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: menu_items (Food & Beverage dishes with daily availability toggle)
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(60) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `is_veg` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_available_today` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_chef_special` BOOLEAN NOT NULL DEFAULT FALSE,
  `image_url` LONGTEXT,
  `preparation_time_minutes` INT DEFAULT 15,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: orders (Customer Table Orders)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `table_number` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20),
  `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `special_instructions` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT NOT NULL,
  `menu_item_id` BIGINT,
  `item_name` VARCHAR(120) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `notes` VARCHAR(255),
  CONSTRAINT `fk_aiven_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- SEED DATA: Default Admin (admin / vinayaka@123)
-- ====================================================================
INSERT INTO `users` (`username`, `password`, `full_name`, `role`, `active`)
VALUES ('admin', '$2a$10$wT5gWwKq2jR6uEovXj2z5.1G/v1xHjY2bF2aC9gK7hW1dF2lG1bCa', 'Vinayaka Manager', 'ROLE_ADMIN', TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- SEED DATA: Dining Tables
INSERT INTO `dining_tables` (`table_number`, `section`, `seating_capacity`, `active`, `qr_code_identifier`)
VALUES 
  ('Rooftop-01', 'Rooftop Star Gazing', 4, TRUE, 'QR-ROOF-01'),
  ('Rooftop-02', 'Rooftop Star Gazing', 4, TRUE, 'QR-ROOF-02'),
  ('Rooftop-03', 'Rooftop Star Gazing', 6, TRUE, 'QR-ROOF-03'),
  ('Rooftop-04', 'Rooftop Star Gazing', 2, TRUE, 'QR-ROOF-04'),
  ('Lounge-01', 'Indoor VIP Lounge', 4, TRUE, 'QR-LNG-01'),
  ('Lounge-02', 'Indoor VIP Lounge', 6, TRUE, 'QR-LNG-02'),
  ('Lounge-03', 'Indoor VIP Lounge', 8, TRUE, 'QR-LNG-03'),
  ('Family-01', 'Family Dining Hall', 6, TRUE, 'QR-FAM-01'),
  ('Family-02', 'Family Dining Hall', 6, TRUE, 'QR-FAM-02')
ON DUPLICATE KEY UPDATE `section` = VALUES(`section`);

-- SEED DATA: Rooftop & Lounge Dishes
INSERT INTO `menu_items` (`name`, `description`, `category`, `price`, `is_veg`, `is_available_today`, `is_chef_special`, `image_url`, `preparation_time_minutes`)
VALUES 
  ('Paneer Angara Tikka', 'Cottage cheese cubes marinated in fiery red spices, smoked over charcoal tandoor with mint glaze.', 'Rooftop Starters', 320.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80', 15),
  ('Crispy Chilli Baby Corn', 'Golden fried tender baby corn tossed with bell peppers, spring onions, garlic & sweet-spicy oriental glaze.', 'Rooftop Starters', 260.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80', 12),
  ('Tandoori Malai Chaap', 'Soya chaap marinated in rich cashew cream, cardamom, hung curd and char-grilled to melt in mouth.', 'Rooftop Starters', 290.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80', 15),
  ('Murgh Afghani Kebab', 'Succulent chicken morsels in cashew cream, aromatic spices and slow-cooked in charcoal tandoor.', 'Rooftop Starters', 380.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80', 18),
  ('Vinayaka Special Dal Bukhara', 'Black lentils slow cooked overnight over slow embers with country butter and pureed vine tomatoes.', 'Main Course', 340.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80', 20),
  ('Paneer Lababdar', 'Fresh cottage cheese simmered in velvety onion tomato gravy infused with coriander seeds and cream.', 'Main Course', 360.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80', 15),
  ('Rooftop Butter Chicken', 'Classic Delhi style charred tandoori chicken cooked in satin smooth buttery tomato makhani.', 'Main Course', 440.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80', 20),
  ('Dum Pukht Veg Biryani', 'Fragrant aged Basmati rice layered with garden fresh vegetables, saffron and kewra essence with raita.', 'Biryani & Breads', 310.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80', 20),
  ('Garlic Butter Naan', 'Crisp yet pillowy clay oven bread slathered with roasted garlic slivers and desi butter.', 'Biryani & Breads', 75.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=700&auto=format&fit=crop&q=80', 8),
  ('Blue Lagoon Mocktail', 'Refreshing curacao blend with lemon spritz, mint leaves and chilled sparkling soda.', 'Beverages & Mocktails', 190.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80', 5),
  ('Virgin Mojito', 'Fresh mint leaves muddled with lime wedges, organic sugar cane juice topped with fizz.', 'Beverages & Mocktails', 170.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&auto=format&fit=crop&q=80', 5),
  ('Sizzling Brownie with Vanilla', 'Gooey dark chocolate walnut brownie on a smoking cast iron platter with hot chocolate fudge.', 'Desserts', 230.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80', 10);
