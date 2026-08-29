-- Create the four admin accounts as pre-approved profiles
-- These will be ready for the actual users to sign up with these specific emails
INSERT INTO public.profiles (
  user_id,
  name,
  email,
  role,
  status,
  approved_at,
  created_at,
  updated_at
) VALUES 
(gen_random_uuid(), 'Mukkamalla Baskar Reddy', 'mukkamalla.baskar.reddy@temple-admin.com', 'admin', 'approved', now(), now(), now()),
(gen_random_uuid(), 'Kukkapalli Srinivasulu naidu', 'kukkapalli.srinivasulu.naidu@temple-admin.com', 'admin', 'approved', now(), now(), now()),
(gen_random_uuid(), 'Siddavatam venkata ramanareddy', 'siddavatam.venkata.ramanareddy@temple-admin.com', 'admin', 'approved', now(), now(), now()),


-- Create a reference table for admin credentials (for your records)
CREATE TABLE IF NOT EXISTS public.admin_credentials_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  temp_password text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  notes text DEFAULT 'Initial admin setup - these users need to sign up with these exact credentials'
);

-- Insert the credentials for reference
INSERT INTO public.admin_credentials_reference (name, email, temp_password) VALUES
('Mukkamalla Baskar Reddy', 'mukkamalla.baskar.reddy@temple-admin.com', 'MB_Temple_2025!@#'),
('Kukkapalli Srinivasulu naidu', 'kukkapalli.srinivasulu.naidu@temple-admin.com', 'KS_Admin_Secure$567'),
('Siddavatam venkata ramanareddy', 'siddavatam.venkata.ramanareddy@temple-admin.com', 'SR_Temple_Pass&890'),


-- Enable RLS on the credentials reference table
ALTER TABLE public.admin_credentials_reference ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view credentials
CREATE POLICY "Only authenticated users can view admin credentials"
ON public.admin_credentials_reference
FOR SELECT
TO authenticated
USING (true);
