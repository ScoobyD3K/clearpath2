import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, Trash2, Receipt, RefreshCw, Calendar, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

const BILLING_CYCLES = ["monthly", "yearly", "weekly"];
const CATEGORIES = ["streaming", "software", "fitness", "news", "finance", "other"];

const categoryColors = {
  streaming: "bg-purple-100 text-purple-700",
  software: "bg-blue-100 text-blue-700",
  fitness: "bg-green-100 text-green-700",
  news: "bg-yellow-100 text-yellow-700",
  finance: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-700",
};

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    billing_cycle: "monthly",
    category: "other",
    next_billing_date: "",
  });

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setShowForm(false);
      setForm({ name: "", amount: "", billing_cycle: "monthly", category: "other", next_billing_date: "" });
      toast.success("Subscription added!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription removed.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billing_cycle === "monthly") return sum + (s.amount || 0);
    if (s.billing_cycle === "yearly") return sum + (s.amount || 0) / 12;
    if (s.billing_cycle === "weekly") return sum + (s.amount || 0) * 4.33;
    return sum;
  }, 0);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" title="Back to Dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Subscriptions</h1>
            <p className="text-slate-600 mt-1">Track your recurring payments</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Monthly Cost</p>
              <p className="text-3xl font-bold text-purple-900">${totalMonthly.toFixed(2)}</p>
              <p className="text-sm text-purple-500 mt-1">${(totalMonthly * 12).toFixed(2)} per year</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600 font-medium">Subscriptions</p>
              <p className="text-3xl font-bold text-purple-900">{subscriptions.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Form */}
        {showForm && (
          <Card className="mb-6 border-purple-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg">New Subscription</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Netflix, Spotify..."
                      required
                    />
                  </div>
                  <div>
                    <Label>Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                        className="pl-8"
                        placeholder="9.99"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Billing Cycle</Label>
                    <select
                      value={form.billing_cycle}
                      onChange={(e) => setForm(p => ({ ...p, billing_cycle: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      {BILLING_CYCLES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Next Billing Date</Label>
                    <Input
                      type="date"
                      value={form.next_billing_date}
                      onChange={(e) => setForm(p => ({ ...p, next_billing_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-violet-600 to-purple-600">
                    {createMutation.isPending ? "Adding..." : "Add Subscription"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions List */}
        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" /></div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Receipt className="w-14 h-14 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">No subscriptions yet</p>
            <p className="text-sm mt-1">Click "Add" to track your recurring payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{sub.name}</span>
                      <Badge className={categoryColors[sub.category] || categoryColors.other}>
                        {sub.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {sub.billing_cycle}
                      </span>
                      {sub.next_billing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {sub.next_billing_date}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">${sub.amount?.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">
                      ${sub.billing_cycle === "yearly" ? (sub.amount / 12).toFixed(2) :
                        sub.billing_cycle === "weekly" ? (sub.amount * 4.33).toFixed(2) :
                        sub.amount?.toFixed(2)}/mo
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(sub.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}