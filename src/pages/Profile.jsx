import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign, Save } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [creditScore, setCreditScore] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      setCreditScore(userData.credit_score || "");
      setMonthlyIncome(userData.monthly_income || "");
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await base44.auth.updateMe({
        credit_score: creditScore ? parseFloat(creditScore) : null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
      });
      
      toast.success("Profile updated successfully!");
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      toast.error("Failed to update profile");
    }

    setIsSaving(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-600 mt-2">Update your financial information</p>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-slate-700">Full Name</Label>
                <Input 
                  value={user.full_name} 
                  disabled 
                  className="mt-1 bg-slate-50"
                />
              </div>
              <div>
                <Label className="text-slate-700">Email</Label>
                <Input 
                  value={user.email} 
                  disabled 
                  className="mt-1 bg-slate-50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <Label htmlFor="creditScore" className="text-slate-700 font-medium">
                    Credit Score
                  </Label>
                  <p className="text-sm text-slate-500 mb-2">
                    Enter your current credit score (300-850)
                  </p>
                  <Input
                    id="creditScore"
                    type="number"
                    min="300"
                    max="850"
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                    placeholder="e.g., 720"
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyIncome" className="text-slate-700 font-medium">
                    Monthly Income
                  </Label>
                  <p className="text-sm text-slate-500 mb-2">
                    Your total monthly income from salary
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      min="0"
                      step="0.01"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="e.g., 5000"
                      className="pl-8 text-lg"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}