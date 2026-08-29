-- Create admin_limit table to store the maximum number of admins allowed
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin settings
CREATE POLICY "Everyone can view admin settings" 
ON public.admin_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can modify admin settings" 
ON public.admin_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert the admin limit setting
INSERT INTO public.admin_settings (setting_name, setting_value) VALUES ('max_admins', '6');

-- Add a status field to profiles to track admin approval
ALTER TABLE public.profiles 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add approved_by field to track who approved the admin
ALTER TABLE public.profiles 
ADD COLUMN approved_by uuid REFERENCES auth.users(id);

-- Add approved_at field
ALTER TABLE public.profiles 
ADD COLUMN approved_at timestamp with time zone;

-- Create function to check admin count
CREATE OR REPLACE FUNCTION public.get_approved_admin_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.profiles
    WHERE role = 'admin' AND status = 'approved'
  );
END;
$$;

-- Create function to approve admin (with limit check)
CREATE OR REPLACE FUNCTION public.approve_admin(target_user_id uuid, approver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_admins integer;
  current_count integer;
BEGIN
  -- Get max admin limit
  SELECT setting_value::integer INTO max_admins 
  FROM public.admin_settings 
  WHERE setting_name = 'max_admins';
  
  -- Get current approved admin count
  SELECT public.get_approved_admin_count() INTO current_count;
  
  -- Check if we can approve another admin
  IF current_count >= max_admins THEN
    RETURN false;
  END IF;
  
  -- Approve the admin
  UPDATE public.profiles 
  SET 
    status = 'approved',
    approved_by = approver_id,
    approved_at = now(),
    updated_at = now()
  WHERE user_id = target_user_id AND role = 'admin';
  
  RETURN true;
END;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();