-- Migration to change image path columns from VARCHAR(500) to TEXT
-- This allows storing longer URLs including full paths

-- Update clients.logo column to TEXT
ALTER TABLE clients ALTER COLUMN logo TYPE TEXT;

-- Update products.ruta column to TEXT  
ALTER TABLE products ALTER COLUMN ruta TYPE TEXT;

-- Verify changes
SELECT 
    table_name, 
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('clients', 'products')
    AND column_name IN ('logo', 'ruta');
