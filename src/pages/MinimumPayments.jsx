import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Target, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MinimumPayments() {
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.filter({ status: 'active' }, 'name'),
  });

  const totalMinPayments = debts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" title="Back to Dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Minimum Payments</h1>
            <p className="text-sm text-slate-600 mt-1">Monthly minimums across all active debts</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No active debts found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => (
              <Card key={debt.id} className="border-slate-200 shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{debt.name}</p>
                    <p className="text-xs text-slate-500">
                      Balance: ${debt.current_balance.toLocaleString()}
                      {debt.due_date ? ` · Due: day ${debt.due_date}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {debt.minimum_payment ? (
                      <span className="text-lg font-bold text-amber-600">
                        ${debt.minimum_payment.toLocaleString()}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-amber-200 bg-amber-50 shadow-sm mt-4">
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-bold text-slate-900">Total Monthly Minimum</span>
                <span className="text-xl font-bold text-amber-600">
                  ${totalMinPayments.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500">/mo</span>
                </span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}