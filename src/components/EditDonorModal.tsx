import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';

interface Donor {
  id: string;
  donor_name: string;
  donor_phone?: string;
  items_donated?: string;
  amount: number;
  priority_order?: number;
  receiving_admin_name: string;
  created_at: string;
}

interface EditDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  donor: Donor;
}

export const EditDonorModal: React.FC<EditDonorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  donor
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

  useEffect(() => {
    if (donor) {
      setFormData({
        donor_name: donor.donor_name || '',
        donor_phone: donor.donor_phone || '',
        items_donated: donor.items_donated || '',
        amount: donor.amount?.toString() || '',
        priority_order: (donor.priority_order || 1).toString()
      });
    }
  }, [donor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast.error('Please login to edit donors');
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
        .update({
          donor_name: formData.donor_name,
          donor_phone: formData.donor_phone || null,
          items_donated: formData.items_donated,
          amount: Number(formData.amount) || 0,
          priority_order: Number(formData.priority_order)
        })
        .eq('id', donor.id);

      if (error) throw error;

      toast.success('Donor updated successfully! Changes are live for all admins.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating donor:', error);
      toast.error('Failed to update donor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const priorityOptions = [
    { value: '1', label: '1 - Highest Priority', color: 'text-red-600' },
    { value: '2', label: '2 - High Priority', color: 'text-orange-600' },
    { value: '3', label: '3 - Low Priority', color: 'text-blue-600' },
    { value: '4', label: '4 - Lowest Priority', color: 'text-green-600' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Donor</DialogTitle>
          <DialogDescription>
            Update donor information and priority level
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
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Donor'}
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