-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    customs_cost DECIMAL(10,2) DEFAULT 0 CHECK (customs_cost >= 0),
    inventory_quantity INTEGER NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create function to update product inventory when order is placed
CREATE OR REPLACE FUNCTION update_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET inventory_quantity = inventory_quantity - NEW.quantity
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust inventory for quantity changes
        UPDATE products 
        SET inventory_quantity = inventory_quantity + OLD.quantity - NEW.quantity
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Restore inventory when order item is deleted
        UPDATE products 
        SET inventory_quantity = inventory_quantity + OLD.quantity
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for inventory management
DROP TRIGGER IF EXISTS trigger_update_inventory_insert ON order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_update ON order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_delete ON order_items;

CREATE TRIGGER trigger_update_inventory_insert
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_inventory();

CREATE TRIGGER trigger_update_inventory_update
    AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_inventory();

CREATE TRIGGER trigger_update_inventory_delete
    AFTER DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_inventory();

-- Create function to update product updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue
FROM orders 
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW product_sales_summary AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.cost,
    p.customs_cost,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    COALESCE(SUM(oi.quantity * (p.cost + COALESCE(p.customs_cost, 0))), 0) as total_cost,
    COALESCE(SUM(oi.total_price) - SUM(oi.quantity * (p.cost + COALESCE(p.customs_cost, 0))), 0) as profit
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.cost, p.customs_cost
ORDER BY total_sold DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - add authentication later)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);

-- Insert sample beauty products
INSERT INTO products (name, description, price, cost, customs_cost, inventory_quantity) VALUES
('Fenty Beauty Gloss Bomb', 'Universal lip luminizer in Fenty Glow', 21.00, 12.00, 2.00, 25),
('Rare Beauty Soft Pinch Blush', 'Liquid blush in Joy', 23.00, 14.00, 2.50, 15),
('Charlotte Tilbury Flawless Filter', 'Hollywood complexion in a click', 49.00, 28.00, 4.00, 10),
('Drunk Elephant C-Firma', 'Vitamin C day serum', 84.00, 45.00, 6.00, 8),
('Glow Recipe Watermelon Moisturizer', 'Pink juice moisturizer', 39.00, 22.00, 3.50, 20),
('Sol de Janeiro Brazilian Bum Bum Cream', 'Fast-absorbing body cream', 48.00, 26.00, 4.00, 12);

-- Comments for documentation
COMMENT ON TABLE products IS 'Beauty product inventory with pricing and costs';
COMMENT ON TABLE orders IS 'Customer orders with optional contact information';
COMMENT ON TABLE order_items IS 'Individual items within each order';
COMMENT ON COLUMN products.customs_cost IS 'Additional customs/import fees per unit';
COMMENT ON COLUMN products.inventory_quantity IS 'Current stock level, automatically updated when orders are placed';