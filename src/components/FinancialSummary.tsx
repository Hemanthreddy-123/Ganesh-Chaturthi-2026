import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, CreditCard, Users, BookOpen } from 'lucide-react';

interface FinancialData {
  totalCollected: number;
  totalSpent: number;
  availableAmount: number;
  upiAmount: number;
  cashAmount: number;
  totalPersons: number;
  totalDonations: number;
  totalBookcash: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

const FinancialSummary = () => {
  const [data, setData] = useState<FinancialData>({
    totalCollected: 0, totalSpent: 0, availableAmount: 0,
    upiAmount: 0, cashAmount: 0, totalPersons: 0, totalDonations: 0, totalBookcash: 0
  });
  const [loading, setLoading] = useState(true);
  const [bookcashCount, setBookcashCount] = useState(0);

  useEffect(() => {
    load();
    const channel = supabase.channel('fin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_collections' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_expenses' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookcash' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: persons }, { data: donations }, { data: collections }, { data: expenses }, { data: bookcash }] =
        await Promise.all([
          supabase.from('persons').select('amount_paid, payment_method'),
          supabase.from('donations').select('amount, payment_method'),
          supabase.from('admin_collections').select('amount'),
          supabase.from('admin_expenses').select('amount'),
          supabase.from('bookcash').select('amount'),
        ]);

      const personsTotal = (persons || []).reduce((s, p) => s + Number(p.amount_paid || 0), 0);
      const donationsTotal = (donations || []).reduce((s, d) => s + Number(d.amount), 0);
      const collectionsTotal = (collections || []).reduce((s, c) => s + Number(c.amount), 0);
      const expensesTotal = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
      const bookcashTotal = (bookcash || []).reduce((s, b) => s + Number(b.amount), 0);

      const totalCollected = personsTotal + donationsTotal + collectionsTotal;

      // Fix: match actual payment_method values used in the app
      const upiMethods = ['phonepay', 'upi', 'phonepay/upi', 'items'];
      const cashMethods = ['handcash', 'cash'];

      const allPayments = [
        ...(persons || []).map(p => ({ amount: p.amount_paid, method: p.payment_method })),
        ...(donations || []).map(d => ({ amount: d.amount, method: d.payment_method })),
      ];

      const upiAmount = allPayments
        .filter(p => upiMethods.includes((p.method || '').toLowerCase()))
        .reduce((s, p) => s + Number(p.amount || 0), 0);

      const cashAmount = allPayments
        .filter(p => cashMethods.includes((p.method || '').toLowerCase()))
        .reduce((s, p) => s + Number(p.amount || 0), 0);

      setBookcashCount((bookcash || []).length);
      setData({
        totalCollected, totalSpent: expensesTotal,
        availableAmount: totalCollected - expensesTotal,
        upiAmount, cashAmount,
        totalPersons: (persons || []).length,
        totalDonations: (donations || []).length,
        totalBookcash: bookcashTotal,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-2xl h-28 shadow-sm" />
        ))}
      </div>
    );
  }

  const isProfit = data.availableAmount >= 0;

  return (
    <div className="space-y-5">
      {/* Main 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 rounded-2xl divine-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Collected</CardTitle>
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">{fmt(data.totalCollected)}</p>
            <p className="text-xs text-green-700 mt-1">From all sources combined</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 rounded-2xl divine-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
            <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-900">{fmt(data.totalSpent)}</p>
            <p className="text-xs text-red-700 mt-1">All recorded expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 rounded-2xl divine-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Available Balance</CardTitle>
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">{fmt(data.availableAmount)}</p>
            <Badge variant={isProfit ? 'default' : 'destructive'} className="mt-2 text-xs">
              {isProfit ? '✓ Surplus' : '⚠ Deficit'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Secondary 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'UPI / PhonePe', value: fmt(data.upiAmount), icon: CreditCard, color: 'bg-purple-500', bg: 'from-purple-50 to-violet-100 border-purple-200' },
          { label: 'Hand Cash', value: fmt(data.cashAmount), icon: IndianRupee, color: 'bg-amber-500', bg: 'from-amber-50 to-yellow-100 border-amber-200' },
          { label: 'Book Cash', value: fmt(data.totalBookcash), icon: BookOpen, color: 'bg-pink-500', bg: 'from-pink-50 to-rose-100 border-pink-200', sub: `${bookcashCount} entries` },
          { label: 'Total People', value: data.totalPersons.toString(), icon: Users, color: 'bg-teal-500', bg: 'from-teal-50 to-cyan-100 border-teal-200' },
          { label: 'Donations', value: data.totalDonations.toString(), icon: TrendingUp, color: 'bg-orange-500', bg: 'from-orange-50 to-red-100 border-orange-200' },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <Card key={label} className={`bg-gradient-to-br ${bg} rounded-2xl border divine-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">{label}</CardTitle>
              <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-bold text-gray-900">{value}</p>
              {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinancialSummary;
