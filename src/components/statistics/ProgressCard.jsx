import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ProgressCard({ title, value, subtitle, percentage, icon: Icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    red: "from-red-500 to-red-600 text-red-600",
    purple: "from-purple-500 to-purple-600 text-purple-600",
  };

  return (
    <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center", 
            colorClasses[color]?.split(' ').slice(0, 2).join(' ') || "from-slate-500 to-slate-600"
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
          {percentage !== undefined && (
            <div className="mt-3">
              <Progress value={percentage} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}