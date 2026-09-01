import React from 'react';
import { Person } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, User, Calendar, IndianRupee } from 'lucide-react';

const ADMIN_PHONES: Record<string, string> = {
  'Mukkamalla Baskar Reddy': '8985011137',
  'Kukkapalli Srinivasulu Naidu': '9441843101',
  'Siddavatam Venkata Ramanareddy': '9441443925',
};

interface PersonCardProps { person: Person; }

export const PersonCard: React.FC<PersonCardProps> = ({ person }) => (
  <Card className="festival-card hover:scale-[1.02] transition-all duration-300 cursor-default">
    <CardContent className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{person.name}</h3>
          <p className="text-xs text-muted-foreground">
            Added by <span className="text-orange-600 font-medium">{person.admin_name}</span>
            {ADMIN_PHONES[person.admin_name] && (
              <span className="ml-1">· 📞 {ADMIN_PHONES[person.admin_name]}</span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {person.address && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{person.address}</span>
          </div>
        )}
        {person.phone_number && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{person.phone_number}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{new Date(person.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-orange-600" />
          <span className="font-bold text-orange-600 text-lg">{person.amount_paid || 0}</span>
        </div>
        <Badge
          variant={person.payment_method === 'handcash' ? 'default' : 'secondary'}
          className="text-xs rounded-lg"
        >
          {person.payment_method === 'handcash' ? '💵 Cash' : '📱 UPI'}
        </Badge>
      </div>
    </CardContent>
  </Card>
);
