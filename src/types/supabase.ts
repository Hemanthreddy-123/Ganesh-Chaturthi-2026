export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
  last_login_at?: string;
  total_login_time?: string;
  is_super_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  admin_id: string;
  admin_name: string;
  amount_paid: number;
  payment_method: 'handcash' | 'phonepay';
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  person_id?: string;
  person_name: string;
  amount: number;
  payment_method: 'handcash' | 'phonepay';
  receiving_admin_id: string;
  receiving_admin_name: string;
  donor_name?: string;
  donor_phone?: string;
  created_at: string;
}

export interface AdminCollection {
  id: string;
  admin_id: string;
  admin_name: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface AdminExpense {
  id: string;
  admin_id: string;
  admin_name: string;
  amount: number;
  purpose: string;
  date: string;
  created_at: string;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}