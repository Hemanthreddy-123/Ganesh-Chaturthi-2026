-- Enhanced Supabase Database Design for Temple Management System
-- This migration creates a comprehensive database structure for all activities

-- First, let's update the admin settings to allow only 4 admins
INSERT INTO public.admin_settings (setting_name, setting_value) 
VALUES ('max_admins', '4')
ON CONFLICT (setting_name) DO UPDATE SET setting_value = '4';

-- Add proper constraints to profiles table for admin-only access
-- Add a constraint to limit admin accounts to only specific emails
DROP POLICY IF EXISTS "Only specific admins can sign up" ON public.profiles;
CREATE POLICY "Only specific admins can sign up"
ON public.profiles
FOR INSERT
WITH CHECK (
  email IN (
    'mukkamalla.baskar.reddy@temple-admin.com',
'kukkapalli.srinivasulu.naidu@temple-admin.com',
'siddavatam.venkata.ramanareddy@temple-admin.com'
  )
);

-- Enhanced Activity Logs table for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('donation_received', 'expense_added', 'collection_added', 'schedule_created', 'schedule_updated', 'announcement_created', 'person_added', 'person_updated', 'login', 'logout')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  table_affected text,
  record_id uuid,
  amount numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced Financial Transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('donation', 'expense', 'collection')),
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  payment_method text DEFAULT 'cash',
  person_id uuid,
  person_name text,
  donor_phone text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced Schedule Events table  
CREATE TABLE IF NOT EXISTS public.schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  organizer text,
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  priority integer DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  is_active boolean DEFAULT true,
  attendees_expected integer,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enhanced People Management table
CREATE TABLE IF NOT EXISTS public.people_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  address text NOT NULL,
  email text,
  emergency_contact text,
  emergency_phone text,
  registration_date date DEFAULT CURRENT_DATE,
  total_donations numeric DEFAULT 0,
  last_donation_date date,
  preferred_payment_method text DEFAULT 'cash',
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Admin Performance Tracking
CREATE TABLE IF NOT EXISTS public.admin_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_donations_collected numeric DEFAULT 0,
  total_expenses_recorded numeric DEFAULT 0,
  total_people_registered integer DEFAULT 0,
  total_schedules_created integer DEFAULT 0,
  login_time timestamp with time zone,
  logout_time timestamp with time zone,
  session_duration interval,
  activities_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(admin_id, date)
);

-- Enhanced Announcements with categories
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'all';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Enable RLS on all new tables
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity_logs
CREATE POLICY "Authenticated admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated admins can insert activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for financial_transactions
CREATE POLICY "Authenticated admins can manage financial transactions"
ON public.financial_transactions FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view financial summaries"
ON public.financial_transactions FOR SELECT
USING (true);

-- Create RLS policies for schedule_events
CREATE POLICY "Everyone can view active schedule events"
ON public.schedule_events FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated admins can manage schedule events"
ON public.schedule_events FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for people_management
CREATE POLICY "Authenticated admins can manage people"
ON public.people_management FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view active people"
ON public.people_management FOR SELECT
USING (is_active = true);

-- Create RLS policies for admin_performance
CREATE POLICY "Admins can view their own performance"
ON public.admin_performance FOR SELECT
USING (admin_id = auth.uid());

CREATE POLICY "Admins can update their own performance"
ON public.admin_performance FOR ALL
USING (admin_id = auth.uid());

-- Create updated_at triggers for all tables
CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at
BEFORE UPDATE ON public.schedule_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_people_management_updated_at
BEFORE UPDATE ON public.people_management
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_performance_updated_at
BEFORE UPDATE ON public.admin_performance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  admin_id_param uuid,
  admin_name_param text,
  activity_type_param text,
  description_param text,
  metadata_param jsonb DEFAULT '{}',
  table_affected_param text DEFAULT NULL,
  record_id_param uuid DEFAULT NULL,
  amount_param numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (
    admin_id, admin_name, activity_type, description, 
    metadata, table_affected, record_id, amount
  ) VALUES (
    admin_id_param, admin_name_param, activity_type_param, description_param,
    metadata_param, table_affected_param, record_id_param, amount_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to update admin performance
CREATE OR REPLACE FUNCTION public.update_admin_performance_stats(admin_id_param uuid, admin_name_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_performance (admin_id, admin_name, date)
  VALUES (admin_id_param, admin_name_param, CURRENT_DATE)
  ON CONFLICT (admin_id, date) 
  DO UPDATE SET
    updated_at = now(),
    activities_count = admin_performance.activities_count + 1;
END;
$$;
