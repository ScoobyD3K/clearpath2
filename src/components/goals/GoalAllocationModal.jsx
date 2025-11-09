import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";

export default function GoalAllocationModal({ open, onOpenChange, goal, userSavings, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('add'); // 'add' or 'withdraw'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (action === 'add' && numAmount > userSavings) {
      alert("You don't have enough savings to allocate this amount!");
      return;
    }

    setIsSubmitting(true);
    await onSubmit(numAmount, action);
    setIsSubmitting(false);
    setAmount('');
    setAction('add');
    onOpenChange(false);
  };

  const remaining = goal ? goal.target_amount - goal.current_amount : 0;
  const suggestedAmounts = action === 'add' 
    ? [
        Math.min(100, remaining, userSavings),
        Math.min(500, remaining, userSavings),
        Math.min(1000, remaining, userSavings),
        Math.min(remaining, userSavings)
      ].filter(amt => amt > 0)
    : [100, 500, 1000, Math.min(5000, goal?.current_amount || 0)].filter(amt => amt > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Funds - {goal?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Available Savings:</span>
              <span className="font-semibold text-slate-900">${userSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Goal Current:</span>
              <span className="font-semibold text-slate-900">${goal?.current_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Goal Target:</span>
              <span className="font-semibold text-slate-900">${goal?.target_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-slate-600">Remaining:</span>
              <span className="font-semibold text-cyan-700">${remaining.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={action === 'add' ? 'default' : 'outline'}
              onClick={() => setAction('add')}
              className={action === 'add' ? 'flex-1 bg-cyan-600 hover:bg-cyan-700' : 'flex-1'}
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Add to Goal
            </Button>
            <Button
              type="button"
              variant={action === 'withdraw' ? 'default' : 'outline'}
              onClick={() => setAction('withdraw')}
              className={action === 'withdraw' ? 'flex-1 bg-blue-600 hover:bg-blue-700' : 'flex-1'}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-slate-700">
                Amount to {action === 'add' ? 'Add' : 'Withdraw'}
              </Label>
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

            {suggestedAmounts.length > 0 && (
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Quick Select</Label>
                <div className="grid grid-cols-4 gap-2">
                  {suggestedAmounts.map((quickAmount, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-xs"
                    >
                      {idx === suggestedAmounts.length - 1 && action === 'add' ? 'Max' : `$${quickAmount}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {action === 'add' && amount && parseFloat(amount) > userSavings && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">
                  Insufficient savings. You only have ${userSavings.toLocaleString()} available.
                </p>
              </div>
            )}

            {action === 'add' && amount && parseFloat(amount) + goal?.current_amount >= goal?.target_amount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  🎉 This will complete or nearly complete your goal!
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
                  setAction('add');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !amount || (action === 'add' && parseFloat(amount) > userSavings)}
                className={action === 'add'
                  ? "flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  : "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }
              >
                {isSubmitting ? "Processing..." : action === 'add' ? "Add Funds" : "Withdraw Funds"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}