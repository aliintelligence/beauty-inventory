-- Add order status system to track order fulfillment
-- Statuses: received, packed, shipped, paid

-- Add order_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'received';

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Set up check constraint to ensure valid statuses only
ALTER TABLE orders 
ADD CONSTRAINT IF NOT EXISTS check_order_status 
CHECK (order_status IN ('received', 'packed', 'shipped', 'paid'));

-- Update existing orders to have 'paid' status since they're completed orders
UPDATE orders 
SET order_status = 'paid' 
WHERE order_status IS NULL OR order_status = 'received';

-- Create a view for order status statistics
CREATE OR REPLACE VIEW order_status_stats AS
SELECT 
  order_status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_value,
  AVG(total_amount) as avg_order_value,
  MIN(created_at) as earliest_order,
  MAX(created_at) as latest_order
FROM orders
GROUP BY order_status
ORDER BY 
  CASE order_status 
    WHEN 'received' THEN 1
    WHEN 'packed' THEN 2  
    WHEN 'shipped' THEN 3
    WHEN 'paid' THEN 4
    ELSE 5
  END;

-- Add helpful comments
COMMENT ON COLUMN orders.order_status IS 'Order fulfillment status: received -> packed -> shipped -> paid';

-- Create function to get next status in workflow
CREATE OR REPLACE FUNCTION get_next_order_status(current_status VARCHAR(50))
RETURNS VARCHAR(50) AS $$
BEGIN
  CASE current_status
    WHEN 'received' THEN RETURN 'packed';
    WHEN 'packed' THEN RETURN 'shipped';
    WHEN 'shipped' THEN RETURN 'paid';
    WHEN 'paid' THEN RETURN 'paid'; -- Already final status
    ELSE RETURN 'received'; -- Default fallback
  END CASE;
END;
$$ LANGUAGE plpgsql;