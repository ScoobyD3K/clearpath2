import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Calendar, DollarSign, Edit, Trash2, TrendingUp, ArrowUpCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const goalTypeIcons = {
  emergency_fund: "🚨",
  down_payment: "🏠",
  vacation: "✈️",
  retirement: "🌅",
  education: "🎓",
  vehicle: "🚗",
  other: "🎯"
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200"
};

export default function GoalCard({ goal, onEdit, onDelete, onAllocate }) {
  const percentComplete = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const remaining = goal.target_amount - goal.current_amount;
  const daysUntilDeadline = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

  const getProgressColor = () => {
    if (goal.status === 'completed') return 'bg-green-600';
    if (percentComplete >= 75) return 'bg-cyan-600';
    if (percentComplete >= 50) return 'bg-blue-500';
    if (percentComplete >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm",
      goal.status === 'completed' && "border-green-300 bg-green-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goalTypeIcons[goal.goal_type]}</span>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">{goal.name}</h3>
              {goal.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{goal.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={priorityColors[goal.priority]}>
            {goal.priority} priority
          </Badge>
          <Badge variant="outline" className={cn(
            goal.category === 'short_term' 
              ? "bg-cyan-50 text-cyan-700 border-cyan-200" 
              : "bg-blue-50 text-blue-700 border-blue-200"
          )}>
            {goal.category === 'short_term' ? 'Short-term' : 'Long-term'}
          </Badge>
          {goal.status === 'completed' && (
            <Badge className="bg-green-600 text-white">
              Completed ✓
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-slate-900">{percentComplete.toFixed(1)}%</span>
          </div>
          <Progress value={percentComplete} className={cn("h-3", getProgressColor())} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <DollarSign className="w-3 h-3" />
              <span>Current</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${goal.current_amount.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Target className="w-3 h-3" />
              <span>Target</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${goal.target_amount.toLocaleString()}
            </p>
          </div>
        </div>

        {remaining > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Remaining</span>
              <span className="text-sm font-semibold text-cyan-700">
                ${remaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {goal.deadline && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Deadline</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {format(new Date(goal.deadline), "MMM d, yyyy")}
                </div>
                {daysUntilDeadline !== null && goal.status !== 'completed' && (
                  <div className={cn(
                    "text-xs",
                    daysUntilDeadline < 30 ? "text-red-600" :
                    daysUntilDeadline < 90 ? "text-amber-600" : "text-slate-500"
                  )}>
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {goal.status === 'active' && (
          <div className="pt-4 border-t border-slate-200">
            <Button
              onClick={() => onAllocate(goal)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              size="sm"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Allocate Funds
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(goal)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(goal)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}