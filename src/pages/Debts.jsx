import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import DebtCard from "../components/dashboard/DebtCard";
import QuickPaymentModal from "../components/debt/QuickPaymentModal";
import CelebrationModal from "../components/debt/CelebrationModal";
import { format } from "date-fns";

export default function Debts() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    total_amount: "",
    current_balance: "",
    interest_rate: "",
    minimum_payment: "",
    due_date: "",
    credit_limit: "",
  });

  const [quickPaymentDebt, setQuickPaymentDebt] = useState(null);
  const [quickPaymentType, setQuickPaymentType] = useState("pay");
  const [showCelebration, setShowCelebration] = useState(false);
  const [paidOffDebtInfo, setPaidOffDebtInfo] = useState(null);

  const queryClient = useQueryClient();

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.list('-created_date'),
    initialData: [],
  });

  const activeDebts = debts.filter(d => d.status !== 'paid_off');
  const paidOffDebts = debts.filter(d => d.status === 'paid_off');

  const createDebtMutation = useMutation({
    mutationFn: (data) => base44.entities.Debt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success("Debt added successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to add debt");
    }
  });

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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
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

  const resetForm = () => {
    setFormData({
      name: "",
      total_amount: "",
      current_balance: "",
      interest_rate: "",
      minimum_payment: "",
      due_date: "",
      credit_limit: "",
    });
  };

  const calculateMinimumPayment = () => {
    const balance = parseFloat(formData.current_balance);
    const rate = parseFloat(formData.interest_rate);
    
    if (balance && rate) {
      const monthlyRate = rate / 100 / 12;
      const interest = balance * monthlyRate;
      const minPayment = Math.max(interest + (balance * 0.01), 25);
      setFormData(prev => ({ ...prev, minimum_payment: minPayment.toFixed(2) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createDebtMutation.mutate({
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      current_balance: parseFloat(formData.current_balance),
      interest_rate: parseFloat(formData.interest_rate),
      minimum_payment: formData.minimum_payment ? parseFloat(formData.minimum_payment) : null,
      due_date: formData.due_date ? parseInt(formData.due_date) : null,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null,
      status: "active",
    });
  };

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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Debts</h1>
            <p className="text-slate-600 mt-1">Manage and track all your debts</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Add New Debt</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Debt Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Credit Card, Student Loan"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="total_amount">Original Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        id="total_amount"
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                        className="pl-8"
                        placeholder="10000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="current_balance">Current Balance *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        id="current_balance"
                        type="number"
                        step="0.01"
                        value={formData.current_balance}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_balance: e.target.value }))}
                        className="pl-8"
                        placeholder="8500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
                    <div className="relative">
                      <Input
                        id="interest_rate"
                        type="number"
                        step="0.01"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
                        placeholder="18.5"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="minimum_payment">Minimum Payment</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <Input
                          id="minimum_payment"
                          type="number"
                          step="0.01"
                          value={formData.minimum_payment}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimum_payment: e.target.value }))}
                          className="pl-8"
                          placeholder="250"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={calculateMinimumPayment}
                      >
                        Calculate
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="due_date">Payment Due Date (Day of Month)</Label>
                    <Input
                      id="due_date"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <Label htmlFor="credit_limit">Credit Limit (optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        id="credit_limit"
                        type="number"
                        step="0.01"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                        className="pl-8"
                        placeholder="e.g., 10000"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">For credit cards — used to calculate credit utilization</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={createDebtMutation.isPending}
                  >
                    {createDebtMutation.isPending ? "Adding..." : "Add Debt"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
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
          ))}
        </div>
      </div>

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
    </div>
  );
}