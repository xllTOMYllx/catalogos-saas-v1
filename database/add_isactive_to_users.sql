-- Migration: Add isActive column to users table
-- This column is used to enable/disable user accounts
-- Admins can toggle this to control access to client accounts

-- Add isActive column with default value of true
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Update existing users to have isActive = true
UPDATE users SET "isActive" = true WHERE "isActive" IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'isActive';

-- Show summary
SELECT 'Migration complete: isActive column added to users table' as message;
SELECT 'Total users: ' || COUNT(*) as total, 
       'Active users: ' || COUNT(*) FILTER (WHERE "isActive" = true) as active,
       'Inactive users: ' || COUNT(*) FILTER (WHERE "isActive" = false) as inactive
FROM users;
