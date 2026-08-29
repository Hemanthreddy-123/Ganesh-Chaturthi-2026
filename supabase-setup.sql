-- Ganesh Chaturthi 2026 · Depur Village 2026 - Database Setup
-- Paste this in Supabase SQL Editor and click Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'approved',
  last_login_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS persons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'handcash',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  person_id UUID,
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'handcash',
  receiving_admin_id UUID NOT NULL,
  receiving_admin_name TEXT NOT NULL,
  donor_name TEXT,
  donor_phone TEXT,
  items_donated TEXT,
  priority_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookcash (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time_start TIME,
  time_end TIME,
  location TEXT,
  organizer TEXT,
  priority INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  category TEXT,
  target_audience TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS people_tracker (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  upi_id TEXT,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  priority_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  table_affected TEXT,
  record_id UUID,
  amount NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  activities_count INTEGER DEFAULT 0,
  total_donations_collected NUMERIC DEFAULT 0,
  total_expenses_recorded NUMERIC DEFAULT 0,
  total_people_registered INTEGER DEFAULT 0,
  total_schedules_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT,
  person_id UUID,
  person_name TEXT,
  donor_phone TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookcash ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "pub_read_persons" ON persons FOR SELECT USING (true);
CREATE POLICY "pub_read_donations" ON donations FOR SELECT USING (true);
CREATE POLICY "pub_read_schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "pub_read_announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "pub_read_people_tracker" ON people_tracker FOR SELECT USING (true);
CREATE POLICY "pub_read_collections" ON admin_collections FOR SELECT USING (true);
CREATE POLICY "pub_read_expenses" ON admin_expenses FOR SELECT USING (true);
CREATE POLICY "pub_read_bookcash" ON bookcash FOR SELECT USING (true);
CREATE POLICY "pub_read_transactions" ON financial_transactions FOR SELECT USING (true);

-- Auth write policies
CREATE POLICY "auth_write_persons" ON persons FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_donations" ON donations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_collections" ON admin_collections FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_expenses" ON admin_expenses FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_bookcash" ON bookcash FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_schedules" ON schedules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_announcements" ON announcements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_people_tracker" ON people_tracker FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_activity_logs" ON activity_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_profiles" ON profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_user_roles" ON user_roles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_performance" ON admin_performance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_write_transactions" ON financial_transactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Functions
CREATE OR REPLACE FUNCTION log_activity(
  admin_id_param UUID,
  admin_name_param TEXT,
  activity_type_param TEXT,
  description_param TEXT,
  metadata_param JSONB DEFAULT '{}',
  table_affected_param TEXT DEFAULT NULL,
  record_id_param UUID DEFAULT NULL,
  amount_param NUMERIC DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO activity_logs (admin_id, admin_name, activity_type, description, metadata, table_affected, record_id, amount)
  VALUES (admin_id_param, admin_name_param, activity_type_param, description_param, metadata_param, table_affected_param, record_id_param, amount_param)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_admin_performance_stats(
  admin_id_param UUID,
  admin_name_param TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_performance (admin_id, admin_name, date, activities_count)
  VALUES (admin_id_param, admin_name_param, CURRENT_DATE, 1)
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION get_approved_admin_count()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM profiles WHERE status = 'approved');
END;
$$;

CREATE OR REPLACE FUNCTION approve_admin(target_user_id UUID, approver_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO current_count FROM profiles WHERE status = 'approved';
  IF current_count >= 6 THEN
    RETURN FALSE;
  END IF;
  UPDATE profiles
  SET status = 'approved', approved_at = NOW(), approved_by = approver_id
  WHERE user_id = target_user_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin',
    'approved'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
