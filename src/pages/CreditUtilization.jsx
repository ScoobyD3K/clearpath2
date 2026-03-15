import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BarChart2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function CreditUtilization() {
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['allDebts'],
    queryFn: () => base44.entities.Debt.list('name'),
  });

  const activeCards = debts.filter(d => d.credit_limit && d.status === 'active');
  const paidOffCards = debts.filter(d => d.credit_limit && d.status === 'paid_off');

  const allCards = debts.filter(d => d.credit_limit);
  const totalLimit = allCards.reduce((s, d) => s + d.credit_limit, 0);
  const totalBalance = allCards.reduce((s, d) => s + d.current_balance, 0);
  const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const utilizationColor = (pct) => {
    if (pct > 70) return "text-red-600";
    if (pct > 30) return "text-amber-600";
    return "text-teal-600";
  };

  const barColor = (pct) => {
    if (pct > 70) return "bg-red-500";
    if (pct > 30) return "bg-amber-500";
    return "bg-teal-500";
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Credit Utilization</h1>
            <p className="text-sm text-slate-600 mt-1">Credit card balances vs. limits</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Overall summary */}
            {activeCards.length > 0 && (
              <Card className="border-slate-200 shadow-sm mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Overall Utilization</span>
                    <span className={`text-xl font-bold ${utilizationColor(overallUtilization)}`}>
                      {overallUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${barColor(overallUtilization)}`}
                      style={{ width: `${Math.min(overallUtilization, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>${totalBalance.toLocaleString()} used</span>
                    <span>${totalLimit.toLocaleString()} limit</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active cards */}
            {activeCards.length === 0 && paidOffCards.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No credit cards with limits found.</p>
              </div>
            )}

            {activeCards.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Cards</h2>
                {activeCards.map(debt => {
                  const pct = (debt.current_balance / debt.credit_limit) * 100;
                  return (
                    <Card key={debt.id} className="border-slate-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-900">{debt.name}</p>
                          <span className={`font-bold ${utilizationColor(pct)}`}>{pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className={`h-2 rounded-full transition-all ${barColor(pct)}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>${debt.current_balance.toLocaleString()} balance</span>
                          <span>${debt.credit_limit.toLocaleString()} limit</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Paid off cards */}
            {paidOffCards.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Paid Off</h2>
                {paidOffCards.map(debt => (
                  <Card key={debt.id} className="border-green-200 bg-green-50 shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">{debt.name}</p>
                          <p className="text-xs text-slate-500">Limit: ${debt.credit_limit.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">0%</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}