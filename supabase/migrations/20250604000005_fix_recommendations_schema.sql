-- Check and fix recommendations schema
-- This migration safely handles existing tables and policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on supplier_products" ON supplier_products;
DROP POLICY IF EXISTS "Allow all operations on product_recommendations" ON product_recommendations;
DROP POLICY IF EXISTS "Allow all operations on cost_breakdowns" ON cost_breakdowns;

-- Recreate policies
CREATE POLICY "Allow all operations on supplier_products" ON supplier_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_recommendations" ON product_recommendations FOR ALL USING (true);
CREATE POLICY "Allow all operations on cost_breakdowns" ON cost_breakdowns FOR ALL USING (true);

-- Ensure all columns exist (safe to run multiple times)
DO $$ 
BEGIN
    -- Check if recommendation_details view exists and recreate if needed
    DROP VIEW IF EXISTS recommendation_details;
    
    CREATE VIEW recommendation_details AS
    SELECT 
        pr.*,
        sp.name as supplier_product_name,
        sp.platform,
        sp.supplier_name,
        sp.price as supplier_price_usd,
        sp.minimum_order_quantity,
        sp.product_url,
        sp.images as supplier_images,
        p.name as based_on_product_name,
        p.price as current_selling_price,
        cb.product_cost_ttd,
        cb.shipping_cost_ttd,
        cb.customs_duty_ttd,
        cb.vat_ttd,
        cb.exchange_rate
    FROM product_recommendations pr
    LEFT JOIN supplier_products sp ON pr.supplier_product_id = sp.id
    LEFT JOIN products p ON pr.based_on_product_id = p.id
    LEFT JOIN cost_breakdowns cb ON cb.recommendation_id = pr.id
    WHERE sp.is_active = true
    ORDER BY pr.confidence_score DESC, pr.potential_profit_ttd DESC;
    
    RAISE NOTICE 'Recommendation schema fixed successfully';
END $$;