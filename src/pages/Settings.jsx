import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Save, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationDaysBefore, setNotificationDaysBefore] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      setEmailNotifications(userData.email_notifications !== false);
      setNotificationDaysBefore(userData.notification_days_before || 3);
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await base44.auth.updateMe({
        email_notifications: emailNotifications,
        notification_days_before: parseInt(notificationDaysBefore),
      });
      
      toast.success("Settings saved successfully!");
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      toast.error("Failed to save settings");
    }

    setIsSaving(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Notifications")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Notification Settings</h1>
            <p className="text-slate-600 mt-1">Manage how you receive notifications</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-slate-600" />
                    <Label htmlFor="email_notifications" className="font-semibold text-slate-900 cursor-pointer">
                      Email Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600">
                    Receive email reminders for payment due dates and achievements
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div>
                <Label htmlFor="notification_days" className="text-slate-700 font-medium">
                  Payment Reminder Timing
                </Label>
                <p className="text-sm text-slate-500 mb-3">
                  Send reminder this many days before payment due date
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    id="notification_days"
                    type="number"
                    min="1"
                    max="7"
                    value={notificationDaysBefore}
                    onChange={(e) => setNotificationDaysBefore(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-slate-600">days before</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">What you'll receive:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Payment due date reminders for all active debts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Congratulations when you pay off a debt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Encouragement for larger-than-minimum payments</span>
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}