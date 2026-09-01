import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Download, X, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ganeshImg from '@/assets/image.png';

export interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorPhone?: string;
  amount: number;
  paymentMethod: string;
  adminName: string;
  date: string;
  type: 'member' | 'donation' | 'collection';
  personName?: string;
  address?: string;
  itemsDonated?: string;
}

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ isOpen, onClose, data }) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const formatMethod = (m: string) => {
    if (m === 'handcash' || m === 'cash') return '💵 Hand Cash';
    if (['phonepay', 'upi', 'phonepay/upi'].includes(m)) return '📱 PhonePe / UPI';
    return m;
  };

  const receiptRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const generatePDF = async () => {
    if (!receiptRef.current) return null;
    try {
      // Temporarily remove max-height for full capture
      const originalMaxHeight = receiptRef.current.style.maxHeight;
      const originalOverflow = receiptRef.current.style.overflowY;
      receiptRef.current.style.maxHeight = 'none';
      receiptRef.current.style.overflowY = 'visible';

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#c2410c', // Match the gradient general background
      });

      // Restore original styles
      receiptRef.current.style.maxHeight = originalMaxHeight;
      receiptRef.current.style.overflowY = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If height > A4 height, we might need multiple pages, but receipts are usually short.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`${data.receiptNumber}.pdf`);
    }
    setIsExporting(false);
  };

  const handleWhatsAppShare = async () => {
    setIsExporting(true);
    const pdf = await generatePDF();
    if (pdf) {
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${data.receiptNumber}.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Donation Receipt',
            text: `🙏 Ganpati Bappa Morya 🙏\nPayment Receipt from Depur Ganesh Utsav 2026 for ${data.donorName}`,
          });
        } catch (error) {
          console.error("Error sharing via Web Share API:", error);
        }
      } else {
        // Fallback for browsers that don't support file sharing
        const text = `*DEPUR GANESH UTSAV 2026*\n\n*Receipt:* ${data.receiptNumber}\n*Donor:* ${data.donorName}\n*Amount:* ₹${data.amount}\n*Method:* ${formatMethod(data.paymentMethod)}\n*Date:* ${formatDate(data.date)}\n\n🙏 Ganpati Bappa Morya 🙏`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
    setIsExporting(false);
  };



  // Preview rows
  const rows = [
    { k: 'Donor Name', v: data.donorName },
    ...(data.donorPhone ? [{ k: 'Phone', v: data.donorPhone }] : []),
    ...(data.address ? [{ k: 'Address', v: data.address }] : []),
    ...(data.personName && data.personName !== data.donorName
      ? [{ k: 'For', v: data.personName }] : []),
    ...(data.itemsDonated ? [{ k: 'Items Donated', v: data.itemsDonated }] : []),
    { k: 'Payment Method', v: formatMethod(data.paymentMethod) },
    { k: 'Received By', v: data.adminName },
    { k: 'Date & Time', v: formatDate(data.date) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Hide the default Radix close button to use our own custom footer buttons, bg-transparent so the card "floats" */}
      <DialogContent className="max-w-[460px] w-full max-h-[95dvh] overflow-y-auto p-4 sm:p-6 bg-transparent border-0 shadow-none [&>button]:hidden flex flex-col items-center">

        {/* The Receipt Card - The ref must ONLY wrap the receipt, not the action buttons, 
            so the downloaded PDF doesn't include the buttons */}
        <div
          ref={receiptRef}
          className="relative shrink-0 overflow-hidden rounded-3xl shadow-2xl w-full max-w-[400px]"
          style={{ background: 'linear-gradient(160deg,#7c2d12 0%,#c2410c 30%,#ea580c 60%,#f97316 80%,#fbbf24 100%)' }}
        >
          {/* Header */}
          <div className="px-6 pt-7 pb-5 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <img src={ganeshImg} alt="Lord Ganesh"
              className="w-20 h-20 rounded-full border-[3px] border-white/60 object-cover shadow-xl mx-auto mb-3" />
            <h2 className="text-base font-black text-white tracking-widest drop-shadow-md">
              DEPUR GANESH UTSAV 2026
            </h2>
            <p className="text-white/80 text-[10px] mt-1 font-medium">Depur Village, Atmakur Mandal, Nellore</p>
            <div className="inline-block mt-3 bg-white/20 border border-white/40 text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-[2px] uppercase shadow-sm">
              Official Payment Receipt
            </div>
          </div>

          {/* Receipt Number */}
          <div className="text-center py-2.5 px-6" style={{ background: 'rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <p className="text-[9px] text-white/70 uppercase tracking-[3px] font-bold">Receipt Number</p>
            <p className="text-xl sm:text-2xl font-black text-amber-100 tracking-[3px] font-mono mt-0.5">{data.receiptNumber}</p>
          </div>

          {/* Amount */}
          <div className="px-5 pt-6 pb-4 text-center">
            <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }}>
              <div className="absolute -right-4 -top-8 text-[120px] font-black leading-none select-none opacity-20"
                style={{ color: 'rgba(255,255,255,0.3)' }}>₹</div>
              <p className="text-[10px] text-white/80 uppercase tracking-[2px] font-bold relative z-10">Amount Paid</p>
              <p className="text-4xl sm:text-5xl font-black text-white mt-1 drop-shadow-md relative z-10">
                ₹{Number(data.amount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 pb-4">
            {rows.map(({ k, v }) => (
              <div key={k} className="flex justify-between items-start py-2.5"
                style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>
                <span className="text-[10px] text-white/70 uppercase tracking-[0.5px] font-semibold mt-0.5 w-[35%] shrink-0">{k}</span>
                <span className="text-sm font-bold text-white text-right w-[65%] leading-snug break-words">{v}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pt-2 pb-6 text-center bg-black/10">
            <div className="inline-flex items-center gap-1.5 text-green-300 text-[11px] font-black px-4 py-1.5 rounded tracking-[2px] -rotate-3 mb-4 shadow-sm"
              style={{ border: '2px solid #86efac', background: 'rgba(134, 239, 172, 0.1)' }}>
              ✓ PAID
            </div>
            <p className="text-[9px] text-white/50 mb-1.5">Computer-generated receipt. Keep for your records.</p>
            <p className="text-sm font-black text-amber-100 tracking-wide">🙏 Ganpati Bappa Morya! 🙏</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row shrink-0 gap-2 mt-4 w-full max-w-[400px]">
          <Button onClick={handleDownload} disabled={isExporting} className="flex-1 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-xl h-12 shadow-lg text-xs sm:text-sm">
            <Download className="w-4 h-4 mr-1.5" /> {isExporting ? 'Processing...' : 'Download'}
          </Button>
          <Button onClick={handleWhatsAppShare} disabled={isExporting} className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebd5b] font-bold rounded-xl h-12 shadow-lg text-xs sm:text-sm border-0">
            <MessageCircle className="w-4 h-4 mr-1.5" /> Share
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}
            className="rounded-xl bg-black/40 border-white/20 text-white hover:bg-black/60 hover:text-white h-12 w-12 flex-shrink-0 shadow-lg backdrop-blur-md">
            <X className="w-5 h-5" />
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
