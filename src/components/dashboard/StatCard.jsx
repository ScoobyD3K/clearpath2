import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, bgGradient, iconColor }) {
  return (
    <Card className={cn("relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300", bgGradient)}>
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-white/10 rounded-full" />
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-xl bg-white/20 backdrop-blur-sm", iconColor)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-white/90">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}