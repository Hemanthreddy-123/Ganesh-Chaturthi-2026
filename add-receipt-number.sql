-- Add receipt_number column to persons table
ALTER TABLE persons ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE;

-- Add receipt_number column to donations table  
ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE;

-- Add receipt_number column to admin_collections table
ALTER TABLE admin_collections ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE;

-- Function to generate receipt number: DGU-2026-XXXXX
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_num INTEGER;
  receipt TEXT;
BEGIN
  -- Count total records across all payment tables
  SELECT COALESCE(
    (SELECT COUNT(*) FROM persons WHERE receipt_number IS NOT NULL) +
    (SELECT COUNT(*) FROM donations WHERE receipt_number IS NOT NULL) +
    (SELECT COUNT(*) FROM admin_collections WHERE receipt_number IS NOT NULL),
    0
  ) + 1 INTO seq_num;
  
  receipt := 'DGU-2026-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN receipt;
END;
$$;

-- Auto-assign receipt number on persons insert
CREATE OR REPLACE FUNCTION assign_person_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS person_receipt_trigger ON persons;
CREATE TRIGGER person_receipt_trigger
  BEFORE INSERT ON persons
  FOR EACH ROW EXECUTE FUNCTION assign_person_receipt();

-- Auto-assign receipt number on donations insert
CREATE OR REPLACE FUNCTION assign_donation_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS donation_receipt_trigger ON donations;
CREATE TRIGGER donation_receipt_trigger
  BEFORE INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION assign_donation_receipt();

-- Auto-assign receipt number on collections insert
CREATE OR REPLACE FUNCTION assign_collection_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS collection_receipt_trigger ON admin_collections;
CREATE TRIGGER collection_receipt_trigger
  BEFORE INSERT ON admin_collections
  FOR EACH ROW EXECUTE FUNCTION assign_collection_receipt();
