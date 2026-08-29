import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';

interface AddDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddDonorModal: React.FC<AddDonorModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_phone: '',
    items_donated: '',
    amount: '',
    priority_order: '1'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast.error('Please login to add donors');
      return;
    }

    if (!formData.donor_name || !formData.items_donated) {
      toast.error('Please fill in donor name and items donated');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          donor_name: formData.donor_name,
          donor_phone: formData.donor_phone || null,
          items_donated: formData.items_donated,
          amount: Number(formData.amount) || 0,
          priority_order: Number(formData.priority_order),
          receiving_admin_id: user.id,
          receiving_admin_name: profile.name,
          person_name: formData.donor_name,
          payment_method: 'items'
        });

      if (error) throw error;

      toast.success('Donor added successfully! Visible to all admins in real-time.');
      setFormData({
        donor_name: '',
        donor_phone: '',
        items_donated: '',
        amount: '',
        priority_order: '1'
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding donor:', error);
      toast.error('Failed to add donor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      donor_name: '',
      donor_phone: '',
      items_donated: '',
      amount: '',
      priority_order: '1'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Donor</DialogTitle>
          <DialogDescription>
            Add a new donor with their contributed items
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="donor_name">Donor Name *</Label>
            <Input
              id="donor_name"
              type="text"
              value={formData.donor_name}
              onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
              placeholder="Enter donor's name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="donor_phone">Phone Number (Optional)</Label>
            <Input
              id="donor_phone"
              type="tel"
              value={formData.donor_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, donor_phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="items_donated">Items Donated *</Label>
            <Textarea
              id="items_donated"
              value={formData.items_donated}
              onChange={(e) => setFormData(prev => ({ ...prev, items_donated: e.target.value }))}
              placeholder="Enter items donated (e.g., flowers, fruits, sweets)"
              required
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Estimated Value (Optional)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter estimated value in ₹"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="priority_order">Priority Level *</Label>
            <Select value={formData.priority_order} onValueChange={(value) => setFormData(prev => ({ ...prev, priority_order: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <span className="text-red-600">1 - Highest Priority</span>
                </SelectItem>
                <SelectItem value="2">
                  <span className="text-orange-600">2 - High Priority</span>
                </SelectItem>
                <SelectItem value="3">
                  <span className="text-blue-600">3 - Low Priority</span>
                </SelectItem>
                <SelectItem value="4">
                  <span className="text-green-600">4 - Lowest Priority</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Donor'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};