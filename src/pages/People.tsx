import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Search, IndianRupee, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/SupabaseAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

interface PeopleRecord {
  id: string; name: string; amount: number;
  upi_id?: string; admin_id: string; admin_name: string; created_at: string;
}

export const People: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [people, setPeople] = useState<PeopleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', upi_id: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [trackerRes, personsRes] = await Promise.all([
        supabase.from('people_tracker').select('*').order('created_at', { ascending: false }),
        supabase.from('persons').select('id, name, amount_paid, admin_id, admin_name, created_at, phone_number').order('created_at', { ascending: false }),
      ]);

      if (trackerRes.error) toast.error('Failed to load tracker data');
      if (personsRes.error) toast.error('Failed to load persons data');

      // Map persons to same shape as PeopleRecord
      const personsMapped: PeopleRecord[] = (personsRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        amount: p.amount_paid || 0,
        upi_id: p.phone_number || undefined,
        admin_id: p.admin_id,
        admin_name: p.admin_name,
        created_at: p.created_at,
      }));

      // Merge & sort by amount descending (high to low)
      const combined = [...(trackerRes.data || []), ...personsMapped].sort(
        (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
      );

      setPeople(combined);
    } catch (_) {
      toast.error('Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !isAdmin) { toast.error('Only admins can add people'); return; }
    if (!form.name || !form.amount) { toast.error('Name and amount are required'); return; }
    const { error } = await supabase.from('people_tracker').insert({
      name: form.name, upi_id: form.upi_id || null,
      admin_id: user.id, admin_name: profile.name, amount: Number(form.amount),
    });
    if (error) toast.error('Failed to add person');
    else {
      toast.success('Person added!');
      setForm({ name: '', amount: '', upi_id: '' });
      setIsAddOpen(false);
      load();
    }
  };

  const filtered = people.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.admin_name.toLowerCase().includes(search.toLowerCase())
  );

  const total = people.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="min-h-screen festival-bg">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Button variant="outline" onClick={() => navigate('/donations')}
              className="mb-3 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Collections
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">People Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Ganesh Chaturthi 2026 · Depur Village  · Community contributors</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsAddOpen(true)} className="donation-button">
              <Plus className="w-4 h-4 mr-2" />Add Person
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-2xl bg-orange-50 border-orange-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{people.length}</p>
                <p className="text-sm text-muted-foreground">Total People</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-green-50 border-green-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">₹{total}</p>
                <p className="text-sm text-muted-foreground">Total Amount (display only)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search by name or admin..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl border-orange-200 focus:border-orange-400" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-32" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <Card key={p.id} className="festival-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{p.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">₹{p.amount}</span>
                  </div>
                  <p className="font-semibold mb-1">{p.name}</p>
                  {p.upi_id && p.upi_id.includes('@') && <p className="text-xs text-orange-600 mb-1">UPI: {p.upi_id}</p>}
                  <p className="text-xs text-muted-foreground">By {p.admin_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No People Found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search ? 'No people match your search.' : 'No people have been added yet.'}
            </p>
            {!search && isAdmin && (
              <Button onClick={() => setIsAddOpen(true)} className="donation-button">
                <Plus className="w-4 h-4 mr-2" />Add First Person
              </Button>
            )}
          </div>
        )}

        {/* Add modal */}
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md rounded-3xl shadow-2xl animate-scale-in">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Person</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl"
                    onClick={() => setIsAddOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Add a person with their contribution amount</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <Label htmlFor="pname">Name *</Label>
                    <Input id="pname" value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Person's name" className="rounded-xl mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="pamount">Amount *</Label>
                    <Input id="pamount" type="number" value={form.amount}
                      onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="Amount" min="0" className="rounded-xl mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="pupi">UPI ID (Optional)</Label>
                    <Input id="pupi" value={form.upi_id}
                      onChange={(e) => setForm(p => ({ ...p, upi_id: e.target.value }))}
                      placeholder="example@upi" className="rounded-xl mt-1" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 donation-button">Add Person</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}
                      className="flex-1 rounded-xl">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
