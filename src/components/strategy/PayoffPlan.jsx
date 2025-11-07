import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

export default function PayoffPlan({ debts, strategy, extraPayment = 0 }) {
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === "snowball") {
      return a.current_balance - b.current_balance;
    } else {
      return b.interest_rate - a.interest_rate;
    }
  });

  const calculatePayoffPlan = () => {
    const plan = [];
    let currentMonth = 0;
    let remainingDebts = sortedDebts.map(d => ({
      ...d,
      remaining: d.current_balance,
    }));

    const totalMinPayments = remainingDebts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0);
    const availableExtra = extraPayment;

    while (remainingDebts.some(d => d.remaining > 0) && currentMonth < 600) {
      currentMonth++;
      
      remainingDebts.forEach((debt, index) => {
        if (debt.remaining > 0) {
          const monthlyRate = debt.interest_rate / 100 / 12;
          const interest = debt.remaining * monthlyRate;
          
          let payment = debt.minimum_payment || 0;
          
          if (index === 0 && availableExtra > 0) {
            payment += availableExtra;
          }
          
          const principal = Math.min(payment - interest, debt.remaining);
          debt.remaining = Math.max(0, debt.remaining - principal);
          
          if (debt.remaining === 0 && !plan.find(p => p.id === debt.id)) {
            plan.push({
              id: debt.id,
              name: debt.name,
              priority: plan.length + 1,
              payoffMonth: currentMonth,
              payoffDate: addMonths(new Date(), currentMonth),
            });
          }
        }
      });
      
      remainingDebts = remainingDebts.filter(d => d.remaining > 0);
    }

    return plan;
  };

  const payoffPlan = calculatePayoffPlan();

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Your Payoff Plan
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {strategy === "avalanche" ? "Highest interest rate first" : "Smallest balance first"}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {payoffPlan.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Add minimum payments to see your payoff plan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payoffPlan.map((item, index) => {
              const debt = sortedDebts.find(d => d.id === item.id);
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    index === 0 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "font-bold",
                        index === 0 
                          ? "bg-blue-600" 
                          : "bg-slate-400"
                      )}>
                        #{item.priority}
                      </Badge>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">Focus Here</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <div className="text-slate-600 flex items-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Balance
                      </div>
                      <div className="font-semibold text-slate-900">
                        ${debt.current_balance.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-600 flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        Interest Rate
                      </div>
                      <div className="font-semibold text-slate-900">
                        {debt.interest_rate}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-600">Projected Payoff</div>
                    <div className="font-semibold text-slate-900">
                      {format(item.payoffDate, "MMMM yyyy")} 
                      <span className="text-slate-500 ml-1">
                        ({item.payoffMonth} months)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}