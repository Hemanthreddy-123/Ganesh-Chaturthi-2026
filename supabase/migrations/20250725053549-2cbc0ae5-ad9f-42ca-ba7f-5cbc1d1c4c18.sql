-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_approved_admin_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.profiles
    WHERE role = 'admin' AND status = 'approved'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_admin(target_user_id uuid, approver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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