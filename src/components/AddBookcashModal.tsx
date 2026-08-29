import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';

interface AddBookcashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookcashAdded: () => void;
}

export const AddBookcashModal: React.FC<AddBookcashModalProps> = ({
  open,
  onOpenChange,
  onBookcashAdded,
}) => {
  const [formData, setFormData] = useState({
    person_name: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookcash')
        .insert({
          person_name: formData.person_name,
          amount: Number(formData.amount),
          description: formData.description,
          date: formData.date,
          admin_id: user.id,
          admin_name: profile.name,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await logActivity({
        activityType: 'collection_added',
        description: `Added book cash entry: ${formData.person_name} - ₹${formData.amount}`,
        tableAffected: 'bookcash',
        recordId: data.id,
        amount: Number(formData.amount),
        metadata: {
          person_name: formData.person_name,
          description: formData.description
        }
      });

      toast({
        title: "Success",
        description: "Book cash entry added successfully!",
      });

      setFormData({
        person_name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onBookcashAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding book cash entry:', error);
      toast({
        title: "Error",
        description: "Failed to add book cash entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      person_name: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Book Cash Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person_name">Person Name</Label>
            <Input
              id="person_name"
              value={formData.person_name}
              onChange={(e) => setFormData(prev => ({ ...prev, person_name: e.target.value }))}
              placeholder="Enter person's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};