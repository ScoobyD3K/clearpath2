import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, TrendingUp, DollarSign, CreditCard, Target, Zap, Settings, BarChart2 } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import EditableStatCard from "../components/dashboard/EditableStatCard";
import DebtCard from "../components/dashboard/DebtCard";
import StrategySelector from "../components/strategy/StrategySelector";
import NavigationEditor from "../components/dashboard/NavigationEditor";
import CelebrationModal from "../components/debt/CelebrationModal";
import QuickPaymentModal from "../components/debt/QuickPaymentModal";
import SavingsAdjustmentModal from "../components/dashboard/SavingsAdjustmentModal";
import BankAccountsModal from "../components/dashboard/BankAccountsModal";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showNavEditor, setShowNavEditor] = useState(false);
  const [quickPaymentDebt, setQuickPaymentDebt] = useState(null);
  const [quickPaymentType, setQuickPaymentType] = useState("pay");
  const [showCelebration, setShowCelebration] = useState(false);
  const [paidOffDebtInfo, setPaidOffDebtInfo] = useState(null);
  const [showSavingsAdjustment, setShowSavingsAdjustment] = useState(false);
  const [showBankAccounts, setShowBankAccounts] = useState(false);
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

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Debt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setEditingDebt(null);
    },
  });

  const updateMonthlyIncomeMutation = useMutation({
    mutationFn: (newIncome) => base44.auth.updateMe({ monthly_income: newIncome }),
    onSuccess: async () => {
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast.success("Savings updated!");
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => {
      toast.error("Failed to update savings");
    }
  });

  const handleSavingsAdjustment = async (amount, type) => {
    const currentAmount = parseFloat(user?.monthly_income) || 0;
    const newAmount = type === "add" ? currentAmount + amount : Math.max(0, currentAmount - amount);
    
    await updateMonthlyIncomeMutation.mutateAsync(newAmount);
    toast.success(`${type === "add" ? "Added" : "Subtracted"} $${amount.toLocaleString()} ${type === "add" ? "to" : "from"} savings!`);
  };

  const quickPaymentMutation = useMutation({
    mutationFn: async ({ debt, amount, type }) => {
      const newBalance = type === "pay" 
        ? Math.max(0, debt.current_balance - amount)
        : debt.current_balance + amount;
      
      const isPaidOff = newBalance === 0;
      
      await base44.entities.Payment.create({
        debt_id: debt.id,
        amount: amount,
        payment_date: format(new Date(), "yyyy-MM-dd"),
        notes: type === "pay" ? "Quick payment" : "Balance adjustment",
      });
      
      await base44.entities.Debt.update(debt.id, {
        current_balance: newBalance,
        status: isPaidOff ? "paid_off" : "active",
      });

      if (isPaidOff) {
        setPaidOffDebtInfo({
          name: debt.name,
          amount: debt.total_amount,
        });
        setShowCelebration(true);

        const user = await base44.auth.me();
        await base44.entities.Notification.create({
          title: "🎉 Debt Paid Off!",
          message: `Congratulations! You've completely paid off your ${debt.name}. That's $${debt.total_amount.toLocaleString()} of debt eliminated!`,
          type: "debt_paid_off",
          debt_id: debt.id,
          user_email: user.email,
          is_read: false,
        });

        if (user.email_notifications !== false) {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `🎉 Congratulations! ${debt.name} Paid Off!`,
            body: `
              <h2>Amazing Achievement! 🎉</h2>
              <p>You've completely paid off your <strong>${debt.name}</strong>!</p>
              <p>Total amount paid: <strong>$${debt.total_amount.toLocaleString()}</strong></p>
              <p>Keep up the great work on your journey to financial freedom!</p>
            `,
          });
        }
      } else if (type === "pay" && debt.minimum_payment && amount >= debt.minimum_payment * 2) {
        const user = await base44.auth.me();
        await base44.entities.Notification.create({
          title: "💪 Great Payment!",
          message: `Awesome! You paid $${amount.toLocaleString()} on ${debt.name}, which is ${Math.round((amount / debt.minimum_payment) * 100)}% more than the minimum. You're accelerating your debt freedom!`,
          type: "great_payment",
          debt_id: debt.id,
          user_email: user.email,
          is_read: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Balance updated successfully!");
      setQuickPaymentDebt(null);
    },
    onError: () => {
      toast.error("Failed to update balance");
    }
  });

  const deleteDebtMutation = useMutation({
    mutationFn: (debtId) => base44.entities.Debt.delete(debtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success("Debt deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete debt");
    }
  });

  const handleQuickPayment = (debt, amount) => {
    quickPaymentMutation.mutate({ 
      debt, 
      amount, 
      type: quickPaymentType 
    });
  };

  const handleDeleteDebt = (debt) => {
    if (confirm(`Are you sure you want to delete "${debt.name}"? This action cannot be undone and will remove all associated payment history.`)) {
      deleteDebtMutation.mutate(debt.id);
    }
  };

  const sortedDebts = [...debts].sort((a, b) => {
    if (user?.payoff_strategy === "snowball") {
      return a.current_balance - b.current_balance;
    } else {
      return b.interest_rate - a.interest_rate;
    }
  });

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  const netPosition = (user?.monthly_income || 0) - totalDebt;
  const totalCreditLimit = debts.reduce((sum, debt) => sum + (debt.credit_limit || 0), 0);
  const totalCreditBalance = debts.reduce((sum, debt) => sum + (debt.credit_limit ? debt.current_balance : 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : null;

  return (
    <div className="p-3 md:p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            {user?.profile_picture && (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-lg hidden md:block"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-sm text-slate-600 mt-1">Track your journey to financial freedom</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNavEditor(true)}
              title="Customize Navigation"
              className="h-9 w-9"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Link to={createPageUrl("Strategy")}>
              <Button variant="outline" className="gap-2 h-9 text-sm px-3">
                <Zap className="w-4 h-4" />
                Strategy
              </Button>
            </Link>
            <Link to={createPageUrl("Debts")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-9 text-sm px-3">
                <Plus className="w-4 h-4 mr-2" />
                Add Debt
              </Button>
            </Link>
          </div>
        </div>

        {showStrategySelector && debts.length > 0 && (
          <div className="mb-6">
            <StrategySelector 
              value={user?.payoff_strategy || "avalanche"}
              onChange={(strategy) => updateStrategyMutation.mutate(strategy)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard
            title="Total Debt"
            value={`$${totalDebt.toLocaleString()}`}
            icon={CreditCard}
            bgGradient="bg-gradient-to-br from-rose-500 to-pink-600"
            iconColor="text-rose-600"
          />
          <div onClick={() => setShowSavingsAdjustment(true)} className="cursor-pointer">
            <EditableStatCard
              title="Savings"
              value={user?.monthly_income ? `$${user.monthly_income.toLocaleString()}` : "$0"}
              icon={DollarSign}
              bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
              iconColor="text-green-600"
            />
          </div>
          <StatCard
            title="Net Position"
            value={`${netPosition >= 0 ? '+' : ''}$${netPosition.toLocaleString()}`}
            icon={TrendingUp}
            bgGradient={netPosition >= 0 
              ? "bg-gradient-to-br from-purple-500 to-indigo-600" 
              : "bg-gradient-to-br from-slate-500 to-slate-700"}
            iconColor={netPosition >= 0 ? "text-purple-600" : "text-slate-600"}
          />
          <StatCard
            title="Min Payments"
            value={`$${totalMinPayments.toLocaleString()}`}
            icon={Target}
            bgGradient="bg-gradient-to-br from-amber-500 to-orange-600"
            iconColor="text-amber-600"
          />
          {creditUtilization !== null && (
            <StatCard
              title="Credit Utilization"
              value={`${creditUtilization.toFixed(1)}%`}
              icon={BarChart2}
              bgGradient={
                creditUtilization > 70 ? "bg-gradient-to-br from-red-500 to-rose-600" :
                creditUtilization > 30 ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                "bg-gradient-to-br from-teal-500 to-cyan-600"
              }
              iconColor={
                creditUtilization > 70 ? "text-red-600" :
                creditUtilization > 30 ? "text-amber-600" : "text-teal-600"
              }
            />
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Active Debts</h2>
              {user?.payoff_strategy && debts.length > 0 && (
                <p className="text-xs text-slate-600 mt-1">
                  Sorted by {user.payoff_strategy === "avalanche" ? "highest interest rate" : "smallest balance"} 
                  <span className="ml-1 text-blue-600 font-medium">
                    ({user.payoff_strategy === "avalanche" ? "Avalanche" : "Snowball"} Method)
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No debts yet</h3>
              <p className="text-sm text-slate-600 mb-4">Start tracking your debts to see your progress</p>
              <Link to={createPageUrl("Debts")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 h-9 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Debt
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDebts.map((debt, index) => (
                <div key={debt.id} className="relative">
                  {index === 0 && user?.payoff_strategy && (
                    <div className="absolute -top-2 left-4 z-10">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        🎯 Focus Here First
                      </div>
                    </div>
                  )}
                  <DebtCard
                    debt={debt}
                    onClick={() => window.location.href = createPageUrl("DebtDetail") + `?id=${debt.id}`}
                    onEdit={(debt) => window.location.href = createPageUrl("DebtDetail") + `?id=${debt.id}`}
                    onQuickPay={(debt) => {
                      setQuickPaymentDebt(debt);
                      setQuickPaymentType("pay");
                    }}
                    onQuickAdd={(debt) => {
                      setQuickPaymentDebt(debt);
                      setQuickPaymentType("add");
                    }}
                    onDelete={handleDeleteDebt}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NavigationEditor
        open={showNavEditor}
        onOpenChange={setShowNavEditor}
        user={user}
      />

      <QuickPaymentModal
        open={!!quickPaymentDebt}
        onOpenChange={(open) => !open && setQuickPaymentDebt(null)}
        debt={quickPaymentDebt}
        type={quickPaymentType}
        onSubmit={(amount) => handleQuickPayment(quickPaymentDebt, amount)}
      />

      <CelebrationModal
        open={showCelebration}
        onOpenChange={setShowCelebration}
        debtName={paidOffDebtInfo?.name || ""}
        totalAmount={paidOffDebtInfo?.amount || 0}
      />

      <SavingsAdjustmentModal
        open={showSavingsAdjustment}
        onOpenChange={setShowSavingsAdjustment}
        currentAmount={user?.monthly_income || 0}
        onSubmit={handleSavingsAdjustment}
      />
    </div>
  );
}