import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MessageThread from "../components/messaging/MessageThread";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Get approved advisor connections
  const { data: accessList = [] } = useQuery({
    queryKey: ["advisorAccessClient", user?.email],
    queryFn: () => base44.entities.AdvisorAccess.filter({ client_email: user.email, status: "approved" }),
    enabled: !!user?.email,
  });

  // Count unread messages per advisor
  const { data: allMessages = [] } = useQuery({
    queryKey: ["allMessages", user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const unreadCountFor = (advisorEmail) =>
    allMessages.filter(m => m.sender_email === advisorEmail && !m.is_read).length;

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" title="Back to Dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
              Messages
            </h1>
            <p className="text-sm text-slate-500">Communicate with your financial advisor</p>
          </div>
        </div>

        {accessList.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No advisor connections yet</p>
              <p className="text-sm mt-1">Once an advisor is approved, you can message them here.</p>
            </CardContent>
          </Card>
        ) : selectedAdvisor ? (
          <Card className="shadow-lg">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedAdvisor(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <CardTitle className="text-base">{selectedAdvisor.advisor_name || selectedAdvisor.advisor_email}</CardTitle>
                  <p className="text-xs text-slate-400">{selectedAdvisor.advisor_email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MessageThread
                currentUserEmail={user.email}
                currentUserName={user.full_name || user.email}
                otherEmail={selectedAdvisor.advisor_email}
                otherName={selectedAdvisor.advisor_name || selectedAdvisor.advisor_email}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accessList.map(access => {
              const unread = unreadCountFor(access.advisor_email);
              return (
                <Card
                  key={access.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedAdvisor(access)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {(access.advisor_name || access.advisor_email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{access.advisor_name || access.advisor_email}</p>
                        <p className="text-xs text-slate-500">{access.advisor_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <Badge className="bg-cyan-600 text-white">{unread}</Badge>
                      )}
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}