import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

export default function QuickPaymentModal({ open, onOpenChange, debt, onSubmit, type = "pay" }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && type === "pay" && debt?.minimum_payment) {
      setAmount(debt.minimum_payment.toString());
    } else if (open) {
      setAmount('');
    }
  }, [open, debt, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(parseFloat(amount));
    setIsSubmitting(false);
    setAmount('');
    onOpenChange(false);
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const suggestedAmounts = type === "pay" 
    ? [
        debt?.minimum_payment || 50,
        (debt?.minimum_payment || 50) * 2,
        100,
        500
      ]
    : [50, 100, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "pay" ? (
              <>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Minus className="w-4 h-4 text-green-600" />
                </div>
                Quick Payment
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                Add to Balance
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="amount" className="text-slate-700">
              {type === "pay" ? "Payment Amount" : "Amount to Add"}
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              {debt?.name} - Current: ${debt?.current_balance.toLocaleString()}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-4 gap-2">
              {suggestedAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="text-xs"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {type === "pay" && amount && parseFloat(amount) >= debt?.current_balance && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                🎉 This will pay off the debt completely!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setAmount('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount}
              className={type === "pay" 
                ? "flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                : "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }
            >
              {isSubmitting ? "Processing..." : type === "pay" ? "Record Payment" : "Add Amount"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}