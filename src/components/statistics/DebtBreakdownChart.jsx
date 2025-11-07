import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DebtBreakdownChart({ debts }) {
  if (debts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No active debts</p>
      </div>
    );
  }

  const data = debts.map(debt => ({
    name: debt.name.length > 15 ? debt.name.substring(0, 15) + '...' : debt.name,
    balance: Math.round(debt.current_balance),
    interestRate: debt.interest_rate,
    minPayment: debt.minimum_payment || 0,
  })).sort((a, b) => b.balance - a.balance);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="text-sm">
              <span className="text-slate-600">{entry.name}: </span>
              <span className="font-semibold text-slate-900">
                {entry.name === 'Interest Rate' 
                  ? `${entry.value}%` 
                  : `$${entry.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="balance" 
            fill="#3b82f6" 
            name="Current Balance"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="minPayment" 
            fill="#8b5cf6" 
            name="Min Payment"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Interest Rates Comparison</h4>
        <div className="space-y-2">
          {debts.sort((a, b) => b.interest_rate - a.interest_rate).map(debt => (
            <div key={debt.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{debt.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{debt.interest_rate}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min((debt.interest_rate / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}