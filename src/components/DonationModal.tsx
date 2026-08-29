import React, { useState } from 'react';
import { Person, Admin, Donation } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, HandCoins, QrCode, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logAdminActivity } from '@/components/AdminActivityLog';
import QRCode from 'qrcode';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onDonationComplete: (donation: Donation) => void;
}

// Admin data
const ADMINS: Admin[] = [
  { id: 'admin1', name: 'Mukkamalla Baskar Reddy', email: 'mukkamalla.baskar.reddy@temple-admin.com', phoneNumber: '+91 8985011137' },
  { id: 'admin2', name: 'Kukkapalli Srinivasulu Naidu', email: 'kukkapalli.srinivasulu.naidu@temple-admin.com', phoneNumber: '+91 9441843101' },
  { id: 'admin3', name: 'Siddavatam Venkata Ramanareddy', email: 'siddavatam.venkata.ramanareddy@temple-admin.com', phoneNumber: '+91 9441443925' },
];

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  person,
  onDonationComplete
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'handcash' | 'phonepay'>('handcash');
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (paymentMethod === 'phonepay' && amount && parseInt(amount) > 0) {
      generateQRCode();
    }
  }, [paymentMethod, amount]);

  const generateQRCode = async () => {
    try {
      const upiUrl = `upi://pay?pa=7901264866@ybl&pn=Ganesh Chaturthi 2026 · Depur Village &am=${amount}&cu=INR&tn=Donation for ${person?.name}`;
      const qrUrl = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount || !selectedAdminId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedAdmin = ADMINS.find(admin => admin.id === selectedAdminId);
      if (!selectedAdmin) {
        throw new Error('Admin not found');
      }

      const donation: Donation = {
        id: `donation_${Date.now()}`,
        personId: person.id,
        personName: person.name,
        amount: parseInt(amount),
        paymentMethod,
        receivingAdminId: selectedAdminId,
        receivingAdminName: selectedAdmin.name,
        donorName: donorName || 'Anonymous',
        donorPhone: donorPhone || '',
        createdAt: new Date(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log admin activity
      logAdminActivity(
        selectedAdminId,
        selectedAdmin.name,
        'Received donation',
        `Received ₹${amount} from ${donorName || 'Anonymous'} for ${person.name} via ${paymentMethod === 'handcash' ? 'Hand Cash' : 'PhonePe/UPI'}`
      );

      onDonationComplete(donation);

      toast({
        title: "Donation Successful!",
        description: `₹${amount} donated to ${person.name} via ${paymentMethod === 'handcash' ? 'Hand Cash' : 'PhonePe'}`,
      });

      // Reset form
      setAmount('');
      setPaymentMethod('handcash');
      setSelectedAdminId('');
      setDonorName('');
      setDonorPhone('');
      setQrCodeUrl('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!person) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl ganesh-gradient bg-clip-text text-transparent">
            Donate to {person.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Donor Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donorName">Your Name</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorPhone">Your Phone Number</Label>
                <Input
                  id="donorPhone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              required
              className="text-lg"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <Label>Payment Method *</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'handcash' | 'phonepay') => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="handcash" id="handcash" />
                <Label htmlFor="handcash" className="flex items-center space-x-2 cursor-pointer">
                  <HandCoins className="w-4 h-4" />
                  <span>Hand Cash</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phonepay" id="phonepay" />
                <Label htmlFor="phonepay" className="flex items-center space-x-2 cursor-pointer">
                  <Smartphone className="w-4 h-4" />
                  <span>PhonePe/UPI</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* PhonePe QR Code */}
          {paymentMethod === 'phonepay' && qrCodeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span>Scan to Pay</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto w-48 h-48" />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code with any UPI app to pay ₹{amount}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Admin Selection */}
          <div className="space-y-2">
            <Label>
              {paymentMethod === 'handcash'
                ? 'Which admin did you hand the cash to?'
                : 'Which admin received the online payment?'} *
            </Label>
            <Select value={selectedAdminId} onValueChange={setSelectedAdminId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an admin" />
              </SelectTrigger>
              <SelectContent>
                {ADMINS.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{admin.name}</span>
                      {admin.phoneNumber && (
                        <span className="text-xs text-muted-foreground">
                          ({admin.phoneNumber})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !amount || !selectedAdminId}
            className="w-full donation-button"
          >
            {isLoading ? 'Processing...' : `Donate ₹${amount || '0'}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
