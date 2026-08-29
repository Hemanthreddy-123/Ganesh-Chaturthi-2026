-- Improve database structure for better user role management and data visibility

-- Create user roles enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policy for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update people_tracker policies to allow public viewing but admin-only modifications
DROP POLICY IF EXISTS "Authenticated users can manage people tracker entries" ON public.people_tracker;
DROP POLICY IF EXISTS "Public can view people tracker entries" ON public.people_tracker;

CREATE POLICY "Everyone can view people tracker entries" 
ON public.people_tracker 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert people tracker entries" 
ON public.people_tracker 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update people tracker entries" 
ON public.people_tracker 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete people tracker entries" 
ON public.people_tracker 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Update donations policies for better visibility
DROP POLICY IF EXISTS "Authenticated users can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can update donations" ON public.donations;

CREATE POLICY "Only admins can insert donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update donations" 
ON public.donations 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add default admin role for existing users with admin emails
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE p.email IN (
   'mukkamalla.baskar.reddy@temple-admin.com',
'kukkapalli.srinivasulu.naidu@temple-admin.com',
'siddavatam.venkata.ramanareddy@temple-admin.com'
) AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id AND ur.role = 'admin'
);

-- Function to automatically assign admin role to specific emails on signup
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user email is in admin list
  IF NEW.email IN (
     'mukkamalla.baskar.reddy@temple-admin.com',
'kukkapalli.srinivasulu.naidu@temple-admin.com',
'siddavatam.venkata.ramanareddy@temple-admin.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.user_id, 'admin'::app_role);
  ELSE
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.user_id, 'user'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign roles on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_user_role();
