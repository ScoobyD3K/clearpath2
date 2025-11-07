import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function PrincipalVsInterestChart({ principal, interest }) {
  const data = [
    { name: 'Principal', value: Math.round(principal), color: '#10b981' },
    { name: 'Interest', value: Math.round(interest), color: '#ef4444' },
  ];

  const total = principal + interest;

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No payment data yet</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-slate-700">${data.value.toLocaleString()}</p>
          <p className="text-sm text-slate-500">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700 font-medium mb-1">Principal Paid</div>
          <div className="text-2xl font-bold text-green-900">
            ${principal.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {((principal / total) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-red-700 font-medium mb-1">Interest Paid</div>
          <div className="text-2xl font-bold text-red-900">
            ${interest.toLocaleString()}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {((interest / total) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>
    </div>
  );
}