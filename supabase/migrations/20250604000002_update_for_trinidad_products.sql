-- Update for Trinidad and Tobago beauty business
-- Replace sample products with ones relevant to Caribbean market

-- Clear existing sample products
DELETE FROM products WHERE name IN (
  'Fenty Beauty Gloss Bomb',
  'Rare Beauty Soft Pinch Blush', 
  'Charlotte Tilbury Flawless Filter',
  'Drunk Elephant C-Firma',
  'Glow Recipe Watermelon Moisturizer',
  'Sol de Janeiro Brazilian Bum Bum Cream'
);

-- Insert Caribbean/Trinidad focused beauty products (prices in TTD)
INSERT INTO products (name, description, price, cost, customs_cost, inventory_quantity) VALUES
-- Popular brands accessible in Caribbean
('Fenty Beauty Gloss Bomb Universal', 'Rihanna''s universal lip luminizer - perfect for Caribbean skin tones', 142.80, 81.60, 13.60, 25),
('Maybelline Fit Me Foundation', 'Shade range perfect for diverse Caribbean complexions', 95.20, 54.40, 8.16, 30),
('NYX Professional Makeup Lip Lingerie', 'Long-wearing liquid lipstick', 68.00, 40.80, 6.80, 20),
('Black Opal True Color Foundation', 'Specifically formulated for deeper skin tones', 136.00, 81.60, 13.60, 15),
('Revlon ColorStay Foundation', 'Popular drugstore foundation with good shade range', 102.00, 61.20, 8.16, 25),
('Sleek MakeUP Face Form Kit', 'Contour and highlight for deeper skin tones', 122.40, 68.00, 10.20, 18),
('Beauty Bakerie Lip Whip', 'Liquid lipstick brand popular in Caribbean', 108.80, 68.00, 10.88, 12),
('Juvia''s Place Eyeshadow Palette', 'Vibrant colors celebrating African heritage', 170.00, 102.00, 17.00, 10),
('Shea Moisture Hair Masque', 'Natural hair care popular in Caribbean', 85.00, 51.00, 8.50, 22),
('Palmer''s Cocoa Butter Formula', 'Moisturizer popular in tropical climates', 68.00, 40.80, 6.80, 35),
-- Local/regional products
('Caribbean Natural Coconut Oil', 'Locally sourced beauty oil', 51.00, 25.50, 0.00, 40),
('Moringa Beauty Serum', 'Caribbean superfood skincare', 119.00, 68.00, 0.00, 15);

-- Add comment about pricing
COMMENT ON TABLE products IS 'Beauty product inventory with pricing in TTD (Trinidad & Tobago Dollars)';

-- Update business information
INSERT INTO products (name, description, price, cost, customs_cost, inventory_quantity) VALUES
-- Add some premium imports that Caribbean customers love
('MAC Lipstick Classic Shades', 'Iconic MAC lipstick in popular Caribbean shades', 153.00, 85.00, 15.30, 20),
('Urban Decay All Nighter Setting Spray', 'Essential for humid Caribbean climate', 204.00, 119.00, 20.40, 12);

-- Create a view for popular Caribbean shades/products
CREATE OR REPLACE VIEW caribbean_favorites AS
SELECT 
  p.*,
  CASE 
    WHEN p.name ILIKE '%fenty%' OR p.name ILIKE '%black opal%' OR p.name ILIKE '%juvia%' THEN 'Inclusive Beauty'
    WHEN p.name ILIKE '%coconut%' OR p.name ILIKE '%moringa%' OR p.name ILIKE '%shea%' THEN 'Natural/Local'
    WHEN p.name ILIKE '%setting spray%' OR p.name ILIKE '%waterproof%' THEN 'Climate Friendly'
    ELSE 'General Beauty'
  END as category_type
FROM products p
ORDER BY 
  CASE 
    WHEN p.name ILIKE '%caribbean%' OR p.name ILIKE '%local%' THEN 1
    WHEN p.name ILIKE '%fenty%' OR p.name ILIKE '%black opal%' THEN 2
    ELSE 3
  END;