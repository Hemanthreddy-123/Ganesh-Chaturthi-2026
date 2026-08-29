import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateLoginTime: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };


  const signIn = async (email: string, password: string) => {
    // Authorized admin emails
    const authorizedEmails = [
      'vamsikrishna.reddy@depur-ganesh.com',
      'madhu.reddy@depur-ganesh.com',
      'balaji.ravilla@depur-ganesh.com',
      'balaji.kukkapalli@depur-ganesh.com',
    ];

    if (!authorizedEmails.includes(email)) {
      toast({
        title: "Access Denied",
        description: "Only authorized temple administrators can access this system.",
        variant: "destructive",
      });
      return { error: { message: "Unauthorized email address" } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });

      // Log the login activity
      setTimeout(async () => {
        if (user && profile) {
          await supabase.rpc('log_activity', {
            admin_id_param: user.id,
            admin_name_param: profile.name,
            activity_type_param: 'login',
            description_param: `Admin ${profile.name} logged in`
          });

          await supabase.rpc('update_admin_performance_stats', {
            admin_id_param: user.id,
            admin_name_param: profile.name
          });
        }

        updateLoginTime();
      }, 100);
    }

    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Even if there's a session error, consider it a successful logout
      if (error && !error.message.includes('session')) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear local state
        setUser(null);
        setSession(null);
        setProfile(null);
        toast({
          title: "Success",
          description: "Successfully signed out!",
        });
      }
    } catch (error: any) {
      // Force logout even if there's an error
      setUser(null);
      setSession(null);
      setProfile(null);
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    }
  };

  const updateLoginTime = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating login time:', error);
      }
    } catch (error) {
      console.error('Error updating login time:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    updateLoginTime
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};