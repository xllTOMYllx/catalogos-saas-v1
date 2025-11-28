-- Product Variants Schema Migration
-- This script creates the product_variants table for supporting product variations

-- Table: product_variants
-- Stores variant information for products (e.g., size, color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    "productId" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "variantType" VARCHAR(100) NOT NULL, -- e.g., 'Talla', 'Color', 'Tamaño'
    "variantValue" VARCHAR(255) NOT NULL, -- e.g., 'S', 'M', 'L', 'XL', 'Rojo', 'Azul'
    "additionalPrice" DECIMAL(10, 2) DEFAULT 0, -- Price adjustment for this variant
    stock INTEGER DEFAULT 0,
    "imageUrl" TEXT, -- Optional: specific image for this variant
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("productId", "variantType", "variantValue")
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_productId ON product_variants("productId");
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants("variantType");
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(active);

-- Create trigger for auto-updating updatedAt
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample variants for existing products (clothing items)
-- Note: Products with IDs 2, 4, 8 are shirts (Ropa category)
-- Products with IDs 6, 9 are pants (Ropa category)
-- Products with IDs 1, 3, 5, 7 are accessories

-- Sample variants for shirts
INSERT INTO product_variants ("productId", "variantType", "variantValue", "additionalPrice", stock, active) VALUES
    -- Camisa número 1 (id: 2 based on insert order)
    (2, 'Talla', 'S', 0, 5, true),
    (2, 'Talla', 'M', 0, 10, true),
    (2, 'Talla', 'L', 0, 8, true),
    (2, 'Talla', 'XL', 10.00, 5, true),
    -- Camisa número 2 (id: 4)
    (4, 'Talla', 'S', 0, 5, true),
    (4, 'Talla', 'M', 0, 10, true),
    (4, 'Talla', 'L', 0, 6, true),
    (4, 'Talla', 'XL', 10.00, 4, true),
    -- Camisa número 3 (id: 8)
    (8, 'Talla', 'S', 0, 6, true),
    (8, 'Talla', 'M', 0, 12, true),
    (8, 'Talla', 'L', 0, 6, true),
    (8, 'Talla', 'XL', 10.00, 4, true),
    -- Pantalón número 1 (id: 6)
    (6, 'Talla', '28', 0, 8, true),
    (6, 'Talla', '30', 0, 12, true),
    (6, 'Talla', '32', 0, 10, true),
    (6, 'Talla', '34', 0, 6, true),
    (6, 'Talla', '36', 10.00, 4, true),
    -- Pantalón número 2 (id: 9)
    (9, 'Talla', '28', 0, 5, true),
    (9, 'Talla', '30', 0, 8, true),
    (9, 'Talla', '32', 0, 5, true),
    (9, 'Talla', '34', 0, 4, true)
ON CONFLICT ("productId", "variantType", "variantValue") DO NOTHING;

-- Fix sequence for product_variants
SELECT setval('product_variants_id_seq', COALESCE((SELECT MAX(id) FROM product_variants), 1), true);

-- Display summary
SELECT 'Product variants schema created successfully!' as message;
SELECT 'Variants count: ' || COUNT(*) FROM product_variants;
