-- ============================================================
-- STEP 1: Create admin users in Supabase Auth
-- Go to: Authentication → Users → Add User → Create New User
-- Create these 3 users manually there first, then run STEP 2
-- ============================================================

-- ============================================================
-- STEP 2: After creating users in Auth, run this SQL
-- This inserts their profiles and roles into the tables
-- Replace the UUIDs below with the actual user IDs from
-- Authentication → Users (copy the UUID shown there)
-- ============================================================

-- First check what users exist in auth
SELECT id, email, created_at FROM auth.users;
