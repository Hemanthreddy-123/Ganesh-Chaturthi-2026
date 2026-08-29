import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingAdmin {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  status: string;
}

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPendingAdmins();
      loadApprovedCount();
    }
  }, [isOpen]);

  const loadPendingAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, created_at, status')
        .eq('role', 'admin')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingAdmins(data || []);
    } catch (error) {
      console.error('Error loading pending admins:', error);
    }
  };

  const loadApprovedCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_approved_admin_count');
      if (error) throw error;
      setApprovedCount(data || 0);
    } catch (error) {
      console.error('Error loading approved count:', error);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!profile) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('approve_admin', {
        target_user_id: userId,
        approver_id: profile.user_id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Admin Approved",
          description: "Admin has been successfully approved!",
        });
        loadPendingAdmins();
        loadApprovedCount();
      } else {
        toast({
          title: "Approval Failed",
          description: "Maximum admin limit (6) reached!",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Admin Rejected",
        description: "Admin application has been rejected.",
      });
      loadPendingAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Management - ({approvedCount}/6 Approved)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pendingAdmins.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
                <p className="text-muted-foreground">All admin applications have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            pendingAdmins.map((admin) => (
              <Card key={admin.user_id} className="festival-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{admin.name}</CardTitle>
                      <p className="text-muted-foreground">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(admin.user_id)}
                      disabled={loading || approvedCount >= 6}
                      className="donation-button flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(admin.user_id)}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  {approvedCount >= 6 && (
                    <p className="text-sm text-destructive mt-2">
                      Maximum admin limit reached (6/6)
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};