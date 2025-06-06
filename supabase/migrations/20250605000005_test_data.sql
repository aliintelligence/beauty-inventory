-- Add test products for Gurl Aesthetic nail business
INSERT INTO products (id, name, description, price, cost, customs_cost, inventory_quantity, category, supplier, sku, weight, color, material) VALUES
-- Best-selling nail accessories
(gen_random_uuid(), 'Rose Gold Rhinestone Mixed Set', 'Premium mixed size rhinestones for nail art. Contains 1440 pieces in various sizes (SS6-SS16)', 45.00, 18.50, 4.25, 25, 'nail-accessories', 'Alibaba - Crystal Store', 'RG-RHINE-001', 15.0, 'Rose Gold', 'Glass Rhinestone'),
(gen_random_uuid(), 'Crystal AB Flatback Rhinestones SS10', 'High quality Austrian-style crystal AB flatback rhinestones, 1440 pieces', 38.00, 15.20, 3.50, 30, 'nail-accessories', 'Alibaba - Nail Art Supply', 'AB-FLAT-SS10', 12.0, 'Crystal AB', 'Glass'),
(gen_random_uuid(), 'Gold 3D Nail Charms Set', 'Assorted 3D metal charms for nail decoration. 50 pieces mixed designs', 32.00, 12.80, 2.95, 40, 'nail-accessories', 'SHEIN', 'GOLD-CHARM-3D', 8.5, 'Gold', 'Metal Alloy'),

-- Popular nail tools
(gen_random_uuid(), 'Professional Rhinestone Picker Tool', 'Dual-ended picker tool with wax tip and dotting end. Essential for rhinestone application', 28.00, 11.20, 2.60, 35, 'nail-tools', 'Temu', 'PICKER-PRO-001', 5.0, 'Pink', 'Metal/Plastic'),
(gen_random_uuid(), 'Nail Art Brush Set 15pc', 'Professional nail art brushes including liner, detailing, and flat brushes', 52.00, 20.80, 4.80, 20, 'nail-tools', 'Alibaba - Brush Factory', 'BRUSH-SET-15', 25.0, 'Black/Silver', 'Synthetic Hair/Metal'),
(gen_random_uuid(), 'Cuticle Pusher & Nipper Set', 'Stainless steel cuticle care tools. Professional grade for salon use', 42.00, 16.80, 3.85, 28, 'nail-tools', 'Alibaba - Tool Co', 'CUTICLE-SET-001', 18.0, 'Silver', 'Stainless Steel'),

-- Nail equipment
(gen_random_uuid(), '36W UV LED Nail Lamp', 'Dual light source nail curing lamp. Works with gel polish and extensions', 125.00, 50.00, 11.50, 15, 'nail-equipment', 'Alibaba - LED Store', 'UV-LAMP-36W', 450.0, 'White', 'ABS Plastic'),
(gen_random_uuid(), 'Nail Drill Electric 20000 RPM', 'Professional electric nail drill with multiple bits. Variable speed control', 185.00, 74.00, 17.00, 10, 'nail-equipment', 'Alibaba - Drill Co', 'DRILL-20K-001', 680.0, 'White/Pink', 'Metal/Plastic'),

-- Nail polish and gels
(gen_random_uuid(), 'Gel Polish Base Coat 15ml', 'Professional base coat for gel manicures. Long-lasting adhesion', 35.00, 14.00, 3.20, 45, 'nail-polish', 'Temu', 'BASE-GEL-15ML', 45.0, 'Clear', 'Gel Formula'),
(gen_random_uuid(), 'Gel Polish Top Coat 15ml', 'High shine top coat with chip-resistant formula', 35.00, 14.00, 3.20, 42, 'nail-polish', 'Temu', 'TOP-GEL-15ML', 45.0, 'Clear', 'Gel Formula'),
(gen_random_uuid(), 'Nude Pink Gel Polish Set 6pc', 'Collection of popular nude and pink shades. Perfect for French manicures', 89.00, 35.60, 8.20, 18, 'nail-polish', 'SHEIN', 'NUDE-SET-6PC', 120.0, 'Nude/Pink', 'Gel Polish'),

