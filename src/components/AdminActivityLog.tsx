import React, { useState, useEffect } from 'react';
import { AdminActivity } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, Calendar, Plus, IndianRupee } from 'lucide-react';

export const AdminActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const stored = localStorage.getItem('adminActivities');
    if (stored) {
      const allActivities = JSON.parse(stored);
      // Sort by timestamp, most recent first
      allActivities.sort((a: AdminActivity, b: AdminActivity) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setActivities(allActivities);
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('person')) return <Plus className="w-4 h-4" />;
    if (action.includes('donation')) return <IndianRupee className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActivityBadge = (action: string) => {
    if (action.includes('person')) return 'secondary';
    if (action.includes('donation')) return 'default';
    return 'outline';
  };

  if (activities.length === 0) {
    return (
      <Card className="festival-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>
            Track all admin actions and changes
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No admin activities recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="festival-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Admin Activity Log
        </CardTitle>
        <CardDescription>
          Recent admin actions and changes ({activities.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`p-4 ${index !== activities.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{activity.adminName}</span>
                        <Badge variant={getActivityBadge(activity.action) as any}>
                          {activity.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.details}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(activity.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Utility function to log admin activities
export const logAdminActivity = (
  adminId: string,
  adminName: string,
  action: string,
  details: string
) => {
  const activity: AdminActivity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    adminId,
    adminName,
    action,
    details,
    timestamp: new Date(),
  };

  const stored = localStorage.getItem('adminActivities');
  const allActivities = stored ? JSON.parse(stored) : [];
  allActivities.push(activity);
  
  // Keep only last 100 activities to prevent localStorage from growing too large
  if (allActivities.length > 100) {
    allActivities.splice(0, allActivities.length - 100);
  }
  
  localStorage.setItem('adminActivities', JSON.stringify(allActivities));
};
