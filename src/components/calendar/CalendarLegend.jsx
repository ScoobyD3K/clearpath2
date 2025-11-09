import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarLegend() {
  const legendItems = [
    { icon: '💳', label: 'Payment Due', color: 'bg-red-100 border-red-300 text-red-800' },
    { icon: '✓', label: 'Payment Made', color: 'bg-green-100 border-green-300 text-green-800' },
    { icon: '🎯', label: 'Goal Deadline', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  ];

  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-semibold text-slate-700">Legend:</span>
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded border text-xs ${item.color}`}>
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}