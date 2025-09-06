-- Update inventory management to reduce stock only when orders are packed
-- Add status change tracking and timestamps

-- Add status change tracking columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_notes TEXT;

-- Create order status history table for audit trail
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by TEXT, -- Could be user ID in future
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Function to handle inventory reduction when order is packed
CREATE OR REPLACE FUNCTION handle_order_inventory()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  current_stock INTEGER;
  shortage_items TEXT[] := '{}';
BEGIN
  -- Only process when status changes to 'packed' from another status
  IF NEW.order_status = 'packed' AND (OLD.order_status IS NULL OR OLD.order_status != 'packed') THEN
    
    -- Check if we have sufficient inventory for all items
    FOR item IN 
      SELECT oi.product_id, oi.quantity, p.name, p.inventory_quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = NEW.id
    LOOP
      IF item.inventory_quantity < item.quantity THEN
        shortage_items := array_append(shortage_items, item.name || ' (need: ' || item.quantity || ', have: ' || item.inventory_quantity || ')');
      END IF;
    END LOOP;
    
    -- If there are shortages, raise an error
    IF array_length(shortage_items, 1) > 0 THEN
      RAISE EXCEPTION 'Insufficient inventory to pack order. Shortages: %', array_to_string(shortage_items, ', ');
    END IF;
    
    -- Reduce inventory for all items
    FOR item IN 
      SELECT oi.product_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      UPDATE products 
      SET inventory_quantity = inventory_quantity - item.quantity,
          updated_at = NOW()
      WHERE id = item.product_id;
    END LOOP;
    
    -- Set packed timestamp
    NEW.packed_at = NOW();
    
  -- Handle inventory restoration if unpacking (packed -> received)
  ELSIF OLD.order_status = 'packed' AND NEW.order_status = 'received' THEN
    
    -- Restore inventory for all items
    FOR item IN 
      SELECT oi.product_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      UPDATE products 
      SET inventory_quantity = inventory_quantity + item.quantity,
          updated_at = NOW()
      WHERE id = item.product_id;
    END LOOP;
    
    -- Clear packed timestamp
    NEW.packed_at = NULL;
    
  -- Handle other status transitions with timestamps
  ELSIF NEW.order_status = 'shipped' AND OLD.order_status != 'shipped' THEN
    NEW.shipped_at = NOW();
  ELSIF NEW.order_status = 'paid' AND OLD.order_status != 'paid' THEN
    NEW.paid_at = NOW();
  END IF;
  
  -- Log status change to history
  IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, change_reason)
    VALUES (NEW.id, OLD.order_status, NEW.order_status, NEW.status_notes);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory management
DROP TRIGGER IF EXISTS handle_order_inventory_trigger ON orders;
CREATE TRIGGER handle_order_inventory_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_inventory();

-- Function to check inventory availability for an order
CREATE OR REPLACE FUNCTION check_order_inventory_availability(order_id UUID)
RETURNS TABLE(
  product_name TEXT,
  required_quantity INTEGER,
  available_quantity INTEGER,
  shortage INTEGER,
  can_fulfill BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    oi.quantity,
    p.inventory_quantity,
    GREATEST(0, oi.quantity - p.inventory_quantity) as shortage,
    p.inventory_quantity >= oi.quantity as can_fulfill
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = check_order_inventory_availability.order_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing orders that are already 'packed' to have timestamps
UPDATE orders 
SET packed_at = created_at + interval '1 hour',
    shipped_at = CASE WHEN order_status IN ('shipped', 'paid') THEN created_at + interval '2 hours' END,
    paid_at = CASE WHEN order_status = 'paid' THEN created_at + interval '3 hours' END
WHERE order_status IN ('packed', 'shipped', 'paid') AND packed_at IS NULL;

-- Add helpful comments
COMMENT ON COLUMN orders.packed_at IS 'Timestamp when order was packed (inventory reduced)';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was shipped';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when order was marked as paid';
COMMENT ON COLUMN orders.status_notes IS 'Optional notes for status changes';
COMMENT ON TABLE order_status_history IS 'Audit trail of all order status changes';

-- Create view for orders with inventory check
CREATE OR REPLACE VIEW orders_with_inventory_status AS
SELECT 
  o.*,
  CASE 
    WHEN o.order_status = 'received' THEN (
      SELECT bool_and(p.inventory_quantity >= oi.quantity)
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = o.id
    )
    ELSE true
  END as can_be_packed,
  (
    SELECT count(*)
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = o.id AND p.inventory_quantity < oi.quantity
  ) as items_with_shortage
FROM orders o;