import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, X, Check, Landmark, Minus, Eye } from "lucide-react";
import { toast } from "sonner";
import QuickBalanceModal from "./QuickBalanceModal";

const ACCOUNT_TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  money_market: "Money Market",
  cd: "CD",
  investment: "Investment",
  other: "Other",
};

const emptyForm = { name: "", institution: "", account_type: "savings", balance: "" };

export default function BankAccountsModal({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: accounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => base44.entities.BankAccount.list('-created_date'),
    enabled: open,
  });

  const totalSavings = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BankAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success("Account added!");
      setForm(emptyForm);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BankAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success("Account updated!");
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BankAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success("Account removed.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, balance: parseFloat(form.balance) || 0 };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (account) => {
    setEditingId(account.id);
    setForm({
      name: account.name,
      institution: account.institution || "",
      account_type: account.account_type || "savings",
      balance: account.balance?.toString() || "0",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Landmark className="w-4 h-4 text-green-600" />
            </div>
            Bank Accounts & Savings
          </DialogTitle>
        </DialogHeader>

        {/* Total */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-2">
          <p className="text-sm text-green-700 font-medium">Total Savings</p>
          <p className="text-3xl font-bold text-green-800">${totalSavings.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Account list */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mb-2">
            {accounts.map((account) => {
              const pct = totalSavings > 0 ? ((account.balance || 0) / totalSavings) * 100 : 0;
              return (
                <div key={account.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Card top bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-t-xl" />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                          <Landmark className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{account.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {account.institution && `${account.institution} · `}
                            {ACCOUNT_TYPE_LABELS[account.account_type] || account.account_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => startEdit(account)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => {
                          if (confirm(`Remove "${account.name}"?`)) deleteMutation.mutate(account.id);
                        }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-xs text-slate-500">Balance</p>
                        <p className="text-2xl font-bold text-slate-900">${(account.balance || 0).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">{pct.toFixed(1)}% of total</p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit form */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <p className="text-sm font-semibold text-slate-700">{editingId ? "Edit Account" : "Add Account"}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Account Name *</Label>
                <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Emergency Fund" required />
              </div>
              <div>
                <Label className="text-xs">Institution</Label>
                <Input value={form.institution} onChange={(e) => setForm(p => ({ ...p, institution: e.target.value }))} placeholder="e.g., Chase" />
              </div>
              <div>
                <Label className="text-xs">Account Type</Label>
                <Select value={form.account_type} onValueChange={(v) => setForm(p => ({ ...p, account_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Balance *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input type="number" step="0.01" min="0" value={form.balance} onChange={(e) => setForm(p => ({ ...p, balance: e.target.value }))} className="pl-8" placeholder="0.00" required />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                <Check className="w-4 h-4 mr-1" /> {editingId ? "Save" : "Add Account"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={cancelForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" className="w-full border-dashed gap-2 text-slate-600" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Add Bank Account
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}