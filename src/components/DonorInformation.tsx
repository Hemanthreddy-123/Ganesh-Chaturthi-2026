import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Phone, Calendar, Star } from 'lucide-react';

interface Donor {
  id: string;
  donor_name: string;
  donor_phone?: string;
  items_donated?: string;
  amount: number;
  receiving_admin_name: string;
  priority_order?: number;
  created_at: string;
}

interface PersonRecord {
  id: string;
  name: string;
  amount: number;
  upi_id?: string;
  admin_id: string;
  admin_name: string;
  created_at: string;
}

export const DonorInformation: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPeople, setShowPeople] = useState(false);

  useEffect(() => {
    loadDonors();
    loadPeople();

    // Set up real-time subscription for donations
    const channel = supabase
      .channel('home-donations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations',
          filter: 'items_donated=not.is.null'
        },
        (payload) => {
          console.log('Home donor change detected:', payload);
          loadDonors(); // Reload donors when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .not('items_donated', 'is', null)
        .order('priority_order', { ascending: true })
        .order('amount', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error('Error loading donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people_tracker')
        .select('*')
        .order('amount', { ascending: false });

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const getPriorityBadge = (priority: number = 1) => {
    const colors = {
      1: 'bg-red-100 text-red-800 border-red-300',
      2: 'bg-orange-100 text-orange-800 border-orange-300', 
      3: 'bg-blue-100 text-blue-800 border-blue-300',
      4: 'bg-green-100 text-green-800 border-green-300'
    };
    const labels = {
      1: 'Highest',
      2: 'High', 
      3: 'Low',
      4: 'Lowest'
    };
    return { color: colors[priority as keyof typeof colors] || colors[1], label: labels[priority as keyof typeof labels] || 'High' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (donors.length === 0 && people.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
        <p className="text-muted-foreground">
          No donors or people have been added yet. Data will appear here once added by admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live update indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live priority updates enabled</span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {showPeople ? 'People & Contributions' : 'Recent Donors'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {showPeople ? 'All registered people sorted by contribution amount' : 'Priority-sorted donors with live updates'}
        </p>
        <div className="flex justify-center gap-2">
          <Button 
            variant={!showPeople ? "default" : "outline"} 
            onClick={() => setShowPeople(false)}
            size="sm"
          >
            <Gift className="w-4 h-4 mr-2" />
            Item Donors
          </Button>
          <Button 
            variant={showPeople ? "default" : "outline"} 
            onClick={() => setShowPeople(true)}
            size="sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            All People
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {showPeople ? (
          people.map((person) => (
            <Card key={person.id} className="festival-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  {person.name}
                </CardTitle>
                {person.upi_id && (
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Phone className="w-3 h-3" />
                    UPI: {person.upi_id}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <Badge variant="secondary" className="text-primary text-lg font-bold">
                      ₹{person.amount}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(person.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <span>By: {person.admin_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          donors.map((donor) => {
            const priorityInfo = getPriorityBadge(donor.priority_order || 1);
            return (
              <Card key={donor.id} className="festival-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      {donor.donor_name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-xs font-medium ${priorityInfo.color}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {priorityInfo.label}
                      </Badge>
                    </div>
                  </div>
                  {donor.donor_phone && (
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {donor.donor_phone}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donor.items_donated && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Items Donated:</span>
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">
                          {donor.items_donated}
                        </p>
                      </div>
                    )}
                    
                    {donor.amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estimated Value:</span>
                        <Badge variant="secondary" className="text-primary">
                          ₹{donor.amount}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(donor.created_at).toLocaleDateString('en-IN')}
                      </span>
                      <span>By: {donor.receiving_admin_name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};