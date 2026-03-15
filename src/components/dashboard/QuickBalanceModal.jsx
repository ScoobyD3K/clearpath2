import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

export default function QuickBalanceModal({ open, onOpenChange, account, type = "add", onSubmit }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(parseFloat(amount), type);
    setIsSubmitting(false);
    setAmount('');
    onOpenChange(false);
  };

  const suggestedAmounts = type === "subtract"
    ? [50, 100, 250, 500]
    : [50, 100, 500, 1000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "subtract" ? (
              <>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Minus className="w-4 h-4 text-red-600" />
                </div>
                Subtract from Balance
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                Add to Balance
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="amount" className="text-slate-700">
              {type === "subtract" ? "Amount to Subtract" : "Amount to Add"}
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              {account?.name} — Current: ${(account?.balance || 0).toLocaleString()}
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
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
              {suggestedAmounts.map((q) => (
                <Button key={q} type="button" variant="outline" size="sm" onClick={() => setAmount(q.toString())} className="text-xs">
                  ${q}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); setAmount(''); }} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount}
              className={type === "subtract"
                ? "flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                : "flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              }
            >
              {isSubmitting ? "Processing..." : type === "subtract" ? "Subtract" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}