import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";

export default function GoalStats({ goals, activeGoals, completedGoals, userSavings }) {
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalSavedAmount = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalRemaining = totalTargetAmount - totalSavedAmount;
  const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

  const stats = [
    {
      title: "Active Goals",
      value: activeGoals.length,
      icon: Target,
      bgGradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
      iconColor: "text-cyan-600",
    },
    {
      title: "Total Saved",
      value: `$${totalSavedAmount.toLocaleString()}`,
      subtitle: `${overallProgress.toFixed(0)}% of target`,
      icon: TrendingUp,
      bgGradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconColor: "text-green-600",
    },
    {
      title: "Remaining",
      value: `$${totalRemaining.toLocaleString()}`,
      subtitle: "to reach all goals",
      icon: DollarSign,
      bgGradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: completedGoals.length,
      subtitle: `${goals.length > 0 ? ((completedGoals.length / goals.length) * 100).toFixed(0) : 0}% success rate`,
      icon: CheckCircle2,
      bgGradient: "bg-gradient-to-br from-purple-500 to-indigo-600",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 shadow-lg overflow-hidden relative bg-white/80 backdrop-blur-sm">
          <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgGradient} opacity-10 rounded-full -mr-16 -mt-16`} />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.bgGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}