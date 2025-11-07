import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, DollarSign, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, addMonths } from "date-fns";
import { toast } from "sonner";

export default function DebtDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const debtId = urlParams.get('id');
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: debt, isLoading: debtLoading } = useQuery({
    queryKey: ['debt', debtId],
    queryFn: async () => {
      const debts = await base44.entities.Debt.filter({ id: debtId });
      return debts[0];
    },
    enabled: !!debtId,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', debtId],
    queryFn: () => base44.entities.Payment.filter({ debt_id: debtId }, '-payment_date'),
    initialData: [],
    enabled: !!debtId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const payment = await base44.entities.Payment.create(data);
      
      const newBalance = debt.current_balance - parseFloat(data.amount);
      await base44.entities.Debt.update(debtId, {
        current_balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? "paid_off" : "active",
      });
      
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debt', debtId] });
      queryClient.invalidateQueries({ queryKey: ['payments', debtId] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success("Payment recorded successfully!");
      setShowPaymentForm(false);
      setPaymentData({
        amount: "",
        payment_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
    },
    onError: () => {
      toast.error("Failed to record payment");
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId) => {
      const payment = payments.find(p => p.id === paymentId);
      await base44.entities.Payment.delete(paymentId);
      
      const newBalance = debt.current_balance + payment.amount;
      await base44.entities.Debt.update(debtId, {
        current_balance: newBalance,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debt', debtId] });
      queryClient.invalidateQueries({ queryKey: ['payments', debtId] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success("Payment deleted");
    },
  });

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    createPaymentMutation.mutate({
      debt_id: debtId,
      amount: parseFloat(paymentData.amount),
      payment_date: paymentData.payment_date,
      notes: paymentData.notes || null,
    });
  };

  const calculatePayoffDate = () => {
    if (!debt?.minimum_payment || debt.minimum_payment <= 0) return null;
    
    const monthlyRate = debt.interest_rate / 100 / 12;
    let balance = debt.current_balance;
    let months = 0;
    
    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate;
      const principal = debt.minimum_payment - interest;
      if (principal <= 0) return null;
      balance -= principal;
      months++;
    }
    
    return addMonths(new Date(), months);
  };

  if (debtLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Debt not found</p>
        <Link to={createPageUrl("Debts")}>
          <Button className="mt-4">Back to Debts</Button>
        </Link>
      </div>
    );
  }

  const payoffDate = calculatePayoffDate();
  const percentPaid = ((debt.total_amount - debt.current_balance) / debt.total_amount) * 100;
  const totalPaid = debt.total_amount - debt.current_balance;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Debts")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{debt.name}</h1>
            <p className="text-slate-600 mt-1">Debt details and payment history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Current Balance</div>
              <div className="text-3xl font-bold text-slate-900">
                ${debt.current_balance.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                of ${debt.total_amount.toLocaleString()} original
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Total Paid</div>
              <div className="text-3xl font-bold text-green-600">
                ${totalPaid.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {percentPaid.toFixed(1)}% complete
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-slate-600 mb-1">Interest Rate</div>
              <div className="text-3xl font-bold text-slate-900">
                {debt.interest_rate}%
              </div>
              <div className="text-sm text-slate-500 mt-2">
                Min: ${debt.minimum_payment?.toLocaleString() || '—'}/mo
              </div>
            </CardContent>
          </Card>
        </div>

        {payoffDate && (
          <Card className="mb-6 border-blue-200 bg-blue-50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 font-medium mb-1">Projected Payoff Date</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {format(payoffDate, "MMMM d, yyyy")}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Based on minimum payments of ${debt.minimum_payment}/month
                  </div>
                </div>
                <Calendar className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Record Payment</h2>
            </div>

            <Card className="border-slate-200 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Payment Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                        className="pl-8"
                        placeholder={debt.minimum_payment?.toString() || "100"}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="payment_date">Payment Date *</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes about this payment..."
                      className="h-20"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Payment History</h2>

            <Card className="border-slate-200 shadow-lg">
              <CardContent className="p-6">
                {paymentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {payments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg text-slate-900">
                              ${payment.amount.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">
                              {format(new Date(payment.payment_date), "MMM d, yyyy")}
                            </span>
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-slate-600">{payment.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this payment?")) {
                              deletePaymentMutation.mutate(payment.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}