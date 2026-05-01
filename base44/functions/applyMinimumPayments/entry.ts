import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role since this is a scheduled/automated task
    const allDebts = await base44.asServiceRole.entities.Debt.filter({ status: 'active' });

    const today = new Date();
    const todayDay = today.getDate(); // day of month (1-31)
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get the first day of the current month for catch-up logic
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    const results = [];

    for (const debt of allDebts) {
      if (!debt.due_date || debt.due_date <= 0) continue;
      if (!debt.minimum_payment || debt.minimum_payment <= 0) continue;
      if (!debt.current_balance || debt.current_balance <= 0) continue;

      // Check if today is the due date OR if the due date already passed this month (catch-up)
      const isDueToday = debt.due_date === todayDay;
      const isPastDueThisMonth = debt.due_date < todayDay;

      if (!isDueToday && !isPastDueThisMonth) continue;

      // The date the payment was/should have been due this month
      const dueDateThisMonth = new Date(currentYear, currentMonth, debt.due_date);
      const dueDateStr = dueDateThisMonth.toISOString().split('T')[0];

      // Check if an automatic payment was already made on or after the due date this month
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({
        debt_id: debt.id,
      });

      const alreadyPaidThisMonth = existingPayments.some(p => {
        if (p.notes !== 'Automatic minimum payment') return false;
        const payDate = new Date(p.payment_date);
        // Payment was made on or after the due date within the current month
        return payDate >= dueDateThisMonth && payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
      });

      if (alreadyPaidThisMonth) {
        results.push({ debt: debt.name, status: 'skipped - already paid this month' });
        continue;
      }

      const paymentAmount = Math.min(debt.minimum_payment, debt.current_balance);
      const newBalance = Math.max(0, debt.current_balance - paymentAmount);
      const isPaidOff = newBalance === 0;

      // Record the payment dated on the actual due date (or today if due today)
      await base44.asServiceRole.entities.Payment.create({
        debt_id: debt.id,
        amount: paymentAmount,
        payment_date: isDueToday ? todayStr : dueDateStr,
        notes: 'Automatic minimum payment',
      });

      // Update the debt balance
      await base44.asServiceRole.entities.Debt.update(debt.id, {
        current_balance: newBalance,
        status: isPaidOff ? 'paid_off' : 'active',
      });

      // Create a notification for the user
      const label = isDueToday ? 'due today' : `due on the ${debt.due_date}th`;
      await base44.asServiceRole.entities.Notification.create({
        title: isDueToday ? '💳 Minimum Payment Applied' : '⚠️ Missed Payment Caught',
        message: `Your minimum payment of $${paymentAmount.toLocaleString()} has been automatically applied to ${debt.name} (${label}). Remaining balance: $${newBalance.toLocaleString()}.`,
        type: 'payment_reminder',
        debt_id: debt.id,
        user_email: debt.created_by,
        is_read: false,
      });

      results.push({ debt: debt.name, amount: paymentAmount, newBalance, dueDate: debt.due_date, status: isPaidOff ? 'paid_off' : (isDueToday ? 'applied' : 'caught-up') });
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});