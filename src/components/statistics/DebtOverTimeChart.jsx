import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';

export default function DebtOverTimeChart({ debts, payments }) {
  const generateChartData = () => {
    // Get all unique months from payments
    const monthsSet = new Set();
    const now = new Date();
    
    // Add current month and last 11 months
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i);
      monthsSet.add(format(date, 'yyyy-MM'));
    }

    // Add months from payments
    payments.forEach(payment => {
      const month = format(parseISO(payment.payment_date), 'yyyy-MM');
      monthsSet.add(month);
    });

    const months = Array.from(monthsSet).sort();

    // Calculate total debt for each month
    const data = months.map(month => {
      const monthEnd = new Date(month + '-01');
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month

      // Calculate total debt at end of this month
      let totalDebt = debts.reduce((sum, debt) => {
        // Start with original amount
        let debtAtMonth = debt.total_amount;
        
        // Subtract all payments made up to this month
        const paymentsForDebt = payments.filter(p => 
          p.debt_id === debt.id && 
          parseISO(p.payment_date) <= monthEnd
        );
        
        const totalPaid = paymentsForDebt.reduce((sum, p) => sum + p.amount, 0);
        debtAtMonth = Math.max(0, debtAtMonth - totalPaid);
        
        return sum + debtAtMonth;
      }, 0);

      return {
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        totalDebt: Math.round(totalDebt),
      };
    });

    return data.slice(-12); // Last 12 months
  };

  const data = generateChartData();

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No payment history yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="month" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value) => [`$${value.toLocaleString()}`, 'Total Debt']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="totalDebt" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Total Debt"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}