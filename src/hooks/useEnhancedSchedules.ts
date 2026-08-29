import { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from './useActivityLogger';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  organizer?: string;
  admin_id: string;
  admin_name: string;
  priority: number;
  is_active: boolean;
  attendees_expected?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useEnhancedSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { logActivity } = useActivityLogger();

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setSchedules(data as ScheduleEvent[] || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (schedule: Omit<ScheduleEvent, 'id' | 'admin_id' | 'admin_name' | 'created_at' | 'updated_at'>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .insert({
          ...schedule,
          admin_id: user.id,
          admin_name: profile.name,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: 'schedule_created',
        description: `Created schedule: ${schedule.title} on ${schedule.event_date}`,
        tableAffected: 'schedule_events',
        recordId: data.id,
        metadata: {
          location: schedule.location,
          organizer: schedule.organizer,
          priority: schedule.priority
        }
      });

      await fetchSchedules();
      return data;
    } catch (error) {
      console.error('Error adding schedule:', error);
      return null;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ScheduleEvent>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: 'schedule_updated',
        description: `Updated schedule: ${data.title}`,
        tableAffected: 'schedule_events',
        recordId: data.id,
        metadata: updates
      });

      await fetchSchedules();
      return data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  };

  const getUpcomingSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(schedule => 
      schedule.is_active && 
      schedule.event_date >= today &&
      schedule.status === 'scheduled'
    );
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    addSchedule,
    updateSchedule,
    getUpcomingSchedules,
    refreshSchedules: fetchSchedules
  };
};