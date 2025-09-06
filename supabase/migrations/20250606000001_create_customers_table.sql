-- Create customers table for Gurl Aesthetic
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  instagram_handle VARCHAR(100),
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  preferred_payment_method VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add customer_id to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_instagram ON customers(instagram_handle);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Create a view for customer statistics
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT o.id) as actual_order_count,
  COALESCE(SUM(o.total_amount), 0) as actual_total_spent,
  MAX(o.created_at) as actual_last_order_date,
  ARRAY_AGG(DISTINCT p.name ORDER BY p.name) FILTER (WHERE p.name IS NOT NULL) as purchased_products
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY c.id;

-- Create trigger to update customer stats when orders are created/updated
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_spent = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM orders 
        WHERE customer_id = NEW.customer_id
      ),
      order_count = (
        SELECT COUNT(*) 
        FROM orders 
        WHERE customer_id = NEW.customer_id
      ),
      last_order_date = (
        SELECT MAX(created_at) 
        FROM orders 
        WHERE customer_id = NEW.customer_id
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
  END IF;
  
  -- Also update the old customer if this is an UPDATE and customer changed
  IF TG_OP = 'UPDATE' AND OLD.customer_id IS DISTINCT FROM NEW.customer_id AND OLD.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_spent = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM orders 
        WHERE customer_id = OLD.customer_id
      ),
      order_count = (
        SELECT COUNT(*) 
        FROM orders 
        WHERE customer_id = OLD.customer_id
      ),
      last_order_date = (
        SELECT MAX(created_at) 
        FROM orders 
        WHERE customer_id = OLD.customer_id
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- Migrate existing order data to customers table
-- This will create customer records from existing orders
INSERT INTO customers (name, phone, address, created_at, total_spent, order_count, last_order_date)
SELECT 
  customer_name as name,
  customer_phone as phone,
  customer_address as address,
  MIN(created_at) as created_at,
  SUM(total_amount) as total_spent,
  COUNT(*) as order_count,
  MAX(created_at) as last_order_date
FROM orders
WHERE customer_name IS NOT NULL
GROUP BY customer_name, customer_phone, customer_address
ON CONFLICT DO NOTHING;

-- Link existing orders to the newly created customers
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o.customer_name = c.name
  AND (o.customer_phone = c.phone OR (o.customer_phone IS NULL AND c.phone IS NULL))
  AND (o.customer_address = c.address OR (o.customer_address IS NULL AND c.address IS NULL))
  AND o.customer_id IS NULL;

-- Add some helpful comments
COMMENT ON TABLE customers IS 'Gurl Aesthetic customer database for tracking orders and relationships';
COMMENT ON COLUMN customers.customer_type IS 'Customer classification: regular, vip, or wholesale';
COMMENT ON COLUMN customers.instagram_handle IS 'Customer Instagram username for social engagement';
COMMENT ON COLUMN customers.preferred_payment_method IS 'Preferred payment: cash, transfer, linx, etc.';