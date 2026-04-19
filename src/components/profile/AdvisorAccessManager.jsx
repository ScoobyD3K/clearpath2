import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdvisorAccessManager({ user }) {
  const queryClient = useQueryClient();

  const { data: accessList = [] } = useQuery({
    queryKey: ['clientAccess', user?.email],
    queryFn: () => base44.entities.AdvisorAccess.filter({ client_email: user.email }),
    enabled: !!user?.email,
  });

  const updateAccess = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AdvisorAccess.update(id, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clientAccess'] });
      toast.success(vars.status === 'approved' ? "Access approved!" : "Access revoked.");
    }
  });

  const deleteAccess = useMutation({
    mutationFn: (id) => base44.entities.AdvisorAccess.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientAccess'] });
      toast.success("Request removed.");
    }
  });

  const statusColor = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    revoked: "bg-red-100 text-red-700",
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          Advisor Access
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Financial advisors who have requested access to your account
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {accessList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No advisors have requested access yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessList.map(access => (
              <div key={access.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">{access.advisor_name || access.advisor_email}</p>
                  <p className="text-sm text-slate-500">{access.advisor_email}</p>
                  {access.message && (
                    <p className="text-sm text-slate-500 italic mt-1">"{access.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor[access.status]}>{access.status}</Badge>
                  {access.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateAccess.mutate({ id: access.id, status: 'approved' })}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => deleteAccess.mutate(access.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {access.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => updateAccess.mutate({ id: access.id, status: 'revoked' })}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  )}
                  {access.status === 'revoked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-500"
                      onClick={() => deleteAccess.mutate(access.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}