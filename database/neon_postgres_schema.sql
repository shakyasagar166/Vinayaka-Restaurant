-- ====================================================================
-- Vinayaka Restaurant (Rooftop & Lounge) Neon PostgreSQL Schema & Seed
-- Database: PostgreSQL 15+ (Neon Serverless)
-- ====================================================================

-- 1. Table: users (Staff & Admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: dining_tables (QR-enabled restaurant tables)
CREATE TABLE IF NOT EXISTS dining_tables (
  id BIGSERIAL PRIMARY KEY,
  table_number VARCHAR(50) NOT NULL UNIQUE,
  section VARCHAR(60) NOT NULL,
  seating_capacity INT NOT NULL DEFAULT 4,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  qr_code_identifier VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: menu_items (Food & Beverage dishes with daily availability toggle)
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  category VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  is_available_today BOOLEAN NOT NULL DEFAULT TRUE,
  is_chef_special BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  preparation_time_minutes INT DEFAULT 15,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: customer_orders (Dine-in orders without customer login)
CREATE TABLE IF NOT EXISTS customer_orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  table_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: order_items (Dish lines inside each order)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  menu_item_id BIGINT NOT NULL,
  menu_item_name VARCHAR(120) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notes VARCHAR(200),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES customer_orders (id) ON DELETE CASCADE
);

-- Initial default users (Password is bcrypt for 'vinayaka@123')
INSERT INTO users (id, username, password, full_name, role, active) VALUES
(1, 'admin', '$2a$10$v0r7WpQf0nZ/j3r82K0mgepGj52mF8RkWqUvYkK5xL6hV3.G8dZt6', 'Vinayaka Manager', 'ADMIN', true),
(2, 'staff', '$2a$10$v0r7WpQf0nZ/j3r82K0mgepGj52mF8RkWqUvYkK5xL6hV3.G8dZt6', 'Captain Raj', 'STAFF', true)
ON CONFLICT (username) DO NOTHING;

-- Dining tables setup
INSERT INTO dining_tables (table_number, section, seating_capacity, qr_code_identifier) VALUES
('Rooftop-01', 'Rooftop Open Air', 4, 'vr-rooftop-01'),
('Rooftop-02', 'Rooftop Open Air', 4, 'vr-rooftop-02'),
('Rooftop-03', 'Rooftop Open Air', 6, 'vr-rooftop-03'),
('Rooftop-04', 'Rooftop Sky Deck', 2, 'vr-rooftop-04'),
('Rooftop-05', 'Rooftop Sky Deck', 4, 'vr-rooftop-05'),
('Lounge-01', 'Luxury Lounge', 6, 'vr-lounge-01'),
('Lounge-VIP-02', 'VIP Lounge', 8, 'vr-lounge-vip-02'),
('Lounge-03', 'Luxury Lounge', 4, 'vr-lounge-03'),
('Table-01', 'AC Family Dining', 4, 'vr-table-01'),
('Table-02', 'AC Family Dining', 4, 'vr-table-02'),
('Table-03', 'AC Family Dining', 6, 'vr-table-03'),
('Table-04', 'AC Family Dining', 8, 'vr-table-04')
ON CONFLICT (table_number) DO NOTHING;

-- Initial Menu Items for Vinayaka Restaurant (Rooftop & Lounge)
INSERT INTO menu_items (id, name, description, category, price, is_veg, is_available_today, is_chef_special, image_url, preparation_time_minutes) VALUES
(1, 'Paneer Angara Tikka', 'Cottage cheese cubes marinated in fiery red spices, smoked to perfection in tandoor.', 'Rooftop Starters', 320.00, true, true, true, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80', 15),
(2, 'Crispy Chilli Baby Corn', 'Golden fried tender baby corn tossed with bell peppers, garlic & spicy oriental sauce.', 'Rooftop Starters', 260.00, true, true, false, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80', 12),
(3, 'Chicken Afghani Tikka', 'Succulent chicken chunks marinated in cashew cream, cheese, cardamom and slow-grilled.', 'Rooftop Starters', 380.00, false, true, true, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80', 18),
(4, 'Tandoori Soya Chaap', 'Protein-rich soya chaap soaked in traditional tandoori spices and mint glaze.', 'Rooftop Starters', 280.00, true, true, false, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80', 15),
(5, 'Vinayaka Loaded Peri Peri Fries', 'Crispy potato fries dusted with tangy peri-peri seasoning and drizzled with cheese sauce.', 'Rooftop Starters', 210.00, true, true, false, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80', 10),
(6, 'Vinayaka Special Dal Makhani', 'Black lentils slow cooked overnight on charcoal with butter, rich cream and aromatic spices.', 'Main Course', 290.00, true, true, true, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80', 15),
(7, 'Paneer Lababdar', 'Soft cottage cheese cooked in a rich, velvety tomato-onion-cashew gravy with grated paneer.', 'Main Course', 340.00, true, true, true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80', 20),
(8, 'Butter Chicken Masala', 'Clay oven roasted chicken steeped in a silky makhani gravy with fenugreek butter glaze.', 'Main Course', 420.00, false, true, true, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80', 20),
(9, 'Butter Garlic Chur Chur Naan', 'Crispy layered tandoori naan stuffed with garlic and herbs, crushed with butter.', 'Breads & Rice', 90.00, true, true, true, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=700&auto=format&fit=crop&q=80', 10),
(10, 'Hyderabadi Dum Biryani (Veg)', 'Fragrant long grain basmati rice layered with vegetables, saffron and fried onions.', 'Breads & Rice', 290.00, true, true, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80', 18),
(11, 'Chicken Dum Biryani', 'Slow-cooked marinated chicken layered with aromatic rice, mint, rose water and saffron.', 'Breads & Rice', 390.00, false, true, true, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700&auto=format&fit=crop&q=80', 20),
(12, 'Blue Ocean Curacao Mocktail', 'Refreshing blend of blue curacao, fresh lime, mint leaves and chilled fizzy sprite.', 'Rooftop Mocktails', 180.00, true, true, true, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80', 5),
(13, 'Vinayaka Rooftop Sunset Punch', 'Layered orange, cranberry and passionfruit nectar garnished with fresh rosemary.', 'Rooftop Mocktails', 220.00, true, true, true, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&auto=format&fit=crop&q=80', 6),
(14, 'Classic Mint Mojito Fizz', 'Muddled fresh mint, lime wedges, simple cane syrup topped with sparkling soda.', 'Rooftop Mocktails', 160.00, true, true, false, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=700&auto=format&fit=crop&q=80', 5),
(15, 'Sizzling Brownie with Vanilla Gelato', 'Warm chocolate walnut brownie served on a hot sizzler plate with melted chocolate fudge sauce.', 'Desserts', 250.00, true, true, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80', 10)
ON CONFLICT (id) DO NOTHING;
