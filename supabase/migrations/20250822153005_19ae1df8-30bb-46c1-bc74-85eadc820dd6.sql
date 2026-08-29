-- Enable real-time for donations table
ALTER TABLE public.donations REPLICA IDENTITY FULL;

-- Add donations table to realtime publication
ALTER publication supabase_realtime ADD TABLE public.donations;