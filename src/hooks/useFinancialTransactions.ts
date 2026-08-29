import { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from './useActivityLogger';

export interface FinancialTransaction {
  id: string;
  admin_id: string;
  admin_name: string;
  transaction_type: 'donation' | 'expense' | 'collection';
  amount: number;
  description: string;
  payment_method: string;
  person_id?: string;
  person_name?: string;
  donor_phone?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useFinancialTransactions = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { logActivity } = useActivityLogger();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data as FinancialTransaction[] || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<FinancialTransaction, 'id' | 'admin_id' | 'admin_name' | 'created_at' | 'updated_at'>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          ...transaction,
          admin_id: user.id,
          admin_name: profile.name,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: transaction.transaction_type === 'donation' ? 'donation_received' : 
                     transaction.transaction_type === 'expense' ? 'expense_added' : 'collection_added',
        description: `${transaction.transaction_type} of ₹${transaction.amount} - ${transaction.description}`,
        tableAffected: 'financial_transactions',
        recordId: data.id,
        amount: transaction.amount,
        metadata: {
          payment_method: transaction.payment_method,
          person_name: transaction.person_name
        }
      });

      await fetchTransactions();
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  };

  const getTotalsByType = () => {
    const totals = transactions.reduce((acc, transaction) => {
      acc[transaction.transaction_type] = (acc[transaction.transaction_type] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      donations: totals.donation || 0,
      expenses: totals.expense || 0,
      collections: totals.collection || 0,
      netAmount: (totals.donation || 0) + (totals.collection || 0) - (totals.expense || 0)
    };
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    getTotalsByType,
    refreshTransactions: fetchTransactions
  };
};