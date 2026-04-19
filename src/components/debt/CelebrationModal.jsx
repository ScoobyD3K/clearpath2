import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MILESTONES = [15, 30, 45, 60, 75, 90, 100];

const milestoneConfig = {
  15:  { emoji: "🌱", color: "from-lime-400 to-green-500",   border: "border-lime-200",  text: "Great start! You're on your way!", label: "15% Paid Off" },
  30:  { emoji: "🔥", color: "from-orange-400 to-amber-500", border: "border-orange-200", text: "You're building momentum!", label: "30% Paid Off" },
  45:  { emoji: "⚡", color: "from-yellow-400 to-orange-500", border: "border-yellow-200", text: "Nearly halfway there — keep it up!", label: "45% Paid Off" },
  60:  { emoji: "🏅", color: "from-blue-400 to-cyan-500",    border: "border-blue-200",   text: "Over halfway! Amazing progress!", label: "60% Paid Off" },
  75:  { emoji: "🚀", color: "from-purple-400 to-indigo-500", border: "border-purple-200", text: "Three quarters done — the finish line is in sight!", label: "75% Paid Off" },
  90:  { emoji: "🏆", color: "from-amber-400 to-yellow-500", border: "border-amber-200",  text: "Almost there! Just 10% to go!", label: "90% Paid Off" },
  100: { emoji: "🎉", color: "from-green-500 to-emerald-600", border: "border-green-200",  text: "You're completely debt free on this one!", label: "PAID OFF!" },
};

export function checkMilestone(oldBalance, newBalance, totalAmount) {
  if (!totalAmount || totalAmount <= 0) return null;
  const oldPct = ((totalAmount - oldBalance) / totalAmount) * 100;
  const newPct = ((totalAmount - newBalance) / totalAmount) * 100;
  // Find the highest milestone crossed (in descending order)
  for (const m of [...MILESTONES].reverse()) {
    if (newPct >= m && oldPct < m) return m;
  }
  return null;
}

export default function CelebrationModal({ open, onOpenChange, debtName, totalAmount, milestone }) {
  const cfg = milestoneConfig[milestone] || milestoneConfig[100];
  const isPaidOff = milestone === 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.color} opacity-10 animate-pulse`} />

        <div className="absolute top-10 left-10 animate-bounce delay-100">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="absolute top-20 right-10 animate-bounce delay-300">
          <Sparkles className="w-4 h-4 text-green-400" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-500">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>

        <div className="relative text-center py-6">
          <div className={`w-20 h-20 bg-gradient-to-br ${cfg.color} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-2xl`}>
            <span className="text-4xl">{cfg.emoji}</span>
          </div>

          <div className={`inline-block bg-gradient-to-r ${cfg.color} text-white text-sm font-bold px-4 py-1 rounded-full mb-3`}>
            {cfg.label}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isPaidOff ? "Debt Paid Off!" : "Milestone Reached!"}
          </h2>

          <p className="text-slate-700 mb-1 font-semibold text-lg">{debtName}</p>
          <p className="text-sm text-slate-500 mb-4">{cfg.text}</p>

          {isPaidOff && (
            <div className={`bg-white rounded-lg p-4 mb-4 shadow border-2 ${cfg.border}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-600">Total Amount Eliminated</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${totalAmount.toLocaleString()}
              </div>
            </div>
          )}

          <div className="space-y-1 text-sm text-slate-600 mb-5">
            <p className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              You're on your way to financial freedom!
            </p>
          </div>

          <div className="flex gap-3">
            <Link to={createPageUrl("Dashboard")} className="flex-1">
              <Button
                className={`w-full bg-gradient-to-r ${cfg.color} hover:opacity-90`}
                onClick={() => onOpenChange(false)}
              >
                View Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}