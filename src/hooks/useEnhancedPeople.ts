import { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from './useActivityLogger';

export interface PersonRecord {
  id: string;
  name: string;
  upi_id?: string;
  total_donations: number;
  admin_id: string;
  admin_name: string;
  preferred_payment_method: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEnhancedPeople = () => {
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { logActivity } = useActivityLogger();

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPeople(data as PersonRecord[] || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (person: Omit<PersonRecord, 'id' | 'admin_id' | 'admin_name' | 'created_at' | 'updated_at'>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('people_management')
        .insert({
          ...person,
          admin_id: user.id,
          admin_name: profile.name,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: 'person_added',
        description: `Added new person: ${person.name}`,
        tableAffected: 'people_management',
        recordId: data.id,
        metadata: {
          upi_id: person.upi_id,
          payment_method: person.preferred_payment_method,
          total_donations: person.total_donations
        }
      });

      await fetchPeople();
      return data;
    } catch (error) {
      console.error('Error adding person:', error);
      return null;
    }
  };

  const updatePerson = async (id: string, updates: Partial<PersonRecord>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('people_management')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: 'person_updated',
        description: `Updated person: ${data.name}`,
        tableAffected: 'people_management',
        recordId: data.id,
        metadata: updates
      });

      await fetchPeople();
      return data;
    } catch (error) {
      console.error('Error updating person:', error);
      return null;
    }
  };

  const updateDonationStats = async (personId: string, donationAmount: number) => {
    try {
      const person = people.find(p => p.id === personId);
      if (!person) return null;

      const updatedDonations = person.total_donations + donationAmount;
      
      return await updatePerson(personId, {
        total_donations: updatedDonations
      });
    } catch (error) {
      console.error('Error updating donation stats:', error);
      return null;
    }
  };

  const getTopDonors = (limit: number = 10) => {
    return [...people]
      .filter(person => person.is_active && person.total_donations > 0)
      .sort((a, b) => b.total_donations - a.total_donations)
      .slice(0, limit);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    loading,
    addPerson,
    updatePerson,
    updateDonationStats,
    getTopDonors,
    refreshPeople: fetchPeople
  };
};