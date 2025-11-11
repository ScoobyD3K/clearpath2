import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Percent, DollarSign, TrendingDown, Edit, Plus, Minus, X } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

export default function DebtCard({ debt, onClick, onEdit, onQuickPay, onQuickAdd, onDelete }) {
  const calculatePayoffDate = () => {
    if (!debt.minimum_payment || debt.minimum_payment <= 0) return null;
    
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

  const payoffDate = calculatePayoffDate();
  const percentPaid = ((debt.total_amount - debt.current_balance) / debt.total_amount) * 100;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 border-slate-200 bg-white relative"
    >
      <CardHeader className="pb-2 cursor-pointer" onClick={onClick}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-base text-slate-900">{debt.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Percent className="w-3 h-3 mr-1" />
                {debt.interest_rate}% APR
              </Badge>
              {debt.due_date && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Due: {debt.due_date}th
                </Badge>
              )}
            </div>
          </div>
          <Badge className={cn(
            "text-xs",
            debt.status === 'paid_off' 
              ? "bg-green-100 text-green-800" 
              : "bg-orange-100 text-orange-800"
          )}>
            {debt.status === 'paid_off' ? 'Paid Off' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 cursor-pointer pb-12" onClick={onClick}>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-slate-900">{percentPaid.toFixed(1)}% paid</span>
          </div>
          <Progress value={percentPaid} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <DollarSign className="w-3 h-3" />
              <span>Current Balance</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${debt.current_balance.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <TrendingDown className="w-3 h-3" />
              <span>Min Payment</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${debt.minimum_payment?.toLocaleString() || '—'}
            </p>
          </div>
        </div>

        {payoffDate && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Projected Payoff</span>
              <span className="text-xs font-semibold text-blue-700">
                {format(payoffDate, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons - Bottom Right */}
      <div className="absolute bottom-2 right-2 flex gap-1 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(debt);
          }}
          className="h-7 w-7 bg-red-100 hover:bg-red-200 text-red-700 shadow-md"
          title="Delete Debt"
        >
          <X className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd?.(debt);
          }}
          className="h-7 w-7 bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-md"
          title="Add to Balance"
        >
          <Plus className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onQuickPay?.(debt);
          }}
          className="h-7 w-7 bg-green-100 hover:bg-green-200 text-green-700 shadow-md"
          title="Quick Payment"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(debt);
          }}
          className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-md"
          title="View Details"
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}