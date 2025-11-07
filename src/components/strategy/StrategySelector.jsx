import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingDown, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StrategySelector({ value, onChange }) {
  return (
    <Card className="border-slate-200 shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Payoff Strategy</h3>
          <p className="text-sm text-slate-600">Choose how you want to prioritize paying off your debts</p>
        </div>

        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            <div 
              className={cn(
                "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                value === "avalanche" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-slate-200 hover:border-slate-300"
              )}
              onClick={() => onChange("avalanche")}
            >
              <RadioGroupItem value="avalanche" id="avalanche" />
              <div className="flex-1">
                <Label htmlFor="avalanche" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-900">Avalanche Method</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Pay off debts with the <strong>highest interest rate first</strong>. Saves the most money on interest over time.
                  </p>
                </Label>
              </div>
            </div>

            <div 
              className={cn(
                "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                value === "snowball" 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-200 hover:border-slate-300"
              )}
              onClick={() => onChange("snowball")}
            >
              <RadioGroupItem value="snowball" id="snowball" />
              <div className="flex-1">
                <Label htmlFor="snowball" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-slate-900">Snowball Method</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Pay off debts with the <strong>smallest balance first</strong>. Provides quick wins and motivation.
                  </p>
                </Label>
              </div>
            </div>
          </div>
        </RadioGroup>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900">
            Both strategies work! Avalanche saves more money, while Snowball provides faster psychological wins.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}