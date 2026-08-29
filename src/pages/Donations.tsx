import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddCollectionModal } from '@/components/AddCollectionModal';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddBookcashModal } from '@/components/AddBookcashModal';
import { AddDonorModal } from '@/components/AddDonorModal';
import { PaymentReceipt, ReceiptData } from '@/components/PaymentReceipt';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import {
  IndianRupee, TrendingUp, Calendar, Users, Search,
  ArrowLeft, Download, Plus, Minus, Wallet, Receipt, Gift, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PHONES: Record<string, string> = {
  'Mukkamalla Baskar Reddy': '8985011137',
  'Kukkapalli Srinivasulu Naidu': '9441843101',
  'Siddavatam Venkata Ramanareddy': '9441443925',
};

export const Donations: React.FC = () => {
  const { profile } = useAuth();
  const [persons, setPersons] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [bookcash, setBookcash] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isBookcashOpen, setIsBookcashOpen] = useState(false);
  const [isDonorOpen, setIsDonorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, d, c, e, b] = await Promise.all([
        supabase.from('persons').select('*').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_collections').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('bookcash').select('*').order('created_at', { ascending: false }),
      ]);
      setPersons(p.data || []);
      setDonations(d.data || []);
      setCollections(c.data || []);
      setExpenses(e.data || []);
      setBookcash(b.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const totalPersons = persons.reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const totalDonations = donations.reduce((s, d) => s + Number(d.amount), 0);
  const totalCollections = collections.reduce((s, c) => s + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalBookcash = bookcash.reduce((s, b) => s + Number(b.amount), 0);
  const grandTotal = totalPersons + totalDonations + totalCollections;
  const available = grandTotal - totalExpenses;

  const adminMap = new Map<string, any>();
  collections.forEach(c => {
    if (!adminMap.has(c.admin_id)) adminMap.set(c.admin_id, { name: c.admin_name, collected: 0, expenses: 0 });
    adminMap.get(c.admin_id).collected += Number(c.amount);
  });
  expenses.forEach(e => {
    if (!adminMap.has(e.admin_id)) adminMap.set(e.admin_id, { name: e.admin_name, collected: 0, expenses: 0 });
    adminMap.get(e.admin_id).expenses += Number(e.amount);
  });

  const dailyMap: Record<string, number> = {};
  donations.forEach(d => {
    const date = new Date(d.created_at).toLocaleDateString('en-IN');
    dailyMap[date] = (dailyMap[date] || 0) + Number(d.amount);
  });

  const filteredPersons = persons.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.admin_name || '').toLowerCase().includes(q) ||
      (p.phone_number || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.payment_method || '').toLowerCase().includes(q) ||
      (p.amount_paid || '').toString().includes(q)
    );
  });

  const showPersonReceipt = (p: any) => {
    setReceiptData({
      receiptNumber: p.receipt_number || `DGU-2026-${p.id.slice(0,5).toUpperCase()}`,
      donorName: p.name,
      donorPhone: p.phone_number,
      amount: p.amount_paid || 0,
      paymentMethod: p.payment_method || 'handcash',
      adminName: p.admin_name,
      date: p.created_at,
      type: 'member',
      address: p.address,
    });
  };

  const showDonationReceipt = (d: any) => {
    setReceiptData({
      receiptNumber: d.receipt_number || `DGU-2026-${d.id.slice(0,5).toUpperCase()}`,
      donorName: d.donor_name || 'Anonymous',
      donorPhone: d.donor_phone,
      amount: d.amount,
      paymentMethod: d.payment_method,
      adminName: d.receiving_admin_name,
      date: d.created_at,
      type: 'donation',
      personName: d.person_name,
      itemsDonated: d.items_donated,
    });
  };

  const exportPDF = () => {
    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const fmtMethod = (m: string) => {
      if (m === 'handcash' || m === 'cash') return 'Cash';
      if (['phonepay','upi','phonepay/upi'].includes(m)) return 'UPI';
      return m || '-';
    };

    const grandTotal = totalPersons + totalDonations + totalCollections;
    const available = grandTotal - totalExpenses;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    const personsRows = persons.map((p, i) => `
      <tr class="${i%2===0?'even':''}">
        <td>${i+1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.address || '-'}</td>
        <td>${p.phone_number || '-'}</td>
        <td class="amt">${fmt(p.amount_paid || 0)}</td>
        <td><span class="badge ${p.payment_method === 'handcash' ? 'cash' : 'upi'}">${fmtMethod(p.payment_method)}</span></td>
        <td>${p.admin_name}</td>
        <td>${fmtDate(p.created_at)}</td>
      </tr>`).join('');

    const donationsRows = donations.map((d, i) => `
      <tr class="${i%2===0?'even':''}">
        <td>${i+1}</td>
        <td><strong>${d.donor_name || 'Anonymous'}</strong></td>
        <td>${d.donor_phone || '-'}</td>
        <td>${d.person_name || '-'}</td>
        <td>${d.items_donated || '-'}</td>
        <td class="amt">${fmt(d.amount)}</td>
        <td><span class="badge ${d.payment_method === 'handcash' ? 'cash' : 'upi'}">${fmtMethod(d.payment_method)}</span></td>
        <td>${d.receiving_admin_name}</td>
        <td>${fmtDate(d.created_at)}</td>
      </tr>`).join('');

    const expensesRows = expenses.map((e, i) => `
      <tr class="${i%2===0?'even':''}">
        <td>${i+1}</td>
        <td><strong>${e.purpose}</strong></td>
        <td class="amt red">${fmt(e.amount)}</td>
        <td>${e.admin_name}</td>
        <td>${fmtDate(e.created_at)}</td>
      </tr>`).join('');

    const collectionsRows = collections.map((c, i) => `
      <tr class="${i%2===0?'even':''}">
        <td>${i+1}</td>
        <td>${c.admin_name}</td>
        <td class="amt">${fmt(c.amount)}</td>
        <td>${fmtDate(c.created_at)}</td>
      </tr>`).join('');

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>Depur Ganesh Utsav 2026 - Financial Report</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Poppins',sans-serif;background:#fff;color:#1c1917;font-size:12px;}

/* Header */
.report-header{background:linear-gradient(135deg,#c2410c,#ea580c,#f97316,#fbbf24);padding:28px 32px;color:#fff;text-align:center;}
.report-header .om{font-size:28px;margin-bottom:6px;}
.report-header h1{font-size:22px;font-weight:800;letter-spacing:1px;}
.report-header p{font-size:11px;opacity:0.85;margin-top:3px;}
.report-header .date{font-size:10px;opacity:0.7;margin-top:6px;}

/* Summary */
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px 32px;background:#fff7ed;border-bottom:2px solid #fed7aa;}
.sum-box{background:#fff;border-radius:10px;padding:12px;text-align:center;border:1px solid #fde68a;}
.sum-box .label{font-size:9px;color:#78716c;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
.sum-box .value{font-size:18px;font-weight:800;margin-top:3px;}
.sum-box.green .value{color:#16a34a;}
.sum-box.red .value{color:#dc2626;}
.sum-box.blue .value{color:#2563eb;}
.sum-box.orange .value{color:#ea580c;}

/* Section */
.section{padding:20px 32px;}
.section-title{font-size:14px;font-weight:800;color:#ea580c;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #fed7aa;display:flex;justify-content:space-between;align-items:center;}
.section-title .total{font-size:13px;color:#1c1917;background:#fff7ed;padding:3px 10px;border-radius:6px;border:1px solid #fed7aa;}

/* Table */
table{width:100%;border-collapse:collapse;font-size:11px;}
th{background:#ea580c;color:#fff;padding:8px 10px;text-align:left;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;}
td{padding:7px 10px;border-bottom:1px solid #fef3c7;vertical-align:middle;}
tr.even td{background:#fffbf5;}
.amt{font-weight:700;color:#ea580c;text-align:right;}
.red{color:#dc2626 !important;}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;}
.badge.cash{background:#dcfce7;color:#16a34a;}
.badge.upi{background:#dbeafe;color:#2563eb;}

/* Footer */
.footer{background:#fff7ed;border-top:2px solid #fed7aa;padding:16px 32px;text-align:center;}
.footer p{font-size:10px;color:#78716c;}
.footer .bless{font-size:13px;font-weight:800;color:#ea580c;margin-top:4px;}

@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{margin:0;size:A4;}
  .section{page-break-inside:avoid;}
}
</style>
</head><body>

<div class="report-header">
  <div class="om">🕉</div>
  <h1>DEPUR GANESH UTSAV 2026</h1>
  <p>Depur Village, Atmakur Mandal, Nellore District, Andhra Pradesh — 524322</p>
  <p>August 19 – 28, 2026 | Complete Financial Report</p>
  <div class="date">Generated on: ${new Date().toLocaleString('en-IN')}</div>
</div>

<div class="summary">
  <div class="sum-box green">
    <div class="label">Total Collected</div>
    <div class="value">${fmt(grandTotal)}</div>
  </div>
  <div class="sum-box red">
    <div class="label">Total Expenses</div>
    <div class="value">${fmt(totalExpenses)}</div>
  </div>
  <div class="sum-box blue">
    <div class="label">Available Balance</div>
    <div class="value">${fmt(available)}</div>
  </div>
  <div class="sum-box orange">
    <div class="label">Book Cash</div>
    <div class="value">${fmt(totalBookcash)}</div>
  </div>
</div>

${persons.length > 0 ? `
<div class="section">
  <div class="section-title">
    Member Contributions (${persons.length} members)
    <span class="total">Total: ${fmt(totalPersons)}</span>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Name</th><th>Address</th><th>Phone</th>
      <th style="text-align:right">Amount</th><th>Method</th><th>Admin</th><th>Date</th>
    </tr></thead>
    <tbody>${personsRows}</tbody>
    <tfoot><tr>
      <td colspan="4" style="font-weight:700;text-align:right;padding:8px 10px;">Grand Total</td>
      <td class="amt" style="font-size:13px">${fmt(totalPersons)}</td>
      <td colspan="3"></td>
    </tr></tfoot>
  </table>
</div>` : ''}

${donations.length > 0 ? `
<div class="section">
  <div class="section-title">
    Donations (${donations.length} entries)
    <span class="total">Total: ${fmt(totalDonations)}</span>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Donor Name</th><th>Phone</th><th>For</th><th>Items</th>
      <th style="text-align:right">Amount</th><th>Method</th><th>Admin</th><th>Date</th>
    </tr></thead>
    <tbody>${donationsRows}</tbody>
    <tfoot><tr>
      <td colspan="5" style="font-weight:700;text-align:right;padding:8px 10px;">Grand Total</td>
      <td class="amt" style="font-size:13px">${fmt(totalDonations)}</td>
      <td colspan="3"></td>
    </tr></tfoot>
  </table>
</div>` : ''}

${collections.length > 0 ? `
<div class="section">
  <div class="section-title">
    Admin Collections (${collections.length} entries)
    <span class="total">Total: ${fmt(totalCollections)}</span>
  </div>
  <table>
    <thead><tr><th>#</th><th>Admin</th><th style="text-align:right">Amount</th><th>Date</th></tr></thead>
    <tbody>${collectionsRows}</tbody>
    <tfoot><tr>
      <td colspan="2" style="font-weight:700;text-align:right;padding:8px 10px;">Grand Total</td>
      <td class="amt" style="font-size:13px">${fmt(totalCollections)}</td>
      <td></td>
    </tr></tfoot>
  </table>
</div>` : ''}

${expenses.length > 0 ? `
<div class="section">
  <div class="section-title">
    Expense History (${expenses.length} entries)
    <span class="total" style="color:#dc2626;border-color:#fecaca;background:#fef2f2">Total: ${fmt(totalExpenses)}</span>
  </div>
  <table>
    <thead><tr><th>#</th><th>Purpose</th><th style="text-align:right">Amount</th><th>Admin</th><th>Date</th></tr></thead>
    <tbody>${expensesRows}</tbody>
    <tfoot><tr>
      <td colspan="2" style="font-weight:700;text-align:right;padding:8px 10px;">Grand Total</td>
      <td class="amt red" style="font-size:13px">${fmt(totalExpenses)}</td>
      <td colspan="2"></td>
    </tr></tfoot>
  </table>
</div>` : ''}

<div class="footer">
  <p>This is a computer-generated financial report for Depur Ganesh Utsav 2026.</p>
  <div class="bless">🙏 Ganpati Bappa Morya! 🙏</div>
</div>

<script>
  window.onload = function() {
    document.title = 'Depur-Ganesh-Utsav-2026-Report-${new Date().toISOString().split('T')[0]}';
    setTimeout(function(){ window.print(); }, 800);
  };
</script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="min-h-screen festival-bg">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Button variant="outline" onClick={() => navigate('/')}
              className="mb-3 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Collection & Expense Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Ganesh Chaturthi 2026 · Depur Village  · Depur Village</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile && (
              <>
                <Button onClick={() => navigate('/people')} variant="outline" size="sm" className="rounded-xl border-orange-200 text-orange-600">
                  <Users className="w-4 h-4 mr-1.5" />People
                </Button>
                <Button onClick={() => navigate('/donors')} variant="outline" size="sm" className="rounded-xl border-orange-200 text-orange-600">
                  <Gift className="w-4 h-4 mr-1.5" />Donors
                </Button>
                <Button onClick={() => setIsDonorOpen(true)} size="sm" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                  <Gift className="w-4 h-4 mr-1.5" />Add Donor
                </Button>
                <Button onClick={() => setIsCollectionOpen(true)} size="sm" className="donation-button">
                  <Plus className="w-4 h-4 mr-1.5" />Add Collection
                </Button>
                <Button onClick={() => setIsExpenseOpen(true)} variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                  <Minus className="w-4 h-4 mr-1.5" />Add Expense
                </Button>
                <Button onClick={() => setIsBookcashOpen(true)} size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-1.5" />Book Cash
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={exportPDF} className="rounded-xl">
              <Download className="w-4 h-4 mr-1.5" />Export PDF
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total Collected', value: `₹${grandTotal}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: 'Total Expenses', value: `₹${totalExpenses}`, icon: Receipt, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            { label: 'Available', value: `₹${available}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', span: true },
            { label: 'Admin Collections', value: `₹${totalCollections}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { label: 'Book Cash', value: `₹${totalBookcash}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          ].map(({ label, value, icon: Icon, color, bg, span }) => (
            <Card key={label} className={`rounded-2xl border ${bg} ${span ? 'col-span-2 lg:col-span-1' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-600">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin summary */}
        {adminMap.size > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold gradient-text mb-4">Admin-wise Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(adminMap.values()).map((a, i) => (
                <Card key={i} className="festival-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{a.name}</CardTitle>
                    {ADMIN_PHONES[a.name] && (
                      <p className="text-xs text-orange-600">📞 {ADMIN_PHONES[a.name]}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Collected</span>
                        <span className="font-bold text-green-600">₹{a.collected}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="font-bold text-red-600">₹{a.expenses}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-1.5">
                        <span className="font-medium">Available</span>
                        <span className="font-bold text-blue-600">₹{a.collected - a.expenses}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Daily reports */}
        {Object.keys(dailyMap).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold gradient-text mb-4">Daily Collection Reports</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(dailyMap)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, amount]) => (
                  <Card key={date} className="festival-card text-center">
                    <CardContent className="py-4 px-3">
                      <Calendar className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground mb-1">{date}</p>
                      <p className="text-lg font-bold text-orange-600">₹{amount}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Member contributions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold gradient-text mb-4">
            Member Contributions <span className="text-base font-normal text-muted-foreground">(₹{totalPersons})</span>
          </h2>
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by name, phone, admin, amount..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 rounded-2xl border-orange-200 focus:border-orange-400" />
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersons.map(p => (
                <Card key={p.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{p.name}</p>
                      {p.receipt_number && (
                        <span className="text-xs text-orange-500 font-mono">{p.receipt_number}</span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-orange-600">₹{p.amount_paid || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <Badge variant={p.payment_method === 'handcash' ? 'default' : 'secondary'} className="text-xs">
                          {p.payment_method === 'handcash' ? 'Cash' : 'UPI'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Admin</span>
                        <span className="text-xs text-right">{p.admin_name}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => showPersonReceipt(p)}
                      className="w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />Download Receipt
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Donations list */}
        {donations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold gradient-text mb-4">
              Donations <span className="text-base font-normal text-muted-foreground">(₹{totalDonations})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.filter(d => {
                if (!searchTerm) return true;
                const q = searchTerm.toLowerCase();
                return (
                  (d.donor_name || '').toLowerCase().includes(q) ||
                  (d.person_name || '').toLowerCase().includes(q) ||
                  (d.receiving_admin_name || '').toLowerCase().includes(q) ||
                  (d.donor_phone || '').toLowerCase().includes(q) ||
                  (d.amount || '').toString().includes(q)
                );
              }).map(d => (
                <Card key={d.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold">{d.donor_name || 'Anonymous'}</p>
                      {d.receipt_number && (
                        <span className="text-xs text-orange-500 font-mono">{d.receipt_number}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">→ {d.person_name}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-orange-600">₹{d.amount}</span>
                      <Badge variant={d.payment_method === 'handcash' ? 'default' : 'secondary'} className="text-xs">
                        {d.payment_method === 'handcash' ? 'Cash' : 'UPI'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {d.receiving_admin_name} · {new Date(d.created_at).toLocaleDateString('en-IN')}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => showDonationReceipt(d)}
                      className="w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />Download Receipt
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Expenses */}
        {expenses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold gradient-text mb-4">Expense History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map(e => (
                <Card key={e.id} className="festival-card border-red-100">
                  <CardContent className="p-4">
                    <p className="font-bold text-red-600 text-lg mb-1">₹{e.amount}</p>
                    <p className="text-sm font-medium mb-2">{e.purpose}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.admin_name} · {new Date(e.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {collections.length === 0 && donations.length === 0 && persons.length === 0 && (
          <Card className="festival-card">
            <CardContent className="text-center py-16">
              <div className="text-5xl mb-4">🕉</div>
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground text-sm">Collections will appear here once added by admins.</p>
            </CardContent>
          </Card>
        )}

        <AddCollectionModal open={isCollectionOpen} onOpenChange={setIsCollectionOpen} onSuccess={loadAll} />
        <AddExpenseModal open={isExpenseOpen} onOpenChange={setIsExpenseOpen} onSuccess={loadAll} />
        <AddBookcashModal open={isBookcashOpen} onOpenChange={setIsBookcashOpen} onBookcashAdded={loadAll} />
        <AddDonorModal isOpen={isDonorOpen} onClose={() => setIsDonorOpen(false)} onSuccess={loadAll} />

        {receiptData && (
          <PaymentReceipt
            isOpen={!!receiptData}
            onClose={() => setReceiptData(null)}
            data={receiptData}
          />
        )}
      </div>
    </div>
  );
};
