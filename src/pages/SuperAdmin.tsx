import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Shield, Users, IndianRupee, Edit, Trash2, Save, X,
  TrendingUp, Gift, AlertTriangle, MessageCircle, Send, CheckCircle, XCircle, Loader2
} from 'lucide-react';

export const SuperAdmin: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [persons, setPersons] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'person' | 'donation' | 'expense' | 'collection' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: string; name: string } | null>(null);

  // WhatsApp state
  const [waStatus, setWaStatus] = useState<'unknown' | 'ready' | 'not_ready'>('unknown');
  const [waLoading, setWaLoading] = useState(false);
  const [waSending, setWaSending] = useState(false);
  const [waResult, setWaResult] = useState<{ sent: number; total: number } | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const BOT_URL = 'http://localhost:3001';

  // ALL hooks must be before any conditional returns
  useEffect(() => {
    if (profile?.is_super_admin) {
      loadAll();
    }
  }, [profile]);

  const loadAll = async () => {
    setDataLoading(true);
    const [p, tracker, d, e, c] = await Promise.all([
      supabase.from('persons').select('*').order('created_at', { ascending: false }),
      supabase.from('people_tracker').select('*').order('created_at', { ascending: false }),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_collections').select('*').order('created_at', { ascending: false }),
    ]);
    // Map people_tracker to same shape as persons
    const trackerMapped = (tracker.data || []).map((t: any) => ({
      id: t.id, name: t.name, address: '', phone_number: t.upi_id || '',
      admin_id: t.admin_id, admin_name: t.admin_name,
      amount_paid: t.amount || 0, payment_method: 'handcash',
      created_at: t.created_at, updated_at: t.updated_at || t.created_at,
      receipt_number: null, whatsapp_sent: false,
    }));
    // Merge & sort high to low amount
    const combined = [...(p.data || []), ...trackerMapped].sort(
      (a, b) => Number(b.amount_paid || 0) - Number(a.amount_paid || 0)
    );
    setPersons(combined);
    setDonations(d.data || []);
    setExpenses(e.data || []);
    setCollections(c.data || []);
    setDataLoading(false);
  };

  // Guard checks AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🕉</div>
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/80 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/" replace />;
  if (!profile.is_super_admin) return <Navigate to="/" replace />;

  const handleEdit = (item: any, type: 'person' | 'donation' | 'expense' | 'collection') => {
    setEditItem({ ...item });
    setEditType(type);
  };

  const handleSave = async () => {
    if (!editItem || !editType) return;
    try {
      let error;
      if (editType === 'person') {
        ({ error } = await supabase.from('persons').update({
          name: editItem.name,
          address: editItem.address,
          phone_number: editItem.phone_number,
          amount_paid: Number(editItem.amount_paid),
          payment_method: editItem.payment_method,
        }).eq('id', editItem.id));
      } else if (editType === 'donation') {
        ({ error } = await supabase.from('donations').update({
          donor_name: editItem.donor_name,
          donor_phone: editItem.donor_phone,
          amount: Number(editItem.amount),
          payment_method: editItem.payment_method,
          items_donated: editItem.items_donated,
        }).eq('id', editItem.id));
      } else if (editType === 'expense') {
        ({ error } = await supabase.from('admin_expenses').update({
          purpose: editItem.purpose,
          amount: Number(editItem.amount),
        }).eq('id', editItem.id));
      } else if (editType === 'collection') {
        ({ error } = await supabase.from('admin_collections').update({
          amount: Number(editItem.amount),
        }).eq('id', editItem.id));
      }
      if (error) throw error;
      toast.success('Updated successfully!');
      setEditItem(null);
      setEditType(null);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      let error;
      if (deleteConfirm.type === 'person') {
        ({ error } = await supabase.from('persons').delete().eq('id', deleteConfirm.id));
      } else if (deleteConfirm.type === 'donation') {
        ({ error } = await supabase.from('donations').delete().eq('id', deleteConfirm.id));
      } else if (deleteConfirm.type === 'expense') {
        ({ error } = await supabase.from('admin_expenses').delete().eq('id', deleteConfirm.id));
      } else if (deleteConfirm.type === 'collection') {
        ({ error } = await supabase.from('admin_collections').delete().eq('id', deleteConfirm.id));
      }
      if (error) throw error;
      toast.success('Deleted successfully!');
      setDeleteConfirm(null);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  const checkWaStatus = async () => {
    setWaLoading(true);
    try {
      const res = await fetch(`${BOT_URL}/status`);
      const data = await res.json();
      const ready = data.whatsapp?.includes('ready');
      setWaStatus(ready ? 'ready' : 'not_ready');
      if (!ready) {
        // fetch QR image
        const qrRes = await fetch(`${BOT_URL}/qr`);
        const qrData = await qrRes.json();
        setQrImage(qrData.qr || null);
      } else {
        setQrImage(null);
      }
    } catch {
      setWaStatus('not_ready');
      setQrImage(null);
    } finally {
      setWaLoading(false);
    }
  };

  // Auto-poll every 5 seconds
  useEffect(() => {
    checkWaStatus();
    const interval = setInterval(() => {
      checkWaStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendBulkMessages = async () => {
    setWaSending(true);
    setWaResult(null);
    try {
      const body: any = {};
      if (customMessage.trim()) body.message = customMessage.trim();
      const res = await fetch(`${BOT_URL}/api/send-bulk-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setWaResult({ sent: data.total, total: data.total });
        toast.success(`WhatsApp messages sending to ${data.total} people!`);
        // Reload persons after 10s to show updated sent status
        setTimeout(() => loadAll(), 10000);
        setTimeout(() => loadAll(), 30000);
      } else {
        toast.error(data.error || 'Failed to send messages');
      }
    } catch {
      toast.error('Cannot connect to WhatsApp bot. Make sure node bot.js is running.');
    } finally {
      setWaSending(false);
    }
  };

  const totalPersons = persons.reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const totalDonations = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalCollections = collections.reduce((s, c) => s + Number(c.amount || 0), 0);
  const grandTotal = totalPersons + totalDonations + totalCollections;

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen festival-bg">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Super Admin Banner */}
        <div className="rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
          style={{background:'linear-gradient(135deg,#7c2d12,#c2410c,#ea580c)'}}>
          <div className="absolute right-4 top-4 text-white/10 text-7xl select-none">👑</div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider">Super Admin Portal</p>
              <h1 className="text-xl font-black">Welcome, {profile.name}</h1>
            </div>
          </div>
          <p className="text-white/70 text-sm">Full access — Edit & Delete all records · Depur Ganesh Utsav 2026</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { l: 'Grand Total', v: fmt(grandTotal), c: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { l: 'Members', v: fmt(totalPersons), c: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
            { l: 'Donations', v: fmt(totalDonations), c: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { l: 'Collections', v: fmt(totalCollections), c: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { l: 'Expenses', v: fmt(totalExpenses), c: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          ].map(({ l, v, c, bg }) => (
            <Card key={l} className={`rounded-2xl border ${bg}`}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{l}</p>
                <p className={`text-lg font-black ${c}`}>{v}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="persons">
          <TabsList className="grid w-full grid-cols-5 bg-orange-50 border border-orange-100 rounded-2xl p-1 h-auto mb-6">
            {[
              { v: 'persons', icon: Users, l: `Members (${persons.length})` },
              { v: 'donations', icon: Gift, l: `Donations (${donations.length})` },
              { v: 'collections', icon: TrendingUp, l: `Collections (${collections.length})` },
              { v: 'expenses', icon: IndianRupee, l: `Expenses (${expenses.length})` },
              { v: 'whatsapp', icon: MessageCircle, l: 'WhatsApp' },
            ].map(({ v, icon: Icon, l }) => (
              <TabsTrigger key={v} value={v}
                className="flex items-center gap-1.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 text-xs py-2">
                <Icon className="w-3.5 h-3.5" />{l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* PERSONS */}
          <TabsContent value="persons">
            <div className="space-y-3">
              {persons.map(p => (
                <Card key={p.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div><p className="text-xs text-muted-foreground">Name</p><p className="font-semibold">{p.name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold text-orange-600">{fmt(p.amount_paid || 0)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Method</p>
                          <Badge variant={p.payment_method === 'handcash' ? 'default' : 'secondary'} className="text-xs">
                            {p.payment_method === 'handcash' ? 'Cash' : 'UPI'}
                          </Badge>
                        </div>
                        <div><p className="text-xs text-muted-foreground">Admin</p><p className="text-xs">{p.admin_name}</p></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(p, 'person')}
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ id: p.id, type: 'person', name: p.name })}
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {persons.length === 0 && <p className="text-center text-muted-foreground py-8">No members yet</p>}
            </div>
          </TabsContent>

          {/* DONATIONS */}
          <TabsContent value="donations">
            <div className="space-y-3">
              {donations.map(d => (
                <Card key={d.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div><p className="text-xs text-muted-foreground">Donor</p><p className="font-semibold">{d.donor_name || 'Anonymous'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold text-orange-600">{fmt(d.amount)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Method</p>
                          <Badge variant={d.payment_method === 'handcash' ? 'default' : 'secondary'} className="text-xs">
                            {d.payment_method === 'handcash' ? 'Cash' : d.payment_method === 'items' ? 'Items' : 'UPI'}
                          </Badge>
                        </div>
                        <div><p className="text-xs text-muted-foreground">Admin</p><p className="text-xs">{d.receiving_admin_name}</p></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(d, 'donation')}
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ id: d.id, type: 'donation', name: d.donor_name || 'Anonymous' })}
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {donations.length === 0 && <p className="text-center text-muted-foreground py-8">No donations yet</p>}
            </div>
          </TabsContent>

          {/* COLLECTIONS */}
          <TabsContent value="collections">
            <div className="space-y-3">
              {collections.map(c => (
                <Card key={c.id} className="festival-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div><p className="text-xs text-muted-foreground">Admin</p><p className="font-semibold">{c.admin_name}</p></div>
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold text-orange-600">{fmt(c.amount)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Date</p><p className="text-xs">{new Date(c.created_at).toLocaleDateString('en-IN')}</p></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(c, 'collection')}
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ id: c.id, type: 'collection', name: `Collection by ${c.admin_name}` })}
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {collections.length === 0 && <p className="text-center text-muted-foreground py-8">No collections yet</p>}
            </div>
          </TabsContent>

          {/* EXPENSES */}
          <TabsContent value="expenses">
            <div className="space-y-3">
              {expenses.map(e => (
                <Card key={e.id} className="festival-card border-red-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div><p className="text-xs text-muted-foreground">Purpose</p><p className="font-semibold">{e.purpose}</p></div>
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold text-red-600">{fmt(e.amount)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Admin</p><p className="text-xs">{e.admin_name}</p></div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(e, 'expense')}
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-8 w-8 p-0">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ id: e.id, type: 'expense', name: e.purpose })}
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {expenses.length === 0 && <p className="text-center text-muted-foreground py-8">No expenses yet</p>}
            </div>
          </TabsContent>

          {/* WHATSAPP */}
          <TabsContent value="whatsapp">
            <div className="max-w-xl mx-auto space-y-4">

              {/* Status Card */}
              <Card className="festival-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    WhatsApp Bot Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border">
                    <div className="flex items-center gap-2">
                      {waStatus === 'ready' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {waStatus === 'not_ready' && <XCircle className="w-5 h-5 text-red-500" />}
                      {waStatus === 'unknown' && <div className="w-5 h-5 rounded-full bg-gray-300" />}
                      <span className="text-sm font-medium">
                        {waStatus === 'ready' ? 'Bot is connected ✅' :
                         waStatus === 'not_ready' ? 'Bot not running ❌' :
                         'Status unknown'}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={checkWaStatus} disabled={waLoading}
                      className="rounded-xl text-xs">
                      {waLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check Status'}
                    </Button>
                  </div>

                  {waStatus === 'not_ready' && (
                    <div className="space-y-3">
                      {qrImage ? (
                        <div className="p-4 bg-white border-2 border-green-300 rounded-2xl text-center">
                          <p className="text-sm font-bold text-green-700 mb-3">📱 Scan this QR with WhatsApp</p>
                          <img src={qrImage} alt="WhatsApp QR Code" className="mx-auto w-52 h-52 rounded-xl" />
                          <p className="text-xs text-muted-foreground mt-2">WhatsApp → 3 dots → Linked Devices → Link a Device</p>
                          <p className="text-xs text-green-600 mt-1 animate-pulse">Auto-refreshing every 5 seconds...</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                          <p className="font-semibold mb-1">Bot not running. Start it first:</p>
                          <p>1. Open terminal</p>
                          <p>2. Run: <code className="bg-amber-100 px-1 rounded">cd whatsapp-bot</code></p>
                          <p>3. Run: <code className="bg-amber-100 px-1 rounded">node bot.js</code></p>
                          <p className="mt-1 text-amber-600">QR code will appear here automatically once bot starts.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Send Card */}
              <Card className="festival-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Send className="w-5 h-5 text-orange-600" />
                    Send Payment Info to All Members
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800">
                    <p className="font-semibold mb-1">What will be sent:</p>
                    <p>Each person will receive their own payment details. Only people with phone numbers will receive messages.</p>
                  </div>

                  <div>
                    <Label className="text-sm">Custom Message (optional)</Label>
                    <Textarea
                      placeholder="Leave empty to send default payment info message..."
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                      className="rounded-xl mt-1 text-sm"
                      rows={3}
                    />
                  </div>

                  {waResult && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-800 font-medium">
                        Sending to {waResult.total} people! Refresh page to see updated status below.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={sendBulkMessages}
                    disabled={waSending || waStatus !== 'ready'}
                    className="w-full donation-button"
                  >
                    {waSending
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                      : <><Send className="w-4 h-4 mr-2" />Send WhatsApp Messages to All</>
                    }
                  </Button>

                  {waStatus !== 'ready' && (
                    <p className="text-xs text-center text-muted-foreground">
                      Start the bot and check status before sending
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Sent Status List */}
              <Card className="festival-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-orange-600" />
                    Message Sent Status — All Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {persons.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-4">No members found</p>
                    )}
                    {persons.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-gray-50/50">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.phone_number ? `📱 ${p.phone_number}` : '❌ No phone number'}
                          </p>
                          {p.whatsapp_sent && p.whatsapp_sent_at && (
                            <p className="text-xs text-green-600 mt-0.5">
                              Sent on {new Date(p.whatsapp_sent_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST
                            </p>
                          )}
                        </div>
                        <Badge
                          className={`text-xs flex-shrink-0 ${
                            p.whatsapp_sent
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : p.phone_number
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                          variant="outline"
                        >
                          {p.whatsapp_sent ? '✅ Sent' : p.phone_number ? '⏳ Not Sent' : '❌ No Phone'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-muted-foreground">
                    <span>✅ Sent: {persons.filter(p => p.whatsapp_sent).length}</span>
                    <span>⏳ Pending: {persons.filter(p => !p.whatsapp_sent && p.phone_number).length}</span>
                    <span>❌ No Phone: {persons.filter(p => !p.phone_number).length}</span>
                  </div>
                </CardContent>
              </Card>            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={() => { setEditItem(null); setEditType(null); }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-orange-600" />
              Edit {editType === 'person' ? 'Member' : editType === 'donation' ? 'Donation' : editType === 'expense' ? 'Expense' : 'Collection'}
            </DialogTitle>
          </DialogHeader>
          {editItem && editType === 'person' && (
            <div className="space-y-3">
              <div><Label>Name</Label>
                <Input value={editItem.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Address</Label>
                <Input value={editItem.address || ''} onChange={e => setEditItem({...editItem, address: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Phone</Label>
                <Input value={editItem.phone_number || ''} onChange={e => setEditItem({...editItem, phone_number: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Amount Paid (₹)</Label>
                <Input type="number" value={editItem.amount_paid || ''} onChange={e => setEditItem({...editItem, amount_paid: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Payment Method</Label>
                <select value={editItem.payment_method || 'handcash'} onChange={e => setEditItem({...editItem, payment_method: e.target.value})}
                  className="w-full px-3 py-2 border border-input bg-background rounded-xl text-sm mt-1">
                  <option value="handcash">Hand Cash</option>
                  <option value="phonepay">PhonePe / UPI</option>
                </select>
              </div>
            </div>
          )}
          {editItem && editType === 'donation' && (
            <div className="space-y-3">
              <div><Label>Donor Name</Label>
                <Input value={editItem.donor_name || ''} onChange={e => setEditItem({...editItem, donor_name: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Phone</Label>
                <Input value={editItem.donor_phone || ''} onChange={e => setEditItem({...editItem, donor_phone: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Amount (₹)</Label>
                <Input type="number" value={editItem.amount || ''} onChange={e => setEditItem({...editItem, amount: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Items Donated</Label>
                <Input value={editItem.items_donated || ''} onChange={e => setEditItem({...editItem, items_donated: e.target.value})} className="rounded-xl mt-1" /></div>
            </div>
          )}
          {editItem && editType === 'expense' && (
            <div className="space-y-3">
              <div><Label>Purpose</Label>
                <Input value={editItem.purpose || ''} onChange={e => setEditItem({...editItem, purpose: e.target.value})} className="rounded-xl mt-1" /></div>
              <div><Label>Amount (₹)</Label>
                <Input type="number" value={editItem.amount || ''} onChange={e => setEditItem({...editItem, amount: e.target.value})} className="rounded-xl mt-1" /></div>
            </div>
          )}
          {editItem && editType === 'collection' && (
            <div className="space-y-3">
              <div><Label>Amount (₹)</Label>
                <Input type="number" value={editItem.amount || ''} onChange={e => setEditItem({...editItem, amount: e.target.value})} className="rounded-xl mt-1" /></div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 donation-button">
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
            <Button variant="outline" onClick={() => { setEditItem(null); setEditType(null); }} className="flex-1 rounded-xl">
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>"{deleteConfirm?.name}"</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleDelete} variant="destructive" className="flex-1 rounded-xl">
              <Trash2 className="w-4 h-4 mr-2" />Yes, Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
