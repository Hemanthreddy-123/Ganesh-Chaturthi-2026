import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2 } from 'lucide-react';

interface Schedule {
  id: string;
  date: string;
  title: string;
  description?: string;
  time_start?: string;
  time_end?: string;
  location?: string;
  organizer?: string;
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const ScheduleManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    time_start: '',
    time_end: '',
    location: '',
    organizer: '',
    priority: 1
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const scheduleData = {
        ...formData,
        created_by: user.id,
        priority: Number(formData.priority)
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Schedule updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([scheduleData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Schedule created successfully",
        });
      }

      resetForm();
      setIsModalOpen(false);
      loadSchedules();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      title: schedule.title,
      description: schedule.description || '',
      time_start: schedule.time_start || '',
      time_end: schedule.time_end || '',
      location: schedule.location || '',
      organizer: schedule.organizer || '',
      priority: schedule.priority
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      loadSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      title: '',
      description: '',
      time_start: '',
      time_end: '',
      location: '',
      organizer: '',
      priority: 1
    });
    setEditingSchedule(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ganesh-gradient bg-clip-text text-transparent">
            Festival Schedule
          </h2>
          <p className="text-muted-foreground">
            Manage daily schedule and events for Ganesh Chaturthi 2026 · Depur Village 
          </p>
        </div>
        {profile && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Pooja, Aarti, Visarjan"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Details about the event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_start">Start Time</Label>
                    <Input
                      id="time_start"
                      type="time"
                      value={formData.time_start}
                      onChange={(e) => setFormData({...formData, time_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time_end">End Time</Label>
                    <Input
                      id="time_end"
                      type="time"
                      value={formData.time_end}
                      onChange={(e) => setFormData({...formData, time_end: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Main Pandal, Community Hall"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                      placeholder="Person responsible"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Update' : 'Create'} Schedule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schedule Available</h3>
            <p className="text-muted-foreground">
              {profile ? 'Add your first schedule to get started.' : 'Login as admin to manage schedules.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="festival-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{schedule.title}</CardTitle>
                      <Badge variant={schedule.priority <= 2 ? "destructive" : schedule.priority <= 3 ? "default" : "secondary"}>
                        Priority {schedule.priority}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(schedule.date)}
                    </CardDescription>
                  </div>
                  {profile && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.description && (
                    <p className="text-muted-foreground">{schedule.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {(schedule.time_start || schedule.time_end) && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {schedule.time_start && formatTime(schedule.time_start)}
                          {schedule.time_start && schedule.time_end && ' - '}
                          {schedule.time_end && formatTime(schedule.time_end)}
                        </span>
                      </div>
                    )}

                    {schedule.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{schedule.location}</span>
                      </div>
                    )}

                    {schedule.organizer && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{schedule.organizer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
