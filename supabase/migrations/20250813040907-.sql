-- Update people_management table to ensure it has the correct structure for the People page
-- This migration ensures the table structure matches what the TypeScript code expects

-- The table should already have these fields based on the schema, but let's ensure it's correct
-- Add any missing columns if they don't exist
DO $$ 
BEGIN
  -- Check if name column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'name') THEN
    ALTER TABLE people_management ADD COLUMN name text NOT NULL DEFAULT '';
  END IF;
  
  -- Check if upi_id column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'upi_id') THEN
    ALTER TABLE people_management ADD COLUMN upi_id text;
  END IF;
  
  -- Check if total_donations column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'total_donations') THEN
    ALTER TABLE people_management ADD COLUMN total_donations numeric DEFAULT 0;
  END IF;
  
  -- Check if admin_name column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'admin_name') THEN
    ALTER TABLE people_management ADD COLUMN admin_name text NOT NULL DEFAULT '';
  END IF;
  
  -- Check if preferred_payment_method column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'preferred_payment_method') THEN
    ALTER TABLE people_management ADD COLUMN preferred_payment_method text DEFAULT 'cash';
  END IF;
  
  -- Check if is_active column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people_management' AND column_name = 'is_active') THEN
    ALTER TABLE people_management ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;