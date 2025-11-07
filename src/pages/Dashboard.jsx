
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, TrendingUp, DollarSign, CreditCard, Target, Zap } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import DebtCard from "../components/dashboard/DebtCard";
import StrategySelector from "../components/strategy/StrategySelector";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      if (!userData.payoff_strategy) {
        setShowStrategySelector(true);
      }
    };
    fetchUser();
  }, []);

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.filter({ status: 'active' }, '-created_date'),
    initialData: [],
  });

  const updateStrategyMutation = useMutation({
    mutationFn: (strategy) => base44.auth.updateMe({ payoff_strategy: strategy }),
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setShowStrategySelector(false);
    },
  });

  const sortedDebts = [...debts].sort((a, b) => {
    if (user?.payoff_strategy === "snowball") {
      return a.current_balance - b.current_balance;
    } else {
      return b.interest_rate - a.interest_rate;
    }
  });

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-slate-600 mt-2">Track your journey to financial freedom</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Strategy")}>
              <Button variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Payoff Strategy
              </Button>
            </Link>
            <Link to={createPageUrl("Debts")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Debt
              </Button>
            </Link>
          </div>
        </div>

        {showStrategySelector && debts.length > 0 && (
          <div className="mb-8">
            <StrategySelector 
              value={user?.payoff_strategy || "avalanche"}
              onChange={(strategy) => updateStrategyMutation.mutate(strategy)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Debt"
            value={`$${totalDebt.toLocaleString()}`}
            icon={CreditCard}
            bgGradient="bg-gradient-to-br from-rose-500 to-pink-600"
            iconColor="text-rose-600"
          />
          <StatCard
            title="Monthly Income"
            value={user?.monthly_income ? `$${user.monthly_income.toLocaleString()}` : "—"}
            icon={DollarSign}
            bgGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Min Payments"
            value={`$${totalMinPayments.toLocaleString()}`}
            icon={Target}
            bgGradient="bg-gradient-to-br from-amber-500 to-orange-600"
            iconColor="text-amber-600"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Active Debts</h2>
              {user?.payoff_strategy && debts.length > 0 && (
                <p className="text-sm text-slate-600 mt-1">
                  Sorted by {user.payoff_strategy === "avalanche" ? "highest interest rate" : "smallest balance"} 
                  <span className="ml-1 text-blue-600 font-medium">
                    ({user.payoff_strategy === "avalanche" ? "Avalanche" : "Snowball"} Method)
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No debts yet</h3>
              <p className="text-slate-600 mb-6">Start tracking your debts to see your progress</p>
              <Link to={createPageUrl("Debts")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Debt
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDebts.map((debt, index) => (
                <div key={debt.id} className="relative">
                  {index === 0 && user?.payoff_strategy && (
                    <div className="absolute -top-3 left-4 z-10">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        🎯 Focus Here First
                      </div>
                    </div>
                  )}
                  <DebtCard
                    debt={debt}
                    onClick={() => window.location.href = createPageUrl("DebtDetail") + `?id=${debt.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
