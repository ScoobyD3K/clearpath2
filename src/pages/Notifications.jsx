import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle2, AlertCircle, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function Notifications() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: user.email }, '-created_date');
    },
    initialData: [],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Notification deleted");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => base44.entities.Notification.update(n.id, { is_read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("All notifications marked as read");
    },
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "debt_paid_off":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "great_payment":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "payment_due_soon":
      case "payment_reminder":
        return <Calendar className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "debt_paid_off":
        return "bg-green-50 border-green-200";
      case "great_payment":
        return "bg-blue-50 border-blue-200";
      case "payment_due_soon":
      case "payment_reminder":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-2">
              Stay on top of your debt payoff journey
              {unreadCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({unreadCount} unread)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Settings")}>
              <Button variant="outline" className="gap-2">
                <Bell className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsReadMutation.mutate()}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <BellOff className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-slate-600 mb-6">
                You'll receive notifications about payment reminders, achievements, and more
              </p>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`border-2 transition-all hover:shadow-md ${
                  notification.is_read 
                    ? "border-slate-200 bg-white opacity-75" 
                    : getNotificationColor(notification.type)
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge className="bg-blue-600 text-white flex-shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-slate-700 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {format(new Date(notification.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
                            >
                              Mark as read
                            </Button>
                          )}
                          {notification.debt_id && (
                            <Link to={createPageUrl("DebtDetail") + `?id=${notification.debt_id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 h-7 text-xs"
                              >
                                View debt
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}