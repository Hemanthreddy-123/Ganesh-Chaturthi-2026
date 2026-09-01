import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, MessageCircle, Copy, CheckCircle } from 'lucide-react';

interface Contact {
  name: string;
  phone: string;
  note?: string;
}

const ADMIN_CONTACTS: Contact[] = [
  { name: 'ముక్కమల్ల వంశీకృష్ణ రెడ్డి', phone: '7901264866', note: '(P.Pay, G.Pay, Paytm)' },
  { name: 'చాగం మధు రెడ్డి', phone: '7901282647' },
  { name: 'రావిల్ల బాలాజీ', phone: '8179914192' },
  { name: 'కుక్కపల్లి బాలాజీ', phone: '8317644166' },
];

const UPI_ID = '7901264866@ybl';

export const ContactInfo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = (phone: string) => {
    const msg = encodeURIComponent(
      'Hi! I have donated for Ganesh Chaturthi 2026 · Depur Village . Please find the payment screenshot attached.'
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  };

  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <div className="om-divider"><span className="text-orange-400 text-xl">🕉</span></div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Donation Information</h2>
          <p className="text-muted-foreground text-sm">Contact our team or use UPI for donations</p>
        </div>

        {/* Location */}
        <Card className="festival-card mb-5">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-0.5">Festival Location</p>
              <p className="text-muted-foreground text-sm mb-3">
                Ramalayam, Depuru Village, Atmakur Mandal, Nellore District, Andhra Pradesh — PIN 524322
              </p>
              {/* Google Map Embed - no API key needed */}
              <div className="rounded-xl overflow-hidden border border-orange-200 shadow-sm">
                <iframe
                  title="Depur Village Location"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Ramalayam,Depuru,Andhra+Pradesh+524322&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </div>
              <a
                href="https://maps.google.com/?q=Ramalayam,Depuru,Andhra+Pradesh+524322"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-orange-600 font-medium hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
              </a>
            </div>
          </CardContent>
        </Card>

        {/* UPI */}
        <Card className="festival-card mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">UPI Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="font-mono text-base font-semibold text-orange-800 break-all">{UPI_ID}</p>
              <Button variant="outline" size="sm" onClick={copyUpi}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl self-end sm:self-auto flex-shrink-0">
                {copied
                  ? <><CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />Copied!</>
                  : <><Copy className="w-4 h-4 mr-1.5" />Copy</>}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              After payment, send screenshot to any WhatsApp number below
            </p>
          </CardContent>
        </Card>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_CONTACTS.map((c, i) => (
            <Card key={i} className="festival-card">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <p className="font-semibold text-sm mb-1">{c.name}</p>
                {c.note && <p className="text-xs text-green-600 font-medium mb-1">{c.note}</p>}
                <p className="font-mono text-orange-600 font-medium mb-3">+91 {c.phone}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"
                    onClick={() => window.open(`tel:+91${c.phone}`, '_self')}
                    className="flex-1 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 text-xs">
                    <Phone className="w-3.5 h-3.5 mr-1" />Call
                  </Button>
                  <Button size="sm" onClick={() => whatsapp(c.phone)}
                    className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs">
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 py-6 border-t border-orange-100">
          <p className="text-3xl mb-2">🕉</p>
          <p className="font-bold text-orange-600 text-xl">Ganpati Bappa Morya! 🙏</p>
          <p className="text-muted-foreground text-sm mt-1">
            Ganesh Chaturthi 2026 · Depur Village · Atmakur Mandal · Nellore
          </p>
          <p className="text-muted-foreground text-xs mt-3">
            Website developed by <span className="font-semibold text-orange-500">Mukkamalla Hemanth Reddy</span>
          </p>
        </div>
      </div>
    </section>
  );
};
