import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PersonCard } from '@/components/PersonCard';
import { ContactInfo } from '@/components/ContactInfo';
import FinancialSummary from '@/components/FinancialSummary';
import ScheduleManagement from '@/components/ScheduleManagement';
import { DonorInformation } from '@/components/DonorInformation';
import { LoginModal } from '@/components/LoginModal';
import FestivalCountdown from '@/components/FestivalCountdown';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types/supabase';
import lordGaneshImage from '@/assets/lord-ganesh.jpg';

export const Home = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => { loadPersons(); }, []);

  const loadPersons = async () => {
    try {
      const { data, error } = await supabase
        .from('persons').select('*').order('created_at', { ascending: false });
      if (!error) setPersons((data || []) as Person[]);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filteredPersons = persons.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen festival-bg">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex flex-col justify-center"
        style={{background:'linear-gradient(160deg,#7c2d12 0%,#b45309 20%,#ea580c 45%,#f97316 70%,#fbbf24 100%)'}}>

        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
            style={{background:'radial-gradient(circle,#fff 0%,transparent 70%)'}} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
            style={{background:'radial-gradient(circle,#fef3c7 0%,transparent 70%)'}} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{background:'radial-gradient(circle,#fff 0%,transparent 70%)'}} />
          {/* OM symbols */}
          {[
            'top-6 left-6 text-5xl opacity-10',
            'top-10 right-10 text-4xl opacity-8',
            'bottom-20 left-16 text-6xl opacity-8',
            'bottom-8 right-8 text-5xl opacity-10',
            'top-1/2 left-4 text-3xl opacity-6',
            'top-1/3 right-6 text-3xl opacity-6',
          ].map((cls, i) => (
            <div key={i} className={`absolute ${cls} text-white select-none font-bold`}>🕉</div>
          ))}
          {/* Decorative rings */}
          <div className="absolute top-20 right-20 w-40 h-40 rounded-full border border-white/10" />
          <div className="absolute top-16 right-16 w-52 h-52 rounded-full border border-white/5" />
          <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full border border-white/10" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Admin login button removed - already in Header */}

          <div className="flex flex-col items-center text-center">
            {/* Ganesh image with premium glow */}
            <div className="relative mb-8">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full scale-150 opacity-30 animate-pulse"
                style={{background:'radial-gradient(circle,#fbbf24 0%,transparent 70%)'}} />
              <div className="absolute inset-0 rounded-full scale-125 opacity-20"
                style={{background:'radial-gradient(circle,#fff 0%,transparent 70%)'}} />
              {/* Image */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl"
                style={{border:'4px solid rgba(255,255,255,0.7)',boxShadow:'0 0 60px rgba(251,191,36,0.5),0 20px 60px rgba(0,0,0,0.4)'}}>
                <img src={lordGaneshImage} alt="Lord Ganesh" className="w-full h-full object-cover object-top" />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full text-xs font-black shadow-xl"
                style={{background:'linear-gradient(90deg,#f59e0b,#fbbf24)',color:'#7c2d12',boxShadow:'0 4px 16px rgba(245,158,11,0.5)'}}>
                🕉 Ganpati Bappa Morya 🕉
              </div>
            </div>

            {/* Main title */}
            <div className="mb-6">
              <div className="inline-block bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <span className="text-white/80 text-xs font-semibold uppercase tracking-[3px]">
                  Depur Village · Nellore District
                </span>
              </div>
              <h1 className="font-cinzel font-black text-white leading-tight mb-3"
                style={{fontSize:'clamp(2rem,6vw,4rem)',textShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
                Ganesh Chaturthi
              </h1>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/50" />
                <span className="font-cinzel font-black text-amber-200 text-5xl sm:text-6xl"
                  style={{textShadow:'0 0 40px rgba(251,191,36,0.8),0 4px 20px rgba(0,0,0,0.4)'}}>
                  2026
                </span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/50" />
              </div>
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>Ramalayam, Depuru Village, Atmakur Mandal, Nellore — 524322</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="w-full max-w-lg mb-6">
              <FestivalCountdown />
            </div>

            {/* Festival dates + stats row */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-white/60 text-[10px] uppercase tracking-[2px] mb-1">Festival Dates</p>
                <p className="text-white font-black text-base">Sept 14 – 16, 2026</p>
                <p className="text-white/50 text-[10px] mt-0.5">3 Days of Celebration</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-white/60 text-[10px] uppercase tracking-[2px] mb-1">Location</p>
                <p className="text-white font-black text-base">Depur Village</p>
                <p className="text-white/50 text-[10px] mt-0.5">Andhra Pradesh</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-white/60 text-[10px] uppercase tracking-[2px] mb-1">Year</p>
                <p className="text-amber-200 font-black text-base">2026</p>
                <p className="text-white/50 text-[10px] mt-0.5">Grand Celebration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="hsl(30,40%,96%)" fillOpacity="1"/>
          </svg>
        </div>
      </section>

      {/* Financial Overview */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="om-divider"><span className="text-orange-400 text-xl">🕉</span></div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Financial Overview</h2>
            <p className="text-muted-foreground text-sm">Live collection & expense tracking</p>
          </div>
          <FinancialSummary />
        </div>
      </section>

      {/* Schedule */}
      <section className="py-12 sm:py-16 px-4 bg-orange-50/60">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="om-divider"><span className="text-orange-400 text-xl">🕉</span></div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Festival Schedule</h2>
            <p className="text-muted-foreground text-sm">Daily events & pooja timings</p>
          </div>
          <ScheduleManagement />
        </div>
      </section>

      {/* Donors */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="om-divider"><span className="text-orange-400 text-xl">🕉</span></div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Our Generous Donors</h2>
            <p className="text-muted-foreground text-sm">Blessed contributors to our festival</p>
          </div>
          <DonorInformation />
        </div>
      </section>

      {/* Community Members */}
      <section className="py-12 sm:py-16 px-4 bg-orange-50/60">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="om-divider"><span className="text-orange-400 text-xl">🕉</span></div>
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Community Members</h2>
            <p className="text-muted-foreground text-sm">Festival participants & their contributions</p>
          </div>

          <div className="relative mb-8 max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input type="text" placeholder="Search by name or admin..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 rounded-2xl border-orange-200 focus:border-orange-400 bg-white shadow-sm" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-44 shadow-sm" />)}
            </div>
          ) : filteredPersons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPersons.map(person => <PersonCard key={person.id} person={person} />)}
            </div>
          ) : persons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🙏</div>
              <h3 className="text-xl font-semibold mb-2 text-orange-800">No Members Listed Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                The admin team will add community members soon.
              </p>
              <p className="text-orange-500 font-semibold mt-4">Ganpati Bappa Morya! 🎉</p>
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground text-sm">Try a different search term.</p>
            </div>
          )}
        </div>
      </section>

      <ContactInfo />

      {/* Mobile login button removed - Header handles this */}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
