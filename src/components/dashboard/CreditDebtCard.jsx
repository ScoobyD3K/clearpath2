import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function CreditDebtCard({ totalAvailableCredit, totalOutstandingDebt }) {
  const creditLimit = Number(totalAvailableCredit) || 0;
  const totalDebt = Number(totalOutstandingDebt) || 0;

  const remainingAvailableCredit = creditLimit - totalDebt;
  const utilization = creditLimit > 0 ? (totalDebt / creditLimit) * 100 : null;
  const availableCreditPct = creditLimit > 0 ? (remainingAvailableCredit / creditLimit) * 100 : null;

  const fmt = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Color theme based on utilization
  const gradient =
    utilization === null ? "linear-gradient(135deg, rgba(100, 116, 139, 0.75), rgba(71, 85, 105, 0.75))" :
    utilization > 70 ? "linear-gradient(135deg, rgba(239, 68, 68, 0.75), rgba(244, 63, 94, 0.75))" :
    utilization > 30 ? "linear-gradient(135deg, rgba(245, 158, 11, 0.75), rgba(234, 88, 12, 0.75))" :
    "linear-gradient(135deg, rgba(20, 184, 166, 0.75), rgba(6, 182, 212, 0.75))";

  const accentColor =
    utilization === null ? "text-slate-600" :
    utilization > 70 ? "text-red-600" :
    utilization > 30 ? "text-amber-600" :
    "text-teal-600";

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden backdrop-blur-md" style={{ background: gradient, border: "none" }}>
      <CardContent className="p-3 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-white/25 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Credit &amp; Debt</span>
        </div>

        {creditLimit === 0 ? (
          <div className="text-sm font-medium py-2">
            Unable to calculate: Total Available Credit cannot be zero.
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="opacity-90">Total Available Credit</span>
              <span className="font-semibold">{fmt(creditLimit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Total Outstanding Debt</span>
              <span className="font-semibold">{fmt(totalDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Remaining Available Credit</span>
              <span className="font-semibold">{fmt(remainingAvailableCredit)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/30">
              <span className="opacity-90">Credit Utilization</span>
              <span className="font-bold text-base">{utilization.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Available Credit Remaining</span>
              <span className="font-bold text-base">{availableCreditPct.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}