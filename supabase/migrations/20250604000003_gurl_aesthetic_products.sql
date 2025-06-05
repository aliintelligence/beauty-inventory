-- Replace products with Gurl Aesthetic's actual nail art inventory
-- Clear all existing products
DELETE FROM products;

-- Insert Gurl Aesthetic's real nail art products (prices in TTD)
INSERT INTO products (name, description, price, cost, customs_cost, inventory_quantity) VALUES

-- Nail Art Tools & Accessories
('Silicone Art Tool', 'Professional silicone tool for nail art application', 25.00, 15.00, 2.50, 20),
('Rhinestone Picker', 'Precision tool for placing rhinestones and small nail decorations', 20.00, 12.00, 2.00, 25),
('Art Palette Ring', 'Convenient ring palette for mixing nail art colors', 30.00, 18.00, 3.00, 15),
('Size 12 Kolinsky Brush', 'Premium Kolinsky hair brush for detailed nail art', 240.00, 180.00, 24.00, 5),
('Mini Buffers Pack', 'Pack of 10 mini nail buffers for smoothing and shaping', 30.00, 18.00, 3.00, 12),
('Nail Drill Bits Set', 'Professional drill bits for nail preparation and removal', 50.00, 30.00, 5.00, 10),
('Nail Art Brushes Set', 'Various styles for painting and detailing nail art', 45.00, 27.00, 4.50, 18),

-- Nail Art Embellishments
('3D Nail Art Rhinestones', 'Set of 10 3D charms for dimensional nail art', 45.00, 25.00, 4.50, 8),
('Silver Gems', 'Individual silver gems for nail decoration (minimum order 10)', 2.00, 1.00, 0.20, 150),
('Mermaid Beads Nail Charms', 'Beautiful mermaid-themed nail charms set', 50.00, 30.00, 5.00, 0), -- Currently sold out

-- Nail Care & Maintenance
('Soft Gel Tips', 'Salon-quality, flexible and strong gel nail tips', 35.00, 20.00, 3.50, 30),
('Portable Nail Polish Remover Pads', '100 pieces convenient remover pads', 25.00, 15.00, 2.50, 25),
('Square Lint-Free Wipes', 'Pack of 200 professional lint-free wipes', 40.00, 24.00, 4.00, 20),
('Practice Fingers/Hands', 'Training hands for practicing nail art techniques', 60.00, 36.00, 6.00, 8),
('Nail Display Tips', 'Swatch tools for showcasing nail colors and designs', 35.00, 21.00, 3.50, 15),

-- Protective Gear
('Pink Nitrile Gloves', 'Pack of 100 professional pink nitrile gloves', 60.00, 36.00, 6.00, 12);

-- Create product categories view for Gurl Aesthetic
CREATE OR REPLACE VIEW gurl_aesthetic_categories AS
SELECT 
  p.*,
  CASE 
    WHEN p.name ILIKE '%tool%' OR p.name ILIKE '%brush%' OR p.name ILIKE '%picker%' OR p.name ILIKE '%drill%' THEN 'Tools & Accessories'
    WHEN p.name ILIKE '%rhinestone%' OR p.name ILIKE '%gems%' OR p.name ILIKE '%charm%' OR p.name ILIKE '%beads%' THEN 'Embellishments'
    WHEN p.name ILIKE '%tips%' OR p.name ILIKE '%remover%' OR p.name ILIKE '%wipes%' OR p.name ILIKE '%practice%' OR p.name ILIKE '%display%' THEN 'Care & Maintenance'
    WHEN p.name ILIKE '%gloves%' THEN 'Protective Gear'
    ELSE 'General'
  END as category,
  CASE 
    WHEN p.inventory_quantity = 0 THEN 'Out of Stock'
    WHEN p.inventory_quantity <= 5 THEN 'Low Stock'
    WHEN p.inventory_quantity <= 15 THEN 'Medium Stock'
    ELSE 'Well Stocked'
  END as stock_status
FROM products p
ORDER BY 
  CASE 
    WHEN p.inventory_quantity = 0 THEN 3
    WHEN p.inventory_quantity <= 5 THEN 2
    WHEN p.inventory_quantity <= 15 THEN 1
    ELSE 0
  END,
  p.name;

-- Update table comments
COMMENT ON TABLE products IS 'Gurl Aesthetic nail art and beauty product inventory with TTD pricing';
COMMENT ON COLUMN products.price IS 'Selling price in Trinidad & Tobago Dollars (TTD)';
COMMENT ON COLUMN products.cost IS 'Product cost in TTD';
COMMENT ON COLUMN products.customs_cost IS 'Import/customs fees in TTD';