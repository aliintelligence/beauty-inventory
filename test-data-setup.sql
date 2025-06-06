-- Quick test data setup for AI recommendations
-- Copy and paste this into your Supabase SQL editor

-- Clear any existing test data (optional)
-- DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_name LIKE '%Test%' OR customer_name IN ('Sarah Johnson', 'Michelle Rodriguez', 'Keisha Williams', 'Alicia Mohammed', 'Priya Sharma'));
-- DELETE FROM orders WHERE customer_name LIKE '%Test%' OR customer_name IN ('Sarah Johnson', 'Michelle Rodriguez', 'Keisha Williams', 'Alicia Mohammed', 'Priya Sharma');
-- DELETE FROM products WHERE supplier LIKE '%Alibaba%' OR supplier LIKE '%Temu%' OR supplier LIKE '%SHEIN%';

-- Add best-selling products
INSERT INTO products (name, description, price, cost, customs_cost, inventory_quantity, category) VALUES
('Rose Gold Rhinestone Mixed Set', 'Premium mixed size rhinestones for nail art. Contains 1440 pieces', 45.00, 18.50, 4.25, 17, 'nail-accessories'),
('Crystal AB Flatback Rhinestones', 'High quality crystal AB flatback rhinestones, 1440 pieces', 38.00, 15.20, 3.50, 27, 'nail-accessories'),
('Professional Rhinestone Picker', 'Dual-ended picker tool with wax tip. Essential for rhinestone application', 28.00, 11.20, 2.60, 31, 'nail-tools'),
('Gold 3D Nail Charms Set', 'Assorted 3D metal charms for nail decoration. 50 pieces', 32.00, 12.80, 2.95, 37, 'nail-accessories'),
('36W UV LED Nail Lamp', 'Dual light source nail curing lamp. Works with gel polish', 125.00, 50.00, 11.50, 14, 'nail-equipment');

-- Add test orders to create sales history
INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount, created_at) VALUES
('Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 73.00, NOW() - INTERVAL '65 days'),
('Michelle Rodriguez', '868-234-5678', 'San Fernando, Trinidad', 70.00, NOW() - INTERVAL '60 days'),
('Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 167.00, NOW() - INTERVAL '49 days'),
('Keisha Williams', '868-345-6789', 'Port of Spain, Trinidad', 125.00, NOW() - INTERVAL '42 days'),
('Priya Sharma', '868-567-8901', 'Couva, Trinidad', 77.00, NOW() - INTERVAL '28 days'),
('Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 83.00, NOW() - INTERVAL '7 days'),
('Alicia Mohammed', '868-456-7890', 'Arima, Trinidad', 118.00, NOW() - INTERVAL '3 days');

-- Get product and order IDs for order items
DO $$
DECLARE
    rhinestone_id UUID;
    crystal_id UUID;
    picker_id UUID;
    charms_id UUID;
    lamp_id UUID;
    
    order1_id UUID;
    order2_id UUID;
    order3_id UUID;
    order4_id UUID;
    order5_id UUID;
    order6_id UUID;
    order7_id UUID;
BEGIN
    -- Get product IDs
    SELECT id INTO rhinestone_id FROM products WHERE name = 'Rose Gold Rhinestone Mixed Set' LIMIT 1;
    SELECT id INTO crystal_id FROM products WHERE name = 'Crystal AB Flatback Rhinestones' LIMIT 1;
    SELECT id INTO picker_id FROM products WHERE name = 'Professional Rhinestone Picker' LIMIT 1;
    SELECT id INTO charms_id FROM products WHERE name = 'Gold 3D Nail Charms Set' LIMIT 1;
    SELECT id INTO lamp_id FROM products WHERE name = '36W UV LED Nail Lamp' LIMIT 1;
    
    -- Get order IDs (get the most recent ones we just created)
    SELECT id INTO order1_id FROM orders WHERE customer_name = 'Sarah Johnson' AND total_amount = 73.00 LIMIT 1;
    SELECT id INTO order2_id FROM orders WHERE customer_name = 'Michelle Rodriguez' AND total_amount = 70.00 LIMIT 1;
    SELECT id INTO order3_id FROM orders WHERE customer_name = 'Sarah Johnson' AND total_amount = 167.00 LIMIT 1;
    SELECT id INTO order4_id FROM orders WHERE customer_name = 'Keisha Williams' AND total_amount = 125.00 LIMIT 1;
    SELECT id INTO order5_id FROM orders WHERE customer_name = 'Priya Sharma' AND total_amount = 77.00 LIMIT 1;
    SELECT id INTO order6_id FROM orders WHERE customer_name = 'Sarah Johnson' AND total_amount = 83.00 LIMIT 1;
    SELECT id INTO order7_id FROM orders WHERE customer_name = 'Alicia Mohammed' AND total_amount = 118.00 LIMIT 1;
    
    -- Add order items
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    -- Order 1: Rhinestone set + picker
    (order1_id, rhinestone_id, 1, 45.00),
    (order1_id, picker_id, 1, 28.00),
    
    -- Order 2: Crystal + charms
    (order2_id, crystal_id, 1, 38.00),
    (order2_id, charms_id, 1, 32.00),
    
    -- Order 3: Big rhinestone order
    (order3_id, rhinestone_id, 2, 45.00),
    (order3_id, picker_id, 1, 28.00),
    (order3_id, crystal_id, 1, 38.00),
    
    -- Order 4: UV Lamp
    (order4_id, lamp_id, 1, 125.00),
    
    -- Order 5: Rhinestone + charms
    (order5_id, rhinestone_id, 1, 45.00),
    (order5_id, charms_id, 1, 32.00),
    
    -- Order 6: Another rhinestone order
    (order6_id, rhinestone_id, 1, 45.00),
    (order6_id, crystal_id, 1, 38.00),
    
    -- Order 7: Multiple rhinestone sets
    (order7_id, rhinestone_id, 2, 45.00),
    (order7_id, picker_id, 1, 28.00);
    
END $$;

-- Check the results
SELECT 'Products created:' as status, COUNT(*) as count FROM products WHERE name LIKE '%Rhinestone%' OR name LIKE '%Crystal%';
SELECT 'Orders created:' as status, COUNT(*) as count FROM orders WHERE customer_name IN ('Sarah Johnson', 'Michelle Rodriguez', 'Keisha Williams', 'Alicia Mohammed', 'Priya Sharma');
SELECT 'Order items created:' as status, COUNT(*) as count FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_name IN ('Sarah Johnson', 'Michelle Rodriguez', 'Keisha Williams', 'Alicia Mohammed', 'Priya Sharma'));