import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, bgGradient, iconColor }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden backdrop-blur-md" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 ${bgGradient} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-xs text-slate-600 mb-1">{title}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}