import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, DollarSign, FileText, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export default function PaymentHistory() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedDebtId = urlParams.get("debtId") || "all";

  const [selectedDebt, setSelectedDebt] = useState(preselectedDebtId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.list(),
    initialData: [],
  });

  const { data: allPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
    initialData: [],
  });

  const getDebtName = (debtId) => {
    const debt = debts.find(d => d.id === debtId);
    return debt ? debt.name : "Unknown Debt";
  };

  const filteredPayments = allPayments.filter(payment => {
    // Filter by debt
    if (selectedDebt !== "all" && payment.debt_id !== selectedDebt) {
      return false;
    }

    // Filter by date range
    if (startDate && endDate) {
      const paymentDate = parseISO(payment.payment_date);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      if (!isWithinInterval(paymentDate, { start, end })) {
        return false;
      }
    }

    return true;
  });

  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const averagePayment = filteredPayments.length > 0 ? totalPaid / filteredPayments.length : 0;

  // Group payments by month
  const paymentsByMonth = filteredPayments.reduce((acc, payment) => {
    const month = format(parseISO(payment.payment_date), "MMM yyyy");
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(payment);
    return acc;
  }, {});

  if (debtsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Payment History</h1>
            <p className="text-slate-600 mt-1">Complete record of all your payments</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm text-slate-600">Total Paid</div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ${totalPaid.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {filteredPayments.length} payments
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-slate-600">Average Payment</div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ${averagePayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Per transaction
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm text-slate-600">Debts Tracked</div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {debts.length}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Total accounts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-lg mb-6">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="debt-filter">Filter by Debt</Label>
                <Select value={selectedDebt} onValueChange={setSelectedDebt}>
                  <SelectTrigger id="debt-filter">
                    <SelectValue placeholder="All debts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Debts</SelectItem>
                    {debts.map(debt => (
                      <SelectItem key={debt.id} value={debt.id}>
                        {debt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {(selectedDebt !== "all" || startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDebt("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        {filteredPayments.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No payments found</h3>
              <p className="text-slate-600">
                {selectedDebt !== "all" || startDate || endDate
                  ? "Try adjusting your filters"
                  : "Start recording payments to see your history"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(paymentsByMonth).map(([month, payments]) => {
              const monthTotal = payments.reduce((sum, p) => sum + p.amount, 0);
              
              return (
                <Card key={month} className="border-slate-200 shadow-lg">
                  <CardHeader className="border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{month}</CardTitle>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">Month Total</div>
                        <div className="text-xl font-bold text-green-600">
                          ${monthTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {payments.map(payment => (
                        <div
                          key={payment.id}
                          className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Link
                                to={createPageUrl("DebtDetail") + `?id=${payment.debt_id}`}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                              >
                                {getDebtName(payment.debt_id)}
                              </Link>
                              <span className="text-sm text-slate-500">
                                {format(parseISO(payment.payment_date), "MMM d, yyyy")}
                              </span>
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-slate-600 mt-1">{payment.notes}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-green-600">
                              ${payment.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}