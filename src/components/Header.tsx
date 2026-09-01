import React, { useState } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, IndianRupee, Home, Users, Gift, Menu, X, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import lordGaneshImage from '@/assets/image.png';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/donations', label: 'Collections', icon: IndianRupee },
    { to: '/donors', label: 'Donors', icon: Gift },
    { to: '/people', label: 'People', icon: Users },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-orange-400 shadow-md group-hover:border-orange-500 transition-colors">
                <img src={lordGaneshImage} alt="Ganesh" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">🕉</span>
              </div>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold gradient-text leading-tight">Ganesh Chaturthi 2026 · Depur Village</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {profile?.is_super_admin && (
              <Link to="/super-admin"
                className={`nav-link ${location.pathname === '/super-admin' ? 'active' : ''}`}
                style={location.pathname !== '/super-admin' ? {color:'#c2410c',fontWeight:700} : {}}>
                <Shield className="w-4 h-4" />
                Super Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-800">{profile.name.split(' ')[0]}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="donation-button hidden sm:flex">
                  Admin Login
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-orange-600" /> : <Menu className="w-5 h-5 text-orange-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-orange-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`nav-link w-full ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-orange-100">
              {user && profile ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-orange-800">{profile.name}</span>
                  <Button variant="outline" size="sm" onClick={signOut}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl">
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="donation-button w-full">Admin Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
