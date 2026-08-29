import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/supabase';
import { Megaphone } from 'lucide-react';

const ScrollingAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });
      if (!error) setAnnouncements(data || []);
    } catch (_) {}
  };

  if (announcements.length === 0) return null;

  const tickerText = announcements.map(a => `🕉 ${a.title}: ${a.content}`).join('   ✦   ');

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 text-white py-2 overflow-hidden relative">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/20 px-3 py-0.5 rounded-r-full">
          <Megaphone className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <p className="ticker-text text-sm font-medium">{tickerText}</p>
        </div>
      </div>
    </div>
  );
};

export default ScrollingAnnouncements;
