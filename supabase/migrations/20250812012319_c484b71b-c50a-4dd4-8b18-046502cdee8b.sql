-- Update persons table to only have essential fields
ALTER TABLE public.persons DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.persons DROP COLUMN IF EXISTS address;

-- Make sure we have the correct structure
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS admin_id uuid NOT NULL;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS admin_name text NOT NULL DEFAULT '';

-- Update payment_method values to be consistent
UPDATE public.persons SET payment_method = 'cash' WHERE payment_method = 'handcash';
UPDATE public.persons SET payment_method = 'upi' WHERE payment_method = 'phonepay';