-- Create a separate people_tracker table for the People page functionality
-- This will avoid conflicts with the existing people_management table structure

CREATE TABLE IF NOT EXISTS public.people_tracker (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  upi_id text,
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.people_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for the people_tracker table
CREATE POLICY "Authenticated users can manage people tracker entries" 
ON public.people_tracker 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view people tracker entries" 
ON public.people_tracker 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE TRIGGER update_people_tracker_updated_at
BEFORE UPDATE ON public.people_tracker
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();