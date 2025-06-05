-- Create supplier products table
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- 'alibaba', 'temu', 'shein'
    external_id VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_currency VARCHAR(3) DEFAULT 'USD',
    supplier_name VARCHAR(255),
    supplier_rating DECIMAL(3,2),
    shipping_cost DECIMAL(10,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    images JSONB,
    category VARCHAR(100),
    tags JSONB, -- ['nail-art', 'rhinestones', 'tools']
    product_url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_product_id UUID REFERENCES supplier_products(id) ON DELETE CASCADE,
    based_on_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    potential_profit_ttd DECIMAL(10,2),
    potential_margin_percent DECIMAL(5,2),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    recommendation_reason TEXT,
    estimated_demand INTEGER,
    break_even_quantity INTEGER,
    total_landed_cost_ttd DECIMAL(10,2),
    suggested_retail_price_ttd DECIMAL(10,2),
    exchange_rate_used DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost breakdown table for detailed cost analysis
CREATE TABLE IF NOT EXISTS cost_breakdowns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recommendation_id UUID REFERENCES product_recommendations(id) ON DELETE CASCADE,
    product_cost_usd DECIMAL(10,2) NOT NULL,
    product_cost_ttd DECIMAL(10,2) NOT NULL,
    shipping_cost_usd DECIMAL(10,2),
    shipping_cost_ttd DECIMAL(10,2),
    customs_duty_ttd DECIMAL(10,2),
    vat_ttd DECIMAL(10,2),
    total_landed_cost_ttd DECIMAL(10,2) NOT NULL,
    exchange_rate DECIMAL(8,4) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_supplier_products_platform ON supplier_products(platform);
CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products(category);
CREATE INDEX IF NOT EXISTS idx_supplier_products_active ON supplier_products(is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_confidence ON product_recommendations(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_profit ON product_recommendations(potential_profit_ttd DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON product_recommendations(created_at DESC);

-- Create function to update recommendation updated_at timestamp
CREATE OR REPLACE FUNCTION update_recommendation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for recommendations updated_at
DROP TRIGGER IF EXISTS trigger_recommendations_updated_at ON product_recommendations;
CREATE TRIGGER trigger_recommendations_updated_at
    BEFORE UPDATE ON product_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_recommendation_updated_at();

-- Enable Row Level Security
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_breakdowns ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - add authentication later)
CREATE POLICY "Allow all operations on supplier_products" ON supplier_products FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_recommendations" ON product_recommendations FOR ALL USING (true);
CREATE POLICY "Allow all operations on cost_breakdowns" ON cost_breakdowns FOR ALL USING (true);

-- Create view for detailed recommendations with cost breakdown
CREATE OR REPLACE VIEW recommendation_details AS
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

-- Insert some sample supplier products for testing
INSERT INTO supplier_products (platform, external_id, name, description, price, supplier_name, supplier_rating, minimum_order_quantity, category, tags, product_url) VALUES
('alibaba', 'ALI001', 'Professional Nail Art Rhinestone Picker Tool Set', 'High-quality rhinestone picker with multiple tips for precise nail art application', 3.50, 'Guangzhou Beauty Tools Co', 4.2, 50, 'nail-tools', '["nail-art", "rhinestones", "tools", "picker"]', 'https://alibaba.com/sample1'),
('temu', 'TEMU001', 'Gradient Nail Art Sponges 50pcs', 'Dual-density sponges perfect for gradient nail art techniques', 2.80, 'Temu Beauty Supplies', 4.0, 20, 'nail-accessories', '["nail-art", "gradient", "sponges", "technique"]', 'https://temu.com/sample1'),
('shein', 'SHEIN001', 'Crystal Nail Gems Mixed Pack 1000pcs', 'Assorted crystal gems in various sizes and colors for nail decoration', 4.20, 'SHEIN Beauty', 3.8, 10, 'nail-accessories', '["crystals", "gems", "decoration", "nail-art"]', 'https://shein.com/sample1'),
('alibaba', 'ALI002', 'UV LED Nail Lamp 36W Professional', 'Professional grade UV LED lamp for curing gel polish and nail art', 15.60, 'Shenzhen Nail Tech Ltd', 4.5, 5, 'nail-equipment', '["uv-lamp", "led", "professional", "curing"]', 'https://alibaba.com/sample2'),
('temu', 'TEMU002', 'Nail Art Brush Set 15 Pieces', 'Complete set of nail art brushes for detailed designs and patterns', 5.40, 'Art Brush Factory', 4.1, 12, 'nail-tools', '["brushes", "nail-art", "design", "detailed"]', 'https://temu.com/sample2');

-- Comments for documentation
COMMENT ON TABLE supplier_products IS 'Products sourced from supplier platforms like Alibaba, Temu, Shein';
COMMENT ON TABLE product_recommendations IS 'AI-generated product recommendations based on sales analysis';
COMMENT ON TABLE cost_breakdowns IS 'Detailed cost analysis including Trinidad customs and taxes';
COMMENT ON COLUMN supplier_products.tags IS 'JSON array of product tags for similarity matching';
COMMENT ON COLUMN product_recommendations.confidence_score IS 'Overall confidence score combining similarity, profitability, and risk factors';
COMMENT ON COLUMN cost_breakdowns.customs_duty_ttd IS 'Trinidad customs duty (typically 15% for beauty products)';
COMMENT ON COLUMN cost_breakdowns.vat_ttd IS 'Trinidad VAT (12.5% on dutiable value + customs)';