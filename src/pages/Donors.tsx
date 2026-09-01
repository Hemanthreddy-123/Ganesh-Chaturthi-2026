import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddDonorModal } from '@/components/AddDonorModal';
import { EditDonorModal } from '@/components/EditDonorModal';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Gift, Phone, Calendar, Search, Edit, Plus, ArrowLeft, Star, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Donor {
  id: string; donor_name: string; donor_phone?: string;
  items_donated?: string; amount: number;
  receiving_admin_name: string; priority_order?: number; created_at: string;
}

const PRIORITY: Record<number, { label: string; color: string; dot: string }> = {
  1: { label: 'Highest', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  2: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  3: { label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  4: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
};

export const Donors: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Donor | null>(null);

  useEffect(() => {
    load();
    const ch = supabase.channel('donors-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('donations').select('*')
      .not('items_donated', 'is', null)
      .order('priority_order', { ascending: true })
      .order('amount', { ascending: false });
    if (error) toast.error('Failed to load donors');
    else setDonors(data || []);
    setLoading(false);
  };

  const filtered = donors.filter(d =>
    d.donor_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.items_donated || '').toLowerCase().includes(search.toLowerCase()) ||
    d.receiving_admin_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = donors.reduce((s, d) => s + Number(d.amount || 0), 0);

  return (
    <div className="min-h-screen festival-bg">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Button variant="outline" onClick={() => navigate('/')}
              className="mb-3 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Donors Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Ganesh Chaturthi 2026 · Depur Village  · Priority-based donor system</p>
          </div>
          {profile && (
            <Button onClick={() => setIsAddOpen(true)} className="donation-button">
              <Plus className="w-4 h-4 mr-2" />Add Donor
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Donors', value: donors.length, icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
            { label: 'Highest Priority', value: donors.filter(d => d.priority_order === 1).length, icon: Star, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            { label: 'High Priority', value: donors.filter(d => d.priority_order === 2).length, icon: Star, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
            { label: 'Total Value', value: `₹${totalValue}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={`rounded-2xl border ${bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live updates enabled</span>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl border-orange-200 focus:border-orange-400" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{search ? 'No donors found' : 'No donors yet'}</h3>
            <p className="text-muted-foreground text-sm">
              {search ? 'Try adjusting your search' : 'Donors will appear here once added by admins'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(donor => {
              const p = PRIORITY[donor.priority_order || 1] || PRIORITY[1];
              return (
                <Card key={donor.id} className="festival-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.dot}`} />
                        <CardTitle className="text-base truncate">{donor.donor_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge className={`text-xs border ${p.color}`}>
                          <Star className="w-2.5 h-2.5 mr-1" />{p.label}
                        </Badge>
                        {profile && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg"
                            onClick={() => { setSelected(donor); setIsEditOpen(true); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {donor.donor_phone && (
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Phone className="w-3 h-3" />{donor.donor_phone}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {donor.items_donated && (
                      <div className="bg-orange-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-medium text-orange-700 mb-1">Items Donated</p>
                        <p className="text-sm text-orange-900">{donor.items_donated}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      {donor.amount > 0
                        ? <span className="font-bold text-orange-600">₹{donor.amount}</span>
                        : <span />}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(donor.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">By: {donor.receiving_admin_name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AddDonorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={load} />
        {selected && (
          <EditDonorModal isOpen={isEditOpen}
            onClose={() => { setIsEditOpen(false); setSelected(null); }}
            onSuccess={load} donor={selected} />
        )}
      </div>
    </div>
  );
};
