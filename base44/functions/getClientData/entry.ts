import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Backend function that lets an approved advisor fetch a client's financial data
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { client_email } = body;

    if (!client_email) {
      return Response.json({ error: 'client_email is required' }, { status: 400 });
    }

    // Verify the advisor has approved access to this client
    const accessRecords = await base44.asServiceRole.entities.AdvisorAccess.filter({
      advisor_email: user.email,
      client_email: client_email,
      status: 'approved'
    });

    if (!accessRecords || accessRecords.length === 0) {
      return Response.json({ error: 'Access not granted or not approved' }, { status: 403 });
    }

    // Fetch the client's data using service role
    const [debts, payments, goals, bankAccounts, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.Debt.filter({ created_by: client_email }),
      base44.asServiceRole.entities.Payment.filter({ created_by: client_email }),
      base44.asServiceRole.entities.Goal.filter({ created_by: client_email }),
      base44.asServiceRole.entities.BankAccount.filter({ created_by: client_email }),
      base44.asServiceRole.entities.Subscription.filter({ created_by: client_email }),
    ]);

    return Response.json({ debts, payments, goals, bankAccounts, subscriptions, client_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});