import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Eye, RefreshCw, CheckCircle, XCircle, Clock, DollarSign, CreditCard, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ClientDetailView from "../components/advisor/ClientDetailView";

export default function AdvisorDashboard() {
  const [user, setUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: accessList = [] } = useQuery({
    queryKey: ['advisorAccess', user?.email],
    queryFn: () => base44.entities.AdvisorAccess.filter({ advisor_email: user.email }),
    enabled: !!user?.email,
  });

  const approvedClients = accessList.filter(a => a.status === 'approved');
  const pendingRequests = accessList.filter(a => a.status === 'pending');

  const handleInviteClient = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);

    // Check if already exists
    const existing = accessList.find(a => a.client_email === inviteEmail.trim().toLowerCase());
    if (existing) {
      toast.error("You already have a request for this client.");
      setIsInviting(false);
      return;
    }

    await base44.entities.AdvisorAccess.create({
      client_email: inviteEmail.trim().toLowerCase(),
      advisor_email: user.email,
      advisor_name: user.full_name || user.email,
      status: 'pending',
      message: inviteMessage.trim() || null,
    });

    // Send notification email to client
    await base44.integrations.Core.SendEmail({
      to: inviteEmail.trim().toLowerCase(),
      subject: `${user.full_name || 'A financial advisor'} is requesting access to your ClearPath account`,
      body: `
        <h2>Access Request from ${user.full_name || user.email}</h2>
        <p>A financial advisor is requesting read access to your ClearPath financial data.</p>
        ${inviteMessage ? `<p><em>"${inviteMessage}"</em></p>` : ''}
        <p>Log in to your ClearPath account and go to <strong>Profile → Advisor Access</strong> to approve or deny this request.</p>
      `,
    });

    toast.success("Request sent! The client will receive an email to approve access.");
    setInviteEmail("");
    setInviteMessage("");
    queryClient.invalidateQueries({ queryKey: ['advisorAccess'] });
    setIsInviting(false);
  };

  const revokeAccessMutation = useMutation({
    mutationFn: (accessId) => base44.entities.AdvisorAccess.update(accessId, { status: 'revoked' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorAccess'] });
      toast.success("Access revoked.");
    }
  });

  if (selectedClient) {
    return (
      <ClientDetailView
        clientEmail={selectedClient.client_email}
        clientName={selectedClient.client_name || selectedClient.client_email}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-600" />
              Advisor Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Manage your client accounts and access permissions</p>
          </div>
        </div>

        {/* Invite Client */}
        <Card className="mb-6 border-cyan-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-cyan-600" />
              Request Client Access
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleInviteClient} className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Client Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inviteMessage">Message (optional)</Label>
                <Input
                  id="inviteMessage"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hi, I'd like to help you with your financial plan..."
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isInviting} className="bg-cyan-600 hover:bg-cyan-700">
                <UserPlus className="w-4 h-4 mr-2" />
                {isInviting ? "Sending Request..." : "Send Access Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="mb-6 border-amber-200 shadow-md">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Approvals ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="font-medium text-slate-800">{req.client_email}</p>
                      <p className="text-sm text-amber-600">Awaiting client approval</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Clients */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Active Clients ({approvedClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {approvedClients.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No approved clients yet</p>
                <p className="text-sm">Send access requests above to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {approvedClients.map(client => (
                  <div key={client.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{client.client_name || client.client_email}</p>
                        <p className="text-sm text-slate-500">{client.client_email}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Account
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => revokeAccessMutation.mutate(client.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}