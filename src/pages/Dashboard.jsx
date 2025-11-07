import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, TrendingUp, DollarSign, CreditCard, Target } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import DebtCard from "../components/dashboard/DebtCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.filter({ status: 'active' }, '-created_date'),
    initialData: [],
  });

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  const averageInterest = debts.length > 0
    ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length
    : 0;

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
          <Link to={createPageUrl("Debts")}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Debt
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Credit Score"
            value={user?.credit_score || "—"}
            icon={TrendingUp}
            bgGradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconColor="text-emerald-600"
          />
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
            <h2 className="text-2xl font-bold text-slate-900">Active Debts</h2>
            {!user?.credit_score && (
              <Link to={createPageUrl("Profile")}>
                <Button variant="outline" size="sm">
                  Complete Profile
                </Button>
              </Link>
            )}
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
              {debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onClick={() => window.location.href = createPageUrl("DebtDetail") + `?id=${debt.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}