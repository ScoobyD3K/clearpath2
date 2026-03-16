import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Use service role to find and delete old paid-off debts
        const allDebts = await base44.asServiceRole.entities.Debt.filter({ status: 'paid_off' });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const toDelete = allDebts.filter(debt => {
            const updatedAt = new Date(debt.updated_date);
            return updatedAt < sevenDaysAgo;
        });

        let deleted = 0;
        for (const debt of toDelete) {
            await base44.asServiceRole.entities.Debt.delete(debt.id);
            deleted++;
        }

        return Response.json({ success: true, deleted, checked: allDebts.length });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});