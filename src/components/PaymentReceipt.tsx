import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';
import ganeshImg from '@/assets/lord-ganesh.jpg';

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
    if (['phonepay','upi','phonepay/upi'].includes(m)) return '📱 PhonePe / UPI';
    return m;
  };

  const toBase64 = (url: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d')!.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/jpeg'));
      };
      img.src = url;
    });

  const handleDownload = async () => {
    // Convert ganesh image to base64 so it works in print window
    const imgBase64 = await toBase64(ganeshImg);

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

    const rowsHtml = rows.map(r => `
      <div class="row">
        <span class="k">${r.k}</span>
        <span class="v">${r.v}</span>
      </div>`).join('');

    const win = window.open('', '_blank', 'width=520,height=900');
    if (!win) return;

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>${data.receiptNumber}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{
  font-family:'Poppins',sans-serif;
  background:linear-gradient(160deg,#7c2d12 0%,#c2410c 30%,#ea580c 60%,#f97316 80%,#fbbf24 100%);
  min-height:100vh;
  display:flex;justify-content:center;align-items:flex-start;
  padding:30px 20px;
}
.card{
  width:420px;
  background:rgba(255,255,255,0.08);
  backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.25);
  border-radius:28px;
  overflow:hidden;
  box-shadow:0 30px 80px rgba(0,0,0,0.4);
}

/* Top header */
.hdr{
  background:rgba(0,0,0,0.25);
  padding:28px 24px 20px;
  text-align:center;
  position:relative;
}
.hdr .ganesh-img{
  width:90px;height:90px;
  border-radius:50%;
  border:3px solid rgba(255,255,255,0.6);
  object-fit:cover;
  box-shadow:0 8px 24px rgba(0,0,0,0.4);
  margin-bottom:12px;
}
.hdr h1{font-size:17px;font-weight:900;color:#fff;letter-spacing:1.5px;text-shadow:0 2px 8px rgba(0,0,0,0.4);}
.hdr .sub{font-size:10px;color:rgba(255,255,255,0.75);margin-top:3px;}
.hdr .badge{
  display:inline-block;
  background:rgba(255,255,255,0.15);
  border:1px solid rgba(255,255,255,0.35);
  color:#fff;font-size:9px;font-weight:700;
  padding:4px 14px;border-radius:20px;
  margin-top:10px;letter-spacing:2px;
  text-transform:uppercase;
}

/* Receipt number band */
.rband{
  background:rgba(255,255,255,0.12);
  border-top:1px solid rgba(255,255,255,0.15);
  border-bottom:1px solid rgba(255,255,255,0.15);
  padding:14px 24px;
  text-align:center;
}
.rband .rl{font-size:9px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:3px;font-weight:600;}
.rband .rn{font-size:24px;font-weight:900;color:#fef3c7;letter-spacing:4px;font-family:monospace;margin-top:2px;}

/* Amount */
.amt-wrap{padding:20px 24px 16px;}
.amt-box{
  background:rgba(255,255,255,0.15);
  border:2px solid rgba(255,255,255,0.3);
  border-radius:18px;
  padding:18px;
  text-align:center;
  position:relative;overflow:hidden;
}
.amt-box::before{
  content:'₹';
  position:absolute;right:-8px;top:-8px;
  font-size:90px;font-weight:900;
  color:rgba(255,255,255,0.06);
  line-height:1;
}
.amt-box .al{font-size:9px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;font-weight:600;}
.amt-box .av{font-size:46px;font-weight:900;color:#fff;line-height:1.1;margin-top:4px;text-shadow:0 4px 12px rgba(0,0,0,0.3);}

/* Details */
.details{padding:4px 24px 16px;}
.row{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 0;
  border-bottom:1px solid rgba(255,255,255,0.1);
}
.row:last-child{border-bottom:none;}
.k{font-size:10px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.8px;font-weight:500;}
.v{font-size:13px;font-weight:700;color:#fff;text-align:right;max-width:60%;}

/* Divider */
.div{
  margin:0 24px;
  border:none;
  border-top:1.5px dashed rgba(255,255,255,0.2);
}

/* Footer */
.ftr{padding:16px 24px 24px;text-align:center;}
.paid{
  display:inline-flex;align-items:center;gap:6px;
  border:2.5px solid #86efac;
  color:#86efac;
  font-size:11px;font-weight:800;
  padding:5px 18px;border-radius:6px;
  letter-spacing:2px;
  transform:rotate(-2deg);
  margin-bottom:14px;
  text-shadow:0 1px 4px rgba(0,0,0,0.2);
}
.note{font-size:10px;color:rgba(255,255,255,0.45);margin-bottom:8px;}
.bless{font-size:16px;font-weight:900;color:#fef3c7;text-shadow:0 2px 8px rgba(0,0,0,0.3);}
.org{font-size:9px;color:rgba(255,255,255,0.3);margin-top:8px;text-transform:uppercase;letter-spacing:1px;}

@media print{
  body{background:linear-gradient(160deg,#7c2d12 0%,#c2410c 30%,#ea580c 60%,#f97316 80%,#fbbf24 100%) !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{margin:0;size:420px auto;}
}
</style>
</head><body>
<div class="card">
  <div class="hdr">
    <img src="${imgBase64}" class="ganesh-img" alt="Lord Ganesh"/>
    <h1>DEPUR GANESH UTSAV 2026</h1>
    <div class="sub">Depur Village, Atmakur Mandal, Nellore District</div>
    <div class="badge">Official Payment Receipt</div>
  </div>

  <div class="rband">
    <div class="rl">Receipt Number</div>
    <div class="rn">${data.receiptNumber}</div>
  </div>

  <div class="amt-wrap">
    <div class="amt-box">
      <div class="al">Amount Paid</div>
      <div class="av">₹${Number(data.amount).toLocaleString('en-IN')}</div>
    </div>
  </div>

  <div class="details">${rowsHtml}</div>

  <hr class="div"/>

  <div class="ftr">
    <div class="paid">✓ &nbsp;PAID</div>
    <div class="note">Computer-generated receipt. Please keep it for your records.</div>
    <div class="bless">🙏 Ganpati Bappa Morya! 🙏</div>
    <div class="org">Depur Ganesh Utsav Committee · Ganesh Chaturthi 2026 · Depur Village, 2026</div>
  </div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() {
      document.title = '${data.receiptNumber}';
      window.print();
    }, 800);
  };
</script>
</body></html>`);
    win.document.close();
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
      <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        {/* Full gradient background — no white card */}
        <div className="max-h-[92vh] overflow-y-auto"
          style={{background:'linear-gradient(160deg,#7c2d12 0%,#c2410c 30%,#ea580c 60%,#f97316 80%,#fbbf24 100%)'}}>

          {/* Header */}
          <div className="px-6 pt-7 pb-5 text-center" style={{background:'rgba(0,0,0,0.2)'}}>
            <img src={ganeshImg} alt="Lord Ganesh"
              className="w-20 h-20 rounded-full border-[3px] border-white/60 object-cover shadow-2xl mx-auto mb-3" />
            <h2 className="text-base font-black text-white tracking-widest drop-shadow-lg">
              DEPUR GANESH UTSAV 2026
            </h2>
            <p className="text-white/70 text-[10px] mt-1">Depur Village, Atmakur Mandal, Nellore</p>
            <div className="inline-block mt-2 bg-white/15 border border-white/30 text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-[2px] uppercase">
              Official Payment Receipt
            </div>
          </div>

          {/* Receipt Number */}
          <div className="text-center py-3 px-6" style={{background:'rgba(255,255,255,0.1)',borderTop:'1px solid rgba(255,255,255,0.15)',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
            <p className="text-[9px] text-white/60 uppercase tracking-[3px] font-semibold">Receipt Number</p>
            <p className="text-2xl font-black text-amber-100 tracking-[4px] font-mono mt-1">{data.receiptNumber}</p>
          </div>

          {/* Amount */}
          <div className="px-5 pt-5 pb-3">
            <div className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)'}}>
              <div className="absolute right-0 top-0 text-[80px] font-black leading-none select-none"
                style={{color:'rgba(255,255,255,0.06)'}}>₹</div>
              <p className="text-[9px] text-white/65 uppercase tracking-[2px] font-semibold">Amount Paid</p>
              <p className="text-5xl font-black text-white mt-1 drop-shadow-lg">
                ₹{Number(data.amount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 pb-3">
            {rows.map(({ k, v }) => (
              <div key={k} className="flex justify-between items-center py-2.5"
                style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <span className="text-[10px] text-white/50 uppercase tracking-[0.8px] font-medium">{k}</span>
                <span className="text-sm font-bold text-white text-right max-w-[58%]">{v}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-5 my-2" style={{borderTop:'1.5px dashed rgba(255,255,255,0.2)'}} />

          {/* Footer */}
          <div className="px-5 pb-6 text-center">
            <div className="inline-flex items-center gap-2 text-green-300 text-xs font-black px-4 py-1.5 rounded tracking-[2px] -rotate-2 mb-3"
              style={{border:'2.5px solid #86efac'}}>
              ✓ &nbsp;PAID
            </div>
            <p className="text-[10px] text-white/40 mb-1">Computer-generated receipt. Keep for your records.</p>
            <p className="text-base font-black text-amber-100">🙏 Ganpati Bappa Morya! 🙏</p>
            <p className="text-[9px] text-white/25 mt-2 uppercase tracking-wider">
              Depur Ganesh Utsav Committee · Ganesh Chaturthi 2026 · Depur Village, 2026
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 p-4" style={{background:'rgba(124,45,18,0.95)',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <Button onClick={handleDownload} className="flex-1 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-xl text-sm">
            <Download className="w-4 h-4 mr-2" />Download / Print
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}
            className="rounded-xl text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
