import React, { useState } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowLeft, Shield } from 'lucide-react';
import lordGaneshImage from '@/assets/image.png';

export const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  if (user && !loading) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(form.email, form.password);
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🕉</div>
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/80 shadow-lg mx-auto mb-3">
              <img src={lordGaneshImage} alt="Ganesh" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/80 text-sm mt-0.5">Ganesh Chaturthi 2026 · Depur Village  · Depur Village</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5">
              <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700">
                Access restricted to authorized Ganesh Chaturthi 2026 · Depur Village administrators only.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email" type="email" placeholder="Enter your admin email"
                    className="pl-10 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password" type="password" placeholder="Enter your password"
                    className="pl-10 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full donation-button mt-2" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
                ) : (
                  '🕉 Sign In to Admin Portal'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Ganpati Bappa Morya 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
