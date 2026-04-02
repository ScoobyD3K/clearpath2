import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role since this is a scheduled/automated task
    const allDebts = await base44.asServiceRole.entities.Debt.filter({ status: 'active' });

    const today = new Date();
    const todayDay = today.getDate(); // day of month (1-31)
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const results = [];

    for (const debt of allDebts) {
      // Check if today matches the debt's due_date day of month
      if (!debt.due_date || debt.due_date !== todayDay) continue;
      if (!debt.minimum_payment || debt.minimum_payment <= 0) continue;
      if (!debt.current_balance || debt.current_balance <= 0) continue;

      // Check if a payment was already made today for this debt (avoid double-deduction)
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({
        debt_id: debt.id,
        payment_date: todayStr,
      });

      const alreadyPaid = existingPayments.some(p => p.notes === 'Automatic minimum payment');
      if (alreadyPaid) {
        results.push({ debt: debt.name, status: 'skipped - already paid today' });
        continue;
      }

      const paymentAmount = Math.min(debt.minimum_payment, debt.current_balance);
      const newBalance = Math.max(0, debt.current_balance - paymentAmount);
      const isPaidOff = newBalance === 0;

      // Record the payment
      await base44.asServiceRole.entities.Payment.create({
        debt_id: debt.id,
        amount: paymentAmount,
        payment_date: todayStr,
        notes: 'Automatic minimum payment',
      });

      // Update the debt balance
      await base44.asServiceRole.entities.Debt.update(debt.id, {
        current_balance: newBalance,
        status: isPaidOff ? 'paid_off' : 'active',
      });

      // Create a notification for the user
      await base44.asServiceRole.entities.Notification.create({
        title: '💳 Minimum Payment Applied',
        message: `Your minimum payment of $${paymentAmount.toLocaleString()} has been automatically applied to ${debt.name}. Remaining balance: $${newBalance.toLocaleString()}.`,
        type: 'payment_reminder',
        debt_id: debt.id,
        user_email: debt.created_by,
        is_read: false,
      });

      results.push({ debt: debt.name, amount: paymentAmount, newBalance, status: isPaidOff ? 'paid_off' : 'applied' });
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});