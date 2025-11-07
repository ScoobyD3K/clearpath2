import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CelebrationModal({ open, onOpenChange, debtName, totalAmount }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-blue-50 animate-pulse" />
        
        {/* Floating sparkles */}
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
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            🎉 Congratulations! 🎉
          </h2>
          
          <p className="text-lg text-slate-700 mb-2">
            You've completely paid off your
          </p>
          <p className="text-2xl font-bold text-green-600 mb-4">
            {debtName}!
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Total Amount Eliminated</span>
            </div>
            <div className="text-4xl font-bold text-green-700">
              ${totalAmount.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600 mb-6">
            <p className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              You're one step closer to financial freedom!
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("Dashboard")} className="flex-1">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => onOpenChange(false)}
              >
                View Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}