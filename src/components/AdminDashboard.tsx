import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { AdminActivityLog, logAdminActivity } from '@/components/AdminActivityLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, IndianRupee, TrendingUp, Calendar, Activity, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScheduleManagement from '@/components/ScheduleManagement';
import FinancialSummary from '@/components/FinancialSummary';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [persons, setPersons] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '', address: '', phoneNumber: '', amountPaid: '',
    paymentMethod: 'handcash' as 'handcash' | 'phonepay',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) { loadPersons(); loadDonations(); }
  }, [profile]);

  const loadPersons = async () => {
    try {
      const [personsRes, trackerRes] = await Promise.all([
        supabase.from('persons').select('*').order('created_at', { ascending: false }),
        supabase.from('people_tracker').select('*').order('created_at', { ascending: false }),
      ]);
      // Map tracker to same shape as persons
      const trackerMapped = (trackerRes.data || []).map((t: any) => ({
        id: t.id, name: t.name, address: '', phone_number: t.upi_id || '',
        admin_id: t.admin_id, admin_name: t.admin_name,
        amount_paid: t.amount || 0, payment_method: 'handcash',
        created_at: t.created_at, updated_at: t.updated_at || t.created_at,
      }));
      const combined = [...(personsRes.data || []), ...trackerMapped].sort(
        (a, b) => Number(b.amount_paid || 0) - Number(a.amount_paid || 0)
      );
      setPersons(combined);
    } catch (_) {}
  };

  const loadDonations = async () => {
    const { data, error } = await supabase.from('donations').select('*')
      .eq('receiving_admin_id', profile?.user_id).order('created_at', { ascending: false });
    if (!error) setDonations(data || []);
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const { error } = await supabase.from('persons').insert([{
        name: newPerson.name, address: newPerson.address,
        phone_number: newPerson.phoneNumber, admin_id: profile.user_id,
        admin_name: profile.name, amount_paid: parseFloat(newPerson.amountPaid),
        payment_method: newPerson.paymentMethod,
      }]).select();
      if (error) throw error;
      logAdminActivity(profile.user_id, profile.name, 'Added person',
        `Added ${newPerson.name} with ₹${newPerson.amountPaid} via ${newPerson.paymentMethod}`);
      setNewPerson({ name: '', address: '', phoneNumber: '', amountPaid: '', paymentMethod: 'handcash' });
      setIsAddPersonOpen(false);
      loadPersons();
      toast({ title: "Person Added", description: `${newPerson.name} added successfully.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const totalDonations = donations.reduce((s, d) => s + Number(d.amount), 0);
  const handCashTotal = donations.filter(d => d.payment_method === 'handcash').reduce((s, d) => s + Number(d.amount), 0);
  const phonePeTotal = donations.filter(d => d.payment_method === 'phonepay').reduce((s, d) => s + Number(d.amount), 0);

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-white/10 text-7xl select-none">🕉</div>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{profile.name}</h1>
          <p className="text-white/80 text-sm">Ganesh Chaturthi 2026 · Depur Village  · Admin Portal</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-orange-50 border border-orange-100 rounded-2xl p-1 h-auto gap-1">
          {[
            { value: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { value: 'people', icon: Users, label: 'People' },
            { value: 'financial', icon: IndianRupee, label: 'Financial' },
            { value: 'schedule', icon: Calendar, label: 'Schedule' },
            { value: 'donations', icon: TrendingUp, label: 'Donations' },
            { value: 'activity', icon: Activity, label: 'Activity' },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}
              className="flex items-center gap-1.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 text-xs sm:text-sm py-2">
              <Icon className="w-3.5 h-3.5" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total People', value: persons.length, icon: Users, color: 'from-orange-400 to-orange-600', sub: 'in your list' },
              { label: 'Total Collected', value: `₹${totalDonations}`, icon: IndianRupee, color: 'from-green-400 to-green-600', sub: `${donations.length} donations` },
              { label: 'Hand Cash', value: `₹${handCashTotal}`, icon: TrendingUp, color: 'from-blue-400 to-blue-600', sub: 'cash collections' },
              { label: 'PhonePe/UPI', value: `₹${phonePeTotal}`, icon: TrendingUp, color: 'from-purple-400 to-purple-600', sub: 'digital payments' },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <Card key={label} className="festival-card overflow-hidden">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm font-medium text-foreground/80 mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {donations.length > 0 && (
            <Card className="festival-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {donations.slice(0, 5).map((d, i) => (
                  <div key={d.id} className={`flex items-center justify-between px-5 py-3 ${i < 4 ? 'border-b border-border' : ''}`}>
                    <div>
                      <p className="font-medium text-sm">{d.person_name}</p>
                      <p className="text-xs text-muted-foreground">by {d.donor_name || 'Anonymous'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">₹{d.amount}</p>
                      <Badge variant={d.payment_method === 'handcash' ? 'default' : 'secondary'} className="text-xs">
                        {d.payment_method === 'handcash' ? 'Cash' : 'UPI'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* People */}
        <TabsContent value="people" className="space-y-5 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">People Management</h3>
            <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
              <DialogTrigger asChild>
                <Button className="donation-button">
                  <Plus className="w-4 h-4 mr-2" />Add Person
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Person</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPerson} className="space-y-4">
                  {[
                    { id: 'name', label: 'Name', placeholder: "Person's name", key: 'name' },
                    { id: 'address', label: 'Address', placeholder: 'Address', key: 'address' },
                    { id: 'amount', label: 'Amount Paid', placeholder: 'Amount', key: 'amountPaid', type: 'number' },
                  ].map(({ id, label, placeholder, key, type }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id}>{label} *</Label>
                      <Input id={id} type={type || 'text'} placeholder={placeholder}
                        value={(newPerson as any)[key]}
                        onChange={(e) => setNewPerson(p => ({ ...p, [key]: e.target.value }))}
                        className="rounded-xl" required />
                    </div>
                  ))}
                  {/* Phone — optional */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input id="phone" type="text" placeholder="Phone number"
                      value={newPerson.phoneNumber}
                      onChange={(e) => setNewPerson(p => ({ ...p, phoneNumber: e.target.value }))}
                      className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Method *</Label>
                    <select value={newPerson.paymentMethod}
                      onChange={(e) => setNewPerson(p => ({ ...p, paymentMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-input bg-background rounded-xl text-sm">
                      <option value="handcash">Hand Cash</option>
                      <option value="phonepay">PhonePe/UPI</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full donation-button">Add Person</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {persons.map(person => (
              <Card key={person.id} className="festival-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{person.name}</CardTitle>
                  <CardDescription className="text-xs">{person.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{person.phone_number}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-orange-600 border-orange-200">₹{person.amount_paid}</Badge>
                    <Badge variant={person.payment_method === 'handcash' ? 'default' : 'secondary'}>
                      {person.payment_method === 'handcash' ? 'Cash' : 'UPI'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(person.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {persons.length === 0 && (
            <Card className="festival-card">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No People Added Yet</h3>
                <Button onClick={() => setIsAddPersonOpen(true)} className="donation-button mt-2">
                  <Plus className="w-4 h-4 mr-2" />Add First Person
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Financial */}
        <TabsContent value="financial" className="mt-6">
          <FinancialSummary />
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="mt-6">
          <ScheduleManagement />
        </TabsContent>

        {/* Donations */}
        <TabsContent value="donations" className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">All Donations</h3>
          {donations.length > 0 ? (
            <div className="grid gap-4">
              {donations.map(d => (
                <Card key={d.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{d.person_name}</p>
                        <p className="text-sm text-muted-foreground">by {d.donor_name || 'Anonymous'}</p>
                        {d.donor_phone && <p className="text-xs text-muted-foreground">{d.donor_phone}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(d.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">₹{d.amount}</p>
                        <Badge variant={d.payment_method === 'handcash' ? 'default' : 'secondary'}>
                          {d.payment_method === 'handcash' ? 'Hand Cash' : 'PhonePe/UPI'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="festival-card">
              <CardContent className="text-center py-12">
                <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No donations yet. They will appear here as received.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="mt-6">
          <AdminActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};
