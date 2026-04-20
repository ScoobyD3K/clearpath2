import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Receipt } from "lucide-react";

export default function SubscriptionCard() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
  });

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billing_cycle === "monthly") return sum + (s.amount || 0);
    if (s.billing_cycle === "yearly") return sum + (s.amount || 0) / 12;
    if (s.billing_cycle === "weekly") return sum + (s.amount || 0) * 4.33;
    return sum;
  }, 0);

  return (
    <Link to={createPageUrl("Subscriptions")} className="block">
      <Card
        className="shadow-md hover:shadow-lg transition-shadow overflow-hidden backdrop-blur-md"
        style={{
          backgroundColor: "rgba(139, 92, 246, 0.15)",
          border: "2px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-slate-500">{subscriptions.length} active</span>
          </div>
          <div className="text-xs text-slate-600 mb-1">Subscriptions</div>
          <div className="text-xl font-bold text-slate-900">${totalMonthly.toFixed(2)}<span className="text-xs font-normal text-slate-500">/mo</span></div>
        </CardContent>
      </Card>
    </Link>
  );
}