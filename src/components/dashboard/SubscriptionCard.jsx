import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Receipt, ArrowRight } from "lucide-react";

const categoryColors = {
  streaming: "bg-purple-100 text-purple-700",
  software: "bg-blue-100 text-blue-700",
  fitness: "bg-green-100 text-green-700",
  news: "bg-yellow-100 text-yellow-700",
  finance: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-700",
};

export default function SubscriptionCard() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
  });

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billing_cycle === "monthly") return sum + (s.amount || 0);
    if (s.billing_cycle === "yearly") return sum + (s.amount || 0) / 12;
    if (s.billing_cycle === "weekly") return sum + (s.amount || 0) * 4.33;
    return sum;
  }, 0);

  const topSubs = subscriptions.slice(0, 4);

  return (
    <Card
      className="backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        backgroundColor: "rgba(185, 223, 245, 0.75)",
        border: "2px solid transparent",
        backgroundImage:
          "linear-gradient(rgba(185, 223, 245, 0.75), rgba(185, 223, 245, 0.75)), linear-gradient(135deg, #CDE7CF, #B9DFF5, #A2B7C8)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100">
            <Receipt className="w-5 h-5 text-violet-600" />
          </div>
          <CardTitle className="text-slate-800 text-base">Subscriptions</CardTitle>
        </div>
        <Link
          to={createPageUrl("Subscriptions")}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-slate-900">${totalMonthly.toFixed(2)}</span>
          <span className="text-sm text-slate-500">/mo</span>
          <span className="ml-auto text-xs text-slate-500">{subscriptions.length} active</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-white/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            <p>No subscriptions tracked yet.</p>
            <Link to={createPageUrl("Subscriptions")} className="text-violet-600 hover:underline text-xs mt-1 block">
              Add your first one →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {topSubs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-white/40 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm text-slate-800 truncate">{sub.name}</span>
                  <Badge className={`${categoryColors[sub.category] || categoryColors.other} text-xs py-0 px-1.5 hidden sm:inline-flex`}>
                    {sub.category}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0 ml-2">
                  ${sub.billing_cycle === "yearly"
                    ? (sub.amount / 12).toFixed(2)
                    : sub.billing_cycle === "weekly"
                    ? (sub.amount * 4.33).toFixed(2)
                    : sub.amount?.toFixed(2)}/mo
                </span>
              </div>
            ))}
            {subscriptions.length > 4 && (
              <p className="text-xs text-center text-slate-500 pt-1">
                +{subscriptions.length - 4} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}