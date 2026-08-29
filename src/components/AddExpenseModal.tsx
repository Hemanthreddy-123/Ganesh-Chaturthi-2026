import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAdminActivity } from '@/components/AdminActivityLog';

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add an expense",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: "Error",
        description: "Please enter the purpose of expense",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('admin_expenses')
        .insert([
          {
            admin_id: profile.user_id,
            admin_name: profile.name,
            amount: parseFloat(amount),
            purpose: purpose.trim(),
            date
          }
        ]);

      if (error) throw error;

      // Log activity
      logAdminActivity(
        profile.user_id,
        profile.name,
        'Added expense',
        `Added expense of ₹${amount} for ${purpose.trim()} on ${date}`
      );

      toast({
        title: "Success",
        description: `Expense of ₹${amount} added successfully`,
      });
      
      // Reset form
      setAmount('');
      setPurpose('');
      setDate(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setPurpose('');
    setDate(new Date().toISOString().split('T')[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount Spent (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="What was this expense for?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};