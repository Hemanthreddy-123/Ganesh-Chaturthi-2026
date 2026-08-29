-- Create schedule table for daily schedule management
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_start TIME,
  time_end TIME,
  location TEXT,
  organizer TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active schedules" 
ON public.schedules 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage schedules" 
ON public.schedules 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for date to prevent multiple schedules on same day
ALTER TABLE public.schedules 
ADD CONSTRAINT unique_schedule_date UNIQUE (date);