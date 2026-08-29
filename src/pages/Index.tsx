import React from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Header } from '@/components/Header';
import { Home } from '@/pages/Home';
import { AdminDashboard } from '@/components/AdminDashboard';
import CurrentTime from '@/components/CurrentTime';
import ScrollingAnnouncements from '@/components/ScrollingAnnouncements';
import AnniversaryPopup from '@/components/AnniversaryPopup';

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🕉</div>
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/80 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnniversaryPopup />
      <ScrollingAnnouncements />
      <Header />

      {user && profile ? (
        <div className="bg-orange-50/40 border-b border-orange-100 px-4 py-2">
          <div className="container mx-auto">
            <CurrentTime />
          </div>
        </div>
      ) : null}

      <main>
        {user && profile ? (
          <div className="container mx-auto px-4 py-8">
            <AdminDashboard />
          </div>
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
};

export default Index;
