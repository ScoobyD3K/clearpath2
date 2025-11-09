import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function CalendarDayView({ date, events, debts, onClose }) {
  const debtDueEvents = events.filter(e => e.type === 'debt_due');
  const goalEvents = events.filter(e => e.type === 'goal_deadline');
  const paymentEvents = events.filter(e => e.type === 'payment_made');

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-700">{debtDueEvents.length}</div>
              <div className="text-xs text-red-600 mt-1">Payments Due</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-700">{paymentEvents.length}</div>
              <div className="text-xs text-green-600 mt-1">Payments Made</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{goalEvents.length}</div>
              <div className="text-xs text-blue-600 mt-1">Goal Deadlines</div>
            </div>
          </div>

          {/* Detailed Events */}
          {events.length > 0 ? (
            <div className="space-y-4">
              {debtDueEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span>💳</span> Payments Due
                  </h4>
                  <div className="space-y-2">
                    {debtDueEvents.map((event, idx) => (
                      <Link key={idx} to={createPageUrl("DebtDetail") + `?id=${event.debt.id}`}>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-slate-900">{event.debt.name}</div>
                              <div className="text-sm text-slate-600">
                                Min: ${event.debt.minimum_payment?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                            <div className="text-sm text-slate-600">
                              ${event.debt.current_balance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {paymentEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span>✓</span> Payments Made
                  </h4>
                  <div className="space-y-2">
                    {paymentEvents.map((event, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-900">{event.debt?.name || 'Unknown'}</div>
                            {event.payment.notes && (
                              <div className="text-xs text-slate-600 mt-1">{event.payment.notes}</div>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-green-700">
                            ${event.payment.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {goalEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span>🎯</span> Goal Deadlines
                  </h4>
                  <div className="space-y-2">
                    {goalEvents.map((event, idx) => (
                      <Link key={idx} to={createPageUrl("Goals")}>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-slate-900">{event.goal.name}</div>
                              <div className="text-sm text-slate-600">
                                Progress: {((event.goal.current_amount / event.goal.target_amount) * 100).toFixed(0)}%
                              </div>
                            </div>
                            <div className="text-sm text-slate-600">
                              ${event.goal.target_amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No events scheduled for this date</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}