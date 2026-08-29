-- Check current constraint on donations table
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.donations'::regclass 
AND contype = 'c';

-- Drop the existing check constraint that's causing issues
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_payment_method_check;

-- Add a new, more flexible payment method constraint
ALTER TABLE public.donations ADD CONSTRAINT donations_payment_method_check 
CHECK (payment_method IN ('cash', 'upi', 'items', 'online', 'card', 'cheque', 'bank_transfer'));