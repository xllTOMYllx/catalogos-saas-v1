-- Migration: Add slug column to clients table
-- This script adds a unique slug field for personalized catalog URLs

-- Add slug column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Create index for better performance on slug lookups
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);

-- Update existing clients with a default slug based on their ID
-- This ensures existing data has valid slugs
UPDATE clients 
SET slug = LOWER(REGEXP_REPLACE(nombre, '[^a-zA-Z0-9]', '-', 'g')) || '-' || id
WHERE slug IS NULL;

-- Add comment to track schema change
COMMENT ON COLUMN clients.slug IS 'Unique URL-friendly identifier for the catalog (e.g., mi-tienda)';

-- Display summary
SELECT 'Migration completed: slug column added to clients table' as message;
SELECT 'Clients updated: ' || COUNT(*) FROM clients WHERE slug IS NOT NULL;
