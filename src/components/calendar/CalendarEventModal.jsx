import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, DollarSign, Target, Plus } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CalendarEventModal({ open, onOpenChange, date, events, debts }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    debt_id: "",
    amount: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const schedulePaymentMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Payment.create({
        debt_id: data.debt_id,
        amount: parseFloat(data.amount),
        payment_date: format(date, "yyyy-MM-dd"),
        notes: data.notes || `Scheduled payment for ${format(date, "MMM d, yyyy")}`,
      });

      const debt = debts.find(d => d.id === data.debt_id);
      if (debt) {
        const newBalance = debt.current_balance - parseFloat(data.amount);
        await base44.entities.Debt.update(debt.id, {
          current_balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? "paid_off" : "active",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success("Payment scheduled successfully!");
      setShowPaymentForm(false);
      setPaymentData({ debt_id: "", amount: "", notes: "" });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to schedule payment");
    }
  });

  const handleSchedulePayment = (e) => {
    e.preventDefault();
    schedulePaymentMutation.mutate(paymentData);
  };

  if (!date) return null;

  const debtDueEvents = events.filter(e => e.type === 'debt_due');
  const goalEvents = events.filter(e => e.type === 'goal_deadline');
  const paymentEvents = events.filter(e => e.type === 'payment_made');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Payment Due Section */}
          {debtDueEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💳</span>
                Payments Due ({debtDueEvents.length})
              </h3>
              <div className="space-y-2">
                {debtDueEvents.map((event, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.debt.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Minimum Payment: ${event.debt.minimum_payment?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-sm text-slate-600">
                          Current Balance: ${event.debt.current_balance.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setPaymentData(prev => ({ 
                            ...prev, 
                            debt_id: event.debt.id,
                            amount: event.debt.minimum_payment?.toString() || ""
                          }));
                          setShowPaymentForm(true);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Deadlines Section */}
          {goalEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Goal Deadlines ({goalEvents.length})
              </h3>
              <div className="space-y-2">
                {goalEvents.map((event, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900">{event.goal.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Target: ${event.goal.target_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      Current: ${event.goal.current_amount.toLocaleString()} ({((event.goal.current_amount / event.goal.target_amount) * 100).toFixed(0)}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History Section */}
          {paymentEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Payments Made ({paymentEvents.length})
              </h3>
              <div className="space-y-2">
                {paymentEvents.map((event, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.debt?.name || 'Unknown'}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Amount: ${event.payment.amount.toLocaleString()}
                        </p>
                        {event.payment.notes && (
                          <p className="text-xs text-slate-500 mt-1">{event.payment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Payment Section */}
          {!showPaymentForm && debts.length > 0 && (
            <div>
              <Button
                onClick={() => setShowPaymentForm(true)}
                variant="outline"
                className="w-full border-dashed border-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Payment for This Date
              </Button>
            </div>
          )}

          {showPaymentForm && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-600" />
                Schedule Payment
              </h3>
              <form onSubmit={handleSchedulePayment} className="space-y-4">
                <div>
                  <Label htmlFor="debt_id">Select Debt *</Label>
                  <Select
                    value={paymentData.debt_id}
                    onValueChange={(value) => {
                      const debt = debts.find(d => d.id === value);
                      setPaymentData(prev => ({ 
                        ...prev, 
                        debt_id: value,
                        amount: debt?.minimum_payment?.toString() || ""
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a debt" />
                    </SelectTrigger>
                    <SelectContent>
                      {debts.map(debt => (
                        <SelectItem key={debt.id} value={debt.id}>
                          {debt.name} - ${debt.current_balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes..."
                    className="h-20"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setPaymentData({ debt_id: "", amount: "", notes: "" });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={schedulePaymentMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    {schedulePaymentMutation.isPending ? "Scheduling..." : "Schedule Payment"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {events.length === 0 && !showPaymentForm && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No events scheduled for this date</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}