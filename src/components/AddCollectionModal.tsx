import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAdminActivity } from '@/components/AdminActivityLog';

interface AddCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddCollectionModal: React.FC<AddCollectionModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add a collection",
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('admin_collections')
        .insert([
          {
            admin_id: profile.user_id,
            admin_name: profile.name,
            amount: parseFloat(amount),
            date
          }
        ]);

      if (error) throw error;

      // Log activity
      logAdminActivity(
        profile.user_id,
        profile.name,
        'Added collection',
        `Added collection of ₹${amount} for ${date}`
      );

      toast({
        title: "Success",
        description: `Collection of ₹${amount} added successfully`,
      });
      
      // Reset form
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add collection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Daily Collection</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount Collected (₹)</Label>
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
              {isSubmitting ? 'Adding...' : 'Add Collection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};