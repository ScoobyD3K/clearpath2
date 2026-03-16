import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, DollarSign, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import StrategySelector from "../components/strategy/StrategySelector";
import PayoffPlan from "../components/strategy/PayoffPlan";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Strategy() {
  const [user, setUser] = useState(null);
  const [extraPayment, setExtraPayment] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.filter({ status: 'active' }),
    initialData: [],
  });

  const updateStrategyMutation = useMutation({
    mutationFn: (strategy) => base44.auth.updateMe({ payoff_strategy: strategy }),
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast.success("Strategy updated!");
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const runSimulation = (sortedDebts, withExtra) => {
    let totalInterest = 0;
    let totalMonths = 0;
    let remainingDebts = sortedDebts.map(d => ({ ...d, remaining: d.current_balance }));

    while (remainingDebts.some(d => d.remaining > 0) && totalMonths < 600) {
      totalMonths++;
      remainingDebts.forEach((debt, index) => {
        if (debt.remaining > 0) {
          const monthlyRate = debt.interest_rate / 100 / 12;
          const interest = debt.remaining * monthlyRate;
          totalInterest += interest;
          let payment = debt.minimum_payment || 0;
          if (index === 0 && withExtra) payment += extraPayment;
          const principal = Math.min(payment - interest, debt.remaining);
          debt.remaining = Math.max(0, debt.remaining - principal);
        }
      });
      remainingDebts = remainingDebts.filter(d => d.remaining > 0);
    }

    return { totalInterest, totalMonths, years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
  };

  const calculateComparison = () => {
    const results = {};

    ['avalanche', 'snowball'].forEach(strategy => {
      const sorted = [...debts].sort((a, b) =>
        strategy === "snowball" ? a.current_balance - b.current_balance : b.interest_rate - a.interest_rate
      );
      results[strategy] = runSimulation(sorted, true);
    });

    // Minimum payments only (no extra, no strategy ordering — just sorted by interest for baseline)
    const sortedForMin = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
    results.minimumOnly = runSimulation(sortedForMin, false);

    return results;
  };

  const comparison = debts.length > 0 && debts.every(d => d.minimum_payment) 
    ? calculateComparison() 
    : null;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Payoff Strategy</h1>
            <p className="text-slate-600 mt-1">Choose the best method to pay off your debts</p>
          </div>
        </div>

        {debts.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <TrendingDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No debts to strategize</h3>
              <p className="text-slate-600 mb-6">Add your debts first to create a payoff plan</p>
              <Link to={createPageUrl("Debts")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Add Your First Debt
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <StrategySelector 
                value={user.payoff_strategy || "avalanche"}
                onChange={(strategy) => updateStrategyMutation.mutate(strategy)}
              />

              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    Extra Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Label htmlFor="extra" className="text-slate-700">
                    Additional Monthly Payment
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Add extra to your focused debt each month
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      id="extra"
                      type="number"
                      min="0"
                      step="10"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {comparison && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      Strategy Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900 mb-2">Avalanche Method</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Total Interest:</span>
                          <span className="font-semibold text-blue-900">
                            ${comparison.avalanche.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Time to Payoff:</span>
                          <span className="font-semibold text-blue-900">
                            {comparison.avalanche.years}y {comparison.avalanche.months}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-900 mb-2">Snowball Method</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-green-700">Total Interest:</span>
                          <span className="font-semibold text-green-900">
                            ${comparison.snowball.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Time to Payoff:</span>
                          <span className="font-semibold text-green-900">
                            {comparison.snowball.years}y {comparison.snowball.months}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">Potential Savings (Avalanche)</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${(comparison.snowball.totalInterest - comparison.avalanche.totalInterest).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <PayoffPlan 
                debts={debts} 
                strategy={user.payoff_strategy || "avalanche"}
                extraPayment={extraPayment}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}