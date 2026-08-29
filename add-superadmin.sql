-- Run this in Supabase SQL Editor
-- Makes hemanth.reddy@depur-ganesh.com a super admin

-- Add is_super_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Set hemanth as super admin
UPDATE profiles 
SET is_super_admin = TRUE 
WHERE email = 'hemanth.reddy@depur-ganesh.com';

-- Allow super admin to update persons
CREATE POLICY "superadmin_update_persons" ON persons 
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow super admin to delete persons
CREATE POLICY "superadmin_delete_persons" ON persons 
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Allow super admin to update donations
CREATE POLICY "superadmin_update_donations" ON donations 
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow super admin to delete donations
CREATE POLICY "superadmin_delete_donations" ON donations 
FOR DELETE USING (auth.uid() IS NOT NULL);
