import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

export default function SavingsAdjustmentModal({ open, onOpenChange, currentAmount, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (type) => {
    const adjustmentAmount = parseFloat(amount);
    if (!adjustmentAmount || adjustmentAmount <= 0) return;
    
    setIsSubmitting(true);
    await onSubmit(adjustmentAmount, type);
    setIsSubmitting(false);
    setAmount('');
    onOpenChange(false);
  };

  const quickAmounts = [50, 100, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-green-600" />
            </div>
            Adjust Savings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Current Savings</p>
            <p className="text-2xl font-bold text-slate-900">
              ${(currentAmount || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="amount" className="text-slate-700">
              Adjustment Amount
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={() => handleSubmit('add')}
              disabled={isSubmitting || !amount}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              onClick={() => handleSubmit('subtract')}
              disabled={isSubmitting || !amount}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Minus className="w-4 h-4 mr-2" />
              Subtract
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}