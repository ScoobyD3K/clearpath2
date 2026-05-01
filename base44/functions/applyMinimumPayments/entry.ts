import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role since this is a scheduled/automated task
    const allDebts = await base44.asServiceRole.entities.Debt.list();
    const activeDebts = allDebts.filter(d => d.status === 'active');

    const today = new Date();
    const todayDay = today.getDate(); // day of month (1-31)
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    const results = [];

    // Build a list of month/year combos to check: current month + previous month (for early-month catch-up)
    const monthsToCheck = [
      { year: currentYear, month: currentMonth },
    ];
    // If we're in the first 5 days of the month, also check last month for missed payments
    if (todayDay <= 5) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      monthsToCheck.push({ year: prevYear, month: prevMonth });
    }

    for (const debt of activeDebts) {
      const dueDateInt = Math.floor(Number(debt.due_date));
      if (!dueDateInt || dueDateInt <= 0) continue;
      if (!debt.minimum_payment || debt.minimum_payment <= 0) continue;
      if (!debt.current_balance || debt.current_balance <= 0) continue;

      // Fetch all payments once per debt
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({ debt_id: debt.id });

      for (const { year, month } of monthsToCheck) {
        const isCurrentMonth = year === currentYear && month === currentMonth;

        // For current month: only if due date has arrived. For past month: always check.
        if (isCurrentMonth && dueDateInt > todayDay) continue;

        const dueDateForMonth = new Date(year, month, dueDateInt);
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(dueDateInt).padStart(2, '0');
        const dueDateStr = `${year}-${monthStr}-${dayStr}`;

        // Check if an automatic payment was already applied for this month
        const alreadyPaid = existingPayments.some(p => {
          if (p.notes !== 'Automatic minimum payment') return false;
          const payDate = new Date(p.payment_date);
          return payDate >= dueDateForMonth && payDate.getMonth() === month && payDate.getFullYear() === year;
        });

        if (alreadyPaid) continue;

        // Re-fetch current balance in case a prior loop iteration updated it
        const freshDebt = await base44.asServiceRole.entities.Debt.filter({ id: debt.id });
        const currentBalance = freshDebt[0]?.current_balance ?? debt.current_balance;
        if (!currentBalance || currentBalance <= 0) continue;

        const paymentAmount = Math.min(debt.minimum_payment, currentBalance);
        const newBalance = Math.max(0, currentBalance - paymentAmount);
        const isPaidOff = newBalance === 0;
        const isDueToday = isCurrentMonth && dueDateInt === todayDay;
        const label = isDueToday ? 'due today' : `due on the ${dueDateInt}th (${year}-${monthStr})`;

        await base44.asServiceRole.entities.Payment.create({
          debt_id: debt.id,
          amount: paymentAmount,
          payment_date: isDueToday ? todayStr : dueDateStr,
          notes: 'Automatic minimum payment',
        });

        await base44.asServiceRole.entities.Debt.update(debt.id, {
          current_balance: newBalance,
          status: isPaidOff ? 'paid_off' : 'active',
        });

        await base44.asServiceRole.entities.Notification.create({
          title: isDueToday ? '💳 Minimum Payment Applied' : '⚠️ Missed Payment Caught',
          message: `Your minimum payment of $${paymentAmount.toFixed(2)} has been automatically applied to ${debt.name} (${label}). Remaining balance: $${newBalance.toFixed(2)}.`,
          type: 'payment_reminder',
          debt_id: debt.id,
          user_email: debt.created_by,
          is_read: false,
        });

        results.push({
          debt: debt.name,
          amount: paymentAmount,
          newBalance,
          dueDate: dueDateInt,
          month: `${year}-${monthStr}`,
          status: isPaidOff ? 'paid_off' : (isDueToday ? 'applied' : 'caught-up'),
        });
      }
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});