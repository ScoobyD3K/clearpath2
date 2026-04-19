import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CreditCard, Target, DollarSign, TrendingUp, Loader2, AlertCircle } from "lucide-react";

export default function ClientDetailView({ clientEmail, clientName, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const res = await base44.functions.invoke('getClientData', { client_email: clientEmail });
      setData(res.data);
      setLoading(false);
    };
    fetchData();
  }, [clientEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        <span className="ml-3 text-slate-600">Loading client data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <Button onClick={onBack} className="mt-4" variant="outline">Go Back</Button>
      </div>
    );
  }

  const { debts = [], payments = [], goals = [], bankAccounts = [], subscriptions = [] } = data || {};

  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebt = activeDebts.reduce((s, d) => s + d.current_balance, 0);
  const totalMinPayments = activeDebts.reduce((s, d) => s + (d.minimum_payment || 0), 0);
  const totalSavings = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalCreditLimit = activeDebts.reduce((s, d) => s + (d.credit_limit || 0), 0);
  const totalCreditBalance = activeDebts.reduce((s, d) => s + (d.credit_limit > 0 ? d.current_balance : 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : null;

  const monthlySubscriptions = subscriptions.reduce((s, sub) => {
    if (sub.billing_cycle === 'monthly') return s + (sub.amount || 0);
    if (sub.billing_cycle === 'yearly') return s + (sub.amount || 0) / 12;
    if (sub.billing_cycle === 'weekly') return s + (sub.amount || 0) * 4.33;
    return s;
  }, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
            <p className="text-slate-500 text-sm">{clientEmail}</p>
          </div>
          <Badge className="ml-auto bg-cyan-100 text-cyan-700">Read-Only View</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-rose-500" />
                <span className="text-xs text-slate-500">Total Debt</span>
              </div>
              <p className="text-xl font-bold text-slate-800">${totalDebt.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{activeDebts.length} active debts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500">Total Savings</span>
              </div>
              <p className="text-xl font-bold text-slate-800">${totalSavings.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{bankAccounts.length} accounts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-500">Min Payments</span>
              </div>
              <p className="text-xl font-bold text-slate-800">${totalMinPayments.toLocaleString()}</p>
              <p className="text-xs text-slate-500">per month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-500">Net Position</span>
              </div>
              <p className={`text-xl font-bold ${totalSavings - totalDebt >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {totalSavings - totalDebt >= 0 ? '+' : ''}${(totalSavings - totalDebt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Debts */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                Active Debts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeDebts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No active debts</p>
              ) : activeDebts.map(debt => {
                const progress = debt.total_amount > 0 ? ((debt.total_amount - debt.current_balance) / debt.total_amount) * 100 : 0;
                return (
                  <div key={debt.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 text-sm">{debt.name}</span>
                      <span className="text-sm text-slate-600">${debt.current_balance.toLocaleString()}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{debt.interest_rate}% APR</span>
                      <span>{progress.toFixed(0)}% paid off</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-500" />
                Financial Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {goals.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No goals set</p>
              ) : goals.filter(g => g.status === 'active').map(goal => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 text-sm">{goal.name}</span>
                      <span className="text-sm text-slate-600">${(goal.current_amount || 0).toLocaleString()} / ${goal.target_amount.toLocaleString()}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="text-xs text-slate-400">{progress.toFixed(0)}% complete</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Bank Accounts */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Bank Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No accounts</p>
              ) : bankAccounts.map(acct => (
                <div key={acct.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{acct.name}</p>
                    <p className="text-xs text-slate-400">{acct.institution} • {acct.account_type}</p>
                  </div>
                  <span className="font-semibold text-green-700">${acct.balance.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card className="shadow-md">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Subscriptions
                <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">
                  ${monthlySubscriptions.toFixed(2)}/mo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {subscriptions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No subscriptions</p>
              ) : subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="font-medium text-sm text-slate-800">{sub.name}</span>
                  <span className="text-sm text-slate-600">${sub.amount}/{sub.billing_cycle}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className="mt-6 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No payment history</p>
            ) : [...payments].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)).slice(0, 10).map(p => {
              const debt = debts.find(d => d.id === p.debt_id);
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{debt?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{p.payment_date} {p.notes ? `• ${p.notes}` : ''}</p>
                  </div>
                  <span className="font-semibold text-green-700">${p.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}