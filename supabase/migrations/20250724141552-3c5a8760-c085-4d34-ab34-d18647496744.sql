-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  role TEXT DEFAULT 'admin',
  last_login_at TIMESTAMP WITH TIME ZONE,
  total_login_time INTERVAL DEFAULT '0 minutes',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create persons table for festival participants
CREATE TABLE public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('handcash', 'phonepay')) DEFAULT 'handcash',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('handcash', 'phonepay')) NOT NULL,
  receiving_admin_id UUID NOT NULL,
  receiving_admin_name TEXT NOT NULL,
  donor_name TEXT,
  donor_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin collections table
CREATE TABLE public.admin_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin expenses table
CREATE TABLE public.admin_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purpose TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin activities table
CREATE TABLE public.admin_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for scrolling alerts
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for persons
CREATE POLICY "Everyone can view persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert persons" ON public.persons FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update persons" ON public.persons FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete persons" ON public.persons FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for donations
CREATE POLICY "Everyone can view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update donations" ON public.donations FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for admin collections
CREATE POLICY "Everyone can view collections" ON public.admin_collections FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage collections" ON public.admin_collections FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for admin expenses
CREATE POLICY "Everyone can view expenses" ON public.admin_expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage expenses" ON public.admin_expenses FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for admin activities
CREATE POLICY "Everyone can view activities" ON public.admin_activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert activities" ON public.admin_activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for announcements
CREATE POLICY "Everyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage announcements" ON public.announcements FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample announcements
INSERT INTO public.announcements (title, content, priority, created_by) VALUES
('Jai Shree Ram', 'Welcome to the festival collection! Jai Shree Ram!', 1, gen_random_uuid()),
('Collection Update', 'Daily collection reports are now available in the donations section.', 2, gen_random_uuid()),
('Festival Schedule', 'Main festival celebrations start from tomorrow. All admins please be present.', 3, gen_random_uuid());
