import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogData {
  activityType: 'donation_received' | 'expense_added' | 'collection_added' | 'schedule_created' | 'schedule_updated' | 'announcement_created' | 'person_added' | 'person_updated' | 'login' | 'logout';
  description: string;
  metadata?: Record<string, any>;
  tableAffected?: string;
  recordId?: string;
  amount?: number;
}

export const useActivityLogger = () => {
  const { user, profile } = useAuth();

  const logActivity = async (data: ActivityLogData) => {
    if (!user || !profile) return null;

    try {
      const { data: result, error } = await supabase.rpc('log_activity', {
        admin_id_param: user.id,
        admin_name_param: profile.name,
        activity_type_param: data.activityType,
        description_param: data.description,
        metadata_param: data.metadata || {},
        table_affected_param: data.tableAffected,
        record_id_param: data.recordId,
        amount_param: data.amount
      });

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      // Update admin performance stats
      await supabase.rpc('update_admin_performance_stats', {
        admin_id_param: user.id,
        admin_name_param: profile.name
      });

      return result;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  };

  return { logActivity };
};