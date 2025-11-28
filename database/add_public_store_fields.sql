-- Migration: Add public store fields to clients table
-- This script adds fields for the public store URL feature (Option 2)

-- Add is_store_public column to control visibility
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_store_public BOOLEAN DEFAULT FALSE;

-- Add store_url_slug column for custom public URLs (separate from internal slug)
-- Note: We already have 'slug' column, so we'll use it for public store URL
-- The is_store_public field controls whether the store is accessible publicly

-- Create index for better performance on public store lookups
CREATE INDEX IF NOT EXISTS idx_clients_is_store_public ON clients(is_store_public);

-- Add comment to track schema change
COMMENT ON COLUMN clients.is_store_public IS 'Controls whether the client store is publicly accessible at /tienda/:slug';

-- Display summary
SELECT 'Migration completed: is_store_public column added to clients table' as message;
SELECT 'Clients with public stores: ' || COUNT(*) FROM clients WHERE is_store_public = TRUE;
