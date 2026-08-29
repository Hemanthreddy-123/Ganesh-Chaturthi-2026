-- Add priority_order column to donations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'donations' AND column_name = 'priority_order') THEN
        ALTER TABLE public.donations ADD COLUMN priority_order integer DEFAULT 1;
    END IF;
END
$$;