-- Nail extensions
(gen_random_uuid(), 'Clear Nail Tips 500pc', 'Natural clear nail tips in 10 sizes. Perfect for extensions', 25.00, 10.00, 2.30, 50, 'nail-extensions', 'Alibaba - Tips Store', 'TIPS-CLEAR-500', 35.0, 'Clear', 'ABS Plastic'),
(gen_random_uuid(), 'Nail Forms Self-Adhesive 100pc', 'Professional nail forms for sculpting gel extensions', 18.00, 7.20, 1.65, 60, 'nail-extensions', 'Temu', 'FORMS-100PC', 15.0, 'Silver', 'Paper/Adhesive');

-- Add test customers
INSERT INTO customers (id, name, phone, address, email) VALUES
(gen_random_uuid(), 'Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 'sarah.j@email.com'),
(gen_random_uuid(), 'Michelle Rodriguez', '868-234-5678', 'San Fernando, Trinidad', 'michelle.r@email.com'),
(gen_random_uuid(), 'Keisha Williams', '868-345-6789', 'Port of Spain, Trinidad', 'keisha.w@email.com'),
(gen_random_uuid(), 'Alicia Mohammed', '868-456-7890', 'Arima, Trinidad', 'alicia.m@email.com'),
(gen_random_uuid(), 'Priya Sharma', '868-567-8901', 'Couva, Trinidad', 'priya.s@email.com');

-- Add test orders with realistic sales data from the past 3 months
-- Note: We'll use the product IDs from the products we just inserted
DO $$
DECLARE
    rhinestone_set_id UUID;
    crystal_ab_id UUID;
    gold_charms_id UUID;
    picker_tool_id UUID;
    brush_set_id UUID;
    cuticle_set_id UUID;
    uv_lamp_id UUID;
    nail_drill_id UUID;
    base_coat_id UUID;
    top_coat_id UUID;
    nude_set_id UUID;
    nail_tips_id UUID;
    nail_forms_id UUID;
    
    customer1_id UUID;
    customer2_id UUID;
    customer3_id UUID;
    customer4_id UUID;
    customer5_id UUID;
    
    order_id UUID;
    current_date_var DATE;
BEGIN
    -- Get product IDs
    SELECT id INTO rhinestone_set_id FROM products WHERE sku = 'RG-RHINE-001';
    SELECT id INTO crystal_ab_id FROM products WHERE sku = 'AB-FLAT-SS10';
    SELECT id INTO gold_charms_id FROM products WHERE sku = 'GOLD-CHARM-3D';
    SELECT id INTO picker_tool_id FROM products WHERE sku = 'PICKER-PRO-001';
    SELECT id INTO brush_set_id FROM products WHERE sku = 'BRUSH-SET-15';
    SELECT id INTO cuticle_set_id FROM products WHERE sku = 'CUTICLE-SET-001';
    SELECT id INTO uv_lamp_id FROM products WHERE sku = 'UV-LAMP-36W';
    SELECT id INTO nail_drill_id FROM products WHERE sku = 'DRILL-20K-001';
    SELECT id INTO base_coat_id FROM products WHERE sku = 'BASE-GEL-15ML';
    SELECT id INTO top_coat_id FROM products WHERE sku = 'TOP-GEL-15ML';
    SELECT id INTO nude_set_id FROM products WHERE sku = 'NUDE-SET-6PC';
    SELECT id INTO nail_tips_id FROM products WHERE sku = 'TIPS-CLEAR-500';
    SELECT id INTO nail_forms_id FROM products WHERE sku = 'FORMS-100PC';
    
    -- Get customer IDs
    SELECT id INTO customer1_id FROM customers WHERE phone = '868-123-4567';
    SELECT id INTO customer2_id FROM customers WHERE phone = '868-234-5678';
    SELECT id INTO customer3_id FROM customers WHERE phone = '868-345-6789';
    SELECT id INTO customer4_id FROM customers WHERE phone = '868-456-7890';
    SELECT id INTO customer5_id FROM customers WHERE phone = '868-567-8901';
    
    current_date_var := CURRENT_DATE;
    
    -- Create orders over the past 3 months (rhinestone sets are best sellers)
    
    -- Order 1: 2 months ago - Rhinestone set + picker tool
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer1_id, 'Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 73.00, current_date_var - INTERVAL '65 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, rhinestone_set_id, 1, 45.00),
    (order_id, picker_tool_id, 1, 28.00);
    
    -- Order 2: 2 months ago - Crystal AB + Gold charms
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer2_id, 'Michelle Rodriguez', '868-234-5678', 'San Fernando, Trinidad', 70.00, current_date_var - INTERVAL '60 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, crystal_ab_id, 1, 38.00),
    (order_id, gold_charms_id, 1, 32.00);
    
    -- Order 3: 7 weeks ago - Big order with rhinestones and tools
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer1_id, 'Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 167.00, current_date_var - INTERVAL '49 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, rhinestone_set_id, 2, 45.00),
    (order_id, brush_set_id, 1, 52.00),
    (order_id, picker_tool_id, 1, 28.00);
    
    -- Order 4: 6 weeks ago - UV Lamp purchase
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer3_id, 'Keisha Williams', '868-345-6789', 'Port of Spain, Trinidad', 125.00, current_date_var - INTERVAL '42 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, uv_lamp_id, 1, 125.00);
    
    -- Order 5: 5 weeks ago - Gel polish starter set
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer4_id, 'Alicia Mohammed', '868-456-7890', 'Arima, Trinidad', 159.00, current_date_var - INTERVAL '35 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, base_coat_id, 1, 35.00),
    (order_id, top_coat_id, 1, 35.00),
    (order_id, nude_set_id, 1, 89.00);
    
    -- Order 6: 4 weeks ago - Rhinestone set again (popular!)
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer5_id, 'Priya Sharma', '868-567-8901', 'Couva, Trinidad', 77.00, current_date_var - INTERVAL '28 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, rhinestone_set_id, 1, 45.00),
    (order_id, gold_charms_id, 1, 32.00);
    
    -- Order 7: 3 weeks ago - Professional tools
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer2_id, 'Michelle Rodriguez', '868-234-5678', 'San Fernando, Trinidad', 227.00, current_date_var - INTERVAL '21 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, nail_drill_id, 1, 185.00),
    (order_id, cuticle_set_id, 1, 42.00);
    
    -- Order 8: 2 weeks ago - Extension supplies
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer3_id, 'Keisha Williams', '868-345-6789', 'Port of Spain, Trinidad', 43.00, current_date_var - INTERVAL '14 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, nail_tips_id, 1, 25.00),
    (order_id, nail_forms_id, 1, 18.00);
    
    -- Order 9: 1 week ago - Another rhinestone order (best seller!)
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer1_id, 'Sarah Johnson', '868-123-4567', 'Chaguanas, Trinidad', 83.00, current_date_var - INTERVAL '7 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, rhinestone_set_id, 1, 45.00),
    (order_id, crystal_ab_id, 1, 38.00);
    
    -- Order 10: 3 days ago - Repeat customer
    order_id := gen_random_uuid();
    INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_address, total_amount, created_at) 
    VALUES (order_id, customer4_id, 'Alicia Mohammed', '868-456-7890', 'Arima, Trinidad', 118.00, current_date_var - INTERVAL '3 days');
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (order_id, rhinestone_set_id, 2, 45.00),
    (order_id, picker_tool_id, 1, 28.00);
    
END $$;

-- Update inventory quantities to reflect sales
UPDATE products SET inventory_quantity = inventory_quantity - 8 WHERE sku = 'RG-RHINE-001'; -- Best seller: 8 units sold
UPDATE products SET inventory_quantity = inventory_quantity - 3 WHERE sku = 'AB-FLAT-SS10'; -- 3 units sold
UPDATE products SET inventory_quantity = inventory_quantity - 3 WHERE sku = 'GOLD-CHARM-3D'; -- 3 units sold
UPDATE products SET inventory_quantity = inventory_quantity - 4 WHERE sku = 'PICKER-PRO-001'; -- 4 units sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'BRUSH-SET-15'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'CUTICLE-SET-001'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'UV-LAMP-36W'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'DRILL-20K-001'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'BASE-GEL-15ML'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'TOP-GEL-15ML'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'NUDE-SET-6PC'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'TIPS-CLEAR-500'; -- 1 unit sold
UPDATE products SET inventory_quantity = inventory_quantity - 1 WHERE sku = 'FORMS-100PC'; -- 1 unit sold