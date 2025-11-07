import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingDown, DollarSign, PieChart } from "lucide-react";
import DebtOverTimeChart from "../components/statistics/DebtOverTimeChart";
import PrincipalVsInterestChart from "../components/statistics/PrincipalVsInterestChart";
import DebtBreakdownChart from "../components/statistics/DebtBreakdownChart";
import ProgressCard from "../components/statistics/ProgressCard";

export default function Statistics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.list(),
    initialData: [],
  });

  const { data: allPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
    initialData: [],
  });

  const calculateStatistics = () => {
    const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.total_amount, 0);
    const totalCurrentDebt = debts.filter(d => d.status === 'active').reduce((sum, debt) => sum + debt.current_balance, 0);
    const totalPaid = totalOriginalDebt - totalCurrentDebt;
    const progressPercentage = totalOriginalDebt > 0 ? (totalPaid / totalOriginalDebt) * 100 : 0;

    // Calculate principal vs interest
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;

    allPayments.forEach(payment => {
      const debt = debts.find(d => d.id === payment.debt_id);
      if (debt) {
        const monthlyRate = debt.interest_rate / 100 / 12;
        // Estimate the balance at time of payment (simplified)
        const estimatedBalance = debt.current_balance;
        const interestPortion = estimatedBalance * monthlyRate;
        const principalPortion = payment.amount - Math.min(interestPortion, payment.amount);
        
        totalInterestPaid += Math.min(interestPortion, payment.amount);
        totalPrincipalPaid += Math.max(principalPortion, 0);
      }
    });

    return {
      totalOriginalDebt,
      totalCurrentDebt,
      totalPaid,
      progressPercentage,
      totalPrincipalPaid,
      totalInterestPaid,
      debtsPayedOff: debts.filter(d => d.status === 'paid_off').length,
      activeDebts: debts.filter(d => d.status === 'active').length,
    };
  };

  if (!user || debtsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stats = calculateStatistics();

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Statistics & Analytics</h1>
          <p className="text-slate-600 mt-2">Visualize your debt payoff journey</p>
        </div>

        {debts.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No data yet</h3>
              <p className="text-slate-600">Add debts and record payments to see statistics</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProgressCard
                title="Total Debt Paid"
                value={`$${stats.totalPaid.toLocaleString()}`}
                subtitle={`of $${stats.totalOriginalDebt.toLocaleString()}`}
                percentage={stats.progressPercentage}
                icon={TrendingDown}
                color="blue"
              />
              <ProgressCard
                title="Remaining Debt"
                value={`$${stats.totalCurrentDebt.toLocaleString()}`}
                subtitle={`${stats.activeDebts} active debts`}
                icon={DollarSign}
                color="orange"
              />
              <ProgressCard
                title="Principal Paid"
                value={`$${stats.totalPrincipalPaid.toLocaleString()}`}
                subtitle="Reducing your debt"
                icon={PieChart}
                color="green"
              />
              <ProgressCard
                title="Interest Paid"
                value={`$${stats.totalInterestPaid.toLocaleString()}`}
                subtitle="Cost of borrowing"
                icon={BarChart3}
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    Debt Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <DebtOverTimeChart debts={debts} payments={allPayments} />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Principal vs Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <PrincipalVsInterestChart 
                    principal={stats.totalPrincipalPaid}
                    interest={stats.totalInterestPaid}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Debt Breakdown Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <DebtBreakdownChart debts={debts.filter(d => d.status === 'active')} />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Overall Progress</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.progressPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Debts Paid Off</div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.debtsPayedOff}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Active Debts</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.activeDebts}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Total Payments</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {allPayments.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}